import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { GAMES } from '@/lib/games';
import { getNumberStats, getGapAnalysis } from '@/lib/analytics';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');
  const type = searchParams.get('type') || 'frequency';
  const limit = parseInt(searchParams.get('limit') || '500');

  if (!gameId || !GAMES[gameId]) {
    return NextResponse.json({ error: 'Valid gameId required' }, { status: 400 });
  }

  try {
    const db = getDb();
    const game = GAMES[gameId];
    
    const draws = db.prepare(
      'SELECT numbers, draw_date FROM draws WHERE game_id = ? ORDER BY draw_date DESC LIMIT ?'
    ).all(gameId, limit) as { numbers: string; draw_date: string }[];

    if (draws.length === 0) {
      return NextResponse.json({ error: 'No data for this game', data: null });
    }

    switch (type) {
      case 'frequency': {
        const stats = getNumberStats(draws, game.mainMax);
        return NextResponse.json({ type: 'frequency', data: stats });
      }
      case 'gaps': {
        const gaps = getGapAnalysis(draws, game.mainMax);
        return NextResponse.json({ type: 'gaps', data: gaps });
      }
      default:
        return NextResponse.json({ error: 'Unknown analysis type' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
