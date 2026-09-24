import React, { useState } from 'react';
import { X, Volume2 } from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

interface GuitarTunerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StringData {
  stringNumber: number;
  note: 'E2' | 'A2' | 'D3' | 'G3' | 'B3' | 'E4';
  name: string;
  frequency: number;
  gauge: string;
}

const STRINGS: StringData[] = [
  { stringNumber: 6, note: 'E2', name: 'Low E', frequency: 82.41, gauge: 'Tebal (.046)' },
  { stringNumber: 5, note: 'A2', name: 'A', frequency: 110.00, gauge: '.036' },
  { stringNumber: 4, note: 'D3', name: 'D', frequency: 146.83, gauge: '.026' },
  { stringNumber: 3, note: 'G3', name: 'G', frequency: 196.00, gauge: '.017' },
  { stringNumber: 2, note: 'B3', name: 'B', frequency: 246.94, gauge: '.013' },
  { stringNumber: 1, note: 'E4', name: 'High E', frequency: 329.63, gauge: 'Tipis (.010)' },
];

export const GuitarTuner: React.FC<GuitarTunerProps> = ({ isOpen, onClose }) => {
  const [activeString, setActiveString] = useState<string | null>(null);

  if (!isOpen) return null;

  const playNote = (item: StringData) => {
    setActiveString(item.note);
    audioSynth.playGuitarString(item.note);
    setTimeout(() => {
      setActiveString(null);
    }, 2500);
  };

  const playAllStrum = () => {
    STRINGS.forEach((item, index) => {
      setTimeout(() => {
        audioSynth.playGuitarString(item.note);
      }, index * 200);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              🎸
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Guitar Tuner Virtual</h2>
              <p className="text-xs text-slate-500">Standard Tuning (E A D G B e)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tuner Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 text-center">
            Klik senar untuk mendengarkan frekuensi referensi nada standar gitar akustik / elektrik.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STRINGS.map((str) => {
              const isPlaying = activeString === str.note;
              return (
                <button
                  key={str.note}
                  onClick={() => playNote(str)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-500 text-white border-amber-500 shadow-lg scale-105 animate-pulse'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold opacity-60">Senar {str.stringNumber}</span>
                  <span className="font-mono text-2xl font-black my-0.5">{str.name}</span>
                  <span className="text-[10px] font-mono opacity-80">{str.frequency} Hz</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={playAllStrum}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-amber-500" />
              Petik Semua Senar (Strum 6-1)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
