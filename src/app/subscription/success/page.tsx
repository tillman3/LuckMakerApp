'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [cookieSet, setCookieSet] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId && !cookieSet) {
      fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
        credentials: 'include',
      })
        .then(res => res.json())
        .then(() => setCookieSet(true))
        .catch(() => {});
    }
  }, [searchParams, cookieSet]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="glass-card">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-black mb-4">
          <span className="text-gold text-glow-gold">Welcome to Pro!</span>
        </h1>
        <p className="text-gray-400 mb-8 text-lg">
          Your subscription is active. All Pro features are now unlocked.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-neon font-bold mb-1">✓ Unlimited Generations</div>
            <p className="text-xs text-gray-500">Generate as many number sets as you want</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-neon font-bold mb-1">✓ Wheeling Systems</div>
            <p className="text-xs text-gray-500">Full coverage guarantee calculator</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-neon font-bold mb-1">✓ Number Tracker</div>
            <p className="text-xs text-gray-500">Save numbers, auto-check results</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-neon font-bold mb-1">✓ Ad-Free</div>
            <p className="text-xs text-gray-500">Clean, distraction-free experience</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/generator" 
            className="px-6 py-3 rounded-xl font-bold text-dark-900 bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-400 hover:to-gold transition-all"
          >
            🎲 Generate Numbers
          </Link>
          <Link 
            href="/" 
            className="px-6 py-3 rounded-xl font-bold text-neon border border-neon/30 hover:bg-neon/10 transition-all"
          >
            ← Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="glass-card animate-pulse">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-black mb-4">
            <span className="text-gold text-glow-gold">Setting up your account...</span>
          </h1>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
