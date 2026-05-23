import React from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { PainTrackerContainer } from '../PainTrackerContainer';
import { subscriptionService } from '../../services/SubscriptionService';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

let currentUserId = 'container-analytics-user';

vi.mock('../../stores/pain-tracker-store');

vi.mock('../../utils/user-identity', () => ({
  getLocalUserId: () => currentUserId,
}));

vi.mock('../../design-system/fused-v2', () => ({
  ClinicalDashboard: () => <div>Clinical Dashboard</div>,
}));

vi.mock('../../design-system/fused-v2/QuickLogOneScreen', () => ({
  default: () => <div>Quick Log</div>,
}));

vi.mock('../../data/sampleData', () => ({
  walkthroughSteps: [],
}));

vi.mock('../../services/weatherAutoCapture', () => ({
  maybeCaptureWeatherForNewEntry: async () => null,
}));

vi.mock('../../lib/storage/secureStorage', () => ({
  secureStorage: {
    get: vi.fn(),
    set: vi.fn(),
    safeJSON: vi.fn((_key: string, fallback: unknown) => fallback),
    remove: vi.fn(),
    keys: vi.fn(() => []),
  },
}));

vi.mock('../../components/analytics/AnalyticsDashboard', () => ({
  AnalyticsDashboard: () => <div>Standard Analytics Dashboard</div>,
}));

vi.mock('../../components/analytics/PremiumAnalyticsDashboard', () => ({
  PremiumAnalyticsDashboard: () => <div>Premium Analytics Dashboard</div>,
}));

describe('PainTrackerContainer analytics route', () => {
  beforeEach(() => {
    currentUserId = `container-analytics-${Math.random().toString(36).slice(2)}`;

    const storeState = {
      entries: [
        {
          id: 'entry-1',
          timestamp: new Date('2026-04-01T00:00:00.000Z').toISOString(),
          baselineData: { pain: 5, locations: [], symptoms: [] },
          notes: '',
        },
      ],
      ui: { showOnboarding: false, showWalkthrough: false },
      addEntry: vi.fn(),
      updateEntry: vi.fn(),
      setShowOnboarding: vi.fn(),
      setShowWalkthrough: vi.fn(),
      setError: vi.fn(),
      loadSampleData: vi.fn(),
    };

    (usePainTrackerStore as unknown as { mockImplementation: (fn: unknown) => void }).mockImplementation(
      (selector: unknown) => {
        if (typeof selector === 'function') {
          return (selector as (s: typeof storeState) => unknown)(storeState);
        }
        return storeState;
      }
    );
  });

  it('shows the clipped analytics dashboard for Basic users', async () => {
    await subscriptionService.createSubscription(currentUserId, 'basic');

    render(<PainTrackerContainer initialView="analytics" />);

    expect(await screen.findByText('Standard Analytics Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Premium Analytics Dashboard')).not.toBeInTheDocument();
  });

  it('shows the premium analytics dashboard for Pro users', async () => {
    await subscriptionService.createSubscription(currentUserId, 'pro');

    render(<PainTrackerContainer initialView="analytics" />);

    expect(await screen.findByText('Premium Analytics Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Standard Analytics Dashboard')).not.toBeInTheDocument();
  });
});