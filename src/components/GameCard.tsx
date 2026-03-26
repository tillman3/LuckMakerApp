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
  const cardBorder = ev.isPositiveEV ? 'border-neon/15 hover:border-neon/30' : 'hover:border-gold/15';

  return (
    <Link href={`/games/${game.id}`} className={`glass-card group ${cardBorder} ${ev.isPositiveEV ? 'glow-neon' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-black text-base sm:text-lg text-white group-hover:text-gold transition-colors duration-300 tracking-tight">{game.name}</h3>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.03] text-gray-600 uppercase tracking-wider">
            {game.state}
          </span>
        </div>
        <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider ${evBadge}`}>
          {ev.recommendation}
        </span>
      </div>

      {/* Jackpot */}
      <div className="mb-5">
        <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1">Current Jackpot</div>
        <div className="jackpot-amount text-2xl sm:text-3xl font-black tracking-tight">{formatCurrency(jackpot)}</div>
      </div>

      {/* EV */}
      <div className="flex items-end gap-5 mb-4">
        <div>
          <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-0.5">Expected Value</div>
          <div className={`text-lg font-black ${evColor}`}>
            {ev.netEV >= 0 ? '+' : ''}{formatCurrency(ev.netEV)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-0.5">Per ${game.ticketCost} ticket</div>
          <div className="text-sm text-gray-500 font-medium">{formatOdds(game.jackpotOdds)}</div>
        </div>
      </div>

      {/* Breakeven bar */}
      <div className="mb-4">
        <div className="progress-bar">
          <div 
            className={`progress-bar-fill ${Math.min(100, (jackpot / breakeven) * 100) >= 100 ? 'bg-neon' : 'bg-gold/50'}`}
            style={{ width: `${Math.min(100, (jackpot / breakeven) * 100)}%` }}
          />
        </div>
        <div className="text-[10px] text-gray-600 mt-1.5 font-medium">
          +EV breakeven: {formatCurrency(breakeven)}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between">
        <div className="text-[11px] text-gray-600 font-medium">
          {game.drawDays.join(', ')}
          {game.drawTimes.length > 1 && ` · ${game.drawTimes.length}x daily`}
        </div>
        {(game.id === 'powerball' || game.id === 'mega_millions' || game.id === 'lotto_texas') && (
          <span className="text-[11px] text-gold/40 group-hover:text-gold/70 transition-colors font-semibold">
            🎟️ Buy
          </span>
        )}
      </div>
    </Link>
  );
}
