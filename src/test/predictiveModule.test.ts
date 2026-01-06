import { describe, it, expect } from 'vitest';
import type { MoodEntry } from '../types/quantified-empathy';
import type { PainEntry } from '../types';
import { calculateTrend, buildPredictiveModel } from '../services/empathy/PredictiveModule';

interface TestPain {
  baselineData: { pain: number };
  id: string;
  timestamp: Date;
}
interface TestMood {
  mood: number;
  notes: string;
  timestamp: Date;
  emotionalClarity: number;
  emotionalRegulation: number;
  hopefulness: number;
  context: string;
  copingStrategies: string[];
  anxiety: number;
  socialSupport: string;
}
const mkPain = (p: number): TestPain => ({
  baselineData: { pain: p },
  id: `p${p}`,
  timestamp: new Date(),
});
const mkMood = (m: number): TestMood => ({
  mood: m,
  notes: '',
  timestamp: new Date(),
  emotionalClarity: 5,
  emotionalRegulation: 5,
  hopefulness: 5,
  context: '',
  copingStrategies: [],
  anxiety: 0,
  socialSupport: 'none',
});

describe('PredictiveModule', () => {
  it('calculates positive trend', () => {
    expect(calculateTrend([1, 2, 3, 4]) > 0).toBe(true);
  });
  it('builds predictive model with bounded values', () => {
    const pains = [mkPain(5), mkPain(6)] as unknown as { baselineData: { pain: number } }[];
    const moods = [mkMood(5), mkMood(6)] as unknown as { mood: number }[];
    const model = buildPredictiveModel(
      pains as unknown as PainEntry[],
      moods as unknown as MoodEntry[]
    ); // limited structure sufficient for heuristic
    expect(model.empathyForecast[0].predictedEmpathyLevel).toBeGreaterThanOrEqual(0);
    expect(model.burnoutRisk.currentRiskLevel).toBeLessThanOrEqual(100);
  });
});
