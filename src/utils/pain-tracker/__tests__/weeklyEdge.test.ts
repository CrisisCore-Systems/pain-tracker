import { buildDailySeries } from '../trending';
import { localDayStart } from '../../dates';
import type { PainEntry } from '../../../types';

describe('weekly edge cases', () => {
  it('buckets entries around local midnight into correct local days', () => {
    // Create timestamps: one before midnight, one after midnight
    const now = new Date();
    const beforeMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 30);
    const afterMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 30);

    // Derive the date keys that should be used by buildDailySeries
    const beforeMidnightKey = beforeMidnight.toISOString().split('T')[0];
    const afterMidnightKey = afterMidnight.toISOString().split('T')[0];

    // Create period covering both days
    const startKey = localDayStart(beforeMidnight).toISOString().slice(0, 10);
    const endKey = localDayStart(afterMidnight).toISOString().slice(0, 10);
    const period = { start: startKey, end: endKey };

    const entries: PainEntry[] = [
      {
        id: 1,
        timestamp: beforeMidnight.toISOString(),
        baselineData: { pain: 5, locations: [], symptoms: [] },
        functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
        medications: { current: [], changes: '', effectiveness: '' },
        treatments: { recent: [], effectiveness: '', planned: [] },
        qualityOfLife: { sleepQuality: 5, moodImpact: 5, socialImpact: [] },
        workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
        comparison: { worseningSince: '', newLimitations: [] },
        notes: '',
      },
      {
        id: 2,
        timestamp: afterMidnight.toISOString(),
        baselineData: { pain: 7, locations: [], symptoms: [] },
        functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
        medications: { current: [], changes: '', effectiveness: '' },
        treatments: { recent: [], effectiveness: '', planned: [] },
        qualityOfLife: { sleepQuality: 5, moodImpact: 5, socialImpact: [] },
        workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
        comparison: { worseningSince: '', newLimitations: [] },
        notes: '',
      },
    ];

    const series = buildDailySeries(entries, period);
    
    // Expect two days present and that their pains correspond to the entries
    expect(series.length).toBeGreaterThanOrEqual(2);
    
    const foundBefore = series.find(s => s.date === beforeMidnightKey);
    const foundAfter = series.find(s => s.date === afterMidnightKey);
    
    expect(foundBefore).toBeDefined();
    expect(foundAfter).toBeDefined();
    expect(foundBefore?.pain).toBe(5);
    expect(foundAfter?.pain).toBe(7);
  });
});
