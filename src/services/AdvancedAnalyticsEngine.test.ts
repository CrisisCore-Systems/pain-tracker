import { describe, it, expect, beforeEach } from 'vitest';
import { AdvancedAnalyticsEngine } from './AdvancedAnalyticsEngine';
import type { PainEntry, MoodEntry } from '../types/pain-tracker';

describe('AdvancedAnalyticsEngine', () => {
  let engine: AdvancedAnalyticsEngine;
  let mockEntries: PainEntry[];
  let mockMoodEntries: MoodEntry[];

  beforeEach(() => {
    engine = new AdvancedAnalyticsEngine();

    // Create mock pain entries spanning 2 weeks
    const now = new Date();
    mockEntries = Array.from({ length: 20 }, (_, i) => {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - i);
      timestamp.setHours(8 + (i % 12), 0, 0, 0);

      return {
        id: i + 1,
        timestamp: timestamp.toISOString(),
        intensity: 3 + (i % 7),
        location: 'Lower Back',
        quality: ['sharp', 'throbbing'],
        triggers: i % 3 === 0 ? ['sitting', 'stress'] : ['weather'],
        reliefMethods: i % 2 === 0 ? ['medication', 'rest'] : ['stretching'],
        activityLevel: 5 + (i % 5),
        notes: `Test entry ${i}`,
      };
    });

    // Create mock mood entries
    mockMoodEntries = Array.from({ length: 15 }, (_, i) => {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - i);
      timestamp.setHours(8 + (i % 12), 30, 0, 0);

      return {
        id: i + 1,
        timestamp: timestamp.toISOString(),
        mood: 5 + (i % 5),
        notes: `Mood entry ${i}`,
      };
    });
  });

  describe('calculateCorrelationMatrix', () => {
    it('should return empty array for insufficient data', () => {
      const result = engine.calculateCorrelationMatrix(mockEntries.slice(0, 5));
      expect(result).toEqual([]);
    });

    it('should calculate pain vs time of day correlation', () => {
      const results = engine.calculateCorrelationMatrix(mockEntries);
      
      expect(results.length).toBeGreaterThan(0);
      
      const timeCorrelation = results.find(
        (r) => r.variable1 === 'Pain Level' && r.variable2 === 'Hour of Day'
      );
      
      expect(timeCorrelation).toBeDefined();
      expect(timeCorrelation?.coefficient).toBeGreaterThanOrEqual(-1);
      expect(timeCorrelation?.coefficient).toBeLessThanOrEqual(1);
      expect(timeCorrelation?.sampleSize).toBe(mockEntries.length);
    });

    it('should calculate pain vs day of week correlation', () => {
      const results = engine.calculateCorrelationMatrix(mockEntries);
      
      const dayCorrelation = results.find(
        (r) => r.variable1 === 'Pain Level' && r.variable2 === 'Day of Week'
      );
      
      expect(dayCorrelation).toBeDefined();
      expect(['positive', 'negative', 'none']).toContain(dayCorrelation?.direction);
    });

    it('should include mood correlation when mood data provided', () => {
      const results = engine.calculateCorrelationMatrix(mockEntries, mockMoodEntries);
      
      const moodCorrelation = results.find(
        (r) => r.variable1 === 'Pain Level' && r.variable2 === 'Mood Score'
      );
      
      expect(moodCorrelation).toBeDefined();
    });

    it('should classify correlation strength correctly', () => {
      const results = engine.calculateCorrelationMatrix(mockEntries);
      
      results.forEach((result) => {
        expect(['very weak', 'weak', 'moderate', 'strong', 'very strong']).toContain(
          result.strength
        );
      });
    });

    it('should filter out results with insufficient sample size', () => {
      const results = engine.calculateCorrelationMatrix(mockEntries);
      
      results.forEach((result) => {
        expect(result.sampleSize).toBeGreaterThanOrEqual(10);
      });
    });
  });

  describe('scoreInterventions', () => {
    it('should return empty array when no interventions used', () => {
      const entriesWithoutInterventions = mockEntries.map((e) => ({
        ...e,
        reliefMethods: [],
      }));
      
      const scores = engine.scoreInterventions(entriesWithoutInterventions);
      expect(scores).toEqual([]);
    });

    it('should calculate effectiveness scores', () => {
      const scores = engine.scoreInterventions(mockEntries);
      
      expect(scores.length).toBeGreaterThan(0);
      
      scores.forEach((score) => {
        expect(score.effectivenessScore).toBeGreaterThanOrEqual(0);
        expect(score.effectivenessScore).toBeLessThanOrEqual(100);
        expect(score.usageCount).toBeGreaterThanOrEqual(3); // Min threshold
      });
    });

    it('should sort interventions by effectiveness', () => {
      const scores = engine.scoreInterventions(mockEntries);
      
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i - 1].effectivenessScore).toBeGreaterThanOrEqual(
          scores[i].effectivenessScore
        );
      }
    });

    it('should categorize interventions by type', () => {
      const scores = engine.scoreInterventions(mockEntries);
      
      scores.forEach((score) => {
        expect(['medication', 'treatment', 'coping_strategy', 'lifestyle']).toContain(
          score.type
        );
      });
    });

    it('should assign confidence levels based on usage', () => {
      const scores = engine.scoreInterventions(mockEntries);
      
      scores.forEach((score) => {
        expect(['low', 'medium', 'high']).toContain(score.confidence);
        
        if (score.usageCount >= 10) {
          expect(score.confidence).toBe('high');
        } else if (score.usageCount >= 5) {
          expect(score.confidence).toBe('medium');
        } else {
          expect(score.confidence).toBe('low');
        }
      });
    });

    it('should provide recommendations', () => {
      const scores = engine.scoreInterventions(mockEntries);
      
      scores.forEach((score) => {
        expect(score.recommendation).toBeTruthy();
        expect(score.recommendation.length).toBeGreaterThan(0);
      });
    });
  });

  describe('detectTriggerPatterns', () => {
    it('should return empty array when no triggers recorded', () => {
      const entriesWithoutTriggers = mockEntries.map((e) => ({
        ...e,
        triggers: [],
      }));
      
      const patterns = engine.detectTriggerPatterns(entriesWithoutTriggers);
      expect(patterns).toEqual([]);
    });

    it('should identify trigger patterns', () => {
      const patterns = engine.detectTriggerPatterns(mockEntries);
      
      expect(patterns.length).toBeGreaterThan(0);
      
      patterns.forEach((pattern) => {
        expect(pattern.frequency).toBeGreaterThanOrEqual(3); // Min threshold
        expect(pattern.riskScore).toBeGreaterThanOrEqual(0);
        expect(pattern.riskScore).toBeLessThanOrEqual(100);
      });
    });

    it('should sort patterns by risk score', () => {
      const patterns = engine.detectTriggerPatterns(mockEntries);
      
      for (let i = 1; i < patterns.length; i++) {
        expect(patterns[i - 1].riskScore).toBeGreaterThanOrEqual(
          patterns[i].riskScore
        );
      }
    });

    it('should analyze time of day patterns', () => {
      const patterns = engine.detectTriggerPatterns(mockEntries);
      
      const patternWithTime = patterns.find((p) => p.timeOfDayPattern);
      
      if (patternWithTime) {
        expect(patternWithTime.timeOfDayPattern).toBeDefined();
        patternWithTime.timeOfDayPattern?.forEach((time) => {
          expect(time.hour).toBeGreaterThanOrEqual(0);
          expect(time.hour).toBeLessThan(24);
          expect(time.count).toBeGreaterThan(0);
        });
      }
    });

    it('should analyze day of week patterns', () => {
      const patterns = engine.detectTriggerPatterns(mockEntries);
      
      const patternWithDays = patterns.find((p) => p.dayOfWeekPattern);
      
      if (patternWithDays) {
        expect(patternWithDays.dayOfWeekPattern).toBeDefined();
        patternWithDays.dayOfWeekPattern?.forEach((day) => {
          expect(day.day).toBeTruthy();
          expect(day.count).toBeGreaterThan(0);
        });
      }
    });

    it('should track associated symptoms', () => {
      const patterns = engine.detectTriggerPatterns(mockEntries);
      
      patterns.forEach((pattern) => {
        expect(Array.isArray(pattern.associatedSymptoms)).toBe(true);
      });
    });
  });

  describe('identifyPredictiveIndicators', () => {
    it('should return empty array for insufficient data', () => {
      const indicators = engine.identifyPredictiveIndicators(mockEntries.slice(0, 10));
      expect(indicators).toEqual([]);
    });

    it('should identify rapid escalation patterns', () => {
      // Create entries with rapid escalation
      const escalationEntries: PainEntry[] = [
        {
          id: 1,
          timestamp: new Date('2025-10-03T08:00:00').toISOString(),
          intensity: 4,
          location: 'Back',
          quality: [],
          triggers: [],
          reliefMethods: [],
        },
        {
          id: 2,
          timestamp: new Date('2025-10-03T10:00:00').toISOString(),
          intensity: 8,
          location: 'Back',
          quality: [],
          triggers: [],
          reliefMethods: [],
        },
        ...mockEntries, // Add more for sufficient data
      ];
      
      const indicators = engine.identifyPredictiveIndicators(escalationEntries);
      
      const escalation = indicators.find((i) => i.type === 'escalation');
      expect(escalation).toBeDefined();
      
      if (escalation) {
        expect(escalation.confidence).toBeGreaterThan(0);
        expect(escalation.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should categorize indicators by type', () => {
      const indicators = engine.identifyPredictiveIndicators(mockEntries);
      
      indicators.forEach((indicator) => {
        expect(['warning', 'onset', 'escalation']).toContain(indicator.type);
      });
    });

    it('should provide lead time estimates', () => {
      const indicators = engine.identifyPredictiveIndicators(mockEntries);
      
      indicators.forEach((indicator) => {
        expect(indicator.leadTime).toBeTruthy();
        expect(indicator.leadTime.length).toBeGreaterThan(0);
      });
    });

    it('should include descriptions', () => {
      const indicators = engine.identifyPredictiveIndicators(mockEntries);
      
      indicators.forEach((indicator) => {
        expect(indicator.description).toBeTruthy();
        expect(indicator.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('generateWeeklyClinicalBrief', () => {
    it('should generate brief with correct date range', () => {
      const brief = engine.generateWeeklyClinicalBrief(mockEntries, mockMoodEntries);
      
      expect(brief.weekStartDate).toBeInstanceOf(Date);
      expect(brief.weekEndDate).toBeInstanceOf(Date);
      
      const daysDiff =
        (brief.weekEndDate.getTime() - brief.weekStartDate.getTime()) /
        (1000 * 60 * 60 * 24);
      
      expect(daysDiff).toBeCloseTo(7, 1);
    });

    it('should calculate average pain level', () => {
      const brief = engine.generateWeeklyClinicalBrief(mockEntries, mockMoodEntries);
      
      expect(brief.avgPainLevel).toBeGreaterThanOrEqual(0);
      expect(brief.avgPainLevel).toBeLessThanOrEqual(10);
    });

    it('should determine trend correctly', () => {
      const brief = engine.generateWeeklyClinicalBrief(mockEntries, mockMoodEntries);
      
      expect(['improving', 'stable', 'worsening']).toContain(brief.overallTrend);
    });

    it('should provide key insights', () => {
      const brief = engine.generateWeeklyClinicalBrief(mockEntries, mockMoodEntries);
      
      expect(Array.isArray(brief.keyInsights)).toBe(true);
      expect(brief.keyInsights.length).toBeGreaterThan(0);
    });

    it('should identify top triggers', () => {
      const brief = engine.generateWeeklyClinicalBrief(mockEntries, mockMoodEntries);
      
      expect(Array.isArray(brief.topTriggers)).toBe(true);
    });

    it('should list effective interventions', () => {
      const brief = engine.generateWeeklyClinicalBrief(mockEntries, mockMoodEntries);
      
      expect(Array.isArray(brief.effectiveInterventions)).toBe(true);
    });

    it('should flag concerns', () => {
      const brief = engine.generateWeeklyClinicalBrief(mockEntries, mockMoodEntries);
      
      expect(Array.isArray(brief.concerns)).toBe(true);
      expect(brief.concerns.length).toBeGreaterThan(0);
    });

    it('should provide recommendations', () => {
      const brief = engine.generateWeeklyClinicalBrief(mockEntries, mockMoodEntries);
      
      expect(Array.isArray(brief.recommendations)).toBe(true);
      expect(brief.recommendations.length).toBeGreaterThan(0);
    });

    it('should include next steps', () => {
      const brief = engine.generateWeeklyClinicalBrief(mockEntries, mockMoodEntries);
      
      expect(Array.isArray(brief.nextSteps)).toBe(true);
      expect(brief.nextSteps.length).toBeGreaterThan(0);
    });

    it('should handle empty data gracefully', () => {
      const brief = engine.generateWeeklyClinicalBrief([], []);
      
      expect(brief.avgPainLevel).toBe(0);
      expect(brief.keyInsights).toContain('No pain entries recorded this week');
    });
  });

  describe('Edge cases', () => {
    it('should handle single entry', () => {
      const singleEntry = [mockEntries[0]];
      
      expect(() => engine.calculateCorrelationMatrix(singleEntry)).not.toThrow();
      expect(() => engine.scoreInterventions(singleEntry)).not.toThrow();
      expect(() => engine.detectTriggerPatterns(singleEntry)).not.toThrow();
      expect(() => engine.identifyPredictiveIndicators(singleEntry)).not.toThrow();
      expect(() =>
        engine.generateWeeklyClinicalBrief(singleEntry)
      ).not.toThrow();
    });

    it('should handle entries without optional fields', () => {
      const minimalEntries: PainEntry[] = [
        {
          id: 1,
          timestamp: new Date().toISOString(),
          intensity: 5,
          location: 'Back',
          quality: [],
          triggers: [],
          reliefMethods: [],
        },
      ];
      
      expect(() => engine.calculateCorrelationMatrix(minimalEntries)).not.toThrow();
      expect(() => engine.scoreInterventions(minimalEntries)).not.toThrow();
    });

    it('should handle very large datasets', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        ...mockEntries[0],
        id: i,
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      }));
      
      expect(() => engine.calculateCorrelationMatrix(largeDataset)).not.toThrow();
      expect(() => engine.scoreInterventions(largeDataset)).not.toThrow();
    }, 10000);
  });
});
