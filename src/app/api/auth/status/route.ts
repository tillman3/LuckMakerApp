import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const customerId = req.cookies.get('lm_customer')?.value;

  if (!customerId) {
    return NextResponse.json({ plan: 'free', email: null, customerId: null });
  }

  try {
    const db = getDb();
    const subscriber = db.prepare(
      `SELECT email, plan, status, current_period_end FROM subscribers WHERE stripe_customer_id = ? LIMIT 1`
    ).get(customerId) as any;

    if (!subscriber) {
      return NextResponse.json({ plan: 'free', email: null, customerId });
    }

    // Check if subscription is still active
    const isActive = subscriber.status === 'active' || subscriber.status === 'trialing';
    const isExpired = subscriber.current_period_end && new Date(subscriber.current_period_end) < new Date();

    if (!isActive || isExpired) {
      return NextResponse.json({ plan: 'free', email: subscriber.email, customerId });
    }

    return NextResponse.json({
      plan: subscriber.plan || 'free',
      email: subscriber.email,
      customerId,
    });
  } catch (error) {
    console.error('Auth status error:', error);
    return NextResponse.json({ plan: 'free', email: null, customerId: null });
  }
}
