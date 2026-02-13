/**
 * Feature Gate Components
 * Components for conditional rendering based on subscription tier
 */

import React, { ReactNode } from 'react';
import { AlertCircle, Lock, TrendingUp, Crown } from 'lucide-react';
import { useSubscription, useFeatureAccess, useHasTier } from '../../contexts/SubscriptionContext';
import type { SubscriptionTier, TierFeatures } from '../../types/subscription';

/**
 * Props for FeatureGate component
 */
interface FeatureGateProps {
  feature: keyof TierFeatures;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

/**
 * FeatureGate Component
 * Conditionally renders children based on feature access
 */
export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
}) => {
  const { currentTier } = useSubscription();
  const access = useFeatureAccess(feature);

  if (access.loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded p-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
      </div>
    );
  }

  if (access.hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt && access.upgradeRequired) {
    return (
      <UpgradePrompt
        feature={feature}
        requiredTier={access.upgradeRequired}
        currentTier={currentTier}
        reason={access.reason}
      />
    );
  }

  return null;
};

/**
 * Props for TierGate component
 */
interface TierGateProps {
  requiredTier: SubscriptionTier;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

/**
 * TierGate Component
 * Conditionally renders based on user's subscription tier
 */
export const TierGate: React.FC<TierGateProps> = ({
  requiredTier,
  children,
  fallback,
  showUpgradePrompt = true,
}) => {
  const hasTier = useHasTier(requiredTier);
  const { currentTier } = useSubscription();

  if (hasTier) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <UpgradePrompt
        requiredTier={requiredTier}
        currentTier={currentTier}
        reason={`This feature requires ${requiredTier} tier or higher`}
      />
    );
  }

  return null;
};

/**
 * Props for UpgradePrompt component
 */
interface UpgradePromptProps {
  feature?: keyof TierFeatures;
  requiredTier: SubscriptionTier;
  currentTier?: SubscriptionTier;
  reason?: string;
  onUpgrade?: () => void;
}

/**
 * UpgradePrompt Component
 * Displays upgrade prompt when feature access is denied
 */
