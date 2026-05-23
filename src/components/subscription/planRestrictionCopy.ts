import type { SubscriptionTier } from '../../types/subscription';
export { getPlanRestrictionReason } from '../../lib/subscriptionAccessCopy';

export function getPlanRestrictionSummary(
  currentTier: SubscriptionTier | undefined,
  requiredTier: SubscriptionTier
): string {
  if (currentTier === 'basic' && requiredTier === 'pro') {
    return 'You are on Basic. This part of the app stays intentionally limited until you upgrade to Pro.';
  }

  if (currentTier === 'free') {
    return `You are on Free. This part of the app is clipped until you upgrade to ${requiredTier}.`;
  }

  return `This feature is closed off on your current plan and opens on ${requiredTier}.`;
}
