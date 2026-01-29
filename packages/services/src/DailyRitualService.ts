/**
 * Daily Ritual Service
 * 
 * Manages habit formation mechanics through daily rituals and routines.
 * Provides optimal timing suggestions, ritual templates, and consistency rewards.
 * 
 * Privacy: All data remains local. User has full control over rituals.
 * Trauma-informed: Flexible, non-judgmental, and supportive language.
 */

import type { PainEntry } from './types';

export interface RitualState {
  ritualEnabled: boolean;
  ritualType: 'morning' | 'evening' | 'both' | 'custom';
  morningTime: string | null; // HH:MM format
  eveningTime: string | null; // HH:MM format
  customTimes: string[]; // Array of HH:MM times
  ritualTone: 'gentle' | 'encouraging' | 'structured' | 'minimal';
  completedToday: boolean;
  lastCompletedDate: string | null;
  totalCompletions: number;
  longestStreak: number;
  currentStreak: number;
  preferredDuration: number; // minutes
  ritualSteps: RitualStep[];
}

export interface RitualStep {
  id: string;
  label: string;
  description: string;
  optional: boolean;
  completed: boolean;
  order: number;
}

export interface RitualTemplate {
  id: string;
  name: string;
  description: string;
  type: 'morning' | 'evening' | 'anytime';
  estimatedDuration: number;
  steps: Omit<RitualStep, 'completed'>[];
}

export interface TimingSuggestion {
  time: string; // HH:MM format
  reason: string;
  confidence: number; // 0-1
  basedOn: 'history' | 'optimal' | 'default';
}

export class DailyRitualService {
  private storageKey = 'daily-ritual-state';

  /**
   * Get current ritual state
   */
  getState(): RitualState {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Failed to load ritual state:', err);
    }

