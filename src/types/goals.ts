export type GoalType =
  | 'pain_reduction'
  | 'frequency_reduction'
  | 'consistency'
  | 'medication_adherence'
  | 'activity_increase'
  | 'sleep_improvement'
  | 'mood_tracking'
  | 'custom';

export type GoalStatus =
  | 'active'
  | 'completed'
  | 'paused'
  | 'abandoned'
  | 'overdue';

export type GoalPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export type GoalFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'custom';

export type GoalMetric =
  | 'pain_level'
  | 'entry_count'
  | 'medication_taken'
  | 'activity_minutes'
  | 'sleep_hours'
  | 'mood_score'
  | 'custom';

export interface GoalTarget {
  metric: GoalMetric;
  targetValue: number;
  currentValue: number;
  unit: string;
  comparison: 'less_than' | 'greater_than' | 'equal_to' | 'percentage_decrease' | 'percentage_increase';
}

export interface GoalMilestone {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  isCompleted: boolean;
  completedAt?: string;
  // Optional fields for compatibility with UI components
  targetDate?: string;
  completed?: boolean;
  reward?: string;
}

export interface GoalProgress {
  goalId: string;
  date: string;
  value: number;
  notes?: string;
  isManualEntry: boolean;
  // Optional fields for compatibility with UI components expecting id/timestamp
  id?: string;
  timestamp?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: GoalType;
  status: GoalStatus;
  priority: GoalPriority;
  targets: GoalTarget[];
  startDate: string;
  endDate?: string;
  frequency: GoalFrequency;
  customFrequency?: {
    interval: number; // days
    reminderTime?: string;
  };
  milestones: GoalMilestone[];
  progress: GoalProgress[];
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes?: string;
  motivation?: string;
  obstacles?: string[];
  strategies?: string[];
}

export interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  type: GoalType;
  targets: Omit<GoalTarget, 'currentValue'>[];
  duration: number; // days
  milestones: Omit<GoalMilestone, 'id' | 'isCompleted' | 'completedAt'>[];
  category: 'pain_management' | 'lifestyle' | 'medication' | 'mental_health' | 'custom';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedSuccess: number; // percentage
}

export interface GoalAnalytics {
  goalId: string;
  totalProgress: number;
  averageProgress: number;
  bestStreak: number;
  currentStreak: number;
  completionPercentage: number;
  daysRemaining: number;
  projectedCompletion: string;
  trend: 'improving' | 'declining' | 'stable';
  insights: string[];
}

export interface GoalReminder {
  id: string;
  goalId: string;
  title: string;
  message: string;
  scheduledFor: string;
  isSent: boolean;
  sentAt?: string;
  type: 'progress_update' | 'milestone_achieved' | 'deadline_approaching' | 'motivation' | 'custom';
}

// Default goal templates
export const DEFAULT_GOAL_TEMPLATES: GoalTemplate[] = [
  {
    id: 'reduce_pain_30_percent',
    name: 'Reduce Pain by 30%',
    description: 'Lower your average pain level by 30% over the next 30 days',
    type: 'pain_reduction',
    targets: [
      {
        metric: 'pain_level',
        targetValue: 30,
        unit: '%',
        comparison: 'percentage_decrease'
      }
    ],
    duration: 30,
    milestones: [
      {
        title: 'Week 1 Complete',
        description: 'Completed first week of pain tracking',
        targetValue: 7,
        reward: 'Small celebration!'
      },
      {
        title: '15% Reduction',
        description: 'Achieved 15% pain reduction',
        targetValue: 15,
        reward: 'Great progress!'
      },
      {
        title: 'Goal Achieved',
        description: 'Successfully reduced pain by 30%',
        targetValue: 30,
        reward: 'Congratulations!'
      }
    ],
    category: 'pain_management',
    difficulty: 'medium',
    estimatedSuccess: 65
  },
  {
    id: 'consistent_tracking',
    name: 'Track Daily for 30 Days',
    description: 'Maintain consistent daily pain tracking for a full month',
    type: 'consistency',
    targets: [
      {
        metric: 'entry_count',
        targetValue: 30,
        unit: 'entries',
        comparison: 'greater_than'
      }
    ],
    duration: 30,
    milestones: [
      {
        title: 'Week 1 Streak',
        description: '7 consecutive days of tracking',
        targetValue: 7,
        reward: 'Building good habits!'
      },
      {
        title: 'Halfway Point',
        description: '15 days completed',
        targetValue: 15,
        reward: 'You\'re doing great!'
      },
      {
        title: '30-Day Champion',
        description: 'Completed 30 days of consistent tracking',
        targetValue: 30,
        reward: 'Consistency master!'
      }
    ],
    category: 'lifestyle',
    difficulty: 'easy',
    estimatedSuccess: 80
  },
  {
    id: 'medication_adherence',
    name: 'Perfect Medication Schedule',
    description: 'Take all prescribed medications on time for 14 days',
    type: 'medication_adherence',
    targets: [
      {
        metric: 'medication_taken',
        targetValue: 100,
        unit: '%',
        comparison: 'equal_to'
      }
    ],
    duration: 14,
    milestones: [
      {
        title: 'First Week',
        description: 'Completed medication schedule for 7 days',
        targetValue: 7,
        reward: 'Great start!'
      },
      {
        title: 'Perfect Record',
        description: '14 days of perfect medication adherence',
        targetValue: 14,
        reward: 'Health hero!'
      }
    ],
    category: 'medication',
    difficulty: 'medium',
    estimatedSuccess: 70
  },
  {
    id: 'increase_activity',
    name: 'Increase Daily Activity',
    description: 'Gradually increase daily physical activity to 30 minutes',
    type: 'activity_increase',
    targets: [
      {
        metric: 'activity_minutes',
        targetValue: 30,
        unit: 'minutes',
        comparison: 'greater_than'
      }
    ],
    duration: 21,
    milestones: [
      {
        title: 'Week 1: 10 minutes',
        description: 'Achieved 10 minutes of daily activity',
        targetValue: 10,
        reward: 'Movement matters!'
      },
      {
        title: 'Week 2: 20 minutes',
        description: 'Achieved 20 minutes of daily activity',
        targetValue: 20,
        reward: 'Building momentum!'
      },
      {
        title: 'Goal Achieved: 30 minutes',
        description: 'Successfully reached 30 minutes daily',
        targetValue: 30,
        reward: 'Active lifestyle champion!'
      }
    ],
    category: 'lifestyle',
    difficulty: 'medium',
    estimatedSuccess: 60
  }
];

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  pain_reduction: 'Pain Reduction',
  frequency_reduction: 'Reduce Frequency',
  consistency: 'Consistency',
  medication_adherence: 'Medication Adherence',
  activity_increase: 'Increase Activity',
  sleep_improvement: 'Sleep Improvement',
  mood_tracking: 'Mood Tracking',
  custom: 'Custom Goal'
};

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  paused: 'Paused',
  abandoned: 'Abandoned',
  overdue: 'Overdue'
};

export const GOAL_PRIORITY_LABELS: Record<GoalPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent'
};

export const GOAL_METRIC_LABELS: Record<GoalMetric, string> = {
  pain_level: 'Pain Level',
  entry_count: 'Entry Count',
  medication_taken: 'Medication Taken',
  activity_minutes: 'Activity Minutes',
  sleep_hours: 'Sleep Hours',
  mood_score: 'Mood Score',
  custom: 'Custom Metric'
};
