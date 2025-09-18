/**
 * Holistic Well-being Metrics Service
 * Comprehensive tracking of quality of life indicators beyond pain scores
 */

import { 
  HolisticWellbeingMetrics, 
  FunctionalAssessment,
  DigitalPacingSystem,
  EnergyDataPoint,
  EnergyBudget,
  SpoonTracker,
  BatteryMetrics,
  ActivityRecommendation,
  ScheduleAdaptation,
  PaceAdjustment,
  RestReminder,
  RecoveryTimeMetrics,
  RestQualityMetrics,
  SleepMetrics,
  StressRecoveryMetrics,
  NotificationConfig
} from '../types/quantified-empathy';
import type { PainEntry } from '../types';
import { MoodEntry } from '../types/quantified-empathy';

export class HolisticWellbeingService {
  private wellbeingHistory: Map<string, HolisticWellbeingMetrics[]> = new Map();
  private energyData: Map<string, EnergyDataPoint[]> = new Map();
  private pacingPreferences: Map<string, any> = new Map();

  // Calculate comprehensive wellbeing metrics
  async calculateWellbeingMetrics(
    userId: string, 
    painEntries: PainEntry[], 
    moodEntries: MoodEntry[]
  ): Promise<HolisticWellbeingMetrics> {
    return {
      qualityOfLife: await this.assessQualityOfLife(userId, painEntries, moodEntries),
      functionalIndependence: await this.assessFunctionalIndependence(userId, painEntries),
      socialConnectionMetrics: await this.assessSocialConnections(userId, moodEntries),
      cognitiveWellness: await this.assessCognitiveWellness(userId, painEntries, moodEntries)
    };
  }

  // Assess quality of life dimensions
  private async assessQualityOfLife(userId: string, painEntries: PainEntry[], moodEntries: MoodEntry[]) {
    const recentPainEntries = this.getRecentEntries(painEntries, 30); // Last 30 days
    const recentMoodEntries = this.getRecentMoodEntries(moodEntries, 30);

    // Calculate averages and trends
    const avgPain = recentPainEntries.length > 0 
      ? recentPainEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / recentPainEntries.length 
      : 5;

    const avgMood = recentMoodEntries.length > 0
      ? recentMoodEntries.reduce((sum, e) => sum + e.mood, 0) / recentMoodEntries.length
      : 5;

    const avgHopefulness = recentMoodEntries.length > 0
      ? recentMoodEntries.reduce((sum, e) => sum + e.hopefulness, 0) / recentMoodEntries.length
      : 5;

    const avgSelfEfficacy = recentMoodEntries.length > 0
      ? recentMoodEntries.reduce((sum, e) => sum + e.selfEfficacy, 0) / recentMoodEntries.length
      : 5;

    // Calculate sleep quality impact
    const avgSleepQuality = recentPainEntries.length > 0
      ? recentPainEntries.reduce((sum, e) => sum + e.qualityOfLife.sleepQuality, 0) / recentPainEntries.length
      : 5;

    return {
      overallSatisfaction: this.calculateLifeSatisfaction(avgPain, avgMood, avgSleepQuality),
      meaningAndPurpose: this.calculateMeaningAndPurpose(recentMoodEntries, recentPainEntries),
      personalGrowth: this.calculatePersonalGrowth(recentMoodEntries),
      autonomy: this.calculateAutonomy(recentPainEntries, recentMoodEntries),
      environmentalMastery: this.calculateEnvironmentalMastery(recentPainEntries, recentMoodEntries),
      positiveRelations: this.calculatePositiveRelations(recentMoodEntries),
      selfAcceptance: avgSelfEfficacy * 10 // Scale to 0-100
    };
  }

  // Assess functional independence across domains
  private async assessFunctionalIndependence(userId: string, painEntries: PainEntry[]) {
    const recentEntries = this.getRecentEntries(painEntries, 30);

    return {
      dailyActivities: this.assessDailyActivities(recentEntries),
      mobility: this.assessMobility(recentEntries),
      cognition: this.assessCognitiveFunctioning(recentEntries),
      communication: this.assessCommunication(recentEntries),
      workCapacity: this.assessWorkCapacity(recentEntries)
    };
  }

