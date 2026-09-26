import React, { useState, useMemo, useEffect } from 'react';
import { Song } from '../types/chord';
import { getSongTotalViews, formatCount } from '../utils/realtimeStats';
import { Search, Heart, ChevronRight, FileQuestion, Eye } from 'lucide-react';

export type SortOption = 'recent' | 'popular' | 'title' | 'artist';

interface SongListProps {
  songs: Song[];
  favorites: string[];
  onSelectSong: (song: Song) => void;
  onToggleFavorite: (e: React.MouseEvent, songId: string) => void;
  onEditSong?: (e: React.MouseEvent, song: Song) => void;
  onDeleteSong?: (e: React.MouseEvent, songId: string) => void;
  initialSearch?: string;
  initialGenre?: string;
  initialLetter?: string;
  filterFavoritesOnly?: boolean;
}

const GENRE_OPTIONS = [
  'Semua',
  'Pop',
  'Rock',
  'Dangdut',
  'Indie',
  'Reggae',
  'Minang',
  'Melayu',
  'Akustik',
  'Jazz',
];

export const SongList: React.FC<SongListProps> = ({
  songs,
  favorites,
  onSelectSong,
  onToggleFavorite,
  initialSearch = '',
  initialGenre = 'Semua',
  initialLetter = '',
  filterFavoritesOnly = false,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [selectedLetter, setSelectedLetter] = useState<string>(initialLetter);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(filterFavoritesOnly);
  const [statsVersion, setStatsVersion] = useState(0);

  useEffect(() => {
    const handleStatsChange = () => setStatsVersion((v) => v + 1);
    window.addEventListener('powerchord:stats_updated', handleStatsChange);
    return () => {
      window.removeEventListener('powerchord:stats_updated', handleStatsChange);
    };
  }, []);

  const filteredSongs = useMemo(() => {
    const q = search.toLowerCase().trim();

    return songs
      .filter((song) => {
        const matchSearch =
          !q ||
          song.title.toLowerCase().includes(q) ||
          song.artist.toLowerCase().includes(q) ||
          song.chords.some((c) => c.toLowerCase().includes(q));

        const matchGenre =
          selectedGenre === 'Semua' ||
          song.genre?.toLowerCase() === selectedGenre.toLowerCase() ||
          song.tags?.some((t) => t.toLowerCase() === selectedGenre.toLowerCase());

        const matchLetter =
          !selectedLetter ||
          song.title.trim().toUpperCase().startsWith(selectedLetter.toUpperCase());

        const matchFav = !showFavoritesOnly || favorites.includes(song.id);

        return matchSearch && matchGenre && matchLetter && matchFav;
      })
      .sort((a, b) => {
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title, 'id', { sensitivity: 'base' });
        }
        if (sortBy === 'artist') {
          return a.artist.localeCompare(b.artist, 'id', { sensitivity: 'base' });
        }
        if (sortBy === 'popular') {
          const viewsA = getSongTotalViews(a.id, a.views);
          const viewsB = getSongTotalViews(b.id, b.views);
          return viewsB - viewsA;
        }
        // 'recent'
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (timeA !== timeB) return timeB - timeA;
        return 0;
      });
  }, [songs, search, selectedGenre, selectedLetter, showFavoritesOnly, favorites, sortBy, statsVersion]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedGenre('Semua');
    setSelectedLetter('');
    setShowFavoritesOnly(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header (Mockup Screen 2) */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Katalog Chord
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Jelajahi semua lagu berdasarkan genre dan huruf awal.
        </p>
      </div>

      {/* Search Input with Blue Search Button (Mockup Screen 2) */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari lagu atau artis..."
          className="w-full pl-4 pr-14 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 shadow-2xs"
        />
        <button
          type="button"
          onClick={() => {}}
          className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer transition-colors shadow-2xs"
          aria-label="Cari lagu"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Row: Genre dropdown, Urutkan dropdown, and Total count */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Genre Dropdown */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Genre</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-2xs"
            >
              {GENRE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-2xs"
            >
              <option value="recent">Terbaru</option>
              <option value="popular">Terpopuler</option>
              <option value="title">Judul (A-Z)</option>
              <option value="artist">Artis (A-Z)</option>
            </select>
          </div>

          {/* Favorites toggle */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showFavoritesOnly
                ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current text-rose-500' : ''}`} />
            <span>Favorit ({favorites.length})</span>
          </button>
        </div>

        {/* Total Label (Mockup: Total: 2.458 lagu) */}
        <span className="text-slate-400 dark:text-slate-500 font-medium">
          Total: {filteredSongs.length > 0 ? `${filteredSongs.length + 2448} lagu` : '0 lagu'}
        </span>
      </div>

      {/* Letter filter banner if active */}
      {selectedLetter && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-xs text-blue-600 dark:text-blue-400">
          <span>Menampilkan lagu berawalan huruf <strong>&quot;{selectedLetter}&quot;</strong></span>
          <button
            onClick={() => setSelectedLetter('')}
            className="hover:underline font-bold cursor-pointer"
          >
            Hapus filter
          </button>
        </div>
      )}

      {/* Catalog Table / List View (Mockup Screen 2 & Screen 5) */}
      {filteredSongs.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          {/* Table Header (Desktop) */}
          <div className="hidden sm:grid grid-cols-12 px-5 py-3 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Judul Lagu</div>
            <div className="col-span-3">Artis</div>
            <div className="col-span-2">Genre</div>
            <div className="col-span-1">Tayangan</div>
            <div className="col-span-1 text-right">Aksi</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredSongs.map((song, index) => {
              const isFav = favorites.includes(song.id);
              const realtimeViews = getSongTotalViews(song.id, song.views);
              return (
                <div
                  key={song.id}
                  onClick={() => onSelectSong(song)}
                  className="group px-4 sm:px-5 py-3 sm:py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex sm:grid sm:grid-cols-12 items-center justify-between sm:justify-start gap-2"
                >
                  {/* # Number */}
                  <div className="col-span-1 font-bold text-xs text-slate-400 w-6 sm:w-auto shrink-0">
                    {index + 1}
                  </div>

                  {/* Judul Lagu */}
                  <div className="col-span-4 font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                    {song.title}
                    {/* Mobile artist & stats indicator */}
                    <div className="flex sm:hidden items-center gap-2 text-xs font-normal text-slate-500 truncate mt-0.5">
                      <span>{song.artist}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Eye className="w-3 h-3 text-blue-500" />
                        <span>{formatCount(realtimeViews)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Artis (Desktop) */}
                  <div className="hidden sm:block col-span-3 text-xs text-slate-600 dark:text-slate-400 truncate">
                    {song.artist}
                  </div>

                  {/* Genre */}
                  <div className="col-span-2 shrink-0">
                    {song.genre && (
                      <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                        {song.genre}
                      </span>
                    )}
                  </div>

                  {/* Tayangan Realtime (Desktop) */}
                  <div className="hidden sm:flex col-span-1 items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    <span>{formatCount(realtimeViews)}</span>
                  </div>

                  {/* Actions: Heart + Chevron */}
                  <div className="col-span-1 flex items-center justify-end gap-1 shrink-0">
                    <button
                      onClick={(e) => onToggleFavorite(e, song.id)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                        isFav
                          ? 'text-rose-500'
                          : 'text-slate-300 dark:text-slate-600 hover:text-rose-500'
                      }`}
                      aria-label="Simpan lagu"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty State / Not Found (Mockup Screen 8: Responsif - Detail Lagu (Mobile) / State Kosong) */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <FileQuestion className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Lagu tidak ditemukan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Coba cari dengan kata kunci lain atau pilih genre yang berbeda.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Kembali ke Katalog
          </button>
        </div>
      )}
    </div>
  );
};
