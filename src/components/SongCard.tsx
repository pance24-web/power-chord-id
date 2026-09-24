import React from 'react';
import { Heart, Music, Sparkles, HardDriveDownload, Edit3, Trash2 } from 'lucide-react';
import { Song } from '../types/chord';
import { isSongCachedOffline } from '../utils/offlineStorage';

interface SongCardProps {
  song: Song;
  isFavorite: boolean;
  favoritesList: string[];
  onSelect: (song: Song) => void;
  onToggleFavorite: (e: React.MouseEvent, songId: string) => void;
  onEdit?: (e: React.MouseEvent, song: Song) => void;
  onDelete?: (e: React.MouseEvent, songId: string) => void;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  isFavorite,
  favoritesList,
  onSelect,
  onToggleFavorite,
  onEdit,
  onDelete,
}) => {
  const isCached = isSongCachedOffline(song.id, favoritesList);

  return (
    <div
      onClick={() => onSelect(song)}
      className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/70 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all shrink-0">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
                {song.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1 font-medium">{song.artist}</p>
            </div>
          </div>

          {/* Favorite Toggle Button */}
          <button
            type="button"
            onClick={(e) => onToggleFavorite(e, song.id)}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isFavorite
                ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                : 'text-slate-300 dark:text-slate-600 hover:text-rose-400'
            }`}
            title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Chords preview pills */}
        <div className="flex flex-wrap gap-1 mb-3">
          {song.chords.slice(0, 5).map((chord) => (
            <span
              key={chord}
              className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
            >
              {chord}
            </span>
          ))}
          {song.chords.length > 5 && (
            <span className="font-mono text-[10px] text-slate-400 self-center">
              +{song.chords.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* Meta Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
            Key: {song.originalKey}
          </span>
          {song.capo && song.capo > 0 ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
              Capo {song.capo}
            </span>
          ) : null}
          {isCached && (
            <span
              className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"
              title="Tersimpan di memori offline perangkat"
            >
              <HardDriveDownload className="w-3 h-3" />
              Offline
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {song.isCustom && (
            <>
              {onEdit && (
                <button
                  onClick={(e) => onEdit(e, song)}
                  className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
                  title="Edit Chord Ini"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => onDelete(e, song.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Hapus Lagu Ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
          {song.difficulty && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                song.difficulty === 'Mudah'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : song.difficulty === 'Sedang'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {song.difficulty}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
