import { buildDailySeries } from '../trending';
import { localDayStart } from '../../dates';
import type { PainEntry } from '../../../types';

describe('weekly edge cases', () => {
  it('buckets entries around local midnight into correct local days', () => {
    // Simulate two entries: one at 23:50 local yesterday, one at 00:10 local today
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayLate = new Date(todayStart.getTime() - 10 * 60 * 1000); // 23:50 yesterday
    const todayEarly = new Date(todayStart.getTime() + 10 * 60 * 1000); // 00:10 today

    const now = new Date();
    const beforeMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 30);
    const afterMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 30);

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
    const yesterdayKey = yesterdayLate.toISOString().split('T')[0];
    const todayKey = todayEarly.toISOString().split('T')[0];
    const foundYesterday = series.find(s => s.date === yesterdayKey);
    const foundToday = series.find(s => s.date === todayKey);
    expect(foundYesterday).toBeDefined();
    expect(foundToday).toBeDefined();
  });
});
