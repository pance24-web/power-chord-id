import React, { useState } from 'react';
import { Song } from '../types/chord';
import { SongCard } from './SongCard';
import { Search, Flame, Sparkles, BookOpen, Radio, Plus, Compass } from 'lucide-react';

interface HomePageProps {
  songs: Song[];
  favorites: string[];
  onSelectSong: (song: Song) => void;
  onToggleFavorite: (e: React.MouseEvent, songId: string) => void;
  onNavigateCatalog: () => void;
  onOpenDictionary: () => void;
  onOpenTuner: () => void;
  onOpenAddSong: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  songs,
  favorites,
  onSelectSong,
  onToggleFavorite,
  onNavigateCatalog,
  onOpenDictionary,
  onOpenTuner,
  onOpenAddSong,
}) => {
  const [heroSearch, setHeroSearch] = useState('');

  // Top trending songs
  const trendingSongs = songs.slice(0, 6);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      onNavigateCatalog();
    }
  };

  return (
    <div className="space-y-10 pb-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Katalog Chord Lagu Terlengkap &amp; Terpercaya</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Mainkan Lagu Favoritmu Kapan Saja &amp; Di Mana Saja.
          </h1>

          <p className="text-sm sm:text-base text-amber-100/90 font-medium">
            Dilengkapi fitur <strong>Transpose nada akurat</strong>, <strong>Autoscroll otomatis</strong>, <strong>Diagram kunci interaktif</strong>, dan <strong>Dukungan Offline PWA</strong> tanpa kuota internet.
          </p>

          {/* Quick Search in Hero */}
          <form onSubmit={handleHeroSubmit} className="pt-2 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari chord lagu atau artis favoritmu..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-2xl text-sm font-medium shadow-md focus:outline-hidden focus:ring-4 focus:ring-amber-300"
              />
            </div>
            <button
              type="button"
              onClick={onNavigateCatalog}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-bold shadow-md cursor-pointer transition-transform hover:scale-105"
            >
              Jelajahi Semua
            </button>
          </form>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-semibold">
            <span className="text-amber-100">Fitur Cepat:</span>
            <button
              onClick={onOpenTuner}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/20 transition-all cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              Tuner Gitar
            </button>
            <button
              onClick={onOpenDictionary}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/20 transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Kamus Kunci
            </button>
            <button
              onClick={onOpenAddSong}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Tulis Lagu Sendiri
            </button>
          </div>
        </div>

        {/* Decorative Guitar Silhouette Background */}
        <div className="absolute -right-8 -bottom-16 w-96 h-96 opacity-15 pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 C60 20 85 30 85 65 C85 85 70 100 50 100 C30 100 15 85 15 65 C15 30 40 20 50 0 Z" />
          </svg>
        </div>
      </section>

      {/* Popular Trending Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Chord Populer &amp; Trending</h2>
              <p className="text-xs text-slate-500">Lagu yang paling sering dimainkan minggu ini</p>
            </div>
          </div>
          <button
            onClick={onNavigateCatalog}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Lihat Katalog Lengkap &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              isFavorite={favorites.includes(song.id)}
              favoritesList={favorites}
              onSelect={onSelectSong}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
