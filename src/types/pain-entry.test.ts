import { describe, expect, it } from 'vitest';

import { CreatePainEntrySchema } from './pain-entry';

describe('CreatePainEntrySchema', () => {
  it('rejects creating an entry with no locations', () => {
    const result = CreatePainEntrySchema.safeParse({
      baselineData: {
        pain: 5,
        locations: [],
        symptoms: [],
      },
      notes: '',
      triggers: [],
      functionalImpact: {
        limitedActivities: [],
        assistanceNeeded: [],
        mobilityAids: [],
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
      comparison: {
        worseningSince: '',
        newLimitations: [],
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join('.') === 'baselineData.locations')).toBe(true);
    }
  });

  it('accepts creating an entry with at least one location', () => {
    const result = CreatePainEntrySchema.safeParse({
      baselineData: {
        pain: 5,
        locations: ['Back'],
        symptoms: [],
      },
      notes: '',
      triggers: [],
      functionalImpact: {
        limitedActivities: [],
        assistanceNeeded: [],
        mobilityAids: [],
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
      comparison: {
        worseningSince: '',
        newLimitations: [],
      },
    });

    expect(result.success).toBe(true);
  });
});
