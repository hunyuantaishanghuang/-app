import React, { useState } from 'react';
import { X, Copy, Check, Download, Terminal, Lightbulb } from 'lucide-react';

interface PythonScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonScriptModal: React.FC<PythonScriptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const pythonScriptCode = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
老年人健康管理体检表阳性体征11项自动化筛查脚本
功能：读取公卫系统导出的Excel花名册，筛查11项阳性体征，导出【姓名加异常项】精简Excel清单。
依赖：pip install pandas openpyxl
"""

import sys
import re
import os
import pandas as pd

def safe_num(val):
    if pd.isna(val) or val is None or str(val).strip() == '':
        return None
    try:
        # 移除非数字和负号小数点的字符
        cleaned = re.sub(r'[^0-9.-]', '', str(val).strip())
        return float(cleaned) if cleaned else None
    except:
        return None

def parse_urine_grade(val):
    if pd.isna(val) or not val:
        return 0
    s = str(val).strip().upper()
    if s in ['阴性', '-', 'NEGATIVE', '0', '+-']:
        return 0
    if '++++' in s or '4+' in s: return 4
    if '+++' in s or '3+' in s: return 3
    if '++' in s or '2+' in s: return 2
    if '+' in s or '1+' in s or '阳性' in s: return 1
    num = safe_num(val)
    return min(4, int(num)) if (num is not None and num >= 1) else 0

def check_cardiac_symptoms(s):
    if pd.isna(s) or not s: return False, []
    keywords = ['胸痛', '胸闷', '心悸', '心慌', '心绞痛', '心前区疼痛']
    matched = [k for k in keywords if k in str(s)]
    return len(matched) > 0, matched

def check_ecg_abnormal(s):
    if pd.isna(s) or not s: return False, []
    keywords = [
        '陈旧性心肌梗死', '心肌梗死', '心梗', '病理性Q波', '病理Q波', 'ST-T改变',
        'ST改变', 'ST段压低', 'ST段抬高', 'T波倒置', '快速房颤', '心房颤动',
        '三度房室传导阻滞', 'Ⅲ度房室传导阻滞', '完全性房室传导阻滞'
    ]
    matched = [k for k in keywords if k in str(s)]
    return len(matched) > 0, matched

def check_ultrasound(s):
    if pd.isna(s) or not s: return False, []
    text = str(s)
    reasons = []
    if '重度脂肪肝' in text:
        reasons.append('重度脂肪肝')
    if re.search(r'(占位性病变|占位病变|占位|恶性肿瘤)', text) and not re.search(r'(未见|无).*占位', text):
        reasons.append('腹部占位性病变')
    
    # 尺寸提取辅助
    def find_sizes(target):
        sizes = []
        for sentence in re.split(r'[；;。，,\n]', text):
            if target in sentence:
                for m in re.finditer(r'(\\d+(\\.\\d+)?)\\s*(cm|厘米)', sentence, re.I):
                    sizes.append(float(m.group(1)))
                for m in re.finditer(r'(\\d+(\\.\\d+)?)\\s*(mm|毫米)', sentence, re.I):
                    sizes.append(float(m.group(1)) / 10.0)
        return sizes

    # 肝囊肿 >= 5cm
    if '肝囊肿' in text:
        sizes = find_sizes('肝囊肿')
        if any(sz >= 5.0 for sz in sizes):
            reasons.append('肝囊肿≥5cm')
        elif not sizes and re.search(r'肝囊肿.*[5-9]\\d*mm|肝囊肿.*[5-9]cm', text):
            reasons.append('肝囊肿≥5cm')

    # 肾囊肿 >= 5cm
    if '肾囊肿' in text or '左肾' in text or '右肾' in text:
        sizes = find_sizes('肾')
        if any(sz >= 5.0 for sz in sizes):
            reasons.append('肾囊肿≥5cm')

    # 胆囊息肉 >= 1.0cm
    if '胆囊息肉' in text:
        sizes = find_sizes('胆囊息肉')
        if any(sz >= 1.0 for sz in sizes):
            reasons.append('胆囊息肉≥1.0cm')

    return len(reasons) > 0, reasons

def check_chest_dr(s):
    if pd.isna(s) or not s: return False, []
    text = str(s)
    if re.search(r'(未见|无).*(占位|肿块)', text):
        return False, []
    if re.search(r'(占位性病变|肺占位|占位病变|肺肿块|肺部肿块|疑似肺癌)', text):
        return True, ['胸部DR占位性病变/肿块']
    return False, []

def screen_files(input_files, output_file=None):
    if not output_file:
        output_file = "老年人阳性体征_姓名与异常项清单.xlsx"

    dfs = []
    for f in input_files:
        print(f"[*] 正在读取体检表格: {f}")
        # 如果是 Excel 且包含多个 sheet
        if f.endswith(('.xlsx', '.xls')):
            xl = pd.ExcelFile(f)
            for sheet in xl.sheet_names:
                df_sheet = pd.read_excel(xl, sheet_name=sheet)
                if not df_sheet.empty:
                    dfs.append((f"{os.path.basename(f)}[{sheet}]", df_sheet))
        else:
            dfs.append((os.path.basename(f), pd.read_csv(f)))

    if not dfs:
        print("[!] 未找到有效表格数据")
        return

    # 跨表自动合并：查找身份证列并 merge
    merged_df = dfs[0][1]
    id_card_kws = ['身份证', '身份证号', '证件号', '居民身份证']

    def get_id_col(d):
        for col in d.columns:
            norm = re.sub(r'[\s_()（）\[\]]', '', str(col)).lower()
            if any(k in norm for k in id_card_kws): return col
        return None

    main_id = get_id_col(merged_df)
    if main_id and len(dfs) > 1:
        print(f"[*] 检测到多个分表/分文件，正在基于【{main_id}】自动关联全部体检项目...")
        for name, sub_df in dfs[1:]:
            sub_id = get_id_col(sub_df)
            if sub_id:
                # 统一列名后 outer join
                merged_df = pd.merge(merged_df, sub_df, left_on=main_id, right_on=sub_id, how='outer', suffixes=('', '_sub'))
    
    df = merged_df

    def find_col(kws):
        for c in df.columns:
            norm = re.sub(r'[\s_()（）\[\]]', '', str(c)).lower()
            for kw in kws:
                target = re.sub(r'[\s_()（）\[\]]', '', str(kw)).lower()
                if target in norm or norm in target:
                    return c
        return None

    # 匹配列（精准匹配公卫系统常见列名）
    c_name = find_col(['姓名', '居民姓名', 'name'])
    c_id = find_col(id_card_kws)
    c_gender = find_col(['性别', 'gender'])
    c_age = find_col(['年龄', 'age'])
    c_phone = find_col(['联系电话', '电话', '手机', 'phone'])
    c_chronic = find_col(['慢病', '既往史', '现病史', '慢病史'])
    c_symptom = find_col(['症状', '现存症状', '主诉'])
    c_sbp = find_col(['收缩压', '高压', 'sbp'])
    c_dbp = find_col(['舒张压', '低压', 'dbp'])
    c_bp_comb = find_col(['血压', 'bp'])
    c_fbg = find_col(['血糖', '空腹血糖', 'fbg', 'glu'])
    c_tbil = find_col(['总胆红素', 'tbil'])
    c_alt = find_col(['谷丙转氨酶', '谷丙', 'alt'])
    c_ast = find_col(['谷草转氨酶', '谷草', 'ast'])
    c_tg = find_col(['甘油三酯', 'tg'])
    c_tc = find_col(['总胆固醇', 'tc', 'chol'])
    c_ldl = find_col(['低密度脂蛋白', 'ldl', 'ldl-c'])
    c_ecg = find_col(['心电图', 'ecg'])
    c_cr = find_col(['血清肌酐', '肌酐', 'cr'])
    c_bun = find_col(['血尿素氮', '尿素氮', 'bun'])
    c_hgb = find_col(['血红蛋白', 'hb', 'hgb'])
    c_wbc = find_col(['白细胞', 'wbc'])
    c_plt = find_col(['血小板', 'plt'])
    c_u_pro = find_col(['尿蛋白', 'pro'])
    c_u_rbc = find_col(['尿红细胞', 'rbc'])
    c_u_bld = find_col(['尿潜血', '尿隐血', 'bld'])
    c_u_ket = find_col(['尿酮体', 'ket'])
    c_us = find_col(['超声所见', '腹部b超', 'b超', '超声'])
    c_dr = find_col(['胸部dr', '胸片', 'dr结论'])
    c_ua = find_col(['尿酸', '血尿酸', 'ua'])

    results = []

    for idx, row in df.iterrows():
        raw_id = str(row[c_id]).strip() if c_id and not pd.isna(row[c_id]) else ''
        name = str(row[c_name]).strip() if c_name and not pd.isna(row[c_name]) else ''
        if not name:
            name = f"居民(尾号{raw_id[-4:]})" if len(raw_id) >= 4 else f"居民{idx+1}"

        gender = str(row[c_gender]).strip() if c_gender and not pd.isna(row[c_gender]) else '-'
        age = safe_num(row[c_age]) if c_age else '-'

        # 若原表无年龄性别，从18位身份证自动反推
        if len(raw_id) == 18 and raw_id[:-1].isdigit():
            if gender == '-':
                gender = '男' if int(raw_id[16]) % 2 == 1 else '女'
            if age == '-':
                age = max(0, 2026 - int(raw_id[6:10]))

        phone = str(row[c_phone]) if c_phone and not pd.isna(row[c_phone]) else '-'
        chronic = str(row[c_chronic]) if c_chronic and not pd.isna(row[c_chronic]) else ''
        symptoms = str(row[c_symptom]) if c_symptom and not pd.isna(row[c_symptom]) else ''

        sbp = safe_num(row[c_sbp]) if c_sbp else None
        dbp = safe_num(row[c_dbp]) if c_dbp else None
        if (sbp is None or dbp is None) and c_bp_comb and not pd.isna(row[c_bp_comb]):
            m = re.search(r'(\\d{2,3})[\\/／-](\\d{2,3})', str(row[c_bp_comb]))
            if m:
                if sbp is None: sbp = float(m.group(1))
                if dbp is None: dbp = float(m.group(2))

        is_hyp = ('高血压' in chronic) or (sbp is not None and sbp >= 140)
        is_dia = ('糖尿病' in chronic)

        hits = []

        # ① 血压
        if sbp is not None and sbp >= 180: hits.append(f"① 血压危象(收缩压{sbp}mmHg)")
        if dbp is not None and dbp >= 110: hits.append(f"① 血压危象(舒张压{dbp}mmHg)")

        # ② 血糖
        fbg = safe_num(row[c_fbg]) if c_fbg else None
        if fbg is not None:
            if fbg <= 3.9: hits.append(f"② 低血糖危急值({fbg}mmol/L)")
            elif fbg >= 16.7: hits.append(f"② 极高血糖危急值({fbg}mmol/L)")

        # ③ 肝功能
        tbil = safe_num(row[c_tbil]) if c_tbil else None
        alt = safe_num(row[c_alt]) if c_alt else None
        ast = safe_num(row[c_ast]) if c_ast else None
        if tbil is not None and tbil > 34.2: hits.append(f"③ 肝功胆红素异常({tbil}μmol/L)")
        if alt is not None and alt > 80: hits.append(f"③ 肝功ALT异常({alt}U/L)")
        if ast is not None and ast > 80: hits.append(f"③ 肝功AST异常({ast}U/L)")

        # ④ 血脂分层
        tg = safe_num(row[c_tg]) if c_tg else None
        tc = safe_num(row[c_tc]) if c_tc else None
        ldl = safe_num(row[c_ldl]) if c_ldl else None
        if is_hyp and is_dia and ldl is not None and ldl >= 1.8:
            hits.append(f"④ 双慢病LDL未达标({ldl}mmol/L≥1.8)")
        if is_hyp:
            if tg is not None and tg >= 5.2: hits.append(f"④ 高血压患者TG异常({tg}mmol/L)")
            if ldl is not None and ldl > 3.4: hits.append(f"④ 高血压患者LDL异常({ldl}mmol/L)")
        if tg is not None and tg >= 5.6: hits.append(f"④ 甘油三酯异常({tg}mmol/L)")
        if tc is not None and tc >= 7.2: hits.append(f"④ 总胆固醇异常({tc}mmol/L)")
        if ldl is not None and ldl >= 4.9: hits.append(f"④ 低密度脂蛋白异常({ldl}mmol/L)")

        # ⑤ 症状+心电图
        symp_ok, _ = check_cardiac_symptoms(symptoms)
        ecg_ok, ecg_matched = check_ecg_abnormal(row[c_ecg] if c_ecg else None)
        if symp_ok and ecg_ok:
            hits.append(f"⑤ 心血管危急征象({'+'.join(ecg_matched)})")

        # ⑥ 肾功
        cr = safe_num(row[c_cr]) if c_cr else None
        bun = safe_num(row[c_bun]) if c_bun else None
        if cr is not None and cr >= 124: hits.append(f"⑥ 肌酐异常({cr}μmol/L)")
        if bun is not None and bun > 9.0: hits.append(f"⑥ 尿素氮异常({bun}mmol/L)")

        # ⑦ 血常规
        hgb = safe_num(row[c_hgb]) if c_hgb else None
        wbc = safe_num(row[c_wbc]) if c_wbc else None
        plt = safe_num(row[c_plt]) if c_plt else None
        if hgb is not None and hgb < 90: hits.append(f"⑦ 中重度贫血(Hb {hgb}g/L)")
        if wbc is not None and (wbc > 10.0 or wbc < 4.0): hits.append(f"⑦ 白细胞异常({wbc})")
        if plt is not None and (plt < 50 or plt > 300): hits.append(f"⑦ 血小板异常({plt})")

        # ⑧ 尿常规
        u_p = parse_urine_grade(row[c_u_pro] if c_u_pro else None)
        u_r = parse_urine_grade(row[c_u_rbc] if c_u_rbc else None)
        u_b = parse_urine_grade(row[c_u_bld] if c_u_bld else None)
        u_k = parse_urine_grade(row[c_u_ket] if c_u_ket else None)
        if u_p >= 1: hits.append(f"⑧ 尿蛋白阳性")
        if u_r >= 1: hits.append(f"⑧ 尿红细胞阳性")
        if u_b >= 1: hits.append(f"⑧ 尿潜血阳性")
        if u_p >= 1 and u_k >= 1: hits.append(f"⑧ 尿蛋白+尿酮体同时阳性")

        # ⑨ 腹部B超
        us_ok, us_reasons = check_ultrasound(row[c_us] if c_us else None)
        if us_ok: hits.append(f"⑨ B超异常({'+'.join(us_reasons)})")

        # ⑩ 胸部DR
        dr_ok, dr_reasons = check_chest_dr(row[c_dr] if c_dr else None)
        if dr_ok: hits.append(f"⑩ 胸部DR占位")

        # ⑪ 尿酸
        ua = safe_num(row[c_ua]) if c_ua else None
        if ua is not None and ua >= 420: hits.append(f"⑪ 高尿酸血症({ua}μmol/L)")

        if hits:
            # 去除重复规则
            hits_unique = list(dict.fromkeys(hits))
            results.append({
                '序号': len(results) + 1,
                '姓名': name,
                '性别': gender,
                '年龄': age,
                '联系电话': phone,
                '慢病史': chronic or '无记录',
                '异常项汇总 (姓名加异常项)': '；\\n'.join(hits_unique),
                '异常项总数': len(hits_unique),
            })

    out_df = pd.DataFrame(results)
    out_df.to_excel(output_file, index=False)
    print(f"[✓] 筛查完成！共发现 {len(results)} 人包含阳性异常项。")
    print(f"[✓] 结果已保存至: {output_file}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("使用说明: python screen_elderly_health.py <表格1.xlsx> [表格2.xlsx ...]")
        print("说明：支持直接传入单个表，或同时传入超声表、生化表、血常规表，程序将基于【身份证】自动跨表联合筛查！")
        sys.exit(1)
    screen_files(sys.argv[1:])
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPy = () => {
    const blob = new Blob([pythonScriptCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screen_elderly_health.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-teal-800" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                对方电脑无 Python 环境的解决方案 & 离线 Python 脚本
              </h2>
              <p className="text-xs text-slate-500">双轨方案：免安装纯浏览器使用 vs 本机 Python 自动化脚本</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Answer to the user's specific scenario */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-slate-800">
            <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>给您的 3 个最佳实用解决方案：</span>
            </div>
            <div className="space-y-2 text-xs leading-relaxed text-slate-700">
              <div className="p-2.5 bg-white rounded-lg border border-amber-100">
                <strong className="text-teal-900">方案 1（最推荐 · 对方电脑 100% 零门槛免安装）：</strong>
                <p className="mt-0.5">
                  对方电脑**不需要任何 Python 或第三方软件环境**！只需把当前系统的**网页链接直接分享给对方**（微信、QQ、浏览器直接打开）。
                  对方把从公卫系统导出的 Excel 往网页里一拖，或者直接在公卫网页上复制表格粘贴进去，点击<strong>「导出【姓名+异常项】」</strong>按钮，1秒钟就能下载好现成的 Excel！数据完全在对方电脑本地浏览器运行，不出网、不泄露居民隐私。
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-amber-100">
                <strong className="text-teal-900">方案 2（在您自己的电脑上用 Python 批量处理）：</strong>
                <p className="mt-0.5">
                  让对方把从公卫系统导出的 Excel 发给您。在您的电脑上运行下方为您写好的 <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">screen_elderly_health.py</code>，只需一行命令：
                  <code className="block my-1 p-1.5 bg-slate-900 text-teal-300 font-mono rounded text-[11px]">
                    python screen_elderly_health.py 2026年体检花名册.xlsx
                  </code>
                  脚本会自动读取并在同目录下生成《2026年体检花名册_阳性体征姓名加异常项清单.xlsx》，发回给对方即可！
                </p>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-amber-100">
                <strong className="text-teal-900">方案 3（在您的电脑打包成 .exe 发给对方双击即用）：</strong>
                <p className="mt-0.5">
                  在您电脑上安装 <code className="bg-slate-100 px-1 rounded font-mono">pip install pyinstaller</code>，执行：
                  <code className="block my-1 p-1.5 bg-slate-900 text-teal-300 font-mono rounded text-[11px]">
                    pyinstaller -F screen_elderly_health.py
                  </code>
                  生成的 <code className="font-mono">screen_elderly_health.exe</code> 是纯单文件，直接发给对方，对方电脑**哪怕完全没有 Python 也能够直接双击运行**！
                </p>
              </div>
            </div>
          </div>

          {/* Python Script Code Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">
                完整独立 Python 脚本代码 (可下载或复制至您电脑)：
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '已复制代码' : '复制脚本'}</span>
                </button>
                <button
                  onClick={handleDownloadPy}
                  className="px-2.5 py-1 text-white bg-teal-800 hover:bg-teal-900 rounded transition-colors flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>下载 .py 脚本文件</span>
                </button>
              </div>
            </div>

            <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed max-h-72">
              {pythonScriptCode}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
