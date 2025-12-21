import { PrivacyPreservingAnalyticsService } from '../../services/PrivacyAnalyticsService';

// The service exports an instance, but for unit testing we'll instantiate a fresh one
const svc = new PrivacyPreservingAnalyticsService({
  dataRetentionDays: 30,
  differentialPrivacyEnabled: false,
});

describe('PrivacyAnalyticsService.calculateWeeklyAverage', () => {
  it('computes average pain over last 7 days and clamps to 0-10', () => {
    const now = new Date();
    const events: unknown[] = [];

    // Create events: one 8.5 at now, one 9 at 1 day ago, one 0 at 10 days ago (should be excluded)
    events.push({
      eventType: 'pain_logged',
      timestamp: new Date(now),
      metadata: { painLevel: 8.5 },
      sessionHash: 's1',
      isAnonymized: true,
    });
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    events.push({
      eventType: 'pain_logged',
      timestamp: oneDayAgo,
      metadata: { painLevel: 9 },
      sessionHash: 's2',
      isAnonymized: true,
    });
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    events.push({
      eventType: 'pain_logged',
      timestamp: tenDaysAgo,
      metadata: { painLevel: 0 },
      sessionHash: 's3',
      isAnonymized: true,
    });

    // Call private method via a narrow shim to test computation
    const result = (svc as unknown as { calculateWeeklyAverage: (events: unknown[]) => number })
      .calculateWeeklyAverage(events);
    expect(result).toBeGreaterThan(8);
    expect(result).toBeLessThanOrEqual(10);
  });
});
