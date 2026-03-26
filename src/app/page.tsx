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
    
    const jpRows = db.prepare('SELECT * FROM jackpots').all() as any[];
    for (const jp of jpRows) {
      jackpots[jp.game_id] = { 
        amount: jp.annuitized || 0, 
        nextDraw: jp.next_draw_date || '',
        cashValue: jp.cash_value || 0
      };
    }
    
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
      {/* Hero */}
      <HeroSection latestDraws={latestDraws} jackpots={jackpots} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        
        {/* Quick Stats — 4 compact cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { value: '8', label: 'Games Tracked', color: 'text-neon' },
            { value: '36K+', label: 'Historical Draws', color: 'text-gold' },
            { value: 'Live', label: 'EV Calculations', color: 'text-bright' },
            { value: 'Free', label: 'Core Features', color: 'text-neon' },
          ].map((stat, i) => (
            <div key={i} className="glass-card text-center py-5">
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-[11px] text-muted mt-1 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Games Grid */}
        <div className="mb-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">
              All Games — <span className="text-gold">Live EV</span>
            </h2>
            <Link href="/games" className="text-xs text-muted hover:text-gold transition-colors">View all →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => {
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
        </div>

        {/* Features — clean grid, no emoji overload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {[
            { href: '/generator', title: 'Smart Generator', desc: 'Anti-popular numbers that reduce jackpot splitting. Wheeling systems with coverage guarantees.', icon: '🎲' },
            { href: '/results', title: 'Live Results', desc: 'Every draw, every game. Frequency charts, gap analysis, and sum distributions.', icon: '📊' },
            { href: '/tracker', title: 'Number Tracker', desc: 'Save your numbers, auto-check against results. Track spending vs winnings over time.', icon: '🎯' },
            { href: '/pool', title: 'Pool Manager', desc: 'Run your office pool with AI-verified ticket photos, payment tracking, and auto-splits.', icon: '👥' },
          ].map((feature) => (
            <Link key={feature.href} href={feature.href} className="glass-card group flex gap-4 items-start">
              <span className="text-2xl flex-shrink-0 mt-0.5">{feature.icon}</span>
              <div>
                <h3 className="font-bold text-sm text-bright group-hover:text-gold transition-colors mb-1">{feature.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{feature.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom row — alerts + promos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="md:col-span-1">
            <JackpotAlerts />
          </div>
          <Link href="/calculator" className="glass-card group">
            <h3 className="font-bold text-sm text-gold mb-2">What If I Win?</h3>
            <p className="text-xs text-muted mb-3">
              See exactly what you&apos;d take home after federal + state taxes. Lump sum vs annuity.
            </p>
            <span className="text-[11px] font-medium text-gold/60 group-hover:text-gold transition-colors">Try calculator →</span>
          </Link>
          <Link href="/pricing" className="glass-card group">
            <h3 className="font-bold text-sm text-neon mb-2">Go Pro</h3>
            <p className="text-xs text-muted mb-3">
              Unlimited generations, wheeling systems, auto-alerts, and spending tracker.
            </p>
            <span className="text-[11px] font-medium text-neon/60 group-hover:text-neon transition-colors">View plans →</span>
          </Link>
        </div>

        {/* Disclaimer — understated */}
        <div className="text-center py-8">
          <p className="text-xs text-muted max-w-lg mx-auto leading-relaxed">
            <span className="text-gold/70 font-medium">Real talk:</span> Lottery is entertainment. 
            The house always has an edge. We help you understand that edge and play smarter — not predict winners.
          </p>
        </div>
      </div>
    </div>
  );
}
