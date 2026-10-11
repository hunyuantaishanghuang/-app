import React from 'react';
import { ScreeningResult } from '../types/health';
import { RULE_DEFINITIONS } from '../utils/ruleEngine';
import { AlertTriangle, Users, Activity, FileCheck2 } from 'lucide-react';

interface StatsCardsProps {
  results: ScreeningResult[];
  activeRuleFilter: number | null;
  onSelectRule: (ruleId: number | null) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  results,
  activeRuleFilter,
  onSelectRule,
}) => {
  const total = results.length;
  const positiveCount = results.filter((r) => r.hasPositive).length;
  const positiveRate = total > 0 ? ((positiveCount / total) * 100).toFixed(1) : '0.0';
  const criticalCount = results.filter((r) => r.criticalCount > 0).length;
  const multiPositiveCount = results.filter((r) => r.ruleHits.length >= 2).length;

  // 统计每条规则的命中人数
  const ruleCounts = React.useMemo(() => {
    const counts: Record<number, number> = {};
    for (const r of RULE_DEFINITIONS) {
      counts[r.id] = 0;
    }
    for (const res of results) {
      for (const hit of res.ruleHits) {
        counts[hit.ruleId] = (counts[hit.ruleId] || 0) + 1;
      }
    }
    return counts;
  }, [results]);

  return (
    <div className="space-y-4">
      {/* 4 Core Quantitative Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Screened */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">总体检人次</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">{total}</span>
            <span className="text-xs text-slate-500">人</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            花名册全量导入记录
          </div>
        </div>

        {/* Total Positives */}
        <div
          onClick={() => onSelectRule(activeRuleFilter === -1 ? null : -1)}
          className={`bg-white p-4 rounded-xl border transition-colors cursor-pointer ${
            activeRuleFilter === -1 ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">检出阳性体征</span>
            <FileCheck2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-700">{positiveCount}</span>
            <span className="text-xs text-slate-500">人 ({positiveRate}%)</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium">
            含①~⑪中任意一项异常
          </div>
        </div>

        {/* Critical Cases */}
        <div
          onClick={() => onSelectRule(activeRuleFilter === -2 ? null : -2)}
          className={`bg-white p-4 rounded-xl border transition-colors cursor-pointer ${
            activeRuleFilter === -2 ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">危急重症预警</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-600">{criticalCount}</span>
            <span className="text-xs text-slate-500">人</span>
          </div>
          <div className="mt-2 text-xs text-rose-600 font-medium">
            血压危象/极值血糖/胸痛心电/占位
          </div>
        </div>

        {/* Multi-Positive / High Risk */}
        <div
          onClick={() => onSelectRule(activeRuleFilter === -3 ? null : -3)}
          className={`bg-white p-4 rounded-xl border transition-colors cursor-pointer ${
            activeRuleFilter === -3 ? 'border-teal-600 ring-1 ring-teal-600' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">多重阳性合并管理</span>
            <Activity className="w-4 h-4 text-teal-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-teal-800">{multiPositiveCount}</span>
            <span className="text-xs text-slate-500">人</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            同时合并 ≥2 项异常需综合随访
          </div>
        </div>
      </div>

      {/* 11 Rule Distribution Bar Grid */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-800">11项体检异常检出分布与快捷筛选</h3>
            <span className="text-xs text-slate-500 hidden sm:inline">（点击单项直接精准过滤查看对应人员名单）</span>
          </div>
          {activeRuleFilter !== null && (
            <button
              onClick={() => onSelectRule(null)}
              className="text-xs text-teal-700 hover:text-teal-900 font-medium cursor-pointer"
            >
              清除单项筛选
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {RULE_DEFINITIONS.map((rule) => {
            const count = ruleCounts[rule.id] || 0;
            const isSelected = activeRuleFilter === rule.id;
            return (
              <button
                key={rule.id}
                onClick={() => onSelectRule(isSelected ? null : rule.id)}
                className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-teal-700 bg-teal-50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-800 truncate" title={rule.title}>
                    {rule.title.split(' ')[0]} {rule.title.split(' ')[1]}
                  </span>
                  <span
                    className={`text-xs font-bold font-mono tabular-nums px-1.5 py-0.5 rounded ${
                      count > 0 ? (isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-800') : 'text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1" title={rule.criteria}>
                  {rule.criteria}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
