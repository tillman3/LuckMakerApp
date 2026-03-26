import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// GET — fetch pool by share code
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const id = searchParams.get('id');
  
  const db = getDb();
  
  if (code) {
    const pool = db.prepare('SELECT * FROM pools WHERE share_code = ?').get(code) as any;
    if (!pool) return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    
    const members = db.prepare('SELECT * FROM pool_members WHERE pool_id = ? ORDER BY created_at').all(pool.id);
    const tickets = db.prepare('SELECT * FROM pool_tickets WHERE pool_id = ? ORDER BY created_at').all(pool.id);
    
    return NextResponse.json({ pool, members, tickets });
  }
  
  if (id) {
    const pool = db.prepare('SELECT * FROM pools WHERE id = ?').get(id) as any;
    if (!pool) return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    
    const members = db.prepare('SELECT * FROM pool_members WHERE pool_id = ? ORDER BY created_at').all(pool.id);
    const tickets = db.prepare('SELECT * FROM pool_tickets WHERE pool_id = ? ORDER BY created_at').all(pool.id);
    
    return NextResponse.json({ pool, members, tickets });
  }
  
  return NextResponse.json({ error: 'Provide code or id' }, { status: 400 });
}

// POST — create a new pool
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, createdBy, gameId, buyIn = 2, drawDate, notes, members = [] } = body;
    
    if (!name || !createdBy || !gameId) {
      return NextResponse.json({ error: 'Name, createdBy, and gameId are required' }, { status: 400 });
    }
    
    const db = getDb();
    const id = crypto.randomUUID();
    const shareCode = crypto.randomBytes(4).toString('hex'); // 8-char share code
    
    db.prepare(`
      INSERT INTO pools (id, name, created_by, game_id, buy_in, draw_date, notes, share_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, createdBy, gameId, buyIn, drawDate || null, notes || null, shareCode);
    
    // Add creator as first member (auto-paid)
    db.prepare(`
      INSERT INTO pool_members (pool_id, name, email, paid, paid_at, status)
      VALUES (?, ?, ?, ?, datetime('now'), 'paid')
    `).run(id, createdBy, body.creatorEmail || null, buyIn);
    
    // Add other members
    for (const member of members) {
      if (member.name) {
        db.prepare(`
          INSERT OR IGNORE INTO pool_members (pool_id, name, email, status)
          VALUES (?, ?, ?, 'pending')
        `).run(id, member.name, member.email || null);
      }
    }
    
    return NextResponse.json({ 
      id, 
      shareCode,
      shareUrl: `https://luckmaker3000.com/pool/${shareCode}`,
      message: 'Pool created!' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
