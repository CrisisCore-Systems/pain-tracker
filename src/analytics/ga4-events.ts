/**
 * GA4 Custom Events Service
 * Sends custom events to Google Analytics 4 for tracking user interactions
 * 
 * This service works alongside the PrivacyAnalyticsService, sending events
 * to GA4 only when analytics is enabled and gtag is available.
 */

// Window.gtag is declared in analytics-loader.ts - use that type
import { isAnalyticsAllowed } from './analytics-gate';

/**
 * GA4 Event Names - following GA4 recommended event naming conventions
 * https://support.google.com/analytics/answer/9267735
 */
export const GA4Events = {
  // Pain Tracking Events
  LOG_PAIN_ENTRY: 'log_pain_entry',
  UPDATE_PAIN_ENTRY: 'update_pain_entry',
  DELETE_PAIN_ENTRY: 'delete_pain_entry',
  
  // Validation Events  
  USE_VALIDATION: 'use_validation',
  
  // Progress/Analytics Events
  VIEW_PROGRESS: 'view_progress',
  VIEW_ANALYTICS_TAB: 'view_analytics_tab',
  
  // Export Events
  EXPORT_DATA: 'export_data',
  EXPORT_WCB_REPORT: 'export_wcb_report',
  GENERATE_CLINICAL_REPORT: 'generate_clinical_report',
  
  // Body Map Events
  SELECT_BODY_LOCATION: 'select_body_location',
  
  // Empathy Features
  VIEW_EMPATHY_INSIGHT: 'view_empathy_insight',
  
  // Template Events
  APPLY_TEMPLATE: 'apply_template',
  CREATE_TEMPLATE: 'create_template',
  
  // Backup/Restore Events
  CREATE_BACKUP: 'create_backup',
  RESTORE_DATA: 'restore_data',
  
  // Accessibility Events
  CHANGE_ACCESSIBILITY_SETTING: 'change_accessibility_setting',
  
  // Milestone Events
  REACH_MILESTONE: 'reach_milestone',
  
  // Crisis Events
  TRIGGER_CRISIS_RESOURCE: 'trigger_crisis_resource',
  
  // Mood Tracking Events
  LOG_MOOD_ENTRY: 'log_mood_entry',
  
  // Onboarding Events
  COMPLETE_ONBOARDING: 'complete_onboarding',
  SKIP_ONBOARDING: 'skip_onboarding',
} as const;

export type GA4EventName = typeof GA4Events[keyof typeof GA4Events];

/**
 * Event parameter types for type safety
 */
export interface GA4EventParams {
  // Pain entry parameters
  pain_level?: number;
  has_location?: boolean;
  has_notes?: boolean;
  location_count?: number;
  symptom_count?: number;
  time_of_day?: string;
  
  // Export parameters
  format?: string;
  report_type?: string;
  entry_count?: number;
  
  // View parameters
  tab_name?: string;
  view_type?: string;
  
  // Validation parameters
  validation_type?: string;
  
  // Body map parameters
  body_region?: string;
  
  // Template parameters
  template_id?: string;
  template_name?: string;
  
  // Empathy parameters
  insight_type?: string;
  confidence?: number;
  
  // Accessibility parameters
  setting_name?: string;
  setting_value?: string | boolean;
  
  // Milestone parameters
  milestone_type?: string;
  milestone_value?: number;
  
  // Mood parameters
  mood_level?: number;
  
  // Generic parameters
  [key: string]: unknown;
}

/**
 * Check if GA4 is available and enabled
 */
function isGA4Available(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.gtag === 'function' &&
    // Defense-in-depth: require env flag AND explicit user consent.
    isAnalyticsAllowed()
  );
}

/**
 * Get time of day category for analytics
 */
function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Send a custom event to GA4
 * 
 * @param eventName - The GA4 event name
 * @param params - Optional event parameters
 */
export function trackGA4Event(eventName: GA4EventName, params?: GA4EventParams): void {
  if (!isGA4Available()) {
    return;
  }

  try {
    // Add common parameters
    const enrichedParams: GA4EventParams = {
      ...params,
      time_of_day: params?.time_of_day || getTimeOfDay(),
    };

    window.gtag?.('event', eventName, enrichedParams);
  } catch {
    // Silently fail - analytics should never affect user experience
  }
}

/**
 * Track pain entry logged
 */
export function trackPainEntryLogged(params: {
  painLevel: number;
  hasLocation: boolean;
  hasNotes: boolean;
  locationCount?: number;
  symptomCount?: number;
}): void {
  trackGA4Event(GA4Events.LOG_PAIN_ENTRY, {
    pain_level: params.painLevel,
    has_location: params.hasLocation,
    has_notes: params.hasNotes,
    location_count: params.locationCount,
    symptom_count: params.symptomCount,
  });
}

