import React, { useState, useMemo } from 'react';
import { Song } from '../types/chord';
import { Users, Music, ChevronRight } from 'lucide-react';

interface ArtistsViewProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
}

export const ArtistsView: React.FC<ArtistsViewProps> = ({ songs, onSelectSong }) => {
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

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
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daftar Artis &amp; Band</h2>
          <p className="text-xs text-slate-500 mt-1">
            Jelajahi kumpulan chord lagu berdasarkan artis atau grup band favoritmu
          </p>
        </div>
        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
          <Users className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {artistsMap.map(([artist, artistSongs]) => (
          <div
            key={artist}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-amber-400 dark:hover:border-amber-500/70 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{artist}</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                {artistSongs.length} Lagu
              </span>
            </div>

            <div className="space-y-1.5">
              {artistSongs.map((song) => (
                <button
                  key={song.id}
                  onClick={() => onSelectSong(song)}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                >
                  <span className="font-medium group-hover:text-amber-500 line-clamp-1">
                    {song.title}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
