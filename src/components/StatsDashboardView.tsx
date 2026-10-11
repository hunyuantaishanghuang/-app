import React from 'react';
import { ScreeningResult } from '../types/health';
import { RULE_DEFINITIONS } from '../utils/ruleEngine';
import { BarChart3, AlertOctagon, Heart, Activity, CheckCircle, FileSpreadsheet, ArrowRight } from 'lucide-react';

interface StatsDashboardViewProps {
  results: ScreeningResult[];
  onSelectRule: (ruleId: number) => void;
  onSwitchToTable: () => void;
}

export const StatsDashboardView: React.FC<StatsDashboardViewProps> = ({
  results,
  onSelectRule,
  onSwitchToTable,
}) => {
  const total = results.length;
  const positiveResults = results.filter((r) => r.hasPositive);
  const positiveCount = positiveResults.length;
  const normalCount = total - positiveCount;
  const criticalCount = results.filter((r) => r.criticalCount > 0).length;
  const multiCount = results.filter((r) => r.ruleHits.length >= 2).length;

  // 双慢病统计
  const dualPatients = results.filter((r) => r.record.isHypertension && r.record.isDiabetes);
  const dualLdlNotMet = dualPatients.filter((r) => r.record.ldl !== undefined && r.record.ldl >= 1.8);

  // 单项规则统计与排序
  const ruleStats = React.useMemo(() => {
    return RULE_DEFINITIONS.map((rule) => {
      const hits = results.filter((r) => r.ruleHits.some((h) => h.ruleId === rule.id));
      const count = hits.length;
      const rate = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
      return {
        ...rule,
        count,
        rate: parseFloat(rate),
      };
    }).sort((a, b) => b.count - a.count);
  }, [results, total]);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              老年人健康管理体检阳性体征筛查综合统计报告
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              样本库总计 <span className="font-mono font-semibold text-slate-800">{total}</span> 名老年人体检记录 · 检出阳性{' '}
              <span className="font-mono font-semibold text-amber-700">{positiveCount}</span> 人 (
              {total > 0 ? ((positiveCount / total) * 100).toFixed(1) : 0}%)
            </p>
          </div>
          <button
            onClick={onSwitchToTable}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <span>返回花名册查看名单</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Proportion Blocks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">总体检参检人数</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">{total} 人</div>
            <div className="text-[11px] text-slate-400 mt-1">100% 参检建档基数</div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200">
            <span className="text-xs text-amber-900 block font-medium">阳性体征筛出率</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-800 mt-1">
              {total > 0 ? ((positiveCount / total) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-[11px] text-amber-700 mt-1">共 {positiveCount} 人命中至少1项</div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200">
            <span className="text-xs text-rose-900 block font-medium">危急重症预警率</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-rose-600 mt-1">
              {total > 0 ? ((criticalCount / total) * 100).toFixed(1) : 0}%
            </div>
            <div className="text-[11px] text-rose-700 mt-1">共 {criticalCount} 人需立即转诊干预</div>
          </div>

          <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200">
            <span className="text-xs text-teal-900 block font-medium">双慢病LDL未达标</span>
            <div className="text-2xl font-bold font-mono tabular-nums text-teal-800 mt-1">
              {dualLdlNotMet.length} 人
            </div>
            <div className="text-[11px] text-teal-700 mt-1">
              双患共 {dualPatients.length} 人 (LDL≥1.8 占比 {dualPatients.length > 0 ? ((dualLdlNotMet.length / dualPatients.length) * 100).toFixed(0) : 0}%)
            </div>
          </div>
        </div>
      </div>

      {/* 11 Rules Prevalence Ranking */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-800" />
            <h3 className="text-sm font-bold text-slate-900">11项体检异常检出顺位排行榜</h3>
          </div>
          <span className="text-xs text-slate-400">点击任意横条可快速筛选对应受检人名单</span>
        </div>

        <div className="space-y-3">
          {ruleStats.map((item, idx) => {
            const percent = total > 0 ? (item.count / total) * 100 : 0;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectRule(item.id);
                  onSwitchToTable();
                }}
                className="group p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-teal-700 group-hover:text-white text-slate-600 font-mono text-[11px] font-bold flex items-center justify-center transition-colors">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800 group-hover:text-teal-950 transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      ({item.criteria})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                      {item.count} <span className="text-xs font-normal text-slate-500">人</span>
                    </span>
                    <span className="font-mono tabular-nums text-xs text-slate-500 w-12 text-right">
                      {item.rate}%
                    </span>
                  </div>
                </div>

                {/* Progress track */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.tag.includes('危急') ? 'bg-rose-500' : 'bg-teal-700'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(percent > 0 ? percent : 0, 2))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Public Health Recommendations Block */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h4 className="font-bold text-xs text-slate-900 mb-2 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span>危急高危人群随访管理建议</span>
          </h4>
          <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <li>
              • <strong className="text-slate-800">高血压危象（收缩压≥180或舒张压≥110）：</strong>
              纳入高危随访专档，立即安排家庭医生上门或电话追踪复核，防止发生脑出血或急性心力衰竭。
            </li>
            <li>
              • <strong className="text-slate-800">血糖极值（≤3.9或≥16.7mmol/L）：</strong>
              低血糖者需指导急救糖块备用及胰岛素/磺脲类药物剂量重审；高血糖危象者限期复查尿酮体和糖化血红蛋白。
            </li>
            <li>
              • <strong className="text-slate-800">心血管危急征象（胸痛/胸闷/心悸 + 心电图重大异常）：</strong>
              建立医联体双向转诊绿色通道，指导家属常备急救药物，紧急转诊心内科。
            </li>
            <li>
              • <strong className="text-slate-800">胸部DR/腹部B超占位性病变：</strong>
              重点肿瘤可疑人群建卡追踪，催促1周内行高精度CT/MRI排查并记录确诊结果。
            </li>
          </ul>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h4 className="font-bold text-xs text-slate-900 mb-2 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-teal-700" />
            <span>慢病合并与血脂分层干预重点</span>
          </h4>
          <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <li>
              • <strong className="text-slate-800">高血压伴糖尿病双患人群：</strong>
              按照国家心血管病风险分层，此类人群为极高危，低密度脂蛋白（LDL-C）必须降至1.8mmol/L以下，本批检出未达标率较高，需强化他汀药物联合治疗。
            </li>
            <li>
              • <strong className="text-slate-800">肾功能异常（肌酐≥124或尿素氮&gt;9）：</strong>
              筛查高血压肾损害及糖尿病肾病，评估常用降压降糖药物的肾脏排泄安全性，减量或停用肾毒性药物。
            </li>
            <li>
              • <strong className="text-slate-800">高尿酸血症（尿酸≥420μmol/L）：</strong>
              结合痛风发作史与肾结石超声结果综合评估，倡导生活方式干预并注意避免诱发心血管并发症。
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
