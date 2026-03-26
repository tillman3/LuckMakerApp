import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// In standalone mode, use the workspace data directory (not the standalone copy)
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'luckmaker.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'TX',
      main_numbers INTEGER NOT NULL,
      main_max INTEGER NOT NULL,
      bonus_numbers INTEGER NOT NULL DEFAULT 0,
      bonus_max INTEGER NOT NULL DEFAULT 0,
      ticket_cost REAL NOT NULL DEFAULT 1.0,
      draw_days TEXT NOT NULL DEFAULT '',
      draw_times TEXT NOT NULL DEFAULT '',
      jackpot_odds TEXT NOT NULL DEFAULT '',
      current_jackpot REAL DEFAULT NULL,
      next_draw TEXT DEFAULT NULL,
      last_updated TEXT DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS draws (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT NOT NULL,
      draw_date TEXT NOT NULL,
      draw_time TEXT DEFAULT NULL,
      numbers TEXT NOT NULL,
      bonus_number TEXT DEFAULT NULL,
      multiplier INTEGER DEFAULT NULL,
      jackpot REAL DEFAULT NULL,
      FOREIGN KEY (game_id) REFERENCES games(id),
      UNIQUE(game_id, draw_date, draw_time)
    );

    CREATE TABLE IF NOT EXISTS saved_numbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL DEFAULT 'default',
      game_id TEXT NOT NULL,
      numbers TEXT NOT NULL,
      label TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (game_id) REFERENCES games(id)
    );

    CREATE TABLE IF NOT EXISTS spending (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL DEFAULT 'default',
      game_id TEXT NOT NULL,
      amount REAL NOT NULL,
      tickets INTEGER NOT NULL DEFAULT 1,
      date TEXT NOT NULL DEFAULT (date('now')),
      FOREIGN KEY (game_id) REFERENCES games(id)
    );

    CREATE INDEX IF NOT EXISTS idx_draws_game_date ON draws(game_id, draw_date DESC);
    CREATE INDEX IF NOT EXISTS idx_draws_game ON draws(game_id);
    CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_numbers(user_id);
  `);
}