  // Assess social connection metrics
  private async assessSocialConnections(userId: string, moodEntries: MoodEntry[]) {
    const recentEntries = this.getRecentMoodEntries(moodEntries, 30);
    
    const socialEntries = recentEntries.filter(e => e.socialSupport !== 'none');
    const avgSocialSupport = socialEntries.length > 0 
      ? this.calculateAverageSocialSupport(socialEntries) 
      : 25;

    const contactFrequency = socialEntries.length / 4.3; // Weekly average (30 days / 7)
    
    return {
      networkSize: this.estimateNetworkSize(recentEntries),
      contactFrequency,
      relationshipQuality: avgSocialSupport,
      socialSupport: avgSocialSupport,
      communityInvolvement: this.calculateCommunityInvolvement(recentEntries),
      loneliness: Math.max(0, 100 - avgSocialSupport), // Inverse of social support
      belongingness: this.calculateBelongingness(recentEntries)
    };
  }

  // Assess cognitive wellness
  private async assessCognitiveWellness(userId: string, painEntries: PainEntry[], moodEntries: MoodEntry[]) {
    const recentPainEntries = this.getRecentEntries(painEntries, 30);
    const recentMoodEntries = this.getRecentMoodEntries(moodEntries, 30);

    const avgEmotionalClarity = recentMoodEntries.length > 0
      ? recentMoodEntries.reduce((sum, e) => sum + e.emotionalClarity, 0) / recentMoodEntries.length
      : 5;

    const avgEmotionalRegulation = recentMoodEntries.length > 0
      ? recentMoodEntries.reduce((sum, e) => sum + e.emotionalRegulation, 0) / recentMoodEntries.length
      : 5;

    // Estimate brain fog frequency from pain and mood data
    const highPainDays = recentPainEntries.filter(e => e.baselineData.pain >= 7).length;
    const highStressDays = recentMoodEntries.filter(e => e.stress >= 7).length;
    const brainFogFrequency = Math.min(30, highPainDays + highStressDays);

    return {
      memoryFunction: Math.max(10, 100 - (brainFogFrequency * 2)),
      attention: Math.max(10, 100 - (brainFogFrequency * 2.5)),
      executiveFunction: avgEmotionalRegulation * 10, // Scale to 0-100
      processingSpeed: Math.max(10, 100 - (brainFogFrequency * 3)),
      mentalClarity: avgEmotionalClarity * 10, // Scale to 0-100
      brainFogFrequency,
      cognitiveReserve: this.calculateCognitiveReserve(recentMoodEntries, recentPainEntries)
    };
  }

  // Digital Pacing System Implementation
  async calculateDigitalPacing(
    userId: string, 
    painEntries: PainEntry[], 
    moodEntries: MoodEntry[]
  ): Promise<DigitalPacingSystem> {
    const energyData = this.energyData.get(userId) || [];
    
    return {
      energyManagement: await this.calculateEnergyManagement(userId, energyData, painEntries, moodEntries),
      activitySuggestions: await this.generateActivitySuggestions(userId, painEntries, moodEntries),
      recoveryOptimization: await this.calculateRecoveryOptimization(userId, painEntries, moodEntries),
      smartNotifications: await this.generateSmartNotifications(userId, painEntries, moodEntries)
    };
  }

  // Energy management calculations
  private async calculateEnergyManagement(
    userId: string, 
    energyData: EnergyDataPoint[], 
    painEntries: PainEntry[], 
    moodEntries: MoodEntry[]
  ) {
    const currentEnergy = await this.estimateCurrentEnergyLevel(userId, painEntries, moodEntries);
    const trends = this.calculateEnergyTrends(energyData);
    
    return {
      currentEnergyLevel: currentEnergy,
      energyTrends: trends,
      energyBudget: this.calculateEnergyBudget(currentEnergy, trends),
      spoonTheory: this.calculateSpoonTheory(currentEnergy, painEntries),
      batteryAnalogy: this.calculateBatteryMetrics(currentEnergy, moodEntries)
    };
  }

  // Activity suggestions based on current state
  private async generateActivitySuggestions(
    userId: string, 
    painEntries: PainEntry[], 
    moodEntries: MoodEntry[]
  ): Promise<{
    currentRecommendations: ActivityRecommendation[];
    adaptiveScheduling: ScheduleAdaptation[];
    paceAdjustments: PaceAdjustment[];
    restReminders: RestReminder[];
  }> {
    const currentPain = this.getCurrentPainLevel(painEntries);
    const currentMood = this.getCurrentMood(moodEntries);
    const currentEnergy = await this.estimateCurrentEnergyLevel(userId, painEntries, moodEntries);

    return {
      currentRecommendations: this.generateCurrentRecommendations(currentPain, currentMood, currentEnergy),
      adaptiveScheduling: this.generateAdaptiveScheduling(userId, currentPain, currentEnergy),
      paceAdjustments: this.generatePaceAdjustments(currentPain, currentEnergy),
      restReminders: this.generateRestReminders(currentPain, currentEnergy, moodEntries)
    };
  }

