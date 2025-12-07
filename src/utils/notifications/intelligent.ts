import type { Notification, NotificationType } from '../../types/notifications';
import type { PainEntry } from '../../types';
import { notificationStorage } from './storage';
import { browserNotificationManager } from './browser';
import { formatNumber } from '../formatting';
import { localDayStart, isSameLocalDay } from '../../utils/dates';
import { goalStorage } from '../goals/storage';

export interface TriggerCondition {
  type:
    | 'pain_threshold'
    | 'pattern_recognition'
    | 'medication_due'
    | 'goal_progress'
    | 'time_since_last_entry'
    | 'streak_maintenance';
  threshold?: number;
  pattern?: string;
  medicationId?: string;
  goalId?: string;
  timeWindow?: number; // in hours
  streakLength?: number;
}

export interface IntelligentTrigger {
  id: string;
  name: string;
  description: string;
  type: NotificationType;
  conditions: TriggerCondition[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  cooldownPeriod: number; // minutes between triggers
  maxTriggersPerDay: number;
  isActive: boolean;
  lastTriggered?: string;
  triggerCount: number;
}

export interface TriggerAnalysisResult {
  shouldTrigger: boolean;
  confidence: number; // 0-1
  reason: string;
  recommendedPriority?: 'low' | 'medium' | 'high' | 'urgent';
}

class IntelligentNotificationTrigger {
  private static instance: IntelligentNotificationTrigger;
  private activeTriggers: Map<string, IntelligentTrigger> = new Map();
  private lastAnalysis: Map<string, Date> = new Map();
  private analysisCooldown = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): IntelligentNotificationTrigger {
    if (!IntelligentNotificationTrigger.instance) {
      IntelligentNotificationTrigger.instance = new IntelligentNotificationTrigger();
    }
    return IntelligentNotificationTrigger.instance;
  }

  // Register an intelligent trigger
  registerTrigger(trigger: IntelligentTrigger): void {
    this.activeTriggers.set(trigger.id, trigger);
  }

  // Unregister a trigger
  unregisterTrigger(triggerId: string): void {
    this.activeTriggers.delete(triggerId);
  }

  // Analyze all active triggers
  async analyzeTriggers(entries: PainEntry[]): Promise<void> {
    const now = new Date();

    for (const trigger of this.activeTriggers.values()) {
      if (!trigger.isActive) continue;

      // Check cooldown period
      const lastAnalysis = this.lastAnalysis.get(trigger.id);
      if (lastAnalysis && now.getTime() - lastAnalysis.getTime() < this.analysisCooldown) {
        continue;
      }

      // Check daily trigger limit
      if (this.hasExceededDailyLimit(trigger)) {
        continue;
      }

      // Analyze trigger conditions
      const result = await this.analyzeTrigger(trigger, entries);

      if (result.shouldTrigger) {
        await this.executeTrigger(trigger, result);
        this.lastAnalysis.set(trigger.id, now);
      }
    }
  }

  // Analyze a specific trigger
  private async analyzeTrigger(
    trigger: IntelligentTrigger,
    entries: PainEntry[]
  ): Promise<TriggerAnalysisResult> {
    let totalConfidence = 0;
    let conditionCount = 0;
    const reasons: string[] = [];

    for (const condition of trigger.conditions) {
      const result = await this.evaluateCondition(condition, entries);
      totalConfidence += result.confidence;
      conditionCount++;

      if (result.shouldTrigger) {
        reasons.push(result.reason);
      }
    }

    const averageConfidence = conditionCount > 0 ? totalConfidence / conditionCount : 0;
    const shouldTrigger = averageConfidence >= 0.7; // 70% confidence threshold

    return {
      shouldTrigger,
      confidence: averageConfidence,
      reason: reasons.join('; '),
      recommendedPriority: this.calculateRecommendedPriority(trigger, averageConfidence),
    };
  }

  // Evaluate a single condition
  private async evaluateCondition(
    condition: TriggerCondition,
    entries: PainEntry[]
  ): Promise<TriggerAnalysisResult> {
    switch (condition.type) {
      case 'pain_threshold':
        return this.evaluatePainThreshold(condition, entries);
      case 'pattern_recognition':
        return this.evaluatePatternRecognition(condition, entries);
      case 'medication_due':
        return this.evaluateMedicationDue(condition, entries);
      case 'goal_progress':
        return this.evaluateGoalProgress();
      case 'time_since_last_entry':
        return this.evaluateTimeSinceLastEntry(condition, entries);
      case 'streak_maintenance':
        return this.evaluateStreakMaintenance(condition, entries);
      default:
        return { shouldTrigger: false, confidence: 0, reason: 'Unknown condition type' };
    }
  }

