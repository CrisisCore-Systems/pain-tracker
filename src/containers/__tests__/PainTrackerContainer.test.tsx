import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../test/test-utils';
import { PainTrackerContainer } from '../PainTrackerContainer';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

vi.mock('../../stores/pain-tracker-store');

// Mock heavy UI surfaces to keep this test fast and deterministic.
vi.mock('../../design-system/fused-v2', () => ({
  ClinicalDashboard: ({ onLogNow }: { onLogNow: () => void }) => (
    <button type="button" onClick={onLogNow}>
      Quick log pain
    </button>
  ),
}));

vi.mock('../../design-system/fused-v2/QuickLogOneScreen', () => ({
  default: ({ onComplete }: { onComplete: (data: any) => void }) => {
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
  it('shows gentle success toast after a valid entry is added', async () => {
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
  }, 20000);
});
