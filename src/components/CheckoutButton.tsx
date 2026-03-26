'use client';

import { useState } from 'react';

interface CheckoutButtonProps {
  plan: string;
  tierName: string;
}

export function CheckoutButton({ plan, tierName }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isGold = tierName === 'Premium';
  const btnClass = isGold
    ? 'bg-gradient-to-r from-gold/20 to-yellow-600/20 text-gold border border-gold/30 hover:border-gold/50 hover:from-gold/30 hover:to-yellow-600/30'
    : 'bg-gradient-to-r from-neon/20 to-emerald-600/20 text-neon border border-neon/30 hover:border-neon/50 hover:from-neon/30 hover:to-emerald-600/30';

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-bold transition-all ${btnClass} ${loading ? 'opacity-50 cursor-wait' : ''}`}
      >
        {loading ? 'Redirecting...' : `Get ${tierName}`}
      </button>
      {error && (
        <p className="text-xs text-center text-gold mt-2">{error}</p>
      )}
    </div>
  );
}
