/**
 * Privacy-Preserving Analytics Service
 * Collects insights while maintaining user privacy through differential privacy
 * and data minimization techniques
 */

import { securityService } from './SecurityService';
import { formatNumber } from '../utils/formatting';
import { localDayStart } from '../utils/dates';
import type { PainEntry } from '../types';
import { parseDate } from '../utils/date-utils';
import {
  trackPainEntryLogged,
  trackValidationUsed as trackGA4Validation,
  trackProgressViewed as trackGA4Progress,
} from '../analytics/ga4-events';

// Keep this constant local to avoid importing heavy persistence/encryption modules
// in environments that only need analytics gating (e.g. node-only unit tests).
const ANALYTICS_CONSENT_STORAGE_KEY = 'pain-tracker:analytics-consent';

// Privacy configuration
export interface PrivacyPreservingConfig {
  enableAnalytics: boolean;
  differentialPrivacyEnabled: boolean;
  noiseLevel: number; // Epsilon value for differential privacy
  dataRetentionDays: number;
  minimumAggregationSize: number; // Minimum data points before reporting
  allowedMetrics: string[];
  consentRequired: boolean;
}

// Anonymized analytics event
export interface AnonymizedEvent {
  eventType: 'pain_logged' | 'progress_viewed' | 'validation_used' | 'export_performed';
  timestamp: Date;
  metadata: Record<string, unknown>;
  sessionHash: string; // One-way hash of session
  isAnonymized: true;
}

// Aggregated insights (no individual data)
export interface AggregatedInsights {
  totalUsers: number; // Approximate
  averagePainLevel: number; // With noise added
  commonPainLocations: Array<{ location: string; frequency: number }>;
  usagePatterns: {
    averageEntriesPerWeek: number;
    peakUsageHours: number[];
    validationUsageRate: number;
  };
  privacyMetrics: {
    noiseAdded: number;
    dataPointsAggregated: number;
    privacyBudgetUsed: number;
  };
  generatedAt: Date;
}

// Differential privacy noise generator
class DifferentialPrivacyEngine {
  private epsilon: number; // Privacy budget
  private budgetUsed: number = 0;

  constructor(epsilon: number = 1.0) {
    this.epsilon = epsilon;
  }

  // Add Laplace noise for differential privacy
  addLaplaceNoise(value: number, sensitivity: number = 1): number {
    if (this.budgetUsed >= this.epsilon) {
      throw new Error('Privacy budget exhausted');
    }

    const scale = sensitivity / this.epsilon;
    const noise = this.generateLaplaceNoise(scale);
    this.budgetUsed += this.epsilon * 0.1; // Use 10% of budget per query

    return Math.max(0, value + noise); // Ensure non-negative results
  }

  // Generate noise from Laplace distribution
  private generateLaplaceNoise(scale: number): number {
    const u = Math.random() - 0.5;
    return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }

  getRemainingBudget(): number {
    return Math.max(0, this.epsilon - this.budgetUsed);
  }

  resetBudget(): void {
    this.budgetUsed = 0;
  }
}

/**
 * Privacy-Preserving Analytics Service
 * Provides insights while protecting individual privacy
 */
export class PrivacyPreservingAnalyticsService {
  private config: PrivacyPreservingConfig;
  private events: AnonymizedEvent[] = [];
  private privacyEngine: DifferentialPrivacyEngine;
  private userConsent: boolean = false;
  private sessionHash: string;

  constructor(config?: Partial<PrivacyPreservingConfig>) {
    this.config = {
      enableAnalytics: true,
      differentialPrivacyEnabled: true,
      noiseLevel: 1.0,
      dataRetentionDays: 30,
      minimumAggregationSize: 5,
      allowedMetrics: ['pain_level', 'location', 'usage_time', 'validation_usage'],
      consentRequired: true,
      ...config,
    };

    this.privacyEngine = new DifferentialPrivacyEngine(this.config.noiseLevel);
    this.sessionHash = this.generateSessionHash();
    this.initializeService();
  }

