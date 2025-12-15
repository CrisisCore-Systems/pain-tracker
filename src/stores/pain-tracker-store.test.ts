import { beforeEach, describe, expect, it } from 'vitest';
import { usePainTrackerStore } from './pain-tracker-store';

describe('pain-tracker-store addEntry', () => {
  beforeEach(() => {
    // Reset persisted state between tests
    usePainTrackerStore.persist?.clearStorage?.();
    usePainTrackerStore.setState({ entries: [], error: null, isLoading: false });
  });

  it('preserves extended datapoints like weather and triggers', () => {
    const entryData = {
      baselineData: { pain: 6, locations: ['Shoulder'], symptoms: ['Ache'] },
      functionalImpact: {
        limitedActivities: ['Lifting'],
        assistanceNeeded: ['Grip aid'],
        mobilityAids: [],
      },
      medications: {
        current: [
          { name: 'Ibuprofen', dosage: '200mg', frequency: 'Once daily', effectiveness: 'Helps' },
        ],
        changes: 'No changes',
        effectiveness: 'Moderate relief',
      },
      treatments: {
        recent: [
          { type: 'Physiotherapy', provider: 'Rehab Clinic', date: '2024-01-01', effectiveness: 'Good' },
        ],
        effectiveness: 'Ongoing',
        planned: ['Stretching program'],
      },
      qualityOfLife: { sleepQuality: 6, moodImpact: 4, socialImpact: ['Avoiding sports'] },
      workImpact: { missedWork: 1, modifiedDuties: ['Desk work'], workLimitations: ['No lifting'] },
      comparison: { worseningSince: 'Cold snap', newLimitations: ['Limited reach'] },
      notes: 'Full data entry for persistence test',
      triggers: ['weather', 'stress'],
      intensity: 6,
      location: 'Shoulder',
      quality: ['sharp', 'burning'],
      reliefMethods: ['ice', 'rest'],
      activityLevel: 3,
      weather: '5°C, Rainy, 80% humidity',
      sleep: 6,
      mood: 4,
      stress: 7,
      activities: ['walking', 'typing'],
    };

    usePainTrackerStore.getState().addEntry(entryData);
    const saved = usePainTrackerStore.getState().entries[0];

    expect(saved.weather).toBe(entryData.weather);
    expect(saved.triggers).toEqual(entryData.triggers);
    expect(saved.activities).toEqual(entryData.activities);
    expect(saved.quality).toEqual(entryData.quality);
    expect(saved.reliefMethods).toEqual(entryData.reliefMethods);
    expect(saved.activityLevel).toBe(entryData.activityLevel);
    expect(saved.intensity).toBe(entryData.intensity);
    expect(saved.location).toBe(entryData.location);
    expect(saved.sleep).toBe(entryData.sleep);
    expect(saved.mood).toBe(entryData.mood);
    expect(saved.stress).toBe(entryData.stress);
  });
});
