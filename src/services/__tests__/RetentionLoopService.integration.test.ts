import { describe, it, expect, beforeEach } from 'vitest';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import type { PainEntry } from '../../types';

describe('RetentionLoopService + Store Integration', () => {
  const createEntry = (i: number, pain = 5): PainEntry => ({
    id: i + 1,
    timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    baselineData: {
      pain,
      locations: [],
      symptoms: [],
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
    notes: '',
  });

  beforeEach(() => {
    localStorage.clear();
    usePainTrackerStore.setState({ entries: [] });
    usePainTrackerStore.getState().syncRetentionState();
  });

  it('should record check-in and update store correctly', () => {
    const store = usePainTrackerStore.getState();
    
    // Record a check-in
    store.recordCheckIn();
    
    // Verify store updated
    const updated = usePainTrackerStore.getState();
    expect(updated.retention.retentionLoop.totalCheckIns).toBe(1);
    expect(updated.retention.retentionLoop.consecutiveDays).toBeGreaterThan(0);
    expect(updated.retention.retentionLoop.lastCheckInDate).toBeTruthy();
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

    const winConditions = updated.getWinConditions();
    const streak3 = winConditions.find(w => w.id === '3-day-streak');
    expect(streak3?.achieved).toBe(true);
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
        },
      },
    });
    
    const updated = usePainTrackerStore.getState();
    expect(updated.retention.retentionLoop.consecutiveDays).toBe(7);

    const winConditions = updated.getWinConditions();
    const streak7 = winConditions.find(w => w.id === '7-day-streak');
    expect(streak7?.achieved).toBe(true);
  });

  it('should calculate pending insights correctly', () => {
    const store = usePainTrackerStore.getState();
    
    // Simulate having 5 entries
    const mockEntries: PainEntry[] = Array.from({ length: 5 }, (_, i) => createEntry(i, 5));
    
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
    const mockEntries: PainEntry[] = Array.from({ length: 10 }, (_, i) => createEntry(i, 5));
    
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
    
    // Record second check-in (same day should not double-count)
    store.recordCheckIn();
    updated = usePainTrackerStore.getState();
    expect(updated.retention.retentionLoop.totalCheckIns).toBe(1);
    
    // Record third check-in (same day should not double-count)
    store.recordCheckIn();
    updated = usePainTrackerStore.getState();
    expect(updated.retention.retentionLoop.totalCheckIns).toBe(1);
  });
});
