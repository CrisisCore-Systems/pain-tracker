import { describe, expect, it } from 'vitest';
import {
  buildMissingSubscriptionReason,
  buildSubscriptionManagementReason,
  buildQuotaExceededReason,
  getPlanRestrictionReason,
} from './subscriptionAccessCopy';

describe('subscriptionAccessCopy', () => {
  it('builds plan restriction reasons', () => {
    expect(getPlanRestrictionReason('pro')).toBe('Upgrade to pro to unlock this section.');
    expect(buildMissingSubscriptionReason()).toBe('Upgrade to basic to unlock this section.');
    expect(buildSubscriptionManagementReason()).toBe(
      'There is no active paid plan to manage yet.'
    );
  });

  it('builds quota exceeded reasons with feature labels', () => {
    expect(buildQuotaExceededReason('maxExportsPerMonth', 'basic')).toBe(
      "You have reached this plan's export limit. Upgrade to Basic or higher for more room."
    );
    expect(buildQuotaExceededReason('maxPainEntries', 'pro')).toBe(
      "You have reached this plan's pain entry limit. Upgrade to Pro or higher for more room."
    );
  });
});