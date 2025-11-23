import { describe, it, expect } from 'vitest';
import { EmpathyMetricsCollector } from '../services/EmpathyMetricsCollector';
import { SecurityService } from '../services/SecurityService';
import { EmpathyDrivenAnalyticsService } from '../services/EmpathyDrivenAnalytics';
import type { PainEntry } from '../types';
import type { MoodEntry } from '../types/quantified-empathy';

const security = new SecurityService(undefined, { consentRequired: true });
const analytics = new EmpathyDrivenAnalyticsService({
  validationThreshold: 70,
  celebrationFrequency: 'daily',
  reportingStyle: 'balanced',
  privacyLevel: 'personal',
  languagePreference: 'everyday',
});
const collector = new EmpathyMetricsCollector(security, analytics);

function makePain(notes: string): PainEntry {
  return {
    id: Math.random(),
    timestamp: new Date().toISOString(),
    baselineData: { pain: 5, locations: ['back'], symptoms: ['ache'] },
    functionalImpact: { limitedActivities: [], assistanceNeeded: [], mobilityAids: [] },
    medications: { current: [], changes: '', effectiveness: '' },
    treatments: { recent: [], effectiveness: '', planned: [] },
    qualityOfLife: { sleepQuality: 5, moodImpact: 4, socialImpact: [] },
    workImpact: { missedWork: 0, modifiedDuties: [], workLimitations: [] },
    comparison: { worseningSince: '', newLimitations: [] },
    notes,
  };
}

function makeMood(notes: string): MoodEntry {
  return {
    id: Math.random(),
    timestamp: new Date().toISOString(),
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
    copingStrategies: ['mindfulness'],
    socialSupport: 'moderate',
    notes,
  };
}

describe('EmpathyMetricsCollector sanitization & ranges', () => {
  it('clamps and/or noises values within 0-100', async () => {
    const res = await collector.collect(
      [makePain('Phone 123-456-7890')],
      [makeMood('I feel understood')],
      {
        userId: 'u',
        consentGranted: true,
        differentialPrivacy: true,
      }
    );
    const sections = [
      res.metrics.emotionalIntelligence,
      res.metrics.compassionateProgress,
      res.metrics.empathyKPIs,
      res.metrics.humanizedMetrics,
    ];
    for (const section of sections) {
      for (const v of Object.values(section)) {
        if (typeof v === 'number') {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it('redacts obvious PII patterns', async () => {
    const email = 'test@example.com';
    const res = await collector.collect(
      [makePain(`Contact: ${email}`)],
      [makeMood('Feeling supported')],
      {
        userId: 'u',
        consentGranted: true,
        sanitize: true,
      }
    );
    expect(res.redactions).toBeGreaterThanOrEqual(1);
    // Ensure metrics output doesn't contain raw email
    expect(JSON.stringify(res.metrics)).not.toContain(email);
  });
});
