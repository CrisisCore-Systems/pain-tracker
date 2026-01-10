import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
  const originalGetState = usePainTrackerStore.getState;
  const originalSetState = usePainTrackerStore.setState;

  // persist is optional; keep a handle so we can restore it.
  const originalPersist = (usePainTrackerStore as unknown as { persist?: unknown }).persist;

  beforeEach(() => {
    // Reset store entries between tests to reduce cross-test coupling.
    usePainTrackerStore.setState(s => ({ ...s, entries: [] }));
  });

  afterEach(() => {
    usePainTrackerStore.getState = originalGetState;
    usePainTrackerStore.setState = originalSetState;
    (usePainTrackerStore as unknown as { persist?: unknown }).persist = originalPersist;
    vi.restoreAllMocks();
  });

  it('wraps unexpected store write errors as WRITE_ERROR', async () => {
    usePainTrackerStore.setState = (() => {
      throw new Error('Simulated store failure');
    }) as unknown as typeof usePainTrackerStore.setState;

    await expect(savePainEntry(sampleEntry)).rejects.toMatchObject({ code: 'WRITE_ERROR' });

    // restored in afterEach
  });

  it('updates an existing entry using updateEntry', async () => {
    const updateEntry = vi.fn();
    usePainTrackerStore.getState = (() => ({
      entries: [sampleEntry],
      updateEntry,
    })) as unknown as typeof usePainTrackerStore.getState;

    usePainTrackerStore.setState = vi.fn() as unknown as typeof usePainTrackerStore.setState;

    const updated: PainEntry = {
      ...sampleEntry,
      baselineData: { ...sampleEntry.baselineData, pain: 9 },
    };
    await expect(savePainEntry(updated)).resolves.toBeUndefined();
    expect(updateEntry).toHaveBeenCalledWith(updated.id, updated);
    expect(usePainTrackerStore.setState).not.toHaveBeenCalled();
  });

  it('adds a new entry using setState when entry id is not found', async () => {
    usePainTrackerStore.getState = (() => ({
      entries: [],
      updateEntry: vi.fn(),
    })) as unknown as typeof usePainTrackerStore.getState;

    const setState = vi.fn();
    usePainTrackerStore.setState = setState as unknown as typeof usePainTrackerStore.setState;

    await expect(savePainEntry(sampleEntry)).resolves.toBeUndefined();
    expect(setState).toHaveBeenCalledTimes(1);
  });

  it('loadPainEntries returns [] when nothing stored', async () => {
    await clearPainEntries();
    const entries = await loadPainEntries();
    expect(entries).toEqual([]);
  });

  it('loadPainEntries throws PARSE_ERROR when stored entries are invalid', async () => {
    usePainTrackerStore.setState(s => ({ ...s, entries: [{ id: 1 } as unknown as PainEntry] }));
    await expect(loadPainEntries()).rejects.toMatchObject({ code: 'PARSE_ERROR' });
  });

  it('loadPainEntries ignores persist rehydrate failures and returns in-memory entries', async () => {
    (usePainTrackerStore as unknown as { persist?: { rehydrate?: () => Promise<void> } }).persist = {
      rehydrate: async () => {
        throw new Error('rehydrate failed');
      },
    };

    usePainTrackerStore.setState(s => ({ ...s, entries: [sampleEntry] }));
    await expect(loadPainEntries()).resolves.toEqual([sampleEntry]);
  });

  it('loadPainEntries wraps unexpected failures as NOT_FOUND', async () => {
    usePainTrackerStore.getState = (() => {
      throw new Error('unexpected');
    }) as unknown as typeof usePainTrackerStore.getState;

    await expect(loadPainEntries()).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('clearPainEntries throws WRITE_ERROR when store write fails', async () => {
    usePainTrackerStore.setState = (() => {
      throw new Error('Simulated clear failure');
    }) as unknown as typeof usePainTrackerStore.setState;

    await expect(clearPainEntries()).rejects.toMatchObject({ code: 'WRITE_ERROR' });
  });
});
