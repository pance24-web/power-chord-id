import React, { useState, useMemo } from 'react';
import { Song } from '../types/chord';
import { Search, User, Music, ChevronRight, Sparkles } from 'lucide-react';

interface ArtistsViewProps {
  songs: Song[];
  onSelectSong: (song: Song) => void;
  onSelectArtist: (artistName: string) => void;
}

export const ArtistsView: React.FC<ArtistsViewProps> = ({
  songs,
  onSelectSong,
  onSelectArtist,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string>('all');

  // Group songs by artist
  const artistsMap = useMemo(() => {
    const map = new Map<string, Song[]>();
    songs.forEach((song) => {
      const current = map.get(song.artist) || [];
      current.push(song);
      map.set(song.artist, current);
    });
    return map;
  }, [songs]);

  const artistsList = useMemo(() => {
    const list = Array.from(artistsMap.entries()).map(([artist, artistSongs]) => {
      const totalViews = artistSongs.reduce((acc, s) => {
        const val = s.views ? parseFloat(s.views.replace('K', '')) : 0;
        return acc + val;
      }, 0);
      return {
        name: artist,
        songs: artistSongs,
        songCount: artistSongs.length,
        genres: Array.from(new Set(artistSongs.map((s) => s.genre))),
        approxViews: `${totalViews.toFixed(1)}K`,
      };
    });

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [artistsMap]);

  const filteredArtists = useMemo(() => {
    return artistsList.filter((a) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        if (!a.name.toLowerCase().includes(q)) return false;
      }
      if (selectedLetter !== 'all') {
        if (!a.name.toUpperCase().startsWith(selectedLetter)) return false;
      }
      return true;
    });
  }, [artistsList, searchQuery, selectedLetter]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Daftar Artis & Musisi
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Temukan chord lagu berdasarkan artis favoritmu di Indonesia dan mancanegara.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama artis (cth: Dewa 19, Endank Soekamti, Rizky Febian)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            Hapus
          </button>
        )}
      </div>

      {/* Alphabet Letters Filter */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedLetter('all')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors shrink-0 cursor-pointer ${
            selectedLetter === 'all'
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'bg-white dark:bg-[#131B2E] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Semua
        </button>
        {alphabet.map((char) => (
          <button
            key={char}
            onClick={() => setSelectedLetter(char)}
            className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer ${
              selectedLetter === char
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white dark:bg-[#131B2E] text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {char}
          </button>
        ))}
      </div>

      {/* Artist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArtists.map((artist) => (
          <div
            key={artist.name}
            onClick={() => onSelectArtist(artist.name)}
            className="group p-4 bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs hover:shadow-md hover:border-indigo-500/40 dark:hover:border-indigo-500/30 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base shrink-0 group-hover:scale-105 transition-transform">
                {artist.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                  {artist.name}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>{artist.songCount} lagu</span>
                  <span>•</span>
                  <span>{artist.genres.slice(0, 2).join(', ')}</span>
                </div>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        ))}
      </div>

      {filteredArtists.length === 0 && (
        <div className="py-12 text-center bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <p className="text-sm text-slate-500">Tidak ada artis yang cocok dengan pencarian.</p>
        </div>
      )}
    </div>
  );
};
