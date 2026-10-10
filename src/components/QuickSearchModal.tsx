import React, { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import Link from 'next/link';
import { Search, X, Music, ChevronRight } from 'lucide-react';
import { Song } from '../types/chord';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: Song[];
  onSelectSong: (song: Song) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  songs,
  onSelectSong,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(query);

  const searchIndex = useMemo(
    () =>
      songs.map((song) => ({
        song,
        title: song.title.toLocaleLowerCase('id-ID'),
        artist: song.artist.toLocaleLowerCase('id-ID'),
        genre: song.genre?.toLocaleLowerCase('id-ID') || '',
        tags: song.tags?.map((tag) => tag.toLocaleLowerCase('id-ID')).join(' ') || '',
        chords: song.chords.join(' ').toLocaleLowerCase('id-ID'),
      })),
    [songs],
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = useMemo(() => {
    const q = deferredQuery.toLocaleLowerCase('id-ID').trim();
    if (!q) return searchIndex.map(({ song }) => song);

    return searchIndex
      .filter(({ title, artist, genre, tags, chords }) =>
        [title, artist, genre, tags, chords].some((field) => field.includes(q)),
      )
      .map(({ song }) => song);
  }, [deferredQuery, searchIndex]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full overflow-hidden"
      >
        {/* Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ketik judul lagu atau nama artis..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-hidden text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-800 rounded">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex items-center justify-between px-4 pt-3 text-[11px] font-semibold text-slate-400">
          <span>{query.trim() ? `${results.length} hasil ditemukan` : 'Cari berdasarkan judul, artis, genre, atau chord'}</span>
          <span className="hidden sm:inline">Esc tutup</span>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length > 0 ? (
            results.map((song) => (
              <Link
                key={song.id}
                href={`/chord/${song.id}`}
                onClick={() => {
                  onSelectSong(song);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {song.title}
                    </h4>
                    <p className="text-xs text-slate-400">{song.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {song.genre && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      {song.genre}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-600 transition-all" />
                </div>
              </Link>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Tidak ada lagu yang cocok dengan &quot;{query}&quot;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
