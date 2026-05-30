import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { act, render, screen, waitFor } from '../../test/test-utils';
import { PainTrackerContainer } from '../PainTrackerContainer';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import {
  WORKFLOW_PREFERENCES_STORAGE_KEY,
  writeWorkflowPreferences,
  type WorkflowPreferences,
} from '../../utils/workflowPreferences';

const storageState = vi.hoisted(() => ({
  values: new Map<string, unknown>(),
}));

vi.mock('../../stores/pain-tracker-store');

vi.mock('../../utils/user-identity', () => ({
  getLocalUserId: () => 'workflow-preferences-test-user',
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
    get: vi.fn((key: string) => storageState.values.get(key) ?? null),
    set: vi.fn((key: string, value: unknown) => {
      storageState.values.set(key, value);
      return { success: true, bytes: 1 };
    }),
    safeJSON: vi.fn((key: string, fallback: unknown) => storageState.values.get(key) ?? fallback),
    remove: vi.fn((key: string) => storageState.values.delete(key)),
    keys: vi.fn(() => Array.from(storageState.values.keys())),
  },
}));

vi.mock('../../pages/SettingsPage', async () => {
  const React = await import('react');
  const { default: WorkflowPreferencesPanel } = await import('../../components/settings/WorkflowPreferencesPanel');

  return {
    default: () => React.createElement(WorkflowPreferencesPanel),
  };
});

vi.mock('../../components/fibromyalgia/FibromyalgiaTracker', () => ({
  FibromyalgiaTracker: () => <div>Fibromyalgia tracker screen</div>,
}));

const visiblePreferences: WorkflowPreferences = {
  defaultWcbTemplateStyle: 'hostile-bureaucracy',
  industrialFieldMode: false,
  showFibromyalgiaHubNavItem: true,
};

function mockPainTrackerStore() {
  const storeState = {
    entries: [
      {
        id: 'entry-1',
        timestamp: new Date('2026-05-30T12:00:00.000Z').toISOString(),
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
}

describe('PainTrackerContainer workflow preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageState.values.clear();
    storageState.values.set(WORKFLOW_PREFERENCES_STORAGE_KEY, visiblePreferences);
    mockPainTrackerStore();
  });

  it('updates the Fibromyalgia Hub shell navigation when the settings checkbox changes', async () => {
    const user = userEvent.setup();

    render(<PainTrackerContainer initialView="settings" />);

    const fibromyalgiaNavPreference = await screen.findByRole('checkbox', {
      name: /show fibromyalgia hub in navigation/i,
    });
    expect(fibromyalgiaNavPreference).toBeChecked();
    expect(screen.getByRole('button', { name: /fibromyalgia hub/i })).toBeInTheDocument();

    await user.click(fibromyalgiaNavPreference);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /fibromyalgia hub/i })).not.toBeInTheDocument();
    });
    expect(fibromyalgiaNavPreference).not.toBeChecked();
    expect(screen.getByText(/workflow & field mode/i)).toBeInTheDocument();

    await user.click(fibromyalgiaNavPreference);

    expect(await screen.findByRole('button', { name: /fibromyalgia hub/i })).toBeInTheDocument();
    expect(fibromyalgiaNavPreference).toBeChecked();
  });

  it('moves off the Fibromyalgia view when a live preference update hides that navigation item', async () => {
    render(<PainTrackerContainer initialView="fibromyalgia" />);

    expect(await screen.findByText('Fibromyalgia tracker screen')).toBeInTheDocument();

    act(() => {
      writeWorkflowPreferences({ showFibromyalgiaHubNavItem: false });
    });

    await waitFor(() => {
      expect(screen.getByText('Clinical Dashboard')).toBeInTheDocument();
    });
    expect(screen.queryByText('Fibromyalgia tracker screen')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /fibromyalgia hub/i })).not.toBeInTheDocument();
  });
});
