/**
 * Subscription-Aware Store Actions
 * Wraps PainTrackerStore actions with subscription quota checks and usage tracking
 */

import type { PainEntry, ActivityLogEntry } from '../types';
import type { MoodEntry } from '../types/quantified-empathy';
import { subscriptionService } from '../services/SubscriptionService';

/**
 * Subscription-aware action result
 */
export interface SubscriptionActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  quotaExceeded?: boolean;
  upgradeRequired?: string;
}

/**
 * Check quota before adding entry
 */
export async function checkPainEntryQuota(
  userId: string
): Promise<SubscriptionActionResult> {
  try {
    const access = await subscriptionService.checkFeatureAccess(userId, 'maxPainEntries');
    
    if (!access.hasAccess) {
      return {
        success: false,
        error: access.reason || 'Quota exceeded',
        quotaExceeded: true,
        upgradeRequired: access.upgradeRequired
      };
    }
    
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Track pain entry usage
 */
export async function trackPainEntryUsage(userId: string): Promise<void> {
  try {
    await subscriptionService.trackUsage(userId, 'painEntries', 1);
  } catch (err) {
    console.error('Failed to track pain entry usage:', err);
    // Don't throw - tracking failures shouldn't block user actions
  }
}

/**
 * Check mood entry quota
 */
export async function checkMoodEntryQuota(
  userId: string
): Promise<SubscriptionActionResult> {
  try {
    const access = await subscriptionService.checkFeatureAccess(userId, 'maxMoodEntries');
    
    if (!access.hasAccess) {
      return {
        success: false,
        error: access.reason || 'Quota exceeded',
        quotaExceeded: true,
        upgradeRequired: access.upgradeRequired
      };
    }
    
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Track mood entry usage
 */
export async function trackMoodEntryUsage(userId: string): Promise<void> {
  try {
    await subscriptionService.trackUsage(userId, 'moodEntries', 1);
  } catch (err) {
    console.error('Failed to track mood entry usage:', err);
  }
}

/**
 * Check activity log quota
 */
export async function checkActivityLogQuota(
  userId: string
): Promise<SubscriptionActionResult> {
  try {
    const access = await subscriptionService.checkFeatureAccess(userId, 'maxActivityLogs');
    
    if (!access.hasAccess) {
      return {
        success: false,
        error: access.reason || 'Quota exceeded',
        quotaExceeded: true,
        upgradeRequired: access.upgradeRequired
      };
    }
    
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Track activity log usage
 */
export async function trackActivityLogUsage(userId: string): Promise<void> {
  try {
    await subscriptionService.trackUsage(userId, 'activityLogs', 1);
  } catch (err) {
    console.error('Failed to track activity log usage:', err);
  }
}

/**
 * Check export quota
 */
export async function checkExportQuota(
  userId: string
): Promise<SubscriptionActionResult> {
  try {
    // Check if export feature is available for user's tier
    const csvAccess = await subscriptionService.checkFeatureAccess(userId, 'csvExport');
    const pdfAccess = await subscriptionService.checkFeatureAccess(userId, 'pdfReports');
    
    if (!csvAccess.hasAccess && !pdfAccess.hasAccess) {
      return {
        success: false,
        error: 'Export feature not available in your plan',
        upgradeRequired: csvAccess.upgradeRequired
      };
    }
    
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
}

/**
 * Track export usage
 */
export async function trackExportUsage(userId: string): Promise<void> {
  try {
    await subscriptionService.trackUsage(userId, 'exportCount', 1);
  } catch (err) {
    console.error('Failed to track export usage:', err);
  }
}

/**
 * Subscription-aware wrapper for store actions
 */
export class SubscriptionAwareActions {
  constructor(private userId: string) {}

  /**
   * Add pain entry with quota check
   */
  async addPainEntry(
    entry: Omit<PainEntry, 'id' | 'timestamp'>,
    storeAction: (entry: Omit<PainEntry, 'id' | 'timestamp'>) => void
  ): Promise<SubscriptionActionResult<void>> {
    // Check quota
    const quotaCheck = await checkPainEntryQuota(this.userId);
    if (!quotaCheck.success) {
      return quotaCheck;
    }

    try {
      // Execute store action
      storeAction(entry);

      // Track usage (async, fire-and-forget)
      void trackPainEntryUsage(this.userId);

  return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to add entry'
      };
    }
  }

  /**
   * Add mood entry with quota check
   */
  async addMoodEntry(
    entry: Omit<MoodEntry, 'timestamp'>,
    storeAction: (entry: Omit<MoodEntry, 'timestamp'>) => void
  ): Promise<SubscriptionActionResult<void>> {
    const quotaCheck = await checkMoodEntryQuota(this.userId);
    if (!quotaCheck.success) {
      return quotaCheck;
    }

    try {
      storeAction(entry);
      void trackMoodEntryUsage(this.userId);
  return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to add mood entry'
      };
    }
  }

  /**
   * Add activity log with quota check
   */
  async addActivityLog(
    log: Omit<ActivityLogEntry, 'id'>,
    storeAction: (log: Omit<ActivityLogEntry, 'id'>) => void
  ): Promise<SubscriptionActionResult<void>> {
    const quotaCheck = await checkActivityLogQuota(this.userId);
    if (!quotaCheck.success) {
      return quotaCheck;
    }

    try {
      storeAction(log);
      void trackActivityLogUsage(this.userId);
  return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to add activity log'
      };
    }
  }

  /**
   * Export data with quota check
   */
  async exportData(
    exportAction: () => Promise<void> | void
  ): Promise<SubscriptionActionResult> {
    const quotaCheck = await checkExportQuota(this.userId);
    if (!quotaCheck.success) {
      return quotaCheck;
    }

    try {
      await exportAction();
      void trackExportUsage(this.userId);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Export failed'
      };
    }
  }
}

/**
 * Create subscription-aware actions for a user
 */
export function createSubscriptionActions(userId: string): SubscriptionAwareActions {
  return new SubscriptionAwareActions(userId);
}

/**
 * React hook for subscription-aware actions
 */
export function useSubscriptionActions(userId: string) {
  const actions = new SubscriptionAwareActions(userId);

  return {
    addPainEntry: actions.addPainEntry.bind(actions),
    addMoodEntry: actions.addMoodEntry.bind(actions),
    addActivityLog: actions.addActivityLog.bind(actions),
    exportData: actions.exportData.bind(actions)
  };
}
