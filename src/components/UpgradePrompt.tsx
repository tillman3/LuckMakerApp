'use client';

import Link from 'next/link';

type Plan = 'pro' | 'premium';

const planDetails: Record<Plan, { name: string; price: string; features: string[]; emoji: string }> = {
  pro: {
    name: 'Pro',
    price: '$6.99/mo',
    emoji: '⚡',
    features: [
      'Unlimited number generations',
      'Full wheeling systems',
      'Save & track your numbers',
      'Auto result checking + alerts',
      'Spending tracker',
      'Ad-free experience',
    ],
  },
  premium: {
    name: 'Premium',
    price: '$12.99/mo',
    emoji: '👑',
    features: [
      'Everything in Pro',
      'Lottery pool manager',
      'AI ticket verification',
      'Advanced analytics & exports',
      'API access',
      'Priority support',
    ],
  },
};

interface UpgradePromptProps {
  plan?: Plan;
  title?: string;
  message?: string;
  compact?: boolean;
}

export function UpgradePrompt({ plan = 'pro', title, message, compact = false }: UpgradePromptProps) {
  const details = planDetails[plan];

  if (compact) {
    return (
      <div className="rounded-2xl bg-dark-800 p-5 text-center">
        <p className="text-sm text-[rgba(255,255,255,0.55)] mb-3">
          {message || `This feature requires ${details.name}.`}
        </p>
        <Link
          href="/pricing"
          className="inline-block px-5 py-2.5 rounded-xl font-bold text-sm text-dark-900 bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-400 hover:to-gold transition-all"
        >
          {details.emoji} Upgrade to {details.name} — {details.price}
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-card text-center">
      <div className="text-4xl mb-4">{details.emoji === '⚡' ? '🔓' : '👑'}</div>
      <h3 className="text-xl font-black mb-2 text-gold">
        {title || `Unlock with ${details.name}`}
      </h3>
      <p className="text-sm text-[rgba(255,255,255,0.55)] mb-6 max-w-sm mx-auto">
        {message || `Get access to this feature and more with a ${details.name} subscription.`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 text-left max-w-sm mx-auto">
        {details.features.map(feature => (
          <div key={feature} className="flex items-center gap-2 text-sm">
            <span className="text-gold text-xs flex-shrink-0">✦</span>
            <span className="text-[rgba(255,255,255,0.65)]">{feature}</span>
          </div>
        ))}
      </div>

      <Link
        href="/pricing"
        className="inline-block px-6 py-3 rounded-xl font-bold text-dark-900 bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-400 hover:to-gold transition-all"
      >
        {details.emoji} Upgrade to {details.name} — {details.price}
      </Link>
      <p className="text-xs text-[rgba(255,255,255,0.3)] mt-3">Cancel anytime · No commitment</p>
    </div>
  );
}
