import { GameConfig } from '@/lib/games';
import { EVResult, formatCurrency, formatOdds } from '@/lib/ev-calculator';

interface PrizeTableProps {
  ev: EVResult;
  game: GameConfig;
  jackpot: number;
}

export function PrizeTable({ ev, game, jackpot }: PrizeTableProps) {
  return (
    <div className="overflow-x-auto -mx-1.5">
      <table className="premium-table">
        <thead>
          <tr>
            <th className="text-left">Match</th>
            <th className="text-right">Prize</th>
            <th className="text-right hidden sm:table-cell">Odds</th>
            <th className="text-right hidden sm:table-cell">Probability</th>
            <th className="text-right">EV Contribution</th>
          </tr>
        </thead>
        <tbody>
          {ev.breakdown.map((row, i) => (
            <tr key={i}>
              <td className="text-white font-semibold">{row.match}</td>
              <td className="text-right text-gold font-semibold">
                {game.prizeTable[i]?.prize === 'jackpot' 
                  ? formatCurrency(jackpot) + ' *' 
                  : formatCurrency(row.prize)
                }
              </td>
              <td className="text-right text-gray-500 hidden sm:table-cell">{formatOdds(row.odds)}</td>
              <td className="text-right text-gray-500 hidden sm:table-cell">
                {(row.probability * 100).toFixed(6)}%
              </td>
              <td className={`text-right font-semibold ${
                row.contribution > 0.01 ? 'text-neon' : 'text-gray-600'
              }`}>
                {formatCurrency(row.contribution)}
              </td>
            </tr>
          ))}
          {/* Total row */}
          <tr className="border-t-2 border-white/[0.08]">
            <td className="text-white font-black" colSpan={4}>
              Total EV per ${game.ticketCost} ticket
            </td>
            <td className={`text-right font-black ${ev.isPositiveEV ? 'text-neon' : 'text-danger'}`}>
              {formatCurrency(ev.expectedValue)}
            </td>
          </tr>
          <tr>
            <td className="text-gray-600" colSpan={4}>Ticket cost</td>
            <td className="text-right text-gray-500">-{formatCurrency(game.ticketCost)}</td>
          </tr>
          <tr className="border-t border-white/[0.05]">
            <td className="text-white font-black" colSpan={4}>Net EV</td>
            <td className={`text-right font-black text-lg ${ev.isPositiveEV ? 'text-neon' : 'text-danger'}`}>
              {ev.netEV >= 0 ? '+' : ''}{formatCurrency(ev.netEV)}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="text-[11px] text-gray-600 mt-4 px-4">
        * Jackpot prize shown is advertised amount. EV calculated using lump sum (60%) after federal tax (37%).
      </p>
    </div>
  );
}
