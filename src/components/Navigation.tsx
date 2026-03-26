'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/games', label: 'Games & EV' },
    { href: '/generator', label: 'Generator' },
    { href: '/results', label: 'Results' },
    { href: '/pool', label: 'Pool' },
    { href: '/tracker', label: 'Tracker' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl animate-float">🍀</span>
            <span className="text-xl font-black tracking-tight">
              <span className="text-neon">LUCK</span>
              <span className="text-white"> MAKER</span>
              <span className="text-gold"> 3000</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-gold hover:bg-white/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/pricing"
              className="ml-2 px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-gold/20 to-yellow-600/20 text-gold border border-gold/30 hover:border-gold/50 hover:bg-gold/30 transition-all"
            >
              ⚡ Go Pro
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-white/5 mt-2 pt-2">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 rounded-lg text-gray-300 hover:text-gold hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/pricing"
              className="block mt-2 px-3 py-2 rounded-lg text-gold font-bold"
              onClick={() => setMobileOpen(false)}
            >
              ⚡ Go Pro
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
