import React from 'react';
import { render } from '@testing-library/react';
import { usePatternAlerts } from '../usePatternAlerts';

function TestHarness({ entries }: { entries: { time: string; pain: number }[] }) {
  usePatternAlerts(entries);
  return <div />;
}

describe('combined detectors', () => {
  const globalShim = globalThis as unknown as { Notification?: unknown };
  const origNotification = globalShim.Notification;

  type NotificationCall = [title: string, options: NotificationOptions | undefined];
  let calls: NotificationCall[] = [];

  beforeEach(() => {
    calls = [];
    globalShim.Notification = vi
      .fn()
      .mockImplementation((title: string, opts?: NotificationOptions) => {
        calls.push([title, opts]);
        return {} as Notification;
      });
    localStorage.removeItem('pain-tracker:alerts-log');
    localStorage.setItem('pain-tracker:alerts-settings', JSON.stringify({ threshold: 3 }));
  });

  afterEach(() => {
    globalShim.Notification = origNotification;
    localStorage.removeItem('pain-tracker:alerts-settings');
    localStorage.removeItem('pain-tracker:notification-consent');
    localStorage.removeItem('pain-tracker:alerts-log');
    vi.clearAllMocks();
  });

  test('rolling average detector triggers and logs alert (no notify without consent)', () => {
    localStorage.setItem('pain-tracker:notification-consent', 'dismissed');
    render(
      <TestHarness
        entries={[
          { time: 't1', pain: 2 },
          { time: 't2', pain: 2 },
          { time: 't3', pain: 2 },
          { time: 't4', pain: 7 },
        ]}
      />
    );
    const log = JSON.parse(localStorage.getItem('pain-tracker:alerts-log') || '[]');
    expect(log.length).toBeGreaterThanOrEqual(1);
    expect(calls.length).toBe(0);
  });

  test('z-score detector notifies when consent granted', () => {
    localStorage.setItem('pain-tracker:notification-consent', 'granted');
    render(
      <TestHarness
        entries={[
          { time: 't1', pain: 1 },
          { time: 't2', pain: 1 },
          { time: 't3', pain: 9 },
        ]}
      />
    );
    const log = JSON.parse(localStorage.getItem('pain-tracker:alerts-log') || '[]');
    expect(log.length).toBeGreaterThanOrEqual(1);
    expect(calls.length).toBeGreaterThanOrEqual(1);
  });
});