/**
 * Track validation system usage
 */
export function trackValidationUsed(validationType: string): void {
  trackGA4Event(GA4Events.USE_VALIDATION, {
    validation_type: validationType,
  });
}

/**
 * Track progress view
 */
export function trackProgressViewed(viewType: string): void {
  trackGA4Event(GA4Events.VIEW_PROGRESS, {
    view_type: viewType,
  });
}

/**
 * Track analytics tab view
 */
export function trackAnalyticsTabViewed(tabName: string): void {
  trackGA4Event(GA4Events.VIEW_ANALYTICS_TAB, {
    tab_name: tabName,
  });
}

/**
 * Track data export
 */
export function trackDataExported(format: 'csv' | 'json' | 'pdf', entryCount?: number): void {
  trackGA4Event(GA4Events.EXPORT_DATA, {
    format,
    entry_count: entryCount,
  });
}

/**
 * Track WCB report export
 */
export function trackWCBReportExported(reportType: string): void {
  trackGA4Event(GA4Events.EXPORT_WCB_REPORT, {
    report_type: reportType,
  });
}

/**
 * Track clinical report generation
 */
export function trackClinicalReportGenerated(format: string): void {
  trackGA4Event(GA4Events.GENERATE_CLINICAL_REPORT, {
    format,
  });
}

/**
 * Track body location selection
 */
export function trackBodyLocationSelected(bodyRegion: string): void {
  trackGA4Event(GA4Events.SELECT_BODY_LOCATION, {
    body_region: bodyRegion,
  });
}

/**
 * Track empathy insight view
 */
export function trackEmpathyInsightViewed(insightType: string, confidence?: number): void {
  trackGA4Event(GA4Events.VIEW_EMPATHY_INSIGHT, {
    insight_type: insightType,
    confidence,
  });
}

/**
 * Track template application
 */
export function trackTemplateApplied(templateId: string, templateName?: string): void {
  trackGA4Event(GA4Events.APPLY_TEMPLATE, {
    template_id: templateId,
    template_name: templateName,
  });
}

/**
 * Track template creation
 */
export function trackTemplateCreated(templateId: string, templateName?: string): void {
  trackGA4Event(GA4Events.CREATE_TEMPLATE, {
    template_id: templateId,
    template_name: templateName,
  });
}

/**
 * Track backup creation
 */
export function trackBackupCreated(): void {
  trackGA4Event(GA4Events.CREATE_BACKUP);
}

/**
 * Track data restore
 */
export function trackDataRestored(): void {
  trackGA4Event(GA4Events.RESTORE_DATA);
}

/**
 * Track accessibility setting change
 */
export function trackAccessibilitySettingChanged(
  settingName: string,
  settingValue: string | boolean
): void {
  trackGA4Event(GA4Events.CHANGE_ACCESSIBILITY_SETTING, {
    setting_name: settingName,
    setting_value: settingValue,
  });
}

/**
 * Track milestone reached
 */
export function trackMilestoneReached(milestoneType: string, milestoneValue?: number): void {
  trackGA4Event(GA4Events.REACH_MILESTONE, {
    milestone_type: milestoneType,
    milestone_value: milestoneValue,
  });
}

/**
 * Track crisis resource triggered
 */
export function trackCrisisResourceTriggered(): void {
  trackGA4Event(GA4Events.TRIGGER_CRISIS_RESOURCE);
}

/**
 * Track mood entry logged
 */
export function trackMoodEntryLogged(moodLevel: number): void {
  trackGA4Event(GA4Events.LOG_MOOD_ENTRY, {
    mood_level: moodLevel,
  });
}

/**
 * Track onboarding completion
 */
export function trackOnboardingCompleted(): void {
  trackGA4Event(GA4Events.COMPLETE_ONBOARDING);
}

/**
 * Track onboarding skipped
 */
export function trackOnboardingSkipped(): void {
  trackGA4Event(GA4Events.SKIP_ONBOARDING);
}

// Export a default object with all tracking functions for convenience
export const ga4Analytics = {
  trackEvent: trackGA4Event,
  trackPainEntryLogged,
  trackValidationUsed,
  trackProgressViewed,
  trackAnalyticsTabViewed,
  trackDataExported,
  trackWCBReportExported,
  trackClinicalReportGenerated,
  trackBodyLocationSelected,
  trackEmpathyInsightViewed,
  trackTemplateApplied,
  trackTemplateCreated,
  trackBackupCreated,
  trackDataRestored,
  trackAccessibilitySettingChanged,
  trackMilestoneReached,
  trackCrisisResourceTriggered,
  trackMoodEntryLogged,
  trackOnboardingCompleted,
  trackOnboardingSkipped,
  isAvailable: isGA4Available,
};

export default ga4Analytics;
