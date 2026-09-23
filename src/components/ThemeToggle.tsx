import React, { useState, useRef, useEffect } from 'react';
import { ThemeType } from '../types/chord';
import { Sun, Moon, Zap, Check, ChevronDown } from 'lucide-react';

interface ThemeToggleProps {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  className?: string;
  variant?: 'dropdown' | 'segmented' | 'compact';
}

const THEME_OPTIONS: {
  id: ThemeType;
  name: string;
  shortName: string;
  description: string;
  icon: typeof Sun;
  badgeColor: string;
  previewBg: string;
  previewBorder: string;
}[] = [
  {
    id: 'light',
    name: 'Mode Terang',
    shortName: 'Terang',
    description: 'Latar cerah & bersih, jernih di siang hari',
    icon: Sun,
    badgeColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
    previewBg: 'bg-white',
    previewBorder: 'border-slate-300',
  },
  {
    id: 'dark',
    name: 'Mode Gelap',
    shortName: 'Gelap',
    description: 'Latar slate malam, nyaman di mata',
    icon: Moon,
    badgeColor: 'text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
    previewBg: 'bg-[#131B2E]',
    previewBorder: 'border-slate-700',
  },
  {
    id: 'amoled',
    name: 'AMOLED Black',
    shortName: 'AMOLED',
    description: 'Hitam pekat murni, bebas silau & hemat baterai',
    icon: Zap,
    badgeColor: 'text-violet-400 bg-violet-50 dark:bg-violet-950/40',
    previewBg: 'bg-black',
    previewBorder: 'border-neutral-800',
  },
];

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  setTheme,
  className = '',
  variant = 'dropdown',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];
  const CurrentIcon = currentOption.icon;

  // Segmented Pill Control (great for mobile menu and SongViewer toolbar)
  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 ${className}`}
        role="group"
        aria-label="Pilih Mode Tampilan"
      >
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title={opt.description}
              aria-pressed={isActive}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  opt.id === 'light'
                    ? 'text-amber-500'
                    : opt.id === 'dark'
                    ? 'text-indigo-400'
                    : 'text-violet-400'
                }`}
              />
              <span>{opt.shortName}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Compact Single Button: Cycles with clear visual indicator
  if (variant === 'compact') {
    const handleCycle = () => {
      if (theme === 'light') setTheme('dark');
      else if (theme === 'dark') setTheme('amoled');
      else setTheme('light');
    };

    return (
      <button
        onClick={handleCycle}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-2xs ${className}`}
        title={`Mode tampilan: ${currentOption.name}. Klik untuk beralih.`}
        aria-label={`Mode tampilan: ${currentOption.name}`}
      >
        <CurrentIcon
          className={`w-3.5 h-3.5 ${
            theme === 'light'
              ? 'text-amber-500'
              : theme === 'dark'
              ? 'text-indigo-400'
              : 'text-violet-400'
          }`}
        />
        <span className="hidden sm:inline">{currentOption.shortName}</span>
      </button>
    );
  }

  // Default: Dropdown with explicit name and rich menu
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100 transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Ganti Mode Tampilan (Terang / Gelap / AMOLED)"
      >
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center transition-transform group-hover:scale-110 ${currentOption.badgeColor}`}
        >
          <CurrentIcon className="w-3.5 h-3.5" />
        </div>
        <span className="font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">
          {currentOption.shortName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
          role="listbox"
          aria-label="Pilihan Tema Tampilan"
        >
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Pilihan Mode Tampilan
            </span>
          </div>

          <div className="space-y-1">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div
                    className={`w-8 h-8 rounded-lg border ${opt.previewBorder} ${opt.previewBg} flex items-center justify-center shrink-0 shadow-2xs mt-0.5`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        opt.id === 'light'
                          ? 'text-amber-500'
                          : opt.id === 'dark'
                          ? 'text-indigo-400'
                          : 'text-violet-400'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{opt.name}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
