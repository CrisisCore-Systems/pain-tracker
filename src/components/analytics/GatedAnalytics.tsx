/**
 * Gated Analytics Components
 * Wraps analytics components with subscription feature gates
 */

import React from 'react';
import { FeatureGate } from '../subscription/FeatureGates';
import type { PainEntry } from '../../types';

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
  return (
    <FeatureGate feature="advancedAnalytics" showUpgradePrompt>
      <AdvancedAnalyticsDashboard {...props} />
    </FeatureGate>
  );
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
  return (
    <FeatureGate feature="empathyIntelligence" showUpgradePrompt>
      <EmpathyAnalyticsDashboard {...props} />
    </FeatureGate>
  );
};

/**
 * Predictive Insights Placeholder
 * Shows upgrade prompt for Pro tier
 */
export const PredictiveInsightsGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FeatureGate feature="predictiveInsights" showUpgradePrompt>
      {children}
    </FeatureGate>
  );
};
