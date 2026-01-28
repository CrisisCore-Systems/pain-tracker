/**
 * Identity Lock-In Service
 * 
 * Creates a sense of personal investment and identity around the pain tracking journey.
 * Helps users see themselves as "someone who tracks their health" through personalized
 * insights, unique patterns, and identity-reinforcing language.
 * 
 * Privacy: All identity data stays local. No external profiling.
 * Trauma-informed: Empowering, not prescriptive. User owns their narrative.
 */

import type { PainEntry } from '../../src/types';

export interface UserIdentity {
  journeyStartDate: string;
  totalDaysTracked: number;
  uniqueInsights: string[];
  personalPatterns: PersonalPattern[];
  identityMilestones: IdentityMilestone[];
  journeyNarrative: string;
  strengthsIdentified: string[];
  selfDefinedGoals: string[];
}

export interface PersonalPattern {
  id: string;
  type: 'pain' | 'relief' | 'trigger' | 'success' | 'resilience';
  title: string;
  description: string;
  discoveredDate: string;
  significance: 'low' | 'medium' | 'high';
  personalMeaning: string;
}

export interface IdentityMilestone {
  id: string;
  title: string;
  description: string;
  achievedDate: string;
  personalSignificance: string;
  celebrationMessage: string;
}

export interface JourneyInsight {
  id: string;
  category: 'awareness' | 'growth' | 'resilience' | 'discovery' | 'connection';
  insight: string;
  context: string;
  emotionalTone: 'validating' | 'encouraging' | 'celebrating' | 'supportive';
}

export class IdentityLockInService {
  private storageKey = 'user-identity-state';

  /**
   * Get user's identity data
   */
  getIdentity(): UserIdentity {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Failed to load user identity:', err);
    }

