import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET — check alert status for email
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
  
  const db = getDb();
  const alerts = db.prepare('SELECT * FROM jackpot_alerts WHERE email = ? AND active = 1').all(email);
  return NextResponse.json({ alerts });
}

// POST — create or update alert
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, gameId, threshold, action } = body;
    
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
    
    const db = getDb();
    
    if (action === 'unsubscribe') {
      if (gameId) {
        db.prepare('UPDATE jackpot_alerts SET active = 0 WHERE email = ? AND game_id = ?').run(email, gameId);
      } else {
        db.prepare('UPDATE jackpot_alerts SET active = 0 WHERE email = ?').run(email);
      }
      return NextResponse.json({ success: true, message: 'Unsubscribed' });
    }
    
    if (!gameId || !threshold) {
      return NextResponse.json({ error: 'gameId and threshold required' }, { status: 400 });
    }
    
    db.prepare(`
      INSERT INTO jackpot_alerts (email, game_id, threshold)
      VALUES (?, ?, ?)
      ON CONFLICT(email, game_id) DO UPDATE SET threshold = ?, active = 1
    `).run(email, gameId, threshold, threshold);
    
    return NextResponse.json({ success: true, message: `Alert set: ${gameId} at $${threshold.toLocaleString()}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
