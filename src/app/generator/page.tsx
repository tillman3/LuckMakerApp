'use client';

import { useState } from 'react';
import { GAMES, GameConfig } from '@/lib/games';
import { generateAntiPopular, generateQuickPick, generateBalanced, generateWheel, GeneratedNumbers, WheelResult } from '@/lib/number-generator';
import type { Metadata } from 'next';

const gameList = Object.values(GAMES);

export default function GeneratorPage() {
  const [selectedGame, setSelectedGame] = useState<string>('powerball');
  const [strategy, setStrategy] = useState<string>('anti-popular');
  const [results, setResults] = useState<GeneratedNumbers[]>([]);
  const [count, setCount] = useState(5);
  
  // Wheeling
  const [wheelNumbers, setWheelNumbers] = useState<string>('');
  const [wheelResult, setWheelResult] = useState<WheelResult | null>(null);

  const game = GAMES[selectedGame];

  function handleGenerate() {
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
      
      // Add bonus number if needed
      if (game.bonusNumbers > 0) {
        result.bonusNumber = Math.floor(Math.random() * game.bonusMax) + 1;
      }
      
      newResults.push(result);
    }
    setResults(newResults);
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">
        🎲 Smart Number <span className="text-neon">Generator</span>
      </h1>
      <p className="text-gray-400 mb-8">
        Same odds of winning. Better odds of keeping it all.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h2 className="font-bold text-lg mb-4">Settings</h2>
            
            {/* Game selector */}
            <label className="block text-sm text-gray-400 mb-1">Game</label>
            <select 
              value={selectedGame}
              onChange={e => { setSelectedGame(e.target.value); setResults([]); setWheelResult(null); }}
              className="w-full p-2 rounded-lg bg-dark-700 border border-dark-500 text-white mb-4"
            >
              {gameList.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>

            {/* Strategy */}
            <label className="block text-sm text-gray-400 mb-1">Strategy</label>
            <div className="space-y-2 mb-4">
              {[
                { id: 'anti-popular', label: '🎯 Anti-Popular', desc: 'Avoids commonly picked numbers' },
                { id: 'quick-pick', label: '🎲 Quick Pick', desc: 'Truly random' },
                { id: 'balanced', label: '⚖️ Balanced', desc: 'Spread across ranges' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setStrategy(s.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    strategy === s.id 
                      ? 'border-neon/30 bg-neon/5 text-neon' 
                      : 'border-dark-600 bg-dark-700 text-gray-300 hover:border-dark-500'
                  }`}
                >
                  <div className="font-semibold text-sm">{s.label}</div>
                  <div className="text-xs text-gray-500">{s.desc}</div>
                </button>
              ))}
            </div>

            {/* Count */}
            <label className="block text-sm text-gray-400 mb-1">Number of Sets</label>
            <select
              value={count}
              onChange={e => setCount(parseInt(e.target.value))}
              className="w-full p-2 rounded-lg bg-dark-700 border border-dark-500 text-white mb-4"
            >
              {[1, 2, 3, 5, 10].map(n => (
                <option key={n} value={n}>{n} set{n > 1 ? 's' : ''}</option>
              ))}
            </select>

            <button
              onClick={handleGenerate}
              className="w-full py-3 rounded-lg bg-neon/20 text-neon border border-neon/30 font-bold hover:bg-neon/30 transition-colors"
            >
              Generate Numbers ✨
            </button>
          </div>

          {/* Info card */}
          <div className="card bg-dark-700/50 border-gold/10">
            <h3 className="font-bold text-gold text-sm mb-2">💡 Why Anti-Popular?</h3>
            <p className="text-xs text-gray-400">
              Every number combination has the exact same odds of winning. But some numbers 
              are picked by fewer people. If you win with unpopular numbers, you&apos;re less 
              likely to split the jackpot. Same odds, bigger potential payout.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {results.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-bold text-lg">Generated Numbers</h2>
              {results.map((result, i) => (
                <div key={i} className="card flex items-center gap-4">
                  <div className="text-sm text-gray-500 w-8">#{i + 1}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {result.numbers.map((num, j) => (
                      <span key={j} className="w-10 h-10 rounded-full bg-dark-600 border border-neon/30 flex items-center justify-center text-white font-bold">
                        {num}
                      </span>
                    ))}
                    {result.bonusNumber !== undefined && (
                      <>
                        <span className="text-gray-600">+</span>
                        <span className="w-10 h-10 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold font-bold">
                          {result.bonusNumber}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div className="text-xs text-gray-500 mt-2">
                Strategy: {results[0]?.strategy} — {results[0]?.reasoning}
              </div>
            </div>
          )}

          {/* Wheeling System */}
          <div className="card mt-6">
            <h2 className="font-bold text-lg mb-2">🎡 Wheeling System</h2>
            <p className="text-sm text-gray-400 mb-4">
              Enter your favorite numbers. We&apos;ll generate optimized ticket sets that 
              guarantee minimum match levels if enough of your numbers hit.
            </p>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={wheelNumbers}
                onChange={e => setWheelNumbers(e.target.value)}
                placeholder={`Enter ${game.mainNumbers + 2}+ numbers separated by commas (1-${game.mainMax})`}
                className="flex-1 p-2 rounded-lg bg-dark-700 border border-dark-500 text-white placeholder-gray-600"
              />
              <button
                onClick={handleWheel}
                className="px-4 py-2 rounded-lg bg-gold/20 text-gold border border-gold/30 font-bold hover:bg-gold/30 transition-colors"
              >
                Generate Wheel
              </button>
            </div>

            {wheelResult && (
              <div className="space-y-3">
                <div className="p-3 bg-dark-700/50 rounded-lg">
                  <div className="text-sm text-neon font-semibold">{wheelResult.guarantee}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {wheelResult.totalTickets} tickets × ${game.ticketCost} = ${wheelResult.totalTickets * game.ticketCost} total
                  </div>
                </div>
                
                {wheelResult.tickets.map((ticket, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-12">Ticket {i + 1}</span>
                    <div className="flex gap-1">
                      {ticket.map((num, j) => (
                        <span key={j} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          wheelResult.inputNumbers.includes(num) 
                            ? 'bg-neon/20 text-neon border border-neon/30' 
                            : 'bg-dark-600 text-gray-400'
                        }`}>
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-3 rounded-lg bg-dark-700/30 border border-dark-600">
            <p className="text-xs text-gray-500">
              ⚠️ Generated numbers have the same probability of winning as any other combination. 
              The anti-popular strategy reduces split probability, not win probability. 
              The lottery is a game of chance — play for fun, within your budget.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
