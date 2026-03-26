import Link from 'next/link';
import { GameConfig } from '@/lib/games';
import { EVResult, formatCurrency, formatOdds } from '@/lib/ev-calculator';

interface GameCardProps {
  game: GameConfig;
  jackpot: number;
  ev: EVResult;
  breakeven: number;
  nextDraw?: string;
}

export function GameCard({ game, jackpot, ev, breakeven, nextDraw }: GameCardProps) {
  const evBadge = ev.recommendation === 'PLAY' ? 'ev-badge-play' :
    ev.recommendation === 'BORDERLINE' ? 'ev-badge-borderline' :
    'ev-badge-skip';

  const evColor = ev.isPositiveEV ? 'text-neon text-glow-neon' : 'text-danger';
  const cardGlow = ev.isPositiveEV ? 'glow-neon' : '';

  return (
    <Link href={`/games/${game.id}`} className={`glass-card group ${cardGlow}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg text-white group-hover:text-gold transition-colors">{game.name}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500">
            {game.state}
          </span>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${evBadge}`}>
          {ev.recommendation}
        </span>
      </div>

      {/* Jackpot */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 uppercase tracking-wider">Current Jackpot</div>
        <div className="jackpot-amount text-2xl sm:text-3xl font-black">{formatCurrency(jackpot)}</div>
      </div>

      {/* EV */}
      <div className="flex items-center gap-4 mb-3">
        <div>
          <div className="text-xs text-gray-500">Expected Value</div>
          <div className={`text-lg font-bold ${evColor}`}>
            {ev.netEV >= 0 ? '+' : ''}{formatCurrency(ev.netEV)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Per ${game.ticketCost} ticket</div>
          <div className="text-sm text-gray-400">{formatOdds(game.jackpotOdds)}</div>
        </div>
      </div>

      {/* Breakeven */}
      <div className="text-xs text-gray-600">
        +EV breakeven: {formatCurrency(breakeven)}
      </div>

      {/* Draw schedule + Affiliate CTA */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {game.drawDays.join(', ')}
          {game.drawTimes.length > 1 && ` (${game.drawTimes.length}x daily)`}
        </div>
        {/* Affiliate placeholder */}
        {(game.id === 'powerball' || game.id === 'mega_millions' || game.id === 'lotto_texas') && (
          <span className="text-xs text-gold/50 hover:text-gold transition-colors">
            🎟️ Buy Tickets
          </span>
        )}
      </div>
    </Link>
  );
}
