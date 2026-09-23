import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  Minus,
  Plus,
  Timer,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  CheckCircle2,
  ArrowDownToLine,
  ArrowUpToLine,
} from 'lucide-react';

interface FloatingAutoScrollProps {
  tempo?: number;
  songTitle?: string;
  songArtist?: string;
  songGenre?: string;
  songContent?: string;
  songId?: string;
  targetContainerId?: string;
}

/**
 * Ultimate Guitar Timing Curve
 * Speed levels 1 - 10:
 * Level 1 = 2.0 px/s (Default UG reading speed)
 * Level 2 = 3.8 px/s
 * Level 3 = 6.5 px/s
 * Level 4 = 10.5 px/s
 * Level 5 = 16.0 px/s
 * Level 6 = 23.0 px/s
 * Level 7 = 32.0 px/s
 * Level 8 = 45.0 px/s
 * Level 9 = 60.0 px/s
 * Level 10 = 80.0 px/s
 */
const UG_SPEED_LEVELS: Record<number, number> = {
  1: 2.0,
  2: 3.8,
  3: 6.5,
  4: 10.5,
  5: 16.0,
  6: 23.0,
  7: 32.0,
  8: 45.0,
  9: 60.0,
  10: 80.0,
};

export const FloatingAutoScroll: React.FC<FloatingAutoScrollProps> = ({
  songId = '',
  targetContainerId = 'lyrics-sheet-content',
}) => {
  // Autoscroll States
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(10); // Default speed set to 10
  const [countdownDuration, setCountdownDuration] = useState<number>(3); // 0 (off), 3s, 5s
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);
  const [userPauseRemaining, setUserPauseRemaining] = useState<number>(0);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // References
  const animationFrameRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const userInteractionTimeoutRef = useRef<number | null>(null);
  const userInteractionTickerRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const subpixelAccumulatorRef = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);
  const isUserInteractingRef = useRef<boolean>(false);
  const levelRef = useRef<number>(level);

  // Reset saat berganti lagu
  useEffect(() => {
    setLevel(10);
    setIsScrolling(false);
    setIsActive(false);
    setIsCompleted(false);
    setCountdownRemaining(null);
    subpixelAccumulatorRef.current = 0;
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  }, [songId]);

  // Keep refs in sync with state
  useEffect(() => {
    isScrollingRef.current = isScrolling;
  }, [isScrolling]);

  useEffect(() => {
    isUserInteractingRef.current = isUserInteracting;
  }, [isUserInteracting]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  // Helper untuk melompat mulus ke awal lirik jika viewport masih di atas
  const ensureAtLyricsStart = useCallback(() => {
    const el = document.getElementById(targetContainerId);
    if (el) {
      const rect = el.getBoundingClientRect();
      const currentScroll = window.scrollY;
      const targetTop = currentScroll + rect.top - 80; // 80px offset for sticky header

      // Jika layar pengguna masih jauh di atas lirik, geser ke awal lirik
      if (rect.top > 250 || rect.top < 20) {
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth',
        });
      }
    }
  }, [targetContainerId]);

  // Ultra-smooth subpixel accumulator scroll loop
  const scrollStep = useCallback((timestamp: number) => {
    if (!isScrollingRef.current) {
      lastTimestampRef.current = null;
      return;
    }

    if (!lastTimestampRef.current) {
      lastTimestampRef.current = timestamp;
    }

    const deltaTime = (timestamp - lastTimestampRef.current) / 1000; // in seconds
    lastTimestampRef.current = timestamp;

    // Hanya scroll bila user sedang tidak memegang/menggeser layar manual
    if (!isUserInteractingRef.current && deltaTime > 0 && deltaTime < 0.2) {
      const targetSpeed = UG_SPEED_LEVELS[levelRef.current] || UG_SPEED_LEVELS[1];

      // Akumulator subpixel agar di kecepatan 2.0 px/s sangat halus tanpa patah-patah
      subpixelAccumulatorRef.current += targetSpeed * deltaTime;

      if (subpixelAccumulatorRef.current >= 1) {
        const pixelsToScroll = Math.floor(subpixelAccumulatorRef.current);
        subpixelAccumulatorRef.current -= pixelsToScroll;

        window.scrollBy({ top: pixelsToScroll, behavior: 'auto' });

        // Cek apakah sudah sampai di AKHIR LIRIK (bukan akhir halaman footer)
        const lyricsElem = document.getElementById(targetContainerId);
        if (lyricsElem) {
          const rect = lyricsElem.getBoundingClientRect();
          // Berhenti saat batas bawah lirik sudah terbaca tuntas di layar
          if (rect.bottom <= window.innerHeight - 80) {
            setIsScrolling(false);
            setIsActive(false);
            setIsCompleted(true);
            return;
          }
        } else {
          // Fallback akhir dokumen
          const scrollHeight = document.documentElement.scrollHeight;
          const currentPos = window.innerHeight + window.scrollY;
          if (currentPos >= scrollHeight - 20) {
            setIsScrolling(false);
            setIsActive(false);
            setIsCompleted(true);
            return;
          }
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scrollStep);
  }, [targetContainerId]);

  // Start / Stop scrolling loop
  useEffect(() => {
    if (isScrolling) {
      lastTimestampRef.current = null;
      subpixelAccumulatorRef.current = 0;
      setIsCompleted(false);
      animationFrameRef.current = requestAnimationFrame(scrollStep);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isScrolling, scrollStep]);

  // Smart pause on user scroll/touch (Ultimate Guitar behavior)
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!isScrollingRef.current) return;

      setIsUserInteracting(true);
      setUserPauseRemaining(2);

      if (userInteractionTimeoutRef.current) window.clearTimeout(userInteractionTimeoutRef.current);
      if (userInteractionTickerRef.current) window.clearInterval(userInteractionTickerRef.current);

      let countdown = 2;
      userInteractionTickerRef.current = window.setInterval(() => {
        countdown -= 1;
        if (countdown >= 0) {
          setUserPauseRemaining(countdown);
        }
      }, 1000);

      userInteractionTimeoutRef.current = window.setTimeout(() => {
        setIsUserInteracting(false);
        if (userInteractionTickerRef.current) window.clearInterval(userInteractionTickerRef.current);
      }, 2000);
    };

    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    window.addEventListener('touchmove', handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('touchmove', handleUserInteraction);
      if (userInteractionTimeoutRef.current) window.clearTimeout(userInteractionTimeoutRef.current);
      if (userInteractionTickerRef.current) window.clearInterval(userInteractionTickerRef.current);
    };
  }, []);

  // Keyboard shortcut listener (Space = play/pause, [ = level down, ] = level up)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === '[') {
        setLevel((prev) => Math.max(1, prev - 1));
      } else if (e.key === ']') {
        setLevel((prev) => Math.min(10, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScrolling, isActive, countdownRemaining]);

  // Handle Play/Pause with optional Countdown & auto align to lyrics start
  const togglePlayPause = () => {
    if (isScrolling || countdownRemaining !== null) {
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setCountdownRemaining(null);
      setIsScrolling(false);
      setIsActive(false);
      setIsUserInteracting(false);
      return;
    }

    // Jika mulai dari awal atau baru selesai, arahkan ke awal lirik
    ensureAtLyricsStart();

    setIsActive(true);
    setIsCompleted(false);

    if (countdownDuration > 0) {
      let count = countdownDuration;
      setCountdownRemaining(count);

      countdownIntervalRef.current = window.setInterval(() => {
        count -= 1;
        if (count <= 0) {
          if (countdownIntervalRef.current) {
            window.clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          setCountdownRemaining(null);
          setIsScrolling(true);
        } else {
          setCountdownRemaining(count);
        }
      }, 1000);
    } else {
      setIsScrolling(true);
    }
  };

  // Reset tepat ke bagian awal lirik lagu
  const scrollToLyricsStart = () => {
    const el = document.getElementById(targetContainerId);
    if (el) {
      const rect = el.getBoundingClientRect();
      const currentScroll = window.scrollY;
      window.scrollTo({
        top: Math.max(0, currentScroll + rect.top - 80),
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsCompleted(false);
  };

  return (
    <aside
      aria-label="Kontrol Autoscroll Melayang"
      className="fixed bottom-5 right-3 sm:right-6 z-40 no-print flex flex-col items-end gap-2"
    >
      {/* Song Completed Toast (Berhenti Tepat di Akhir Lirik) */}
      {isCompleted && (
        <div className="bg-emerald-600 text-white px-3.5 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span className="text-xs font-bold">Lirik selesai!</span>
          <button
            onClick={scrollToLyricsStart}
            className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Kembali ke Awal</span>
          </button>
        </div>
      )}

      {/* Smart Pause Alert Banner */}
      {isScrolling && isUserInteracting && (
        <div className="animate-bounce bg-amber-500 text-slate-950 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
          <span>Jeda sentuhan ({userPauseRemaining}s)...</span>
          <button
            onClick={() => setIsUserInteracting(false)}
            className="underline hover:text-white cursor-pointer ml-1 font-extrabold"
          >
            Lanjut
          </button>
        </div>
      )}

      {/* Countdown Overlay Capsule */}
      {countdownRemaining !== null && (
        <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-3 border border-indigo-400 animate-pulse">
          <Timer className="w-5 h-5 animate-spin" />
          <div className="text-xs font-semibold">
            Mulai lirik dalam{' '}
            <span className="text-base font-black text-amber-300">
              {countdownRemaining}s
            </span>
          </div>
          <button
            onClick={() => {
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
              setCountdownRemaining(null);
              setIsScrolling(true);
            }}
            className="px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
          >
            Mulai Sekarang
          </button>
        </div>
      )}

      {/* Main Floating Widget Capsule */}
      <div
        className={`bg-white/95 dark:bg-[#131B2E]/95 amoled:bg-black/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 amoled:border-neutral-800 rounded-2xl shadow-2xl transition-all duration-300 ${
          isMinimized ? 'p-2' : 'p-3 sm:p-3.5'
        }`}
      >
        {isMinimized ? (
          /* Minimized Pill View */
          <div className="flex items-center gap-1.5">
            <button
              onClick={togglePlayPause}
              aria-label={isScrolling ? "Jeda autoscroll" : "Mulai autoscroll"}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md transition-transform active:scale-95 cursor-pointer ${
                isScrolling
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isScrolling ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <div className="text-center px-1">
              <div className="text-[9px] font-bold text-slate-400 uppercase">Speed</div>
              <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">{level}</div>
            </div>
            <button
              onClick={() => setIsMinimized(false)}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              title="Perluas Kontrol"
              aria-label="Perluas Kontrol"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Expanded Full Controls View */
          <div className="flex flex-col gap-2.5 min-w-[260px] sm:min-w-[290px]">
            {/* Top Bar: Title & Countdown options */}
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    isScrolling
                      ? 'bg-emerald-500 animate-ping'
                      : isActive
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="text-xs font-extrabold text-slate-900 dark:text-white tracking-tight">
                  AUTOSCROLL
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Countdown Selector (0s / 3s / 5s) */}
                <div className="flex items-center gap-1 text-[10px] mr-1">
                  <Timer className="w-3 h-3 text-slate-400" />
                  {[0, 3, 5].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setCountdownDuration(sec)}
                      className={`px-1.5 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                        countdownDuration === sec
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                      title={sec === 0 ? 'Tanpa jeda' : `Jeda persiapan ${sec} detik`}
                    >
                      {sec === 0 ? '0s' : `${sec}s`}
                    </button>
                  ))}
                </div>

                {/* Minimize button */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md cursor-pointer"
                  title="Kecilkan Kontrol"
                  aria-label="Kecilkan Kontrol"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Ultimate Guitar Speed Bar: [-] [ 1 ] [+] */}
            <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/70 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Speed
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setLevel((prev) => Math.max(1, prev - 1))}
                  disabled={level <= 1}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-30 flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer font-bold transition-colors"
                  title="Perlambat (Key: [)"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                {/* Direct UG Level Indicator */}
                <div className="flex items-center justify-center min-w-[36px] h-7 bg-white dark:bg-slate-900 rounded-lg shadow-inner text-sm font-black text-indigo-600 dark:text-indigo-400">
                  {level}
                </div>

                <button
                  onClick={() => setLevel((prev) => Math.min(10, prev + 1))}
                  disabled={level >= 10}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-30 flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer font-bold transition-colors"
                  title="Percepat (Key: ])"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom Actions: Play/Pause Button & Scroll to Top of Lyrics */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                onClick={togglePlayPause}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer ${
                  isScrolling || countdownRemaining !== null
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {countdownRemaining !== null ? (
                  <>
                    <Timer className="w-4 h-4 animate-spin" />
                    <span>Mulai dalam ({countdownRemaining}s)</span>
                  </>
                ) : isScrolling ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pause (Spasi)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Autoscroll (Spasi)</span>
                  </>
                )}
              </button>

              <button
                onClick={scrollToLyricsStart}
                title="Kembali tepat ke awal lirik lagu"
                aria-label="Kembali tepat ke awal lirik lagu"
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