  // Recovery optimization calculations
  private async calculateRecoveryOptimization(
    userId: string, 
    painEntries: PainEntry[], 
    moodEntries: MoodEntry[]
  ) {
    return {
      recoveryTime: this.calculateRecoveryTimeMetrics(painEntries, moodEntries),
      restQuality: this.calculateRestQualityMetrics(painEntries, moodEntries),
      sleepOptimization: this.calculateSleepOptimization(painEntries),
      stressRecovery: this.calculateStressRecoveryMetrics(moodEntries)
    };
  }

  // Smart notification generation
  private async generateSmartNotifications(
    userId: string, 
    painEntries: PainEntry[], 
    moodEntries: MoodEntry[]
  ): Promise<{
    pacingReminders: NotificationConfig[];
    energyAlerts: NotificationConfig[];
    recoveryPrompts: NotificationConfig[];
    achievementCelebrations: NotificationConfig[];
  }> {
    const currentPain = this.getCurrentPainLevel(painEntries);
    const currentEnergy = await this.estimateCurrentEnergyLevel(userId, painEntries, moodEntries);

    return {
      pacingReminders: this.generatePacingReminders(currentPain, currentEnergy),
      energyAlerts: this.generateEnergyAlerts(currentEnergy),
      recoveryPrompts: this.generateRecoveryPrompts(currentPain, moodEntries),
      achievementCelebrations: this.generateAchievementCelebrations(painEntries, moodEntries)
    };
  }

  // Helper methods for calculations
  private getRecentEntries(entries: PainEntry[], days: number): PainEntry[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return entries.filter(e => new Date(e.timestamp) >= cutoff);
  }

  private getRecentMoodEntries(entries: MoodEntry[], days: number): MoodEntry[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return entries.filter(e => e.timestamp >= cutoff);
  }

  private calculateLifeSatisfaction(avgPain: number, avgMood: number, avgSleep: number): number {
    // Combine pain (inverse), mood, and sleep quality
    const painImpact = Math.max(0, 100 - (avgPain * 10));
    const moodImpact = avgMood * 10;
    const sleepImpact = avgSleep * 10;
    
    return (painImpact * 0.4 + moodImpact * 0.4 + sleepImpact * 0.2);
  }

  private calculateMeaningAndPurpose(moodEntries: MoodEntry[], painEntries: PainEntry[]): number {
    // Based on hopefulness, goals, and meaningful activities
    const avgHopefulness = moodEntries.length > 0
      ? moodEntries.reduce((sum, e) => sum + e.hopefulness, 0) / moodEntries.length
      : 5;

    const meaningfulContexts = moodEntries.filter(e => 
      e.context.toLowerCase().includes('purpose') ||
      e.context.toLowerCase().includes('goal') ||
      e.context.toLowerCase().includes('meaningful') ||
      e.context.toLowerCase().includes('helping')
    ).length;

    const meaningBonus = Math.min(30, meaningfulContexts * 5);
    return Math.min(100, (avgHopefulness * 10) + meaningBonus);
  }

  private calculatePersonalGrowth(moodEntries: MoodEntry[]): number {
    // Based on self-efficacy trends and learning indicators
    if (moodEntries.length < 5) return 50;

    const recentSelfEfficacy = moodEntries.slice(-7).reduce((sum, e) => sum + e.selfEfficacy, 0) / 7;
    const olderSelfEfficacy = moodEntries.slice(-14, -7).reduce((sum, e) => sum + e.selfEfficacy, 0) / 7;
    
    const growthTrend = recentSelfEfficacy > olderSelfEfficacy ? 20 : 0;
    const baseScore = recentSelfEfficacy * 10;
    
    return Math.min(100, baseScore + growthTrend);
  }

  private calculateAutonomy(painEntries: PainEntry[], moodEntries: MoodEntry[]): number {
    // Based on decision-making capability and independence
    const avgSelfEfficacy = moodEntries.length > 0
      ? moodEntries.reduce((sum, e) => sum + e.selfEfficacy, 0) / moodEntries.length
      : 5;

    // Assess functional independence from pain entries
    const independenceFactors = painEntries.map(e => {
      const assistanceNeeded = e.functionalImpact.assistanceNeeded.length;
      const mobilityAids = e.functionalImpact.mobilityAids.length;
      return Math.max(0, 10 - assistanceNeeded - mobilityAids);
    });

    const avgIndependence = independenceFactors.length > 0
      ? independenceFactors.reduce((sum, val) => sum + val, 0) / independenceFactors.length
      : 5;

    return ((avgSelfEfficacy * 10) + (avgIndependence * 10)) / 2;
  }

