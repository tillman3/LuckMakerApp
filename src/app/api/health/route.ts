import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const result = db.prepare('SELECT COUNT(*) as draws FROM draws').get() as { draws: number };
    return NextResponse.json({ 
      status: 'ok', 
      draws: result.draws,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
