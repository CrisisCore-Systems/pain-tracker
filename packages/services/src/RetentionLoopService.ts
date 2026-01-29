/**
 * Retention Loop Service
 * 
 * Orchestrates daily check-ins, return incentives, and win conditions
 * to create a sustainable engagement loop while respecting user autonomy.
 * 
 * Privacy: All data remains local-first. No Class A data in retention mechanics.
 * Trauma-informed: User has full control over prompts and can opt-out anytime.
 */

import type { PainEntry } from '../../src/types';
import { adaptivePromptSelector } from './AdaptivePromptSelector';

export interface RetentionState {
  lastCheckInDate: string | null;
  consecutiveDays: number;
  totalCheckIns: number;
  preferredCheckInTime: string | null; // HH:MM format
  enabledPrompts: boolean;
  lastPromptShown: string | null;
  pendingInsights: PendingInsight[];
  completedWinConditions: string[];
}

export interface PendingInsight {
  id: string;
  type: 'correlation' | 'pattern' | 'milestone' | 'trend';
  title: string;
  description: string;
  requiredEntries: number;
  currentEntries: number;
  unlockMessage: string;
}

export interface DailyPrompt {
  id: string;
  text: string;
  tone: 'gentle' | 'encouraging' | 'curious' | 'neutral';
  category: 'check-in' | 'reflection' | 'goal' | 'celebration';
  timing: 'morning' | 'afternoon' | 'evening' | 'anytime';
}

export interface WinCondition {
  id: string;
  title: string;
  description: string;
  achieved: boolean;
  celebrationMessage: string;
  nextStep: string;
}

export class RetentionLoopService {
  private storageKey = 'retention-loop-state';

  /**
   * Get current retention state
   */
  getState(): RetentionState {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Failed to load retention state:', err);
    }

