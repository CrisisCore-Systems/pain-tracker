// Empathy-Driven Analytics Service
// Focuses on emotional validation, user agency, and dignity-preserving progress reporting

import type { PainEntry } from '../types';

export interface EmotionalValidationMetrics {
  validationScore: number; // 0-100 scale of how validated the user feels
  emotionalTrends: {
    copingStrategiesUsed: string[];
    emotionalResilience: number;
    supportSystemEngagement: number;
    selfAdvocacyInstances: number;
  };
  validationSources: {
    selfValidation: number;
    communitySupport: number;
    professionalAcknowledment: number;
    familyUnderstanding: number;
  };
}

export interface ProgressCelebrationMetrics {
  achievements: Achievement[];
  milestones: Milestone[];
  personalGrowth: {
    selfAwareness: number;
    copingSkills: number;
    communicationImprovement: number;
    boundarySettingProgress: number;
  };
  meaningfulMoments: MeaningfulMoment[];
}

export interface Achievement {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'personal';
  title: string;
  description: string;
  dateAchieved: string;
  category: 'self_care' | 'communication' | 'coping' | 'advocacy' | 'connection' | 'learning';
  celebrationMessage: string;
  shareableMessage?: string;
  icon?: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dateReached: string;
  significance: 'small' | 'moderate' | 'major' | 'life_changing';
  personalMeaning: string;
  supportNetwork: string[];
  nextSteps: string[];
}

export interface MeaningfulMoment {
  id: string;
  date: string;
  description: string;
  emotionalImpact: number;
  insights: string[];
  gratitude: string[];
  connections: string[];
}

export interface UserAgencyMetrics {
  decisionMakingPower: number; // How much control user feels they have
  selfAdvocacyScore: number;
  choiceExercised: {
    treatmentDecisions: number;
    dailyChoices: number;
    boundarySettings: number;
    communicationStyles: number;
  };
  empowermentActivities: {
    educationSeeking: number;
    resourceUtilization: number;
    communityParticipation: number;
    selfCareInitiatives: number;
  };
}

export interface DignityPreservingReport {
  userDefinedSuccess: string[];
  strengthsBased: {
    resilience: string[];
    resourcefulness: string[];
    wisdom: string[];
    courage: string[];
  };
  growthOriented: {
    learnings: string[];
    adaptations: string[];
    newSkills: string[];
    perspectives: string[];
  };
  personCentered: {
    values: string[];
    priorities: string[];
    preferences: string[];
    goals: string[];
  };
}

export interface EmpathyAnalyticsConfig {
  validationThreshold: number;
  celebrationFrequency: 'immediate' | 'daily' | 'weekly';
  reportingStyle: 'strengths_based' | 'growth_oriented' | 'balanced';
  privacyLevel: 'personal' | 'family' | 'healthcare_team' | 'community';
  languagePreference: 'medical' | 'everyday' | 'metaphorical' | 'mixed';
}

export class EmpathyDrivenAnalyticsService {
  private config: EmpathyAnalyticsConfig;
  private achievements: Map<string, Achievement[]> = new Map();
  private milestones: Map<string, Milestone[]> = new Map();
  private meaningfulMoments: Map<string, MeaningfulMoment[]> = new Map();

  constructor(config: EmpathyAnalyticsConfig) {
    this.config = config;
  }

