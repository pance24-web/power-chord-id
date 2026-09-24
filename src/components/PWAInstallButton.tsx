import React from 'react';
import { Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, triggerInstall } = usePWAInstall();

  if (!isInstallable) return null;

  return (
    <button
      onClick={triggerInstall}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-full text-xs font-bold shadow-sm transition-all hover:shadow-md cursor-pointer animate-pulse"
      title="Install PowerChord ke HP atau Desktop"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Install App</span>
    </button>
  );
};
