import { describe, it, expect, beforeEach } from 'vitest';
import { usePainTrackerStore } from '@/stores/pain-tracker-store';

describe('DailyRitualService + Store Integration', () => {
  beforeEach(() => {
    // Reset store to initial state
    usePainTrackerStore.setState({
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

  it('should setup ritual and update store correctly', () => {
    const store = usePainTrackerStore.getState();
    
    // Setup ritual configuration
    store.setupRitual({
      ritualEnabled: true,
      ritualType: 'evening',
      morningTime: null,
      eveningTime: '21:00',
      ritualTone: 'gentle',
    });
    
    // Verify store updated
    const updated = usePainTrackerStore.getState();
    expect(updated.retention.dailyRitual.ritualEnabled).toBe(true);
    expect(updated.retention.dailyRitual.ritualType).toBe('evening');
    expect(updated.retention.dailyRitual.eveningTime).toBe('21:00');
    expect(updated.retention.dailyRitual.ritualTone).toBe('gentle');
  });

  it('should track ritual completion correctly', () => {
    const store = usePainTrackerStore.getState();
    
    // Setup and complete ritual
    store.setupRitual({
      ritualEnabled: true,
      ritualType: 'morning',
      morningTime: '08:00',
      eveningTime: null,
      ritualTone: 'encouraging',
    });
    
    store.completeRitual();
    
    // Verify completion tracked
    const updated = usePainTrackerStore.getState();
    expect(updated.retention.dailyRitual.completionCount).toBe(1);
    expect(updated.retention.dailyRitual.currentStreak).toBeGreaterThan(0);
    expect(updated.retention.dailyRitual.lastCompleted).toBeTruthy();
  });

  it('should maintain streak correctly', () => {
    const store = usePainTrackerStore.getState();
    
    // Setup ritual
    store.setupRitual({
      ritualEnabled: true,
      ritualType: 'both',
      morningTime: '08:00',
      eveningTime: '21:00',
      ritualTone: 'structured',
    });
    
    // Complete ritual multiple times
    store.completeRitual();
    let updated = usePainTrackerStore.getState();
    const firstStreak = updated.retention.dailyRitual.currentStreak;
    
    store.completeRitual();
    updated = usePainTrackerStore.getState();
    const secondStreak = updated.retention.dailyRitual.currentStreak;
    
    // Streak should increase or stay the same (depending on timing)
    expect(secondStreak).toBeGreaterThanOrEqual(firstStreak);
  });

  it('should apply template correctly', () => {
    const store = usePainTrackerStore.getState();
    
    // Apply morning template
    store.setupRitual({
      ritualEnabled: true,
      ritualType: 'morning',
      morningTime: '08:00',
      eveningTime: null,
      ritualTone: 'gentle',
    });
    
    const updated = usePainTrackerStore.getState();
    expect(updated.retention.dailyRitual.ritualType).toBe('morning');
    expect(updated.retention.dailyRitual.morningTime).toBe('08:00');
    expect(updated.retention.dailyRitual.eveningTime).toBeNull();
  });

  it('should handle multiple completions', () => {
    const store = usePainTrackerStore.getState();
    
    // Setup ritual
    store.setupRitual({
      ritualEnabled: true,
      ritualType: 'evening',
      morningTime: null,
      eveningTime: '21:00',
      ritualTone: 'minimal',
    });
    
    // Complete multiple times
    store.completeRitual();
    store.completeRitual();
    store.completeRitual();
    
    const updated = usePainTrackerStore.getState();
    expect(updated.retention.dailyRitual.completionCount).toBe(3);
  });

  it('should persist ritual configuration', () => {
    const store = usePainTrackerStore.getState();
    
    // Setup complex ritual
    store.setupRitual({
      ritualEnabled: true,
      ritualType: 'both',
      morningTime: '07:30',
      eveningTime: '22:00',
      ritualTone: 'encouraging',
    });
    
    // Verify all settings persisted
    const updated = usePainTrackerStore.getState();
    expect(updated.retention.dailyRitual.ritualEnabled).toBe(true);
    expect(updated.retention.dailyRitual.ritualType).toBe('both');
    expect(updated.retention.dailyRitual.morningTime).toBe('07:30');
    expect(updated.retention.dailyRitual.eveningTime).toBe('22:00');
    expect(updated.retention.dailyRitual.ritualTone).toBe('encouraging');
  });
});
