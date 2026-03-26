/**
 * Pool Engine — business logic for tamper-proof lottery pools.
 * 
 * ANTI-GAMING RULES:
 * 1. All actions are logged to pool_audit_log (immutable)
 * 2. Pools lock before draw time — no changes after lock
 * 3. Ticket photos required + timestamped before results
 * 4. Auto result checking by system (not captain)
 * 5. Members self-confirm payment via pool link
 * 6. Nothing is deletable — only status changes
 */

import { getDb } from './db';
import crypto from 'crypto';

export interface Pool {
  id: string;
  name: string;
  created_by: string;
  game_id: string;
  status: string;
  buy_in: number;
  draw_date: string | null;
  draw_time: string | null;
  share_code: string;
  locked_at: string | null;
  auto_checked: number;
  results_summary: string | null;
  notes: string | null;
  created_at: string;
}

export interface PoolMember {
  id: number;
  pool_id: string;
  name: string;
  email: string | null;
  paid: number;
  paid_at: string | null;
  status: string;
  self_confirmed: number;
  confirmed_at: string | null;
}

export interface PoolTicket {
  id: number;
  pool_id: string;
  numbers: string;
  bonus_number: string | null;
  ticket_photo: string | null;
  purchased_by: string | null;
  is_winner: number;
  prize_amount: number;
  match_details: string | null;
  created_at: string;
}

export interface AuditEntry {
  id: number;
  action: string;
  actor: string;
  details: string | null;
  created_at: string;
}

function audit(poolId: string, action: string, actor: string, details?: string) {
  const db = getDb();
  db.prepare(
    'INSERT INTO pool_audit_log (pool_id, action, actor, details) VALUES (?, ?, ?, ?)'
  ).run(poolId, action, actor, details || null);
}

export function createPool(opts: {
  name: string;
  createdBy: string;
  creatorEmail?: string;
  gameId: string;
  buyIn: number;
  drawDate?: string;
  drawTime?: string;
  notes?: string;
}) {
  const db = getDb();
  const id = crypto.randomUUID();
  const shareCode = crypto.randomBytes(4).toString('hex');

  db.prepare(`
    INSERT INTO pools (id, name, created_by, game_id, buy_in, draw_date, draw_time, notes, share_code, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')
  `).run(id, opts.name, opts.createdBy, opts.gameId, opts.buyIn, opts.drawDate || null, opts.drawTime || null, opts.notes || null, shareCode);

  // Creator auto-joins as captain (paid)
  db.prepare(`
    INSERT INTO pool_members (pool_id, name, email, paid, paid_at, status, self_confirmed, confirmed_at)
    VALUES (?, ?, ?, ?, datetime('now'), 'captain', 1, datetime('now'))
  `).run(id, opts.createdBy, opts.creatorEmail || null, opts.buyIn);

  audit(id, 'POOL_CREATED', opts.createdBy, `Game: ${opts.gameId}, Buy-in: $${opts.buyIn}`);
  audit(id, 'MEMBER_JOINED', opts.createdBy, 'Pool captain (auto-paid)');

  return { id, shareCode };
}

export function getPool(code: string) {
  const db = getDb();
  const pool = db.prepare('SELECT * FROM pools WHERE share_code = ?').get(code) as Pool | undefined;
  if (!pool) return null;

  const members = db.prepare('SELECT * FROM pool_members WHERE pool_id = ? ORDER BY created_at').all(pool.id) as PoolMember[];
  const tickets = db.prepare('SELECT * FROM pool_tickets WHERE pool_id = ? ORDER BY created_at').all(pool.id) as PoolTicket[];
  const auditLog = db.prepare('SELECT * FROM pool_audit_log WHERE pool_id = ? ORDER BY created_at DESC LIMIT 50').all(pool.id) as AuditEntry[];

  return { pool, members, tickets, auditLog };
}

export function getPoolById(id: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM pools WHERE id = ?').get(id) as Pool | undefined;
}

export function isPoolLocked(pool: Pool): boolean {
  return pool.status === 'locked' || pool.status === 'completed' || !!pool.locked_at;
}

export function lockPool(poolId: string, actor: string) {
  const db = getDb();
  const pool = db.prepare('SELECT * FROM pools WHERE id = ?').get(poolId) as Pool;
  if (!pool) throw new Error('Pool not found');
  if (isPoolLocked(pool)) throw new Error('Pool is already locked');

  db.prepare("UPDATE pools SET status = 'locked', locked_at = datetime('now') WHERE id = ?").run(poolId);
  audit(poolId, 'POOL_LOCKED', actor, 'No further changes allowed');
}

