import React, { useState, useMemo, useEffect } from 'react';
import { Song } from '../types/chord';
import { getSongTotalViews, formatCount } from '../utils/realtimeStats';
import { Search, ChevronDown, ChevronRight, Eye, Heart, BookOpen, Users, Send } from 'lucide-react';

interface HomePageProps {
  songs: Song[];
  favorites: string[];
  onSelectSong: (song: Song) => void;
  onToggleFavorite: (e: React.MouseEvent, songId: string) => void;
  onNavigateCatalog: (options?: { genre?: string; letter?: string; search?: string }) => void;
  onNavigateArtists: () => void;
  onOpenDictionary: () => void;
  onOpenTuner: () => void;
  onOpenRequest: () => void;
  onOpenAddSong: () => void;
}

const GENRE_CHIPS = [
  'Semua',
  'Pop',
  'Rock',
  'Dangdut',
  'Indie',
  'Reggae',
  'Minang',
  'Melayu',
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const HomePage: React.FC<HomePageProps> = ({
  songs,
  favorites,
  onSelectSong,
  onToggleFavorite,
  onNavigateCatalog,
  onNavigateArtists,
  onOpenRequest,
}) => {
  const [heroSearch, setHeroSearch] = useState('');
  const [activeGenre, setActiveGenre] = useState('Semua');
  const [showMoreGenres, setShowMoreGenres] = useState(false);
  const [statsVersion, setStatsVersion] = useState(0);

  // Sync when song views or practice times update in real-time
  useEffect(() => {
    const handleStatsChange = () => setStatsVersion((v) => v + 1);
    window.addEventListener('powerchord:stats_updated', handleStatsChange);
    return () => {
      window.removeEventListener('powerchord:stats_updated', handleStatsChange);
    };
  }, []);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      onNavigateCatalog({ search: heroSearch.trim() });
    }
  };

  // 10 Popular Songs sorted by real-time views
  const popularSongs = useMemo(() => {
    let list = [...songs];
    if (activeGenre !== 'Semua') {
      list = list.filter((s) => s.genre?.toLowerCase() === activeGenre.toLowerCase());
    }
    list.sort((a, b) => {
      const viewsA = getSongTotalViews(a.id, a.views);
      const viewsB = getSongTotalViews(b.id, b.views);
      return viewsB - viewsA;
    });
    return list.slice(0, 10);
  }, [songs, activeGenre, statsVersion]);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Section (Clean canvas with bold typography & search) */}
      <section className="text-left space-y-6 pt-4 sm:pt-8 max-w-4xl">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Cari Chord Lagu Favoritmu <br className="hidden sm:inline" />
            dengan Mudah!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
            Temukan chord lagu dari berbagai genre dan artis favoritmu. Mainkan langsung dengan gitar!
          </p>
        </div>

        {/* Large Search Input */}
        <form onSubmit={handleHeroSubmit} className="relative flex items-center max-w-3xl">
          <input
            type="text"
            placeholder="Cari judul lagu atau artis..."
            value={heroSearch}
            onChange={(e) => setHeroSearch(e.target.value)}
            className="w-full pl-5 pr-14 py-3.5 sm:py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 shadow-xs transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 p-2.5 sm:p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer transition-colors shadow-xs flex items-center justify-center"
            aria-label="Cari sekarang"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </form>

        {/* Genre Filter Chips (Chip Genre in Mockup: Semua, Pop, Rock, Dangdut, Indie, Reggae, Minang, Melayu, Lainnya ⌄) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {GENRE_CHIPS.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                activeGenre === genre
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {genre}
            </button>
          ))}

          {/* Lainnya Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMoreGenres(!showMoreGenres)}
              className="px-3.5 py-2 rounded-xl font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Lainnya</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showMoreGenres && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowMoreGenres(false)}
                />
                <div className="absolute left-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-40">
                  {['Akustik', 'Jazz', 'Ska', 'Campursari', 'Religi'].map((extra) => (
                    <button
                      key={extra}
                      onClick={() => {
                        setActiveGenre(extra);
                        setShowMoreGenres(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      {extra}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 2. Lagu Populer Section (2 columns on desktop, 1 on mobile, 10 items) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Lagu Populer
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
              </span>
              Realtime
            </span>
          </div>
          <button
            onClick={() => onNavigateCatalog()}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua &rarr;
          </button>
        </div>

        {/* 2-Column Numbered List (Mockup Screen 1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {popularSongs.map((song, index) => {
            const isFav = favorites.includes(song.id);
            const realtimeViews = getSongTotalViews(song.id, song.views);
            return (
              <div
                key={song.id}
                onClick={() => onSelectSong(song)}
                className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-blue-500/50 dark:hover:border-blue-500/50 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                {/* Left: Number + Title & Artist */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="font-bold text-slate-400 dark:text-slate-500 text-sm sm:text-base w-5 text-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {song.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {song.artist}
                    </p>
                  </div>
                </div>

                {/* Right: Genre Badge + Realtime Stats (👁 views, ♡ likes) */}
                <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                  {song.genre && (
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                      {song.genre}
                    </span>
                  )}
                  <span
                    className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium"
                    title={`Total pembaca: ${realtimeViews.toLocaleString('id-ID')} tayangan`}
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    <span>{formatCount(realtimeViews)}</span>
                  </span>
                  <button
                    onClick={(e) => onToggleFavorite(e, song.id)}
                    className={`flex items-center gap-1 text-[11px] font-medium p-1 rounded-full transition-colors cursor-pointer ${
                      isFav
                        ? 'text-rose-500 font-bold'
                        : 'text-slate-400 hover:text-rose-500'
                    }`}
                    title={isFav ? 'Hapus dari favorit' : 'Simpan favorit'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                    {song.likes && <span>{song.likes}</span>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Jelajahi Lagu Berdasarkan Huruf */}
      <section className="space-y-4 pt-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          Jelajahi Lagu Berdasarkan Huruf
        </h2>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => onNavigateCatalog({ letter })}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center justify-center transition-all cursor-pointer"
            >
              {letter}
            </button>
          ))}
        </div>
      </section>

      {/* 4. Three Bottom Navigation Cards (Mockup Screen 1) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Card 1: Katalog Chord */}
        <div
          onClick={() => onNavigateCatalog()}
          className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-blue-500/50 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Katalog Chord
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Jelajahi ribuan chord lagu
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all shrink-0" />
        </div>

        {/* Card 2: Daftar Artis */}
        <div
          onClick={onNavigateArtists}
          className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-blue-500/50 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Daftar Artis
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Temukan lagu dari artis favorit
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all shrink-0" />
        </div>

        {/* Card 3: Request Chord */}
        <div
          onClick={onOpenRequest}
          className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-blue-500/50 hover:shadow-xs transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Request Chord
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Belum ada chord yang dicari?
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all shrink-0" />
        </div>
      </section>
    </div>
  );
};
