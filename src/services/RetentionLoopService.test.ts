/**
 * Tests for RetentionLoopService
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RetentionLoopService } from '@pain-tracker/services';
import type { PainEntry } from '../types';

describe('RetentionLoopService', () => {
  let service: RetentionLoopService;

  beforeEach(() => {
    service = new RetentionLoopService();
    service.resetState();
  });

  describe('State Management', () => {
    it('should initialize with default state', () => {
      const state = service.getState();
      
      expect(state.lastCheckInDate).toBeNull();
      expect(state.consecutiveDays).toBe(0);
      expect(state.totalCheckIns).toBe(0);
      expect(state.enabledPrompts).toBe(true);
    });

    it('should record a check-in', () => {
      service.recordCheckIn(new Date('2024-01-15'));
      
      const state = service.getState();
      expect(state.lastCheckInDate).toBe('2024-01-15');
      expect(state.consecutiveDays).toBe(1);
      expect(state.totalCheckIns).toBe(1);
    });

    it('should increment consecutive days for consecutive check-ins', () => {
      service.recordCheckIn(new Date('2024-01-15'));
      service.recordCheckIn(new Date('2024-01-16'));
      service.recordCheckIn(new Date('2024-01-17'));
      
      const state = service.getState();
      expect(state.consecutiveDays).toBe(3);
      expect(state.totalCheckIns).toBe(3);
    });

    it('should reset consecutive days for non-consecutive check-ins', () => {
      service.recordCheckIn(new Date('2024-01-15'));
      service.recordCheckIn(new Date('2024-01-16'));
      service.recordCheckIn(new Date('2024-01-20')); // Gap
      
      const state = service.getState();
      expect(state.consecutiveDays).toBe(1);
      expect(state.totalCheckIns).toBe(3);
    });

    it('should not duplicate check-ins on same day', () => {
      // Use explicit UTC timestamps so date normalization is stable across timezones.
      service.recordCheckIn(new Date('2024-01-15T08:00:00Z'));
      service.recordCheckIn(new Date('2024-01-15T16:00:00Z'));
      
      const state = service.getState();
      expect(state.totalCheckIns).toBe(1);
    });
  });

  describe('Daily Prompts', () => {
    it('should return a daily prompt when enabled', () => {
      const prompt = service.getDailyPrompt();
      
      expect(prompt).toBeTruthy();
      if (prompt) {
        expect(prompt.text).toBeTruthy();
        expect(prompt.tone).toBeTruthy();
        expect(prompt.category).toBeTruthy();
      }
    });

    it('should not return prompt if already shown today', () => {
      const prompt1 = service.getDailyPrompt();
      service.markPromptShown();
      const prompt2 = service.getDailyPrompt();
      
      expect(prompt1).toBeTruthy();
      expect(prompt2).toBeNull();
    });

    it('should not return prompt if prompts are disabled', () => {
      service.setPromptsEnabled(false);
      const prompt = service.getDailyPrompt();
      
      expect(prompt).toBeNull();
    });
  });

  describe('Pending Insights', () => {
    it('should return correlation insight for 3-6 entries', () => {
      const entries: Partial<PainEntry>[] = [
        { id: 1, timestamp: '2024-01-15' },
        { id: 2, timestamp: '2024-01-16' },
        { id: 3, timestamp: '2024-01-17' },
      ];
      
      const insights = service.getPendingInsights(entries as PainEntry[]);
      
      expect(insights.length).toBeGreaterThan(0);
      expect(insights[0].type).toBe('correlation');
      expect(insights[0].requiredEntries).toBe(7);
    });

    it('should return trend insight for 7-13 entries', () => {
      const entries: Partial<PainEntry>[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        timestamp: `2024-01-${(i + 1).toString().padStart(2, '0')}`,
      }));
      
      const insights = service.getPendingInsights(entries as PainEntry[]);
      
      const trendInsight = insights.find(i => i.type === 'trend');
      expect(trendInsight).toBeTruthy();
      expect(trendInsight?.requiredEntries).toBe(14);
    });

    it('should return milestone insight for 14-29 entries', () => {
      const entries: Partial<PainEntry>[] = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        timestamp: `2024-01-${(i + 1).toString().padStart(2, '0')}`,
      }));
      
      const insights = service.getPendingInsights(entries as PainEntry[]);
      
      const milestoneInsight = insights.find(i => i.type === 'milestone');
      expect(milestoneInsight).toBeTruthy();
      expect(milestoneInsight?.requiredEntries).toBe(30);
    });

    it('should return empty array for 30+ entries', () => {
      const entries: Partial<PainEntry>[] = Array.from({ length: 35 }, (_, i) => ({
        id: i + 1,
        timestamp: `2024-01-${(i + 1).toString().padStart(2, '0')}`,
      }));
      
      const insights = service.getPendingInsights(entries as PainEntry[]);
      
      expect(insights.length).toBe(0);
    });
  });

  describe('Win Conditions', () => {
    it('should mark first check-in as achieved', () => {
      const entries: Partial<PainEntry>[] = [
        { id: 1, timestamp: '2024-01-15' },
      ];
      
      const conditions = service.getWinConditions(entries as PainEntry[]);
      const firstCheckIn = conditions.find(c => c.id === 'first-check-in');
      
      expect(firstCheckIn?.achieved).toBe(true);
    });

    it('should mark 3-day streak as achieved', () => {
      service.recordCheckIn(new Date('2024-01-15'));
      service.recordCheckIn(new Date('2024-01-16'));
      service.recordCheckIn(new Date('2024-01-17'));
      
      const conditions = service.getWinConditions([] as PainEntry[]);
      const threeDay = conditions.find(c => c.id === '3-day-streak');
      
      expect(threeDay?.achieved).toBe(true);
    });

    it('should mark 7-day streak as achieved', () => {
      for (let i = 0; i < 7; i++) {
        const date = new Date('2024-01-15');
        date.setDate(date.getDate() + i);
        service.recordCheckIn(date);
      }
      
      const conditions = service.getWinConditions([] as PainEntry[]);
      const sevenDay = conditions.find(c => c.id === '7-day-streak');
      
      expect(sevenDay?.achieved).toBe(true);
    });
  });

  describe('Return Incentive', () => {
    it('should return incentive message when pending insights exist', () => {
      const entries: Partial<PainEntry>[] = [
        { id: 1, timestamp: '2024-01-15' },
        { id: 2, timestamp: '2024-01-16' },
        { id: 3, timestamp: '2024-01-17' },
      ];
      
      const incentive = service.getReturnIncentive(entries as PainEntry[]);
      
      expect(incentive).toBeTruthy();
      expect(incentive).toContain('more entries');
    });

    it('should return null when no pending insights', () => {
      const entries: Partial<PainEntry>[] = Array.from({ length: 35 }, (_, i) => ({
        id: i + 1,
        timestamp: `2024-01-${(i + 1).toString().padStart(2, '0')}`,
      }));
      
      const incentive = service.getReturnIncentive(entries as PainEntry[]);
      
      expect(incentive).toBeNull();
    });
  });

  describe('Preferences', () => {
    it('should toggle prompts enabled', () => {
      service.setPromptsEnabled(false);
      
      let state = service.getState();
      expect(state.enabledPrompts).toBe(false);
      
      service.setPromptsEnabled(true);
      state = service.getState();
      expect(state.enabledPrompts).toBe(true);
    });

    it('should set preferred check-in time', () => {
      service.setPreferredCheckInTime('20:00');
      
      const state = service.getState();
      expect(state.preferredCheckInTime).toBe('20:00');
    });
  });
});