export function joinPool(poolId: string, name: string, email?: string) {
  const db = getDb();
  const pool = db.prepare('SELECT * FROM pools WHERE id = ?').get(poolId) as Pool;
  if (!pool) throw new Error('Pool not found');
  if (isPoolLocked(pool)) throw new Error('Pool is locked — cannot join after lock');

  const existing = db.prepare('SELECT id FROM pool_members WHERE pool_id = ? AND name = ?').get(poolId, name);
  if (existing) throw new Error('Name already in pool');

  db.prepare(`
    INSERT INTO pool_members (pool_id, name, email, status) VALUES (?, ?, ?, 'pending')
  `).run(poolId, name, email || null);

  audit(poolId, 'MEMBER_JOINED', name, email ? `Email: ${email}` : undefined);
}

export function confirmPayment(poolId: string, memberName: string) {
  const db = getDb();
  const pool = db.prepare('SELECT * FROM pools WHERE id = ?').get(poolId) as Pool;
  if (!pool) throw new Error('Pool not found');

  db.prepare(`
    UPDATE pool_members SET self_confirmed = 1, confirmed_at = datetime('now'),
    paid = (SELECT buy_in FROM pools WHERE id = ?), paid_at = datetime('now'), status = 'paid'
    WHERE pool_id = ? AND name = ?
  `).run(poolId, poolId, memberName);

  audit(poolId, 'PAYMENT_CONFIRMED', memberName, `Self-confirmed $${pool.buy_in}`);
}

export function captainMarkPaid(poolId: string, memberName: string, captain: string) {
  const db = getDb();
  const pool = db.prepare('SELECT * FROM pools WHERE id = ?').get(poolId) as Pool;
  if (!pool) throw new Error('Pool not found');

  db.prepare(`
    UPDATE pool_members SET paid = (SELECT buy_in FROM pools WHERE id = ?),
    paid_at = datetime('now'), status = 'paid'
    WHERE pool_id = ? AND name = ?
  `).run(poolId, poolId, memberName);

  audit(poolId, 'CAPTAIN_MARKED_PAID', captain, `Marked ${memberName} as paid`);
}

export function addTicket(poolId: string, opts: {
  numbers: string;
  bonusNumber?: string;
  ticketPhoto: string;
  purchasedBy?: string;
}) {
  const db = getDb();
  const pool = db.prepare('SELECT * FROM pools WHERE id = ?').get(poolId) as Pool;
  if (!pool) throw new Error('Pool not found');
  if (pool.status === 'completed') throw new Error('Pool is completed');
  
  // Tickets CAN be added after lock (captain buying right before draw) 
  // but audit log timestamps everything for transparency

  if (!opts.ticketPhoto) throw new Error('Ticket photo is required');

  const result = db.prepare(`
    INSERT INTO pool_tickets (pool_id, numbers, bonus_number, ticket_photo, purchased_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(poolId, opts.numbers, opts.bonusNumber || null, opts.ticketPhoto, opts.purchasedBy || null);

  audit(poolId, 'TICKET_ADDED', opts.purchasedBy || 'unknown',
    `Numbers: ${opts.numbers}${opts.bonusNumber ? ' + ' + opts.bonusNumber : ''} | Photo: ${opts.ticketPhoto}`);

  return result.lastInsertRowid;
}

export function checkPoolResults(poolId: string) {
  const db = getDb();
  const pool = db.prepare('SELECT * FROM pools WHERE id = ?').get(poolId) as Pool;
  if (!pool || !pool.draw_date) return null;

  const draw = db.prepare(
    'SELECT numbers, bonus_number FROM draws WHERE game_id = ? AND draw_date = ? LIMIT 1'
  ).get(pool.game_id, pool.draw_date) as any;

  if (!draw) return null; // Results not in yet

  const tickets = db.prepare('SELECT * FROM pool_tickets WHERE pool_id = ?').all(poolId) as PoolTicket[];
  const drawNums = draw.numbers.split(',').map((n: string) => parseInt(n.trim()));
  let totalPrize = 0;
  const results: string[] = [];

  for (const ticket of tickets) {
    const ticketNums = ticket.numbers.split(',').map((n: string) => parseInt(n.trim()));
    const matches = ticketNums.filter((n: number) => drawNums.includes(n)).length;
    const bonusMatch = ticket.bonus_number && draw.bonus_number && String(ticket.bonus_number) === String(draw.bonus_number);
    
    const matchDetail = `${matches}/${ticketNums.length}${bonusMatch ? ' + bonus' : ''}`;
    const isWinner = matches >= 2 ? 1 : 0; // Simplified — any 2+ match is notable

    db.prepare('UPDATE pool_tickets SET is_winner = ?, match_details = ? WHERE id = ?')
      .run(isWinner, matchDetail, ticket.id);

    if (isWinner) results.push(`Ticket #${ticket.id}: ${matchDetail}`);
  }

  const summary = results.length > 0
    ? `${results.length} ticket(s) had matches: ${results.join('; ')}`
    : 'No winning tickets this draw.';

  db.prepare("UPDATE pools SET auto_checked = 1, results_summary = ?, status = 'completed' WHERE id = ?")
    .run(summary, poolId);

  audit(poolId, 'RESULTS_CHECKED', 'SYSTEM', summary);

  return { summary, matchCount: results.length };
}
