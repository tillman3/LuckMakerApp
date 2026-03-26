import { NextRequest, NextResponse } from 'next/server';
import { stripe, SITE_URL } from '@/lib/stripe';

// Customer portal — lets users manage their subscription
export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${SITE_URL}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Portal error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
