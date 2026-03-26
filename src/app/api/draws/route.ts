import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const db = getDb();
    
    if (gameId) {
      const draws = db.prepare(
        'SELECT * FROM draws WHERE game_id = ? ORDER BY draw_date DESC, draw_time DESC LIMIT ? OFFSET ?'
      ).all(gameId, limit, offset);
      
      const total = db.prepare(
        'SELECT COUNT(*) as count FROM draws WHERE game_id = ?'
      ).get(gameId) as { count: number };
      
      return NextResponse.json({ draws, total: total.count });
    }

    // All games, latest per game
    const draws = db.prepare(`
      SELECT d.* FROM draws d
      INNER JOIN (
        SELECT game_id, MAX(draw_date) as max_date 
        FROM draws GROUP BY game_id
      ) latest ON d.game_id = latest.game_id AND d.draw_date = latest.max_date
      ORDER BY d.game_id
    `).all();

    return NextResponse.json({ draws });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
