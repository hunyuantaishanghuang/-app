import * as XLSX from 'xlsx';
import { HealthRecord, ColumnMapping, ScreeningResult } from '../types/health';
import { parseNumber } from './ruleEngine';

// 解析中国大陆18位二代身份证号中的年龄和性别
export function parseIdCard(idCardStr: any): { gender: string; age: number; birthDate: string } | null {
  if (!idCardStr) return null;
  const cleaned = String(idCardStr).trim().toUpperCase();
  if (cleaned.length === 18 && /^\d{17}[\dX]$/.test(cleaned)) {
    const year = parseInt(cleaned.substring(6, 10), 10);
    const month = parseInt(cleaned.substring(10, 12), 10);
    const day = parseInt(cleaned.substring(12, 14), 10);
    const genderCode = parseInt(cleaned.substring(16, 17), 10);
    const gender = genderCode % 2 === 1 ? '男' : '女';
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentDay = new Date().getDate();
    let age = currentYear - year;
    if (currentMonth < month || (currentMonth === month && currentDay < day)) {
      age--;
    }
    return { gender, age: Math.max(0, age), birthDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` };
  }
  return null;
}

// 智能模糊匹配列名（特别优化公卫系统典型列名：超声所见、血清肌酐、血尿素氮、谷丙转氨酶等）
export function autoDetectMapping(columns: string[]): ColumnMapping {
  const findCol = (keywords: string[]): string => {
    for (const kw of keywords) {
      const match = columns.find((c) => {
        const normalized = c.trim().toLowerCase().replace(/[\s_()（）[\]]/g, '');
        const target = kw.toLowerCase().replace(/[\s_()（）[\]]/g, '');
        return normalized.includes(target) || target.includes(normalized);
      });
      if (match) return match;
    }
    return '';
  };

  return {
    name: findCol(['姓名', '居民姓名', '病人姓名', '体检者', '被检者', '患者姓名', 'name']),
    gender: findCol(['性别', '男/女', 'gender', 'sex']),
    age: findCol(['年龄', '实足年龄', 'age']),
    phone: findCol(['联系电话', '电话', '手机', '手机号', '联系方式', 'phone', 'tel']),
    idCard: findCol(['身份证', '身份证号', '证件号', '居民身份证', '身份证件号', '身份证号码', 'idcard', 'id_card']),
    chronicDiseases: findCol(['既往史', '慢病史', '慢病', '确诊慢病', '现病史', '高血压病史', '糖尿病史']),
    symptoms: findCol(['现存症状', '症状', '临床表现', '主诉', '自述症状', 'symptom']),
    sbp: findCol(['收缩压', '高压', '收缩压(mmhg)', 'sbp']),
    dbp: findCol(['舒张压', '低压', '舒张压(mmhg)', 'dbp']),
    bpCombined: findCol(['血压', '血压(mmhg)', 'bp', '收缩压/舒张压']),
    fbg: findCol(['血糖', '空腹血糖', 'glu', 'fbg', '血糖(mmol/l)']),
    tbil: findCol(['总胆红素', 'tbil', '胆红素']),
    alt: findCol(['谷丙转氨酶', '谷丙', 'alt', '丙氨酸氨基转移酶', '丙氨酸转氨酶']),
    ast: findCol(['谷草转氨酶', '谷草', 'ast', '天门冬氨酸氨基转移酶', '天冬氨酸转氨酶']),
    tg: findCol(['甘油三酯', 'tg', '三酰甘油', '甘油三脂']),
    tc: findCol(['总胆固醇', 'tc', '胆固醇', 'chol']),
    ldl: findCol(['低密度脂蛋白', 'ldl', 'ldl-c', '低密度']),
    ecgResult: findCol(['心电图', '心电图结论', 'ecg', '心电图描述', '心电图诊断']),
    cr: findCol(['血清肌酐', '肌酐', '血肌酐', 'cr', 'crea', '肌酐(μmol/l)']),
    bun: findCol(['血尿素氮', '尿素氮', 'bun', '尿素', 'urean']),
    hgb: findCol(['血红蛋白', 'hb', 'hgb', '血红素']),
    wbc: findCol(['白细胞', 'wbc', '白细胞计数', '白细胞数目']),
    plt: findCol(['血小板', 'plt', '血小板计数', '血小板数目']),
    urineProtein: findCol(['尿蛋白', 'pro', '尿常规尿蛋白']),
    urineRBC: findCol(['尿红细胞', 'rbc', '尿隐血rbc', '镜检红细胞']),
    urineOccultBlood: findCol(['尿潜血', '尿隐血', 'bld', 'ery']),
    urineKetone: findCol(['尿酮体', 'ket', '酮体']),
    ultrasoundResult: findCol(['超声所见', '腹部b超', 'b超', '腹部超声', '超声结论', '彩超', '超声检查']),
    chestDrResult: findCol(['胸部dr', '胸片', 'dr结论', '胸部x光', '放射影像']),
    uricAcid: findCol(['尿酸', '血尿酸', 'ua', 'uric']),
  };
}

// 智能读取单个或多个 Excel 文件，并自动支持跨工作表(Sheets)或多文件通过【身份证】关联外键自动合并
export async function readExcelFilesUnified(
  files: File[]
): Promise<{ columns: string[]; rows: any[]; mergedInfo?: string }> {
  if (files.length === 0) return { columns: [], rows: [] };

  // 1. 读取所有文件的所有工作表
  const allTables: { tableName: string; rows: any[]; columns: string[] }[] = [];

  for (const file of files) {
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: 'array' });

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      if (jsonRows.length > 0) {
        const columns = Object.keys(jsonRows[0]);
        allTables.push({
          tableName: `${file.name} [${sheetName}]`,
          rows: jsonRows,
          columns,
        });
      }
    }
  }

  if (allTables.length === 0) {
    return { columns: [], rows: [] };
  }

  // 如果只有一张表，直接返回
  if (allTables.length === 1) {
    return {
      columns: allTables[0].columns,
      rows: allTables[0].rows,
    };
  }

  // 2. 如果存在多张表（可能是多文件上传，或单个Excel包含多个Sheet如：超声所见、血常规、生化）
  // 查找各表中代表“身份证”的主键列
  const idCardKeywords = ['身份证', '身份证号', '证件号', '居民身份证', 'idcard'];
  const tablesWithKey = allTables.map((t) => {
    const keyCol = t.columns.find((c) => {
      const norm = c.trim().toLowerCase().replace(/[\s_()（）[\]]/g, '');
      return idCardKeywords.some((k) => norm.includes(k) || k.includes(norm));
    });
    return { ...t, keyCol };
  });

  const canMergeOnIdCard = tablesWithKey.every((t) => Boolean(t.keyCol));

  if (canMergeOnIdCard) {
    // 基于身份证号进行 Outer Join 自动合并
    const mergedMap = new Map<string, Record<string, any>>();
    const allColSet = new Set<string>();

    for (const t of tablesWithKey) {
      const keyCol = t.keyCol!;
      for (const row of t.rows) {
        const idVal = String(row[keyCol] || '').trim();
        if (!idVal) continue;

        if (!mergedMap.has(idVal)) {
          mergedMap.set(idVal, { '身份证': idVal });
        }
        const existing = mergedMap.get(idVal)!;

        for (const [col, val] of Object.entries(row)) {
          allColSet.add(col);
          if (val !== '' && val !== undefined && val !== null) {
            existing[col] = val;
          }
        }
      }
    }

    const mergedRows = Array.from(mergedMap.values());
    const mergedColumns = Array.from(allColSet);

    return {
      columns: mergedColumns,
      rows: mergedRows,
      mergedInfo: `已通过【身份证】自动跨表联合 ${allTables.length} 个数据表，匹配合并出 ${mergedRows.length} 名居民的完整数据！`,
    };
  } else {
    // 无法通过身份证关联时，默认使用第一张有效表
    return {
      columns: allTables[0].columns,
      rows: allTables[0].rows,
    };
  }
}

// 保持对单个文件的兼容
export async function readExcelFile(file: File): Promise<{ columns: string[]; rows: any[]; mergedInfo?: string }> {
  return readExcelFilesUnified([file]);
}

// 将通用表格行按字段映射转换为 HealthRecord，支持从身份证号自动反推性别、年龄
export function mapRowsToHealthRecords(rows: any[], mapping: ColumnMapping): HealthRecord[] {
  return rows.map((row, index) => {
    let sbp = parseNumber(row[mapping.sbp]);
    let dbp = parseNumber(row[mapping.dbp]);

    // 如果血压在同一列，例如 "180/110" 或 "150/95mmHg"
    if ((sbp === undefined || dbp === undefined) && mapping.bpCombined && row[mapping.bpCombined]) {
      const bpStr = String(row[mapping.bpCombined]);
      const match = bpStr.match(/(\d{2,3})\s*[\/／-]\s*(\d{2,3})/);
      if (match) {
        if (sbp === undefined) sbp = parseInt(match[1], 10);
        if (dbp === undefined) dbp = parseInt(match[2], 10);
      }
    }

    const chronicDiseases = mapping.chronicDiseases ? String(row[mapping.chronicDiseases] || '') : '';
    const isHyp = /高血压/i.test(chronicDiseases) || (sbp !== undefined && sbp >= 140);
    const isDia = /糖尿病/i.test(chronicDiseases);

    const rawIdCard = mapping.idCard ? String(row[mapping.idCard] || '').trim() : '';
    const idInfo = parseIdCard(rawIdCard);

    // 姓名处理：若无姓名列，则直接使用 身份证号 标识（如：身份证 3201...），若无身份证则用体检编号
    let name = mapping.name ? String(row[mapping.name] || '').trim() : '';
    if (!name) {
      if (rawIdCard) {
        name = `身份证 ${rawIdCard}`;
      } else {
        name = `体检编号 REC_${index + 1}`;
      }
    }

    // 性别与年龄处理：若原表未包含性别年龄列，优先从18位身份证号精准推导
    let gender = mapping.gender ? String(row[mapping.gender] || '').trim() : '';
    if (!gender && idInfo) {
      gender = idInfo.gender;
    }

    let age = mapping.age ? parseNumber(row[mapping.age]) : undefined;
    if (age === undefined && idInfo) {
      age = idInfo.age;
    }
    if (age === undefined) {
      age = 65; // 公卫老年人基础默认年龄
    }

    return {
      id: rawIdCard || row['id'] || row['ID'] || `REC_${index + 1}`,
      name,
      gender: gender || '未知',
      age,
      phone: mapping.phone ? String(row[mapping.phone] || '') : '',
      idCard: rawIdCard,
      chronicDiseases,
      isHypertension: isHyp,
      isDiabetes: isDia,
      symptoms: mapping.symptoms ? String(row[mapping.symptoms] || '') : '',
      sbp,
      dbp,
      fbg: mapping.fbg ? parseNumber(row[mapping.fbg]) : undefined,
      tbil: mapping.tbil ? parseNumber(row[mapping.tbil]) : undefined,
      alt: mapping.alt ? parseNumber(row[mapping.alt]) : undefined,
      ast: mapping.ast ? parseNumber(row[mapping.ast]) : undefined,
      tg: mapping.tg ? parseNumber(row[mapping.tg]) : undefined,
      tc: mapping.tc ? parseNumber(row[mapping.tc]) : undefined,
      ldl: mapping.ldl ? parseNumber(row[mapping.ldl]) : undefined,
      ecgResult: mapping.ecgResult ? String(row[mapping.ecgResult] || '') : '',
      cr: mapping.cr ? parseNumber(row[mapping.cr]) : undefined,
      bun: mapping.bun ? parseNumber(row[mapping.bun]) : undefined,
      hgb: mapping.hgb ? parseNumber(row[mapping.hgb]) : undefined,
      wbc: mapping.wbc ? parseNumber(row[mapping.wbc]) : undefined,
      plt: mapping.plt ? parseNumber(row[mapping.plt]) : undefined,
      urineProtein: mapping.urineProtein ? String(row[mapping.urineProtein] || '') : '',
      urineRBC: mapping.urineRBC ? String(row[mapping.urineRBC] || '') : '',
      urineOccultBlood: mapping.urineOccultBlood ? String(row[mapping.urineOccultBlood] || '') : '',
      urineKetone: mapping.urineKetone ? String(row[mapping.urineKetone] || '') : '',
      ultrasoundResult: mapping.ultrasoundResult ? String(row[mapping.ultrasoundResult] || '') : '',
      chestDrResult: mapping.chestDrResult ? String(row[mapping.chestDrResult] || '') : '',
      uricAcid: mapping.uricAcid ? parseNumber(row[mapping.uricAcid]) : undefined,
      rawRow: row,
    };
  });
}

// 导出【姓名/身份证+异常项】精简专用 Excel 表
export function exportNameAndAnomaliesExcel(results: ScreeningResult[], filenamePrefix = '老年人体检阳性体征_姓名身份证与异常项清单') {
  const positives = results.filter((r) => r.hasPositive);

  const data = positives.map((item, index) => {
    const { record, ruleHits } = item;

    // 格式化异常项详细文本
    const anomaliesDetailed = ruleHits
      .map((h) => `[${h.ruleId}项 ${h.shortLabel}] ${h.details.join('，')}`)
      .join('；\n');

    const ruleTags = ruleHits.map((h) => `${h.ruleId}项`).join('、');

    let triageLevel = '常规阳性';
    let suggestion = '安排全科门诊随访，复查异常指标并开展健康生活方式指导。';
    if (item.criticalCount > 0) {
      triageLevel = '危急重症';
      suggestion = '【高危紧急】存在血压危象/极值血糖/心血管危急征象或影像占位，建议立即启动急诊/专科绿色通道转诊并紧急复核！';
    } else if (ruleHits.length >= 2) {
      triageLevel = '多项高危';
      suggestion = '合并多项代谢或脏器功能异常，建议2周内专科复查，强化慢病用药调整与家庭医生签约追踪。';
    }

    return {
      '序号': index + 1,
      '身份证号 (主键)': record.idCard || '-',
      '姓名 (无姓名则显示身份证)': record.name,
      '性别 (由身份证自动推导)': record.gender || '-',
      '年龄 (由身份证自动推导)': record.age || '-',
      '联系电话': record.phone || '-',
      '慢病史': record.chronicDiseases || '-',
      '检出异常项汇总 (姓名加异常项核心列)': anomaliesDetailed,
      '异常项编号': ruleTags,
      '异常项总数': ruleHits.length,
      '风险分级': triageLevel,
      '随访与转诊处置建议': suggestion,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '姓名与异常项名单');

  // 列宽自适应设置
  worksheet['!cols'] = [
    { wch: 6 },  // 序号
    { wch: 22 }, // 身份证号
    { wch: 22 }, // 姓名/身份证
    { wch: 8 },  // 性别
    { wch: 8 },  // 年龄
    { wch: 15 }, // 联系电话
    { wch: 16 }, // 现存慢病
    { wch: 60 }, // 检出异常项汇总
    { wch: 15 }, // 异常项编号
    { wch: 10 }, // 异常项总数
    { wch: 12 }, // 风险分级
    { wch: 45 }, // 随访建议
  ];

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}_${dateStr}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

// 导出全项筛查花名册至 Excel
export function exportResultsToExcel(
  results: ScreeningResult[],
  exportType: 'positive_only' | 'all',
  filenamePrefix = '老年人体检阳性体征筛查表'
) {
  const filtered = exportType === 'positive_only' ? results.filter((r) => r.hasPositive) : results;

  const data = filtered.map((item, index) => {
    const { record, ruleHits, hasPositive } = item;
    
    const matchedRuleTags = ruleHits.map((h) => `[${h.ruleId}] ${h.shortLabel}`).join('；');
    const matchedDetails = ruleHits.flatMap((h) => h.details).join('；\n');

    let triageLevel = '正常/未检出异常';
    if (hasPositive) {
      if (item.criticalCount > 0) triageLevel = '危急重症 (立即转诊/处置)';
      else if (ruleHits.length >= 2) triageLevel = '多项高危 (重点跟踪管理)';
      else triageLevel = '阳性体征 (定期门诊随访)';
    }

    return {
      '序号': index + 1,
      '姓名': record.name,
      '身份证号': record.idCard || '-',
      '性别': record.gender,
      '年龄': record.age,
      '联系电话': record.phone || '-',
      '慢病既往史': record.chronicDiseases || '-',
      '体检状态': hasPositive ? '阳性异常' : '未见异常',
      '风险分级': triageLevel,
      '阳性项数': ruleHits.length,
      '命中阳性规则': matchedRuleTags || '无',
      '阳性详细指标与数值': matchedDetails || '无',
      '收缩压(mmHg)': record.sbp ?? '-',
      '舒张压(mmHg)': record.dbp ?? '-',
      '空腹血糖(mmol/L)': record.fbg ?? '-',
      '谷丙转氨酶ALT(U/L)': record.alt ?? '-',
      '谷草转氨酶AST(U/L)': record.ast ?? '-',
      '总胆红素(μmol/L)': record.tbil ?? '-',
      '甘油三酯(mmol/L)': record.tg ?? '-',
      '总胆固醇(mmol/L)': record.tc ?? '-',
      '低密度脂蛋白(mmol/L)': record.ldl ?? '-',
      '现存症状': record.symptoms || '无',
      '心电图结论': record.ecgResult || '-',
      '血清肌酐(μmol/L)': record.cr ?? '-',
      '血尿素氮(mmol/L)': record.bun ?? '-',
      '血红蛋白(g/L)': record.hgb ?? '-',
      '白细胞(10^9/L)': record.wbc ?? '-',
      '血小板(10^9/L)': record.plt ?? '-',
      '尿常规': [
        record.urineProtein ? `蛋白:${record.urineProtein}` : '',
        record.urineRBC ? `红细胞:${record.urineRBC}` : '',
        record.urineOccultBlood ? `潜血:${record.urineOccultBlood}` : '',
        record.urineKetone ? `酮体:${record.urineKetone}` : '',
      ].filter(Boolean).join(' | ') || '-',
      '超声所见/腹部B超': record.ultrasoundResult || '-',
      '胸部DR结论': record.chestDrResult || '-',
      '血尿酸(μmol/L)': record.uricAcid ?? '-',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '阳性体征筛查花名册');

  const cols = Object.keys(data[0] || {}).map((k) => ({
    wch: Math.max(k.length * 2.2, 12),
  }));
  worksheet['!cols'] = cols;

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}_${exportType === 'positive_only' ? '阳性人群' : '全员筛查'}_${dateStr}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

// 解析从公卫网页直接复制粘贴的制表符或换行表格文本 (TSV / CSV / 剪贴板文本)
export function parseClipboardTableText(rawText: string): { columns: string[]; rows: any[] } {
  if (!rawText || !rawText.trim()) return { columns: [], rows: [] };

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return { columns: [], rows: [] };

  const firstLine = lines[0];
  let delimiter = '\t';
  if (firstLine.includes('\t')) {
    delimiter = '\t';
  } else if (firstLine.includes(',')) {
    delimiter = ',';
  } else if (firstLine.includes(';') || firstLine.includes('；')) {
    delimiter = ';';
  }

  const columns = lines[0].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));

  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map((v) => v.trim().replace(/^["']|["']$/g, ''));
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;

    const rowObj: Record<string, any> = {};
    columns.forEach((col, idx) => {
      rowObj[col] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(rowObj);
  }

  return { columns, rows };
}

// 生成标准空模板 / 示范模板 Excel
export function downloadExcelTemplate() {
  const sampleData = [
    {
      '身份证': '110101195403151234',
      '姓名': '张建国',
      '性别': '男',
      '年龄': 72,
      '联系电话': '13800138001',
      '血糖': 5.8,
      '谷丙转氨酶': 25,
      '谷草转氨酶': 28,
      '总胆红素': 16.2,
      '血清肌酐': 88,
      '血尿素氮': 5.6,
      '总胆固醇': 4.8,
      '甘油三酯': 2.1,
      '低密度脂蛋白': 2.7,
      '血红蛋白': 135,
      '白细胞': 6.2,
      '血小板': 210,
      '超声所见': '轻度脂肪肝，余未见异常',
      '收缩压': 185,
      '舒张压': 112,
    },
    {
      '身份证': '110101195806202345',
      '姓名': '李秀英',
      '性别': '女',
      '年龄': 68,
      '联系电话': '13911223344',
      '血糖': 3.2,
      '谷丙转氨酶': 22,
      '谷草转氨酶': 24,
      '总胆红素': 12.5,
      '血清肌酐': 72,
      '血尿素氮': 4.8,
      '总胆固醇': 4.5,
      '甘油三酯': 1.8,
      '低密度脂蛋白': 2.6,
      '血红蛋白': 122,
      '白细胞': 5.4,
      '血小板': 185,
      '超声所见': '肝胆胰脾肾未见异常',
      '收缩压': 128,
      '舒张压': 78,
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '老年人体检数据模板');
  XLSX.writeFile(workbook, '老年人健康管理体检花名册标准导入模板.xlsx');
}
