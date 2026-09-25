import React, { useMemo } from 'react';
import { Song } from '../types/chord';
import { Users, ChevronRight, Music2 } from 'lucide-react';

interface ArtistsViewProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
}

export const ArtistsView: React.FC<ArtistsViewProps> = ({ songs, onSelectSong }) => {
  // Group songs by artist
  const artistsMap = useMemo(() => {
    const map = new Map<string, Song[]>();
    songs.forEach((song) => {
      const list = map.get(song.artist) || [];
      list.push(song);
      map.set(song.artist, list);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [songs]);

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Daftar Artis &amp; Band
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Jelajahi kumpulan chord lagu berdasarkan musisi dan grup band favoritmu
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Users className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {artistsMap.map(([artist, artistSongs]) => (
          <div
            key={artist}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 sm:p-5 shadow-2xs transition-all"
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                {artist}
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                {artistSongs.length} Lagu
              </span>
            </div>

            <div className="space-y-1">
              {artistSongs.map((song) => (
                <button
                  key={song.id}
                  onClick={() => onSelectSong(song)}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group"
                >
                  <span className="font-medium truncate flex items-center gap-1.5">
                    <Music2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                    {song.title}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
