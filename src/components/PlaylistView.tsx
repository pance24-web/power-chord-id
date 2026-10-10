import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Clock3, Heart, ListMusic, Music2, Eye } from 'lucide-react';
import { Song } from '../types/chord';
import { getSongTotalViews, getSongTotalLikes, formatCount } from '../utils/realtimeStats';

interface PlaylistViewProps {
  songs: Song[];
  favorites: string[];
  onSelectSong: (song: Song) => void;
  onToggleFavorite: (e: React.MouseEvent, songId: string) => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  songs,
  favorites,
  onSelectSong,
  onToggleFavorite,
}) => {
  const [, setStatsVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setStatsVersion((v) => v + 1);
    window.addEventListener('powerchord:stats_updated', handleUpdate);
    window.addEventListener('powerchord:favorites_updated', handleUpdate);
    return () => {
      window.removeEventListener('powerchord:stats_updated', handleUpdate);
      window.removeEventListener('powerchord:favorites_updated', handleUpdate);
    };
  }, []);

  const rockSongs = useMemo(
    () =>
      songs
        .filter(
          (song) =>
            song.genre?.toLowerCase() === 'rock' ||
            song.tags?.some((tag) => tag.toLowerCase() === 'rock'),
        )
        .sort((a, b) => getSongTotalViews(b.id, b.views) - getSongTotalViews(a.id, a.views)),
    [songs],
  );

  const totalViews = rockSongs.reduce(
    (total, song) => total + getSongTotalViews(song.id, song.views),
    0,
  );

  return (
    <div className="space-y-7 pb-20">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
              <ListMusic className="h-4 w-4" />
            </span>
            Playlist PowerChord
          </div>
          <div className="space-y-3">
            <h1 className="max-w-xl text-3xl font-black tracking-tight sm:text-5xl">
              Rock yang tak pernah pelan.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
              Kumpulan chord rock pilihan untuk sesi latihan dengan distorsi, riff tajam, dan energi yang terus menyala.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/10">Rock</span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/10">
              {rockSongs.length} lagu
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/10">
              {formatCount(totalViews)} tayangan
            </span>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-5 right-6 hidden opacity-20 sm:block">
          <Music2 className="h-40 w-40 rotate-12" strokeWidth={1} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              Tracklist
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              Mainkan chord pilihanmu
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Clock3 className="h-3.5 w-3.5" />
            Diurutkan paling populer
          </div>
        </div>

        {rockSongs.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="hidden grid-cols-12 border-b border-slate-100 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 sm:grid">
              <span className="col-span-1">#</span>
              <span className="col-span-4">Judul lagu</span>
              <span className="col-span-3">Artis</span>
              <span className="col-span-1">Key</span>
              <span className="col-span-1">Tayangan</span>
              <span className="col-span-1">Favorit</span>
              <span className="col-span-1 text-right">Aksi</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {rockSongs.map((song, index) => {
                const isFavorite = favorites.includes(song.id);
                const realtimeViews = getSongTotalViews(song.id, song.views);
                const realtimeLikes = getSongTotalLikes(song.id, song.likes, isFavorite);
                return (
                  <div
                    key={song.id}
                    onClick={() => onSelectSong(song)}
                    className="group flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 sm:grid sm:grid-cols-12 sm:px-5"
                  >
                    <span className="w-5 shrink-0 text-xs font-bold text-slate-400 sm:col-span-1 sm:w-auto">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1 sm:col-span-4">
                      <p className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                        <Link href={`/chord/${song.id}`} className="focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm">
                          {song.title}
                        </Link>
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400 sm:hidden">
                        {song.artist} · {formatCount(realtimeViews)} views · {formatCount(realtimeLikes)} fav
                      </p>
                    </div>
                    <span className="hidden truncate text-xs text-slate-600 dark:text-slate-400 sm:col-span-3 sm:block">
                      {song.artist}
                    </span>
                    <span className="hidden text-xs font-bold text-blue-600 dark:text-blue-400 sm:col-span-1 sm:block">
                      {song.originalKey}
                    </span>
                    <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:col-span-1 sm:flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      <span>{formatCount(realtimeViews)}</span>
                    </span>
                    <span className={`hidden text-xs sm:col-span-1 sm:flex items-center gap-1 ${isFavorite ? 'text-rose-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                      <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
                      <span>{formatCount(realtimeLikes)}</span>
                    </span>
                    <div className="flex shrink-0 items-center gap-1 sm:col-span-1 sm:justify-end">
                      <button
                        onClick={(event) => onToggleFavorite(event, song.id)}
                        className={`rounded-full p-1.5 transition-colors cursor-pointer ${
                          isFavorite
                            ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                            : 'text-slate-300 hover:text-rose-500 dark:text-slate-600'
                        }`}
                        aria-label={isFavorite ? 'Hapus dari favorit' : 'Simpan ke favorit'}
                        title={isFavorite ? 'Hapus dari favorit' : 'Simpan ke favorit'}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600 dark:text-slate-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <Music2 className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">Belum ada lagu rock</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tambahkan lagu rock ke katalog untuk mengisi playlist ini.</p>
          </div>
        )}
      </section>
    </div>
  );
};
