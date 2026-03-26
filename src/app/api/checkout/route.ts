import { NextRequest, NextResponse } from 'next/server';
import { stripe, PRICE_IDS, SITE_URL } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { priceId, plan } = await req.json();

    // Map plan names to price IDs
    const resolvedPriceId = priceId || PRICE_IDS[plan as keyof typeof PRICE_IDS];

    if (!resolvedPriceId) {
      return NextResponse.json(
        { error: 'Payment not configured yet. Please check back soon!' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      success_url: `${SITE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/pricing`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: {
        metadata: { plan: plan || 'unknown' },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
