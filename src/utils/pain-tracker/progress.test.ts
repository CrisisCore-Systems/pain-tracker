import { describe, it, expect } from 'vitest';
import type { PainEntry } from '../../types';
import { buildDailyAveragePain, computePainProgressSinceStart } from './progress';

const makeEntry = (data: { id: number; timestamp: string; pain: number }): PainEntry => ({
  id: data.id,
  timestamp: data.timestamp,
  baselineData: {
    pain: data.pain,
    locations: [],
    symptoms: [],
  },
  functionalImpact: {
    limitedActivities: [],
    assistanceNeeded: [],
    mobilityAids: [],
  },
  medications: {
    current: [],
    changes: '',
    effectiveness: '',
  },
  treatments: {
    recent: [],
    effectiveness: '',
    planned: [],
  },
  qualityOfLife: {
    sleepQuality: 0,
    moodImpact: 0,
    socialImpact: [],
  },
  workImpact: {
    missedWork: 0,
    modifiedDuties: [],
    workLimitations: [],
  },
  comparison: {
    worseningSince: '',
    newLimitations: [],
  },
  notes: '',
});

function localIso(day: number): string {
  // Local noon avoids date shifts across time zones.
  return new Date(2024, 0, day, 12, 0, 0).toISOString();
}

describe('computePainProgressSinceStart', () => {
  it('returns improving summary when recent average is lower', () => {
    const entries: PainEntry[] = [];

    // Baseline: 10 days at pain 8
    for (let i = 1; i <= 10; i++) {
      entries.push(makeEntry({ id: i, timestamp: localIso(i), pain: 8 }));
    }

    // Recent: 10 days at pain 4
    for (let i = 11; i <= 20; i++) {
      entries.push(makeEntry({ id: i, timestamp: localIso(i), pain: 4 }));
    }

    const summary = computePainProgressSinceStart(entries, { windowDays: 14 });
    expect(summary).not.toBeNull();
    expect(summary?.direction).toBe('improving');
    expect(summary?.percentImproved).toBeCloseTo(50, 6);
  });

  it('returns stable when change is within threshold', () => {
    const entries: PainEntry[] = [];

    for (let i = 1; i <= 8; i++) {
      entries.push(makeEntry({ id: i, timestamp: localIso(i), pain: 5 }));
    }

    for (let i = 9; i <= 16; i++) {
      entries.push(makeEntry({ id: i, timestamp: localIso(i), pain: 5.2 }));
    }

    const summary = computePainProgressSinceStart(entries, {
      windowDays: 14,
      stableThresholdPercent: 5,
    });

    expect(summary).not.toBeNull();
    expect(summary?.direction).toBe('stable');
  });

  it('returns worsening summary when recent average is higher', () => {
    const entries: PainEntry[] = [];

    // Baseline: 10 days at pain 4
    for (let i = 1; i <= 10; i++) {
      entries.push(makeEntry({ id: i, timestamp: localIso(i), pain: 4 }));
    }

    // Recent: 10 days at pain 8
    for (let i = 11; i <= 20; i++) {
      entries.push(makeEntry({ id: i, timestamp: localIso(i), pain: 8 }));
    }

    const summary = computePainProgressSinceStart(entries, { windowDays: 14 });
    expect(summary).not.toBeNull();
    expect(summary?.direction).toBe('worsening');
    expect(summary?.percentImproved).toBeLessThan(0);
  });

  it('returns null when baseline average is near zero', () => {
    const entries: PainEntry[] = [];

    // Two windows of at least minDaysPerWindow=3 each, but pain ~0
    for (let i = 1; i <= 10; i++) {
      entries.push(makeEntry({ id: i, timestamp: localIso(i), pain: 0 }));
    }
    for (let i = 11; i <= 20; i++) {
      entries.push(makeEntry({ id: i, timestamp: localIso(i), pain: 0 }));
    }

    expect(computePainProgressSinceStart(entries, { windowDays: 14 })).toBeNull();
  });

  it('returns null when there is not enough data', () => {
    const entries: PainEntry[] = [
      makeEntry({ id: 1, timestamp: localIso(1), pain: 5 }),
      makeEntry({ id: 2, timestamp: localIso(2), pain: 5 }),
      makeEntry({ id: 3, timestamp: localIso(3), pain: 5 }),
      makeEntry({ id: 4, timestamp: localIso(4), pain: 5 }),
    ];

    expect(computePainProgressSinceStart(entries)).toBeNull();
  });

  it('returns null when slice size is below minDaysPerWindow', () => {
    const entries: PainEntry[] = [];

    // 8 distinct days => daily.length=8
    for (let i = 1; i <= 8; i++) {
      entries.push(makeEntry({ id: i, timestamp: localIso(i), pain: 5 }));
    }

    // windowDays=3 forces sliceSize=3, but minDaysPerWindow=4 requires >=4
    expect(
      computePainProgressSinceStart(entries, { windowDays: 3, minDaysPerWindow: 4 })
    ).toBeNull();
  });
});

describe('buildDailyAveragePain', () => {
  it('ignores entries with invalid timestamps', () => {
    const daily = buildDailyAveragePain([
      makeEntry({ id: 1, timestamp: 'not-a-date', pain: 5 }),
      makeEntry({ id: 2, timestamp: localIso(1), pain: 7 }),
    ]);

    expect(daily).toHaveLength(1);
    expect(daily[0]?.entryCount).toBe(1);
    expect(daily[0]?.avgPain).toBe(7);
  });
});