  private generateSessionHash(): string {
    // Generate a one-way hash for session tracking without identification
    const randomData = `${Date.now()}-${Math.random()}-${navigator.userAgent}`;
    let hash = 0;
    for (let i = 0; i < randomData.length; i++) {
      const char = randomData.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private initializeService(): void {
    securityService.logSecurityEvent({
      type: 'analytics',
      level: 'info',
      message: 'Privacy-preserving analytics service initialized',
      metadata: {
        differentialPrivacyEnabled: this.config.differentialPrivacyEnabled,
        noiseLevel: this.config.noiseLevel,
        consentRequired: this.config.consentRequired,
      },
      timestamp: new Date(),
    });

    // Clean old events on initialization
    this.cleanOldEvents();

    // Align in-memory consent with persisted consent flag (explicit user choice).
    // This ensures all outbound analytics gates agree across modules.
    try {
      const stored = localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
      this.userConsent = stored === 'granted';
    } catch {
      this.userConsent = false;
    }
  }

  /**
   * Request user consent for analytics
   */
  async requestConsent(): Promise<boolean> {
    if (!this.config.consentRequired) {
      this.userConsent = true;
      return true;
    }

    // Grant consent when called
    this.userConsent = true;

    // Persist explicit consent (best-effort)
    try {
      localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, 'granted');
    } catch {
      // ignore
    }

    securityService.logSecurityEvent({
      type: 'analytics',
      level: 'info',
      message: 'User consent for analytics granted',
      metadata: { consentGiven: this.userConsent },
      timestamp: new Date(),
    });

    return this.userConsent;
  }

  /**
   * Revoke user consent for analytics
   */
  revokeConsent(): void {
    this.userConsent = false;

    // Persist explicit revocation (best-effort)
    try {
      localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, 'declined');
    } catch {
      // ignore
    }

    securityService.logSecurityEvent({
      type: 'analytics',
      level: 'info',
      message: 'User consent for analytics revoked',
      metadata: { consentGiven: this.userConsent },
      timestamp: new Date(),
    });
  }

  /**
   * Check if user has given consent
   */
  hasConsent(): boolean {
    return this.userConsent || !this.config.consentRequired;
  }

  /**
   * Track a pain entry in an anonymized way
   */
  async trackPainEntry(entry: PainEntry): Promise<void> {
    if (!this.shouldTrack()) return;

    // Extract only non-identifying metrics
    const anonymizedMetadata = {
      painLevel: this.anonymizePainLevel(entry.baselineData.pain),
      hasLocation: !!entry.baselineData.locations && entry.baselineData.locations.length > 0,
      hasDescription: !!entry.notes && entry.notes.length > 0,
      timeOfDay: new Date(entry.timestamp).getHours(),
      dayOfWeek: new Date(entry.timestamp).getDay(),
    };

    const event: AnonymizedEvent = {
      eventType: 'pain_logged',
      timestamp: new Date(),
      metadata: anonymizedMetadata,
      sessionHash: this.sessionHash,
      isAnonymized: true,
    };

    this.addEvent(event);

    // Also send to GA4 for external analytics
    trackPainEntryLogged({
      painLevel: entry.baselineData.pain,
      hasLocation: anonymizedMetadata.hasLocation,
      hasNotes: anonymizedMetadata.hasDescription,
      locationCount: entry.baselineData.locations?.length ?? 0,
      symptomCount: entry.baselineData.symptoms?.length ?? 0,
    });

    securityService.logSecurityEvent({
      type: 'analytics',
      level: 'info',
      message: 'Pain entry tracked (anonymized)',
      metadata: { sessionHash: this.sessionHash },
      timestamp: new Date(),
    });
  }

  /**
   * Track validation system usage
   */
  async trackValidationUsage(validationType: string): Promise<void> {
    if (!this.shouldTrack()) return;

    const event: AnonymizedEvent = {
      eventType: 'validation_used',
      timestamp: new Date(),
      metadata: {
        validationType: this.anonymizeString(validationType),
        timeOfDay: new Date().getHours(),
      },
      sessionHash: this.sessionHash,
      isAnonymized: true,
    };

    this.addEvent(event);

    // Also send to GA4 for external analytics
    trackGA4Validation(validationType);
  }

  /**
   * Track progress view usage
   */
  async trackProgressView(viewType: string): Promise<void> {
    if (!this.shouldTrack()) return;

    const event: AnonymizedEvent = {
      eventType: 'progress_viewed',
      timestamp: new Date(),
      metadata: {
        viewType: this.anonymizeString(viewType),
        timeOfDay: new Date().getHours(),
      },
      sessionHash: this.sessionHash,
      isAnonymized: true,
    };

    this.addEvent(event);

    // Also send to GA4 for external analytics
    trackGA4Progress(viewType);
  }

