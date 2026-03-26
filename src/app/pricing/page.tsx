import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Luck Maker 3000',
  description: 'Free tier, Pro, and Premium plans for Luck Maker 3000 lottery analytics.',
};

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with the basics',
    color: 'border-dark-500',
    buttonClass: 'bg-dark-600 text-gray-300 hover:bg-dark-500',
    buttonText: 'Current Plan',
    features: [
      'View all draw results',
      'Basic EV calculator',
      '2 number generations / day',
      'Historical frequency data',
      'All game coverage',
    ],
    notIncluded: [
      'Unlimited generations',
      'Wheeling systems',
      'Number tracking & alerts',
      'Spending tracker',
      'Advanced analytics',
      'Pool manager',
      'API access',
    ],
  },
  {
    name: 'Pro',
    price: '$4.99',
    period: '/month',
    description: 'For the serious player',
    color: 'border-neon/30 glow-neon',
    buttonClass: 'bg-neon/20 text-neon border border-neon/30 hover:bg-neon/30',
    buttonText: 'Coming Soon',
    popular: true,
    features: [
      'Everything in Free',
      'Unlimited number generations',
      'Full wheeling systems',
      'Save & track your numbers',
      'Auto result checking',
      'Win notifications',
      'Spending tracker',
      'Ad-free experience',
    ],
    notIncluded: [
      'Pool manager',
      'Advanced analytics',
      'API access',
    ],
  },
  {
    name: 'Premium',
    price: '$9.99',
    period: '/month',
    description: 'For groups & power users',
    color: 'border-gold/30 glow-gold',
    buttonClass: 'bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30',
    buttonText: 'Coming Soon',
    features: [
      'Everything in Pro',
      'Lottery pool manager',
      'Advanced analytics & exports',
      'API access',
      'Priority support',
      'Custom EV parameters',
      'Multi-state tracking',
      'Historical EV charts',
    ],
    notIncluded: [],
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">
          Simple, <span className="text-neon">Honest</span> Pricing
        </h1>
        <p className="text-gray-400">
          Most features are free. Pro unlocks the full toolkit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map(tier => (
          <div key={tier.name} className={`card relative ${tier.color}`}>
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-neon text-dark-900 text-xs font-bold rounded-full">
                MOST POPULAR
              </div>
            )}
            
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">{tier.name}</h2>
              <div className="mt-2">
                <span className="text-3xl font-bold text-white">{tier.price}</span>
                <span className="text-gray-500">{tier.period}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{tier.description}</p>
            </div>

            <ul className="space-y-2 mb-6">
              {tier.features.map(feature => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <span className="text-neon mt-0.5">✓</span>
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
              {tier.notIncluded.map(feature => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <span className="text-gray-700 mt-0.5">✕</span>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <button className={`w-full py-3 rounded-lg font-bold transition-colors ${tier.buttonClass}`}>
              {tier.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">FAQ</h2>
        <div className="space-y-4 max-w-2xl mx-auto">
          {[
            {
              q: 'Will this help me win the lottery?',
              a: 'No. Nothing can predict lottery numbers. What we DO help with: calculating whether a game is worth playing (EV), generating numbers that reduce jackpot-splitting probability, and tracking your spending.',
            },
            {
              q: 'Why pay for a lottery tool?',
              a: 'If you already buy lottery tickets, our tools help you play smarter: pick better times (high jackpots), avoid popular numbers, and set spending limits. Think of it as paying $5/mo to make your $20/mo lottery budget more strategic.',
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Yes. No contracts, no commitments. Cancel your subscription anytime and keep using the free tier.',
            },
            {
              q: 'What games do you support?',
              a: 'Powerball, Mega Millions, Lotto Texas, Texas Two Step, Cash Five, Pick 3, Daily 4, and All or Nothing. More states coming soon.',
            },
          ].map(faq => (
            <div key={faq.q} className="card">
              <h3 className="font-bold text-white mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-neon">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
