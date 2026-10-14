import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PowerChord - Chord Lagu Indonesia',
    short_name: 'PowerChord',
    description: 'Cari chord lagu, transpose kunci, autoscroll, dan latihan gitar offline.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#0B0F19',
    theme_color: '#2563EB',
    lang: 'id-ID',
    categories: ['music', 'entertainment', 'education'],
    icons: [
      { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