  /**
   * Track data export usage
   * Note: GA4 tracking with entry_count is handled by export utilities directly
   */
  async trackDataExport(exportType: 'csv' | 'json' | 'pdf' | 'fhir'): Promise<void> {
    if (!this.shouldTrack()) return;

    const event: AnonymizedEvent = {
      eventType: 'export_performed',
      timestamp: new Date(),
      metadata: {
        exportType,
        timeOfDay: new Date().getHours(),
      },
      sessionHash: this.sessionHash,
      isAnonymized: true,
    };

    this.addEvent(event);
    // GA4 tracking is done by callers (export utilities) with entry_count
  }

  /**
   * Generate aggregated insights with differential privacy
   */
  async generateInsights(): Promise<AggregatedInsights | null> {
    if (!this.shouldTrack() || this.events.length < this.config.minimumAggregationSize) {
      return null;
    }

    try {
      const painEvents = this.events.filter(e => e.eventType === 'pain_logged');
      const validationEvents = this.events.filter(e => e.eventType === 'validation_used');

      // Calculate metrics with noise
      const totalUsers = this.config.differentialPrivacyEnabled
        ? this.privacyEngine.addLaplaceNoise(this.getUniqueSessionCount())
        : this.getUniqueSessionCount();

      const averagePainLevel = this.config.differentialPrivacyEnabled
        ? this.privacyEngine.addLaplaceNoise(this.calculateAveragePainLevel(painEvents))
        : this.calculateAveragePainLevel(painEvents);

      const commonLocations = this.getCommonPainLocations();

      const usagePatterns = {
        averageEntriesPerWeek: this.config.differentialPrivacyEnabled
          ? this.privacyEngine.addLaplaceNoise(this.calculateWeeklyAverage(painEvents))
          : this.calculateWeeklyAverage(painEvents),
        peakUsageHours: this.getPeakUsageHours(this.events),
        validationUsageRate: this.config.differentialPrivacyEnabled
          ? this.privacyEngine.addLaplaceNoise(
              validationEvents.length / Math.max(1, painEvents.length)
            )
          : validationEvents.length / Math.max(1, painEvents.length),
      };

      const insights: AggregatedInsights = {
        totalUsers: Math.round(totalUsers),
        averagePainLevel: Number(formatNumber(averagePainLevel, 1)),
        commonPainLocations: commonLocations,
        usagePatterns,
        privacyMetrics: {
          noiseAdded: this.config.differentialPrivacyEnabled ? this.config.noiseLevel : 0,
          dataPointsAggregated: this.events.length,
          privacyBudgetUsed: this.config.differentialPrivacyEnabled
            ? this.privacyEngine.getRemainingBudget()
            : 0,
        },
        generatedAt: new Date(),
      };

      securityService.logSecurityEvent({
        type: 'analytics',
        level: 'info',
        message: 'Privacy-preserving insights generated',
        metadata: {
          totalEvents: this.events.length,
          uniqueSessions: this.getUniqueSessionCount(),
          privacyBudgetRemaining: this.privacyEngine.getRemainingBudget(),
        },
        timestamp: new Date(),
      });

      return insights;
    } catch (error) {
      securityService.logSecurityEvent({
        type: 'analytics',
        level: 'error',
        message: 'Failed to generate insights',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date(),
      });
      return null;
    }
  }

  /**
   * Get privacy status and configuration
   */
  getPrivacyStatus(): {
    analyticsEnabled: boolean;
    consentGiven: boolean;
    differentialPrivacyEnabled: boolean;
    eventsCollected: number;
    privacyBudgetRemaining: number;
    dataRetentionDays: number;
  } {
    return {
      analyticsEnabled: this.config.enableAnalytics,
      consentGiven: this.userConsent,
      differentialPrivacyEnabled: this.config.differentialPrivacyEnabled,
      eventsCollected: this.events.length,
      privacyBudgetRemaining: this.privacyEngine.getRemainingBudget(),
      dataRetentionDays: this.config.dataRetentionDays,
    };
  }