    return this.getDefaultState();
  }

  /**
   * Save retention state
   */
  private saveState(state: RetentionState): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save retention state:', err);
    }
  }

  /**
   * Default state for new users
   */
  private getDefaultState(): RetentionState {
    return {
      lastCheckInDate: null,
      consecutiveDays: 0,
      totalCheckIns: 0,
      preferredCheckInTime: null,
      enabledPrompts: true,
      lastPromptShown: null,
      pendingInsights: [],
      completedWinConditions: [],
    };
  }

  /**
   * Record a daily check-in
   */
  recordCheckIn(date: Date = new Date()): void {
    const state = this.getState();
    const dateStr = this.getDateString(date);
    
    // Check if already checked in today
    if (state.lastCheckInDate === dateStr) {
      return;
    }

    // Update consecutive days
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = this.getDateString(yesterday);

    if (state.lastCheckInDate === yesterdayStr) {
      state.consecutiveDays += 1;
    } else {
      state.consecutiveDays = 1;
    }

    state.lastCheckInDate = dateStr;
    state.totalCheckIns += 1;

    this.saveState(state);
  }

  /**
   * Get today's daily prompt (with adaptive selection)
   */
  getDailyPrompt(entries: PainEntry[] = []): DailyPrompt | null {
    const state = this.getState();
    
    if (!state.enabledPrompts) {
      return null;
    }

    const today = this.getDateString(new Date());
    
    // Don't show prompt if already shown today
    if (state.lastPromptShown === today) {
      return null;
    }

    const prompts = this.getPromptLibrary();
    const hour = new Date().getHours();
    
    // Use adaptive selection if we have entry data
    if (entries.length > 0) {
      return adaptivePromptSelector.selectPrompt(prompts, entries, state, hour);
    }
    
    // Fallback to simple time-based selection for new users
    let timing: DailyPrompt['timing'];
    if (hour < 12) {
      timing = 'morning';
    } else if (hour < 18) {
      timing = 'afternoon';
    } else {
      timing = 'evening';
    }

    const relevantPrompts = prompts.filter(
      p => p.timing === timing || p.timing === 'anytime'
    );

    if (relevantPrompts.length === 0) {
      return null;
    }

    // Select prompt based on check-in history
    const promptIndex = state.consecutiveDays % relevantPrompts.length;
    return relevantPrompts[promptIndex];
  }

  /**
   * Mark prompt as shown and record interaction
   */
  markPromptShown(promptId?: string, actedUpon: boolean = false): void {
    const state = this.getState();
    state.lastPromptShown = this.getDateString(new Date());
    this.saveState(state);
    
    // Record interaction for adaptive learning
    if (promptId) {
      adaptivePromptSelector.recordInteraction(promptId, actedUpon);
    }
  }

  /**
   * Get pending insights that incentivize return
   */
  getPendingInsights(entries: PainEntry[]): PendingInsight[] {
    const insights: PendingInsight[] = [];
    const entryCount = entries.length;

    // Correlation unlock at 7 entries
    if (entryCount >= 3 && entryCount < 7) {
      insights.push({
        id: 'correlation-unlock',
        type: 'correlation',
        title: 'Pattern Correlation Analysis',
        description: 'Track your patterns to discover hidden connections',
        requiredEntries: 7,
        currentEntries: entryCount,
        unlockMessage: `${7 - entryCount} more entries to unlock correlation insights`,
      });
    }

    // Trend analysis at 14 entries
    if (entryCount >= 7 && entryCount < 14) {
      insights.push({
        id: 'trend-unlock',
        type: 'trend',
        title: 'Weekly Trend Analysis',
        description: 'See how your patterns change over time',
        requiredEntries: 14,
        currentEntries: entryCount,
        unlockMessage: `${14 - entryCount} more entries to unlock trend analysis`,
      });
    }

    // 30-day milestone
    if (entryCount >= 14 && entryCount < 30) {
      insights.push({
        id: 'milestone-30',
        type: 'milestone',
        title: 'Your 30-Day Story',
        description: 'Complete view of your pain journey',
        requiredEntries: 30,
        currentEntries: entryCount,
        unlockMessage: `${30 - entryCount} more entries to see your complete story`,
      });
    }

    return insights;
  }

  /**
   * Get win conditions based on current progress
   */
  getWinConditions(entries: PainEntry[]): WinCondition[] {
    const state = this.getState();
    const conditions: WinCondition[] = [];

    // First check-in
    conditions.push({
      id: 'first-check-in',
      title: 'Started Your Journey',
      description: 'You took the first step',
      achieved: entries.length >= 1,
      celebrationMessage: 'Every journey begins with a single step. You did that! 💚',
      nextStep: 'Check in again tomorrow to start building your streak',
    });

    // 3-day streak
    conditions.push({
      id: '3-day-streak',
      title: 'Building Momentum',
      description: 'Checked in for 3 consecutive days',
      achieved: state.consecutiveDays >= 3,
      celebrationMessage: 'Three days in a row! You\'re building a healthy habit ⭐',
      nextStep: 'Keep going to reach your first week milestone',
    });

    // 7-day streak
    conditions.push({
      id: '7-day-streak',
      title: 'Week Warrior',
      description: 'A full week of self-care',
      achieved: state.consecutiveDays >= 7,
      celebrationMessage: 'A full week of showing up for yourself! This is real progress 🎉',
      nextStep: 'Two more weeks to unlock your monthly insights',
    });

    return conditions;
  }

  /**
   * Get return incentive message
   */
  getReturnIncentive(entries: PainEntry[]): string | null {
    const pending = this.getPendingInsights(entries);
    
    if (pending.length === 0) {
      return null;
    }

    const next = pending[0];
    return next.unlockMessage;
  }

  /**
   * Toggle prompt preference
   */
  setPromptsEnabled(enabled: boolean): void {
    const state = this.getState();
    state.enabledPrompts = enabled;
    this.saveState(state);
  }

  /**
   * Set preferred check-in time
   */
  setPreferredCheckInTime(time: string): void {
    const state = this.getState();
    state.preferredCheckInTime = time;
    this.saveState(state);
  }

  /**
   * Get prompt library
   */
  private getPromptLibrary(): DailyPrompt[] {
    return [
      // Morning prompts
      {
        id: 'morning-gentle',
        text: 'Good morning. How are you feeling today?',
        tone: 'gentle',
        category: 'check-in',
        timing: 'morning',
      },
      {
        id: 'morning-curious',
        text: 'Starting a new day. What does your body need today?',
        tone: 'curious',
        category: 'check-in',
        timing: 'morning',
      },
      // Afternoon prompts
      {
        id: 'afternoon-check',
        text: 'How is your body doing this afternoon?',
        tone: 'neutral',
        category: 'check-in',
        timing: 'afternoon',
      },
      // Evening prompts
      {
        id: 'evening-reflection',
        text: 'Taking a moment to check in. How was today?',
        tone: 'gentle',
        category: 'reflection',
        timing: 'evening',
      },
      {
        id: 'evening-grateful',
        text: 'End of the day reflection. What did you notice today?',
        tone: 'curious',
        category: 'reflection',
        timing: 'evening',
      },
      // Anytime prompts
      {
        id: 'anytime-1',
        text: 'Your body has something to tell you. Ready to listen?',
        tone: 'curious',
        category: 'check-in',
        timing: 'anytime',
      },
      {
        id: 'anytime-2',
        text: 'Taking care of yourself matters. How can you support yourself today?',
        tone: 'encouraging',
        category: 'check-in',
        timing: 'anytime',
      },
    ];
  }

  /**
   * Helper to get date string (YYYY-MM-DD)
   */
  private getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Reset state (for testing or user request)
   */
  resetState(): void {
    localStorage.removeItem(this.storageKey);
  }
}

// Export singleton instance
export const retentionLoopService = new RetentionLoopService();
