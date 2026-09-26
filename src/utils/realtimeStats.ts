import { useState, useEffect, useRef } from 'react';

const STATS_STORAGE_KEY = 'powerchord_realtime_stats_v1';
const PRACTICE_STORAGE_KEY = 'powerchord_practice_time_v1';

export interface SongStatsData {
  localViews: number;
  localLikes: number;
  practiceSeconds: number;
  lastViewedAt: number;
}

export interface AllStatsMap {
  [songId: string]: SongStatsData;
}

/**
 * Parse string like "76.4k" or "1.2m" or "500" into numeric value
 */
export function parseCount(str?: string): number {
  if (!str) return 0;
  const cleaned = str.trim().toLowerCase();
  if (cleaned.endsWith('m')) {
    return Math.round(parseFloat(cleaned.replace('m', '')) * 1_000_000);
  }
  if (cleaned.endsWith('k')) {
    return Math.round(parseFloat(cleaned.replace('k', '')) * 1_000);
  }
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format numeric count to reader-friendly string (e.g. 76.4k or 1,250)
 */
export function formatCount(count: number, precise = false): string {
  if (count <= 0) return '0';
  if (precise) {
    return count.toLocaleString('id-ID');
  }
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 10_000) {
    return (count / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return count.toLocaleString('id-ID');
}

/**
 * Format seconds to mm:ss or hh:mm:ss
 */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Get all stored local stats
 */
export function getAllStoredStats(): AllStatsMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Get total numeric views for a song (base + local increments)
 */
export function getSongTotalViews(songId: string, baseViewsStr?: string): number {
  const base = parseCount(baseViewsStr);
  const stats = getAllStoredStats();
  const local = stats[songId]?.localViews || 0;
  return base + local;
}

/**
 * Record a real-time view for a song
 */
export function incrementSongView(songId: string): number {
  if (typeof window === 'undefined') return 1;
  try {
    const stats = getAllStoredStats();
    const current = stats[songId] || {
      localViews: 0,
      localLikes: 0,
      practiceSeconds: 0,
      lastViewedAt: Date.now(),
    };

    current.localViews += 1;
    current.lastViewedAt = Date.now();
    stats[songId] = current;

    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));

    // Dispatch custom event for cross-component realtime sync
    window.dispatchEvent(
      new CustomEvent('powerchord:stats_updated', {
        detail: { songId, stats: current },
      })
    );

    return current.localViews;
  } catch (e) {
    console.error('Error incrementing song view:', e);
    return 1;
  }
}

/**
 * Save practice time
 */
export function savePracticeTime(songId: string, additionalSeconds: number): void {
  if (typeof window === 'undefined' || additionalSeconds <= 0) return;
  try {
    const stats = getAllStoredStats();
    const current = stats[songId] || {
      localViews: 0,
      localLikes: 0,
      practiceSeconds: 0,
      lastViewedAt: Date.now(),
    };

    current.practiceSeconds = (current.practiceSeconds || 0) + additionalSeconds;
    stats[songId] = current;

    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving practice time:', e);
  }
}

/**
 * Calculate realistic active live musicians for a song based on its base popularity
 */
export function getBaseLiveMusicians(baseViewsStr?: string): number {
  const views = parseCount(baseViewsStr);
  if (views >= 70_000) return 42;
  if (views >= 50_000) return 31;
  if (views >= 30_000) return 24;
  if (views >= 20_000) return 16;
  return 8;
}

/**
 * Real-time Hook for Song Viewer
 */
