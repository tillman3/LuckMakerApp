import { NextRequest, NextResponse } from 'next/server';
import { GAMES } from '@/lib/games';
import { generateAntiPopular, generateQuickPick, generateBalanced } from '@/lib/number-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, strategy = 'anti-popular', count = 1 } = body;

    const game = GAMES[gameId];
    if (!game) {
      return NextResponse.json({ error: 'Unknown game' }, { status: 400 });
    }

    const safeCount = Math.min(Math.max(1, count), 10);
    const results = [];

    for (let i = 0; i < safeCount; i++) {
      let result;
      switch (strategy) {
        case 'anti-popular':
          result = generateAntiPopular(game.mainNumbers, game.mainMax);
          break;
        case 'balanced':
          result = generateBalanced(game.mainNumbers, game.mainMax);
          break;
        default:
          result = generateQuickPick(game.mainNumbers, game.mainMax);
      }

      if (game.bonusNumbers > 0) {
        result.bonusNumber = Math.floor(Math.random() * game.bonusMax) + 1;
      }

      results.push(result);
    }

    return NextResponse.json({ results, game: game.name });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
