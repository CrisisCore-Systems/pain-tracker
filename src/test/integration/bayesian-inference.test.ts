import { describe, it, expect } from 'vitest';
import { BayesianInferenceService, PredictionContext, bayesianService } from '../../services/BayesianInferenceService';

describe('BayesianInferenceService', () => {
    it('should predict low risk when all factors are good', () => {
        const context: PredictionContext = {
            recentSleepQuality: 8, // Good sleep
            yesterdayStrain: 30, // Low strain
            hoursSinceLastEntry: 12,
            triggersPresent: []
        };
        const result = bayesianService.predictFlareRisk(context, []);
        
        expect(result.probability).toBeLessThan(0.4); // Should be low
        expect(result.riskLevel).toBe('low');
        expect(result.contributingFactors).toHaveLength(0);
    });

    it('should increase risk with poor sleep', () => {
        const context: PredictionContext = {
            recentSleepQuality: 3, // Poor sleep
            yesterdayStrain: 30,
            hoursSinceLastEntry: 12,
            triggersPresent: []
        };
        const result = bayesianService.predictFlareRisk(context, []);
        
        expect(result.probability).toBeGreaterThan(0.2); // Base rate is 0.2
        expect(result.contributingFactors).toContainEqual(
            expect.objectContaining({ factor: 'Poor Sleep Quality' })
        );
    });

    it('should show high risk with multiple factors', () => {
        const context: PredictionContext = {
            recentSleepQuality: 2, // Poor
            yesterdayStrain: 90, // High
            hoursSinceLastEntry: 12,
            triggersPresent: ['Stress', 'Weather']
        };
        const result = bayesianService.predictFlareRisk(context, []);
        
        // With priors: 
        // Base odds ~0.25 (p=0.2)
        // Sleep LR ~ 2
        // Strain LR ~ 2
        // Triggers LR ~ 2
        // Odds -> high
        
        expect(result.riskLevel).toMatch(/active|high|imminent/);
        expect(result.contributingFactors.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle pressure changes', () => {
         const context: PredictionContext = {
            recentSleepQuality: 7,
            yesterdayStrain: 20,
            hoursSinceLastEntry: 12,
            triggersPresent: [],
            weatherPressureTrend: 'falling'
        };
        const result = bayesianService.predictFlareRisk(context, []);
        expect(result.contributingFactors).toContainEqual(
            expect.objectContaining({ factor: expect.stringContaining('Barometric Pressure') })
        );
    });
});
