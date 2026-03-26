import { GameConfig } from '@/lib/games';
import { EVResult, formatCurrency, formatOdds } from '@/lib/ev-calculator';

interface PrizeTableProps {
  ev: EVResult;
  game: GameConfig;
  jackpot: number;
}

export function PrizeTable({ ev, game, jackpot }: PrizeTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left py-2 text-gray-400 font-medium">Match</th>
            <th className="text-right py-2 text-gray-400 font-medium">Prize</th>
            <th className="text-right py-2 text-gray-400 font-medium">Odds</th>
            <th className="text-right py-2 text-gray-400 font-medium">Probability</th>
            <th className="text-right py-2 text-gray-400 font-medium">EV Contribution</th>
          </tr>
        </thead>
        <tbody>
          {ev.breakdown.map((row, i) => (
            <tr key={i} className="border-b border-white/5">
              <td className="py-2 text-white font-medium">{row.match}</td>
              <td className="py-2 text-right text-gold">
                {game.prizeTable[i]?.prize === 'jackpot' 
                  ? formatCurrency(jackpot) + ' *' 
                  : formatCurrency(row.prize)
                }
              </td>
              <td className="py-2 text-right text-gray-400">{formatOdds(row.odds)}</td>
              <td className="py-2 text-right text-gray-400">
                {(row.probability * 100).toFixed(6)}%
              </td>
              <td className={`py-2 text-right font-medium ${
                row.contribution > 0.01 ? 'text-neon' : 'text-gray-500'
              }`}>
                {formatCurrency(row.contribution)}
              </td>
            </tr>
          ))}
          {/* Total row */}
          <tr className="border-t-2 border-white/10">
            <td className="py-2 text-white font-bold" colSpan={4}>
              Total EV per ${game.ticketCost} ticket
            </td>
            <td className={`py-2 text-right font-bold ${ev.isPositiveEV ? 'text-neon' : 'text-danger'}`}>
              {formatCurrency(ev.expectedValue)}
            </td>
          </tr>
          <tr>
            <td className="py-1 text-gray-500" colSpan={4}>Ticket cost</td>
            <td className="py-1 text-right text-gray-400">-{formatCurrency(game.ticketCost)}</td>
          </tr>
          <tr className="border-t border-white/5">
            <td className="py-2 text-white font-bold" colSpan={4}>Net EV</td>
            <td className={`py-2 text-right font-bold text-lg ${ev.isPositiveEV ? 'text-neon' : 'text-danger'}`}>
              {ev.netEV >= 0 ? '+' : ''}{formatCurrency(ev.netEV)}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="text-xs text-gray-600 mt-3">
        * Jackpot prize shown is advertised amount. EV calculated using lump sum (60%) after federal tax (37%).
      </p>
    </div>
  );
}
