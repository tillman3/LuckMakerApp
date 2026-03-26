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

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function DrawTimeBadge({ time }: { time: string }) {
  const cls = time === 'Morning' ? 'draw-time-morning'
    : time === 'Day' ? 'draw-time-day'
    : time === 'Evening' ? 'draw-time-evening'
    : 'draw-time-night';
  return <span className={`draw-time-badge ${cls}`}>{time}</span>;
}

function NumberBalls({ draw, gameId, size = 'normal' }: { draw: DrawRow; gameId: string; size?: 'normal' | 'sm' }) {
  const sm = size === 'sm';
  const ballClass = sm ? 'lottery-ball lottery-ball-sm' : 'lottery-ball';
  
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {draw.numbers.split(',').map((num, j) => (
        <span key={j} className={ballClass}>{num.trim()}</span>
      ))}
      {draw.bonus_number && (
        <>
          <span className="text-[rgba(255,255,255,0.2)] mx-0.5 text-xs">+</span>
          <span className={`${ballClass} ${gameId === 'powerball' ? 'lottery-ball-red' : 'lottery-ball-bonus'}`}>
            {draw.bonus_number}
          </span>
        </>
      )}
      {draw.fireball && (
        <>
          <span className="text-[rgba(255,255,255,0.2)] mx-0.5 text-xs">🔥</span>
          <span className={`${ballClass} lottery-ball-fireball`}>
            {draw.fireball}
          </span>
        </>
      )}
    </div>
  );
}

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Page header — clean, minimal */}
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
          Latest <span className="text-gold text-glow-gold">Results</span>
        </h1>
        <p className="text-muted text-sm">
          Updated after every draw. Past results don&apos;t predict future outcomes.
        </p>
      </div>

      {!hasData && (
        <div className="glass-card text-center py-16">
          <div className="text-4xl mb-4">📭</div>
          <h2 className="text-lg font-bold mb-2">No Data Yet</h2>
          <p className="text-muted text-sm">Results will appear after the first data sync.</p>
        </div>
      )}

      {hasData && (
        <div className="space-y-8">
          {GAME_ORDER.map((gameId) => {
            const draws = recentDraws[gameId];
            if (!draws) return null;
            const game = GAMES[gameId];
            if (!game) return null;
            const latest = draws[0];
            const rest = draws.slice(1);

            return (
              <div key={gameId} className="glass-card">
                {/* Game header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold tracking-tight">{game.name}</h2>
                  <Link 
                    href={`/games/${gameId}`} 
                    className="text-xs font-medium text-[rgba(255,255,255,0.4)] hover:text-gold transition-colors"
                  >
                    EV Analysis →
                  </Link>
                </div>
                
                {/* Latest draw — featured */}
                <div className="mb-6 p-5 rounded-xl bg-[var(--color-dark-700)]">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-medium text-bright">{formatDate(latest.draw_date)}</span>
                    {latest.draw_time && <DrawTimeBadge time={latest.draw_time} />}
                    <span className="text-[10px] font-bold tracking-wider uppercase text-neon/70 ml-auto">Latest</span>
                  </div>
                  <NumberBalls draw={latest} gameId={gameId} />
                </div>

                {/* Previous draws — compact table */}
                {rest.length > 0 && (
                  <div className="space-y-0">
                    {rest.map((draw, i) => (
                      <div 
                        key={i} 
                        className={`flex items-center gap-4 py-3 ${
                          i < rest.length - 1 ? 'border-b border-[rgba(255,255,255,0.04)]' : ''
                        }`}
                      >
                        <div className="w-20 flex-shrink-0">
                          <span className="text-xs text-muted font-tabular">{formatDate(draw.draw_date)}</span>
                        </div>
                        {draw.draw_time && (
                          <div className="w-16 flex-shrink-0">
                            <DrawTimeBadge time={draw.draw_time} />
                          </div>
                        )}
                        <NumberBalls draw={draw} gameId={gameId} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="mt-12 text-center">
        <p className="text-muted text-xs mb-4">
          Historical frequency data and gap analysis available on each game&apos;s detail page.
        </p>
        <Link href="/games" className="text-sm font-medium text-gold/60 hover:text-gold transition-colors">
          ← View All Games
        </Link>
      </div>
    </div>
  );
}
