// Empathy Analytics Components Index
// Exports all empathy-driven analytics components

export { default as EmpathyAnalyticsDashboard } from './EmpathyAnalyticsDashboard';
export { default as EmotionalValidationSystem } from './EmotionalValidationSystem';
export { default as ProgressCelebrationComponent } from './ProgressCelebrationComponent';
export { default as UserAgencyDashboard } from './UserAgencyDashboard';
export { default as EmpathyAnalyticsIntegration } from './EmpathyAnalyticsIntegration';
export { QuantifiedEmpathyDashboard } from './QuantifiedEmpathyDashboard';

// Re-export analytics service
export { 
  EmpathyDrivenAnalyticsService,
  empathyAnalytics 
} from '../../services/EmpathyDrivenAnalytics';

// Re-export types
export type {
  EmotionalValidationMetrics,
  ProgressCelebrationMetrics,
  UserAgencyMetrics,
  DignityPreservingReport,
  Achievement,
  Milestone,
  MeaningfulMoment,
  EmpathyAnalyticsConfig
} from '../../services/EmpathyDrivenAnalytics';
