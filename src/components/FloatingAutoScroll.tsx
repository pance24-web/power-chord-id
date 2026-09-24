import React from 'react';
import { Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';

interface FloatingAutoScrollProps {
  isScrolling: boolean;
  speed: number;
  onToggle: () => void;
  onSpeedChange: (speed: number) => void;
}

export const FloatingAutoScroll: React.FC<FloatingAutoScrollProps> = ({
  isScrolling,
  speed,
  onToggle,
  onSpeedChange,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full shadow-2xl p-1.5 gap-2 no-print transition-all hover:scale-105">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 pl-3 pr-4 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${
          isScrolling
            ? 'bg-amber-500 text-white shadow-md animate-pulse'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-amber-500 hover:text-white'
        }`}
      >
        {isScrolling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        <span>{isScrolling ? 'Pause Scroll' : 'Auto Scroll'}</span>
      </button>

      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-1 gap-1">
        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 w-7 text-center">
          {speed.toFixed(1)}x
        </span>
        <div className="flex flex-col">
          <button
            onClick={() => onSpeedChange(Math.min(3.0, Number((speed + 0.25).toFixed(2))))}
            disabled={speed >= 3.0}
            className="text-slate-500 hover:text-amber-500 disabled:opacity-30 cursor-pointer"
            title="Tambah Kecepatan"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => onSpeedChange(Math.max(0.5, Number((speed - 0.25).toFixed(2))))}
            disabled={speed <= 0.5}
            className="text-slate-500 hover:text-amber-500 disabled:opacity-30 cursor-pointer"
            title="Kurang Kecepatan"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
