import type {
  Goal,
  GoalProgress,
  GoalAnalytics,
  GoalReminder,
  GoalStatus,
  GoalTarget,
  GoalMilestone,
} from '../../types/goals';

export class GoalStorage {
  private static instance: GoalStorage;
  private readonly STORAGE_KEY = 'pain-tracker-goals';
  private readonly PROGRESS_KEY = 'pain-tracker-goal-progress';
  private readonly REMINDERS_KEY = 'pain-tracker-goal-reminders';

  private constructor() {}

  static getInstance(): GoalStorage {
    if (!GoalStorage.instance) {
      GoalStorage.instance = new GoalStorage();
    }
    return GoalStorage.instance;
  }

  // Goal CRUD operations
  async saveGoal(goal: Goal): Promise<void> {
    try {
      const goals = await this.getAllGoals();
      const existingIndex = goals.findIndex(g => g.id === goal.id);

      if (existingIndex >= 0) {
        goals[existingIndex] = { ...goal, updatedAt: new Date().toISOString() };
      } else {
        goals.push(goal);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error('Failed to save goal:', error);
      throw new Error('Failed to save goal');
    }
  }

  async getGoal(goalId: string): Promise<Goal | null> {
    try {
      const goals = await this.getAllGoals();
      return goals.find(g => g.id === goalId) || null;
    } catch (error) {
      console.error('Failed to get goal:', error);
      return null;
    }
  }

  async getAllGoals(): Promise<Goal[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const goals = JSON.parse(stored);
      return Array.isArray(goals) ? goals : [];
    } catch (error) {
      console.error('Failed to get goals:', error);
      return [];
    }
  }

  async getGoalsByStatus(status: GoalStatus): Promise<Goal[]> {
    const goals = await this.getAllGoals();
    return goals.filter(g => g.status === status);
  }

  async getActiveGoals(): Promise<Goal[]> {
    return this.getGoalsByStatus('active');
  }

