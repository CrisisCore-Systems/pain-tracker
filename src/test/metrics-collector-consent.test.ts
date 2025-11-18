import { describe, it, expect } from 'vitest';
import type { PainEntry } from '../types';
import type { MoodEntry } from '../types/quantified-empathy';
import { EmpathyMetricsCollector } from '../services/EmpathyMetricsCollector';
import { SecurityService } from '../services/SecurityService';
import { EmpathyDrivenAnalyticsService } from '../services/EmpathyDrivenAnalytics';

const security = new SecurityService(undefined, { consentRequired: true });
const analytics = new EmpathyDrivenAnalyticsService({
  validationThreshold: 50,
  celebrationFrequency: 'daily',
  reportingStyle: 'balanced',
  privacyLevel: 'personal',
  languagePreference: 'everyday',
});
const collector = new EmpathyMetricsCollector(security, analytics);

describe('EmpathyMetricsCollector consent enforcement', () => {
  it('throws when consent required and not granted', async () => {
    const painEntries: PainEntry[] = [];
    const moodEntries: MoodEntry[] = [] as MoodEntry[];
    await expect(
      collector.collect(painEntries, moodEntries, { userId: 'u1', consentGranted: false })
    ).rejects.toThrow(/Consent required/);
  });
});
