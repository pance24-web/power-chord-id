import { Song } from '../types/chord';

const STORAGE_KEYS = {
  FAVORITE_IDS: 'powerchord_favorites',
  OFFLINE_FAVORITE_SONGS: 'powerchord_offline_favorite_songs',
  OFFLINE_RECENT_SONGS: 'powerchord_offline_recent_songs',
  LAST_OFFLINE_VIEW: 'powerchord_last_viewed_song_id',
};

/**
 * Retrieve full Song objects for favorite songs cached in localStorage
 */
export function getOfflineFavoriteSongs(): Song[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_FAVORITE_SONGS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Gagal membaca cache lagu favorit offline:', err);
    return [];
  }
}

/**
 * Cache full Song objects for all favorite songs so they are fully available offline
 */
export function cacheFavoriteSongs(allSongs: Song[], favoriteIds: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const favoriteSet = new Set(favoriteIds);
    // Find matching songs from current catalog
    const matchingSongs = allSongs.filter((s) => favoriteSet.has(s.id));

    // Also preserve any previously cached favorites that might not be in the current catalog
    const existingCache = getOfflineFavoriteSongs();
    const existingMap = new Map<string, Song>();
    existingCache.forEach((s) => {
      if (favoriteSet.has(s.id)) {
        existingMap.set(s.id, s);
      }
    });

    // Merge latest version
    matchingSongs.forEach((s) => {
      existingMap.set(s.id, s);
    });

    const finalSongs = Array.from(existingMap.values());
    localStorage.setItem(STORAGE_KEYS.OFFLINE_FAVORITE_SONGS, JSON.stringify(finalSongs));
  } catch (err) {
    console.warn('Gagal menyimpan cache lagu favorit offline:', err);
  }
}

/**
 * Check whether a specific song is cached offline
 */
export function isSongCachedOffline(songId: string, favoriteIds: string[]): boolean {
  if (typeof window === 'undefined') return false;
  if (favoriteIds.includes(songId)) return true;
  try {
    const recent = getOfflineRecentSongs();
    return recent.some((s) => s.id === songId);
  } catch {
    return false;
  }
}

/**
 * Cache recently viewed songs so any opened song remains accessible offline
 */
export function cacheViewedSong(song: Song): void {
  if (typeof window === 'undefined') return;
  try {
    const recent = getOfflineRecentSongs();
    const filtered = recent.filter((s) => s.id !== song.id);
    // Keep up to 30 most recently viewed songs
    const updated = [song, ...filtered].slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_RECENT_SONGS, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEYS.LAST_OFFLINE_VIEW, song.id);
  } catch (err) {
    console.warn('Gagal menyimpan cache lagu terakhir dibuka:', err);
  }
}

/**
 * Get recently viewed songs cached in localStorage
 */
export function getOfflineRecentSongs(): Song[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_RECENT_SONGS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Retrieve any cached song by its ID (checks favorite cache first, then recent cache)
 */
export function getOfflineSongById(songId: string): Song | undefined {
  const favorites = getOfflineFavoriteSongs();
  const foundFav = favorites.find((s) => s.id === songId);
  if (foundFav) return foundFav;

  const recent = getOfflineRecentSongs();
  return recent.find((s) => s.id === songId);
}