  async deleteGoal(goalId: string): Promise<void> {
    try {
      const goals = await this.getAllGoals();
      const filteredGoals = goals.filter(g => g.id !== goalId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredGoals));

      // Also delete related progress and reminders
      await this.deleteGoalProgress(goalId);
      await this.deleteGoalReminders(goalId);
    } catch (error) {
      console.error('Failed to delete goal:', error);
      throw new Error('Failed to delete goal');
    }
  }

  // Progress tracking
  async saveProgress(progress: GoalProgress): Promise<void> {
    try {
      const allProgress = await this.getAllProgress();
      const existingIndex = allProgress.findIndex(
        p => p.goalId === progress.goalId && p.date === progress.date
      );

      if (existingIndex >= 0) {
        allProgress[existingIndex] = progress;
      } else {
        allProgress.push(progress);
      }

      localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Failed to save progress:', error);
      throw new Error('Failed to save progress');
    }
  }

  async getGoalProgress(goalId: string): Promise<GoalProgress[]> {
    try {
      const allProgress = await this.getAllProgress();
      return allProgress.filter(p => p.goalId === goalId);
    } catch (error) {
      console.error('Failed to get goal progress:', error);
      return [];
    }
  }

  // Compatibility alias used by UI components
  async saveGoalProgress(progress: GoalProgress): Promise<void> {
    return this.saveProgress(progress);
  }

  // Compatibility helper to fetch milestones from the goal record
  async getGoalMilestones(goalId: string): Promise<GoalMilestone[]> {
    const goal = await this.getGoal(goalId);
    return goal?.milestones ?? [];
  }

  async getAllProgress(): Promise<GoalProgress[]> {
    try {
      const stored = localStorage.getItem(this.PROGRESS_KEY);
      if (!stored) return [];

      const progress = JSON.parse(stored);
      return Array.isArray(progress) ? progress : [];
    } catch (error) {
      console.error('Failed to get progress:', error);
      return [];
    }
  }

  async deleteGoalProgress(goalId: string): Promise<void> {
    try {
      const allProgress = await this.getAllProgress();
      const filteredProgress = allProgress.filter(p => p.goalId !== goalId);
      localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(filteredProgress));
    } catch (error) {
      console.error('Failed to delete goal progress:', error);
    }
  }

  // Reminders
  async saveReminder(reminder: GoalReminder): Promise<void> {
    try {
      const reminders = await this.getAllReminders();
      const existingIndex = reminders.findIndex(r => r.id === reminder.id);

      if (existingIndex >= 0) {
        reminders[existingIndex] = reminder;
      } else {
        reminders.push(reminder);
      }

      localStorage.setItem(this.REMINDERS_KEY, JSON.stringify(reminders));
    } catch (error) {
      console.error('Failed to save reminder:', error);
      throw new Error('Failed to save reminder');
    }
  }

  async getGoalReminders(goalId: string): Promise<GoalReminder[]> {
    try {
      const reminders = await this.getAllReminders();
      return reminders.filter(r => r.goalId === goalId);
    } catch (error) {
      console.error('Failed to get goal reminders:', error);
      return [];
    }
  }

  async getAllReminders(): Promise<GoalReminder[]> {
    try {
      const stored = localStorage.getItem(this.REMINDERS_KEY);
      if (!stored) return [];

      const reminders = JSON.parse(stored);
      return Array.isArray(reminders) ? reminders : [];
    } catch (error) {
      console.error('Failed to get reminders:', error);
      return [];
    }
  }

  async deleteGoalReminders(goalId: string): Promise<void> {
    try {
      const reminders = await this.getAllReminders();
      const filteredReminders = reminders.filter(r => r.goalId !== goalId);
      localStorage.setItem(this.REMINDERS_KEY, JSON.stringify(filteredReminders));
    } catch (error) {
      console.error('Failed to delete goal reminders:', error);
    }
  }

  // Analytics and calculations
  async calculateGoalAnalytics(goalId: string): Promise<GoalAnalytics | null> {
    try {
      const goal = await this.getGoal(goalId);
      if (!goal) return null;

      const progress = await this.getGoalProgress(goalId);
      const now = new Date();
      // const startDate = new Date(goal.startDate); // not used currently
      const endDate = goal.endDate
        ? new Date(goal.endDate)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Calculate progress metrics
      const totalProgress = progress.reduce((sum, p) => sum + p.value, 0);
      const averageProgress = progress.length > 0 ? totalProgress / progress.length : 0;

      // Calculate streaks
      const { bestStreak, currentStreak } = this.calculateStreaks(progress, goal.targets);

      // Calculate completion percentage
      const completionPercentage = this.calculateCompletionPercentage(goal, progress);

      // Calculate days remaining
      const daysRemaining = Math.max(
        0,
        Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      );

      // Project completion date
      const projectedCompletion = this.projectCompletionDate(goal, progress);

      // Determine trend
      const trend = this.calculateTrend(progress);

      // Generate insights
      const insights = this.generateInsights(goal, progress, completionPercentage, trend);

      return {
        goalId,
        totalProgress,
        averageProgress,
        bestStreak,
        currentStreak,
        completionPercentage,
        daysRemaining,
        projectedCompletion,
        trend,
        insights,
      };
    } catch (error) {
      console.error('Failed to calculate goal analytics:', error);
      return null;
    }
  }

  private calculateStreaks(
    progress: GoalProgress[],
    targets: GoalTarget[]
  ): { bestStreak: number; currentStreak: number } {
    if (progress.length === 0) return { bestStreak: 0, currentStreak: 0 };

    // Sort progress by date
    const sortedProgress = progress.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let bestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedProgress.length; i++) {
      const current = sortedProgress[i];
      const isSuccessful = this.isProgressSuccessful(current, targets);

      if (isSuccessful) {
        tempStreak++;
        currentStreak = tempStreak;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { bestStreak, currentStreak };
  }

  private isProgressSuccessful(progress: GoalProgress, targets: GoalTarget[]): boolean {
    // Simple success check - can be made more sophisticated
    return targets.some(target => {
      switch (target.comparison) {
        case 'less_than':
          return progress.value < target.targetValue;
        case 'greater_than':
          return progress.value > target.targetValue;
        case 'equal_to':
          return progress.value === target.targetValue;
        default:
          return false;
      }
    });
  }

  private calculateCompletionPercentage(goal: Goal, progress: GoalProgress[]): number {
    if (goal.targets.length === 0) return 0;

    const target = goal.targets[0]; // Use first target for simplicity
    const latestProgress = progress[progress.length - 1];

    if (!latestProgress) return 0;

    switch (target.comparison) {
      case 'percentage_decrease':
      case 'percentage_increase':
        return Math.min(100, Math.max(0, latestProgress.value));
      default:
        return Math.min(100, Math.max(0, (latestProgress.value / target.targetValue) * 100));
    }
  }

  private projectCompletionDate(goal: Goal, progress: GoalProgress[]): string {
    if (progress.length < 2) return 'Insufficient data';

    // Simple linear projection
    const recentProgress = progress.slice(-7); // Last 7 days
    if (recentProgress.length < 2) return 'Insufficient data';

    const avgDailyChange =
      recentProgress.reduce((sum, p, i) => {
        if (i === 0) return 0;
        return sum + (p.value - recentProgress[i - 1].value);
      }, 0) /
      (recentProgress.length - 1);

    if (avgDailyChange === 0) return 'Stable progress';

    const target = goal.targets[0];
    const currentValue = recentProgress[recentProgress.length - 1].value;
    const remaining = target.targetValue - currentValue;
    const daysNeeded = remaining / avgDailyChange;

    if (daysNeeded <= 0) return 'Already achieved';
    if (daysNeeded > 365) return 'More than a year';

    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + Math.ceil(daysNeeded));

    return projectedDate.toLocaleDateString();
  }

  private calculateTrend(progress: GoalProgress[]): 'improving' | 'declining' | 'stable' {
    if (progress.length < 3) return 'stable';

    const recent = progress.slice(-5);
    const values = recent.map(p => p.value);
    const trend =
      values.reduce((sum, val, i) => {
        if (i === 0) return 0;
        return sum + (val - values[i - 1]);
      }, 0) /
      (values.length - 1);

    if (trend > 0.1) return 'improving';
    if (trend < -0.1) return 'declining';
    return 'stable';
  }

  private generateInsights(
    goal: Goal,
    progress: GoalProgress[],
    completion: number,
    trend: string
  ): string[] {
    const insights: string[] = [];

    if (completion >= 100) {
      insights.push('🎉 Goal achieved! Congratulations!');
    } else if (completion >= 75) {
      insights.push("🚀 Great progress! You're almost there!");
    } else if (completion >= 50) {
      insights.push('📈 Halfway there! Keep up the momentum!');
    }

    if (trend === 'improving') {
      insights.push('📊 Your progress is trending upward - excellent work!');
    } else if (trend === 'declining') {
      insights.push('⚠️ Progress has slowed. Consider reviewing your strategies.');
    }

    if (progress.length === 0) {
      insights.push('📝 Start tracking your progress to see detailed insights.');
    }

    return insights;
  }

  // Utility methods
  async exportGoals(): Promise<string> {
    const goals = await this.getAllGoals();
    const progress = await this.getAllProgress();
    const reminders = await this.getAllReminders();

    return JSON.stringify(
      {
        goals,
        progress,
        reminders,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  }

  async importGoals(data: string): Promise<void> {
    try {
      const parsed = JSON.parse(data);

      if (parsed.goals) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(parsed.goals));
      }
      if (parsed.progress) {
        localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(parsed.progress));
      }
      if (parsed.reminders) {
        localStorage.setItem(this.REMINDERS_KEY, JSON.stringify(parsed.reminders));
      }
    } catch (error) {
      console.error('Failed to import goals:', error);
      throw new Error('Invalid import data');
    }
  }

  async clearAllData(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.PROGRESS_KEY);
    localStorage.removeItem(this.REMINDERS_KEY);
  }
}

// Export singleton instance
export const goalStorage = GoalStorage.getInstance();
