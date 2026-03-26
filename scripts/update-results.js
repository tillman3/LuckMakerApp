#!/usr/bin/env node
/**
 * Luck Maker 3000 — Results Updater
 * Scrapes latest results from Texas Lottery website and lottery APIs
 * Run daily via cron to keep data current
 */

const Database = require('better-sqlite3');
const path = require('path');
const https = require('https');
const http = require('http');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'luckmaker.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LuckMaker3000/1.0)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Parse Texas Lottery HTML table
function parseTexasLotteryTable(html, gameConfig) {
  const drawings = [];
  // Match table rows - Texas Lottery uses consistent table format
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  
  let match;
  while ((match = rowRegex.exec(html)) !== null) {
    const rowHtml = match[1];
    const cells = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      cells.push(cellMatch[1].replace(/<[^>]+>/g, '').trim());
    }
    cellRegex.lastIndex = 0;
    
    if (cells.length >= 2) {
      const dateMatch = cells[0].match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dateMatch) {
        const [, month, day, year] = dateMatch;
        const drawDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        
        // Parse numbers based on game type
        const numbersText = cells[1];
        const numbers = numbersText.split(/[\s\-–]+/).map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        
        if (numbers.length >= gameConfig.mainNumbers) {
          const mainNumbers = numbers.slice(0, gameConfig.mainNumbers);
          const bonus = gameConfig.bonusNumbers > 0 && cells.length > 2 ? 
            parseInt(cells[2].trim()) : null;
          const jackpot = cells.length > gameConfig.jackpotCol ? 
            parseJackpot(cells[gameConfig.jackpotCol]) : null;
          
          // Handle draw time for multi-draw games
          let drawTime = null;
          if (gameConfig.hasDrawTimes && cells.length > gameConfig.timeCol) {
            drawTime = cells[gameConfig.timeCol].trim();
          }
          
          drawings.push({ drawDate, numbers: mainNumbers, bonus, jackpot, drawTime });
        }
      }
    }
  }
  return drawings;
}

