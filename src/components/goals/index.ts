// Goal Management Components
export { GoalManager, GoalQuickActions } from './GoalManager';
export { GoalCreationForm } from './GoalCreationForm';
export { GoalList } from './GoalList';
export { GoalProgressTracker } from './GoalProgressTracker';
export { GoalDashboardWidget } from './GoalDashboardWidget';
export { GoalManagerModal } from './GoalManagerModal';

// Re-export types for convenience
export type {
  Goal,
  GoalType,
  GoalStatus,
  GoalPriority,
  GoalProgress,
  GoalMilestone,
  GoalAnalytics,
  GoalTemplate
} from '../../types/goals';

// Re-export utilities for convenience
export { goalStorage } from '../../utils/goals/storage';
export { GoalAnalyticsCalculator } from '../../utils/goals/analytics';
