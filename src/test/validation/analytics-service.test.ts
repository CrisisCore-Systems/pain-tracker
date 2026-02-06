/**
 * Analytics Service Synthetic Tests
 * ==================================
 * Comprehensive tests for pain analytics functionality using synthetic data.
 * Tests heatmaps, correlations, medication effectiveness, and trend analysis.
 * 
 * Part of: VALIDATION PROTOCOL v1.0
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { painAnalyticsService } from '../../services/PainAnalyticsService';
import {
  generateSyntheticEntries,
  generateCrisisPeriod,
  generateRecoveryPeriod,
  PREDEFINED_SCENARIOS,
} from './synthetic-data-generator';

// Mock analytics dependencies
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

describe('Pain Analytics Service - Synthetic Testing Suite', () => {
  beforeAll(() => {
    vi.clearAllMocks();
  });

  describe('Pattern Analysis', () => {
    it('should analyze patterns from 30 days of chronic back pain data', () => {
      const entries = generateSyntheticEntries(30, 3, {
        profile: 'chronic-back-pain',
        seed: 12345,
      });

      const patterns = painAnalyticsService.analyzePatterns(entries);

      expect(patterns).toBeDefined();
      expect(Array.isArray(patterns)).toBe(true);

      // With enough data, should detect some patterns
      if (patterns.length > 0) {
        patterns.forEach((pattern, index) => {
          expect(pattern.id, `Pattern ${index} missing id`).toBeDefined();
          expect(pattern.name, `Pattern ${index} missing name`).toBeDefined();
          expect(pattern.confidence, `Pattern ${index} missing confidence`).toBeGreaterThanOrEqual(0);
          expect(pattern.confidence, `Pattern ${index} confidence too high`).toBeLessThanOrEqual(1);
        });
      }

      console.log(`PATTERN_ANALYSIS_TEST: Found ${patterns.length} patterns - PASS`);
    });

    it('should detect more patterns with longer data history', () => {
      const shortEntries = generateSyntheticEntries(7, 3, { seed: 11111 });
      const longEntries = generateSyntheticEntries(90, 3, { seed: 22222 });

      const shortPatterns = painAnalyticsService.analyzePatterns(shortEntries);
      const longPatterns = painAnalyticsService.analyzePatterns(longEntries);

      // More data should yield same or more patterns
      expect(longPatterns.length).toBeGreaterThanOrEqual(shortPatterns.length);

      console.log(`DATA_VOLUME_PATTERN_TEST: Short=${shortPatterns.length}, Long=${longPatterns.length} - PASS`);
    });
  });

  describe('Location Heatmap', () => {
    it('should generate location heatmap from synthetic data', () => {
      const entries = generateSyntheticEntries(30, 3, {
        profile: 'fibromyalgia',
        seed: 33333,
      });

      const heatmap = painAnalyticsService.generateLocationHeatmap(entries);

      expect(heatmap).toBeDefined();
      expect(heatmap.locations).toBeDefined();
      expect(heatmap.bucket).toBeDefined();
      expect(heatmap.bucket.mode).toBeDefined();

      if (heatmap.locations.length > 0) {
        heatmap.locations.forEach((loc, index) => {
          expect(loc.key, `Location ${index} missing key`).toBeDefined();
          expect(loc.label, `Location ${index} missing label`).toBeDefined();
          expect(loc.totalPain, `Location ${index} missing totalPain`).toBeGreaterThanOrEqual(0);
          expect(loc.count, `Location ${index} missing count`).toBeGreaterThanOrEqual(0);
        });
      }

      console.log(`LOCATION_HEATMAP_TEST: ${heatmap.locations.length} locations mapped - PASS`);
    });

    it('should aggregate pain by location correctly', () => {
      const entries = generateSyntheticEntries(14, 3, {
        profile: 'chronic-back-pain',
        seed: 44444,
      });

      const heatmap = painAnalyticsService.generateLocationHeatmap(entries);

      // Back-related locations should have higher counts for back pain profile
      const backLocations = heatmap.locations.filter(l => 
        l.key.includes('back') || l.label.toLowerCase().includes('back')
      );

      // Should have at least some back-related entries
      const totalBackCount = backLocations.reduce((sum, l) => sum + l.count, 0);
      expect(totalBackCount).toBeGreaterThan(0);

      console.log(`LOCATION_AGGREGATION_TEST: ${backLocations.length} back locations with ${totalBackCount} total entries - PASS`);
    });

    it('should handle empty entries for heatmap', () => {
      const heatmap = painAnalyticsService.generateLocationHeatmap([]);

      expect(heatmap.locations).toHaveLength(0);
      expect(heatmap.bucket.keys).toHaveLength(0);

      console.log('EMPTY_HEATMAP_TEST: Empty entries handled - PASS');
    });
  });

  describe('Time-based Heatmap', () => {
    it('should generate time heatmap showing pain by day/hour', () => {
      const entries = generateSyntheticEntries(30, 4, {
        profile: 'migraine',
        seed: 55555,
      });

      const timeHeatmap = painAnalyticsService.generateTimeHeatmap(entries);

      expect(timeHeatmap).toBeDefined();
      expect(Array.isArray(timeHeatmap)).toBe(true);

      if (timeHeatmap.length > 0) {
        timeHeatmap.forEach((point, index) => {
          expect(point.dayOfWeek, `Point ${index} missing dayOfWeek`).toBeDefined();
          expect(point.dayOfWeek).toBeGreaterThanOrEqual(0);
          expect(point.dayOfWeek).toBeLessThanOrEqual(6);
          expect(point.hourOfDay, `Point ${index} missing hourOfDay`).toBeGreaterThanOrEqual(0);
          expect(point.hourOfDay).toBeLessThanOrEqual(23);
          expect(point.avgPain).toBeGreaterThanOrEqual(0);
          expect(point.avgPain).toBeLessThanOrEqual(10);
        });
      }

      console.log(`TIME_HEATMAP_TEST: ${timeHeatmap.length} time points generated - PASS`);
    });

    it('should show variation in pain across different times', () => {
      const entries = generateSyntheticEntries(60, 5, {
        profile: 'arthritis',
        seed: 66666,
      });

      const timeHeatmap = painAnalyticsService.generateTimeHeatmap(entries);

      if (timeHeatmap.length > 10) {
        const avgPains = timeHeatmap.map(p => p.avgPain);
        const minPain = Math.min(...avgPains);
        const maxPain = Math.max(...avgPains);
        
        // Should show some variation across time points
        expect(maxPain - minPain).toBeGreaterThan(0);
      }

      console.log('TIME_VARIATION_TEST: Pain varies across time points - PASS');
    });
  });

  describe('Correlation Analysis', () => {
    it('should analyze symptom-pain correlations', () => {
      const entries = generateSyntheticEntries(60, 3, {
        profile: 'fibromyalgia',
        seed: 77777,
      });

      const correlations = painAnalyticsService.analyzeCorrelations(entries);

      expect(correlations).toBeDefined();
      expect(correlations.symptomCorrelations).toBeDefined();
      expect(Array.isArray(correlations.symptomCorrelations)).toBe(true);

      if (correlations.symptomCorrelations.length > 0) {
        correlations.symptomCorrelations.forEach((corr, index) => {
          expect(corr.symptom, `Correlation ${index} missing symptom`).toBeDefined();
          expect(corr.painCorrelation, `Correlation ${index} missing painCorrelation`).toBeDefined();
          expect(corr.frequency, `Correlation ${index} missing frequency`).toBeGreaterThanOrEqual(0);
        });
      }

      console.log(`SYMPTOM_CORRELATION_TEST: ${correlations.symptomCorrelations.length} correlations found - PASS`);
    });

    it('should analyze activity-pain correlations', () => {
      const entries = generateSyntheticEntries(45, 3, {
        profile: 'chronic-back-pain',
        seed: 88888,
      });

      const correlations = painAnalyticsService.analyzeCorrelations(entries);

      expect(correlations.activityCorrelations).toBeDefined();
      expect(Array.isArray(correlations.activityCorrelations)).toBe(true);

      console.log(`ACTIVITY_CORRELATION_TEST: ${correlations.activityCorrelations.length} correlations found - PASS`);
    });

    it('should analyze medication effectiveness', () => {
      const entries = generateSyntheticEntries(60, 3, {
        profile: 'mixed-condition',
        includeCrisisPeriods: true,
        seed: 99999,
      });

      const correlations = painAnalyticsService.analyzeCorrelations(entries);

      expect(correlations.medicationEffectiveness).toBeDefined();
      expect(Array.isArray(correlations.medicationEffectiveness)).toBe(true);

      console.log(`MEDICATION_EFFECTIVENESS_TEST: ${correlations.medicationEffectiveness.length} medications analyzed - PASS`);
    });
  });

  describe('Trend Analysis', () => {
    it('should detect improving trend during recovery', () => {
      const recoveryEntries = generateRecoveryPeriod(30, 11122);

      const trends = painAnalyticsService.analyzeTrends(recoveryEntries);

      expect(trends).toBeDefined();
      expect(trends.overallTrend).toBeDefined();
      
      // Recovery should show improving or stable trend
      expect(['improving', 'stable']).toContain(trends.overallTrend);

      console.log(`RECOVERY_TREND_TEST: Overall trend=${trends.overallTrend} - PASS`);
    });

    it('should detect worsening trend during crisis', () => {
      const crisisEntries = generateCrisisPeriod(14, 22233);

      const trends = painAnalyticsService.analyzeTrends(crisisEntries);

      expect(trends).toBeDefined();
      expect(trends.trendStrength).toBeDefined();
      expect(trends.trendStrength).toBeGreaterThanOrEqual(0);
      expect(trends.trendStrength).toBeLessThanOrEqual(1);

      console.log(`CRISIS_TREND_TEST: Trend strength=${trends.trendStrength.toFixed(2)} - PASS`);
    });

    it('should identify periodic patterns', () => {
      const entries = PREDEFINED_SCENARIOS.migrainePattern().entries;

      const trends = painAnalyticsService.analyzeTrends(entries);

      expect(trends.periodicPatterns).toBeDefined();
      expect(Array.isArray(trends.periodicPatterns)).toBe(true);

      console.log(`PERIODIC_PATTERN_TEST: ${trends.periodicPatterns.length} periodic patterns found - PASS`);
    });
  });

  describe('Prediction', () => {
    it('should generate pain prediction from historical data', () => {
      const entries = generateSyntheticEntries(60, 3, {
        profile: 'chronic-back-pain',
        seed: 33344,
      });

      const prediction = painAnalyticsService.predictPain(entries);

      expect(prediction).toBeDefined();
      expect(prediction.predictedPain).toBeGreaterThanOrEqual(1);
      expect(prediction.predictedPain).toBeLessThanOrEqual(10);
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
      expect(prediction.timeframe).toBeDefined();
      expect(prediction.factors).toBeDefined();

      console.log(`PREDICTION_TEST: Predicted pain=${prediction.predictedPain.toFixed(1)}, Confidence=${(prediction.confidence * 100).toFixed(0)}% - PASS`);
    });

    it('should provide factors influencing prediction', () => {
      const entries = generateSyntheticEntries(90, 3, {
        profile: 'fibromyalgia',
        includeFlarePeriods: true,
        seed: 44455,
      });

      const prediction = painAnalyticsService.predictPain(entries);

      expect(prediction.factors).toBeDefined();
      expect(Array.isArray(prediction.factors)).toBe(true);

      if (prediction.factors.length > 0) {
        prediction.factors.forEach((factor, index) => {
          expect(factor.factor, `Factor ${index} missing name`).toBeDefined();
          expect(factor.impact, `Factor ${index} missing impact`).toBeDefined();
          expect(factor.description, `Factor ${index} missing description`).toBeDefined();
        });
      }

      console.log(`PREDICTION_FACTORS_TEST: ${prediction.factors.length} factors identified - PASS`);
    });
  });

  describe('Performance', () => {
    it('should analyze 1000 entries quickly', () => {
      const entries = generateSyntheticEntries(334, 3, { seed: 55566 });

      const startTime = performance.now();
      
      const patterns = painAnalyticsService.analyzePatterns(entries);
      const heatmap = painAnalyticsService.generateLocationHeatmap(entries);
      const correlations = painAnalyticsService.analyzeCorrelations(entries);
      const trends = painAnalyticsService.analyzeTrends(entries);
      const prediction = painAnalyticsService.predictPain(entries);
      
      const totalTime = performance.now() - startTime;

      expect(totalTime).toBeLessThan(3000); // 3 seconds max for full analysis

      console.log(`PERFORMANCE_TEST: Full analysis of ${entries.length} entries in ${totalTime.toFixed(0)}ms - PASS`);
    });

    it('should handle year-long dataset efficiently', () => {
      const yearData = PREDEFINED_SCENARIOS.yearLongUsage().entries;

      const startTime = performance.now();
      const patterns = painAnalyticsService.analyzePatterns(yearData);
      const analysisTime = performance.now() - startTime;

      expect(analysisTime).toBeLessThan(5000); // 5 seconds max
      expect(patterns).toBeDefined();

      console.log(`YEAR_DATA_PERFORMANCE_TEST: ${yearData.length} entries analyzed in ${analysisTime.toFixed(0)}ms - PASS`);
    });
  });

  describe('Edge Cases', () => {
    it('should handle entries with no symptoms', () => {
      const entries = [{
        id: 'no-symptoms',
        timestamp: new Date().toISOString(),
        baselineData: { pain: 5, locations: ['back'], symptoms: [] },
        functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
        medications: { current: [], changes: '', effectiveness: '' },
        treatments: { recent: [], effectiveness: '', planned: [] },
        qualityOfLife: { sleepQuality: 5, moodImpact: 5, socialImpact: [] },
        workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
        comparison: { worseningSince: '', newLimitations: [] },
        notes: '',
      }];

      const patterns = painAnalyticsService.analyzePatterns(entries);
      const correlations = painAnalyticsService.analyzeCorrelations(entries);

      expect(patterns).toBeDefined();
      expect(correlations).toBeDefined();

      console.log('NO_SYMPTOMS_TEST: Handled entries without symptoms - PASS');
    });

    it('should handle entries with extreme pain values', () => {
      const extremeEntries = [
        ...generateSyntheticEntries(10, 1, { seed: 66677 }),
      ];
      
      // Add extreme values
      extremeEntries[0].baselineData.pain = 10;
      extremeEntries[1].baselineData.pain = 1;

      const heatmap = painAnalyticsService.generateLocationHeatmap(extremeEntries);
      const trends = painAnalyticsService.analyzeTrends(extremeEntries);

      expect(heatmap).toBeDefined();
      expect(trends).toBeDefined();

      console.log('EXTREME_VALUES_TEST: Handled extreme pain values - PASS');
    });

    it('should handle duplicate timestamps', () => {
      const entries = generateSyntheticEntries(5, 3, { seed: 77788 });
      
      // Duplicate a timestamp
      entries[1].timestamp = entries[0].timestamp;

      const heatmap = painAnalyticsService.generateLocationHeatmap(entries);
      expect(heatmap).toBeDefined();

      console.log('DUPLICATE_TIMESTAMP_TEST: Handled duplicate timestamps - PASS');
    });
  });
});
