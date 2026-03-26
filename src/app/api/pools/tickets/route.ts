import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// POST — add ticket to pool
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { poolId, numbers, bonusNumber, purchasedBy, ticketPhoto } = body;
    
    if (!poolId || !numbers) {
      return NextResponse.json({ error: 'poolId and numbers required' }, { status: 400 });
    }
    
    const db = getDb();
    
    const result = db.prepare(`
      INSERT INTO pool_tickets (pool_id, numbers, bonus_number, purchased_by, ticket_photo)
      VALUES (?, ?, ?, ?, ?)
    `).run(poolId, numbers, bonusNumber || null, purchasedBy || null, ticketPhoto || null);
    
    return NextResponse.json({ id: result.lastInsertRowid, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
