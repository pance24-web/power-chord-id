import React from 'react';
import { X } from 'lucide-react';
import { getChordData } from '../utils/chordDb';
import { ChordDiagram } from './ChordDiagram';

interface ChordModalProps {
  chordName: string | null;
  onClose: () => void;
}

export const ChordModal: React.FC<ChordModalProps> = ({ chordName, onClose }) => {
  if (!chordName) return null;
  const chordData = getChordData(chordName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xs w-full p-5 relative">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 text-center">
          Kunci Gitar: <span className="text-amber-500 font-mono">{chordName}</span>
        </h3>

        <div className="flex justify-center my-2">
          <ChordDiagram chord={chordData} chordName={chordName} size="lg" showSoundButton={true} />
        </div>

        <p className="text-xs text-slate-500 text-center mt-3">
          Tekan tombol speaker untuk mendengarkan petikan senar gitar secara virtual.
        </p>
      </div>
    </div>
  );
};
