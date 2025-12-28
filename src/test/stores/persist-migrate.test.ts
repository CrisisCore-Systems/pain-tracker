import { describe, it, expect, beforeEach } from 'vitest';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

describe('Persist rehydrate + migrate', () => {
  beforeEach(() => {
    localStorage.clear();

    // Reset in-memory store state between tests.
    usePainTrackerStore.getState().clearAllData();
    // Ensure we don't leave behind any persisted state from the reset above.
    usePainTrackerStore.persist.clearStorage();
  });

  it('does not brick startup when persisted JSON is corrupted', async () => {
    // Simulate a user/device scenario where localStorage contains invalid JSON
    localStorage.setItem('pain-tracker-storage', '{ this is not valid json');

    await usePainTrackerStore.persist.rehydrate();

    // Should initialize with default state rather than throwing.
    const state = usePainTrackerStore.getState();
    expect(state).toBeDefined();
    expect(Array.isArray(state.entries)).toBe(true);
    expect(Array.isArray(state.moodEntries)).toBe(true);
  }, 10000); // Increased timeout slightly to be safe

  it('rehydrates store from legacy state and runs migration to add ids and timestamps', async () => {
    // Prepare a legacy persisted state (version 1) with moodEntries with no id
    const legacy = {
      version: 1,
      state: {
        moodEntries: [
          {
            timestamp: new Date().toISOString(),
            mood: 6,
            energy: 5,
            anxiety: 3,
            stress: 4,
            hopefulness: 6,
            selfEfficacy: 5,
            emotionalClarity: 6,
            emotionalRegulation: 6,
            context: 'rehydrate',
            triggers: [],
            copingStrategies: [],
            socialSupport: 'none',
            notes: 'legacy persisted entry',
          },
        ],
      },
    };

    localStorage.setItem('pain-tracker-storage', JSON.stringify(legacy));

    await usePainTrackerStore.persist.rehydrate();
    const state = usePainTrackerStore.getState();
    expect(state.moodEntries.length).toBe(1);
    const entry = state.moodEntries[0];
    expect(typeof entry.id).toBe('number');
    expect(typeof entry.timestamp).toBe('string');
  }, 30000);

  it('migrates entries, activityLogs and scheduledReports', async () => {
    const legacy = {
      version: 1,
      state: {
        entries: [
          {
            timestamp: new Date().toISOString(),
            baselineData: { pain: 4, locations: ['back'], symptoms: [] },
            functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
            medications: { current: [], changes: '', effectiveness: '' },
            treatments: { recent: [], effectiveness: '', planned: [] },
            qualityOfLife: { sleepQuality: 5, moodImpact: 4, socialImpact: [] },
            workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
            comparison: { worseningSince: '', newLimitations: [] },
            notes: 'legacy pain entry',
          },
        ],
        activityLogs: [
          {
            date: new Date().toISOString(),
            activities: [
              { timestamp: new Date().toISOString(), type: 'walk', duration: 10, painLevel: 2, description: 'test', impact: 'No Effect', triggers: [] },
            ],
            dailyNotes: '',
            overallPainLevel: 3,
            restQuality: 5,
            stressLevel: 4,
          },
        ],
        scheduledReports: [
          { templateId: 'tmpl', name: 'SR', frequency: 'daily', recipients: ['a@b.com'], nextRun: new Date().toISOString(), isActive: true } ,
        ],
      }
    };
    localStorage.setItem('pain-tracker-storage', JSON.stringify(legacy));

    await usePainTrackerStore.persist.rehydrate();
    const state = usePainTrackerStore.getState();

    // Entries migration
    expect(state.entries.length).toBe(1);
    expect(typeof state.entries[0].id).toBe('number');
    expect(typeof state.entries[0].timestamp).toBe('string');

    // Activity logs migration
    expect(state.activityLogs.length).toBe(1);
    expect(typeof state.activityLogs[0].id).toBe('number');
    expect(typeof state.activityLogs[0].date).toBe('string');
    expect(typeof state.activityLogs[0].activities[0].timestamp).toBe('string');

    // Scheduled reports migration
    expect(state.scheduledReports.length).toBe(1);
    expect(typeof state.scheduledReports[0].id).toBe('string');
    expect(typeof state.scheduledReports[0].nextRun).toBe('string');
  }, 30000);
});
