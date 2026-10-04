import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Play, Pause, Plus, Minus, Volume2, VolumeX, Activity } from 'lucide-react';

interface MetronomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBpm?: number;
}

const TEMPO_PRESETS = [
  { name: 'Largo', range: '40-60', bpm: 50 },
  { name: 'Adagio', range: '66-76', bpm: 72 },
  { name: 'Andante', range: '76-108', bpm: 90 },
  { name: 'Moderato', range: '108-120', bpm: 112 },
  { name: 'Allegro', range: '120-156', bpm: 130 },
  { name: 'Presto', range: '168-200', bpm: 180 },
];

const TIME_SIGNATURES = [
  { label: '4/4', beats: 4 },
  { label: '3/4', beats: 3 },
  { label: '2/4', beats: 2 },
  { label: '6/8', beats: 6 },
];

export const MetronomeModal: React.FC<MetronomeModalProps> = ({
  isOpen,
  onClose,
  initialBpm = 80,
}) => {
  const [bpm, setBpm] = useState<number>(initialBpm);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [beatsPerMeasure, setBeatsPerMeasure] = useState<number>(4);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerIdRef = useRef<number | null>(null);
  const tapTimesRef = useRef<number[]>([]);

  // Update initial BPM if prop changes
  useEffect(() => {
    if (initialBpm && initialBpm >= 40 && initialBpm <= 240) {
      setBpm(initialBpm);
    }
  }, [initialBpm]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Stop when closed
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentBeat(0);
    }
  }, [isOpen]);

  // Sound generator
  const playClick = useCallback(
    (isAccent: boolean) => {
      if (isMuted) return;
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
          }
        }
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Accent tone 1000Hz, regular 600Hz
        osc.frequency.value = isAccent ? 1000 : 600;
        osc.type = 'sine';

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
      } catch (e) {
        console.error('Audio metronome error:', e);
      }
    },
    [isMuted]
  );

  // Metronome Engine
  useEffect(() => {
    if (!isPlaying) {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      setCurrentBeat(0);
      return;
    }

    const intervalMs = (60 / bpm) * 1000;
    let localBeat = 0;

    // Trigger initial beat
    playClick(true);
    setCurrentBeat(0);

    timerIdRef.current = window.setInterval(() => {
      localBeat = (localBeat + 1) % beatsPerMeasure;
      setCurrentBeat(localBeat);
      playClick(localBeat === 0);
    }, intervalMs);

    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
    };
  }, [isPlaying, bpm, beatsPerMeasure, playClick]);

  // Tap tempo handler
  const handleTap = () => {
    const now = Date.now();
    const taps = tapTimesRef.current.filter((t) => now - t < 3000);
    taps.push(now);
    tapTimesRef.current = taps;

    if (taps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      if (calculatedBpm >= 40 && calculatedBpm <= 240) {
        setBpm(calculatedBpm);
      }
    }
  };

  const adjustBpm = (delta: number) => {
    setBpm((current) => Math.max(40, Math.min(240, current + delta)));
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Metronom Digital
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Ketukan tempo presisi untuk latihan gitar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BPM Big Display */}
        <div className="text-center py-2 space-y-1">
          <div className="inline-flex items-baseline justify-center gap-2">
            <span className="font-mono text-5xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
              {bpm}
            </span>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider font-mono">
              BPM
            </span>
          </div>

          {/* Visual Beat Indicator Dots */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {Array.from({ length: beatsPerMeasure }).map((_, i) => (
              <span
                key={i}
                className={`transition-all duration-75 rounded-full ${
                  isPlaying && currentBeat === i
                    ? i === 0
                      ? 'w-5 h-5 bg-amber-500 ring-4 ring-amber-500/30 shadow-lg'
                      : 'w-4 h-4 bg-blue-600 ring-4 ring-blue-500/30'
                    : 'w-3 h-3 bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* BPM Slider */}
        <div className="space-y-1">
          <input
            type="range"
            min={40}
            max={240}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>40 (Largo)</span>
            <span>120 (Allegro)</span>
            <span>240 (Max)</span>
          </div>
        </div>

        {/* BPM Fine Steppers */}
        <div className="grid grid-cols-5 gap-1.5">
          <button
            onClick={() => adjustBpm(-5)}
            className="py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            -5
          </button>
          <button
            onClick={() => adjustBpm(-1)}
            className="py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleTap}
            className="py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 cursor-pointer active:scale-95 transition-transform"
            title="Klik berulang sesuai ritme untuk deteksi tempo otomatis"
          >
            TAP
          </button>
          <button
            onClick={() => adjustBpm(1)}
            className="py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => adjustBpm(5)}
            className="py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            +5
          </button>
        </div>

        {/* Time Signatures */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          <span className="text-xs font-semibold text-slate-500">Ketukan:</span>
          <div className="flex items-center gap-1.5">
            {TIME_SIGNATURES.map((sig) => (
              <button
                key={sig.label}
                onClick={() => setBeatsPerMeasure(sig.beats)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  beatsPerMeasure === sig.beats
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {sig.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tempo Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {TEMPO_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setBpm(p.bpm)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                Math.abs(bpm - p.bpm) <= 6
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              {p.name} ({p.bpm})
            </button>
          ))}
        </div>

        {/* Primary Controls (Play / Mute) */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 shadow-md ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Berhenti</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Mulai Ketukan (Spasi)</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-rose-50 text-rose-500 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
            }`}
            title={isMuted ? 'Bunyikan suara' : 'Bisukan suara (hanya visual)'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
