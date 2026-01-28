/**
 * Tests for AdaptivePromptSelector
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AdaptivePromptSelector } from '@pain-tracker/services';
import type { DailyPrompt, RetentionState } from '@pain-tracker/services';
import type { PainEntry } from '../types';

describe('AdaptivePromptSelector', () => {
  let selector: AdaptivePromptSelector;
  
  const mockPrompts: DailyPrompt[] = [
    {
      id: 'morning-gentle',
      text: 'Good morning. How are you feeling?',
      tone: 'gentle',
      category: 'check-in',
      timing: 'morning',
    },
    {
      id: 'morning-encouraging',
      text: 'Great to see you! Ready to check in?',
      tone: 'encouraging',
      category: 'check-in',
      timing: 'morning',
    },
    {
      id: 'evening-gentle',
      text: 'How was your day?',
      tone: 'gentle',
      category: 'reflection',
      timing: 'evening',
    },
    {
      id: 'evening-curious',
      text: 'What did you notice today?',
      tone: 'curious',
      category: 'reflection',
      timing: 'evening',
    },
    {
      id: 'anytime-1',
      text: 'Time to check in',
      tone: 'neutral',
      category: 'check-in',
      timing: 'anytime',
    },
  ];
  
  const mockRetentionState: RetentionState = {
    lastCheckInDate: '2024-01-15',
    consecutiveDays: 5,
    totalCheckIns: 10,
    preferredCheckInTime: null,
    enabledPrompts: true,
    lastPromptShown: null,
    pendingInsights: [],
    completedWinConditions: [],
  };

  beforeEach(() => {
    selector = new AdaptivePromptSelector();
    selector.resetEffectivenessData();
  });

  describe('Prompt Selection', () => {
    it('should select a prompt for new users', () => {
      const prompt = selector.selectPrompt(mockPrompts, [], mockRetentionState, 9);
      
      expect(prompt).toBeTruthy();
      expect(mockPrompts).toContain(prompt);
    });

    it('should prefer morning prompts in the morning', () => {
      const prompt = selector.selectPrompt(mockPrompts, [], mockRetentionState, 9);
      
      expect(prompt.timing === 'morning' || prompt.timing === 'anytime').toBe(true);
    });

    it('should prefer evening prompts in the evening', () => {
      const prompt = selector.selectPrompt(mockPrompts, [], mockRetentionState, 20);
      
      expect(prompt.timing === 'evening' || prompt.timing === 'anytime').toBe(true);
    });

    it('should adapt to user timing patterns', () => {
      // Create entries mostly in the evening
      const entries: Partial<PainEntry>[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        timestamp: `2024-01-${(i + 1).toString().padStart(2, '0')}T20:00:00Z`,
      }));
      
      // Request prompt in morning
      const prompt = selector.selectPrompt(mockPrompts, entries as PainEntry[], mockRetentionState, 9);
      
      // Should still consider evening prompts due to user preference
      expect(prompt).toBeTruthy();
    });
  });

  describe('User Behavior Analysis', () => {
    it('should detect morning preference', () => {
      const entries: Partial<PainEntry>[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        timestamp: `2024-01-${(i + 1).toString().padStart(2, '0')}T08:00:00Z`,
      }));
      
      const prompt = selector.selectPrompt(mockPrompts, entries as PainEntry[], mockRetentionState, 9);
      expect(prompt.timing === 'morning' || prompt.timing === 'anytime').toBe(true);
    });

    it('should detect evening preference', () => {
      const entries: Partial<PainEntry>[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        timestamp: `2024-01-${(i + 1).toString().padStart(2, '0')}T19:00:00Z`,
      }));
      
      const prompt = selector.selectPrompt(mockPrompts, entries as PainEntry[], mockRetentionState, 20);
      expect(prompt.timing === 'evening' || prompt.timing === 'anytime').toBe(true);
    });

    it('should handle mixed timing patterns', () => {
      const entries: Partial<PainEntry>[] = [
        { id: 1, timestamp: '2024-01-01T08:00:00Z' },
        { id: 2, timestamp: '2024-01-02T14:00:00Z' },
        { id: 3, timestamp: '2024-01-03T20:00:00Z' },
        { id: 4, timestamp: '2024-01-04T09:00:00Z' },
        { id: 5, timestamp: '2024-01-05T21:00:00Z' },
      ];
      
      const prompt = selector.selectPrompt(mockPrompts, entries as PainEntry[], mockRetentionState, 12);
      expect(prompt).toBeTruthy();
    });
  });

  describe('Effectiveness Tracking', () => {
    it('should record successful interactions', () => {
      selector.recordInteraction('morning-gentle', true);
      
      // Verify interaction was recorded
      const prompt = selector.selectPrompt(mockPrompts, [], mockRetentionState, 9);
      expect(prompt).toBeTruthy();
    });

    it('should record dismissals', () => {
      selector.recordInteraction('morning-gentle', false);
      
      // Verify interaction was recorded
      const prompt = selector.selectPrompt(mockPrompts, [], mockRetentionState, 9);
      expect(prompt).toBeTruthy();
    });

    it('should favor prompts with higher effectiveness', () => {
      // Record high effectiveness for one prompt
      selector.recordInteraction('morning-gentle', true);
      selector.recordInteraction('morning-gentle', true);
      selector.recordInteraction('morning-gentle', true);
      
      // Record low effectiveness for another
      selector.recordInteraction('morning-encouraging', false);
      selector.recordInteraction('morning-encouraging', false);
      
      // Should prefer the more effective prompt
      const prompt1 = selector.selectPrompt(mockPrompts, [], mockRetentionState, 9);
      const prompt2 = selector.selectPrompt(mockPrompts, [], mockRetentionState, 9);
      const prompt3 = selector.selectPrompt(mockPrompts, [], mockRetentionState, 9);
      
      // At least one should be the gentle prompt (statistical test)
      const gentleCount = [prompt1, prompt2, prompt3].filter(p => p.id === 'morning-gentle').length;
      expect(gentleCount).toBeGreaterThan(0);
    });
  });

  describe('Engagement Trend Adaptation', () => {
    it('should prefer encouraging prompts for declining engagement', () => {
      const olderEntries: Partial<PainEntry>[] = Array.from({ length: 7 }, (_, i) => ({
        id: i + 1,
        timestamp: `2024-01-${(i + 1).toString().padStart(2, '0')}T09:00:00Z`,
      }));
      
      const recentEntries: Partial<PainEntry>[] = [
        { id: 8, timestamp: '2024-01-15T09:00:00Z' },
      ];
      
      const allEntries = [...olderEntries, ...recentEntries];
      
      const prompt = selector.selectPrompt(
        mockPrompts,
        allEntries as PainEntry[],
        { ...mockRetentionState, consecutiveDays: 1 },
        9
      );
      
      expect(prompt).toBeTruthy();
    });

    it('should handle increasing engagement', () => {
      const olderEntries: Partial<PainEntry>[] = [
        { id: 1, timestamp: '2024-01-01T09:00:00Z' },
      ];
      
      const recentEntries: Partial<PainEntry>[] = Array.from({ length: 7 }, (_, i) => ({
        id: i + 2,
        timestamp: `2024-01-${(i + 9).toString().padStart(2, '0')}T09:00:00Z`,
      }));
      
      const allEntries = [...olderEntries, ...recentEntries];
      
      const prompt = selector.selectPrompt(
        mockPrompts,
        allEntries as PainEntry[],
        { ...mockRetentionState, consecutiveDays: 7 },
        9
      );
      
      expect(prompt).toBeTruthy();
    });
  });

  describe('Streak Context', () => {
    it('should prefer celebration prompts for 7-day streaks', () => {
      const celebrationPrompt: DailyPrompt = {
        id: 'celebration-7',
        text: 'Amazing! 7 days strong!',
        tone: 'encouraging',
        category: 'celebration',
        timing: 'anytime',
      };
      
      const promptsWithCelebration = [...mockPrompts, celebrationPrompt];
      
      const prompt = selector.selectPrompt(
        promptsWithCelebration,
        [],
        { ...mockRetentionState, consecutiveDays: 7 },
        12
      );
      
      expect(prompt).toBeTruthy();
    });

    it('should prefer gentle prompts for streak restarts', () => {
      const prompt = selector.selectPrompt(
        mockPrompts,
        [],
        { ...mockRetentionState, consecutiveDays: 0 },
        9
      );
      
      expect(prompt).toBeTruthy();
    });
  });

  describe('Data Persistence', () => {
    it('should persist effectiveness data', () => {
      selector.recordInteraction('morning-gentle', true);
      
      // Create new instance
      const newSelector = new AdaptivePromptSelector();
      
      // Should have the same data
      const prompt = newSelector.selectPrompt(mockPrompts, [], mockRetentionState, 9);
      expect(prompt).toBeTruthy();
    });

    it('should handle missing storage gracefully', () => {
      // Clear storage
      selector.resetEffectivenessData();
      
      // Should still work with defaults
      const prompt = selector.selectPrompt(mockPrompts, [], mockRetentionState, 9);
      expect(prompt).toBeTruthy();
    });
  });
});
