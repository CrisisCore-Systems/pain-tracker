import type { Goal, GoalProgress, GoalTemplate } from '../../types/goals';
import { DEFAULT_GOAL_TEMPLATES } from '../../types/goals';
import { formatNumber, formatPercent } from '../formatting';
import { localDayStart, isSameLocalDay } from '../../utils/dates';

export class GoalAnalyticsCalculator {
  static calculateProgressPercentage(goal: Goal, progress: GoalProgress[]): number {
    if (goal.targets.length === 0 || progress.length === 0) return 0;

    const target = goal.targets[0]; // Use primary target
    const latestProgress = progress[progress.length - 1];

    switch (target.comparison) {
      case 'percentage_decrease':
      case 'percentage_increase':
        return Math.min(100, Math.max(0, latestProgress.value));
      case 'less_than': {
        // For pain reduction, calculate how close we are to target
        const baseline = this.calculateBaselineValue(progress);
        const reduction = ((baseline - latestProgress.value) / baseline) * 100;
        return Math.min(100, Math.max(0, reduction));
      }
      case 'greater_than':
        return Math.min(100, Math.max(0, (latestProgress.value / target.targetValue) * 100));
      case 'equal_to':
        return latestProgress.value >= target.targetValue ? 100 : (latestProgress.value / target.targetValue) * 100;
      default:
        return 0;
    }
  }

  static calculateBaselineValue(progress: GoalProgress[]): number {
    if (progress.length === 0) return 0;

    // Use first 3 entries as baseline, or first entry if less than 3
    const baselineEntries = progress.slice(0, Math.min(3, progress.length));
    return baselineEntries.reduce((sum, p) => sum + p.value, 0) / baselineEntries.length;
  }

  static calculateStreak(progress: GoalProgress[]): number {
    if (progress.length === 0) return 0;

    // Sort by date
    const sortedProgress = progress.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let currentStreak = 0;
  const today = new Date();

  // Check if today has an entry using local-day comparison
  const todayEntry = sortedProgress.find(p => isSameLocalDay(p.date, today));
    if (!todayEntry) return 0;

    // Count consecutive days backwards from today
    for (let i = sortedProgress.length - 1; i >= 0; i--) {
  const entry = sortedProgress[i];
  const expectedDate = new Date(today);
  expectedDate.setDate(expectedDate.getDate() - (sortedProgress.length - 1 - i));

  if (isSameLocalDay(entry.date, expectedDate)) {
        currentStreak++;
      } else {
        break;
      }
    }

    return currentStreak;
  }

  static calculateWeeklyProgress(progress: GoalProgress[]): { week: string; average: number; count: number }[] {
    const weeklyData: { [key: string]: { sum: number; count: number } } = {};

    progress.forEach(p => {
      const date = new Date(p.date);
      const local = localDayStart(date);
      const weekStart = new Date(local.getFullYear(), local.getMonth(), local.getDate() - local.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { sum: 0, count: 0 };
      }
      weeklyData[weekKey].sum += p.value;
      weeklyData[weekKey].count++;
    });

    return Object.entries(weeklyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, data]) => ({
        week,
        average: data.sum / data.count,
        count: data.count
      }));
  }

  static calculateTrend(progress: GoalProgress[]): 'improving' | 'declining' | 'stable' {
    if (progress.length < 3) return 'stable';

    const recent = progress.slice(-7); // Last 7 entries
    if (recent.length < 3) return 'stable';

    const values = recent.map(p => p.value);
    const differences = values.slice(1).map((val, i) => val - values[i]);
    const avgChange = differences.reduce((sum, diff) => sum + diff, 0) / differences.length;

    const threshold = Math.abs(values[0] * 0.05); // 5% of initial value

    if (avgChange > threshold) return 'improving';
    if (avgChange < -threshold) return 'declining';
    return 'stable';
  }

  static generateProgressInsights(goal: Goal, progress: GoalProgress[]): string[] {
    const insights: string[] = [];
    const completion = this.calculateProgressPercentage(goal, progress);
    const trend = this.calculateTrend(progress);
  const streak = this.calculateStreak(progress);

    // Completion insights
    if (completion >= 100) {
      insights.push('🎉 Congratulations! You\'ve achieved your goal!');
    } else if (completion >= 75) {
      insights.push('🚀 Excellent progress! You\'re in the final stretch.');
    } else if (completion >= 50) {
      insights.push('📈 You\'re halfway there! Keep up the great work.');
    } else if (completion >= 25) {
      insights.push('🌱 Good start! You\'re building momentum.');
    }

    // Trend insights
    if (trend === 'improving') {
      insights.push('📊 Your progress is trending upward - you\'re on the right track!');
    } else if (trend === 'declining') {
      insights.push('⚠️ Your progress has slowed. Consider reviewing your strategies.');
    }

    // Streak insights
    if (streak >= 7) {
      insights.push(`🔥 ${streak}-day streak! You're building excellent habits.`);
    } else if (streak >= 3) {
      insights.push(`📅 ${streak}-day streak! Keep the momentum going.`);
    }

    // Frequency insights
    const weeklyData = this.calculateWeeklyProgress(progress);
    if (weeklyData.length >= 2) {
      const recentWeek = weeklyData[weeklyData.length - 1];
      const previousWeek = weeklyData[weeklyData.length - 2];

      if (recentWeek.count > previousWeek.count) {
        insights.push('📈 You\'re tracking more frequently this week!');
      } else if (recentWeek.count < previousWeek.count) {
        insights.push('📉 Consider increasing your tracking frequency.');
      }
    }

    // Time-based insights
    const daysSinceStart = Math.floor((Date.now() - new Date(goal.startDate).getTime()) / (24 * 60 * 60 * 1000));
    if (daysSinceStart > 0 && progress.length === 0) {
      insights.push('📝 Start tracking your progress to see detailed insights.');
    }

    return insights;
  }

  static calculateMilestoneProgress(goal: Goal, progress: GoalProgress[]) {
    return goal.milestones.map(milestone => {
      const isCompleted = progress.some(p => p.value >= milestone.targetValue);
      return {
        ...milestone,
        isCompleted,
        progressPercentage: Math.min(100, (progress[progress.length - 1]?.value || 0) / milestone.targetValue * 100)
      };
    });
  }

  static projectCompletionDate(goal: Goal, progress: GoalProgress[]): Date | null {
    if (progress.length < 2) return null;

    const recentProgress = progress.slice(-7);
    if (recentProgress.length < 2) return null;

    // Calculate average daily change
    const changes = recentProgress.slice(1).map((p, i) => p.value - recentProgress[i].value);
    const avgDailyChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;

    if (Math.abs(avgDailyChange) < 0.01) return null; // No significant change

    const target = goal.targets[0];
    const currentValue = recentProgress[recentProgress.length - 1].value;
    const remaining = target.targetValue - currentValue;
    const daysNeeded = remaining / avgDailyChange;

    if (daysNeeded <= 0 || daysNeeded > 365) return null;

    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + Math.ceil(daysNeeded));

    return projectedDate;
  }

  static getGoalHealthScore(goal: Goal, progress: GoalProgress[]): number {
    let score = 50; // Base score

    // Completion bonus
    const completion = this.calculateProgressPercentage(goal, progress);
    score += completion * 0.3;

    // Streak bonus
  const streak = this.calculateStreak(progress);
    score += Math.min(streak * 2, 20);

    // Consistency bonus
    const weeklyData = this.calculateWeeklyProgress(progress);
    if (weeklyData.length >= 4) {
      const avgEntries = weeklyData.reduce((sum, w) => sum + w.count, 0) / weeklyData.length;
      score += Math.min(avgEntries * 5, 15);
    }

    // Trend bonus/penalty
    const trend = this.calculateTrend(progress);
    if (trend === 'improving') score += 10;
    else if (trend === 'declining') score -= 10;

    return Math.max(0, Math.min(100, score));
  }
}

