import { describe, it, expect } from 'vitest';
import { aggregatePainData } from '../utils/pain-tracker/calculations';
import type { PainEntry } from '../types';

function makeEntry(id: number, pain: number, iso: string, extra?: Partial<PainEntry>): PainEntry {
  return {
    id,
    timestamp: iso,
    baselineData: { pain, locations: ['back','back'], symptoms: ['ache','tight'], ...(extra?.baselineData||{}) },
    functionalImpact: { limitedActivities: ['walk','lift','walk'], assistanceNeeded: [], mobilityAids: ['cane','cane'], ...(extra?.functionalImpact||{}) },
    medications: { current: [], changes: '', effectiveness: '' },
    treatments: { recent: [], effectiveness: '', planned: [] },
    qualityOfLife: { sleepQuality: 6, moodImpact: 4, socialImpact: [] },
    workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
    comparison: { worseningSince: '', newLimitations: [] },
    notes: 'n'
  };
}

describe('aggregatePainData advanced branches', () => {
  it('computes trend improving/worsening/stable and time analysis', () => {
    const base = new Date();
    const entries: PainEntry[] = [
      makeEntry(1, 8, new Date(base.getTime()-1000*60*60*24*3).toISOString()),
      makeEntry(2, 7, new Date(base.getTime()-1000*60*60*24*2).toISOString()),
      makeEntry(3, 6, new Date(base.getTime()-1000*60*60*24*1).toISOString())
    ];
    const aggImproving = aggregatePainData(entries);
    expect(aggImproving.painTrend).toBe('improving');

    // Build worsening sequence (pain increases over chronological time)
    const worseningEntries: PainEntry[] = [
      makeEntry(10, 2, new Date(base.getTime()-1000*60*60*24*3).toISOString()),
      makeEntry(11, 4, new Date(base.getTime()-1000*60*60*24*2).toISOString()),
      makeEntry(12, 7, new Date(base.getTime()-1000*60*60*24*1).toISOString())
    ];
    const aggWorsening = aggregatePainData(worseningEntries);
    expect(aggWorsening.painTrend).toBe('worsening');

    const stableEntries = entries.map((e,i)=> makeEntry(100+i, 5, e.timestamp));
    const aggStable = aggregatePainData(stableEntries);
    expect(aggStable.painTrend).toBe('stable');

    // worst/best time presence
    expect(aggImproving.timeAnalysis.worstTime).not.toBeNull();
    expect(aggImproving.timeAnalysis.bestTime).not.toBeNull();

    // frequency aggregation
    expect(aggImproving.commonLocations[0].location).toBe('back');
    expect(aggImproving.functionalImpactSummary.mostLimitedActivities[0]).toBe('walk');
    expect(aggImproving.functionalImpactSummary.commonMobilityAids[0]).toBe('cane');
  });
});
