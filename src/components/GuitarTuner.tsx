import React, { useState } from 'react';
import { Volume2, X, Info } from 'lucide-react';
import { playStringTuningTone, STRING_NAMES } from '../utils/audioSynth';

interface GuitarTunerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TUNINGS = [
  { name: 'Standard (E-A-D-G-B-E)', notes: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
  { name: 'Drop D (D-A-D-G-B-E)', notes: ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'] },
  { name: 'Half Step Down (Eb-Ab-Db-Gb-Bb-Eb)', notes: ['Eb2', 'Ab2', 'Db3', 'Gb3', 'Bb3', 'Eb4'] },
];

export const GuitarTuner: React.FC<GuitarTunerProps> = ({ isOpen, onClose }) => {
  const [activeString, setActiveString] = useState<number | null>(null);

  if (!isOpen) return null;

  const handlePlayString = (idx: number) => {
    setActiveString(idx);
    playStringTuningTone(idx);
    setTimeout(() => {
      setActiveString(null);
    }, 2800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tuner Gitar & Nada Patokan"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Alat Musik</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Tuner Gitar (Nada Patokan)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 text-center">
            Klik senar di bawah untuk mendengarkan nada patokan dan stem gitar akustik atau listrik Anda:
          </p>

          {/* Guitar strings visual pegs */}
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {STRING_NAMES.map((strName, idx) => {
              const isActive = activeString === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handlePlayString(idx)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-150 active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-400/40'
                      : 'bg-slate-50 dark:bg-[#0B0F19] border-slate-200 dark:border-slate-800 hover:border-amber-500/50 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <Volume2 className={`w-4 h-4 mb-1.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="font-bold text-base font-mono">{strName.split(' ')[1].replace(/[()]/g, '')}</span>
                  <span className="text-[10px] opacity-75 mt-0.5">Senar {strName.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Tips Stem:</strong> Mulai dari senar 6 (E rendah) ke senar 1 (e tinggi). Samakan getaran nada senar gitar Anda dengan suara yang dihasilkan.
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-medium text-xs rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
