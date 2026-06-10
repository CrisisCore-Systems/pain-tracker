import { describe, it, expect } from 'vitest';
import { generateDecoySandbox } from '../DecoySandboxGenerator';

describe('DecoySandboxGenerator', () => {
  it('generates entries within specified day range with organic variance', () => {
    const result = generateDecoySandbox({ minDays: 30, maxDays: 30 });

    // Account for missing entries (12% rate) - expect between 22-30 entries
    expect(result.entries.length).toBeGreaterThanOrEqual(22);
    expect(result.entries.length).toBeLessThanOrEqual(30);
    expect(result.moodEntries.length).toBeGreaterThanOrEqual(22);
    expect(result.moodEntries.length).toBeLessThanOrEqual(30);
  });

  it('generates entries with valid pain scores', () => {
    const result = generateDecoySandbox({ minDays: 7, maxDays: 7 });

    for (const entry of result.entries) {
      expect(entry.baselineData.pain).toBeGreaterThanOrEqual(1);
      expect(entry.baselineData.pain).toBeLessThanOrEqual(8);
      expect(entry.baselineData.locations.length).toBeGreaterThanOrEqual(1);
      expect(entry.baselineData.symptoms.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('generates mood entries with valid scales', () => {
    const result = generateDecoySandbox({ minDays: 7, maxDays: 7 });

    for (const entry of result.moodEntries) {
      expect(entry.mood).toBeGreaterThanOrEqual(1);
      expect(entry.mood).toBeLessThanOrEqual(10);
      expect(entry.energy).toBeGreaterThanOrEqual(1);
      expect(entry.energy).toBeLessThanOrEqual(10);
    }
  });

  it('provides realistic variation in entries', () => {
    const result = generateDecoySandbox({ minDays: 30, maxDays: 30 });

    const painScores = new Set(result.entries.map(e => e.baselineData.pain));
    expect(painScores.size).toBeGreaterThan(1);
  });

  it('includes missing entries for organic realism', () => {
    const result = generateDecoySandbox({ minDays: 100, maxDays: 100 });

    // With 12% missing rate on 100 days, expect roughly 88 entries (±15%)
    expect(result.entries.length).toBeGreaterThanOrEqual(75);
    expect(result.entries.length).toBeLessThanOrEqual(100);
  });
});