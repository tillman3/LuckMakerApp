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
    borderClass: 'border-white/[0.04]',
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
    borderClass: 'border-neon/20',
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
    borderClass: 'border-gold/20',
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      <div className="text-center mb-12 sm:mb-16 animate-fade-in-up">
        <h1 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
          Simple, <span className="text-gold text-glow-gold">Honest</span> Pricing
        </h1>
        <p className="text-gray-500 sm:text-lg max-w-md mx-auto">
          Most features are free. Upgrade when you&apos;re ready.
        </p>
        <p className="text-xs text-gray-600 mt-3 font-medium">
          💰 Save ~40% with annual billing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {tiers.map((tier, i) => (
          <div 
            key={tier.name} 
            className={`relative rounded-2xl border bg-gradient-to-b from-white/[0.02] to-transparent backdrop-blur-sm p-5 sm:p-7 flex flex-col ${tier.borderClass} ${tier.popular ? 'ring-1 ring-neon/15 shadow-[0_0_30px_rgba(0,255,136,0.04)]' : ''} animate-fade-in-up`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-neon text-dark-900 text-[10px] font-black rounded-full uppercase tracking-widest whitespace-nowrap z-10">
                Most Popular
              </div>
            )}
            
            <div className="text-center mb-6 pt-1">
              <h2 className="text-lg sm:text-xl font-black text-white">{tier.name}</h2>
              <div className="mt-3">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">{tier.price}</span>
                <span className="text-gray-600 text-sm ml-1">{tier.period}</span>
              </div>
              {tier.yearlyPrice && (
                <div className="text-xs text-gold mt-2 font-semibold">
                  or {tier.yearlyPrice}/year (save ~40%)
                </div>
              )}
              <p className="text-xs sm:text-sm text-gray-600 mt-3">{tier.description}</p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent mb-5" />

            <ul className="space-y-2.5 mb-8 flex-1">
              {tier.features.map(feature => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <span className="text-neon mt-0.5 flex-shrink-0 text-xs">✓</span>
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
              {tier.notIncluded.map(feature => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <span className="text-gray-700 mt-0.5 flex-shrink-0 text-xs">✕</span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            {tier.plan ? (
              <CheckoutButton plan={tier.plan} tierName={tier.name} />
            ) : (
              <Link 
                href="/" 
                className="block w-full py-3.5 rounded-xl font-bold text-center bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] transition-all text-sm"
              >
                Get Started Free
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Trust signals */}
      <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mt-10 sm:mt-12 text-xs sm:text-sm text-gray-600 font-medium">
        <span>🔒 Secure payments via Stripe</span>
        <span>↩️ Cancel anytime</span>
        <span>💳 No hidden fees</span>
      </div>

      {/* FAQ */}
      <div className="mt-16 sm:mt-20">
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-10 tracking-tight">
          Frequently <span className="text-gold">Asked</span>
        </h2>
        <div className="space-y-3 max-w-2xl mx-auto">
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
            <details key={faq.q} className="group rounded-2xl border border-white/[0.04] bg-white/[0.01] overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-bold text-sm sm:text-base text-gray-300 hover:text-white transition-colors">
                {faq.q}
                <span className="text-gray-600 group-open:rotate-45 transition-transform text-lg ml-3 flex-shrink-0">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-gray-500 -mt-1 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="text-center mt-10">
        <Link href="/" className="text-sm text-gray-600 hover:text-neon transition-colors font-medium">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
