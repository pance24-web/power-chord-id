import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types/chord';
import { transposeText, transposeSingleChord } from '../utils/chordTransposer';
import { ChordHoverToken } from './ChordHoverToken';
import { cacheViewedSong } from '../utils/offlineStorage';
import { useSongRealtimeStats } from '../utils/realtimeStats';
import {
  ArrowLeft,
  Heart,
  Share2,
  Copy,
  Check,
  Eye,
  Play,
  Pause,
  MoreHorizontal,
  ChevronDown,
  Timer,
  Activity,
  ChevronsUp,
  Minus,
  Plus,
  Minimize2,
  Maximize2,
  Sliders,
} from 'lucide-react';

interface SongViewerProps {
  song: Song;
  allSongs?: Song[];
  isFavorite: boolean;
  onBack: () => void;
  onSelectSong?: (song: Song) => void;
  onToggleFavorite: (e: React.MouseEvent, songId: string) => void;
  onOpenChordModal: (chord: string) => void;
}

export const SongViewer: React.FC<SongViewerProps> = ({
  song,
  allSongs = [],
  isFavorite,
  onBack,
  onSelectSong,
  onToggleFavorite,
  onOpenChordModal,
}) => {
  const [transposeStep, setTransposeStep] = useState<number>(0);
  const [capoOffset, setCapoOffset] = useState<number>(song.capo || 0);
  const [fontSize, setFontSize] = useState<number>(14); // 12, 14, 16, 18
  const [autoScrollActive, setAutoScrollActive] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1.0);
  const [copied, setCopied] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<boolean>(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [isFloatingMinimized, setIsFloatingMinimized] = useState<boolean>(false);
  const scrollIntervalRef = useRef<number | null>(null);

  const speedOptions = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0];

  const handleSpeedStep = (delta: number) => {
    setScrollSpeed((current) => {
      const idx = speedOptions.indexOf(current);
      if (idx !== -1) {
        const nextIdx = Math.max(0, Math.min(speedOptions.length - 1, idx + delta));
        return speedOptions[nextIdx];
      }
      return Math.max(0.5, Math.min(2.0, +(current + delta * 0.2).toFixed(1)));
    });
  };

  // Keyboard shortcut: Spacebar to toggle autoscroll (if not in input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setAutoScrollActive((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-time calculated statistics
  const {
    formattedViews,
    preciseViews,
    formattedLikes,
    liveMusicians,
    formattedPracticeTime,
    isPracticing,
    togglePracticeTimer,
  } = useSongRealtimeStats(song.id, song.views, song.likes, isFavorite);

  useEffect(() => {
    cacheViewedSong(song);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTransposeStep(0);
    setCapoOffset(song.capo || 0);
    setAutoScrollActive(false);
  }, [song]);

  // Handle Autoscroll
  useEffect(() => {
    if (autoScrollActive) {
      const intervalMs = Math.max(16, Math.floor(40 / scrollSpeed));
      scrollIntervalRef.current = window.setInterval(() => {
        window.scrollBy({ top: 1, behavior: 'smooth' });
      }, intervalMs);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [autoScrollActive, scrollSpeed]);

  // Transposed song content
  const transposedContent = transposeText(song.content, transposeStep);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${song.title} - ${song.artist}\nKunci: ${song.originalKey}\n\n${transposedContent}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  };

  // Related songs (Mockup Screen 3 & 7)
  const relatedSongs = allSongs
    .filter((s) => s.id !== song.id)
    .slice(0, 5);

  // Render formatted lines: detects bracketed chords [Am] or chord lines
  const renderFormattedLine = (line: string, lineIndex: number) => {
    if (!line.trim()) {
      return <div key={lineIndex} className="h-4" />;
    }

    // Section header
    if (/^\s*(Intro|Verse|Chorus|Pre-Chorus|Bridge|Interlude|Outro|Solo|Reff)[^:]*:/i.test(line) || /^\s*\[(Intro|Verse|Chorus|Pre-Chorus|Bridge|Interlude|Outro|Solo|Reff)[^\]]*\]\s*$/i.test(line)) {
      return (
        <div key={lineIndex} className="pt-3 pb-1 font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans">
          {line.trim()}
        </div>
      );
    }

    // Bracketed chords like [C]
    if (line.includes('[') && line.includes(']')) {
      const parts = line.split(/(\[[A-G][b#]?[^\]]*\])/g);
      return (
        <div key={lineIndex} className="leading-loose font-mono">
          {parts.map((part, pIdx) => {
            const chordMatch = part.match(/^\[([A-G][b#]?[^\]]*)\]$/);
            if (chordMatch) {
              return (
                <ChordHoverToken
                  key={pIdx}
                  chord={chordMatch[1]}
                  onClickChord={onOpenChordModal}
                />
              );
            }
            return <span key={pIdx} className="text-slate-800 dark:text-slate-200">{part}</span>;
          })}
        </div>
      );
    }

    // Tokenized line check: chord line vs lyric line
    const words = line.split(/(\s+)/);
    const nonSpaces = words.filter((w) => w.trim().length > 0);
    const chordCount = nonSpaces.filter((w) => /^[A-G][b#]?(m|maj|min|dim|aug|sus|add|7|9|11|13|6|2)*(\/[A-G][b#]?)?$/.test(w.trim())).length;
    const isChordLine = nonSpaces.length > 0 && chordCount >= Math.ceil(nonSpaces.length * 0.7);

    if (isChordLine) {
      return (
        <div key={lineIndex} className="font-mono font-bold leading-relaxed whitespace-pre text-blue-600 dark:text-blue-400">
          {words.map((w, wIdx) => {
            if (/^[A-G][b#]?[a-zA-Z0-9#\+/\-]*$/.test(w.trim())) {
              return (
                <ChordHoverToken
                  key={wIdx}
                  chord={w.trim()}
                  onClickChord={onOpenChordModal}
                />
              );
            }
            return <span key={wIdx}>{w}</span>;
          })}
        </div>
      );
    }

    return (
      <div key={lineIndex} className="font-sans leading-relaxed text-slate-800 dark:text-slate-200">
        {line}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Back button (Mockup Screen 3: ← Kembali ke katalog) */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke katalog</span>
      </button>

      {/* Song Header & Metadata (Mockup Screen 3) */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {song.title}
        </h1>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {song.artist}
        </p>

        {/* Badges & Stats Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Genre Badges (e.g. Rock, Indie) */}
          <div className="flex items-center gap-1.5">
            {song.tags && song.tags.length > 0 ? (
              song.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                {song.genre || 'Pop'}
              </span>
            )}
          </div>

          {/* Info Labels: Realtime Live Musicians, 👁 views, ♡ likes, ⏱ Waktu Latihan, Bagikan */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {/* Live active musicians badge */}
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-[11px] font-semibold"
              title="Musisi yang sedang aktif membuka lagu ini secara bersamaan"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{liveMusicians} musisi aktif</span>
            </div>

            {/* Realtime Views */}
            <span
              className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-help"
              title={`Total tayangan realtime: ${preciseViews} kali dibaca`}
            >
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">{formattedViews}</span>
            </span>

            {/* Realtime Likes */}
            <button
              onClick={(e) => onToggleFavorite(e, song.id)}
              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                isFavorite
                  ? 'text-rose-500 font-bold'
                  : 'hover:text-rose-500 text-slate-600 dark:text-slate-300'
              }`}
              title={isFavorite ? 'Tersimpan di favorit' : 'Sukai & simpan ke favorit'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
              <span>{formattedLikes}</span>
            </button>

            {/* Realtime Practice Stopwatch */}
            <button
              onClick={togglePracticeTimer}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors cursor-pointer"
              title={isPracticing ? 'Klik untuk menjeda stopwatch latihan' : 'Klik untuk melanjutkan stopwatch latihan'}
            >
              <Timer className={`w-3 h-3 ${isPracticing ? 'animate-pulse text-blue-600' : 'text-slate-400'}`} />
              <span className="font-mono text-[11px]">
                {formattedPracticeTime}
              </span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{shareToast ? 'Tersalin!' : 'Bagikan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column Chord Sheet, Right Column Related Songs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chord Box */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          {/* Top Toolbar inside chord card (Mockup: Chord — 0 + Capo 0 ⌄ A- A A+ Copy) */}
          <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Left: Transpose & Capo */}
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900 dark:text-white">Chord</span>

              {/* Transpose: — 0 + */}
              <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-0.5">
                <button
                  onClick={() => setTransposeStep((prev) => prev - 1)}
                  className="px-2 py-1 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 font-bold cursor-pointer"
                  title="Turunkan 1/2 nada"
                >
                  —
                </button>
                <span className="font-mono font-bold px-2 text-slate-800 dark:text-slate-100 min-w-6 text-center">
                  {transposeStep > 0 ? `+${transposeStep}` : transposeStep}
                </span>
                <button
                  onClick={() => setTransposeStep((prev) => prev + 1)}
                  className="px-2 py-1 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 font-bold cursor-pointer"
                  title="Naikkan 1/2 nada"
                >
                  +
                </button>
              </div>

              {/* Capo Dropdown */}
              <div className="relative">
                <select
                  value={capoOffset}
                  onChange={(e) => setCapoOffset(Number(e.target.value))}
                  className="appearance-none pl-2.5 pr-6 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl font-medium text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-hidden"
                >
                  <option value={0}>Capo 0</option>
                  <option value={1}>Capo 1</option>
                  <option value={2}>Capo 2</option>
                  <option value={3}>Capo 3</option>
                  <option value={4}>Capo 4</option>
                  <option value={5}>Capo 5</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Right: Font Size + Copy Button */}
            <div className="flex items-center gap-2">
              {/* Font Size A- A A+ (Mockup Komponen UI Penting) */}
              <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-0.5">
                <button
                  onClick={() => setFontSize(12)}
                  className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    fontSize === 12
                      ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize(14)}
                  className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    fontSize === 14
                      ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize(17)}
                  className={`px-2 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                    fontSize === 17
                      ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  A+
                </button>
              </div>

              {/* Copy Button (Mockup Blue Button with Copy icon) */}
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Lyrics and Chords Content Area */}
          <div
            className="p-5 sm:p-7 select-text overflow-x-auto min-h-[360px]"
            style={{ fontSize: `${fontSize}px` }}
          >
            {transposedContent.split('\n').map((line, idx) => renderFormattedLine(line, idx))}
          </div>

          {/* Bottom Controls Bar (Mockup Screen 3: Auto Scroll toggle, [▶ Mulai] button, [...]) */}
          <div className="p-3 sm:p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            {/* Auto Scroll Switch Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoScrollActive}
                onChange={() => setAutoScrollActive(!autoScrollActive)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative"></div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Auto Scroll
              </span>
            </label>

            {/* Action Buttons: [ ▶ Mulai ] & [...] */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoScrollActive(!autoScrollActive)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs cursor-pointer transition-all active:scale-95"
              >
                {autoScrollActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Jeda</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Mulai</span>
                  </>
                )}
              </button>

              {/* Speed & Options (...) */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                  title="Pengaturan scroll"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showSpeedMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowSpeedMenu(false)}
                    />
                    <div className="absolute right-0 bottom-full mb-2 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-2 z-40 text-xs">
                      <p className="font-bold text-slate-400 px-2 py-1 text-[10px] uppercase">
                        Kecepatan Scroll
                      </p>
                      {[0.5, 1.0, 1.5, 2.0].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setScrollSpeed(s);
                            setShowSpeedMenu(false);
                          }}
                          className={`w-full px-2 py-1.5 text-left rounded-lg font-medium cursor-pointer ${
                            scrollSpeed === s
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {s}x {s === 1.0 ? '(Normal)' : ''}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Lagu Terkait (Mockup Screen 3 & Screen 7) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Lagu Terkait
            </h2>
            <button
              onClick={onBack}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Lihat Semua &rarr;
            </button>
          </div>

          {/* Numbered List of 5 Related Songs */}
          <div className="space-y-1">
            {relatedSongs.map((relSong, idx) => (
              <div
                key={relSong.id}
                onClick={() => onSelectSong && onSelectSong(relSong)}
                className="group p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-bold text-slate-400 text-xs w-4 shrink-0 text-center">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {relSong.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {relSong.artist}
                    </p>
                  </div>
                </div>

                {relSong.genre && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 shrink-0">
                    {relSong.genre}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FLOATING AUTO SCROLL CONTROLLER (TAMPILAN MELAYANG) */}
      {/* ======================================================== */}
      {!isFloatingMinimized ? (
        <div className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] sm:w-auto max-w-xl transition-all duration-300">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-700/90 shadow-2xl rounded-2xl sm:rounded-full px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between sm:justify-center gap-2 sm:gap-3.5 ring-1 ring-black/5 dark:ring-white/10">
            {/* 1. Status Indicator & Mode */}
            <div className="flex items-center gap-2 pr-1 sm:pr-2 border-r border-slate-200 dark:border-slate-800">
              <span className="relative flex h-2.5 w-2.5">
                {autoScrollActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    autoScrollActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                ></span>
              </span>
              <div className="hidden xs:block text-left">
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-none">
                  Auto Scroll
                </p>
                <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 leading-tight">
                  {autoScrollActive ? 'Sedang berjalan' : 'Dijeda (Spasi)'}
                </p>
              </div>
            </div>

            {/* 2. Main Play / Pause Button */}
            <button
              onClick={() => setAutoScrollActive((prev) => !prev)}
              className={`px-3.5 sm:px-5 py-2 rounded-xl sm:rounded-full text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95 shrink-0 ${
                autoScrollActive
                  ? 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-400/30 shadow-amber-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-500/30 shadow-blue-500/20'
              }`}
              title="Spasi: Jeda atau Mulai auto scroll"
            >
              {autoScrollActive ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Jeda</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Mulai</span>
                </>
              )}
            </button>

            {/* 3. Speed Stepper: [-] 1.0x [+] */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl sm:rounded-full p-0.5 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
              <button
                onClick={() => handleSpeedStep(-1)}
                disabled={scrollSpeed <= 0.5}
                className="p-1.5 rounded-lg sm:rounded-full text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                title="Kurangi kecepatan (0.5x min)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              {/* Speed button with popover options */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="px-2 py-0.5 text-xs font-bold font-mono text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center gap-0.5"
                  title="Klik untuk memilih preset kecepatan"
                >
                  <span>{scrollSpeed}x</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showSpeedMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-50"
                      onClick={() => setShowSpeedMenu(false)}
                    />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-60 text-xs">
                      <p className="font-bold text-slate-400 px-2 py-1 text-[10px] uppercase">
                        Pilih Kecepatan
                      </p>
                      {speedOptions.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setScrollSpeed(s);
                            setShowSpeedMenu(false);
                          }}
                          className={`w-full px-2.5 py-1.5 text-left rounded-lg font-medium cursor-pointer transition-colors flex items-center justify-between ${
                            scrollSpeed === s
                              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{s}x</span>
                          {s === 1.0 && (
                            <span className="text-[10px] text-slate-400 font-normal">Normal</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => handleSpeedStep(1)}
                disabled={scrollSpeed >= 2.0}
                className="p-1.5 rounded-lg sm:rounded-full text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                title="Tambah kecepatan (2.0x max)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4. Quick Scroll to Top */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-2 rounded-xl sm:rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors shrink-0"
              title="Kembali ke bagian atas lagu"
            >
              <ChevronsUp className="w-4 h-4" />
            </button>

            {/* 5. Minimize to Pill Button */}
            <button
              onClick={() => setIsFloatingMinimized(true)}
              className="p-2 rounded-xl sm:rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors shrink-0"
              title="Perkecil panel melayang"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Minimized floating button in bottom right */
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50">
          <button
            onClick={() => setIsFloatingMinimized(false)}
            className="group flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 cursor-pointer transition-all active:scale-95 ring-1 ring-black/5"
            title="Buka panel Auto Scroll melayang"
          >
            <span className="relative flex h-2.5 w-2.5">
              {autoScrollActive ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400"></span>
              )}
            </span>
            <span className="text-xs font-bold font-mono">{scrollSpeed}x</span>
            <Maximize2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};
