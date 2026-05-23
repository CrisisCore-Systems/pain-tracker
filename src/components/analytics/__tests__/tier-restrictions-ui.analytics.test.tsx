import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SubscriptionProvider } from '../../../contexts/SubscriptionContext';
import { subscriptionService } from '../../../services/SubscriptionService';
import { AnalyticsDashboard } from '../AnalyticsDashboard';
import { PredictiveInsightsGate } from '../GatedAnalytics';
import PredictivePanel from '../../PredictivePanel';

let currentUserId = 'ui-tier-user';

// Controllable per-test — see beforeEach for default
const mockHasEntitlement = vi.fn();

vi.mock('../../../utils/user-identity', () => ({
  getLocalUserId: () => currentUserId,
}));

// Stable references to avoid triggering useEffect re-runs on every render
vi.mock('../../../stores/pain-tracker-store', () => {
  const entries = Object.freeze([
    {
      id: 'entry-1',
      timestamp: '2026-04-01T00:00:00.000Z',
      baselineData: {
        pain: 6,
        locations: ['Back'],
        symptoms: ['Aching'],
      },
    },
  ]);
  const moodEntries = Object.freeze([]);
  return {
    usePainTrackerStore: () => ({ entries, moodEntries }),
  };
});

// hasEntitlement is set per-test in beforeEach; default is true so the dashboard renders tabs
vi.mock('../../../services/EntitlementService', () => ({
  entitlementService: {
    hasEntitlement: (...args: unknown[]) => mockHasEntitlement(...args),
    listEntitlements: () => [],
  },
}));

// Avoid heavy AdvancedAnalyticsEngine computation in unit tests
vi.mock('../../../services/AdvancedAnalyticsEngine', () => {
  class AdvancedAnalyticsEngine {
    calculateCorrelationMatrix() { return []; }
    scoreInterventions() { return []; }
    detectTriggerPatterns() { return []; }
    identifyPredictiveIndicators() { return []; }
    generateWeeklyClinicalBrief() { return null; }
  }
  return { AdvancedAnalyticsEngine };
});

// Override the global setup.ts mock so we can test PredictivePanel's own gating logic
vi.mock('../../../components/PredictivePanel', async (importOriginal) => {
  return importOriginal<typeof import('../../../components/PredictivePanel')>();
});

vi.mock('../../../analytics/ga4-events', () => ({
  trackAnalyticsTabViewed: vi.fn(),
}));

vi.mock('../../../utils/usage-tracking', () => ({
  trackUsageEvent: vi.fn(),
  incrementSessionAction: vi.fn(),
}));

vi.mock('../CorrelationMatrixView', () => ({
  CorrelationMatrixView: () => <div>Correlation Matrix</div>,
}));

vi.mock('../InterventionScorecard', () => ({
  InterventionScorecard: () => <div>Intervention Scorecard</div>,
}));

vi.mock('../TriggerPatternTimeline', () => ({
  TriggerPatternTimeline: () => <div>Trigger Timeline</div>,
}));

vi.mock('../PredictiveIndicatorPanel', () => ({
  PredictiveIndicatorPanel: () => <div>Predictive Indicators</div>,
}));

vi.mock('../WeeklyClinicalBriefCard', () => ({
  WeeklyClinicalBriefCard: () => <div>Weekly Clinical Brief</div>,
}));

vi.mock('../UsageAnalyticsDashboard', () => ({
  UsageAnalyticsDashboard: () => <div>Usage Analytics</div>,
}));

function renderWithSubscription(userId: string, ui: React.ReactElement) {
  return render(<SubscriptionProvider userId={userId}>{ui}</SubscriptionProvider>);
}

describe('tier restriction UI analytics', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Default: unlock the dashboard so tests can inspect tab-level gating.
    // Tests that need a different entitlement state override this explicitly.
    mockHasEntitlement.mockReturnValue(true);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    currentUserId = `ui-tier-user-${Math.random().toString(36).slice(2)}`;
  });

  it('shows predictive analytics as locked for Basic users', async () => {
    await subscriptionService.createSubscription(currentUserId, 'basic');

    renderWithSubscription(currentUserId, <AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /predictive locked/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('tab', { name: /predictive locked/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/you are on basic\. this part of the app stays intentionally limited/i)
      ).toBeInTheDocument();
    });
  });

  it('blocks the direct predictive widget for Basic users', async () => {
    await subscriptionService.createSubscription(currentUserId, 'basic');

    renderWithSubscription(
      currentUserId,
      <PredictivePanel
        entries={[
          {
            id: 'entry-1',
            timestamp: '2026-04-01T00:00:00.000Z',
            baselineData: {
              pain: 6,
              locations: ['Back'],
              symptoms: ['Aching'],
            },
          } as never,
        ]}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/upgrade to pro to unlock this section/i)).toBeInTheDocument();
    });
  });

  it('blocks the predictive placeholder gate for Basic users', async () => {
    await subscriptionService.createSubscription(currentUserId, 'basic');

    renderWithSubscription(
      currentUserId,
      <PredictiveInsightsGate>
        <div>Predictive Child</div>
      </PredictiveInsightsGate>
    );

    await waitFor(() => {
      expect(screen.getByText(/upgrade to pro to unlock this section/i)).toBeInTheDocument();
    });

    expect(screen.queryByText('Predictive Child')).not.toBeInTheDocument();
  });
});