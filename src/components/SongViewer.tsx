import React, { useState, useMemo, useEffect } from 'react';
import { Song, ChordDefinition, ThemeType } from '../types/chord';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { cacheViewedSong } from '../utils/offlineStorage';
import {
  transposeSongContent,
  transposeNote,
  extractUniqueChords,
  isChordLine,
  isChordToken,
} from '../utils/chordTransposer';
import { getChordDefinition } from '../utils/chordDb';
import { ChordDiagram } from './ChordDiagram';
import { ChordModal } from './ChordModal';
import { ChordHoverToken } from './ChordHoverToken';
import { ThemeToggle } from './ThemeToggle';
import { FloatingAutoScroll } from './FloatingAutoScroll';
import {
  ArrowLeft,
  Eye,
  Heart,
  Share2,
  Copy,
  Check,
  ChevronDown,
  MoreHorizontal,
  ChevronRight,
  Maximize2,
  Minimize2,
  Printer,
  Music,
  BookOpen,
  WifiOff,
} from 'lucide-react';

interface SongViewerProps {
  song: Song;
  allSongs: Song[];
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (songId: string) => void;
  onSelectRelatedSong: (song: Song) => void;
  onNavigateCatalog: () => void;
  onOpenTuner?: () => void;
  onOpenDictionary?: () => void;
  theme?: ThemeType;
  setTheme?: (theme: ThemeType) => void;
}

