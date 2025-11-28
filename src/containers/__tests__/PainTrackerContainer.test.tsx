import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '../../test/test-utils';
import { PainTrackerContainer } from '../PainTrackerContainer';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

vi.mock('../../stores/pain-tracker-store');

// Mock secureStorage to avoid real storage access
vi.mock('../../lib/storage/secureStorage', () => ({
  secureStorage: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('PainTrackerContainer - entry success toast', () => {
  it('shows gentle success toast after a valid entry is added', async () => {
    const addEntry = vi.fn();
    const setShowOnboarding = vi.fn();
    const setShowWalkthrough = vi.fn();
    const setError = vi.fn();
    const loadSampleData = vi.fn();

  (usePainTrackerStore as unknown as { mockReturnValue: (v: unknown) => void }).mockReturnValue({
      entries: [
        {
          id: 'sample-1',
          // Make the last entry 5 hours ago so the 'Log pain now' primary action appears
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
    });

    render(<PainTrackerContainer />);

    // Simulate the user logging a quick entry via the primary action -> quick log -> save
    // 1) Click the primary "Log pain now" action
    const logNow = screen.getByRole('button', { name: /Log pain now/i });
    fireEvent.click(logNow);

    // 2) Advance through the quick-log steps (Continue twice), then Save
    const continueBtn1 = screen.getByRole('button', { name: /Continue to step 2/i });
    fireEvent.click(continueBtn1);

    const continueBtn2 = screen.getByRole('button', { name: /Continue to step 3/i });
    fireEvent.click(continueBtn2);

    const saveBtn = screen.getByRole('button', { name: /Save pain entry/i });
    fireEvent.click(saveBtn);

    // After saving, the container shows a gentle success toast with this copy
    await waitFor(() => {
      expect(
        screen.queryByText(
          "Your update is safely stored. You can explore your dashboard or analytics whenever you're ready."
        )
      ).not.toBeNull();
    });
  });
});
