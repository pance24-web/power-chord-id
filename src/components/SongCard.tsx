import React from 'react';
import { Song } from '../types/chord';
import { Heart, Music } from 'lucide-react';

interface SongCardProps {
  song: Song;
  isFavorite: boolean;
  onSelect: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) => {
  return (
    <div
      onClick={() => onSelect(song)}
      className="group p-4 bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-2xs hover:shadow-md hover:border-amber-500/40 dark:hover:border-amber-500/30 transition-all duration-150 cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
              {song.title}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
              {song.artist}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(song.id);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              isFavorite
                ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title={isFavorite ? 'Hapus dari favorit' : 'Simpan ke favorit'}
            aria-label={`Favorit ${song.title}`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Clean unboxed metadata with subtle typographic separators */}
      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-1.5 font-medium truncate">
          <span>{song.genre}</span>
          <span aria-hidden="true" className="opacity-40">·</span>
          <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">Kunci: {song.originalKey}</span>
          {song.capo && song.capo > 0 ? (
            <>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span>Capo {song.capo}</span>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium shrink-0">
          <Music className="w-3 h-3 text-amber-500/70" />
          <span>{song.difficulty}</span>
        </div>
      </div>
    </div>
  );
};
