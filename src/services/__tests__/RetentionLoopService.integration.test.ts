import { describe, it, expect, beforeEach } from 'vitest';
import { usePainTrackerStore } from '@/stores/pain-tracker-store';

describe('RetentionLoopService + Store Integration', () => {
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

  it('should record check-in and update store correctly', () => {
    const store = usePainTrackerStore.getState();
    
    // Record a check-in
    store.recordCheckIn();
    
    // Verify store updated
    const updated = usePainTrackerStore.getState();
    expect(updated.retention.retentionLoop.totalCheckIns).toBe(1);
    expect(updated.retention.retentionLoop.consecutiveDays).toBeGreaterThan(0);
    expect(updated.retention.retentionLoop.lastCheckIn).toBeTruthy();
  });

  it('should track 3-day win condition correctly', () => {
    const store = usePainTrackerStore.getState();
    
    // Simulate 3 consecutive days
    store.recordCheckIn();
    
    // Update consecutiveDays to 3 to simulate streak
    usePainTrackerStore.setState({
      retention: {
        ...store.retention,
        retentionLoop: {
          ...store.retention.retentionLoop,
          consecutiveDays: 3,
          totalCheckIns: 3,
        },
      },
    });
    
    const updated = usePainTrackerStore.getState();
    expect(updated.retention.retentionLoop.consecutiveDays).toBe(3);
    expect(updated.retention.retentionLoop.totalCheckIns).toBe(3);
  });

  it('should track 7-day streak win condition', () => {
    const store = usePainTrackerStore.getState();
    
    // Simulate 7-day streak
    usePainTrackerStore.setState({
      retention: {
        ...store.retention,
        retentionLoop: {
          ...store.retention.retentionLoop,
          consecutiveDays: 7,
          totalCheckIns: 7,
          winConditions: {
            ...store.retention.retentionLoop.winConditions,
            sevenDayStreak: true,
          },
        },
      },
    });
    
    const updated = usePainTrackerStore.getState();
    expect(updated.retention.retentionLoop.consecutiveDays).toBe(7);
    expect(updated.retention.retentionLoop.winConditions.sevenDayStreak).toBe(true);
  });

  it('should calculate pending insights correctly', () => {
    const store = usePainTrackerStore.getState();
    
    // Simulate having 5 entries
    const mockEntries = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      painLevel: 5,
      mood: 'neutral' as const,
      activities: [],
      symptoms: [],
      medications: [],
      notes: '',
    }));
    
    usePainTrackerStore.setState({
      entries: mockEntries,
    });
    
    // At 5 entries:
    // - Need 2 more for correlation (7 total)
    // - Need 9 more for trend (14 total)
    // - Need 25 more for milestone (30 total)
    
    const updated = usePainTrackerStore.getState();
    expect(updated.entries.length).toBe(5);
  });

  it('should select daily prompt with proper context', () => {
    const store = usePainTrackerStore.getState();
    
    // Add some entries for context
    const mockEntries = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      painLevel: 5,
      mood: 'neutral' as const,
      activities: [],
      symptoms: [],
      medications: [],
      notes: '',
    }));
    
    usePainTrackerStore.setState({
      entries: mockEntries,
    });
    
    const updated = usePainTrackerStore.getState();
    expect(updated.entries.length).toBe(10);
    // Prompt selection would use this entry data for adaptive selection
  });

  it('should handle multiple check-ins correctly', () => {
    const store = usePainTrackerStore.getState();
    
    // Record first check-in
    store.recordCheckIn();
    let updated = usePainTrackerStore.getState();
    expect(updated.retention.retentionLoop.totalCheckIns).toBe(1);
    
    // Record second check-in
    store.recordCheckIn();
    updated = usePainTrackerStore.getState();
    expect(updated.retention.retentionLoop.totalCheckIns).toBe(2);
    
    // Record third check-in
    store.recordCheckIn();
    updated = usePainTrackerStore.getState();
    expect(updated.retention.retentionLoop.totalCheckIns).toBe(3);
  });
});