    return this.getDefaultState();
  }

  /**
   * Save ritual state
   */
  private saveState(state: RitualState): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save ritual state:', err);
    }
  }

  /**
   * Default state for new users
   */
  private getDefaultState(): RitualState {
    return {
      ritualEnabled: false,
      ritualType: 'evening',
      morningTime: '08:00',
      eveningTime: '20:00',
      customTimes: [],
      ritualTone: 'gentle',
      completedToday: false,
      lastCompletedDate: null,
      totalCompletions: 0,
      longestStreak: 0,
      currentStreak: 0,
      preferredDuration: 5,
      ritualSteps: [],
    };
  }

  /**
   * Get optimal time suggestions based on user's entry history
   */
  getTimingSuggestions(entries: PainEntry[]): TimingSuggestion[] {
    const suggestions: TimingSuggestion[] = [];

    if (entries.length < 3) {
      // Not enough data, provide defaults
      suggestions.push({
        time: '08:00',
        reason: 'Morning check-ins help set intentions for the day',
        confidence: 0.5,
        basedOn: 'default',
      });
      suggestions.push({
        time: '20:00',
        reason: 'Evening reflections help process the day',
        confidence: 0.5,
        basedOn: 'default',
      });
      return suggestions;
    }

    // Analyze entry times
    const entryTimes = entries
      .map(e => new Date(e.timestamp))
      .map(d => d.getHours() + d.getMinutes() / 60);

    // Find common time clusters
    const morningEntries = entryTimes.filter(t => t >= 6 && t < 12);
    const afternoonEntries = entryTimes.filter(t => t >= 12 && t < 18);
    const eveningEntries = entryTimes.filter(t => t >= 18 && t < 23);

    // Morning suggestion
    if (morningEntries.length >= 2) {
      const avgMorning = morningEntries.reduce((a, b) => a + b, 0) / morningEntries.length;
      const hour = Math.floor(avgMorning);
      const minute = Math.round((avgMorning - hour) * 60);
      suggestions.push({
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        reason: 'You often check in during this time',
        confidence: Math.min(morningEntries.length / entries.length * 2, 0.9),
        basedOn: 'history',
      });
    }

    // Evening suggestion
    if (eveningEntries.length >= 2) {
      const avgEvening = eveningEntries.reduce((a, b) => a + b, 0) / eveningEntries.length;
      const hour = Math.floor(avgEvening);
      const minute = Math.round((avgEvening - hour) * 60);
      suggestions.push({
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        reason: 'You often check in during this time',
        confidence: Math.min(eveningEntries.length / entries.length * 2, 0.9),
        basedOn: 'history',
      });
    }

    // If no strong patterns, suggest optimal times
    if (suggestions.length === 0) {
      suggestions.push({
        time: '20:00',
        reason: 'Evening reflections are often easier to maintain',
        confidence: 0.6,
        basedOn: 'optimal',
      });
    }

    return suggestions;
  }

  /**
   * Get available ritual templates
   */
  getRitualTemplates(): RitualTemplate[] {
    return [
      {
        id: 'morning-quick',
        name: 'Morning Quick Check',
        description: 'A brief morning check-in to start your day mindfully',
        type: 'morning',
        estimatedDuration: 3,
        steps: [
          {
            id: 'morning-1',
            label: 'Body scan',
            description: 'Notice how your body feels',
            optional: false,
            order: 1,
          },
          {
            id: 'morning-2',
            label: 'Rate pain level',
            description: 'Quick pain assessment',
            optional: false,
            order: 2,
          },
          {
            id: 'morning-3',
            label: 'Set intention',
            description: 'What does your body need today?',
            optional: true,
            order: 3,
          },
        ],
      },
      {
        id: 'evening-reflection',
        name: 'Evening Reflection',
        description: 'End-of-day reflection and tracking',
        type: 'evening',
        estimatedDuration: 5,
        steps: [
          {
            id: 'evening-1',
            label: 'Review your day',
            description: 'How did your body do today?',
            optional: false,
            order: 1,
          },
          {
            id: 'evening-2',
            label: 'Track pain entry',
            description: 'Complete your daily entry',
            optional: false,
            order: 2,
          },
          {
            id: 'evening-3',
            label: 'Note patterns',
            description: 'Did you notice any triggers or relief?',
            optional: true,
            order: 3,
          },
          {
            id: 'evening-4',
            label: 'Plan tomorrow',
            description: 'What support do you need tomorrow?',
            optional: true,
            order: 4,
          },
        ],
      },
      {
        id: 'minimal',
        name: 'Minimal Check-in',
        description: 'Just the essentials when you\'re low on energy',
        type: 'anytime',
        estimatedDuration: 2,
        steps: [
          {
            id: 'minimal-1',
            label: 'Pain level',
            description: 'Quick rating',
            optional: false,
            order: 1,
          },
          {
            id: 'minimal-2',
            label: 'One word',
            description: 'Describe how you feel in one word',
            optional: true,
            order: 2,
          },
        ],
      },
      {
        id: 'comprehensive',
        name: 'Comprehensive Check-in',
        description: 'Full tracking when you have time and energy',
        type: 'anytime',
        estimatedDuration: 10,
        steps: [
          {
            id: 'comp-1',
            label: 'Full pain assessment',
            description: 'Complete 7-step form',
            optional: false,
            order: 1,
          },
          {
            id: 'comp-2',
            label: 'Mood tracking',
            description: 'How are you feeling emotionally?',
            optional: true,
            order: 2,
          },
          {
            id: 'comp-3',
            label: 'Activity log',
            description: 'What did you do today?',
            optional: true,
            order: 3,
          },
          {
            id: 'comp-4',
            label: 'Notes & reflections',
            description: 'Any additional observations',
            optional: true,
            order: 4,
          },
        ],
      },
    ];
  }

  /**
   * Set up a ritual
   */
  setupRitual(config: Partial<RitualState>): void {
    const state = this.getState();
    Object.assign(state, config);
    this.saveState(state);
  }

  /**
   * Complete today's ritual
   */
  completeRitual(): void {
    const state = this.getState();
    const today = this.getDateString(new Date());

    if (state.lastCompletedDate === today) {
      return; // Already completed today
    }

    // Update streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = this.getDateString(yesterday);

    if (state.lastCompletedDate === yesterdayStr) {
      state.currentStreak += 1;
    } else {
      state.currentStreak = 1;
    }

    if (state.currentStreak > state.longestStreak) {
      state.longestStreak = state.currentStreak;
    }

    state.completedToday = true;
    state.lastCompletedDate = today;
    state.totalCompletions += 1;

    this.saveState(state);
  }

  /**
   * Check if ritual is due
   */
  isRitualDue(): boolean {
    const state = this.getState();

    if (!state.ritualEnabled) {
      return false;
    }

    const today = this.getDateString(new Date());
    if (state.lastCompletedDate === today) {
      return false;
    }

    // Check if current time matches ritual time
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (state.ritualType === 'morning' && state.morningTime) {
      return this.isTimeNear(currentTime, state.morningTime);
    }

    if (state.ritualType === 'evening' && state.eveningTime) {
      return this.isTimeNear(currentTime, state.eveningTime);
    }

    if (state.ritualType === 'both') {
      return (
        this.isTimeNear(currentTime, state.morningTime || '08:00') ||
        this.isTimeNear(currentTime, state.eveningTime || '20:00')
      );
    }

    if (state.ritualType === 'custom') {
      return state.customTimes.some(time => this.isTimeNear(currentTime, time));
    }

    return false;
  }

  /**
   * Get ritual satisfaction message
   */
  getRitualCompletionMessage(streak: number): string {
    if (streak === 1) {
      return "Great job checking in today! 💚";
    } else if (streak === 3) {
      return "Three days in a row! You're building a habit ⭐";
    } else if (streak === 7) {
      return "A full week of rituals! This is real self-care 🎉";
    } else if (streak === 14) {
      return "Two weeks strong! Your consistency is inspiring ✨";
    } else if (streak === 30) {
      return "30 days of showing up for yourself! Incredible work 🌟";
    } else if (streak % 7 === 0) {
      return `${streak} days of consistent self-care. You're amazing! 💪`;
    }
    
    return `Day ${streak} complete! Keep showing up for yourself 🌱`;
  }

  /**
   * Get consistency rewards beyond streaks
   */
  getConsistencyRewards(): string[] {
    const state = this.getState();
    const rewards: string[] = [];

    // Reward based on total completions
    if (state.totalCompletions >= 10) {
      rewards.push('🏅 10+ Check-ins: Committed Tracker');
    }
    if (state.totalCompletions >= 25) {
      rewards.push('⭐ 25+ Check-ins: Pattern Detective');
    }
    if (state.totalCompletions >= 50) {
      rewards.push('💎 50+ Check-ins: Self-Care Champion');
    }
    if (state.totalCompletions >= 100) {
      rewards.push('🌟 100+ Check-ins: Wellness Warrior');
    }

    // Reward based on longest streak
    if (state.longestStreak >= 7) {
      rewards.push('📅 7-Day Streak: Week Warrior');
    }
    if (state.longestStreak >= 14) {
      rewards.push('📆 14-Day Streak: Habit Builder');
    }
    if (state.longestStreak >= 30) {
      rewards.push('🎯 30-Day Streak: Consistency Master');
    }

    return rewards;
  }

  /**
   * Helper to check if two times are close (within 30 minutes)
   */
  private isTimeNear(current: string, target: string, windowMinutes: number = 30): boolean {
    const [currentHour, currentMinute] = current.split(':').map(Number);
    const [targetHour, targetMinute] = target.split(':').map(Number);

    const currentMinutes = currentHour * 60 + currentMinute;
    const targetMinutes = targetHour * 60 + targetMinute;

    const diff = Math.abs(currentMinutes - targetMinutes);
    return diff <= windowMinutes;
  }

  /**
   * Helper to get date string (YYYY-MM-DD)
   */
  private getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Reset ritual state (for testing or user request)
   */
  resetState(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Toggle ritual enabled
   */
  setRitualEnabled(enabled: boolean): void {
    const state = this.getState();
    state.ritualEnabled = enabled;
    this.saveState(state);
  }
}

// Export singleton instance
export const dailyRitualService = new DailyRitualService();
