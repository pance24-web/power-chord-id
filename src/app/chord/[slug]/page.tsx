import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { INITIAL_SONGS } from '@/data/songs';
import { SITE_URL } from '@/lib/site';
import type { Song } from '@/types/chord';

interface ChordPageProps {
  params: Promise<{ slug: string }>;
}

function getSong(slug: string): Song | undefined {
  return INITIAL_SONGS.find((song) => song.id === slug);
}

function getSongUrl(song: Song): string {
  return `${SITE_URL}/chord/${song.id}`;
}

export function generateStaticParams() {
  return INITIAL_SONGS.map((song) => ({ slug: song.id }));
}

export async function generateMetadata({ params }: ChordPageProps): Promise<Metadata> {
  const { slug } = await params;
  const song = getSong(slug);

  if (!song) {
    return {
      title: 'Chord tidak ditemukan | PowerChord',
      robots: { index: false, follow: false },
    };
  }

  const title = `Chord ${song.title} - ${song.artist} | PowerChord`;
  const description = `Chord gitar ${song.title} dari ${song.artist} lengkap dengan kunci dasar ${song.originalKey}, capo, transpose, diagram chord, dan autoscroll.`;
  const url = getSongUrl(song);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      url,
      siteName: 'PowerChord',
      title,
      description,
      locale: 'id_ID',
      images: [
        {
          url: `${SITE_URL}/PowerChord-logo.svg`,
          alt: `Logo PowerChord - chord ${song.title}`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [`${SITE_URL}/PowerChord-logo.svg`],
    },
  };
}

export default async function ChordPage({ params }: ChordPageProps) {
  const { slug } = await params;
  const song = getSong(slug);

  if (!song) {
    notFound();
  }

  const relatedSongs = INITIAL_SONGS.filter((relatedSong) => relatedSong.id !== song.id).slice(0, 6);
  const songUrl = getSongUrl(song);
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MusicComposition',
        '@id': `${songUrl}#composition`,
        url: songUrl,
        name: song.title,
        composer: {
          '@type': 'Person',
          name: song.artist,
        },
        musicalKey: song.originalKey,
        ...(song.genre ? { genre: song.genre } : {}),
        inLanguage: 'id',
        mainEntityOfPage: { '@id': `${songUrl}#webpage` },
      },
      {
        '@type': 'WebPage',
        '@id': `${songUrl}#webpage`,
        url: songUrl,
        name: `Chord ${song.title} - ${song.artist} | PowerChord`,
        description: `Chord gitar ${song.title} dari ${song.artist} lengkap dengan kunci dasar ${song.originalKey}.`,
        inLanguage: 'id',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${SITE_URL}#website`,
          url: SITE_URL,
          name: 'PowerChord',
        },
        breadcrumb: { '@id': `${songUrl}#breadcrumb` },
        mainEntity: { '@id': `${songUrl}#composition` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${songUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'PowerChord',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: `Chord ${song.title}`,
            item: songUrl,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 text-slate-900 dark:bg-[#0B0F19] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
            PowerChord
          </Link>
          <span aria-hidden="true" className="px-2">/</span>
          <span>Chord {song.title}</span>
        </nav>

        <article>
          <header className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-800">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Chord gitar dan lirik lagu
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Chord {song.title} - {song.artist}
            </h1>
            <p className="mt-3 max-w-3xl text-base text-slate-600 dark:text-slate-300">
              Pelajari chord {song.title} dari {song.artist} dengan kunci dasar {song.originalKey}.
              Gunakan halaman ini sebagai referensi latihan gitar.
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-900">
                <dt className="text-slate-500 dark:text-slate-400">Nada dasar</dt>
                <dd className="mt-1 font-bold">{song.originalKey}</dd>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-900">
                <dt className="text-slate-500 dark:text-slate-400">Capo</dt>
                <dd className="mt-1 font-bold">{song.capo ? `Fret ${song.capo}` : 'Tanpa capo'}</dd>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-900">
                <dt className="text-slate-500 dark:text-slate-400">Tempo</dt>
                <dd className="mt-1 font-bold">{song.tempo ? `${song.tempo} BPM` : '—'}</dd>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-900">
                <dt className="text-slate-500 dark:text-slate-400">Tingkat</dt>
                <dd className="mt-1 font-bold">{song.difficulty || 'Umum'}</dd>
              </div>
            </dl>
          </header>

          <section aria-labelledby="chord-list-heading" className="mb-8">
            <h2 id="chord-list-heading" className="mb-3 text-xl font-bold">Chord yang digunakan</h2>
            <p className="text-slate-700 dark:text-slate-300">{song.chords.join(' · ')}</p>
          </section>

          <section aria-labelledby="song-content-heading">
            <h2 id="song-content-heading" className="mb-4 text-xl font-bold">
              Chord {song.title}
            </h2>
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-white p-5 font-mono text-sm leading-7 shadow-sm dark:bg-slate-900 dark:text-slate-200">
              {song.content}
            </pre>
          </section>
        </article>

        <aside aria-labelledby="related-songs-heading" className="mt-10 border-t border-slate-200 pt-8 dark:border-slate-800">
          <h2 id="related-songs-heading" className="mb-4 text-xl font-bold">Chord lagu lainnya</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedSongs.map((relatedSong) => (
              <li key={relatedSong.id}>
                <Link
                  href={`/chord/${relatedSong.id}`}
                  className="block rounded-lg bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900"
                >
                  <span className="font-semibold">{relatedSong.title}</span>
                  <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{relatedSong.artist}</span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <footer className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <Link href="/" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Kembali ke PowerChord
          </Link>
        </footer>
      </div>
    </main>
  );
}
