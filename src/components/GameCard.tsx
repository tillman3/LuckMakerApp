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

  return (
    <Link href={`/games/${game.id}`} className="glass-card group block">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-base text-bright group-hover:text-gold transition-colors">{game.name}</h3>
          <span className="text-[11px] text-muted">{game.drawDays.join(', ')}</span>
        </div>
        <span className={evBadge}>{ev.recommendation}</span>
      </div>

      {/* Jackpot — the hero element */}
      <div className="mb-4">
        <div className="text-[11px] font-medium text-muted uppercase tracking-wider mb-1">Jackpot</div>
        <div className="jackpot-amount text-2xl sm:text-3xl font-black">{formatCurrency(jackpot)}</div>
      </div>

      {/* EV data — tabular, clean */}
      <div className="flex gap-6 mb-4">
        <div>
          <div className="text-[11px] text-muted uppercase tracking-wider mb-0.5">EV / Ticket</div>
          <div className={`text-base font-bold font-tabular ${ev.isPositiveEV ? 'ev-positive' : 'ev-negative'}`}>
            {ev.netEV >= 0 ? '+' : ''}{formatCurrency(ev.netEV)}
          </div>
        </div>
        <div>
          <div className="text-[11px] text-muted uppercase tracking-wider mb-0.5">Odds</div>
          <div className="text-base font-medium font-tabular text-body">{formatOdds(game.jackpotOdds)}</div>
        </div>
      </div>

      {/* Breakeven — subtle */}
      <div className="text-[11px] text-muted">
        +EV at {formatCurrency(breakeven)}
      </div>
    </Link>
  );
}
