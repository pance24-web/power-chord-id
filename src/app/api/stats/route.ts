import { NextRequest, NextResponse } from 'next/server';
import {
  getAllServerStats,
  recordServerView,
  recordServerFavorite,
} from '@/lib/serverStats';

export const dynamic = 'force-dynamic';

export async function GET() {
  const stats = getAllServerStats();
  return NextResponse.json({ success: true, stats });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, songId, isFavorite } = body;

    if (!songId || typeof songId !== 'string') {
      return NextResponse.json({ error: 'Missing songId' }, { status: 400 });
    }

    if (action === 'view') {
      const updated = recordServerView(songId);
      return NextResponse.json({ success: true, stat: updated });
    }

    if (action === 'favorite') {
      const updated = recordServerFavorite(songId, Boolean(isFavorite));
      return NextResponse.json({ success: true, stat: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Error processing stats API:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
