'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/games', label: 'Games & EV', icon: '🎰' },
    { href: '/generator', label: 'Generator', icon: '🎲' },
    { href: '/results', label: 'Results', icon: '🏆' },
    { href: '/pool', label: 'Pool', icon: '👥' },
    { href: '/calculator', label: 'What If', icon: '💰' },
    { href: '/tracker', label: 'Tracker', icon: '🎯' },
    { href: '/about', label: 'About', icon: '📖' },
  ];

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-2xl animate-float">🍀</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg sm:text-xl font-black tracking-tight text-neon">LUCK</span>
              <span className="text-lg sm:text-xl font-black tracking-tight text-white/90">MAKER</span>
              <span className="text-lg sm:text-xl font-black tracking-tight text-gold">3000</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-xl text-[13px] font-medium text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/pricing"
              className="ml-3 px-5 py-2 rounded-xl text-[13px] font-bold bg-gradient-to-r from-gold/15 to-yellow-500/15 text-gold border border-gold/20 hover:border-gold/40 hover:from-gold/25 hover:to-yellow-500/25 transition-all duration-300"
            >
              ⚡ Go Pro
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden pb-5 pt-2 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
            <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-3" />
            <div className="grid grid-cols-2 gap-1.5">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-gray-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-3">
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-gold bg-gold/10 border border-gold/20 hover:bg-gold/15 transition-all"
                onClick={() => setMobileOpen(false)}
              >
                ⚡ Go Pro
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
