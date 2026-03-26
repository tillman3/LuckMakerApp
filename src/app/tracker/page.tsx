'use client';

import { useState, useEffect } from 'react';
import { GAMES } from '@/lib/games';
import type { Metadata } from 'next';

interface SavedNumber {
  id: number;
  game_id: string;
  numbers: string;
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
  const [label, setLabel] = useState('');
  const [savedNumbers, setSavedNumbers] = useState<SavedNumber[]>([]);
  const [spending, setSpending] = useState<SpendingEntry[]>([]);
  const [spendAmount, setSpendAmount] = useState('2');
  const [spendTickets, setSpendTickets] = useState('1');

  const game = GAMES[selectedGame];

  // For now, store in localStorage (API integration later)
  useEffect(() => {
    const saved = localStorage.getItem('lm3k_saved_numbers');
    if (saved) setSavedNumbers(JSON.parse(saved));
    const spent = localStorage.getItem('lm3k_spending');
    if (spent) setSpending(JSON.parse(spent));
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
      label: label || null,
      created_at: new Date().toISOString(),
    };
    
    const updated = [...savedNumbers, entry];
    setSavedNumbers(updated);
    localStorage.setItem('lm3k_saved_numbers', JSON.stringify(updated));
    setNumbers('');
    setLabel('');
  }

  function removeNumber(id: number) {
    const updated = savedNumbers.filter(n => n.id !== id);
    setSavedNumbers(updated);
    localStorage.setItem('lm3k_saved_numbers', JSON.stringify(updated));
  }

  function addSpending() {
    const entry: SpendingEntry = {
      game_id: selectedGame,
      total_spent: parseFloat(spendAmount) || 0,
      total_tickets: parseInt(spendTickets) || 0,
    };
    
    const existing = spending.find(s => s.game_id === selectedGame);
    let updated: SpendingEntry[];
    if (existing) {
      updated = spending.map(s => s.game_id === selectedGame ? {
        ...s,
        total_spent: s.total_spent + entry.total_spent,
        total_tickets: s.total_tickets + entry.total_tickets,
      } : s);
    } else {
      updated = [...spending, entry];
    }
    
    setSpending(updated);
    localStorage.setItem('lm3k_spending', JSON.stringify(updated));
  }

  const totalSpent = spending.reduce((sum, s) => sum + s.total_spent, 0);
  const totalTickets = spending.reduce((sum, s) => sum + s.total_tickets, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">
        🎯 Number <span className="text-neon">Tracker</span>
      </h1>
      <p className="text-gray-400 mb-8">
        Save your regular numbers and track your spending. Pro users get auto-check against results.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Save Numbers */}
        <div className="card">
          <h2 className="font-bold text-lg mb-4">Save Your Numbers</h2>
          
          <select 
            value={selectedGame}
            onChange={e => setSelectedGame(e.target.value)}
            className="w-full p-2 rounded-lg bg-dark-700 border border-dark-500 text-white mb-3"
          >
            {Object.values(GAMES).map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <input
            type="text"
            value={numbers}
            onChange={e => setNumbers(e.target.value)}
            placeholder={`Enter ${game.mainNumbers} numbers (e.g., 5, 12, 23, 34, 45)`}
            className="w-full p-2 rounded-lg bg-dark-700 border border-dark-500 text-white placeholder-gray-600 mb-3"
          />

          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Label (optional, e.g., 'Lucky set')"
            className="w-full p-2 rounded-lg bg-dark-700 border border-dark-500 text-white placeholder-gray-600 mb-3"
          />

          <button
            onClick={saveNumbers}
            className="w-full py-2 rounded-lg bg-neon/20 text-neon border border-neon/30 font-bold hover:bg-neon/30 transition-colors"
          >
            Save Numbers
          </button>
        </div>

        {/* Spending Tracker */}
        <div className="card">
          <h2 className="font-bold text-lg mb-4">💰 Spending Tracker</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-dark-700 rounded-lg text-center">
              <div className="text-xl font-bold text-danger">${totalSpent.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Total Spent</div>
            </div>
            <div className="p-3 bg-dark-700 rounded-lg text-center">
              <div className="text-xl font-bold text-gray-300">{totalTickets}</div>
              <div className="text-xs text-gray-500">Tickets Bought</div>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="number"
              value={spendAmount}
              onChange={e => setSpendAmount(e.target.value)}
              placeholder="Amount"
              className="flex-1 p-2 rounded-lg bg-dark-700 border border-dark-500 text-white"
            />
            <input
              type="number"
              value={spendTickets}
              onChange={e => setSpendTickets(e.target.value)}
              placeholder="Tickets"
              className="w-20 p-2 rounded-lg bg-dark-700 border border-dark-500 text-white"
            />
          </div>

          <button
            onClick={addSpending}
            className="w-full py-2 rounded-lg bg-dark-600 text-gray-300 hover:bg-dark-500 transition-colors"
          >
            Log Purchase
          </button>
        </div>
      </div>

      {/* Saved Numbers List */}
      {savedNumbers.length > 0 && (
        <div className="card mt-6">
          <h2 className="font-bold text-lg mb-4">Your Saved Numbers</h2>
          <div className="space-y-3">
            {savedNumbers.map(entry => {
              const entryGame = GAMES[entry.game_id];
              return (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {entryGame?.name || entry.game_id}
                        {entry.label && <span className="text-gray-400 ml-2">— {entry.label}</span>}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {entry.numbers.split(',').map((num, i) => (
                          <span key={i} className="w-7 h-7 rounded-full bg-dark-600 border border-neon/20 flex items-center justify-center text-xs text-white">
                            {num.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeNumber(entry.id)}
                    className="text-gray-600 hover:text-danger transition-colors text-sm"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pro upsell */}
      <div className="card bg-dark-700/50 border-neon/10 mt-6 text-center">
        <h3 className="font-bold text-neon mb-2">⚡ Want Auto-Check?</h3>
        <p className="text-sm text-gray-400 mb-3">
          Pro members get automatic result checking — we&apos;ll notify you when your saved numbers match!
        </p>
        <a href="/pricing" className="inline-block px-6 py-2 rounded-lg bg-neon/20 text-neon border border-neon/30 font-bold hover:bg-neon/30 transition-colors">
          Go Pro — $4.99/mo
        </a>
      </div>
    </div>
  );
}