  private calculateEnvironmentalMastery(painEntries: PainEntry[], moodEntries: MoodEntry[]): number {
    // Based on adaptation and environmental control
    const avgEmotionalRegulation = moodEntries.length > 0
      ? moodEntries.reduce((sum, e) => sum + e.emotionalRegulation, 0) / moodEntries.length
      : 5;

    const adaptationStrategies = new Set();
    moodEntries.forEach(e => {
      e.copingStrategies.forEach(strategy => adaptationStrategies.add(strategy));
    });

    const strategyBonus = Math.min(30, adaptationStrategies.size * 5);
    return Math.min(100, (avgEmotionalRegulation * 10) + strategyBonus);
  }

  private calculatePositiveRelations(moodEntries: MoodEntry[]): number {
    const socialEntries = moodEntries.filter(e => e.socialSupport !== 'none');
    const socialFrequency = socialEntries.length / moodEntries.length;
    
    const avgSocialSupport = this.calculateAverageSocialSupport(socialEntries);
    
    return (socialFrequency * 50) + (avgSocialSupport * 0.5);
  }

  private assessDailyActivities(painEntries: PainEntry[]): FunctionalAssessment {
    const limitedActivities = painEntries.flatMap(e => e.functionalImpact.limitedActivities);
    const uniqueLimitations = new Set(limitedActivities);
    
    const independence = Math.max(0, 100 - (uniqueLimitations.size * 10));
    
    return {
      independence,
      assistanceNeeded: independence < 25 ? 'maximum' : independence < 50 ? 'moderate' : independence < 75 ? 'minimal' : 'none',
      adaptationsUsed: [], // Could be extracted from entries
      barriers: Array.from(uniqueLimitations),
      improvements: [], // Could be tracked over time
      goals: [] // Could be extracted from user input
    };
  }

  private assessMobility(painEntries: PainEntry[]): FunctionalAssessment {
    const mobilityAids = painEntries.flatMap(e => e.functionalImpact.mobilityAids);
    const uniqueAids = new Set(mobilityAids);
    
    const independence = Math.max(0, 100 - (uniqueAids.size * 15));
    
    return {
      independence,
      assistanceNeeded: independence < 25 ? 'maximum' : independence < 50 ? 'moderate' : independence < 75 ? 'minimal' : 'none',
      adaptationsUsed: Array.from(uniqueAids),
      barriers: [], // Could be location-based
      improvements: [],
      goals: []
    };
  }

  private assessCognitiveFunctioning(painEntries: PainEntry[]): FunctionalAssessment {
    // Estimate cognitive impact from pain levels and symptoms
    const cognitiveSymptoms = ['brain fog', 'confusion', 'memory', 'concentration'];
    const cognitiveImpact = painEntries.filter(e => 
      e.baselineData.symptoms.some(s => 
        cognitiveSymptoms.some(cs => s.toLowerCase().includes(cs))
      )
    ).length;

    const independence = Math.max(20, 100 - (cognitiveImpact * 5));
    
    return {
      independence,
      assistanceNeeded: independence < 40 ? 'moderate' : independence < 70 ? 'minimal' : 'none',
      adaptationsUsed: ['memory aids', 'simplified tasks'],
      barriers: ['cognitive fatigue', 'brain fog'],
      improvements: [],
      goals: []
    };
  }

  private assessCommunication(painEntries: PainEntry[]): FunctionalAssessment {
    // Based on social impact and functional limitations
    const socialImpact = painEntries.flatMap(e => e.qualityOfLife.socialImpact);
    const communicationBarriers = socialImpact.filter(impact => 
      impact.toLowerCase().includes('communication') || 
      impact.toLowerCase().includes('speaking') ||
      impact.toLowerCase().includes('expressing')
    ).length;

    const independence = Math.max(30, 100 - (communicationBarriers * 10));
    
    return {
      independence,
      assistanceNeeded: independence < 50 ? 'moderate' : independence < 80 ? 'minimal' : 'none',
      adaptationsUsed: [],
      barriers: socialImpact,
      improvements: [],
      goals: []
    };
  }

