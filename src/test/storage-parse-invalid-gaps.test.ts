import { describe, it, expect, beforeEach } from 'vitest';
import { loadPainEntries } from '../utils/pain-tracker/storage';
import { usePainTrackerStore } from '../stores/pain-tracker-store';

// Helper to set raw localStorage value
function setRaw(val: string) {
  localStorage.setItem('pain_tracker_entries', val);
}

describe('storage parse & invalid structure errors', () => {
  beforeEach(() => {
    usePainTrackerStore.setState(s => ({ ...s, entries: [] }));
    localStorage.removeItem('pain_tracker_entries');
  });

  it('PARSE_ERROR on malformed JSON', async () => {
    setRaw('{ not valid');
    // Legacy localStorage content should not be parsed anymore.
    await expect(loadPainEntries()).resolves.toEqual([]);
  });

  it('PARSE_ERROR on invalid structure array contents', async () => {
    // Exercise store-backed validation rather than localStorage parsing.
    usePainTrackerStore.setState(s => ({ ...s, entries: [{ bad: 'shape' }] as never[] }));
    await expect(loadPainEntries()).rejects.toMatchObject({ code: 'PARSE_ERROR' });
  });
});
