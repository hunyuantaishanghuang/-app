import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Laptop, DownloadCloud } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall();

  // 若已经以独立应用模式运行，则无需重复提示安装
  if (isInstalled) {
    return (
      <span className="hidden lg:inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-teal-800 bg-teal-50 border border-teal-200 rounded-md">
        <Laptop className="w-3.5 h-3.5 text-teal-700" />
        <span>桌面离线模式</span>
      </span>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <button
      onClick={installPWA}
      title="一键安装到电脑桌面，断网离线也能从桌面图标秒开运行！"
      className="px-2.5 py-1.5 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
    >
      <DownloadCloud className="w-3.5 h-3.5 text-teal-700" />
      <span>安装到桌面</span>
    </button>
  );
};
