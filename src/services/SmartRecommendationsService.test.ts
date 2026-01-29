/**
 * Tests for SmartRecommendationsService
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { smartRecommendationsService } from '../../packages/services/src/SmartRecommendationsService';
import type { PainEntry } from '../types';

describe('SmartRecommendationsService', () => {
  let mockEntries: PainEntry[];

  const medications = (names: string[]) => ({
    current: names.map(name => ({ name, dosage: '', frequency: '', effectiveness: '' })),
    changes: '',
    effectiveness: '',
  });

  const withPain = (entry: PainEntry, pain: number): PainEntry => ({
    ...entry,
    baselineData: {
      ...entry.baselineData,
      pain,
    },
    intensity: pain,
  });

  const withMedNames = (entry: PainEntry, names: string[]): PainEntry => ({
    ...entry,
    medications: medications(names),
  });

  const makeEntry = (params: { id: number; timestamp: string; pain?: number; location?: string; quality?: string[]; notes?: string }): PainEntry => {
    const pain = params.pain ?? 5;
    const location = params.location ?? 'back';
    const quality = params.quality ?? ['sharp'];

    return {
      id: params.id,
      timestamp: params.timestamp,
      baselineData: {
        pain,
        locations: location ? [location] : [],
        symptoms: [],
      },
      functionalImpact: {
        limitedActivities: [],
        assistanceNeeded: [],
        mobilityAids: [],
      },
      medications: medications([]),
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
      notes: params.notes ?? '',
      location,
      quality,
      intensity: pain,
    };
  };

  beforeEach(() => {
    // Create base mock entries
    mockEntries = [];
    // Keep all mock entries in the past relative to test execution time,
    // so “last 7 days” logic is stable and never includes future timestamps.
    const baseDate = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000);
    baseDate.setHours(10, 0, 0, 0);
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      
      mockEntries.push(
        makeEntry({
          id: i + 1,
          timestamp: date.toISOString(),
          pain: 5,
          location: 'back',
          quality: ['sharp'],
          notes: '',
        })
      );
    }
  });

  describe('Insufficient Data', () => {
    it('should provide baseline recommendation with < 7 entries', () => {
      const entries = mockEntries.slice(0, 4);
      const result = smartRecommendationsService.getSmartRecommendations(entries);

      expect(result.topRecommendations).toHaveLength(1);
      expect(result.topRecommendations[0].id).toBe('build-baseline');
      expect(result.topRecommendations[0].category).toBe('tracking');
      expect(result.topRecommendations[0].priority).toBe('high');
      expect(result.summary.totalRecommendations).toBe(1);
    });

    it('should indicate days needed in recommendation', () => {
      const entries = mockEntries.slice(0, 3);
      const result = smartRecommendationsService.getSmartRecommendations(entries);

      expect(result.topRecommendations[0].description).toContain('4 more days');
    });
  });

  describe('High Pain Recommendations', () => {
    it('should recommend intervention for high pain (>6.5)', () => {
      const entries = mockEntries.map((e, i) => withPain(e, i < 7 ? 7 : 7.5));

      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      const highPainRec = result.topRecommendations.find(r => r.id === 'high-pain-management');
      expect(highPainRec).toBeDefined();
      expect(highPainRec?.category).toBe('intervention');
      expect(highPainRec?.priority).toMatch(/critical|high/);
      expect(highPainRec?.confidence).toBeGreaterThan(0.7);
    });

    it('should mark as critical if trending up', () => {
      const entries = mockEntries.map((e, i) => withPain(e, i < 7 ? 6 : 8));

      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      const highPainRec = result.topRecommendations.find(r => r.id === 'high-pain-management');
      expect(highPainRec?.priority).toBe('critical');
    });

    it('should include actionable steps', () => {
      const entries = mockEntries.map(e => withPain(e, 7.5));
      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      const highPainRec = result.topRecommendations.find(r => r.id === 'high-pain-management');
      expect(highPainRec?.actionSteps).toBeDefined();
      expect(highPainRec?.actionSteps.length).toBeGreaterThan(0);
    });
  });

  describe('Trend-Based Recommendations', () => {
    it('should detect increasing pain trend', () => {
      const entries = mockEntries.map((e, i) => withPain(e, i < 7 ? 4 : 6));

      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      const trendRec = result.topRecommendations.find(r => r.id === 'address-trend');
      expect(trendRec).toBeDefined();
      expect(trendRec?.category).toBe('prevention');
      expect(trendRec?.priority).toBe('high');
    });

    it('should celebrate decreasing pain trend', () => {
      const entries = mockEntries.map((e, i) => withPain(e, i < 7 ? 6 : 4.5));

      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      const maintainRec = result.topRecommendations.find(r => r.id === 'maintain-progress');
      expect(maintainRec).toBeDefined();
      expect(maintainRec?.category).toBe('lifestyle');
    });

    it('should provide reasoning for trend recommendations', () => {
      const entries = mockEntries.map((e, i) => withPain(e, i < 7 ? 4 : 6));

      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      const trendRec = result.topRecommendations.find(r => r.id === 'address-trend');
      expect(trendRec?.reasoning).toBeDefined();
      expect(trendRec?.reasoning.length).toBeGreaterThan(0);
    });
  });

  describe('Medication Recommendations', () => {
    it('should recommend consistent medication use when effective', () => {
      const entries = mockEntries.map((e, i) => {
        const withMaybeMeds = i % 2 === 0 ? withMedNames(e, ['ibuprofen']) : withMedNames(e, []);
        return withPain(withMaybeMeds, i % 2 === 0 ? 4 : 7);
      });

      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      const medRec = result.topRecommendations.find(r => r.id === 'medication-optimization');
      expect(medRec).toBeDefined();
      expect(medRec?.category).toBe('medication');
      expect(medRec?.priority).toBe('high');
    });

    it('should require minimum samples for medication recommendations', () => {
      const entries = mockEntries.slice(0, 7).map((e, i) => {
        const withMaybeMeds = i % 2 === 0 ? withMedNames(e, ['ibuprofen']) : withMedNames(e, []);
        return withPain(withMaybeMeds, i % 2 === 0 ? 4 : 7);
      });
      // Only 3-4 samples of each

      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      // Should still provide recommendation if effect is clear
      const medRec = result.topRecommendations.find(r => r.id === 'medication-optimization');
      if (medRec) {
        expect(medRec.confidence).toBeLessThan(0.8);
      }
    });
  });

  describe('Tracking Consistency Recommendations', () => {
    it('should recommend improved tracking with sparse data', () => {
      const entries = mockEntries.slice(0, 3); // Only 3 entries in 7 days
      entries.forEach((e, i) => {
        e.baselineData.pain = 6;
        e.intensity = 6;
      });

      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      // Note: Will get baseline recommendation instead since < 7 total
      expect(result.topRecommendations[0].category).toBe('tracking');
    });

    it('should recommend tracking with sufficient but sparse recent data', () => {
      // 14 entries total, but only 2 in last 7 days
      const entries = [...mockEntries];
      const recentSparse = entries.slice(-7).slice(0, 2);
      const olderData = entries.slice(0, 7);
      const combined = [...olderData, ...recentSparse];

      const result = smartRecommendationsService.getSmartRecommendations(combined);
      
      const trackingRec = result.topRecommendations.find(r => r.id === 'tracking-consistency');
      expect(trackingRec).toBeDefined();
      expect(trackingRec?.category).toBe('tracking');
    });
  });

  describe('Time-Based Recommendations', () => {
    it('should detect evening pain spikes', () => {
      const entries = mockEntries.map((e, i) => {
        const date = new Date(e.timestamp);
        const hour = i % 2 === 0 ? 8 : 20; // Morning vs evening
        date.setHours(hour);
        
        return withPain({ ...e, timestamp: date.toISOString() }, i % 2 === 0 ? 4 : 7);
      });

      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      const eveningRec = result.topRecommendations.find(r => r.id === 'evening-pain-management');
      expect(eveningRec).toBeDefined();
      expect(eveningRec?.category).toBe('prevention');
      expect(eveningRec?.timing).toMatch(/afternoon/i);
    });

    it('should provide specific timing for interventions', () => {
      const entries = mockEntries.map((e, i) => {
        const date = new Date(e.timestamp);
        date.setHours(i % 2 === 0 ? 8 : 20);
        return withPain({ ...e, timestamp: date.toISOString() }, i % 2 === 0 ? 4 : 7);
      });

      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      const eveningRec = result.topRecommendations.find(r => r.id === 'evening-pain-management');
      expect(eveningRec?.actionSteps).toBeDefined();
      expect(eveningRec?.actionSteps.some(step => step.includes('4-5 PM'))).toBeTruthy();
    });
  });

  describe('Timing Optimizations', () => {
    it('should optimize medication timing based on history', () => {
      const entries = mockEntries.map((e, i) => {
        const date = new Date(e.timestamp);
        date.setHours(8); // Consistent morning timing
        return withMedNames({ ...e, timestamp: date.toISOString() }, ['ibuprofen']);
      });

      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      expect(result.timingOptimizations.length).toBeGreaterThan(0);
      const medTiming = result.timingOptimizations.find(t => t.action.includes('medication'));
      expect(medTiming).toBeDefined();
      expect(medTiming?.optimalTime).toContain('8:00');
    });

    it('should recommend optimal tracking time', () => {
      const entries = mockEntries.map((e, i) => {
        const date = new Date(e.timestamp);
        date.setHours(9); // Consistent timing
        return {
          ...e,
          timestamp: date.toISOString()
        };
      });

      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      const trackingTiming = result.timingOptimizations.find(t => t.action.includes('tracking'));
      expect(trackingTiming).toBeDefined();
      expect(trackingTiming?.confidence).toBeGreaterThan(0.5);
    });

    it('should suggest activity timing based on pain patterns', () => {
      const entries = mockEntries.map((e, i) => {
        const date = new Date(e.timestamp);
        const hour = i % 2 === 0 ? 9 : 15; // Morning vs afternoon
        date.setHours(hour);
        
        return withPain({ ...e, timestamp: date.toISOString() }, i % 2 === 0 ? 3 : 6);
      });

      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      const activityTiming = result.timingOptimizations.find(t => t.action.includes('activity'));
      expect(activityTiming).toBeDefined();
      expect(activityTiming?.optimalTime).toContain('Morning');
    });
  });

  describe('Intervention Rankings', () => {
    it('should rank medication by effectiveness', () => {
      const entries = mockEntries.map((e, i) => {
        const withMaybeMeds = i % 2 === 0 ? withMedNames(e, ['ibuprofen']) : withMedNames(e, []);
        return withPain(withMaybeMeds, i % 2 === 0 ? 4 : 7);
      });

      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      expect(result.interventionRankings.length).toBeGreaterThan(0);
      const medRanking = result.interventionRankings.find(r => r.intervention.includes('medication'));
      expect(medRanking).toBeDefined();
      expect(medRanking?.effectivenessScore).toBeGreaterThan(0);
    });

    it('should rank rest/sleep by effectiveness', () => {
      const entries: PainEntry[] = [];
      const baseDate = new Date('2026-01-20T20:00:00Z');
      
      for (let i = 0; i < 10; i++) {
        // Evening entry
        const eveningDate = new Date(baseDate);
        eveningDate.setDate(eveningDate.getDate() + i);
        entries.push(
          makeEntry({
            id: i * 2 + 1,
            timestamp: eveningDate.toISOString(),
            pain: 6,
            location: 'back',
            quality: ['aching'],
            notes: '',
          })
        );
        
        // Morning entry (after sleep)
        const morningDate = new Date(eveningDate);
        morningDate.setHours(morningDate.getHours() + 12);
        entries.push(
          makeEntry({
            id: i * 2 + 2,
            timestamp: morningDate.toISOString(),
            pain: 4,
            location: 'back',
            quality: ['aching'],
            notes: '',
          })
        );
      }

      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      const restRanking = result.interventionRankings.find(r => r.intervention.includes('Rest'));
      expect(restRanking).toBeDefined();
      expect(restRanking?.effectivenessScore).toBeGreaterThan(0);
    });

    it('should provide recommendation level based on effectiveness', () => {
      const entries = mockEntries.map((e, i) => {
        const withMaybeMeds = i % 2 === 0 ? withMedNames(e, ['ibuprofen']) : withMedNames(e, []);
        return withPain(withMaybeMeds, i % 2 === 0 ? 3 : 8);
      });

      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      const medRanking = result.interventionRankings.find(r => r.intervention.includes('medication'));
      expect(medRanking?.recommendation).toBe('highly_recommended');
    });
  });

  describe('Action Plans', () => {
    it('should create pain reduction plan for high pain', () => {
      const entries = mockEntries.map(e => withPain(e, 7));
      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      const painPlan = result.actionPlans.find(p => p.goal.includes('Reduce'));
      expect(painPlan).toBeDefined();
      expect(painPlan?.steps.length).toBeGreaterThan(0);
      expect(painPlan?.timeframe).toBeDefined();
    });

    it('should create tracking consistency plan for sparse data', () => {
      // Sufficient total data, but sparse recent tracking
      const olderData = mockEntries.slice(0, 7);
      const recentSparse = mockEntries.slice(-7).slice(0, 2);
      const result = smartRecommendationsService.getSmartRecommendations([...olderData, ...recentSparse]);
      
      const trackingPlan = result.actionPlans.find(p => p.goal.includes('Track'));
      expect(trackingPlan).toBeDefined();
    });

    it('should include step-by-step actions', () => {
      const entries = mockEntries.map(e => withPain(e, 6));
      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      if (result.actionPlans.length > 0) {
        const plan = result.actionPlans[0];
        expect(plan.steps.length).toBeGreaterThan(0);
        expect(plan.steps[0]).toHaveProperty('step');
        expect(plan.steps[0]).toHaveProperty('action');
        expect(plan.steps[0]).toHaveProperty('timing');
        expect(plan.steps[0]).toHaveProperty('expected');
      }
    });

    it('should include estimated impact', () => {
      const entries = mockEntries.map(e => withPain(e, 7));
      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      const painPlan = result.actionPlans.find(p => p.goal.includes('Reduce'));
      expect(painPlan?.estimatedImpact).toBeDefined();
      expect(painPlan?.estimatedImpact).toContain('from');
    });
  });

  describe('Summary Metrics', () => {
    it('should calculate summary metrics correctly', () => {
      const entries = mockEntries.map(e => withPain(e, 7));
      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      expect(result.summary).toBeDefined();
      expect(result.summary.totalRecommendations).toBeGreaterThan(0);
      expect(result.summary.confidence).toBeGreaterThan(0);
      expect(result.summary.confidence).toBeLessThanOrEqual(1);
    });

    it('should count critical actions', () => {
      const entries = mockEntries.map(e => withPain(e, 8));
      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      expect(result.summary.criticalActions).toBeGreaterThanOrEqual(0);
    });

    it('should estimate overall impact', () => {
      const entries = mockEntries.map(e => withPain(e, 7));
      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      expect(result.summary.estimatedImpact).toMatch(/high|medium|moderate/);
    });
  });

  describe('Recommendation Prioritization', () => {
    it('should sort recommendations by priority and confidence', () => {
      const entries = mockEntries.map((e, i) => withPain(e, i < 7 ? 4 : 8));

      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      // Should prioritize critical/high priority items
      if (result.topRecommendations.length > 1) {
        const first = result.topRecommendations[0];
        const second = result.topRecommendations[1];
        
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const firstPriority = priorityOrder[first.priority];
        const secondPriority = priorityOrder[second.priority];
        
        expect(firstPriority).toBeLessThanOrEqual(secondPriority);
      }
    });

    it('should limit to top recommendations', () => {
      const entries = mockEntries.map(e => withPain(e, 7));
      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      expect(result.topRecommendations.length).toBeLessThanOrEqual(8);
    });
  });

  describe('Recommendation Completeness', () => {
    it('should include all required fields', () => {
      const entries = mockEntries.map(e => withPain(e, 7));
      const result = smartRecommendationsService.getSmartRecommendations(entries);
      
      if (result.topRecommendations.length > 0) {
        const rec = result.topRecommendations[0];
        expect(rec.id).toBeDefined();
        expect(rec.title).toBeDefined();
        expect(rec.description).toBeDefined();
        expect(rec.category).toBeDefined();
        expect(rec.priority).toBeDefined();
        expect(rec.timing).toBeDefined();
        expect(rec.expectedBenefit).toBeDefined();
        expect(rec.confidence).toBeDefined();
        expect(rec.reasoning).toBeDefined();
        expect(rec.actionSteps).toBeDefined();
        expect(rec.estimatedEffort).toBeDefined();
      }
    });
  });
});
