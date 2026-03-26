'use client';

import { SlotMachine } from './SlotMachine';
import { Countdown } from './Countdown';
import Link from 'next/link';
import './slot-machine.css';

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
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-neon/[0.03] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/[0.02] rounded-full blur-[80px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 relative z-10">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-3 tracking-tight">
            <span className="text-white">LUCK</span>{' '}
            <span className="text-gold text-glow-gold">MAKER</span>{' '}
            <span className="text-neon text-glow-neon">3000</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-xl mx-auto">
            Real math. Real odds. <span className="text-gold font-semibold">Make your luck</span>.
          </p>
        </div>

        {/* Dual Slot Machine Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Powerball */}
          <div className="glass-card relative overflow-hidden">
            <div className="absolute inset-0 shimmer-gold pointer-events-none opacity-50" />
            <div className="relative z-10">
              {pb ? (
                <SlotMachine 
                  numbers={pb.numbers}
                  bonus={pb.bonus}
                  gameName="POWERBALL"
                  jackpot={pbJackpot?.amount}
                  maxNumber={69}
                  bonusMax={26}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="slot-game-label">POWERBALL</div>
                  <div className="jackpot-amount text-3xl">
                    {pbJackpot ? `$${Math.round(pbJackpot.amount / 1e6)}M` : '---'}
                  </div>
                </div>
              )}
              {pbJackpot?.nextDraw && (
                <div className="mt-3 pt-3 border-t border-white/5 text-center">
                  <Countdown targetDate={pbJackpot.nextDraw} />
                </div>
              )}
              <div className="text-center mt-2">
                <Link 
                  href="/games/powerball"
                  className="text-xs text-gold/40 hover:text-gold transition-colors"
                >
                  View EV Analysis →
                </Link>
              </div>
            </div>
          </div>

          {/* Mega Millions */}
          <div className="glass-card relative overflow-hidden">
            <div className="absolute inset-0 shimmer-gold pointer-events-none opacity-50" />
            <div className="relative z-10">
              {mm ? (
                <SlotMachine 
                  numbers={mm.numbers}
                  bonus={mm.bonus}
                  gameName="MEGA MILLIONS"
                  jackpot={mmJackpot?.amount}
                  maxNumber={70}
                  bonusMax={25}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="slot-game-label">MEGA MILLIONS</div>
                  <div className="jackpot-amount text-3xl">
                    {mmJackpot ? `$${Math.round(mmJackpot.amount / 1e6)}M` : '---'}
                  </div>
                </div>
              )}
              {mmJackpot?.nextDraw && (
                <div className="mt-3 pt-3 border-t border-white/5 text-center">
                  <Countdown targetDate={mmJackpot.nextDraw} />
                </div>
              )}
              <div className="text-center mt-2">
                <Link 
                  href="/games/mega_millions"
                  className="text-xs text-gold/40 hover:text-gold transition-colors"
                >
                  View EV Analysis →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link 
            href="/generator" 
            className="px-8 py-3.5 rounded-xl font-black text-dark-900 bg-gradient-to-r from-gold via-yellow-400 to-gold hover:from-yellow-400 hover:via-gold hover:to-yellow-400 transition-all glow-gold text-sm sm:text-base uppercase tracking-wide"
          >
            🎲 Generate Lucky Numbers
          </Link>
          <Link 
            href="/games" 
            className="px-8 py-3.5 rounded-xl font-bold text-neon border border-neon/30 hover:bg-neon/10 transition-all text-sm sm:text-base"
          >
            📊 View All EV Ratings
          </Link>
        </div>
      </div>
    </section>
  );
}
