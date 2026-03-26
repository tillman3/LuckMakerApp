import { getAllGames } from '@/lib/games';
import { calculateEV, calculateBreakevenJackpot } from '@/lib/ev-calculator';
import { GameCard } from '@/components/GameCard';
import { getDb } from '@/lib/db';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Games & EV Calculator',
  description: 'Live expected value calculations for Powerball, Mega Millions, Lotto Texas, Cash Five, and more. See which games are worth playing right now.',
};

export const dynamic = 'force-dynamic';

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

function getLiveJackpots(): Record<string, { amount: number; nextDraw: string }> {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM jackpots').all() as any[];
    const result: Record<string, { amount: number; nextDraw: string }> = {};
    for (const r of rows) {
      result[r.game_id] = { amount: r.annuitized, nextDraw: r.next_draw_date };
    }
    return result;
  } catch {
    return {};
  }
}

export default function GamesPage() {
  const games = getAllGames();
  const liveJackpots = getLiveJackpots();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight">
          All Games — <span className="text-gold text-glow-gold">Live EV</span>
        </h1>
        <p className="text-gray-500 text-sm sm:text-base max-w-xl">
          Real-time EV calculations for every game. Green = math in your favor (rare!). 
          Red = house edge working as designed.
        </p>
      </div>

      {/* EV Explainer */}
      <div className="glass-card border-neon/8 mb-10 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <h2 className="font-black text-neon mb-3">📐 What is Expected Value?</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Expected Value (EV) is the average amount you&apos;d win or lose per ticket over millions of plays. 
          We factor in: jackpot size, all prize tiers, odds, federal tax (37%), 
          lump sum discount (~60%), and estimated ticket sales for split probability. 
          <span className="text-gold font-semibold"> Texas has no state income tax</span>, which helps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {games.map((game, i) => {
          const jackpot = liveJackpots[game.id]?.amount || DEFAULT_JACKPOTS[game.id] || 0;
          const ev = calculateEV(game, jackpot);
          const breakeven = calculateBreakevenJackpot(game);
          
          return (
            <div key={game.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <GameCard 
                game={game}
                jackpot={jackpot}
                ev={ev}
                breakeven={breakeven}
                nextDraw={liveJackpots[game.id]?.nextDraw}
              />
            </div>
          );
        })}
      </div>

      {/* AD SLOT */}
      <div className="ad-slot mt-10">{/* AD SLOT: below_games */}Advertisement</div>
    </div>
  );
}
