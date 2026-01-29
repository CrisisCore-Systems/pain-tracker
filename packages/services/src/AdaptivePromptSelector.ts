/**
 * Adaptive Prompt Selector
 * 
 * Uses behavioral analysis to select the most effective prompts
 * for individual users based on their interaction patterns.
 * 
 * Privacy: All analysis happens locally. No external data.
 */

import type { DailyPrompt, RetentionState } from './RetentionLoopService';
import type { PainEntry } from './types';

export interface PromptEffectivenessData {
  promptId: string;
  timesShown: number;
  timesActedUpon: number;
  timesDismissed: number;
  effectiveness: number; // 0-1 score
  lastShown: string | null;
}

export interface UserBehaviorProfile {
  preferredTiming: 'morning' | 'afternoon' | 'evening' | 'mixed';
  preferredTone: 'gentle' | 'encouraging' | 'curious' | 'neutral' | 'mixed';
  responseRate: number; // 0-1
  averageResponseTime: number; // minutes
  consistencyScore: number; // 0-1
  engagementTrend: 'increasing' | 'stable' | 'decreasing';
}

export class AdaptivePromptSelector {
  private storageKey = 'prompt-effectiveness-data';

  /**
   * Select the most appropriate prompt based on user behavior
   */
  selectPrompt(
    availablePrompts: DailyPrompt[],
    entries: PainEntry[],
    retentionState: RetentionState,
    currentHour: number
  ): DailyPrompt {
    const profile = this.analyzeUserBehavior(entries, retentionState);
    const effectiveness = this.getEffectivenessData();
    
    // Filter prompts by timing
    const timeOfDay = this.getTimeOfDay(currentHour);
    let relevantPrompts = availablePrompts.filter(
      p => p.timing === timeOfDay || p.timing === 'anytime'
    );

    // If user has a strong preference, filter by that
    if (profile.preferredTiming !== 'mixed' && profile.preferredTiming !== timeOfDay) {
      const preferredPrompts = availablePrompts.filter(
        p => p.timing === profile.preferredTiming || p.timing === 'anytime'
      );
      if (preferredPrompts.length > 0) {
        relevantPrompts = preferredPrompts;
      }
    }

    // Score each prompt
    const scoredPrompts = relevantPrompts.map(prompt => ({
      prompt,
      score: this.scorePrompt(prompt, profile, effectiveness, retentionState),
    }));

    // Sort by score and return best
    scoredPrompts.sort((a, b) => b.score - a.score);
    
    return scoredPrompts[0]?.prompt || availablePrompts[0];
  }

  /**
   * Analyze user behavior to build a profile
   */
  private analyzeUserBehavior(
    entries: PainEntry[],
    retentionState: RetentionState
  ): UserBehaviorProfile {
    if (entries.length === 0) {
      return this.getDefaultProfile();
    }

    // Analyze entry timing patterns
    const entryHours = entries.map(e => new Date(e.timestamp).getHours());
    const morningCount = entryHours.filter(h => h >= 6 && h < 12).length;
    const afternoonCount = entryHours.filter(h => h >= 12 && h < 18).length;
    const eveningCount = entryHours.filter(h => h >= 18 && h < 23).length;

    let preferredTiming: UserBehaviorProfile['preferredTiming'] = 'mixed';
    const total = morningCount + afternoonCount + eveningCount;
    if (morningCount / total > 0.6) preferredTiming = 'morning';
    else if (afternoonCount / total > 0.6) preferredTiming = 'afternoon';
    else if (eveningCount / total > 0.6) preferredTiming = 'evening';

    // Calculate consistency score (how regular are entries?)
    const consistencyScore = retentionState.consecutiveDays / Math.max(entries.length, 1);

    // Calculate response rate (engagement with prompts)
    const responseRate = retentionState.totalCheckIns / Math.max(entries.length, 1);

    // Determine engagement trend
    const recentEntries = entries.slice(-7);
    const olderEntries = entries.slice(Math.max(0, entries.length - 14), entries.length - 7);
    const engagementTrend = 
      recentEntries.length > olderEntries.length ? 'increasing' :
      recentEntries.length < olderEntries.length ? 'decreasing' : 'stable';

    return {
      preferredTiming,
      preferredTone: 'mixed', // Could analyze from notes sentiment
      responseRate: Math.min(responseRate, 1),
      averageResponseTime: 0, // Would need tracking
      consistencyScore: Math.min(consistencyScore, 1),
      engagementTrend,
    };
  }

