import { describe, it, expect } from 'vitest';
import { empathyIntelligenceEngine } from '../../src/services/EmpathyIntelligenceEngine';
import type { MoodEntry } from '../../src/types/quantified-empathy';

describe('EmpathyIntelligenceEngine (spike)', () => {
  it('returns defaults for empty inputs', async () => {
    const metrics = await empathyIntelligenceEngine.calculateAdvancedEmpathyMetrics('user-1', [], []);
    expect(metrics).toBeTruthy();
    expect(metrics.emotionalIntelligence).toBeTruthy();
    expect(typeof metrics.emotionalIntelligence.selfAwareness).toBe('number');
    expect(metrics.emotionalIntelligence.selfAwareness).toBeGreaterThanOrEqual(0);
    expect(metrics.emotionalIntelligence.selfAwareness).toBeLessThanOrEqual(100);
  });

  it('reflects mood in simple single-entry input', async () => {
    const moodEntry: MoodEntry = {
      id: 1,
      timestamp: new Date().toISOString(),
      mood: 8,
      energy: 6,
      anxiety: 2,
      stress: 3,
      hopefulness: 7,
      selfEfficacy: 6,
      emotionalClarity: 7,
      emotionalRegulation: 8,
      context: 'Testing engine response to a positive mood entry',
      triggers: [],
      copingStrategies: [],
      socialSupport: 'moderate',
      notes: 'I felt connected and empathetic towards others',
    };

    const metrics = await empathyIntelligenceEngine.calculateAdvancedEmpathyMetrics('user-2', [], [moodEntry]);
    expect(metrics.emotionalIntelligence.empathy).toBeGreaterThanOrEqual(0);
    expect(metrics.emotionalIntelligence.empathy).toBeLessThanOrEqual(100);
    // empathy should be influenced by mood entry presence
    expect(metrics.emotionalIntelligence.empathy).not.toBeNaN();
  });
});
