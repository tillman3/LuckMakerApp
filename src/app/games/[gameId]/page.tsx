import { notFound } from 'next/navigation';
import { getGameConfig, GAMES } from '@/lib/games';
import { calculateEV, calculateBreakevenJackpot, formatCurrency, formatOdds } from '@/lib/ev-calculator';
import { EVDetailCard } from '@/components/EVDetailCard';
import { PrizeTable } from '@/components/PrizeTable';
import { getDb } from '@/lib/db';
import Link from 'next/link';
import type { Metadata } from 'next';

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

function getLiveJackpot(gameId: string): number {
  try {
    const db = getDb();
    const row = db.prepare(
      'SELECT annuitized FROM jackpots WHERE game_id = ? ORDER BY updated_at DESC LIMIT 1'
    ).get(gameId) as any;
    if (row?.annuitized && row.annuitized > 0) return row.annuitized;
  } catch {}
  return DEFAULT_JACKPOTS[gameId] || 0;
}

export function generateStaticParams() {
  return Object.keys(GAMES).map(gameId => ({ gameId }));
}

export function generateMetadata({ params }: { params: { gameId: string } }): Metadata {
  const game = getGameConfig(params.gameId);
  if (!game) return { title: 'Game Not Found' };
  return {
    title: `${game.name} — EV Calculator & Analytics | Luck Maker 3000`,
    description: `Expected value calculator for ${game.name}. Current odds: ${formatOdds(game.jackpotOdds)}. ${game.description}`,
  };
}

export default function GameDetailPage({ params }: { params: { gameId: string } }) {
  const game = getGameConfig(params.gameId);
  if (!game) notFound();

  const jackpot = getLiveJackpot(game.id);
  const ev = calculateEV(game, jackpot);
  const breakeven = calculateBreakevenJackpot(game);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600 mb-6 font-medium animate-fade-in-up">
        <Link href="/games" className="hover:text-neon transition-colors">Games</Link>
        <span className="mx-2 text-gray-700">/</span>
        <span className="text-gray-400">{game.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-5 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">{game.name}</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">{game.description}</p>
        </div>
        <div className={`text-center px-6 py-4 rounded-2xl border flex-shrink-0 ${
          ev.recommendation === 'PLAY' ? 'bg-neon/8 border-neon/20' :
          ev.recommendation === 'BORDERLINE' ? 'bg-gold/8 border-gold/20' :
          'bg-danger/8 border-danger/15'
        }`}>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Recommendation</div>
          <div className={`text-3xl font-black ${
            ev.recommendation === 'PLAY' ? 'text-neon' :
            ev.recommendation === 'BORDERLINE' ? 'text-gold' :
            'text-danger'
          }`}>
            {ev.recommendation}
          </div>
        </div>
      </div>

      {/* EV Detail */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <EVDetailCard game={game} jackpot={jackpot} ev={ev} breakeven={breakeven} />
      </div>

      {/* Prize Table */}
      <div className="glass-card mt-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="text-lg sm:text-xl font-black mb-5 tracking-tight">Prize Structure & Odds</h2>
        <PrizeTable ev={ev} game={game} jackpot={jackpot} />
      </div>

      {/* Game Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mt-6">
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-black text-lg mb-4 tracking-tight">📋 Game Details</h3>
          <div className="space-y-3 text-sm">
            {[
              { label: 'Pick', value: `${game.mainNumbers} from 1-${game.mainMax}${game.bonusNumbers > 0 ? ` + ${game.bonusNumbers} from 1-${game.bonusMax}` : ''}` },
              { label: 'Ticket Cost', value: `$${game.ticketCost}` },
              { label: 'Jackpot Odds', value: formatOdds(game.jackpotOdds) },
              { label: 'Draw Days', value: game.drawDays.join(', ') },
              { label: 'Draw Times', value: game.drawTimes.join(', ') },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-white/[0.03] last:border-0">
                <span className="text-gray-500 font-medium">{item.label}</span>
                <span className="text-white font-semibold">{item.value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-1.5">
              <span className="text-gray-500 font-medium">Current Jackpot</span>
              <span className="jackpot-amount font-black text-lg">{formatCurrency(jackpot)}</span>
            </div>
          </div>
        </div>

        <div className="glass-card animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <h3 className="font-black text-lg mb-4 tracking-tight">🎯 Quick Actions</h3>
          <div className="space-y-3">
            <Link href={`/generator?game=${game.id}`}
              className="block w-full text-center py-3.5 rounded-xl bg-neon/8 text-neon border border-neon/15 hover:bg-neon/15 transition-all font-bold text-sm">
              🎲 Generate Smart Numbers
            </Link>
            <Link href="/pool"
              className="block w-full text-center py-3.5 rounded-xl bg-gold/8 text-gold border border-gold/15 hover:bg-gold/15 transition-all font-bold text-sm">
              👥 Start a Pool
            </Link>
            <Link href={`/results`}
              className="block w-full text-center py-3.5 rounded-xl bg-white/[0.03] text-gray-400 border border-white/[0.04] hover:bg-white/[0.06] transition-all text-sm font-medium">
              View Recent Results
            </Link>
            <Link href={`/tracker`}
              className="block w-full text-center py-3.5 rounded-xl bg-white/[0.03] text-gray-400 border border-white/[0.04] hover:bg-white/[0.06] transition-all text-sm font-medium">
              Track Your Numbers
            </Link>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-10 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="text-gold font-bold">⚠️ Disclaimer:</span> Expected value calculations are estimates
          based on current jackpot, published odds, and standard tax assumptions (37% federal, 0% state
          for TX, 60% lump sum factor). Actual results depend on ticket sales, jackpot splits, and
          individual tax situations. This is math, not a recommendation. Play responsibly.
        </p>
      </div>
    </div>
  );
}
