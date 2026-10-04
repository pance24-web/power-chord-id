import React, { useEffect } from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-5 sm:p-6 relative max-h-[85vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              {type === 'terms' ? <FileText className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {type === 'terms' ? 'Ketentuan Layanan (Terms of Service)' : 'Kebijakan Privasi (Privacy Policy)'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Terakhir diperbarui: 4 Oktober 2026 • PowerChord Platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-4 space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed pr-2">
          {type === 'terms' ? (
            <>
              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  1. Penerimaan Ketentuan
                </h3>
                <p>
                  Dengan mengakses dan menggunakan platform PowerChord, Anda menyetujui untuk terikat oleh Ketentuan Layanan ini. Jika Anda tidak menyetujui bagian mana pun dari ketentuan ini, Anda dipersilakan untuk tidak menggunakan platform ini.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  2. Tujuan Edukasi & Penggunaan Wajar (Fair Use)
                </h3>
                <p>
                  Diagram akor, transposisi tangga nada, dan lirik yang ditampilkan di PowerChord disediakan secara eksklusif untuk tujuan edukasi musik, pembelajaran mandiri, dan studi harmoni bagi musisi dan gitaris. Seluruh hak cipta lagu dan komposisi musik tetap menjadi milik sah pencipta lagu, artis, dan label rekaman masing-masing.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  3. Konten Ciptaan Pengguna (User-Generated Content)
                </h3>
                <p>
                  Pengguna dapat menyimpan aransemen akor kustom secara lokal. Anda bertanggung jawab penuh atas keaslian materi yang Anda masukkan dan memastikan konten tersebut tidak melanggar hak kekayaan intelektual pihak ketiga.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  4. Batasan Tanggung Jawab
                </h3>
                <p>
                  Layanan PowerChord disediakan &quot;sebagaimana adanya&quot; (as-is). Kami senantiasa berupaya memberikan keakuratan akor dan kestabilan performa, namun tidak memberikan jaminan tanpa cela atas kelalaian teknis atau gangguan koneksi pihak ketiga.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  1. Prinsip Privasi & Perlindungan Data
                </h3>
                <p>
                  PowerChord menjunjung tinggi privasi musisi. Kami tidak menjual, menyewakan, atau memperdagangkan data pribadi pengguna kepada pengiklan atau pihak ketiga mana pun.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  2. Penyimpanan Data Lokal (Local Storage)
                </h3>
                <p>
                  Sebagian besar fungsionalitas inti PowerChord beroperasi dengan prinsip <em>local-first</em>. Pengaturan tema (Terang/Gelap/AMOLED), ukuran font lirik, daftar favorit, riwayat stopwatch latihan, dan chord kustom disimpan langsung pada memori peramban Anda (Web LocalStorage) tanpa dikirim ke server pusat secara sembunyi-sembunyi.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  3. Keamanan Tingkat Lanjut (Security Headers)
                </h3>
                <p>
                  Situs ini dilindungi dengan standar keamanan web modern termasuk Content-Security-Policy (CSP), Strict-Transport-Security (HSTS 2 tahun), proteksi anti-clickjacking (X-Frame-Options), dan proteksi MIME-sniffing.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  4. Penghapusan Data Pengguna
                </h3>
                <p>
                  Karena data disimpan di sisi klien, Anda dapat menghapus seluruh data Anda kapan saja dengan membersihkan cache/data situs di pengaturan peramban Anda atau melalui opsi Reset Koleksi pada aplikasi.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
