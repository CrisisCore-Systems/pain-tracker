/**
 * Subscription Management Service
 * Handles subscription lifecycle, tier validation, and usage tracking
 */

import type {
  UserSubscription,
  SubscriptionTier,
  SubscriptionStatus,
  BillingInterval,
  FeatureAccessResult,
  UsageQuota,
  TierChangeOption,
  BillingEvent,
  SubscriptionAnalytics
} from '../types/subscription';
import { SUBSCRIPTION_PLANS, USAGE_LIMITS, UPGRADE_PATHS, DOWNGRADE_PATHS } from '../config/subscription-tiers';
import { securityService } from './SecurityService';

/**
 * Subscription Service
 * Core service for managing user subscriptions and feature access
 */
export class SubscriptionService {
  private subscriptions = new Map<string, UserSubscription>();
  private billingEvents: BillingEvent[] = [];
  
  /**
   * Initialize a new subscription
   */
  async createSubscription(
    userId: string,
    tier: SubscriptionTier = 'free',
    billingInterval: BillingInterval = 'monthly'
  ): Promise<UserSubscription> {
    const now = new Date().toISOString();
    const plan = SUBSCRIPTION_PLANS[tier];
    
    // Calculate period dates
    const currentPeriodStart = now;
    const currentPeriodEnd = this.calculatePeriodEnd(currentPeriodStart, billingInterval);
    
    // Check if trial is available
    const isTrial = plan.pricing.trial.enabled && tier !== 'free';
    
    const subscription: UserSubscription = {
      id: this.generateSubscriptionId(),
      userId,
      tier,
      status: isTrial ? 'trialing' : 'active',
      billingInterval,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      trialStart: isTrial ? now : undefined,
      trialEnd: isTrial ? this.calculateTrialEnd(now, plan.pricing.trial.days) : undefined,
      usage: {
        painEntries: 0,
        moodEntries: 0,
        activityLogs: 0,
        storageMB: 0,
        apiCalls: 0,
        exportCount: 0
      },
      createdAt: now,
      updatedAt: now
    };
    
    this.subscriptions.set(userId, subscription);
    
    // Log event
    await this.logBillingEvent({
      type: 'subscription_created',
      subscriptionId: subscription.id,
      userId,
      tier,
      metadata: { billingInterval, isTrial }
    });
    
    await securityService.logSecurityEvent({
      type: 'audit',
      level: 'info',
      message: `Subscription created: ${tier} tier for user ${userId}`,
      userId,
      timestamp: new Date()
    });
    
    return subscription;
  }
  
  /**
   * Get user subscription
   */
  getSubscription(userId: string): UserSubscription | null {
    return this.subscriptions.get(userId) || null;
  }
  
  /**
   * Get user's current tier
   */
  getUserTier(userId: string): SubscriptionTier {
    const subscription = this.getSubscription(userId);
    if (!subscription) return 'free';
    
    // Check if subscription is expired or canceled
    if (this.isSubscriptionExpired(subscription)) {
      return 'free';
    }
    
    return subscription.tier;
  }
  
  /**
   * Check if user has access to a specific feature
   */
  async checkFeatureAccess(
    userId: string,
    featureName: keyof typeof SUBSCRIPTION_PLANS.free.features
  ): Promise<FeatureAccessResult> {
    const tier = this.getUserTier(userId);
    const plan = SUBSCRIPTION_PLANS[tier];
    const feature = plan.features[featureName];
    
    // Check if feature is enabled for this tier
    if (typeof feature === 'boolean') {
      return {
        hasAccess: feature,
        reason: feature ? 'Feature included in your plan' : `Feature requires ${this.getMinimumTierForFeature(featureName)} plan`,
        upgradeRequired: feature ? undefined : this.getMinimumTierForFeature(featureName)
      };
    }
    
    // For numeric limits, check quota
    if (typeof feature === 'number') {
      const subscription = this.getSubscription(userId);
      if (!subscription) {
        return {
          hasAccess: false,
          reason: 'No active subscription',
          upgradeRequired: 'basic'
        };
      }
      
      const quota = await this.getFeatureQuota(userId, featureName);
      
      return {
        hasAccess: quota.remaining > 0 || feature === -1,
        reason: quota.remaining > 0 ? 'Quota available' : 'Quota exceeded',
        quota,
        upgradeRequired: quota.remaining <= 0 ? this.getNextTier(tier) : undefined
      };
    }
    
    // For string values (like encryption level)
    return {
      hasAccess: !!feature,
      reason: feature ? `${feature} access included` : 'Feature not available'
    };
  }
  
