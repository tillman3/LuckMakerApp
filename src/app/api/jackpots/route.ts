import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  try {
    const db = getDb();
    
    // Get jackpots from jackpots table (populated by RSS scraper)
    const jackpots = db.prepare('SELECT * FROM jackpots').all() as {
      game_id: string;
      annuitized: number;
      cash_value: number;
      next_draw_date: string;
      updated_at: string;
    }[];
    
    // Get latest draw per game
    const latestDraws = db.prepare(`
      SELECT game_id, draw_date, draw_time, numbers, bonus_number
      FROM draws d1
      WHERE id = (SELECT id FROM draws d2 WHERE d2.game_id = d1.game_id ORDER BY draw_date DESC, draw_time DESC LIMIT 1)
    `).all() as {
      game_id: string;
      draw_date: string;
      draw_time: string | null;
      numbers: string;
      bonus_number: string | null;
    }[];

    const result: Record<string, any> = {};
    
    for (const draw of latestDraws) {
      result[draw.game_id] = {
        latestNumbers: draw.numbers.split(',').map(Number),
        bonusNumber: draw.bonus_number ? parseInt(draw.bonus_number) : null,
        drawDate: draw.draw_date,
        drawTime: draw.draw_time,
      };
    }
    
    for (const jp of jackpots) {
      if (result[jp.game_id]) {
        result[jp.game_id].jackpot = jp.annuitized;
        result[jp.game_id].cashValue = jp.cash_value;
        result[jp.game_id].nextDrawDate = jp.next_draw_date;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jackpots' }, { status: 500 });
  }
}
