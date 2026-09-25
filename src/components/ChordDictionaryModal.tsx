import React, { useState } from 'react';
import { X, Search, BookOpen } from 'lucide-react';
import { CHORD_DATABASE, getChordData } from '../utils/chordDb';
import { ChordDiagram } from './ChordDiagram';

interface ChordDictionaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChordDictionaryModal: React.FC<ChordDictionaryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRoot, setSelectedRoot] = useState<string>('All');

  if (!isOpen) return null;

  const roots = ['All', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  const allChords = Object.keys(CHORD_DATABASE);

  const filteredChords = allChords.filter((c) => {
    const matchesSearch = c.toLowerCase().includes(search.toLowerCase());
    const matchesRoot =
      selectedRoot === 'All' ||
      c.startsWith(selectedRoot) ||
      (selectedRoot === 'Eb' && c.startsWith('D#')) ||
      (selectedRoot === 'Ab' && c.startsWith('G#')) ||
      (selectedRoot === 'Bb' && c.startsWith('A#'));

    return matchesSearch && matchesRoot;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Kamus Kunci Gitar</h2>
              <p className="text-xs text-slate-500">Kumpulan diagram chord gitar lengkap dengan fingering &amp; audio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Root Filter */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari akor (misal: C, Am, G7, F#m, Dsus4)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {roots.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRoot(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedRoot === r
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Chord Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredChords.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredChords.map((chordName) => {
                const pos = getChordData(chordName);
                if (!pos) return null;
                return (
                  <div
                    key={chordName}
                    className="p-3 bg-slate-50/80 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center hover:border-blue-400 transition-colors"
                  >
                    <ChordDiagram chord={pos} chordName={chordName} size="sm" showSoundButton={true} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Tidak ada akor yang cocok dengan &quot;{search}&quot;.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
