export interface GameConfig {
  id: string;
  name: string;
  state: string;
  mainNumbers: number;
  mainMax: number;
  bonusNumbers: number;
  bonusMax: number;
  ticketCost: number;
  drawDays: string[];
  drawTimes: string[];
  jackpotOdds: number;
  prizeTable: PrizeLevel[];
  description: string;
  color: string;
}

export interface PrizeLevel {
  match: string;
  prize: number | 'jackpot';
  odds: number; // 1 in X
}

export const GAMES: Record<string, GameConfig> = {
  powerball: {
    id: 'powerball',
    name: 'Powerball',
    state: 'MULTI',
    mainNumbers: 5,
    mainMax: 69,
    bonusNumbers: 1,
    bonusMax: 26,
    ticketCost: 2,
    drawDays: ['Mon', 'Wed', 'Sat'],
    drawTimes: ['10:59 PM ET'],
    jackpotOdds: 292201338,
    prizeTable: [
      { match: '5+PB', prize: 'jackpot', odds: 292201338 },
      { match: '5', prize: 1000000, odds: 11688053.52 },
      { match: '4+PB', prize: 50000, odds: 913129.18 },
      { match: '4', prize: 100, odds: 36525.17 },
      { match: '3+PB', prize: 100, odds: 14494.11 },
      { match: '3', prize: 7, odds: 579.76 },
      { match: '2+PB', prize: 7, odds: 701.33 },
      { match: '1+PB', prize: 4, odds: 91.98 },
      { match: '0+PB', prize: 4, odds: 38.32 },
    ],
    description: 'Multi-state jackpot game. 5 numbers from 1-69 + Powerball from 1-26.',
    color: '#ff4444',
  },
  mega_millions: {
    id: 'mega_millions',
    name: 'Mega Millions',
    state: 'MULTI',
    mainNumbers: 5,
    mainMax: 70,
    bonusNumbers: 1,
    bonusMax: 25,
    ticketCost: 2,
    drawDays: ['Tue', 'Fri'],
    drawTimes: ['11:00 PM ET'],
    jackpotOdds: 302575350,
    prizeTable: [
      { match: '5+MB', prize: 'jackpot', odds: 302575350 },
      { match: '5', prize: 1000000, odds: 12607306.25 },
      { match: '4+MB', prize: 10000, odds: 931001.02 },
      { match: '4', prize: 500, odds: 38791.71 },
      { match: '3+MB', prize: 200, odds: 14546.89 },
      { match: '3', prize: 10, odds: 606.12 },
      { match: '2+MB', prize: 10, odds: 693.00 },
      { match: '1+MB', prize: 4, odds: 89.00 },
      { match: '0+MB', prize: 2, odds: 37.00 },
    ],
    description: 'Multi-state jackpot game. 5 numbers from 1-70 + Mega Ball from 1-25.',
    color: '#ffaa00',
  },
  lotto_texas: {
    id: 'lotto_texas',
    name: 'Lotto Texas',
    state: 'TX',
    mainNumbers: 6,
    mainMax: 54,
    bonusNumbers: 0,
    bonusMax: 0,
    ticketCost: 1,
    drawDays: ['Mon', 'Thu', 'Sat'],
    drawTimes: ['10:12 PM CT'],
    jackpotOdds: 25827165,
    prizeTable: [
      { match: '6', prize: 'jackpot', odds: 25827165 },
      { match: '5', prize: 2000, odds: 89678 },
      { match: '4', prize: 50, odds: 1526 },
      { match: '3', prize: 3, odds: 75 },
    ],
    description: 'Texas jackpot game. Pick 6 numbers from 1-54.',
    color: '#00aaff',
  },
  texas_two_step: {
    id: 'texas_two_step',
    name: 'Texas Two Step',
    state: 'TX',
    mainNumbers: 4,
    mainMax: 35,
    bonusNumbers: 1,
    bonusMax: 35,
    ticketCost: 1,
    drawDays: ['Mon', 'Thu'],
    drawTimes: ['10:12 PM CT'],
    jackpotOdds: 3895584,
    prizeTable: [
      { match: '4+BB', prize: 'jackpot', odds: 3895584 },
      { match: '4', prize: 1495, odds: 111302 },
      { match: '3+BB', prize: 54, odds: 3281 },
      { match: '3', prize: 22, odds: 93.74 },
      { match: '2+BB', prize: 21, odds: 528 },
      { match: '2', prize: 7, odds: 15.10 },
      { match: '1+BB', prize: 7, odds: 75 },
      { match: '0+BB', prize: 5, odds: 57 },
    ],
    description: 'Texas game. Pick 4 from 1-35 + Bonus Ball from 1-35.',
    color: '#ff6600',
  },
  cash_five: {
    id: 'cash_five',
    name: 'Cash Five',
    state: 'TX',
    mainNumbers: 5,
    mainMax: 35,
    bonusNumbers: 0,
    bonusMax: 0,
    ticketCost: 1,
    drawDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    drawTimes: ['10:12 PM CT'],
    jackpotOdds: 324632,
    prizeTable: [
      { match: '5', prize: 25000, odds: 324632 },
      { match: '4', prize: 348, odds: 2164 },
      { match: '3', prize: 13, odds: 75 },
      { match: '2', prize: 2, odds: 7.14 },
    ],
    description: 'Texas daily game. Pick 5 from 1-35. Fixed $25K jackpot.',
    color: '#00ff88',
  },
  pick3: {
    id: 'pick3',
    name: 'Pick 3',
    state: 'TX',
    mainNumbers: 3,
    mainMax: 9,
    bonusNumbers: 0,
    bonusMax: 0,
    ticketCost: 1,
    drawDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    drawTimes: ['Morning', 'Day', 'Evening', 'Night'],
    jackpotOdds: 1000,
    prizeTable: [
      { match: 'Exact', prize: 500, odds: 1000 },
      { match: 'Any3', prize: 80, odds: 167 },
      { match: 'Any2', prize: 160, odds: 333 },
    ],
    description: 'Texas daily game. Pick 3 digits 0-9. Up to 4 draws daily.',
    color: '#aa44ff',
  },
  daily4: {
    id: 'daily4',
    name: 'Daily 4',
    state: 'TX',
    mainNumbers: 4,
    mainMax: 9,
    bonusNumbers: 0,
    bonusMax: 0,
    ticketCost: 1,
    drawDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    drawTimes: ['Morning', 'Day', 'Evening', 'Night'],
    jackpotOdds: 10000,
    prizeTable: [
      { match: 'Exact', prize: 5000, odds: 10000 },
      { match: 'Any24', prize: 208, odds: 417 },
      { match: 'Any12', prize: 417, odds: 833 },
      { match: 'Any6', prize: 833, odds: 1667 },
      { match: 'Any4', prize: 1250, odds: 2500 },
    ],
    description: 'Texas daily game. Pick 4 digits 0-9. Up to 4 draws daily.',
    color: '#ff44aa',
  },
  all_or_nothing: {
    id: 'all_or_nothing',
    name: 'All or Nothing',
    state: 'TX',
    mainNumbers: 12,
    mainMax: 24,
    bonusNumbers: 0,
    bonusMax: 0,
    ticketCost: 2,
    drawDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    drawTimes: ['Morning', 'Day', 'Evening', 'Night'],
    jackpotOdds: 2704156,
    prizeTable: [
      { match: '12/0', prize: 250000, odds: 2704156 },
      { match: '11/1', prize: 500, odds: 18779 },
      { match: '10/2', prize: 50, odds: 1685 },
      { match: '9/3', prize: 10, odds: 296 },
      { match: '8/4', prize: 2, odds: 112 },
    ],
    description: 'Match all 12 or none! Pick 12 from 1-24. Win with 12, 11, 10, 9, 8 or 0, 1, 2, 3, 4 matches.',
    color: '#ffdd44',
  },
};

export function getGameConfig(gameId: string): GameConfig | undefined {
  return GAMES[gameId];
}

export function getAllGames(): GameConfig[] {
  return Object.values(GAMES);
}
