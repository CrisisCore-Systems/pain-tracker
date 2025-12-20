import { describe, it, expect } from 'vitest';
import { migratePainTrackerState } from '../../stores/pain-tracker-migrations';
import type { PainTrackerState } from '../../stores/pain-tracker-store';

describe('pain tracker persist migration', () => {
  it('migrates mood entries to include id and string timestamps', () => {
    const legacyState = {
      moodEntries: [
        {
          // legacy had no id and timestamp as Date
          timestamp: new Date(),
          mood: 6,
          energy: 5,
          anxiety: 3,
          stress: 4,
          hopefulness: 6,
          selfEfficacy: 5,
          emotionalClarity: 6,
          emotionalRegulation: 6,
          context: 'rehydration test',
          triggers: [],
          copingStrategies: [],
          socialSupport: 'none',
          notes: 'legacy entry',
        },
      ],
    } as unknown as Partial<PainTrackerState>;

    const migrated = migratePainTrackerState(legacyState, 0);
    expect(migrated).toBeDefined();
    expect(migrated!.moodEntries).toBeDefined();
    const entry = migrated!.moodEntries![0];
    // Should add id and convert timestamp to ISO string
    expect(typeof entry.id).toBe('number');
    expect(typeof entry.timestamp).toBe('string');
  });
});