export function useSongRealtimeStats(
  songId: string,
  baseViewsStr?: string,
  baseLikesStr?: string,
  isFavorite?: boolean
) {
  const baseViewsNum = parseCount(baseViewsStr);
  const baseLikesNum = parseCount(baseLikesStr);

  const [totalViews, setTotalViews] = useState<number>(() => {
    return baseViewsNum + (getAllStoredStats()[songId]?.localViews || 0);
  });

  const [totalLikes, setTotalLikes] = useState<number>(() => {
    return baseLikesNum + (isFavorite ? 1 : 0);
  });

  // Practice session stopwatch
  const [practiceSeconds, setPracticeSeconds] = useState<number>(0);
  const [isPracticing, setIsPracticing] = useState<boolean>(true);

  // Live active musicians reading this chord right now
  const [liveMusicians, setLiveMusicians] = useState<number>(() => {
    return getBaseLiveMusicians(baseViewsStr);
  });

  // Increment view count immediately when component mounts
  useEffect(() => {
    const newLocalViews = incrementSongView(songId);
    setTotalViews(baseViewsNum + newLocalViews);
    setPracticeSeconds(0);
    setIsPracticing(true);

    const baseLive = getBaseLiveMusicians(baseViewsStr);
    setLiveMusicians(baseLive);
  }, [songId, baseViewsNum, baseViewsStr]);

  // Sync likes with favorite status
  useEffect(() => {
    setTotalLikes(baseLikesNum + (isFavorite ? 1 : 0));
  }, [isFavorite, baseLikesNum]);

  // Real-time practice timer: increments every second
  useEffect(() => {
    if (!isPracticing) return;

    const timer = setInterval(() => {
      setPracticeSeconds((prev) => {
        const next = prev + 1;
        // Auto-save every 15 seconds
        if (next % 15 === 0) {
          savePracticeTime(songId, 15);
        }
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isPracticing, songId]);

  // Real-time live musicians organic fluctuation (simulate realistic active guitarists)
  useEffect(() => {
    const baseLive = getBaseLiveMusicians(baseViewsStr);

    const interval = setInterval(() => {
      // Subtle jitter between -2 and +3
      const delta = Math.floor(Math.random() * 5) - 2;
      setLiveMusicians((current) => {
        const updated = current + delta;
        return Math.max(3, Math.min(updated, baseLive + 12));
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [baseViewsStr]);

  // Listen to cross-component stats update
  useEffect(() => {
    const handleStatsUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ songId: string; stats: SongStatsData }>;
      if (customEvent.detail && customEvent.detail.songId === songId) {
        setTotalViews(baseViewsNum + customEvent.detail.stats.localViews);
      }
    };

    window.addEventListener('powerchord:stats_updated', handleStatsUpdated);
    return () => {
      window.removeEventListener('powerchord:stats_updated', handleStatsUpdated);
    };
  }, [songId, baseViewsNum]);

  return {
    totalViews,
    formattedViews: formatCount(totalViews),
    preciseViews: formatCount(totalViews, true),
    totalLikes,
    formattedLikes: formatCount(totalLikes),
    liveMusicians,
    practiceSeconds,
    formattedPracticeTime: formatDuration(practiceSeconds),
    isPracticing,
    togglePracticeTimer: () => setIsPracticing((p) => !p),
    resetPracticeTimer: () => setPracticeSeconds(0),
  };
}

/**
 * Get overall summary stats for the musician
 */
export function getMusicianOverviewStats(allSongsCount: number, favoritesCount: number) {
  if (typeof window === 'undefined') {
    return {
      songsViewed: 0,
      totalPracticeSeconds: 0,
      formattedTotalPractice: '0 menit',
      favoritesCount,
    };
  }

  const stats = getAllStoredStats();
  const songIds = Object.keys(stats);
  const songsViewed = songIds.length;

  let totalPracticeSeconds = 0;
  songIds.forEach((id) => {
    totalPracticeSeconds += stats[id].practiceSeconds || 0;
  });

  const minutes = Math.floor(totalPracticeSeconds / 60);
  const hours = Math.floor(minutes / 60);

  let formattedTotalPractice = '';
  if (hours > 0) {
    formattedTotalPractice = `${hours} jam ${minutes % 60} mnt`;
  } else {
    formattedTotalPractice = `${minutes} menit`;
  }

  return {
    songsViewed,
    totalPracticeSeconds,
    formattedTotalPractice,
    favoritesCount,
  };
}
