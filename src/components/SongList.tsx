import React, { useState, useMemo } from 'react';
import { Song } from '../types/chord';
import { SongCard } from './SongCard';
import { Search, Filter, Music, Heart, SortAsc } from 'lucide-react';

interface SongListProps {
  songs: Song[];
  favorites: string[];
  onSelectSong: (song: Song) => void;
  onToggleFavorite: (e: React.MouseEvent, songId: string) => void;
  onEditSong?: (e: React.MouseEvent, song: Song) => void;
  onDeleteSong?: (e: React.MouseEvent, songId: string) => void;
  filterFavoritesOnly?: boolean;
}

export const SongList: React.FC<SongListProps> = ({
  songs,
  favorites,
  onSelectSong,
  onToggleFavorite,
  onEditSong,
  onDeleteSong,
  filterFavoritesOnly = false,
}) => {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('Semua');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Semua');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(filterFavoritesOnly);

  // Extract unique genres
  const genres = useMemo(() => {
    const list = songs.map((s) => s.genre).filter(Boolean) as string[];
    return ['Semua', ...Array.from(new Set(list))];
  }, [songs]);

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const q = search.toLowerCase();
      const matchSearch =
        song.title.toLowerCase().includes(q) ||
        song.artist.toLowerCase().includes(q) ||
        song.chords.some((c) => c.toLowerCase().includes(q));

      const matchGenre = selectedGenre === 'Semua' || song.genre === selectedGenre;
      const matchDiff = selectedDifficulty === 'Semua' || song.difficulty === selectedDifficulty;
      const matchFav = !showFavoritesOnly || favorites.includes(song.id);

      return matchSearch && matchGenre && matchDiff && matchFav;
    });
  }, [songs, search, selectedGenre, selectedDifficulty, showFavoritesOnly, favorites]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari lagu, artis, atau chord (misal: Sheila On 7, Peterpan, G C D)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Favorites filter toggle */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              showFavoritesOnly
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            <span>Favorit ({favorites.length})</span>
          </button>
        </div>

        {/* Filter categories pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Genre:
          </span>
          {genres.slice(0, 7).map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedGenre === genre
                  ? 'bg-amber-500 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
        <span>Menampilkan {filteredSongs.length} dari {songs.length} chord lagu</span>
        {search && <span>Hasil pencarian: &quot;{search}&quot;</span>}
      </div>

      {/* Grid of Songs */}
      {filteredSongs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              isFavorite={favorites.includes(song.id)}
              favoritesList={favorites}
              onSelect={onSelectSong}
              onToggleFavorite={onToggleFavorite}
              onEdit={onEditSong}
              onDelete={onDeleteSong}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
            <Music className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Lagu Tidak Ditemukan</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada lagu yang cocok dengan kriteria pencarian Anda. Anda dapat mengajukan request lagu baru atau menambahkannya secara manual.
          </p>
        </div>
      )}
    </div>
  );
};
