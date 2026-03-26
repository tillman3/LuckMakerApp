import Link from 'next/link';
import { getAllGames } from '@/lib/games';
import { calculateEV, calculateBreakevenJackpot, formatCurrency, formatOdds } from '@/lib/ev-calculator';
import { GameCard } from '@/components/GameCard';
import { HeroSection } from '@/components/HeroSection';
import { JackpotAlerts } from '@/components/JackpotAlerts';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

function getJackpotData() {
  try {
    const db = getDb();
    const jackpots: Record<string, { amount: number; nextDraw: string; cashValue: number }> = {};
    const latestDraws: Record<string, { numbers: number[]; bonus: number | null; date: string }> = {};
    
    // Get jackpots
    const jpRows = db.prepare('SELECT * FROM jackpots').all() as any[];
    for (const jp of jpRows) {
      jackpots[jp.game_id] = { 
        amount: jp.annuitized || 0, 
        nextDraw: jp.next_draw_date || '',
        cashValue: jp.cash_value || 0
      };
    }
    
    // Get latest draws for hero display
    for (const gameId of ['powerball', 'mega_millions']) {
      const row = db.prepare(
        'SELECT numbers, bonus_number, draw_date FROM draws WHERE game_id = ? ORDER BY draw_date DESC LIMIT 1'
      ).get(gameId) as any;
      if (row) {
        latestDraws[gameId] = {
          numbers: row.numbers.split(',').map(Number),
          bonus: row.bonus_number ? parseInt(row.bonus_number) : null,
          date: row.draw_date,
        };
      }
    }
    
    return { jackpots, latestDraws };
  } catch {
    return { jackpots: {}, latestDraws: {} };
  }
}

// Default jackpots (fallback if DB empty)
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

export default function Dashboard() {
  const games = getAllGames();
  const { jackpots, latestDraws } = getJackpotData();

  return (
    <div className="min-h-screen">
      {/* HERO — Slot Machine Style */}
      <HeroSection 
        latestDraws={latestDraws}
        jackpots={jackpots}
      />

      {/* AD SLOT: below_hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 my-4">
        <div className="ad-slot">Advertisement</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="glass-card text-center">
            <div className="text-3xl font-bold text-neon text-glow-neon">8</div>
            <div className="text-sm text-gray-400">Games Tracked</div>
          </div>
          <div className="glass-card text-center">
            <div className="text-3xl font-bold text-gold text-glow-gold">80K+</div>
            <div className="text-sm text-gray-400">Historical Draws</div>
          </div>
          <div className="glass-card text-center">
            <div className="text-3xl font-bold text-white">Live</div>
            <div className="text-sm text-gray-400">EV Calculations</div>
          </div>
          <div className="glass-card text-center">
            <div className="text-3xl font-bold text-neon text-glow-neon">Free</div>
            <div className="text-sm text-gray-400">Core Features</div>
          </div>
        </div>

        {/* Games Grid */}
        <h2 className="text-2xl font-bold mb-6">
          🎰 All Games — <span className="text-gold text-glow-gold">Live EV</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {games.map((game, i) => {
            const jackpot = jackpots[game.id]?.amount || DEFAULT_JACKPOTS[game.id] || 0;
            const ev = calculateEV(game, jackpot);
            const breakeven = calculateBreakevenJackpot(game);
            
            return (
              <GameCard 
                key={game.id}
                game={game}
                jackpot={jackpot}
                ev={ev}
                breakeven={breakeven}
                nextDraw={jackpots[game.id]?.nextDraw}
              />
            );
          })}
        </div>

        {/* AD SLOT: between_games_and_features */}
        <div className="ad-slot mb-6">Advertisement</div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Link href="/generator" className="glass-card group cursor-pointer">
            <div className="text-3xl mb-3">🎲</div>
            <h3 className="text-lg font-bold text-white group-hover:text-neon transition-colors">Smart Generator</h3>
            <p className="text-sm text-gray-400 mt-2">
              Anti-popular numbers that reduce your chance of splitting. 
              Wheeling systems with coverage guarantees.
            </p>
          </Link>
          <Link href="/results" className="glass-card group cursor-pointer">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors">Analytics</h3>
            <p className="text-sm text-gray-400 mt-2">
              Frequency charts, gap analysis, sum distributions. 
              Interesting data — honestly labeled, not predictive.
            </p>
          </Link>
          <Link href="/tracker" className="glass-card group cursor-pointer">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-bold text-white group-hover:text-neon transition-colors">Number Tracker</h3>
            <p className="text-sm text-gray-400 mt-2">
              Save your regular numbers, auto-check against results. 
              Track spending vs winnings.
            </p>
          </Link>
          <Link href="/pool" className="glass-card group cursor-pointer">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-lg font-bold text-white group-hover:text-gold transition-colors">Pool Manager</h3>
            <p className="text-sm text-gray-400 mt-2">
              Run your office pool like a pro. Track who paid, manage tickets, split winnings.
            </p>
          </Link>
        </div>

        {/* Jackpot Alerts + Disclaimer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-1">
            <JackpotAlerts />
          </div>
          <div className="md:col-span-2 glass-card border-gold/10 flex items-center">
            <div>
              <h3 className="font-black text-sm text-gold mb-2">👥 Office Pool?</h3>
              <p className="text-sm text-gray-400 mb-3">
                Stop texting spreadsheets. Our Pool Manager tracks payments, stores ticket photos, 
                and calculates splits automatically.
              </p>
              <Link href="/pool" className="text-xs text-gold hover:underline font-bold">
                Create a pool →
              </Link>
            </div>
          </div>
        </div>

        {/* Honest disclaimer banner */}
        <div className="glass-card text-center border-gold/10">
          <p className="text-sm text-gray-400">
            <span className="text-gold font-semibold">⚠️ Real Talk:</span>{' '}
            Lottery is entertainment. The house always has an edge. Our EV calculator shows you exactly 
            how big that edge is — and the rare moments when it flips in your favor. 
            We help you play smarter, not predict winners.
          </p>
        </div>

        {/* AD SLOT: above_footer */}
        <div className="ad-slot mt-6">Advertisement</div>
      </div>
    </div>
  );
}
