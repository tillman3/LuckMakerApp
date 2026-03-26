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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <Link href="/games" className="hover:text-neon transition-colors">Games</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-300">{game.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{game.name}</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">{game.description}</p>
        </div>
        <div className={`text-center px-6 py-3 rounded-xl border flex-shrink-0 ${
          ev.recommendation === 'PLAY' ? 'bg-neon/10 border-neon/30' :
          ev.recommendation === 'BORDERLINE' ? 'bg-gold/10 border-gold/30' :
          'bg-danger/10 border-danger/20'
        }`}>
          <div className="text-xs text-gray-400">Recommendation</div>
          <div className={`text-2xl font-black ${
            ev.recommendation === 'PLAY' ? 'text-neon' :
            ev.recommendation === 'BORDERLINE' ? 'text-gold' :
            'text-danger'
          }`}>
            {ev.recommendation}
          </div>
        </div>
      </div>

      {/* EV Detail */}
      <EVDetailCard game={game} jackpot={jackpot} ev={ev} breakeven={breakeven} />

      {/* Prize Table */}
      <div className="glass-card mt-6">
        <h2 className="text-lg sm:text-xl font-black mb-4">Prize Structure & Odds</h2>
        <PrizeTable ev={ev} game={game} jackpot={jackpot} />
      </div>

      {/* Game Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="glass-card">
          <h3 className="font-black text-lg mb-3">📋 Game Details</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Pick</span>
              <span className="text-white">{game.mainNumbers} from 1-{game.mainMax}
                {game.bonusNumbers > 0 && ` + ${game.bonusNumbers} from 1-${game.bonusMax}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Ticket Cost</span>
              <span className="text-white">${game.ticketCost}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Jackpot Odds</span>
              <span className="text-white">{formatOdds(game.jackpotOdds)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Draw Days</span>
              <span className="text-white">{game.drawDays.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Draw Times</span>
              <span className="text-white">{game.drawTimes.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Current Jackpot</span>
              <span className="jackpot-amount font-bold">{formatCurrency(jackpot)}</span>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h3 className="font-black text-lg mb-3">🎯 Quick Actions</h3>
          <div className="space-y-3">
            <Link href={`/generator?game=${game.id}`}
              className="block w-full text-center py-3 rounded-xl bg-neon/10 text-neon border border-neon/20 hover:bg-neon/20 transition-all font-bold text-sm">
              🎲 Generate Smart Numbers
            </Link>
            <Link href="/pool"
              className="block w-full text-center py-3 rounded-xl bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-all font-bold text-sm">
              👥 Start a Pool
            </Link>
            <Link href={`/results`}
              className="block w-full text-center py-3 rounded-xl bg-white/5 text-gray-300 border border-white/5 hover:bg-white/10 transition-all text-sm">
              View Recent Results
            </Link>
            <Link href={`/tracker`}
              className="block w-full text-center py-3 rounded-xl bg-white/5 text-gray-300 border border-white/5 hover:bg-white/10 transition-all text-sm">
              Track Your Numbers
            </Link>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <p className="text-xs text-gray-500">
          <span className="text-gold">⚠️ Disclaimer:</span> Expected value calculations are estimates
          based on current jackpot, published odds, and standard tax assumptions (37% federal, 0% state
          for TX, 60% lump sum factor). Actual results depend on ticket sales, jackpot splits, and
          individual tax situations. This is math, not a recommendation. Play responsibly.
        </p>
      </div>
    </div>
  );
}
