import React from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
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

vi.mock('../../components/onboarding', () => ({
  OnboardingFlow: ({ onComplete }: { onComplete: (setupWithSampleData: boolean) => void }) => (
    <button type="button" onClick={() => onComplete(true)}>
      Preview mock analytics
    </button>
  ),
}));

const mockSampleData = vi.hoisted(() => ({
  entries: [
    {
      id: 'demo-entry-1',
      timestamp: new Date('2026-04-01T00:00:00.000Z').toISOString(),
      baselineData: { pain: 4, locations: ['Lower back'], symptoms: ['Aching'] },
      notes: 'Mock entry',
    },
    {
      id: 'demo-entry-2',
      timestamp: new Date('2026-04-02T00:00:00.000Z').toISOString(),
      baselineData: { pain: 6, locations: ['Neck'], symptoms: ['Stiffness'] },
      notes: 'Mock entry',
    },
  ],
}));

vi.mock('../../data/sampleData', () => ({
  samplePainEntries: mockSampleData.entries,
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
  AnalyticsDashboard: ({
    demoMode,
    entries = [],
    onCreateFirstEntry,
  }: {
    demoMode?: boolean;
    entries?: unknown[];
    onCreateFirstEntry?: () => void;
  }) => (
    <div>
      <div>{demoMode ? 'Demo Analytics Dashboard' : 'Standard Analytics Dashboard'}</div>
      <div>analytics entries: {entries.length}</div>
      {demoMode && (
        <button type="button" onClick={onCreateFirstEntry}>
          Start my entry
        </button>
      )}
    </div>
  ),
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
      loadChronicPainTestData: vi.fn(),
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

  it('opens a temporary mock analytics preview from onboarding without upgrading the user', async () => {
    const storeState = {
      entries: [],
      ui: { showOnboarding: true, showWalkthrough: false },
      addEntry: vi.fn(),
      updateEntry: vi.fn(),
      setShowOnboarding: vi.fn(),
      setShowWalkthrough: vi.fn(),
      setError: vi.fn(),
      loadSampleData: vi.fn(),
      loadChronicPainTestData: vi.fn(),
    };

    (usePainTrackerStore as unknown as { mockImplementation: (fn: unknown) => void }).mockImplementation(
      (selector: unknown) => {
        if (typeof selector === 'function') {
          return (selector as (s: typeof storeState) => unknown)(storeState);
        }
        return storeState;
      }
    );

    render(<PainTrackerContainer />);

    await userEvent.click(await screen.findByRole('button', { name: /preview mock analytics/i }));

    expect(await screen.findByText('Demo Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('analytics entries: 2')).toBeInTheDocument();
    expect(screen.getAllByText('Demo').length).toBeGreaterThan(0);
    expect(storeState.loadSampleData).not.toHaveBeenCalled();
    expect(subscriptionService.getUserTier(currentUserId)).toBe('free');
  });

  it('clears the mock analytics preview before the user starts their own entry', async () => {
    const storeState = {
      entries: [],
      ui: { showOnboarding: true, showWalkthrough: false },
      addEntry: vi.fn(),
      updateEntry: vi.fn(),
      setShowOnboarding: vi.fn(),
      setShowWalkthrough: vi.fn(),
      setError: vi.fn(),
      loadSampleData: vi.fn(),
      loadChronicPainTestData: vi.fn(),
    };

    (usePainTrackerStore as unknown as { mockImplementation: (fn: unknown) => void }).mockImplementation(
      (selector: unknown) => {
        if (typeof selector === 'function') {
          return (selector as (s: typeof storeState) => unknown)(storeState);
        }
        return storeState;
      }
    );

    render(<PainTrackerContainer />);

    await userEvent.click(await screen.findByRole('button', { name: /preview mock analytics/i }));
    expect(await screen.findByText('Demo Analytics Dashboard')).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('button', { name: /start my entry/i })[0]);

    expect(await screen.findByText('Quick Log')).toBeInTheDocument();
    expect(screen.queryByText('Demo Analytics Dashboard')).not.toBeInTheDocument();

    const analyticsNav = screen.getAllByRole('button', { name: /analytics/i })[0];
    await userEvent.click(analyticsNav);

    expect(await screen.findByText('Standard Analytics Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Demo Analytics Dashboard')).not.toBeInTheDocument();
  });
});
