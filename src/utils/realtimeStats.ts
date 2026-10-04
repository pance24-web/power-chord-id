import { useState, useEffect, useRef } from 'react';

const STATS_STORAGE_KEY = 'powerchord_realtime_stats_v1';
const PRACTICE_STORAGE_KEY = 'powerchord_practice_time_v1';

// Setup cross-tab realtime BroadcastChannel
let statsBroadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    statsBroadcastChannel = new BroadcastChannel('powerchord_realtime_channel');
    statsBroadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'stats_updated') {
        window.dispatchEvent(
          new CustomEvent('powerchord:stats_updated', {
            detail: event.data.detail,
          })
        );
      } else if (event.data?.type === 'favorites_updated') {
        window.dispatchEvent(
          new CustomEvent('powerchord:favorites_updated', {
            detail: event.data.detail,
          })
        );
      }
    };
  } catch (err) {
    console.warn('BroadcastChannel not initialized:', err);
  }
}

export interface SongStatsData {
  localViews: number;
  localLikes: number;
  serverViews?: number;
  serverLikes?: number;
  practiceSeconds: number;
  lastViewedAt: number;
}

export interface AllStatsMap {
  [songId: string]: SongStatsData;
}

// Real-Time Server-Sent Events (SSE) Client Synchronization
let sseConnection: EventSource | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

function applyServerSync(serverStats: { [id: string]: { views: number; likes: number } }) {
  if (typeof window === 'undefined') return;
  try {
    const local = getAllStoredStats();
    let hasChanges = false;

    for (const [songId, stat] of Object.entries(serverStats)) {
      if (!local[songId]) {
        local[songId] = {
          localViews: 0,
          localLikes: 0,
          practiceSeconds: 0,
          lastViewedAt: Date.now(),
        };
      }
      if (local[songId].serverViews !== stat.views || local[songId].serverLikes !== stat.likes) {
        local[songId].serverViews = stat.views;
        local[songId].serverLikes = stat.likes;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(local));
      window.dispatchEvent(new CustomEvent('powerchord:stats_updated', { detail: {} }));
    }
  } catch (err) {
    console.error('Error applying server sync:', err);
  }
}

function applyServerSongUpdate(songId: string, stat: { views: number; likes: number }) {
  if (typeof window === 'undefined') return;
  try {
    const local = getAllStoredStats();
    if (!local[songId]) {
      local[songId] = {
        localViews: 0,
        localLikes: 0,
        practiceSeconds: 0,
        lastViewedAt: Date.now(),
      };
    }
    local[songId].serverViews = stat.views;
    local[songId].serverLikes = stat.likes;
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(local));

    const payload = { songId, stats: local[songId] };
    window.dispatchEvent(new CustomEvent('powerchord:stats_updated', { detail: payload }));
  } catch (err) {
    console.error('Error applying server song update:', err);
  }
}

export function initServerSync() {
  if (typeof window === 'undefined' || sseConnection) return;

  try {
    sseConnection = new EventSource('/api/stats/stream');

    sseConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'sync' && data.allStats) {
          applyServerSync(data.allStats);
        } else if ((data.type === 'view' || data.type === 'favorite') && data.songId && data.stat) {
          applyServerSongUpdate(data.songId, data.stat);
        }
      } catch {
        // ping or non-JSON message
      }
    };

    sseConnection.onerror = () => {
      if (sseConnection) {
        sseConnection.close();
        sseConnection = null;
      }
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          initServerSync();
        }, 5000);
      }
    };
  } catch (err) {
    console.warn('Could not establish SSE connection to /api/stats/stream:', err);
  }
}

