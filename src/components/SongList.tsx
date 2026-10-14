import { getSongPath } from '../lib/songUrl';
import React, { useState, useMemo, useEffect, useDeferredValue } from 'react';
import Link from 'next/link';
import { Song } from '../types/chord';
import { getSongTotalViews, getSongTotalLikes, formatCount } from '../utils/realtimeStats';
import { Search, X, Heart, ChevronRight, FileQuestion, Eye, LayoutGrid, List } from 'lucide-react';
import { SongCard } from './SongCard';

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

const DIFFICULTY_OPTIONS = [
  'Semua',
  'Mudah',
  'Sedang',
  'Lanjutan',
] as const;

type DifficultyFilter = (typeof DIFFICULTY_OPTIONS)[number];

export const SongList: React.FC<SongListProps> = ({
  songs,
  favorites,
  onSelectSong,
  onToggleFavorite,
  onEditSong,
  onDeleteSong,
  initialSearch = '',
  initialGenre = 'Semua',
  initialLetter = '',
  filterFavoritesOnly = false,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>('Semua');
  const [selectedLetter, setSelectedLetter] = useState<string>(initialLetter);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(filterFavoritesOnly);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [statsVersion, setStatsVersion] = useState(0);
  const deferredSearch = useDeferredValue(search);
  const searchIndex = useMemo(
    () =>
      new Map(
        songs.map((song) => [
          song.id,
          {
            title: song.title.toLocaleLowerCase('id-ID'),
            artist: song.artist.toLocaleLowerCase('id-ID'),
            genre: song.genre?.toLocaleLowerCase('id-ID') || '',
            tags: song.tags?.map((tag) => tag.toLocaleLowerCase('id-ID')).join(' ') || '',
            chords: song.chords.join(' ').toLocaleLowerCase('id-ID'),
          },
        ]),
      ),
    [songs],
  );

  useEffect(() => {
    const handleStatsChange = () => setStatsVersion((v) => v + 1);
    window.addEventListener('powerchord:stats_updated', handleStatsChange);
    window.addEventListener('powerchord:favorites_updated', handleStatsChange);
    return () => {
      window.removeEventListener('powerchord:stats_updated', handleStatsChange);
      window.removeEventListener('powerchord:favorites_updated', handleStatsChange);
    };
  }, []);

  const filteredSongs = useMemo(() => {
    const q = deferredSearch.toLocaleLowerCase('id-ID').trim();

    return songs
      .filter((song) => {
        const indexed = searchIndex.get(song.id);
        const matchSearch =
          !q ||
          Boolean(
            indexed &&
              [indexed.title, indexed.artist, indexed.genre, indexed.tags, indexed.chords].some((field) =>
                field.includes(q),
              ),
          );

        const matchGenre =
          selectedGenre === 'Semua' ||
          song.genre?.toLowerCase() === selectedGenre.toLowerCase() ||
          song.tags?.some((t) => t.toLowerCase() === selectedGenre.toLowerCase());

        const matchDifficulty =
          selectedDifficulty === 'Semua' ||
          song.difficulty === selectedDifficulty;

        const matchLetter =
          !selectedLetter ||
          song.title.trim().toUpperCase().startsWith(selectedLetter.toUpperCase());

        const matchFav = !showFavoritesOnly || favorites.includes(song.id);

        return matchSearch && matchGenre && matchDifficulty && matchLetter && matchFav;
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
  }, [
    songs,
    deferredSearch,
    searchIndex,
    selectedGenre,
    selectedDifficulty,
    selectedLetter,
    showFavoritesOnly,
    favorites,
    sortBy,
    statsVersion,
  ]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedGenre('Semua');
    setSelectedDifficulty('Semua');
    setSelectedLetter('');
    setShowFavoritesOnly(false);
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedGenre !== 'Semua' ||
    selectedDifficulty !== 'Semua' ||
    selectedLetter !== '' ||
    showFavoritesOnly;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Katalog Chord
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Jelajahi semua lagu berdasarkan genre, tingkat kesulitan, dan huruf awal.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari lagu, artis, atau chord..."
          className="w-full pl-4 pr-20 sm:pr-24 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 shadow-2xs"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer transition-colors shadow-2xs flex items-center justify-center"
            aria-label="Cari lagu"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Row */}
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

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Tingkat</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyFilter)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-2xs"
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Urutkan</span>
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

          {/* Reset filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 rounded-xl font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer"
            >
              Reset filter
            </button>
          )}
        </div>

        {/* Right side: View Mode Toggle & Total count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Tampilan Grid Kartu (SongCard)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <span className="text-slate-400 dark:text-slate-500 font-medium">
            Total: {filteredSongs.length > 0 ? `${filteredSongs.length} lagu` : '0 lagu'}
          </span>
        </div>
      </div>

      {/* Active filters banner */}
      {(selectedLetter || selectedDifficulty !== 'Semua') && (
        <div className="flex flex-wrap items-center gap-2">
          {selectedLetter && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-xs text-blue-600 dark:text-blue-400">
              <span>
                Huruf <strong>"{selectedLetter}"</strong>
              </span>
              <button
                onClick={() => setSelectedLetter('')}
                className="hover:underline font-bold cursor-pointer"
              >
                ×
              </button>
            </div>
          )}
          {selectedDifficulty !== 'Semua' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs text-amber-700 dark:text-amber-400">
              <span>
                Tingkat <strong>{selectedDifficulty}</strong>
              </span>
              <button
                onClick={() => setSelectedDifficulty('Semua')}
                className="hover:underline font-bold cursor-pointer"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}

      {/* Catalog Table / Grid View */}
      {filteredSongs.length > 0 ? (
        viewMode === 'grid' ? (
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            {/* Table Header (Desktop) */}
            <div className="hidden sm:grid grid-cols-12 px-5 py-3 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-1">#</div>
              <div className="col-span-3">Judul Lagu</div>
              <div className="col-span-2">Artis</div>
              <div className="col-span-1">Genre</div>
              <div className="col-span-1">Tingkat</div>
              <div className="col-span-1">Tayangan</div>
              <div className="col-span-1">Favorit</div>
              <div className="col-span-2 text-right">Aksi</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredSongs.map((song, index) => {
                const isFav = favorites.includes(song.id);
                const realtimeViews = getSongTotalViews(song.id, song.views);
                const realtimeLikes = getSongTotalLikes(song.id, song.likes, isFav);
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
                    <div className="col-span-3 font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      <Link
                        href={getSongPath(song)}
                        className="focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                      >
                        {song.title}
                      </Link>
                      {/* Mobile artist & stats */}
                      <div className="flex sm:hidden items-center gap-2 text-xs font-normal text-slate-500 truncate mt-0.5">
                        <span>{song.artist}</span>
                        {song.difficulty && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600 dark:text-amber-400">{song.difficulty}</span>
                          </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Eye className="w-3 h-3 text-blue-500" />
                          <span>{formatCount(realtimeViews)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Artis (Desktop) */}
                    <div className="hidden sm:block col-span-2 text-xs text-slate-600 dark:text-slate-400 truncate">
                      {song.artist}
                    </div>

                    {/* Genre */}
                    <div className="col-span-1 shrink-0">
                      {song.genre && (
                        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                          {song.genre}
                        </span>
                      )}
                    </div>

                    {/* Difficulty */}
                    <div className="hidden sm:block col-span-1 shrink-0">
                      {song.difficulty && (
                        <span
                          className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border ${
                            song.difficulty === 'Mudah'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
                              : song.difficulty === 'Sedang'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
                                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50'
                          }`}
                        >
                          {song.difficulty}
                        </span>
                      )}
                    </div>

                    {/* Tayangan Realtime (Desktop) */}
                    <div className="hidden sm:flex col-span-1 items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      <span>{formatCount(realtimeViews)}</span>
                    </div>

                    {/* Favorit Realtime (Desktop) */}
                    <div className="hidden sm:flex col-span-1 items-center gap-1 text-xs font-medium">
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current text-rose-500' : 'text-slate-400'}`} />
                      <span className={isFav ? 'text-rose-500 font-bold' : 'text-slate-500 dark:text-slate-400'}>
                        {formatCount(realtimeLikes)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-end gap-1 shrink-0">
                      <button
                        onClick={(e) => onToggleFavorite(e, song.id)}
                        className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                          isFav
                            ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                            : 'text-slate-300 dark:text-slate-600 hover:text-rose-500'
                        }`}
                        aria-label="Simpan lagu"
                        title={isFav ? 'Hapus dari favorit' : 'Simpan favorit'}
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
        )
      ) : (
        /* Empty State */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <FileQuestion className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Lagu tidak ditemukan</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Coba cari dengan kata kunci lain, atau ubah filter genre / tingkat kesulitan.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Reset semua filter
          </button>
        </div>
      )}
    </div>
  );
};