  private assessWorkCapacity(painEntries: PainEntry[]): FunctionalAssessment {
    const workLimitations = painEntries.flatMap(e => e.workImpact.workLimitations);
    const missedWork = painEntries.reduce((sum, e) => sum + e.workImpact.missedWork, 0);
    
    const independence = Math.max(0, 100 - (workLimitations.length * 5) - (missedWork * 2));
    
    return {
      independence,
      assistanceNeeded: independence < 25 ? 'maximum' : independence < 50 ? 'moderate' : independence < 75 ? 'minimal' : 'none',
      adaptationsUsed: painEntries.flatMap(e => e.workImpact.modifiedDuties),
      barriers: workLimitations,
      improvements: [],
      goals: []
    };
  }

  private calculateAverageSocialSupport(socialEntries: MoodEntry[]): number {
    if (socialEntries.length === 0) return 25;
    
    const supportValues = { minimal: 25, moderate: 60, strong: 90 };
    return socialEntries.reduce((sum, e) => {
      const value = supportValues[e.socialSupport as keyof typeof supportValues] || 25;
      return sum + value;
    }, 0) / socialEntries.length;
  }

  private estimateNetworkSize(moodEntries: MoodEntry[]): number {
    // Estimate based on social interaction patterns
    const socialContexts = new Set();
    moodEntries.forEach(e => {
      if (e.socialSupport !== 'none') {
        socialContexts.add(e.context);
      }
    });
    
    return Math.min(50, socialContexts.size * 2); // Rough estimation
  }

  private calculateCommunityInvolvement(moodEntries: MoodEntry[]): number {
    const communityContexts = moodEntries.filter(e => 
      e.context.toLowerCase().includes('community') ||
      e.context.toLowerCase().includes('group') ||
      e.context.toLowerCase().includes('volunteer') ||
      e.context.toLowerCase().includes('church') ||
      e.context.toLowerCase().includes('club')
    ).length;

    return Math.min(100, (communityContexts / moodEntries.length) * 200);
  }

  private calculateBelongingness(moodEntries: MoodEntry[]): number {
    const belongingContexts = moodEntries.filter(e => 
      e.notes.toLowerCase().includes('belong') ||
      e.notes.toLowerCase().includes('accepted') ||
      e.notes.toLowerCase().includes('welcomed') ||
      e.context.toLowerCase().includes('family') ||
      e.context.toLowerCase().includes('friends')
    ).length;

    const socialSupport = this.calculateAverageSocialSupport(
      moodEntries.filter(e => e.socialSupport !== 'none')
    );

    return (belongingContexts / moodEntries.length * 50) + (socialSupport * 0.5);
  }

  private calculateCognitiveReserve(moodEntries: MoodEntry[], painEntries: PainEntry[]): number {
    // Based on adaptability, learning, and resilience
    const copingStrategies = new Set();
    moodEntries.forEach(e => {
      e.copingStrategies.forEach(strategy => copingStrategies.add(strategy));
    });

    const adaptabilityScore = Math.min(40, copingStrategies.size * 5);
    
    const avgEmotionalClarity = moodEntries.length > 0
      ? moodEntries.reduce((sum, e) => sum + e.emotionalClarity, 0) / moodEntries.length
      : 5;

    const clarityScore = avgEmotionalClarity * 10;
    
    return Math.min(100, adaptabilityScore + clarityScore + 20); // Base reserve
  }

  // Energy and pacing helper methods
  private async estimateCurrentEnergyLevel(
    userId: string, 
    painEntries: PainEntry[], 
    moodEntries: MoodEntry[]
  ): Promise<number> {
    const recentPain = this.getCurrentPainLevel(painEntries);
    const recentMood = this.getCurrentMood(moodEntries);
    const recentEnergy = moodEntries.length > 0 ? moodEntries[moodEntries.length - 1].energy : 5;
    
    // Combine factors
    const painFactor = Math.max(0, 100 - (recentPain * 10));
    const moodFactor = recentMood * 10;
    const energyFactor = recentEnergy * 10;
    
    return (painFactor * 0.4 + moodFactor * 0.3 + energyFactor * 0.3);
  }

  private calculateEnergyTrends(energyData: EnergyDataPoint[]): EnergyDataPoint[] {
    // Return recent trend data with predictions
    const recentData = energyData.slice(-20); // Last 20 data points
    
    // Add simple prediction for next energy level
    return recentData.map(point => ({
      ...point,
      predictedNext: this.predictNextEnergyLevel(point, recentData)
    }));
  }

  private predictNextEnergyLevel(current: EnergyDataPoint, history: EnergyDataPoint[]): number {
    // Simple prediction based on recent trends
    if (history.length < 3) return current.energyLevel;
    
    const recent = history.slice(-3);
    const trend = recent[recent.length - 1].energyLevel - recent[0].energyLevel;
    
    return Math.max(0, Math.min(100, current.energyLevel + (trend * 0.5)));
  }

