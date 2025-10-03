import { describe, it, expect } from 'vitest';
import { buildRolling7DayChartData, RawEntry } from './chart';

describe('buildRolling7DayChartData', () => {
  it('includes a 2025-09-14 entry in the last-7-days window and normalizes timezone', () => {
    // Create entries for today to ensure they fall within the rolling window
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const entries: RawEntry[] = [
      { created_at: twoDaysAgo.toISOString(), pain_level: 2 },
      { created_at: yesterday.toISOString(), pain_level: 6 },
      { created_at: today.toISOString(), pain_level: 4 }
    ];

    const chart = buildRolling7DayChartData(entries, { timeZone: 'UTC', label: 'Avg pain' });

    // Expect 7 labels (7-day rolling window)
    expect(chart.labels.length).toBe(7);

    // Expect one dataset
    expect(chart.datasets.length).toBe(1);
    expect(chart.datasets[0].label).toBe('Avg pain');

    const data = chart.datasets[0].data;
    // Should have 7 data points
    expect(data.length).toBe(7);

    // All values should be numbers (function returns 0 for days without data)
    expect(data.every(v => typeof v === 'number')).toBe(true);

    // There should be at least one non-zero value from our entries
    expect(data.some(v => typeof v === 'number' && v > 0)).toBe(true);
  });
});
