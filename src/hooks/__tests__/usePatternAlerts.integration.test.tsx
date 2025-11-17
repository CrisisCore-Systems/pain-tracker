import React from 'react';
import { render, screen } from '@testing-library/react';
import { usePatternAlerts } from '../usePatternAlerts';

type Entry = { time: string; pain: number };

function TestHarness({ entries }: { entries: Entry[] }) {
  usePatternAlerts(entries);
  return <div data-testid="harness" />;
}

describe('usePatternAlerts integration', () => {
  const originalNotification = (global as any).Notification;
  let notificationCalls: Array<any> = [];

  beforeEach(() => {
    notificationCalls = [];
    (global as any).Notification = vi.fn().mockImplementation(function (title: string, opts: any) {
      notificationCalls.push([title, opts]);
      return { title, opts };
    });
    localStorage.setItem('pain-tracker:alerts-settings', JSON.stringify({ threshold: 3 }));
  });

  afterEach(() => {
    (global as any).Notification = originalNotification;
    localStorage.removeItem('pain-tracker:alerts-settings');
    localStorage.removeItem('pain-tracker:notification-consent');
    vi.clearAllMocks();
    notificationCalls = [];
  });

  test('does not notify without consent', () => {
    localStorage.setItem('pain-tracker:notification-consent', 'dismissed');
    const { rerender } = render(
      <TestHarness
        entries={[
          { time: 't1', pain: 2 },
          { time: 't2', pain: 6 },
        ]}
      />
    );
    expect(notificationCalls.length).toBe(0);

    rerender(
      <TestHarness
        entries={[
          { time: 't1', pain: 2 },
          { time: 't2', pain: 6 },
          { time: 't3', pain: 10 },
        ]}
      />
    );
    expect(notificationCalls.length).toBe(0);
  });

  test('notifies when consent granted', () => {
    localStorage.setItem('pain-tracker:notification-consent', 'granted');
    render(
      <TestHarness
        entries={[
          { time: 't1', pain: 1 },
          { time: 't2', pain: 5 },
        ]}
      />
    );
    expect(notificationCalls.length).toBeGreaterThanOrEqual(1);
  });
});