export class GoalTemplateManager {
  static getTemplatesByCategory(category: GoalTemplate['category']): GoalTemplate[] {
    return DEFAULT_GOAL_TEMPLATES.filter((template: GoalTemplate) => template.category === category);
  }

  static getTemplatesByDifficulty(difficulty: GoalTemplate['difficulty']): GoalTemplate[] {
    return DEFAULT_GOAL_TEMPLATES.filter((template: GoalTemplate) => template.difficulty === difficulty);
  }

  static getRecommendedTemplates(userGoals: Goal[]): GoalTemplate[] {
    // Simple recommendation logic based on existing goals
    const existingTypes = userGoals.map(g => g.type);
    const recommended = DEFAULT_GOAL_TEMPLATES.filter((template: GoalTemplate) =>
      !existingTypes.includes(template.type)
    );

    return recommended.slice(0, 3); // Return top 3 recommendations
  }

  static createGoalFromTemplate(template: GoalTemplate, customizations?: Partial<Goal>): Goal {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + template.duration);

    const goal: Goal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: 'current-user',
      title: template.name,
      description: template.description,
      type: template.type,
      status: 'active',
      priority: 'medium',
      targets: template.targets.map(target => ({
        ...target,
        currentValue: 0
      })),
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      frequency: 'daily',
      milestones: template.milestones.map(milestone => ({
        ...milestone,
        id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isCompleted: false
      })),
      progress: [],
      tags: [template.category],
      isPublic: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      ...customizations
    };

    return goal;
  }
}

// Utility functions for goal management
export const calculateDaysRemaining = (goal: Goal): number => {
  const endDate = goal.endDate ? new Date(goal.endDate) : null;
  if (!endDate) return -1;

  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};

export const isGoalOverdue = (goal: Goal): boolean => {
  if (!goal.endDate) return false;
  return new Date(goal.endDate) < new Date() && goal.status === 'active';
};

export const getGoalStatusColor = (status: Goal['status']): string => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'active':
      return 'text-blue-600 bg-blue-100';
    case 'paused':
      return 'text-yellow-600 bg-yellow-100';
    case 'abandoned':
      return 'text-gray-600 bg-gray-100';
    case 'overdue':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const formatGoalProgress = (value: number, unit: string): string => {
  if (unit === '%') {
  return `${formatPercent(value, 1)}`;
  }
  if (unit.includes('minute') || unit.includes('hour')) {
  return `${formatNumber(value, 0)} ${unit}`;
  }
  return `${formatNumber(value, 1)} ${unit}`;
};

// Facade used by UI components expecting `goalAnalytics.calculateGoalAnalytics(goal, progress)`
export const goalAnalytics = {
  async calculateGoalAnalytics(goal: Goal, progress: GoalProgress[]) {
    const completionPercentage = GoalAnalyticsCalculator.calculateProgressPercentage(goal, progress);
    const trend = GoalAnalyticsCalculator.calculateTrend(progress);
    const insights = GoalAnalyticsCalculator.generateProgressInsights(goal, progress);
    const bestStreak = GoalAnalyticsCalculator.calculateStreak(progress);
    const currentStreak = bestStreak; // simplified without separate current/best tracking
    const totalProgress = progress.reduce((sum, p) => sum + p.value, 0);
    const averageProgress = progress.length ? totalProgress / progress.length : 0;

    return {
      progressPercentage: completionPercentage,
      trend,
      insights,
      bestStreak,
      currentStreak,
      totalEntries: progress.length,
      averageProgress
    };
  }
};
