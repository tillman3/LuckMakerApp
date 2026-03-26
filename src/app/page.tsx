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
      {/* HERO */}
      <HeroSection 
        latestDraws={latestDraws}
        jackpots={jackpots}
      />

      {/* AD SLOT: below_hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 my-4">
        <div className="ad-slot">Advertisement</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-12">
          {[
            { value: '8', label: 'Games Tracked', color: 'text-neon', glow: 'text-glow-neon' },
            { value: '80K+', label: 'Historical Draws', color: 'text-gold', glow: 'text-glow-gold' },
            { value: 'Live', label: 'EV Calculations', color: 'text-white', glow: '' },
            { value: 'Free', label: 'Core Features', color: 'text-neon', glow: 'text-glow-neon' },
          ].map((stat, i) => (
            <div key={i} className="glass-card-stat text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className={`text-2xl sm:text-3xl font-black ${stat.color} ${stat.glow}`}>{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Section divider */}
        <div className="section-divider" />

        {/* Games Grid */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
            All Games — <span className="text-gold text-glow-gold">Live EV</span>
          </h2>
          <p className="text-sm text-gray-500">Real-time expected value for every game we track.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-8">
          {games.map((game, i) => {
            const jackpot = jackpots[game.id]?.amount || DEFAULT_JACKPOTS[game.id] || 0;
            const ev = calculateEV(game, jackpot);
            const breakeven = calculateBreakevenJackpot(game);
            
            return (
              <div key={game.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <GameCard 
                  game={game}
                  jackpot={jackpot}
                  ev={ev}
                  breakeven={breakeven}
                  nextDraw={jackpots[game.id]?.nextDraw}
                />
              </div>
            );
          })}
        </div>

        {/* AD SLOT */}
        <div className="ad-slot mb-10">Advertisement</div>

        {/* Section divider */}
        <div className="section-divider" />

        {/* Features Section */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
            Tools & <span className="text-neon text-glow-neon">Features</span>
          </h2>
          <p className="text-sm text-gray-500">Everything you need to play smarter.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-12">
          {[
            { href: '/generator', icon: '🎲', title: 'Smart Generator', desc: 'Anti-popular numbers that reduce your chance of splitting. Wheeling systems with coverage guarantees.', color: 'neon' },
            { href: '/results', icon: '📊', title: 'Analytics', desc: 'Frequency charts, gap analysis, sum distributions. Interesting data — honestly labeled, not predictive.', color: 'gold' },
            { href: '/tracker', icon: '🎯', title: 'Number Tracker', desc: 'Save your regular numbers, auto-check against results. Track spending vs winnings.', color: 'neon' },
            { href: '/pool', icon: '👥', title: 'Pool Manager', desc: 'Run your office pool like a pro. Track who paid, manage tickets, split winnings.', color: 'gold' },
          ].map((feature, i) => (
            <Link key={feature.href} href={feature.href} className="glass-card-feature group cursor-pointer animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className={`text-base font-black text-white group-hover:text-${feature.color} transition-colors duration-300 mb-2`}>{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.desc}
              </p>
              <div className={`mt-4 text-xs font-bold text-${feature.color}/40 group-hover:text-${feature.color}/80 transition-colors`}>
                Explore →
              </div>
            </Link>
          ))}
        </div>

        {/* Jackpot Alerts + Promos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-8">
          <div className="md:col-span-1">
            <JackpotAlerts />
          </div>
          <Link href="/pool" className="glass-card border-gold/10 flex items-center group">
            <div>
              <h3 className="font-black text-sm text-gold mb-2 group-hover:text-glow-gold transition-all">👥 Office Pool?</h3>
              <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                Stop texting spreadsheets. AI-verified ticket photos, payment tracking, and auto-splits.
              </p>
              <span className="text-xs text-gold/60 font-bold group-hover:text-gold transition-colors">Create a pool →</span>
            </div>
          </Link>
          <Link href="/calculator" className="glass-card border-gold/10 flex items-center group">
            <div>
              <h3 className="font-black text-sm text-gold mb-2 group-hover:text-glow-gold transition-all">💰 What If I Win?</h3>
              <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                See exactly what you&apos;d take home after federal + state taxes. Lump sum vs annuity.
              </p>
              <span className="text-xs text-gold/60 font-bold group-hover:text-gold transition-colors">Try the calculator →</span>
            </div>
          </Link>
        </div>

        {/* Honest disclaimer */}
        <div className="glass-card text-center border-gold/10">
          <p className="text-sm text-gray-500">
            <span className="text-gold font-bold">⚠️ Real Talk:</span>{' '}
            Lottery is entertainment. The house always has an edge. Our EV calculator shows you exactly 
            how big that edge is — and the rare moments when it flips in your favor. 
            We help you play smarter, not predict winners.
          </p>
        </div>

        {/* AD SLOT */}
        <div className="ad-slot mt-8">Advertisement</div>
      </div>
    </div>
  );
}
