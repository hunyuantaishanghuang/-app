import React, { useState } from 'react';
import { ColumnMapping } from '../types/health';
import { X, Check, ArrowRight, HelpCircle } from 'lucide-react';

interface ColumnMappingModalProps {
  isOpen: boolean;
  columns: string[];
  initialMapping: ColumnMapping;
  rowCount: number;
  fileName: string;
  onConfirm: (mapping: ColumnMapping) => void;
  onCancel: () => void;
}

export const ColumnMappingModal: React.FC<ColumnMappingModalProps> = ({
  isOpen,
  columns,
  initialMapping,
  rowCount,
  fileName,
  onConfirm,
  onCancel,
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>(initialMapping);

  if (!isOpen) return null;

  const handleChange = (field: keyof ColumnMapping, value: string) => {
    setMapping((prev) => ({ ...prev, [field]: value }));
  };

  const fieldsConfig: {
    category: string;
    items: { key: keyof ColumnMapping; label: string; desc: string; required?: boolean }[];
  }[] = [
    {
      category: '基础与病史 (必填/重要)',
      items: [
        { key: 'idCard', label: '身份证号 (主键关联)', desc: '可作为唯一关联主键，并自动推导性别与年龄' },
        { key: 'name', label: '姓名', desc: '体检居民姓名 (若无姓名列可留空，自动用身份证号代指)' },
        { key: 'gender', label: '性别', desc: '若无此列，系统从18位身份证号自动识别男/女' },
        { key: 'age', label: '年龄', desc: '若无此列，系统从18位身份证号自动计算实足年龄' },
        { key: 'phone', label: '联系电话', desc: '手机号或座机' },
        { key: 'chronicDiseases', label: '既往慢病史', desc: '高血压、糖尿病等诊断史(用于血脂分层)' },
        { key: 'symptoms', label: '现存症状', desc: '胸痛、胸闷、心悸等主诉' },
      ],
    },
    {
      category: '血压与血糖 (①、②项)',
      items: [
        { key: 'sbp', label: '收缩压 (高压)', desc: '≥180mmHg 预警' },
        { key: 'dbp', label: '舒张压 (低压)', desc: '≥110mmHg 预警' },
        { key: 'bpCombined', label: '血压合并列 (选填)', desc: '若表格为"140/90"格式可绑定此项' },
        { key: 'fbg', label: '空腹血糖', desc: '≤3.9 或 ≥16.7mmol/L 预警' },
      ],
    },
    {
      category: '肝功与血脂 (③、④项)',
      items: [
        { key: 'tbil', label: '总胆红素 TBIL', desc: '>34.2μmol/L' },
        { key: 'alt', label: '谷丙转氨酶 ALT', desc: '＞80U/L' },
        { key: 'ast', label: '谷草转氨酶 AST', desc: '＞80U/L' },
        { key: 'tg', label: '甘油三酯 TG', desc: '≥5.6 (高血压患者≥5.2)' },
        { key: 'tc', label: '总胆固醇 TC', desc: '≥7.2mmol/L' },
        { key: 'ldl', label: '低密度脂蛋白 LDL-C', desc: '≥4.9 (高血压>3.4, 双患≥1.8)' },
      ],
    },
    {
      category: '心电图与肾功 (⑤、⑥项)',
      items: [
        { key: 'ecgResult', label: '心电图结论/描述', desc: '陈旧心梗/病理Q波/ST-T改变/快速房颤/三度阻滞' },
        { key: 'cr', label: '血肌酐 Cr', desc: '≥124μmol/L' },
        { key: 'bun', label: '尿素氮 BUN', desc: '＞9mmol/L' },
      ],
    },
    {
      category: '血常规与尿常规 (⑦、⑧项)',
      items: [
        { key: 'hgb', label: '血红蛋白 Hb', desc: '＜90g/L' },
        { key: 'wbc', label: '白细胞 WBC', desc: '＞10 或 ＜4×10^9/L' },
        { key: 'plt', label: '血小板 PLT', desc: '＜50 或 ＞300×10^9/L' },
        { key: 'urineProtein', label: '尿蛋白 PRO', desc: '≥1+' },
        { key: 'urineRBC', label: '尿红细胞 RBC', desc: '≥1+' },
        { key: 'urineOccultBlood', label: '尿潜血 BLD', desc: '≥1+' },
        { key: 'urineKetone', label: '尿酮体 KET', desc: '与尿蛋白同时≥1+' },
      ],
    },
    {
      category: '影像与尿酸 (⑨、⑩、⑪项)',
      items: [
        { key: 'ultrasoundResult', label: '腹部B超结论', desc: '重度脂肪肝/肝肾囊肿≥5cm/息肉≥1cm/占位' },
        { key: 'chestDrResult', label: '胸部DR结论', desc: '胸部占位性病变/肿块' },
        { key: 'uricAcid', label: '血尿酸 UA', desc: '≥420μmol/L' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">数据列映射确认 (Column Mapping)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              文件: <span className="font-medium text-slate-700">{fileName}</span> · 检测到{' '}
              <span className="font-mono font-medium text-teal-700">{rowCount}</span> 行体检数据，系统已自动完成智能匹配，请核对。
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {fieldsConfig.map((group) => (
            <div key={group.category} className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-800 pb-1 border-b border-slate-100">
                {group.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.items.map((item) => {
                  const currentValue = mapping[item.key] || '';
                  const isMapped = Boolean(currentValue);

                  return (
                    <div
                      key={item.key}
                      className={`p-2.5 rounded-lg border transition-colors ${
                        isMapped ? 'border-teal-200 bg-teal-50/30' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-medium text-slate-800 flex items-center gap-1">
                          {item.label}
                          {item.required && <span className="text-rose-500">*</span>}
                        </label>
                        <span className="text-[10px] text-slate-400" title={item.desc}>
                          {item.desc}
                        </span>
                      </div>
                      <select
                        value={currentValue}
                        onChange={(e) => handleChange(item.key, e.target.value)}
                        className={`w-full mt-1 px-2.5 py-1.5 rounded border text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 ${
                          isMapped ? 'border-teal-500 text-teal-950 font-medium' : 'border-slate-300 text-slate-500'
                        }`}
                      >
                        <option value="">-- 未对应 / 不导入 --</option>
                        {columns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>如花名册中部分项目未检查（如未查尿酸或未做DR），保留“未对应”即可正常筛查其余项</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={() => onConfirm(mapping)}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>应用映射并开始筛查</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
