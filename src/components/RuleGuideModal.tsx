import React from 'react';
import { RULE_DEFINITIONS } from '../utils/ruleEngine';
import { X, BookOpen, AlertTriangle, ShieldCheck, HeartPulse } from 'lucide-react';

interface RuleGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RuleGuideModal: React.FC<RuleGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const clinicalGuides = [
    {
      id: 1,
      title: '① 收缩压 ≥ 180mmHg 或 舒张压 ≥ 110mmHg',
      sub: '高血压危象 / 3级极高危高血压',
      urgency: '红色危急',
      action: '需立即休息15~30分钟后复测；排除情绪紧张后若仍居高不下，需立即评估有无靶器官急性损害（头痛、呕吐、胸闷、视物模糊等），启动绿色通道转诊急诊。',
    },
    {
      id: 2,
      title: '② 血糖 ≤ 3.9mmol/L 或 ≥ 16.7mmol/L',
      sub: '低血糖症 / 重度高血糖危急值',
      urgency: '红色危急',
      action: '老年人低血糖（≤3.9）极易诱发心肌梗死、脑卒中或猝死，需立即进食糖水/含糖食物复测；高血糖≥16.7mmol/L需防范高渗性高血糖状态或酮症酸中毒，紧急转诊。',
    },
    {
      id: 3,
      title: '③ 总胆红素 ＞ 34.2μmol/L；ALT ＞ 80U/L；AST ＞ 80U/L',
      sub: '肝功能明显异常 / 活动性肝损伤',
      urgency: '黄色重点',
      action: '提示急性肝细胞损害、梗阻性黄疸或活动性肝病，需排查病毒性肝炎、药物性肝损伤、胆道结石等，建议1~2周内复查肝功并完善肝胆彩超。',
    },
    {
      id: 4,
      title: '④ 血脂分层异常判定标准',
      sub: '普通人 / 高血压 / 双慢病极高危分层',
      urgency: '黄色重点',
      action: '1. 普通人群：TG≥5.6mmol/L 或 TC≥7.2mmol/L 或 LDL-C≥4.9mmol/L；\n2. 高血压患者：TG≥5.2mmol/L 或 LDL-C＞3.4mmol/L；\n3. 高血压+糖尿病双患人群（极高危）：LDL-C≥1.8mmol/L即为未达标异常！需强化降脂药物干预。',
    },
    {
      id: 5,
      title: '⑤ 胸痛胸闷心悸等症状 + 心电图异常',
      sub: '陈旧心梗、病理Q波、ST-T改变、快速房颤、三度房室阻滞等',
      urgency: '红色危急',
      action: '症状合并客观心电图缺血或严重传导障碍，属于心肌缺血/急性冠脉综合征或恶性心律失常高危表现，需立即就近急诊心血管专科处置。',
    },
    {
      id: 6,
      title: '⑥ 肌酐 ≥ 124μmol/L；尿素氮 ＞ 9mmol/L',
      sub: '肾功能损害 / 氮质血症',
      urgency: '黄色重点',
      action: '提示肾小球滤过率下降或慢性肾功能不全（CKD），需避免肾毒性药物，复查内生肌酐清除率，转诊肾内科随访。',
    },
    {
      id: 7,
      title: '⑦ 血常规三系严重异常',
      sub: '血红蛋白＜90g/L；白细胞＞10或＜4×10^9/L；血小板＜50或＞300×10^9/L',
      urgency: '黄色重点',
      action: '中重度贫血、严重感染/骨髓造血抑制或血小板明显减少（极易自发性出血），需复查血常规涂片并转诊血液科排查原因。',
    },
    {
      id: 8,
      title: '⑧ 尿常规异常',
      sub: '尿蛋白≥1+；尿红细胞≥1+；尿潜血≥1+；或尿蛋白与尿酮体同时≥1+',
      urgency: '常规异常',
      action: '蛋白尿与血尿常提示早期慢性肾病、肾炎或糖尿病肾病；尿蛋白+尿酮体同时阳性需警惕糖尿病代谢紊乱饥饿酮症，应复查清洁中段尿。',
    },
    {
      id: 9,
      title: '⑨ 腹部B超重大异常',
      sub: '重度脂肪肝；肝囊肿≥5cm；肾囊肿≥5cm；胆囊息肉≥1.0cm；占位性病变',
      urgency: '重点/危急',
      action: '囊肿≥5cm易发生破裂或压迫；胆囊息肉≥1.0cm恶变率显著升高需外科评估；占位性病变需紧急完善增强CT/MRI排查实质性肿瘤。',
    },
    {
      id: 10,
      title: '⑩ 胸部DR占位性病变',
      sub: '肺部占位性病变 / 肿块 / 疑似恶性肿瘤',
      urgency: '红色危急',
      action: '胸部DR发现肺野占位病变或孤立性肿块影，高度怀疑肺部恶性肿瘤可能，需立即启动专科转诊，尽快行胸部高分辨增强CT。',
    },
    {
      id: 11,
      title: '⑪ 尿酸 ≥ 420μmol/L',
      sub: '高尿酸血症',
      urgency: '常规异常',
      action: '持续高尿酸易诱发痛风发作、尿酸性肾结石并加重动脉硬化，建议低嘌呤饮食、多饮水，必要时遵医嘱启动降尿酸药物。',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-teal-800" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                老年人健康管理体检表阳性体征11项核心标准释义
              </h2>
              <p className="text-xs text-slate-500">依据国家基本公卫体检规范与基层医疗机构慢病分级诊疗处置指南</p>
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
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 leading-relaxed">
            <span className="font-semibold">使用指南：</span>
            本系统严格按照上述11项阳性体征判断标准进行自动化批处理筛查。您只需将含有居民体检数据的花名册（Excel
            .xlsx / .xls 或 CSV）导入系统，系统即刻执行多层条件智能运算，快速标识异常人群、高危人群及双慢病达标情况，支持一键筛选与导出。
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {clinicalGuides.map((item) => (
              <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-xs">{item.title}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        item.urgency.includes('危急')
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {item.urgency}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 mb-2">
                    {item.sub}
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-2 rounded border border-slate-100">
                    {item.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            我已知晓
          </button>
        </div>
      </div>
    </div>
  );
};