  // Execute a trigger
  private async executeTrigger(
    trigger: IntelligentTrigger,
    analysis: TriggerAnalysisResult
  ): Promise<void> {
    try {
      // Create notification
      const notification: Omit<Notification, 'id'> = {
        userId: 'current-user',
        type: trigger.type,
        title: this.generateTriggerTitle(trigger),
        message: this.generateTriggerMessage(trigger, analysis),
        priority: analysis.recommendedPriority || trigger.priority,
        status: 'sent',
        deliveryMethods: ['in_app'],
        sentAt: new Date().toISOString(),
        metadata: {
          triggerId: trigger.id,
          confidence: analysis.confidence,
          reason: analysis.reason,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Generate ID and save
      const notificationId = `intelligent_${trigger.id}_${Date.now()}`;
      const fullNotification: Notification = { ...notification, id: notificationId };

      await notificationStorage.saveNotification(fullNotification);

      // Update trigger stats
      const updatedTrigger: IntelligentTrigger = {
        ...trigger,
        lastTriggered: new Date().toISOString(),
        triggerCount: trigger.triggerCount + 1,
      };
      this.activeTriggers.set(trigger.id, updatedTrigger);

      // Show browser notification if supported
      if (
        browserNotificationManager.isSupported() &&
        browserNotificationManager.getPermission() === 'granted'
      ) {
        await browserNotificationManager.showFromNotification(fullNotification);
      }

      // Log successful trigger execution (in development only)
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `Intelligent trigger executed: ${trigger.name} (${formatNumber(analysis.confidence, 2)} confidence)`
        );
      }
    } catch (error) {
      console.error('Failed to execute intelligent trigger:', error);
    }
  }

  // Condition evaluators
  private evaluatePainThreshold(
    condition: TriggerCondition,
    entries: PainEntry[]
  ): TriggerAnalysisResult {
    if (!condition.threshold || entries.length === 0) {
      return {
        shouldTrigger: false,
        confidence: 0,
        reason: 'Insufficient data for pain threshold analysis',
      };
    }

    const recentEntries = entries.slice(-7); // Last 7 entries
    const avgPain =
      recentEntries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / recentEntries.length;

    const shouldTrigger = avgPain >= condition.threshold;
    const confidence = Math.min(avgPain / 10, 1); // Normalize to 0-1

    return {
      shouldTrigger,
      confidence,
      reason: `Average pain level ${formatNumber(avgPain, 1)}/10 ${shouldTrigger ? 'exceeds' : 'below'} threshold ${condition.threshold}`,
    };
  }

  private evaluatePatternRecognition(
    condition: TriggerCondition,
    entries: PainEntry[]
  ): TriggerAnalysisResult {
    if (entries.length < 5) {
      return {
        shouldTrigger: false,
        confidence: 0,
        reason: 'Insufficient data for pattern recognition',
      };
    }

    // Simple pattern: increasing pain trend
    const recentEntries = entries.slice(-5);
    const painLevels = recentEntries.map(e => e.baselineData.pain);
    const trend = this.calculateTrend(painLevels);

    const shouldTrigger = trend > 0.5; // Increasing trend
    const confidence = Math.abs(trend);

    return {
      shouldTrigger,
      confidence,
      reason: `Pain trend ${trend > 0 ? 'increasing' : 'decreasing'} with ${formatNumber(confidence, 2)} confidence`,
    };
  }

  private evaluateMedicationDue(
    _condition: TriggerCondition,
    entries: PainEntry[]
  ): TriggerAnalysisResult {
    // Check recent entries for medication data
    if (entries.length === 0) {
      return {
        shouldTrigger: false,
        confidence: 0,
        reason: 'No entries available for medication analysis',
      };
    }

    const recentEntries = entries.slice(-7); // Last 7 entries
    const entriesWithMedications = recentEntries.filter(
      entry => entry.medications?.current && entry.medications.current.length > 0
    );

    if (entriesWithMedications.length === 0) {
      return {
        shouldTrigger: false,
        confidence: 0,
        reason: 'No medication data found in recent entries',
      };
    }

    // Check if medications are being tracked consistently
    // const totalMedications = entriesWithMedications.reduce((sum, entry) =>
    //   sum + (entry.medications?.current?.length || 0), 0
    // );
    // const avgMedicationsPerEntry = totalMedications / entriesWithMedications.length; // Not currently used but could be for future heuristics

    // Check for medications that might be due based on frequency
    const medicationFrequencyMap = new Map<string, { count: number; lastTaken?: Date }>();

    entriesWithMedications.forEach(entry => {
      entry.medications?.current?.forEach(med => {
        const key = `${med.name}-${med.dosage}`;
        const existing = medicationFrequencyMap.get(key) || { count: 0 };
        existing.count += 1;
        existing.lastTaken = new Date(entry.timestamp);
        medicationFrequencyMap.set(key, existing);
      });
    });

    // Check for medications that might be overdue
    const now = new Date();
    let overdueCount = 0;
    let totalMedicationsChecked = 0;

    for (const [, data] of medicationFrequencyMap) {
      totalMedicationsChecked++;

      if (data.lastTaken) {
        const hoursSinceLastTaken = (now.getTime() - data.lastTaken.getTime()) / (1000 * 60 * 60);

        // Simple heuristic: if medication hasn't been taken in 24+ hours, might be due
        // This is a basic implementation - a full system would need proper scheduling
        if (hoursSinceLastTaken > 24) {
          overdueCount++;
        }
      }
    }

    const overdueRatio = totalMedicationsChecked > 0 ? overdueCount / totalMedicationsChecked : 0;
    const shouldTrigger = overdueRatio > 0.3; // More than 30% of medications potentially overdue
    const confidence = Math.min(overdueRatio * 2, 1); // Scale confidence

    return {
      shouldTrigger,
      confidence,
      reason: `${overdueCount} of ${totalMedicationsChecked} medications may be due (${formatNumber(overdueRatio * 100, 1)}% potentially overdue)`,
    };
  }

