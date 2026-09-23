import React, { useState } from 'react';
import { X, Send, Music2, CheckCircle2 } from 'lucide-react';
import { ChordRequest } from '../types/chord';

interface RequestChordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: ChordRequest) => void;
}

export const RequestChordModal: React.FC<RequestChordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [songTitle, setSongTitle] = useState('');
  const [artistName, setArtistName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim() || !artistName.trim()) return;

    const request: ChordRequest = {
      id: `req-${Date.now()}`,
      songTitle: songTitle.trim(),
      artistName: artistName.trim(),
      notes: notes.trim(),
      createdAt: Date.now(),
    };

    onSubmit(request);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSongTitle('');
      setArtistName('');
      setNotes('');
      onClose();
    }, 1500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Request Chord Lagu"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Request Chord
              </h3>
              <p className="text-xs text-slate-500">Belum ada chord yang kamu cari? Kirim permintaanmu!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Permintaan Terkirim!
            </h4>
            <p className="text-xs text-slate-500">
              Terima kasih! Tim kami akan meninjau dan menambahkan chord "{songTitle}" sesegera mungkin.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Judul Lagu *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Sialan, Komang, Bunga Maaf..."
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Artis / Penyanyi *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Juicy Luicy, Raim Laode..."
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Versi live akustik, nada dasar pria, link YouTube..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Request</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
