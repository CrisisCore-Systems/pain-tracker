import { describe, it, expect } from 'vitest';
import { savePainEntry, loadPainEntries, clearPainEntries } from '../utils/pain-tracker/storage';
import type { PainEntry } from '../types';
import { usePainTrackerStore } from '../stores/pain-tracker-store';

const sampleEntry: PainEntry = {
  id: 999,
  timestamp: new Date().toISOString(),
  baselineData: { pain: 3, locations: ['back'], symptoms: ['ache'] },
  functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
  medications: { current: [], changes: '', effectiveness: '' },
  treatments: { recent: [], effectiveness: '', planned: [] },
  qualityOfLife: { sleepQuality: 6, moodImpact: 4, socialImpact: [] },
  workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
  comparison: { worseningSince: '', newLimitations: [] },
  notes: 'test',
};

describe('storage util error paths', () => {
  it('wraps unexpected store write errors as WRITE_ERROR', async () => {
    const originalSetState = usePainTrackerStore.setState;
    usePainTrackerStore.setState = (() => {
      throw new Error('Simulated store failure');
    }) as unknown as typeof usePainTrackerStore.setState;

    await expect(savePainEntry(sampleEntry)).rejects.toMatchObject({ code: 'WRITE_ERROR' });

    usePainTrackerStore.setState = originalSetState;
  });

  it('loadPainEntries returns [] when nothing stored', async () => {
    await clearPainEntries();
    const entries = await loadPainEntries();
    expect(entries).toEqual([]);
  });
});
