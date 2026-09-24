import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { Song } from '../types/chord';

interface SongEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSong: (song: Song) => void;
  editingSong?: Song | null;
}

export const SongEditorModal: React.FC<SongEditorModalProps> = ({
  isOpen,
  onClose,
  onSaveSong,
  editingSong,
}) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [originalKey, setOriginalKey] = useState('C');
  const [tempo, setTempo] = useState<string>('80');
  const [capo, setCapo] = useState<number>(0);
  const [genre, setGenre] = useState('Pop');
  const [difficulty, setDifficulty] = useState<'Mudah' | 'Sedang' | 'Lanjutan'>('Mudah');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (editingSong) {
      setTitle(editingSong.title);
      setArtist(editingSong.artist);
      setOriginalKey(editingSong.originalKey || 'C');
      setTempo(String(editingSong.tempo || '80'));
      setCapo(editingSong.capo || 0);
      setGenre(editingSong.genre || 'Pop');
      setDifficulty(editingSong.difficulty || 'Mudah');
      setContent(editingSong.content || '');
    } else {
      setTitle('');
      setArtist('');
      setOriginalKey('C');
      setTempo('80');
      setCapo(0);
      setGenre('Pop');
      setDifficulty('Mudah');
      setContent(`[Intro]\nC  G  Am  F\n\n[Verse 1]\nC             G\nLirik baris pertama\nAm            F\nLirik baris kedua\n\n[Chorus]\nC             G\nLirik chorus di sini\nAm            F\nLirik chorus lanjut`);
    }
  }, [editingSong, isOpen]);

  if (!isOpen) return null;

  // Extract chords from content
  const extractChords = (text: string): string[] => {
    const chordMatches = text.match(/\b([A-G][b#]?)(m|maj|min|dim|aug|sus|add)?([0-9]{1,2})?((\/[A-G][b#]?)?)\b/g);
    if (!chordMatches) return [];
    return Array.from(new Set(chordMatches));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) return;

    const chords = extractChords(content);

    const song: Song = {
      id: editingSong?.id || `custom-${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      title: title.trim(),
      artist: artist.trim(),
      originalKey,
      tempo: tempo ? parseInt(tempo, 10) : undefined,
      capo,
      genre,
      difficulty,
      chords,
      content,
      isCustom: true,
      createdAt: editingSong?.createdAt || new Date().toISOString(),
    };

    onSaveSong(song);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              {editingSong ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingSong ? 'Edit Chord Lagu' : 'Tambah Chord Lagu Baru'}
              </h2>
              <p className="text-xs text-slate-500">Buat chord custom Anda sendiri dan simpan ke koleksi offline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Judul Lagu <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul lagu..."
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Artis / Penyanyi <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Nama artis..."
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kunci Asal
              </label>
              <select
                value={originalKey}
                onChange={(e) => setOriginalKey(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
              >
                {['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'].map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Capo Fret
              </label>
              <select
                value={capo}
                onChange={(e) => setCapo(Number(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
              >
                <option value={0}>Tanpa Capo</option>
                {[1, 2, 3, 4, 5, 6, 7].map((c) => (
                  <option key={c} value={c}>Capo {c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tempo (BPM)
              </label>
              <input
                type="number"
                value={tempo}
                onChange={(e) => setTempo(e.target.value)}
                placeholder="80"
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tingkat
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'Mudah' | 'Sedang' | 'Lanjutan')}
                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
              >
                <option value="Mudah">Mudah</option>
                <option value="Sedang">Sedang</option>
                <option value="Lanjutan">Lanjutan</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Chord &amp; Lirik Lagu <span className="text-amber-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Gunakan font monospaced</span>
            </div>
            <textarea
              required
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ketik chord di atas lirik atau [C] dalam tanda kurung..."
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              Simpan Chord
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
