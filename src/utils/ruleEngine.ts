import { HealthRecord, RuleHit, ScreeningResult, RuleThresholds } from '../types/health';

export const DEFAULT_THRESHOLDS: RuleThresholds = {
  sbpMax: 180,
  dbpMax: 110,
  fbgMin: 3.9,
  fbgMax: 16.7,
  tbilMax: 34.2,
  altMax: 80,
  astMax: 80,
  generalTgMax: 5.6,
  generalTcMax: 7.2,
  generalLdlMax: 4.9,
  hypTgMax: 5.2,
  hypLdlMax: 3.4,
  dualLdlMax: 1.8,
  crMax: 124,
  bunMax: 9.0,
  hgbMin: 90,
  wbcMin: 4.0,
  wbcMax: 10.0,
  pltMin: 50,
  pltMax: 300,
  uaMax: 420,
};

export const RULE_DEFINITIONS = [
  {
    id: 1,
    title: '① 血压危象/重度高血压',
    criteria: '收缩压 ≥ 180mmHg 或 舒张压 ≥ 110mmHg',
    category: '心脑血管危象',
    tag: '危急',
  },
  {
    id: 2,
    title: '② 血糖高危/危急值',
    criteria: '空腹血糖 ≤ 3.9mmol/L (低血糖) 或 ≥ 16.7mmol/L (高血糖危象)',
    category: '内分泌代谢',
    tag: '危急',
  },
  {
    id: 3,
    title: '③ 肝功能明显异常',
    criteria: '总胆红素 > 34.2μmol/L 或 ALT ＞ 80U/L 或 AST ＞ 80U/L',
    category: '肝脏代谢',
    tag: '重点',
  },
  {
    id: 4,
    title: '④ 血脂异常分层',
    criteria: '普通人: TG≥5.6 / TC≥7.2 / LDL≥4.9；高血压患者: TG≥5.2 或 LDL＞3.4；高血压+糖尿病双患: LDL≥1.8',
    category: '心血管风险分层',
    tag: '重点',
  },
  {
    id: 5,
    title: '⑤ 心血管危急征象',
    criteria: '胸痛/胸闷/心悸等症状 + 心电图异常(陈旧心梗/病理Q波/ST-T改变/快速房颤/三度房室阻滞等)',
    category: '急性心血管事件',
    tag: '危急',
  },
  {
    id: 6,
    title: '⑥ 肾功能异常',
    criteria: '肌酐 ≥ 124μmol/L 或 尿素氮 ＞ 9mmol/L',
    category: '肾脏功能',
    tag: '重点',
  },
  {
    id: 7,
    title: '⑦ 血常规三系严重异常',
    criteria: '血红蛋白 ＜ 90g/L；白细胞 ＞ 10 或 ＜ 4×10^9/L；血小板 ＜ 50 或 ＞ 300×10^9/L',
    category: '血液系统',
    tag: '重点',
  },
  {
    id: 8,
    title: '⑧ 尿常规显著异常',
    criteria: '尿蛋白 ≥ 1+；尿红细胞 ≥ 1+；尿潜血 ≥ 1+；或尿蛋白和尿酮体同时 ≥ 1+',
    category: '泌尿系统',
    tag: '常规',
  },
  {
    id: 9,
    title: '⑨ 腹部B超重大异常',
    criteria: '重度脂肪肝；肝囊肿 ≥ 5cm；肾囊肿 ≥ 5cm；胆囊息肉 ≥ 1.0cm；占位性病变',
    category: '超声影像',
    tag: '重点/危急',
  },
  {
    id: 10,
    title: '⑩ 胸部DR占位性病变',
    criteria: '胸部DR/胸片提示占位性病变、肺肿块或疑似恶性占位',
    category: '放射影像',
    tag: '危急',
  },
  {
    id: 11,
    title: '⑪ 高尿酸血症',
    criteria: '血尿酸 ≥ 420μmol/L',
    category: '代谢代谢',
    tag: '常规',
  },
];

// 辅助数值安全解析
export function parseNumber(val: any): number | undefined {
  if (val === undefined || val === null || val === '') return undefined;
  if (typeof val === 'number') return isNaN(val) ? undefined : val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^\d.-]/g, '');
    if (!cleaned) return undefined;
    const n = parseFloat(cleaned);
    return isNaN(n) ? undefined : n;
  }
  return undefined;
}

