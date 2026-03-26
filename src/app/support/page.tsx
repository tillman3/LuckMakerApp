import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Support — Help & FAQ',
  description: 'Get help with Luck Maker 3000. FAQ about billing, features, and how to use our lottery analytics tools.',
};

const faqs = [
  {
    category: 'Billing & Account',
    items: [
      {
        q: 'How do I cancel my subscription?',
        a: 'You can cancel anytime through your Stripe billing portal. Go to Pricing and click "Manage Subscription", or contact us and we\'ll handle it immediately. No cancellation fees ever.',
      },
      {
        q: 'How do I log in after subscribing?',
        a: 'After checkout, you\'re automatically logged in. If you need to log in again later, click "Log In" in the nav bar and enter the email you used for your subscription.',
      },
      {
        q: 'Can I switch between Pro and Premium?',
        a: 'Yes! You can upgrade or downgrade at any time through the Stripe billing portal. Changes take effect immediately, and you\'ll be charged the prorated difference.',
      },
      {
        q: 'Do you offer refunds?',
        a: 'If you\'re not happy within the first 7 days, contact us for a full refund. No questions asked.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards, debit cards, and some regional payment methods through Stripe. Your payment info is never stored on our servers.',
      },
    ],
  },
  {
    category: 'Features & Usage',
    items: [
      {
        q: 'What does the EV calculator do?',
        a: 'Expected Value (EV) tells you the mathematical worth of a lottery ticket. If a $2 ticket has an EV of $1.50, you\'re expected to lose $0.50 on average. When EV exceeds ticket cost (rare!), the math is technically in your favor.',
      },
      {
        q: 'Can this tool predict winning numbers?',
        a: 'No. Lottery draws are random and no tool can predict them. What we do is help you make smarter decisions: play when EV is highest, use anti-popular numbers to reduce split probability, and track your spending to stay responsible.',
      },
      {
        q: 'What is the anti-popular number strategy?',
        a: 'Every number combination has identical odds of winning. But some numbers are picked by more people (birthdays = 1-31, patterns like 1-2-3-4-5). If you win with less popular numbers, you\'re less likely to split the jackpot. Same odds, bigger potential payout.',
      },
      {
        q: 'How does the wheeling system work?',
        a: 'You pick more numbers than needed (e.g., 8 numbers for a 5-number game), and we generate ticket combinations that guarantee a minimum match level if enough of your numbers hit. It\'s a coverage optimization strategy used by serious players.',
      },
      {
        q: 'What is the lottery pool manager?',
        a: 'It\'s a tamper-proof system for running group lottery pools. Every action is logged with timestamps, ticket photos are AI-verified, and the pool locks before the draw. No more trust issues with office pools.',
      },
      {
        q: 'How many free generations do I get?',
        a: 'Free users get 3 number generations per day. This resets at midnight. Pro and Premium subscribers get unlimited generations.',
      },
    ],
  },
  {
    category: 'Technical',
    items: [
      {
        q: 'Where does the draw data come from?',
        a: 'We pull official results from state lottery commissions. Data is updated within minutes of each draw.',
      },
      {
        q: 'Is my data private?',
        a: 'Yes. We don\'t sell or share your data. Saved numbers and spending data are stored securely. We only collect what\'s needed to provide the service.',
      },
      {
        q: 'Do you have an API?',
        a: 'Premium subscribers get API access with 1,000 calls per month. Contact us for documentation and your API key.',
      },
    ],
  },
];

export default function SupportPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight">
          Need <span className="text-neon text-glow-neon">Help</span>?
        </h1>
        <p className="text-gray-500 sm:text-lg max-w-md mx-auto">
          Check the FAQ below or reach out directly. We usually respond within 24 hours.
        </p>
      </div>

      {/* Contact Card */}
      <div className="glass-card text-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div className="text-3xl mb-3">📬</div>
        <h2 className="text-xl font-black mb-2">Contact Us</h2>
        <p className="text-sm text-[rgba(255,255,255,0.55)] mb-4">
          For billing issues, feature requests, bug reports, or anything else.
        </p>
        <a
          href="mailto:support@luckmaker3000.com"
          className="inline-block px-6 py-3 rounded-xl font-bold text-dark-900 bg-gradient-to-r from-neon to-emerald-400 hover:from-emerald-400 hover:to-neon transition-all"
        >
          ✉️ support@luckmaker3000.com
        </a>
        <p className="text-xs text-[rgba(255,255,255,0.3)] mt-3">
          Usually responds within 24 hours
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <Link href="/pricing" className="glass-card text-center group hover:bg-dark-700">
          <div className="text-2xl mb-2">💳</div>
          <h3 className="font-bold text-sm group-hover:text-gold transition-colors">Manage Subscription</h3>
          <p className="text-xs text-gray-500 mt-1">Upgrade, downgrade, or cancel</p>
        </Link>
        <Link href="/about" className="glass-card text-center group hover:bg-dark-700">
          <div className="text-2xl mb-2">📖</div>
          <h3 className="font-bold text-sm group-hover:text-neon transition-colors">How It Works</h3>
          <p className="text-xs text-gray-500 mt-1">Learn about our tools</p>
        </Link>
        <Link href="/blog" className="glass-card text-center group hover:bg-dark-700">
          <div className="text-2xl mb-2">📝</div>
          <h3 className="font-bold text-sm group-hover:text-neon transition-colors">Blog</h3>
          <p className="text-xs text-gray-500 mt-1">Tips, strategies, and updates</p>
        </Link>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-center mb-10 tracking-tight">
          Frequently <span className="text-gold">Asked</span>
        </h2>

        {faqs.map(section => (
          <div key={section.category} className="mb-8">
            <h3 className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold mb-3 px-1">
              {section.category}
            </h3>
            <div className="space-y-2">
              {section.items.map(faq => (
                <details key={faq.q} className="group rounded-2xl border border-white/[0.04] bg-white/[0.01] overflow-hidden">
                  <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer font-bold text-sm text-gray-300 hover:text-white transition-colors">
                    {faq.q}
                    <span className="text-gray-600 group-open:rotate-45 transition-transform text-lg ml-3 flex-shrink-0">+</span>
                  </summary>
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-gray-500 -mt-1 leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link href="/" className="text-sm text-gray-600 hover:text-neon transition-colors font-medium">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