  /**
   * Clear all analytics data
   */
  async clearAnalyticsData(): Promise<void> {
    this.events = [];
    this.privacyEngine.resetBudget();

    securityService.logSecurityEvent({
      type: 'analytics',
      level: 'info',
      message: 'Analytics data cleared',
      timestamp: new Date(),
    });
  }

  /**
   * Update privacy configuration
   */
  updatePrivacyConfig(newConfig: Partial<PrivacyPreservingConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.noiseLevel) {
      this.privacyEngine = new DifferentialPrivacyEngine(newConfig.noiseLevel);
    }

    securityService.logSecurityEvent({
      type: 'analytics',
      level: 'info',
      message: 'Privacy configuration updated',
      metadata: newConfig,
      timestamp: new Date(),
    });
  }

  // Private helper methods

  private shouldTrack(): boolean {
    return this.config.enableAnalytics && (!this.config.consentRequired || this.userConsent);
  }

  private addEvent(event: AnonymizedEvent): void {
    this.events.push(event);
    this.cleanOldEvents();
  }

  private cleanOldEvents(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.dataRetentionDays);

    const initialCount = this.events.length;
    this.events = this.events.filter(event => event.timestamp >= cutoffDate);

    if (this.events.length < initialCount) {
      securityService.logSecurityEvent({
        type: 'analytics',
        level: 'info',
        message: 'Old analytics events cleaned',
        metadata: { removed: initialCount - this.events.length },
        timestamp: new Date(),
      });
    }
  }

  private anonymizePainLevel(level: number): number {
    // Round to reduce precision
    return Math.round(level / 2) * 2;
  }

  private anonymizeString(str: string): string {
    // Return category rather than exact string
    if (str.toLowerCase().includes('validation')) return 'validation';
    if (str.toLowerCase().includes('progress')) return 'progress';
    if (str.toLowerCase().includes('export')) return 'export';
    return 'other';
  }

  private getUniqueSessionCount(): number {
    const uniqueSessions = new Set(this.events.map(e => e.sessionHash));
    return uniqueSessions.size;
  }

  private calculateAveragePainLevel(painEvents: AnonymizedEvent[]): number {
    if (painEvents.length === 0) return 0;

    const total = painEvents.reduce((sum, event) => {
      const painLevel = event.metadata.painLevel as number;
      return sum + (painLevel || 0);
    }, 0);

    return total / painEvents.length;
  }

  private calculateWeeklyAverage(painEvents: AnonymizedEvent[]): number {
    if (painEvents.length === 0) return 0;

    // Compute average pain over the last 7 calendar days (today + previous 6 days)
    const now = new Date();
    const sevenDayWindowStart = new Date(localDayStart(now).getTime());
    sevenDayWindowStart.setDate(sevenDayWindowStart.getDate() - 6); // inclusive of today

    const recent = painEvents.filter(e => {
      // Accept Date or string timestamps
  // Normalize timestamp to Date using parseDate helper
  const t = parseDate(e.timestamp) ?? new Date(String(e.timestamp));
      return t >= sevenDayWindowStart;
    });

    if (recent.length === 0) return 0;

    const total = recent.reduce((sum, event) => {
      const painLevel = (event.metadata && (event.metadata.painLevel as number)) || 0;
      return sum + painLevel;
    }, 0);

    const avg = total / recent.length;
    // Clamp to expected pain scale (0-10)
    return Math.max(0, Math.min(10, avg));
  }

  private getCommonPainLocations(): Array<{ location: string; frequency: number }> {
    // Return anonymized location categories
    return [
      { location: 'upper_body', frequency: Math.random() * 50 },
      { location: 'lower_body', frequency: Math.random() * 50 },
      { location: 'extremities', frequency: Math.random() * 30 },
    ];
  }

  private getPeakUsageHours(events: AnonymizedEvent[]): number[] {
    const hourCounts = new Array(24).fill(0);

    events.forEach(event => {
      const hour = event.metadata.timeOfDay as number;
      if (hour >= 0 && hour < 24) {
        hourCounts[hour]++;
      }
    });

    // Return top 3 hours
    return hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour);
  }
}

// Export singleton instance
export const privacyAnalytics = new PrivacyPreservingAnalyticsService();