function parseJackpot(text) {
  if (!text) return null;
  const clean = text.replace(/[$,]/g, '').trim();
  if (clean.includes('Million')) return parseFloat(clean) * 1e6;
  if (clean.includes('Billion')) return parseFloat(clean) * 1e9;
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

// Insert draws into DB (skip duplicates)
// Note: SQLite treats NULL != NULL for UNIQUE constraints,
// so we use a check-then-insert approach for reliability.
function insertDraws(gameId, drawings) {
  const check = db.prepare(`
    SELECT id FROM draws 
    WHERE game_id = ? AND draw_date = ? AND COALESCE(draw_time, '') = ? AND numbers = ?
    LIMIT 1
  `);
  const insert = db.prepare(`
    INSERT INTO draws (game_id, draw_date, draw_time, numbers, bonus_number, jackpot)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  let inserted = 0;
  const tx = db.transaction(() => {
    for (const d of drawings) {
      const nums = d.numbers.join(',');
      const existing = check.get(gameId, d.drawDate, d.drawTime || '', nums);
      if (!existing) {
        insert.run(
          gameId,
          d.drawDate,
          d.drawTime || null,
          nums,
          d.bonus ? String(d.bonus) : null,
          d.jackpot
        );
        inserted++;
      }
    }
  });
  tx();
  return inserted;
}

// Scrape from Powerball API (lottery.com uses JSON API)
async function updatePowerball() {
  console.log('🎱 Updating Powerball...');
  try {
    const html = await fetch('https://www.texaslottery.com/export/sites/lottery/Games/Powerball/Winning_Numbers/index.html_2013354932.html');
    const drawings = parseTexasLotteryTable(html, {
      mainNumbers: 5, bonusNumbers: 1, jackpotCol: 4, timeCol: -1, hasDrawTimes: false
    });
    const inserted = insertDraws('powerball', drawings);
    console.log(`  ✅ Powerball: ${inserted} new draws (${drawings.length} total scraped)`);
  } catch (e) {
    console.log(`  ❌ Powerball failed: ${e.message}`);
  }
}

async function updateMegaMillions() {
  console.log('🎱 Updating Mega Millions...');
  try {
    const html = await fetch('https://www.texaslottery.com/export/sites/lottery/Games/Mega_Millions/Winning_Numbers/index.html_2013354932.html');
    const drawings = parseTexasLotteryTable(html, {
      mainNumbers: 5, bonusNumbers: 1, jackpotCol: 4, timeCol: -1, hasDrawTimes: false
    });
    const inserted = insertDraws('mega_millions', drawings);
    console.log(`  ✅ Mega Millions: ${inserted} new draws (${drawings.length} total scraped)`);
  } catch (e) {
    console.log(`  ❌ Mega Millions failed: ${e.message}`);
  }
}

async function updateLottoTexas() {
  console.log('🎱 Updating Lotto Texas...');
  try {
    const html = await fetch('https://www.texaslottery.com/export/sites/lottery/Games/Lotto_Texas/Winning_Numbers/index.html_2013354932.html');
    const drawings = parseTexasLotteryTable(html, {
      mainNumbers: 6, bonusNumbers: 0, jackpotCol: 3, timeCol: -1, hasDrawTimes: false
    });
    const inserted = insertDraws('lotto_texas', drawings);
    console.log(`  ✅ Lotto Texas: ${inserted} new draws (${drawings.length} total scraped)`);
  } catch (e) {
    console.log(`  ❌ Lotto Texas failed: ${e.message}`);
  }
}

async function updateTexasTwoStep() {
  console.log('🎱 Updating Texas Two Step...');
  try {
    const html = await fetch('https://www.texaslottery.com/export/sites/lottery/Games/Texas_Two_Step/Winning_Numbers/index.html_2013354932.html');
    const drawings = parseTexasLotteryTable(html, {
      mainNumbers: 4, bonusNumbers: 1, jackpotCol: 4, timeCol: -1, hasDrawTimes: false
    });
    const inserted = insertDraws('texas_two_step', drawings);
    console.log(`  ✅ Texas Two Step: ${inserted} new draws (${drawings.length} total scraped)`);
  } catch (e) {
    console.log(`  ❌ Texas Two Step failed: ${e.message}`);
  }
}

async function updateCashFive() {
  console.log('🎱 Updating Cash Five...');
  try {
    const html = await fetch('https://www.texaslottery.com/export/sites/lottery/Games/Cash_Five/Winning_Numbers/index.html_2013354932.html');
    const drawings = parseTexasLotteryTable(html, {
      mainNumbers: 5, bonusNumbers: 0, jackpotCol: 3, timeCol: -1, hasDrawTimes: false
    });
    const inserted = insertDraws('cash_five', drawings);
    console.log(`  ✅ Cash Five: ${inserted} new draws (${drawings.length} total scraped)`);
  } catch (e) {
    console.log(`  ❌ Cash Five failed: ${e.message}`);
  }
}

async function updatePick3() {
  console.log('🎱 Updating Pick 3...');
  try {
    const html = await fetch('https://www.texaslottery.com/export/sites/lottery/Games/Pick_3/Winning_Numbers/index.html_2013354932.html');
    const drawings = parseTexasLotteryTable(html, {
      mainNumbers: 3, bonusNumbers: 0, jackpotCol: -1, timeCol: -1, hasDrawTimes: false
    });
    // Pick 3 has 4 draws per day - try to parse draw time from table
    const inserted = insertDraws('pick3', drawings);
    console.log(`  ✅ Pick 3: ${inserted} new draws (${drawings.length} total scraped)`);
  } catch (e) {
    console.log(`  ❌ Pick 3 failed: ${e.message}`);
  }
}

async function updateDaily4() {
  console.log('🎱 Updating Daily 4...');
  try {
    const html = await fetch('https://www.texaslottery.com/export/sites/lottery/Games/Daily_4/Winning_Numbers/index.html_2013354932.html');
    const drawings = parseTexasLotteryTable(html, {
      mainNumbers: 4, bonusNumbers: 0, jackpotCol: -1, timeCol: -1, hasDrawTimes: false
    });
    const inserted = insertDraws('daily4', drawings);
    console.log(`  ✅ Daily 4: ${inserted} new draws (${drawings.length} total scraped)`);
  } catch (e) {
    console.log(`  ❌ Daily 4 failed: ${e.message}`);
  }
}

async function updateAllOrNothing() {
  console.log('🎱 Updating All or Nothing...');
  try {
    const html = await fetch('https://www.texaslottery.com/export/sites/lottery/Games/All_or_Nothing/Winning_Numbers/index.html_2013354932.html');
    const drawings = parseTexasLotteryTable(html, {
      mainNumbers: 12, bonusNumbers: 0, jackpotCol: -1, timeCol: -1, hasDrawTimes: false
    });
    const inserted = insertDraws('all_or_nothing', drawings);
    console.log(`  ✅ All or Nothing: ${inserted} new draws (${drawings.length} total scraped)`);
  } catch (e) {
    console.log(`  ❌ All or Nothing failed: ${e.message}`);
  }
}

// Also try lottery APIs for Powerball/Mega Millions current jackpots
async function updateJackpots() {
  console.log('\n💰 Updating current jackpots...');
  
  try {
    // Powerball API
    const pbData = await fetch('https://data.ny.gov/resource/d6yy-54nr.json?$order=draw_date%20DESC&$limit=1');
    const pbJson = JSON.parse(pbData);
    if (pbJson.length > 0) {
      const pb = pbJson[0];
      const numbers = pb.winning_numbers.split(' ').map(Number);
      const mainNums = numbers.slice(0, 5);
      const bonus = numbers[5] || parseInt(pb.mega_ball);
      
      const result = db.prepare(`
        INSERT OR IGNORE INTO draws (game_id, draw_date, numbers, bonus_number)
        VALUES (?, ?, ?, ?)
      `).run('powerball', pb.draw_date.split('T')[0], mainNums.join(','), String(bonus));
      
      if (result.changes > 0) console.log(`  ✅ Powerball API: added ${pb.draw_date.split('T')[0]}`);
    }
  } catch (e) {
    console.log(`  ⚠️ Powerball API: ${e.message}`);
  }
  
  try {
    // Mega Millions API  
    const mmData = await fetch('https://data.ny.gov/resource/5xaw-6ayf.json?$order=draw_date%20DESC&$limit=1');
    const mmJson = JSON.parse(mmData);
    if (mmJson.length > 0) {
      const mm = mmJson[0];
      const numbers = mm.winning_numbers.split(' ').map(Number);
      const mainNums = numbers.slice(0, 5);
      const bonus = numbers[5] || parseInt(mm.mega_ball);
      
      const result = db.prepare(`
        INSERT OR IGNORE INTO draws (game_id, draw_date, numbers, bonus_number)
        VALUES (?, ?, ?, ?)
      `).run('mega_millions', mm.draw_date.split('T')[0], mainNums.join(','), String(bonus));
      
      if (result.changes > 0) console.log(`  ✅ Mega Millions API: added ${mm.draw_date.split('T')[0]}`);
    }
  } catch (e) {
    console.log(`  ⚠️ Mega Millions API: ${e.message}`);
  }
}

async function main() {
  console.log('🍀 Luck Maker 3000 — Results Update');
  console.log(`📅 ${new Date().toISOString()}`);
  console.log(`📁 DB: ${DB_PATH}\n`);
  
  // Get current counts
  const before = db.prepare('SELECT game_id, COUNT(*) as c FROM draws GROUP BY game_id').all();
  console.log('Current counts:', before.map(r => `${r.game_id}: ${r.c}`).join(', '));
  console.log('');
  
  await updatePowerball();
  await updateMegaMillions();
  await updateLottoTexas();
  await updateTexasTwoStep();
  await updateCashFive();
  await updatePick3();
  await updateDaily4();
  await updateAllOrNothing();
  await updateJackpots();
  
  // Get new counts
  const after = db.prepare('SELECT game_id, COUNT(*) as c FROM draws GROUP BY game_id').all();
  const totalBefore = before.reduce((s, r) => s + r.c, 0);
  const totalAfter = after.reduce((s, r) => s + r.c, 0);
  
  console.log(`\n📊 Total: ${totalBefore} → ${totalAfter} draws (+${totalAfter - totalBefore} new)`);
  
  // Show latest draw per game
  console.log('\n📅 Latest draws:');
  for (const row of after) {
    const latest = db.prepare('SELECT draw_date FROM draws WHERE game_id = ? ORDER BY draw_date DESC LIMIT 1').get(row.game_id);
    console.log(`  ${row.game_id}: ${latest.draw_date} (${row.c} total)`);
  }
  
  db.close();
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});

// This gets appended but we need to fix the Pick 3/Daily 4/AoN scrapers
// Let's create a separate fix script
