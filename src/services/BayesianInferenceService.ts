import { PainEntry } from '../types';
import { differenceInHours, parseISO } from 'date-fns';

/**
 * Service for local-first probabilistic reasoning about pain flares.
 * Uses a Naive Bayesian approach to estimate P(Flare | Evidence).
 * 
 * P(Flare | E) = (P(E | Flare) * P(Flare)) / P(E)
 * 
 * where E (Evidence) is a vector of features:
 * - Sleep quality < threshold
 * - Activity load > threshold
 * - Specific triggers present
 * - Weather pressure changes (if available)
 */

export interface PredictionContext {
  recentSleepQuality: number; // 0-10, where 10 is best
  yesterdayStrain: number; // 0-100 estimated load
  hoursSinceLastEntry: number;
  triggersPresent: string[];
  weatherPressureTrend?: 'rising' | 'falling' | 'stable';
}

export interface FlareRiskPrediction {
  probability: number; // 0.0 to 1.0
  riskLevel: 'low' | 'moderate' | 'high' | 'imminent';
  contributingFactors: Array<{
    factor: string;
    weight: number; // 0-1 contribution to risk
  }>;
  confidence: number; // 0-1 based on data volume
}

export class BayesianInferenceService {
  private static readonly FLARE_THRESHOLD = 7; // Pain level considered a flare
  private static readonly BASE_RATE_DEFAULT = 0.2; // Default P(Flare) if no history
  
  // Informative Priors (Heuristics until we have data)
  // These represent P(Evidence | Flare) - how likely we are to see this evidence given a flare is happening/imminent
  private static readonly PRIORS = {
    poorSleep: 0.7, // 70% of flares are preceded by poor sleep
    highStrain: 0.6, // 60% of flares are preceded by high exertion
    weatherChange: 0.4, // 40% of flares coincide with pressure changes
    triggerCluster: 0.8 // 80% of flares involve 2+ known triggers
  };

  /**
   * Analyze history to determine the user's specific Base Rate P(Flare)
   */
  private calculateBaseRate(history: PainEntry[]): number {
    if (history.length < 10) return BayesianInferenceService.BASE_RATE_DEFAULT;

    const flareCount = history.filter(e => e.baselineData.pain >= BayesianInferenceService.FLARE_THRESHOLD).length;
    return flareCount / history.length;
  }

  /**
   * Calculate likelihood ratio for a specific piece of evidence
   * LR = P(E|Flare) / P(E|~Flare)
   */
  private getLikelihoodRatio(
    evidence: boolean, 
    sensitivity: number, // P(E|Flare) aka True Positive Rate
    specificity: number  // P(~E|~Flare) aka True Negative Rate (1 - False Positive Rate)
  ): number {
    if (!evidence) {
      // LR for absence of evidence = (1 - sensitivity) / specificity
      return (1 - sensitivity) / specificity;
    }
    // LR for presence of evidence = sensitivity / (1 - specificity)
    return sensitivity / (1 - specificity);
  }