export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  requiredTier,
  currentTier: _currentTier,
  reason,
  onUpgrade,
}) => {
  const tierIcons: Record<SubscriptionTier, string> = {
    free: '🆓',
    basic: '⭐',
    pro: '💎',
    enterprise: '👑',
  };

  const tierColors: Record<SubscriptionTier, string> = {
    free: 'bg-gray-100 border-gray-300 text-gray-700',
    basic: 'bg-blue-50 border-blue-300 text-blue-700',
    pro: 'bg-purple-50 border-purple-300 text-purple-700',
    enterprise: 'bg-amber-50 border-amber-300 text-amber-700',
  };

  return (
    <div className={`border-2 rounded-lg p-6 ${tierColors[requiredTier]}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Lock className="w-8 h-8" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">
            {tierIcons[requiredTier]} {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}{' '}
            Feature
          </h3>

          <p className="text-sm mb-4">
            {reason || `This feature is available in the ${requiredTier} plan.`}
          </p>

          {feature && (
            <p className="text-xs mb-4 opacity-75">
              Feature: <code className="bg-black/10 px-2 py-1 rounded">{String(feature)}</code>
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onUpgrade || (() => (window.location.href = '/pricing'))}
              className="bg-white px-4 py-2 rounded-md font-medium hover:shadow-md transition-shadow flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
            </button>

            <a href="/pricing" className="text-sm underline hover:no-underline">
              Compare plans
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Props for UsageWarning component
 */
interface UsageWarningProps {
  feature: keyof TierFeatures;
  threshold?: number; // Percentage (0-100)
}

/**
 * UsageWarning Component
 * Displays warning when approaching usage limits
 */
export const UsageWarning: React.FC<UsageWarningProps> = ({ feature, threshold = 80 }) => {
  const access = useFeatureAccess(feature);

  if (!access.quota || access.quota.limit === -1) {
    return null;
  }

  const { percentage, current, limit, remaining } = access.quota;

  if (percentage < threshold) {
    return null;
  }

  const isAtLimit = remaining === 0;
  const isNearLimit = percentage >= 90;

  return (
    <div
      className={`rounded-lg p-4 mb-4 ${
        isAtLimit
          ? 'bg-red-50 border-2 border-red-300 text-red-700'
          : isNearLimit
            ? 'bg-orange-50 border-2 border-orange-300 text-orange-700'
            : 'bg-yellow-50 border-2 border-yellow-300 text-yellow-700'
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />

        <div className="flex-1">
          <h4 className="font-semibold mb-1">
            {isAtLimit ? 'Limit Reached' : 'Approaching Limit'}
          </h4>

          <p className="text-sm mb-2">
            {isAtLimit
              ? `You've used all ${limit} of your ${feature} for this period.`
              : `You've used ${current} of ${limit} ${feature} (${Math.round(percentage)}%).`}
          </p>

          {remaining > 0 && <p className="text-xs opacity-75 mb-3">{remaining} remaining</p>}

          <button
            onClick={() => (window.location.href = '/pricing')}
            className="text-sm font-medium underline hover:no-underline"
          >
            {isAtLimit ? 'Upgrade now' : 'Upgrade for more'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Props for TierBadge component
 */
interface TierBadgeProps {
  tier?: SubscriptionTier;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

/**
 * TierBadge Component
 * Displays subscription tier badge
 */
export const TierBadge: React.FC<TierBadgeProps> = ({
  tier: propTier,
  size = 'md',
  showIcon = true,
}) => {
  const { currentTier } = useSubscription();
  const tier: SubscriptionTier = (propTier || currentTier) as SubscriptionTier;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const tierConfig: Record<SubscriptionTier, { icon: string; label: string; classes: string }> = {
    free: {
      icon: '🆓',
      label: 'Free',
      classes: 'bg-gray-100 text-gray-700 border-gray-300',
    },
    basic: {
      icon: '⭐',
      label: 'Basic',
      classes: 'bg-blue-100 text-blue-700 border-blue-300',
    },
    pro: {
      icon: '💎',
      label: 'Pro',
      classes: 'bg-purple-100 text-purple-700 border-purple-300',
    },
    enterprise: {
      icon: '👑',
      label: 'Enterprise',
      classes: 'bg-amber-100 text-amber-700 border-amber-300',
    },
  };

  const config = tierConfig[tier];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 font-semibold ${config.classes} ${sizeClasses[size]}`}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
};

/**
 * Props for TrialBanner component
 */
interface TrialBannerProps {
  onUpgrade?: () => void;
}

/**
 * TrialBanner Component
 * Displays trial period information
 */
export const TrialBanner: React.FC<TrialBannerProps> = ({ onUpgrade }) => {
  const { subscription } = useSubscription();

  if (!subscription || subscription.status !== 'trialing' || !subscription.trialEnd) {
    return null;
  }

  const daysRemaining = Math.ceil(
    (new Date(subscription.trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left in your evaluation
            </h3>
            <p className="text-sm opacity-90">
              Upgrade anytime to keep full reporting and export features.
            </p>
          </div>
        </div>

        <button
          onClick={onUpgrade || (() => (window.location.href = '/pricing'))}
          className="bg-white text-purple-600 px-6 py-2 rounded-md font-semibold hover:shadow-lg transition-shadow"
        >
          Subscribe Now
        </button>
      </div>
    </div>
  );
};

/**
 * Props for CanceledBanner component
 */
interface CanceledBannerProps {
  onReactivate?: () => void;
}

/**
 * CanceledBanner Component
 * Displays cancellation notice
 */
export const CanceledBanner: React.FC<CanceledBannerProps> = ({ onReactivate }) => {
  const { subscription, reactivateSubscription } = useSubscription();

  if (!subscription || !subscription.cancelAtPeriodEnd) {
    return null;
  }

  const handleReactivate = async () => {
    try {
      await reactivateSubscription();
      if (onReactivate) onReactivate();
    } catch (err) {
      console.error('Failed to reactivate subscription:', err);
    }
  };

  const daysRemaining = Math.ceil(
    (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="bg-red-50 border-2 border-red-300 text-red-700 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Subscription Canceled</h3>
            <p className="text-sm">
              Your subscription will end in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}.
              You'll lose access to premium features.
            </p>
          </div>
        </div>

        <button
          onClick={handleReactivate}
          className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors"
        >
          Reactivate
        </button>
      </div>
    </div>
  );
};
