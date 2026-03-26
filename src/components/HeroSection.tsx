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
      {/* Single ambient glow — restrained */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/[0.03] rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        {/* Title — let the typography do the work */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-3">
            <span className="text-[rgba(255,255,255,0.95)]">Luck is</span>{' '}
            <span className="text-gold text-glow-gold">a Skill</span>
          </h1>
          <p className="text-sm sm:text-base text-muted max-w-md mx-auto">
            Real math behind every ticket. EV calculations, smart number generation, and honest analytics.
          </p>
        </div>

        {/* Dual Slot Machines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {/* Powerball */}
          <div className="glass-card relative overflow-hidden">
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
                <div className="text-center py-6">
                  <div className="text-[11px] font-bold tracking-widest text-muted uppercase mb-2">Powerball</div>
                  <div className="jackpot-amount text-2xl font-black">
                    {pbJackpot ? `$${Math.round(pbJackpot.amount / 1e6)}M` : '---'}
                  </div>
                </div>
              )}
              {pbJackpot?.nextDraw && (
                <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.04)] text-center">
                  <Countdown targetDate={pbJackpot.nextDraw} />
                </div>
              )}
            </div>
          </div>

          {/* Mega Millions */}
          <div className="glass-card relative overflow-hidden">
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
                <div className="text-center py-6">
                  <div className="text-[11px] font-bold tracking-widest text-muted uppercase mb-2">Mega Millions</div>
                  <div className="jackpot-amount text-2xl font-black">
                    {mmJackpot ? `$${Math.round(mmJackpot.amount / 1e6)}M` : '---'}
                  </div>
                </div>
              )}
              {mmJackpot?.nextDraw && (
                <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.04)] text-center">
                  <Countdown targetDate={mmJackpot.nextDraw} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTAs — two clear options */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <Link href="/generator" className="btn-primary">
            Generate Numbers
          </Link>
          <Link href="/games" className="btn-secondary">
            View EV Ratings
          </Link>
        </div>
      </div>
    </section>
  );
}
