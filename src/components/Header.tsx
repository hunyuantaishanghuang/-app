import React from 'react';
import { FileSpreadsheet, Download, HelpCircle, SlidersHorizontal, RefreshCw, ClipboardPaste, Terminal, HardDrive, FolderArchive } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onUploadClick: () => void;
  onOpenPasteModal: () => void;
  onOpenPyModal: () => void;
  onDownloadTemplate: () => void;
  onDownloadOfflineHtml: () => void;
  onDownloadZip: () => void;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onResetDemoData: () => void;
  activeView: 'table' | 'stats' | 'rules';
  setActiveView: (view: 'table' | 'stats' | 'rules') => void;
  hasCustomData: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onUploadClick,
  onOpenPasteModal,
  onOpenPyModal,
  onDownloadTemplate,
  onDownloadOfflineHtml,
  onDownloadZip,
  onOpenGuide,
  onOpenSettings,
  onResetDemoData,
  activeView,
  setActiveView,
  hasCustomData,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                老年人体检阳性体征筛查系统
              </span>
              <p className="text-xs text-slate-500 hidden sm:block">国家基本公卫规范 · 11项体征精准筛查与分层管理</p>
            </div>
          </div>

          {/* Zone 2: Concise navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveView('table')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                activeView === 'table' ? 'text-teal-800 font-semibold border-b-2 border-teal-700' : ''
              }`}
            >
              体检花名册
            </button>
            <button
              onClick={() => setActiveView('stats')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                activeView === 'stats' ? 'text-teal-800 font-semibold border-b-2 border-teal-700' : ''
              }`}
            >
              筛查统计看板
            </button>
            <button
              onClick={() => setActiveView('rules')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
                activeView === 'rules' ? 'text-teal-800 font-semibold border-b-2 border-teal-700' : ''
              }`}
            >
              11项标准规范
            </button>
          </nav>

          {/* Zone 3: Functional actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <PWAInstallButton />

            {hasCustomData && (
              <button
                onClick={onResetDemoData}
                title="重新载入示范数据"
                className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">载入示范</span>
              </button>
            )}

            <button
              onClick={onOpenPasteModal}
              title="从公卫管理网页直接复制粘贴表格数据"
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden sm:inline">网页复制粘贴</span>
            </button>

            <button
              onClick={onDownloadOfflineHtml}
              title="下载纯离线单文件版HTML（可装U盘带到医院/公卫内网电脑，双击直接使用，0依赖0环境）"
              className="px-2.5 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5 text-teal-700" />
              <span className="hidden sm:inline">下载单文件离线版</span>
            </button>

            <button
              onClick={onDownloadZip}
              title="下载整个项目离线ZIP包（包含所有源代码、配置文件、Python脚本及免安装单文件）"
              className="px-2.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FolderArchive className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden lg:inline">下载整套离线包(.ZIP)</span>
            </button>

            <button
              onClick={onOpenPyModal}
              title="查看无Python环境解决方案与Python脚本"
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Python/免环境方案</span>
            </button>

            <button
              onClick={onDownloadTemplate}
              title="下载标准Excel花名册模板"
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">下载标准模板</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="查看与调整判定阈值"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenGuide}
              title="查看使用指南"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={onUploadClick}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>导入体检表</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
