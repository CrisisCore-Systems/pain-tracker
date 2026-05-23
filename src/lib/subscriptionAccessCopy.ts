import type { SubscriptionTier } from '../types/subscription';

export function getPlanRestrictionReason(requiredTier: SubscriptionTier): string {
  return `Upgrade to ${requiredTier} to unlock this section.`;
}

export function buildMissingSubscriptionReason(requiredTier: SubscriptionTier = 'basic'): string {
  return getPlanRestrictionReason(requiredTier);
}

export function buildSubscriptionManagementReason(): string {
  return 'There is no active paid plan to manage yet.';
}

function getQuotaLabel(featureName: string): string {
  const labels: Record<string, string> = {
    maxPainEntries: 'pain entry',
    maxMoodEntries: 'mood entry',
    maxActivityLogs: 'activity log',
    maxExportsPerMonth: 'export',
    maxSharedUsers: 'shared user',
    maxStorageMB: 'storage',
  };

  return labels[featureName] || 'usage';
}

function formatUpgradeTier(requiredTier?: SubscriptionTier): string {
  if (!requiredTier) return 'a higher tier';
  return `${requiredTier.charAt(0).toUpperCase()}${requiredTier.slice(1)} or higher`;
}

export function buildQuotaExceededReason(
  featureName: string,
  upgradeRequired?: SubscriptionTier
): string {
  return `You have reached this plan's ${getQuotaLabel(featureName)} limit. Upgrade to ${formatUpgradeTier(upgradeRequired)} for more room.`;
}