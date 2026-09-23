import { useState, useEffect } from 'react';
import { Song, ThemeType, ChordRequest } from './types/chord';
import { INITIAL_SONGS } from './data/songs';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { SongList } from './components/SongList';
import { SongViewer } from './components/SongViewer';
import { ArtistsView } from './components/ArtistsView';
import { RequestChordModal } from './components/RequestChordModal';
import { QuickSearchModal } from './components/QuickSearchModal';
import { ChordDictionaryModal } from './components/ChordDictionaryModal';
import { GuitarTuner } from './components/GuitarTuner';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  cacheFavoriteSongs,
  getOfflineFavoriteSongs,
  cacheViewedSong,
} from './utils/offlineStorage';

const STORAGE_KEYS = {
  THEME: 'powerchord_theme',
  FAVORITES: 'powerchord_favorites',
  CUSTOM_SONGS: 'powerchord_custom_songs',
  REQUESTS: 'powerchord_requests',
};

export default function App() {
  // Theme state: defaults to 'light' to match the clean white and blue aesthetics of the mockup, but fully supports dark mode!
  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeType;
    if (saved && ['light', 'dark', 'amoled'].includes(saved)) {
      return saved;
    }
    return 'light';
  });

  // Songs state
  const [songs, setSongs] = useState<Song[]>(() => {
    let all = [...INITIAL_SONGS];
    try {
      const savedCustom = localStorage.getItem(STORAGE_KEYS.CUSTOM_SONGS);
      if (savedCustom) {
        const parsed: Song[] = JSON.parse(savedCustom);
        all = [...parsed, ...all];
      }
      // Merge any favorite songs cached offline
      const cachedFavorites = getOfflineFavoriteSongs();
      if (cachedFavorites.length > 0) {
        const existingIds = new Set(all.map((s) => s.id));
        const missingFavorites = cachedFavorites.filter((s) => !existingIds.has(s.id));
        all = [...all, ...missingFavorites];
      }
    } catch (e) {
      console.error('Error loading songs:', e);
    }
    return all;
  });

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading favorites:', e);
    }
    return ['sampai-jumpa-endank-soekamti', 'hati-yang-kau-sakiti-rizky-febian'];
  });

  // Navigation tab: 'home' | 'catalog' | 'artists'
  const [currentTab, setCurrentTab] = useState<'home' | 'catalog' | 'artists'>('home');

  // Catalog filter options passed from home page or artist page
  const [catalogFilters, setCatalogFilters] = useState<{
    genre?: string;
    letter?: string;
    search?: string;
  }>({ genre: 'all', letter: '', search: '' });

  // Selected song for detail view (Mockup 3 & 6)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isTunerOpen, setIsTunerOpen] = useState(false);

  // URL deep linking & browser back/forward support (popstate)
  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const songParam = urlParams.get('song');
      const hashParam = window.location.hash.replace(/^#\/?(chord\/)?/, '');
      const targetId = songParam || hashParam;

      if (targetId) {
        const found = songs.find(
          (s) => s.id === targetId || s.id.toLowerCase() === targetId.toLowerCase()
        );
        if (found) {
          setSelectedSong(found);
          return;
        }
      }
      setSelectedSong(null);
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [songs]);

  // Sync document title and meta description dynamically for each song
  useEffect(() => {
    if (selectedSong) {
      document.title = `Chord ${selectedSong.title} - ${selectedSong.artist} | PowerChord`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          `Kunci gitar dan lirik lagu ${selectedSong.title} oleh ${selectedSong.artist}. Nada dasar ${selectedSong.originalKey || 'C'}, lengkap dengan transpose nada, autoscroll presisi, dan diagram chord.`
        );
      }
    } else {
      document.title = 'PowerChord - Cari Chord Lagu Favoritmu dengan Mudah!';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          'Temukan chord lagu dari berbagai genre dan artis favoritmu. Mainkan langsung dengan gitar dilengkapi fitur transpose, auto scroll, dan mode gelap.'
        );
      }
    }
  }, [selectedSong]);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'amoled');

    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'amoled') {
      root.classList.add('dark', 'amoled');
    } else {
      root.classList.add('dark');
    }

    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Sync favorites in localStorage and cache full song objects for offline access
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    cacheFavoriteSongs(songs, favorites);
  }, [favorites, songs]);

  const [themeToast, setThemeToast] = useState<{ message: string; icon: string } | null>(null);

  const handleToggleFavorite = (songId: string) => {
    setFavorites((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
    );
  };

  const handleSetTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    const messages: Record<ThemeType, { message: string; icon: string }> = {
      light: { message: 'Mode Terang Aktif (Cerah & Kontras Jernih)', icon: '☀️' },
      dark: { message: 'Mode Gelap Aktif (Slate Nyaman di Mata)', icon: '🌙' },
      amoled: { message: 'Mode AMOLED Aktif (Hitam Pekat Hemat Baterai)', icon: '⚡' },
    };
    setThemeToast(messages[newTheme]);
    setTimeout(() => {
      setThemeToast((current) => (current?.icon === messages[newTheme].icon ? null : current));
    }, 2400);
  };

  const handleToggleTheme = () => {
    const nextTheme: ThemeType = theme === 'light' ? 'dark' : theme === 'dark' ? 'amoled' : 'light';
    handleSetTheme(nextTheme);
  };

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    cacheViewedSong(song);
    const targetUrl = `?song=${encodeURIComponent(song.id)}`;
    if (window.location.search !== targetUrl) {
      window.history.pushState({ songId: song.id }, '', targetUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalog = () => {
    setSelectedSong(null);
    if (window.location.search || window.location.hash) {
      window.history.pushState(null, '', window.location.pathname);
    }
    setCurrentTab('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateCatalog = (options?: { genre?: string; letter?: string; search?: string }) => {
    setSelectedSong(null);
    if (window.location.search || window.location.hash) {
      window.history.pushState(null, '', window.location.pathname);
    }
    if (options) {
      setCatalogFilters((prev) => ({
        ...prev,
        genre: options.genre !== undefined ? options.genre : prev.genre,
        letter: options.letter !== undefined ? options.letter : prev.letter,
        search: options.search !== undefined ? options.search : prev.search,
      }));
    }
    setCurrentTab('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateArtists = () => {
    setSelectedSong(null);
    if (window.location.search || window.location.hash) {
      window.history.pushState(null, '', window.location.pathname);
    }
    setCurrentTab('artists');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArtist = (artistName: string) => {
    setSelectedSong(null);
    if (window.location.search || window.location.hash) {
      window.history.pushState(null, '', window.location.pathname);
    }
    setCatalogFilters({ genre: 'all', letter: '', search: artistName });
    setCurrentTab('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestSubmit = (request: ChordRequest) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      const list = saved ? JSON.parse(saved) : [];
      list.push(request);
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(list));
    } catch (e) {
      console.error('Error saving request:', e);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        theme === 'amoled'
          ? 'bg-black text-white selection:bg-indigo-500/30'
          : theme === 'dark'
          ? 'bg-[#0B0F19] text-slate-100 selection:bg-indigo-500/30'
          : 'bg-[#F8FAFC] text-slate-900 selection:bg-indigo-500/20'
      }`}
    >
      {/* PowerChord Universal Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedSong(null);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onRequestChord={() => setIsRequestModalOpen(true)}
        onOpenQuickSearch={() => setIsQuickSearchOpen(true)}
        theme={theme}
        setTheme={handleSetTheme}
        onToggleTheme={handleToggleTheme}
        onHomeClick={() => {
          setSelectedSong(null);
          setCurrentTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {selectedSong ? (
          /* 3. Halaman Detail Lagu (Desktop & Mobile) */
          <SongViewer
            song={selectedSong}
            allSongs={songs}
            onBack={handleBackToCatalog}
            isFavorite={favorites.includes(selectedSong.id)}
            onToggleFavorite={handleToggleFavorite}
            onSelectRelatedSong={handleSelectSong}
            onNavigateCatalog={() => handleNavigateCatalog()}
            onOpenTuner={() => setIsTunerOpen(true)}
            onOpenDictionary={() => setIsDictionaryOpen(true)}
            theme={theme}
            setTheme={handleSetTheme}
          />

        ) : currentTab === 'home' ? (
          /* 1. Halaman Beranda (Desktop & Mobile) */
          <HomePage
            songs={songs}
            favorites={favorites}
            onSelectSong={handleSelectSong}
            onToggleFavorite={handleToggleFavorite}
            onNavigateCatalog={handleNavigateCatalog}
            onNavigateArtists={handleNavigateArtists}
            onOpenRequestModal={() => setIsRequestModalOpen(true)}
          />
        ) : currentTab === 'catalog' ? (
          /* 2. Halaman Katalog (Desktop & Mobile) */
          <SongList
            songs={songs}
            favorites={favorites}
            onSelectSong={handleSelectSong}
            onToggleFavorite={handleToggleFavorite}
            initialGenre={catalogFilters.genre}
            initialLetter={catalogFilters.letter}
            initialSearch={catalogFilters.search}
          />
        ) : (
          /* Artis View */
          <ArtistsView
            songs={songs}
            onSelectSong={handleSelectSong}
            onSelectArtist={handleSelectArtist}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigateHome={() => {
          setSelectedSong(null);
          setCurrentTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateCatalog={() => handleNavigateCatalog()}
        onNavigateArtists={handleNavigateArtists}
        onOpenRequestModal={() => setIsRequestModalOpen(true)}
      />

      {/* Modals */}
      <RequestChordModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={handleRequestSubmit}
      />

      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        songs={songs}
        onSelectSong={handleSelectSong}
      />

      <ChordDictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
      />

      <GuitarTuner
        isOpen={isTunerOpen}
        onClose={() => setIsTunerOpen(false)}
      />

      {/* Mode Notification Toast */}
      {themeToast && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 shadow-2xl backdrop-blur-md border border-slate-700/50 dark:border-slate-200/50 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="text-base">{themeToast.icon}</span>
          <span>{themeToast.message}</span>
        </div>
      )}

      {/* Global Offline Status Indicator */}
      <OfflineIndicator />
    </div>
  );
}
