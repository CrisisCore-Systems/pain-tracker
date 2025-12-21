/**
 * Real-Time Empathy Monitoring Service
 * Continuous empathy state tracking with micro-interactions and sentiment analysis
 */

import type { MicroEmpathyMoment } from '../types/quantified-empathy';

export interface RealTimeEmpathyConfig {
  monitoringInterval: number; // milliseconds
  sentimentAnalysisEnabled: boolean;
  microInteractionTracking: boolean;
  emotionalContagionDetection: boolean;
  empathyBurnoutPrevention: boolean;
  culturalContextAwareness: boolean;
}

export interface EmpathyStateSnapshot {
  timestamp: Date;
  empathyLevel: number; // 0-100
  empathyQuality: 'tender' | 'fierce' | 'tired' | 'energized' | 'overwhelmed' | 'boundaried';
  emotionalContagionRisk: number; // 0-100
  burnoutRisk: number; // 0-100
  microMoments: MicroEmpathyMoment[];
  contextualFactors: string[];
  aiConfidence: number; // 0-100
}

export interface RealTimeAlert {
  id: string;
  type:
    | 'empathy_overload'
    | 'empathy_depletion'
    | 'boundary_needed'
    | 'recovery_opportunity'
    | 'growth_moment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  recommendations: string[];
  autoResponse?: string;
  timestamp: Date;
}

export class RealTimeEmpathyMonitor {
  private config: RealTimeEmpathyConfig;
  private isMonitoring: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;
  private empathyStateHistory: Map<string, EmpathyStateSnapshot[]> = new Map();
  private activeAlerts: Map<string, RealTimeAlert[]> = new Map();
  private sentimentAnalyzer?: SentimentAnalyzer;
  private microInteractionTracker?: MicroInteractionTracker;
  private listeners: Map<string, ((snapshot: EmpathyStateSnapshot) => void)[]> = new Map();

  constructor(config: RealTimeEmpathyConfig) {
    this.config = config;

    if (config.sentimentAnalysisEnabled) {
      this.sentimentAnalyzer = new SentimentAnalyzer();
    }

    if (config.microInteractionTracking) {
      this.microInteractionTracker = new MicroInteractionTracker();
    }
  }

  /**
   * Start real-time empathy monitoring for a user
   */
  startMonitoring(userId: string): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    this.monitoringInterval = setInterval(async () => {
      try {
        const snapshot = await this.captureEmpathySnapshot(userId);
        this.processEmpathySnapshot(userId, snapshot);
        this.notifyListeners(userId, snapshot);
      } catch (error) {
        console.error('Error capturing empathy snapshot:', error);
      }
    }, this.config.monitoringInterval);

