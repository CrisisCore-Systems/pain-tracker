import { describe, it, expect } from 'vitest';
import { empathyIntelligenceEngine } from '../EmpathyIntelligenceEngine';

describe('EmpathyIntelligenceEngine (spike)', () => {
  it('returns defaults for empty inputs', async () => {
    const metrics = await empathyIntelligenceEngine.calculateAdvancedEmpathyMetrics('user-1', [], [] as any);
    expect(metrics).toBeTruthy();
    expect(metrics.emotionalIntelligence).toBeTruthy();
    expect(typeof metrics.emotionalIntelligence.selfAwareness).toBe('number');
    expect(metrics.emotionalIntelligence.selfAwareness).toBeGreaterThanOrEqual(0);
    expect(metrics.emotionalIntelligence.selfAwareness).toBeLessThanOrEqual(100);
  });

  it('reflects mood in simple single-entry input', async () => {
    const moodEntry = {
      mood: 8,
      notes: 'I felt connected and empathetic towards others',
  context: 'social',
      emotionalClarity: 7,
      emotionalRegulation: 8,
      hopefulness: 7,
      anxiety: 2,
      socialSupport: 'some',
      copingStrategies: []
    } as any;

    const metrics = await empathyIntelligenceEngine.calculateAdvancedEmpathyMetrics('user-2', [], [moodEntry]);
    expect(metrics.emotionalIntelligence.empathy).toBeGreaterThanOrEqual(0);
    expect(metrics.emotionalIntelligence.empathy).toBeLessThanOrEqual(100);
    // empathy should be influenced by mood entry presence
    expect(metrics.emotionalIntelligence.empathy).not.toBeNaN();
  });
});
