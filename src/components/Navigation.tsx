'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/games', label: 'Games' },
    { href: '/generator', label: 'Generator' },
    { href: '/results', label: 'Results' },
    { href: '/pool', label: 'Pool' },
    { href: '/calculator', label: 'What If' },
    { href: '/tracker', label: 'Tracker' },
    { href: '/blog', label: 'Blog' },
  ];

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo — compact, no emoji bouncing */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg">🍀</span>
            <span className="text-base font-black tracking-tight">
              <span className="text-neon">LUCK</span>
              <span className="text-[rgba(255,255,255,0.9)]">MAKER</span>
            </span>
          </Link>

          {/* Desktop nav — minimal */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/pricing"
              className="ml-3 px-4 py-1.5 rounded-lg text-[13px] font-bold text-dark-900 bg-gold hover:bg-gold-dim transition-colors"
            >
              Go Pro
            </Link>
          </div>

          {/* Mobile */}
          <button
            className="md:hidden p-2 text-[rgba(255,255,255,0.5)]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-3 pt-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 rounded-lg text-sm text-[rgba(255,255,255,0.6)] hover:text-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,0.04)]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/pricing"
              className="block mt-2 mx-3 py-2.5 rounded-lg text-sm text-center font-bold text-dark-900 bg-gold"
              onClick={() => setMobileOpen(false)}
            >
              Go Pro
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
