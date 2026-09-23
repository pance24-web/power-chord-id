import React from 'react';
import { Instagram, Youtube, Music } from 'lucide-react';
import { PowerChordLogo } from './PowerChordLogo';

interface FooterProps {
  onNavigateHome: () => void;
  onNavigateCatalog: () => void;
  onNavigateArtists: () => void;
  onOpenRequestModal: () => void;
  onOpenPrivacy?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onNavigateCatalog,
  onNavigateArtists,
  onOpenRequestModal,
}) => {
  return (
    <footer className="mt-auto bg-slate-900 dark:bg-[#070B14] amoled:bg-black text-slate-400 py-10 border-t border-slate-800 amoled:border-neutral-900 text-xs no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Brand */}
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <PowerChordLogo size={30} />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              Power<span className="text-orange-400">Chord</span>
            </span>
          </button>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-slate-300 font-medium">
            <button
              onClick={onNavigateHome}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Beranda
            </button>
            <button
              onClick={onNavigateCatalog}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Katalog
            </button>
            <button
              onClick={onNavigateArtists}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Artis
            </button>
            <button
              onClick={onOpenRequestModal}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Request Chord
            </button>
            <span className="hover:text-white transition-colors cursor-pointer">
              Privasi
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              DMCA
            </span>
            <span className="hover:text-white transition-colors cursor-pointer">
              Tentang
            </span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3 text-slate-400">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <div
              className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Discord"
            >
              <Music className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-4 border-t border-slate-800/80 text-slate-500">
          © 2025 PowerChord. Semua hak dilindungi.
        </div>
      </div>
    </footer>
  );
};
