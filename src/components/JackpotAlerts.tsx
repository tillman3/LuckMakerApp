'use client';

import { useState } from 'react';

export function JackpotAlerts() {
  const [email, setEmail] = useState('');
  const [game, setGame] = useState('powerball');
  const [threshold, setThreshold] = useState('500000000');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, gameId: game, threshold: parseInt(threshold) }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to set alert');
    }
  }

  if (submitted) {
    return (
      <div className="glass-card text-center border-neon/10">
        <div className="text-2xl mb-2">🔔</div>
        <p className="text-neon font-bold text-sm">Alert set!</p>
        <p className="text-xs text-gray-500 mt-1">
          We&apos;ll email you when the jackpot crosses your threshold.
        </p>
        <button 
          onClick={() => setSubmitted(false)} 
          className="text-xs text-gray-600 mt-2 hover:text-gray-400"
        >
          Set another alert
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card border-gold/10">
      <h3 className="font-black text-sm text-gold mb-3">🔔 Jackpot Alerts</h3>
      <p className="text-xs text-gray-400 mb-3">
        Get notified when a jackpot hits your threshold. Never miss a big one.
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Your email"
          required
          className="w-full p-2.5 rounded-lg bg-dark-900/50 border border-white/10 text-white text-sm placeholder-gray-600 focus:border-gold/30 focus:outline-none"
        />
        <div className="flex gap-2">
          <select
            value={game}
            onChange={e => setGame(e.target.value)}
            className="flex-1 p-2.5 rounded-lg bg-dark-900/50 border border-white/10 text-white text-sm focus:border-gold/30 focus:outline-none"
          >
            <option value="powerball">Powerball</option>
            <option value="mega_millions">Mega Millions</option>
            <option value="lotto_texas">Lotto Texas</option>
          </select>
          <select
            value={threshold}
            onChange={e => setThreshold(e.target.value)}
            className="flex-1 p-2.5 rounded-lg bg-dark-900/50 border border-white/10 text-white text-sm focus:border-gold/30 focus:outline-none"
          >
            <option value="100000000">$100M+</option>
            <option value="250000000">$250M+</option>
            <option value="500000000">$500M+</option>
            <option value="750000000">$750M+</option>
            <option value="1000000000">$1B+</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-gold/10 text-gold text-sm font-bold border border-gold/20 hover:bg-gold/20 transition-all"
        >
          Set Alert
        </button>
        {error && <p className="text-xs text-danger">{error}</p>}
      </form>
    </div>
  );
}
