import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const fetchWeatherDataMock = vi.fn();

vi.mock('../../utils/privacySettings', () => ({
  readPrivacySettings: () => ({ weatherAutoCapture: false }),
}));

vi.mock('../weather', () => ({
  fetchWeatherData: (...args: unknown[]) => fetchWeatherDataMock(...args),
}));

import { maybeCaptureWeatherForNewEntry } from '../weatherAutoCapture';

describe('weatherAutoCapture', () => {
  const originalGeolocationDescriptor = Object.getOwnPropertyDescriptor(navigator, 'geolocation');

  beforeEach(() => {
    fetchWeatherDataMock.mockReset();
  });

  afterEach(() => {
    if (originalGeolocationDescriptor) {
      Object.defineProperty(navigator, 'geolocation', originalGeolocationDescriptor);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any;
      try {
        delete nav.geolocation;
      } catch {
        nav.geolocation = undefined;
      }
    }
  });

  it('returns null and does not call geolocation when opt-in is disabled', async () => {
    const getCurrentPosition = vi.fn();
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition },
      configurable: true,
    });

    const result = await maybeCaptureWeatherForNewEntry();

    expect(result).toBeNull();
    expect(getCurrentPosition).not.toHaveBeenCalled();
    expect(fetchWeatherDataMock).not.toHaveBeenCalled();
  });
});
