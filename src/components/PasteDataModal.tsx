import React, { useState } from 'react';
import { X, ClipboardPaste, ArrowRight } from 'lucide-react';
import { parseClipboardTableText, autoDetectMapping } from '../utils/excelParser';
import { ColumnMapping } from '../types/health';

interface PasteDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataParsed: (columns: string[], rows: any[], mapping: ColumnMapping) => void;
}

export const PasteDataModal: React.FC<PasteDataModalProps> = ({ isOpen, onClose, onDataParsed }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleParse = () => {
    setError('');
    if (!text.trim()) {
      setError('请先在下方输入框中粘贴公卫系统网页复制的内容');
      return;
    }

    try {
      const { columns, rows } = parseClipboardTableText(text);
      if (columns.length === 0 || rows.length === 0) {
        setError('无法识别表格数据，请确保复制了表头行以及至少一行体检数据');
        return;
      }

      const mapping = autoDetectMapping(columns);
      onDataParsed(columns, rows, mapping);
      onClose();
    } catch (err: any) {
      setError('数据解析失败，请检查复制的内容格式');
    }
  };

  const handleQuickPaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText);
      }
    } catch (e) {
      // 浏览器权限限制时提示手动 Ctrl+V
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <ClipboardPaste className="w-5 h-5 text-teal-800" />
            <div>
              <h2 className="text-base font-bold text-slate-900">从公卫网页直接复制粘贴体检数据</h2>
              <p className="text-xs text-slate-500">无需下载 Excel 文件，网页表格直接划选复制即可秒级识别</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 leading-relaxed">
            <span className="font-semibold">操作指引：</span>
            在您打开的公共卫生管理平台或HIS系统网页中，用鼠标直接框选体检花名册表格（务必包含表头首行），按{' '}
            <kbd className="px-1.5 py-0.5 bg-white border border-teal-300 rounded text-[11px] font-mono">Ctrl + C</kbd>{' '}
            复制，然后在此框内按{' '}
            <kbd className="px-1.5 py-0.5 bg-white border border-teal-300 rounded text-[11px] font-mono">Ctrl + V</kbd>{' '}
            粘贴。
          </div>

          <div className="flex justify-between items-center">
            <label className="font-medium text-slate-700">粘贴内容区 (制表符/文本表格)：</label>
            <button
              onClick={handleQuickPaste}
              className="text-xs text-teal-700 hover:text-teal-900 font-medium cursor-pointer"
            >
              尝试从剪贴板读取
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`支持无姓名、无性别，仅有【身份证】与体检项目的表：
例如粘贴格式 1（血常规）：
身份证	血红蛋白	白细胞	血小板	红细胞数目
110101195203151234	82	11.5	45	3.2

例如格式 2（生化/超声）：
身份证	血糖	谷丙转氨酶	总胆红素	超声所见
110101195203151234	17.2	92	40.5	重度脂肪肝，肝囊肿5.5cm

系统会自动根据身份证推算年龄与性别，并生成姓名加异常项清单！`}
            rows={10}
            className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-700 bg-slate-50 focus:bg-white resize-none"
          />

          {error && <div className="text-xs text-rose-600 font-medium">{error}</div>}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">支持包含制表符 Tab、逗号 CSV 的文本</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg cursor-pointer"
            >
              取消
            </button>
            <button
              onClick={handleParse}
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>立即解析筛查</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
