'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SlotMachineProps {
  numbers: number[];
  bonus?: number | null;
  gameName: string;
  jackpot?: number | null;
  maxNumber?: number; // e.g., 69 for Powerball main, 26 for Powerball bonus
  bonusMax?: number;
}

// Single reel component — shows a vertical strip of numbers scrolling down
function Reel({ 
  targetNumber, 
  delay, 
  isBonus = false,
  maxNum = 69,
  onStop 
}: { 
  targetNumber: number; 
  delay: number; 
  isBonus?: boolean;
  maxNum?: number;
  onStop?: () => void;
}) {
  const reelRef = useRef<HTMLDivElement>(null);
  const [spinning, setSpinning] = useState(true);
  const [stopped, setStopped] = useState(false);

  // Generate the reel strip: random numbers + target at the end
  const reelNumbers = useRef<number[]>([]);
  if (reelNumbers.current.length === 0) {
    const strip: number[] = [];
    // 20 random numbers for the spinning effect
    for (let i = 0; i < 20; i++) {
      strip.push(Math.floor(Math.random() * maxNum) + 1);
    }
    strip.push(targetNumber); // Final stop position
    reelNumbers.current = strip;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setSpinning(false);
      // Small delay before showing "stopped" state for the bounce effect
      setTimeout(() => {
        setStopped(true);
        onStop?.();
      }, 300);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, onStop]);

  const itemHeight = 52; // Height of each number cell
  const totalItems = reelNumbers.current.length;
  const stopPosition = -(totalItems - 1) * itemHeight; // Stop at last item (target)

  return (
    <div className="reel-container">
      <div className="reel-window">
        {/* Top fade gradient */}
        <div className="reel-fade-top" />
        {/* Bottom fade gradient */}
        <div className="reel-fade-bottom" />
        
        <div
          ref={reelRef}
          className="reel-strip"
          style={{
            transform: spinning 
              ? `translateY(${stopPosition}px)` 
              : `translateY(${stopPosition}px)`,
            transition: spinning 
              ? 'none'
              : `transform ${1.2}s cubic-bezier(0.15, 0.85, 0.35, 1.02)`,
            animation: spinning ? 'reelSpin 0.08s linear infinite' : 'none',
          }}
        >
          {reelNumbers.current.map((num, i) => (
            <div
              key={i}
              className="reel-item"
              style={{ height: itemHeight }}
            >
              <span className={`reel-number ${
                i === totalItems - 1 && stopped
                  ? isBonus ? 'reel-number-bonus-active' : 'reel-number-active'
                  : 'reel-number-dim'
              }`}>
                {String(num).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Stopped indicator flash */}
      {stopped && (
        <div className={`reel-flash ${isBonus ? 'reel-flash-bonus' : ''}`} />
      )}
    </div>
  );
}

export function SlotMachine({ numbers, bonus, gameName, jackpot, maxNumber = 69, bonusMax = 26 }: SlotMachineProps) {
  const [phase, setPhase] = useState<'spinning' | 'revealing' | 'done'>('spinning');
  const [stoppedCount, setStoppedCount] = useState(0);
  const [showJackpot, setShowJackpot] = useState(false);
  const totalReels = numbers.length + (bonus != null ? 1 : 0);

  const handleReelStop = useCallback(() => {
    setStoppedCount(prev => {
      const next = prev + 1;
      if (next >= totalReels) {
        setPhase('done');
        setTimeout(() => setShowJackpot(true), 400);
      }
      return next;
    });
  }, [totalReels]);

  const formatJackpot = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)} BILLION`;
    if (amount >= 1e6) return `$${Math.round(amount / 1e6)} MILLION`;
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="slot-machine">
      {/* Game label */}
      <div className="slot-game-label">{gameName}</div>
      
      {/* Machine frame */}
      <div className="slot-frame">
        {/* Top chrome bar */}
        <div className="slot-chrome-top" />
        
        {/* Reels area */}
        <div className="slot-reels">
          {numbers.map((num, i) => (
            <Reel
              key={`main-${i}`}
              targetNumber={num}
              delay={1500 + i * 600} // Stagger stops: 1.5s, 2.1s, 2.7s, etc.
              maxNum={maxNumber}
              onStop={handleReelStop}
            />
          ))}
          
          {bonus != null && (
            <>
              <div className="slot-divider" />
              <Reel
                key="bonus"
                targetNumber={bonus}
                delay={1500 + numbers.length * 600 + 800}
                isBonus={true}
                maxNum={bonusMax}
                onStop={handleReelStop}
              />
            </>
          )}
        </div>
        
        {/* Bottom chrome bar */}
        <div className="slot-chrome-bottom" />
      </div>

      {/* Jackpot display */}
      {jackpot && (
        <div className={`slot-jackpot ${showJackpot ? 'slot-jackpot-visible' : ''}`}>
          <div className="slot-jackpot-label">JACKPOT</div>
          <div className="slot-jackpot-amount">{formatJackpot(jackpot)}</div>
        </div>
      )}
      
      {/* Gold sparkle particles when done */}
      {phase === 'done' && (
        <div className="slot-sparkles">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="slot-sparkle"
              style={{
                left: `${10 + Math.random() * 80}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1.5 + Math.random() * 1.5}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
