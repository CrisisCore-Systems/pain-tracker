import type { MoodEntry, PredictiveEmpathyModel } from '../../types/quantified-empathy';
import type { PainEntry } from '../../types';

// Predictive utilities extracted for isolated testing

export function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  let up = 0, down = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i - 1]) up++; else if (values[i] < values[i - 1]) down++;
  }
  return (up - down) / (values.length - 1) * 100;
}

export function calculateVariance(values: number[]): number {
  if (!values.length) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
}

export function buildPredictiveModel(painEntries: PainEntry[], moodEntries: MoodEntry[]): PredictiveEmpathyModel {
  const recentPain = painEntries.slice(-7).reduce((s, e) => s + e.baselineData.pain, 0) / Math.max(1, Math.min(7, painEntries.length || 1));
  const recentMood = moodEntries.slice(-7).reduce((s, e) => s + e.mood, 0) / Math.max(1, Math.min(7, moodEntries.length || 1));
  return {
    empathyForecast: [{ timeframe: 'next week', predictedEmpathyLevel: Math.max(0, Math.min(100, recentMood * 10)), confidenceInterval: { min: 40, max: 80 }, influencingFactors: [], recommendedPreparations: [] }],
    riskPrediction: [{ riskType: 'compassion_fatigue', riskLevel: Math.max(0, Math.min(100, recentPain * 10)), timeToRisk: 14, earlyWarningSignals: [], preventionStrategies: [], mitigation: [] }],
    opportunityPrediction: [{ opportunityType: 'growth_window', potentialImpact: 60, timeWindow: 'next 2 weeks', preparationNeeded: [], supportRequired: [], expectedOutcomes: [] }],
    burnoutRisk: {
      currentRiskLevel: Math.max(0, Math.min(100, (100 - recentMood) + (recentPain * 0.5))),
      riskFactors: ['high_pain', 'low_mood'],
      protectiveFactors: [],
      timeToIntervention: 7,
      interventionStrategies: [],
      recoveryTimeline: '2-4 weeks'
    },
    growthPotential: {
      currentGrowthTrajectory: Math.max(0, Math.min(100, recentMood - (recentPain * 0.3))),
      growthAccelerators: ['emotional_awareness', 'social_support'],
      growthBarriers: [],
      optimalGrowthConditions: [],
      expectedTimeline: '1 month',
      supportNeeded: []
    },
    adaptiveRecommendations: [],
    personalizedInterventions: []
  };
}
