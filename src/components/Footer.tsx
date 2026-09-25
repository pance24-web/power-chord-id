import React from 'react';
import { PowerChordLogo } from './PowerChordLogo';
import { Instagram, Youtube, Disc, Github } from 'lucide-react';

interface FooterProps {
  onNavigateHome: () => void;
  onNavigateCatalog: () => void;
  onNavigateArtists: () => void;
  onOpenRequest: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onNavigateCatalog,
  onNavigateArtists,
  onOpenRequest,
}) => {
  return (
    <footer className="bg-[#0B132B] text-slate-400 mt-16 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand Logo in white */}
        <div
          className="cursor-pointer shrink-0"
          onClick={onNavigateHome}
        >
          <PowerChordLogo size="sm" />
        </div>

        {/* Center: Navigation Links & Copyright */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-300 font-medium">
            <button
              onClick={onNavigateHome}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Beranda
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={onNavigateCatalog}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Katalog
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={onNavigateArtists}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Artis
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={onOpenRequest}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Request Chord
            </button>
            <span className="text-slate-600">·</span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Privasi
            </span>
            <span className="text-slate-600">·</span>
            <span className="hover:text-white transition-colors cursor-pointer">
              DMCA
            </span>
            <span className="text-slate-600">·</span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Tentang
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            &copy; 2025 PowerChord. Semua hak dilindungi.
          </p>
        </div>

        {/* Right: Social Media Icons (Mockup Screen 1) */}
        <div className="flex items-center gap-3 text-slate-400">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Instagram"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="YouTube"
          >
            <Youtube className="w-4 h-4" />
          </a>
          <a
            href="https://spotify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Spotify"
          >
            <Disc className="w-4 h-4" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};
