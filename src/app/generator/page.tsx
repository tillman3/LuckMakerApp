'use client';

import { useState, useEffect } from 'react';
import { GAMES } from '@/lib/games';
import { generateAntiPopular, generateQuickPick, generateBalanced, generateWheel, GeneratedNumbers, WheelResult } from '@/lib/number-generator';
import { useAuth, hasAccess } from '@/lib/auth-context';
import { getGenerationCount, incrementGenerationCount, remainingGenerations, MAX_FREE_GENS } from '@/lib/generation-limit';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { FeatureGate } from '@/components/FeatureGate';

const gameList = Object.values(GAMES);

export default function GeneratorPage() {
  const [selectedGame, setSelectedGame] = useState<string>('powerball');
  const [strategy, setStrategy] = useState<string>('anti-popular');
  const [results, setResults] = useState<GeneratedNumbers[]>([]);
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [revealedSets, setRevealedSets] = useState<number>(0);
  const [genCount, setGenCount] = useState(0);

  // Wheeling
  const [wheelNumbers, setWheelNumbers] = useState<string>('');
  const [wheelResult, setWheelResult] = useState<WheelResult | null>(null);

  const { plan, loading } = useAuth();
  const isPro = hasAccess(plan, 'pro');
  const game = GAMES[selectedGame];

  useEffect(() => {
    setGenCount(getGenerationCount());
  }, []);

  function handleGenerate() {
    // Check free limit
    if (!isPro && !loading) {
      const remaining = remainingGenerations();
      if (remaining <= 0) {
        return; // Button should be disabled, but safety check
      }
    }

    setGenerating(true);
    setResults([]);
    setRevealedSets(0);

    setTimeout(() => {
      const newResults: GeneratedNumbers[] = [];
      for (let i = 0; i < count; i++) {
        let result: GeneratedNumbers;
        switch (strategy) {
          case 'anti-popular':
            result = generateAntiPopular(game.mainNumbers, game.mainMax);
            break;
          case 'balanced':
            result = generateBalanced(game.mainNumbers, game.mainMax);
            break;
          default:
            result = generateQuickPick(game.mainNumbers, game.mainMax);
        }
        if (game.bonusNumbers > 0) {
          result.bonusNumber = Math.floor(Math.random() * game.bonusMax) + 1;
        }
        newResults.push(result);
      }
      setResults(newResults);
      setGenerating(false);

      // Track generation for free users
      if (!isPro) {
        const newCount = incrementGenerationCount();
        setGenCount(newCount);
      }

      newResults.forEach((_, i) => {
        setTimeout(() => setRevealedSets(prev => prev + 1), 150 * (i + 1));
      });
    }, 600);
  }

  function handleWheel() {
    const nums = wheelNumbers.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n >= 1 && n <= game.mainMax);
    if (nums.length < game.mainNumbers) {
      alert(`Enter at least ${game.mainNumbers} numbers for ${game.name}`);
      return;
    }
    const result = generateWheel(nums, game.mainNumbers, Math.min(nums.length, 4), 3);
    setWheelResult(result);
  }

  const freeRemaining = MAX_FREE_GENS - genCount;
  const atLimit = !isPro && !loading && freeRemaining <= 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight animate-fade-in-up">
        🎲 Smart <span className="text-neon text-glow-neon">Generator</span>
      </h1>
      <p className="text-gray-500 mb-8 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        Same odds of winning. Better odds of keeping it all.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card">
            <h2 className="font-black text-lg mb-4 tracking-tight">Settings</h2>

            <label className="block text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1.5">Game</label>
            <select
              value={selectedGame}
              onChange={e => { setSelectedGame(e.target.value); setResults([]); setWheelResult(null); }}
              className="input-premium mb-4"
            >
              {gameList.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>

            <label className="block text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-2">Strategy</label>
            <div className="space-y-2 mb-4">
              {[
                { id: 'anti-popular', label: '🎯 Anti-Popular', desc: 'Avoids commonly picked numbers' },
                { id: 'quick-pick', label: '🎲 Quick Pick', desc: 'Truly random selection' },
                { id: 'balanced', label: '⚖️ Balanced', desc: 'Spread across all ranges' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setStrategy(s.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    strategy === s.id
                      ? 'border-neon/30 bg-neon/5 text-neon glow-neon'
                      : 'border-white/5 bg-dark-900/30 text-gray-300 hover:border-white/10'
                  }`}
                >
                  <div className="font-semibold text-sm">{s.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>

            <label className="block text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1.5">Number of Sets</label>
            <select
              value={count}
              onChange={e => setCount(parseInt(e.target.value))}
              className="input-premium mb-4"
            >
              {[1, 2, 3, 5, 10].map(n => (
                <option key={n} value={n}>{n} set{n > 1 ? 's' : ''}</option>
              ))}
            </select>

            {/* Generation limit indicator for free users */}
            {!loading && !isPro && (
              <div className={`mb-4 p-3 rounded-xl text-sm ${atLimit ? 'bg-gold/10 border border-gold/20' : 'bg-white/[0.02] border border-white/5'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Daily Generations</span>
                  <span className={`font-bold text-sm ${atLimit ? 'text-gold' : 'text-[rgba(255,255,255,0.75)]'}`}>
                    {genCount}/{MAX_FREE_GENS}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${atLimit ? 'bg-gold' : 'bg-neon'}`}
                    style={{ width: `${Math.min((genCount / MAX_FREE_GENS) * 100, 100)}%` }}
                  />
                </div>
                {atLimit && (
                  <p className="text-xs text-gold mt-2">Daily limit reached. Resets at midnight.</p>
                )}
              </div>
            )}

            {atLimit ? (
              <UpgradePrompt
                plan="pro"
                compact
                message="Unlock unlimited generations with Pro."
              />
            ) : (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${
                  generating
                    ? 'bg-gold/10 text-gold/50 cursor-wait'
                    : 'bg-gradient-to-r from-gold/15 to-yellow-600/15 text-gold border border-gold/20 hover:border-gold/40 hover:from-gold/25 hover:to-yellow-600/25'
                }`}
              >
                {generating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : (
                  '🎰 Generate Numbers'
                )}
              </button>
            )}
          </div>

          <div className="glass-card border-gold/10">
            <h3 className="font-black text-gold text-sm mb-2">💡 Why Anti-Popular?</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Every combination has identical odds. But some numbers are picked by fewer people
              (birthdays = 1-31 are overplayed). If you win with unpopular numbers,
              you&apos;re less likely to split. Same odds, bigger potential payout.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {results.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-black text-lg text-gold tracking-tight">
                ✨ Your Numbers
              </h2>
              {results.map((result, i) => (
                <div
                  key={i}
                  className={`glass-card flex items-center gap-3 sm:gap-4 transition-all duration-300 ${
                    i < revealedSets ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                >
                  <div className="text-sm text-gray-600 w-8 flex-shrink-0 font-bold">#{i + 1}</div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {result.numbers.map((num, j) => (
                      <span key={j} className="lottery-ball lottery-ball-sm">
                        {num}
                      </span>
                    ))}
                    {result.bonusNumber !== undefined && (
                      <>
                        <span className="text-gray-600 text-sm mx-0.5">+</span>
                        <span className="lottery-ball lottery-ball-sm lottery-ball-bonus">
                          {result.bonusNumber}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div className="text-xs text-gray-600 mt-2 px-1">
                {results[0]?.strategy} — {results[0]?.reasoning}
              </div>
            </div>
          )}

          {results.length === 0 && !generating && (
            <div className="glass-card text-center py-12 border-white/5">
              <div className="text-5xl mb-4">🎰</div>
              <p className="text-gray-500">Select a game and strategy, then hit generate.</p>
              <p className="text-xs text-gray-600 mt-2">Your lucky numbers are waiting.</p>
            </div>
          )}

          {generating && (
            <div className="glass-card text-center py-12">
              <div className="text-5xl mb-4 animate-bounce">🎲</div>
              <p className="text-gold font-bold animate-pulse">Generating your numbers...</p>
            </div>
          )}

          {/* Wheeling System — Pro+ */}
          <div className="mt-6">
            <FeatureGate
              requiredPlan="pro"
              title="Wheeling Systems — Pro Feature"
              message="Build optimized ticket combinations that guarantee minimum match levels. Unlock with Pro."
            >
              <div className="glass-card">
                <h2 className="font-black text-lg mb-2">🎡 Wheeling System</h2>
                <p className="text-sm text-gray-400 mb-4">
                  Enter your favorite numbers — we&apos;ll generate ticket sets that
                  guarantee minimum match levels if enough of your numbers hit.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <input
                    type="text"
                    value={wheelNumbers}
                    onChange={e => setWheelNumbers(e.target.value)}
                    placeholder={`${game.mainNumbers + 2}+ numbers, comma separated`}
                    className="flex-1 p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 focus:border-gold/30 focus:outline-none"
                  />
                  <button
                    onClick={handleWheel}
                    className="px-6 py-3 rounded-xl bg-gold/10 text-gold border border-gold/30 font-bold hover:bg-gold/20 transition-all whitespace-nowrap"
                  >
                    Build Wheel
                  </button>
                </div>

                {wheelResult && (
                  <div className="space-y-3">
                    <div className="p-3 bg-neon/5 rounded-xl border border-neon/10">
                      <div className="text-sm text-neon font-bold">{wheelResult.guarantee}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {wheelResult.totalTickets} tickets × ${game.ticketCost} = <span className="text-gold">${wheelResult.totalTickets * game.ticketCost}</span> total
                      </div>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {wheelResult.tickets.map((ticket, i) => (
                        <div key={i} className="flex items-center gap-2 py-1">
                          <span className="text-xs text-gray-600 w-16 flex-shrink-0">Ticket {i + 1}</span>
                          <div className="flex gap-1 flex-wrap">
                            {ticket.map((num, j) => (
                              <span key={j} className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                wheelResult.inputNumbers.includes(num)
                                  ? 'bg-neon/10 text-neon border border-neon/20'
                                  : 'bg-white/5 text-gray-500'
                              }`}>
                                {num}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </FeatureGate>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-xs text-gray-500">
              ⚠️ Generated numbers have the same probability of winning as any other combination.
              The anti-popular strategy reduces split probability, not win probability.
              The lottery is entertainment — play within your budget.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
