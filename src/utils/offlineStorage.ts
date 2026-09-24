import { Song, STORAGE_KEYS } from '../types/chord';

/**
 * Retrieve full Song objects for favorite songs cached in localStorage
 */
export function getOfflineFavoriteSongs(): Song[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_FAVORITE_SONGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
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
    const favSongs = allSongs.filter((s) => favoriteSet.has(s.id));
    localStorage.setItem(STORAGE_KEYS.OFFLINE_FAVORITE_SONGS, JSON.stringify(favSongs));
  } catch (e) {
    console.error('Failed to cache favorite songs:', e);
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
    const updated = [song, ...filtered].slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_RECENT_SONGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to cache viewed song:', e);
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
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
