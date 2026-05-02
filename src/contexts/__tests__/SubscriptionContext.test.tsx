import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { SubscriptionProvider, useSubscription } from '../SubscriptionContext';
import { subscriptionService } from '../../services/SubscriptionService';

function SubscriptionProbe() {
  const { currentTier, hasFeature } = useSubscription();

  return (
    <div>
      <span data-testid="tier">{currentTier}</span>
      <span data-testid="advanced-analytics">
        {hasFeature('advancedAnalytics') ? 'enabled' : 'disabled'}
      </span>
    </div>
  );
}

function SubscriptionManagementProbe() {
  const { error, upgradeTier } = useSubscription();

  React.useEffect(() => {
    upgradeTier('pro').catch(() => undefined);
  }, [upgradeTier]);

  return (
    <div>
      <span data-testid="management-error">{error ?? ''}</span>
    </div>
  );
}

describe('SubscriptionProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('hydrates premium gating from the authoritative subscription endpoint', async () => {
    await subscriptionService.createSubscription('user-123', 'free');

    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        subscription: {
          id: 'sub-local',
          userId: 'user-123',
          tier: 'pro',
          status: 'active',
          billingInterval: 'monthly',
          currentPeriodStart: '2026-04-01T00:00:00.000Z',
          currentPeriodEnd: '2026-05-01T00:00:00.000Z',
          cancelAtPeriodEnd: false,
          createdAt: '2026-04-01T00:00:00.000Z',
          updatedAt: '2026-04-02T00:00:00.000Z',
          usage: {
            painEntries: 0,
            moodEntries: 0,
            activityLogs: 0,
            storageMB: 0,
            apiCalls: 0,
            exportCount: 0,
            sharedUsers: 0,
          },
        },
      }),
    } as Response);

    render(
      <SubscriptionProvider userId="user-123">
        <SubscriptionProbe />
      </SubscriptionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('tier')).toHaveTextContent('pro');
    });

    expect(screen.getByTestId('advanced-analytics')).toHaveTextContent('enabled');
    expect(subscriptionService.getUserTier('user-123')).toBe('pro');
    expect(fetchMock).toHaveBeenCalledWith('/api/stripe/subscription-status', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: 'user-123' }),
    });
  });

  it('falls back to the local free plan when the authoritative endpoint is unavailable', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockRejectedValue(new Error('offline'));

    render(
      <SubscriptionProvider userId="offline-user">
        <SubscriptionProbe />
      </SubscriptionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('tier')).toHaveTextContent('free');
    });

    expect(screen.getByTestId('advanced-analytics')).toHaveTextContent('disabled');
    expect(subscriptionService.getUserTier('offline-user')).toBe('free');
  });

  it('surfaces the normalized management message when there is no paid plan to manage', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockRejectedValue(new Error('offline'));

    render(
      <SubscriptionProvider>
        <SubscriptionManagementProbe />
      </SubscriptionProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('management-error')).toHaveTextContent(
        'There is no active paid plan to manage yet.'
      );
    });
  });
});