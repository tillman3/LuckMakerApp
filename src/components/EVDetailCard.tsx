import { GameConfig } from '@/lib/games';
import { EVResult, formatCurrency, formatOdds } from '@/lib/ev-calculator';

interface EVDetailCardProps {
  game: GameConfig;
  jackpot: number;
  ev: EVResult;
  breakeven: number;
}

export function EVDetailCard({ game, jackpot, ev, breakeven }: EVDetailCardProps) {
  const progressToBreakeven = Math.min(100, (jackpot / breakeven) * 100);
  
  return (
    <div className={`glass-card ${ev.isPositiveEV ? 'glow-neon border-neon/20' : ''}`}>
      <h2 className="text-lg sm:text-xl font-black mb-4">📐 Expected Value Analysis</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <div className="text-xs text-gray-500">Current Jackpot</div>
          <div className="text-lg sm:text-xl font-black jackpot-amount">{formatCurrency(jackpot)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Lump Sum (est.)</div>
          <div className="text-base sm:text-lg font-bold text-gray-300">{formatCurrency(ev.lumpSum)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">After Tax (est.)</div>
          <div className="text-base sm:text-lg font-bold text-gray-300">{formatCurrency(ev.jackpotAfterTax)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Net EV / Ticket</div>
          <div className={`text-lg sm:text-xl font-black ${ev.isPositiveEV ? 'text-neon' : 'text-danger'}`}>
            {ev.netEV >= 0 ? '+' : ''}{formatCurrency(ev.netEV)}
          </div>
        </div>
      </div>

      {/* Breakeven Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Progress to +EV</span>
          <span className="text-gray-400">{formatCurrency(breakeven)}</span>
        </div>
        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              progressToBreakeven >= 100 ? 'bg-neon' : 'bg-gold/60'
            }`}
            style={{ width: `${Math.min(progressToBreakeven, 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {progressToBreakeven >= 100 
            ? '🎉 This jackpot has crossed the +EV threshold!' 
            : `${progressToBreakeven.toFixed(1)}% of the way to positive expected value`
          }
        </div>
      </div>

      {/* Tax breakdown */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 p-3 bg-white/[0.02] rounded-xl border border-white/5 text-sm">
        <div className="text-center">
          <div className="text-xs text-gray-500">Federal Tax</div>
          <div className="text-gray-300 font-bold">37%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">State Tax (TX)</div>
          <div className="text-neon font-bold">0% 🎉</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Lump Sum</div>
          <div className="text-gray-300 font-bold">~60%</div>
        </div>
      </div>
    </div>
  );
}
