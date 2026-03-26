'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth, hasAccess } from '@/lib/auth-context';

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const { plan, email, loading, login, logout } = useAuth();
  const isPaid = hasAccess(plan, 'pro');

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

  async function handleLogin() {
    if (!loginEmail.trim()) return;
    setLoginLoading(true);
    setLoginError('');
    const result = await login(loginEmail.trim());
    if (result.success) {
      setShowLogin(false);
      setLoginEmail('');
    } else {
      setLoginError(result.error || 'Login failed');
    }
    setLoginLoading(false);
  }

  return (
    <>
      <nav className="nav-glass sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg">🍀</span>
              <span className="text-base font-black tracking-tight">
                <span className="text-neon">LUCK</span>
                <span className="text-[rgba(255,255,255,0.9)]">MAKER</span>
              </span>
            </Link>

            {/* Desktop nav */}
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

              {!loading && isPaid ? (
                <div className="flex items-center gap-2 ml-3">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-gold/15 text-gold border border-gold/20">
                    {plan === 'premium' ? '👑 Premium' : '⚡ Pro'}
                  </span>
                  <button
                    onClick={logout}
                    className="px-3 py-1.5 rounded-lg text-[12px] text-[rgba(255,255,255,0.35)] hover:text-[rgba(255,255,255,0.7)] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : !loading && plan === 'free' ? (
                <div className="flex items-center gap-1.5 ml-3">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-[rgba(255,255,255,0.5)] hover:text-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
                  >
                    Log In
                  </button>
                  <Link
                    href="/pricing"
                    className="px-4 py-1.5 rounded-lg text-[13px] font-bold text-dark-900 bg-gold hover:bg-gold-dim transition-colors"
                  >
                    Go Pro
                  </Link>
                </div>
              ) : null}
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

              {!loading && isPaid ? (
                <div className="mt-2 mx-3 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-gold/15 text-gold border border-gold/20">
                    {plan === 'premium' ? '👑 Premium' : '⚡ Pro'}
                  </span>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="text-sm text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.7)]"
                  >
                    Logout
                  </button>
                </div>
              ) : !loading ? (
                <>
                  <button
                    onClick={() => { setShowLogin(true); setMobileOpen(false); }}
                    className="block w-full mt-2 mx-3 py-2.5 text-sm text-left text-[rgba(255,255,255,0.6)] hover:text-[rgba(255,255,255,0.9)]"
                    style={{ width: 'calc(100% - 24px)' }}
                  >
                    Log In
                  </button>
                  <Link
                    href="/pricing"
                    className="block mt-1 mx-3 py-2.5 rounded-lg text-sm text-center font-bold text-dark-900 bg-gold"
                    onClick={() => setMobileOpen(false)}
                  >
                    Go Pro
                  </Link>
                </>
              ) : null}
            </div>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setShowLogin(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative glass-card w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowLogin(false)}
              className="absolute top-4 right-4 text-[rgba(255,255,255,0.3)] hover:text-[rgba(255,255,255,0.7)] transition-colors"
            >
              ✕
            </button>
            <h2 className="text-xl font-black mb-2">Welcome Back</h2>
            <p className="text-sm text-[rgba(255,255,255,0.45)] mb-5">
              Enter the email you used for your subscription.
            </p>

            <input
              type="email"
              value={loginEmail}
              onChange={e => { setLoginEmail(e.target.value); setLoginError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="you@example.com"
              autoFocus
              className="w-full p-3 rounded-xl bg-dark-900/50 border border-white/10 text-white placeholder-gray-600 focus:border-gold/30 focus:outline-none mb-3"
            />

            {loginError && (
              <p className="text-sm text-danger mb-3">{loginError}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={loginLoading}
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-gold/20 to-yellow-600/20 text-gold border border-gold/30 hover:border-gold/50 transition-all disabled:opacity-50"
            >
              {loginLoading ? 'Logging in...' : 'Log In'}
            </button>

            <p className="text-xs text-[rgba(255,255,255,0.3)] mt-3 text-center">
              Don&apos;t have a subscription? <Link href="/pricing" className="text-gold hover:underline" onClick={() => setShowLogin(false)}>Get started</Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
