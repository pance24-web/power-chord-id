'use client';

import React, { useState, useEffect } from 'react';
import { Song, ThemeType, STORAGE_KEYS } from './types/chord';
import { INITIAL_SONGS } from './data/songs';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { SongList } from './components/SongList';
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
import {
  cacheFavoriteSongs,
  getOfflineFavoriteSongs,
} from './utils/offlineStorage';

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
  const [currentTab, setCurrentTab] = useState<'home' | 'catalog' | 'artists'>('home');
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
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isSongEditorOpen, setIsSongEditorOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [activeChordModal, setActiveChordModal] = useState<string | null>(null);

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
    setSelectedSong(newSong);
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
        setSelectedSong(null);
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
    setSelectedSong(null);
    setFilterFavoritesOnly(false);
    if (options) {
      setCatalogFilters(options);
    } else {
      setCatalogFilters({});
    }
    setCurrentTab('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors pb-16 md:pb-0">
      {/* Offline Status Top Bar */}
      <OfflineIndicator />

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setSelectedSong(null);
          setCurrentTab(tab);
          setFilterFavoritesOnly(false);
          setCatalogFilters({});
        }}
        theme={theme}
        onThemeChange={setTheme}
        onOpenQuickSearch={() => setIsQuickSearchOpen(true)}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenTuner={() => setIsTunerOpen(true)}
        onOpenRequest={() => setIsRequestOpen(true)}
        onOpenAddSong={() => {
          setEditingSong(null);
          setIsSongEditorOpen(true);
        }}
        favoritesCount={favorites.length}
        onShowFavorites={() => {
          setSelectedSong(null);
          setCurrentTab('catalog');
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
            onBack={() => setSelectedSong(null)}
            onSelectSong={(song) => setSelectedSong(song)}
            onToggleFavorite={handleToggleFavorite}
            onOpenChordModal={(chord) => setActiveChordModal(chord)}
          />
        ) : (
          <>
            {currentTab === 'home' && (
              <HomePage
                songs={songs}
                favorites={favorites}
                onSelectSong={(song) => setSelectedSong(song)}
                onToggleFavorite={handleToggleFavorite}
                onNavigateCatalog={handleNavigateCatalogWithFilter}
                onNavigateArtists={() => {
                  setSelectedSong(null);
                  setCurrentTab('artists');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
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
                onSelectSong={(song) => setSelectedSong(song)}
                onToggleFavorite={handleToggleFavorite}
                onEditSong={handleEditCustomSong}
                onDeleteSong={handleDeleteCustomSong}
                filterFavoritesOnly={filterFavoritesOnly}
              />
            )}

            {currentTab === 'artists' && (
              <ArtistsView
                songs={songs}
                onSelectSong={(song) => setSelectedSong(song)}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigateHome={() => {
          setSelectedSong(null);
          setCurrentTab('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateCatalog={() => {
          setSelectedSong(null);
          setCurrentTab('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateArtists={() => {
          setSelectedSong(null);
          setCurrentTab('artists');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenRequest={() => setIsRequestOpen(true)}
      />

      {/* Mobile Bottom Navigation (Screens 4, 5, 6, 7, 8 in Mockup) */}
      <MobileBottomNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          setSelectedSong(null);
          setCurrentTab(tab);
          setFilterFavoritesOnly(false);
          setCatalogFilters({});
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenRequest={() => setIsRequestOpen(true)}
        hasSelectedSong={!!selectedSong}
      />

      {/* Modals */}
      <QuickSearchModal
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        songs={songs}
        onSelectSong={(song) => setSelectedSong(song)}
      />

      <ChordDictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
      />

      <GuitarTuner
        isOpen={isTunerOpen}
        onClose={() => setIsTunerOpen(false)}
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
    </div>
  );
}
