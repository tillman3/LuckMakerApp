import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = getDb();
    const subscriber = db.prepare(
      `SELECT stripe_customer_id, email, plan, status FROM subscribers WHERE LOWER(email) = LOWER(?) LIMIT 1`
    ).get(email.trim()) as any;

    if (!subscriber) {
      return NextResponse.json({ error: 'No subscription found for this email. Subscribe first at /pricing.' }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      plan: subscriber.plan,
      email: subscriber.email,
    });

    response.cookies.set('lm_customer', subscriber.stripe_customer_id, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error.message);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
