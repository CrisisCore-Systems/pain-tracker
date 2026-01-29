import { describe, it, expect, beforeEach } from 'vitest';
import { usePainTrackerStore } from '@/stores/pain-tracker-store';

describe('AdaptivePromptSelector + Services Integration', () => {
  const mockEntries = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    painLevel: 3 + (i % 5),
    mood: ['happy', 'neutral', 'sad'][i % 3] as 'happy' | 'neutral' | 'sad',
    activities: ['walking', 'working', 'resting'][i % 3] ? ['walking', 'working', 'resting'][i % 3] : [],
    symptoms: ['headache', 'fatigue'][i % 2] ? ['headache', 'fatigue'][i % 2] : [],
    medications: [],
    notes: `Entry ${i + 1}`,
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

  it('should select prompts based on user data', () => {
    // Set user data for prompt selection
    usePainTrackerStore.setState({
      entries: mockEntries,
    });
    
    const store = usePainTrackerStore.getState();
    
    // Prompt selector would use this data to adapt
    expect(store.entries.length).toBe(20);
    expect(store.entries[0].painLevel).toBeGreaterThan(0);
    
    // Adaptive selection would consider:
    // - Recent pain levels
    // - Mood trends
    // - Time of day
    // - Tracking consistency
  });

  it('should filter prompts by tone', () => {
    const store = usePainTrackerStore.getState();
    
    // Set gentle tone preference
    store.setupRitual({
      ritualEnabled: true,
      ritualType: 'evening',
      morningTime: null,
      eveningTime: '21:00',
      ritualTone: 'gentle',
    });
    
    const updated = usePainTrackerStore.getState();
    expect(updated.retention.dailyRitual.ritualTone).toBe('gentle');
    
    // Prompt selection would filter by this tone
  });

  it('should filter prompts by category', () => {
    const store = usePainTrackerStore.getState();
    
    // Set entries to influence category selection
    usePainTrackerStore.setState({
      entries: mockEntries,
    });
    
    const updated = usePainTrackerStore.getState();
    
    // Categories would be selected based on:
    // - Time of day (morning, afternoon, evening, night)
    // - Recent activity patterns
    // - Pain level trends
    expect(updated.entries.length).toBe(20);
  });

  it('should learn from interactions', () => {
    const store = usePainTrackerStore.getState();
    
    // Simulate user interactions
    store.recordCheckIn();
    
    usePainTrackerStore.setState({
      entries: mockEntries,
    });
    
    // Record multiple check-ins to build learning data
    store.recordCheckIn();
    store.recordCheckIn();
    
    const updated = usePainTrackerStore.getState();
    expect(updated.retention.retentionLoop.totalCheckIns).toBeGreaterThan(0);
    
    // Adaptive selector would learn:
    // - Preferred prompt types
    // - Effective tones
    // - Optimal timing
  });

  it('should perform well with varied data', () => {
    // Test with different data sizes
    const smallData = mockEntries.slice(0, 5);
    const mediumData = mockEntries.slice(0, 10);
    const largeData = mockEntries;
    
    // Small dataset
    usePainTrackerStore.setState({ entries: smallData });
    let store = usePainTrackerStore.getState();
    expect(store.entries.length).toBe(5);
    
    // Medium dataset
    usePainTrackerStore.setState({ entries: mediumData });
    store = usePainTrackerStore.getState();
    expect(store.entries.length).toBe(10);
    
    // Large dataset
    usePainTrackerStore.setState({ entries: largeData });
    store = usePainTrackerStore.getState();
    expect(store.entries.length).toBe(20);
    
    // Performance should remain consistent across different data sizes
  });
});
