import React, { useState } from 'react';
import { RuleThresholds } from '../types/health';
import { DEFAULT_THRESHOLDS } from '../utils/ruleEngine';
import { X, RotateCcw, Check } from 'lucide-react';

interface RuleConfigModalProps {
  isOpen: boolean;
  currentThresholds: RuleThresholds;
  onSave: (thresholds: RuleThresholds) => void;
  onClose: () => void;
}

export const RuleConfigModal: React.FC<RuleConfigModalProps> = ({
  isOpen,
  currentThresholds,
  onSave,
  onClose,
}) => {
  const [form, setForm] = useState<RuleThresholds>(currentThresholds);

  if (!isOpen) return null;

  const handleChange = (key: keyof RuleThresholds, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setForm((prev) => ({ ...prev, [key]: num }));
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_THRESHOLDS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">阳性体征判定阈值参数设置</h2>
            <p className="text-xs text-slate-500 mt-0.5">默认严格遵循您指定的11项标准，可根据当地机构规范微调</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* BP & Sugar */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800 pb-1 border-b border-slate-100">①、② 血压与血糖阈值</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-medium block">收缩压上限 (mmHg)</label>
                <input
                  type="number"
                  value={form.sbpMax}
                  onChange={(e) => handleChange('sbpMax', e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block">舒张压上限 (mmHg)</label>
                <input
                  type="number"
                  value={form.dbpMax}
                  onChange={(e) => handleChange('dbpMax', e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block">空腹血糖下限 (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.fbgMin}
                  onChange={(e) => handleChange('fbgMin', e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block">空腹血糖上限 (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.fbgMax}
                  onChange={(e) => handleChange('fbgMax', e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Liver & Lipid */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800 pb-1 border-b border-slate-100">③、④ 肝功与血脂分层</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-700 font-medium block">总胆红素上限 (μmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.tbilMax}
                  onChange={(e) => handleChange('tbilMax', e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block">ALT 谷丙上限 (U/L)</label>
                <input
                  type="number"
                  value={form.altMax}
                  onChange={(e) => handleChange('altMax', e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block">AST 谷草上限 (U/L)</label>
                <input
                  type="number"
                  value={form.astMax}
                  onChange={(e) => handleChange('astMax', e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-slate-700 font-medium block">普通人甘油三酯 (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.generalTgMax}
                  onChange={(e) => handleChange('generalTgMax', e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block">普通人总胆固醇 (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.generalTcMax}
                  onChange={(e) => handleChange('generalTcMax', e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block">普通人 LDL-C (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.generalLdlMax}
                  onChange={(e) => handleChange('generalLdlMax', e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block">高血压患者 TG (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.hypTgMax}
                  onChange={(e) => handleChange('hypTgMax', e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block">高血压患者 LDL (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.hypLdlMax}
                  onChange={(e) => handleChange('hypLdlMax', e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block text-teal-800">双慢病患者 LDL (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.dualLdlMax}
                  onChange={(e) => handleChange('dualLdlMax', e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-teal-400 font-mono text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none bg-teal-50/20"
                />
              </div>
            </div>
          </div>

          {/* Kidney & Blood & Uric Acid */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-800 pb-1 border-b border-slate-100">⑥、⑦、⑪ 肾功、血常规与尿酸</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-700 font-medium block">肌酐 Cr (μmol/L)</label>
                <input
                  type="number"
                  value={form.crMax}
                  onChange={(e) => handleChange('crMax', e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block">尿素氮 BUN (mmol/L)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.bunMax}
                  onChange={(e) => handleChange('bunMax', e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block">尿酸 UA (μmol/L)</label>
                <input
                  type="number"
                  value={form.uaMax}
                  onChange={(e) => handleChange('uaMax', e.target.value)}
                  className="w-full mt-1 p-2 rounded border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置为默认标准</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={() => {
                onSave(form);
                onClose();
              }}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>保存并重新筛查</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
