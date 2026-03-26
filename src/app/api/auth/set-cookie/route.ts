import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.customer || typeof session.customer !== 'string') {
      return NextResponse.json({ error: 'No customer found' }, { status: 400 });
    }

    const response = NextResponse.json({ success: true, customerId: session.customer });

    response.cookies.set('lm_customer', session.customer, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Set cookie error:', error.message);
    return NextResponse.json({ error: 'Failed to set session' }, { status: 500 });
  }
}
