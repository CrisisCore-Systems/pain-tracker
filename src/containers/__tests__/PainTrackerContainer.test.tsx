import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../test/test-utils';
import { PainTrackerContainer } from '../PainTrackerContainer';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import { readWorkflowPreferences } from '../../utils/workflowPreferences';

vi.mock('../../stores/pain-tracker-store');
vi.mock('../../utils/workflowPreferences', () => ({
  WORKFLOW_PREFERENCES_UPDATED_EVENT: 'workflow-preferences-updated',
  readWorkflowPreferences: vi.fn(() => ({
    defaultWcbTemplateStyle: 'hostile-bureaucracy',
    industrialFieldMode: false,
    showFibromyalgiaHubNavItem: true,
  })),
}));

// Mock heavy UI surfaces to keep this test fast and deterministic.
vi.mock('../../design-system/fused-v2', () => ({
  ClinicalDashboard: ({ onLogNow }: { onLogNow: () => void }) => (
    <button type="button" onClick={onLogNow}>
      Quick log pain
    </button>
  ),
}));

type QuickLogOneScreenData = {
  pain: number;
  locations: string[];
  symptoms: string[];
  notes: string;
};

vi.mock('../../design-system/fused-v2/QuickLogOneScreen', () => ({
  default: function QuickLogOneScreenMock({
    onComplete,
  }: {
    onComplete: (data: QuickLogOneScreenData) => void;
  }) {
    const [checked, setChecked] = React.useState(false);
    return (
      <div>
        <label>
          <input
            type="checkbox"
            checked={checked}
            onChange={e => setChecked(e.currentTarget.checked)}
          />
          Lower back location
        </label>
        <button
          type="button"
          onClick={() => {
            if (!checked) return;
            onComplete({
              pain: 5,
              locations: ['Lower back'],
              symptoms: [],
              notes: '',
            });
          }}
        >
          Log pain now
        </button>
      </div>
    );
  },
}));

vi.mock('../../data/sampleData', () => ({
  walkthroughSteps: [],
}));

vi.mock('../../services/weatherAutoCapture', () => ({
  maybeCaptureWeatherForNewEntry: async () => null,
}));

vi.mock('../../pages/SettingsPage', () => ({
  default: () => <h2>Settings Surface</h2>,
}));

// Mock secureStorage to avoid real storage access
vi.mock('../../lib/storage/secureStorage', () => ({
  secureStorage: {
    get: vi.fn(),
    set: vi.fn(),
    safeJSON: vi.fn((key: string, fallback: unknown) => fallback),
    remove: vi.fn(),
    keys: vi.fn(() => []),
  },
}));

describe('PainTrackerContainer - entry success toast', () => {
  it('opens settings from the app navigation', async () => {
    vi.mocked(readWorkflowPreferences).mockReturnValue({
      defaultWcbTemplateStyle: 'hostile-bureaucracy',
      industrialFieldMode: false,
      showFibromyalgiaHubNavItem: true,
    });

    const user = userEvent.setup();
    const storeState = {
      entries: [
        {
          id: 'sample-1',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
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

    render(<PainTrackerContainer />);

    const settingsNav = await screen.findByRole('button', { name: /settings/i });
    expect(settingsNav).toHaveAttribute('data-nav-target', 'settings');

    await user.click(settingsNav);

    expect(await screen.findByRole('heading', { name: /settings surface/i })).toBeInTheDocument();
  });

  it('opens quick log first when industrial field mode is enabled even with existing entries', async () => {
    vi.mocked(readWorkflowPreferences).mockReturnValue({
      defaultWcbTemplateStyle: 'hostile-bureaucracy',
      industrialFieldMode: true,
      showFibromyalgiaHubNavItem: true,
    });

    const storeState = {
      entries: [
        {
          id: 'sample-1',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
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

    render(<PainTrackerContainer />);

    expect(await screen.findByRole('button', { name: /log pain now/i })).toBeInTheDocument();
  });

  it('opens quick log first when there are no saved entries', async () => {
    vi.mocked(readWorkflowPreferences).mockReturnValue({
      defaultWcbTemplateStyle: 'hostile-bureaucracy',
      industrialFieldMode: false,
      showFibromyalgiaHubNavItem: true,
    });

    const storeState = {
      entries: [],
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

    render(<PainTrackerContainer />);

    expect(await screen.findByRole('button', { name: /log pain now/i })).toBeInTheDocument();
  });

  it('shows gentle success toast after a valid entry is added', async () => {
    vi.mocked(readWorkflowPreferences).mockReturnValue({
      defaultWcbTemplateStyle: 'hostile-bureaucracy',
      industrialFieldMode: false,
      showFibromyalgiaHubNavItem: true,
    });

    const user = userEvent.setup();
    const addEntry = vi.fn();
    const setShowOnboarding = vi.fn();
    const setShowWalkthrough = vi.fn();
    const setError = vi.fn();
    const loadSampleData = vi.fn();

    // The store hook is called with a selector; mockImplementation should accept selector functions
    const storeState = {
      entries: [
        {
          id: 'sample-1',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          baselineData: { pain: 5, locations: [], symptoms: [] },
          notes: '',
          occupationalImpact: {},
        },
      ],
      ui: { showOnboarding: false, showWalkthrough: false },
      addEntry,
      setShowOnboarding,
      setShowWalkthrough,
      setError,
      loadSampleData,
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

    // Simulate the user logging a quick entry via the primary action -> quick log -> save
    // 1) Click the primary "Quick log pain" action
    const logNow = await screen.findByRole('button', { name: /Quick log pain/i }, { timeout: 5000 });
    await user.click(logNow);

    // At least one location is required to save
    const lowerBack = await screen.findByRole('checkbox', { name: /lower back location/i }, { timeout: 5000 });
    await user.click(lowerBack);

    // 2) Quick Log is a single screen in the fused-v2 design; Save completes the entry.
    // Anchored on purpose: prevents accidentally matching unrelated "Save …" buttons.
    const saveBtn = await screen.findByRole(
      'button',
      { name: /^(log pain now|save( and finish)?( entry)?)$/i },
      { timeout: 5000 }
    );
    await user.click(saveBtn);

    // After saving, the container shows a gentle success toast with this copy
    await waitFor(() => {
      expect(screen.queryByText(/safely stored/i)).not.toBeNull();
    }, { timeout: 5000 });
  }, 30000);
});
