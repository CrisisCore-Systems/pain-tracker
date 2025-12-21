/**
 * Subscription Context and Provider
 * React context for managing subscription state throughout the app
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import type {
  UserSubscription,
  SubscriptionTier,
  FeatureAccessResult,
  TierChangeOption,
  SubscriptionAnalytics,
} from '../types/subscription';
import type { TierFeatures } from '../types/subscription';
import { subscriptionService } from '../services/SubscriptionService';
import { SUBSCRIPTION_PLANS } from '../config/subscription-tiers';

interface SubscriptionContextValue {
  // Current subscription state
  subscription: UserSubscription | null;
  currentTier: SubscriptionTier;
  isLoading: boolean;
  error: string | null;

  // Subscription management
  initialize: (userId: string) => Promise<void>;
  upgradeTier: (newTier: SubscriptionTier, immediate?: boolean) => Promise<TierChangeOption>;
  downgradeTier: (newTier: SubscriptionTier) => Promise<TierChangeOption>;
  cancelSubscription: (immediate?: boolean) => Promise<void>;
  reactivateSubscription: () => Promise<void>;

  // Feature access
  checkFeatureAccess: (featureName: keyof TierFeatures) => Promise<FeatureAccessResult>;
  hasFeature: (featureName: keyof TierFeatures) => boolean;
  trackUsage: (usageType: keyof UserSubscription['usage'], amount?: number) => Promise<void>;

  // Analytics
  getAnalytics: () => Promise<SubscriptionAnalytics | null>;

  // Utility
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
  userId?: string;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children, userId }) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize subscription for user
   */
  const initialize = useCallback(async (uid: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to get existing subscription
      let sub = await subscriptionService.getSubscription(uid);

      // If no subscription exists, create a free one
      if (!sub) {
        sub = await subscriptionService.createSubscription(uid, 'free');
      }

      setSubscription(sub);
      setCurrentTier(sub.tier);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize subscription');
      console.error('Subscription initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh subscription data
   */
  const refresh = useCallback(async () => {
    if (!subscription?.userId) return;
    await initialize(subscription.userId);
  }, [subscription?.userId, initialize]);

  /**
   * Upgrade subscription tier
   */
  const upgradeTier = useCallback(
    async (newTier: SubscriptionTier, immediate: boolean = true): Promise<TierChangeOption> => {
      if (!subscription) {
        throw new Error('No active subscription');
      }

      setIsLoading(true);
      setError(null);

      try {
        const changeOption = await subscriptionService.upgradeTier(
          subscription.userId,
          newTier,
          immediate
        );

        await refresh();
        return changeOption;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to upgrade subscription';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [subscription, refresh]
  );

  /**
   * Downgrade subscription tier
   */
  const downgradeTier = useCallback(
    async (newTier: SubscriptionTier): Promise<TierChangeOption> => {
      if (!subscription) {
        throw new Error('No active subscription');
      }

      setIsLoading(true);
      setError(null);

      try {
        const changeOption = await subscriptionService.downgradeTier(subscription.userId, newTier);

        await refresh();
        return changeOption;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to downgrade subscription';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [subscription, refresh]
  );

  /**
   * Cancel subscription
   */
  const cancelSubscription = useCallback(
    async (immediate: boolean = false) => {
      if (!subscription) {
        throw new Error('No active subscription');
      }

      setIsLoading(true);
      setError(null);

      try {
        await subscriptionService.cancelSubscription(subscription.userId, immediate);
        await refresh();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to cancel subscription';
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [subscription, refresh]
  );

  /**
   * Reactivate subscription
   */
  const reactivateSubscription = useCallback(async () => {
    if (!subscription) {
      throw new Error('No active subscription');
    }

    setIsLoading(true);
    setError(null);

    try {
      await subscriptionService.reactivateSubscription(subscription.userId);
      await refresh();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reactivate subscription';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [subscription, refresh]);

  /**
   * Check feature access
   */
  const checkFeatureAccess = useCallback(
    async (featureName: keyof TierFeatures): Promise<FeatureAccessResult> => {
      if (!subscription) {
        return {
          hasAccess: false,
          reason: 'No active subscription',
          upgradeRequired: 'basic',
        };
      }

      return subscriptionService.checkFeatureAccess(subscription.userId, featureName);
    },
    [subscription]
  );

  /**
   * Quick check if user has a feature (synchronous)
   */
  const hasFeature = useCallback(
    (featureName: keyof TierFeatures): boolean => {
      const plan = SUBSCRIPTION_PLANS[currentTier];
      const feature = plan.features[featureName];

      if (typeof feature === 'boolean') {
        return feature;
      }

      if (typeof feature === 'number') {
        return feature !== 0;
      }

      return !!feature;
    },
    [currentTier]
  );

  /**
   * Track usage
   */
  const trackUsage = useCallback(
    async (usageType: keyof UserSubscription['usage'], amount: number = 1) => {
      if (!subscription) return;

      try {
        const result = await subscriptionService.trackUsage(subscription.userId, usageType, amount);

        if (result.success && result.quota && result.quota.remaining === 0) {
          setError(`You've reached your ${usageType} limit. Consider upgrading your plan.`);
        }

        await refresh();
      } catch (err) {
        console.error('Failed to track usage:', err);
      }
    },
    [subscription, refresh]
  );

  /**
   * Get analytics
   */
  const getAnalytics = useCallback(async (): Promise<SubscriptionAnalytics | null> => {
    if (!subscription) return null;
    return subscriptionService.getAnalytics(subscription.userId);
  }, [subscription]);

  // Auto-initialize if userId is provided
  useEffect(() => {
    if (userId) {
      void initialize(userId);
    }
  }, [userId, initialize]);

  const value: SubscriptionContextValue = {
    subscription,
    currentTier,
    isLoading,
    error,
    initialize,
    upgradeTier,
    downgradeTier,
    cancelSubscription,
    reactivateSubscription,
    checkFeatureAccess,
    hasFeature,
    trackUsage,
    getAnalytics,
    refresh,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

/**
 * Hook to use subscription context
 */
export const useSubscription = (): SubscriptionContextValue => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

/**
 * Hook to check if user has a specific tier or higher
 */
export const useHasTier = (requiredTier: SubscriptionTier): boolean => {
  const { currentTier } = useSubscription();

  const tierOrder: SubscriptionTier[] = ['free', 'basic', 'pro', 'enterprise'];
  const currentIndex = tierOrder.indexOf(currentTier);
  const requiredIndex = tierOrder.indexOf(requiredTier);

  return currentIndex >= requiredIndex;
};

/**
 * Hook to check feature access with automatic tracking
 */
export const useFeatureAccess = (
  featureName: keyof TierFeatures
): FeatureAccessResult & { loading: boolean } => {
  const { checkFeatureAccess } = useSubscription();
  const [result, setResult] = useState<FeatureAccessResult>({
    hasAccess: false,
    reason: 'Checking...',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        const access = await checkFeatureAccess(featureName);
        if (mounted) {
          setResult(access);
        }
      } catch {
        if (mounted) {
          setResult({
            hasAccess: false,
            reason: 'Error checking feature access',
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void check();

    return () => {
      mounted = false;
    };
  }, [featureName, checkFeatureAccess]);

  return { ...result, loading };
};

/**
 * Hook for subscription tier badge display
 */
export const useTierBadge = () => {
  const { currentTier } = useSubscription();

  const badges = {
    free: {
      label: 'Free',
      color: 'gray',
      icon: '🆓',
    },
    basic: {
      label: 'Basic',
      color: 'blue',
      icon: '⭐',
    },
    pro: {
      label: 'Pro',
      color: 'purple',
      icon: '💎',
    },
    enterprise: {
      label: 'Enterprise',
      color: 'gold',
      icon: '👑',
    },
  };

  return badges[currentTier];
};
