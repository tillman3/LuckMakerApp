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
    <div className={`glass-card ${ev.isPositiveEV ? 'glow-neon border-neon/15' : ''}`}>
      <h2 className="text-lg sm:text-xl font-black mb-6 tracking-tight">📐 Expected Value Analysis</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <div className="glass-card-stat">
          <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">Current Jackpot</div>
          <div className="text-lg sm:text-xl font-black jackpot-amount mt-1">{formatCurrency(jackpot)}</div>
        </div>
        <div className="glass-card-stat">
          <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">Lump Sum (est.)</div>
          <div className="text-base sm:text-lg font-bold text-gray-300 mt-1">{formatCurrency(ev.lumpSum)}</div>
        </div>
        <div className="glass-card-stat">
          <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">After Tax (est.)</div>
          <div className="text-base sm:text-lg font-bold text-gray-300 mt-1">{formatCurrency(ev.jackpotAfterTax)}</div>
        </div>
        <div className="glass-card-stat">
          <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">Net EV / Ticket</div>
          <div className={`text-lg sm:text-xl font-black mt-1 ${ev.isPositiveEV ? 'text-neon' : 'text-danger'}`}>
            {ev.netEV >= 0 ? '+' : ''}{formatCurrency(ev.netEV)}
          </div>
        </div>
      </div>

      {/* Breakeven Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500 font-medium">Progress to +EV</span>
          <span className="text-gray-500 font-medium">{formatCurrency(breakeven)}</span>
        </div>
        <div className="progress-bar" style={{ height: '8px' }}>
          <div 
            className={`progress-bar-fill ${
              progressToBreakeven >= 100 ? 'bg-neon' : 'bg-gold/50'
            }`}
            style={{ width: `${Math.min(progressToBreakeven, 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-600 mt-2 font-medium">
          {progressToBreakeven >= 100 
            ? '🎉 This jackpot has crossed the +EV threshold!' 
            : `${progressToBreakeven.toFixed(1)}% of the way to positive expected value`
          }
        </div>
      </div>

      {/* Tax breakdown */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/[0.04]">
        <div className="text-center">
          <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">Federal Tax</div>
          <div className="text-gray-300 font-black text-lg mt-1">37%</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">State Tax (TX)</div>
          <div className="text-neon font-black text-lg mt-1">0% 🎉</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold">Lump Sum</div>
          <div className="text-gray-300 font-black text-lg mt-1">~60%</div>
        </div>
      </div>
    </div>
  );
}
