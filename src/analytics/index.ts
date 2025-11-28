/**
 * Analytics module exports
 * 
 * This module provides analytics functionality for the Pain Tracker application.
 * It includes both privacy-preserving analytics and GA4 custom event tracking.
 */

// Re-export GA4 events service
export {
  // Event names
  GA4Events,
  type GA4EventName,
  type GA4EventParams,
  
  // Generic event tracking
  trackGA4Event,
  
  // Pain tracking events
  trackPainEntryLogged,
  
  // Validation events
  trackValidationUsed,
  
  // Progress/Analytics events
  trackProgressViewed,
  trackAnalyticsTabViewed,
  
  // Export events
  trackDataExported,
  trackWCBReportExported,
  trackClinicalReportGenerated,
  
  // Body map events
  trackBodyLocationSelected,
  
  // Empathy events
  trackEmpathyInsightViewed,
  
  // Template events
  trackTemplateApplied,
  trackTemplateCreated,
  
  // Backup/Restore events
  trackBackupCreated,
  trackDataRestored,
  
  // Accessibility events
  trackAccessibilitySettingChanged,
  
  // Milestone events
  trackMilestoneReached,
  
  // Crisis events
  trackCrisisResourceTriggered,
  
  // Mood events
  trackMoodEntryLogged,
  
  // Onboarding events
  trackOnboardingCompleted,
  trackOnboardingSkipped,
  
  // Default export object
  ga4Analytics,
} from './ga4-events';
