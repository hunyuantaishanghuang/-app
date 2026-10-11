import fs from 'fs';
import path from 'path';

const xlsxPath = path.resolve('node_modules/xlsx/dist/xlsx.full.min.js');
const xlsxCode = fs.readFileSync(xlsxPath, 'utf-8');

const offlineHtmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>老年人体检阳性体征筛查工具 (纯离线单文件版)</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; background: #f8fafc; color: #0f172a; line-height: 1.5; font-size: 13px; }
    .header { background: #fff; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 30; }
    .header-inner { max-width: 1280px; margin: 0 auto; padding: 0 16px; height: 60px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .logo-area { display: flex; align-items: center; gap: 10px; }
    .logo-badge { width: 32px; height: 32px; border-radius: 8px; background: #0f766e; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
    .brand-title { font-size: 16px; font-weight: 700; color: #0f172a; }
    .brand-sub { font-size: 11px; color: #64748b; }
    .header-actions { display: flex; align-items: center; gap: 8px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 12px; font-size: 12px; font-weight: 500; border-radius: 6px; border: 1px solid transparent; cursor: pointer; transition: all 0.15s; background: #fff; color: #334155; }
    .btn:hover { background: #f1f5f9; }
    .btn-primary { background: #0f766e; color: #fff; }
    .btn-primary:hover { background: #115e59; }
    .btn-amber { background: #fef3c7; color: #92400e; border-color: #fde68a; }
    .btn-amber:hover { background: #fde68a; }
    .btn-slate { background: #f1f5f9; color: #334155; border-color: #cbd5e1; }
    .main { max-width: 1280px; margin: 0 auto; padding: 20px 16px; display: flex; flex-direction: column; gap: 20px; }
    .offline-tip { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px 14px; border-radius: 8px; color: #166534; font-size: 12px; display: flex; align-items: center; justify-content: space-between; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    .kpi-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; }
    .kpi-title { font-size: 11px; color: #64748b; font-weight: 500; }
    .kpi-val { font-size: 22px; font-weight: 700; font-family: monospace; margin: 4px 0 2px; }
    .kpi-sub { font-size: 11px; color: #64748b; }
    .dropzone { border: 2px dashed #cbd5e1; background: #fff; border-radius: 12px; padding: 28px 16px; text-align: center; cursor: pointer; transition: border 0.15s; }
    .dropzone:hover { border-color: #0f766e; background: #f8fafc; }
    .table-container { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
    .table-toolbar { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; background: #fafafa; }
    .search-input { padding: 6px 12px; font-size: 12px; border: 1px solid #cbd5e1; border-radius: 6px; width: 240px; }
    .segmented { display: inline-flex; background: #e2e8f0; padding: 2px; border-radius: 6px; gap: 2px; }
    .seg-btn { padding: 4px 10px; font-size: 11px; border: none; background: transparent; cursor: pointer; border-radius: 4px; color: #475569; font-weight: 500; }
    .seg-btn.active { background: #fff; color: #0f172a; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; }
    th { background: #f8fafc; padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 600; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; vertical-align: middle; }
    tr:hover td { background: #f8fafc; }
    .mono { font-family: monospace; }
    .tag-crit { background: #ffe4e6; color: #9f1239; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .tag-high { background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    .tag-norm { background: #ccfbf1; color: #115e59; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    .rule-chip { display: inline-block; background: #fef3c7; color: #78350f; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin: 1px 2px 1px 0; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); display: none; align-items: center; justify-content: center; padding: 16px; z-index: 50; }
    .modal-overlay.open { display: flex; }
    .modal-card { background: #fff; border-radius: 12px; max-width: 650px; width: 100%; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2); }
    .modal-head { padding: 14px 18px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; font-weight: 700; }
    .modal-body { padding: 16px 18px; overflow-y: auto; flex: 1; font-size: 12px; }
    .modal-foot { padding: 12px 18px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: flex-end; gap: 8px; background: #f8fafc; }
  </style>
</head>
<body>

  <header class="header">
    <div class="header-inner">
      <div class="logo-area">
        <div class="logo-badge">卫</div>
        <div>
          <div class="brand-title">老年人体检阳性体征筛查系统 (纯离线单文件版)</div>
          <div class="brand-sub">100% 离线运行 · 无需联网 · 无需Python · 居民档案隐私安全保障</div>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn btn-slate" onclick="pasteTableData()">粘贴网页表格</button>
        <button class="btn btn-amber" onclick="exportNameAndAnomalies()">导出【姓名+异常项】清单</button>
        <button class="btn btn-primary" onclick="document.getElementById('fileInput').click()">导入公卫Excel表</button>
        <input type="file" id="fileInput" multiple accept=".xlsx,.xls,.csv" style="display:none" onchange="handleFileSelect(event)">
      </div>
    </div>
  </header>

  <main class="main">
    <div class="offline-tip">
      <span><strong>提示：</strong>本文件已内置所有解析运算引擎与Excel生成内核，拔掉网线、拷贝到无外网的内网电脑、U盘双击打开均可正常使用！</span>
      <span>当前状态: <strong style="color:#0f766e">纯本地离线运行</strong></span>
    </div>

    <!-- 导入拖拽区 -->
    <div class="dropzone" id="dropArea" onclick="document.getElementById('fileInput').click()">
      <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
        点击选择或将公卫导出的 Excel 表格拖入此处
      </div>
      <div style="color: #64748b; font-size: 12px;">
        支持同时多选或拖入【超声所见表】、【生化检查表】、【血常规表】、【人员基本表】，系统将基于<strong>【身份证】</strong>自动跨表关联融合！
      </div>
    </div>

    <!-- KPI 统计卡 -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-title">总体检人次</div>
        <div class="kpi-val" id="statTotal">0</div>
        <div class="kpi-sub">当前加载体检记录</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">检出阳性体征</div>
        <div class="kpi-val" style="color: #b45309;" id="statPositive">0</div>
        <div class="kpi-sub" id="statPosRate">阳性率 0%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">危急重症预警</div>
        <div class="kpi-val" style="color: #e11d48;" id="statCritical">0</div>
        <div class="kpi-sub">血压危象/极值血糖/占位</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">多项阳性合并管理</div>
        <div class="kpi-val" style="color: #0f766e;" id="statMulti">0</div>
        <div class="kpi-sub">同时命中 ≥2 项异常指标</div>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <div class="table-toolbar">
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="text" id="searchBox" class="search-input" placeholder="搜索姓名 / 身份证 / 慢病 / 异常" oninput="renderTable()">
          <div class="segmented">
            <button class="seg-btn active" id="segAll" onclick="setFilter('all')">全部</button>
            <button class="seg-btn" id="segPos" onclick="setFilter('pos')">仅阳性</button>
            <button class="seg-btn" id="segCrit" onclick="setFilter('crit')">危急重症</button>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn btn-slate" onclick="copyTableText()">复制清单文本</button>
          <button class="btn btn-amber" onclick="exportNameAndAnomalies()">导出【姓名+异常项】</button>
          <button class="btn btn-slate" onclick="exportAllExcel()">导出全项表</button>
        </div>
      </div>

      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th style="width: 50px; text-align: center;">序号</th>
              <th style="min-width: 130px;">姓名 / 身份证</th>
              <th style="min-width: 80px;">性别 / 年龄</th>
              <th style="min-width: 260px;">检出阳性体征汇总</th>
              <th style="text-align: right;">血压</th>
              <th style="text-align: right;">血糖</th>
              <th style="text-align: right;">ALT/AST</th>
              <th style="text-align: right;">血脂</th>
              <th style="text-align: right;">肌酐/尿酸</th>
              <th style="text-align: center; width: 90px;">预警分级</th>
            </tr>
          </thead>
          <tbody id="tableBody">
            <tr><td colspan="10" style="text-align:center; padding:32px; color:#94a3b8;">请点击上方“导入公卫Excel表”或将文件拖入窗口开始筛查</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <!-- 网页粘贴模态框 -->
  <div class="modal-overlay" id="pasteModal">
    <div class="modal-card">
      <div class="modal-head">
        <span>从公卫网页直接复制粘贴表格</span>
        <button onclick="closePasteModal()" style="border:none; background:none; cursor:pointer; font-size:18px;">&times;</button>
      </div>
      <div class="modal-body">
        <p style="margin-bottom:8px; color:#64748b;">在公卫平台网页表格中鼠标框选数据（含表头），按 Ctrl+C 复制后粘贴到下方：</p>
        <textarea id="pasteText" rows="10" style="width:100%; font-family:monospace; font-size:12px; padding:10px; border:1px solid #cbd5e1; border-radius:6px; resize:none;" placeholder="身份证\t超声所见\n1101011954...\t重度脂肪肝"></textarea>
      </div>
      <div class="modal-foot">
        <button class="btn btn-slate" onclick="closePasteModal()">取消</button>
        <button class="btn btn-primary" onclick="doParsePaste()">立即解析</button>
      </div>
    </div>
  </div>

  <!-- 内嵌 SheetJS 离线解析引擎 (零网络请求) -->
  <script>
    ${xlsxCode}
  </script>

  <!-- 核心逻辑脚本 -->
  <script>
    // 状态存储
    let currentRecords = [];
    let currentResults = [];
    let currentFilter = 'all';

    // 拖拽事件监听
    const dropArea = document.getElementById('dropArea');
    ['dragenter', 'dragover'].forEach(e => dropArea.addEventListener(e, (ev) => { ev.preventDefault(); dropArea.style.borderColor = '#0f766e'; }));
    ['dragleave', 'drop'].forEach(e => dropArea.addEventListener(e, (ev) => { ev.preventDefault(); dropArea.style.borderColor = '#cbd5e1'; }));
    dropArea.addEventListener('drop', (ev) => {
      ev.preventDefault();
      const files = Array.from(ev.dataTransfer.files);
      if (files.length > 0) processFiles(files);
    });

    function handleFileSelect(e) {
      const files = Array.from(e.target.files);
      if (files.length > 0) processFiles(files);
      e.target.value = '';
    }

    // 跨文件/跨Sheet通过身份证自动合并
    async function processFiles(files) {
      const allTables = [];
      for (const file of files) {
        const data = new Uint8Array(await file.arrayBuffer());
        const wb = XLSX.read(data, { type: 'array' });
        for (const sheetName of wb.SheetNames) {
          const json = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });
          if (json.length > 0) allTables.push({ name: file.name + ' - ' + sheetName, rows: json });
        }
      }

      if (allTables.length === 0) return alert('未读取到有效数据行');

      // 找身份证键
      const idKws = ['身份证', '身份证号', '证件号', '居民身份证'];
      const mergedMap = new Map();

      for (const t of allTables) {
        const idCol = Object.keys(t.rows[0]).find(c => idKws.some(k => c.toLowerCase().includes(k)));
        for (const row of t.rows) {
          const idVal = idCol ? String(row[idCol] || '').trim() : '';
          const key = idVal || ('REC_' + Math.random());
          if (!mergedMap.has(key)) mergedMap.set(key, { '身份证': idVal });
          const ex = mergedMap.get(key);
          for (const [col, val] of Object.entries(row)) {
            if (val !== '' && val !== null && val !== undefined) ex[col] = val;
          }
        }
      }

      const mergedRows = Array.from(mergedMap.values());
      currentRecords = mergedRows;
      runScreening();
      alert('已成功加载 ' + mergedRows.length + ' 名居民数据并完成自动筛查！');
    }

    // 数值解析
    function pNum(v) {
      if (v === undefined || v === null || v === '') return undefined;
      const c = String(v).replace(/[^0-9.-]/g, '');
      const n = parseFloat(c);
      return isNaN(n) ? undefined : n;
    }

    // 身份证年龄性别解析
    function parseIdCard(id) {
      if (!id || id.length !== 18) return null;
      const y = parseInt(id.substring(6, 10));
      const m = parseInt(id.substring(10, 12));
      const d = parseInt(id.substring(12, 14));
      const g = parseInt(id.substring(16, 17)) % 2 === 1 ? '男' : '女';
      const age = new Date().getFullYear() - y;
      return { gender: g, age: Math.max(0, age) };
    }

    // 11项判定核心
    function runScreening() {
      currentResults = currentRecords.map((r, idx) => {
        const findVal = (kws) => {
          for (const k of Object.keys(r)) {
            const norm = k.replace(/[\\s_()（）\\[\\]]/g, '').toLowerCase();
            if (kws.some(kw => norm.includes(kw))) return r[k];
          }
          return '';
        };

        const idCard = String(findVal(['身份证', '证件号'])).trim();
        const idMeta = parseIdCard(idCard);
        let name = String(findVal(['姓名', 'name'])).trim();
        if (!name) name = idCard ? ('居民(尾号' + idCard.slice(-4) + ')') : ('居民' + (idx + 1));
        const gender = String(findVal(['性别'])).trim() || (idMeta ? idMeta.gender : '-');
        const age = pNum(findVal(['年龄'])) || (idMeta ? idMeta.age : 65);
        const phone = String(findVal(['电话', '手机'])).trim();
        const chronic = String(findVal(['慢病', '既往史'])).trim();
        const symp = String(findVal(['症状', '现存症状'])).trim();

        let sbp = pNum(findVal(['收缩压', '高压']));
        let dbp = pNum(findVal(['舒张压', '低压']));
        const bpComb = String(findVal(['血压']));
        if ((!sbp || !dbp) && bpComb) {
          const m = bpComb.match(/(\\d{2,3})[\\/／-](\\d{2,3})/);
          if (m) { sbp = parseInt(m[1]); dbp = parseInt(m[2]); }
        }

        const isHyp = /高血压/.test(chronic) || (sbp && sbp >= 140);
        const isDia = /糖尿病/.test(chronic);

        const hits = [];

        // 1. 血压
        if (sbp && sbp >= 180) hits.push({ id: 1, label: '血压危象', detail: '收缩压 ' + sbp + ' mmHg(≥180)', crit: true });
        if (dbp && dbp >= 110) hits.push({ id: 1, label: '血压危象', detail: '舒张压 ' + dbp + ' mmHg(≥110)', crit: true });

        // 2. 血糖
        const fbg = pNum(findVal(['血糖', '空腹血糖']));
        if (fbg !== undefined) {
          if (fbg <= 3.9) hits.push({ id: 2, label: '低血糖高危', detail: '血糖 ' + fbg + ' mmol/L(≤3.9)', crit: true });
          if (fbg >= 16.7) hits.push({ id: 2, label: '极高血糖危象', detail: '血糖 ' + fbg + ' mmol/L(≥16.7)', crit: true });
        }

        // 3. 肝功
        const tbil = pNum(findVal(['总胆红素']));
        const alt = pNum(findVal(['谷丙转氨酶', '谷丙']));
        const ast = pNum(findVal(['谷草转氨酶', '谷草']));
        if (tbil && tbil > 34.2) hits.push({ id: 3, label: '总胆红素异常', detail: 'TBIL ' + tbil + ' μmol/L' });
        if (alt && alt > 80) hits.push({ id: 3, label: 'ALT明显异常', detail: 'ALT ' + alt + ' U/L' });
        if (ast && ast > 80) hits.push({ id: 3, label: 'AST明显异常', detail: 'AST ' + ast + ' U/L' });

        // 4. 血脂分层
        const tg = pNum(findVal(['甘油三酯']));
        const tc = pNum(findVal(['总胆固醇']));
        const ldl = pNum(findVal(['低密度脂蛋白']));
        if (isHyp && isDia && ldl && ldl >= 1.8) hits.push({ id: 4, label: '双慢病LDL未达标', detail: 'LDL-C ' + ldl + ' mmol/L(≥1.8)' });
        if (isHyp && tg && tg >= 5.2) hits.push({ id: 4, label: '高血压TG异常', detail: 'TG ' + tg + ' mmol/L(≥5.2)' });
        if (isHyp && ldl && ldl > 3.4) hits.push({ id: 4, label: '高血压LDL异常', detail: 'LDL ' + ldl + ' mmol/L(>3.4)' });
        if (tg && tg >= 5.6) hits.push({ id: 4, label: '甘油三酯异常', detail: 'TG ' + tg + ' mmol/L(≥5.6)' });
        if (tc && tc >= 7.2) hits.push({ id: 4, label: '总胆固醇异常', detail: 'TC ' + tc + ' mmol/L(≥7.2)' });
        if (ldl && ldl >= 4.9) hits.push({ id: 4, label: 'LDL异常', detail: 'LDL ' + ldl + ' mmol/L(≥4.9)' });

        // 5. 心电图
        const ecg = String(findVal(['心电图']));
        const hasSymp = /胸痛|胸闷|心悸|心慌/.test(symp);
        const hasEcg = /心肌梗死|Q波|ST-T|快速房颤|三度房室|传导阻滞/.test(ecg);
        if (hasSymp && hasEcg) hits.push({ id: 5, label: '心血管危急征象', detail: '胸痛胸闷/心悸 + 心电图异常', crit: true });

        // 6. 肾功
        const cr = pNum(findVal(['血清肌酐', '肌酐']));
        const bun = pNum(findVal(['血尿素氮', '尿素氮']));
        if (cr && cr >= 124) hits.push({ id: 6, label: '血肌酐异常', detail: '肌酐 ' + cr + ' μmol/L(≥124)' });
        if (bun && bun > 9.0) hits.push({ id: 6, label: '尿素氮异常', detail: '尿素氮 ' + bun + ' mmol/L(>9.0)' });

        // 7. 血常规
        const hgb = pNum(findVal(['血红蛋白']));
        const wbc = pNum(findVal(['白细胞']));
        const plt = pNum(findVal(['血小板']));
        if (hgb && hgb < 90) hits.push({ id: 7, label: '中重度贫血', detail: 'Hb ' + hgb + ' g/L(<90)' });
        if (wbc && (wbc > 10.0 || wbc < 4.0)) hits.push({ id: 7, label: '白细胞异常', detail: 'WBC ' + wbc });
        if (plt && (plt < 50 || plt > 300)) hits.push({ id: 7, label: '血小板异常', detail: 'PLT ' + plt });

        // 8. 尿常规
        const up = String(findVal(['尿蛋白']));
        const ur = String(findVal(['尿红细胞']));
        const ub = String(findVal(['尿潜血', '尿隐血']));
        const uk = String(findVal(['尿酮体']));
        const isPos = s => /\\+|阳性|[1-4]\\+/.test(s);
        if (isPos(up)) hits.push({ id: 8, label: '尿蛋白阳性', detail: '尿蛋白 ' + up });
        if (isPos(ur)) hits.push({ id: 8, label: '尿红细胞阳性', detail: '尿红细胞 ' + ur });
        if (isPos(ub)) hits.push({ id: 8, label: '尿潜血阳性', detail: '尿潜血 ' + ub });
        if (isPos(up) && isPos(uk)) hits.push({ id: 8, label: '尿蛋白+酮体阳性', detail: '蛋白与酮体均阳性' });

        // 9. 超声所见
        const us = String(findVal(['超声所见', '超声', 'b超']));
        if (/重度脂肪肝/.test(us)) hits.push({ id: 9, label: '重度脂肪肝', detail: '超声提示重度脂肪肝' });
        if (/占位性病变|占位|恶性肿瘤/.test(us) && !/未见|无.*占位/.test(us)) hits.push({ id: 9, label: 'B超占位病变', detail: '超声提示占位性病变', crit: true });
        if (/肝囊肿.*[5-9]\\d*mm|肝囊肿.*[5-9]cm/.test(us)) hits.push({ id: 9, label: '肝囊肿≥5cm', detail: '超声提示肝囊肿≥5cm' });
        if (/肾囊肿.*[5-9]\\d*mm|肾囊肿.*[5-9]cm/.test(us)) hits.push({ id: 9, label: '肾囊肿≥5cm', detail: '超声提示肾囊肿≥5cm' });
        if (/胆囊息肉.*1[0-9]mm|胆囊息肉.*1(\\.\\d+)?cm/.test(us)) hits.push({ id: 9, label: '胆囊息肉≥1cm', detail: '超声提示胆囊息肉≥1.0cm' });

        // 10. 胸部DR
        const dr = String(findVal(['胸部dr', '胸片']));
        if (/占位|肿块/.test(dr) && !/未见|无/.test(dr)) hits.push({ id: 10, label: '胸部DR占位', detail: '胸片提示占位性病变', crit: true });

        // 11. 尿酸
        const ua = pNum(findVal(['尿酸']));
        if (ua && ua >= 420) hits.push({ id: 11, label: '高尿酸血症', detail: '尿酸 ' + ua + ' μmol/L(≥420)' });

        return {
          name, idCard, gender, age, phone, chronic, sbp, dbp, fbg, alt, ast, tg, ldl, cr, ua,
          hits, hasPos: hits.length > 0, hasCrit: hits.some(h => h.crit)
        };
      });

      renderKPIs();
      renderTable();
    }

    function renderKPIs() {
      const tot = currentResults.length;
      const pos = currentResults.filter(r => r.hasPos).length;
      const crit = currentResults.filter(r => r.hasCrit).length;
      const multi = currentResults.filter(r => r.hits.length >= 2).length;
      document.getElementById('statTotal').innerText = tot;
      document.getElementById('statPositive').innerText = pos;
      document.getElementById('statPosRate').innerText = '检出率 ' + (tot > 0 ? ((pos/tot)*100).toFixed(1) : 0) + '%';
      document.getElementById('statCritical').innerText = crit;
      document.getElementById('statMulti').innerText = multi;
    }

    function setFilter(f) {
      currentFilter = f;
      document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
      if (f === 'all') document.getElementById('segAll').classList.add('active');
      if (f === 'pos') document.getElementById('segPos').classList.add('active');
      if (f === 'crit') document.getElementById('segCrit').classList.add('active');
      renderTable();
    }

    function renderTable() {
      const q = document.getElementById('searchBox').value.trim().toLowerCase();
      const tbody = document.getElementById('tableBody');
      const filtered = currentResults.filter(r => {
        if (currentFilter === 'pos' && !r.hasPos) return false;
        if (currentFilter === 'crit' && !r.hasCrit) return false;
        if (q) {
          const match = r.name.toLowerCase().includes(q) || r.idCard.toLowerCase().includes(q) || r.chronic.toLowerCase().includes(q) || r.hits.some(h => h.detail.toLowerCase().includes(q));
          if (!match) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:32px; color:#94a3b8;">暂无符合条件的体检记录</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map((r, i) => {
        const hitsHtml = r.hits.length === 0 
          ? '<span class="tag-norm">未见11项异常</span>'
          : r.hits.map(h => '<span class="rule-chip" title="' + h.detail + '">[' + h.id + '项] ' + h.label + '</span>').join('');

        const triage = r.hasCrit ? '<span class="tag-crit">危急重症</span>' : (r.hits.length >= 2 ? '<span class="tag-high">多项高危</span>' : (r.hasPos ? '<span class="tag-high">常规阳性</span>' : '<span class="tag-norm">指标正常</span>'));

        return '<tr>' +
          '<td style="text-align:center;" class="mono">' + (i + 1) + '</td>' +
          '<td><strong>' + r.name + '</strong><br><span style="font-size:11px; color:#64748b;" class="mono">' + (r.idCard || '-') + '</span></td>' +
          '<td>' + r.gender + ' · ' + r.age + '岁</td>' +
          '<td>' + hitsHtml + '</td>' +
          '<td style="text-align:right;" class="mono">' + (r.sbp && r.dbp ? (r.sbp + '/' + r.dbp) : '-') + '</td>' +
          '<td style="text-align:right;" class="mono">' + (r.fbg !== undefined ? r.fbg : '-') + '</td>' +
          '<td style="text-align:right;" class="mono">' + (r.alt || '-') + '/' + (r.ast || '-') + '</td>' +
          '<td style="text-align:right;" class="mono">' + (r.tg || '-') + '/' + (r.ldl || '-') + '</td>' +
          '<td style="text-align:right;" class="mono">' + (r.cr || '-') + '/' + (r.ua || '-') + '</td>' +
          '<td style="text-align:center;">' + triage + '</td>' +
        '</tr>';
      }).join('');
    }

    // 导出【姓名+异常项】精简名单 Excel
    function exportNameAndAnomalies() {
      const positives = currentResults.filter(r => r.hasPos);
      if (positives.length === 0) return alert('当前没有筛查出阳性体征记录，无需导出！');

      const data = positives.map((r, i) => ({
        '序号': i + 1,
        '姓名': r.name,
        '身份证号': r.idCard || '-',
        '性别': r.gender,
        '年龄': r.age,
        '联系电话': r.phone || '-',
        '慢病史': r.chronic || '-',
        '检出异常项汇总 (姓名加异常项核心列)': r.hits.map(h => '[' + h.id + '项 ' + h.label + '] ' + h.detail).join('；\\n'),
        '异常项总数': r.hits.length,
        '风险分级': r.hasCrit ? '危急重症' : (r.hits.length >= 2 ? '多项高危' : '常规阳性'),
        '建议处置': r.hasCrit ? '立即启动专科/急诊绿色通道转诊' : '建议门诊随访复查并调整用药'
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      ws['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 22 }, { wch: 6 }, { wch: 6 }, { wch: 15 }, { wch: 15 }, { wch: 60 }, { wch: 10 }, { wch: 12 }, { wch: 30 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '姓名加异常项清单');
      XLSX.writeFile(wb, '老年人体检阳性体征_姓名加异常项清单.xlsx');
    }

    // 导出全项表
    function exportAllExcel() {
      if (currentResults.length === 0) return alert('请先导入体检表数据！');
      const data = currentResults.map((r, i) => ({
        '序号': i + 1,
        '姓名': r.name,
        '身份证号': r.idCard || '-',
        '性别': r.gender,
        '年龄': r.age,
        '状态': r.hasPos ? '阳性异常' : '未见异常',
        '命中项数': r.hits.length,
        '异常明细': r.hits.map(h => h.detail).join('；'),
        '收缩压': r.sbp || '-',
        '舒张压': r.dbp || '-',
        '血糖': r.fbg || '-',
        '甘油三酯': r.tg || '-',
        '低密度脂蛋白': r.ldl || '-'
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '全项体检筛查表');
      XLSX.writeFile(wb, '老年人体检全项筛查汇总表.xlsx');
    }

    // 复制清单文本
    function copyTableText() {
      const positives = currentResults.filter(r => r.hasPos);
      if (positives.length === 0) return alert('当前没有筛查出阳性体征记录！');
      const lines = positives.map((r, i) => (i + 1) + '. ' + r.name + ' (' + r.gender + ', ' + r.age + '岁, 身份证:' + r.idCard + ')：' + r.hits.map(h => '[' + h.id + '项 ' + h.label + ': ' + h.detail + ']').join('；'));
      const text = '【老年人体检阳性体征清单 (共' + positives.length + '人)】\\n' + lines.join('\\n');
      navigator.clipboard.writeText(text);
      alert('已将 ' + positives.length + ' 位阳性人员的【姓名+异常项】复制到剪贴板，可直接粘贴！');
    }

    // 粘贴网页表格
    function pasteTableData() { document.getElementById('pasteModal').classList.add('open'); }
    function closePasteModal() { document.getElementById('pasteModal').classList.remove('open'); }
    function doParsePaste() {
      const t = document.getElementById('pasteText').value.trim();
      if (!t) return alert('请先粘贴网页表格内容！');
      const lines = t.split(/\\r?\\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) return alert('请至少包含表头与1行数据！');
      const delim = lines[0].includes('\\t') ? '\\t' : (lines[0].includes(',') ? ',' : ';');
      const cols = lines[0].split(delim).map(c => c.trim().replace(/^["']|["']$/g, ''));
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(delim).map(v => v.trim().replace(/^["']|["']$/g, ''));
        const obj = {};
        cols.forEach((c, idx) => obj[c] = vals[idx] !== undefined ? vals[idx] : '');
        rows.push(obj);
      }
      currentRecords = rows;
      runScreening();
      closePasteModal();
      alert('成功从剪贴板解析 ' + rows.length + ' 行体检数据！');
    }
  </script>
</body>
</html>`;

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/offline.html', offlineHtmlContent, 'utf-8');
console.log('Successfully generated public/offline.html with inlined SheetJS! File size:', fs.statSync('public/offline.html').size, 'bytes');
