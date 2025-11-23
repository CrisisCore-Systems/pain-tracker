import { describe, it, expect, beforeEach } from 'vitest';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import type { MoodEntry } from '../../types/quantified-empathy';

describe('PainTrackerStore MoodEntry operations', () => {
  beforeEach(() => {
    const store = usePainTrackerStore.getState();
    store.clearAllData();
  });

  it('adds a mood entry with id and timestamp (string)', () => {
    const store = usePainTrackerStore.getState();
    store.addMoodEntry({
      mood: 7,
      energy: 6,
      anxiety: 3,
      stress: 4,
      hopefulness: 6,
      selfEfficacy: 6,
      emotionalClarity: 5,
      emotionalRegulation: 6,
      context: 'test',
      triggers: [],
      copingStrategies: [],
      socialSupport: 'moderate',
      notes: 'add test',
    });

    const state = usePainTrackerStore.getState();
    expect(state.moodEntries.length).toBe(1);
    const entry = state.moodEntries[0];
    expect(typeof entry.id).toBe('number');
    expect(typeof entry.timestamp).toBe('string');
    expect(entry.mood).toBe(7);
  });

  it('updates a mood entry by id', () => {
    const store = usePainTrackerStore.getState();
    store.addMoodEntry({
      mood: 7,
      energy: 6,
      anxiety: 3,
      stress: 4,
      hopefulness: 6,
      selfEfficacy: 6,
      emotionalClarity: 5,
      emotionalRegulation: 6,
      context: 'test',
      triggers: [],
      copingStrategies: [],
      socialSupport: 'moderate',
      notes: 'update test',
    });

    const state = usePainTrackerStore.getState();
    const entry = state.moodEntries[0];
  store.updateMoodEntry(entry.id, { mood: 9 });
    const updated = usePainTrackerStore.getState().moodEntries.find(e => e.id === entry.id);
    expect(updated).toBeDefined();
    expect(updated!.mood).toBe(9);
  });

  it('deletes a mood entry by id', () => {
    const store = usePainTrackerStore.getState();
    store.addMoodEntry({
      mood: 5,
      energy: 5,
      anxiety: 5,
      stress: 5,
      hopefulness: 5,
      selfEfficacy: 5,
      emotionalClarity: 5,
      emotionalRegulation: 5,
      context: 'test',
      triggers: [],
      copingStrategies: [],
      socialSupport: 'none',
      notes: 'delete test',
    });
    const state = usePainTrackerStore.getState();
    const entry = state.moodEntries[0];
  store.deleteMoodEntry(entry.id);
    const found = usePainTrackerStore.getState().moodEntries.find(e => e.id === entry.id);
    expect(found).toBeUndefined();
  });

  it('updates and deletes a mood entry by timestamp string', () => {
    const store = usePainTrackerStore.getState();
    store.addMoodEntry({
      mood: 7,
      energy: 6,
      anxiety: 3,
      stress: 4,
      hopefulness: 6,
      selfEfficacy: 6,
      emotionalClarity: 5,
      emotionalRegulation: 6,
      context: 'test',
      triggers: [],
      copingStrategies: [],
      socialSupport: 'moderate',
      notes: 'timestamp test',
    });

    const state = usePainTrackerStore.getState();
    const entry = state.moodEntries[0];
    // Update via timestamp
    store.updateMoodEntry(entry.timestamp, { mood: 8 });
    const updated = usePainTrackerStore.getState().moodEntries.find(e => e.id === entry.id);
    expect(updated!.mood).toBe(8);

    // Delete via timestamp
    store.deleteMoodEntry(entry.timestamp);
    const found = usePainTrackerStore.getState().moodEntries.find(e => e.id === entry.id);
    expect(found).toBeUndefined();
  });
});
