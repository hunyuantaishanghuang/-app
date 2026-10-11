import React, { useRef } from 'react';
import { ScreeningResult } from '../types/health';
import { X, Printer, Copy, Check, AlertTriangle, FileText, Heart, Activity } from 'lucide-react';

interface PatientDetailModalProps {
  item: ScreeningResult | null;
  onClose: () => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!item) return null;
  const { record, ruleHits, hasPositive, criticalCount } = item;

  // 生成随访告知书文本
  const generateNoticeText = () => {
    const hitsText = ruleHits.map((h, i) => `${i + 1}. [第${h.ruleId}项] ${h.ruleName}：${h.details.join('；')}`).join('\n');
    return `【国家基本公共卫生服务 - 老年人健康管理体检阳性体征随访告知书】
受检居民：${record.name}   性别：${record.gender || '-'}   年龄：${record.age}岁
联系电话：${record.phone || '-'}
体检日期：${new Date().toLocaleDateString('zh-CN')}

一、体检筛查阳性体征发现：
${hitsText || '本次体检未发现上述11项重点阳性体征指标。'}

二、分层处置与就医建议：
${
  criticalCount > 0
    ? '【危急重症预警】检测到属于心脑血管危象、极值血糖、心电图急性/危急改变或占位性病变，请立即前往上级综合医院专科门诊进一步明确诊断或急诊处置，切勿拖延！'
    : ruleHits.length > 0
    ? '【重点异常随访】体检指标存在异常，建议在1~2周内携带本次体检结果前往社区卫生服务中心全科门诊或综合医院专科复查，遵医嘱规范服药或生活方式干预。'
    : '【指标基本正常】请继续保持健康饮食、规律作息与适度运动，建议每年定期参加国家免费老年人体检。'
}

主检医师 / 责任公卫医师：__________
签约家庭医生团队电话：__________
发放日期：${new Date().toLocaleDateString('zh-CN')}`;
  };

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(generateNoticeText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-base">
              {record.name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{record.name}</h2>
                <span className="text-xs text-slate-500">
                  {record.gender} · {record.age}岁
                </span>
                {criticalCount > 0 ? (
                  <span className="px-2 py-0.5 text-[11px] font-bold text-rose-700 bg-rose-100 rounded">
                    危急重症
                  </span>
                ) : hasPositive ? (
                  <span className="px-2 py-0.5 text-[11px] font-semibold text-amber-800 bg-amber-100 rounded">
                    检出 {ruleHits.length} 项阳性
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[11px] font-medium text-teal-800 bg-teal-100 rounded">
                    指标未见异常
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                慢病史: {record.chronicDiseases || '无记录'} · 电话: {record.phone || '未登记'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div ref={printRef} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: Matched Positive Rules Alert */}
          {hasPositive ? (
            <div
              className={`p-4 rounded-xl border ${
                criticalCount > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle
                  className={`w-4 h-4 ${criticalCount > 0 ? 'text-rose-600' : 'text-amber-700'}`}
                />
                <h3
                  className={`font-bold text-sm ${
                    criticalCount > 0 ? 'text-rose-900' : 'text-amber-900'
                  }`}
                >
                  老年人健康管理体检表阳性体征筛查发现（共命中 {ruleHits.length} 项标准）：
                </h3>
              </div>
              <div className="space-y-2 mt-2">
                {ruleHits.map((hit) => (
                  <div
                    key={hit.ruleId}
                    className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-xs">
                        第 {hit.ruleId} 项：{hit.ruleName}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          hit.level === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {hit.level === 'critical' ? '危急指标' : '重点随访'}
                      </span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 pl-1">
                      {hit.details.map((d, i) => (
                        <li key={i} className="text-slate-800 font-medium">
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900">
              <h3 className="font-semibold text-sm">本次体检未触及11项重点阳性体征预警标准</h3>
              <p className="mt-1 text-slate-600">
                各项生理生化数值均未达到老年人高危阳性体征门槛值，建议继续保持健康生活方式，并按公卫计划每年进行常规复查。
              </p>
            </div>
          )}

          {/* Section 2: Complete Examination Metrics Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-900 pb-1 border-b border-slate-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-800" />
              <span>全项体检检测指标详情对照表</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* BP */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">血压 (收缩压/舒张压)</span>
                <span
                  className={`text-sm font-bold font-mono tabular-nums ${
                    (record.sbp && record.sbp >= 180) || (record.dbp && record.dbp >= 110)
                      ? 'text-rose-600'
                      : 'text-slate-900'
                  }`}
                >
                  {record.sbp ?? '-'} / {record.dbp ?? '-'} mmHg
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">标准: ≥180 或 ≥110 预警</span>
              </div>

              {/* FBG */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">空腹血糖 FBG</span>
                <span
                  className={`text-sm font-bold font-mono tabular-nums ${
                    record.fbg !== undefined && (record.fbg <= 3.9 || record.fbg >= 16.7)
                      ? 'text-rose-600'
                      : 'text-slate-900'
                  }`}
                >
                  {record.fbg !== undefined ? `${record.fbg} mmol/L` : '-'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">标准: ≤3.9 或 ≥16.7 预警</span>
              </div>

              {/* Liver: TBIL */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">总胆红素 TBIL</span>
                <span
                  className={`text-sm font-bold font-mono tabular-nums ${
                    record.tbil !== undefined && record.tbil > 34.2 ? 'text-amber-800' : 'text-slate-900'
                  }`}
                >
                  {record.tbil !== undefined ? `${record.tbil} μmol/L` : '-'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">标准: &gt;34.2 异常</span>
              </div>

              {/* Liver: ALT & AST */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">转氨酶 ALT / AST</span>
                <span
                  className={`text-sm font-bold font-mono tabular-nums ${
                    (record.alt && record.alt > 80) || (record.ast && record.ast > 80)
                      ? 'text-amber-800'
                      : 'text-slate-900'
                  }`}
                >
                  {record.alt ?? '-'} / {record.ast ?? '-'} U/L
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">标准: 均 ＞80U/L 异常</span>
              </div>

              {/* Lipids: TG */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">甘油三酯 TG</span>
                <span
                  className={`text-sm font-bold font-mono tabular-nums ${
                    record.tg !== undefined && record.tg >= 5.2 ? 'text-amber-800' : 'text-slate-900'
                  }`}
                >
                  {record.tg !== undefined ? `${record.tg} mmol/L` : '-'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">高血压≥5.2 / 常规≥5.6</span>
              </div>

              {/* Lipids: LDL */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">低密度脂蛋白 LDL-C</span>
                <span
                  className={`text-sm font-bold font-mono tabular-nums ${
                    record.ldl !== undefined && record.ldl >= 1.8 ? 'text-amber-800' : 'text-slate-900'
                  }`}
                >
                  {record.ldl !== undefined ? `${record.ldl} mmol/L` : '-'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">双患≥1.8 / 血压&gt;3.4 / 常规≥4.9</span>
              </div>

              {/* Renal: Cr & BUN */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">肾功能 肌酐 / 尿素氮</span>
                <span
                  className={`text-sm font-bold font-mono tabular-nums ${
                    (record.cr && record.cr >= 124) || (record.bun && record.bun > 9.0)
                      ? 'text-amber-800'
                      : 'text-slate-900'
                  }`}
                >
                  {record.cr ?? '-'} μmol / {record.bun ?? '-'} mmol
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">肌酐≥124 或 尿素氮&gt;9.0</span>
              </div>

              {/* Blood Routine: Hb, WBC, PLT */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">血常规 Hb / WBC / PLT</span>
                <span className="text-xs font-bold font-mono tabular-nums text-slate-900">
                  {record.hgb ?? '-'}/{record.wbc ?? '-'}/{record.plt ?? '-'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Hb&lt;90 / WBC&gt;10或&lt;4 / PLT&lt;50或&gt;300</span>
              </div>

              {/* Uric Acid */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">血尿酸 UA</span>
                <span
                  className={`text-sm font-bold font-mono tabular-nums ${
                    record.uricAcid !== undefined && record.uricAcid >= 420 ? 'text-amber-800' : 'text-slate-900'
                  }`}
                >
                  {record.uricAcid !== undefined ? `${record.uricAcid} μmol/L` : '-'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">标准: ≥420μmol/L 异常</span>
              </div>
            </div>

            {/* Qualitative Inspections */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-slate-700 block">心电图描述与诊断：</span>
                  <p className="text-slate-900 mt-0.5 bg-white p-2 rounded border border-slate-200">
                    {record.ecgResult || '未查或无记录'}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block">尿常规四项检出：</span>
                  <p className="text-slate-900 mt-0.5 bg-white p-2 rounded border border-slate-200">
                    蛋白: {record.urineProtein || '-'} ；红细胞: {record.urineRBC || '-'} ；潜血: {record.urineOccultBlood || '-'} ；酮体: {record.urineKetone || '-'}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block">腹部B超结论：</span>
                  <p className="text-slate-900 mt-0.5 bg-white p-2 rounded border border-slate-200">
                    {record.ultrasoundResult || '未查或无记录'}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block">胸部DR结论：</span>
                  <p className="text-slate-900 mt-0.5 bg-white p-2 rounded border border-slate-200">
                    {record.chestDrResult || '未查或无记录'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            已遵循《国家基本公共卫生服务规范（第三版）》老年人健康管理体检标准
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyNotice}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制告知单' : '复制随访告知文案'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印随访单</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
