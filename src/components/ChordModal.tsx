import React from 'react';
import { ChordDefinition } from '../types/chord';
import { ChordDiagram } from './ChordDiagram';
import { playChordStrum } from '../utils/audioSynth';
import { X, Volume2 } from 'lucide-react';

interface ChordModalProps {
  chord: ChordDefinition | null;
  chordName?: string;
  onClose: () => void;
}

export const ChordModal: React.FC<ChordModalProps> = ({ chord, chordName, onClose }) => {
  if (!chord && !chordName) return null;

  const displayName = chord?.name || chordName || '';

  const stringNames = ['Senar 6 (E rendah)', 'Senar 5 (A)', 'Senar 4 (D)', 'Senar 3 (G)', 'Senar 2 (B)', 'Senar 1 (e tinggi)'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Diagram Kunci ${displayName}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Diagram Kunci Gitar</span>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{displayName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 flex flex-col items-center justify-center">
          {chord ? (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-950/60 rounded-xl border border-neutral-100 dark:border-neutral-800/80">
              <ChordDiagram chord={chord} size="lg" showPlayButton={false} />
            </div>
          ) : (
            <div className="py-10 text-center text-neutral-500">
              Diagram belum tersedia untuk variasi kunci ini.
            </div>
          )}

          {chord && (
            <button
              onClick={() => playChordStrum(chord)}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors shadow-sm active:scale-[0.98]"
            >
              <Volume2 className="w-4 h-4" />
              <span>Dengarkan Suara Kunci</span>
            </button>
          )}
        </div>

        {chord && chord.frets && (
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 text-xs text-neutral-500 space-y-1">
            <p className="font-semibold text-neutral-700 dark:text-neutral-300">Posisi Senar:</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              {chord.frets.map((fret, i) => (
                <div key={i} className="flex justify-between font-mono">
                  <span>{stringNames[i].split(' ')[0] + ' ' + stringNames[i].split(' ')[1]}:</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {fret === -1 ? '✕ Mute' : fret === 0 ? '○ Open' : `Fret ${fret}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
