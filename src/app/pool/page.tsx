'use client';

import { useState } from 'react';
import { GAMES } from '@/lib/games';
import Link from 'next/link';

const poolGames = Object.values(GAMES).filter(g =>
  ['powerball', 'mega_millions', 'lotto_texas', 'texas_two_step', 'cash_five'].includes(g.id)
);

export default function PoolPage() {
  const [view, setView] = useState<'landing' | 'create' | 'success'>('landing');
  const [step, setStep] = useState(1);

  // Form state
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

  const totalSteps = 3;

  function nextStep() {
    if (step === 1) {
      if (!poolName.trim() || !createdBy.trim()) {
        setError('Pool name and your name are required.');
        return;
      }
      setError('');
    }
    if (step === 2) {
      if (!drawDate) {
        setError('Draw date is required — this locks the pool timeline.');
        return;
      }
      setError('');
    }
    setStep(s => Math.min(s + 1, totalSteps));
  }

  async function handleCreate() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: poolName.trim(),
          createdBy: createdBy.trim(),
          creatorEmail: creatorEmail.trim() || undefined,
          gameId,
          buyIn: parseFloat(buyIn) || 5,
          drawDate,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        setView('success');
      }
    } catch {
      setError('Failed to create pool — check your connection.');
    }
    setLoading(false);
  }

  // ---- SUCCESS ----
  if (view === 'success' && result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="glass-card text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-black text-gold text-glow-gold mb-2">Pool Created!</h1>
          <p className="text-gray-400 mb-6">Share this link with your group. Everyone can see the pool, confirm payment, and track tickets.</p>

          <div className="bg-dark-900/50 rounded-xl p-4 mb-6">
            <div className="text-xs text-gray-500 mb-1">Share Link</div>
            <div className="text-neon font-mono text-sm break-all select-all">{result.shareUrl}</div>
            <button
              onClick={() => navigator.clipboard.writeText(result.shareUrl)}
              className="mt-3 px-4 py-2 rounded-lg bg-neon/10 text-neon text-sm font-bold border border-neon/20 hover:bg-neon/20 transition-all"
            >
              📋 Copy Link
            </button>
          </div>

          <div className="glass-card border-gold/10 text-left mb-6">
            <h3 className="font-black text-sm text-gold mb-2">📋 Next Steps</h3>
            <ol className="text-sm text-gray-400 space-y-2 list-decimal ml-4">
              <li>Send the link to everyone in the pool</li>
              <li>Each member opens the link and confirms their payment</li>
              <li>Buy tickets and upload photos (AI verifies each one)</li>
              <li>Lock the pool before the draw</li>
              <li>After the draw, results are checked automatically</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/pool/${result.shareCode}`}
              className="px-6 py-3 rounded-xl font-bold text-dark-900 bg-gradient-to-r from-gold to-yellow-500 transition-all"
            >
              View Pool →
            </Link>
            <button
              onClick={() => { setResult(null); setView('landing'); setStep(1); }}
              className="px-6 py-3 rounded-xl font-bold text-gray-400 border border-white/10 hover:bg-white/5 transition-all"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- LANDING ----
  if (view === 'landing') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight animate-fade-in-up">
          👥 Lottery <span className="text-gold text-glow-gold">Pool Manager</span>
        </h1>
        <p className="text-gray-500 mb-8 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          The tamper-proof way to run a group lottery pool. Every action logged, every ticket verified.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => setView('create')}
            className="glass-card text-left group hover:border-gold/20 transition-all"
          >
            <div className="text-3xl mb-3">🆕</div>
            <h2 className="text-lg font-black text-white group-hover:text-gold transition-colors">Start a Pool</h2>
            <p className="text-sm text-gray-400 mt-2">
              You&apos;ll be the captain. Add members, buy tickets, and manage the pool.
            </p>
          </button>

          <div className="glass-card">
            <div className="text-3xl mb-3">🔗</div>
            <h2 className="text-lg font-black text-white mb-3">Join a Pool</h2>
            <p className="text-sm text-gray-400 mb-4">Got a pool link or code from your captain?</p>
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
                Go
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="glass-card mb-8">
          <h2 className="font-black text-lg mb-4">🔒 How It Works — No Trust Required</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { step: '1', icon: '📝', title: 'Captain creates pool', desc: 'Set the game, buy-in amount, and draw date. Share the link with your group.' },
              { step: '2', icon: '✅', title: 'Members join & confirm', desc: 'Each person opens the link, joins with their name, and confirms their own payment.' },
              { step: '3', icon: '📸', title: 'Upload ticket photos', desc: 'Every ticket must be photographed. AI verifies it\'s a real ticket with correct game/date.' },
              { step: '4', icon: '🔐', title: 'Pool locks before draw', desc: 'Captain locks the pool. No members or tickets can be changed after lock. Timestamps prove everything.' },
              { step: '5', icon: '🎯', title: 'Auto result check', desc: 'After the draw, the system checks all tickets automatically. No one can hide a win.' },
              { step: '6', icon: '💰', title: 'Fair split calculated', desc: 'Winnings divided equally among paid members. Full audit trail available.' },
            ].map(item => (
              <div key={item.step} className="flex gap-3 p-3 rounded-xl bg-white/[0.02]">
                <div className="text-2xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-sm text-white">Step {item.step}: {item.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust signals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card text-center border-white/5">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-bold text-sm">Full Audit Log</h3>
            <p className="text-xs text-gray-500 mt-1">Every action timestamped and immutable</p>
          </div>
          <div className="glass-card text-center border-white/5">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-bold text-sm">AI Ticket Verification</h3>
            <p className="text-xs text-gray-500 mt-1">Claude Vision confirms real tickets</p>
          </div>
          <div className="glass-card text-center border-white/5">
            <div className="text-2xl mb-2">🔐</div>
            <h3 className="font-bold text-sm">Tamper-Proof</h3>
            <p className="text-xs text-gray-500 mt-1">Lock before draw, auto-check results</p>
          </div>
        </div>
      </div>
    );
  }

  // ---- CREATE WIZARD ----
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-black mb-6">
        🆕 Create a <span className="text-gold">Pool</span>
      </h1>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              s < step ? 'bg-neon/20 text-neon border border-neon/30' :
              s === step ? 'bg-gold/20 text-gold border border-gold/30' :
              'bg-white/5 text-gray-600 border border-white/5'
            }`}>
              {s < step ? '✓' : s}
            </div>
            {s < 3 && <div className={`h-0.5 flex-1 rounded ${s < step ? 'bg-neon/30' : 'bg-white/5'}`} />}
          </div>
        ))}
      </div>

      <div className="glass-card">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-black text-lg mb-1">Step 1: Pool Details</h2>
              <p className="text-sm text-gray-500">Name your pool and identify yourself as captain.</p>
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Pool Name *</label>
              <input
                type="text"
                value={poolName}
                onChange={e => setPoolName(e.target.value)}
                placeholder="e.g., Friday Office Powerball"
                className="w-full p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 focus:border-gold/30 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Your Name (Captain) *</label>
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

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-500">
              <strong className="text-gray-400">👑 Captain Responsibilities:</strong> You&apos;re in charge of buying tickets (with photo proof), 
              collecting payments, and locking the pool before the draw. All your actions are logged.
            </div>
          </div>
        )}

        {/* Step 2: Game & Draw */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-black text-lg mb-1">Step 2: Game & Draw</h2>
              <p className="text-sm text-gray-500">Which game and draw are you pooling for?</p>
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Game</label>
              <select
                value={gameId}
                onChange={e => setGameId(e.target.value)}
                className="w-full p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white focus:border-gold/30 focus:outline-none"
              >
                {poolGames.map(g => (
                  <option key={g.id} value={g.id}>{g.name} — ${g.ticketCost}/ticket</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Draw Date *</label>
                <input
                  type="date"
                  value={drawDate}
                  onChange={e => setDrawDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white focus:border-gold/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Buy-In Per Person ($)</label>
                <input
                  type="number"
                  value={buyIn}
                  onChange={e => setBuyIn(e.target.value)}
                  min="1"
                  step="1"
                  className="w-full p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white focus:border-gold/30 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gold/5 border border-gold/10 text-xs text-gray-400">
              <strong className="text-gold">🔐 Why draw date matters:</strong> The pool locks based on this date. 
              Ticket photos are timestamped to prove they were uploaded before results. This prevents anyone from 
              adding or swapping tickets after seeing winning numbers.
            </div>
          </div>
        )}

        {/* Step 3: Members */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-black text-lg mb-1">Step 3: Add Members</h2>
              <p className="text-sm text-gray-500">List everyone in the pool. They can also join via the share link.</p>
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                Members (one per line — you&apos;re added automatically)
              </label>
              <textarea
                value={memberNames}
                onChange={e => setMemberNames(e.target.value)}
                placeholder={"Sarah\nMike\nJenny\nDave"}
                rows={5}
                className="w-full p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 focus:border-gold/30 focus:outline-none resize-none"
              />
              <p className="text-xs text-gray-600 mt-1">
                Don&apos;t worry — members can also join themselves via the share link.
              </p>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="font-bold text-sm text-white mb-2">Pool Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Pool:</div>
                <div className="text-white font-bold">{poolName}</div>
                <div className="text-gray-500">Captain:</div>
                <div className="text-gold">{createdBy}</div>
                <div className="text-gray-500">Game:</div>
                <div className="text-white">{GAMES[gameId]?.name}</div>
                <div className="text-gray-500">Draw:</div>
                <div className="text-white">{drawDate}</div>
                <div className="text-gray-500">Buy-in:</div>
                <div className="text-white">${buyIn}/person</div>
                <div className="text-gray-500">Members:</div>
                <div className="text-white">{1 + memberNames.split('\n').filter(n => n.trim()).length} (incl. you)</div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="px-6 py-3 rounded-xl text-gray-400 border border-white/10 hover:bg-white/5 transition-all"
            >
              ← Back
            </button>
          )}
          {step < totalSteps ? (
            <button
              onClick={nextStep}
              className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-gold/20 to-yellow-600/20 text-gold border border-gold/30 hover:border-gold/50 transition-all"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-black uppercase tracking-wider bg-gradient-to-r from-gold/20 to-yellow-600/20 text-gold border border-gold/30 hover:border-gold/50 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : '🎰 Create Pool'}
            </button>
          )}
          {step === 1 && (
            <button
              onClick={() => setView('landing')}
              className="px-6 py-3 rounded-xl text-gray-500 border border-white/10 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
