import { describe, expect, it } from 'vitest';

import {
  comprehensive365DayPainEntries,
  comprehensive365DayMoodEntries,
} from './chronic-pain-12-month-seed';

describe('chronic-pain-12-month-seed', () => {
  it('imports without throwing and generates entries', () => {
    expect(Array.isArray(comprehensive365DayPainEntries)).toBe(true);
    expect(comprehensive365DayPainEntries.length).toBeGreaterThan(300);

    expect(Array.isArray(comprehensive365DayMoodEntries)).toBe(true);
    expect(comprehensive365DayMoodEntries.length).toBeGreaterThan(100);
  });

  it('populates optional analytics fields for coverage', () => {
    const entries = comprehensive365DayPainEntries;

    const hasQuality = entries.some((e) => Array.isArray(e.quality) && e.quality.length > 0);
    const hasRelief = entries.some(
      (e) => Array.isArray(e.reliefMethods) && e.reliefMethods.length > 0
    );
    const hasActivities = entries.some(
      (e) => Array.isArray(e.activities) && e.activities.length > 0
    );
    const hasStress = entries.some((e) => typeof e.stress === 'number' && Number.isFinite(e.stress));
    const hasActivityLevel = entries.some(
      (e) => typeof e.activityLevel === 'number' && Number.isFinite(e.activityLevel)
    );

    expect(hasQuality).toBe(true);
    expect(hasRelief).toBe(true);
    expect(hasActivities).toBe(true);
    expect(hasStress).toBe(true);
    expect(hasActivityLevel).toBe(true);
  });
});
