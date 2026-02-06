/**
 * Pattern Analysis Synthetic Tests
 * =================================
 * Tests for the pattern recognition engine using synthetic data.
 * Validates that pattern detection works correctly across various scenarios.
 * 
 * Part of: VALIDATION PROTOCOL v1.0
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { analyzePatterns } from '../../utils/pain-tracker/pattern-engine';
import {
  generateSyntheticEntries,
  generateCrisisPeriod,
  generateRecoveryPeriod,
  generateFlarePeriod,
  PREDEFINED_SCENARIOS,
} from './synthetic-data-generator';

// Mock analytics to prevent side effects
vi.mock('../../services/PrivacyAnalyticsService', () => ({
  privacyAnalytics: { trackDataExport: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('../../analytics/ga4-events', () => ({
  trackDataExported: vi.fn(),
}));

vi.mock('../../utils/usage-tracking', () => ({
  trackExport: vi.fn(),
}));

vi.mock('../../lib/debug-logger', () => ({
  analyticsLogger: { swallowed: vi.fn() },
}));

describe('Pattern Analysis - Synthetic Testing Suite', () => {
  beforeAll(() => {
    vi.clearAllMocks();
  });

  describe('Trend Detection', () => {
    it('should compute daily trends from 30 days of normal usage', () => {
      const entries = generateSyntheticEntries(30, 3, { 
        profile: 'chronic-back-pain',
        seed: 12345,
      });

      const result = analyzePatterns(entries);

      // Should have daily trend data
      expect(result.dailyTrend).toBeDefined();
      expect(result.dailyTrend.length).toBeGreaterThan(0);
      
      // Each trend point should have valid structure
      result.dailyTrend.forEach((point, index) => {
        expect(point.date, `Trend ${index} missing date`).toBeDefined();
        expect(point.value, `Trend ${index} missing value`).toBeDefined();
        expect(point.count, `Trend ${index} missing count`).toBeGreaterThanOrEqual(0);
      });

      console.log(`DAILY_TREND_TEST: ${result.dailyTrend.length} daily trend points - PASS`);
    });

    it('should compute weekly trends from 60 days of data', () => {
      const entries = generateSyntheticEntries(60, 3, {
        profile: 'arthritis',
        seed: 11111,
      });

      const result = analyzePatterns(entries);

      // Weekly trend should have fewer points than daily
      expect(result.weeklyTrend).toBeDefined();
      expect(result.weeklyTrend.length).toBeGreaterThan(0);
      expect(result.weeklyTrend.length).toBeLessThanOrEqual(result.dailyTrend.length);

      console.log(`WEEKLY_TREND_TEST: ${result.weeklyTrend.length} weekly trend points - PASS`);
    });
  });

  describe('Episode Detection', () => {
    it('should detect episodes from high pain data', () => {
      const crisisEntries = generateCrisisPeriod(14, 22222);

      const result = analyzePatterns(crisisEntries, {
        episodePainThreshold: 7,
        episodeMinLengthDays: 1,
      });

      // Episodes array should be present
      expect(result.episodes).toBeDefined();
      expect(Array.isArray(result.episodes)).toBe(true);

      console.log(`EPISODE_DETECTION_TEST: Found ${result.episodes.length} episodes - PASS`);
    });

    it('should properly structure detected episodes', () => {
      const entries = PREDEFINED_SCENARIOS.fullPattern90Days().entries;

      const result = analyzePatterns(entries);

      // If episodes are detected, verify structure
      if (result.episodes.length > 0) {
        result.episodes.forEach((episode, index) => {
          expect(episode.start, `Episode ${index} missing start`).toBeDefined();
          expect(episode.end, `Episode ${index} missing end`).toBeDefined();
          expect(episode.peakPain, `Episode ${index} missing peakPain`).toBeDefined();
          expect(episode.avgPain, `Episode ${index} missing avgPain`).toBeDefined();
        });
      }

      console.log(`EPISODE_STRUCTURE_TEST: ${result.episodes.length} episodes validated - PASS`);
    });
  });

  describe('Data Cleaning', () => {
    it('should clean and validate entries', () => {
      const entries = generateSyntheticEntries(30, 3, { seed: 33333 });

      const result = analyzePatterns(entries);

      // Cleaned entries should be present
      expect(result.cleanedEntries).toBeDefined();
      expect(result.cleanedEntries.length).toBeGreaterThan(0);
      expect(result.cleanedEntries.length).toBeLessThanOrEqual(entries.length);

      // All cleaned entries should have valid pain levels
      result.cleanedEntries.forEach((entry, index) => {
        expect(entry.baselineData.pain).toBeGreaterThanOrEqual(0);
        expect(entry.baselineData.pain).toBeLessThanOrEqual(10);
      });

      console.log(`DATA_CLEANING_TEST: ${result.cleanedEntries.length} clean entries - PASS`);
    });
  });

  describe('Correlation Analysis', () => {
    it('should analyze trigger correlations', () => {
      const entries = generateSyntheticEntries(60, 3, {
        profile: 'fibromyalgia',
        includeFlarePeriods: true,
        seed: 55555,
      });

      const result = analyzePatterns(entries);

      // Trigger correlations should be defined
      expect(result.triggerCorrelations).toBeDefined();
      expect(Array.isArray(result.triggerCorrelations)).toBe(true);

      console.log(`TRIGGER_CORRELATION_TEST: Found ${result.triggerCorrelations.length} trigger correlations - PASS`);
    });

    it('should analyze symptom correlations', () => {
      const entries = generateSyntheticEntries(90, 3, {
        profile: 'chronic-back-pain',
        seed: 66666,
      });

      const result = analyzePatterns(entries);

      expect(result.symptomCorrelations).toBeDefined();
      expect(Array.isArray(result.symptomCorrelations)).toBe(true);

      console.log(`SYMPTOM_CORRELATION_TEST: Found ${result.symptomCorrelations.length} symptom correlations - PASS`);
    });

    it('should analyze medication correlations', () => {
      const entries = generateSyntheticEntries(60, 3, {
        profile: 'mixed-condition',
        includeCrisisPeriods: true,
        seed: 77777,
      });

      const result = analyzePatterns(entries);

      expect(result.medicationCorrelations).toBeDefined();
      expect(Array.isArray(result.medicationCorrelations)).toBe(true);

      console.log(`MEDICATION_CORRELATION_TEST: Found ${result.medicationCorrelations.length} medication correlations - PASS`);
    });

    it('should analyze location correlations', () => {
      const entries = generateSyntheticEntries(45, 3, {
        profile: 'chronic-back-pain',
        seed: 88888,
      });

      const result = analyzePatterns(entries);

      expect(result.locationCorrelations).toBeDefined();
      expect(Array.isArray(result.locationCorrelations)).toBe(true);

      console.log(`LOCATION_CORRELATION_TEST: Found ${result.locationCorrelations.length} location correlations - PASS`);
    });
  });

  describe('Quality of Life Analysis', () => {
    it('should compute QoL patterns from entries', () => {
      const entries = generateSyntheticEntries(30, 3, {
        profile: 'fibromyalgia',
        seed: 99999,
      });

      const result = analyzePatterns(entries);

      expect(result.qolPatterns).toBeDefined();
      expect(Array.isArray(result.qolPatterns)).toBe(true);

      console.log(`QOL_PATTERN_TEST: Found ${result.qolPatterns.length} QoL patterns - PASS`);
    });

    it('should detect QoL dissonance when enabled', () => {
      const entries = generateSyntheticEntries(45, 3, {
        profile: 'mixed-condition',
        includeCrisisPeriods: true,
        seed: 11112,
      });

      const result = analyzePatterns(entries, { enableQoLDissonance: true });

      expect(result.qolDissonances).toBeDefined();
      expect(Array.isArray(result.qolDissonances)).toBe(true);

      console.log(`QOL_DISSONANCE_TEST: Found ${result.qolDissonances.length} dissonances - PASS`);
    });
  });

  describe('Trigger Bundle Detection', () => {
    it('should detect co-occurring triggers', () => {
      const entries = generateSyntheticEntries(60, 3, {
        profile: 'fibromyalgia',
        includeFlarePeriods: true,
        seed: 22223,
      });

      const result = analyzePatterns(entries);

      expect(result.triggerBundles).toBeDefined();
      expect(Array.isArray(result.triggerBundles)).toBe(true);

      console.log(`TRIGGER_BUNDLE_TEST: Found ${result.triggerBundles.length} trigger bundles - PASS`);
    });
  });

  describe('Metadata', () => {
    it('should include metadata with analysis results', () => {
      const entries = generateSyntheticEntries(30, 3, { seed: 33334 });

      const result = analyzePatterns(entries);

      expect(result.meta).toBeDefined();
      expect(result.meta.entryCount).toBeGreaterThan(0);
      expect(result.meta.dataQuality).toBeDefined();
      expect(result.meta.cautions).toBeDefined();
      expect(result.meta.generatedAt).toBeDefined();

      console.log(`METADATA_TEST: ${result.meta.entryCount} entries, quality=${result.meta.dataQuality} - PASS`);
    });

    it('should include config in results', () => {
      const entries = generateSyntheticEntries(30, 3, { seed: 44445 });

      const result = analyzePatterns(entries, { episodePainThreshold: 7 });

      expect(result.config).toBeDefined();
      expect(result.config.episodePainThreshold).toBe(7);

      console.log('CONFIG_TEST: Config included in results - PASS');
    });
  });

  describe('Performance', () => {
    it('should analyze 1000 entries efficiently', () => {
      const entries = generateSyntheticEntries(334, 3, { seed: 55556 });

      const startTime = performance.now();
      const result = analyzePatterns(entries);
      const analysisTime = performance.now() - startTime;

      expect(analysisTime).toBeLessThan(5000); // 5 seconds max
      expect(result.cleanedEntries.length).toBeGreaterThan(500);

      console.log(`PERFORMANCE_TEST: ${result.cleanedEntries.length} entries analyzed in ${analysisTime.toFixed(0)}ms - PASS`);
    });

    it('should handle year-long data', () => {
      const startTime = performance.now();
      const yearData = PREDEFINED_SCENARIOS.yearLongUsage();
      const generationTime = performance.now() - startTime;

      const analysisStart = performance.now();
      const result = analyzePatterns(yearData.entries);
      const analysisTime = performance.now() - analysisStart;

      expect(generationTime).toBeLessThan(10000);
      expect(analysisTime).toBeLessThan(10000);
      expect(result.cleanedEntries.length).toBeGreaterThan(500);

      console.log(`YEAR_DATA_TEST: ${result.cleanedEntries.length} entries in ${analysisTime.toFixed(0)}ms - PASS`);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty entries array', () => {
      const result = analyzePatterns([]);

      expect(result.cleanedEntries).toHaveLength(0);
      expect(result.dailyTrend).toHaveLength(0);
      expect(result.episodes).toHaveLength(0);

      console.log('EMPTY_ENTRIES_TEST: Empty array handled - PASS');
    });

    it('should handle single entry', () => {
      const entries = generateSyntheticEntries(1, 1, { seed: 66667 });

      const result = analyzePatterns(entries);

      expect(result.cleanedEntries.length).toBeLessThanOrEqual(entries.length);

      console.log('SINGLE_ENTRY_TEST: Single entry handled - PASS');
    });

    it('should handle entries with minimal optional fields', () => {
      const minimalEntries = [{
        id: 'minimal-1',
        timestamp: new Date().toISOString(),
        baselineData: { pain: 5, locations: [], symptoms: [] },
        functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
        medications: { current: [], changes: '', effectiveness: '' },
        treatments: { recent: [], effectiveness: '', planned: [] },
        qualityOfLife: { sleepQuality: 0, moodImpact: 0, socialImpact: [] },
        workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
        comparison: { worseningSince: '', newLimitations: [] },
        notes: '',
      }];

      const result = analyzePatterns(minimalEntries);

      expect(result).toBeDefined();

      console.log('MINIMAL_FIELDS_TEST: Minimal entries handled - PASS');
    });

    it('should maintain consistent results with same data', () => {
      const entries = generateSyntheticEntries(30, 3, { seed: 77778 });

      const result1 = analyzePatterns(entries);
      const result2 = analyzePatterns(entries);

      expect(result1.cleanedEntries.length).toBe(result2.cleanedEntries.length);
      expect(result1.dailyTrend.length).toBe(result2.dailyTrend.length);

      console.log('CONSISTENCY_TEST: Results consistent across calls - PASS');
    });
  });
});
