import { describe, it, expect } from 'vitest';
import { savePainEntry, loadPainEntries, clearPainEntries } from '../utils/pain-tracker/storage';
import type { PainEntry } from '../types';

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
  notes: 'test'
};

describe('storage util error paths', () => {
  it('handles quota exceeded error', async () => {
    const proto = Object.getPrototypeOf(window.localStorage);
    const original = proto.setItem;
    proto.setItem = function() { 
      const err = new Error('Quota exceeded');
      (err as Error & { name: string }).name = 'QuotaExceededError';
      throw err; 
    } as Storage['setItem'];
    await expect(savePainEntry(sampleEntry)).rejects.toMatchObject({ code: 'STORAGE_FULL' });
    // restore
    proto.setItem = original;
  });

  it('loadPainEntries returns [] when nothing stored', async () => {
    await clearPainEntries();
    const entries = await loadPainEntries();
    expect(entries).toEqual([]);
  });
});
