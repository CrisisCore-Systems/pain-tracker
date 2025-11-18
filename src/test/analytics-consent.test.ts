import { describe, it, expect, beforeEach } from 'vitest';
import { privacyAnalytics } from '../services/PrivacyAnalyticsService';

describe('PrivacyAnalyticsService consent management', () => {
  beforeEach(async () => {
    // Reset analytics state between tests
    privacyAnalytics.revokeConsent();
    await privacyAnalytics.clearAnalyticsData();
  });

  it('should grant consent when requestConsent is called', async () => {
    const result = await privacyAnalytics.requestConsent();

    expect(result).toBe(true);
    expect(privacyAnalytics.hasConsent()).toBe(true);
  });

  it('should revoke consent when revokeConsent is called', async () => {
    await privacyAnalytics.requestConsent();
    expect(privacyAnalytics.hasConsent()).toBe(true);

    privacyAnalytics.revokeConsent();
    expect(privacyAnalytics.hasConsent()).toBe(false);
  });

  it('should not track events when consent is not given', async () => {
    privacyAnalytics.revokeConsent();

    const mockEntry = {
      id: 1,
      timestamp: new Date().toISOString(),
      baselineData: {
        pain: 5,
        locations: ['back'],
        symptoms: ['aching'],
      },
      functionalImpact: {
        limitedActivities: [],
        assistanceNeeded: [],
        mobilityAids: [],
      },
      medications: {
        current: [],
        changes: '',
        effectiveness: '',
      },
      treatments: {
        recent: [],
        effectiveness: '',
        planned: [],
      },
      qualityOfLife: {
        sleepQuality: 7,
        moodImpact: 6,
        socialImpact: [],
      },
      workImpact: {
        missedWork: 0,
        modifiedDuties: [],
        workLimitations: [],
      },
      comparison: {
        worseningSince: '',
        newLimitations: [],
      },
      notes: '',
    };

    await privacyAnalytics.trackPainEntry(mockEntry);

    const status = privacyAnalytics.getPrivacyStatus();
    expect(status.eventsCollected).toBe(0);
  });

  it('should track events when consent is given', async () => {
    await privacyAnalytics.requestConsent();

    const mockEntry = {
      id: 1,
      timestamp: new Date().toISOString(),
      baselineData: {
        pain: 5,
        locations: ['back'],
        symptoms: ['aching'],
      },
      functionalImpact: {
        limitedActivities: [],
        assistanceNeeded: [],
        mobilityAids: [],
      },
      medications: {
        current: [],
        changes: '',
        effectiveness: '',
      },
      treatments: {
        recent: [],
        effectiveness: '',
        planned: [],
      },
      qualityOfLife: {
        sleepQuality: 7,
        moodImpact: 6,
        socialImpact: [],
      },
      workImpact: {
        missedWork: 0,
        modifiedDuties: [],
        workLimitations: [],
      },
      comparison: {
        worseningSince: '',
        newLimitations: [],
      },
      notes: '',
    };

    await privacyAnalytics.trackPainEntry(mockEntry);

    const status = privacyAnalytics.getPrivacyStatus();
    expect(status.eventsCollected).toBeGreaterThan(0);
  });

  it('should track validation usage', async () => {
    await privacyAnalytics.requestConsent();

    await privacyAnalytics.trackValidationUsage('emotion-validation');

    const status = privacyAnalytics.getPrivacyStatus();
    expect(status.eventsCollected).toBe(1);
  });

  it('should track data exports', async () => {
    await privacyAnalytics.requestConsent();

    await privacyAnalytics.trackDataExport('csv');

    const status = privacyAnalytics.getPrivacyStatus();
    expect(status.eventsCollected).toBe(1);
  });
});
