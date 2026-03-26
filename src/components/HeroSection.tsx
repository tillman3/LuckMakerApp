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
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-neon/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-500/[0.015] rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        {/* Title */}
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black mb-4 tracking-tighter leading-none">
            <span className="text-white">LUCK</span>{' '}
            <span className="text-gold text-glow-gold">MAKER</span>{' '}
            <span className="text-neon text-glow-neon">3000</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-500 max-w-lg mx-auto font-medium">
            Real math. Real odds. <span className="text-gold font-bold">Make your luck</span>.
          </p>
        </div>

        {/* Dual Slot Machine Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto animate-fade-in-scale" style={{ animationDelay: '0.15s' }}>
          {/* Powerball */}
          <div className="glass-card relative overflow-hidden border-red-500/5 hover:border-red-500/15">
            <div className="absolute inset-0 shimmer-gold pointer-events-none opacity-30" />
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
                <div className="text-center py-10">
                  <div className="slot-game-label">POWERBALL</div>
                  <div className="jackpot-massive">
                    {pbJackpot ? `$${Math.round(pbJackpot.amount / 1e6)}M` : '---'}
                  </div>
                </div>
              )}
              {pbJackpot?.nextDraw && (
                <div className="mt-4 pt-3 border-t border-white/[0.04] text-center">
                  <Countdown targetDate={pbJackpot.nextDraw} />
                </div>
              )}
              <div className="text-center mt-2">
                <Link 
                  href="/games/powerball"
                  className="text-xs font-semibold text-gold/30 hover:text-gold transition-colors"
                >
                  View EV Analysis →
                </Link>
              </div>
            </div>
          </div>

          {/* Mega Millions */}
          <div className="glass-card relative overflow-hidden border-gold/5 hover:border-gold/15">
            <div className="absolute inset-0 shimmer-gold pointer-events-none opacity-30" />
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
                <div className="text-center py-10">
                  <div className="slot-game-label">MEGA MILLIONS</div>
                  <div className="jackpot-massive">
                    {mmJackpot ? `$${Math.round(mmJackpot.amount / 1e6)}M` : '---'}
                  </div>
                </div>
              )}
              {mmJackpot?.nextDraw && (
                <div className="mt-4 pt-3 border-t border-white/[0.04] text-center">
                  <Countdown targetDate={mmJackpot.nextDraw} />
                </div>
              )}
              <div className="text-center mt-2">
                <Link 
                  href="/games/mega_millions"
                  className="text-xs font-semibold text-gold/30 hover:text-gold transition-colors"
                >
                  View EV Analysis →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Link href="/generator" className="btn-primary">
            🎲 Generate Lucky Numbers
          </Link>
          <Link href="/games" className="btn-secondary">
            📊 View All EV Ratings
          </Link>
        </div>
      </div>
    </section>
  );
}
