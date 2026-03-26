import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckoutButton } from '@/components/CheckoutButton';

export const metadata: Metadata = {
  title: 'Pricing — Simple, Honest Plans',
  description: 'Free lottery analytics with optional Pro and Premium upgrades. EV calculator, smart generator, wheeling systems, number tracking, and more.',
};

const tiers = [
  {
    name: 'Free',
    price: '$0',
    yearlyPrice: null,
    period: 'forever',
    description: 'Everything you need to start',
    borderClass: 'border-white/5',
    plan: null,
    features: [
      'All draw results — every game',
      'EV calculator for all games',
      '3 number generations per day',
      'Historical frequency data',
      'Basic analytics',
    ],
    notIncluded: [
      'Unlimited generations',
      'Wheeling systems',
      'Number tracking & alerts',
      'Spending tracker',
      'Ad-free experience',
      'Pool manager',
      'API access',
    ],
  },
  {
    name: 'Pro',
    price: '$6.99',
    yearlyPrice: '$49.99',
    period: '/month',
    description: 'For players who want an edge',
    borderClass: 'border-neon/30',
    plan: 'pro_monthly',
    popular: true,
    features: [
      'Everything in Free, plus:',
      'Unlimited number generations',
      'Full wheeling systems',
      'Anti-popular number optimizer',
      'Save & track your numbers',
      'Auto result checking + alerts',
      'Win notifications (email)',
      'Spending vs winnings tracker',
      'Ad-free experience',
    ],
    notIncluded: [
      'Pool manager',
      'Data exports',
      'API access',
    ],
  },
  {
    name: 'Premium',
    price: '$12.99',
    yearlyPrice: '$99.99',
    period: '/month',
    description: 'For groups & power users',
    borderClass: 'border-gold/30',
    plan: 'premium_monthly',
    features: [
      'Everything in Pro, plus:',
      'Lottery pool manager',
      'AI ticket photo verification',
      'Advanced analytics & data exports',
      'Historical EV charts',
      'Multi-state tracking',
      'Custom EV parameters',
      'API access (1,000 calls/mo)',
      'Priority support',
    ],
    notIncluded: [],
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-10 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-black mb-3">
          Simple, <span className="text-gold text-glow-gold">Honest</span> Pricing
        </h1>
        <p className="text-gray-400 sm:text-lg">
          Most features are free. Upgrade when you&apos;re ready.
        </p>
        <p className="text-xs text-gray-600 mt-2">
          💰 Save ~40% with annual billing
        </p>
      </div>

      {/* Mobile: stack vertically. Desktop: 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {tiers.map(tier => (
          <div 
            key={tier.name} 
            className={`relative rounded-2xl border bg-white/[0.02] backdrop-blur-sm p-5 sm:p-6 flex flex-col ${tier.borderClass} ${tier.popular ? 'ring-1 ring-neon/20 shadow-[0_0_20px_rgba(0,255,136,0.05)]' : ''}`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-neon text-dark-900 text-[11px] font-black rounded-full uppercase tracking-wider whitespace-nowrap z-10">
                Most Popular
              </div>
            )}
            
            <div className="text-center mb-5 pt-1">
              <h2 className="text-lg sm:text-xl font-bold text-white">{tier.name}</h2>
              <div className="mt-2">
                <span className="text-3xl sm:text-4xl font-black text-white">{tier.price}</span>
                <span className="text-gray-500 text-sm">{tier.period}</span>
              </div>
              {tier.yearlyPrice && (
                <div className="text-xs text-gold mt-1">
                  or {tier.yearlyPrice}/year (save ~40%)
                </div>
              )}
              <p className="text-xs sm:text-sm text-gray-500 mt-2">{tier.description}</p>
            </div>

            <ul className="space-y-2 mb-6 flex-1">
              {tier.features.map(feature => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <span className="text-neon mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
              {tier.notIncluded.map(feature => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <span className="text-gray-700 mt-0.5 flex-shrink-0">✕</span>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            {tier.plan ? (
              <CheckoutButton plan={tier.plan} tierName={tier.name} />
            ) : (
              <Link 
                href="/" 
                className="block w-full py-3 rounded-xl font-bold text-center bg-white/5 text-gray-400 hover:bg-white/10 transition-all"
              >
                Get Started Free
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Trust signals */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8 sm:mt-10 text-xs sm:text-sm text-gray-500">
        <span>🔒 Secure payments via Stripe</span>
        <span>↩️ Cancel anytime</span>
        <span>💳 No hidden fees</span>
      </div>

      {/* FAQ */}
      <div className="mt-12 sm:mt-16">
        <h2 className="text-2xl font-black text-center mb-8">
          Frequently <span className="text-gold">Asked</span>
        </h2>
        <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto">
          {[
            {
              q: 'Will this help me win the lottery?',
              a: "No tool can predict lottery numbers — they're random. What we DO is: calculate whether a game is worth playing (EV), generate numbers that reduce jackpot-splitting probability, and help you track spending so lottery stays fun.",
            },
            {
              q: 'Why pay for a lottery tool?',
              a: "If you spend $20/month on tickets, $7/month for tools that help you pick better games, avoid popular numbers, and track your budget is a smart investment. Think of it as making your lottery budget work smarter.",
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Yes. No contracts, no commitments, no cancellation fees. Cancel in one click and keep using the free tier.',
            },
            {
              q: 'What games do you support?',
              a: 'Powerball, Mega Millions, Lotto Texas, Texas Two Step, Cash Five, Pick 3, Daily 4, and All or Nothing. All 50 states coming soon.',
            },
            {
              q: 'Is my payment info safe?',
              a: 'Payments are processed by Stripe — the same system used by Amazon, Google, and Shopify. We never see or store your card details.',
            },
            {
              q: "What's the annual plan?",
              a: 'Pay yearly and save ~40%. Pro: $49.99/year (vs $83.88). Premium: $99.99/year (vs $155.88). Same features, better price.',
            },
          ].map(faq => (
            <details key={faq.q} className="group rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer font-bold text-sm sm:text-base text-white hover:text-gold transition-colors">
                {faq.q}
                <span className="text-gray-600 group-open:rotate-45 transition-transform text-lg ml-2 flex-shrink-0">+</span>
              </summary>
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-gray-400 -mt-1">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="text-center mt-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-neon transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
