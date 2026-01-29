/**
 * Tests for TrendAnalysisService
 */

import { describe, it, expect } from 'vitest';
import { TrendAnalysisService } from '@pain-tracker/services';
import type { PainEntry } from '../types';

describe('TrendAnalysisService', () => {
  const service = new TrendAnalysisService();

  const createEntry = (daysAgo: number, painLevel: number): Partial<PainEntry> => ({
    id: Date.now() + Math.random(),
    timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    baselineData: {
      pain: painLevel,
      locations: [],
      symptoms: [],
    },
  });

  const meds = (names: string[]) => ({
    current: names.map(name => ({ name, dosage: '', frequency: '', effectiveness: '' })),
    changes: '',
    effectiveness: '',
  });

  describe('Pain Intensity Trend Analysis', () => {
    it('should detect insufficient data', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(0, 5),
      ];

      const trend = service.analyzePainIntensityTrend(entries as PainEntry[]);

      expect(trend.trend.direction).toBe('stable');
      expect(trend.trend.confidence).toBe(0);
      expect(trend.insight).toContain('Not enough data');
    });

    it('should detect increasing trend', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(14, 3),
        createEntry(13, 3),
        createEntry(12, 4),
        createEntry(11, 4),
        createEntry(10, 5),
        createEntry(9, 5),
        createEntry(8, 6),
        createEntry(7, 6),
        createEntry(6, 7),
        createEntry(5, 7),
        createEntry(4, 8),
        createEntry(3, 8),
        createEntry(2, 9),
        createEntry(1, 9),
      ];

      const trend = service.analyzePainIntensityTrend(entries as PainEntry[]);

      expect(trend.trend.direction).toBe('increasing');
      expect(trend.trend.confidence).toBeGreaterThan(0.5);
      expect(trend.insight).toContain('increased');
    });

    it('should detect decreasing trend', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(14, 9),
        createEntry(13, 9),
        createEntry(12, 8),
        createEntry(11, 8),
        createEntry(10, 7),
        createEntry(9, 7),
        createEntry(8, 6),
        createEntry(7, 6),
        createEntry(6, 5),
        createEntry(5, 5),
        createEntry(4, 4),
        createEntry(3, 4),
        createEntry(2, 3),
        createEntry(1, 3),
      ];

      const trend = service.analyzePainIntensityTrend(entries as PainEntry[]);

      expect(trend.trend.direction).toBe('decreasing');
      expect(trend.trend.confidence).toBeGreaterThan(0.5);
      expect(trend.insight).toContain('decreased');
      expect(trend.recommendation).toContain('progress');
    });

    it('should detect stable trend', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(14, 5),
        createEntry(13, 5),
        createEntry(12, 6),
        createEntry(11, 5),
        createEntry(10, 5),
        createEntry(9, 6),
        createEntry(8, 5),
        createEntry(7, 5),
        createEntry(6, 6),
        createEntry(5, 5),
        createEntry(4, 5),
        createEntry(3, 6),
        createEntry(2, 5),
        createEntry(1, 5),
      ];

      const trend = service.analyzePainIntensityTrend(entries as PainEntry[]);

      expect(trend.trend.direction).toBe('stable');
      expect(trend.insight).toContain('stable');
    });
  });

  describe('Frequency Trend Analysis', () => {
    it('should analyze entry frequency', () => {
      // Create entries: 5 this week, 3 last week
      const entries: Partial<PainEntry>[] = [
        createEntry(1, 5),
        createEntry(2, 5),
        createEntry(3, 5),
        createEntry(4, 5),
        createEntry(5, 5),
        createEntry(8, 5),
        createEntry(10, 5),
        createEntry(12, 5),
      ];

      const trend = service.analyzeFrequencyTrend(entries as PainEntry[]);

      expect(trend.period).toBe('week');
      expect(trend.entriesCount).toBe(5);
      expect(trend.previousCount).toBe(3);
      expect(trend.trend).toBe('increasing');
    });

    it('should calculate consistency score', () => {
      // One entry per day for 7 days
      const entries: Partial<PainEntry>[] = [
        createEntry(1, 5),
        createEntry(2, 5),
        createEntry(3, 5),
        createEntry(4, 5),
        createEntry(5, 5),
        createEntry(6, 5),
        createEntry(7, 5),
      ];

      const trend = service.analyzeFrequencyTrend(entries as PainEntry[]);

      expect(trend.consistency).toBeCloseTo(1, 1); // Perfect consistency
    });

    it('should detect low consistency', () => {
      // Multiple entries on same days
      const entries: Partial<PainEntry>[] = [
        createEntry(1, 5),
        createEntry(1, 6),
        createEntry(1, 7),
        createEntry(2, 5),
        createEntry(2, 6),
      ];

      const trend = service.analyzeFrequencyTrend(entries as PainEntry[]);

      expect(trend.consistency).toBeLessThan(0.5); // Low consistency
    });
  });

  describe('Anomaly Detection', () => {
    it('should detect no anomalies with insufficient data', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(0, 5),
        createEntry(1, 5),
      ];

      const anomalies = service.detectAnomalies(entries as PainEntry[]);

      expect(anomalies).toHaveLength(0);
    });

    it('should detect high pain spike', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(10, 5),
        createEntry(9, 5),
        createEntry(8, 5),
        createEntry(7, 5),
        createEntry(6, 5),
        createEntry(5, 5),
        createEntry(4, 5),
        createEntry(3, 10), // Anomaly
        createEntry(2, 5),
        createEntry(1, 5),
      ];

      const anomalies = service.detectAnomalies(entries as PainEntry[]);

      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies[0].metric).toBe('pain_intensity');
      expect(anomalies[0].severity).toBeTruthy();
      expect(anomalies[0].context).toContain('higher');
    });

    it('should detect low pain anomaly', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(10, 8),
        createEntry(9, 8),
        createEntry(8, 8),
        createEntry(7, 8),
        createEntry(6, 8),
        createEntry(5, 8),
        createEntry(4, 8),
        createEntry(3, 2), // Anomaly
        createEntry(2, 8),
        createEntry(1, 8),
      ];

      const anomalies = service.detectAnomalies(entries as PainEntry[]);

      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies[0].context).toContain('lower');
    });
  });

  describe('Correlation Analysis', () => {
    it('should find medication correlation', () => {
      const entries: Partial<PainEntry>[] = [
        { ...createEntry(10, 8), medications: meds([]) },
        { ...createEntry(9, 8), medications: meds([]) },
        { ...createEntry(8, 8), medications: meds([]) },
        { ...createEntry(7, 5), medications: meds(['Med A']) },
        { ...createEntry(6, 5), medications: meds(['Med A']) },
        { ...createEntry(5, 5), medications: meds(['Med A']) },
        { ...createEntry(4, 5), medications: meds(['Med A']) },
        { ...createEntry(3, 5), medications: meds(['Med A']) },
      ];

      const correlations = service.findCorrelations(entries as PainEntry[]);

      const medCorrelation = correlations.find(c => c.factor1 === 'medication');
      expect(medCorrelation).toBeTruthy();
      if (medCorrelation) {
        expect(medCorrelation.correlation).toBeGreaterThan(0);
        expect(medCorrelation.description).toContain('help');
      }
    });

    it('should find time of day correlation', () => {
      const isoAtLocalHour = (daysAgo: number, hour: number): string => {
        const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        date.setHours(hour, 0, 0, 0);
        return date.toISOString();
      };

      // Morning entries with lower pain (local time)
      const morningEntries: Partial<PainEntry>[] = [
        { ...createEntry(8, 4), timestamp: isoAtLocalHour(8, 9) },
        { ...createEntry(7, 4), timestamp: isoAtLocalHour(7, 8) },
        { ...createEntry(6, 4), timestamp: isoAtLocalHour(6, 9) },
        { ...createEntry(5, 4), timestamp: isoAtLocalHour(5, 10) },
      ];

      // Evening entries with higher pain (local time)
      const eveningEntries: Partial<PainEntry>[] = [
        { ...createEntry(4, 7), timestamp: isoAtLocalHour(4, 20) },
        { ...createEntry(3, 7), timestamp: isoAtLocalHour(3, 21) },
        { ...createEntry(2, 7), timestamp: isoAtLocalHour(2, 22) },
      ];

      const correlations = service.findCorrelations([...morningEntries, ...eveningEntries] as PainEntry[]);

      const timeCorrelation = correlations.find(c => c.factor1 === 'time_of_day');
      expect(timeCorrelation).toBeTruthy();
      if (timeCorrelation) {
        expect(timeCorrelation.description).toContain('evening');
      }
    });
  });

  describe('Trend Summary', () => {
    it('should return insufficient data for minimal entries', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(0, 5),
      ];

      const summary = service.getTrendSummary(entries as PainEntry[]);

      expect(summary.overallHealth).toBe('insufficient_data');
      expect(summary.anomalies).toHaveLength(0);
      expect(summary.correlations).toHaveLength(0);
    });

    it('should provide comprehensive summary with sufficient data', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(14, 8),
        createEntry(13, 8),
        createEntry(12, 7),
        createEntry(11, 7),
        createEntry(10, 6),
        createEntry(9, 6),
        createEntry(8, 5),
        createEntry(7, 5),
        createEntry(6, 4),
        createEntry(5, 4),
        createEntry(4, 3),
        createEntry(3, 3),
        createEntry(2, 2),
        createEntry(1, 2),
      ];

      const summary = service.getTrendSummary(entries as PainEntry[]);

      expect(summary.painTrend).toBeTruthy();
      expect(summary.engagementTrend).toBeTruthy();
      expect(summary.overallHealth).toBeTruthy();
      expect(['improving', 'stable', 'declining', 'insufficient_data']).toContain(summary.overallHealth);
    });

    it('should detect improving health', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(14, 9),
        createEntry(13, 9),
        createEntry(12, 8),
        createEntry(11, 8),
        createEntry(10, 7),
        createEntry(9, 7),
        createEntry(8, 6),
        createEntry(7, 6),
        createEntry(6, 5),
        createEntry(5, 5),
        createEntry(4, 4),
        createEntry(3, 4),
        createEntry(2, 3),
        createEntry(1, 3),
      ];

      const summary = service.getTrendSummary(entries as PainEntry[]);

      expect(summary.overallHealth).toBe('improving');
      expect(summary.painTrend.trend.direction).toBe('decreasing');
    });
  });
});
