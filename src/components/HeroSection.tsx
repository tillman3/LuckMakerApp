'use client';

import { SlotReveal } from './SlotReveal';
import { Countdown } from './Countdown';
import Link from 'next/link';

interface HeroProps {
  latestDraws: Record<string, { numbers: number[]; bonus: number | null; date: string }>;
  jackpots: Record<string, { amount: number; nextDraw: string; cashValue: number }>;
}

export function HeroSection({ latestDraws, jackpots }: HeroProps) {
  const pb = latestDraws['powerball'];
  const mm = latestDraws['mega_millions'];
  const pbJackpot = jackpots['powerball'];
  const mmJackpot = jackpots['mega_millions'];

  return (
    <section className="hero-bg relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon/3 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-6xl font-black mb-4 tracking-tight">
            <span className="text-white">LUCK</span>{' '}
            <span className="text-gold text-glow-gold">MAKER</span>{' '}
            <span className="text-neon text-glow-neon">3000</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto">
            Real math. Real odds. <span className="text-gold font-semibold">Make your luck</span>.
          </p>
        </div>

        {/* Dual Jackpot Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Powerball */}
          <div className="glass-card text-center relative overflow-hidden">
            <div className="absolute inset-0 shimmer-gold pointer-events-none" />
            <div className="relative z-10">
              {pb ? (
                <SlotReveal 
                  numbers={pb.numbers}
                  bonus={pb.bonus}
                  gameName="POWERBALL"
                  jackpot={pbJackpot?.amount}
                  bonusLabel="Powerball"
                />
              ) : (
                <div>
                  <div className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">POWERBALL</div>
                  <div className="jackpot-amount text-3xl">
                    {pbJackpot ? `$${Math.round(pbJackpot.amount / 1e6)}M` : 'Loading...'}
                  </div>
                </div>
              )}
              {pbJackpot?.nextDraw && (
                <div className="mt-4 pt-3 border-t border-white/5">
                  <Countdown targetDate={pbJackpot.nextDraw} />
                </div>
              )}
              <Link 
                href="/games/powerball"
                className="mt-3 inline-block text-xs text-gold/60 hover:text-gold transition-colors"
              >
                View EV Analysis →
              </Link>
            </div>
          </div>

          {/* Mega Millions */}
          <div className="glass-card text-center relative overflow-hidden">
            <div className="absolute inset-0 shimmer-gold pointer-events-none" />
            <div className="relative z-10">
              {mm ? (
                <SlotReveal 
                  numbers={mm.numbers}
                  bonus={mm.bonus}
                  gameName="MEGA MILLIONS"
                  jackpot={mmJackpot?.amount}
                  bonusLabel="Mega Ball"
                />
              ) : (
                <div>
                  <div className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">MEGA MILLIONS</div>
                  <div className="jackpot-amount text-3xl">
                    {mmJackpot ? `$${Math.round(mmJackpot.amount / 1e6)}M` : 'Loading...'}
                  </div>
                </div>
              )}
              {mmJackpot?.nextDraw && (
                <div className="mt-4 pt-3 border-t border-white/5">
                  <Countdown targetDate={mmJackpot.nextDraw} />
                </div>
              )}
              <Link 
                href="/games/mega_millions"
                className="mt-3 inline-block text-xs text-gold/60 hover:text-gold transition-colors"
              >
                View EV Analysis →
              </Link>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link 
            href="/generator" 
            className="px-8 py-3 rounded-xl font-bold text-dark-900 bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-400 hover:to-gold transition-all glow-gold text-sm sm:text-base"
          >
            🎲 Generate Lucky Numbers
          </Link>
          <Link 
            href="/games" 
            className="px-8 py-3 rounded-xl font-bold text-neon border border-neon/30 hover:bg-neon/10 transition-all text-sm sm:text-base"
          >
            📊 View All EV Ratings
          </Link>
        </div>
      </div>
    </section>
  );
}
