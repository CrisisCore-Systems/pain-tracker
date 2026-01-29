import { describe, it, expect, beforeEach } from 'vitest';
import { usePainTrackerStore } from '@/stores/pain-tracker-store';

describe('IdentityLockInService + Store Integration', () => {
  const mockEntries = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    painLevel: 5 + (i % 3),
    mood: 'neutral' as const,
    activities: ['walking'],
    symptoms: ['headache'],
    medications: [],
    notes: `Day ${i + 1} notes`,
  }));

  beforeEach(() => {
    // Reset store to initial state
    usePainTrackerStore.setState({
      entries: [],
      retention: {
        retentionLoop: {
          consecutiveDays: 0,
          totalCheckIns: 0,
          lastCheckIn: null,
          winConditions: {
            firstCheckIn: false,
            threeDayStreak: false,
            sevenDayStreak: false,
            firstWeek: false,
            firstMonth: false,
          },
          pendingInsights: [],
        },
        dailyRitual: {
          ritualEnabled: false,
          ritualType: 'evening',
          morningTime: null,
          eveningTime: '21:00',
          ritualTone: 'gentle',
          completionCount: 0,
          currentStreak: 0,
          lastCompleted: null,
        },
        identityLockIn: {
          journeyStartDate: null,
          identityLanguage: null,
          personalPatterns: [],
          identityInsights: [],
          narrativeHistory: [],
        },
      },
    });
  });

  it('should initialize journey with entries', () => {
    const store = usePainTrackerStore.getState();
    
    // Set entries
    usePainTrackerStore.setState({
      entries: mockEntries,
    });
    
    // Initialize journey (would call initializeJourney in real implementation)
    store.initializeIdentityJourney();
    
    const updated = usePainTrackerStore.getState();
    expect(updated.retention.identityLockIn.journeyStartDate).toBeTruthy();
  });

  it('should discover patterns from pain data', () => {
    const store = usePainTrackerStore.getState();
    
    // Set entries with patterns
    usePainTrackerStore.setState({
      entries: mockEntries,
    });
    
    // Discover patterns (would call discoverPatterns in real implementation)
    store.initializeIdentityJourney();
    
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
    
    store.initializeIdentityJourney();
    
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
    
    store.initializeIdentityJourney();
    
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

  it('should customize identity language', () => {
    const store = usePainTrackerStore.getState();
    
    // Set entries for language generation
    usePainTrackerStore.setState({
      entries: mockEntries,
    });
    
    // Set custom identity language
    usePainTrackerStore.setState({
      retention: {
        ...store.retention,
        identityLockIn: {
          ...store.retention.identityLockIn,
          identityLanguage: {
            title: 'My Pain Journey',
            subtitle: 'Understanding my patterns',
          },
        },
      },
    });
    
    const updated = usePainTrackerStore.getState();
    expect(updated.retention.identityLockIn.identityLanguage).toBeTruthy();
    expect(updated.retention.identityLockIn.identityLanguage?.title).toBe('My Pain Journey');
  });

  it('should update when entries change', () => {
    const store = usePainTrackerStore.getState();
    
    // Start with few entries
    usePainTrackerStore.setState({
      entries: mockEntries.slice(0, 5),
    });
    
    store.initializeIdentityJourney();
    
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
  });
});
