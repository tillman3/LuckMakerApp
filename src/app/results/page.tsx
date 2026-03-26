import { getDb } from '@/lib/db';
import { GAMES } from '@/lib/games';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Latest Lottery Results — All Games',
  description: 'Latest winning numbers for Powerball, Mega Millions, Lotto Texas, Texas Two Step, Cash Five, Pick 3, Daily 4, and All or Nothing. Updated after every draw.',
};

export const dynamic = 'force-dynamic';

interface DrawRow {
  game_id: string;
  draw_date: string;
  draw_time: string | null;
  numbers: string;
  bonus_number: string | null;
  fireball: string | null;
  multiplier: number | null;
}

// Game display order (big games first)
const GAME_ORDER = ['powerball', 'mega_millions', 'lotto_texas', 'texas_two_step', 'cash_five', 'pick3', 'daily4', 'all_or_nothing'];

export default function ResultsPage() {
  let recentDraws: Record<string, DrawRow[]> = {};
  
  try {
    const db = getDb();
    for (const gameId of GAME_ORDER) {
      const rows = db.prepare(
        'SELECT game_id, draw_date, draw_time, numbers, bonus_number, fireball, multiplier FROM draws WHERE game_id = ? ORDER BY draw_date DESC, draw_time DESC LIMIT 10'
      ).all(gameId) as DrawRow[];
      if (rows.length > 0) {
        recentDraws[gameId] = rows;
      }
    }
  } catch {
    // DB might not be available
  }

  const hasData = Object.keys(recentDraws).length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl sm:text-4xl font-black mb-2">
        Latest <span className="text-gold text-glow-gold">Results</span>
      </h1>
      <p className="text-gray-400 mb-8">
        Updated after every draw. Past results don&apos;t predict future outcomes.
      </p>

      {!hasData && (
        <div className="glass-card text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <h2 className="text-xl font-bold text-gray-300 mb-2">No Data Yet</h2>
          <p className="text-gray-500">Results will appear after the first data sync.</p>
        </div>
      )}

      {hasData && GAME_ORDER.map((gameId, idx) => {
        const draws = recentDraws[gameId];
        if (!draws) return null;
        const game = GAMES[gameId];
        if (!game) return null;

        const latest = draws[0];
        const rest = draws.slice(1);

        return (
          <div key={gameId}>
            <div className="glass-card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">{game.name}</h2>
                <div className="flex items-center gap-3">
                  {/* Affiliate placeholder */}
                  {(gameId === 'powerball' || gameId === 'mega_millions') && (
                    <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-gold/20 to-yellow-600/20 text-gold border border-gold/30 cursor-pointer hover:bg-gold/30 transition-all">
                      🎟️ Buy Tickets
                    </span>
                  )}
                  <Link href={`/games/${gameId}`} className="text-sm text-neon hover:underline">
                    EV →
                  </Link>
                </div>
              </div>
              
              {/* Latest draw — featured */}
              <div className="mb-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500">{latest.draw_date}</span>
                  {latest.draw_time && <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400">{latest.draw_time}</span>}
                  <span className="text-xs px-2 py-0.5 rounded bg-neon/10 text-neon font-semibold">LATEST</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {latest.numbers.split(',').map((num, j) => (
                    <span key={j} className="lottery-ball">
                      {num.trim()}
                    </span>
                  ))}
                  {latest.bonus_number && (
                    <>
                      <span className="text-gray-600 mx-1">+</span>
                      <span className={`lottery-ball ${gameId === 'powerball' ? 'lottery-ball-red' : 'lottery-ball-bonus'}`}>
                        {latest.bonus_number}
                      </span>
                    </>
                  )}
                  {latest.fireball && (
                    <>
                      <span className="text-gray-600 mx-1">🔥</span>
                      <span className="lottery-ball lottery-ball-fireball">
                        {latest.fireball}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Previous draws */}
              {rest.length > 0 && (
                <div className="space-y-2">
                  {rest.map((draw, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-0">
                      <div className="w-24 flex-shrink-0">
                        <span className="text-xs text-gray-500">{draw.draw_date}</span>
                        {draw.draw_time && <span className="text-xs text-gray-600 ml-1">{draw.draw_time}</span>}
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {draw.numbers.split(',').map((num, j) => (
                          <span key={j} className="lottery-ball lottery-ball-sm">
                            {num.trim()}
                          </span>
                        ))}
                        {draw.bonus_number && (
                          <>
                            <span className="text-gray-700 text-xs mx-0.5">+</span>
                            <span className={`lottery-ball lottery-ball-sm ${gameId === 'powerball' ? 'lottery-ball-red' : 'lottery-ball-bonus'}`}>
                              {draw.bonus_number}
                            </span>
                          </>
                        )}
                        {draw.fireball && (
                          <>
                            <span className="text-gray-700 text-xs mx-0.5">🔥</span>
                            <span className="lottery-ball lottery-ball-sm lottery-ball-fireball">
                              {draw.fireball}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ad slot after first two games */}
            {idx === 1 && (
              <div className="ad-slot mb-6">{/* AD SLOT: between_results */}Advertisement</div>
            )}
          </div>
        );
      })}

      {/* Disclaimer */}
      <div className="glass-card text-center border-gold/10 mt-8">
        <h2 className="font-bold text-lg mb-2">📈 Historical Analytics</h2>
        <p className="text-sm text-gray-400 mb-4">
          Frequency charts, hot/cold numbers, and gap analysis available on each game&apos;s detail page.
        </p>
        <p className="text-xs text-gray-600">
          ⚠️ Historical patterns are interesting data, not predictive tools. Every draw is independent.
        </p>
      </div>
    </div>
  );
}
