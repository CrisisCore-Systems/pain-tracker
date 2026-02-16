import { describe, it, expect, beforeEach } from 'vitest';
import {
  buildAnonymousLocalUsageReport,
  getUsageMetrics,
  recordUsageSession,
  resetUsageMetrics,
} from './localUsageMetrics';

describe('localUsageMetrics', () => {
  beforeEach(async () => {
    await resetUsageMetrics();
  });

  it('initializes metrics with zero counts', async () => {
    const m = await getUsageMetrics();
    expect(m.sessionCount).toBe(0);
    expect(m.activeDayCount).toBe(0);
    expect(m.firstSeenDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(m.lastActiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('increments sessionCount and activeDayCount on first session', async () => {
    const m = await recordUsageSession({ now: new Date('2026-02-15T10:00:00Z') });
    expect(m.sessionCount).toBe(1);
    expect(m.activeDayCount).toBe(1);
  });

  it('increments sessionCount without incrementing activeDayCount on same day', async () => {
    await recordUsageSession({ now: new Date('2026-02-15T10:00:00Z') });
    const m2 = await recordUsageSession({ now: new Date('2026-02-15T23:59:00Z') });
    expect(m2.sessionCount).toBe(2);
    expect(m2.activeDayCount).toBe(1);
  });

  it('increments activeDayCount when day changes', async () => {
    await recordUsageSession({ now: new Date('2026-02-15T10:00:00Z') });
    const m2 = await recordUsageSession({ now: new Date('2026-02-16T10:00:00Z') });
    expect(m2.sessionCount).toBe(2);
    expect(m2.activeDayCount).toBe(2);
  });

  it('anonymous usage report is aggregate-only and schema-stable', async () => {
    const report = await buildAnonymousLocalUsageReport();

    expect(report.schema).toBe('paintracker.local-usage.v1');
    expect(report.generatedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(typeof report.sessionCount).toBe('number');
    expect(typeof report.activeDayCount).toBe('number');

    const keys = Object.keys(report);
    expect(keys).toEqual(
      expect.arrayContaining([
        'schema',
        'generatedDate',
        'sessionCount',
        'activeDayCount',
        'firstSeenDate',
        'lastActiveDate',
        'notes',
      ])
    );

    // Explicitly ensure we are not exporting identifiers or event logs.
    expect(keys).not.toContain('events');
    expect(keys).not.toContain('eventLog');
    expect(keys).not.toContain('deviceId');
    expect(keys).not.toContain('userId');
    expect(keys).not.toContain('fingerprint');
    expect(keys).not.toContain('timestamps');
  });

  it('adds a disabled-state note when counters are disabled at export time', async () => {
    const report = await buildAnonymousLocalUsageReport({ countersEnabledAtExportTime: false });
    expect(report.notes).toContain('At export time, usage counters were disabled; no new sessions are being recorded.');
  });
});
