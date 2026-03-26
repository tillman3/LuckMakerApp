import { getAllGames } from '@/lib/games';
import { calculateEV, calculateBreakevenJackpot } from '@/lib/ev-calculator';
import { GameCard } from '@/components/GameCard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Games & EV Calculator — Luck Maker 3000',
  description: 'Expected value calculations for Powerball, Mega Millions, Lotto Texas, Cash Five, and more. See which games are worth playing.',
};

const DEFAULT_JACKPOTS: Record<string, number> = {
  powerball: 200_000_000,
  mega_millions: 350_000_000,
  lotto_texas: 7_500_000,
  texas_two_step: 200_000,
  cash_five: 25_000,
  pick3: 500,
  daily4: 5_000,
  all_or_nothing: 250_000,
};

export default function GamesPage() {
  const games = getAllGames();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">
        🎰 All Games — <span className="text-neon">Expected Value</span>
      </h1>
      <p className="text-gray-400 mb-8">
        Real-time EV calculations for every supported game. Green means the math is in your favor (rare!). 
        Red means the house edge is working as designed.
      </p>

      {/* EV Explainer */}
      <div className="card bg-dark-700/50 border-neon/10 mb-8">
        <h2 className="font-bold text-neon mb-2">📐 What is Expected Value?</h2>
        <p className="text-sm text-gray-400">
          Expected Value (EV) is the average amount you&apos;d win (or lose) per ticket if you played 
          millions of times. We factor in: jackpot size, all prize tiers, odds, federal tax (37%), 
          lump sum discount (~60%), and estimated ticket sales for split probability. 
          <span className="text-gold"> Texas has no state income tax</span>, which helps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map(game => {
          const jackpot = DEFAULT_JACKPOTS[game.id] || 0;
          const ev = calculateEV(game, jackpot);
          const breakeven = calculateBreakevenJackpot(game);
          
          return (
            <GameCard 
              key={game.id}
              game={game}
              jackpot={jackpot}
              ev={ev}
              breakeven={breakeven}
            />
          );
        })}
      </div>
    </div>
  );
}
