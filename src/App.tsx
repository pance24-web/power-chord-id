'use client';

import React, { useState, useEffect } from 'react';
import { Song, ThemeType, STORAGE_KEYS } from './types/chord';
import { INITIAL_SONGS } from './data/songs';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { SongList } from './components/SongList';
import { PlaylistView } from './components/PlaylistView';
import { ArtistsView } from './components/ArtistsView';
import { SongViewer } from './components/SongViewer';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ChordModal } from './components/ChordModal';
import { ChordDictionaryModal } from './components/ChordDictionaryModal';
import { GuitarTuner } from './components/GuitarTuner';
import { QuickSearchModal } from './components/QuickSearchModal';
import { RequestChordModal } from './components/RequestChordModal';
import { SongEditorModal } from './components/SongEditorModal';
import { MetronomeModal } from './components/MetronomeModal';
import { LegalModal } from './components/LegalModals';
import {
  cacheFavoriteSongs,
  getOfflineFavoriteSongs,
} from './utils/offlineStorage';
import { notifyFavoritesUpdated } from './utils/realtimeStats';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeType>('light');

  // Songs state
  const [songs, setSongs] = useState<Song[]>(INITIAL_SONGS);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([
    'sampai-jumpa-endank-soekamti',
    'hati-yang-kau-sakiti-rizky-febian',
  ]);

  // Client hydration from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeType;
      if (savedTheme && ['light', 'dark', 'amoled'].includes(savedTheme)) {
        setTheme(savedTheme);
      }
      const savedFavs = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
      let all = [...INITIAL_SONGS];
      const savedCustom = localStorage.getItem(STORAGE_KEYS.CUSTOM_SONGS);
      if (savedCustom) {
        const parsed: Song[] = JSON.parse(savedCustom);
        all = [...parsed, ...all];
      }
      const cachedFavorites = getOfflineFavoriteSongs();
      if (cachedFavorites.length > 0) {
        const existingIds = new Set(all.map((s) => s.id));
        const missingFavorites = cachedFavorites.filter((s) => !existingIds.has(s.id));
        all = [...all, ...missingFavorites];
      }
      setSongs(all);
    } catch (e) {
      console.error('Error hydrating localStorage state:', e);
    }
  }, []);

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'home' | 'catalog' | 'artists' | 'playlist'>('home');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);

  // Filters passed from Home to Catalog
  const [catalogFilters, setCatalogFilters] = useState<{
    search?: string;
    genre?: string;
    letter?: string;
  }>({});

  // Modals state
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isTunerOpen, setIsTunerOpen] = useState(false);
  const [isMetronomeOpen, setIsMetronomeOpen] = useState(false);
  const [metronomeBpm, setMetronomeBpm] = useState<number>(80);
  const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | null>(null);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isSongEditorOpen, setIsSongEditorOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [activeChordModal, setActiveChordModal] = useState<string | null>(null);

  // Deep-linking URL Sync (CORE-01: Shareable song links & indexing support)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parseUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const songParam = params.get('song');
      const tabParam = params.get('tab');

      if (songParam) {
        const found = songs.find((s) => s.id === songParam);
        if (found) {
          setSelectedSong(found);
          return;
        }
      }

      if (tabParam && ['home', 'catalog', 'artists', 'playlist'].includes(tabParam)) {
        setSelectedSong(null);
        setCurrentTab(tabParam as any);
      }
    };

    parseUrl();

    const handlePopState = () => {
      parseUrl();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [songs]);

  const handleSelectSong = (song: Song | null) => {
    setSelectedSong(song);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (song) {
        url.searchParams.set('song', song.id);
        url.searchParams.delete('tab');
      } else {
        url.searchParams.delete('song');
        if (currentTab !== 'home') {
          url.searchParams.set('tab', currentTab);
        } else {
          url.searchParams.delete('tab');
        }
      }
      const newQuery = url.searchParams.toString() ? `?${url.searchParams.toString()}` : '';
      window.history.pushState(null, '', `${url.pathname}${newQuery}`);
    }
  };

  const handleTabChange = (tab: 'home' | 'catalog' | 'artists' | 'playlist') => {
    setSelectedSong(null);
    setCurrentTab(tab);
    setFilterFavoritesOnly(false);
    setCatalogFilters({});
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('song');
      if (tab === 'home') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', tab);
      }
      const newQuery = url.searchParams.toString() ? `?${url.searchParams.toString()}` : '';
      window.history.pushState(null, '', `${url.pathname}${newQuery}`);
    }
  };

  // Apply theme to html root element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'amoled');
    root.classList.add(theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // Sync favorites & offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      cacheFavoriteSongs(songs, favorites);
    } catch (e) {
      console.error('Failed to sync favorites:', e);
    }
  }, [favorites, songs]);

  const handleToggleFavorite = (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.includes(songId);
      const isNowFav = !exists;
      notifyFavoritesUpdated(songId, isNowFav);
      if (exists) {
        return prev.filter((id) => id !== songId);
      }
      return [...prev, songId];
    });
  };

  const handleSaveCustomSong = (newSong: Song) => {
    setSongs((prev) => {
      const filtered = prev.filter((s) => s.id !== newSong.id);
      const updated = [newSong, ...filtered];
      const customOnly = updated.filter((s) => s.isCustom);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_SONGS, JSON.stringify(customOnly));
      return updated;
    });
    handleSelectSong(newSong);
  };

  const handleDeleteCustomSong = (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    if (window.confirm('Hapus chord custom ini dari daftar Anda?')) {
      setSongs((prev) => {
        const updated = prev.filter((s) => s.id !== songId);
        const customOnly = updated.filter((s) => s.isCustom);
        localStorage.setItem(STORAGE_KEYS.CUSTOM_SONGS, JSON.stringify(customOnly));
        return updated;
      });
      if (selectedSong?.id === songId) {
        handleSelectSong(null);
      }
    }
  };

  const handleEditCustomSong = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    setEditingSong(song);
    setIsSongEditorOpen(true);
  };

  const handleNavigateCatalogWithFilter = (options?: {
    search?: string;
    genre?: string;
    letter?: string;
  }) => {
    handleSelectSong(null);
    setFilterFavoritesOnly(false);
    if (options) {
      setCatalogFilters(options);
    } else {
      setCatalogFilters({});
    }
    handleTabChange('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keyboard shortcuts (Desktop productivity: / or Ctrl+K for search, T for Tuner, M for Metronome, D for Dictionary)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        setIsQuickSearchOpen(true);
      } else if (e.key === 't' || e.key === 'T') {
        if (!selectedSong) {
          e.preventDefault();
          setIsTunerOpen(true);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        if (selectedSong?.tempo) {
          setMetronomeBpm(Number(selectedSong.tempo) || 80);
        }
        setIsMetronomeOpen((prev) => !prev);
      } else if (e.key === 'd' || e.key === 'D') {
        if (!selectedSong) {
          e.preventDefault();
          setIsDictionaryOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSong]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors pb-20 sm:pb-24 md:pb-0">
      {/* Offline Status Top Bar */}
      <OfflineIndicator />

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        theme={theme}
        onThemeChange={setTheme}
        onOpenQuickSearch={() => setIsQuickSearchOpen(true)}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenTuner={() => setIsTunerOpen(true)}
        onOpenMetronome={() => setIsMetronomeOpen(true)}
        onOpenRequest={() => setIsRequestOpen(true)}
        onOpenAddSong={() => {
          setEditingSong(null);
          setIsSongEditorOpen(true);
        }}
        favoritesCount={favorites.length}
        onShowFavorites={() => {
          handleSelectSong(null);
          handleTabChange('catalog');
          setFilterFavoritesOnly(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {selectedSong ? (
          <SongViewer
            song={selectedSong}
            allSongs={songs}
            isFavorite={favorites.includes(selectedSong.id)}
            onBack={() => handleSelectSong(null)}
            onSelectSong={handleSelectSong}
            onToggleFavorite={handleToggleFavorite}
            onOpenChordModal={(chord) => setActiveChordModal(chord)}
            onOpenMetronome={(bpm) => {
              setMetronomeBpm(bpm || 80);
              setIsMetronomeOpen(true);
            }}
          />
        ) : (
          <>
            {currentTab === 'home' && (
              <HomePage
                songs={songs}
                favorites={favorites}
                onSelectSong={handleSelectSong}
                onToggleFavorite={handleToggleFavorite}
                onNavigateCatalog={handleNavigateCatalogWithFilter}
                onNavigateArtists={() => handleTabChange('artists')}
                onOpenDictionary={() => setIsDictionaryOpen(true)}
                onOpenTuner={() => setIsTunerOpen(true)}
                onOpenRequest={() => setIsRequestOpen(true)}
                onOpenAddSong={() => {
                  setEditingSong(null);
                  setIsSongEditorOpen(true);
                }}
              />
            )}

            {currentTab === 'catalog' && (
              <SongList
                key={`${catalogFilters.search || ''}-${catalogFilters.genre || ''}-${catalogFilters.letter || ''}`}
                songs={songs}
                favorites={favorites}
                initialSearch={catalogFilters.search || ''}
                initialGenre={catalogFilters.genre || 'Semua'}
                initialLetter={catalogFilters.letter || ''}
                onSelectSong={handleSelectSong}
                onToggleFavorite={handleToggleFavorite}
                onEditSong={handleEditCustomSong}
                onDeleteSong={handleDeleteCustomSong}
                filterFavoritesOnly={filterFavoritesOnly}
              />
            )}

            {currentTab === 'playlist' && (
              <PlaylistView
                songs={songs}
                favorites={favorites}
                onSelectSong={handleSelectSong}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {currentTab === 'artists' && (
              <ArtistsView
                songs={songs}
                onSelectSong={handleSelectSong}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigateHome={() => handleTabChange('home')}
        onNavigateCatalog={() => handleTabChange('catalog')}
        onNavigateArtists={() => handleTabChange('artists')}
        onOpenRequest={() => setIsRequestOpen(true)}
        onOpenTerms={() => setLegalModalType('terms')}
        onOpenPrivacy={() => setLegalModalType('privacy')}
      />

      {/* Mobile Bottom Navigation (Screens 4, 5, 6, 7, 8 in Mockup) */}
      <MobileBottomNav
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onOpenRequest={() => setIsRequestOpen(true)}
        hasSelectedSong={!!selectedSong}
      />

      {/* Modals */}
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

      <MetronomeModal
        isOpen={isMetronomeOpen}
        onClose={() => setIsMetronomeOpen(false)}
        initialBpm={metronomeBpm}
      />

      <RequestChordModal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
      />

      <SongEditorModal
        isOpen={isSongEditorOpen}
        onClose={() => {
          setIsSongEditorOpen(false);
          setEditingSong(null);
        }}
        onSaveSong={handleSaveCustomSong}
        editingSong={editingSong}
      />

      <ChordModal
        chordName={activeChordModal}
        onClose={() => setActiveChordModal(null)}
      />

      <LegalModal
        isOpen={!!legalModalType}
        onClose={() => setLegalModalType(null)}
        type={legalModalType || 'terms'}
      />
    </div>
  );
}