  /**
   * Predict the risk of a flare for the next time window (e.g., today/tomorrow)
   */
  public predictFlareRisk(
    context: PredictionContext,
    history: PainEntry[] = []
  ): FlareRiskPrediction {
    let priorOdds = this.odds(this.calculateBaseRate(history));
    const factors: Array<{ factor: string; weight: number }> = [];

    // 1. Evidence: Sleep Quality (Poor sleep increases risk)
    // Threshold: Sleep quality < 5 is "poor"
    const hasPoorSleep = context.recentSleepQuality < 5;
    const sleepLR = this.getLikelihoodRatio(hasPoorSleep, BayesianInferenceService.PRIORS.poorSleep, 0.6); // Assume 60% specificity for sleep
    priorOdds *= sleepLR;
    if (hasPoorSleep && sleepLR > 1) {
      factors.push({ factor: 'Poor Sleep Quality', weight: sleepLR });
    }

    // 2. Evidence: Strain (High load increases risk)
    // Refined Logic (Trauma-informed): 
    // - High Strain (>70): Risk increases.
    // - Low Strain (<30): Risk decreases (Protective Rest).
    // - Moderate Strain (30-70): Neutral (No adjustment).
    
    if (context.yesterdayStrain > 70) {
      const strainLR = this.getLikelihoodRatio(true, BayesianInferenceService.PRIORS.highStrain, 0.7);
      priorOdds *= strainLR;
      factors.push({ factor: 'High Previous Exertion', weight: strainLR });
    } else if (context.yesterdayStrain < 30) {
       // Only apply the "No High Strain" benefit if explicitly distinct from moderate activity
      const strainLR = this.getLikelihoodRatio(false, BayesianInferenceService.PRIORS.highStrain, 0.7);
      priorOdds *= strainLR;
    }

    // 3. Evidence: Weather (if provided)
    if (context.weatherPressureTrend && context.weatherPressureTrend !== 'stable') {
      const weatherLR = this.getLikelihoodRatio(true, BayesianInferenceService.PRIORS.weatherChange, 0.8);
      priorOdds *= weatherLR;
      factors.push({ factor: `Barometric Pressure (${context.weatherPressureTrend})`, weight: weatherLR });
    }

    // 4. Evidence: Triggers
    // Simple heuristic: presence of known triggers
    // Ideally this learns from history. For now, we assume if triggers are present, risk goes up.
    if (context.triggersPresent.length > 0) {
      // 0.2 increase per trigger, capped
      const triggerStrength = Math.min(context.triggersPresent.length * 0.5, 0.9); 
      const triggerLR = this.getLikelihoodRatio(true, triggerStrength, 0.85);
      priorOdds *= triggerLR;
      factors.push({ factor: `Active Triggers: ${context.triggersPresent.join(', ')}`, weight: triggerLR });
    }

    // Convert posterior odds back to probability
    const probability = this.probability(priorOdds);

    return {
      probability,
      riskLevel: this.getRiskLevel(probability),
      contributingFactors: factors.sort((a, b) => b.weight - a.weight),
      confidence: Math.min(history.length / 50, 1) // Simple linear confidence ramp up to 50 entries
    };
  }

  private odds(p: number): number {
    return p / (1 - p);
  }

  private probability(odds: number): number {
    return odds / (1 + odds);
  }

  private getRiskLevel(p: number): FlareRiskPrediction['riskLevel'] {
    if (p < 0.3) return 'low';
    if (p < 0.6) return 'moderate';
    if (p < 0.85) return 'high';
    return 'imminent';
  }

  /**
   * "Trigger Detective": Identify which triggers are most strongly correlated with high pain.
   * Calculates Relative Risk (RR) for each tag found in history.
   */
  public detectTriggerCorrelations(history: PainEntry[]): Array<{ trigger: string; risk: number; count: number }> {
    if (history.length < 5) return [];

    const triggers = new Set<string>();
    history.forEach(e => e.triggers?.forEach(t => triggers.add(t)));

    const results: Array<{ trigger: string; risk: number; count: number }> = [];
    const flareEntries = history.filter(e => e.baselineData.pain >= BayesianInferenceService.FLARE_THRESHOLD);
    const nonFlareEntries = history.filter(e => e.baselineData.pain < BayesianInferenceService.FLARE_THRESHOLD);

    // Default rates to avoid division by zero
    const baseFlareRate = flareEntries.length / history.length;

    triggers.forEach(trigger => {
      // P(Flare | Trigger)
      const entriesWithTrigger = history.filter(e => e.triggers?.includes(trigger));
      if (entriesWithTrigger.length < 3) return; // Ignore rare triggers

      const flaresWithTrigger = entriesWithTrigger.filter(e => e.baselineData.pain >= BayesianInferenceService.FLARE_THRESHOLD).length;
      const rateWithTrigger = flaresWithTrigger / entriesWithTrigger.length;

      // Relative Risk = Rate(Trigger) / BaseRate
      // If BaseRate is 0, we can't calculate RR, but if BaseRate is 0 there are no flares, so risk is 0.
      const relativeRisk = baseFlareRate > 0 ? (rateWithTrigger / baseFlareRate) : 0;

      if (relativeRisk > 1.2) { // Only return triggers that actually increase risk
        results.push({ trigger, risk: relativeRisk, count: entriesWithTrigger.length });
      }
    });

    return results.sort((a, b) => b.risk - a.risk).slice(0, 3); // Top 3
  }
}

export const bayesianService = new BayesianInferenceService();
