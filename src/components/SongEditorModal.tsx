import React, { useState } from 'react';
import { Song, GenreType, DifficultyType } from '../types/chord';
import { X, Music2 } from 'lucide-react';

interface SongEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (song: Song) => void;
  initialSong?: Song | null;
}

const GENRES: GenreType[] = ['Pop', 'Rock', 'Akustik', 'Dangdut', 'Barat', 'Indie'];
const DIFFICULTIES: DifficultyType[] = ['Mudah', 'Sedang', 'Sulit'];
const KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export const SongEditorModal: React.FC<SongEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSong,
}) => {
  const [title, setTitle] = useState(initialSong?.title || '');
  const [artist, setArtist] = useState(initialSong?.artist || '');
  const [originalKey, setOriginalKey] = useState(initialSong?.originalKey || 'C');
  const [genre, setGenre] = useState<GenreType>(initialSong?.genre || 'Pop');
  const [difficulty, setDifficulty] = useState<DifficultyType>(initialSong?.difficulty || 'Mudah');
  const [capo, setCapo] = useState<number>(initialSong?.capo || 0);
  const [content, setContent] = useState(
    initialSong?.content ||
      `[Intro]\nC  G  Am  F\n\n[Verse 1]\nC           G\nTulis lirik lagu di sini\nAm          F\nDengan kunci di atasnya\n\n[Chorus]\nC       G\nIni bagian reff\nAm      F\nLagu favorit Anda`
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim() || !content.trim()) return;

    const newSong: Song = {
      id: initialSong?.id || `custom-${Date.now()}`,
      title: title.trim(),
      artist: artist.trim(),
      originalKey,
      genre,
      difficulty,
      capo,
      content,
      isCustom: true,
      createdAt: initialSong?.createdAt || Date.now(),
    };

    onSave(newSong);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tambah Chord Lagu Baru"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {initialSong ? 'Edit Chord Lagu' : 'Tambah Chord Lagu Baru'}
              </h3>
              <p className="text-xs text-neutral-500">Tersimpan otomatis di memori browser Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto py-4 space-y-4 pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Judul Lagu *
              </label>
              <input
                type="text"
                required
                placeholder="cth: Kopi Dangdut"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Artis / Penyanyi *
              </label>
              <input
                type="text"
                required
                placeholder="cth: Fahmi Shahab"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Nada Dasar (Key)
              </label>
              <select
                value={originalKey}
                onChange={(e) => setOriginalKey(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
              >
                {KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value as GenreType)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Tingkat Kesulitan
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyType)}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Capo (Fret)
              </label>
              <input
                type="number"
                min="0"
                max="7"
                value={capo}
                onChange={(e) => setCapo(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Isi Kunci & Lirik *
              </label>
              <span className="text-[11px] text-neutral-400">
                Gunakan baris terpisah untuk chord atau kurung siku [Am]
              </span>
            </div>
            <textarea
              required
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ketik atau tempel lirik & chord di sini..."
              className="w-full p-3 font-mono text-xs md:text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100 leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-xs transition-colors"
            >
              Simpan Lagu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