  private calculateEnergyBudget(currentEnergy: number, trends: EnergyDataPoint[]): EnergyBudget {
    const totalEnergy = Math.max(20, currentEnergy);
    const used = Math.max(0, 100 - currentEnergy);
    const reserved = totalEnergy * 0.3; // Reserve 30% for essential activities
    const flexible = Math.max(0, totalEnergy - reserved);

    return {
      daily: {
        total: totalEnergy,
        used,
        reserved,
        flexible
      },
      weekly: {
        pattern: {
          'Monday': totalEnergy * 0.9,
          'Tuesday': totalEnergy * 0.8,
          'Wednesday': totalEnergy * 0.7,
          'Thursday': totalEnergy * 0.8,
          'Friday': totalEnergy * 0.9,
          'Saturday': totalEnergy * 1.1,
          'Sunday': totalEnergy * 1.0
        },
        adjustments: {},
        carryOver: 0
      }
    };
  }

  private calculateSpoonTheory(currentEnergy: number, painEntries: PainEntry[]): SpoonTracker {
    const totalSpoons = Math.floor(currentEnergy / 10); // Convert energy to spoons
    const recentPain = this.getCurrentPainLevel(painEntries);
    const usedSpoons = Math.floor(recentPain / 2); // Pain uses spoons

    return {
      totalSpoons,
      usedSpoons,
      activityCosts: {
        'shower': 2,
        'cooking': 3,
        'groceries': 4,
        'work': 5,
        'socializing': 3,
        'exercise': 4,
        'cleaning': 3
      },
      predictions: {
        'shower': 2,
        'cooking': 3,
        'groceries': 4,
        'work': 5,
        'socializing': 3,
        'exercise': 4,
        'cleaning': 3
      },
      adaptations: [
        'Break tasks into smaller parts',
        'Use energy-saving devices',
        'Ask for help with high-cost activities',
        'Schedule high-cost activities for high-energy times'
      ]
    };
  }

  private calculateBatteryMetrics(currentEnergy: number, moodEntries: MoodEntry[]): BatteryMetrics {
    const recentMood = this.getCurrentMood(moodEntries);
    
    return {
      currentCharge: currentEnergy,
      chargingActivities: [
        'Rest', 'Gentle movement', 'Nature time', 
        'Social connection', 'Creative activities', 'Meditation'
      ],
      drainingActivities: [
        'Stress', 'Overexertion', 'Poor sleep', 
        'Conflict', 'Overwhelming environments', 'Pain flares'
      ],
      chargingRate: Math.max(1, recentMood), // Mood affects recovery rate
      depletionRate: Math.max(1, 10 - recentMood), // Inverse of mood
      optimalCharging: [
        'Power naps (20-30 minutes)',
        'Gentle stretching',
        'Breathing exercises',
        'Listening to music',
        'Light reading'
      ]
    };
  }

  // Activity recommendation methods
  private generateCurrentRecommendations(
    currentPain: number, 
    currentMood: number, 
    currentEnergy: number
  ): ActivityRecommendation[] {
    const recommendations: ActivityRecommendation[] = [];

    if (currentEnergy > 70 && currentPain < 5) {
      recommendations.push({
        activity: 'Gentle Exercise',
        type: 'physical',
        energyCost: 30,
        painRisk: 'low',
        benefits: ['Improved mood', 'Better sleep', 'Endorphin release'],
        adaptations: ['Start slowly', 'Listen to your body', 'Stop if pain increases'],
        timing: 'morning',
        duration: 30,
        confidence: 85
      });
    }

    if (currentMood < 5 && currentEnergy > 30) {
      recommendations.push({
        activity: 'Social Connection',
        type: 'social',
        energyCost: 25,
        painRisk: 'low',
        benefits: ['Improved mood', 'Emotional support', 'Sense of belonging'],
        adaptations: ['Choose supportive people', 'Set boundaries', 'Keep it brief if needed'],
        timing: 'flexible',
        duration: 45,
        confidence: 75
      });
    }

    if (currentEnergy < 40) {
      recommendations.push({
        activity: 'Restorative Rest',
        type: 'restful',
        energyCost: 0,
        painRisk: 'low',
        benefits: ['Energy restoration', 'Pain relief', 'Stress reduction'],
        adaptations: ['Create comfortable environment', 'Use heat/cold therapy', 'Practice mindfulness'],
        timing: 'flexible',
        duration: 60,
        confidence: 95
      });
    }

    return recommendations;
  }