  /**
   * Get usage quota for a feature
   */
  async getFeatureQuota(
    userId: string,
    featureName: keyof typeof SUBSCRIPTION_PLANS.free.features
  ): Promise<UsageQuota> {
    const tier = this.getUserTier(userId);
    const plan = SUBSCRIPTION_PLANS[tier];
    const subscription = this.getSubscription(userId);
    
    if (!subscription) {
      return {
        feature: featureName,
        limit: 0,
        current: 0,
        remaining: 0,
        percentage: 0
      };
    }
    
    // Get the limit for this feature
    const featureValue = plan.features[featureName];
    const limit = typeof featureValue === 'number' ? featureValue : 0;
    
    // Get current usage based on feature type
    let current = 0;
    if (featureName === 'maxPainEntries') current = subscription.usage.painEntries;
    else if (featureName === 'maxMoodEntries') current = subscription.usage.moodEntries;
    else if (featureName === 'maxActivityLogs') current = subscription.usage.activityLogs;
    else if (featureName === 'maxStorageMB') current = subscription.usage.storageMB;
    
    const remaining = limit === -1 ? Infinity : Math.max(0, limit - current);
    const percentage = limit === -1 ? 0 : Math.min(100, (current / limit) * 100);
    
    return {
      feature: featureName,
      limit,
      current,
      remaining: limit === -1 ? -1 : remaining,
      percentage,
      resetDate: this.shouldResetMonthly(featureName) ? subscription.currentPeriodEnd : undefined
    };
  }
  
  /**
   * Track feature usage
   */
  async trackUsage(
    userId: string,
    usageType: keyof UserSubscription['usage'],
    amount: number = 1
  ): Promise<{ success: boolean; quota?: UsageQuota }> {
    const subscription = this.getSubscription(userId);
    if (!subscription) {
      return { success: false };
    }
    
    // Update usage
    subscription.usage[usageType] += amount;
    subscription.updatedAt = new Date().toISOString();
    
    // Get updated quota
    const featureMap: Record<keyof UserSubscription['usage'], keyof typeof SUBSCRIPTION_PLANS.free.features> = {
      painEntries: 'maxPainEntries',
      moodEntries: 'maxMoodEntries',
      activityLogs: 'maxActivityLogs',
      storageMB: 'maxStorageMB',
      apiCalls: 'maxPainEntries', // Placeholder
      exportCount: 'maxPainEntries' // Placeholder
    };
    
    const featureName = featureMap[usageType];
    const quota = await this.getFeatureQuota(userId, featureName);
    
    // Check if approaching limit (for warnings)
    const tier = this.getUserTier(userId);
    const limits = USAGE_LIMITS[tier as keyof typeof USAGE_LIMITS];
    if (limits && limits[usageType as keyof typeof limits]) {
      const limit = limits[usageType as keyof typeof limits] as { limit: number; warningAt: number };
      if (subscription.usage[usageType] >= limit.warningAt) {
        await securityService.logSecurityEvent({
          type: 'audit',
          level: 'warning',
          message: `User approaching ${usageType} limit: ${subscription.usage[usageType]}/${limit.limit}`,
          userId,
          timestamp: new Date()
        });
      }
    }
    
    return { success: true, quota };
  }
  
  /**
   * Upgrade subscription
   */
  async upgradeTier(
    userId: string,
    newTier: SubscriptionTier,
    immediate: boolean = true
  ): Promise<TierChangeOption> {
    const subscription = this.getSubscription(userId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }
    
    const currentTier = subscription.tier;
    const changeOption = await this.calculateTierChange(currentTier, newTier);
    
    if (immediate) {
      subscription.tier = newTier;
      subscription.status = 'active';
      subscription.updatedAt = new Date().toISOString();
      
      await this.logBillingEvent({
        type: 'tier_upgraded',
        subscriptionId: subscription.id,
        userId,
        metadata: { fromTier: currentTier, toTier: newTier }
      });
      
      await securityService.logSecurityEvent({
        type: 'audit',
        level: 'info',
        message: `Subscription upgraded: ${currentTier} → ${newTier}`,
        userId,
        timestamp: new Date()
      });
    } else {
      // Schedule upgrade for next billing period
      subscription.scheduledChange = {
        newTier,
        effectiveDate: subscription.currentPeriodEnd,
        reason: 'upgrade'
      };
    }
    
    return changeOption;
  }
  
