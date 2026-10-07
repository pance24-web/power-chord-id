import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Song, STORAGE_KEYS } from '../types/chord';
import { isChordToken, transposeText, transposeSingleChord } from '../utils/chordTransposer';
import { ChordHoverToken } from './ChordHoverToken';
import { ChordDiagram } from './ChordDiagram';
import { getChordData } from '../utils/chordDb';
import { audioSynth } from '../utils/audioSynth';
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
  ChevronDown,
  ChevronUp,
  Timer,
  ChevronsUp,
  Minus,
  Plus,
  Minimize2,
  Maximize2,
  RotateCcw,
  Sliders,
  Sparkles,
  Music,
  Volume2,
  BookOpen,
  Maximize,
  Grid,
  Printer,
  Activity,
} from 'lucide-react';

interface SongViewerProps {
  song: Song;
  allSongs?: Song[];
  isFavorite: boolean;
  onBack: () => void;
  onSelectSong?: (song: Song) => void;
  onToggleFavorite: (e: React.MouseEvent, songId: string) => void;
  onOpenChordModal: (chord: string) => void;
  onOpenMetronome?: (bpm?: number) => void;
}

export const SongViewer: React.FC<SongViewerProps> = ({
  song,
  allSongs = [],
  isFavorite,
  onBack,
  onSelectSong,
  onToggleFavorite,
  onOpenChordModal,
  onOpenMetronome,
}) => {
  // Transpose & Capo state
  const [transposeStep, setTransposeStep] = useState<number>(0);
  const [capoOffset, setCapoOffset] = useState<number>(song.capo || 0);

  // Font size with localStorage persistence
  const [fontSize, setFontSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('powerchord_font_size');
      if (saved) return Number(saved);
    }
    return 14;
  });

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    if (typeof window !== 'undefined') {
      localStorage.setItem('powerchord_font_size', String(size));
    }
  };

  // AutoScroll state & refs
  const [autoScrollActive, setAutoScrollActive] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(() => {
    if (typeof window === 'undefined') return 0.5;
    const saved = Number(localStorage.getItem(STORAGE_KEYS.SCROLL_SPEED));
    return Number.isFinite(saved) ? Math.max(0, Math.min(1, saved)) : 0.5;
  });
  const [copied, setCopied] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<boolean>(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [isFloatingMinimized, setIsFloatingMinimized] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCROLL_SPEED, String(scrollSpeed));
  }, [scrollSpeed]);

  // Focus mode & Chord diagrams state
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [showChordsStrip, setShowChordsStrip] = useState<boolean>(false);
  const [isSideChordsOpen, setIsSideChordsOpen] = useState<boolean>(true);

  // Extract distinct transposed chords used in the song
  const currentSongChords = useMemo(() => {
    const rawChords = song.chords && song.chords.length > 0 ? song.chords : ['C', 'G', 'Am', 'F'];
    const distinct = Array.from(new Set(rawChords));
    return distinct.map((c) => transposeSingleChord(c, transposeStep));
  }, [song.chords, transposeStep]);

  // Play strum sound for a specific chord
  const handlePlayChord = useCallback((chordName: string) => {
    const data = getChordData(chordName);
    if (!data) return;
    const stringNotes: ('E2' | 'A2' | 'D3' | 'G3' | 'B3' | 'E4')[] = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
    data.frets.forEach((fret, stringIdx) => {
      if (fret !== 'x') {
        setTimeout(() => {
          audioSynth.playGuitarString(stringNotes[stringIdx]);
        }, stringIdx * 45);
      }
    });
  }, []);

  // Strum all chords in sequence
  const handleStrumAllChords = useCallback(() => {
    currentSongChords.forEach((chordName, chordIdx) => {
      setTimeout(() => {
        handlePlayChord(chordName);
      }, chordIdx * 650);
    });
  }, [currentSongChords, handlePlayChord]);

  // RAF engine refs
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const subPixelRemainderRef = useRef<number>(0);

  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const lyricsEndRef = useRef<HTMLDivElement | null>(null);

  // Speed presets from 0.0x to 1.0x
  const speedOptions = useMemo(
    () => [
      { value: 0.0, label: '0.0x', desc: 'Diam / Jeda' },
      { value: 0.2, label: '0.2x', desc: 'Sangat Lambat' },
      { value: 0.4, label: '0.4x', desc: 'Lambat' },
      { value: 0.5, label: '0.5x', desc: 'Normal' },
      { value: 0.6, label: '0.6x', desc: 'Sedang' },
      { value: 0.8, label: '0.8x', desc: 'Cepat' },
      { value: 1.0, label: '1.0x', desc: 'Maksimal' },
    ],
    []
  );

  const handleSpeedStep = useCallback((delta: number) => {
    setScrollSpeed((current) => {
      const next = Math.round((current + delta * 0.1) * 10) / 10;
      return Math.max(0.0, Math.min(1.0, next));
    });
  }, []);

  // Calculate live reading progress through lyrics
  const updateProgress = useCallback(() => {
    if (!lyricsContainerRef.current || !lyricsEndRef.current) return;
    const containerTop = lyricsContainerRef.current.getBoundingClientRect().top + window.scrollY;
    const endTop = lyricsEndRef.current.getBoundingClientRect().top + window.scrollY;
    const totalDist = endTop - containerTop;
    if (totalDist <= 0) {
      setScrollProgress(0);
      return;
    }
    const currentPos = window.scrollY + window.innerHeight - 100 - containerTop;
    const pct = Math.max(0, Math.min(100, Math.round((currentPos / totalDist) * 100)));
    setScrollProgress(pct);
  }, []);

  // Listen to window scroll to keep progress indicator accurate
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    updateProgress();
    return () => window.removeEventListener('scroll', onScroll);
  }, [updateProgress]);

  // Jump smoothly to start of lyrics
  const scrollToLyricsStart = useCallback(() => {
    if (lyricsContainerRef.current) {
      const navbarOffset = 70;
      const targetY = lyricsContainerRef.current.getBoundingClientRect().top + window.scrollY - navbarOffset;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Toggle autoscroll with auto-targeting
  const handleToggleAutoScroll = useCallback(
    (forceRestart = false) => {
      if (autoScrollActive && !forceRestart) {
        setAutoScrollActive(false);
        return;
      }

      setIsFinished(false);

      if (lyricsContainerRef.current) {
        const lyricsRect = lyricsContainerRef.current.getBoundingClientRect();
        const endRect = lyricsEndRef.current?.getBoundingClientRect();
        const viewportThreshold = window.innerHeight - 80;
        const isAtOrPastEnd = endRect ? endRect.bottom <= viewportThreshold : false;
        const isAboveLyrics = lyricsRect.top > 120;

        if (forceRestart || isAtOrPastEnd || isAboveLyrics) {
          scrollToLyricsStart();
          setTimeout(() => {
            setAutoScrollActive(true);
          }, 350);
          return;
        }
      }

      setAutoScrollActive(true);
    },
    [autoScrollActive, scrollToLyricsStart]
  );

  // Keyboard shortcuts center
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleToggleAutoScroll();
      } else if (e.key === 'ArrowUp' || e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleSpeedStep(1);
      } else if (e.key === 'ArrowDown' || e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleSpeedStep(-1);
      } else if (e.key === 'r' || e.key === 'R' || e.key === 'Home') {
        e.preventDefault();
        handleToggleAutoScroll(true);
      } else if (e.key === 'Escape') {
        setShowSpeedMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleAutoScroll, handleSpeedStep]);

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

  // Reset states when song changes
  useEffect(() => {
    cacheViewedSong(song);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTransposeStep(0);
    setCapoOffset(song.capo || 0);
    setAutoScrollActive(false);
    setIsFinished(false);
    setScrollProgress(0);
  }, [song]);

  // Fluid 60fps/120fps requestAnimationFrame AutoScroll Engine
  useEffect(() => {
    if (!autoScrollActive || scrollSpeed <= 0) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      lastTimeRef.current = null;
      subPixelRemainderRef.current = 0;
      return;
    }

    setIsFinished(false);
    lastTimeRef.current = null;
    subPixelRemainderRef.current = 0;

    const basePixelsPerSec = 36; // 1.0x = ~36px/sec, 0.5x = 18px/sec, 0.2x = 7.2px/sec
    const currentSpeedRate = scrollSpeed * basePixelsPerSec;

    const step = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }

      // Delta time capped at 100ms to avoid huge jump on tab focus
      const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      // Check if end of lyrics is reached
      if (lyricsEndRef.current) {
        const rect = lyricsEndRef.current.getBoundingClientRect();
        const viewportThreshold = window.innerHeight - 80;
        if (rect.bottom <= viewportThreshold) {
          setAutoScrollActive(false);
          setIsFinished(true);
          updateProgress();
          return;
        }
      } else {
        const scrollBottom = window.innerHeight + window.scrollY;
        if (scrollBottom >= document.documentElement.scrollHeight - 10) {
          setAutoScrollActive(false);
          setIsFinished(true);
          updateProgress();
          return;
        }
      }

      // Sub-pixel delta accumulator for perfectly fluid scrolling
      const desiredPx = currentSpeedRate * dt + subPixelRemainderRef.current;
      const wholePx = Math.floor(desiredPx);
      subPixelRemainderRef.current = desiredPx - wholePx;

      if (wholePx > 0) {
        window.scrollBy({ top: wholePx, behavior: 'auto' });
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [autoScrollActive, scrollSpeed, updateProgress]);

  // Manual scrolling should always take control away from Auto-Scroll.
  useEffect(() => {
    if (!autoScrollActive || !lyricsContainerRef.current) return;

    const pauseForManualScroll = () => setAutoScrollActive(false);
    const lyricsElement = lyricsContainerRef.current;
    lyricsElement.addEventListener('wheel', pauseForManualScroll, { passive: true });
    lyricsElement.addEventListener('touchstart', pauseForManualScroll, { passive: true });

    return () => {
      lyricsElement.removeEventListener('wheel', pauseForManualScroll);
      lyricsElement.removeEventListener('touchstart', pauseForManualScroll);
    };
  }, [autoScrollActive]);

  // Transposed song content memoized to prevent re-transposing on every stopwatch tick
  const transposedContent = useMemo(() => {
    return transposeText(song.content, transposeStep);
  }, [song.content, transposeStep]);

  // Sounding key calculation for Capo
  const soundingKey = useMemo(() => {
    if (!song.originalKey || capoOffset === 0) return null;
    return transposeSingleChord(song.originalKey, capoOffset);
  }, [song.originalKey, capoOffset]);

  // Copy with rich info
  const handleCopy = useCallback(() => {
    if (navigator.clipboard) {
      const capoInfo = capoOffset > 0 ? ` (Capo di fret ${capoOffset})` : '';
      const transposeInfo =
        transposeStep !== 0 ? ` (Transpose: ${transposeStep > 0 ? `+${transposeStep}` : transposeStep})` : '';
      const header = `${song.title} - ${song.artist}\nNada Dasar: ${song.originalKey}${capoInfo}${transposeInfo}\n\n`;
      navigator.clipboard.writeText(`${header}${transposedContent}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [song.title, song.artist, song.originalKey, capoOffset, transposeStep, transposedContent]);

  // Share with Web Share API and deep-link clipboard fallback
  const handleShare = useCallback(async () => {
    const deepLinkUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/?song=${encodeURIComponent(song.id)}`
        : '';
    const shareData = {
      title: `${song.title} - ${song.artist} | PowerChord`,
      text: `Kunci gitar & lirik lagu ${song.title} oleh ${song.artist}`,
      url: deepLinkUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(deepLinkUrl);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  }, [song.id, song.title, song.artist]);

  // Handle print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Related songs memoized
  const relatedSongs = useMemo(() => {
    return allSongs.filter((s) => s.id !== song.id).slice(0, 5);
  }, [allSongs, song.id]);

  // Render formatted lines: memoized line tokenizer
  const renderFormattedLine = useCallback(
    (line: string, lineIndex: number) => {
      if (!line.trim()) {
        return <div key={lineIndex} className="h-4" />;
      }

      // Section header
      if (
        /^\s*(Intro|Verse|Chorus|Pre-Chorus|Bridge|Interlude|Outro|Solo|Reff)[^:]*:/i.test(line) ||
        /^\s*\[(Intro|Verse|Chorus|Pre-Chorus|Bridge|Interlude|Outro|Solo|Reff)[^\]]*\]\s*$/i.test(line)
      ) {
        return (
          <div
            key={lineIndex}
            className="pt-3 pb-1 font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-sans"
          >
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
              return (
                <span key={pIdx} className="text-slate-800 dark:text-slate-200">
                  {part}
                </span>
              );
            })}
          </div>
        );
      }

      // Tokenized line check: chord line vs lyric line
      const words = line.split(/(\s+)/);
      const nonSpaces = words.filter((w) => w.trim().length > 0);
      const chordCount = nonSpaces.filter((w) => isChordToken(w)).length;
      const isChordLine = nonSpaces.length > 0 && chordCount >= Math.ceil(nonSpaces.length * 0.7);

      if (isChordLine) {
        return (
          <div
            key={lineIndex}
            className="font-mono font-bold leading-relaxed whitespace-pre text-blue-600 dark:text-blue-400"
          >
            {words.map((w, wIdx) => {
              if (isChordToken(w)) {
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
    },
    [onOpenChordModal]
  );

  // Memoized parsed content lines: prevents re-running regex tokenizer on practice stopwatch ticks!
  const parsedContentLines = useMemo(() => {
    return transposedContent.split('\n').map((line, idx) => renderFormattedLine(line, idx));
  }, [transposedContent, renderFormattedLine]);

  return (
    <div className="space-y-6 pb-28">
      {/* Schema.org MusicComposition Structured Data for Rich Search Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MusicComposition',
            name: song.title,
            composer: {
              '@type': 'Person',
              name: song.artist,
            },
            musicalKey: song.originalKey,
            genre: song.genre || 'Pop',
            inLanguage: 'id',
            description: `Kunci gitar dan lirik lagu ${song.title} oleh ${song.artist}. Nada dasar ${song.originalKey}.`,
          }),
        }}
      />

      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke katalog</span>
      </button>

      {/* Song Header & Metadata */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {song.title}
        </h1>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {song.artist}
        </p>

        {/* Badges & Stats Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Genre Badges */}
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

          {/* Info Labels: Realtime Live Musicians, views, likes, Practice Timer, Share */}
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

            {/* Metronome Launcher */}
            {onOpenMetronome && (
              <button
                onClick={() => onOpenMetronome(Number(song.tempo) || 80)}
                className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                title={`Buka metronom digital (Tempo: ${song.tempo || 80} BPM)`}
              >
                <Activity className="w-3.5 h-3.5 text-blue-500" />
                <span className="hidden xs:inline">Metronom</span>
                {song.tempo && (
                  <span className="font-mono text-[10px] text-slate-400">({song.tempo})</span>
                )}
              </button>
            )}

            {/* Print / PDF */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              title="Cetak lirik & chord atau simpan ke PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Cetak</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              title="Bagikan tautan langsung lagu ini"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{shareToast ? 'Tersalin!' : 'Bagikan'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column Chord Sheet, Right Column Related Songs & Chord Diagrams */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chord Box */}
        <div
          className={`${
            isFocusMode ? 'lg:col-span-12' : 'lg:col-span-8'
          } bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-all duration-200`}
        >
          {/* Top Toolbar inside chord card (Sticky for seamless transpose/font adjustment while scrolling) */}
          <div className="sticky top-16 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs shadow-2xs">
            {/* Left: Transpose & Capo */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
              <span className="font-bold text-slate-900 dark:text-white hidden sm:inline">Chord</span>

              {/* Transpose: — 0 + */}
              <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-0.5">
                <button
                  onClick={() => setTransposeStep((prev) => prev - 1)}
                  className="px-2.5 py-1.5 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 font-bold cursor-pointer"
                  title="Turunkan 1/2 nada"
                  aria-label="Turunkan 1/2 nada"
                >
                  —
                </button>
                <span className="font-mono font-bold px-2 text-slate-800 dark:text-slate-100 min-w-6 text-center text-xs sm:text-sm">
                  {transposeStep > 0 ? `+${transposeStep}` : transposeStep}
                </span>
                <button
                  onClick={() => setTransposeStep((prev) => prev + 1)}
                  className="px-2.5 py-1.5 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 font-bold cursor-pointer"
                  title="Naikkan 1/2 nada"
                  aria-label="Naikkan 1/2 nada"
                >
                  +
                </button>
              </div>

              {/* Transpose Reset Shortcut */}
              {transposeStep !== 0 && (
                <button
                  onClick={() => setTransposeStep(0)}
                  className="px-2 py-1.5 min-h-[34px] rounded-lg text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition-colors cursor-pointer"
                  title="Kembalikan ke nada asli"
                >
                  Reset
                </button>
              )}

              {/* Capo Dropdown */}
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <select
                    value={capoOffset}
                    onChange={(e) => setCapoOffset(Number(e.target.value))}
                    className="appearance-none pl-2.5 pr-6 py-1.5 min-h-[34px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl font-medium text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-hidden text-xs"
                  >
                    <option value={0}>Capo 0</option>
                    <option value={1}>Capo 1</option>
                    <option value={2}>Capo 2</option>
                    <option value={3}>Capo 3</option>
                    <option value={4}>Capo 4</option>
                    <option value={5}>Capo 5</option>
                    <option value={6}>Capo 6</option>
                    <option value={7}>Capo 7</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Sounding key info */}
                {soundingKey && (
                  <span
                    className="hidden md:inline-flex px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-semibold border border-amber-200 dark:border-amber-900/50"
                    title={`Dengan Capo ${capoOffset}, chord ${song.originalKey} akan terdengar di nada ${soundingKey}`}
                  >
                    Riil: {soundingKey}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Quick Chord Bar Toggle, Font Size, Copy, and Focus Mode */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Quick Chords Strip toggle (especially handy on mobile) */}
              <button
                onClick={() => setShowChordsStrip(!showChordsStrip)}
                className={`px-2.5 py-1.5 min-h-[34px] rounded-xl font-semibold flex items-center gap-1 transition-colors cursor-pointer text-xs ${
                  showChordsStrip
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:text-blue-600'
                }`}
                title="Buka daftar kunci yang digunakan dalam lagu ini"
                aria-label="Lihat kunci lagu"
              >
                <Music className="w-3.5 h-3.5" />
                <span>Kunci</span>
                <span className="font-mono text-[11px] opacity-80">({currentSongChords.length})</span>
              </button>

              {/* Font Size A- A A+ */}
              <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-0.5">
                <button
                  onClick={() => handleFontSizeChange(12)}
                  className={`px-2 py-1 min-h-[32px] rounded-lg font-bold transition-colors cursor-pointer text-xs ${
                    fontSize === 12
                      ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                  title="Ukuran teks kecil"
                  aria-label="Ukuran teks kecil"
                >
                  A-
                </button>
                <button
                  onClick={() => handleFontSizeChange(14)}
                  className={`px-2 py-1 min-h-[32px] rounded-lg font-bold transition-colors cursor-pointer text-xs ${
                    fontSize === 14
                      ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                  title="Ukuran teks sedang"
                  aria-label="Ukuran teks sedang"
                >
                  A
                </button>
                <button
                  onClick={() => handleFontSizeChange(17)}
                  className={`px-2 py-1 min-h-[32px] rounded-lg font-bold transition-colors cursor-pointer text-xs ${
                    fontSize === 17
                      ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                  title="Ukuran teks besar"
                  aria-label="Ukuran teks besar"
                >
                  A+
                </button>
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className="px-2.5 sm:px-3 py-1.5 min-h-[34px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Salin chord & lirik ke papan klip"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden xs:inline text-xs">{copied ? 'Tersalin' : 'Copy'}</span>
              </button>

              {/* Desktop Focus Mode Toggle */}
              <button
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 min-h-[34px] rounded-xl font-semibold transition-colors cursor-pointer ${
                  isFocusMode
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:text-blue-600'
                }`}
                title={isFocusMode ? 'Kembali ke tampilan berdampingan' : 'Mode fokus layar lebar'}
                aria-label="Mode fokus"
              >
                {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span className="text-xs">{isFocusMode ? 'Normal' : 'Fokus'}</span>
              </button>
            </div>
          </div>

          {/* Quick Chords Strip (Horizontal scroll on mobile and tablet) */}
          {showChordsStrip && (
            <div className="bg-slate-50/90 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 p-3 sm:p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-blue-600" />
                  Kunci yang Digunakan:
                </span>
                <button
                  onClick={handleStrumAllChords}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Strum Semua Kunci
                </button>
              </div>

              {/* Horizontal pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {currentSongChords.map((chord) => (
                  <div
                    key={chord}
                    className="shrink-0 flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-2xs gap-1"
                  >
                    <button
                      onClick={() => onOpenChordModal(chord)}
                      className="px-2.5 py-1 font-mono font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      title="Lihat diagram kunci"
                    >
                      {chord}
                    </button>
                    <button
                      onClick={() => handlePlayChord(chord)}
                      className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      title="Dengarkan petikan akor"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lyrics and Chords Content Area */}
          <div
            ref={lyricsContainerRef}
            className="p-4 sm:p-7 select-text overflow-x-auto min-h-[360px]"
            style={{ fontSize: `${fontSize}px` }}
          >
            {parsedContentLines}

            {/* Titik penanda akhir lirik untuk floating autoscroll */}
            <div ref={lyricsEndRef} className="h-6" />
          </div>
        </div>

        {/* Right Column: Chord Diagrams & Lagu Terkait (Desktop Sidebar) */}
        {!isFocusMode && (
          <div className="lg:col-span-4 space-y-5">
            {/* 1. Chord Diagrams in Song (Guitarist Companion Box) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                    <Grid className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Diagram Kunci
                    </h2>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {currentSongChords.length} kunci di lagu ini
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleStrumAllChords}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Petik arpeggio semua kunci"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsSideChordsOpen(!isSideChordsOpen)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title={isSideChordsOpen ? 'Tutup diagram' : 'Buka diagram'}
                  >
                    {isSideChordsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isSideChordsOpen && (
                <div className="grid grid-cols-2 gap-2.5 pt-1 animate-in fade-in duration-150">
                  {currentSongChords.map((chordName) => {
                    const pos = getChordData(chordName);
                    return (
                      <div
                        key={chordName}
                        onClick={() => onOpenChordModal(chordName)}
                        className="cursor-pointer transition-transform hover:scale-[1.02]"
                        title="Klik untuk memperbesar diagram"
                      >
                        <ChordDiagram chord={pos} chordName={chordName} size="sm" showSoundButton={true} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Lagu Terkait */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4">
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
        )}
      </div>

      {/* ======================================================== */}
      {/* FLOATING AUTO SCROLL CONTROLLER (TAMPILAN MELAYANG OPTIMAL) */}
      {/* ======================================================== */}
      {!isFloatingMinimized ? (
        <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-auto max-w-xl transition-all duration-300 pb-[env(safe-area-inset-bottom,0px)]">
          <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-700/90 shadow-2xl rounded-2xl sm:rounded-full px-2 sm:px-4 py-1.5 sm:py-2.5 flex items-center justify-between sm:justify-center gap-1 sm:gap-3 ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
            {/* Reading Progress Indicator Bar on Top Edge */}
            <div
              className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-150"
              style={{ width: `${scrollProgress}%` }}
              title={`Progres membaca: ${scrollProgress}%`}
            />

            {/* 1. Status Indicator & Mode */}
            <div className="flex items-center gap-2 pr-1 sm:pr-2 border-r border-slate-200 dark:border-slate-800 shrink-0">
              <span className="relative flex h-2.5 w-2.5">
                {autoScrollActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isFinished
                      ? 'bg-blue-500'
                      : autoScrollActive
                      ? 'bg-emerald-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                ></span>
              </span>
              <div className="hidden xs:block text-left">
                <div className="flex items-center gap-1.5 leading-none">
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    Auto Scroll
                  </p>
                  <span className="text-[9px] font-mono font-semibold px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {scrollProgress}%
                  </span>
                </div>
                <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                  {isFinished
                    ? 'Selesai di akhir lirik'
                    : autoScrollActive
                    ? scrollSpeed === 0
                      ? 'Diam (0.0x)'
                      : 'Mulai dari awal lirik'
                    : 'Dijeda (Spasi)'}
                </p>
              </div>
            </div>

            {/* 2. Main Play / Pause / Restart Button */}
            <button
              onClick={() => handleToggleAutoScroll()}
              className={`px-3.5 sm:px-5 py-2 sm:py-2.5 min-h-[42px] sm:min-h-[44px] rounded-xl sm:rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95 shrink-0 ${
                isFinished
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/30 shadow-emerald-500/20'
                  : autoScrollActive
                  ? 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-400/30 shadow-amber-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-500/30 shadow-blue-500/20'
              }`}
              title={
                isFinished
                  ? 'Klik untuk mengulangi scroll dari awal lirik (R)'
                  : 'Spasi: Jeda atau Mulai auto scroll'
              }
              aria-label={autoScrollActive ? 'Jeda scroll' : 'Mulai auto scroll'}
            >
              {autoScrollActive ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Jeda</span>
                </>
              ) : isFinished ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ulangi</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Mulai</span>
                </>
              )}
            </button>

            {/* 3. Speed Stepper: [-] 0.5x [+] */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl sm:rounded-full p-0.5 border border-slate-200/60 dark:border-slate-700/60 shrink-0 min-h-[40px]">
              <button
                onClick={() => handleSpeedStep(-1)}
                disabled={scrollSpeed <= 0.0}
                className="p-2 sm:p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg sm:rounded-full text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                title="Kurangi kecepatan [Arrow Down / -]"
                aria-label="Kurangi kecepatan"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              {/* Speed button with popover options + slider */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="px-2 py-1 text-xs font-bold font-mono text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer flex items-center gap-0.5 min-h-[36px]"
                  title="Klik untuk memilih slider atau preset kecepatan (0.0x - 1.0x)"
                  aria-label="Pilih kecepatan"
                >
                  <span>{scrollSpeed.toFixed(1)}x</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showSpeedMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-50"
                      onClick={() => setShowSpeedMenu(false)}
                    />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-56 max-w-[85vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-60 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <Sliders className="w-3 h-3 text-blue-500" />
                          Kecepatan Scroll
                        </span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {scrollSpeed.toFixed(1)}x
                        </span>
                      </div>

                      {/* Smooth Slider Bar */}
                      <div className="space-y-1">
                        <input
                          type="range"
                          min="0.0"
                          max="1.0"
                          step="0.05"
                          value={scrollSpeed}
                          onChange={(e) => setScrollSpeed(Number(e.target.value))}
                          className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                          <span>0.0x (Diam)</span>
                          <span>0.5x</span>
                          <span>1.0x (Max)</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-2 space-y-1">
                        <p className="font-semibold text-slate-400 text-[10px] uppercase">
                          Preset Cepat
                        </p>
                        <div className="max-h-44 overflow-y-auto space-y-0.5 pr-0.5">
                          {speedOptions.map((s) => (
                            <button
                              key={s.value}
                              onClick={() => {
                                setScrollSpeed(s.value);
                                setShowSpeedMenu(false);
                              }}
                              className={`w-full px-2 py-1 text-left rounded-lg font-medium cursor-pointer transition-colors flex items-center justify-between ${
                                Math.abs(scrollSpeed - s.value) < 0.05
                                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <span>{s.label}</span>
                              <span className="text-[10px] text-slate-400 font-normal">{s.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => handleSpeedStep(1)}
                disabled={scrollSpeed >= 1.0}
                className="p-2 sm:p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg sm:rounded-full text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                title="Tambah kecepatan [Arrow Up / +]"
                aria-label="Tambah kecepatan"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 4. Quick Scroll to Start of Lyrics */}
            <button
              onClick={scrollToLyricsStart}
              className="p-2 sm:p-2 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl sm:rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors shrink-0"
              title="Lompat ke awal lirik (R / Home)"
              aria-label="Lompat ke awal lirik"
            >
              <ChevronsUp className="w-4 h-4" />
            </button>

            {/* 5. Minimize to Pill Button */}
            <button
              onClick={() => setIsFloatingMinimized(true)}
              className="p-2 sm:p-2 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl sm:rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors shrink-0"
              title="Perkecil panel melayang"
              aria-label="Perkecil panel"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Minimized floating button in bottom right */
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 pb-[env(safe-area-inset-bottom,0px)]">
          <button
            onClick={() => setIsFloatingMinimized(false)}
            className="group flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 cursor-pointer transition-all active:scale-95 ring-1 ring-black/5"
            title="Buka panel Auto Scroll melayang"
            aria-label="Buka kontrol autoscroll"
          >
            <span className="relative flex h-2.5 w-2.5">
              {autoScrollActive ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              ) : isFinished ? (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-400"></span>
              )}
            </span>
            <span className="text-xs font-bold font-mono">
              {isFinished ? 'Selesai' : `${scrollSpeed.toFixed(1)}x`}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">({scrollProgress}%)</span>
            <Maximize2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};
