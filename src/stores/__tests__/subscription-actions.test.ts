import { beforeEach, describe, expect, it } from 'vitest';
import { checkExportQuota } from '../subscription-actions';
import { subscriptionService } from '../../services/SubscriptionService';

describe('checkExportQuota', () => {
  beforeEach(() => {
    const subscriptions = (subscriptionService as unknown as { subscriptions: Map<string, unknown> }).subscriptions;
    subscriptions.clear();
  });

  it('allows exports when the user is below the monthly export limit', async () => {
    const userId = `export-quota-ok-${Math.random().toString(36).slice(2)}`;
    await subscriptionService.createSubscription(userId, 'free');

    const result = await checkExportQuota(userId);

    expect(result).toEqual({ success: true });
  });

  it('blocks exports when the monthly export limit is reached', async () => {
    const userId = `export-quota-hit-${Math.random().toString(36).slice(2)}`;
    const subscription = await subscriptionService.createSubscription(userId, 'free');
    subscription.usage.exportCount = 5;

    const result = await checkExportQuota(userId);

    expect(result.success).toBe(false);
    expect(result.quotaExceeded).toBe(true);
    expect(result.upgradeRequired).toBe('basic');
    expect(result.error).toBe(
      "You have reached this plan's export limit. Upgrade to Basic or higher for more room."
    );
  });
});