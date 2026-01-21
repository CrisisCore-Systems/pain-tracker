import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  trackGA4Event,
  GA4Events,
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
  ga4Analytics,
} from './ga4-events';

const CONSENT_KEY = 'pain-tracker:analytics-consent';

describe('GA4 Events Service', () => {
  let mockGtag: ReturnType<typeof vi.fn>;
  let originalGtag: typeof window.gtag;
  let originalEnableAnalytics: string | undefined;

  beforeEach(() => {
    // Ensure analytics env flag is enabled for these unit tests.
    originalEnableAnalytics = process.env.VITE_ENABLE_ANALYTICS;
    process.env.VITE_ENABLE_ANALYTICS = 'true';

    // Ensure explicit user consent is granted for GA4 emission.
    localStorage.setItem(CONSENT_KEY, 'granted');

    // Store original gtag
    originalGtag = window.gtag;
    
    // Create mock gtag function
    mockGtag = vi.fn();
    window.gtag = mockGtag;
  });

  afterEach(() => {
    // Restore original gtag
    window.gtag = originalGtag;
    localStorage.removeItem(CONSENT_KEY);
    if (originalEnableAnalytics === undefined) delete process.env.VITE_ENABLE_ANALYTICS;
    else process.env.VITE_ENABLE_ANALYTICS = originalEnableAnalytics;
    vi.restoreAllMocks();
  });

  describe('trackGA4Event', () => {
    it('should call gtag with correct event name and parameters', () => {
      trackGA4Event(GA4Events.LOG_PAIN_ENTRY, { pain_level_bucket: 'moderate' });

      expect(mockGtag).toHaveBeenCalledWith('event', 'log_pain_entry', expect.objectContaining({
        pain_level_bucket: 'moderate',
        time_of_day: expect.any(String),
      }));
    });

    it('should not throw when gtag is not available', () => {
      window.gtag = undefined;

      expect(() => {
        trackGA4Event(GA4Events.LOG_PAIN_ENTRY, { pain_level_bucket: 'moderate' });
      }).not.toThrow();
    });

    it('should not emit when consent is not granted', () => {
      localStorage.setItem(CONSENT_KEY, 'declined');

      trackGA4Event(GA4Events.LOG_PAIN_ENTRY, { pain_level_bucket: 'moderate' });

      expect(mockGtag).not.toHaveBeenCalled();
    });

    it('should add time_of_day parameter automatically', () => {
      trackGA4Event(GA4Events.VIEW_PROGRESS);

      expect(mockGtag).toHaveBeenCalledWith('event', 'view_progress', expect.objectContaining({
        time_of_day: expect.stringMatching(/^(morning|afternoon|evening|night)$/),
      }));
    });
  });

  describe('trackPainEntryLogged', () => {
    it('should track pain entry with all parameters', () => {
      trackPainEntryLogged({
        painLevel: 7,
        hasLocation: true,
        hasNotes: true,
        locationCount: 3,
        symptomCount: 2,
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'log_pain_entry', expect.objectContaining({
        pain_level_bucket: 'severe',
        has_location: true,
        has_notes: true,
        location_count: 3,
        symptom_count: 2,
      }));
    });

    it('should track pain entry with minimal parameters', () => {
      trackPainEntryLogged({
        painLevel: 3,
        hasLocation: false,
        hasNotes: false,
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'log_pain_entry', expect.objectContaining({
        pain_level_bucket: 'moderate',
        has_location: false,
        has_notes: false,
      }));
    });
  });

  describe('trackValidationUsed', () => {
    it('should track validation usage', () => {
      trackValidationUsed('emotion-validation');

      expect(mockGtag).toHaveBeenCalledWith('event', 'use_validation', expect.objectContaining({
        validation_type: 'emotion-validation',
      }));
    });
  });

  describe('trackProgressViewed', () => {
    it('should track progress view', () => {
      trackProgressViewed('weekly-summary');

      expect(mockGtag).toHaveBeenCalledWith('event', 'view_progress', expect.objectContaining({
        view_type: 'weekly-summary',
      }));
    });
  });

  describe('trackAnalyticsTabViewed', () => {
    it('should track analytics tab view', () => {
      trackAnalyticsTabViewed('heatmap');

      expect(mockGtag).toHaveBeenCalledWith('event', 'view_analytics_tab', expect.objectContaining({
        tab_name: 'heatmap',
      }));
    });
  });

  describe('trackDataExported', () => {
    it('should track data export with format and count', () => {
      trackDataExported('csv', 50);

      expect(mockGtag).toHaveBeenCalledWith('event', 'export_data', expect.objectContaining({
        format: 'csv',
        entry_count: 50,
      }));
    });

    it('should track data export without count', () => {
      trackDataExported('json');

      expect(mockGtag).toHaveBeenCalledWith('event', 'export_data', expect.objectContaining({
        format: 'json',
      }));
    });
  });

  describe('trackWCBReportExported', () => {
    it('should track WCB report export', () => {
      trackWCBReportExported('detailed');

      expect(mockGtag).toHaveBeenCalledWith('event', 'export_wcb_report', expect.objectContaining({
        report_type: 'detailed',
      }));
    });
  });

  describe('trackClinicalReportGenerated', () => {
    it('should track clinical report generation', () => {
      trackClinicalReportGenerated('pdf');

      expect(mockGtag).toHaveBeenCalledWith('event', 'generate_clinical_report', expect.objectContaining({
        format: 'pdf',
      }));
    });
  });

  describe('trackBodyLocationSelected', () => {
    it('should track body location selection', () => {
      trackBodyLocationSelected('lower_back');

      expect(mockGtag).toHaveBeenCalledWith('event', 'select_body_location', expect.objectContaining({
        time_of_day: expect.any(String),
      }));
    });
  });

  describe('trackEmpathyInsightViewed', () => {
    it('should track empathy insight view with confidence', () => {
      trackEmpathyInsightViewed('trend_analysis', 0.85);

      expect(mockGtag).toHaveBeenCalledWith('event', 'view_empathy_insight', expect.objectContaining({
        insight_type: 'trend_analysis',
        confidence: 0.85,
      }));
    });

    it('should track empathy insight view without confidence', () => {
      trackEmpathyInsightViewed('pattern_detection');

      expect(mockGtag).toHaveBeenCalledWith('event', 'view_empathy_insight', expect.objectContaining({
        insight_type: 'pattern_detection',
      }));
    });
  });

  describe('trackTemplateApplied', () => {
    it('should track template application', () => {
      trackTemplateApplied('template-123', 'Morning Routine');

      expect(mockGtag).toHaveBeenCalledWith('event', 'apply_template', expect.objectContaining({
        template_id: 'template-123',
        template_name: 'Morning Routine',
      }));
    });
  });

  describe('trackTemplateCreated', () => {
    it('should track template creation', () => {
      trackTemplateCreated('template-456', 'Evening Assessment');

      expect(mockGtag).toHaveBeenCalledWith('event', 'create_template', expect.objectContaining({
        template_id: 'template-456',
        template_name: 'Evening Assessment',
      }));
    });
  });

  describe('trackBackupCreated', () => {
    it('should track backup creation', () => {
      trackBackupCreated();

      expect(mockGtag).toHaveBeenCalledWith('event', 'create_backup', expect.any(Object));
    });
  });

  describe('trackDataRestored', () => {
    it('should track data restore', () => {
      trackDataRestored();

      expect(mockGtag).toHaveBeenCalledWith('event', 'restore_data', expect.any(Object));
    });
  });

  describe('trackAccessibilitySettingChanged', () => {
    it('should track accessibility setting change with string value', () => {
      trackAccessibilitySettingChanged('font_size', 'large');

      expect(mockGtag).toHaveBeenCalledWith('event', 'change_accessibility_setting', expect.objectContaining({
        setting_name: 'font_size',
        setting_value: 'large',
      }));
    });

    it('should track accessibility setting change with boolean value', () => {
      trackAccessibilitySettingChanged('high_contrast', true);

      expect(mockGtag).toHaveBeenCalledWith('event', 'change_accessibility_setting', expect.objectContaining({
        setting_name: 'high_contrast',
        setting_value: true,
      }));
    });
  });

  describe('trackMilestoneReached', () => {
    it('should track milestone with value', () => {
      trackMilestoneReached('entries_logged', 100);

      expect(mockGtag).toHaveBeenCalledWith('event', 'reach_milestone', expect.objectContaining({
        milestone_type: 'entries_logged',
        milestone_value: 100,
      }));
    });

    it('should track milestone without value', () => {
      trackMilestoneReached('first_week_complete');

      expect(mockGtag).toHaveBeenCalledWith('event', 'reach_milestone', expect.objectContaining({
        milestone_type: 'first_week_complete',
      }));
    });
  });

  describe('trackCrisisResourceTriggered', () => {
    it('should track crisis resource trigger', () => {
      trackCrisisResourceTriggered();

      expect(mockGtag).toHaveBeenCalledWith('event', 'trigger_crisis_resource', expect.any(Object));
    });
  });

  describe('trackMoodEntryLogged', () => {
    it('should track mood entry', () => {
      trackMoodEntryLogged(8);

      expect(mockGtag).toHaveBeenCalledWith('event', 'log_mood_entry', expect.objectContaining({
        time_of_day: expect.any(String),
      }));
    });
  });

  describe('trackOnboardingCompleted', () => {
    it('should track onboarding completion', () => {
      trackOnboardingCompleted();

      expect(mockGtag).toHaveBeenCalledWith('event', 'complete_onboarding', expect.any(Object));
    });
  });

  describe('trackOnboardingSkipped', () => {
    it('should track onboarding skip', () => {
      trackOnboardingSkipped();

      expect(mockGtag).toHaveBeenCalledWith('event', 'skip_onboarding', expect.any(Object));
    });
  });

  describe('ga4Analytics object', () => {
    it('should expose all tracking functions', () => {
      expect(ga4Analytics.trackEvent).toBe(trackGA4Event);
      expect(ga4Analytics.trackPainEntryLogged).toBe(trackPainEntryLogged);
      expect(ga4Analytics.trackValidationUsed).toBe(trackValidationUsed);
      expect(ga4Analytics.trackProgressViewed).toBe(trackProgressViewed);
      expect(ga4Analytics.trackDataExported).toBe(trackDataExported);
      expect(typeof ga4Analytics.isAvailable).toBe('function');
    });

    it('should report availability correctly when gtag exists', () => {
      expect(ga4Analytics.isAvailable()).toBe(true);
    });

    it('should report unavailability when gtag is missing', () => {
      window.gtag = undefined;
      expect(ga4Analytics.isAvailable()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should silently handle errors in gtag', () => {
      mockGtag.mockImplementation(() => {
        throw new Error('GTM Error');
      });

      // Should not throw
      expect(() => {
        trackGA4Event(GA4Events.LOG_PAIN_ENTRY, { pain_level_bucket: 'moderate' });
      }).not.toThrow();
    });
  });
});
