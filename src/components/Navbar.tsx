import React, { useState } from 'react';
import { ThemeType } from '../types/chord';
import { ThemeToggle } from './ThemeToggle';
import { PowerChordLogo } from './PowerChordLogo';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Search,
  User,
  Home,
  BookOpen,
  Users,
  Send,
  Menu,
  X,
  Music,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'catalog' | 'artists';
  onSelectTab: (tab: 'home' | 'catalog' | 'artists') => void;
  onRequestChord: () => void;
  onOpenQuickSearch: () => void;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  onToggleTheme: () => void;
  onHomeClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onRequestChord,
  onOpenQuickSearch,
  theme,
  setTheme,
  onHomeClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 transition-colors no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-8">
            <button
              onClick={onHomeClick}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
              aria-label="PowerChord Beranda"
            >
              <div className="w-10 h-10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <PowerChordLogo size={38} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  Power<span className="text-orange-500 dark:text-orange-400">Chord</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
                  Gitar & Lirik
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button
                onClick={() => onSelectTab('home')}
                className={`py-1 transition-colors cursor-pointer ${
                  currentTab === 'home'
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Beranda
              </button>

              <button
                onClick={() => onSelectTab('catalog')}
                className={`py-1 transition-colors cursor-pointer ${
                  currentTab === 'catalog'
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Katalog
              </button>

              <button
                onClick={() => onSelectTab('artists')}
                className={`py-1 transition-colors cursor-pointer ${
                  currentTab === 'artists'
                    ? 'text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Artis
              </button>

              <button
                onClick={onRequestChord}
                className="py-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                Request Chord
              </button>
            </nav>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Icon */}
            <button
              onClick={onOpenQuickSearch}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Cari lagu atau artis..."
              aria-label="Cari"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* In-App PWA Install Button */}
            <PWAInstallButton />

            {/* Clear Mode Selector (Terang / Gelap / AMOLED) */}
            <ThemeToggle theme={theme} setTheme={setTheme} variant="dropdown" />

            {/* Request / Profil Quick Action */}
            <button
              onClick={onRequestChord}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition-colors cursor-pointer"
              title="Request Chord Lagu Baru"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu if toggled */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] px-4 py-3 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="space-y-1">
              <button
                onClick={() => {
                  onSelectTab('home');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm font-semibold transition-colors ${
                  currentTab === 'home'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Beranda</span>
              </button>
              <button
                onClick={() => {
                  onSelectTab('catalog');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm font-semibold transition-colors ${
                  currentTab === 'catalog'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Katalog Chord</span>
              </button>
              <button
                onClick={() => {
                  onSelectTab('artists');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm font-semibold transition-colors ${
                  currentTab === 'artists'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Daftar Artis</span>
              </button>
              <button
                onClick={() => {
                  onRequestChord();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 py-2 px-3 rounded-xl text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Send className="w-4 h-4" />
                <span>Request Chord</span>
              </button>

              <div className="pt-2 px-1">
                <PWAInstallButton variant="full" className="w-full justify-center" />
              </div>
            </div>

            {/* Mobile Explicit Theme Selector */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Mode Tampilan
                </span>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  {theme === 'light' ? '☀️ Terang' : theme === 'dark' ? '🌙 Gelap' : '⚡ AMOLED'}
                </span>
              </div>
              <ThemeToggle
                theme={theme}
                setTheme={setTheme}
                variant="segmented"
                className="w-full justify-between"
              />
            </div>
          </div>
        )}
      </header>


      {/* Mobile Bottom Navigation Bar (as shown in Mockup 4, 5, 6, 7) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around py-2 px-3 shadow-lg no-print">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            currentTab === 'home'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Beranda</span>
        </button>

        <button
          onClick={() => onSelectTab('catalog')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            currentTab === 'catalog'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Katalog</span>
        </button>

        <button
          onClick={() => onSelectTab('artists')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            currentTab === 'artists'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-neutral-500 dark:text-neutral-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Artis</span>
        </button>

        <button
          onClick={onRequestChord}
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>Request</span>
        </button>
      </div>
    </>
  );
};
