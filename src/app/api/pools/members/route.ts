import { NextRequest, NextResponse } from 'next/server';
import { joinPool, confirmPayment, captainMarkPaid, lockPool } from '@/lib/pool-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { poolId, name, email, action, actor } = body;

    switch (action) {
      case 'join':
        joinPool(poolId, name, email);
        return NextResponse.json({ success: true, message: `${name} joined the pool` });

      case 'confirm_payment':
        confirmPayment(poolId, name);
        return NextResponse.json({ success: true, message: `${name} confirmed payment` });

      case 'mark_paid':
        captainMarkPaid(poolId, name, actor || 'captain');
        return NextResponse.json({ success: true, message: `${name} marked as paid` });

      case 'lock':
        lockPool(poolId, actor || 'captain');
        return NextResponse.json({ success: true, message: 'Pool locked — no more changes' });

      default:
        return NextResponse.json({ error: 'Invalid action. Use: join, confirm_payment, mark_paid, lock' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
