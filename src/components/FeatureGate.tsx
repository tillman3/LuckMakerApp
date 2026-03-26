'use client';

import { ReactNode } from 'react';
import { useAuth, hasAccess } from '@/lib/auth-context';
import { UpgradePrompt } from './UpgradePrompt';

type Plan = 'pro' | 'premium';

interface FeatureGateProps {
  requiredPlan: Plan;
  children: ReactNode;
  title?: string;
  message?: string;
  compact?: boolean;
  /** If true, renders nothing instead of upgrade prompt (for hiding sections like ads) */
  hideOnly?: boolean;
  /** If true, show a loading skeleton while auth is loading */
  showLoading?: boolean;
}

export function FeatureGate({ 
  requiredPlan, 
  children, 
  title, 
  message, 
  compact = false,
  hideOnly = false,
  showLoading = false,
}: FeatureGateProps) {
  const { plan, loading } = useAuth();

  if (loading && showLoading) {
    return (
      <div className="glass-card animate-pulse">
        <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
        <div className="h-3 bg-white/5 rounded w-2/3" />
      </div>
    );
  }

  if (loading) return null;

  if (hasAccess(plan, requiredPlan)) {
    return <>{children}</>;
  }

  if (hideOnly) return null;

  return <UpgradePrompt plan={requiredPlan} title={title} message={message} compact={compact} />;
}
