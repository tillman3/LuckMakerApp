'use client';

import { useState } from 'react';
import { GAMES } from '@/lib/games';
import Link from 'next/link';

const gameList = Object.values(GAMES).filter(g => ['powerball', 'mega_millions', 'lotto_texas', 'texas_two_step', 'cash_five'].includes(g.id));

export default function PoolPage() {
  const [step, setStep] = useState<'create' | 'join' | 'landing'>('landing');
  const [poolName, setPoolName] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [creatorEmail, setCreatorEmail] = useState('');
  const [gameId, setGameId] = useState('powerball');
  const [buyIn, setBuyIn] = useState('5');
  const [drawDate, setDrawDate] = useState('');
  const [memberNames, setMemberNames] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!poolName || !createdBy) {
      setError('Pool name and your name are required');
      return;
    }
    setLoading(true);
    setError('');
    
    const members = memberNames.split('\n').filter(n => n.trim()).map(n => ({ name: n.trim() }));
    
    try {
      const res = await fetch('/api/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: poolName,
          createdBy,
          creatorEmail,
          gameId,
          buyIn: parseFloat(buyIn),
          drawDate: drawDate || null,
          members,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setError('Failed to create pool');
    }
    setLoading(false);
  }

  // Created successfully
  if (result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="glass-card text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-black text-gold text-glow-gold mb-2">Pool Created!</h1>
          <p className="text-gray-400 mb-6">Share this link with your group:</p>
          
          <div className="bg-dark-900/50 rounded-xl p-4 mb-6">
            <div className="text-xs text-gray-500 mb-1">Share Link</div>
            <div className="text-neon font-mono text-sm break-all select-all">
              {result.shareUrl}
            </div>
            <button 
              onClick={() => navigator.clipboard.writeText(result.shareUrl)}
              className="mt-3 px-4 py-2 rounded-lg bg-neon/10 text-neon text-sm font-bold border border-neon/20 hover:bg-neon/20 transition-all"
            >
              📋 Copy Link
            </button>
          </div>
          
          <div className="text-xs text-gray-500 mb-6">
            Pool Code: <span className="text-gold font-mono">{result.shareCode}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href={`/pool/${result.shareCode}`}
              className="px-6 py-3 rounded-xl font-bold text-dark-900 bg-gradient-to-r from-gold to-yellow-500 transition-all"
            >
              View Pool →
            </Link>
            <button
              onClick={() => { setResult(null); setStep('landing'); }}
              className="px-6 py-3 rounded-xl font-bold text-gray-400 border border-white/10 hover:bg-white/5 transition-all"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl sm:text-4xl font-black mb-2">
        👥 Lottery <span className="text-gold text-glow-gold">Pool Manager</span>
      </h1>
      <p className="text-gray-400 mb-8">
        Organize your office pool. Track who paid, what tickets you have, and split winnings fairly.
      </p>

      {step === 'landing' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={() => setStep('create')}
            className="glass-card text-left group hover:border-gold/20 transition-all"
          >
            <div className="text-3xl mb-3">🆕</div>
            <h2 className="text-lg font-black text-white group-hover:text-gold transition-colors">Create a Pool</h2>
            <p className="text-sm text-gray-400 mt-2">
              Start a new lottery pool. Add members, track payments, and manage tickets.
            </p>
          </button>
          
          <div className="glass-card">
            <div className="text-3xl mb-3">🔗</div>
            <h2 className="text-lg font-black text-white mb-3">Join a Pool</h2>
            <p className="text-sm text-gray-400 mb-4">
              Got a pool code or link? Enter it below.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                placeholder="Enter pool code"
                className="flex-1 p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 focus:border-gold/30 focus:outline-none"
              />
              <Link
                href={joinCode ? `/pool/${joinCode}` : '#'}
                className={`px-4 py-3 rounded-xl font-bold transition-all ${joinCode ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
              >
                Join
              </Link>
            </div>
          </div>
        </div>
      )}

      {step === 'create' && (
        <div className="glass-card">
          <h2 className="text-xl font-black mb-6">Create New Pool</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Pool Name *</label>
              <input
                type="text"
                value={poolName}
                onChange={e => setPoolName(e.target.value)}
                placeholder="e.g., Office Powerball Pool"
                className="w-full p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 focus:border-gold/30 focus:outline-none"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Your Name *</label>
                <input
                  type="text"
                  value={createdBy}
                  onChange={e => setCreatedBy(e.target.value)}
                  placeholder="Your name"
                  className="w-full p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 focus:border-gold/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Your Email (optional)</label>
                <input
                  type="email"
                  value={creatorEmail}
                  onChange={e => setCreatorEmail(e.target.value)}
                  placeholder="For win notifications"
                  className="w-full p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 focus:border-gold/30 focus:outline-none"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Game</label>
                <select
                  value={gameId}
                  onChange={e => setGameId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white focus:border-gold/30 focus:outline-none"
                >
                  {gameList.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Buy-In ($)</label>
                <input
                  type="number"
                  value={buyIn}
                  onChange={e => setBuyIn(e.target.value)}
                  min="1"
                  step="1"
                  className="w-full p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white focus:border-gold/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Draw Date</label>
                <input
                  type="date"
                  value={drawDate}
                  onChange={e => setDrawDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white focus:border-gold/30 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                Members (one per line, you&apos;re added automatically)
              </label>
              <textarea
                value={memberNames}
                onChange={e => setMemberNames(e.target.value)}
                placeholder={"Sarah\nMike\nJenny\nDave"}
                rows={4}
                className="w-full p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 focus:border-gold/30 focus:outline-none resize-none"
              />
            </div>
            
            {error && (
              <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
                {error}
              </div>
            )}
            
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCreate}
                disabled={loading}
                className="flex-1 py-3.5 rounded-xl font-black uppercase tracking-wider bg-gradient-to-r from-gold/20 to-yellow-600/20 text-gold border border-gold/30 hover:border-gold/50 transition-all"
              >
                {loading ? 'Creating...' : '🎰 Create Pool'}
              </button>
              <button
                onClick={() => setStep('landing')}
                className="px-6 py-3.5 rounded-xl text-gray-500 border border-white/10 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Features list */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="glass-card text-center border-white/5">
          <div className="text-2xl mb-2">💰</div>
          <h3 className="font-bold text-sm">Track Payments</h3>
          <p className="text-xs text-gray-500 mt-1">See who&apos;s paid and who hasn&apos;t</p>
        </div>
        <div className="glass-card text-center border-white/5">
          <div className="text-2xl mb-2">📸</div>
          <h3 className="font-bold text-sm">Ticket Photos</h3>
          <p className="text-xs text-gray-500 mt-1">Upload photos of purchased tickets</p>
        </div>
        <div className="glass-card text-center border-white/5">
          <div className="text-2xl mb-2">✂️</div>
          <h3 className="font-bold text-sm">Fair Splits</h3>
          <p className="text-xs text-gray-500 mt-1">Auto-calculate each person&apos;s share</p>
        </div>
      </div>
    </div>
  );
}
