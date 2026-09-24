import React, { useState } from 'react';
import { PowerChordLogo } from './PowerChordLogo';
import { ThemeToggle } from './ThemeToggle';
import { PWAInstallButton } from './PWAInstallButton';
import { ThemeType } from '../types/chord';
import { Search, BookOpen, Music, Heart, Plus, Menu, X, HelpCircle, Radio } from 'lucide-react';

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

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div
          className="cursor-pointer shrink-0"
          onClick={() => {
            onTabChange('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <PowerChordLogo size="sm" />
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
          <button
            onClick={() => onTabChange('home')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentTab === 'home'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-amber-500'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => onTabChange('catalog')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentTab === 'catalog'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-amber-500'
            }`}
          >
            Katalog Lagu
          </button>
          <button
            onClick={() => onTabChange('artists')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentTab === 'artists'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-amber-500'
            }`}
          >
            Daftar Artis
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Search Button */}
          <button
            onClick={onOpenQuickSearch}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 rounded-full text-xs font-medium transition-colors cursor-pointer"
            title="Cari Lagu Cepat"
          >
            <Search className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden lg:inline">Cari lagu...</span>
          </button>

          {/* Guitar Tuner Button */}
          <button
            onClick={onOpenTuner}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-xs font-semibold cursor-pointer transition-colors"
            title="Tuner Gitar Virtual"
          >
            <Radio className="w-3.5 h-3.5 text-amber-500" />
            <span>Tuner</span>
          </button>

          {/* Chord Dictionary Button */}
          <button
            onClick={onOpenDictionary}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full text-xs font-semibold cursor-pointer transition-colors"
            title="Buka Kamus Kunci Gitar"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>Kamus Kunci</span>
          </button>

          {/* Favorite Songs Button */}
          <button
            onClick={onShowFavorites}
            className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Lagu Favorit Saya"
          >
            <Heart className="w-4 h-4" />
            {favoritesCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Add Song Button */}
          <button
            onClick={onOpenAddSong}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Tambah Chord Baru"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tulis Chord</span>
          </button>

          {/* PWA Install */}
          <PWAInstallButton />

          {/* Theme Toggle */}
          <ThemeToggle theme={theme} onThemeChange={onThemeChange} />

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => {
                onTabChange('home');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Beranda
            </button>
            <button
              onClick={() => {
                onTabChange('catalog');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Katalog Lagu
            </button>
            <button
              onClick={() => {
                onTabChange('artists');
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Daftar Artis
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onOpenTuner();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
            >
              <Radio className="w-4 h-4 text-amber-500" />
              Tuner Gitar
            </button>
            <button
              onClick={() => {
                onOpenDictionary();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              Kamus Chord
            </button>
            <button
              onClick={() => {
                onOpenAddSong();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
            >
              <Plus className="w-4 h-4 text-amber-500" />
              Tulis Chord
            </button>
            <button
              onClick={() => {
                onOpenRequest();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              Request Lagu
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