  private generateAdaptiveScheduling(
    userId: string, 
    currentPain: number, 
    currentEnergy: number
  ): ScheduleAdaptation[] {
    const adaptations: ScheduleAdaptation[] = [];

    if (currentEnergy < 50) {
      const now = new Date();
      const later = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

      adaptations.push({
        timeBlock: { start: now, end: later },
        originalPlan: 'Planned activities',
        adaptation: 'Reduce activity intensity and duration',
        reason: 'Low energy levels detected',
        energyImpact: 20,
        painImpact: -1,
        acceptanceStatus: 'suggested'
      });
    }

    return adaptations;
  }

  private generatePaceAdjustments(currentPain: number, currentEnergy: number): PaceAdjustment[] {
    const adjustments: PaceAdjustment[] = [];

    if (currentPain > 6 || currentEnergy < 40) {
      adjustments.push({
        activity: 'Daily tasks',
        originalDuration: 60,
        suggestedDuration: 90,
        reason: 'High pain or low energy levels',
        benefits: ['Reduced fatigue', 'Better pain management', 'Maintained productivity'],
        implementation: ['Take breaks every 15 minutes', 'Split tasks across the day', 'Use energy-saving techniques']
      });
    }

    return adjustments;
  }

  private generateRestReminders(
    currentPain: number, 
    currentEnergy: number, 
    moodEntries: MoodEntry[]
  ): RestReminder[] {
    const reminders: RestReminder[] = [];

    if (currentEnergy < 30) {
      reminders.push({
        trigger: 'energy_based',
        message: 'Your energy is running low. Consider taking a rest break.',
        urgency: 'high',
        restType: 'extended_rest',
        duration: 30,
        activities: ['Lie down', 'Deep breathing', 'Listen to calming music']
      });
    }

    if (currentPain > 7) {
      reminders.push({
        trigger: 'symptom_based',
        message: 'High pain levels detected. Time for pain management.',
        urgency: 'high',
        restType: 'short_rest',
        duration: 20,
        activities: ['Apply heat/cold', 'Gentle stretching', 'Medication if needed']
      });
    }

    return reminders;
  }

  // Recovery calculation methods
  private calculateRecoveryTimeMetrics(painEntries: PainEntry[], moodEntries: MoodEntry[]): RecoveryTimeMetrics {
    return {
      afterActivity: {
        'light_exercise': 60,
        'household_chores': 45,
        'social_activities': 30,
        'work_tasks': 90,
        'medical_appointments': 120
      },
      afterFlare: 180, // 3 hours average
      afterStress: 90, // 1.5 hours average
      sleepRecovery: 8, // 8 hours of sleep needed
      baseline: 60, // 1 hour normal recovery
      factors: [
        {
          factor: 'Pain level',
          impact: -20, // Higher pain = longer recovery
          confidence: 85,
          recommendations: ['Pain management', 'Gentle movement', 'Heat therapy']
        },
        {
          factor: 'Sleep quality',
          impact: 30, // Better sleep = faster recovery
          confidence: 90,
          recommendations: ['Sleep hygiene', 'Consistent schedule', 'Comfortable environment']
        }
      ]
    };
  }

  private calculateRestQualityMetrics(painEntries: PainEntry[], moodEntries: MoodEntry[]): RestQualityMetrics {
    const avgSleepQuality = painEntries.length > 0
      ? painEntries.reduce((sum, e) => sum + e.qualityOfLife.sleepQuality, 0) / painEntries.length
      : 5;

    return {
      restfulness: avgSleepQuality * 10,
      interruptions: Math.max(0, 5 - avgSleepQuality), // Inverse relationship
      restTypes: {
        'power_nap': 80,
        'meditation': 75,
        'quiet_time': 70,
        'nature_rest': 85
      },
      environment: 'Quiet, comfortable, temperature-controlled',
      timing: 'When energy drops below 40%',
      duration: 20 // minutes
    };
  }

  private calculateSleepOptimization(painEntries: PainEntry[]): SleepMetrics {
    const recentEntries = this.getRecentEntries(painEntries, 7);
    
    const avgSleepQuality = recentEntries.length > 0
      ? recentEntries.reduce((sum, e) => sum + e.qualityOfLife.sleepQuality, 0) / recentEntries.length
      : 5;

    const avgPain = recentEntries.length > 0
      ? recentEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / recentEntries.length
      : 5;

    return {
      quality: avgSleepQuality * 10,
      duration: Math.max(6, 10 - avgPain), // Higher pain = less sleep
      efficiency: Math.max(50, avgSleepQuality * 15),
      restfulness: avgSleepQuality * 10,
      painImpact: avgPain,
      recovery: Math.max(30, 100 - (avgPain * 10)),
      recommendations: [
        'Maintain consistent sleep schedule',
        'Use pain management before bed',
        'Create comfortable sleep environment',
        'Limit screen time before bed'
      ]
    };
  }

