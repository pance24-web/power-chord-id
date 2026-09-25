import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PowerChord - Cari Chord Lagu Favoritmu',
  description: 'Temukan chord lagu dari berbagai genre dan artis favoritmu. Dilengkapi transpose kunci, capo, autoscroll, diagram kunci gitar, dan mode gelap.',
  openGraph: {
    title: 'PowerChord - Cari Chord Lagu Favoritmu',
    description: 'Temukan chord lagu dari berbagai genre dan artis favoritmu. Dilengkapi transpose kunci, capo, autoscroll, diagram kunci gitar, dan mode gelap.',
    images: ['/PowerChord-logo.svg'],
  },
  icons: {
    icon: '/logo.svg',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 min-h-screen antialiased selection:bg-blue-500/20 selection:text-blue-700 dark:selection:text-blue-300">
        {children}
      </body>
    </html>
  );
}
