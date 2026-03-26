import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET — fetch user's tickets
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });
  
  const db = getDb();
  const tickets = db.prepare(
    'SELECT * FROM ticket_vault WHERE user_token = ? ORDER BY draw_date DESC, created_at DESC LIMIT 100'
  ).all(token);
  
  // Calculate stats
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total_tickets,
      SUM(purchase_price) as total_spent,
      SUM(CASE WHEN is_winner = 1 THEN prize_amount ELSE 0 END) as total_won,
      SUM(CASE WHEN is_winner = 1 THEN 1 ELSE 0 END) as winning_tickets
    FROM ticket_vault WHERE user_token = ?
  `).get(token);
  
  return NextResponse.json({ tickets, stats });
}

// POST — add ticket to vault
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userToken, gameId, drawDate, drawTime, numbers, bonusNumber, purchasePrice, ticketPhoto, notes } = body;
    
    if (!userToken || !gameId || !drawDate || !numbers) {
      return NextResponse.json({ error: 'userToken, gameId, drawDate, and numbers required' }, { status: 400 });
    }
    
    const db = getDb();
    
    // Auto-check against results
    let isWinner = 0;
    let prizeAmount = 0;
    let matchDetails = '';
    
    const draw = db.prepare(
      'SELECT numbers, bonus_number FROM draws WHERE game_id = ? AND draw_date = ? AND (draw_time = ? OR draw_time IS NULL) LIMIT 1'
    ).get(gameId, drawDate, drawTime || null) as any;
    
    if (draw) {
      const ticketNums = numbers.split(',').map((n: string) => parseInt(n.trim()));
      const drawNums = draw.numbers.split(',').map((n: string) => parseInt(n.trim()));
      const matches = ticketNums.filter((n: number) => drawNums.includes(n)).length;
      const bonusMatch = bonusNumber && draw.bonus_number && String(bonusNumber) === String(draw.bonus_number);
      
      matchDetails = `${matches}/${ticketNums.length} numbers matched${bonusMatch ? ' + bonus' : ''}`;
      if (matches > 0) {
        isWinner = 1;
        // Simplified prize estimation (users can update manually)
        if (matches === ticketNums.length && bonusMatch) {
          matchDetails = '🏆 JACKPOT MATCH! Verify your ticket!';
        } else if (matches === ticketNums.length) {
          matchDetails = `${matches}/${ticketNums.length} — Check prize tier!`;
        }
      }
    }
    
    const result = db.prepare(`
      INSERT INTO ticket_vault (user_token, game_id, draw_date, draw_time, numbers, bonus_number, purchase_price, ticket_photo, notes, is_checked, is_winner, match_details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userToken, gameId, drawDate, drawTime || null, numbers, bonusNumber || null, purchasePrice || 2, ticketPhoto || null, notes || null, draw ? 1 : 0, isWinner, matchDetails);
    
    return NextResponse.json({ 
      id: result.lastInsertRowid, 
      isChecked: !!draw,
      isWinner,
      matchDetails,
      success: true 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
