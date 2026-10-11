import React, { useState, useMemo } from 'react';
import { ScreeningResult } from '../types/health';
import { RULE_DEFINITIONS } from '../utils/ruleEngine';
import { Search, Download, Eye, AlertCircle, CheckCircle2, ChevronRight, X, Copy, Check } from 'lucide-react';

interface RosterTableProps {
  results: ScreeningResult[];
  activeRuleFilter: number | null;
  onSelectRule: (ruleId: number | null) => void;
  onViewRecord: (item: ScreeningResult) => void;
  onExportExcel: (type: 'positive_only' | 'all') => void;
  onExportNameAndAnomalies: () => void;
}

export const RosterTable: React.FC<RosterTableProps> = ({
  results,
  activeRuleFilter,
  onSelectRule,
  onViewRecord,
  onExportExcel,
  onExportNameAndAnomalies,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'positive' | 'critical' | 'normal'>('all');
  const [sortField, setSortField] = useState<'hits' | 'name' | 'age'>('hits');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [copiedText, setCopiedText] = useState(false);

  // 复制当前阳性名单的【姓名+异常项】文本到剪贴板
  const handleCopyNameAndAnomalies = () => {
    const positives = filteredResults.filter((r) => r.hasPositive);
    if (positives.length === 0) return;

    const lines = positives.map((item, idx) => {
      const details = item.ruleHits.map((h) => `${h.ruleId}项[${h.shortLabel}: ${h.details.join(',')}]`).join('；');
      return `${idx + 1}. ${item.record.name} (${item.record.gender || '-'}, ${item.record.age || '-'}岁, 电话:${item.record.phone || '-'})：${details}`;
    });

    const fullText = `【老年人健康管理体检阳性体征 - 姓名与异常项清单 (共${positives.length}人)】\n` + lines.join('\n');
    navigator.clipboard.writeText(fullText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // 过滤逻辑
  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      // 1. 文本搜索
      if (searchTerm.trim()) {
        const query = searchTerm.trim().toLowerCase();
        const nameMatch = item.record.name?.toLowerCase().includes(query);
        const phoneMatch = item.record.phone?.includes(query);
        const diseaseMatch = item.record.chronicDiseases?.toLowerCase().includes(query);
        const symptomsMatch = item.record.symptoms?.toLowerCase().includes(query);
        const hitMatch = item.ruleHits.some((h) => h.shortLabel.toLowerCase().includes(query) || h.ruleName.toLowerCase().includes(query));
        if (!nameMatch && !phoneMatch && !diseaseMatch && !symptomsMatch && !hitMatch) {
          return false;
        }
      }

      // 2. 状态标签过滤
      if (filterMode === 'positive' && !item.hasPositive) return false;
      if (filterMode === 'critical' && item.criticalCount === 0) return false;
      if (filterMode === 'normal' && item.hasPositive) return false;

      // 3. 特殊负数或单项规则ID过滤
      if (activeRuleFilter === -1) {
        if (!item.hasPositive) return false;
      } else if (activeRuleFilter === -2) {
        if (item.criticalCount === 0) return false;
      } else if (activeRuleFilter === -3) {
        if (item.ruleHits.length < 2) return false;
      } else if (activeRuleFilter !== null && activeRuleFilter > 0) {
        if (!item.ruleHits.some((h) => h.ruleId === activeRuleFilter)) return false;
      }

      return true;
    });
  }, [results, searchTerm, filterMode, activeRuleFilter]);

  // 排序
  const sortedResults = useMemo(() => {
    return [...filteredResults].sort((a, b) => {
      if (sortField === 'hits') {
        const diff = a.ruleHits.length - b.ruleHits.length;
        return sortOrder === 'desc' ? -diff : diff;
      }
      if (sortField === 'age') {
        const diff = (a.record.age || 0) - (b.record.age || 0);
        return sortOrder === 'desc' ? -diff : diff;
      }
      if (sortField === 'name') {
        return sortOrder === 'desc'
          ? b.record.name.localeCompare(a.record.name, 'zh-Hans-CN')
          : a.record.name.localeCompare(b.record.name, 'zh-Hans-CN');
      }
      return 0;
    });
  }, [filteredResults, sortField, sortOrder]);

  const activeRuleName = useMemo(() => {
    if (!activeRuleFilter || activeRuleFilter <= 0) return null;
    return RULE_DEFINITIONS.find((r) => r.id === activeRuleFilter)?.title || null;
  }, [activeRuleFilter]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Control Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Search & Segmented Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索姓名 / 手机 / 慢病 / 症状 / 异常"
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-700 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Filter Control */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => {
                setFilterMode('all');
                onSelectRule(null);
              }}
              className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                filterMode === 'all' && activeRuleFilter === null
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部 ({results.length})
            </button>
            <button
              onClick={() => {
                setFilterMode('positive');
                onSelectRule(null);
              }}
              className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                filterMode === 'positive' || activeRuleFilter === -1
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              仅阳性 ({results.filter((r) => r.hasPositive).length})
            </button>
            <button
              onClick={() => {
                setFilterMode('critical');
                onSelectRule(null);
              }}
              className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                filterMode === 'critical' || activeRuleFilter === -2
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              危急重症 ({results.filter((r) => r.criticalCount > 0).length})
            </button>
            <button
              onClick={() => {
                setFilterMode('normal');
                onSelectRule(null);
              }}
              className={`px-3 py-1 font-medium rounded-md transition-colors cursor-pointer ${
                filterMode === 'normal'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              正常指标
            </button>
          </div>

          {/* Active Specific Rule Badge Filter */}
          {activeRuleName && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-md text-xs text-teal-800">
              <span className="font-medium">筛选项: {activeRuleName}</span>
              <button
                onClick={() => onSelectRule(null)}
                className="hover:text-teal-950 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Sort controls & Export action */}
        <div className="flex items-center gap-2">
          {/* Sort By Hits */}
          <select
            value={`${sortField}-${sortOrder}`}
            onChange={(e) => {
              const [f, o] = e.target.value.split('-') as any;
              setSortField(f);
              setSortOrder(o);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
          >
            <option value="hits-desc">异常项数 (从多到少)</option>
            <option value="hits-asc">异常项数 (从少到多)</option>
            <option value="age-desc">年龄 (从高到低)</option>
            <option value="age-asc">年龄 (从低到高)</option>
            <option value="name-asc">姓名 (拼音顺序)</option>
          </select>

          {/* Export & Copy Buttons */}
          <button
            onClick={onExportNameAndAnomalies}
            title="直接导出仅包含【姓名+异常项清单+电话】的精简Excel文件"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出【姓名+异常项】</span>
          </button>

          <button
            onClick={handleCopyNameAndAnomalies}
            title="一键复制当前阳性人员的【姓名+异常项】文本列表"
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText ? '已复制清单' : '复制清单文本'}</span>
          </button>

          <button
            onClick={() => onExportExcel('positive_only')}
            title="导出全部指标包含阳性标注的花名册"
            className="px-2.5 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-amber-700" />
            <span>导出全项阳性表</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <th className="py-3 px-3 w-12 text-center">序号</th>
              <th className="py-3 px-4 min-w-[130px]">体检居民</th>
              <th className="py-3 px-3 min-w-[130px]">既往慢病 / 症状</th>
              <th className="py-3 px-4 min-w-[240px]">阳性体征判定 (11项)</th>
              <th className="py-3 px-3 text-right">血压(高/低)</th>
              <th className="py-3 px-3 text-right">血糖</th>
              <th className="py-3 px-3 text-right">肝功ALT/AST</th>
              <th className="py-3 px-3 text-right">血脂(TG/LDL)</th>
              <th className="py-3 px-3 min-w-[100px]">心电图</th>
              <th className="py-3 px-3 text-right">肌酐/尿酸</th>
              <th className="py-3 px-3 text-center w-24">分层预警</th>
              <th className="py-3 px-3 text-center w-20">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {sortedResults.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">未检索到匹配的体检记录</p>
                    <p className="text-xs text-slate-400">请尝试更换筛选条件或清除搜索关键字</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedResults.map((item, idx) => {
                const { record, ruleHits, hasPositive, criticalCount } = item;
                const isSelectedRow = false;

                return (
                  <tr
                    key={record.id || idx}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      hasPositive ? (criticalCount > 0 ? 'bg-rose-50/20' : '') : ''
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3 px-3 text-center font-mono tabular-nums text-slate-400 text-xs">
                      {idx + 1}
                    </td>

                    {/* Resident Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 text-sm">{record.name}</span>
                        <span className="text-[11px] text-slate-500">
                          {record.gender} · {record.age}岁
                        </span>
                      </div>
                      {record.phone && (
                        <div className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5">
                          {record.phone}
                        </div>
                      )}
                    </td>

                    {/* Chronic diseases & symptoms */}
                    <td className="py-3 px-3">
                      <div className="text-xs font-medium text-slate-800 line-clamp-1">
                        {record.chronicDiseases || '无明确既往史'}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {record.symptoms ? `症状: ${record.symptoms}` : '无自述症状'}
                      </div>
                    </td>

                    {/* Rule Hits List */}
                    <td className="py-3 px-4">
                      {ruleHits.length === 0 ? (
                        <div className="flex items-center gap-1 text-teal-700 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>未见11项阳性指征</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {ruleHits.map((hit) => {
                            const isCrit = hit.level === 'critical';
                            return (
                              <button
                                key={hit.ruleId}
                                onClick={() => onSelectRule(hit.ruleId)}
                                title={hit.details.join('；')}
                                className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors cursor-pointer text-left ${
                                  isCrit
                                    ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                }`}
                              >
                                {hit.ruleId}项 {hit.shortLabel}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* Blood Pressure */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {record.sbp !== undefined && record.dbp !== undefined ? (
                        <span
                          className={
                            record.sbp >= 180 || record.dbp >= 110
                              ? 'text-rose-600 font-bold'
                              : record.sbp >= 140 || record.dbp >= 90
                              ? 'text-amber-700 font-medium'
                              : 'text-slate-700'
                          }
                        >
                          {record.sbp}/{record.dbp}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* FBG Blood Sugar */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {record.fbg !== undefined ? (
                        <span
                          className={
                            record.fbg <= 3.9 || record.fbg >= 16.7
                              ? 'text-rose-600 font-bold'
                              : record.fbg >= 7.0
                              ? 'text-amber-700 font-medium'
                              : 'text-slate-700'
                          }
                        >
                          {record.fbg}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Liver ALT / AST */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {record.alt !== undefined || record.ast !== undefined ? (
                        <span
                          className={
                            (record.alt && record.alt > 80) || (record.ast && record.ast > 80)
                              ? 'text-amber-800 font-bold'
                              : 'text-slate-700'
                          }
                        >
                          {record.alt ?? '-'}/{record.ast ?? '-'}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Lipids TG / LDL */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {record.tg !== undefined || record.ldl !== undefined ? (
                        <span
                          className={
                            (record.tg && record.tg >= 5.6) || (record.ldl && record.ldl >= 4.9)
                              ? 'text-amber-800 font-bold'
                              : 'text-slate-700'
                          }
                        >
                          {record.tg ?? '-'}/{record.ldl ?? '-'}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* ECG */}
                    <td className="py-3 px-3">
                      <span
                        className="text-[11px] truncate block max-w-[120px] text-slate-700"
                        title={record.ecgResult}
                      >
                        {record.ecgResult || '-'}
                      </span>
                    </td>

                    {/* Cr / Uric Acid */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      <span
                        className={
                          (record.cr && record.cr >= 124) || (record.uricAcid && record.uricAcid >= 420)
                            ? 'text-amber-800 font-medium'
                            : 'text-slate-700'
                        }
                      >
                        {record.cr ?? '-'}/{record.uricAcid ?? '-'}
                      </span>
                    </td>

                    {/* Triage / Level */}
                    <td className="py-3 px-3 text-center">
                      {criticalCount > 0 ? (
                        <span className="inline-block text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          危急重症
                        </span>
                      ) : ruleHits.length >= 2 ? (
                        <span className="inline-block text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          多项高危
                        </span>
                      ) : ruleHits.length === 1 ? (
                        <span className="inline-block text-[11px] text-amber-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                          单项异常
                        </span>
                      ) : (
                        <span className="inline-block text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          指标正常
                        </span>
                      )}
                    </td>

                    {/* Action button */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onViewRecord(item)}
                        className="px-2.5 py-1 text-xs text-teal-800 hover:text-white hover:bg-teal-700 border border-teal-600 rounded transition-colors inline-flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>详情</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span>共显示 {sortedResults.length} 条记录</span>
          <span>·</span>
          <span>其中检出阳性 {sortedResults.filter((r) => r.hasPositive).length} 人</span>
          <span>·</span>
          <span>危急预警 {sortedResults.filter((r) => r.criticalCount > 0).length} 人</span>
        </div>
        <div className="text-[11px] text-slate-400">
          点击“详情”可调出完整体检报告与打印随访转诊通知书
        </div>
      </div>
    </div>
  );
};
