import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types/chord';
import { transposeText, transposeSingleChord } from '../utils/chordTransposer';
import { ChordHoverToken } from './ChordHoverToken';
import { cacheViewedSong } from '../utils/offlineStorage';
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
  const scrollIntervalRef = useRef<number | null>(null);

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

          {/* Info Labels: 👁 views, ♡ likes, Bagikan */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{song.views || '76.4k'}</span>
            </span>

            <button
              onClick={(e) => onToggleFavorite(e, song.id)}
              className={`flex items-center gap-1 transition-colors cursor-pointer ${
                isFavorite
                  ? 'text-rose-500 font-bold'
                  : 'hover:text-rose-500'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
              <span>{song.likes || '3.2k'}</span>
            </button>

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
    </div>
  );
};
