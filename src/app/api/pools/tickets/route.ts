import { NextRequest, NextResponse } from 'next/server';
import { addTicket } from '@/lib/pool-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { poolId, numbers, bonusNumber, ticketPhoto, purchasedBy } = body;
    
    if (!poolId || !numbers) {
      return NextResponse.json({ error: 'poolId and numbers required' }, { status: 400 });
    }

    if (!ticketPhoto) {
      return NextResponse.json({ error: 'Ticket photo is required — take a photo of the physical ticket' }, { status: 400 });
    }
    
    const ticketId = addTicket(poolId, {
      numbers,
      bonusNumber,
      ticketPhoto,
      purchasedBy,
    });
    
    return NextResponse.json({ id: ticketId, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
