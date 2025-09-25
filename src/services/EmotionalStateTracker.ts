/**
 * Enhanced Emotional State Tracking Service
 * Comprehensive emotional intelligence and state monitoring system
 */

import { 
  EmotionalStateMetrics, 
  MoodEntry, 
  MoodSummary, 
  MoodPattern,
  EmotionalTrigger,
  TriggerPattern,
  RecoveryMetric,
  CopingEffectiveness 
} from '../types/quantified-empathy';
import type { PainEntry } from '../types';

export class EmotionalStateTracker {
  private moodEntries: Map<string, MoodEntry[]> = new Map();
  private triggerDatabase: Map<string, EmotionalTrigger[]> = new Map();
  private recoveryData: Map<string, RecoveryMetric[]> = new Map();
  private copingStrategies: Map<string, CopingEffectiveness[]> = new Map();

  // Track a new mood entry
  async addMoodEntry(userId: string, entry: Omit<MoodEntry, 'timestamp'>): Promise<MoodEntry> {
    const moodEntry: MoodEntry = {
      ...entry,
      timestamp: new Date()
    };

    const userEntries = this.moodEntries.get(userId) || [];
    userEntries.push(moodEntry);
    this.moodEntries.set(userId, userEntries);

    // Analyze for patterns and triggers
    this.analyzeEmotionalPatterns(userId, moodEntry);

    return moodEntry;
  }

  // Calculate comprehensive emotional state metrics
  async calculateEmotionalStateMetrics(userId: string, painEntries: PainEntry[]): Promise<EmotionalStateMetrics> {
    const moodEntries = this.moodEntries.get(userId) || [];
    
    return {
      moodPatterns: await this.analyzeMoodPatterns(userId, moodEntries),
      emotionalTriggers: await this.analyzeEmotionalTriggers(userId, moodEntries, painEntries),
      emotionalRecovery: await this.calculateEmotionalRecovery(userId, moodEntries),
      socialEmotionalHealth: await this.assessSocialEmotionalHealth(userId, moodEntries)
    };
  }

  // Analyze mood patterns over time
  private async analyzeMoodPatterns(userId: string, entries: MoodEntry[]) {
    const now = new Date();
    const recentEntries = entries.filter(e => 
      (now.getTime() - e.timestamp.getTime()) < (7 * 24 * 60 * 60 * 1000) // Last 7 days
    );

    const current = recentEntries.length > 0 ? recentEntries[recentEntries.length - 1] : this.getDefaultMoodEntry();
    
    return {
      current,
      dailyTrends: this.calculateDailyTrends(entries),
      weeklyAverages: this.calculateWeeklyAverages(entries),
      monthlyTrends: this.calculateMonthlyTrends(entries),
      seasonalPatterns: this.identifySeasonalPatterns(entries)
    };
  }

  // Analyze emotional triggers and patterns
  private async analyzeEmotionalTriggers(userId: string, moodEntries: MoodEntry[], painEntries: PainEntry[]) {
    const triggers = this.identifyTriggers(moodEntries, painEntries);
    const patterns = this.analyzeTriggerPatterns(triggers, moodEntries);
    const recoveryTimes = this.calculateRecoveryTimes(userId, moodEntries);
    const copingEffectiveness = this.analyzeCopingEffectiveness(userId, moodEntries);

    return {
      identified: triggers,
      patterns,
      recoveryTimes,
      copingEffectiveness
    };
  }

  // Calculate emotional recovery metrics
  private async calculateEmotionalRecovery(userId: string, entries: MoodEntry[]) {
    const recoveryData = this.recoveryData.get(userId) || [];
    
    const baseline = this.calculateEmotionalBaseline(entries);
    const avgRecoveryTime = recoveryData.length > 0 
      ? recoveryData.reduce((sum, r) => sum + r.recoveryTimeMinutes, 0) / recoveryData.length 
      : 60;

    return {
      baseline,
      recoveryTime: avgRecoveryTime,
      resilienceScore: this.calculateResilienceScore(entries, recoveryData),
      adaptabilityIndex: this.calculateAdaptabilityIndex(entries)
    };
  }

  // Assess social emotional health
  private async assessSocialEmotionalHealth(userId: string, entries: MoodEntry[]) {
    return {
      connectionQuality: this.calculateConnectionQuality(entries),
      supportSystemStrength: this.calculateSupportSystemStrength(entries),
      communicationEffectiveness: this.calculateCommunicationEffectiveness(entries),
      empathyReceived: this.calculateEmpathyReceived(entries),
      empathyGiven: this.calculateEmpathyGiven(entries)
    };
  }

