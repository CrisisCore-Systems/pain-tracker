/**
 * Tests for PredictiveInsightsService
 */

import { describe, it, expect } from 'vitest';
import { PredictiveInsightsService } from '@pain-tracker/services';
import type { PainEntry } from '../types';

describe('PredictiveInsightsService', () => {
  const service = new PredictiveInsightsService();

  const meds = (names: string[]) => ({
    current: names.map(name => ({ name, dosage: '', frequency: '', effectiveness: '' })),
    changes: '',
    effectiveness: '',
  });

  const createEntry = (daysAgo: number, painLevel: number, hour = 12, withMeds = false): Partial<PainEntry> => {
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    date.setHours(hour, 0, 0, 0);

    return {
      id: Date.now() + Math.random(),
      timestamp: date.toISOString(),
      baselineData: {
        pain: painLevel,
        locations: [],
        symptoms: [],
      },
      medications: withMeds ? meds(['Medication A']) : meds([]),
    };
  };

  describe('Next Day Pain Prediction', () => {
    it('should return null with insufficient data', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(0, 5),
        createEntry(1, 5),
      ];

      const prediction = service.predictNextDayPain(entries as PainEntry[]);
      expect(prediction).toBeNull();
    });

    it('should predict based on recent trend', () => {
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

      const prediction = service.predictNextDayPain(entries as PainEntry[]);
      
      expect(prediction).not.toBeNull();
      if (prediction) {
        // Allow minor model/weight tweaks while still asserting a clearly elevated prediction.
        expect(prediction.predictedLevel).toBeGreaterThan(7.5); // Increasing trend
        expect(prediction.confidence).toBeGreaterThan(0);
        expect(prediction.confidence).toBeLessThanOrEqual(1);
        expect(prediction.range.min).toBeLessThan(prediction.predictedLevel);
        expect(prediction.range.max).toBeGreaterThan(prediction.predictedLevel);
        expect(prediction.factors.length).toBeGreaterThan(0);
      }
    });

    it('should provide explanation with prediction', () => {
      const entries: Partial<PainEntry>[] = [];
      for (let i = 10; i >= 0; i--) {
        entries.push(createEntry(i, 5 + Math.sin(i) * 0.5));
      }

      const prediction = service.predictNextDayPain(entries as PainEntry[]);
      
      expect(prediction).not.toBeNull();
      if (prediction) {
        expect(prediction.explanation).toBeTruthy();
        expect(typeof prediction.explanation).toBe('string');
        expect(prediction.explanation.length).toBeGreaterThan(10);
      }
    });

    it('should include relevant factors', () => {
      const entries: Partial<PainEntry>[] = [];
      for (let i = 10; i >= 0; i--) {
        entries.push(createEntry(i, 8, 12, true)); // High pain with meds
      }

      const prediction = service.predictNextDayPain(entries as PainEntry[]);
      
      expect(prediction).not.toBeNull();
      if (prediction) {
        expect(prediction.factors).toContain('regular medication use');
      }
    });
  });

  describe('Optimal Check-In Times', () => {
    it('should return empty array with insufficient data', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(0, 5),
      ];

      const times = service.predictOptimalCheckInTimes(entries as PainEntry[]);
      expect(times).toHaveLength(0);
    });

    it('should identify morning pattern', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(7, 5, 8),
        createEntry(6, 5, 9),
        createEntry(5, 5, 8),
        createEntry(4, 5, 9),
        createEntry(3, 5, 8),
      ];

      const times = service.predictOptimalCheckInTimes(entries as PainEntry[]);
      
      expect(times.length).toBeGreaterThan(0);
      const morningTime = times.find(t => t.timeOfDay === 'morning');
      expect(morningTime).toBeTruthy();
      if (morningTime) {
        expect(morningTime.confidence).toBeGreaterThan(0);
        expect(morningTime.reason).toBeTruthy();
      }
    });

    it('should sort by historical success', () => {
      const entries: Partial<PainEntry>[] = [
        ...Array(10).fill(null).map((_, i) => createEntry(i, 5, 8)), // Morning
        ...Array(3).fill(null).map((_, i) => createEntry(i + 10, 5, 20)), // Evening
      ];

      const times = service.predictOptimalCheckInTimes(entries as PainEntry[]);
      
      expect(times.length).toBeGreaterThan(0);
      // Morning should rank higher (more entries)
      if (times.length > 1) {
        expect(times[0].historicalSuccess).toBeGreaterThanOrEqual(times[1].historicalSuccess);
      }
    });
  });

  describe('Effectiveness Forecasting', () => {
    it('should return empty with insufficient data', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(0, 5, 12, true),
      ];

      const forecasts = service.forecastEffectiveness(entries as PainEntry[]);
      expect(forecasts).toHaveLength(0);
    });

    it('should identify effective medications', () => {
      const entries: Partial<PainEntry>[] = [];
      
      // Medication followed by improvement
      for (let i = 14; i >= 0; i--) {
        entries.push(createEntry(i, 8, 12, true));
        entries.push(createEntry(i - 0.5, 5, 14, false)); // Improvement after med
      }

      const forecasts = service.forecastEffectiveness(entries.slice(0, 14) as PainEntry[]);
      
      expect(forecasts.length).toBeGreaterThan(0);
      if (forecasts.length > 0) {
        expect(forecasts[0].intervention).toBeTruthy();
        expect(forecasts[0].type).toBe('medication');
        expect(forecasts[0].predictedEffectiveness).toBeGreaterThanOrEqual(0);
        expect(forecasts[0].predictedEffectiveness).toBeLessThanOrEqual(1);
        expect(forecasts[0].historicalData.triedCount).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('Preventive Actions', () => {
    it('should suggest tracking with minimal data', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(0, 5),
      ];

      const actions = service.suggestPreventiveActions(entries as PainEntry[]);
      
      expect(actions.length).toBeGreaterThan(0);
      expect(actions[0].action).toContain('tracking');
    });

    it('should suggest preparation for predicted high pain', () => {
      const entries: Partial<PainEntry>[] = [];
      for (let i = 10; i >= 0; i--) {
        entries.push(createEntry(i, 9)); // Consistently high pain
      }

      const actions = service.suggestPreventiveActions(entries as PainEntry[]);
      
      const highPainAction = actions.find(a => a.action.includes('pain management') || a.action.includes('Prepare'));
      expect(highPainAction).toBeTruthy();
      if (highPainAction) {
        expect(highPainAction.priority).toBe('high');
      }
    });

    it('should have confidence scores', () => {
      const entries: Partial<PainEntry>[] = [];
      for (let i = 10; i >= 0; i--) {
        entries.push(createEntry(i, 5));
      }

      const actions = service.suggestPreventiveActions(entries as PainEntry[]);
      
      actions.forEach(action => {
        expect(action.confidence).toBeGreaterThanOrEqual(0);
        expect(action.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Comprehensive Insights', () => {
    it('should provide all insight types', () => {
      const entries: Partial<PainEntry>[] = [];
      for (let i = 30; i >= 0; i--) {
        entries.push(createEntry(i, 5 + Math.random() * 2, 8 + Math.floor(Math.random() * 10), i % 3 === 0));
      }

      const insights = service.getPredictiveInsights(entries as PainEntry[]);
      
      expect(insights).toBeTruthy();
      expect(insights.nextDayPrediction).toBeTruthy();
      expect(insights.next7DaysTrend).toBeTruthy();
      expect(insights.optimalCheckInTimes).toBeTruthy();
      expect(insights.effectivenessForecasts).toBeTruthy();
      expect(insights.preventiveActions).toBeTruthy();
      expect(insights.confidence).toBeTruthy();
    });

    it('should calculate confidence metrics', () => {
      const entries: Partial<PainEntry>[] = [];
      for (let i = 20; i >= 0; i--) {
        entries.push(createEntry(i, 5));
      }

      const insights = service.getPredictiveInsights(entries as PainEntry[]);
      
      expect(insights.confidence.overall).toBeGreaterThanOrEqual(0);
      expect(insights.confidence.overall).toBeLessThanOrEqual(1);
      expect(insights.confidence.dataQuality).toBeGreaterThanOrEqual(0);
      expect(insights.confidence.dataQuality).toBeLessThanOrEqual(1);
      expect(insights.confidence.patternStrength).toBeGreaterThanOrEqual(0);
      expect(insights.confidence.patternStrength).toBeLessThanOrEqual(1);
    });

    it('should detect 7-day trends', () => {
      // Improving trend
      const entries: Partial<PainEntry>[] = [];
      for (let i = 20; i >= 0; i--) {
        const level = i > 10 ? 8 : 4; // Clear improvement
        entries.push(createEntry(i, level));
      }

      const insights = service.getPredictiveInsights(entries as PainEntry[]);
      
      expect(insights.next7DaysTrend).toBe('improving');
    });

    it('should detect worsening trends', () => {
      const entries: Partial<PainEntry>[] = [];
      for (let i = 20; i >= 0; i--) {
        const level = i > 10 ? 4 : 8; // Clear worsening
        entries.push(createEntry(i, level));
      }

      const insights = service.getPredictiveInsights(entries as PainEntry[]);
      
      expect(insights.next7DaysTrend).toBe('worsening');
    });
  });
});
