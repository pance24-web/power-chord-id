import { INITIAL_SONGS } from '@/data/songs';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export interface SongLiveStat { views: number; likes: number; }
export interface StatsMap { [songId: string]: SongLiveStat; }
const CACHE_FILE = path.join(process.cwd(), '.server_stats.json');

declare global {
  var __pc_stats__: Map<string, SongLiveStat> | undefined;
  var __pc_subscribers__: Set<(payload: string) => void> | undefined;
}

function parseCount(value?: string): number {
  if (!value) return 0;
  const normalized = value.trim().toLowerCase();
  if (normalized.endsWith('m')) return Math.round(parseFloat(normalized) * 1_000_000);
  if (normalized.endsWith('k')) return Math.round(parseFloat(normalized) * 1_000);
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function initStatsMap(): Map<string, SongLiveStat> {
  const map = new Map<string, SongLiveStat>();
  for (const song of INITIAL_SONGS) map.set(song.id, { views: parseCount(song.views), likes: parseCount(song.likes) });
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const saved: StatsMap = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      for (const [id, stat] of Object.entries(saved)) {
        const current = map.get(id) || { views: 0, likes: 0 };
        map.set(id, { views: Math.max(current.views, Number(stat.views) || 0), likes: Math.max(current.likes, Number(stat.likes) || 0) });
      }
    }
  } catch (error) { console.warn('Could not read local stats fallback:', error); }
  return map;
}

export function getServerStatsMap(): Map<string, SongLiveStat> {
  global.__pc_stats__ ||= initStatsMap();
  return global.__pc_stats__;
}
export function getSubscribers(): Set<(payload: string) => void> {
  global.__pc_subscribers__ ||= new Set();
  return global.__pc_subscribers__;
}

let saveTimeout: NodeJS.Timeout | null = null;
function persistFallback() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const serialized: StatsMap = {};
      getServerStatsMap().forEach((stat, id) => { serialized[id] = stat; });
      fs.writeFileSync(CACHE_FILE, JSON.stringify(serialized, null, 2), 'utf8');
    } catch (error) { console.warn('Could not persist local stats fallback:', error); }
  }, 500);
}

async function readDatabaseStats(): Promise<StatsMap | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.from('song_stats').select('song_id, views, likes').limit(10000);
  if (error) throw error;
  const result: StatsMap = {};
  for (const row of data || []) result[row.song_id] = { views: Number(row.views) || 0, likes: Number(row.likes) || 0 };
  return result;
}
async function incrementDatabaseStat(songId: string, action: 'view' | 'favorite', delta: number): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  const { error } = await supabase.rpc('increment_song_stat', {
    p_song_id: songId,
    p_action: action,
    p_delta: delta,
  });
  if (error) throw error;
}

export async function getAllServerStats(): Promise<StatsMap> {
  try {
    const databaseStats = await readDatabaseStats();
    if (databaseStats) {
      const merged = getServerStatsMap();
      for (const [id, stat] of Object.entries(databaseStats)) merged.set(id, stat);
      return Object.fromEntries(merged);
    }
  } catch (error) { console.warn('Supabase stats read failed; using local fallback:', error); }
  return Object.fromEntries(getServerStatsMap());
}

export function broadcastUpdate(event: { type: 'view' | 'favorite' | 'sync'; songId?: string; stat?: SongLiveStat; allStats?: StatsMap; }) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  getSubscribers().forEach((send) => { try { send(payload); } catch { getSubscribers().delete(send); } });
}

async function updateStat(songId: string, update: (current: SongLiveStat) => SongLiveStat): Promise<SongLiveStat> {
  const stats = getServerStatsMap();
  const current = update({ ...(stats.get(songId) || { views: 0, likes: 0 }) });
  stats.set(songId, current);
  persistFallback();
  return current;
}
export async function recordServerView(songId: string): Promise<SongLiveStat> {
  const stat = await updateStat(songId, (current) => ({ ...current, views: current.views + 1 }));
  try { await incrementDatabaseStat(songId, 'view', 1); } catch (error) { console.warn('Supabase stats write failed; local fallback retained:', error); }
  broadcastUpdate({ type: 'view', songId, stat });
  return stat;
}
export async function recordServerFavorite(songId: string, isFavorite: boolean): Promise<SongLiveStat> {
  const delta = isFavorite ? 1 : -1;
  const stat = await updateStat(songId, (current) => ({ ...current, likes: Math.max(0, current.likes + delta) }));
  try { await incrementDatabaseStat(songId, 'favorite', delta); } catch (error) { console.warn('Supabase stats write failed; local fallback retained:', error); }
  broadcastUpdate({ type: 'favorite', songId, stat });
  return stat;
}