// 解析慢性病史
export function checkChronicDiseases(record: HealthRecord): { isHyp: boolean; isDia: boolean } {
  let isHyp = record.isHypertension === true;
  let isDia = record.isDiabetes === true;

  const raw = `${record.chronicDiseases || ''} ${record.symptoms || ''} ${JSON.stringify(record.rawRow || {})}`;

  if (!isHyp) {
    if (/高血压|原发性高血压|高压病|血压高|hypertension/i.test(raw)) {
      isHyp = true;
    }
    // 若体检时收缩压>=140或舒张压>=90，虽未确诊但具高血压体征；但分层标准通常看高血压确诊患者或现病史
  }

  if (!isDia) {
    if (/糖尿病|2型糖尿病|1型糖尿病|血糖高|diabetes/i.test(raw)) {
      isDia = true;
    }
  }

  return { isHyp, isDia };
}

// 解析尿常规等级 (例如 "1+", "+", "++", "+++", "阳性", "阴性", "-")
export function parseUrineGrade(val: any): number {
  if (!val) return 0;
  const s = String(val).trim().toUpperCase();
  if (s === '阴性' || s === '-' || s === 'NEGATIVE' || s === 'NORMAL' || s === '0' || s === '+-') return 0;
  
  if (s.includes('++++') || s.includes('4+')) return 4;
  if (s.includes('+++') || s.includes('3+')) return 3;
  if (s.includes('++') || s.includes('2+')) return 2;
  if (s.includes('+') || s.includes('1+') || s === '阳性' || s === 'POSITIVE') return 1;

  const num = parseNumber(val);
  if (num !== undefined && num >= 1) return Math.min(4, Math.floor(num));

  return 0;
}

// 检查心血管症状 (胸痛、胸闷、心悸等)
export function hasCardiacSymptoms(text?: string): { has: boolean; matched: string[] } {
  if (!text) return { has: false, matched: [] };
  const s = String(text);
  const keywords = ['胸痛', '胸闷', '心悸', '心慌', '心前区疼痛', '心绞痛', '心前区隐痛', '气急胸闷', '心动过速感'];
  const matched = keywords.filter((k) => s.includes(k));
  return { has: matched.length > 0, matched };
}

// 检查心电图异常 (陈旧性心肌梗死、病理性Q波、ST-T改变、快速房颤、三度房室传导阻滞等)
export function hasEcgAbnormalities(text?: string): { has: boolean; matched: string[] } {
  if (!text) return { has: false, matched: [] };
  const s = String(text);
  const keywords = [
    '陈旧性心肌梗死',
    '心肌梗死',
    '心梗',
    '病理性Q波',
    '病理Q波',
    '异常Q波',
    'ST-T改变',
    'ST段改变',
    'ST段压低',
    'ST段抬高',
    'T波倒置',
    'T波低平倒置',
    '快速房颤',
    '快速心房颤动',
    '房颤伴快速心室率',
    '心房颤动',
    '三度房室传导阻滞',
    'Ⅲ度房室传导阻滞',
    '3度房室传导阻滞',
    '完全性房室传导阻滞',
  ];
  const matched = keywords.filter((k) => s.includes(k));
  return { has: matched.length > 0, matched };
}

