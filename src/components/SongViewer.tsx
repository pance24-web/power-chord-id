import React, { useState, useEffect } from 'react';
import { Song } from '../types/chord';
import { transposeText, transposeSingleChord } from '../utils/chordTransposer';
import { ChordHoverToken } from './ChordHoverToken';
import { AutoScrollController } from './AutoScrollController';
import { FloatingAutoScroll } from './FloatingAutoScroll';
import { cacheViewedSong } from '../utils/offlineStorage';
import {
  ArrowLeft,
  Heart,
  Printer,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Share2,
  Check,
  Disc,
} from 'lucide-react';

interface SongViewerProps {
  song: Song;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: (e: React.MouseEvent, songId: string) => void;
  onOpenChordModal: (chord: string) => void;
}

export const SongViewer: React.FC<SongViewerProps> = ({
  song,
  isFavorite,
  onBack,
  onToggleFavorite,
  onOpenChordModal,
}) => {
  const [transposeStep, setTransposeStep] = useState<number>(0);
  const [capoOffset, setCapoOffset] = useState<number>(song.capo || 0);
  const [fontSize, setFontSize] = useState<number>(14); // in px
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1.0);
  const [copied, setCopied] = useState<boolean>(false);

  // Cache viewed song for offline access
  useEffect(() => {
    cacheViewedSong(song);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTransposeStep(0);
    setCapoOffset(song.capo || 0);
  }, [song]);

  // Current effective key
  const effectiveKey = transposeSingleChord(song.originalKey, transposeStep);

  // Transposed song content
  const transposedContent = transposeText(song.content, transposeStep);

  // Unique chords in song transposed
  const transposedChords = song.chords.map((c) => transposeSingleChord(c, transposeStep));
  const uniqueChords = Array.from(new Set(transposedChords));

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Render formatted lines: detects bracketed chords [Am] or chord lines
  const renderFormattedLine = (line: string, lineIndex: number) => {
    // Empty line
    if (!line.trim()) {
      return <div key={lineIndex} className="h-4" />;
    }

    // Section header like [Intro], [Chorus], [Verse 1]
    if (/^\s*\[(Intro|Verse|Chorus|Pre-Chorus|Bridge|Interlude|Outro|Solo|Reff)[^\]]*\]\s*$/i.test(line)) {
      return (
        <div key={lineIndex} className="pt-4 pb-1 font-bold text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 border-b border-amber-500/20 mb-2">
          {line.trim()}
        </div>
      );
    }

    // Check if line has inline brackets like [C] [G]
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

    // Tokenized line check: if words look like chord line vs lyrics
    const words = line.split(/(\s+)/);
    const nonSpaces = words.filter((w) => w.trim().length > 0);
    const chordCount = nonSpaces.filter((w) => /^[A-G][b#]?(m|maj|min|dim|aug|sus|add|7|9|11|13|6|2)*(\/[A-G][b#]?)?$/.test(w.trim())).length;
    const isChordLine = nonSpaces.length > 0 && chordCount >= Math.ceil(nonSpaces.length * 0.7);

    if (isChordLine) {
      return (
        <div key={lineIndex} className="font-mono font-bold leading-relaxed whitespace-pre">
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

    // Regular lyric line
    return (
      <div key={lineIndex} className="font-sans leading-relaxed text-slate-800 dark:text-slate-200">
        {line}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Back button & Action Toolbar */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-amber-500 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 bg-white dark:bg-slate-900 cursor-pointer transition-all"
            title="Bagikan Tautan Chord"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Tersalin!' : 'Bagikan'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-500 bg-white dark:bg-slate-900 cursor-pointer transition-all"
            title="Cetak Chord Sheet"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          <button
            onClick={(e) => onToggleFavorite(e, song.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            <span>{isFavorite ? 'Tersimpan' : 'Favoritkan'}</span>
          </button>
        </div>
      </div>

      {/* Main Song Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {song.genre || 'Akustik & Gitar'}
              </span>
              {song.difficulty && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {song.difficulty}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {song.title}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-slate-500 mt-1">
              Artis: <span className="text-slate-800 dark:text-slate-200">{song.artist}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs">
              <span className="text-slate-400">Kunci Asli:</span>
              <span className="font-mono font-bold text-amber-500 text-sm">{song.originalKey}</span>
            </div>
            {song.tempo && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs">
                <span className="text-slate-400">Tempo:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">
                  {song.tempo} BPM
                </span>
              </div>
            )}
            {song.capo !== undefined && song.capo > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs">
                <span className="text-slate-400">Capo:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">Fret {song.capo}</span>
              </div>
            )}
          </div>
        </div>

        {/* Chords Used in Song Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold mr-1">Akor di lagu ini:</span>
          {uniqueChords.map((chord) => (
            <button
              key={chord}
              onClick={() => onOpenChordModal(chord)}
              className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
              title="Lihat diagram kunci"
            >
              {chord}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Controls Bar: Transpose, Capo, Font Size, Autoscroll */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-md flex flex-wrap items-center justify-between gap-3 no-print">
        {/* Transpose Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Transpose:</span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setTransposeStep((prev) => prev - 1)}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
              title="Turunkan 1/2 nada (-1)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-xs font-bold px-2.5 text-amber-600 dark:text-amber-400 min-w-8 text-center">
              {effectiveKey} ({transposeStep >= 0 ? `+${transposeStep}` : transposeStep})
            </span>
            <button
              onClick={() => setTransposeStep((prev) => prev + 1)}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
              title="Naikkan 1/2 nada (+1)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {transposeStep !== 0 && (
            <button
              onClick={() => setTransposeStep(0)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 text-xs cursor-pointer"
              title="Reset ke Kunci Asli"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Font size adjustments */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 hidden sm:inline">Ukuran:</span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setFontSize((s) => Math.max(12, s - 1))}
              disabled={fontSize <= 12}
              className="px-2 py-1 text-xs font-bold hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 cursor-pointer"
            >
              A-
            </button>
            <span className="font-mono text-[11px] px-1.5 text-slate-600 dark:text-slate-300">
              {fontSize}px
            </span>
            <button
              onClick={() => setFontSize((s) => Math.min(22, s + 1))}
              disabled={fontSize >= 22}
              className="px-2 py-1 text-xs font-bold hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 cursor-pointer"
            >
              A+
            </button>
          </div>
        </div>

        {/* AutoScroll Controller in toolbar */}
        <AutoScrollController
          isScrolling={isScrolling}
          speed={scrollSpeed}
          onToggle={() => setIsScrolling(!isScrolling)}
          onSpeedChange={setScrollSpeed}
        />
      </div>

      {/* Chord & Lyrics Viewer Container */}
      <div className="chord-sheet-container bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs">
        <div
          className="space-y-1 select-text"
          style={{ fontSize: `${fontSize}px` }}
        >
          {transposedContent.split('\n').map((line, idx) => renderFormattedLine(line, idx))}
        </div>
      </div>

      {/* Floating Auto-Scroll Overlay for Hands-Free Play */}
      <FloatingAutoScroll
        isScrolling={isScrolling}
        speed={scrollSpeed}
        onToggle={() => setIsScrolling(!isScrolling)}
        onSpeedChange={setScrollSpeed}
      />
    </div>
  );
};
