import type { PainEntry } from '../../types';

export interface PredictionResult {
  predictedPain: number;
  confidence: number; // 0-1
  flareInDays: number | null;
  flareConfidence: number | null;
  medicationEffectiveness: Array<{
    medication: string;
    effectiveness: number;
    confidence: number;
  }>;
  methodology: string;
}

/**
 * Predicts pain level for the next 24h, flare risk, and medication effectiveness.
 * This is a stub. Replace with a real ML model.
 */
export function predictPainAndFlares(entries: PainEntry[], _options: {
  weather?: string;
  activity?: string;
  medicationAdherence?: Record<string, boolean>;
} = {}): PredictionResult {
  // TODO: Replace with real ML model
  const last = entries[entries.length - 1];
  return {
    predictedPain: last?.baselineData.pain ?? 5,
    confidence: 0.5,
    flareInDays: 3,
    flareConfidence: 0.4,
    medicationEffectiveness: last?.medications.current.map(m => ({
      medication: m.name,
      effectiveness: Math.random() * 2 + 3,
      confidence: 0.5,
    })) ?? [],
    methodology: 'Heuristic placeholder. Replace with ML model.',
  };
}
