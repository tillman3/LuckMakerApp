import { NextRequest, NextResponse } from 'next/server';
import { createPool, getPool } from '@/lib/pool-engine';

export const dynamic = 'force-dynamic';

// GET — fetch pool by share code
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  
  if (!code) return NextResponse.json({ error: 'Provide share code' }, { status: 400 });
  
  const data = getPool(code);
  if (!data) return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
  
  return NextResponse.json(data);
}

// POST — create a new pool
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, createdBy, creatorEmail, gameId, buyIn = 5, drawDate, drawTime, notes } = body;
    
    if (!name || !createdBy || !gameId) {
      return NextResponse.json({ error: 'Name, createdBy, and gameId are required' }, { status: 400 });
    }

    if (!drawDate) {
      return NextResponse.json({ error: 'Draw date is required' }, { status: 400 });
    }
    
    const result = createPool({
      name,
      createdBy,
      creatorEmail,
      gameId,
      buyIn: parseFloat(buyIn) || 5,
      drawDate,
      drawTime,
      notes,
    });
    
    return NextResponse.json({ 
      id: result.id,
      shareCode: result.shareCode,
      shareUrl: `https://luckmaker3000.com/pool/${result.shareCode}`,
      message: 'Pool created!' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
