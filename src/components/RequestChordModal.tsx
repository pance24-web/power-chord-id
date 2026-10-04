import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { ChordRequest, STORAGE_KEYS } from '../types/chord';
import { sanitizeText, validateEmail } from '../utils/sanitizer';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanTitle = sanitizeText(songTitle, 100);
    const cleanArtist = sanitizeText(artist, 100);
    const cleanNotes = sanitizeText(notes, 500);

    if (cleanTitle.length < 2) {
      setErrorMessage('Judul lagu wajib diisi minimal 2 karakter.');
      return;
    }
    if (cleanArtist.length < 2) {
      setErrorMessage('Nama artis wajib diisi minimal 2 karakter.');
      return;
    }
    if (requesterEmail.trim() && !validateEmail(requesterEmail.trim())) {
      setErrorMessage('Format email tidak valid. Mohon periksa kembali.');
      return;
    }

    const newRequest: ChordRequest = {
      id: `req-${Date.now()}`,
      songTitle: cleanTitle,
      artist: cleanArtist,
      requesterEmail: requesterEmail.trim() || undefined,
      notes: cleanNotes || undefined,
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
      setErrorMessage(null);
      onClose();
    }, 1800);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
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
              <p className="text-xs text-slate-500 mt-0.5">Lagu yang kamu cari belum ada? Ajukan judul lagu di bawah ini.</p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Judul Lagu <span className="text-blue-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Sialan, Komang, dll"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Artis / Band <span className="text-blue-600">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Juicy Luicy, Raim Laode"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100"
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
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100"
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
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
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
