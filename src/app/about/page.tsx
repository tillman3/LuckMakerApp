import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — How Luck Maker 3000 Works',
  description: 'Learn how our EV calculator, smart number generator, and wheeling systems work. Real math, honest disclaimers.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl sm:text-4xl font-black mb-8">
        How <span className="text-neon text-glow-neon">Luck Maker 3000</span> Works
      </h1>

      {/* The Honest Truth */}
      <section className="glass-card mb-6 border-gold/10">
        <h2 className="text-xl sm:text-2xl font-black text-gold mb-4">⚠️ The Honest Truth</h2>
        <div className="space-y-3 text-gray-300 text-sm sm:text-base">
          <p>
            <strong>We do not predict winning lottery numbers.</strong> No one can. Every draw is independent,
            every combination equally likely. Anyone who tells you otherwise is selling snake oil.
          </p>
          <p>
            What we <em>do</em> offer is <strong>utility</strong>: tools that help you make informed decisions
            about whether to play, how much to spend, and which numbers maximize your <em>expected payout
            if you win</em>.
          </p>
          <p>
            The lottery is entertainment. Budget for it like you would a movie ticket. If you&apos;re
            spending money you can&apos;t afford to lose, please seek help.
          </p>
        </div>
      </section>

      {/* Feature sections */}
      {[
        {
          icon: '📐',
          title: 'Expected Value Calculator',
          content: (
            <div className="space-y-3 text-sm text-gray-400">
              <p>
                Expected Value (EV) tells you: if you played this exact ticket millions of times,
                what would you average per play?
              </p>
              <p>Our calculator factors in:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li><strong className="text-gray-300">Jackpot size</strong> — The headline number</li>
                <li><strong className="text-gray-300">Lump sum discount</strong> — Typically ~60% of advertised</li>
                <li><strong className="text-gray-300">Federal taxes</strong> — 37% top bracket</li>
                <li><strong className="text-gray-300">State taxes</strong> — 0% in Texas! 🎉</li>
                <li><strong className="text-gray-300">All prize tiers</strong> — Not just the jackpot</li>
                <li><strong className="text-gray-300">Split probability</strong> — More sales = more splits</li>
              </ul>
              <p className="text-gold text-xs p-3 rounded-xl bg-gold/5 border border-gold/10">
                💡 When jackpots get truly massive ($800M+), the math can flip to slightly positive EV.
                These moments are rare and still don&apos;t mean you&apos;ll win.
              </p>
            </div>
          ),
        },
        {
          icon: '🎲',
          title: 'Smart Number Generator',
          content: (
            <div className="space-y-3 text-sm text-gray-400">
              <p>
                Every combination has the same probability. But <strong className="text-gray-300">how many people picked
                the same numbers</strong> matters for splits.
              </p>
              <p>Our Anti-Popular generator avoids commonly picked numbers:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Prefers numbers above 31 (avoids birthday pickers)</li>
                <li>Avoids &quot;lucky&quot; numbers like 7, 11, 13</li>
                <li>Avoids recent winning numbers (people chase these)</li>
                <li>Avoids obvious patterns (sequences, multiples)</li>
              </ul>
              <p className="text-neon font-bold">Same odds of winning. Better odds of keeping it all.</p>
            </div>
          ),
        },
        {
          icon: '👥',
          title: 'Pool Manager',
          content: (
            <div className="space-y-3 text-sm text-gray-400">
              <p>
                Office lottery pools are a mess. Who paid? What tickets were bought? Where&apos;s the proof?
              </p>
              <p>Our Pool Manager solves this:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li><strong className="text-gray-300">AI-verified ticket photos</strong> — Proof of purchase</li>
                <li><strong className="text-gray-300">Payment tracking</strong> — See who&apos;s paid, who hasn&apos;t</li>
                <li><strong className="text-gray-300">Auto result checking</strong> — Know instantly if you won</li>
                <li><strong className="text-gray-300">Fair split calculator</strong> — Everyone gets their share</li>
                <li><strong className="text-gray-300">Shareable links</strong> — One link for the whole group</li>
              </ul>
            </div>
          ),
        },
        {
          icon: '🎡',
          title: 'Wheeling Systems',
          content: (
            <div className="space-y-3 text-sm text-gray-400">
              <p>
                Pick more numbers than a single ticket allows. The wheel generates optimized
                combinations that <strong className="text-gray-300">guarantee minimum match levels</strong>.
              </p>
              <p>
                Example: Pick 10 favorites for a 5-number game. If 4 of your 10 are drawn,
                at least one ticket matches 3+.
              </p>
              <p>
                Wheels don&apos;t change individual ticket odds — they&apos;re a systematic way
                to cover more combinations if you&apos;re buying multiple tickets anyway.
              </p>
            </div>
          ),
        },
      ].map((section) => (
        <section key={section.title} className="glass-card mb-6">
          <h2 className="text-lg sm:text-xl font-black text-neon mb-4">
            {section.icon} {section.title}
          </h2>
          {section.content}
        </section>
      ))}

      {/* Gambler's Fallacy callout */}
      <section className="glass-card mb-6 border-gold/10">
        <h2 className="text-lg font-black text-gold mb-3">🧠 The Gambler&apos;s Fallacy</h2>
        <p className="text-sm text-gray-400">
          &quot;Number 42 hasn&apos;t appeared in 50 draws — it&apos;s due!&quot; <strong className="text-white">This is false.</strong> Each
          draw is independent. The ball doesn&apos;t remember where it landed last time. A number
          that hasn&apos;t appeared in 100 draws has the exact same probability on the next draw
          as one that appeared yesterday. We label all our analytics honestly.
        </p>
      </section>

      {/* Problem Gambling */}
      <section className="glass-card mb-6 border-gold/20">
        <h2 className="text-lg font-black text-gold mb-3">🤝 Play Responsibly</h2>
        <div className="space-y-2 text-sm text-gray-400">
          <p>If you or someone you know has a gambling problem:</p>
          <ul className="space-y-2">
            <li>
              <strong className="text-white">Helpline:</strong>{' '}
              <a href="tel:1-800-522-4700" className="text-neon hover:underline">1-800-522-4700</a>
            </li>
            <li>
              <strong className="text-white">Text:</strong> 233-4357
            </li>
            <li>
              <strong className="text-white">Chat:</strong>{' '}
              <a href="https://www.ncpgambling.org/chat" className="text-neon hover:underline" target="_blank" rel="noopener noreferrer">
                ncpgambling.org/chat
              </a>
            </li>
          </ul>
          <p>Free, confidential, 24/7.</p>
        </div>
      </section>

      <div className="text-center">
        <Link href="/" className="inline-block px-6 py-3 rounded-xl bg-neon/10 text-neon border border-neon/20 font-bold hover:bg-neon/20 transition-all">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
