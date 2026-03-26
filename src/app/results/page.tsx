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

const GAME_ORDER = ['powerball', 'mega_millions', 'lotto_texas', 'texas_two_step', 'cash_five', 'pick3', 'daily4', 'all_or_nothing'];

function getDrawTimeBadge(drawTime: string | null) {
  if (!drawTime) return null;
  const t = drawTime.toLowerCase();
  if (t.includes('morning') || t.includes('am') || t === 'morning') {
    return { class: 'draw-time-morning', label: '☀️ Morning', icon: '☀️' };
  }
  if (t.includes('day') || t === 'day' || t.includes('midday')) {
    return { class: 'draw-time-day', label: '🌤️ Day', icon: '🌤️' };
  }
  if (t.includes('evening') || t === 'evening') {
    return { class: 'draw-time-evening', label: '🌆 Evening', icon: '🌆' };
  }
  if (t.includes('night') || t === 'night' || t.includes('pm')) {
    return { class: 'draw-time-night', label: '🌙 Night', icon: '🌙' };
  }
  return { class: 'draw-time-evening', label: drawTime, icon: '🕐' };
}

const GAME_ACCENTS: Record<string, string> = {
  powerball: 'from-red-500/10 to-red-900/5 border-red-500/10',
  mega_millions: 'from-gold/10 to-yellow-900/5 border-gold/10',
  lotto_texas: 'from-blue-500/10 to-blue-900/5 border-blue-500/10',
  texas_two_step: 'from-green-500/10 to-green-900/5 border-green-500/10',
  cash_five: 'from-purple-500/10 to-purple-900/5 border-purple-500/10',
  pick3: 'from-orange-500/10 to-orange-900/5 border-orange-500/10',
  daily4: 'from-teal-500/10 to-teal-900/5 border-teal-500/10',
  all_or_nothing: 'from-pink-500/10 to-pink-900/5 border-pink-500/10',
};

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-10 animate-fade-in-up">
        <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight">
          Latest <span className="text-gold text-glow-gold">Results</span>
        </h1>
        <p className="text-gray-500 text-sm sm:text-base max-w-xl">
          Updated after every draw. Past results don&apos;t predict future outcomes.
        </p>
      </div>

      {!hasData && (
        <div className="glass-card text-center py-16 animate-fade-in-scale">
          <div className="text-5xl mb-4">📭</div>
          <h2 className="text-xl font-bold text-gray-300 mb-2">No Data Yet</h2>
          <p className="text-gray-600 text-sm">Results will appear after the first data sync.</p>
        </div>
      )}

      {hasData && (
        <div className="space-y-6">
          {GAME_ORDER.map((gameId, idx) => {
            const draws = recentDraws[gameId];
            if (!draws) return null;
            const game = GAMES[gameId];
            if (!game) return null;

            const latest = draws[0];
            const rest = draws.slice(1);
            const accent = GAME_ACCENTS[gameId] || '';

            return (
              <div key={gameId} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.06}s` }}>
                <div className="glass-card">
                  {/* Game Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">{game.name}</h2>
                      {(gameId === 'pick3' || gameId === 'daily4') && (
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Multi-Draw</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {(gameId === 'powerball' || gameId === 'mega_millions') && (
                        <span className="text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-gold/15 to-yellow-600/15 text-gold border border-gold/20 cursor-pointer hover:border-gold/40 transition-all font-semibold">
                          🎟️ Buy Tickets
                        </span>
                      )}
                      <Link href={`/games/${gameId}`} className="text-xs font-semibold text-gold/50 hover:text-gold transition-colors">
                        EV Analysis →
                      </Link>
                    </div>
                  </div>

                  {/* Latest draw — featured */}
                  <div className={`mb-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${accent} border`}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-semibold text-gray-400">{latest.draw_date}</span>
                      {latest.draw_time && (
                        <span className={`draw-time-badge ${getDrawTimeBadge(latest.draw_time)?.class || ''}`}>
                          {getDrawTimeBadge(latest.draw_time)?.label || latest.draw_time}
                        </span>
                      )}
                      <span className="badge-latest">Latest</span>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {latest.numbers.split(',').map((num, j) => (
                        <span key={j} className="lottery-ball">
                          {num.trim()}
                        </span>
                      ))}
                      {latest.bonus_number && (
                        <>
                          <span className="text-gray-600 font-bold mx-0.5">+</span>
                          <span className={`lottery-ball ${gameId === 'powerball' ? 'lottery-ball-red' : 'lottery-ball-bonus'}`}>
                            {latest.bonus_number}
                          </span>
                        </>
                      )}
                      {latest.fireball && (
                        <>
                          <span className="text-gray-600 font-bold mx-0.5">🔥</span>
                          <span className="lottery-ball lottery-ball-fireball">
                            {latest.fireball}
                          </span>
                        </>
                      )}
                    </div>
                    {latest.multiplier && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gold/10 border border-gold/15">
                        <span className="text-xs font-bold text-gold">{latest.multiplier}x</span>
                        <span className="text-[10px] text-gray-500">Multiplier</span>
                      </div>
                    )}
                  </div>

                  {/* Previous draws */}
                  {rest.length > 0 && (
                    <div className="space-y-0">
                      {rest.map((draw, i) => (
                        <div key={i} className="flex items-center gap-3 py-3 border-b border-white/[0.03] last:border-0 group hover:bg-white/[0.01] transition-colors -mx-1.5 px-1.5 rounded-lg">
                          <div className="w-28 flex-shrink-0">
                            <span className="text-xs font-medium text-gray-500 block">{draw.draw_date}</span>
                            {draw.draw_time && (
                              <span className={`draw-time-badge mt-1 ${getDrawTimeBadge(draw.draw_time)?.class || ''}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                                {getDrawTimeBadge(draw.draw_time)?.label || draw.draw_time}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1.5 flex-wrap items-center">
                            {draw.numbers.split(',').map((num, j) => (
                              <span key={j} className="lottery-ball lottery-ball-sm">
                                {num.trim()}
                              </span>
                            ))}
                            {draw.bonus_number && (
                              <>
                                <span className="text-gray-700 text-xs mx-0.5 font-bold">+</span>
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
                  <div className="ad-slot my-6">{/* AD SLOT: between_results */}Advertisement</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="glass-card text-center mt-10 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <h2 className="font-black text-lg mb-2">📈 Historical Analytics</h2>
        <p className="text-sm text-gray-400 mb-4 max-w-md mx-auto">
          Frequency charts, hot/cold numbers, and gap analysis available on each game&apos;s detail page.
        </p>
        <p className="text-xs text-gray-600">
          ⚠️ Historical patterns are interesting data, not predictive tools. Every draw is independent.
        </p>
      </div>
    </div>
  );
}