    console.log(`Real-time empathy monitoring started for user ${userId}`);
  }

  /**
   * Stop real-time monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    this.isMonitoring = false;
    console.log('Real-time empathy monitoring stopped');
  }

  /**
   * Add listener for empathy state changes
   */
  addStateListener(userId: string, callback: (snapshot: EmpathyStateSnapshot) => void): void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, []);
    }
    this.listeners.get(userId)!.push(callback);
  }

  /**
   * Remove state listener
   */
  removeStateListener(userId: string, callback: (snapshot: EmpathyStateSnapshot) => void): void {
    const userListeners = this.listeners.get(userId);
    if (userListeners) {
      const index = userListeners.indexOf(callback);
      if (index > -1) {
        userListeners.splice(index, 1);
      }
    }
  }

  /**
   * Get current empathy state for user
   */
  getCurrentEmpathyState(userId: string): EmpathyStateSnapshot | null {
    const history = this.empathyStateHistory.get(userId);
    return history && history.length > 0 ? history[history.length - 1] : null;
  }

  /**
   * Get empathy state history for user
   */
  getEmpathyStateHistory(userId: string, hours: number = 24): EmpathyStateSnapshot[] {
    const history = this.empathyStateHistory.get(userId) || [];
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return history.filter(snapshot => snapshot.timestamp >= cutoffTime);
  }

  /**
   * Get active alerts for user
   */
  getActiveAlerts(userId: string): RealTimeAlert[] {
    return this.activeAlerts.get(userId) || [];
  }

  /**
   * Dismiss alert
   */
  dismissAlert(userId: string, alertId: string): void {
    const alerts = this.activeAlerts.get(userId);
    if (alerts) {
      const index = alerts.findIndex(alert => alert.id === alertId);
      if (index > -1) {
        alerts.splice(index, 1);
      }
    }
  }

  /**
   * Track micro-empathy moment
   */
  async trackMicroEmpathyMoment(
    userId: string,
    interaction: {
      type: 'spontaneous' | 'requested' | 'reciprocal' | 'self-directed';
      trigger: string;
      response: string;
      duration: number;
      intensity: number;
    }
  ): Promise<void> {
    const microMoment: MicroEmpathyMoment = {
      timestamp: new Date(),
      duration: interaction.duration,
      intensity: interaction.intensity,
      type: interaction.type,
      trigger: interaction.trigger,
      response: interaction.response,
      effectOnOther: await this.assessEffectOnOther(interaction),
      effectOnSelf: await this.assessEffectOnSelf(interaction),
      qualityIndicators: await this.assessQualityIndicators(interaction),
    };

    // Add to current empathy state
    const currentState = this.getCurrentEmpathyState(userId);
    if (currentState) {
      currentState.microMoments.push(microMoment);
    }

    // Analyze for patterns and alerts
    await this.analyzeMicroMomentPatterns(userId, microMoment);
  }

  /**
   * Process text input for sentiment and empathy signals
   */
  async analyzeTextForEmpathy(
    userId: string,
    text: string,
    context: string
  ): Promise<{
    empathyLevel: number;
    sentiment: string;
    empathyIndicators: string[];
    concerns: string[];
  }> {
    if (!this.sentimentAnalyzer) {
      return {
        empathyLevel: 50,
        sentiment: 'neutral',
        empathyIndicators: [],
        concerns: [],
      };
    }

    return await this.sentimentAnalyzer.analyzeEmpathySignals(text, context);
  }

  // Private methods

  private async captureEmpathySnapshot(userId: string): Promise<EmpathyStateSnapshot> {
    // Simulate real-time empathy assessment
    // In a real implementation, this would integrate with various data sources

    const previousSnapshot = this.getCurrentEmpathyState(userId);
    const baseEmpathyLevel = previousSnapshot?.empathyLevel || 70;

    // Simulate natural variations and patterns
    const timeOfDay = new Date().getHours();
    const timeFactorAdjustment = this.getTimeBasedEmpathyAdjustment(timeOfDay);
    const randomVariation = (Math.random() - 0.5) * 10; // ±5 point variation

    const empathyLevel = Math.max(
      0,
      Math.min(100, baseEmpathyLevel + timeFactorAdjustment + randomVariation)
    );

    const snapshot: EmpathyStateSnapshot = {
      timestamp: new Date(),
      empathyLevel,
      empathyQuality: this.determineEmpathyQuality(empathyLevel, timeOfDay),
      emotionalContagionRisk: this.assessEmotionalContagionRisk(empathyLevel),
      burnoutRisk: this.assessBurnoutRisk(userId, empathyLevel),
      microMoments: [],
      contextualFactors: await this.identifyContextualFactors(userId, timeOfDay),
      aiConfidence: this.calculateAIConfidence(userId),
    };

    return snapshot;
  }

  private processEmpathySnapshot(userId: string, snapshot: EmpathyStateSnapshot): void {
    // Store snapshot in history
    if (!this.empathyStateHistory.has(userId)) {
      this.empathyStateHistory.set(userId, []);
    }
    const history = this.empathyStateHistory.get(userId)!;
    history.push(snapshot);

    // Keep only last 24 hours of data
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const filteredHistory = history.filter(s => s.timestamp >= cutoffTime);
    this.empathyStateHistory.set(userId, filteredHistory);

    // Check for alerts
    this.checkForAlerts(userId, snapshot);
  }

  private notifyListeners(userId: string, snapshot: EmpathyStateSnapshot): void {
    const listeners = this.listeners.get(userId) || [];
    listeners.forEach(callback => {
      try {
        callback(snapshot);
      } catch (error) {
        console.error('Error notifying empathy state listener:', error);
      }
    });
  }

  private getTimeBasedEmpathyAdjustment(hour: number): number {
    // Simulate circadian empathy patterns
    if (hour >= 6 && hour < 10) return 5; // Morning boost
    if (hour >= 10 && hour < 14) return 0; // Stable mid-morning to early afternoon
    if (hour >= 14 && hour < 18) return -3; // Afternoon dip
    if (hour >= 18 && hour < 22) return 2; // Evening recovery
    return -5; // Late night/early morning low
  }

  private determineEmpathyQuality(
    empathyLevel: number,
    timeOfDay: number
  ): EmpathyStateSnapshot['empathyQuality'] {
    if (empathyLevel > 85) return 'energized';
    if (empathyLevel > 70) return timeOfDay < 12 ? 'tender' : 'fierce';
    if (empathyLevel > 50) return 'boundaried';
    if (empathyLevel > 30) return 'tired';
    return 'overwhelmed';
  }

  private assessEmotionalContagionRisk(empathyLevel: number): number {
    // Higher empathy can mean higher contagion risk without boundaries
    if (empathyLevel > 80) return Math.min(90, empathyLevel + 10);
    if (empathyLevel > 60) return empathyLevel - 10;
    return Math.max(10, empathyLevel - 20);
  }

  private assessBurnoutRisk(userId: string, currentEmpathyLevel: number): number {
    const history = this.getEmpathyStateHistory(userId, 24);
    if (history.length < 6) return 20; // Not enough data

    // Check for sustained high empathy without recovery
    const recentHigh = history.slice(-6).filter(s => s.empathyLevel > 80).length;
    const recentLow = history.slice(-6).filter(s => s.empathyLevel < 40).length;

    let burnoutRisk = 30; // Base risk

    if (recentHigh >= 4) burnoutRisk += 30; // Sustained high empathy
    if (recentLow === 0) burnoutRisk += 20; // No recovery periods
    if (currentEmpathyLevel < 30) burnoutRisk += 25; // Current depletion

    return Math.min(100, burnoutRisk);
  }

  private async identifyContextualFactors(userId: string, timeOfDay: number): Promise<string[]> {
    const factors: string[] = [];

    // Time-based factors
    if (timeOfDay >= 6 && timeOfDay < 9) factors.push('morning-routine');
    if (timeOfDay >= 9 && timeOfDay < 17) factors.push('work-hours');
    if (timeOfDay >= 17 && timeOfDay < 21) factors.push('evening-transition');
    if (timeOfDay >= 21 || timeOfDay < 6) factors.push('rest-period');

    // Simulate other contextual factors
    if (Math.random() > 0.7) factors.push('social-interaction');
    if (Math.random() > 0.8) factors.push('high-stress-environment');
    if (Math.random() > 0.9) factors.push('triggering-content');

    return factors;
  }

  private calculateAIConfidence(userId: string): number {
    const history = this.getEmpathyStateHistory(userId, 24);

    // Confidence increases with more data
    const dataPoints = history.length;
    const baseConfidence = Math.min(90, 30 + dataPoints * 2);

    // Reduce confidence if patterns are inconsistent
    if (dataPoints > 10) {
      const variance = this.calculateEmpathyVariance(history);
      const consistencyFactor = Math.max(0.7, 1 - variance / 100);
      return Math.round(baseConfidence * consistencyFactor);
    }

    return baseConfidence;
  }

  private calculateEmpathyVariance(history: EmpathyStateSnapshot[]): number {
    if (history.length < 2) return 0;

    const levels = history.map(s => s.empathyLevel);
    const mean = levels.reduce((sum, level) => sum + level, 0) / levels.length;
    const variance =
      levels.reduce((sum, level) => sum + Math.pow(level - mean, 2), 0) / levels.length;

    return Math.sqrt(variance);
  }

  private checkForAlerts(userId: string, snapshot: EmpathyStateSnapshot): void {
    const alerts: RealTimeAlert[] = [];

    // Empathy overload alert
    if (snapshot.empathyLevel > 90 && snapshot.emotionalContagionRisk > 80) {
      alerts.push({
        id: `overload_${Date.now()}`,
        type: 'empathy_overload',
        severity: 'high',
        message: 'Your empathy levels are very high. Consider taking a mindful break.',
        recommendations: [
          'Practice grounding techniques',
          'Set gentle boundaries',
          'Take 5 minutes for self-care',
        ],
        timestamp: new Date(),
      });
    }

    // Empathy depletion alert
    if (snapshot.empathyLevel < 30 && snapshot.burnoutRisk > 70) {
      alerts.push({
        id: `depletion_${Date.now()}`,
        type: 'empathy_depletion',
        severity: 'medium',
        message: 'Your empathy reserves seem low. Time for restoration.',
        recommendations: [
          'Engage in activities that fill your cup',
          'Connect with supportive people',
          'Practice self-compassion',
        ],
        timestamp: new Date(),
      });
    }

    // Boundary needed alert
    if (snapshot.emotionalContagionRisk > 85) {
      alerts.push({
        id: `boundary_${Date.now()}`,
        type: 'boundary_needed',
        severity: 'medium',
        message: 'High emotional absorption detected. Boundaries may help.',
        recommendations: [
          'Visualize protective boundaries',
          'Limit exposure to intense emotions',
          'Practice the "not mine" technique',
        ],
        timestamp: new Date(),
      });
    }

    // Store alerts
    if (alerts.length > 0) {
      if (!this.activeAlerts.has(userId)) {
        this.activeAlerts.set(userId, []);
      }
      this.activeAlerts.get(userId)!.push(...alerts);
    }
  }

  private async assessEffectOnOther(interaction: {
    response: string;
    intensity: number;
  }): Promise<number> {
    // Simulate assessment of positive impact on others
    const responseQuality = interaction.response.length > 10 ? 1 : 0.5;
    const intensityFactor = Math.min(1, interaction.intensity / 100);
    return Math.round(responseQuality * intensityFactor * 100);
  }

  private async assessEffectOnSelf(interaction: {
    type: string;
    intensity: number;
  }): Promise<number> {
    // Simulate assessment of impact on self
    if (interaction.type === 'self-directed') return Math.round(interaction.intensity * 0.8);
    if (interaction.intensity > 80) return Math.round(70 - (interaction.intensity - 80)); // High intensity can be draining
    return Math.round(interaction.intensity * 0.9);
  }

  private async assessQualityIndicators(interaction: {
    response: string;
    type: string;
  }): Promise<string[]> {
    const indicators: string[] = [];

    if (interaction.response.toLowerCase().includes('understand')) indicators.push('understanding');
    if (interaction.response.toLowerCase().includes('feel'))
      indicators.push('emotional-connection');
    if (interaction.type === 'spontaneous') indicators.push('natural-response');
    if (interaction.response.length > 20) indicators.push('thoughtful-response');

    return indicators;
  }

  private async analyzeMicroMomentPatterns(
    userId: string,
    _moment: MicroEmpathyMoment
  ): Promise<void> {
    // Analyze patterns in micro-moments for insights
    const currentState = this.getCurrentEmpathyState(userId);
    if (!currentState) return;

    const recentMoments = currentState.microMoments.slice(-10);

    // Check for empathy fatigue pattern
    const lowEffectMoments = recentMoments.filter(m => m.effectOnSelf < 40).length;
    if (lowEffectMoments >= 5) {
      // Trigger empathy fatigue alert
      this.checkForAlerts(userId, currentState);
    }
  }
}