  // Helper methods for pattern analysis
  private calculateDailyTrends(entries: MoodEntry[]): MoodEntry[] {
    const last7Days = entries.filter(e => {
      const daysDiff = (Date.now() - e.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });

    return last7Days.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private calculateWeeklyAverages(entries: MoodEntry[]): MoodSummary[] {
    const weeklyData: { [week: string]: MoodEntry[] } = {};
    
    entries.forEach(entry => {
      const week = this.getWeekKey(entry.timestamp);
      if (!weeklyData[week]) weeklyData[week] = [];
      weeklyData[week].push(entry);
    });

    return Object.entries(weeklyData).map(([week, weekEntries]) => {
      const startOfWeek = this.getWeekStart(week);
      const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);

      return {
        period: { start: startOfWeek, end: endOfWeek },
        averages: this.calculateAverages(weekEntries),
        improvements: this.identifyImprovements(weekEntries),
        challenges: this.identifyChallenges(weekEntries),
        insights: this.generateInsights(weekEntries)
      };
    });
  }

  private calculateMonthlyTrends(entries: MoodEntry[]): MoodSummary[] {
    const monthlyData: { [month: string]: MoodEntry[] } = {};
    
    entries.forEach(entry => {
      const month = `${entry.timestamp.getFullYear()}-${entry.timestamp.getMonth()}`;
      if (!monthlyData[month]) monthlyData[month] = [];
      monthlyData[month].push(entry);
    });

    return Object.entries(monthlyData).map(([month, monthEntries]) => {
      const [year, monthNum] = month.split('-').map(Number);
      const start = new Date(year, monthNum, 1);
      const end = new Date(year, monthNum + 1, 0);

      return {
        period: { start, end },
        averages: this.calculateAverages(monthEntries),
        improvements: this.identifyImprovements(monthEntries),
        challenges: this.identifyChallenges(monthEntries),
        insights: this.generateInsights(monthEntries)
      };
    });
  }

  private identifySeasonalPatterns(entries: MoodEntry[]): MoodPattern[] {
    const patterns: MoodPattern[] = [];

    // Analyze seasonal mood patterns
    const seasonalData = this.groupBySeason(entries);
    
    Object.entries(seasonalData).forEach(([season, seasonEntries]) => {
      const avgMood = seasonEntries.reduce((sum, e) => sum + e.mood, 0) / seasonEntries.length;
      const overallAvg = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
      
      if (Math.abs(avgMood - overallAvg) > 0.5) {
        patterns.push({
          type: 'seasonal',
          name: `${season} Pattern`,
          description: avgMood > overallAvg 
            ? `Mood tends to be better during ${season}`
            : `Mood tends to be lower during ${season}`,
          correlation: (avgMood - overallAvg) / 5, // Normalize to -1 to 1
          confidence: Math.min(95, seasonEntries.length * 2), // More data = higher confidence
          recommendations: this.generateSeasonalRecommendations(season)
        });
      }
    });

    return patterns;
  }

  // Backward compatibility shim (legacy name kept for older callers)
  // Deprecated: use analyzeMoodPatterns instead
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async analyzeEmotionalPatterns(userId: string, _latestEntry?: MoodEntry) {
    const entries = this.moodEntries.get(userId) || [];
    return this.analyzeMoodPatterns(userId, entries);
  }

  private identifyTriggers(moodEntries: MoodEntry[], painEntries: PainEntry[]): EmotionalTrigger[] {
    const triggers: EmotionalTrigger[] = [];
    
    // Analyze mood drops and their potential causes
    for (let i = 1; i < moodEntries.length; i++) {
      const current = moodEntries[i];
      const previous = moodEntries[i - 1];
      
      const moodDrop = previous.mood - current.mood;
      if (moodDrop >= 2) { // Significant mood drop
        // Look for corresponding pain entries
        const painEntry = painEntries.find(p => 
          Math.abs(new Date(p.timestamp).getTime() - current.timestamp.getTime()) < 2 * 60 * 60 * 1000 // Within 2 hours
        );

        if (painEntry && painEntry.baselineData.pain >= 6) {
          triggers.push({
            id: `pain-trigger-${current.timestamp.getTime()}`,
            name: 'Pain Flare',
            type: 'pain_flare',
            severity: painEntry.baselineData.pain >= 8 ? 'severe' : 'moderate',
            frequency: this.calculateTriggerFrequency('pain_flare', moodEntries),
            emotionalImpact: moodDrop,
            lastOccurrence: current.timestamp,
            description: `Pain level ${painEntry.baselineData.pain}/10 caused mood drop from ${previous.mood} to ${current.mood}`,
            warningSignsIdentified: painEntry.baselineData.symptoms ?? [],
            preventionStrategies: ['Pain management', 'Stress reduction', 'Preventive rest']
          });
        }

        // Analyze context for other triggers
        if (current.triggers.length > 0) {
          current.triggers.forEach(trigger => {
            triggers.push({
              id: `trigger-${current.timestamp.getTime()}-${trigger}`,
              name: trigger,
              type: this.categorizeTrigger(trigger),
              severity: moodDrop >= 3 ? 'severe' : 'moderate',
              frequency: this.calculateTriggerFrequency(trigger, moodEntries),
              emotionalImpact: moodDrop,
              lastOccurrence: current.timestamp,
              description: `${trigger} caused mood drop from ${previous.mood} to ${current.mood}`,
              warningSignsIdentified: this.identifyWarningSigns(),
              preventionStrategies: this.generatePreventionStrategies(trigger)
            });
          });
        }
      }
    }

    return triggers;
  }

  private analyzeTriggerPatterns(triggers: EmotionalTrigger[], moodEntries: MoodEntry[]): TriggerPattern[] {
    const patterns: TriggerPattern[] = [];
    
    const triggerTypes = [...new Set(triggers.map(t => t.type))];
    
    triggerTypes.forEach(type => {
      const typeTriggers = triggers.filter(t => t.type === type);
      const relatedEntries = moodEntries.filter(e => 
        typeTriggers.some(t => 
          Math.abs(t.lastOccurrence.getTime() - e.timestamp.getTime()) < 60 * 60 * 1000 // Within 1 hour
        )
      );

      patterns.push({
        triggerType: type,
        timePatterns: this.analyzeTimePatterns(relatedEntries),
        contextualFactors: this.analyzeContextualFactors(relatedEntries),
  predictiveIndicators: this.identifyPredictiveIndicators()
      });
    });

    return patterns;
  }

  private calculateRecoveryTimes(_userId: string, entries: MoodEntry[]): RecoveryMetric[] {
    const recoveryMetrics: RecoveryMetric[] = [];
    
    for (let i = 1; i < entries.length - 1; i++) {
      const current = entries[i];
      const previous = entries[i - 1];
      const next = entries[i + 1];
      
      // Look for recovery patterns (mood improvement after drop)
      if (previous.mood > current.mood && next.mood > current.mood) {
        const moodDrop = previous.mood - current.mood;
        const moodRecovery = next.mood - current.mood;
        
        if (moodDrop >= 1.5 && moodRecovery >= 1) {
          const recoveryTime = (next.timestamp.getTime() - current.timestamp.getTime()) / (1000 * 60); // minutes
          
          recoveryMetrics.push({
            triggerEvent: current.triggers.join(', ') || 'Unknown trigger',
            recoveryTimeMinutes: recoveryTime,
            strategiesUsed: current.copingStrategies,
            effectiveness: (moodRecovery / moodDrop) * 10, // Scale to 1-10
            supportReceived: current.socialSupport !== 'none',
            baseline: previous.mood,
            lowest: current.mood,
            recovered: next.mood,
            timestamp: current.timestamp
          });
        }
      }
    }

    return recoveryMetrics;
  }

  private analyzeCopingEffectiveness(_userId: string, entries: MoodEntry[]): CopingEffectiveness[] {
    const strategyData: { [strategy: string]: { uses: number; totalEffectiveness: number; contexts: Set<string> } } = {};
    
    entries.forEach(entry => {
      entry.copingStrategies.forEach(strategy => {
        if (!strategyData[strategy]) {
          strategyData[strategy] = { uses: 0, totalEffectiveness: 0, contexts: new Set() };
        }
        
        strategyData[strategy].uses++;
        strategyData[strategy].totalEffectiveness += entry.mood;
        strategyData[strategy].contexts.add(entry.context);
      });
    });

    return Object.entries(strategyData).map(([strategy, data]) => ({
      strategy,
      usageFrequency: data.uses / 4, // Assuming weekly tracking
      effectiveness: data.totalEffectiveness / data.uses,
      contexts: Array.from(data.contexts),
      timeToEffect: 30, // Default estimate, could be tracked more precisely
      sideEffects: [], // Could be tracked in future versions
      personalizedNotes: `Used ${data.uses} times across various contexts`
    }));
  }

  // Helper methods for calculations
  private calculateEmotionalBaseline(entries: MoodEntry[]): number {
    if (entries.length === 0) return 50;
    
    const recentEntries = entries.slice(-30); // Last 30 entries
    const moodSum = recentEntries.reduce((sum, entry) => {
      return sum + (entry.mood + entry.energy + (10 - entry.anxiety) + (10 - entry.stress) + entry.hopefulness + entry.selfEfficacy);
    }, 0);
    
    return (moodSum / (recentEntries.length * 6)) * 10; // Convert to 0-100 scale
  }

  private calculateResilienceScore(_entries: MoodEntry[], recoveryData: RecoveryMetric[]): number {
    if (recoveryData.length === 0) return 50;
    
    const avgRecoveryTime = recoveryData.reduce((sum, r) => sum + r.recoveryTimeMinutes, 0) / recoveryData.length;
    const avgEffectiveness = recoveryData.reduce((sum, r) => sum + r.effectiveness, 0) / recoveryData.length;
    
    // Lower recovery time and higher effectiveness = higher resilience
    const timeScore = Math.max(0, 100 - (avgRecoveryTime / 10)); // 10 minutes = 90 points
    const effectivenessScore = avgEffectiveness * 10; // Scale to 0-100
    
    return (timeScore + effectivenessScore) / 2;
  }

  private calculateAdaptabilityIndex(entries: MoodEntry[]): number {
    if (entries.length < 10) return 50;
    
    // Measure how well mood stabilizes over time despite challenges
    const recentEntries = entries.slice(-20);
    const moodVariability = this.calculateVariability(recentEntries.map(e => e.mood));
    const contextDiversity = new Set(recentEntries.map(e => e.context)).size;
    
    // Lower variability despite diverse contexts = higher adaptability
    const stabilityScore = Math.max(0, 100 - (moodVariability * 20));
    const diversityBonus = Math.min(30, contextDiversity * 5);
    
    return Math.min(100, stabilityScore + diversityBonus);
  }

  private calculateConnectionQuality(entries: MoodEntry[]): number {
    const socialEntries = entries.filter(e => e.socialSupport !== 'none');
    if (socialEntries.length === 0) return 30;
    
    const supportStrengthMap: { [key in 'minimal' | 'moderate' | 'strong']: number } = { 
      minimal: 25, 
      moderate: 60, 
      strong: 90 
    };
    
    const avgSupport = socialEntries.reduce((sum, e) => {
      return sum + (e.socialSupport !== 'none' ? supportStrengthMap[e.socialSupport] : 0);
    }, 0) / socialEntries.length;
    
    return avgSupport;
  }

  private calculateSupportSystemStrength(entries: MoodEntry[]): number {
    const socialFrequency = entries.filter(e => e.socialSupport !== 'none').length / entries.length;
    const avgMoodWithSupport = this.calculateAverageMoodWithSupport(entries);
    const avgMoodWithoutSupport = this.calculateAverageMoodWithoutSupport(entries);
    
    const frequencyScore = socialFrequency * 50;
    const effectivenessScore = Math.max(0, (avgMoodWithSupport - avgMoodWithoutSupport)) * 10;
    
    return Math.min(100, frequencyScore + effectivenessScore);
  }

  private calculateCommunicationEffectiveness(entries: MoodEntry[]): number {
    // Analyze emotional clarity and regulation as proxies for communication
    const avgClarity = entries.reduce((sum, e) => sum + e.emotionalClarity, 0) / entries.length;
    const avgRegulation = entries.reduce((sum, e) => sum + e.emotionalRegulation, 0) / entries.length;
    
    return ((avgClarity + avgRegulation) / 2) * 10; // Scale to 0-100
  }

  private calculateEmpathyReceived(entries: MoodEntry[]): number {
    const supportedEntries = entries.filter(e => e.socialSupport === 'strong' || e.socialSupport === 'moderate');
    const empathyScore = supportedEntries.length / entries.length * 70; // Base score
    
    // Bonus for emotional improvement with support
    const improvementBonus = this.calculateSupportEffectivenessBonus(entries);
    
    return Math.min(100, empathyScore + improvementBonus);
  }

  private calculateEmpathyGiven(entries: MoodEntry[]): number {
    // Analyze patterns where user provided support (inferred from context and notes)
    const givingContexts = entries.filter(e => 
      e.context.toLowerCase().includes('helping') || 
      e.context.toLowerCase().includes('supporting') ||
      e.notes.toLowerCase().includes('helped') ||
      e.notes.toLowerCase().includes('listened')
    );
    
    return Math.min(100, (givingContexts.length / entries.length) * 200);
  }

  // Utility methods
  private getDefaultMoodEntry(): MoodEntry {
    return {
      timestamp: new Date(),
      mood: 5,
      energy: 5,
      anxiety: 5,
      stress: 5,
      hopefulness: 5,
      selfEfficacy: 5,
      emotionalClarity: 5,
      emotionalRegulation: 5,
      context: '',
      triggers: [],
      copingStrategies: [],
      socialSupport: 'none',
      notes: ''
    };
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = this.getWeekNumber(date);
    return `${year}-W${week}`;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private getWeekStart(weekKey: string): Date {
    const [year, week] = weekKey.split('-W').map(Number);
    const firstDayOfYear = new Date(year, 0, 1);
    const daysToAdd = (week - 1) * 7 - firstDayOfYear.getDay();
    return new Date(year, 0, 1 + daysToAdd);
  }

  private calculateAverages(entries: MoodEntry[]) {
    return {
      mood: entries.reduce((sum, e) => sum + e.mood, 0) / entries.length,
      energy: entries.reduce((sum, e) => sum + e.energy, 0) / entries.length,
      anxiety: entries.reduce((sum, e) => sum + e.anxiety, 0) / entries.length,
      stress: entries.reduce((sum, e) => sum + e.stress, 0) / entries.length,
      hopefulness: entries.reduce((sum, e) => sum + e.hopefulness, 0) / entries.length,
      selfEfficacy: entries.reduce((sum, e) => sum + e.selfEfficacy, 0) / entries.length
    };
  }

  private identifyImprovements(entries: MoodEntry[]): string[] {
    const improvements: string[] = [];
    const avgMood = entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
    
    if (avgMood >= 7) improvements.push('Sustained positive mood');
    if (entries.some(e => e.hopefulness >= 8)) improvements.push('High hopefulness periods');
    
    return improvements;
  }

  private identifyChallenges(entries: MoodEntry[]): string[] {
    const challenges: string[] = [];
    const avgStress = entries.reduce((sum, e) => sum + e.stress, 0) / entries.length;
    
    if (avgStress >= 7) challenges.push('High stress levels');
    if (entries.some(e => e.mood <= 3)) challenges.push('Low mood episodes');
    
    return challenges;
  }

  private generateInsights(entries: MoodEntry[]): string[] {
    const insights: string[] = [];
    
    const copingStrategies = [...new Set(entries.flatMap(e => e.copingStrategies))];
    if (copingStrategies.length > 0) {
      insights.push(`Using ${copingStrategies.length} different coping strategies`);
    }
    
    return insights;
  }

  private groupBySeason(entries: MoodEntry[]): { [season: string]: MoodEntry[] } {
    return entries.reduce((seasons, entry) => {
      const month = entry.timestamp.getMonth();
      let season: string;
      
      if (month >= 2 && month <= 4) season = 'Spring';
      else if (month >= 5 && month <= 7) season = 'Summer';
      else if (month >= 8 && month <= 10) season = 'Fall';
      else season = 'Winter';
      
      if (!seasons[season]) seasons[season] = [];
      seasons[season].push(entry);
      
      return seasons;
    }, {} as { [season: string]: MoodEntry[] });
  }

  private generateSeasonalRecommendations(season: string): string[] {
    const baseRecommendations: { [key: string]: string[] } = {
      'Spring': ['Light therapy', 'Outdoor activities', 'Allergy management'],
      'Summer': ['Heat management', 'Hydration focus', 'UV protection'],
      'Fall': ['Routine maintenance', 'Light therapy preparation', 'Seasonal transition support'],
      'Winter': ['Light therapy', 'Vitamin D', 'Indoor activities', 'Social connection']
    };
    
    return baseRecommendations[season] || [];
  }

  private categorizeTrigger(trigger: string): EmotionalTrigger['type'] {
    const lowerTrigger = trigger.toLowerCase();
    
    if (lowerTrigger.includes('pain') || lowerTrigger.includes('flare')) return 'pain_flare';
    if (lowerTrigger.includes('stress') || lowerTrigger.includes('work')) return 'stress_event';
    if (lowerTrigger.includes('social') || lowerTrigger.includes('people')) return 'social_interaction';
    if (lowerTrigger.includes('doctor') || lowerTrigger.includes('medical')) return 'medical_appointment';
    if (lowerTrigger.includes('weather') || lowerTrigger.includes('rain')) return 'weather';
    
    return 'other';
  }

  private calculateTriggerFrequency(trigger: string, entries: MoodEntry[]): number {
    const relevantEntries = entries.filter(e => 
      e.triggers.some(t => t.toLowerCase().includes(trigger.toLowerCase()))
    );
    
    return relevantEntries.length / 4; // Assuming monthly frequency calculation
  }

  private identifyWarningSigns(): string[] {
    // This would be more sophisticated in a real implementation
    return ['Increased stress', 'Sleep disturbance', 'Energy drop'];
  }

  private generatePreventionStrategies(trigger: string): string[] {
    const strategies = {
      'pain': ['Pain management', 'Preventive medication', 'Stress reduction'],
      'stress': ['Mindfulness', 'Time management', 'Boundary setting'],
      'social': ['Communication skills', 'Support system', 'Self-advocacy'],
      'medical': ['Preparation strategies', 'Support person', 'Question list'],
      'weather': ['Weather monitoring', 'Preventive measures', 'Indoor alternatives']
    };
    
    const lowerTrigger = trigger.toLowerCase();
    for (const [key, value] of Object.entries(strategies)) {
      if (lowerTrigger.includes(key)) return value;
    }
    
    return ['Self-care', 'Support system', 'Stress management'];
  }

  private analyzeTimePatterns(entries: MoodEntry[]) {
    const timeOfDay: { [hour: string]: number } = {};
    const dayOfWeek: { [day: string]: number } = {};
    const monthlyTrends: { [week: string]: number } = {};
    
    entries.forEach(entry => {
      const hour = entry.timestamp.getHours().toString();
      const day = entry.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
      const week = this.getWeekKey(entry.timestamp);
      
      timeOfDay[hour] = (timeOfDay[hour] || 0) + 1;
      dayOfWeek[day] = (dayOfWeek[day] || 0) + 1;
      monthlyTrends[week] = (monthlyTrends[week] || 0) + 1;
    });
    
    return { timeOfDay, dayOfWeek, monthlyTrends };
  }

  private analyzeContextualFactors(entries: MoodEntry[]) {
    return {
      painLevel: entries.map(e => e.stress), // Using stress as proxy for pain correlation
      stressLevel: entries.map(e => e.stress),
      socialContext: entries.map(e => e.socialSupport),
      environmentalFactors: entries.map(e => e.context)
    };
  }

  private identifyPredictiveIndicators() {
    return {
      earlyWarnings: ['Increased stress', 'Sleep changes', 'Mood drops'],
      behavioralChanges: ['Social withdrawal', 'Activity reduction', 'Coping strategy changes'],
      physiologicalSigns: ['Fatigue', 'Tension', 'Sleep disturbance']
    };
  }

  private calculateVariability(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateAverageMoodWithSupport(entries: MoodEntry[]): number {
    const supportedEntries = entries.filter(e => e.socialSupport !== 'none');
    return supportedEntries.length > 0 
      ? supportedEntries.reduce((sum, e) => sum + e.mood, 0) / supportedEntries.length 
      : 5;
  }

  private calculateAverageMoodWithoutSupport(entries: MoodEntry[]): number {
    const unsupportedEntries = entries.filter(e => e.socialSupport === 'none');
    return unsupportedEntries.length > 0 
      ? unsupportedEntries.reduce((sum, e) => sum + e.mood, 0) / unsupportedEntries.length 
      : 5;
  }

  private calculateSupportEffectivenessBonus(entries: MoodEntry[]): number {
    // Calculate mood improvement correlation with social support
    let improvementWithSupport = 0;
    let count = 0;
    
    for (let i = 1; i < entries.length; i++) {
      const current = entries[i];
      const previous = entries[i - 1];
      
      if (current.socialSupport !== 'none' && current.mood > previous.mood) {
        improvementWithSupport += (current.mood - previous.mood);
        count++;
      }
    }
    
    return count > 0 ? (improvementWithSupport / count) * 10 : 0;
  }
}

// Export singleton instance
export const emotionalStateTracker = new EmotionalStateTracker();