  /**
   * Downgrade subscription
   */
  async downgradeTier(
    userId: string,
    newTier: SubscriptionTier
  ): Promise<TierChangeOption> {
    const subscription = this.getSubscription(userId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }
    
    const currentTier = subscription.tier;
    const changeOption = await this.calculateTierChange(currentTier, newTier);
    
    // Downgrades always happen at period end
    subscription.scheduledChange = {
      newTier,
      effectiveDate: subscription.currentPeriodEnd,
      reason: 'downgrade'
    };
    subscription.updatedAt = new Date().toISOString();
    
    await this.logBillingEvent({
      type: 'tier_downgraded',
      subscriptionId: subscription.id,
      userId,
      metadata: { fromTier: currentTier, toTier: newTier, effectiveDate: subscription.currentPeriodEnd }
    });
    
    return changeOption;
  }
  
  /**
   * Cancel subscription
   */
  async cancelSubscription(
    userId: string,
    immediate: boolean = false
  ): Promise<UserSubscription> {
    const subscription = this.getSubscription(userId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }
    
    if (immediate) {
      subscription.status = 'canceled';
      subscription.tier = 'free';
    } else {
      subscription.cancelAtPeriodEnd = true;
      subscription.status = 'canceled';
    }
    
    subscription.updatedAt = new Date().toISOString();
    
    await this.logBillingEvent({
      type: 'subscription_canceled',
      subscriptionId: subscription.id,
      userId,
      metadata: { immediate, effectiveDate: immediate ? new Date().toISOString() : subscription.currentPeriodEnd }
    });
    
    await securityService.logSecurityEvent({
      type: 'audit',
      level: 'info',
      message: `Subscription canceled${immediate ? ' (immediate)' : ' (at period end)'}`,
      userId,
      timestamp: new Date()
    });
    
    return subscription;
  }
  
  /**
   * Reactivate canceled subscription
   */
  async reactivateSubscription(userId: string): Promise<UserSubscription> {
    const subscription = this.getSubscription(userId);
    if (!subscription) {
      throw new Error('No subscription found');
    }
    
    if (subscription.status !== 'canceled' || !subscription.cancelAtPeriodEnd) {
      throw new Error('Subscription is not canceled');
    }
    
    subscription.cancelAtPeriodEnd = false;
    subscription.status = 'active';
    subscription.updatedAt = new Date().toISOString();
    
    await securityService.logSecurityEvent({
      type: 'audit',
      level: 'info',
      message: 'Subscription reactivated',
      userId,
      timestamp: new Date()
    });
    
    return subscription;
  }
  
  /**
   * Calculate tier change details
   */
  private async calculateTierChange(
    fromTier: SubscriptionTier,
    toTier: SubscriptionTier
  ): Promise<TierChangeOption> {
    const fromPlan = SUBSCRIPTION_PLANS[fromTier];
    const toPlan = SUBSCRIPTION_PLANS[toTier];
    
    const isUpgrade = this.isUpgrade(fromTier, toTier);
    
    // Calculate feature differences
    const featuresGained: string[] = [];
    const featuresLost: string[] = [];
    
    const featureKeys = Object.keys(fromPlan.features) as Array<keyof typeof fromPlan.features>;
    featureKeys.forEach(key => {
      const fromValue = fromPlan.features[key];
      const toValue = toPlan.features[key];
      
      if (typeof fromValue === 'boolean' && typeof toValue === 'boolean') {
        if (!fromValue && toValue) featuresGained.push(key);
        if (fromValue && !toValue) featuresLost.push(key);
      }
    });
    
    return {
      fromTier,
      toTier,
      type: isUpgrade ? 'upgrade' : 'downgrade',
      immediateCharge: isUpgrade ? toPlan.pricing.monthly.amount : 0,
      nextBillingChange: toPlan.pricing.monthly.amount,
      featuresGained,
      featuresLost,
      requiresMigration: !isUpgrade,
      effectiveImmediately: isUpgrade,
      confirmationRequired: featuresLost.length > 0
    };
  }
  
  /**
   * Get subscription analytics
   */
  async getAnalytics(userId: string): Promise<SubscriptionAnalytics | null> {
    const subscription = this.getSubscription(userId);
    if (!subscription) return null;
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Calculate engagement score (0-100)
    const engagementScore = this.calculateEngagementScore(subscription);
    const churnRisk = this.calculateChurnRisk(engagementScore, subscription);
    
    return {
      userId,
      tier: subscription.tier,
      dailyActive: new Date(subscription.updatedAt) > oneDayAgo,
      weeklyActive: new Date(subscription.updatedAt) > oneWeekAgo,
      monthlyActive: new Date(subscription.updatedAt) > oneMonthAgo,
      mostUsedFeatures: [],
      entriesCreated: subscription.usage.painEntries + subscription.usage.moodEntries,
      reportsGenerated: subscription.usage.exportCount,
      insightsViewed: 0,
      exportsMade: subscription.usage.exportCount,
      engagementScore,
      churnRisk
    };
  }
  
