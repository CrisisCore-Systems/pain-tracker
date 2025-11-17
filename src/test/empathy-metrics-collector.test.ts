import { describe, it, expect } from 'vitest';
import { EmpathyMetricsCollector } from '../services/EmpathyMetricsCollector';
import { SecurityService } from '../services/SecurityService';
import { EmpathyDrivenAnalyticsService } from '../services/EmpathyDrivenAnalytics';
import type { PainEntry } from '../types';
import type { MoodEntry } from '../types/quantified-empathy';

// Minimal stubs for analytics (we rely on underlying implementation but keep inputs small)
const analytics = new EmpathyDrivenAnalyticsService({
  validationThreshold: 70,
  celebrationFrequency: 'daily',
  reportingStyle: 'balanced',
  privacyLevel: 'personal',
  languagePreference: 'everyday',
});

const security = new SecurityService(undefined, { consentRequired: true });
const collector = new EmpathyMetricsCollector(security, analytics);

const basePain: PainEntry = {
  id: 1,
  timestamp: new Date().toISOString(),
  baselineData: { pain: 5, locations: ['back'], symptoms: ['ache'] },
  functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
  medications: { current: [], changes: '', effectiveness: '' },
  treatments: { recent: [], effectiveness: '', planned: [] },
  qualityOfLife: { sleepQuality: 5, moodImpact: 4, socialImpact: [] },
  workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
  comparison: { worseningSince: '', newLimitations: [] },
  notes: 'Talked with friend and felt understood. Email test@example.com',
};

const baseMood: MoodEntry = {
  timestamp: new Date(),
  mood: 6,
  energy: 6,
  anxiety: 4,
  stress: 5,
  hopefulness: 7,
  selfEfficacy: 6,
  emotionalClarity: 7,
  emotionalRegulation: 6,
  context: 'supportive chat',
  triggers: [],
  copingStrategies: ['self-compassion'],
  socialSupport: 'moderate',
  notes: 'I feel supported and understood after boundary practice.',
};

describe('EmpathyMetricsCollector', () => {
  it('enforces consent', async () => {
    await expect(
      collector.collect([basePain], [baseMood], {
        userId: 'user-1',
        consentGranted: false,
      })
    ).rejects.toThrow(/Consent required/);
  });

  it('sanitizes PII-like patterns and returns metrics', async () => {
    const result = await collector.collect([basePain], [baseMood], {
      userId: 'user-1',
      consentGranted: true,
      sanitize: true,
    });
    expect(result.metrics.emotionalIntelligence.empathy).toBeGreaterThanOrEqual(0);
    expect(result.redactions).toBeGreaterThanOrEqual(1); // email redacted
  });

  it('applies differential privacy noise when enabled', async () => {
    const r1 = await collector.collect([basePain], [baseMood], {
      userId: 'user-1',
      consentGranted: true,
      differentialPrivacy: true,
      noiseEpsilon: 0.5,
    });
    const r2 = await collector.collect([basePain], [baseMood], {
      userId: 'user-1',
      consentGranted: true,
      differentialPrivacy: true,
      noiseEpsilon: 0.5,
    });
    // Value likely differs due to noise (non-deterministic, so allow equality but check flag)
    expect(r1.noiseInjected).toBe(true);
    expect(r2.noiseInjected).toBe(true);
  });
});
