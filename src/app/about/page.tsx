import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — How Luck Maker 3000 Works',
  description: 'Learn how our EV calculator, smart number generator, and wheeling systems work. Real math, honest disclaimers.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">
        How <span className="text-neon">Luck Maker 3000</span> Works
      </h1>

      {/* The Honest Truth */}
      <section className="card mb-8">
        <h2 className="text-2xl font-bold text-gold mb-4">⚠️ The Honest Truth</h2>
        <div className="space-y-3 text-gray-300">
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

      {/* EV Calculator */}
      <section className="card mb-8">
        <h2 className="text-xl font-bold text-neon mb-4">📐 Expected Value Calculator</h2>
        <div className="space-y-3 text-sm text-gray-400">
          <p>
            Expected Value (EV) is a mathematical concept: if you played this exact ticket millions of times, 
            what would you average per play?
          </p>
          <p>Our calculator factors in:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li><strong>Jackpot size</strong> — The headline number</li>
            <li><strong>Lump sum discount</strong> — Typically ~60% of advertised</li>
            <li><strong>Federal taxes</strong> — 37% top bracket for large prizes</li>
            <li><strong>State taxes</strong> — 0% in Texas! 🎉</li>
            <li><strong>All prize tiers</strong> — Not just the jackpot</li>
            <li><strong>Split probability</strong> — More ticket sales = more likely splits</li>
            <li><strong>Ticket cost</strong> — $1 or $2 depending on game</li>
          </ul>
          <p>
            The result tells you: for every $2 Powerball ticket, you get back $X in expected value. 
            If that number is less than $2 (it almost always is), you&apos;re paying the &quot;entertainment tax.&quot;
          </p>
          <p className="text-gold">
            Rare exception: When jackpots get truly massive (often $800M+), the math can flip to 
            slightly positive EV. These moments are rare and still don&apos;t mean you&apos;ll win.
          </p>
        </div>
      </section>

      {/* Smart Numbers */}
      <section className="card mb-8">
        <h2 className="text-xl font-bold text-neon mb-4">🎲 Smart Number Generator</h2>
        <div className="space-y-3 text-sm text-gray-400">
          <p>
            Every combination has the same probability of winning. 1-2-3-4-5-6 is as likely as 
            7-14-23-38-42-51. The math doesn&apos;t care.
          </p>
          <p>
            But here&apos;s what the math <em>does</em> care about: <strong>how many people picked 
            the same numbers</strong>. If you win with popular numbers (birthdays 1-31, lucky 7, etc.), 
            you&apos;re more likely to split the jackpot.
          </p>
          <p>
            Our Anti-Popular generator picks numbers that fewer people tend to choose:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Prefers numbers above 31 (avoids birthday pickers)</li>
            <li>Avoids &quot;lucky&quot; numbers like 7, 11, 13</li>
            <li>Avoids recent winning numbers (people chase these)</li>
            <li>Avoids obvious patterns (sequences, multiples)</li>
          </ul>
          <p>
            Same odds of winning. Better odds of keeping it all if you do.
          </p>
        </div>
      </section>

      {/* Wheeling */}
      <section className="card mb-8">
        <h2 className="text-xl font-bold text-neon mb-4">🎡 Wheeling Systems</h2>
        <div className="space-y-3 text-sm text-gray-400">
          <p>
            A wheeling system takes more numbers than a single ticket allows and creates optimized 
            combinations that <strong>guarantee minimum match levels</strong>.
          </p>
          <p>
            Example: Pick 10 favorite numbers for a 5-number game. A wheel generates ticket sets 
            where if 4 of your 10 numbers are drawn, at least one ticket matches 3+.
          </p>
          <p>
            Wheels don&apos;t change the odds of any individual ticket winning. They&apos;re a 
            systematic way to cover more number combinations if you&apos;re buying multiple tickets anyway.
          </p>
        </div>
      </section>

      {/* Historical Analytics */}
      <section className="card mb-8">
        <h2 className="text-xl font-bold text-neon mb-4">📊 Historical Analytics</h2>
        <div className="space-y-3 text-sm text-gray-400">
          <p>
            We track frequency data, gap analysis, and sum distributions for all games. 
            These are <strong>interesting data visualizations</strong>, not predictive tools.
          </p>
          <div className="p-3 bg-dark-700 rounded-lg border border-gold/10">
            <p className="text-gold font-semibold text-sm">🧠 The Gambler&apos;s Fallacy</p>
            <p className="mt-1">
              &quot;Number 42 hasn&apos;t appeared in 50 draws — it&apos;s due!&quot; This is false. 
              Each draw is independent. The ball doesn&apos;t remember where it landed last time. 
              A number that hasn&apos;t appeared in 100 draws has the exact same probability on the 
              next draw as a number that appeared yesterday.
            </p>
          </div>
          <p>
            We label all our analytics honestly. Frequency charts are fun to look at. 
            Don&apos;t bet your rent on them.
          </p>
        </div>
      </section>

      {/* Problem Gambling */}
      <section className="card mb-8 border-gold/20">
        <h2 className="text-xl font-bold text-gold mb-4">🤝 Play Responsibly</h2>
        <div className="space-y-3 text-sm text-gray-400">
          <p>
            If you or someone you know has a gambling problem, please reach out:
          </p>
          <ul className="space-y-2">
            <li>
              <strong className="text-white">National Problem Gambling Helpline:</strong>{' '}
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
        <Link href="/" className="inline-block px-6 py-3 rounded-lg bg-neon/20 text-neon border border-neon/30 font-bold hover:bg-neon/30 transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