  private async evaluateGoalProgress(): Promise<TriggerAnalysisResult> {
    try {
      const goals = await goalStorage.getAllGoals();
      const activeGoals = goals.filter(goal => goal.status === 'active');

      if (activeGoals.length === 0) {
        return { shouldTrigger: false, confidence: 0, reason: 'No active goals to evaluate' };
      }

      let goalsNeedingAttention = 0;
      const reasons: string[] = [];

      for (const goal of activeGoals) {
        const now = new Date();
        const startDate = new Date(goal.startDate);
        const endDate = goal.endDate ? new Date(goal.endDate) : null;

        // Check if goal is overdue
        if (endDate && now > endDate) {
          goalsNeedingAttention++;
          reasons.push(`${goal.title} is overdue`);
          continue;
        }

        // Check progress towards targets
        for (const target of goal.targets) {
          const progress = goal.progress || [];
          const recentProgress = progress.slice(-7); // Last 7 days of progress

          if (recentProgress.length === 0) {
            goalsNeedingAttention++;
            reasons.push(`${goal.title} has no recent progress`);
            break;
          }

          // Calculate current progress towards target
          const avgProgress =
            recentProgress.reduce((sum, p) => sum + p.value, 0) / recentProgress.length;
          const progressPercentage = (avgProgress / target.targetValue) * 100;

          // Check if goal is falling behind schedule
          const daysElapsed = Math.floor(
            (now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
          );
          const totalDays = endDate
            ? Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
            : 30; // Default 30 days for goals without end date

          const expectedProgress = (daysElapsed / totalDays) * 100;

          if (progressPercentage < expectedProgress * 0.7) {
            // More than 30% behind schedule
            goalsNeedingAttention++;
            reasons.push(
              `${goal.title} is behind schedule (${formatNumber(progressPercentage, 1)}% vs expected ${formatNumber(expectedProgress, 1)}%)`
            );
            break;
          }
        }
      }

      const attentionRatio = goalsNeedingAttention / activeGoals.length;
      const shouldTrigger = attentionRatio > 0.3; // More than 30% of goals need attention
      const confidence = Math.min(attentionRatio * 2, 1);

      return {
        shouldTrigger,
        confidence,
        reason: `${goalsNeedingAttention} of ${activeGoals.length} active goals need attention: ${reasons.slice(0, 2).join(', ')}${reasons.length > 2 ? '...' : ''}`,
      };
    } catch (error) {
      console.error('Error evaluating goal progress:', error);
      return { shouldTrigger: false, confidence: 0, reason: 'Error evaluating goal progress' };
    }
  }

  private evaluateTimeSinceLastEntry(
    condition: TriggerCondition,
    entries: PainEntry[]
  ): TriggerAnalysisResult {
    if (entries.length === 0) {
      return { shouldTrigger: true, confidence: 1, reason: 'No pain entries recorded yet' };
    }

    const lastEntry = entries[entries.length - 1];
    const hoursSinceLastEntry =
      (Date.now() - new Date(lastEntry.timestamp).getTime()) / (1000 * 60 * 60);
    const threshold = condition.timeWindow || 24; // Default 24 hours

    const shouldTrigger = hoursSinceLastEntry >= threshold;
    const confidence = Math.min(hoursSinceLastEntry / threshold, 1);

    return {
      shouldTrigger,
      confidence,
      reason: `${formatNumber(hoursSinceLastEntry, 1)} hours since last entry (${threshold}h threshold)`,
    };
  }

  private evaluateStreakMaintenance(
    condition: TriggerCondition,
    entries: PainEntry[]
  ): TriggerAnalysisResult {
    const streakLength = condition.streakLength || 7; // Default 7 days
    const requiredEntries = streakLength;

    if (entries.length < requiredEntries) {
      return {
        shouldTrigger: false,
        confidence: 0,
        reason: 'Insufficient entries for streak analysis',
      };
    }

    // Check if user has been consistent
    const recentEntries = entries.slice(-requiredEntries);
    const daysWithEntries = new Set(
      recentEntries.map(e => localDayStart(e.timestamp).toDateString())
    ).size;

    const consistency = daysWithEntries / streakLength;
    const shouldTrigger = consistency >= 0.8; // 80% consistency threshold
    const confidence = consistency;

    return {
      shouldTrigger,
      confidence,
      reason: `${formatNumber(consistency * 100, 1)}% consistency over last ${streakLength} days`,
    };
  }

  // Helper methods
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    let trend = 0;
    for (let i = 1; i < values.length; i++) {
      trend += values[i] - values[i - 1];
    }

    return trend / (values.length - 1); // Average change
  }

