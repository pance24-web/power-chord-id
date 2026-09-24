import React from 'react';
import { WifiOff, HardDriveDownload } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-800 dark:text-amber-200 px-4 py-2 text-xs flex items-center justify-between font-medium backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <WifiOff className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
        <span>
          <strong>Mode Offline Aktif</strong> &mdash; Anda tetap dapat mengakses lagu tersimpan &amp; favorit secara offline tanpa kuota internet.
        </span>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] bg-amber-500/20 px-2 py-0.5 rounded-full shrink-0 font-bold">
        <HardDriveDownload className="w-3.5 h-3.5" />
        Tersimpan Lokal
      </div>
    </div>
  );
};
