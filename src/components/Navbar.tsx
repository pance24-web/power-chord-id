import React, { useState, useEffect } from 'react';
import { PowerChordLogo } from './PowerChordLogo';
import { ThemeToggle } from './ThemeToggle';
import { ThemeType } from '../types/chord';
import { getMusicianOverviewStats } from '../utils/realtimeStats';
import { Search, Moon, Sun, SlidersHorizontal, Menu, X, Heart, Radio, BookOpen, Plus, Send, Timer, Activity } from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'catalog' | 'artists';
  onTabChange: (tab: 'home' | 'catalog' | 'artists') => void;
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  onOpenQuickSearch: () => void;
  onOpenDictionary: () => void;
  onOpenTuner: () => void;
  onOpenRequest: () => void;
  onOpenAddSong: () => void;
  favoritesCount: number;
  onShowFavorites: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  theme,
  onThemeChange,
  onOpenQuickSearch,
  onOpenDictionary,
  onOpenTuner,
  onOpenRequest,
  onOpenAddSong,
  favoritesCount,
  onShowFavorites,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuresMenuOpen, setFeaturesMenuOpen] = useState(false);
  const [stats, setStats] = useState(() => getMusicianOverviewStats(0, favoritesCount));

  useEffect(() => {
    const updateStats = () => setStats(getMusicianOverviewStats(0, favoritesCount));
    updateStats();
    window.addEventListener('powerchord:stats_updated', updateStats);
    return () => {
      window.removeEventListener('powerchord:stats_updated', updateStats);
    };
  }, [favoritesCount]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone: 1 element */}
        <div
          className="cursor-pointer shrink-0"
          onClick={() => {
            onTabChange('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <PowerChordLogo size="sm" />
        </div>

        {/* Desktop Nav Zone: Beranda, Katalog, Artis, Request Chord */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium h-full">
          <button
            onClick={() => onTabChange('home')}
            className={`h-full flex items-center transition-colors cursor-pointer border-b-2 ${
              currentTab === 'home'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => onTabChange('catalog')}
            className={`h-full flex items-center transition-colors cursor-pointer border-b-2 ${
              currentTab === 'catalog'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Katalog
          </button>
          <button
            onClick={() => onTabChange('artists')}
            className={`h-full flex items-center transition-colors cursor-pointer border-b-2 ${
              currentTab === 'artists'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Artis
          </button>
          <button
            onClick={onOpenRequest}
            className="h-full flex items-center transition-colors cursor-pointer border-b-2 border-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Request Chord
          </button>
        </nav>

        {/* Action Zone: Search, Dark Mode, and app features */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search Trigger */}
          <button
            onClick={onOpenQuickSearch}
            className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cari chord lagu"
            title="Cari lagu cepat"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => onThemeChange(theme === 'dark' || theme === 'amoled' ? 'light' : 'dark')}
            className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Ganti mode tampilan"
            title="Mode gelap / terang"
          >
            {theme === 'dark' || theme === 'amoled' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* App Features menu — no account or login required */}
          <div className="relative">
            <button
              onClick={() => setFeaturesMenuOpen(!featuresMenuOpen)}
              className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Buka menu fitur"
              title="Fitur PowerChord"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Features dropdown — all tools work locally without an account */}
            {featuresMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setFeaturesMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Fitur PowerChord</p>
                    <p className="text-[11px] text-slate-400">Semua fitur tersedia tanpa login</p>
                  </div>
                  <button
                    onClick={() => {
                      onShowFavorites();
                      setFeaturesMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      Lagu Favorit
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-600 rounded-full">
                      {favoritesCount}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenTuner();
                      setFeaturesMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Radio className="w-3.5 h-3.5 text-blue-500" />
                    Tuner Gitar Virtual
                  </button>
                  <button
                    onClick={() => {
                      onOpenDictionary();
                      setFeaturesMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    Kamus Kunci Chord
                  </button>
                  <button
                    onClick={() => {
                      onOpenAddSong();
                      setFeaturesMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-500" />
                    Tambah Chord Sendiri
                  </button>

                  {/* Realtime Practice Statistics Summary */}
                  {stats.songsViewed > 0 && (
                    <div className="mx-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                          <span>Statistik Latihan</span>
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-center">
                          <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{stats.songsViewed}</p>
                            <p className="text-[10px] text-slate-400">Lagu Dibuka</p>
                          </div>
                          <div className="bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{stats.formattedTotalPractice}</p>
                            <p className="text-[10px] text-slate-400">Waktu Latihan</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Buka menu navigasi"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => {
                onTabChange('home');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2.5 rounded-xl text-sm font-semibold ${
                currentTab === 'home'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => {
                onTabChange('catalog');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2.5 rounded-xl text-sm font-semibold ${
                currentTab === 'catalog'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Katalog
            </button>
            <button
              onClick={() => {
                onTabChange('artists');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2.5 rounded-xl text-sm font-semibold ${
                currentTab === 'artists'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Artis
            </button>
            <button
              onClick={() => {
                onOpenRequest();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
            >
              <span>Request Chord</span>
              <Send className="w-4 h-4 text-blue-500" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onOpenTuner();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              <Radio className="w-4 h-4 text-blue-500" />
              Tuner Gitar
            </button>
            <button
              onClick={() => {
                onOpenDictionary();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              <BookOpen className="w-4 h-4 text-blue-500" />
              Kamus Chord
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
