// Smart Number Generator
// Anti-popular: avoids commonly picked numbers to reduce split probability

export interface GeneratedNumbers {
  numbers: number[];
  bonusNumber?: number;
  strategy: string;
  reasoning: string;
}

// Numbers that are statistically over-picked by the public
// Birthday numbers (1-31), "lucky" numbers (7, 11, 13), patterns
const POPULAR_NUMBERS = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 
  16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
]);

const VERY_POPULAR = new Set([7, 11, 13, 3, 17, 21, 23, 27]);

function getAntiPopularWeight(n: number, max: number): number {
  // Higher weight = more likely to be picked by our generator
  // We WANT numbers that other people DON'T pick
  if (VERY_POPULAR.has(n)) return 0.3;
  if (POPULAR_NUMBERS.has(n) && n <= 31) return 0.5;
  if (n > 31) return 1.5; // Numbers above 31 are underpicked
  return 1.0;
}

export function generateAntiPopular(
  count: number, 
  max: number,
  recentWinners: number[][] = []
): GeneratedNumbers {
  // Build weighted pool
  const pool: { number: number; weight: number }[] = [];
  
  // Also reduce weight of recent winning numbers (people chase these)
  const recentSet = new Set(recentWinners.flat().slice(0, 50));
  
  for (let i = 1; i <= max; i++) {
    let weight = getAntiPopularWeight(i, max);
    if (recentSet.has(i)) {
      weight *= 0.6; // People chase recent winners, so avoid them
    }
    pool.push({ number: i, weight });
  }

  const selected: number[] = [];
  const remaining = [...pool];

  while (selected.length < count) {
    const totalWeight = remaining.reduce((sum, p) => sum + p.weight, 0);
    let rand = Math.random() * totalWeight;
    
    for (let i = 0; i < remaining.length; i++) {
      rand -= remaining[i].weight;
      if (rand <= 0) {
        selected.push(remaining[i].number);
        remaining.splice(i, 1);
        break;
      }
    }
  }

  selected.sort((a, b) => a - b);

  return {
    numbers: selected,
    strategy: 'Anti-Popular',
    reasoning: 'These numbers are statistically less popular among lottery players. ' +
      'Your odds of winning are identical, but if you win, you\'re less likely to split the jackpot.',
  };
}

// Quick Pick - truly random
export function generateQuickPick(count: number, max: number): GeneratedNumbers {
  const selected = new Set<number>();
  while (selected.size < count) {
    selected.add(Math.floor(Math.random() * max) + 1);
  }
  return {
    numbers: Array.from(selected).sort((a, b) => a - b),
    strategy: 'Quick Pick',
    reasoning: 'Truly random selection — every combination has equal probability.',
  };
}

// Balanced - mix of ranges
export function generateBalanced(count: number, max: number): GeneratedNumbers {
  const rangeSize = Math.ceil(max / count);
  const selected: number[] = [];
  
  for (let i = 0; i < count; i++) {
    const rangeStart = i * rangeSize + 1;
    const rangeEnd = Math.min((i + 1) * rangeSize, max);
    const num = rangeStart + Math.floor(Math.random() * (rangeEnd - rangeStart + 1));
    selected.push(num);
  }
  
  // Ensure uniqueness
  const unique = new Set(selected);
  while (unique.size < count) {
    unique.add(Math.floor(Math.random() * max) + 1);
  }

  return {
    numbers: Array.from(unique).sort((a, b) => a - b).slice(0, count),
    strategy: 'Balanced',
    reasoning: 'Numbers spread evenly across the full range, avoiding clusters.',
  };
}

// Wheeling System
export interface WheelResult {
  tickets: number[][];
  totalTickets: number;
  totalCost: number;
  guarantee: string;
  inputNumbers: number[];
}

// Abbreviated wheel - guarantees minimum match if certain numbers hit
export function generateWheel(
  inputNumbers: number[],
  gameMainCount: number,
  guaranteeIfHit: number, // How many of your numbers must be drawn
  guaranteeMatch: number, // Minimum match on at least one ticket
): WheelResult {
  const n = inputNumbers.length;
  const tickets: number[][] = [];

  if (n <= gameMainCount) {
    // Just one ticket with all numbers
    const ticket = [...inputNumbers];
    while (ticket.length < gameMainCount) {
      let num;
      do {
        num = Math.floor(Math.random() * 50) + 1;
      } while (ticket.includes(num));
      ticket.push(num);
    }
    tickets.push(ticket.sort((a, b) => a - b));
  } else {
    // Generate combinations that cover the guarantee
    const combos = getCombinations(inputNumbers, gameMainCount);
    
    // Use a greedy covering algorithm
    const needed = getCombinations(inputNumbers, guaranteeIfHit);
    const uncovered = new Set(needed.map(c => c.join(',')));
    
    for (const combo of combos) {
      if (uncovered.size === 0) break;
      
      // Check which coverage sets this combo covers
      const subsets = getCombinations(combo.filter(n => inputNumbers.includes(n)), guaranteeMatch);
      let coversNew = false;
      
      for (const sub of subsets) {
        const key = sub.join(',');
        if (uncovered.has(key)) {
          coversNew = true;
          break;
        }
      }
      
      if (coversNew || tickets.length === 0) {
        tickets.push(combo);
        // Mark covered
        for (const sub of subsets) {
          uncovered.delete(sub.join(','));
        }
      }
      
      // Safety limit
      if (tickets.length >= 50) break;
    }
  }

  return {
    tickets,
    totalTickets: tickets.length,
    totalCost: tickets.length, // $1 per ticket default
    guarantee: `If ${guaranteeIfHit} of your ${n} numbers are drawn, at least one ticket matches ${guaranteeMatch}+`,
    inputNumbers,
  };
}

function getCombinations(arr: number[], k: number): number[][] {
  if (k > arr.length) return [];
  if (k === arr.length) return [arr.slice()];
  if (k === 1) return arr.map(x => [x]);
  
  const result: number[][] = [];
  
  function backtrack(start: number, current: number[]) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  
  backtrack(0, []);
  return result;
}