// Supporting classes for sentiment analysis and micro-interaction tracking

class SentimentAnalyzer {
  async analyzeEmpathySignals(
    text: string,
    _context: string
  ): Promise<{
    empathyLevel: number;
    sentiment: string;
    empathyIndicators: string[];
    concerns: string[];
  }> {
    // Simple sentiment analysis simulation
    const empathyWords = ['understand', 'feel', 'care', 'support', 'compassion', 'empathy'];
    const concernWords = ['overwhelmed', 'drained', 'exhausted', 'too much', "can't handle"];

    const lowerText = text.toLowerCase();
    const empathyCount = empathyWords.filter(word => lowerText.includes(word)).length;
    const concernCount = concernWords.filter(word => lowerText.includes(word)).length;

    const empathyLevel = Math.min(100, empathyCount * 20 + 40 - concernCount * 15);
    const sentiment = empathyLevel > 60 ? 'positive' : empathyLevel > 40 ? 'neutral' : 'concerning';

    const indicators = empathyWords.filter(word => lowerText.includes(word));
    const concerns = concernWords.filter(word => lowerText.includes(word));

    return {
      empathyLevel,
      sentiment,
      empathyIndicators: indicators,
      concerns,
    };
  }
}

class MicroInteractionTracker {
  // Implementation for tracking micro-interactions would go here
  // This could integrate with mouse movements, typing patterns, etc.
}

// Export singleton instance
export const realTimeEmpathyMonitor = new RealTimeEmpathyMonitor({
  monitoringInterval: 30000, // 30 seconds
  sentimentAnalysisEnabled: true,
  microInteractionTracking: true,
  emotionalContagionDetection: true,
  empathyBurnoutPrevention: true,
  culturalContextAwareness: true,
});