  private calculateRecommendedPriority(
    trigger: IntelligentTrigger,
    confidence: number
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (confidence >= 0.9) return 'urgent';
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  }

  private generateTriggerTitle(trigger: IntelligentTrigger): string {
    switch (trigger.type) {
      case 'pain_reminder':
        return 'Smart Pain Check-in';
      case 'medication_alert':
        return 'Medication Reminder';
      case 'goal_achievement':
        return 'Goal Progress Update';
      case 'progress_checkin':
        return 'Progress Check-in';
      default:
        return trigger.name;
    }
  }

  private generateTriggerMessage(
    trigger: IntelligentTrigger,
    analysis: TriggerAnalysisResult
  ): string {
    return `${trigger.description}. ${analysis.reason}`;
  }

  private hasExceededDailyLimit(trigger: IntelligentTrigger): boolean {
    if (!trigger.lastTriggered) return false;

    const lastTrigger = new Date(trigger.lastTriggered);
    const now = new Date();
    const isSameDay = isSameLocalDay(lastTrigger, now);

    return isSameDay && trigger.triggerCount >= trigger.maxTriggersPerDay;
  }

  // Public API methods
  getActiveTriggers(): IntelligentTrigger[] {
    return Array.from(this.activeTriggers.values());
  }

  getTriggerStats(triggerId: string): { triggerCount: number; lastTriggered?: string } | null {
    const trigger = this.activeTriggers.get(triggerId);
    if (!trigger) return null;

    return {
      triggerCount: trigger.triggerCount,
      lastTriggered: trigger.lastTriggered,
    };
  }

  updateTrigger(triggerId: string, updates: Partial<IntelligentTrigger>): void {
    const trigger = this.activeTriggers.get(triggerId);
    if (trigger) {
      this.activeTriggers.set(triggerId, { ...trigger, ...updates });
    }
  }
}

// Export singleton instance
export const intelligentTrigger = IntelligentNotificationTrigger.getInstance();

// Pre-configured intelligent triggers
export const createDefaultIntelligentTriggers = (): IntelligentTrigger[] => [
  {
    id: 'pain_threshold_high',
    name: 'High Pain Alert',
    description: 'Alert when pain levels are consistently high',
    type: 'pain_reminder',
    conditions: [
      {
        type: 'pain_threshold',
        threshold: 7,
      },
      {
        type: 'pattern_recognition',
      },
    ],
    priority: 'high',
    cooldownPeriod: 120, // 2 hours
    maxTriggersPerDay: 2,
    isActive: true,
    triggerCount: 0,
  },
  {
    id: 'missed_entries',
    name: 'Missed Entries Reminder',
    description: "Remind when entries haven't been logged recently",
    type: 'pain_reminder',
    conditions: [
      {
        type: 'time_since_last_entry',
        timeWindow: 48, // 48 hours
      },
    ],
    priority: 'medium',
    cooldownPeriod: 1440, // 24 hours
    maxTriggersPerDay: 1,
    isActive: true,
    triggerCount: 0,
  },
  {
    id: 'consistency_streak',
    name: 'Consistency Encouragement',
    description: 'Encourage maintaining consistent tracking',
    type: 'progress_checkin',
    conditions: [
      {
        type: 'streak_maintenance',
        streakLength: 5,
      },
    ],
    priority: 'low',
    cooldownPeriod: 1440, // 24 hours
    maxTriggersPerDay: 1,
    isActive: true,
    triggerCount: 0,
  },
];

export const initializeIntelligentTriggers = (): void => {
  const defaultTriggers = createDefaultIntelligentTriggers();
  defaultTriggers.forEach(trigger => {
    intelligentTrigger.registerTrigger(trigger);
  });
};

export const analyzeEntriesForTriggers = async (entries: PainEntry[]): Promise<void> => {
  await intelligentTrigger.analyzeTriggers(entries);
};
