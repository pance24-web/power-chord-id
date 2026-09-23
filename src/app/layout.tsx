import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ServiceWorkerRegister } from '../components/ServiceWorkerRegister';

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#F97316',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'PowerChord - Cari Chord Lagu Favoritmu',
  description:
    'Temukan chord lagu dari berbagai genre dan artis favoritmu. Dilengkapi transpose kunci, capo, autoscroll, diagram kunci gitar, dan mode gelap.',
  openGraph: {
    title: 'PowerChord - Cari Chord Lagu Favoritmu',
    description:
      'Temukan chord lagu dari berbagai genre dan artis favoritmu. Dilengkapi transpose kunci, capo, autoscroll, diagram kunci gitar, dan mode gelap.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${sansFont.variable} ${monoFont.variable}`} suppressHydrationWarning>
      <body className="bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 min-h-screen antialiased selection:bg-amber-500/20 selection:text-amber-700 dark:selection:text-amber-300">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