// Auto-start SSE sync in browser
if (typeof window !== 'undefined') {
  initServerSync();
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
 * Get total numeric views for a song (server canonical count or base + local increments)
 */
export function getSongTotalViews(songId: string, baseViewsStr?: string): number {
  const stats = getAllStoredStats();
  if (stats[songId]?.serverViews !== undefined && stats[songId].serverViews! > 0) {
    return stats[songId].serverViews!;
  }
  const base = parseCount(baseViewsStr);
  const local = stats[songId]?.localViews || 0;
  return base + local;
}

/**
 * Get total numeric likes/favorites for a song (server canonical count or base + local increments + favorite status)
 */
export function getSongTotalLikes(
  songId: string,
  baseLikesStr?: string,
  isFavorite?: boolean
): number {
  const stats = getAllStoredStats();
  if (stats[songId]?.serverLikes !== undefined && stats[songId].serverLikes! > 0) {
    return stats[songId].serverLikes!;
  }
  const base = parseCount(baseLikesStr);
  const localLikes = stats[songId]?.localLikes || 0;
  return Math.max(0, base + localLikes + (isFavorite ? 1 : 0));
}

/**
 * Notify all components, browser tabs, and the real server that favorite status changed
 */
export function notifyFavoritesUpdated(songId: string, isFav: boolean) {
  if (typeof window === 'undefined') return;
  const detail = { songId, isFavorite: isFav, timestamp: Date.now() };

  // Optimistic local update
  try {
    const stats = getAllStoredStats();
    if (!stats[songId]) {
      stats[songId] = {
        localViews: 0,
        localLikes: 0,
        practiceSeconds: 0,
        lastViewedAt: Date.now(),
      };
    }
    if (stats[songId].serverLikes !== undefined) {
      stats[songId].serverLikes = isFav
        ? stats[songId].serverLikes! + 1
        : Math.max(0, stats[songId].serverLikes! - 1);
    }
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }

  window.dispatchEvent(new CustomEvent('powerchord:favorites_updated', { detail }));
  window.dispatchEvent(new CustomEvent('powerchord:stats_updated', { detail: { songId } }));

  try {
    statsBroadcastChannel?.postMessage({
      type: 'favorites_updated',
      detail,
    });
  } catch (e) {
    // broadcast failed
  }

  // Real Multi-User Server Update
  fetch('/api/stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'favorite', songId, isFavorite: isFav }),
  }).catch((err) => {
    console.warn('Failed to sync favorite to server:', err);
  });
}

/**
 * Record a real-time view for a song on the client and notify the real server
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
    if (current.serverViews !== undefined) {
      current.serverViews += 1;
    }
    current.lastViewedAt = Date.now();
    stats[songId] = current;

    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));

    const payload = { songId, stats: current };
    // Dispatch custom event for cross-component realtime sync
    window.dispatchEvent(
      new CustomEvent('powerchord:stats_updated', {
        detail: payload,
      })
    );

    try {
      statsBroadcastChannel?.postMessage({
        type: 'stats_updated',
        detail: payload,
      });
    } catch {
      // ignore
    }

    // Real Multi-User Server Update
    fetch('/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'view', songId }),
    }).catch((err) => {
      console.warn('Failed to sync view to server:', err);
    });

    return current.serverViews ?? current.localViews;
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
 * Lightweight real-time hook for SongCard, list items, and thumbnails.
 * Automatically synchronizes with views increments, favorite clicks, and cross-tab events.
 */
export function useSongLiveStats(
  songId: string,
  baseViewsStr?: string,
  baseLikesStr?: string,
  isFavorite?: boolean
) {
  const [, setVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ songId?: string }>;
      if (!customEvent.detail?.songId || customEvent.detail.songId === songId) {
        setVersion((v) => v + 1);
      }
    };

    window.addEventListener('powerchord:stats_updated', handleUpdate);
    window.addEventListener('powerchord:favorites_updated', handleUpdate);

    return () => {
      window.removeEventListener('powerchord:stats_updated', handleUpdate);
      window.removeEventListener('powerchord:favorites_updated', handleUpdate);
    };
  }, [songId]);

  const totalViews = getSongTotalViews(songId, baseViewsStr);
  const totalLikes = getSongTotalLikes(songId, baseLikesStr, isFavorite);

  return {
    totalViews,
    formattedViews: formatCount(totalViews),
    preciseViews: formatCount(totalViews, true),
    totalLikes,
    formattedLikes: formatCount(totalLikes),
  };
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
