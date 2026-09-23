import React, { useState, useMemo, useEffect } from 'react';
import { Song, GenreType } from '../types/chord';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { isSongCachedOffline } from '../utils/offlineStorage';
import {
  Search,
  Heart,
  ChevronRight,
  Music,
  Sparkles,
  WifiOff,
  Check,
  DownloadCloud,
} from 'lucide-react';

interface CatalogProps {
  songs: Song[];
  favorites: string[];
  onSelectSong: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  initialGenre?: string;
  initialLetter?: string;
  initialSearch?: string;
}

const GENRE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Semua Genre', value: 'all' },
  { label: 'Pop', value: 'Pop' },
  { label: 'Rock', value: 'Rock' },
  { label: 'Dangdut', value: 'Dangdut' },
  { label: 'Indie', value: 'Indie' },
  { label: 'Reggae', value: 'Reggae' },
  { label: 'Minang', value: 'Minang' },
  { label: 'Melayu', value: 'Melayu' },
  { label: 'Akustik', value: 'Akustik' },
];

const SORT_OPTIONS = [
  { label: 'Terpopuler', value: 'popular' },
  { label: 'Terbaru', value: 'newest' },
  { label: 'A - Z (Judul)', value: 'az' },
  { label: 'Artis (A - Z)', value: 'artist' },
];