  private calculateStressRecoveryMetrics(moodEntries: MoodEntry[]): StressRecoveryMetrics {
    const recentEntries = this.getRecentMoodEntries(moodEntries, 7);
    
    const avgStress = recentEntries.length > 0
      ? recentEntries.reduce((sum, e) => sum + e.stress, 0) / recentEntries.length
      : 5;

    const copingStrategiesSet = new Set<string>();
    recentEntries.forEach(e => {
      e.copingStrategies.forEach((strategy: string) => copingStrategiesSet.add(strategy));
    });

    return {
      recoveryTime: Math.max(15, avgStress * 10), // Higher stress = longer recovery
  strategies: Array.from(copingStrategiesSet.values()),
      effectiveness: {
        'deep_breathing': 85,
        'meditation': 80,
        'exercise': 75,
        'social_support': 70,
        'nature_time': 85
      },
      physicalSigns: ['Muscle tension', 'Headache', 'Fatigue'],
      emotionalSigns: ['Irritability', 'Anxiety', 'Overwhelm'],
      behavioralSigns: ['Restlessness', 'Sleep changes', 'Appetite changes']
    };
  }

  // Notification generation methods
  private generatePacingReminders(currentPain: number, currentEnergy: number): NotificationConfig[] {
    const reminders: NotificationConfig[] = [];

    if (currentEnergy < 40) {
      reminders.push({
        id: 'energy-low',
        type: 'pacing',
        message: 'Your energy is running low. Consider pacing yourself.',
        enabled: true,
        frequency: 'as_needed',
        conditions: ['energy < 40'],
        customization: {
          tone: 'gentle',
          timing: 'immediate',
          personalization: ['energy-aware', 'supportive']
        }
      });
    }

    return reminders;
  }

  private generateEnergyAlerts(currentEnergy: number): NotificationConfig[] {
    const alerts: NotificationConfig[] = [];

    if (currentEnergy < 25) {
      alerts.push({
        id: 'energy-critical',
        type: 'energy_alert',
        message: 'Energy levels are critically low. Rest is strongly recommended.',
        enabled: true,
        frequency: 'immediate',
        conditions: ['energy < 25'],
        customization: {
          tone: 'gentle',
          timing: 'immediate',
          personalization: ['urgent', 'caring']
        }
      });
    }

    return alerts;
  }

  private generateRecoveryPrompts(currentPain: number, moodEntries: MoodEntry[]): NotificationConfig[] {
    const prompts: NotificationConfig[] = [];

    if (currentPain > 7) {
      prompts.push({
        id: 'recovery-high-pain',
        type: 'recovery_prompt',
        message: 'High pain detected. Would you like some recovery suggestions?',
        enabled: true,
        frequency: 'as_needed',
        conditions: ['pain > 7'],
        customization: {
          tone: 'gentle',
          timing: 'immediate',
          personalization: ['pain-aware', 'helpful']
        }
      });
    }

    return prompts;
  }

  private generateAchievementCelebrations(painEntries: PainEntry[], moodEntries: MoodEntry[]): NotificationConfig[] {
    const celebrations: NotificationConfig[] = [];

    // Check for consecutive days of tracking
    const recentDays = Math.min(painEntries.length, 7);
    if (recentDays >= 3) {
      celebrations.push({
        id: 'tracking-streak',
        type: 'achievement',
        message: `Wonderful! You've tracked for ${recentDays} days in a row. Your commitment to self-care is inspiring!`,
        enabled: true,
        frequency: 'as_needed',
        conditions: ['tracking_streak >= 3'],
        customization: {
          tone: 'celebratory',
          timing: 'optimal',
          personalization: ['encouraging', 'proud']
        }
      });
    }

    return celebrations;
  }

  // Utility methods
  private getCurrentPainLevel(painEntries: PainEntry[]): number {
    return painEntries.length > 0 ? painEntries[painEntries.length - 1].baselineData.pain : 5;
  }

  private getCurrentMood(moodEntries: MoodEntry[]): number {
    return moodEntries.length > 0 ? moodEntries[moodEntries.length - 1].mood : 5;
  }
}

// Export singleton instance
export const holisticWellbeingService = new HolisticWellbeingService();
