/**
 * Simplified Validation Integration Service
 * Core functionality for validation technology without complex storage
 */

import type { ValidationResponse } from './EmotionalValidationService';
import type { ProgressEntry } from '../components/progress/HolisticProgressTracker';

// Validation Event Types
export interface ValidationEvent {
  type: 'validation_generated' | 'validation_viewed' | 'progress_updated' | 'agency_action';
  data: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
}

// Pattern Detection
export interface ValidationPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  lastSeen: Date;
  insights: string[];
}

// Progress Insights
export interface ProgressInsights {
  trends: {
    emotional: 'improving' | 'stable' | 'declining';
    functional: 'improving' | 'stable' | 'declining';
    social: 'improving' | 'stable' | 'declining';
    coping: 'improving' | 'stable' | 'declining';
  };
  achievements: string[];
  recommendations: string[];
  patterns: ValidationPattern[];
}

// Simplified Analytics Service
export class ValidationAnalyticsService {
  private events: ValidationEvent[] = [];
  private validations: ValidationResponse[] = [];
  private progressEntries: ProgressEntry[] = [];

  async recordEvent(event: ValidationEvent): Promise<void> {
    this.events.push({
      ...event,
      timestamp: new Date(),
    });
  }

  async saveValidation(validation: ValidationResponse): Promise<void> {
    this.validations.push(validation);
  }

  async saveProgressEntry(entry: ProgressEntry): Promise<void> {
    this.progressEntries.push(entry);
  }

  async getValidationHistory(days: number = 30): Promise<ValidationResponse[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.validations.filter(v => new Date(v.timestamp) >= cutoffDate);
  }

  async getProgressHistory(days: number = 30): Promise<ProgressEntry[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.progressEntries.filter(entry => new Date(entry.date) >= cutoffDate);
  }

  async detectPatterns(): Promise<ValidationPattern[]> {
    // Simple pattern detection based on validation frequency
    const validationCount = this.validations.length;
    const patterns: ValidationPattern[] = [];

    if (validationCount > 10) {
      patterns.push({
        id: 'frequent-validation',
        name: 'Regular Validation Usage',
        description: 'User frequently seeks emotional validation',
        frequency: validationCount,
        lastSeen: new Date(),
        insights: [
          'Strong engagement with validation features',
          'Consistent emotional support seeking',
        ],
      });
    }

    return patterns;
  }

  async generateInsights(): Promise<ProgressInsights> {
    const recentProgress = await this.getProgressHistory(14);

    if (recentProgress.length === 0) {
      return {
        trends: {
          emotional: 'stable',
          functional: 'stable',
          social: 'stable',
          coping: 'stable',
        },
        achievements: [],
        recommendations: ['Start tracking your progress to get personalized insights'],
        patterns: [],
      };
    }

    // Simple trend analysis
    const latest = recentProgress[recentProgress.length - 1];
    const earliest = recentProgress[0];

    const emotionalTrend = this.calculateTrend(
      earliest.wellbeingMetrics.emotional.mood,
      latest.wellbeingMetrics.emotional.mood
    );

    return {
      trends: {
        emotional: emotionalTrend,
        functional: 'stable',
        social: 'stable',
        coping: 'stable',
      },
      achievements: this.calculateAchievements(recentProgress),
      recommendations: this.generateRecommendations(recentProgress),
      patterns: await this.detectPatterns(),
    };
  }

  private calculateTrend(oldValue: number, newValue: number): 'improving' | 'stable' | 'declining' {
    const diff = newValue - oldValue;
    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'declining';
    return 'stable';
  }

  private calculateAchievements(entries: ProgressEntry[]): string[] {
    const achievements: string[] = [];

    if (entries.length >= 7) {
      achievements.push('Tracked progress for a full week');
    }

    if (entries.length >= 30) {
      achievements.push('Maintained consistent tracking for a month');
    }

    return achievements;
  }

  private generateRecommendations(entries: ProgressEntry[]): string[] {
    const recommendations: string[] = [];

    if (entries.length > 0) {
      const latest = entries[entries.length - 1];

      if (latest.wellbeingMetrics.emotional.mood < 5) {
        recommendations.push('Consider reaching out to your support network');
        recommendations.push('Try a gentle coping strategy like deep breathing');
      }

      if (latest.wellbeingMetrics.functional.independenceLevel < 7) {
        recommendations.push('Focus on small, achievable daily tasks');
      }
    }

    return recommendations;
  }
}

// Main Integration Service
export class ValidationIntegrationService {
  private analytics = new ValidationAnalyticsService();

  async trackValidationEvent(event: ValidationEvent): Promise<void> {
    await this.analytics.recordEvent(event);
  }

  async saveValidation(validation: ValidationResponse): Promise<void> {
    await this.analytics.saveValidation(validation);

    await this.trackValidationEvent({
      type: 'validation_generated',
      data: {
        tone: validation.tone,
        message: validation.message,
        timestamp: validation.timestamp,
      },
      timestamp: new Date(),
    });
  }

  async saveProgressEntry(entry: ProgressEntry): Promise<void> {
    await this.analytics.saveProgressEntry(entry);

    await this.trackValidationEvent({
      type: 'progress_updated',
      data: {
        emotional: entry.wellbeingMetrics.emotional,
        functional: entry.wellbeingMetrics.functional,
      },
      timestamp: new Date(),
    });
  }

  async getValidationHistory(days?: number): Promise<ValidationResponse[]> {
    return this.analytics.getValidationHistory(days);
  }

  async getProgressHistory(days?: number): Promise<ProgressEntry[]> {
    return this.analytics.getProgressHistory(days);
  }

  async generateProgressInsights(): Promise<ProgressInsights> {
    return this.analytics.generateInsights();
  }

  async detectValidationPatterns(): Promise<ValidationPattern[]> {
    return this.analytics.detectPatterns();
  }
}

// Export singleton instance
export const validationIntegration = new ValidationIntegrationService();

// Export singleton analytics instance
export const validationAnalytics = new ValidationAnalyticsService();

// Export types for external use
export type ValidationMetrics = {
  totalValidations: number;
  averageRating: number;
  frequentPatterns: ValidationPattern[];
  lastValidation: Date | null;
};

export type ValidationPreferences = {
  tone: 'gentle' | 'encouraging' | 'realistic' | 'empowering';
  frequency: 'low' | 'medium' | 'high';
  focusAreas: string[];
  privacyLevel: 'minimal' | 'standard' | 'comprehensive';
};
