import React from 'react';
import { Heart, Music, Sparkles, HardDriveDownload, Edit3, Trash2, Eye } from 'lucide-react';
import { Song } from '../types/chord';
import { isSongCachedOffline } from '../utils/offlineStorage';
import { useSongLiveStats } from '../utils/realtimeStats';

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
  const { totalViews, formattedViews, preciseViews, totalLikes, formattedLikes } = useSongLiveStats(
    song.id,
    song.views,
    song.likes,
    isFavorite
  );

  return (
    <div
      onClick={() => onSelect(song)}
      className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.99] touch-manipulation"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
              <Music className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {song.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-medium">{song.artist}</p>
            </div>
          </div>

          {/* Favorite Toggle Button with Realtime Count (Enhanced touch target for mobile) */}
          <button
            type="button"
            onClick={(e) => onToggleFavorite(e, song.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-full transition-all cursor-pointer shrink-0 ${
              isFavorite
                ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/50 font-bold border border-rose-200 dark:border-rose-900/50 shadow-2xs'
                : 'text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
            aria-label={isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
            <span className="text-xs font-semibold">{formattedLikes}</span>
          </button>
        </div>

        {/* Chords preview pills + Genre badge */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {song.genre && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              {song.genre}
            </span>
          )}
          {song.chords.slice(0, 4).map((chord) => (
            <span
              key={chord}
              className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
            >
              {chord}
            </span>
          ))}
          {song.chords.length > 4 && (
            <span className="font-mono text-[10px] text-slate-400 self-center">
              +{song.chords.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Meta Footer */}
      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs gap-2">
        <div className="flex items-center gap-2 flex-wrap">
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

        {/* Realtime Stats: Views & Favorites */}
        <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 font-medium text-[11px] shrink-0">
          <span
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            title={`Total tayangan realtime: ${preciseViews} tayangan`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            <span>{formattedViews}</span>
          </span>
          <span
            className={`flex items-center gap-1 transition-colors ${
              isFavorite ? 'text-rose-500 font-bold' : ''
            }`}
            title={`Total disukai: ${totalLikes.toLocaleString('id-ID')} favorit`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
            <span>{formattedLikes}</span>
          </span>

          {song.isCustom && (
            <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-200 dark:border-slate-800">
              {onEdit && (
                <button
                  onClick={(e) => onEdit(e, song)}
                  className="p-1 min-w-[28px] min-h-[28px] flex items-center justify-center text-slate-400 hover:text-amber-500 transition-colors"
                  title="Edit Chord Ini"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => onDelete(e, song.id)}
                  className="p-1 min-w-[28px] min-h-[28px] flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                  title="Hapus Lagu Ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {song.difficulty && !song.isCustom && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5 ${
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
