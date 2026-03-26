'use client';

import { useState, useEffect } from 'react';
import { GAMES } from '@/lib/games';
import Link from 'next/link';

interface SavedNumber {
  id: number;
  game_id: string;
  numbers: string;
  bonusNumber?: string;
  label: string | null;
  created_at: string;
}

interface SpendingEntry {
  game_id: string;
  total_spent: number;
  total_tickets: number;
}

export default function TrackerPage() {
  const [selectedGame, setSelectedGame] = useState('powerball');
  const [numbers, setNumbers] = useState('');
  const [bonusNum, setBonusNum] = useState('');
  const [label, setLabel] = useState('');
  const [savedNumbers, setSavedNumbers] = useState<SavedNumber[]>([]);
  const [spending, setSpending] = useState<SpendingEntry[]>([]);
  const [spendAmount, setSpendAmount] = useState('2');
  const [spendTickets, setSpendTickets] = useState('1');
  const [monthlyBudget, setMonthlyBudget] = useState('');

  const game = GAMES[selectedGame];

  useEffect(() => {
    const saved = localStorage.getItem('lm3k_saved_numbers');
    if (saved) setSavedNumbers(JSON.parse(saved));
    const spent = localStorage.getItem('lm3k_spending');
    if (spent) setSpending(JSON.parse(spent));
    const budget = localStorage.getItem('lm3k_budget');
    if (budget) setMonthlyBudget(budget);
  }, []);

  function saveNumbers() {
    const nums = numbers.split(',').map(n => n.trim()).filter(Boolean);
    if (nums.length !== game.mainNumbers) {
      alert(`Enter exactly ${game.mainNumbers} numbers for ${game.name}`);
      return;
    }

    const entry: SavedNumber = {
      id: Date.now(),
      game_id: selectedGame,
      numbers: nums.join(', '),
      bonusNumber: bonusNum || undefined,
      label: label || null,
      created_at: new Date().toISOString(),
    };

    const updated = [...savedNumbers, entry];
    setSavedNumbers(updated);
    localStorage.setItem('lm3k_saved_numbers', JSON.stringify(updated));
    setNumbers('');
    setBonusNum('');
    setLabel('');
  }

  function removeNumber(id: number) {
    const updated = savedNumbers.filter(n => n.id !== id);
    setSavedNumbers(updated);
    localStorage.setItem('lm3k_saved_numbers', JSON.stringify(updated));
  }

  function addSpending() {
    const amount = parseFloat(spendAmount) || 0;
    const tickets = parseInt(spendTickets) || 0;
    if (amount <= 0) return;

    const existing = spending.find(s => s.game_id === selectedGame);
    let updated: SpendingEntry[];
    if (existing) {
      updated = spending.map(s => s.game_id === selectedGame ? {
        ...s,
        total_spent: s.total_spent + amount,
        total_tickets: s.total_tickets + tickets,
      } : s);
    } else {
      updated = [...spending, { game_id: selectedGame, total_spent: amount, total_tickets: tickets }];
    }

    setSpending(updated);
    localStorage.setItem('lm3k_spending', JSON.stringify(updated));
  }

  function saveBudget() {
    localStorage.setItem('lm3k_budget', monthlyBudget);
  }

  function clearSpending() {
    if (confirm('Clear all spending data?')) {
      setSpending([]);
      localStorage.removeItem('lm3k_spending');
    }
  }

  const totalSpent = spending.reduce((sum, s) => sum + s.total_spent, 0);
  const totalTickets = spending.reduce((sum, s) => sum + s.total_tickets, 0);
  const budgetNum = parseFloat(monthlyBudget) || 0;
  const budgetPercent = budgetNum > 0 ? Math.min((totalSpent / budgetNum) * 100, 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight animate-fade-in-up">
        🎯 Number <span className="text-neon text-glow-neon">Tracker</span>
      </h1>
      <p className="text-gray-500 mb-8 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        Save your numbers, track spending, stay in control.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Save Numbers */}
        <div className="glass-card">
          <h2 className="font-black text-lg mb-4">Save Your Numbers</h2>

          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Game</label>
          <select
            value={selectedGame}
            onChange={e => setSelectedGame(e.target.value)}
            className="w-full p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white mb-3 focus:border-neon/30 focus:outline-none"
          >
            {Object.values(GAMES).map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Numbers</label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={numbers}
              onChange={e => setNumbers(e.target.value)}
              placeholder={`${game.mainNumbers} numbers, comma separated`}
              className="flex-1 p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 focus:border-neon/30 focus:outline-none"
            />
            {game.bonusNumbers > 0 && (
              <input
                type="text"
                value={bonusNum}
                onChange={e => setBonusNum(e.target.value)}
                placeholder="Bonus"
                className="w-20 p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 focus:border-neon/30 focus:outline-none"
              />
            )}
          </div>

          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Label (optional — 'Lucky set', 'Birthday nums')"
            className="w-full p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 mb-3 focus:border-neon/30 focus:outline-none"
          />

          <button
            onClick={saveNumbers}
            className="w-full py-3 rounded-xl bg-neon/10 text-neon border border-neon/20 font-bold hover:bg-neon/20 transition-all"
          >
            💾 Save Numbers
          </button>
        </div>

        {/* Spending Tracker */}
        <div className="glass-card">
          <h2 className="font-black text-lg mb-4">💰 Spending Tracker</h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-xl font-black text-danger">${totalSpent.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Total Spent</div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-xl font-black text-gray-300">{totalTickets}</div>
              <div className="text-xs text-gray-500">Tickets</div>
            </div>
          </div>

          {/* Budget bar */}
          {budgetNum > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Monthly Budget</span>
                <span className={budgetPercent >= 80 ? 'text-danger font-bold' : 'text-gray-400'}>
                  ${totalSpent.toFixed(0)} / ${budgetNum.toFixed(0)}
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    budgetPercent >= 100 ? 'bg-danger' :
                    budgetPercent >= 80 ? 'bg-gold' : 'bg-neon'
                  }`}
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
              {budgetPercent >= 80 && budgetPercent < 100 && (
                <p className="text-xs text-gold mt-1">⚠️ Approaching your monthly budget</p>
              )}
              {budgetPercent >= 100 && (
                <p className="text-xs text-danger mt-1">🛑 You&apos;ve hit your monthly budget!</p>
              )}
            </div>
          )}

          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Log Purchase</label>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">$</span>
              <input
                type="number"
                value={spendAmount}
                onChange={e => setSpendAmount(e.target.value)}
                placeholder="Amount"
                className="w-full p-3 pl-7 rounded-xl bg-dark-900/50 border border-white/10 text-white focus:border-gold/30 focus:outline-none"
              />
            </div>
            <input
              type="number"
              value={spendTickets}
              onChange={e => setSpendTickets(e.target.value)}
              placeholder="# Tix"
              className="w-20 p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 focus:border-gold/30 focus:outline-none"
            />
            <button
              onClick={addSpending}
              className="px-4 py-3 rounded-xl bg-gold/10 text-gold font-bold border border-gold/20 hover:bg-gold/20 transition-all"
            >
              + Log
            </button>
          </div>

          {/* Budget setting */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm">$</span>
              <input
                type="number"
                value={monthlyBudget}
                onChange={e => setMonthlyBudget(e.target.value)}
                onBlur={saveBudget}
                placeholder="Monthly budget"
                className="w-full p-2.5 pl-7 rounded-xl bg-dark-900/50 border border-white/10 text-white text-sm placeholder-gray-600 focus:border-gold/30 focus:outline-none"
              />
            </div>
            <button
              onClick={clearSpending}
              className="px-3 py-2 rounded-xl text-xs text-gray-600 hover:text-danger border border-white/5 hover:border-danger/20 transition-all"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Per-game breakdown */}
      {spending.length > 0 && (
        <div className="glass-card mt-6">
          <h2 className="font-black text-lg mb-4">📊 By Game</h2>
          <div className="space-y-2">
            {spending.map(entry => {
              const g = GAMES[entry.game_id];
              return (
                <div key={entry.game_id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                  <span className="font-bold text-sm text-white">{g?.name || entry.game_id}</span>
                  <div className="text-right">
                    <span className="text-sm text-danger font-bold">${entry.total_spent.toFixed(2)}</span>
                    <span className="text-xs text-gray-600 ml-2">{entry.total_tickets} tickets</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Saved Numbers List */}
      {savedNumbers.length > 0 && (
        <div className="glass-card mt-6">
          <h2 className="font-black text-lg mb-4">Your Saved Numbers</h2>
          <div className="space-y-3">
            {savedNumbers.map(entry => {
              const entryGame = GAMES[entry.game_id];
              return (
                <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
                  <div>
                    <div className="text-sm font-bold text-white">
                      {entryGame?.name || entry.game_id}
                      {entry.label && <span className="text-gray-500 ml-2 font-normal">— {entry.label}</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {entry.numbers.split(',').map((num, i) => (
                        <span key={i} className="lottery-ball lottery-ball-sm">
                          {num.trim()}
                        </span>
                      ))}
                      {entry.bonusNumber && (
                        <>
                          <span className="text-gray-600 text-xs mx-0.5">+</span>
                          <span className="lottery-ball lottery-ball-sm lottery-ball-bonus">{entry.bonusNumber}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeNumber(entry.id)}
                    className="text-gray-600 hover:text-danger transition-colors p-2"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {savedNumbers.length === 0 && (
        <div className="glass-card mt-6 text-center py-8 border-white/5">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-gray-500">No saved numbers yet.</p>
          <p className="text-xs text-gray-600 mt-1">Save your regular picks to auto-check against results.</p>
        </div>
      )}

      {/* Pro upsell */}
      <div className="glass-card mt-6 text-center border-neon/10">
        <h3 className="font-black text-neon text-sm mb-2">⚡ Want Auto-Check?</h3>
        <p className="text-sm text-gray-400 mb-3">
          Pro members get automatic result checking — we&apos;ll notify you when your saved numbers match!
        </p>
        <Link href="/pricing" className="inline-block px-6 py-2.5 rounded-xl bg-neon/10 text-neon border border-neon/20 font-bold text-sm hover:bg-neon/20 transition-all">
          Go Pro — $6.99/mo
        </Link>
      </div>
    </div>
  );
}
