import { describe, it, expect } from 'vitest';
import { empathyIntelligenceEngine } from '../services/EmpathyIntelligenceEngine';
import { EmpathyIntelligenceEngine } from '../services/EmpathyIntelligenceEngine';

const engine = new EmpathyIntelligenceEngine({
  learningRate: 0.05,
  predictionHorizon: 7,
  personalizationDepth: 'surface',
  culturalSensitivity: 'standard',
  interventionStyle: 'gentle',
  privacyLevel: 'standard',
});

describe('EmpathyIntelligenceEngine empty inputs', () => {
  it('returns baseline metrics when no data available', async () => {
    const metrics = await engine.calculateAdvancedEmpathyMetrics('empty', [], []);
    // Baseline heuristics default around mid-range numbers
    expect(metrics.emotionalIntelligence.empathy).toBeGreaterThanOrEqual(0);
    expect(metrics.empathyKPIs.validationReceived).toBeGreaterThanOrEqual(0);
    expect(
      metrics.humanizedMetrics.wisdomGained.wisdomCategories.practicalWisdom
    ).toBeGreaterThanOrEqual(0);
  });
});
