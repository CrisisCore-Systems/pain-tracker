/**
 * @fileoverview Adaptive Tone Engine
 *
 * Determines patient state, selects appropriate copy variations,
 * and tracks tone effectiveness metrics.
 */

import type {
  PatientState,
  CopyIntent,
  ToneContext,
  TonePreferences,
  AdaptiveCopy,
  ProgressInsight,
  ToneMeasurement,
} from '../types/tone';
import { STATE_THRESHOLDS } from '../types/tone';
import type { PainEntry } from '../types/pain-tracker';

/**
 * Adaptive Tone Engine
 *
 * Core responsibilities:
 * 1. Detect patient state from pain data
 * 2. Select appropriate copy variation
 * 3. Track tone effectiveness
 */
export class ToneEngine {
  private measurements: ToneMeasurement[] = [];

  /**
   * Detect patient state from recent pain entries
   */
  detectState(entries: PainEntry[], timeSinceFlare?: number): PatientState {
    if (entries.length === 0) {
      return 'stable';
    }

    // Sort by timestamp (most recent first)
    const sorted = [...entries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const mostRecent = sorted[0];
    const currentPain = mostRecent.baselineData?.pain ?? mostRecent.intensity ?? 0;

    // FLARE: High pain level
    if (currentPain >= STATE_THRESHOLDS.flarePainLevel) {
      return 'flare';
    }

    // RECOVERY: Within 24h of flare
    if (timeSinceFlare !== undefined && timeSinceFlare < STATE_THRESHOLDS.recoveryHours) {
      return 'recovery';
    }

    // Compare to previous entry
    if (sorted.length >= 2) {
      const previous = sorted[1];
      const previousPain = previous.baselineData?.pain ?? previous.intensity ?? 0;
      const painChange = currentPain - previousPain;

      // RISING: Significant increase
      if (painChange >= STATE_THRESHOLDS.risingPainIncrease) {
        return 'rising';
      }
    }

    // STABLE: Default
    return 'stable';
  }

  /**
   * Calculate pain trend from entries
   */
  calculatePainTrend(entries: PainEntry[]) {
    if (entries.length < 2) {
      return undefined;
    }

    const sorted = [...entries].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const current = sorted[0].baselineData?.pain ?? sorted[0].intensity ?? 0;
    const previous = sorted[1].baselineData?.pain ?? sorted[1].intensity ?? 0;
    const diff = current - previous;

    return {
      current,
      previous,
      direction:
        diff > 0.5 ? ('up' as const) : diff < -0.5 ? ('down' as const) : ('stable' as const),
    };
  }

  /**
   * Build tone context from patient data
   */
  buildContext(
    entries: PainEntry[],
    preferences: TonePreferences,
    options?: {
      timeSinceFlare?: number;
      sleepQuality?: 'poor' | 'fair' | 'good';
    }
  ): ToneContext {
    return {
      state: this.detectState(entries, options?.timeSinceFlare),
      preferences,
      painTrend: this.calculatePainTrend(entries),
      timeSinceFlare: options?.timeSinceFlare,
      sleepQuality: options?.sleepQuality,
    };
  }

  /**
   * Select copy variation based on context
   */
  selectCopy(copy: AdaptiveCopy, context: ToneContext): string {
    // 1. State-specific variation (highest priority)
    if (copy.states) {
      const stateVariation = copy.states[context.state];
      if (stateVariation) {
        return stateVariation;
      }
    }

    // 2. Warmth variation
    if (copy.warmth && context.preferences.warmth === 1) {
      return copy.warmth.warm;
    }

    // 3. Medical terminology
    if (copy.medical && context.preferences.medicalTerms) {
      return copy.medical.withTerms;
    }

    // 4. Base copy
    return copy.base;
  }

  /**
   * Generate progress insight with confidence
   */
  generateInsight(entries: PainEntry[], days: number = 14): ProgressInsight | null {
    if (entries.length < 2) {
      return null;
    }

    // Filter to date range
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const recent = entries.filter(e => new Date(e.timestamp) >= cutoff);

    if (recent.length < 2) {
      return null;
    }

    // Calculate average pain
    const avg =
      recent.reduce((sum, e) => sum + (e.baselineData?.pain ?? e.intensity ?? 0), 0) /
      recent.length;

    // Compare to previous period
    const previousCutoff = new Date(cutoff);
    previousCutoff.setDate(previousCutoff.getDate() - days);
    const previous = entries.filter(
      e => new Date(e.timestamp) >= previousCutoff && new Date(e.timestamp) < cutoff
    );

    if (previous.length < 2) {
      return {
        summary: `Last ${days} days: average pain ${avg.toFixed(1)}.`,
        confidence: 'low',
      };
    }

    const prevAvg =
      previous.reduce((sum, e) => sum + (e.baselineData?.pain ?? e.intensity ?? 0), 0) /
      previous.length;
    const change = avg - prevAvg;
    const direction = change > 0 ? '↑' : '↓';
    const absChange = Math.abs(change);

    // Determine confidence based on data points and consistency
    const confidence: 'low' | 'medium' | 'high' =
      recent.length >= 10 ? 'high' : recent.length >= 5 ? 'medium' : 'low';

    // Build summary
    const summary = `Last ${days} days: average pain ${prevAvg.toFixed(1)} → ${avg.toFixed(1)} (${direction}${absChange.toFixed(1)}).`;

    // Identify likely factors (simplified - would use more sophisticated analysis)
    const factors: string[] = [];

    // Check for sleep correlation (if we had sleep data)
    // Check for activity correlation
    // Check for time-of-day patterns

    return {
      summary,
      factors: factors.length > 0 ? factors : undefined,
      confidence,
    };
  }

  /**
   * Track tone effectiveness measurement
   */
  trackMeasurement(measurement: ToneMeasurement): void {
    this.measurements.push(measurement);

    // Persist to storage (IndexedDB)
    this.persistMeasurement(measurement);
  }

  /**
   * Get acceptance rate for a specific intent/state combination
   */
  getAcceptanceRate(intent: CopyIntent, state?: PatientState): number | undefined {
    const relevant = this.measurements.filter(
      m =>
        m.metric === 'prompt_acceptance' &&
        m.context.intent === intent &&
        (!state || m.context.state === state)
    );

    if (relevant.length === 0) {
      return undefined;
    }

    const sum = relevant.reduce((acc, m) => acc + m.value, 0);
    return sum / relevant.length;
  }

  /**
   * Get average time to calm in panic mode
   */
  getAverageTimeToCalm(): number | undefined {
    const relevant = this.measurements.filter(m => m.metric === 'time_to_calm');

    if (relevant.length === 0) {
      return undefined;
    }

    const sum = relevant.reduce((acc, m) => acc + m.value, 0);
    return sum / relevant.length;
  }

  /**
   * Persist measurement to storage
   */
  private async persistMeasurement(measurement: ToneMeasurement): Promise<void> {
    try {
      // Store in IndexedDB under 'tone-measurements' store
      const db = await this.openDatabase();
      const tx = db.transaction('tone-measurements', 'readwrite');
      const store = tx.objectStore('tone-measurements');
      await store.add(measurement);
    } catch (error) {
      console.error('Failed to persist tone measurement:', error);
    }
  }

  /**
   * Open IndexedDB for measurements
   */
  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('pain-tracker-tone', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('tone-measurements')) {
          db.createObjectStore('tone-measurements', {
            keyPath: 'timestamp',
            autoIncrement: true,
          });
        }
      };
    });
  }

  /**
   * Load measurements from storage
   */
  async loadMeasurements(): Promise<void> {
    try {
      const db = await this.openDatabase();
      const tx = db.transaction('tone-measurements', 'readonly');
      const store = tx.objectStore('tone-measurements');
      const request = store.getAll();

      request.onsuccess = () => {
        this.measurements = request.result;
      };
    } catch (error) {
      console.error('Failed to load tone measurements:', error);
    }
  }
}

/**
 * Singleton instance
 */
export const toneEngine = new ToneEngine();

/**
 * Initialize tone engine (call on app start)
 */
export async function initializeToneEngine(): Promise<void> {
  await toneEngine.loadMeasurements();
}
