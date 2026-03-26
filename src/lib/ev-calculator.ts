import { GameConfig } from './games';

export interface EVResult {
  expectedValue: number;
  ticketCost: number;
  netEV: number;
  isPositiveEV: boolean;
  recommendation: 'PLAY' | 'SKIP' | 'BORDERLINE';
  breakdown: EVBreakdown[];
  jackpotAfterTax: number;
  lumpSum: number;
  effectiveJackpot: number;
}

export interface EVBreakdown {
  match: string;
  prize: number;
  odds: number;
  probability: number;
  contribution: number;
}

const FEDERAL_TAX_RATE = 0.37; // Top bracket
const DEFAULT_STATE_TAX_RATE = 0.0; // Texas has no state income tax!
const LUMP_SUM_FACTOR = 0.60; // Typical lump sum is ~60% of advertised

export function calculateEV(
  game: GameConfig,
  currentJackpot: number,
  options: {
    stateTaxRate?: number;
    federalTaxRate?: number;
    lumpSum?: boolean;
    estimatedTicketSales?: number;
  } = {}
): EVResult {
  const {
    stateTaxRate = DEFAULT_STATE_TAX_RATE,
    federalTaxRate = FEDERAL_TAX_RATE,
    lumpSum = true,
    estimatedTicketSales,
  } = options;

  const totalTaxRate = federalTaxRate + stateTaxRate;
  
  // Calculate effective jackpot
  let effectiveJackpot = currentJackpot;
  if (lumpSum) {
    effectiveJackpot *= LUMP_SUM_FACTOR;
  }
  const jackpotAfterTax = effectiveJackpot * (1 - totalTaxRate);

  // Account for jackpot splitting probability
  let splitFactor = 1;
  if (estimatedTicketSales && game.jackpotOdds) {
    // Expected number of other winners
    const otherTickets = estimatedTicketSales - 1;
    const probOtherWinner = otherTickets / game.jackpotOdds;
    // Expected share if you win: 1 / (1 + expected_other_winners)
    splitFactor = 1 / (1 + probOtherWinner);
  }

  const breakdown: EVBreakdown[] = [];
  let totalEV = 0;

  for (const level of game.prizeTable) {
    const probability = 1 / level.odds;
    let prize: number;

    if (level.prize === 'jackpot') {
      prize = jackpotAfterTax * splitFactor;
    } else {
      // Smaller prizes: taxes only on prizes > $5000
      if (level.prize > 5000) {
        prize = level.prize * (1 - totalTaxRate);
      } else {
        prize = level.prize;
      }
    }

    const contribution = probability * prize;
    totalEV += contribution;

    breakdown.push({
      match: level.match,
      prize: level.prize === 'jackpot' ? jackpotAfterTax * splitFactor : level.prize,
      odds: level.odds,
      probability,
      contribution,
    });
  }

  const netEV = totalEV - game.ticketCost;
  
  let recommendation: 'PLAY' | 'SKIP' | 'BORDERLINE';
  if (netEV > 0.5) {
    recommendation = 'PLAY';
  } else if (netEV > -0.5) {
    recommendation = 'BORDERLINE';
  } else {
    recommendation = 'SKIP';
  }

  return {
    expectedValue: totalEV,
    ticketCost: game.ticketCost,
    netEV,
    isPositiveEV: netEV > 0,
    recommendation,
    breakdown,
    jackpotAfterTax,
    lumpSum: effectiveJackpot,
    effectiveJackpot,
  };
}

// Calculate the minimum jackpot for positive EV
export function calculateBreakevenJackpot(game: GameConfig): number {
  // Work backwards: what jackpot makes EV = ticket cost?
  // EV = sum(non-jackpot contributions) + (jackpot_after_tax / jackpot_odds)
  // We want EV = ticket_cost
  
  let nonJackpotEV = 0;
  for (const level of game.prizeTable) {
    if (level.prize !== 'jackpot') {
      const probability = 1 / level.odds;
      nonJackpotEV += probability * level.prize;
    }
  }

  const neededFromJackpot = game.ticketCost - nonJackpotEV;
  const jackpotProbability = 1 / game.jackpotOdds;
  
  // neededFromJackpot = jackpotProbability * jackpotAfterTax
  // jackpotAfterTax = jackpot * lumpSumFactor * (1 - taxRate)
  const afterTaxFactor = LUMP_SUM_FACTOR * (1 - FEDERAL_TAX_RATE);
  
  const breakeven = neededFromJackpot / (jackpotProbability * afterTaxFactor);
  return Math.max(0, breakeven);
}

export function formatCurrency(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(2)}`;
}

export function formatOdds(odds: number): string {
  if (odds >= 1_000_000) {
    return `1 in ${(odds / 1_000_000).toFixed(1)}M`;
  }
  if (odds >= 1000) {
    return `1 in ${(odds / 1000).toFixed(1)}K`;
  }
  return `1 in ${odds.toFixed(0)}`;
}
