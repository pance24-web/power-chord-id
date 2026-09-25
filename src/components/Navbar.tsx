import React, { useState } from 'react';
import { PowerChordLogo } from './PowerChordLogo';
import { ThemeToggle } from './ThemeToggle';
import { ThemeType } from '../types/chord';
import { Search, Moon, Sun, User, Menu, X, Heart, Radio, BookOpen, Plus, Send } from 'lucide-react';

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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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

        {/* Action Zone: Search, Dark Mode, Profile (Matching mockup top right: 🔍 🌙 👤) */}
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

          {/* User Profile / Menu button */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="p-2.5 rounded-full text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Menu pengguna"
              title="Menu pengguna & fitur"
            >
              <User className="w-4 h-4" />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Profile Dropdown */}
            {userDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">PowerChord Musisi</p>
                    <p className="text-[11px] text-slate-400">Pustaka gitar pribadimu</p>
                  </div>
                  <button
                    onClick={() => {
                      onShowFavorites();
                      setUserDropdownOpen(false);
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
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Radio className="w-3.5 h-3.5 text-blue-500" />
                    Tuner Gitar Virtual
                  </button>
                  <button
                    onClick={() => {
                      onOpenDictionary();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    Kamus Kunci Chord
                  </button>
                  <button
                    onClick={() => {
                      onOpenAddSong();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-500" />
                    Tambah Chord Sendiri
                  </button>
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
