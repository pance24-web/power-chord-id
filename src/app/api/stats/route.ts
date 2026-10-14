import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_SONGS } from '@/data/songs';
import { checkRateLimit, getClientKey, rateLimitResponse } from '@/lib/rateLimit';
import { getAllServerStats, recordServerFavorite, recordServerView } from '@/lib/serverStats';

export const dynamic = 'force-dynamic';
const validSongIds = new Set(INITIAL_SONGS.map((song) => song.id));

function limited(request: Request) {
  const result = checkRateLimit(`stats:${getClientKey(request)}`);
  return result.allowed ? null : rateLimitResponse(result.retryAfter);
}

export async function GET(request: NextRequest) {
  const blocked = limited(request);
  if (blocked) return blocked;
  return NextResponse.json({ success: true, stats: await getAllServerStats() }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  const blocked = limited(request);
  if (blocked) return blocked;
  try {
    const body = await request.json();
    const { action, songId, isFavorite } = body || {};
    if (typeof songId !== 'string' || !validSongIds.has(songId)) {
      return NextResponse.json({ error: 'songId tidak valid' }, { status: 400 });
    }
    if (action === 'view') return NextResponse.json({ success: true, stat: await recordServerView(songId) });
    if (action === 'favorite' && typeof isFavorite === 'boolean') {
      return NextResponse.json({ success: true, stat: await recordServerFavorite(songId, isFavorite) });
    }
    return NextResponse.json({ error: 'Payload statistik tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Error processing stats API:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
