import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { ThemeType } from '../types/chord';

interface ThemeToggleProps {
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onThemeChange }) => {
  const cycleTheme = () => {
    if (theme === 'light') onThemeChange('dark');
    else if (theme === 'dark') onThemeChange('amoled');
    else onThemeChange('light');
  };

  return (
    <button
      onClick={cycleTheme}
      title={`Mode Tema: ${theme.toUpperCase()} (Klik untuk ganti)`}
      aria-label="Ganti Tema Tampilan"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-amber-400 dark:hover:border-amber-500 transition-all text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
    >
      {theme === 'light' && (
        <>
          <Sun className="w-4 h-4 text-amber-500" />
          <span className="hidden sm:inline">Terang</span>
        </>
      )}
      {theme === 'dark' && (
        <>
          <Moon className="w-4 h-4 text-blue-400" />
          <span className="hidden sm:inline">Gelap</span>
        </>
      )}
      {theme === 'amoled' && (
        <>
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline">AMOLED</span>
        </>
      )}
    </button>
  );
};
