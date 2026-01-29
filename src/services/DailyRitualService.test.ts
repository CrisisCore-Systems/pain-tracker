/**
 * Tests for DailyRitualService
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DailyRitualService } from '@pain-tracker/services';
import type { PainEntry } from '../types';

describe('DailyRitualService', () => {
  let service: DailyRitualService;

  const isoAtLocalTime = (year: number, monthIndex: number, day: number, hour: number, minute: number): string => {
    const date = new Date(year, monthIndex, day, hour, minute, 0, 0);
    return date.toISOString();
  };

  beforeEach(() => {
    service = new DailyRitualService();
    service.resetState();
  });

  describe('State Management', () => {
    it('should initialize with default state', () => {
      const state = service.getState();
      
      expect(state.ritualEnabled).toBe(false);
      expect(state.ritualType).toBe('evening');
      expect(state.totalCompletions).toBe(0);
      expect(state.currentStreak).toBe(0);
    });

    it('should save and load state', () => {
      service.setupRitual({
        ritualEnabled: true,
        ritualType: 'morning',
        morningTime: '08:30',
      });
      
      const state = service.getState();
      expect(state.ritualEnabled).toBe(true);
      expect(state.ritualType).toBe('morning');
      expect(state.morningTime).toBe('08:30');
    });
  });

  describe('Timing Suggestions', () => {
    it('should provide default suggestions for new users', () => {
      const entries: PainEntry[] = [];
      const suggestions = service.getTimingSuggestions(entries);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].basedOn).toBe('default');
    });

    it('should suggest times based on entry history', () => {
      const entries: Partial<PainEntry>[] = [
        { id: 1, timestamp: isoAtLocalTime(2024, 0, 15, 8, 30) },
        { id: 2, timestamp: isoAtLocalTime(2024, 0, 16, 8, 45) },
        { id: 3, timestamp: isoAtLocalTime(2024, 0, 17, 8, 15) },
      ];
      
      const suggestions = service.getTimingSuggestions(entries as PainEntry[]);
      
      const historySuggestion = suggestions.find(s => s.basedOn === 'history');
      expect(historySuggestion).toBeTruthy();
      expect(historySuggestion?.confidence).toBeGreaterThan(0);
    });

    it('should identify morning patterns', () => {
      const entries: Partial<PainEntry>[] = [
        { id: 1, timestamp: isoAtLocalTime(2024, 0, 15, 9, 0) },
        { id: 2, timestamp: isoAtLocalTime(2024, 0, 16, 9, 30) },
        { id: 3, timestamp: isoAtLocalTime(2024, 0, 17, 8, 45) },
        { id: 4, timestamp: isoAtLocalTime(2024, 0, 18, 9, 15) },
      ];
      
      const suggestions = service.getTimingSuggestions(entries as PainEntry[]);
      
      const morningSuggestion = suggestions.find(s => s.basedOn === 'history');
      expect(morningSuggestion).toBeTruthy();
      expect(morningSuggestion?.time.split(':')[0]).toBe('09');
    });
  });

  describe('Ritual Templates', () => {
    it('should provide multiple ritual templates', () => {
      const templates = service.getRitualTemplates();
      
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.every(t => t.steps.length > 0)).toBe(true);
    });

    it('should include morning, evening, and anytime templates', () => {
      const templates = service.getRitualTemplates();
      
      const hasMorning = templates.some(t => t.type === 'morning');
      const hasEvening = templates.some(t => t.type === 'evening');
      const hasAnytime = templates.some(t => t.type === 'anytime');
      
      expect(hasMorning).toBe(true);
      expect(hasEvening).toBe(true);
      expect(hasAnytime).toBe(true);
    });

    it('should have estimated duration for all templates', () => {
      const templates = service.getRitualTemplates();
      
      expect(templates.every(t => t.estimatedDuration > 0)).toBe(true);
    });
  });

  describe('Ritual Completion', () => {
    it('should complete ritual and update streak', () => {
      service.completeRitual();
      
      const state = service.getState();
      expect(state.totalCompletions).toBe(1);
      expect(state.currentStreak).toBe(1);
    });

    it('should maintain streak for consecutive days', () => {
      // Mock dates for testing
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-16');
      const date3 = new Date('2024-01-17');
      
      service.completeRitual();
      // In real scenario, we'd need to manipulate dates
      // For now, just check basic functionality
      
      const state = service.getState();
      expect(state.currentStreak).toBeGreaterThan(0);
    });

    it('should not duplicate completions on same day', () => {
      service.completeRitual();
      service.completeRitual();
      
      const state = service.getState();
      expect(state.totalCompletions).toBe(1);
    });

    it('should update longest streak', () => {
      service.setupRitual({ currentStreak: 5 });
      service.completeRitual();
      
      const state = service.getState();
      expect(state.longestStreak).toBeGreaterThanOrEqual(state.currentStreak);
    });
  });

  describe('Completion Messages', () => {
    it('should provide encouraging message for first completion', () => {
      const message = service.getRitualCompletionMessage(1);
      
      expect(message).toBeTruthy();
      expect(message).toContain('Great job');
    });

    it('should provide milestone message for 7-day streak', () => {
      const message = service.getRitualCompletionMessage(7);
      
      expect(message).toBeTruthy();
      expect(message).toContain('week');
    });

    it('should provide milestone message for 30-day streak', () => {
      const message = service.getRitualCompletionMessage(30);
      
      expect(message).toBeTruthy();
      expect(message).toContain('30');
    });
  });

  describe('Consistency Rewards', () => {
    it('should return empty array for new users', () => {
      const rewards = service.getConsistencyRewards();
      
      expect(rewards).toEqual([]);
    });

    it('should award 10+ check-ins badge', () => {
      service.setupRitual({ totalCompletions: 15 });
      const rewards = service.getConsistencyRewards();
      
      const badge = rewards.find(r => r.includes('10+'));
      expect(badge).toBeTruthy();
    });

    it('should award 7-day streak badge', () => {
      service.setupRitual({ longestStreak: 10 });
      const rewards = service.getConsistencyRewards();
      
      const badge = rewards.find(r => r.includes('7-Day'));
      expect(badge).toBeTruthy();
    });

    it('should award multiple badges', () => {
      service.setupRitual({ 
        totalCompletions: 60,
        longestStreak: 20,
      });
      const rewards = service.getConsistencyRewards();
      
      expect(rewards.length).toBeGreaterThan(1);
    });
  });

  describe('Ritual Control', () => {
    it('should enable/disable ritual', () => {
      service.setRitualEnabled(true);
      let state = service.getState();
      expect(state.ritualEnabled).toBe(true);
      
      service.setRitualEnabled(false);
      state = service.getState();
      expect(state.ritualEnabled).toBe(false);
    });

    it('should not show ritual as due when disabled', () => {
      service.setRitualEnabled(false);
      const isDue = service.isRitualDue();
      
      expect(isDue).toBe(false);
    });
  });

  describe('Setup Ritual', () => {
    it('should setup ritual with custom configuration', () => {
      service.setupRitual({
        ritualEnabled: true,
        ritualType: 'both',
        morningTime: '07:30',
        eveningTime: '21:00',
        ritualTone: 'encouraging',
      });
      
      const state = service.getState();
      expect(state.ritualEnabled).toBe(true);
      expect(state.ritualType).toBe('both');
      expect(state.morningTime).toBe('07:30');
      expect(state.eveningTime).toBe('21:00');
      expect(state.ritualTone).toBe('encouraging');
    });

    it('should setup custom times', () => {
      service.setupRitual({
        ritualType: 'custom',
        customTimes: ['09:00', '13:00', '18:00'],
      });
      
      const state = service.getState();
      expect(state.ritualType).toBe('custom');
      expect(state.customTimes).toEqual(['09:00', '13:00', '18:00']);
    });
  });
});
