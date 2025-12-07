/**
 * Memory Profiler for Long-Running Sessions
 *
 * Provides utilities for monitoring memory usage, detecting leaks,
 * and tracking cache sizes in the Pain Tracker application.
 *
 * @module lib/memory-profiler
 */

/** Memory snapshot with timestamp */
export interface MemorySnapshot {
  timestamp: number;
  /** Total JS heap size in bytes (if available) */
  totalJSHeapSize?: number;
  /** Used JS heap size in bytes (if available) */
  usedJSHeapSize?: number;
  /** JS heap size limit in bytes (if available) */
  jsHeapSizeLimit?: number;
  /** Estimated memory from performance.memory or fallback */
  estimatedMemoryMB: number;
  /** Custom tracked objects */
  trackedObjects: Record<string, number>;
  /** DOM node count */
  domNodeCount?: number;
}

/** Memory trend analysis result */
export interface MemoryTrend {
  /** Current memory usage in MB */
  currentMB: number;
  /** Average memory usage over sample period in MB */
  averageMB: number;
  /** Memory growth rate in MB per minute */
  growthRateMBPerMinute: number;
  /** Whether a potential leak is detected */
  potentialLeak: boolean;
  /** Leak severity: none, low, medium, high */
  leakSeverity: 'none' | 'low' | 'medium' | 'high';
  /** Recommended action */
  recommendation: string;
}

/** Configuration for memory profiler */
export interface MemoryProfilerConfig {
  /** Maximum snapshots to retain (default: 60) */
  maxSnapshots: number;
  /** Snapshot interval in milliseconds (default: 60000 = 1 minute) */
  snapshotIntervalMs: number;
  /** Memory growth threshold to flag as potential leak (MB/min, default: 5) */
  leakThresholdMBPerMinute: number;
  /** Enable automatic snapshots (default: false) */
  autoSnapshot: boolean;
  /** Callback when potential leak detected */
  onLeakDetected?: (trend: MemoryTrend) => void;
}

const DEFAULT_CONFIG: MemoryProfilerConfig = {
  maxSnapshots: 60,
  snapshotIntervalMs: 60 * 1000, // 1 minute
  leakThresholdMBPerMinute: 5,
  autoSnapshot: false,
};

/**
 * Memory Profiler class for monitoring application memory
 */
export class MemoryProfiler {
  private config: MemoryProfilerConfig;
  private snapshots: MemorySnapshot[] = [];
  private trackedObjects: Map<string, WeakRef<object>> = new Map();
  private trackedCounts: Map<string, () => number> = new Map();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private startTime: number = Date.now();

  constructor(config?: Partial<MemoryProfilerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    if (this.config.autoSnapshot) {
      this.startAutoSnapshot();
    }
  }

  /**
   * Take a memory snapshot
   */
  takeSnapshot(): MemorySnapshot {
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      estimatedMemoryMB: this.getEstimatedMemoryMB(),
      trackedObjects: this.getTrackedObjectCounts(),
    };

