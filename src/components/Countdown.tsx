'use client';

import { useState, useEffect } from 'react';

interface CountdownProps {
  targetDate: string;
  label?: string;
}

export function Countdown({ targetDate, label = 'Next Draw' }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const target = new Date(targetDate + 'T22:00:00-06:00');
      const diff = target.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="text-center">
      <div className="text-[10px] text-gray-600 uppercase tracking-wider font-semibold mb-1.5">{label}</div>
      <div className="inline-flex items-center gap-1">
        {[
          { val: pad(timeLeft.hours), label: 'h' },
          { val: pad(timeLeft.minutes), label: 'm' },
          { val: pad(timeLeft.seconds), label: 's' },
        ].map((unit, i) => (
          <div key={i} className="flex items-baseline gap-0.5">
            <span className="countdown-digit text-lg font-black text-gold">{unit.val}</span>
            <span className="text-[9px] text-gray-600 font-semibold">{unit.label}</span>
            {i < 2 && <span className="text-gold/30 font-bold mx-0.5">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
