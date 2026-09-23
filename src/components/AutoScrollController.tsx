import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, ChevronsUp, ChevronsDown } from 'lucide-react';

interface AutoScrollControllerProps {
  containerRef?: React.RefObject<HTMLElement | null>;
  isReadingSong: boolean;
}

export const AutoScrollController: React.FC<AutoScrollControllerProps> = ({ isReadingSong }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(2); // 1 to 8
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const scrollIntervalRef = useRef<number | null>(null);

  // Auto scroll effect
  useEffect(() => {
    if (!isPlaying || !isReadingSong) {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
      return;
    }

    const intervalTime = 40; // 25fps smooth scroll
    // scroll step based on speed: speed 1 = 0.5px, speed 4 = 2px, speed 8 = 4px
    const pixelsPerTick = (speed * 0.45);

    let accumulatedScroll = 0;

    scrollIntervalRef.current = window.setInterval(() => {
      accumulatedScroll += pixelsPerTick;
      if (accumulatedScroll >= 1) {
        const step = Math.floor(accumulatedScroll);
        accumulatedScroll -= step;
        window.scrollBy({ top: step, behavior: 'instant' as ScrollBehavior });

        // Check if reached bottom of page
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5) {
          setIsPlaying(false);
        }
      }
    }, intervalTime);

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
  }, [isPlaying, speed, isReadingSong]);

  // Stop autoscroll if user leaves song view
  useEffect(() => {
    if (!isReadingSong) {
      setIsPlaying(false);
    }
  }, [isReadingSong]);

  if (!isReadingSong) return null;

  return (
    <aside
      aria-label="Kontrol gulir otomatis"
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 floating-controls"
    >
      {isExpanded && (
        <div className="p-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl flex flex-col gap-2 min-w-[210px] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            <span>Kecepatan Gulir</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{speed}x</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSpeed((prev) => Math.max(1, prev - 1))}
              disabled={speed <= 1}
              className="p-1 rounded text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
              title="Perlambat"
            >
              <ChevronsDown className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="1"
              max="7"
              step="1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-amber-600 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
            />
            <button
              onClick={() => setSpeed((prev) => Math.min(7, prev + 1))}
              disabled={speed >= 7}
              className="p-1 rounded text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
              title="Percepat"
            >
              <ChevronsUp className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-400">
            <span>Auto-Scroll Lirik</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-amber-600 dark:text-amber-400 hover:underline"
            >
              Ke Atas
            </button>
          </div>
        </div>
      )}

      {/* Main floating action pill */}
      <div className="flex items-center gap-1.5 p-1.5 bg-neutral-900 text-white dark:bg-neutral-800/95 dark:text-neutral-100 rounded-full shadow-lg border border-neutral-700/60">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-full font-medium text-xs transition-colors ${
            isPlaying
              ? 'bg-amber-600 text-white'
              : 'hover:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-200'
          }`}
          title={isPlaying ? 'Jeda gulir otomatis' : 'Mulai gulir otomatis'}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Jeda ({speed}x)</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Auto Scroll</span>
            </>
          )}
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-neutral-300 hover:text-white rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
          title="Atur Kecepatan"
          aria-label="Atur Kecepatan Gulir"
        >
          <span className="font-mono text-xs font-bold">{speed}x</span>
        </button>
      </div>
    </aside>
  );
};
