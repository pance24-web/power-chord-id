import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, ShieldCheck } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-amber-500 text-white shadow-2xl backdrop-blur-md border border-amber-400/50 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200 no-print"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
      </span>
      <WifiOff className="w-4 h-4 shrink-0" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 leading-tight">
        <span className="font-bold">Mode Offline Aktif</span>
        <span className="text-amber-100 text-[11px] sm:text-xs">
          • Chord favorit tetap bisa diakses tanpa internet
        </span>
      </div>
    </aside>
  );
};
