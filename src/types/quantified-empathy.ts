/**
 * Quantified Empathy Metrics Types
 * Comprehensive emotional intelligence and empathy-driven analytics
 */

// Enhanced Emotional State Tracking
export interface EmotionalStateMetrics {
  moodPatterns: {
    current: MoodEntry;
    dailyTrends: MoodEntry[];
    weeklyAverages: MoodSummary[];
    monthlyTrends: MoodSummary[];
    seasonalPatterns: MoodPattern[];
  };
  emotionalTriggers: {
    identified: EmotionalTrigger[];
    patterns: TriggerPattern[];
    recoveryTimes: RecoveryMetric[];
    copingEffectiveness: CopingEffectiveness[];
  };
  emotionalRecovery: {
    baseline: number; // 0-100, emotional baseline
    recoveryTime: number; // minutes to return to baseline
    resilienceScore: number; // 0-100, emotional resilience
    adaptabilityIndex: number; // 0-100, adaptation to challenges
  };
  socialEmotionalHealth: {
    connectionQuality: number; // 0-100
    supportSystemStrength: number; // 0-100
    communicationEffectiveness: number; // 0-100
    empathyReceived: number; // 0-100, feeling understood
    empathyGiven: number; // 0-100, ability to support others
  };
}

export interface MoodEntry {
  timestamp: Date;
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  anxiety: number; // 1-10 scale
  stress: number; // 1-10 scale
  hopefulness: number; // 1-10 scale
  selfEfficacy: number; // 1-10 scale
  emotionalClarity: number; // 1-10, understanding emotions
  emotionalRegulation: number; // 1-10, managing emotions
  context: string; // what was happening
  triggers: string[]; // identified triggers
  copingStrategies: string[]; // strategies used
  socialSupport: 'none' | 'minimal' | 'moderate' | 'strong';
  notes: string;
}

export interface MoodSummary {
  period: {
    start: Date;
    end: Date;
  };
  averages: {
    mood: number;
    energy: number;
    anxiety: number;
    stress: number;
    hopefulness: number;
    selfEfficacy: number;
  };
  improvements: string[];
  challenges: string[];
  insights: string[];
}

export interface MoodPattern {
  type: 'seasonal' | 'weather' | 'social' | 'medical' | 'lifestyle';
  name: string;
  description: string;
  correlation: number; // -1 to 1
  confidence: number; // 0-100
  recommendations: string[];
}

export interface EmotionalTrigger {
  id: string;
  name: string;
  type: 'pain_flare' | 'stress_event' | 'social_interaction' | 'medical_appointment' | 'weather' | 'other';
  severity: 'mild' | 'moderate' | 'severe';
  frequency: number; // times per month
  emotionalImpact: number; // 1-10
  lastOccurrence: Date;
  description: string;
  warningSignsIdentified: string[];
  preventionStrategies: string[];
}

export interface TriggerPattern {
  triggerType: string;
  timePatterns: {
    timeOfDay: { [hour: string]: number };
    dayOfWeek: { [day: string]: number };
    monthlyTrends: { [week: string]: number };
  };
  contextualFactors: {
    painLevel: number[];
    stressLevel: number[];
    socialContext: string[];
    environmentalFactors: string[];
  };
  predictiveIndicators: {
    earlyWarnings: string[];
    behavioralChanges: string[];
    physiologicalSigns: string[];
  };
}

export interface RecoveryMetric {
  triggerEvent: string;
  recoveryTimeMinutes: number;
  strategiesUsed: string[];
  effectiveness: number; // 1-10
  supportReceived: boolean;
  baseline: number; // emotional state before trigger
  lowest: number; // lowest point during trigger
  recovered: number; // state after recovery
  timestamp: Date;
}

export interface CopingEffectiveness {
  strategy: string;
  usageFrequency: number; // times per week
  effectiveness: number; // 1-10
  contexts: string[]; // when it works best
  timeToEffect: number; // minutes
  sideEffects: string[];
  personalizedNotes: string;
}