export const SongList: React.FC<CatalogProps> = ({
  songs,
  favorites,
  onSelectSong,
  onToggleFavorite,
  initialGenre = 'all',
  initialLetter = '',
  initialSearch = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedSort, setSelectedSort] = useState('popular');
  const [selectedLetter, setSelectedLetter] = useState(initialLetter);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (initialGenre) setSelectedGenre(initialGenre);
  }, [initialGenre]);

  useEffect(() => {
    if (initialLetter) setSelectedLetter(initialLetter);
  }, [initialLetter]);

  useEffect(() => {
    if (initialSearch) setSearchQuery(initialSearch);
  }, [initialSearch]);

  // Filter songs
  const filteredSongs = useMemo(() => {
    let result = songs.filter((song) => {
      // Offline / Favorites only filter
      if (onlyFavorites && !favorites.includes(song.id)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = song.title.toLowerCase().includes(query);
        const matchesArtist = song.artist.toLowerCase().includes(query);
        if (!matchesTitle && !matchesArtist) return false;
      }

      // Genre filter
      if (selectedGenre !== 'all' && song.genre !== selectedGenre) {
        return false;
      }

      // Starting letter filter
      if (selectedLetter && selectedLetter !== 'all') {
        if (!song.title.toUpperCase().startsWith(selectedLetter)) {
          return false;
        }
      }

      return true;
    });

    // Sort songs
    if (selectedSort === 'popular') {
      result = result.sort((a, b) => (a.rank || 99) - (b.rank || 99));
    } else if (selectedSort === 'newest') {
      result = result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (selectedSort === 'az') {
      result = result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (selectedSort === 'artist') {
      result = result.sort((a, b) => a.artist.localeCompare(b.artist));
    }

    return result;
  }, [songs, searchQuery, selectedGenre, selectedSort, selectedLetter, onlyFavorites, favorites]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('all');
    setSelectedLetter('');
    setSelectedSort('popular');
    setOnlyFavorites(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Katalog Chord
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Jelajahi semua lagu berdasarkan genre dan huruf awal.
        </p>
      </div>

      {/* Offline Mode Notice Banner */}
      {!isOnline && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Mode Offline:</span> Anda tetap dapat mengakses{' '}
              <span className="font-bold underline">{favorites.length} lagu favorit</span> yang tersimpan
              di memori perangkat tanpa koneksi internet.
            </div>
          </div>
          <button
            onClick={() => setOnlyFavorites(true)}
            className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Tampilkan Lagu Favorit Offline
          </button>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="flex items-center bg-white dark:bg-[#131B2E] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-1.5 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
        <input
          type="text"
          placeholder="Cari lagu atau artis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 cursor-pointer"
          >
            Hapus
          </button>
        )}
        <button
          className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-colors cursor-pointer"
          title="Cari"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Row: Genre, Urutkan, Favorit Offline, and Total Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Genre Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Genre:</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {GENRE_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Urutkan:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Offline Favorite Filter Button */}
          <button
            onClick={() => setOnlyFavorites((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer border text-xs ${
              onlyFavorites
                ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                : 'bg-white dark:bg-[#131B2E] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900'
            }`}
            title="Tampilkan hanya lagu favorit yang tersimpan offline di memori perangkat"
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : 'text-rose-500'}`} />
            <span>Favorit Offline ({favorites.length})</span>
          </button>
        </div>

        {/* Total Lagu Counter */}
        <div className="text-slate-500 dark:text-slate-400 font-medium">
          Total: <span className="font-bold text-slate-900 dark:text-slate-100">{filteredSongs.length} lagu</span>
        </div>
      </div>

      {/* Table / List View */}
      {filteredSongs.length > 0 ? (
        <div className="bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
          {/* Desktop Table Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 dark:bg-[#0B0F19]/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5">Judul Lagu</div>
            <div className="col-span-3">Artis</div>
            <div className="col-span-2">Genre</div>
            <div className="col-span-1 text-right">Aksi</div>
          </div>

          {/* List items */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredSongs.map((song, index) => {
              const isFav = favorites.includes(song.id);
              return (
                <div
                  key={song.id}
                  onClick={() => onSelectSong(song)}
                  className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-6 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer items-center"
                >
                  {/* Number */}
                  <div className="hidden sm:block col-span-1 text-xs font-mono font-bold text-slate-400 text-center">
                    {index + 1}
                  </div>

                  {/* Title & mobile metadata */}
                  <div className="col-span-5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <span className="sm:hidden text-xs font-mono font-bold text-slate-400">
                        {index + 1}.
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {song.title}
                      </h3>
                      {isFav ? (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60 shrink-0"
                          title="Lagu ini tersimpan di memori perangkat & bisa diakses saat offline"
                        >
                          <Check className="w-2.5 h-2.5" /> Offline Ready
                        </span>
                      ) : (
                        !isOnline && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 italic shrink-0">
                            (Perlu Internet)
                          </span>
                        )
                      )}
                    </div>
                    {/* Mobile artist & details */}
                    <div className="sm:hidden flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{song.artist}</span>
                      <span>•</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        {song.genre}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Artist */}
                  <div className="hidden sm:block col-span-3 text-xs text-slate-600 dark:text-slate-400 truncate">
                    {song.artist}
                  </div>

                  {/* Desktop Genre Badge */}
                  <div className="hidden sm:block col-span-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold">
                      {song.genre}
                    </span>
                  </div>

                  {/* Actions: Heart + Arrow */}
                  <div className="col-span-1 flex items-center justify-end gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(song.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isFav
                          ? 'text-rose-500'
                          : 'text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-300'
                      }`}
                      title={isFav ? 'Hapus dari favorit' : 'Simpan ke favorit'}
                      aria-label="Favorit"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            {onlyFavorites ? <Heart className="w-7 h-7 text-rose-500" /> : <Music className="w-7 h-7" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {onlyFavorites ? 'Belum Ada Lagu Favorit Offline' : 'Lagu tidak ditemukan'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              {onlyFavorites
                ? 'Klik ikon hati pada lagu favorit Anda untuk menyimpannya di memori perangkat agar selalu bisa diakses kapan saja meski tanpa internet.'
                : 'Coba cari dengan kata kunci lain atau pilih genre yang berbeda.'}
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {onlyFavorites ? 'Lihat Semua Lagu' : 'Kembali ke Katalog'}
          </button>
        </div>
      )}
    </div>
  );
};
