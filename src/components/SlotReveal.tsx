'use client';

import { useState, useEffect } from 'react';

interface SlotRevealProps {
  numbers: number[];
  bonus?: number | null;
  gameName: string;
  jackpot?: number | null;
  bonusLabel?: string;
}

export function SlotReveal({ numbers, bonus, gameName, jackpot, bonusLabel = 'Bonus' }: SlotRevealProps) {
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [showJackpot, setShowJackpot] = useState(false);

  useEffect(() => {
    // Stagger the reveal of each ball
    numbers.forEach((_, i) => {
      setTimeout(() => {
        setRevealed(prev => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, 300 + i * 200);
    });
    // Reveal bonus ball last
    if (bonus) {
      setTimeout(() => {
        setRevealed(prev => {
          const next = [...prev];
          next[numbers.length] = true;
          return next;
        });
      }, 300 + numbers.length * 200 + 300);
    }
    // Show jackpot after all balls
    setTimeout(() => setShowJackpot(true), 300 + (numbers.length + (bonus ? 1 : 0)) * 200 + 500);
  }, [numbers, bonus]);

  const formatJackpot = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${Math.round(amount / 1e6)}M`;
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="text-center">
      <div className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">
        {gameName}
      </div>
      
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 flex-wrap">
        {numbers.map((num, i) => (
          <div
            key={i}
            className={`lottery-ball ${revealed[i] ? 'animate-slot-bounce' : 'opacity-0'}`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {num}
          </div>
        ))}
        {bonus != null && (
          <>
            <span className="text-gray-600 text-lg mx-1">+</span>
            <div
              className={`lottery-ball lottery-ball-bonus ${revealed[numbers.length] ? 'animate-slot-bounce' : 'opacity-0'}`}
            >
              {bonus}
            </div>
          </>
        )}
      </div>

      {jackpot && (
        <div className={`transition-all duration-700 ${showJackpot ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <div className="text-xs text-gray-500 mb-1">JACKPOT</div>
          <div className="jackpot-amount text-3xl sm:text-4xl animate-pulse-glow inline-block px-4 py-1 rounded-xl">
            {formatJackpot(jackpot)}
          </div>
        </div>
      )}
    </div>
  );
}
