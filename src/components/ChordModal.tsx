import React, { useEffect, useState } from 'react';
import { X, Guitar, Music2, Piano } from 'lucide-react';
import { getChordData } from '../utils/chordDb';
import { ChordDiagram } from './ChordDiagram';
import { InstrumentType, STORAGE_KEYS } from '../types/chord';

interface ChordModalProps {
  chordName: string | null;
  onClose: () => void;
}

const INSTRUMENTS: { id: InstrumentType; label: string; icon: React.ReactNode }[] = [
  { id: 'guitar', label: 'Gitar', icon: <Guitar className="w-3.5 h-3.5" /> },
  { id: 'ukulele', label: 'Ukulele', icon: <Music2 className="w-3.5 h-3.5" /> },
  { id: 'piano', label: 'Piano', icon: <Piano className="w-3.5 h-3.5" /> },
];

export const ChordModal: React.FC<ChordModalProps> = ({ chordName, onClose }) => {
  const [instrument, setInstrument] = useState<InstrumentType>('guitar');

  useEffect(() => {
    if (!chordName) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFERRED_INSTRUMENT) as InstrumentType | null;
      if (saved && ['guitar', 'ukulele', 'piano'].includes(saved)) {
        setInstrument(saved);
      }
    } catch {
      /* ignore */
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chordName, onClose]);

  const handleInstrumentChange = (id: InstrumentType) => {
    setInstrument(id);
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERRED_INSTRUMENT, id);
    } catch {
      /* ignore */
    }
  };

  if (!chordName) return null;
  const chordData = getChordData(chordName, instrument);

  const instrumentLabel =
    instrument === 'guitar' ? 'Gitar' : instrument === 'ukulele' ? 'Ukulele' : 'Piano';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xs w-full p-5 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 text-center pr-6">
          Kunci {instrumentLabel}:{' '}
          <span className="text-amber-500 font-mono">{chordName}</span>
        </h3>

        {/* Instrument switcher */}
        <div className="flex items-center justify-center gap-1 mb-3 p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
          {INSTRUMENTS.map((inst) => (
            <button
              key={inst.id}
              onClick={() => handleInstrumentChange(inst.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                instrument === inst.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {inst.icon}
              <span>{inst.label}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-center my-2">
          <ChordDiagram
            chord={chordData}
            chordName={chordName}
            size="lg"
            showSoundButton={true}
            instrument={instrument}
          />
        </div>

        <p className="text-xs text-slate-500 text-center mt-3">
          Tekan tombol speaker untuk mendengarkan akor secara virtual.
        </p>
      </div>
    </div>
  );
};