// 检查腹部B超异常 (重度脂肪肝；肝囊肿≥5cm；肾囊肿≥5cm；胆囊息肉≥1.0cm；占位性病变)
export function checkUltrasoundPositive(text?: string): { isPositive: boolean; reasons: string[] } {
  if (!text) return { isPositive: false, reasons: [] };
  const s = String(text);
  const reasons: string[] = [];

  // 1. 重度脂肪肝
  if (/重度脂肪肝/i.test(s)) {
    reasons.push('重度脂肪肝');
  }

  // 2. 占位性病变
  if (/占位性病变|占位病变|占位|恶性肿瘤|疑似肿瘤/i.test(s) && !/未见.*占位/i.test(s) && !/无.*占位/i.test(s)) {
    reasons.push('腹部占位性病变');
  }

  // 辅助提取尺寸(单位cm或mm)
  // 匹配类似 "肝囊肿...5.2cm" 或 "55mm"
  function extractSizeInCm(contextText: string, targetName: string): number[] {
    const sizes: number[] = [];
    // 找出目标词出现位置周围句子
    const sentences = contextText.split(/[；;。，,\n]/);
    for (const sentence of sentences) {
      if (sentence.includes(targetName)) {
        // 匹配数字+cm或mm, 如 5.2cm, 5cm, 50mm, 5.2*4.8cm, 52×45mm
        const cmMatches = Array.from(sentence.matchAll(/(\d+(\.\d+)?)\s*(cm|厘米)/gi));
        for (const m of cmMatches) {
          sizes.push(parseFloat(m[1]));
        }
        const mmMatches = Array.from(sentence.matchAll(/(\d+(\.\d+)?)\s*(mm|毫米)/gi));
        for (const m of mmMatches) {
          sizes.push(parseFloat(m[1]) / 10);
        }
      }
    }
    return sizes;
  }

  // 3. 肝囊肿 ≥ 5cm
  if (/肝囊肿|肝脏囊肿/i.test(s)) {
    const sizes = extractSizeInCm(s, '肝囊肿');
    const over5 = sizes.find((size) => size >= 5.0);
    if (over5) {
      reasons.push(`肝囊肿 ≥ 5cm (实测约 ${over5}cm)`);
    } else if (sizes.length === 0 && /(肝囊肿.*大.*(5|6|7|8|9)\d*mm)|(肝囊肿.*(5|6|7|8|9)cm)/i.test(s)) {
      reasons.push('肝囊肿 ≥ 5cm');
    }
  }

  // 4. 肾囊肿 ≥ 5cm (包括左肾、右肾、双肾)
  if (/肾囊肿|肾脏囊肿/i.test(s)) {
    const sizes = [
      ...extractSizeInCm(s, '肾囊肿'),
      ...extractSizeInCm(s, '左肾'),
      ...extractSizeInCm(s, '右肾'),
      ...extractSizeInCm(s, '双肾'),
    ];
    const over5 = sizes.find((size) => size >= 5.0);
    if (over5) {
      reasons.push(`肾囊肿 ≥ 5cm (实测约 ${over5}cm)`);
    } else if (sizes.length === 0 && /(肾囊肿.*大.*(5|6|7|8|9)\d*mm)|(肾囊肿.*(5|6|7|8|9)cm)/i.test(s)) {
      reasons.push('肾囊肿 ≥ 5cm');
    }
  }

  // 5. 胆囊息肉 ≥ 1.0cm (10mm)
  if (/胆囊息肉/i.test(s)) {
    const sizes = extractSizeInCm(s, '胆囊息肉');
    const over1 = sizes.find((size) => size >= 1.0);
    if (over1) {
      reasons.push(`胆囊息肉 ≥ 1.0cm (实测约 ${over1}cm)`);
    } else if (sizes.length === 0 && /(胆囊息肉.*(10|11|12|13|14|15|20)\s*mm)|(胆囊息肉.*[1-9](\.\d+)?\s*cm)/i.test(s)) {
      reasons.push('胆囊息肉 ≥ 1.0cm');
    }
  }

  return { isPositive: reasons.length > 0, reasons };
}

// 检查胸部DR占位性病变
export function checkChestDrPositive(text?: string): { isPositive: boolean; reasons: string[] } {
  if (!text) return { isPositive: false, reasons: [] };
  const s = String(text);
  const reasons: string[] = [];

  // 排除否定句："未见明显占位"、"未见占位性病变"、"无占位"
  const negativePattern = /(未见|未发现|无)(明显)?(占位|肿块|恶性)/;
  
  if (negativePattern.test(s)) {
    // 检查是否有肯定句在其它部分
    const parts = s.split(/[；;。，,\n]/);
    for (const part of parts) {
      if (!negativePattern.test(part)) {
        if (/占位性病变|肺占位|占位病变|肺肿块|肺部肿块|疑似肺癌|恶性占位|肺部占位/i.test(part)) {
          reasons.push(`胸部DR占位性病变: ${part.trim()}`);
        }
      }
    }
  } else {
    if (/占位性病变|肺占位|占位病变|肺肿块|肺部肿块|疑似肺癌|恶性占位|纵隔占位|肺部占位/i.test(s)) {
      reasons.push(`胸部DR提示占位性病变/肿块: ${s.trim()}`);
    }
  }

  return { isPositive: reasons.length > 0, reasons };
}

