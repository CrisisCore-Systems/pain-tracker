import { describe, it, expect } from 'vitest';
import { loadPainEntries } from '../utils/pain-tracker/storage';

// Helper to set raw localStorage value
function setRaw(val: string) { localStorage.setItem('pain_tracker_entries', val); }

describe('storage parse & invalid structure errors', () => {
  it('PARSE_ERROR on malformed JSON', async () => {
    setRaw('{ not valid');
    await expect(loadPainEntries()).rejects.toMatchObject({ code: 'PARSE_ERROR' });
  });

  it('PARSE_ERROR on invalid structure array contents', async () => {
    setRaw(JSON.stringify([{ bad: 'shape' }]));
    await expect(loadPainEntries()).rejects.toMatchObject({ code: 'PARSE_ERROR' });
  });
});
