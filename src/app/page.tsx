'use client';

import dynamic from 'next/dynamic';

const PowerChordApp = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-500">Memuat PowerChord...</span>
      </div>
    </div>
  ),
});

export default function Page() {
  return <PowerChordApp />;
}
