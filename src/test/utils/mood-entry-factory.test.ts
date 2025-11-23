import { describe, it, expect } from 'vitest';
import { makeMoodEntry } from '../../utils/mood-entry-factory';

describe('makeMoodEntry factory', () => {
  it('creates a MoodEntry with id, timestamp string and defaults', () => {
    const e = makeMoodEntry({ mood: 7, notes: 'test' });
    expect(typeof e.id).toBe('number');
    expect(typeof e.timestamp).toBe('string');
    expect(e.mood).toBe(7);
    expect(e.notes).toBe('test');
  });
});
