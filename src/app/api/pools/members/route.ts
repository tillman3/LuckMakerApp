import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// POST — add member or update payment status
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { poolId, name, email, action } = body;
    
    const db = getDb();
    
    if (action === 'mark_paid') {
      db.prepare(`
        UPDATE pool_members SET paid = (SELECT buy_in FROM pools WHERE id = pool_id), 
        paid_at = datetime('now'), status = 'paid', 
        updated_at = datetime('now')
        WHERE pool_id = ? AND name = ?
      `).run(poolId, name);
      return NextResponse.json({ success: true });
    }
    
    if (action === 'join') {
      db.prepare(`
        INSERT OR IGNORE INTO pool_members (pool_id, name, email, status)
        VALUES (?, ?, ?, 'pending')
      `).run(poolId, name, email || null);
      return NextResponse.json({ success: true });
    }
    
    if (action === 'remove') {
      db.prepare('DELETE FROM pool_members WHERE pool_id = ? AND name = ?').run(poolId, name);
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