// Well-being Indicators Beyond Pain
export interface HolisticWellbeingMetrics {
  qualityOfLife: {
    overallSatisfaction: number; // 0-100
    meaningAndPurpose: number; // 0-100
    personalGrowth: number; // 0-100
    autonomy: number; // 0-100
    environmentalMastery: number; // 0-100
    positiveRelations: number; // 0-100
    selfAcceptance: number; // 0-100
  };
  functionalIndependence: {
    dailyActivities: FunctionalAssessment;
    mobility: FunctionalAssessment;
    cognition: FunctionalAssessment;
    communication: FunctionalAssessment;
    workCapacity: FunctionalAssessment;
  };
  socialConnectionMetrics: {
    networkSize: number;
    contactFrequency: number; // weekly average
    relationshipQuality: number; // 0-100
    socialSupport: number; // 0-100
    communityInvolvement: number; // 0-100
    loneliness: number; // 0-100 (reverse scored)
    belongingness: number; // 0-100
  };
  cognitiveWellness: {
    memoryFunction: number; // 0-100
    attention: number; // 0-100
    executiveFunction: number; // 0-100
    processingSpeed: number; // 0-100
    mentalClarity: number; // 0-100
    brainFogFrequency: number; // days per month
    cognitiveReserve: number; // 0-100
  };
}

export interface FunctionalAssessment {
  independence: number; // 0-100
  assistanceNeeded: 'none' | 'minimal' | 'moderate' | 'maximum';
  adaptationsUsed: string[];
  barriers: string[];
  improvements: string[];
  goals: string[];
}

// Digital Pacing Mechanisms
export interface DigitalPacingSystem {
  energyManagement: {
    currentEnergyLevel: number; // 0-100
    energyTrends: EnergyDataPoint[];
    energyBudget: EnergyBudget;
    spoonTheory: SpoonTracker;
    batteryAnalogy: BatteryMetrics;
  };
  activitySuggestions: {
    currentRecommendations: ActivityRecommendation[];
    adaptiveScheduling: ScheduleAdaptation[];
    paceAdjustments: PaceAdjustment[];
    restReminders: RestReminder[];
  };
  recoveryOptimization: {
    recoveryTime: RecoveryTimeMetrics;
    restQuality: RestQualityMetrics;
    sleepOptimization: SleepMetrics;
    stressRecovery: StressRecoveryMetrics;
  };
  smartNotifications: {
    pacingReminders: NotificationConfig[];
    energyAlerts: NotificationConfig[];
    recoveryPrompts: NotificationConfig[];
    achievementCelebrations: NotificationConfig[];
  };
}

export interface EnergyDataPoint {
  timestamp: Date;
  energyLevel: number; // 0-100
  painLevel: number; // 0-10
  activities: string[];
  context: string;
  mood: number; // 1-10
  predictedNext: number; // predicted next energy level
}

export interface EnergyBudget {
  daily: {
    total: number; // total energy units for the day
    used: number; // energy units used
    reserved: number; // energy reserved for essential activities
    flexible: number; // energy available for optional activities
  };
  weekly: {
    pattern: { [day: string]: number };
    adjustments: { [day: string]: number };
    carryOver: number; // unused energy from previous days
  };
}

export interface SpoonTracker {
  totalSpoons: number; // available spoons for the day
  usedSpoons: number; // spoons already used
  activityCosts: { [activity: string]: number }; // spoon cost per activity
  predictions: { [activity: string]: number }; // predicted costs
  adaptations: string[]; // ways to reduce spoon usage
}

export interface BatteryMetrics {
  currentCharge: number; // 0-100
  chargingActivities: string[]; // activities that restore energy
  drainingActivities: string[]; // activities that deplete energy
  chargingRate: number; // energy restored per minute of rest
  depletionRate: number; // energy lost per minute of activity
  optimalCharging: string[]; // best ways to recharge
}

export interface ActivityRecommendation {
  activity: string;
  type: 'physical' | 'mental' | 'social' | 'creative' | 'restful';
  energyCost: number; // 0-100
  painRisk: 'low' | 'medium' | 'high';
  benefits: string[];
  adaptations: string[];
  timing: 'morning' | 'afternoon' | 'evening' | 'flexible';
  duration: number; // minutes
  confidence: number; // 0-100, AI confidence in recommendation
}

export interface ScheduleAdaptation {
  timeBlock: {
    start: Date;
    end: Date;
  };
  originalPlan: string;
  adaptation: string;
  reason: string;
  energyImpact: number; // -100 to 100
  painImpact: number; // -10 to 10
  acceptanceStatus: 'suggested' | 'accepted' | 'rejected' | 'modified';
}

export interface PaceAdjustment {
  activity: string;
  originalDuration: number; // minutes
  suggestedDuration: number; // minutes
  reason: string;
  benefits: string[];
  implementation: string[];
}