/**
 * 核心筛查评估引擎
 * 对单条体检记录执行全部11项阳性体征判定
 */
export function screenPatientRecord(record: HealthRecord, thresholds: RuleThresholds = DEFAULT_THRESHOLDS): ScreeningResult {
  const ruleHits: RuleHit[] = [];

  // ① 血压异常：收缩压≥180mmHg 或 舒张压≥110mmHg
  const sbp = parseNumber(record.sbp);
  const dbp = parseNumber(record.dbp);
  const rule1Details: string[] = [];
  if (sbp !== undefined && sbp >= thresholds.sbpMax) {
    rule1Details.push(`收缩压 ${sbp} mmHg (≥${thresholds.sbpMax})`);
  }
  if (dbp !== undefined && dbp >= thresholds.dbpMax) {
    rule1Details.push(`舒张压 ${dbp} mmHg (≥${thresholds.dbpMax})`);
  }
  if (rule1Details.length > 0) {
    ruleHits.push({
      ruleId: 1,
      ruleName: '收缩压≥180 或 舒张压≥110mmHg',
      shortLabel: '高血压危象',
      details: rule1Details,
      level: 'critical',
    });
  }

  // ② 血糖异常：血糖≤3.9mmol/L 或 ≥16.7mmol/L
  const fbg = parseNumber(record.fbg);
  if (fbg !== undefined) {
    if (fbg <= thresholds.fbgMin) {
      ruleHits.push({
        ruleId: 2,
        ruleName: '血糖≤3.9mmol/L 或 ≥16.7mmol/L',
        shortLabel: '低血糖高危',
        details: [`血糖 ${fbg} mmol/L (≤${thresholds.fbgMin} 低血糖)`],
        level: 'critical',
      });
    } else if (fbg >= thresholds.fbgMax) {
      ruleHits.push({
        ruleId: 2,
        ruleName: '血糖≤3.9mmol/L 或 ≥16.7mmol/L',
        shortLabel: '高血糖危象',
        details: [`血糖 ${fbg} mmol/L (≥${thresholds.fbgMax} 极高血糖)`],
        level: 'critical',
      });
    }
  }

  // ③ 肝功能：总胆红素>34.2μmol/L；ALT＞80U/L；AST＞80U/L中任意一项异常
  const tbil = parseNumber(record.tbil);
  const alt = parseNumber(record.alt);
  const ast = parseNumber(record.ast);
  const rule3Details: string[] = [];
  if (tbil !== undefined && tbil > thresholds.tbilMax) {
    rule3Details.push(`总胆红素 ${tbil} μmol/L (>${thresholds.tbilMax})`);
  }
  if (alt !== undefined && alt > thresholds.altMax) {
    rule3Details.push(`谷丙转氨酶(ALT) ${alt} U/L (>${thresholds.altMax})`);
  }
  if (ast !== undefined && ast > thresholds.astMax) {
    rule3Details.push(`谷草转氨酶(AST) ${ast} U/L (>${thresholds.astMax})`);
  }
  if (rule3Details.length > 0) {
    ruleHits.push({
      ruleId: 3,
      ruleName: '总胆红素>34.2 或 ALT>80 或 AST>80U/L',
      shortLabel: '肝功能异常',
      details: rule3Details,
      level: 'high',
    });
  }

  // ④ 血脂异常分层标准：
  // 甘油三酯≥5.6mmol/L；总胆固醇≥7.2mmol/L；低密度脂蛋白≥4.9mmol/L；
  // 高血压患者甘油三酯≥5.2mmol/L或低密度脂蛋白＞3.4mmol/L；
  // 高血压、糖尿病双患患者低密度脂蛋白≥1.8mmol/L中任意一项异常
  const tg = parseNumber(record.tg);
  const tc = parseNumber(record.tc);
  const ldl = parseNumber(record.ldl);
  const { isHyp, isDia } = checkChronicDiseases(record);

  const rule4Details: string[] = [];

  // 判断是否双患 (高血压+糖尿病)
  if (isHyp && isDia) {
    if (ldl !== undefined && ldl >= thresholds.dualLdlMax) {
      rule4Details.push(`双慢病(高血压+糖尿病)患者 LDL-C ${ldl} mmol/L (≥${thresholds.dualLdlMax} 未达标)`);
    }
  }

  // 判断是否高血压患者
  if (isHyp) {
    if (tg !== undefined && tg >= thresholds.hypTgMax) {
      rule4Details.push(`高血压患者甘油三酯 ${tg} mmol/L (≥${thresholds.hypTgMax})`);
    }
    if (ldl !== undefined && ldl > thresholds.hypLdlMax) {
      rule4Details.push(`高血压患者 LDL-C ${ldl} mmol/L (>${thresholds.hypLdlMax})`);
    }
  }

  // 普通基线血脂异常标准
  if (tg !== undefined && tg >= thresholds.generalTgMax) {
    rule4Details.push(`甘油三酯 ${tg} mmol/L (≥${thresholds.generalTgMax})`);
  }
  if (tc !== undefined && tc >= thresholds.generalTcMax) {
    rule4Details.push(`总胆固醇 ${tc} mmol/L (≥${thresholds.generalTcMax})`);
  }
  if (ldl !== undefined && ldl >= thresholds.generalLdlMax) {
    rule4Details.push(`低密度脂蛋白 ${ldl} mmol/L (≥${thresholds.generalLdlMax})`);
  }

  if (rule4Details.length > 0) {
    // 去重
    const uniqueRule4 = Array.from(new Set(rule4Details));
    ruleHits.push({
      ruleId: 4,
      ruleName: '血脂异常分层筛查',
      shortLabel: '血脂异常',
      details: uniqueRule4,
      level: 'high',
    });
  }

  // ⑤ 有胸痛胸闷心悸等症状 + 心电图异常（陈旧性心肌梗死、病理性Q波、ST-T改变、快速房颤、三度房室传导阻滞等）
  const cardiacSymp = hasCardiacSymptoms(record.symptoms);
  const ecgAbnormal = hasEcgAbnormalities(record.ecgResult);
  if (cardiacSymp.has && ecgAbnormal.has) {
    ruleHits.push({
      ruleId: 5,
      ruleName: '胸痛胸闷心悸症状 + 心电图重大异常',
      shortLabel: '心血管危急',
      details: [
        `现存症状: ${cardiacSymp.matched.join('、')}`,
        `心电图危急异常: ${ecgAbnormal.matched.join('、')}`,
      ],
      level: 'critical',
    });
  }

  // ⑥ 肌酐≥124μmol/L；尿素氮＞9mmol/L中任意一项异常
  const cr = parseNumber(record.cr);
  const bun = parseNumber(record.bun);
  const rule6Details: string[] = [];
  if (cr !== undefined && cr >= thresholds.crMax) {
    rule6Details.push(`血肌酐 ${cr} μmol/L (≥${thresholds.crMax})`);
  }
  if (bun !== undefined && bun > thresholds.bunMax) {
    rule6Details.push(`尿素氮 ${bun} mmol/L (>${thresholds.bunMax})`);
  }
  if (rule6Details.length > 0) {
    ruleHits.push({
      ruleId: 6,
      ruleName: '肌酐≥124 或 尿素氮>9mmol/L',
      shortLabel: '肾功能异常',
      details: rule6Details,
      level: 'high',
    });
  }

  // ⑦ 血红蛋白＜90g/L；白细胞＞10X10^9/L或＜4X10^9/L；血小板＜50X10^9/L或＞300X10^9/L中任意一项异常
  const hgb = parseNumber(record.hgb);
  const wbc = parseNumber(record.wbc);
  const plt = parseNumber(record.plt);
  const rule7Details: string[] = [];
  if (hgb !== undefined && hgb < thresholds.hgbMin) {
    rule7Details.push(`血红蛋白 ${hgb} g/L (<${thresholds.hgbMin} 中重度贫血)`);
  }
  if (wbc !== undefined) {
    if (wbc > thresholds.wbcMax) {
      rule7Details.push(`白细胞 ${wbc}×10^9/L (>${thresholds.wbcMax})`);
    } else if (wbc < thresholds.wbcMin) {
      rule7Details.push(`白细胞 ${wbc}×10^9/L (<${thresholds.wbcMin})`);
    }
  }
  if (plt !== undefined) {
    if (plt < thresholds.pltMin) {
      rule7Details.push(`血小板 ${plt}×10^9/L (<${thresholds.pltMin})`);
    } else if (plt > thresholds.pltMax) {
      rule7Details.push(`血小板 ${plt}×10^9/L (>${thresholds.pltMax})`);
    }
  }
  if (rule7Details.length > 0) {
    ruleHits.push({
      ruleId: 7,
      ruleName: '血红蛋白<90 / WBC>10或<4 / PLT<50或>300',
      shortLabel: '血常规异常',
      details: rule7Details,
      level: 'high',
    });
  }

  // ⑧ 尿蛋白≥1+；尿红细胞≥1+；尿潜血≥1+；尿蛋白和尿酮体同时≥1+中任意一项异常
  const uPro = parseUrineGrade(record.urineProtein);
  const uRbc = parseUrineGrade(record.urineRBC);
  const uBld = parseUrineGrade(record.urineOccultBlood);
  const uKet = parseUrineGrade(record.urineKetone);
  const rule8Details: string[] = [];

  if (uPro >= 1) {
    rule8Details.push(`尿蛋白 ${record.urineProtein || '≥1+'}`);
  }
  if (uRbc >= 1) {
    rule8Details.push(`尿红细胞 ${record.urineRBC || '≥1+'}`);
  }
  if (uBld >= 1) {
    rule8Details.push(`尿潜血 ${record.urineOccultBlood || '≥1+'}`);
  }
  if (uPro >= 1 && uKet >= 1) {
    rule8Details.push(`尿蛋白(${record.urineProtein}) 与 尿酮体(${record.urineKetone}) 同时≥1+`);
  }

  if (rule8Details.length > 0) {
    ruleHits.push({
      ruleId: 8,
      ruleName: '尿蛋白/尿红细胞/尿潜血≥1+ 或 尿蛋白+尿酮体≥1+',
      shortLabel: '尿常规异常',
      details: Array.from(new Set(rule8Details)),
      level: 'moderate',
    });
  }

  // ⑨ 腹部B超，重度脂肪肝；肝囊肿≥5cm；肾囊肿≥5cm；胆囊息肉≥1.0cm；占位性病变中任意一项异常
  const usCheck = checkUltrasoundPositive(record.ultrasoundResult);
  if (usCheck.isPositive) {
    ruleHits.push({
      ruleId: 9,
      ruleName: '重度脂肪肝/肝肾囊肿≥5cm/胆息肉≥1cm/占位',
      shortLabel: '腹部B超异常',
      details: usCheck.reasons,
      level: usCheck.reasons.some((r) => r.includes('占位')) ? 'critical' : 'high',
    });
  }

  // ⑩ 胸部DR，占位性病变
  const chestCheck = checkChestDrPositive(record.chestDrResult);
  if (chestCheck.isPositive) {
    ruleHits.push({
      ruleId: 10,
      ruleName: '胸部DR占位性病变',
      shortLabel: '胸片占位',
      details: chestCheck.reasons,
      level: 'critical',
    });
  }

  // ⑪ 尿酸≥420μmol (420μmol/L)
  const ua = parseNumber(record.uricAcid);
  if (ua !== undefined && ua >= thresholds.uaMax) {
    ruleHits.push({
      ruleId: 11,
      ruleName: '尿酸≥420μmol/L',
      shortLabel: '高尿酸血症',
      details: [`血尿酸 ${ua} μmol/L (≥${thresholds.uaMax})`],
      level: 'moderate',
    });
  }

  const criticalCount = ruleHits.filter((r) => r.level === 'critical').length;

  return {
    record,
    hasPositive: ruleHits.length > 0,
    ruleHits,
    criticalCount,
    totalHitsCount: ruleHits.length,
  };
}
