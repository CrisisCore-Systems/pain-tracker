import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSubscriptionEntry } from '../useSubscriptionEntry';

const {
  mockStore,
  mockCheckPainEntryQuota,
  mockCheckMoodEntryQuota,
  mockCheckActivityLogQuota,
  mockTrackPainEntryUsage,
  mockTrackMoodEntryUsage,
  mockTrackActivityLogUsage,
} = vi.hoisted(() => ({
  mockStore: {
    addEntry: vi.fn(),
    addMoodEntry: vi.fn(),
    addActivityLog: vi.fn(),
  },
  mockCheckPainEntryQuota: vi.fn(),
  mockCheckMoodEntryQuota: vi.fn(),
  mockCheckActivityLogQuota: vi.fn(),
  mockTrackPainEntryUsage: vi.fn(),
  mockTrackMoodEntryUsage: vi.fn(),
  mockTrackActivityLogUsage: vi.fn(),
}));

vi.mock('../../stores/pain-tracker-store', () => ({
  usePainTrackerStore: () => mockStore,
}));

vi.mock('../../stores/subscription-actions', () => ({
  checkPainEntryQuota: mockCheckPainEntryQuota,
  checkMoodEntryQuota: mockCheckMoodEntryQuota,
  checkActivityLogQuota: mockCheckActivityLogQuota,
  trackPainEntryUsage: mockTrackPainEntryUsage,
  trackMoodEntryUsage: mockTrackMoodEntryUsage,
  trackActivityLogUsage: mockTrackActivityLogUsage,
}));

vi.mock('../../services/weatherAutoCapture', () => ({
  maybeCaptureWeatherForNewEntry: vi.fn().mockResolvedValue(null),
}));

vi.mock('../../services/AnalyticsTrackingService', () => ({
  trackPainEntry: vi.fn(),
  trackWeatherCorrelation: vi.fn(),
  trackMoodEntry: vi.fn(),
  trackActivityLog: vi.fn(),
}));

describe('useSubscriptionEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('surfaces the normalized quota message for real entry limits', async () => {
    mockCheckPainEntryQuota.mockResolvedValue({
      success: false,
      error: "You have reached this plan's pain entry limit. Upgrade to Pro or higher for more room.",
      quotaExceeded: true,
      upgradeRequired: 'pro',
    });

    const { result } = renderHook(() => useSubscriptionEntry('user-1'));
    let thrownError: unknown;

    await act(async () => {
      try {
        await result.current.addPainEntry({
          baselineData: { pain: 8, locations: [], symptoms: [] },
          triggers: [],
        } as never);
      } catch (error) {
        thrownError = error;
      }
    });

    expect(thrownError).toBeInstanceOf(Error);
    expect((thrownError as Error).message).toBe(
      "You have reached this plan's pain entry limit. Upgrade to Pro or higher for more room."
    );

    await waitFor(() => {
      expect(result.current.isQuotaExceeded).toBe(true);
      expect(result.current.quotaMessage).toBe(
        "You have reached this plan's pain entry limit. Upgrade to Pro or higher for more room."
      );
    });
  });

  it('keeps generic quota check failures out of the quota-exceeded state', async () => {
    mockCheckPainEntryQuota.mockResolvedValue({
      success: false,
      error: 'Unable to read your subscription status right now.',
      quotaExceeded: false,
    });

    const { result } = renderHook(() => useSubscriptionEntry('user-1'));
    let thrownError: unknown;

    await act(async () => {
      try {
        await result.current.addPainEntry({
          baselineData: { pain: 5, locations: [], symptoms: [] },
          triggers: [],
        } as never);
      } catch (error) {
        thrownError = error;
      }
    });

    expect(thrownError).toBeInstanceOf(Error);
    expect((thrownError as Error).message).toBe('Unable to read your subscription status right now.');

    await waitFor(() => {
      expect(result.current.isQuotaExceeded).toBe(false);
      expect(result.current.quotaMessage).toBe('Unable to read your subscription status right now.');
    });
  });
});