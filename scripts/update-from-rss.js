#!/usr/bin/env node
/**
 * Luck Maker 3000 — RSS Feed Updater
 * Primary data source: Texas Lottery official RSS feed
 * Updates winning numbers + current jackpots
 * Run every 30 min or after draws
 */

const Database = require('better-sqlite3');
const path = require('path');
const https = require('https');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'luckmaker.db');
const RSS_URL = 'https://www.texaslottery.com/export/sites/lottery/rss/tlc_latest.xml';

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Ensure jackpots table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS jackpots (
    game_id TEXT PRIMARY KEY,
    annuitized REAL,
    cash_value REAL,
    next_draw_date TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  )
`);

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LuckMaker3000/1.0)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1];
    const title = (content.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.trim() || '';
    const desc = (content.match(/<description>([\s\S]*?)<\/description>/) || [])[1]?.trim() || '';
    items.push({ title, description: desc });
  }
  return items;
}

// Map RSS game names to our DB game IDs
const GAME_MAP = {
  'Powerball': 'powerball',
  'Mega Millions': 'mega_millions',
  'Lotto Texas': 'lotto_texas',
  'Texas Two Step': 'texas_two_step',
  'Cash Five': 'cash_five',
  'Pick 3': 'pick3',
  'Daily 4': 'daily4',
  'All or Nothing': 'all_or_nothing',
};

function parseWinningNumbers(item) {
  // Title format: "Powerball Winning Numbers for 03/23/2026"
  // Or: "Pick 3 Morning Winning Numbers for 03/25/2026"
  const titleMatch = item.title.match(/^(.+?)\s+(Morning|Day|Evening|Night)?\s*Winning Numbers for (\d{2})\/(\d{2})\/(\d{4})/);
  if (!titleMatch) return null;
  
  const gameName = titleMatch[1].trim();
  const drawTime = titleMatch[2] || null;
  const drawDate = `${titleMatch[5]}-${titleMatch[3]}-${titleMatch[4]}`;
  const gameId = GAME_MAP[gameName];
  if (!gameId) return null;
  
  // Parse numbers from description
  const desc = item.description.replace(/\s+/g, ' ').trim();
  
  let mainNumbers = [];
  let bonus = null;
  
  if (gameId === 'powerball') {
    // "12 - 18 - 47 - 56 - 63 Powerball 1  Power Play 10"
    const nums = desc.match(/(\d+)\s*-\s*(\d+)\s*-\s*(\d+)\s*-\s*(\d+)\s*-\s*(\d+)\s*Powerball\s*(\d+)/i);
    if (nums) {
      mainNumbers = [nums[1], nums[2], nums[3], nums[4], nums[5]].map(Number);
      bonus = parseInt(nums[6]);
    }
  } else if (gameId === 'mega_millions') {
    // "4 - 13 - 52 - 53 - 69 MegaBall 10"
    const nums = desc.match(/(\d+)\s*-\s*(\d+)\s*-\s*(\d+)\s*-\s*(\d+)\s*-\s*(\d+)\s*MegaBall\s*(\d+)/i);
    if (nums) {
      mainNumbers = [nums[1], nums[2], nums[3], nums[4], nums[5]].map(Number);
      bonus = parseInt(nums[6]);
    }
  } else if (gameId === 'texas_two_step') {
    // "13 - 14 - 22 - 29 Bonus Ball 26"
    const nums = desc.match(/(\d+)\s*-\s*(\d+)\s*-\s*(\d+)\s*-\s*(\d+)\s*Bonus Ball\s*(\d+)/i);
    if (nums) {
      mainNumbers = [nums[1], nums[2], nums[3], nums[4]].map(Number);
      bonus = parseInt(nums[5]);
    }
  } else {
    // Generic: "8 - 0 - 2" or "1 - 9 - 7 - 6" etc
    const allNums = desc.match(/\d+/g);
    if (allNums) {
      // Filter out fireball numbers (appear after main numbers)
      if (gameId === 'pick3') mainNumbers = allNums.slice(0, 3).map(Number);
      else if (gameId === 'daily4') mainNumbers = allNums.slice(0, 4).map(Number);
      else if (gameId === 'all_or_nothing') mainNumbers = allNums.slice(0, 12).map(Number);
      else if (gameId === 'lotto_texas') mainNumbers = allNums.slice(0, 6).map(Number);
      else if (gameId === 'cash_five') mainNumbers = allNums.slice(0, 5).map(Number);
      else mainNumbers = allNums.map(Number);
    }
  }
  
  if (mainNumbers.length === 0) return null;
  
  return { gameId, drawDate, drawTime, numbers: mainNumbers, bonus };
}

function parseJackpot(item) {
  // Title: "Powerball Estimated Jackpot for 03/25/2026"
  // Or: "Texas Two Step Advertised Jackpot for 03/26/2026"
  const titleMatch = item.title.match(/^(.+?)\s+(?:Estimated|Advertised)\s+Jackpot for (\d{2})\/(\d{2})\/(\d{4})/);
  if (!titleMatch) return null;
  
  const gameName = titleMatch[1].trim();
  const nextDraw = `${titleMatch[4]}-${titleMatch[2]}-${titleMatch[3]}`;
  const gameId = GAME_MAP[gameName];
  if (!gameId) return null;
  
  const desc = item.description.replace(/\s+/g, ' ').trim();
  
  let annuitized = null;
  let cashValue = null;
  
  // "Annuitized: $147 Million Cash Value: $66.6 Million"
  const annMatch = desc.match(/Annuitized:\s*\$([\d.]+)\s*(Million|Billion)/i);
  if (annMatch) {
    annuitized = parseFloat(annMatch[1]) * (annMatch[2].toLowerCase() === 'billion' ? 1e9 : 1e6);
  }
  
  const cashMatch = desc.match(/Cash Value:\s*\$([\d.]+)\s*(Million|Billion)/i);
  if (cashMatch) {
    cashValue = parseFloat(cashMatch[1]) * (cashMatch[2].toLowerCase() === 'billion' ? 1e9 : 1e6);
  }
  
  // "$750,000" format (Texas Two Step)
  if (!annuitized) {
    const simpleMatch = desc.match(/\$([\d,]+)/);
    if (simpleMatch) {
      annuitized = parseFloat(simpleMatch[1].replace(/,/g, ''));
      cashValue = annuitized; // Same for smaller games
    }
  }
  
  return { gameId, nextDraw, annuitized, cashValue };
}

async function main() {
  console.log('🍀 Luck Maker 3000 — RSS Feed Update');
  console.log(`📅 ${new Date().toISOString()}`);
  
  const xml = await fetch(RSS_URL);
  const items = parseRSS(xml);
  console.log(`📡 RSS: ${items.length} items\n`);
  
  const checkDraw = db.prepare(`
    SELECT id FROM draws 
    WHERE game_id = ? AND draw_date = ? AND COALESCE(draw_time, '') = ?
    LIMIT 1
  `);
  const insertDraw = db.prepare(`
    INSERT INTO draws (game_id, draw_date, draw_time, numbers, bonus_number)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  const upsertJackpot = db.prepare(`
    INSERT OR REPLACE INTO jackpots (game_id, annuitized, cash_value, next_draw_date, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);
  
  let drawsAdded = 0;
  let jackpotsUpdated = 0;
  
  const tx = db.transaction(() => {
    for (const item of items) {
      // Try parsing as winning numbers
      const draw = parseWinningNumbers(item);
      if (draw) {
        // Sort numbers for non-ordered games (not pick3/daily4 where digit order matters)
        const sortable = !['pick3', 'daily4'].includes(draw.gameId);
        const nums = sortable ? draw.numbers.slice().sort((a, b) => a - b) : draw.numbers;
        
        // Check-then-insert to avoid NULL draw_time duplicate bug
        const existing = checkDraw.get(draw.gameId, draw.drawDate, draw.drawTime || '');
        if (!existing) {
          insertDraw.run(
            draw.gameId,
            draw.drawDate,
            draw.drawTime,
            nums.join(','),
            draw.bonus ? String(draw.bonus) : null
          );
          drawsAdded++;
          console.log(`  🎱 ${draw.gameId}${draw.drawTime ? ' ' + draw.drawTime : ''}: ${draw.drawDate} → ${nums.join(',')}${draw.bonus ? ' +' + draw.bonus : ''}`);
        }
      }
      
      // Try parsing as jackpot
      const jackpot = parseJackpot(item);
      if (jackpot && jackpot.annuitized) {
        upsertJackpot.run(jackpot.gameId, jackpot.annuitized, jackpot.cashValue, jackpot.nextDraw);
        jackpotsUpdated++;
        const fmt = jackpot.annuitized >= 1e6 ? `$${(jackpot.annuitized / 1e6).toFixed(1)}M` : `$${jackpot.annuitized.toLocaleString()}`;
        console.log(`  💰 ${jackpot.gameId}: ${fmt} (next: ${jackpot.nextDraw})`);
      }
    }
  });
  tx();
  
  console.log(`\n✅ +${drawsAdded} new draws, ${jackpotsUpdated} jackpots updated`);
  
  // Show current jackpots
  const jackpots = db.prepare('SELECT * FROM jackpots ORDER BY annuitized DESC').all();
  if (jackpots.length > 0) {
    console.log('\n💰 Current Jackpots:');
    for (const j of jackpots) {
      const amt = j.annuitized >= 1e6 ? `$${(j.annuitized / 1e6).toFixed(1)}M` : `$${j.annuitized?.toLocaleString()}`;
      console.log(`  ${j.game_id}: ${amt} (next draw: ${j.next_draw_date})`);
    }
  }
  
  db.close();
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
