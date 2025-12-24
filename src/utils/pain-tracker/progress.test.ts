import { describe, it, expect } from 'vitest';
import type { PainEntry } from '../../types';
import { computePainProgressSinceStart } from './progress';

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

  it('returns null when there is not enough data', () => {
    const entries: PainEntry[] = [
      makeEntry({ id: 1, timestamp: localIso(1), pain: 5 }),
      makeEntry({ id: 2, timestamp: localIso(2), pain: 5 }),
      makeEntry({ id: 3, timestamp: localIso(3), pain: 5 }),
      makeEntry({ id: 4, timestamp: localIso(4), pain: 5 }),
    ];

    expect(computePainProgressSinceStart(entries)).toBeNull();
  });
});
