/**
 * Gated Analytics Components
 * Wraps analytics components with subscription feature gates
 */

import React from 'react';
import type { PainEntry } from '../../types';
import { entitlementService } from '../../services/EntitlementService';
import { UpgradeCard } from '../UpgradeCard';

// Import actual analytics components
import { AdvancedAnalyticsDashboard } from './AdvancedAnalyticsDashboard';
import { EmpathyAnalyticsDashboard } from './EmpathyAnalyticsDashboard';

interface GatedAdvancedAnalyticsProps {
  entries: PainEntry[];
  className?: string;
}

/**
 * Advanced Analytics with Feature Gate
 * Requires Basic tier or higher
 */
export const GatedAdvancedAnalytics: React.FC<GatedAdvancedAnalyticsProps> = props => {
  if (!entitlementService.hasEntitlement('analytics_advanced')) {
    return <UpgradeCard moduleId="analytics_advanced" />;
  }

  return <AdvancedAnalyticsDashboard {...props} />;
};

interface GatedEmpathyAnalyticsProps {
  entries: PainEntry[];
  userId: string;
  onCelebrate?: (achievement: unknown) => void;
  onShare?: (message: string) => void;
}

/**
 * Pattern-aware insights analytics with Feature Gate
 * Requires Basic tier or higher
 */
export const GatedEmpathyAnalytics: React.FC<GatedEmpathyAnalyticsProps> = props => {
  if (!entitlementService.hasEntitlement('analytics_advanced')) {
    return <UpgradeCard moduleId="analytics_advanced" />;
  }

  return <EmpathyAnalyticsDashboard {...props} />;
};

/**
 * Predictive Insights Placeholder
 * Shows upgrade prompt for Pro tier
 */
export const PredictiveInsightsGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!entitlementService.hasEntitlement('analytics_advanced')) {
    return <UpgradeCard moduleId="analytics_advanced" />;
  }

  return <>{children}</>;
};
