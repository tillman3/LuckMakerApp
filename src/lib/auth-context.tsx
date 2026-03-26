'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type Plan = 'free' | 'pro' | 'premium';

interface AuthState {
  plan: Plan;
  email: string | null;
  customerId: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  plan: 'free',
  email: null,
  customerId: null,
  loading: true,
  refresh: async () => {},
  login: async () => ({ success: false }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<Plan>('free');
  const [email, setEmail] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/status', { credentials: 'include' });
      const data = await res.json();
      setPlan(data.plan || 'free');
      setEmail(data.email || null);
      setCustomerId(data.customerId || null);
    } catch {
      setPlan('free');
      setEmail(null);
      setCustomerId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        await refresh();
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    setPlan('free');
    setEmail(null);
    setCustomerId(null);
  }, []);

  return (
    <AuthContext.Provider value={{ plan, email, customerId, loading, refresh, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/** Check if user's plan meets the required tier */
export function hasAccess(userPlan: Plan, requiredPlan: Plan): boolean {
  const tiers: Plan[] = ['free', 'pro', 'premium'];
  return tiers.indexOf(userPlan) >= tiers.indexOf(requiredPlan);
}
