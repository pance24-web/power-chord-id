import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { ChordRequest, STORAGE_KEYS } from '../types/chord';

interface RequestChordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSubmitted?: (req: ChordRequest) => void;
}

export const RequestChordModal: React.FC<RequestChordModalProps> = ({
  isOpen,
  onClose,
  onRequestSubmitted,
}) => {
  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim() || !artist.trim()) return;

    const newRequest: ChordRequest = {
      id: `req-${Date.now()}`,
      songTitle: songTitle.trim(),
      artist: artist.trim(),
      requesterEmail: requesterEmail.trim() || undefined,
      notes: notes.trim() || undefined,
      requestedAt: new Date().toISOString(),
    };

    try {
      const existing = localStorage.getItem(STORAGE_KEYS.CHORD_REQUESTS);
      const parsed: ChordRequest[] = existing ? JSON.parse(existing) : [];
      localStorage.setItem(STORAGE_KEYS.CHORD_REQUESTS, JSON.stringify([newRequest, ...parsed]));
    } catch (e) {
      console.error('Failed to save request:', e);
    }

    if (onRequestSubmitted) {
      onRequestSubmitted(newRequest);
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSongTitle('');
      setArtist('');
      setNotes('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Permintaan Terkirim!</h3>
            <p className="text-xs text-slate-500">
              Terima kasih. Permintaan chord &quot;{songTitle}&quot; telah kami catat untuk penambahan katalog berikutnya.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Request Chord Lagu</h3>
              <p className="text-xs text-slate-500">Lagu yang kamu cari belum ada? Ajukan judul lagu di bawah ini.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Judul Lagu <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Sialan, Komang, dll"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Artis / Band <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Juicy Luicy, Raim Laode"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Anda (Opsional)
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                value={requesterEmail}
                onChange={(e) => setRequesterEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Versi akustik / live, dll"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Send className="w-4 h-4" />
              Kirim Request Chord
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
