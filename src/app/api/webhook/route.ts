import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getDb } from '@/lib/db';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const db = getDb();

  // Ensure subscribers table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stripe_customer_id TEXT UNIQUE,
      stripe_subscription_id TEXT,
      email TEXT,
      plan TEXT DEFAULT 'free',
      status TEXT DEFAULT 'active',
      current_period_end TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      const plan = subscription.metadata?.plan || 'pro';

      db.prepare(`
        INSERT OR REPLACE INTO subscribers (stripe_customer_id, stripe_subscription_id, email, plan, status, current_period_end, updated_at)
        VALUES (?, ?, ?, ?, 'active', ?, datetime('now'))
      `).run(
        session.customer,
        session.subscription,
        session.customer_email || session.customer_details?.email || '',
        plan,
        new Date((subscription as any).current_period_end * 1000).toISOString()
      );
      console.log(`✅ New subscriber: ${session.customer_email} (${plan})`);
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as any;
      db.prepare(`
        UPDATE subscribers SET status = ?, current_period_end = ?, updated_at = datetime('now')
        WHERE stripe_subscription_id = ?
      `).run(
        sub.status,
        new Date(sub.current_period_end * 1000).toISOString(),
        sub.id
      );
      console.log(`🔄 Subscription updated: ${sub.id} → ${sub.status}`);
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as any;
      db.prepare(`
        UPDATE subscribers SET status = 'cancelled', plan = 'free', updated_at = datetime('now')
        WHERE stripe_subscription_id = ?
      `).run(sub.id);
      console.log(`❌ Subscription cancelled: ${sub.id}`);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as any;
      db.prepare(`
        UPDATE subscribers SET status = 'past_due', updated_at = datetime('now')
        WHERE stripe_customer_id = ?
      `).run(invoice.customer);
      console.log(`⚠️ Payment failed: ${invoice.customer}`);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
