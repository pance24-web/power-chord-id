import { INITIAL_SONGS } from '../data/songs';
import fs from 'fs';
import path from 'path';

export interface SongLiveStat {
  views: number;
  likes: number;
}

export interface StatsMap {
  [songId: string]: SongLiveStat;
}

const CACHE_FILE = path.join(process.cwd(), '.server_stats.json');

function parseCount(str?: string): number {
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

// Global server state singleton in Node runtime
declare global {
  // eslint-disable-next-line no-var
  var __pc_stats__: Map<string, SongLiveStat> | undefined;
  // eslint-disable-next-line no-var
  var __pc_subscribers__: Set<(payload: string) => void> | undefined;
}

function initStatsMap(): Map<string, SongLiveStat> {
  const map = new Map<string, SongLiveStat>();

  // 1. Initialize with baseline from INITIAL_SONGS
  for (const song of INITIAL_SONGS) {
    map.set(song.id, {
      views: parseCount(song.views),
      likes: parseCount(song.likes),
    });
  }

  // 2. Try loading any saved state from disk
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
      const saved: StatsMap = JSON.parse(raw);
      for (const [id, stat] of Object.entries(saved)) {
        const current = map.get(id) || { views: 0, likes: 0 };
        map.set(id, {
          views: Math.max(current.views, stat.views || 0),
          likes: Math.max(current.likes, stat.likes || 0),
        });
      }
    }
  } catch (err) {
    console.warn('Could not read cached stats from disk:', err);
  }

  return map;
}

export function getServerStatsMap(): Map<string, SongLiveStat> {
  if (!global.__pc_stats__) {
    global.__pc_stats__ = initStatsMap();
  }
  return global.__pc_stats__;
}

export function getSubscribers(): Set<(payload: string) => void> {
  if (!global.__pc_subscribers__) {
    global.__pc_subscribers__ = new Set();
  }
  return global.__pc_subscribers__;
}

let saveTimeout: NodeJS.Timeout | null = null;
function persistStats() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const map = getServerStatsMap();
      const obj: StatsMap = {};
      map.forEach((val, key) => {
        obj[key] = val;
      });
      fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Could not persist stats to disk:', e);
    }
  }, 1000);
}

export function broadcastUpdate(event: {
  type: 'view' | 'favorite' | 'sync';
  songId?: string;
  stat?: SongLiveStat;
  allStats?: StatsMap;
}) {
  const subscribers = getSubscribers();
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  subscribers.forEach((send) => {
    try {
      send(payload);
    } catch {
      subscribers.delete(send);
    }
  });
}

export function recordServerView(songId: string): SongLiveStat {
  const stats = getServerStatsMap();
  const current = stats.get(songId) || { views: 0, likes: 0 };
  current.views += 1;
  stats.set(songId, current);

  persistStats();
  broadcastUpdate({
    type: 'view',
    songId,
    stat: current,
  });

  return current;
}

export function recordServerFavorite(songId: string, isFavorite: boolean): SongLiveStat {
  const stats = getServerStatsMap();
  const current = stats.get(songId) || { views: 0, likes: 0 };
  if (isFavorite) {
    current.likes += 1;
  } else {
    current.likes = Math.max(0, current.likes - 1);
  }
  stats.set(songId, current);

  persistStats();
  broadcastUpdate({
    type: 'favorite',
    songId,
    stat: current,
  });

  return current;
}

export function getAllServerStats(): StatsMap {
  const stats = getServerStatsMap();
  const obj: StatsMap = {};
  stats.forEach((val, key) => {
    obj[key] = val;
  });
  return obj;
}