    // Try to get detailed memory info (Chrome only)
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as Performance & { memory?: {
        totalJSHeapSize: number;
        usedJSHeapSize: number;
        jsHeapSizeLimit: number;
      }}).memory;
      if (memory) {
        snapshot.totalJSHeapSize = memory.totalJSHeapSize;
        snapshot.usedJSHeapSize = memory.usedJSHeapSize;
        snapshot.jsHeapSizeLimit = memory.jsHeapSizeLimit;
        snapshot.estimatedMemoryMB = memory.usedJSHeapSize / (1024 * 1024);
      }
    }

    // Count DOM nodes if available
    if (typeof document !== 'undefined') {
      snapshot.domNodeCount = document.querySelectorAll('*').length;
    }

    this.snapshots.push(snapshot);

    // Trim old snapshots
    while (this.snapshots.length > this.config.maxSnapshots) {
      this.snapshots.shift();
    }

    // Check for leaks
    const trend = this.analyzeTrend();
    if (trend.potentialLeak && this.config.onLeakDetected) {
      this.config.onLeakDetected(trend);
    }

    return snapshot;
  }

  /**
   * Register an object for tracking (uses WeakRef)
   * @param name - Identifier for the tracked object
   * @param obj - Object to track (will be weakly referenced)
   */
  trackObject(name: string, obj: object): void {
    this.trackedObjects.set(name, new WeakRef(obj));
  }

  /**
   * Register a count function for a collection
   * @param name - Identifier for the collection
   * @param countFn - Function that returns the current count
   */
  trackCollection(name: string, countFn: () => number): void {
    this.trackedCounts.set(name, countFn);
  }

  /**
   * Untrack an object or collection
   */
  untrack(name: string): void {
    this.trackedObjects.delete(name);
    this.trackedCounts.delete(name);
  }

  /**
   * Get counts of all tracked objects
   */
  private getTrackedObjectCounts(): Record<string, number> {
    const counts: Record<string, number> = {};

    // Check WeakRef objects (1 if still alive, 0 if collected)
    this.trackedObjects.forEach((ref, name) => {
      counts[name] = ref.deref() !== undefined ? 1 : 0;
    });

    // Get collection counts
    this.trackedCounts.forEach((countFn, name) => {
      try {
        counts[name] = countFn();
      } catch {
        counts[name] = -1; // Error getting count
      }
    });

    return counts;
  }

  /**
   * Estimate memory usage (fallback when performance.memory unavailable)
   */
  private getEstimatedMemoryMB(): number {
    // This is a rough estimate based on tracked object counts
    // In practice, performance.memory is used when available
    let estimate = 10; // Base overhead estimate

    this.trackedCounts.forEach((countFn) => {
      try {
        // Assume ~1KB per tracked item average
        estimate += (countFn() * 1) / 1024;
      } catch {
        // Ignore errors
      }
    });

    return estimate;
  }

  /**
   * Analyze memory trend from snapshots
   */
  analyzeTrend(): MemoryTrend {
    const current = this.snapshots[this.snapshots.length - 1];
    
    if (this.snapshots.length < 2) {
      return {
        currentMB: current?.estimatedMemoryMB ?? 0,
        averageMB: current?.estimatedMemoryMB ?? 0,
        growthRateMBPerMinute: 0,
        potentialLeak: false,
        leakSeverity: 'none',
        recommendation: 'Insufficient data for trend analysis. Continue monitoring.',
      };
    }

    // Calculate average
    const sum = this.snapshots.reduce((acc, s) => acc + s.estimatedMemoryMB, 0);
    const average = sum / this.snapshots.length;

    // Calculate growth rate using linear regression
    const { slope } = this.calculateLinearRegression();
    const growthRatePerMs = slope;
    const growthRateMBPerMinute = growthRatePerMs * 60 * 1000;

    // Determine leak severity
    let leakSeverity: 'none' | 'low' | 'medium' | 'high' = 'none';
    let potentialLeak = false;
    let recommendation = 'Memory usage is stable.';

    if (growthRateMBPerMinute > this.config.leakThresholdMBPerMinute * 3) {
      leakSeverity = 'high';
      potentialLeak = true;
      recommendation = 'Critical memory growth detected! Consider refreshing the page or clearing caches immediately.';
    } else if (growthRateMBPerMinute > this.config.leakThresholdMBPerMinute * 2) {
      leakSeverity = 'medium';
      potentialLeak = true;
      recommendation = 'Significant memory growth detected. Monitor closely and consider clearing caches.';
    } else if (growthRateMBPerMinute > this.config.leakThresholdMBPerMinute) {
      leakSeverity = 'low';
      potentialLeak = true;
      recommendation = 'Slight memory growth detected. Continue monitoring.';
    }

    return {
      currentMB: current.estimatedMemoryMB,
      averageMB: average,
      growthRateMBPerMinute,
      potentialLeak,
      leakSeverity,
      recommendation,
    };
  }

  /**
   * Simple linear regression on memory snapshots
   */
  private calculateLinearRegression(): { slope: number; intercept: number } {
    const n = this.snapshots.length;
    if (n < 2) return { slope: 0, intercept: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const baseTime = this.snapshots[0].timestamp;

    this.snapshots.forEach((snapshot) => {
      const x = snapshot.timestamp - baseTime;
      const y = snapshot.estimatedMemoryMB;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) return { slope: 0, intercept: sumY / n };

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  /**
   * Get all snapshots
   */
  getSnapshots(): readonly MemorySnapshot[] {
    return this.snapshots;
  }

  /**
   * Get session duration in milliseconds
   */
  getSessionDuration(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Get formatted session duration
   */
  getFormattedSessionDuration(): string {
    const ms = this.getSessionDuration();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Start automatic snapshots
   */
  startAutoSnapshot(): void {
    if (this.intervalId) return;

    // Take initial snapshot
    this.takeSnapshot();

    this.intervalId = setInterval(() => {
      this.takeSnapshot();
    }, this.config.snapshotIntervalMs);

    // Unref in Node.js to not block exit
    if (typeof this.intervalId === 'object' && 'unref' in this.intervalId) {
      this.intervalId.unref();
    }
  }

  /**
   * Stop automatic snapshots
   */
  stopAutoSnapshot(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Clear all snapshots and reset
   */
  reset(): void {
    this.snapshots = [];
    this.startTime = Date.now();
  }

  /**
   * Generate a summary report
   */
  generateReport(): string {
    const trend = this.analyzeTrend();
    const duration = this.getFormattedSessionDuration();
    const latestSnapshot = this.snapshots[this.snapshots.length - 1];

    let report = `
=== Memory Profiler Report ===
Session Duration: ${duration}
Snapshots Collected: ${this.snapshots.length}

Current Memory: ${trend.currentMB.toFixed(2)} MB
Average Memory: ${trend.averageMB.toFixed(2)} MB
Growth Rate: ${trend.growthRateMBPerMinute.toFixed(3)} MB/min

Leak Detection: ${trend.potentialLeak ? '⚠️ POTENTIAL LEAK' : '✅ OK'}
Severity: ${trend.leakSeverity}
Recommendation: ${trend.recommendation}
`;

    if (latestSnapshot?.domNodeCount !== undefined) {
      report += `\nDOM Nodes: ${latestSnapshot.domNodeCount}`;
    }

    if (latestSnapshot?.trackedObjects && Object.keys(latestSnapshot.trackedObjects).length > 0) {
      report += '\n\nTracked Collections:';
      Object.entries(latestSnapshot.trackedObjects).forEach(([name, count]) => {
        report += `\n  ${name}: ${count}`;
      });
    }

    return report;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopAutoSnapshot();
    this.snapshots = [];
    this.trackedObjects.clear();
    this.trackedCounts.clear();
  }
}

// Singleton instance for app-wide memory profiling
let globalProfiler: MemoryProfiler | null = null;

/**
 * Get the global memory profiler instance
 */
export function getMemoryProfiler(config?: Partial<MemoryProfilerConfig>): MemoryProfiler {
  if (!globalProfiler) {
    globalProfiler = new MemoryProfiler(config);
  }
  return globalProfiler;
}

/**
 * Reset the global memory profiler
 */
export function resetMemoryProfiler(): void {
  if (globalProfiler) {
    globalProfiler.destroy();
    globalProfiler = null;
  }
}