  /**
   * Score a prompt based on effectiveness and user profile
   */
  private scorePrompt(
    prompt: DailyPrompt,
    profile: UserBehaviorProfile,
    effectiveness: Map<string, PromptEffectivenessData>,
    retentionState: RetentionState
  ): number {
    let score = 0.5; // Base score

    // Historical effectiveness
    const data = effectiveness.get(prompt.id);
    if (data && data.timesShown > 0) {
      score += data.effectiveness * 0.3;
    }

    // Timing match
    if (prompt.timing === profile.preferredTiming || prompt.timing === 'anytime') {
      score += 0.2;
    }

    // Tone preference (if we have data)
    if (profile.preferredTone !== 'mixed' && prompt.tone === profile.preferredTone) {
      score += 0.15;
    }

    // Engagement trend adjustment
    if (profile.engagementTrend === 'decreasing') {
      // Try more encouraging prompts
      if (prompt.tone === 'encouraging') score += 0.15;
    } else if (profile.engagementTrend === 'increasing') {
      // User is engaged, can use any tone
      score += 0.1;
    }

    // Freshness bonus (haven't seen in a while)
    if (data && data.lastShown) {
      const daysSinceShown = this.getDaysSince(data.lastShown);
      if (daysSinceShown > 7) {
        score += 0.1;
      }
    }

    // Streak context
    if (retentionState.consecutiveDays >= 7 && prompt.category === 'celebration') {
      score += 0.2; // Celebrate streaks
    } else if (retentionState.consecutiveDays === 0 && prompt.tone === 'gentle') {
      score += 0.15; // Gentle restart
    }

    return Math.min(score, 1);
  }

  /**
   * Record prompt interaction outcome
   */
  recordInteraction(promptId: string, actedUpon: boolean): void {
    const effectiveness = this.getEffectivenessData();
    const data = effectiveness.get(promptId) || {
      promptId,
      timesShown: 0,
      timesActedUpon: 0,
      timesDismissed: 0,
      effectiveness: 0.5,
      lastShown: null,
    };

    data.timesShown += 1;
    if (actedUpon) {
      data.timesActedUpon += 1;
    } else {
      data.timesDismissed += 1;
    }

    // Update effectiveness score
    data.effectiveness = data.timesActedUpon / data.timesShown;
    data.lastShown = new Date().toISOString();

    effectiveness.set(promptId, data);
    this.saveEffectivenessData(effectiveness);
  }

  /**
   * Get effectiveness data from storage
   */
  private getEffectivenessData(): Map<string, PromptEffectivenessData> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored) as Record<string, PromptEffectivenessData>;
        return new Map(Object.entries(data));
      }
    } catch (err) {
      console.error('Failed to load effectiveness data:', err);
    }
    return new Map();
  }

  /**
   * Save effectiveness data to storage
   */
  private saveEffectivenessData(data: Map<string, PromptEffectivenessData>): void {
    try {
      const obj = Object.fromEntries(data);
      localStorage.setItem(this.storageKey, JSON.stringify(obj));
    } catch (err) {
      console.error('Failed to save effectiveness data:', err);
    }
  }

  /**
   * Get default profile for new users
   */
  private getDefaultProfile(): UserBehaviorProfile {
    return {
      preferredTiming: 'mixed',
      preferredTone: 'gentle',
      responseRate: 0.5,
      averageResponseTime: 0,
      consistencyScore: 0,
      engagementTrend: 'stable',
    };
  }

  /**
   * Get time of day category
   */
  private getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  }

  /**
   * Calculate days since a date
   */
  private getDaysSince(dateStr: string): number {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Reset effectiveness data (for testing)
   */
  resetEffectivenessData(): void {
    localStorage.removeItem(this.storageKey);
  }
}

// Export singleton
export const adaptivePromptSelector = new AdaptivePromptSelector();
