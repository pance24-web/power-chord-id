import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { getChordDefinition } from '../utils/chordDb';
import { ChordDiagram } from './ChordDiagram';

interface ChordDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const QUALITIES = [
  { label: 'Mayor', suffix: '' },
  { label: 'Minor', suffix: 'm' },
  { label: '7 (Dominant)', suffix: '7' },
  { label: 'maj7', suffix: 'maj7' },
  { label: 'm7', suffix: 'm7' },
  { label: 'sus4', suffix: 'sus4' },
  { label: 'sus2', suffix: 'sus2' },
  { label: 'add9', suffix: 'add9' },
];

export const ChordDictionaryModal: React.FC<ChordDictionaryModalProps> = ({ isOpen, onClose }) => {
  const [selectedRoot, setSelectedRoot] = useState('C');
  const [selectedSuffix, setSelectedSuffix] = useState('');
  const [customSearch, setCustomSearch] = useState('');

  if (!isOpen) return null;

  const currentChordName = customSearch.trim() || `${selectedRoot}${selectedSuffix}`;
  const chordDef = getChordDefinition(currentChordName);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kamus Kunci Gitar Lengkap"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Perpustakaan Kunci</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Kamus Kunci Gitar</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 overflow-y-auto space-y-4 pr-1">
          {/* Direct Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kunci langsung (cth: Am, G7, F#m, Dsus4)..."
              value={customSearch}
              onChange={(e) => setCustomSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
            />
            {customSearch && (
              <button
                onClick={() => setCustomSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Hapus
              </button>
            )}
          </div>

          {!customSearch && (
            <>
              {/* Root Note Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  1. Pilih Nada Dasar (Root)
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {ROOTS.map((root) => (
                    <button
                      key={root}
                      onClick={() => setSelectedRoot(root)}
                      className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        selectedRoot === root
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {root}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chord Quality / Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  2. Pilih Tipe Akord
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {QUALITIES.map((q) => (
                    <button
                      key={q.suffix}
                      onClick={() => setSelectedSuffix(q.suffix)}
                      className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors truncate cursor-pointer ${
                        selectedSuffix === q.suffix
                          ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Result Card */}
          <div className="pt-2">
            <div className="p-6 bg-slate-50 dark:bg-[#0B0F19] rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
              {chordDef ? (
                <>
                  <div className="text-center mb-2">
                    <span className="text-xs text-slate-500 font-mono">Bentuk Akord:</span>
                    <h4 className="text-2xl font-black text-amber-600 dark:text-amber-500">{chordDef.name}</h4>
                  </div>
                  <ChordDiagram chord={chordDef} size="lg" />
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    Klik ikon suara di atas diagram untuk membunyikan petikan kunci ini.
                  </p>
                </>
              ) : (
                <div className="py-8 text-center text-slate-400 text-sm">
                  Kunci "{currentChordName}" tidak ditemukan dalam kamus umum.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-medium text-xs rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
