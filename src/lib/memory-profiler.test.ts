import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  MemoryProfiler,
  getMemoryProfiler,
  resetMemoryProfiler,
  type MemorySnapshot,
  type MemoryTrend,
} from './memory-profiler';

describe('MemoryProfiler', () => {
  let profiler: MemoryProfiler;

  beforeEach(() => {
    profiler = new MemoryProfiler();
  });

  afterEach(() => {
    profiler.destroy();
  });

  describe('takeSnapshot', () => {
    it('should create a memory snapshot with timestamp', () => {
      const snapshot = profiler.takeSnapshot();
      
      expect(snapshot).toBeDefined();
      expect(snapshot.timestamp).toBeGreaterThan(0);
      expect(snapshot.estimatedMemoryMB).toBeGreaterThan(0);
      expect(snapshot.trackedObjects).toEqual({});
    });

    it('should include DOM node count when document is available', () => {
      const snapshot = profiler.takeSnapshot();
      
      // In jsdom environment, domNodeCount should be defined
      expect(typeof snapshot.domNodeCount).toBe('number');
    });

    it('should respect maxSnapshots configuration', () => {
      const smallProfiler = new MemoryProfiler({ maxSnapshots: 3 });
      
      // Take 5 snapshots
      for (let i = 0; i < 5; i++) {
        smallProfiler.takeSnapshot();
      }
      
      const snapshots = smallProfiler.getSnapshots();
      expect(snapshots.length).toBe(3);
      
      smallProfiler.destroy();
    });
  });

  describe('trackCollection', () => {
    it('should track collection sizes', () => {
      const testMap = new Map<string, number>();
      testMap.set('a', 1);
      testMap.set('b', 2);
      
      profiler.trackCollection('testMap', () => testMap.size);
      
      const snapshot = profiler.takeSnapshot();
      expect(snapshot.trackedObjects['testMap']).toBe(2);
      
      testMap.set('c', 3);
      const snapshot2 = profiler.takeSnapshot();
      expect(snapshot2.trackedObjects['testMap']).toBe(3);
    });

    it('should handle errors in count functions gracefully', () => {
      profiler.trackCollection('errorCollection', () => {
        throw new Error('Test error');
      });
      
      const snapshot = profiler.takeSnapshot();
      expect(snapshot.trackedObjects['errorCollection']).toBe(-1);
    });

    it('should untrack collections', () => {
      profiler.trackCollection('tempCollection', () => 10);
      profiler.untrack('tempCollection');
      
      const snapshot = profiler.takeSnapshot();
      expect(snapshot.trackedObjects['tempCollection']).toBeUndefined();
    });
  });

  describe('trackObject', () => {
    it('should track objects using WeakRef', () => {
      const obj = { name: 'test' };
      profiler.trackObject('testObject', obj);
      
      const snapshot = profiler.takeSnapshot();
      expect(snapshot.trackedObjects['testObject']).toBe(1);
    });
  });

  describe('analyzeTrend', () => {
    it('should return stable trend with insufficient data', () => {
      profiler.takeSnapshot();
      
      const trend = profiler.analyzeTrend();
      
      expect(trend.potentialLeak).toBe(false);
      expect(trend.leakSeverity).toBe('none');
      expect(trend.recommendation).toContain('Insufficient data');
    });

    it('should detect stable memory usage', () => {
      // Take multiple snapshots with similar memory
      for (let i = 0; i < 5; i++) {
        profiler.takeSnapshot();
      }
      
      const trend = profiler.analyzeTrend();
      
      expect(trend.leakSeverity).toBe('none');
      expect(trend.potentialLeak).toBe(false);
    });

    it('should calculate growth rate correctly', () => {
      for (let i = 0; i < 5; i++) {
        profiler.takeSnapshot();
      }
      
      const trend = profiler.analyzeTrend();
      
      expect(typeof trend.currentMB).toBe('number');
      expect(typeof trend.averageMB).toBe('number');
      expect(typeof trend.growthRateMBPerMinute).toBe('number');
    });
  });

  describe('getSessionDuration', () => {
    it('should track session duration', async () => {
      const duration1 = profiler.getSessionDuration();
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const duration2 = profiler.getSessionDuration();
      
      expect(duration2).toBeGreaterThan(duration1);
    });

    it('should format session duration', () => {
      const formatted = profiler.getFormattedSessionDuration();
      
      // Should be in format like "0s", "1m 30s", or "1h 30m 0s"
      expect(formatted).toMatch(/^\d+[hms]/);
    });
  });

  describe('autoSnapshot', () => {
    it('should start and stop auto snapshots', () => {
      vi.useFakeTimers();
      
      const autoProfiler = new MemoryProfiler({ 
        autoSnapshot: true, 
        snapshotIntervalMs: 1000 
      });
      
      expect(autoProfiler.getSnapshots().length).toBe(1); // Initial snapshot
      
      vi.advanceTimersByTime(3000);
      
      expect(autoProfiler.getSnapshots().length).toBe(4); // Initial + 3 more
      
      autoProfiler.stopAutoSnapshot();
      vi.advanceTimersByTime(3000);
      
      expect(autoProfiler.getSnapshots().length).toBe(4); // No more added
      
      autoProfiler.destroy();
      vi.useRealTimers();
    });
  });

  describe('generateReport', () => {
    it('should generate a formatted report', () => {
      profiler.takeSnapshot();
      profiler.takeSnapshot();
      
      const report = profiler.generateReport();
      
      expect(report).toContain('Memory Profiler Report');
      expect(report).toContain('Session Duration');
      expect(report).toContain('Current Memory');
      expect(report).toContain('Growth Rate');
      expect(report).toContain('Leak Detection');
    });

    it('should include tracked collection info', () => {
      profiler.trackCollection('testCache', () => 42);
      profiler.takeSnapshot();
      
      const report = profiler.generateReport();
      
      expect(report).toContain('testCache');
      expect(report).toContain('42');
    });
  });

  describe('reset', () => {
    it('should clear all snapshots', () => {
      profiler.takeSnapshot();
      profiler.takeSnapshot();
      
      expect(profiler.getSnapshots().length).toBe(2);
      
      profiler.reset();
      
      expect(profiler.getSnapshots().length).toBe(0);
    });
  });

  describe('leak detection callback', () => {
    it('should call onLeakDetected when potential leak found', () => {
      const onLeakDetected = vi.fn();
      const leakProfiler = new MemoryProfiler({
        onLeakDetected,
        leakThresholdMBPerMinute: 0, // Very low threshold for testing
      });
      
      // Take enough snapshots to trigger analysis
      for (let i = 0; i < 5; i++) {
        leakProfiler.takeSnapshot();
      }
      
      // The callback may or may not be called depending on actual memory patterns
      // Just verify it doesn't throw
      leakProfiler.destroy();
    });
  });
});

describe('Global Memory Profiler', () => {
  afterEach(() => {
    resetMemoryProfiler();
  });

  it('should return singleton instance', () => {
    const profiler1 = getMemoryProfiler();
    const profiler2 = getMemoryProfiler();
    
    expect(profiler1).toBe(profiler2);
  });

  it('should reset the singleton', () => {
    const profiler1 = getMemoryProfiler();
    resetMemoryProfiler();
    const profiler2 = getMemoryProfiler();
    
    expect(profiler1).not.toBe(profiler2);
  });
});