    return this.getDefaultIdentity();
  }

  /**
   * Save identity data
   */
  private saveIdentity(identity: UserIdentity): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(identity));
    } catch (err) {
      console.error('Failed to save user identity:', err);
    }
  }

  /**
   * Default identity for new users
   */
  private getDefaultIdentity(): UserIdentity {
    return {
      journeyStartDate: '',
      totalDaysTracked: 0,
      uniqueInsights: [],
      personalPatterns: [],
      identityMilestones: [],
      journeyNarrative: '',
      strengthsIdentified: [],
      selfDefinedGoals: [],
    };
  }

  /**
   * Initialize journey
   */
  initializeJourney(entries: PainEntry[]): void {
    const identity = this.getIdentity();
    
    if (!identity.journeyStartDate && entries.length > 0) {
      const oldestEntry = entries.reduce((oldest, entry) => {
        return new Date(entry.timestamp) < new Date(oldest.timestamp) ? entry : oldest;
      });
      identity.journeyStartDate = oldestEntry.timestamp;
    }

    identity.totalDaysTracked = this.calculateUniqueDays(entries);
    this.saveIdentity(identity);
  }

  /**
   * Generate personalized journey narrative
   */
  generateJourneyNarrative(entries: PainEntry[]): string {
    if (entries.length === 0) {
      return "You're about to begin your pain tracking journey. Every entry you make is an act of self-care and self-advocacy.";
    }

    const identity = this.getIdentity();
    const daysSinceStart = this.getDaysSinceStart(identity.journeyStartDate);
    const uniqueDays = this.calculateUniqueDays(entries);

    let narrative = `You started tracking ${daysSinceStart} days ago. `;

    if (uniqueDays >= 30) {
      narrative += `Over ${uniqueDays} days of tracking, you've built a comprehensive understanding of your pain patterns. `;
    } else if (uniqueDays >= 14) {
      narrative += `In ${uniqueDays} days of tracking, you're discovering important patterns about yourself. `;
    } else if (uniqueDays >= 7) {
      narrative += `After ${uniqueDays} days, you're building a foundation of self-awareness. `;
    } else {
      narrative += `${uniqueDays} days tracked - you're building momentum! `;
    }

    // Add insights about consistency
    const consistency = (uniqueDays / daysSinceStart) * 100;
    if (consistency >= 80) {
      narrative += "Your consistency is remarkable. ";
    } else if (consistency >= 50) {
      narrative += "You're showing up regularly for yourself. ";
    }

    // Add personal patterns discovered
    if (identity.personalPatterns.length > 0) {
      narrative += `You've discovered ${identity.personalPatterns.length} personal ${identity.personalPatterns.length === 1 ? 'pattern' : 'patterns'} that are unique to your journey. `;
    }

    narrative += "This is your story, and you're writing it with courage and care.";

    return narrative;
  }

  /**
   * Discover and add personal patterns
   */
  discoverPatterns(entries: PainEntry[]): PersonalPattern[] {
    const identity = this.getIdentity();
    const newPatterns: PersonalPattern[] = [];

    if (entries.length < 3) {
      return newPatterns;
    }

    // Pattern: Consistent tracking shows commitment
    if (entries.length >= 7) {
      const existingCommitment = identity.personalPatterns.find(p => p.id === 'commitment-pattern');
      if (!existingCommitment) {
        newPatterns.push({
          id: 'commitment-pattern',
          type: 'resilience',
          title: 'Committed Self-Advocate',
          description: 'You consistently track your experience, showing dedication to understanding yourself',
          discoveredDate: new Date().toISOString(),
          significance: 'high',
          personalMeaning: 'This consistent tracking demonstrates your commitment to self-care and advocacy',
        });
      }
    }

    // Pattern: Detailed notes show reflection
    const detailedEntries = entries.filter(e => e.notes && e.notes.length > 50);
    if (detailedEntries.length >= 5) {
      const existingReflection = identity.personalPatterns.find(p => p.id === 'reflection-pattern');
      if (!existingReflection) {
        newPatterns.push({
          id: 'reflection-pattern',
          type: 'success',
          title: 'Thoughtful Observer',
          description: 'You take time to reflect deeply on your experiences',
          discoveredDate: new Date().toISOString(),
          significance: 'high',
          personalMeaning: 'Your detailed reflections show emotional intelligence and self-awareness',
        });
      }
    }

    // Pattern: Medication tracking shows active management
    const medEntries = entries.filter(e => e.medications && e.medications.current.length > 0);
    if (medEntries.length >= 3) {
      const existingMed = identity.personalPatterns.find(p => p.id === 'medication-pattern');
      if (!existingMed) {
        newPatterns.push({
          id: 'medication-pattern',
          type: 'success',
          title: 'Active Manager',
          description: 'You actively track and manage your medication regimen',
          discoveredDate: new Date().toISOString(),
          significance: 'medium',
          personalMeaning: 'You take an active role in managing your health',
        });
      }
    }

    // Save new patterns
    if (newPatterns.length > 0) {
      identity.personalPatterns.push(...newPatterns);
      this.saveIdentity(identity);
    }

    return newPatterns;
  }

  /**
   * Add identity milestone
   */
  addMilestone(milestone: Omit<IdentityMilestone, 'achievedDate'>): void {
    const identity = this.getIdentity();
    
    const existingMilestone = identity.identityMilestones.find(m => m.id === milestone.id);
    if (existingMilestone) {
      return;
    }

    identity.identityMilestones.push({
      ...milestone,
      achievedDate: new Date().toISOString(),
    });

    this.saveIdentity(identity);
  }

  /**
   * Get identity-reinforcing insights
   */
  getIdentityInsights(entries: PainEntry[]): JourneyInsight[] {
    const insights: JourneyInsight[] = [];
    const identity = this.getIdentity();

    if (entries.length === 1) {
      insights.push({
        id: 'first-step',
        category: 'awareness',
        insight: "You've taken the first step in your tracking journey",
        context: "Starting is often the hardest part. You did it.",
        emotionalTone: 'celebrating',
      });
    }

    if (entries.length >= 7) {
      insights.push({
        id: 'emerging-identity',
        category: 'discovery',
        insight: "You're becoming someone who prioritizes self-understanding",
        context: `With ${entries.length} entries, you're building a practice of self-awareness`,
        emotionalTone: 'validating',
      });
    }

    if (identity.personalPatterns.length >= 3) {
      insights.push({
        id: 'pattern-expert',
        category: 'growth',
        insight: "You've discovered unique patterns that are yours alone",
        context: `${identity.personalPatterns.length} personal patterns identified`,
        emotionalTone: 'celebrating',
      });
    }

    const daysSinceStart = this.getDaysSinceStart(identity.journeyStartDate);
    if (daysSinceStart >= 30) {
      insights.push({
        id: 'month-veteran',
        category: 'resilience',
        insight: "You've maintained this practice for over a month",
        context: "This level of commitment shows real dedication to yourself",
        emotionalTone: 'celebrating',
      });
    }

    return insights;
  }

  /**
   * Get identity-reinforcing language for UI
   */
  getIdentityLanguage(entries: PainEntry[]): Record<string, string> {
    const uniqueDays = this.calculateUniqueDays(entries);

    if (uniqueDays === 0) {
      return {
        title: 'Begin Your Journey',
        subtitle: 'Start tracking your unique experience',
        action: 'Make Your First Entry',
      };
    } else if (uniqueDays < 7) {
      return {
        title: 'Building Your Story',
        subtitle: `${uniqueDays} days tracked - you're creating something meaningful`,
        action: 'Continue Your Journey',
      };
    } else if (uniqueDays < 30) {
      return {
        title: 'Your Emerging Pattern',
        subtitle: `${uniqueDays} days of self-awareness and growth`,
        action: 'Add to Your Story',
      };
    } else {
      return {
        title: 'Your 30-Day Story',
        subtitle: `${uniqueDays} days of tracking your unique journey`,
        action: 'Continue Your Practice',
      };
    }
  }

  /**
   * Add a strength identified through tracking
   */
  addStrength(strength: string): void {
    const identity = this.getIdentity();
    
    if (!identity.strengthsIdentified.includes(strength)) {
      identity.strengthsIdentified.push(strength);
      this.saveIdentity(identity);
    }
  }

  /**
   * Add a self-defined goal
   */
  addGoal(goal: string): void {
    const identity = this.getIdentity();
    
    if (!identity.selfDefinedGoals.includes(goal)) {
      identity.selfDefinedGoals.push(goal);
      this.saveIdentity(identity);
    }
  }

  /**
   * Calculate unique days tracked
   */
  private calculateUniqueDays(entries: PainEntry[]): number {
    const uniqueDates = new Set(
      entries.map(e => new Date(e.timestamp).toISOString().split('T')[0])
    );
    return uniqueDates.size;
  }

  /**
   * Calculate days since journey start
   */
  private getDaysSinceStart(startDate: string): number {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Reset identity (for testing or user request)
   */
  resetIdentity(): void {
    localStorage.removeItem(this.storageKey);
  }
}

// Export singleton instance
export const identityLockInService = new IdentityLockInService();