  // Emotional Validation Analytics
  async calculateEmotionalValidation(
    userId: string,
    entries: PainEntry[],
    timeframe: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<EmotionalValidationMetrics> {
    const recentEntries = this.filterByTimeframe(entries, timeframe);
    
    return {
      validationScore: this.calculateValidationScore(recentEntries),
      emotionalTrends: {
        copingStrategiesUsed: this.extractCopingStrategies(recentEntries),
        emotionalResilience: this.calculateResilience(recentEntries),
        supportSystemEngagement: this.calculateSupportEngagement(recentEntries),
        selfAdvocacyInstances: this.countSelfAdvocacy(recentEntries)
      },
      validationSources: {
        selfValidation: this.calculateSelfValidation(recentEntries),
        communitySupport: this.calculateCommunitySupport(recentEntries),
        professionalAcknowledment: this.calculateProfessionalValidation(recentEntries),
        familyUnderstanding: this.calculateFamilySupport(recentEntries)
      }
    };
  }

  // Progress Celebration Beyond Pain Reduction
  async generateProgressCelebration(
    userId: string,
    entries: PainEntry[]
  ): Promise<ProgressCelebrationMetrics> {
    const achievements = await this.identifyAchievements(userId, entries);
    const milestones = await this.identifyMilestones(userId, entries);
    const meaningfulMoments = await this.identifyMeaningfulMoments(userId, entries);

    return {
      achievements,
      milestones,
      personalGrowth: {
        selfAwareness: this.calculateSelfAwareness(entries),
        copingSkills: this.calculateCopingSkillsGrowth(entries),
        communicationImprovement: this.calculateCommunicationGrowth(entries),
        boundarySettingProgress: this.calculateBoundaryProgress(entries)
      },
      meaningfulMoments
    };
  }

  // User Agency Reinforcement
  async calculateUserAgency(
    userId: string,
    entries: PainEntry[]
  ): Promise<UserAgencyMetrics> {
    return {
      decisionMakingPower: this.calculateDecisionMakingPower(entries),
      selfAdvocacyScore: this.calculateSelfAdvocacyScore(entries),
      choiceExercised: {
        treatmentDecisions: this.countTreatmentChoices(entries),
        dailyChoices: this.countDailyChoices(entries),
        boundarySettings: this.countBoundaryChoices(entries),
        communicationStyles: this.countCommunicationChoices(entries)
      },
      empowermentActivities: {
        educationSeeking: this.countEducationActivities(entries),
        resourceUtilization: this.countResourceUse(entries),
        communityParticipation: this.countCommunityEngagement(entries),
        selfCareInitiatives: this.countSelfCareInitiatives(entries)
      }
    };
  }

  // Dignity-Preserving Progress Reporting
  async generateDignityPreservingReport(
    userId: string,
    entries: PainEntry[]
  ): Promise<DignityPreservingReport> {
    return {
      userDefinedSuccess: await this.extractUserDefinedSuccesses(entries),
      strengthsBased: {
        resilience: this.identifyResilienceStrengths(entries),
        resourcefulness: this.identifyResourcefulness(entries),
        wisdom: this.identifyWisdomGained(entries),
        courage: this.identifyCourage(entries)
      },
      growthOriented: {
        learnings: this.extractLearnings(entries),
        adaptations: this.identifyAdaptations(entries),
        newSkills: this.identifyNewSkills(entries),
        perspectives: this.identifyPerspectiveShifts(entries)
      },
      personCentered: {
        values: this.extractValues(entries),
        priorities: this.identifyPriorities(entries),
        preferences: this.extractPreferences(entries),
        goals: this.identifyGoals(entries)
      }
    };
  }

  // Achievement Recognition System
  private async identifyAchievements(userId: string, entries: PainEntry[]): Promise<Achievement[]> {
    const achievements: Achievement[] = [];
    
    // Daily achievements
    const todayEntries = this.filterByTimeframe(entries, 'daily');
    if (todayEntries.length > 0) {
      achievements.push({
        id: `daily-${Date.now()}`,
        type: 'daily',
        title: 'Showed Up Today',
        description: 'You tracked your experience and showed self-care by paying attention to your needs.',
        dateAchieved: new Date().toISOString(),
        category: 'self_care',
        celebrationMessage: 'Every entry is an act of self-advocacy. You showed up for yourself today! 🌟',
        shareableMessage: 'I practiced self-care by listening to my body today.',
        icon: '💚'
      });
    }

    // Coping strategy achievements
    const copingStrategies = this.extractCopingStrategies(entries);
    if (copingStrategies.length >= 3) {
      achievements.push({
        id: `coping-${Date.now()}`,
        type: 'weekly',
        title: 'Coping Strategy Explorer',
        description: `You've tried ${copingStrategies.length} different coping strategies this week.`,
        dateAchieved: new Date().toISOString(),
        category: 'coping',
        celebrationMessage: `You're building a diverse toolkit! ${copingStrategies.length} strategies shows real wisdom. 🛠️`,
        shareableMessage: 'I\'m expanding my coping toolkit with new strategies.',
        icon: '🛠️'
      });
    }

    // Communication achievements
    const communicationGrowth = this.calculateCommunicationGrowth(entries);
    if (communicationGrowth > 0.7) {
      achievements.push({
        id: `communication-${Date.now()}`,
        type: 'monthly',
        title: 'Voice of Advocacy',
        description: 'You\'ve shown significant growth in expressing your needs and experiences.',
        dateAchieved: new Date().toISOString(),
        category: 'advocacy',
        celebrationMessage: 'Your voice matters, and you\'re using it with increasing confidence! 🗣️',
        shareableMessage: 'I\'m finding my voice and learning to advocate for my needs.',
        icon: '🗣️'
      });
    }

    return achievements;
  }

  private async identifyMilestones(userId: string, entries: PainEntry[]): Promise<Milestone[]> {
    const milestones: Milestone[] = [];
    
    // First entry milestone
    if (entries.length === 1) {
      milestones.push({
        id: `first-entry-${userId}`,
        title: 'Journey Begins',
        description: 'You took the first step in tracking your pain journey.',
        dateReached: entries[0].timestamp,
        significance: 'moderate',
        personalMeaning: 'Starting to honor your experience by documenting it.',
        supportNetwork: ['yourself'],
        nextSteps: ['Continue tracking', 'Explore patterns', 'Be gentle with yourself']
      });
    }

    // Consistency milestones
    const weeklyEntries = this.getEntriesInLastWeeks(entries, 4);
    const consistentWeeks = this.countConsistentWeeks(weeklyEntries);
    
    if (consistentWeeks >= 2) {
      milestones.push({
        id: `consistency-${userId}`,
        title: 'Building Routine',
        description: `You've consistently tracked for ${consistentWeeks} weeks.`,
        dateReached: new Date().toISOString(),
        significance: 'moderate',
        personalMeaning: 'Developing a sustainable practice of self-awareness.',
        supportNetwork: ['yourself', 'routine'],
        nextSteps: ['Celebrate this dedication', 'Notice emerging patterns', 'Trust the process']
      });
    }

    return milestones;
  }

  private async identifyMeaningfulMoments(userId: string, entries: PainEntry[]): Promise<MeaningfulMoment[]> {
    const moments: MeaningfulMoment[] = [];
    
    // Look for entries with significant insights or breakthroughs
    for (const entry of entries) {
      if (entry.notes && this.containsInsightKeywords(entry.notes)) {
        moments.push({
          id: `moment-${entry.timestamp}`,
          date: entry.timestamp,
          description: this.extractInsightDescription(entry.notes),
          emotionalImpact: this.calculateEmotionalImpact(entry),
          insights: this.extractInsights(entry.notes),
          gratitude: this.extractGratitude(entry.notes),
          connections: this.extractConnections(entry.notes)
        });
      }
    }

    return moments;
  }

  // Validation Calculation Methods
  private calculateValidationScore(entries: PainEntry[]): number {
    let validationScore = 0;
    let totalFactors = 0;

    for (const entry of entries) {
      if (entry.notes) {
        // Check for self-validation language
        if (this.containsValidationKeywords(entry.notes)) {
          validationScore += 20;
        }
        
        // Check for support acknowledgment
        if (this.containsSupportKeywords(entry.notes)) {
          validationScore += 15;
        }
        
        // Check for professional validation
        if (this.containsProfessionalValidation(entry.notes)) {
          validationScore += 25;
        }
        
        totalFactors++;
      }
    }

    return totalFactors > 0 ? Math.min(100, validationScore / totalFactors) : 50;
  }

  private extractCopingStrategies(entries: PainEntry[]): string[] {
    const strategies = new Set<string>();
    const strategyKeywords = [
      'meditation', 'breathing', 'rest', 'heat', 'cold', 'massage', 'music',
      'distraction', 'mindfulness', 'exercise', 'stretching', 'bath', 'reading',
      'talking', 'journaling', 'art', 'nature', 'support', 'therapy'
    ];

    for (const entry of entries) {
      if (entry.notes) {
        const notes = entry.notes.toLowerCase();
        for (const keyword of strategyKeywords) {
          if (notes.includes(keyword)) {
            strategies.add(keyword);
          }
        }
      }
    }

    return Array.from(strategies);
  }

  private calculateResilience(entries: PainEntry[]): number {
    // Calculate based on ability to maintain functioning despite pain
    let resilienceScore = 0;
    let validEntries = 0;

    for (const entry of entries) {
      if (entry.baselineData.pain > 6) { // High pain days
        // Check if still able to do activities or maintain positive outlook
        if (entry.notes && this.containsResilienceMarkers(entry.notes)) {
          resilienceScore += 1;
        }
        validEntries++;
      }
    }

    return validEntries > 0 ? (resilienceScore / validEntries) * 100 : 70;
  }

  // Helper methods for keyword detection
  private containsValidationKeywords(text: string): boolean {
    const keywords = ['valid', 'real', 'understand', 'acknowledge', 'believe', 'legitimate'];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private containsSupportKeywords(text: string): boolean {
    const keywords = ['support', 'help', 'care', 'listen', 'friend', 'family', 'group'];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private containsProfessionalValidation(text: string): boolean {
    const keywords = ['doctor', 'therapist', 'nurse', 'specialist', 'diagnosed', 'treatment'];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private containsInsightKeywords(text: string): boolean {
    const keywords = ['realized', 'learned', 'discovered', 'noticed', 'breakthrough', 'understanding'];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private containsResilienceMarkers(text: string): boolean {
    const keywords = ['despite', 'still', 'managed', 'cope', 'through', 'persevere', 'continue'];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  // Utility methods
  private filterByTimeframe(entries: PainEntry[], timeframe: 'daily' | 'weekly' | 'monthly'): PainEntry[] {
    const now = new Date();
    let cutoffDate: Date;

    switch (timeframe) {
      case 'daily':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    return entries.filter(entry => new Date(entry.timestamp) >= cutoffDate);
  }

  // Placeholder methods for complex calculations
  private calculateSupportEngagement(entries: PainEntry[]): number {
    // Implementation would analyze mentions of support interactions
    return 75;
  }

  private countSelfAdvocacy(entries: PainEntry[]): number {
    // Count instances of speaking up, asking for help, setting boundaries
    return entries.filter(entry => 
      entry.notes && this.containsAdvocacyKeywords(entry.notes)
    ).length;
  }

  private containsAdvocacyKeywords(text: string): boolean {
    const keywords = ['asked', 'spoke up', 'boundary', 'need', 'no', 'explained', 'requested'];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  private calculateSelfValidation(entries: PainEntry[]): number { return 80; }
  private calculateCommunitySupport(entries: PainEntry[]): number { return 70; }
  private calculateProfessionalValidation(entries: PainEntry[]): number { return 65; }
  private calculateFamilySupport(entries: PainEntry[]): number { return 75; }
  private calculateSelfAwareness(entries: PainEntry[]): number { return 85; }
  private calculateCopingSkillsGrowth(entries: PainEntry[]): number { return 75; }
  private calculateCommunicationGrowth(entries: PainEntry[]): number { return 80; }
  private calculateBoundaryProgress(entries: PainEntry[]): number { return 70; }
  private calculateDecisionMakingPower(entries: PainEntry[]): number { return 78; }
  private calculateSelfAdvocacyScore(entries: PainEntry[]): number { return 82; }
  private countTreatmentChoices(entries: PainEntry[]): number { return 5; }
  private countDailyChoices(entries: PainEntry[]): number { return 15; }
  private countBoundaryChoices(entries: PainEntry[]): number { return 3; }
  private countCommunicationChoices(entries: PainEntry[]): number { return 8; }
  private countEducationActivities(entries: PainEntry[]): number { return 4; }
  private countResourceUse(entries: PainEntry[]): number { return 6; }
  private countCommunityEngagement(entries: PainEntry[]): number { return 2; }
  private countSelfCareInitiatives(entries: PainEntry[]): number { return 12; }

  private async extractUserDefinedSuccesses(entries: PainEntry[]): Promise<string[]> {
    return ['Getting through tough days', 'Learning about myself', 'Building coping skills'];
  }

  private identifyResilienceStrengths(entries: PainEntry[]): string[] {
    return ['Persistence', 'Adaptability', 'Hope'];
  }

  private identifyResourcefulness(entries: PainEntry[]): string[] {
    return ['Creative problem solving', 'Finding helpful resources', 'Building support networks'];
  }

  private identifyWisdomGained(entries: PainEntry[]): string[] {
    return ['Understanding my patterns', 'Knowing my limits', 'Recognizing what helps'];
  }

  private identifyCourage(entries: PainEntry[]): string[] {
    return ['Facing difficult days', 'Speaking up for needs', 'Trying new approaches'];
  }

  private extractLearnings(entries: PainEntry[]): string[] {
    return ['Pain doesn\'t define me', 'I have more strength than I knew', 'It\'s okay to ask for help'];
  }

  private identifyAdaptations(entries: PainEntry[]): string[] {
    return ['Modified daily routines', 'New communication strategies', 'Flexible goal setting'];
  }

  private identifyNewSkills(entries: PainEntry[]): string[] {
    return ['Mindfulness techniques', 'Pain management strategies', 'Self-advocacy'];
  }

  private identifyPerspectiveShifts(entries: PainEntry[]): string[] {
    return ['Focus on progress not perfection', 'Value rest as productive', 'Appreciate small victories'];
  }

  private extractValues(entries: PainEntry[]): string[] {
    return ['Self-compassion', 'Authenticity', 'Connection', 'Growth'];
  }

  private identifyPriorities(entries: PainEntry[]): string[] {
    return ['Health and wellbeing', 'Meaningful relationships', 'Personal growth'];
  }

  private extractPreferences(entries: PainEntry[]): string[] {
    return ['Gentle approaches', 'Collaborative care', 'Holistic methods'];
  }

  private identifyGoals(entries: PainEntry[]): string[] {
    return ['Better quality of life', 'Increased self-understanding', 'Stronger support network'];
  }

  private extractInsightDescription(notes: string): string {
    // Extract the insight from notes
    return 'Personal breakthrough in understanding pain patterns';
  }

  private calculateEmotionalImpact(entry: PainEntry): number {
    // Calculate emotional significance
    return 75;
  }

  private extractInsights(notes: string): string[] {
    return ['Pain patterns are connected to stress', 'Rest is not giving up'];
  }

  private extractGratitude(notes: string): string[] {
    return ['Supportive friends', 'Access to healthcare', 'Inner strength'];
  }

  private extractConnections(notes: string): string[] {
    return ['Support group', 'Healthcare team', 'Family'];
  }

  private getEntriesInLastWeeks(entries: PainEntry[], weeks: number): PainEntry[] {
    const cutoff = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);
    return entries.filter(entry => new Date(entry.timestamp) >= cutoff);
  }

  private countConsistentWeeks(entries: PainEntry[]): number {
    // Count weeks with consistent entries
    return 3; // Placeholder
  }
}

// Export singleton instance
export const empathyAnalytics = new EmpathyDrivenAnalyticsService({
  validationThreshold: 70,
  celebrationFrequency: 'daily',
  reportingStyle: 'balanced',
  privacyLevel: 'personal',
  languagePreference: 'everyday'
});
