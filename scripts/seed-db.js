#!/usr/bin/env node
/**
 * Seed the LuckMaker3000 database with historical CSV data
 * Run: node scripts/seed-db.js
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'luckmaker.db');
const CSV_BASE = '/tmp/LuckMakerApp/CSVDB';

// Ensure data dir
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create schema
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

// Insert game definitions
const games = [
  { id: 'powerball', name: 'Powerball', state: 'MULTI', main_numbers: 5, main_max: 69, bonus_numbers: 1, bonus_max: 26, ticket_cost: 2, draw_days: 'Mon,Wed,Sat', draw_times: '10:59 PM ET', jackpot_odds: '292201338' },
  { id: 'mega_millions', name: 'Mega Millions', state: 'MULTI', main_numbers: 5, main_max: 70, bonus_numbers: 1, bonus_max: 25, ticket_cost: 2, draw_days: 'Tue,Fri', draw_times: '11:00 PM ET', jackpot_odds: '302575350' },
  { id: 'lotto_texas', name: 'Lotto Texas', state: 'TX', main_numbers: 6, main_max: 54, bonus_numbers: 0, bonus_max: 0, ticket_cost: 1, draw_days: 'Mon,Thu,Sat', draw_times: '10:12 PM CT', jackpot_odds: '25827165' },
  { id: 'texas_two_step', name: 'Texas Two Step', state: 'TX', main_numbers: 4, main_max: 35, bonus_numbers: 1, bonus_max: 35, ticket_cost: 1, draw_days: 'Mon,Thu', draw_times: '10:12 PM CT', jackpot_odds: '3895584' },
  { id: 'cash_five', name: 'Cash Five', state: 'TX', main_numbers: 5, main_max: 35, bonus_numbers: 0, bonus_max: 0, ticket_cost: 1, draw_days: 'Mon,Tue,Wed,Thu,Fri,Sat', draw_times: '10:12 PM CT', jackpot_odds: '324632' },
  { id: 'pick3', name: 'Pick 3', state: 'TX', main_numbers: 3, main_max: 9, bonus_numbers: 0, bonus_max: 0, ticket_cost: 1, draw_days: 'Mon,Tue,Wed,Thu,Fri,Sat', draw_times: 'Morning,Day,Evening,Night', jackpot_odds: '1000' },
  { id: 'daily4', name: 'Daily 4', state: 'TX', main_numbers: 4, main_max: 9, bonus_numbers: 0, bonus_max: 0, ticket_cost: 1, draw_days: 'Mon,Tue,Wed,Thu,Fri,Sat', draw_times: 'Morning,Day,Evening,Night', jackpot_odds: '10000' },
  { id: 'all_or_nothing', name: 'All or Nothing', state: 'TX', main_numbers: 12, main_max: 24, bonus_numbers: 0, bonus_max: 0, ticket_cost: 2, draw_days: 'Mon,Tue,Wed,Thu,Fri,Sat', draw_times: 'Morning,Day,Evening,Night', jackpot_odds: '2704156' },
];

const insertGame = db.prepare(`
  INSERT OR REPLACE INTO games (id, name, state, main_numbers, main_max, bonus_numbers, bonus_max, ticket_cost, draw_days, draw_times, jackpot_odds)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const g of games) {
  insertGame.run(g.id, g.name, g.state, g.main_numbers, g.main_max, g.bonus_numbers, g.bonus_max, g.ticket_cost, g.draw_days, g.draw_times, g.jackpot_odds);
}
console.log(`✅ Inserted ${games.length} game definitions`);

// Insert draw helper
const insertDraw = db.prepare(`
  INSERT OR IGNORE INTO draws (game_id, draw_date, draw_time, numbers, bonus_number, multiplier)
  VALUES (?, ?, ?, ?, ?, ?)
`);

function parseDate(month, day, year) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function loadCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  File not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.trim().split('\n').filter(line => line.trim());
}

// --- POWERBALL ---
function seedPowerball() {
  const lines = loadCSV(path.join(CSV_BASE, 'PowerBall', 'powerball.csv'));
  let count = 0;
  const insert = db.transaction(() => {
    for (const line of lines) {
      const parts = line.split(',').map(s => s.trim());
      // Powerball,Month,Day,Year,N1,N2,N3,N4,N5,PB,Multiplier
      if (parts.length < 10) continue;
      const [, month, day, year, ...nums] = parts;
      const date = parseDate(month, day, year);
      const mainNums = nums.slice(0, 5).join(',');
      const bonus = nums[5] || null;
      const multiplier = nums[6] ? parseInt(nums[6]) : null;
      insertDraw.run('powerball', date, null, mainNums, bonus, multiplier);
      count++;
    }
  });
  insert();
  console.log(`✅ Powerball: ${count} draws`);
}

// --- MEGA MILLIONS ---
function seedMegaMillions() {
  const lines = loadCSV(path.join(CSV_BASE, 'MegaMillions', 'megamillions.csv'));
  let count = 0;
  const insert = db.transaction(() => {
    for (const line of lines) {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length < 10) continue;
      const [, month, day, year, ...nums] = parts;
      const date = parseDate(month, day, year);
      const mainNums = nums.slice(0, 5).join(',');
      const bonus = nums[5] || null;
      const multiplier = nums[6] ? parseInt(nums[6]) : null;
      insertDraw.run('mega_millions', date, null, mainNums, bonus, multiplier);
      count++;
    }
  });
  insert();
  console.log(`✅ Mega Millions: ${count} draws`);
}

// --- LOTTO TEXAS ---
function seedLottoTexas() {
  const lines = loadCSV(path.join(CSV_BASE, 'LottoTexas', 'lottotexas.csv'));
  let count = 0;
  const insert = db.transaction(() => {
    for (const line of lines) {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length < 10) continue;
      const [, month, day, year, ...nums] = parts;
      const date = parseDate(month, day, year);
      const mainNums = nums.slice(0, 6).join(',');
      insertDraw.run('lotto_texas', date, null, mainNums, null, null);
      count++;
    }
  });
  insert();
  console.log(`✅ Lotto Texas: ${count} draws`);
}

// --- TEXAS TWO STEP ---
function seedTexasTwoStep() {
  const lines = loadCSV(path.join(CSV_BASE, 'TexasTwoStep', 'texastwostep.csv'));
  let count = 0;
  const insert = db.transaction(() => {
    for (const line of lines) {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length < 9) continue;
      const [, month, day, year, ...nums] = parts;
      const date = parseDate(month, day, year);
      const mainNums = nums.slice(0, 4).join(',');
      const bonus = nums[4] || null;
      insertDraw.run('texas_two_step', date, null, mainNums, bonus, null);
      count++;
    }
  });
  insert();
  console.log(`✅ Texas Two Step: ${count} draws`);
}

// --- CASH FIVE ---
function seedCashFive() {
  const lines = loadCSV(path.join(CSV_BASE, 'Cash5', 'cashfive.csv'));
  let count = 0;
  const insert = db.transaction(() => {
    for (const line of lines) {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length < 8) continue;
      const [, month, day, year, ...nums] = parts;
      const date = parseDate(month, day, year);
      const mainNums = nums.slice(0, 5).join(',');
      insertDraw.run('cash_five', date, null, mainNums, null, null);
      count++;
    }
  });
  insert();
  console.log(`✅ Cash Five: ${count} draws`);
}

// --- PICK 3 (multiple draw times) ---
function seedPick3() {
  const timeMap = {
    'Morning': 'Morning',
    'Day': 'Day', 
    'Evening': 'Evening',
    'Night': 'Night',
  };
  let total = 0;
  
  const insert = db.transaction(() => {
    for (const [dir, drawTime] of Object.entries(timeMap)) {
      const filePath = path.join(CSV_BASE, 'Pick3', dir, `pick3${dir.toLowerCase()}.csv`);
      const lines = loadCSV(filePath);
      for (const line of lines) {
        const parts = line.split(',').map(s => s.trim());
        if (parts.length < 7) continue;
        // Pick 3 Morning,Month,Day,Year,D1,D2,D3,Sum,Fireball
        const [, month, day, year, d1, d2, d3] = parts;
        const date = parseDate(month, day, year);
        const nums = [d1, d2, d3].join(',');
        insertDraw.run('pick3', date, drawTime, nums, null, null);
        total++;
      }
    }
  });
  insert();
  console.log(`✅ Pick 3: ${total} draws`);
}

// --- DAILY 4 (multiple draw times) ---
function seedDaily4() {
  const timeMap = {
    'Morning': 'Morning',
    'Day': 'Day',
    'Evening': 'Evening', 
    'Night': 'Night',
  };
  let total = 0;
  
  const insert = db.transaction(() => {
    for (const [dir, drawTime] of Object.entries(timeMap)) {
      const filePath = path.join(CSV_BASE, 'Daily4', dir, `daily4${dir.toLowerCase()}.csv`);
      const lines = loadCSV(filePath);
      for (const line of lines) {
        const parts = line.split(',').map(s => s.trim());
        if (parts.length < 8) continue;
        // Daily 4 Morning,Month,Day,Year,D1,D2,D3,D4,Sum,Fireball
        const [, month, day, year, d1, d2, d3, d4] = parts;
        const date = parseDate(month, day, year);
        const nums = [d1, d2, d3, d4].join(',');
        insertDraw.run('daily4', date, drawTime, nums, null, null);
        total++;
      }
    }
  });
  insert();
  console.log(`✅ Daily 4: ${total} draws`);
}

// --- ALL OR NOTHING (multiple draw times) ---
function seedAllOrNothing() {
  const timeMap = {
    'Morning': 'Morning',
    'Day': 'Day',
    'Evening': 'Evening',
    'Night': 'Night',
  };
  let total = 0;
  
  const insert = db.transaction(() => {
    for (const [dir, drawTime] of Object.entries(timeMap)) {
      const filePath = path.join(CSV_BASE, 'AllorNothing', dir, `allornothing${dir.toLowerCase()}.csv`);
      const lines = loadCSV(filePath);
      for (const line of lines) {
        const parts = line.split(',').map(s => s.trim());
        if (parts.length < 16) continue;
        // All or Nothing Morning,Month,Day,Year,N1..N12
        const [, month, day, year, ...nums] = parts;
        const date = parseDate(month, day, year);
        const mainNums = nums.slice(0, 12).join(',');
        insertDraw.run('all_or_nothing', date, drawTime, mainNums, null, null);
        total++;
      }
    }
  });
  insert();
  console.log(`✅ All or Nothing: ${total} draws`);
}

// Run all seeders
console.log('\n🌱 Seeding LuckMaker3000 database...\n');

seedPowerball();
seedMegaMillions();
seedLottoTexas();
seedTexasTwoStep();
seedCashFive();
seedPick3();
seedDaily4();
seedAllOrNothing();

// Final stats
const totalDraws = db.prepare('SELECT COUNT(*) as count FROM draws').get();
const totalGames = db.prepare('SELECT COUNT(*) as count FROM games').get();
console.log(`\n🎉 Done! ${totalGames.count} games, ${totalDraws.count} total draws loaded.`);
console.log(`📁 Database: ${DB_PATH}\n`);

db.close();
