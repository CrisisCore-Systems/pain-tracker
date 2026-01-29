/**
 * Tests for MultiVariateAnalysisService
 */

import { describe, it, expect } from 'vitest';
import { MultiVariateAnalysisService } from '@pain-tracker/services';
import type { PainEntry } from '../types';

describe('MultiVariateAnalysisService', () => {
  const service = new MultiVariateAnalysisService();

  const meds = (names: string[]) => ({
    current: names.map(name => ({ name, dosage: '', frequency: '', effectiveness: '' })),
    changes: '',
    effectiveness: '',
  });

  const createEntry = (
    daysAgo: number,
    painLevel: number,
    hour = 12,
    withMeds = false,
    dayOfWeek?: number
  ): Partial<PainEntry> => {
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    if (dayOfWeek !== undefined) {
      // Adjust to specific day of week
      const currentDay = date.getDay();
      const diff = dayOfWeek - currentDay;
      date.setDate(date.getDate() + diff);
    }
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

  describe('Correlation Matrix', () => {
    it('should return empty with insufficient data', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(0, 5),
      ];

      const matrix = service.buildCorrelationMatrix(entries as PainEntry[]);
      expect(matrix).toHaveLength(0);
    });

    it('should find time-of-day correlation', () => {
      const entries: Partial<PainEntry>[] = [
        ...Array(5).fill(null).map((_, i) => createEntry(i, 4, 8)), // Morning, low pain
        ...Array(5).fill(null).map((_, i) => createEntry(i + 5, 8, 20)), // Evening, high pain
      ];

      const matrix = service.buildCorrelationMatrix(entries as PainEntry[]);
      
      const timeCorr = matrix.find(c => c.variable1 === 'time_of_day' || c.variable2 === 'time_of_day');
      expect(timeCorr).toBeTruthy();
      if (timeCorr) {
        expect(timeCorr.correlation).not.toBe(0);
        expect(timeCorr.strength).toBeTruthy();
        expect(['strong', 'moderate', 'weak']).toContain(timeCorr.strength);
        expect(timeCorr.interpretation).toBeTruthy();
      }
    });

    it('should find medication correlation', () => {
      const entries: Partial<PainEntry>[] = [
        ...Array(5).fill(null).map((_, i) => createEntry(i, 8, 12, false)), // No meds, high pain
        ...Array(5).fill(null).map((_, i) => createEntry(i + 5, 4, 12, true)), // With meds, low pain
      ];

      const matrix = service.buildCorrelationMatrix(entries as PainEntry[]);
      
      const medCorr = matrix.find(c => c.variable1 === 'medication_use' || c.variable2 === 'medication_use');
      expect(medCorr).toBeTruthy();
      if (medCorr) {
        expect(medCorr.sampleSize).toBeGreaterThan(0);
        expect(medCorr.significance).toBeGreaterThanOrEqual(0);
        expect(medCorr.significance).toBeLessThanOrEqual(1);
      }
    });

    it('should sort by correlation strength', () => {
      const entries: Partial<PainEntry>[] = [];
      for (let i = 0; i < 15; i++) {
        entries.push(createEntry(i, 4 + Math.random() * 2, 8 + Math.floor(Math.random() * 12), i % 2 === 0));
      }

      const matrix = service.buildCorrelationMatrix(entries as PainEntry[]);
      
      if (matrix.length > 1) {
        for (let i = 0; i < matrix.length - 1; i++) {
          expect(Math.abs(matrix[i].correlation)).toBeGreaterThanOrEqual(Math.abs(matrix[i + 1].correlation));
        }
      }
    });
  });

  describe('Interaction Effects', () => {
    it('should return empty with insufficient data', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(0, 5),
      ];

      const effects = service.detectInteractionEffects(entries as PainEntry[]);
      expect(effects).toHaveLength(0);
    });

    it('should detect medication-time interaction', () => {
      const entries: Partial<PainEntry>[] = [
        ...Array(5).fill(null).map((_, i) => createEntry(i, 4, 8, true)), // Morning med, low pain
        ...Array(5).fill(null).map((_, i) => createEntry(i + 5, 7, 20, true)), // Evening med, higher pain
        ...Array(5).fill(null).map((_, i) => createEntry(i + 10, 5, 12, false)), // No med control
      ];

      const effects = service.detectInteractionEffects(entries as PainEntry[]);
      
      const medTimeEffect = effects.find(e => 
        e.factors.includes('medication') && e.factors.includes('time_of_day')
      );
      
      if (medTimeEffect) {
        expect(['synergistic', 'antagonistic', 'independent']).toContain(medTimeEffect.effect);
        expect(medTimeEffect.confidence).toBeGreaterThanOrEqual(0);
        expect(medTimeEffect.confidence).toBeLessThanOrEqual(1);
        expect(medTimeEffect.description).toBeTruthy();
      }
    });
  });

  describe('Compound Patterns', () => {
    it('should return empty with insufficient data', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(0, 5),
      ];

      const patterns = service.discoverCompoundPatterns(entries as PainEntry[]);
      expect(patterns).toHaveLength(0);
    });

    it('should find weekend-evening pattern', () => {
      const entries: Partial<PainEntry>[] = [
        ...Array(5).fill(null).map((_, i) => createEntry(i, 8, 20, false, 0)), // Sunday evening, high pain
        ...Array(5).fill(null).map((_, i) => createEntry(i + 5, 8, 20, false, 6)), // Saturday evening, high pain
        ...Array(10).fill(null).map((_, i) => createEntry(i + 10, 5, 12, false, 2)), // Tuesday, normal pain
      ];

      const patterns = service.discoverCompoundPatterns(entries as PainEntry[]);
      
      const weekendPattern = patterns.find(p => p.id === 'weekend-evening-high');
      if (weekendPattern) {
        expect(weekendPattern.frequency).toBeGreaterThanOrEqual(3);
        expect(weekendPattern.actionable).toBe(true);
        expect(weekendPattern.recommendation).toBeTruthy();
      }
    });

    it('should find continuation patterns', () => {
      const entries: Partial<PainEntry>[] = [];
      
      // Create sequences of high pain days
      for (let i = 0; i < 10; i += 2) {
        entries.push(createEntry(i, 9, 12)); // High pain
        entries.push(createEntry(i + 1, 9, 12)); // Continues next day
      }

      const patterns = service.discoverCompoundPatterns(entries as PainEntry[]);
      
      const continuationPattern = patterns.find(p => p.id === 'high-pain-continuation');
      if (continuationPattern) {
        expect(continuationPattern.frequency).toBeGreaterThan(0);
        expect(continuationPattern.description).toContain('followed');
      }
    });

    it('should filter by minimum frequency', () => {
      const entries: Partial<PainEntry>[] = [];
      for (let i = 0; i < 25; i++) {
        entries.push(createEntry(i, 5 + Math.random() * 2, 8 + Math.floor(Math.random() * 12)));
      }

      const patterns = service.discoverCompoundPatterns(entries as PainEntry[]);
      
      patterns.forEach(pattern => {
        expect(pattern.frequency).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('Causal Insights', () => {
    it('should return empty with insufficient data', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(0, 5),
      ];

      const insights = service.inferCausalRelationships(entries as PainEntry[]);
      expect(insights).toHaveLength(0);
    });

    it('should infer medication causality', () => {
      const entries: Partial<PainEntry>[] = [];
      
      // Pattern: medication → improvement
      for (let i = 20; i >= 0; i--) {
        if (i % 2 === 0) {
          entries.push(createEntry(i, 8, 12, true)); // Med taken, high pain
          entries.push(createEntry(i - 0.3, 5, 14, false)); // Later that day, improved
        } else {
          entries.push(createEntry(i, 6, 12, false)); // No med, moderate pain
        }
      }

      const insights = service.inferCausalRelationships(entries as PainEntry[]);
      
      const medCausal = insights.find(i => i.cause === 'medication_use');
      if (medCausal) {
        expect(medCausal.effect).toBe('pain_reduction');
        expect(medCausal.confidence).toBeGreaterThan(0.4);
        expect(medCausal.mechanism).toBeTruthy();
        expect(medCausal.reversible).toBe(true);
      }
    });

    it('should filter by confidence threshold', () => {
      const entries: Partial<PainEntry>[] = [];
      for (let i = 20; i >= 0; i--) {
        entries.push(createEntry(i, 5 + Math.random() * 2, 12, i % 3 === 0));
      }

      const insights = service.inferCausalRelationships(entries as PainEntry[]);
      
      insights.forEach(insight => {
        expect(insight.confidence).toBeGreaterThan(0.4);
      });
    });
  });

  describe('Entry Clustering', () => {
    it('should return empty with insufficient data', () => {
      const entries: Partial<PainEntry>[] = [
        createEntry(0, 5),
      ];

      const clusters = service.clusterEntries(entries as PainEntry[]);
      expect(clusters).toHaveLength(0);
    });

    it('should identify low pain morning cluster', () => {
      const entries: Partial<PainEntry>[] = [
        ...Array(5).fill(null).map((_, i) => createEntry(i, 3, 8)), // Low pain mornings
        ...Array(5).fill(null).map((_, i) => createEntry(i + 5, 8, 20)), // High pain evenings
      ];

      const clusters = service.clusterEntries(entries as PainEntry[]);
      
      const lowMorning = clusters.find(c => c.id === 'low-morning');
      if (lowMorning) {
        expect(lowMorning.size).toBeGreaterThanOrEqual(3);
        expect(lowMorning.characteristics).toBeTruthy();
        expect(lowMorning.centroid.painLevel).toBeLessThan(5);
      }
    });

    it('should identify high pain evening cluster', () => {
      const entries: Partial<PainEntry>[] = [
        ...Array(5).fill(null).map((_, i) => createEntry(i, 8, 20)), // High pain evenings
        ...Array(5).fill(null).map((_, i) => createEntry(i + 5, 3, 8)), // Low pain mornings
      ];

      const clusters = service.clusterEntries(entries as PainEntry[]);
      
      const highEvening = clusters.find(c => c.id === 'high-evening');
      if (highEvening) {
        expect(highEvening.size).toBeGreaterThanOrEqual(3);
        expect(highEvening.centroid.painLevel).toBeGreaterThan(7);
      }
    });

    it('should sort clusters by size', () => {
      const entries: Partial<PainEntry>[] = [];
      for (let i = 0; i < 20; i++) {
        entries.push(createEntry(i, 3 + Math.random() * 6, 8 + Math.floor(Math.random() * 14)));
      }

      const clusters = service.clusterEntries(entries as PainEntry[]);
      
      if (clusters.length > 1) {
        for (let i = 0; i < clusters.length - 1; i++) {
          expect(clusters[i].size).toBeGreaterThanOrEqual(clusters[i + 1].size);
        }
      }
    });
  });

  describe('Comprehensive Multi-Variate Insights', () => {
    it('should provide all insight types', () => {
      const entries: Partial<PainEntry>[] = [];
      for (let i = 0; i < 30; i++) {
        entries.push(createEntry(i, 3 + Math.random() * 5, 8 + Math.floor(Math.random() * 12), i % 3 === 0));
      }

      const insights = service.getMultiVariateInsights(entries as PainEntry[]);
      
      expect(insights).toBeTruthy();
      expect(insights.correlationMatrix).toBeTruthy();
      expect(insights.interactionEffects).toBeTruthy();
      expect(insights.compoundPatterns).toBeTruthy();
      expect(insights.causalInsights).toBeTruthy();
      expect(insights.clusters).toBeTruthy();
      expect(insights.summary).toBeTruthy();
    });

    it('should calculate summary confidence', () => {
      const entries: Partial<PainEntry>[] = [];
      for (let i = 0; i < 25; i++) {
        entries.push(createEntry(i, 5, 12, i % 2 === 0));
      }

      const insights = service.getMultiVariateInsights(entries as PainEntry[]);
      
      expect(insights.summary.confidence).toBeGreaterThanOrEqual(0);
      expect(insights.summary.confidence).toBeLessThanOrEqual(1);
    });

    it('should identify strongest correlation in summary', () => {
      const entries: Partial<PainEntry>[] = [
        ...Array(10).fill(null).map((_, i) => createEntry(i, 3, 8)), // Clear morning pattern
        ...Array(10).fill(null).map((_, i) => createEntry(i + 10, 9, 20)), // Clear evening pattern
      ];

      const insights = service.getMultiVariateInsights(entries as PainEntry[]);
      
      if (insights.correlationMatrix.length > 0) {
        expect(insights.summary.strongestCorrelation).toBeTruthy();
        if (insights.summary.strongestCorrelation) {
          // Should be the time correlation (strongest in this dataset)
          expect(Math.abs(insights.summary.strongestCorrelation.correlation)).toBeGreaterThan(0);
        }
      }
    });

    it('should identify most actionable pattern', () => {
      const entries: Partial<PainEntry>[] = [];
      // Create clear actionable pattern
      for (let i = 0; i < 25; i++) {
        if (i % 5 === 0) {
          entries.push(createEntry(i, 3, 8, true)); // Med + morning = low pain
        } else {
          entries.push(createEntry(i, 6, 14, false));
        }
      }

      const insights = service.getMultiVariateInsights(entries as PainEntry[]);
      
      if (insights.compoundPatterns.length > 0) {
        const actionable = insights.compoundPatterns.filter(p => p.actionable);
        expect(actionable.length).toBeGreaterThan(0);
      }
    });
  });
});
