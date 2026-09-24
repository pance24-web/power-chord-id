import React from 'react';
import { PowerChordLogo } from './PowerChordLogo';
import { Heart, Github, Music2, ShieldCheck, Zap } from 'lucide-react';

interface FooterProps {
  onOpenDictionary: () => void;
  onOpenTuner: () => void;
  onOpenRequest: () => void;
  onNavigateHome: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDictionary,
  onOpenTuner,
  onOpenRequest,
  onNavigateHome,
}) => {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="cursor-pointer" onClick={onNavigateHome}>
              <PowerChordLogo size="sm" />
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Platform katalog chord lagu dan lirik terlengkap dengan fitur transpose nada otomatis, autoscroll presisi, diagram kunci gitar interaktif, dan dukungan offline PWA.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Cepat &amp; Ringan
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Akses Offline
              </span>
            </div>
          </div>

          {/* Quick Features */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Fitur Gitar
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <li>
                <button onClick={onOpenTuner} className="hover:text-amber-500 cursor-pointer">
                  Tuner Gitar Virtual
                </button>
              </li>
              <li>
                <button onClick={onOpenDictionary} className="hover:text-amber-500 cursor-pointer">
                  Kamus Kunci Lengkap
                </button>
              </li>
              <li>
                <button onClick={onOpenRequest} className="hover:text-amber-500 cursor-pointer">
                  Request Chord Baru
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & App info */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Tentang
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Semua materi lirik dan chord adalah hak cipta dari masing-masing pencipta lagu, musisi, dan label musik bersangkutan.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; {new Date().getFullYear()} PowerChord. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Dibuat untuk musisi Indonesia &amp; dunia
          </p>
        </div>
      </div>
    </footer>
  );
};