export const SongViewer: React.FC<SongViewerProps> = ({
  song,
  allSongs,
  onBack,
  isFavorite,
  onToggleFavorite,
  onSelectRelatedSong,
  onNavigateCatalog,
  onOpenTuner,
  onOpenDictionary,
  theme = 'light',
  setTheme,
}) => {
  const isOnline = useOnlineStatus();

  // Auto-cache song for offline viewing
  useEffect(() => {
    cacheViewedSong(song);
  }, [song]);

  // Transposition
  const [transposeStep, setTransposeStep] = useState<number>(0);
  const [capoFret, setCapoFret] = useState<number>(song.capo || 0);
  const [accidental, setAccidental] = useState<'sharp' | 'flat'>('sharp');

  // Font size: default 15
  const [fontSize, setFontSize] = useState<number>(15);

  // Feedback states
  const [copied, setCopied] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const [showDiagrams, setShowDiagrams] = useState<boolean>(true);

  // Inspected chord for diagram popup
  const [inspectedChord, setInspectedChord] = useState<ChordDefinition | null>(null);
  const [inspectedChordName, setInspectedChordName] = useState<string>('');

  // Transpose song content based on transposeStep
  const transposedContent = useMemo(() => {
    return transposeSongContent(song.content, transposeStep, accidental);
  }, [song.content, transposeStep, accidental]);

  // Current key
  const currentKey = useMemo(() => {
    return transposeNote(song.originalKey, transposeStep, accidental);
  }, [song.originalKey, transposeStep, accidental]);

  // Unique chords in song
  const uniqueChords = useMemo(() => {
    return extractUniqueChords(transposedContent);
  }, [transposedContent]);

  // Related songs: pick 5 related songs
  const relatedSongs = useMemo(() => {
    return allSongs
      .filter((s) => s.id !== song.id)
      .slice(0, 5);
  }, [allSongs, song.id]);

  // Reset transpose when song changes
  useEffect(() => {
    setTransposeStep(0);
    setCapoFret(song.capo || 0);
  }, [song.id, song.capo]);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${song.title} - ${song.artist}\nKey: ${currentKey}\n\n${transposedContent}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${song.title} - ${song.artist} | PowerChord`,
        text: `Chord dan lirik lagu ${song.title} oleh ${song.artist} di PowerChord`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleChordClick = (chordName: string) => {
    const def = getChordDefinition(chordName);
    setInspectedChord(def);
    setInspectedChordName(chordName);
  };

  const renderLine = (line: string, index: number) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={index} className="h-3" />;
    }

    // Section markers: [Intro], Intro :, [Verse 1], [Hook], [Outro], etc.
    if (/^(\[|\()?(\s*(Intro|Verse|Reff|Refrain|Chorus|Hook|Bridge|Interlude|Solo|Outro|Bait|Pre-Chorus|Ending)[\s\d:.-]*)(\]|\))?$/i.test(trimmed)) {
      const cleanHeader = trimmed.replace(/^[\[\(]+|[\]\)]+$/g, '').trim();
      return (
        <div key={index} className="pt-4 pb-1 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
          <span>{cleanHeader}</span>
        </div>
      );
    }

    // Chord line
    if (isChordLine(line)) {
      const parts = line.split(/(\s+)/);
      return (
        <div
          key={index}
          className="font-bold text-indigo-700 dark:text-indigo-400 select-text leading-relaxed py-1 whitespace-pre font-mono tracking-wide flex flex-wrap items-center gap-y-1"
        >
          {parts.map((part, pIdx) => {
            if (/^\s+$/.test(part)) {
              return <span key={pIdx}>{part}</span>;
            }
            if (isChordToken(part)) {
              return (
                <ChordHoverToken
                  key={pIdx}
                  chordName={part}
                  onClick={() => handleChordClick(part)}
                />
              );
            }
            return (
              <span key={pIdx} className="text-slate-500 dark:text-slate-400 font-sans text-xs font-normal">
                {part}
              </span>
            );
          })}
        </div>
      );
    }

    // Normal lyric line
    return (
      <div key={index} className="leading-relaxed py-0.5 text-neutral-800 dark:text-neutral-200 font-sans">
        {line}
      </div>
    );
  };

  return (
    <div className="pb-28 max-w-6xl mx-auto space-y-4">
      {/* 1. Breadcrumb */}
      <div className="no-print">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke katalog</span>
        </button>
      </div>

      {/* Main Grid: Left is chord sheet, Right is Lagu Terkait */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Title, Toolbar, Lyrics & Chords */}
        <div className="lg:col-span-8 space-y-4">
          {/* Song Header Card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                {song.title}
              </h1>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mt-0.5">
                {song.artist}
              </p>
            </div>

            {/* Genre & Tag Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold">
                {song.genre}
              </span>
              {song.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Stats row: Views, Likes, Share, Offline Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{song.views || '12.4K'}</span>
                </span>

                <button
                  onClick={() => onToggleFavorite(song.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    isFavorite
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold border border-rose-200/60 dark:border-rose-800/60'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium'
                  }`}
                  title={isFavorite ? 'Hapus dari favorit' : 'Simpan lagu ke favorit & cache offline'}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : 'text-rose-500'}`} />
                  <span>{isFavorite ? 'Favorit Offline' : 'Simpan Favorit'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title="Bagikan lagu"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{shared ? 'Tautan Disalin!' : 'Bagikan'}</span>
                </button>
              </div>

              {/* Offline availability indicators */}
              <div className="flex items-center gap-2">
                {isFavorite && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 font-semibold text-[11px]"
                    title="Lagu ini tersimpan di memori perangkat & dapat dimainkan tanpa koneksi internet"
                  >
                    <Check className="w-3 h-3" />
                    <span>Siap Offline</span>
                  </span>
                )}
                {!isOnline && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 font-semibold text-[11px]">
                    <WifiOff className="w-3 h-3 text-amber-500" />
                    <span>Mode Offline</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Toolbar (Transpose, Capo, Font Size, Theme Mode, Copy) */}
          <div className="bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs no-print">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {/* Transpose Label & Controls */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">Chord</span>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                  <button
                    onClick={() => setTransposeStep((prev) => prev - 1)}
                    className="px-2.5 py-1 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Turunkan 1 semitone"
                  >
                    -
                  </button>
                  <span className="px-2.5 py-1 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-center min-w-[28px]">
                    {transposeStep > 0 ? `+${transposeStep}` : transposeStep}
                  </span>
                  <button
                    onClick={() => setTransposeStep((prev) => prev + 1)}
                    className="px-2.5 py-1 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Naikkan 1 semitone"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Capo Dropdown */}
              <div className="relative">
                <select
                  value={capoFret}
                  onChange={(e) => setCapoFret(Number(e.target.value))}
                  className="appearance-none pl-3 pr-7 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value={0}>Capo 0</option>
                  {[1, 2, 3, 4, 5, 6, 7].map((f) => (
                    <option key={f} value={f}>
                      Capo {f}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>

              {/* Font Size controls (A-, A, A+) */}
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800">
                <button
                  onClick={() => setFontSize(13)}
                  className={`px-2 py-1 font-semibold transition-colors cursor-pointer ${
                    fontSize === 13 ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title="Ukuran Kecil"
                >
                  A-
                </button>
                <button
                  onClick={() => setFontSize(15)}
                  className={`px-2 py-1 font-semibold transition-colors cursor-pointer ${
                    fontSize === 15 ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title="Ukuran Sedang (Normal)"
                >
                  A
                </button>
                <button
                  onClick={() => setFontSize(18)}
                  className={`px-2 py-1 font-semibold transition-colors cursor-pointer ${
                    fontSize === 18 ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title="Ukuran Besar"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Quick Actions, Mode Toggle & Copy Button */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setShowDiagrams(!showDiagrams)}
                className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  showDiagrams
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
                title={showDiagrams ? 'Sembunyikan Diagram Kunci' : 'Tampilkan Diagram Kunci'}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{showDiagrams ? 'Diagram On' : 'Diagram'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Cetak / Print Lembar Chord"
                aria-label="Cetak / Print Lembar Chord"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>

              {setTheme && (
                <ThemeToggle theme={theme} setTheme={setTheme} variant="compact" />
              )}

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors shadow-2xs cursor-pointer text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Tersalin!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Chord Diagram Gallery (Collapsible preview) */}
          {showDiagrams && uniqueChords.length > 0 && (
            <div className="bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-2xs no-print">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Kunci yang Digunakan:
                </span>
                <span className="text-[11px] text-slate-400">
                  Klik diagram untuk dengar petikan nada
                </span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
                {uniqueChords.map((chord) => {
                  const def = getChordDefinition(chord);
                  if (!def) return null;
                  return (
                    <div
                      key={chord}
                      onClick={() => handleChordClick(chord)}
                      className="p-2 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 cursor-pointer shrink-0 transition-colors"
                      title={`Klik untuk memperbesar kunci ${chord}`}
                    >
                      <ChordDiagram chord={def} size="sm" showPlayButton={true} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* The Chord & Lyrics Sheet Body */}
          <div
            id="lyrics-sheet-content"
            className="bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs select-text leading-relaxed font-mono relative scroll-mt-20"
            style={{ fontSize: `${fontSize}px` }}
          >
            {transposedContent.split('\n').map((line, idx) => renderLine(line, idx))}
          </div>
        </div>

        {/* Right Sidebar (4 cols): Lagu Terkait (Mockup 3 & 7) */}
        <div className="lg:col-span-4 space-y-4 no-print">
          <div className="bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Lagu Terkait
              </h3>
              <button
                onClick={onNavigateCatalog}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              {relatedSongs.map((relSong, idx) => (
                <div
                  key={relSong.id}
                  onClick={() => onSelectRelatedSong(relSong)}
                  className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5 w-4">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {relSong.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {relSong.artist}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold">
                      {relSong.genre}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inspect Chord Modal */}
      <ChordModal
        chord={inspectedChord}
        chordName={inspectedChordName}
        onClose={() => {
          setInspectedChord(null);
          setInspectedChordName('');
        }}
      />

      {/* Floating AutoScroll Control Widget */}
      <FloatingAutoScroll
        songId={song.id}
        tempo={song.tempo || 120}
        songTitle={song.title}
        songArtist={song.artist}
        songGenre={song.genre}
        songContent={transposedContent}
      />
    </div>
  );
};
