import React, { useState } from 'react';
import { Song, GenreType } from '../types/chord';
import { PowerChordLogo } from './PowerChordLogo';
import {
  Search,
  Eye,
  Heart,
  ChevronRight,
  BookOpen,
  Users,
  Send,
  Sparkles,
} from 'lucide-react';

interface HomePageProps {
  songs: Song[];
  favorites: string[];
  onSelectSong: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  onNavigateCatalog: (options?: { genre?: string; letter?: string; search?: string }) => void;
  onNavigateArtists: () => void;
  onOpenRequestModal: () => void;
}

const GENRE_CHIPS: { label: string; value: string }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Pop', value: 'Pop' },
  { label: 'Rock', value: 'Rock' },
  { label: 'Dangdut', value: 'Dangdut' },
  { label: 'Indie', value: 'Indie' },
  { label: 'Reggae', value: 'Reggae' },
  { label: 'Minang', value: 'Minang' },
  { label: 'Melayu', value: 'Melayu' },
  { label: 'Akustik', value: 'Akustik' },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const HomePage: React.FC<HomePageProps> = ({
  songs,
  favorites,
  onSelectSong,
  onToggleFavorite,
  onNavigateCatalog,
  onNavigateArtists,
  onOpenRequestModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigateCatalog({ search: searchQuery.trim(), genre: selectedGenre });
    } else {
      onNavigateCatalog({ genre: selectedGenre });
    }
  };

  // Top 10 popular songs sorted by rank or views
  const popularSongs = [...songs]
    .sort((a, b) => (a.rank || 99) - (b.rank || 99))
    .slice(0, 10);

  const leftCol = popularSongs.slice(0, 5);
  const rightCol = popularSongs.slice(5, 10);

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Hero Search Section */}
      <section className="text-center pt-4 sm:pt-8 max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 shadow-xs">
          <PowerChordLogo size={22} showShadow={false} />
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 tracking-wide">
            PowerChord • Portal Chord Gitar Terlengkap
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Cari Chord Lagu Favoritmu dengan Mudah!
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto">
          Temukan chord lagu dari berbagai genre dan artis favoritmu. Mainkan langsung dengan gitar!
        </p>

        {/* Big Search Input with blue search button */}
        <form
          onSubmit={handleSearchSubmit}
          className="mt-6 flex items-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-1.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all"
        >
          <input
            type="text"
            placeholder="Cari judul lagu atau artis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 text-sm sm:text-base bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden"
          />
          <button
            type="submit"
            className="w-11 h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-colors"
            title="Cari"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>

        {/* Filter chips */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap pt-2">
          {GENRE_CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => {
                setSelectedGenre(chip.value);
                if (chip.value !== 'all') {
                  onNavigateCatalog({ genre: chip.value });
                }
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedGenre === chip.value
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Lagu Populer Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            Lagu Populer
          </h2>
          <button
            onClick={() => onNavigateCatalog()}
            className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Two Columns of 5 Songs (Desktop) / Single Column (Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Column 1 (Rank 1-5) */}
          <div className="space-y-2.5">
            {leftCol.map((song, idx) => {
              const rank = song.rank || idx + 1;
              const isFav = favorites.includes(song.id);
              return (
                <div
                  key={song.id}
                  onClick={() => onSelectSong(song)}
                  className="group flex items-center justify-between p-3.5 bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-6 text-sm font-bold text-slate-400 dark:text-slate-500 text-center shrink-0">
                      {rank}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {song.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="truncate">{song.artist}</span>
                        {song.views && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Eye className="w-3 h-3 text-slate-400" />
                              {song.views}
                            </span>
                          </>
                        )}
                        {song.likes && (
                          <span className="flex items-center gap-0.5">
                            <Heart className="w-3 h-3 text-slate-400" />
                            {song.likes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold">
                      {song.genre}
                    </span>
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

          {/* Column 2 (Rank 6-10) */}
          <div className="space-y-2.5">
            {rightCol.map((song, idx) => {
              const rank = song.rank || idx + 6;
              const isFav = favorites.includes(song.id);
              return (
                <div
                  key={song.id}
                  onClick={() => onSelectSong(song)}
                  className="group flex items-center justify-between p-3.5 bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800 rounded-xl hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-6 text-sm font-bold text-slate-400 dark:text-slate-500 text-center shrink-0">
                      {rank}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {song.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="truncate">{song.artist}</span>
                        {song.views && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Eye className="w-3 h-3 text-slate-400" />
                              {song.views}
                            </span>
                          </>
                        )}
                        {song.likes && (
                          <span className="flex items-center gap-0.5">
                            <Heart className="w-3 h-3 text-slate-400" />
                            {song.likes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold">
                      {song.genre}
                    </span>
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
      </section>

      {/* 3. Jelajahi Lagu Berdasarkan Huruf */}
      <section className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Jelajahi Lagu Berdasarkan Huruf
        </h3>
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 scrollbar-none">
          {ALPHABET.map((char) => (
            <button
              key={char}
              onClick={() => onNavigateCatalog({ letter: char })}
              className="w-8 h-8 rounded-lg bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition-colors flex items-center justify-center shrink-0 shadow-2xs cursor-pointer"
            >
              {char}
            </button>
          ))}
        </div>
      </section>

      {/* 4. Three Quick Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Card 1: Katalog Chord */}
        <div
          onClick={() => onNavigateCatalog()}
          className="group p-5 bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs hover:shadow-md hover:border-indigo-500/40 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Katalog Chord
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Jelajahi ribuan chord lagu
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>

        {/* Card 2: Daftar Artis */}
        <div
          onClick={onNavigateArtists}
          className="group p-5 bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs hover:shadow-md hover:border-indigo-500/40 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Daftar Artis
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Temukan lagu dari artis favorit
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>

        {/* Card 3: Request Chord */}
        <div
          onClick={onOpenRequestModal}
          className="group p-5 bg-white dark:bg-[#131B2E] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs hover:shadow-md hover:border-indigo-500/40 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Request Chord
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Belum ada chord yang dicari?
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </div>
      </section>
    </div>
  );
};