export interface RestReminder {
  trigger: 'time_based' | 'activity_based' | 'energy_based' | 'symptom_based';
  message: string;
  urgency: 'low' | 'medium' | 'high';
  restType: 'micro_break' | 'short_rest' | 'extended_rest' | 'activity_change';
  duration: number; // minutes
  activities: string[]; // suggested rest activities
}

export interface RecoveryTimeMetrics {
  afterActivity: { [activity: string]: number }; // minutes to recover
  afterFlare: number; // minutes to recover from pain flare
  afterStress: number; // minutes to recover from stress
  sleepRecovery: number; // hours of sleep needed
  baseline: number; // normal recovery time
  factors: RecoveryFactor[];
}

export interface RecoveryFactor {
  factor: string;
  impact: number; // -100 to 100, effect on recovery time
  confidence: number; // 0-100
  recommendations: string[];
}

export interface RestQualityMetrics {
  restfulness: number; // 0-100
  interruptions: number; // count per rest period
  restTypes: { [type: string]: number }; // effectiveness by type
  environment: string; // optimal rest environment
  timing: string; // optimal rest timing
  duration: number; // optimal rest duration
}

export interface SleepMetrics {
  quality: number; // 0-100
  duration: number; // hours
  efficiency: number; // 0-100, time asleep vs time in bed
  restfulness: number; // 0-100, how rested upon waking
  painImpact: number; // 0-10, pain interference with sleep
  recovery: number; // 0-100, recovery during sleep
  recommendations: string[];
}

export interface StressRecoveryMetrics {
  recoveryTime: number; // minutes
  strategies: string[];
  effectiveness: { [strategy: string]: number }; // 0-100
  physicalSigns: string[];
  emotionalSigns: string[];
  behavioralSigns: string[];
}

export interface NotificationConfig {
  id: string;
  type: string;
  message: string;
  enabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'as_needed';
  conditions: string[];
  customization: {
    tone: 'gentle' | 'encouraging' | 'celebratory' | 'informative';
    timing: 'optimal' | 'scheduled' | 'immediate';
    personalization: string[];
  };
}

// Empathy-Driven Analytics Enhancement
export interface QuantifiedEmpathyMetrics {
  emotionalIntelligence: {
    selfAwareness: number; // 0-100
    selfRegulation: number; // 0-100
    motivation: number; // 0-100
    empathy: number; // 0-100
    socialSkills: number; // 0-100
  };
  compassionateProgress: {
    selfCompassion: number; // 0-100
    selfCriticism: number; // 0-100 (reverse scored)
    progressCelebration: number; // 0-100
    setbackResilience: number; // 0-100
    hopefulness: number; // 0-100
  };
  empathyKPIs: {
    validationReceived: number; // 0-100
    validationGiven: number; // 0-100
    emotionalSupport: number; // 0-100
    understandingFelt: number; // 0-100
    connectionQuality: number; // 0-100
  };
  humanizedMetrics: {
    courageScore: number; // 0-100, courage in facing challenges
    vulnerabilityAcceptance: number; // 0-100, comfort with vulnerability
    authenticityLevel: number; // 0-100, being true to self
    growthMindset: number; // 0-100, openness to learning
    wisdomGained: string[]; // insights from experience
  };
}

// Integration types
export interface EmpathyMetricsSnapshot {
  timestamp: Date;
  emotionalState: EmotionalStateMetrics;
  wellbeing: HolisticWellbeingMetrics;
  pacing: DigitalPacingSystem;
  empathy: QuantifiedEmpathyMetrics;
  insights: EmpathyInsight[];
  recommendations: EmpathyRecommendation[];
}

export interface EmpathyInsight {
  id: string;
  type: 'pattern' | 'correlation' | 'improvement' | 'concern' | 'celebration';
  title: string;
  description: string;
  confidence: number; // 0-100
  actionable: boolean;
  personalized: boolean;
  timestamp: Date;
  dataPoints: string[]; // source data for insight
}

export interface EmpathyRecommendation {
  id: string;
  category: 'emotional' | 'physical' | 'social' | 'cognitive' | 'lifestyle';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  rationale: string;
  steps: string[];
  expectedBenefits: string[];
  timeframe: string;
  effort: 'low' | 'medium' | 'high';
  personalization: string[];
}
