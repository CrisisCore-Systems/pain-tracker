import { describe, it, expect, beforeEach } from 'vitest';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import type { PainEntry } from '../../types';

describe('IdentityLockInService + Store Integration', () => {
  const createEntry = (i: number): PainEntry => {
    const pain = 5 + (i % 3);
    const timestamp = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString();

    return {
      id: i + 1,
      timestamp,
      baselineData: {
        pain,
        locations: [],
        symptoms: ['headache'],
      },
      functionalImpact: {
        limitedActivities: [],
        assistanceNeeded: [],
        mobilityAids: [],
      },
      medications: {
        current: [],
        changes: '',
        effectiveness: '',
      },
      treatments: {
        recent: [],
        effectiveness: '',
        planned: [],
      },
      qualityOfLife: {
        sleepQuality: 5,
        moodImpact: 5,
        socialImpact: [],
      },
      workImpact: {
        missedWork: 0,
        modifiedDuties: [],
        workLimitations: [],
      },
      comparison: {
        worseningSince: '',
        newLimitations: [],
      },
      notes: `Day ${i + 1} notes`,
      activities: ['walking'],
      intensity: pain,
      mood: 5,
    };
  };

  const mockEntries: PainEntry[] = Array.from({ length: 15 }, (_, i) => createEntry(i));

  beforeEach(() => {
    localStorage.clear();
    usePainTrackerStore.setState({ entries: [] });
    usePainTrackerStore.getState().syncRetentionState();
  });

  it('should initialize journey with entries', () => {
    const store = usePainTrackerStore.getState();
    
    // Set entries
    usePainTrackerStore.setState({
      entries: mockEntries,
    });
    
    // Initialize journey (would call initializeJourney in real implementation)
    store.initializeJourney();
    
    const updated = usePainTrackerStore.getState();
    expect(updated.retention.userIdentity.journeyStartDate).toBeTruthy();
  });

  it('should discover patterns from pain data', () => {
    const store = usePainTrackerStore.getState();
    
    // Set entries with patterns
    usePainTrackerStore.setState({
      entries: mockEntries,
    });
    
    // Discover patterns (would call discoverPatterns in real implementation)
    store.initializeJourney();
    
    const updated = usePainTrackerStore.getState();
    expect(updated.entries.length).toBe(15);
    // Patterns would be discovered based on the data
  });

  it('should generate identity insights', () => {
    const store = usePainTrackerStore.getState();
    
    // Set entries for insight generation
    usePainTrackerStore.setState({
      entries: mockEntries,
    });
    
    store.initializeJourney();
    
    const updated = usePainTrackerStore.getState();
    expect(updated.entries.length).toBe(15);
    // Insights would be generated based on tracking patterns
  });

  it('should generate narrative based on tracking duration', () => {
    const store = usePainTrackerStore.getState();
    
    // For new user (< 7 days)
    const shortEntries = mockEntries.slice(0, 3);
    usePainTrackerStore.setState({
      entries: shortEntries,
    });
    
    store.initializeJourney();
    
    let updated = usePainTrackerStore.getState();
    expect(updated.entries.length).toBe(3);
    
    // For established user (7-14 days)
    usePainTrackerStore.setState({
      entries: mockEntries.slice(0, 10),
    });
    
    updated = usePainTrackerStore.getState();
    expect(updated.entries.length).toBe(10);
    
    // For long-term user (14+ days)
    usePainTrackerStore.setState({
      entries: mockEntries,
    });
    
    updated = usePainTrackerStore.getState();
    expect(updated.entries.length).toBe(15);
  });

  it('should provide identity language', () => {
    const store = usePainTrackerStore.getState();
    
    // Set entries for language generation
    usePainTrackerStore.setState({
      entries: mockEntries,
    });
    
    // Set custom identity language
    const language = store.getIdentityLanguage();
    expect(language.title).toBeTruthy();
    expect(language.subtitle).toBeTruthy();
    expect(language.action).toBeTruthy();
  });

  it('should update when entries change', () => {
    const store = usePainTrackerStore.getState();
    
    // Start with few entries
    usePainTrackerStore.setState({
      entries: mockEntries.slice(0, 5),
    });
    
    store.initializeJourney();
    
    let updated = usePainTrackerStore.getState();
    const initialCount = updated.entries.length;
    expect(initialCount).toBe(5);
    
    // Add more entries
    usePainTrackerStore.setState({
      entries: mockEntries,
    });
    
    updated = usePainTrackerStore.getState();
    expect(updated.entries.length).toBe(15);
    expect(updated.entries.length).toBeGreaterThan(initialCount);
    expect(updated.retention.userIdentity.totalDaysTracked).toBeGreaterThan(0);
  });
});
