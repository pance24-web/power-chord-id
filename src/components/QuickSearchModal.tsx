import React, { useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const results = songs.filter((s) => {
    const q = query.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full overflow-hidden">
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
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length > 0 ? (
            results.map((song) => (
              <button
                key={song.id}
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
              </button>
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