  /**
   * Helper: Check if subscription is expired
   */
  private isSubscriptionExpired(subscription: UserSubscription): boolean {
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      return false;
    }
    
    if (subscription.status === 'canceled' && !subscription.cancelAtPeriodEnd) {
      return new Date() > new Date(subscription.currentPeriodEnd);
    }
    
    return subscription.status === 'expired';
  }
  
  /**
   * Helper: Get minimum tier for a feature
   */
  private getMinimumTierForFeature(featureName: keyof typeof SUBSCRIPTION_PLANS.free.features): SubscriptionTier {
    const tiers: SubscriptionTier[] = ['free', 'basic', 'pro', 'enterprise'];
    
    for (const tier of tiers) {
      const plan = SUBSCRIPTION_PLANS[tier];
      const feature = plan.features[featureName];
      if (feature && feature !== false && feature !== 0) {
        return tier;
      }
    }
    
    return 'enterprise';
  }
  
  /**
   * Helper: Get next tier up
   */
  private getNextTier(currentTier: SubscriptionTier): SubscriptionTier | undefined {
    const upgrades = UPGRADE_PATHS[currentTier];
    return upgrades.length > 0 ? upgrades[0] : undefined;
  }
  
  /**
   * Helper: Check if tier change is an upgrade
   */
  private isUpgrade(fromTier: SubscriptionTier, toTier: SubscriptionTier): boolean {
    const tierOrder: SubscriptionTier[] = ['free', 'basic', 'pro', 'enterprise'];
    return tierOrder.indexOf(toTier) > tierOrder.indexOf(fromTier);
  }
  
  /**
   * Helper: Calculate period end date
   */
  private calculatePeriodEnd(start: string, interval: BillingInterval): string {
    const startDate = new Date(start);
    
    if (interval === 'monthly') {
      startDate.setMonth(startDate.getMonth() + 1);
    } else if (interval === 'yearly') {
      startDate.setFullYear(startDate.getFullYear() + 1);
    } else {
      // Lifetime - set to 100 years in future
      startDate.setFullYear(startDate.getFullYear() + 100);
    }
    
    return startDate.toISOString();
  }
  
  /**
   * Helper: Calculate trial end date
   */
  private calculateTrialEnd(start: string, days: number): string {
    const startDate = new Date(start);
    startDate.setDate(startDate.getDate() + days);
    return startDate.toISOString();
  }
  
  /**
   * Helper: Check if feature should reset monthly
   */
  private shouldResetMonthly(featureName: string): boolean {
    return ['exportCount', 'apiCalls'].includes(featureName);
  }
  
  /**
   * Helper: Calculate engagement score
   */
  private calculateEngagementScore(subscription: UserSubscription): number {
    let score = 0;
    
    // Usage frequency (40 points)
    if (subscription.usage.painEntries > 0) score += 20;
    if (subscription.usage.painEntries > 10) score += 10;
    if (subscription.usage.painEntries > 50) score += 10;
    
    // Feature diversity (30 points)
    if (subscription.usage.moodEntries > 0) score += 10;
    if (subscription.usage.activityLogs > 0) score += 10;
    if (subscription.usage.exportCount > 0) score += 10;
    
    // Recency (30 points)
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(subscription.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceUpdate === 0) score += 30;
    else if (daysSinceUpdate <= 3) score += 20;
    else if (daysSinceUpdate <= 7) score += 10;
    
    return Math.min(100, score);
  }
  
  /**
   * Helper: Calculate churn risk
   */
  private calculateChurnRisk(engagementScore: number, subscription: UserSubscription): 'low' | 'medium' | 'high' {
    if (subscription.cancelAtPeriodEnd) return 'high';
    if (engagementScore < 30) return 'high';
    if (engagementScore < 60) return 'medium';
    return 'low';
  }
  
  /**
   * Helper: Generate subscription ID
   */
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Helper: Log billing event
   */
  private async logBillingEvent(event: Partial<BillingEvent>): Promise<void> {
    const billingEvent: BillingEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: event.type!,
      subscriptionId: event.subscriptionId!,
      userId: event.userId!,
      timestamp: new Date().toISOString(),
      amount: event.amount,
      currency: event.currency,
      metadata: event.metadata
    };
    
    this.billingEvents.push(billingEvent);
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
