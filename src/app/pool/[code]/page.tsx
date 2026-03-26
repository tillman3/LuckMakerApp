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
  self_confirmed: number;
  confirmed_at: string | null;
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
  created_at: string;
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
  locked_at: string | null;
  auto_checked: number;
  results_summary: string | null;
}

interface AuditEntry {
  id: number;
  action: string;
  actor: string;
  details: string | null;
  created_at: string;
}

export default function PoolDetailPage({ params }: { params: { code: string } }) {
  const [pool, setPool] = useState<Pool | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Join form
  const [showJoin, setShowJoin] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');

  // Add ticket
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [newTicketNumbers, setNewTicketNumbers] = useState('');
  const [newTicketBonus, setNewTicketBonus] = useState('');
  const [ticketPhotoUrl, setTicketPhotoUrl] = useState<string | null>(null);

  // Audit log toggle
  const [showAudit, setShowAudit] = useState(false);

  // Identity (stored in localStorage per pool)
  const [myName, setMyName] = useState('');

  useEffect(() => {
    fetchPool();
    const stored = localStorage.getItem(`lm3k_pool_${params.code}_name`);
    if (stored) setMyName(stored);
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
        setAuditLog(data.auditLog || []);
      }
    } catch {
      setError('Failed to load pool');
    }
    setLoading(false);
  }

  async function handleJoin() {
    if (!joinName.trim()) return;
    const res = await fetch('/api/pools/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poolId: pool?.id, name: joinName.trim(), email: joinEmail.trim() || undefined, action: 'join' }),
    });
    const data = await res.json();
    if (data.error) { alert(data.error); return; }
    localStorage.setItem(`lm3k_pool_${params.code}_name`, joinName.trim());
    setMyName(joinName.trim());
    setShowJoin(false);
    setJoinName('');
    fetchPool();
  }

  async function handleConfirmPayment(name: string) {
    await fetch('/api/pools/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poolId: pool?.id, name, action: 'confirm_payment' }),
    });
    fetchPool();
  }

  async function handleCaptainMarkPaid(name: string) {
    await fetch('/api/pools/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poolId: pool?.id, name, actor: pool?.created_by, action: 'mark_paid' }),
    });
    fetchPool();
  }

  async function handleLock() {
    if (!confirm('Lock this pool? No more members can join or be removed. This cannot be undone.')) return;
    await fetch('/api/pools/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poolId: pool?.id, actor: pool?.created_by, action: 'lock' }),
    });
    fetchPool();
  }

  async function addTicket() {
    if (!newTicketNumbers.trim() || !ticketPhotoUrl) {
      alert('Both a verified ticket photo and numbers are required.');
      return;
    }
    const res = await fetch('/api/pools/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        poolId: pool?.id,
        numbers: newTicketNumbers.trim(),
        bonusNumber: newTicketBonus || null,
        ticketPhoto: ticketPhotoUrl,
        purchasedBy: myName || pool?.created_by,
      }),
    });
    const data = await res.json();
    if (data.error) { alert(data.error); return; }
    setNewTicketNumbers('');
    setNewTicketBonus('');
    setTicketPhotoUrl(null);
    setShowAddTicket(false);
    fetchPool();
  }

  const isLocked = pool?.status === 'locked' || pool?.status === 'completed';
  const isCaptain = myName === pool?.created_by;
  const isCompleted = pool?.status === 'completed';
  const game = pool ? GAMES[pool.game_id] : null;
  const paidCount = members.filter(m => m.status === 'paid' || m.status === 'captain').length;
  const totalCollected = members.reduce((s, m) => s + m.paid, 0);
  const totalExpected = members.length * (pool?.buy_in || 0);

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
          <p className="text-gray-400 mb-4">{error || 'Invalid or expired pool code.'}</p>
          <Link href="/pool" className="text-neon hover:underline">← Back to Pool Manager</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="glass-card mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{pool.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-sm text-gold">{game?.name || pool.game_id}</span>
              {pool.draw_date && <span className="text-sm text-gray-500">· Draw: {pool.draw_date}</span>}
              <span className="text-xs text-gray-600">· Captain: {pool.created_by}</span>
            </div>
          </div>
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
            isCompleted ? 'bg-white/10 text-gray-400' :
            isLocked ? 'bg-danger/10 text-danger border border-danger/20' :
            'bg-neon/10 text-neon border border-neon/20'
          }`}>
            {pool.status === 'completed' ? '✓ CHECKED' : isLocked ? '🔐 LOCKED' : '● OPEN'}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-white/[0.02] mb-3">
          <div className="text-center">
            <div className="text-lg font-black text-gold">{members.length}</div>
            <div className="text-[10px] text-gray-500 uppercase">Members</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-neon">{paidCount}/{members.length}</div>
            <div className="text-[10px] text-gray-500 uppercase">Paid</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-black text-white">{tickets.length}</div>
            <div className="text-[10px] text-gray-500 uppercase">Tickets</div>
          </div>
        </div>

        {/* Share */}
        <div className="flex items-center gap-2">
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

        {/* Lock pool button (captain only, when open) */}
        {!isLocked && isCaptain && members.length >= 2 && (
          <button
            onClick={handleLock}
            className="w-full mt-3 py-2.5 rounded-xl text-sm font-bold bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-all"
          >
            🔐 Lock Pool (No More Changes)
          </button>
        )}
      </div>

      {/* Results banner */}
      {isCompleted && pool.results_summary && (
        <div className={`glass-card mb-6 ${pool.results_summary.includes('No winning') ? 'border-white/5' : 'border-gold/20 glow-gold'}`}>
          <h2 className="font-black text-lg mb-2">{pool.results_summary.includes('No winning') ? '😔' : '🏆'} Results</h2>
          <p className="text-sm text-gray-300">{pool.results_summary}</p>
          {paidCount > 0 && tickets.some(t => t.prize_amount > 0) && (
            <p className="text-sm text-gold mt-2 font-bold">
              Per person: ${(tickets.reduce((s, t) => s + t.prize_amount, 0) / paidCount).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Identity check — if visitor hasn't identified */}
      {!myName && !isCompleted && (
        <div className="glass-card mb-6 border-gold/10">
          <h2 className="font-black text-sm text-gold mb-2">👋 Who are you?</h2>
          <p className="text-xs text-gray-400 mb-3">Select your name to confirm payment or join the pool.</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {members.map(m => (
              <button
                key={m.id}
                onClick={() => { setMyName(m.name); localStorage.setItem(`lm3k_pool_${params.code}_name`, m.name); }}
                className="px-3 py-2 rounded-xl text-sm bg-white/5 text-gray-300 border border-white/5 hover:border-gold/30 hover:text-gold transition-all"
              >
                {m.name}
              </button>
            ))}
          </div>
          <button onClick={() => setShowJoin(true)} className="text-xs text-neon hover:underline">
            Not listed? Join the pool →
          </button>
        </div>
      )}

      {/* Members */}
      <div className="glass-card mb-6">
        <h2 className="font-black text-lg mb-4">👥 Members</h2>
        <div className="space-y-2">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02]">
              <div>
                <span className="font-bold text-sm text-white">{member.name}</span>
                {member.status === 'captain' && <span className="ml-2 text-[10px] text-gold font-bold">👑 CAPTAIN</span>}
                {member.name === myName && <span className="ml-2 text-[10px] text-neon">(You)</span>}
              </div>
              <div className="flex items-center gap-2">
                {member.self_confirmed ? (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-neon/10 text-neon border border-neon/20">
                    ✓ CONFIRMED
                  </span>
                ) : member.status === 'paid' || member.status === 'captain' ? (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-neon/10 text-neon border border-neon/20">
                    ✓ PAID
                  </span>
                ) : member.name === myName && !isLocked ? (
                  <button
                    onClick={() => handleConfirmPayment(member.name)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-all"
                  >
                    Confirm I Paid ${pool.buy_in}
                  </button>
                ) : isCaptain && !isLocked ? (
                  <button
                    onClick={() => handleCaptainMarkPaid(member.name)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10 hover:bg-gold/10 hover:text-gold transition-all"
                  >
                    Mark Paid
                  </button>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 text-gray-500">PENDING</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Join */}
        {!isLocked && (
          <>
            {showJoin ? (
              <div className="mt-4 p-3 rounded-xl border border-white/10 bg-white/[0.01] space-y-2">
                <input
                  type="text"
                  value={joinName}
                  onChange={e => setJoinName(e.target.value)}
                  placeholder="Your name"
                  className="w-full p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 focus:border-gold/30 focus:outline-none"
                />
                <input
                  type="email"
                  value={joinEmail}
                  onChange={e => setJoinEmail(e.target.value)}
                  placeholder="Email (optional — for win notifications)"
                  className="w-full p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 focus:border-gold/30 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={handleJoin} className="flex-1 py-2.5 rounded-xl bg-gold/10 text-gold font-bold border border-gold/20 hover:bg-gold/20 transition-all text-sm">
                    Join Pool
                  </button>
                  <button onClick={() => setShowJoin(false)} className="px-4 py-2.5 rounded-xl text-gray-500 border border-white/10 text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowJoin(true)} className="mt-3 text-xs text-neon hover:underline">
                + Join this pool
              </button>
            )}
          </>
        )}
      </div>

      {/* Tickets */}
      <div className="glass-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-lg">🎫 Tickets</h2>
          {!isCompleted && (isCaptain || myName) && !showAddTicket && (
            <button
              onClick={() => setShowAddTicket(true)}
              className="px-4 py-2 rounded-xl bg-gold/10 text-gold text-xs font-bold border border-gold/20 hover:bg-gold/20 transition-all"
            >
              + Add Ticket
            </button>
          )}
        </div>

        {tickets.length === 0 && !showAddTicket ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">📸</div>
            <p className="text-gray-500 text-sm">No tickets yet.</p>
            <p className="text-xs text-gray-600 mt-1">Captain: buy tickets and upload photos for proof.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {tickets.map(ticket => (
              <div key={ticket.id} className={`rounded-xl overflow-hidden border ${ticket.is_winner ? 'border-gold/20' : 'border-white/5'}`}>
                {ticket.ticket_photo && (
                  <div className="bg-dark-900/50 relative">
                    <img
                      src={ticket.ticket_photo}
                      alt="Ticket"
                      className="w-full max-h-48 object-contain cursor-pointer"
                      onClick={() => window.open(ticket.ticket_photo!, '_blank')}
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-neon/20 text-neon text-[10px] font-bold border border-neon/30">
                      📸 Verified
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-dark-900/80 text-[10px] text-gray-400">
                      {new Date(ticket.created_at).toLocaleString()}
                    </div>
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
                  </div>
                  {ticket.purchased_by && (
                    <p className="text-[10px] text-gray-600 mt-1">Added by {ticket.purchased_by}</p>
                  )}
                  {ticket.match_details && (
                    <p className="text-xs text-gold mt-1 font-bold">{ticket.match_details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add ticket with photo */}
        {showAddTicket && (
          <div className="p-4 rounded-xl border border-gold/10 bg-gold/[0.02] space-y-4">
            <h3 className="font-bold text-sm text-gold">Add Ticket (Photo Required)</h3>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                Step 1: Take a photo of the ticket
              </label>
              <TicketUpload
                poolId={pool.id}
                gameId={pool.game_id}
                drawDate={pool.draw_date || undefined}
                onUploaded={(data) => {
                  setTicketPhotoUrl(data.photoUrl);
                  if (data.extractedData.numbers) setNewTicketNumbers(data.extractedData.numbers);
                  if (data.extractedData.bonusNumber) setNewTicketBonus(data.extractedData.bonusNumber);
                }}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                Step 2: Verify numbers {ticketPhotoUrl ? '(AI pre-filled)' : ''}
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

            <div className="flex gap-2">
              <button
                onClick={addTicket}
                disabled={!ticketPhotoUrl || !newTicketNumbers.trim()}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-gold/20 to-yellow-600/20 text-gold border border-gold/30 transition-all disabled:opacity-30"
              >
                ✓ Add Verified Ticket
              </button>
              <button
                onClick={() => { setShowAddTicket(false); setTicketPhotoUrl(null); setNewTicketNumbers(''); setNewTicketBonus(''); }}
                className="px-4 py-3 rounded-xl text-gray-500 border border-white/10 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Audit Log */}
      <div className="glass-card mb-6">
        <button
          onClick={() => setShowAudit(!showAudit)}
          className="flex items-center justify-between w-full"
        >
          <h2 className="font-black text-sm text-gray-400">📋 Audit Log ({auditLog.length} entries)</h2>
          <span className="text-gray-600 text-lg">{showAudit ? '−' : '+'}</span>
        </button>

        {showAudit && (
          <div className="mt-4 space-y-1.5 max-h-64 overflow-y-auto">
            {auditLog.map(entry => (
              <div key={entry.id} className="flex items-start gap-2 text-[11px] py-1.5 border-b border-white/[0.03] last:border-0">
                <span className="text-gray-600 flex-shrink-0 w-28">{new Date(entry.created_at).toLocaleString()}</span>
                <span className={`font-mono font-bold flex-shrink-0 w-32 ${
                  entry.action.includes('LOCK') ? 'text-danger' :
                  entry.action.includes('RESULT') ? 'text-gold' :
                  'text-neon/70'
                }`}>{entry.action}</span>
                <span className="text-gray-500">
                  <span className="text-gray-400">{entry.actor}</span>
                  {entry.details && ` — ${entry.details}`}
                </span>
              </div>
            ))}
            {auditLog.length === 0 && <p className="text-xs text-gray-600">No actions yet.</p>}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 mb-4">
        <p className="text-[10px] text-gray-500">
          🔒 All actions in this pool are timestamped and logged in an immutable audit trail. Ticket photos are
          AI-verified and timestamped before draw results. The pool can be locked by the captain to prevent
          changes after ticket purchase. Results are checked automatically by the system.
        </p>
      </div>

      <div className="text-center">
        <Link href="/pool" className="text-sm text-gray-500 hover:text-neon transition-colors">← Back to Pool Manager</Link>
      </div>
    </div>
  );
}
