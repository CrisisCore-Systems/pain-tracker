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
    lastUpdated: date.toISOString(),
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
});
