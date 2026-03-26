'use client';

import { useState, useEffect } from 'react';
import { GAMES } from '@/lib/games';
import { TicketUpload } from '@/components/TicketUpload';
import Link from 'next/link';

interface Member {
  id: number;
  name: string;
  email: string | null;
  paid: number;
  paid_at: string | null;
  status: string;
}

interface Ticket {
  id: number;
  numbers: string;
  bonus_number: string | null;
  ticket_photo: string | null;
  purchased_by: string | null;
  is_winner: number;
  prize_amount: number;
  match_details: string | null;
}

interface Pool {
  id: string;
  name: string;
  created_by: string;
  game_id: string;
  buy_in: number;
  draw_date: string | null;
  share_code: string;
  status: string;
  notes: string | null;
}

export default function PoolDetailPage({ params }: { params: { code: string } }) {
  const [pool, setPool] = useState<Pool | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add member form
  const [newMember, setNewMember] = useState('');
  // Add ticket form
  const [newTicketNumbers, setNewTicketNumbers] = useState('');
  const [newTicketBonus, setNewTicketBonus] = useState('');
  const [ticketPhotoUrl, setTicketPhotoUrl] = useState<string | null>(null);
  const [showAddTicket, setShowAddTicket] = useState(false);

  useEffect(() => {
    fetchPool();
  }, [params.code]);

  async function fetchPool() {
    try {
      const res = await fetch(`/api/pools?code=${params.code}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setPool(data.pool);
        setMembers(data.members);
        setTickets(data.tickets);
      }
    } catch {
      setError('Failed to load pool');
    }
    setLoading(false);
  }

  async function markPaid(name: string) {
    await fetch('/api/pools/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poolId: pool?.id, name, action: 'mark_paid' }),
    });
    fetchPool();
  }

  async function addMember() {
    if (!newMember.trim()) return;
    await fetch('/api/pools/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poolId: pool?.id, name: newMember.trim(), action: 'join' }),
    });
    setNewMember('');
    fetchPool();
  }

  async function addTicket() {
    if (!newTicketNumbers.trim()) return;
    if (!ticketPhotoUrl) {
      alert('A verified ticket photo is required to add a ticket.');
      return;
    }
    await fetch('/api/pools/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        poolId: pool?.id, 
        numbers: newTicketNumbers.trim(),
        bonusNumber: newTicketBonus || null,
        ticketPhoto: ticketPhotoUrl,
      }),
    });
    setNewTicketNumbers('');
    setNewTicketBonus('');
    setTicketPhotoUrl(null);
    setShowAddTicket(false);
    fetchPool();
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl animate-bounce mb-4">🎰</div>
        <p className="text-gray-400">Loading pool...</p>
      </div>
    );
  }

  if (error || !pool) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="glass-card">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-white mb-2">Pool Not Found</h1>
          <p className="text-gray-400 mb-4">{error || 'This pool code is invalid or expired.'}</p>
          <Link href="/pool" className="text-neon hover:underline">← Back to Pool Manager</Link>
        </div>
      </div>
    );
  }

  const game = GAMES[pool.game_id];
  const totalCollected = members.reduce((s, m) => s + m.paid, 0);
  const totalExpected = members.length * pool.buy_in;
  const paidCount = members.filter(m => m.status === 'paid').length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="glass-card mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-white">{pool.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gold">{game?.name || pool.game_id}</span>
              {pool.draw_date && <span className="text-sm text-gray-500">Draw: {pool.draw_date}</span>}
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            pool.status === 'active' ? 'ev-badge-play' : 'ev-badge-skip'
          }`}>
            {pool.status.toUpperCase()}
          </span>
        </div>
        
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 p-3 rounded-xl bg-white/[0.02]">
          <div className="text-center">
            <div className="text-xl font-black text-gold">{members.length}</div>
            <div className="text-xs text-gray-500">Members</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-neon">{paidCount}/{members.length}</div>
            <div className="text-xs text-gray-500">Paid</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-white">${totalCollected}</div>
            <div className="text-xs text-gray-500">of ${totalExpected}</div>
          </div>
        </div>

        {/* Share button */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 p-2 rounded-lg bg-dark-900/50 text-xs text-gray-400 font-mono truncate">
            luckmaker3000.com/pool/{pool.share_code}
          </div>
          <button 
            onClick={() => navigator.clipboard.writeText(`https://luckmaker3000.com/pool/${pool.share_code}`)}
            className="px-3 py-2 rounded-lg bg-neon/10 text-neon text-xs font-bold border border-neon/20 hover:bg-neon/20 transition-all flex-shrink-0"
          >
            📋 Copy
          </button>
        </div>
      </div>

      {/* Members */}
      <div className="glass-card mb-6">
        <h2 className="font-black text-lg mb-4">👥 Members</h2>
        <div className="space-y-2">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
              <div>
                <span className="font-bold text-white">{member.name}</span>
                {member.name === pool.created_by && (
                  <span className="ml-2 text-xs text-gold">Captain</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {member.status === 'paid' ? (
                  <span className="text-xs font-bold px-3 py-1 rounded-full ev-badge-play">
                    ✓ PAID ${member.paid}
                  </span>
                ) : (
                  <button
                    onClick={() => markPaid(member.name)}
                    className="text-xs font-bold px-3 py-1 rounded-full ev-badge-borderline cursor-pointer hover:bg-gold/20 transition-all"
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Add member */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={newMember}
            onChange={e => setNewMember(e.target.value)}
            placeholder="Add member name"
            onKeyDown={e => e.key === 'Enter' && addMember()}
            className="flex-1 p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 focus:border-gold/30 focus:outline-none"
          />
          <button
            onClick={addMember}
            className="px-4 py-3 rounded-xl bg-white/5 text-gray-300 font-bold hover:bg-white/10 transition-all"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Tickets */}
      <div className="glass-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-lg">🎫 Tickets</h2>
          {!showAddTicket && (
            <button
              onClick={() => setShowAddTicket(true)}
              className="px-4 py-2 rounded-xl bg-gold/10 text-gold text-sm font-bold border border-gold/20 hover:bg-gold/20 transition-all"
            >
              + Add Ticket
            </button>
          )}
        </div>
        
        {tickets.length === 0 && !showAddTicket ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">📸</div>
            <p className="text-gray-500 text-sm mb-1">No tickets yet</p>
            <p className="text-xs text-gray-600">Take a photo of your purchased ticket to add it.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {tickets.map(ticket => (
              <div key={ticket.id} className={`rounded-xl overflow-hidden ${ticket.is_winner ? 'border border-gold/20' : 'border border-white/5'}`}>
                {ticket.ticket_photo && (
                  <div className="bg-dark-900/50">
                    <img 
                      src={ticket.ticket_photo} 
                      alt="Ticket photo" 
                      className="w-full max-h-48 object-contain cursor-pointer"
                      onClick={() => window.open(ticket.ticket_photo!, '_blank')}
                    />
                  </div>
                )}
                <div className={`p-3 ${ticket.is_winner ? 'bg-gold/10' : 'bg-white/[0.02]'}`}>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ticket.numbers.split(',').map((num, j) => (
                      <span key={j} className="lottery-ball lottery-ball-sm">{num.trim()}</span>
                    ))}
                    {ticket.bonus_number && (
                      <>
                        <span className="text-gray-600 text-xs mx-0.5">+</span>
                        <span className="lottery-ball lottery-ball-sm lottery-ball-bonus">{ticket.bonus_number}</span>
                      </>
                    )}
                    {ticket.ticket_photo && (
                      <span className="ml-auto text-xs text-neon/60">📸 Verified</span>
                    )}
                  </div>
                  {ticket.match_details && (
                    <p className="text-xs text-gold mt-2">{ticket.match_details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add ticket with photo */}
        {showAddTicket && (
          <div className="p-4 rounded-xl border border-gold/10 bg-gold/[0.02] space-y-4">
            <h3 className="font-bold text-sm text-gold">Add Ticket</h3>
            
            {/* Step 1: Photo (required) */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Step 1: Ticket Photo <span className="text-danger">*required</span>
              </label>
              <TicketUpload 
                poolId={pool.id}
                gameId={pool.game_id}
                drawDate={pool.draw_date || undefined}
                onUploaded={(data) => {
                  setTicketPhotoUrl(data.photoUrl);
                  // Auto-fill numbers from AI extraction
                  if (data.extractedData.numbers) {
                    setNewTicketNumbers(data.extractedData.numbers);
                  }
                  if (data.extractedData.bonusNumber) {
                    setNewTicketBonus(data.extractedData.bonusNumber);
                  }
                }}
              />
            </div>

            {/* Step 2: Numbers (auto-filled by AI or manual) */}
            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                Step 2: Numbers {ticketPhotoUrl ? '(AI pre-filled — verify)' : '(enter after photo)'}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newTicketNumbers}
                  onChange={e => setNewTicketNumbers(e.target.value)}
                  placeholder="e.g., 7, 14, 23, 45, 62"
                  disabled={!ticketPhotoUrl}
                  className="flex-1 p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 focus:border-gold/30 focus:outline-none disabled:opacity-30"
                />
                {game && game.bonusNumbers > 0 && (
                  <input
                    type="text"
                    value={newTicketBonus}
                    onChange={e => setNewTicketBonus(e.target.value)}
                    placeholder="Bonus"
                    disabled={!ticketPhotoUrl}
                    className="w-24 p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 focus:border-gold/30 focus:outline-none disabled:opacity-30"
                  />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={addTicket}
                disabled={!ticketPhotoUrl || !newTicketNumbers.trim()}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-gold/20 to-yellow-600/20 text-gold border border-gold/30 hover:border-gold/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ✓ Add Verified Ticket
              </button>
              <button
                onClick={() => { setShowAddTicket(false); setTicketPhotoUrl(null); setNewTicketNumbers(''); setNewTicketBonus(''); }}
                className="px-4 py-3 rounded-xl text-gray-500 border border-white/10 hover:bg-white/5 transition-all text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Winnings Calculator */}
      {tickets.some(t => t.is_winner) && (
        <div className="glass-card glow-gold mb-6">
          <h2 className="font-black text-lg text-gold mb-3">🏆 Winnings!</h2>
          <div className="text-sm text-gray-400">
            Total prize: <span className="text-gold font-bold">${tickets.reduce((s, t) => s + t.prize_amount, 0).toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Per person ({paidCount} paid members): <span className="text-neon font-bold">
              ${(tickets.reduce((s, t) => s + t.prize_amount, 0) / Math.max(paidCount, 1)).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="text-center">
        <Link href="/pool" className="text-sm text-gray-500 hover:text-neon transition-colors">
          ← Back to Pool Manager
        </Link>
      </div>
    </div>
  );
}
