import React, { useEffect, useRef } from 'react';
import { Play, Pause, FastForward, Rewind } from 'lucide-react';

interface AutoScrollProps {
  isScrolling: boolean;
  speed: number;
  onToggle: () => void;
  onSpeedChange: (speed: number) => void;
}

export const AutoScrollController: React.FC<AutoScrollProps> = ({
  isScrolling,
  speed,
  onToggle,
  onSpeedChange,
}) => {
  const scrollRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isScrolling) {
      if (scrollRef.current) cancelAnimationFrame(scrollRef.current);
      return;
    }

    let lastTime = performance.now();
    const scrollStep = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      // Calculate pixels to scroll based on speed (e.g. 1x ~ 35px/sec)
      const px = (35 * speed * delta) / 1000;
      window.scrollBy({ top: px, behavior: 'auto' });

      // Check if reached bottom
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5) {
        onToggle(); // Stop scrolling at end
        return;
      }

      scrollRef.current = requestAnimationFrame(scrollStep);
    };

    scrollRef.current = requestAnimationFrame(scrollStep);

    return () => {
      if (scrollRef.current) cancelAnimationFrame(scrollRef.current);
    };
  }, [isScrolling, speed, onToggle]);

  const decreaseSpeed = () => {
    onSpeedChange(Math.max(0.5, Number((speed - 0.25).toFixed(2))));
  };

  const increaseSpeed = () => {
    onSpeedChange(Math.min(3.0, Number((speed + 0.25).toFixed(2))));
  };

  return (
    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
          isScrolling
            ? 'bg-amber-500 text-white shadow-xs animate-pulse'
            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:text-amber-500'
        }`}
        title={isScrolling ? 'Hentikan Autoscroll' : 'Mulai Autoscroll'}
      >
        {isScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        <span>{isScrolling ? 'Pause' : 'Scroll'}</span>
      </button>

      <div className="flex items-center gap-1 px-1">
        <button
          onClick={decreaseSpeed}
          disabled={speed <= 0.5}
          className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
          title="Perlambat Kecepatan"
        >
          <Rewind className="w-3 h-3" />
        </button>
        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 w-9 text-center">
          {speed.toFixed(1)}x
        </span>
        <button
          onClick={increaseSpeed}
          disabled={speed >= 3.0}
          className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
          title="Percepat Kecepatan"
        >
          <FastForward className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
