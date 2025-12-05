/**
 * Tests for the Humanize Utility
 * 
 * Validates that raw pain data is transformed into meaningful, empathetic language.
 */

import { describe, it, expect } from 'vitest';
import type { PainEntry } from '../../types';
import {
  describePainLevel,
  describeTrend,
  describeStreak,
  describeEntryCount,
  describeBestDay,
  describeChallengingDay,
  getTimeBasedGreeting,
  describeImprovementRate,
  generateHumanizedSummary,
  // New pattern analysis functions
  analyzeTimeOfDayPatterns,
  analyzeDayOfWeekPatterns,
  analyzeTriggerPatterns,
  generateComparativeInsight,
  getEnhancedGreeting,
} from '../humanize';

// Helper to create mock pain entries
function createMockEntry(
  pain: number, 
  daysAgo: number = 0, 
  hour: number = 12,
  triggers: string[] = []
): PainEntry {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  
  return {
    id: `entry-${Date.now()}-${Math.random()}`,
    timestamp: date.toISOString(),
    baselineData: {
      pain,
      locations: [],
      symptoms: [],
    },
    triggers,
    notes: '',
  };
}

describe('Humanize Utility', () => {
  describe('describePainLevel', () => {
    it('describes no pain correctly', () => {
      const result = describePainLevel(0);
      expect(result.level).toBe('No pain');
      expect(result.emoji).toBe('✨');
      expect(result.description).toContain('no pain');
      expect(result.suggestion).toBeDefined();
    });

    it('describes minimal pain (1-2)', () => {
      const result = describePainLevel(2);
      expect(result.level).toBe('Minimal');
      expect(result.emoji).toBe('🌿');
    });

    it('describes mild pain (3-4)', () => {
      const result = describePainLevel(4);
      expect(result.level).toBe('Mild');
      expect(result.emoji).toBe('🌤️');
    });

    it('describes moderate pain (5-6)', () => {
      const result = describePainLevel(6);
      expect(result.level).toBe('Moderate');
      expect(result.emoji).toBe('🌥️');
    });

    it('describes significant pain (7-8)', () => {
      const result = describePainLevel(8);
      expect(result.level).toBe('Significant');
      expect(result.emoji).toBe('⛈️');
    });

    it('describes severe pain (9-10)', () => {
      const result = describePainLevel(10);
      expect(result.level).toBe('Severe');
      expect(result.emoji).toBe('🌊');
    });

    it('provides suggestions at all levels', () => {
      for (let i = 0; i <= 10; i++) {
        const result = describePainLevel(i);
        expect(result.suggestion).toBeTruthy();
      }
    });
  });

  describe('describeTrend', () => {
    it('returns building message when not enough data', () => {
      const result = describeTrend(5, 5, false);
      expect(result.direction).toBe('stable');
      expect(result.detail).toContain('more data');
    });

    it('detects significant improvement', () => {
      const result = describeTrend(3, 6, true);
      expect(result.direction).toBe('improving');
      expect(result.headline).toContain('improvement');
    });

    it('detects mild improvement', () => {
      const result = describeTrend(4, 5, true);
      expect(result.direction).toBe('improving');
      expect(result.detail).toContain('eased');
    });

    it('detects significant worsening', () => {
      const result = describeTrend(7, 4, true);
      expect(result.direction).toBe('worsening');
    });

    it('detects mild worsening', () => {
      const result = describeTrend(5.5, 5, true);
      expect(result.direction).toBe('worsening');
      expect(result.actionItem).toBeTruthy();
    });

    it('detects stability', () => {
      const result = describeTrend(5, 5.2, true);
      expect(result.direction).toBe('stable');
      expect(result.detail).toContain('consistent');
    });
  });

  describe('describeStreak', () => {
    it('encourages starting when streak is 0', () => {
      const result = describeStreak(0);
      expect(result.message).toContain('Start');
      expect(result.milestone).toBeNull();
    });

    it('celebrates first day', () => {
      const result = describeStreak(1);
      expect(result.message).toContain('today');
    });

    it('counts down to 7-day milestone', () => {
      const result = describeStreak(5);
      expect(result.encouragement).toContain('2 more days');
    });

    it('celebrates 7-day milestone', () => {
      const result = describeStreak(7);
      expect(result.milestone).toBe('7-day streak achieved!');
      expect(result.message).toContain('week');
    });

    it('celebrates 14-day milestone', () => {
      const result = describeStreak(14);
      expect(result.milestone).toBe('14-day streak achieved!');
    });

    it('celebrates 30-day milestone', () => {
      const result = describeStreak(30);
      expect(result.milestone).toBe('30-day streak achieved!');
    });

    it('celebrates multi-month milestones', () => {
      const result = describeStreak(60);
      expect(result.milestone).toContain('2-month');
    });
  });

  describe('describeEntryCount', () => {
    it('identifies minimal data', () => {
      const result = describeEntryCount(3, 2);
      expect(result.dataQuality).toBe('minimal');
    });

    it('identifies growing data', () => {
      const result = describeEntryCount(15, 5);
      expect(result.dataQuality).toBe('growing');
    });

    it('identifies solid data', () => {
      const result = describeEntryCount(50, 7);
      expect(result.dataQuality).toBe('solid');
    });

    it('identifies rich data', () => {
      const result = describeEntryCount(100, 7);
      expect(result.dataQuality).toBe('rich');
    });

    it('celebrates perfect week', () => {
      const result = describeEntryCount(30, 7);
      expect(result.weeklyMessage).toContain('Every day');
    });
  });

  describe('describeBestDay', () => {
    it('returns null for undefined entry', () => {
      expect(describeBestDay(undefined)).toBeNull();
    });

    it('describes a good day appropriately', () => {
      const entry = createMockEntry(2, 3);
      const result = describeBestDay(entry);
      expect(result).not.toBeNull();
      expect(result!.headline).toContain('2/10');
      expect(result!.insight).toContain('good day');
    });

    it('describes manageable day differently', () => {
      const entry = createMockEntry(4, 2);
      const result = describeBestDay(entry);
      expect(result!.insight).toContain('manageable');
    });

    it('acknowledges when best day still had significant pain', () => {
      const entry = createMockEntry(7, 1);
      const result = describeBestDay(entry);
      expect(result!.insight).toContain('significant pain');
    });
  });

  describe('describeChallengingDay', () => {
    it('returns null for undefined entry', () => {
      expect(describeChallengingDay(undefined)).toBeNull();
    });

    it('identifies very difficult days', () => {
      const entry = createMockEntry(9, 2);
      const result = describeChallengingDay(entry);
      expect(result!.insight).toContain('difficult');
    });

    it('provides encouragement for moderate worst days', () => {
      const entry = createMockEntry(5, 1);
      const result = describeChallengingDay(entry);
      expect(result!.insight).toContain('encouraging');
    });
  });

  describe('generateHumanizedSummary', () => {
    it('handles new users with few entries', () => {
      const result = generateHumanizedSummary(5, 0, 1, 2);
      expect(result).toContain('getting started');
    });

    it('generates summary with sufficient data', () => {
      const result = generateHumanizedSummary(5, -1, 7, 10);
      expect(result).toContain('averaged');
    });

    it('includes trend information', () => {
      const improving = generateHumanizedSummary(3, -2, 5, 20);
      expect(improving).toContain('trending downward');
      
      const worsening = generateHumanizedSummary(7, 2, 5, 20);
      expect(worsening).toContain('trending upward');
    });
  });

  describe('getTimeBasedGreeting', () => {
    it('returns greeting and suggestion', () => {
      const result = getTimeBasedGreeting();
      expect(result.greeting).toBeTruthy();
      expect(result.suggestion).toBeTruthy();
    });
  });

  describe('describeImprovementRate', () => {
    it('identifies major improvement', () => {
      const result = describeImprovementRate(-25);
      expect(result.label).toBe('Major improvement');
      expect(result.tone).toBe('positive');
    });

    it('identifies moderate improvement', () => {
      const result = describeImprovementRate(-10);
      expect(result.label).toBe('Improving');
      expect(result.tone).toBe('positive');
    });

    it('identifies stability', () => {
      const result = describeImprovementRate(0);
      expect(result.label).toBe('Stable');
      expect(result.tone).toBe('neutral');
    });

    it('identifies slight increase', () => {
      const result = describeImprovementRate(10);
      expect(result.label).toBe('Slight increase');
      expect(result.tone).toBe('attention');
    });

    it('identifies needs attention', () => {
      const result = describeImprovementRate(30);
      expect(result.label).toBe('Needs attention');
      expect(result.tone).toBe('attention');
    });
  });

  // ============================================
  // NEW: Time-of-Day Pattern Analysis Tests
  // ============================================

  describe('analyzeTimeOfDayPatterns', () => {
    it('returns not enough data message with fewer than 5 entries', () => {
      const entries = [
        createMockEntry(5, 0, 8),
        createMockEntry(6, 1, 14),
      ];
      const result = analyzeTimeOfDayPatterns(entries);
      expect(result.hasEnoughData).toBe(false);
      expect(result.patterns).toHaveLength(0);
      expect(result.insight).toContain('more entries');
    });

    it('identifies morning pain pattern', () => {
      // Create entries with higher morning pain
      const entries = [
        createMockEntry(7, 0, 8),  // morning - high
        createMockEntry(8, 1, 9),  // morning - high
        createMockEntry(4, 0, 14), // afternoon - low
        createMockEntry(3, 1, 15), // afternoon - low
        createMockEntry(5, 0, 19), // evening - medium
        createMockEntry(5, 1, 20), // evening - medium
      ];
      const result = analyzeTimeOfDayPatterns(entries);
      expect(result.hasEnoughData).toBe(true);
      expect(result.worstTimeOfDay).toContain('Morning');
      expect(result.bestTimeOfDay).toContain('Afternoon');
      expect(result.insight).toContain('higher');
    });

    it('identifies evening pain pattern', () => {
      const entries = [
        createMockEntry(3, 0, 8),  // morning - low
        createMockEntry(3, 1, 9),  // morning - low
        createMockEntry(4, 0, 14), // afternoon - medium
        createMockEntry(4, 1, 15), // afternoon - medium
        createMockEntry(7, 0, 19), // evening - high
        createMockEntry(8, 1, 20), // evening - high
      ];
      const result = analyzeTimeOfDayPatterns(entries);
      expect(result.hasEnoughData).toBe(true);
      expect(result.worstTimeOfDay).toContain('Evening');
      expect(result.bestTimeOfDay).toContain('Morning');
    });

    it('reports consistency when pain is similar across times', () => {
      const entries = [
        createMockEntry(5, 0, 8),
        createMockEntry(5, 1, 9),
        createMockEntry(5, 0, 14),
        createMockEntry(5, 1, 15),
        createMockEntry(5, 0, 19),
      ];
      const result = analyzeTimeOfDayPatterns(entries);
      expect(result.insight).toContain('consistent');
    });
  });

  // ============================================
  // NEW: Day-of-Week Pattern Analysis Tests
  // ============================================

  describe('analyzeDayOfWeekPatterns', () => {
    it('returns not enough data message with fewer than 7 entries', () => {
      const entries = [
        createMockEntry(5, 0),
        createMockEntry(6, 1),
        createMockEntry(4, 2),
      ];
      const result = analyzeDayOfWeekPatterns(entries);
      expect(result.hasEnoughData).toBe(false);
      expect(result.insight).toContain('week of entries');
    });

    it('identifies weekend vs weekday difference', () => {
      // Create entries - need to calculate actual days
      const entries: PainEntry[] = [];
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      // Add weekday entries (low pain)
      for (let i = 0; i < 5; i++) {
        const daysBack = (dayOfWeek - 1 - i + 7) % 7 || 7; // Monday-Friday
        entries.push(createMockEntry(3, daysBack));
      }
      
      // Add weekend entries (high pain)
      const saturdayBack = (dayOfWeek - 6 + 7) % 7 || 7;
      const sundayBack = (dayOfWeek + 7) % 7 || 7;
      entries.push(createMockEntry(7, saturdayBack));
      entries.push(createMockEntry(8, sundayBack));
      
      const result = analyzeDayOfWeekPatterns(entries);
      expect(result.hasEnoughData).toBe(true);
      expect(result.weekdayAvg).toBeLessThan(result.weekendAvg!);
    });

    it('calculates day-specific averages', () => {
      // Create 2 entries for each of 7 days
      const entries: PainEntry[] = [];
      for (let day = 0; day < 7; day++) {
        // Pain level corresponds to day (Sunday=0 has pain 4, Saturday=6 has pain 10)
        entries.push(createMockEntry(day + 4, day));
        entries.push(createMockEntry(day + 4, day + 7)); // Same day, week before
      }
      
      const result = analyzeDayOfWeekPatterns(entries);
      expect(result.patterns.length).toBeGreaterThan(0);
      expect(result.bestDay).toBeDefined();
      expect(result.worstDay).toBeDefined();
    });
  });

  // ============================================
  // NEW: Trigger Correlation Tests
  // ============================================

  describe('analyzeTriggerPatterns', () => {
    it('returns not enough data with fewer than 10 entries', () => {
      const entries = Array.from({ length: 5 }, (_, i) => 
        createMockEntry(5, i, 12, ['stress'])
      );
      const result = analyzeTriggerPatterns(entries);
      expect(result.hasEnoughData).toBe(false);
      expect(result.insight).toContain('More entries');
    });

    it('identifies strong trigger correlation', () => {
      // Create entries: some with "stress" trigger (high pain), some without (low pain)
      const entries: PainEntry[] = [];
      
      // 5 entries WITH stress trigger - high pain
      for (let i = 0; i < 5; i++) {
        const entry = createMockEntry(8, i, 12);
        entry.triggers = ['stress'];
        entries.push(entry);
      }
      
      // 3 entries WITH weather trigger - medium pain (for hasEnoughData to be true)
      for (let i = 5; i < 8; i++) {
        const entry = createMockEntry(5, i, 12);
        entry.triggers = ['weather'];
        entries.push(entry);
      }
      
      // 4 entries WITHOUT any trigger - low pain
      for (let i = 8; i < 12; i++) {
        entries.push(createMockEntry(3, i, 12));
      }
      
      const result = analyzeTriggerPatterns(entries);
      expect(result.hasEnoughData).toBe(true);
      expect(result.topTrigger).toBe('stress');
      expect(result.correlations.length).toBeGreaterThan(0);
      
      const stressCorrelation = result.correlations.find(c => c.trigger === 'stress');
      expect(stressCorrelation?.impact).toBe('strong');
    });

    it('identifies multiple triggers with different impacts', () => {
      const entries: PainEntry[] = [];
      
      // Stress: strong correlation (appears with high pain)
      for (let i = 0; i < 4; i++) {
        const entry = createMockEntry(8, i, 12);
        entry.triggers = ['stress'];
        entries.push(entry);
      }
      
      // Weather: moderate correlation
      for (let i = 4; i < 7; i++) {
        const entry = createMockEntry(6, i, 12);
        entry.triggers = ['weather'];
        entries.push(entry);
      }
      
      // No trigger: low pain
      for (let i = 7; i < 12; i++) {
        entries.push(createMockEntry(3, i, 12));
      }
      
      const result = analyzeTriggerPatterns(entries);
      expect(result.correlations.length).toBe(2);
      
      // Stress should have stronger impact than weather
      const stressCorr = result.correlations.find(c => c.trigger === 'stress');
      const weatherCorr = result.correlations.find(c => c.trigger === 'weather');
      expect(stressCorr!.avgPainWith).toBeGreaterThan(weatherCorr!.avgPainWith);
    });

    it('reports when no strong patterns detected', () => {
      // All entries have similar pain regardless of triggers
      const entries: PainEntry[] = [];
      for (let i = 0; i < 12; i++) {
        const entry = createMockEntry(5, i, 12);
        if (i % 2 === 0) {
          entry.triggers = ['random'];
        }
        entries.push(entry);
      }
      
      const result = analyzeTriggerPatterns(entries);
      expect(result.insight).toContain('No strong trigger patterns');
    });
  });

  // ============================================
  // NEW: Comparative Insight Tests
  // ============================================

  describe('generateComparativeInsight', () => {
    it('returns null with insufficient data', () => {
      const currentWeek = [createMockEntry(5, 0)];
      const previousWeek = [createMockEntry(5, 7)];
      const result = generateComparativeInsight(currentWeek, previousWeek);
      expect(result).toBeNull();
    });

    it('detects improvement', () => {
      const currentWeek = [
        createMockEntry(3, 0),
        createMockEntry(4, 1),
        createMockEntry(3, 2),
      ];
      const previousWeek = [
        createMockEntry(7, 7),
        createMockEntry(6, 8),
        createMockEntry(7, 9),
      ];
      
      const result = generateComparativeInsight(currentWeek, previousWeek);
      expect(result).not.toBeNull();
      expect(result!.trend).toBe('better');
      expect(result!.currentValue).toBeLessThan(result!.previousValue);
      expect(result!.humanized).toContain('lower');
    });

    it('detects worsening', () => {
      const currentWeek = [
        createMockEntry(7, 0),
        createMockEntry(8, 1),
        createMockEntry(7, 2),
      ];
      const previousWeek = [
        createMockEntry(3, 7),
        createMockEntry(4, 8),
        createMockEntry(3, 9),
      ];
      
      const result = generateComparativeInsight(currentWeek, previousWeek);
      expect(result).not.toBeNull();
      expect(result!.trend).toBe('worse');
      expect(result!.currentValue).toBeGreaterThan(result!.previousValue);
      expect(result!.humanized).toContain('tougher');
    });

    it('detects stability', () => {
      const currentWeek = [
        createMockEntry(5, 0),
        createMockEntry(5, 1),
        createMockEntry(5, 2),
      ];
      const previousWeek = [
        createMockEntry(5, 7),
        createMockEntry(5, 8),
        createMockEntry(5, 9),
      ];
      
      const result = generateComparativeInsight(currentWeek, previousWeek);
      expect(result).not.toBeNull();
      expect(result!.trend).toBe('same');
      expect(result!.humanized).toContain('similar');
    });
  });

  // ============================================
  // NEW: Enhanced Greeting Tests
  // ============================================

  describe('getEnhancedGreeting', () => {
    it('provides personalized greeting with name', () => {
      const result = getEnhancedGreeting([], 'Alex');
      expect(result.greeting).toContain('Alex');
    });

    it('encourages new users to start tracking', () => {
      const result = getEnhancedGreeting([]);
      expect(result.personalizedMessage).toContain('first entry');
    });

    it('provides data-aware insight for users with entries', () => {
      const entries = [
        createMockEntry(5, 0, 10), // Today
        createMockEntry(7, 1),
        createMockEntry(6, 2),
        createMockEntry(8, 3),
      ];
      
      const result = getEnhancedGreeting(entries);
      expect(result.personalizedMessage).toBeDefined();
      // Should acknowledge today's entry or provide insight
      expect(result.personalizedMessage.length).toBeGreaterThan(0);
    });

    it('references last entry for users without today entry', () => {
      const entries = [
        createMockEntry(6, 1), // Yesterday
        createMockEntry(5, 2),
        createMockEntry(7, 3),
      ];
      
      const result = getEnhancedGreeting(entries);
      expect(result.personalizedMessage).toContain('today');
      // dataInsight may be null or contain yesterday reference
      if (result.dataInsight !== null) {
        expect(result.dataInsight).toContain('Yesterday');
      } else {
        // If no data insight, the personalized message should still mention no entries today
        expect(result.personalizedMessage.toLowerCase()).toContain('no entries');
      }
    });
  });
});
