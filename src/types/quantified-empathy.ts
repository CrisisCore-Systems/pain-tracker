// cspell:ignore futur
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

// Enhanced Empathy-Driven Analytics with Advanced Intelligence
export interface QuantifiedEmpathyMetrics {
  // Core Emotional Intelligence with Neural Patterns
  emotionalIntelligence: {
    selfAwareness: number; // 0-100
    selfRegulation: number; // 0-100
    motivation: number; // 0-100
    empathy: number; // 0-100
    socialSkills: number; // 0-100
    emotionalGranularity: number; // 0-100, ability to distinguish between emotions
    metaEmotionalAwareness: number; // 0-100, awareness of emotional processes
    neuralEmpathyPatterns: NeuralEmpathyProfile;
  };
  
  // Advanced Compassionate Progress Tracking
  compassionateProgress: {
    selfCompassion: number; // 0-100
    selfCriticism: number; // 0-100 (reverse scored)
    progressCelebration: number; // 0-100
    setbackResilience: number; // 0-100
    hopefulness: number; // 0-100
    postTraumaticGrowth: number; // 0-100
    meaningMaking: number; // 0-100, ability to find meaning in experiences
    adaptiveReframing: number; // 0-100, positive reframing of challenges
    compassionFatigue: number; // 0-100, exhaustion from caring (reverse scored)
    recoveryPatterns: RecoveryPatternAnalysis;
  };
  
  // Sophisticated Empathy KPIs with Context
  empathyKPIs: {
    validationReceived: number; // 0-100
    validationGiven: number; // 0-100
    emotionalSupport: number; // 0-100
    understandingFelt: number; // 0-100
    connectionQuality: number; // 0-100
    empathicAccuracy: number; // 0-100, accuracy in reading others' emotions
    empathicConcern: number; // 0-100, genuine care for others' wellbeing
    perspectiveTaking: number; // 0-100, ability to see others' viewpoints
    empathicMotivation: number; // 0-100, drive to help others
    boundaryMaintenance: number; // 0-100, healthy empathy boundaries
    culturalEmpathy: CulturalEmpathyMetrics;
  };
  
  // Deep Humanized Metrics with Wisdom Tracking
  humanizedMetrics: {
    courageScore: number; // 0-100, courage in facing challenges
    vulnerabilityAcceptance: number; // 0-100, comfort with vulnerability
    authenticityLevel: number; // 0-100, being true to self
    growthMindset: number; // 0-100, openness to learning
    wisdomGained: WisdomProfile; // comprehensive wisdom tracking
    innerStrength: number; // 0-100, developed inner resilience
    dignityMaintenance: number; // 0-100, preserving self-worth
    purposeClarity: number; // 0-100, clarity of life purpose
    spiritualWellbeing: number; // 0-100, spiritual/existential wellness
    lifeNarrativeCoherence: number; // 0-100, coherent life story
  };
  
  // Advanced Empathy Intelligence
  empathyIntelligence: EmpathyIntelligenceProfile;
  
  // Temporal Empathy Evolution
  temporalPatterns: TemporalEmpathyPatterns;
  
  // Micro-Empathy Moments
  microEmpathyMoments: MicroEmpathyTracking;
  
  // Predictive Empathy Modeling
  predictiveMetrics: PredictiveEmpathyModel;
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

// Advanced Empathy Intelligence Types

export interface NeuralEmpathyProfile {
  mirrorNeuronActivity: number; // 0-100, simulated mirror neuron engagement
  emotionalContagionResistance: number; // 0-100, resistance to unwanted emotional absorption
  empathicDistressManagement: number; // 0-100, managing overwhelming empathy
  cognitivePerspectiveTaking: number; // 0-100, intellectual perspective taking
  affectivePerspectiveTaking: number; // 0-100, emotional perspective taking
  empathyFlexibility: number; // 0-100, adapting empathy to context
  empathyCalibration: number; // 0-100, appropriate empathy levels
  empathicMemory: number; // 0-100, remembering emotional experiences of others
}

export interface CulturalEmpathyMetrics {
  culturalAwareness: number; // 0-100, awareness of cultural differences
  crossCulturalEmpathy: number; // 0-100, empathy across cultural lines
  culturalHumility: number; // 0-100, acknowledging cultural limitations
  universalEmpathy: number; // 0-100, shared human experience understanding
  culturalAdaptation: number; // 0-100, adapting empathy to cultural context
  inclusiveEmpathy: number; // 0-100, empathy for marginalized groups
  intersectionalAwareness: number; // 0-100, understanding multiple identities
}

export interface RecoveryPatternAnalysis {
  avgRecoveryTime: number; // minutes to emotional baseline
  recoveryConsistency: number; // 0-100, consistency in recovery patterns
  recoveryStrategies: RecoveryStrategy[];
  setbackPredictors: SetbackPredictor[];
  resilienceFactors: ResilienceFactor[];
  recoveryTrajectory: RecoveryTrajectoryPoint[];
  adaptiveRecovery: number; // 0-100, improvement in recovery over time
}

export interface RecoveryStrategy {
  name: string;
  effectiveness: number; // 0-100
  usageFrequency: number; // times per week
  contextualSuitability: string[];
  timeToEffect: number; // minutes
  sustainabilityScore: number; // 0-100, long-term viability
  personalizationLevel: number; // 0-100, how personalized this strategy is
}

export interface SetbackPredictor {
  factor: string;
  predictivePower: number; // 0-100
  leadTime: number; // hours before setback
  interventionOpportunity: number; // 0-100, chance to intervene
  preventionStrategies: string[];
}

export interface ResilienceFactor {
  factor: string;
  protectiveStrength: number; // 0-100
  buildableLevel: number; // 0-100, how much this can be developed
  currentLevel: number; // 0-100, current level
  developmentPath: string[];
}

export interface RecoveryTrajectoryPoint {
  timestamp: Date;
  recoveryLevel: number; // 0-100, percentage recovered
  activeMechanisms: string[];
  effectiveness: number; // 0-100, how well recovery is working
}

export interface WisdomProfile {
  insights: WisdomInsight[];
  wisdomCategories: {
    practicalWisdom: number; // 0-100, real-world application knowledge
    emotionalWisdom: number; // 0-100, understanding emotions
    spiritualWisdom: number; // 0-100, meaning and purpose insights
    relationalWisdom: number; // 0-100, relationship understanding
    selfKnowledgeWisdom: number; // 0-100, deep self-understanding
  };
  wisdomGrowthRate: number; // 0-100, rate of wisdom acquisition
  wisdomApplication: number; // 0-100, applying wisdom to life
  wisdomSharing: number; // 0-100, sharing wisdom with others
  integratedWisdom: number; // 0-100, holistic wisdom integration
}

export interface WisdomInsight {
  id: string;
  category: 'practical' | 'emotional' | 'spiritual' | 'relational' | 'self-knowledge';
  insight: string;
  dateGained: Date;
  contextualSource: string;
  applicability: number; // 0-100, how applicable this insight is
  transformativeLevel: number; // 0-100, how life-changing this insight is
  sharedWith: string[]; // who this insight has been shared with
  reinforcementLevel: number; // 0-100, how often this insight is reinforced
}

export interface EmpathyIntelligenceProfile {
  empathyIQ: number; // 0-200, overall empathy intelligence quotient
  empathyProcessingSpeed: number; // 0-100, speed of empathic understanding
  empathyAccuracy: number; // 0-100, accuracy in reading emotions
  empathyDiversity: number; // 0-100, empathy across diverse experiences
  empathyInnovation: number; // 0-100, creative empathic solutions
  empathyLeadership: number; // 0-100, leading with empathy
  empathyTeaching: number; // 0-100, teaching others empathy
  empathyHealing: number; // 0-100, healing through empathy
  metaEmpathy: number; // 0-100, empathy about empathy itself
  empathyWisdom: number; // 0-100, wise application of empathy
}

export interface TemporalEmpathyPatterns {
  dailyPatterns: DailyEmpathyPattern[];
  weeklyTrends: WeeklyEmpathyTrend[];
  monthlyEvolution: MonthlyEmpathyEvolution[];
  seasonalInfluences: SeasonalEmpathyInfluence[];
  lifePhaseEmpathy: LifePhaseEmpathy[];
  empathyMilestones: EmpathyMilestone[];
  empathyRegression: EmpathyRegressionAnalysis[];
  futurEmpathyProjection: FutureEmpathyProjection;
}

export interface DailyEmpathyPattern {
  timeOfDay: string; // morning, afternoon, evening, night
  empathyLevel: number; // 0-100
  empathyQuality: string; // tender, fierce, tired, energized
  triggers: string[];
  optimalMoments: string[];
  challengingMoments: string[];
}

export interface WeeklyEmpathyTrend {
  week: Date;
  avgEmpathyLevel: number;
  empathyRange: { min: number; max: number };
  dominantPattern: string;
  growthAreas: string[];
  breakthroughs: string[];
}

export interface MonthlyEmpathyEvolution {
  month: Date;
  evolutionScore: number; // 0-100, how much empathy evolved
  newCapabilities: string[];
  deepenedCapacities: string[];
  challenges: string[];
  integrationLevel: number; // 0-100, how well new empathy is integrated
}

export interface SeasonalEmpathyInfluence {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  empathyCharacteristics: string[];
  seasonalChallenges: string[];
  seasonalGifts: string[];
  adaptationStrategies: string[];
}

export interface LifePhaseEmpathy {
  phase: string; // adolescence, young adult, midlife, etc.
  empathyCapacities: string[];
  developmentalTasks: string[];
  empathyContributions: string[];
  mentorshipOpportunities: string[];
}

export interface EmpathyMilestone {
  id: string;
  title: string;
  description: string;
  dateAchieved: Date;
  significance: 'minor' | 'moderate' | 'major' | 'transformative';
  beforeAfter: {
    before: string;
    after: string;
  };
  celebrations: string[];
  nextHorizons: string[];
}

export interface EmpathyRegressionAnalysis {
  period: { start: Date; end: Date };
  regressionType: 'temporary' | 'stress-induced' | 'developmental' | 'trauma-related';
  impactLevel: number; // 0-100, severity of regression
  recoveryStrategies: string[];
  learningsFromRegression: string[];
  preventionStrategies: string[];
}

export interface FutureEmpathyProjection {
  projectionTimeframe: string; // 3 months, 6 months, 1 year
  predictedGrowthAreas: string[];
  anticipatedChallenges: string[];
  developmentOpportunities: string[];
  requiredSupports: string[];
  confidenceLevel: number; // 0-100, confidence in projections
}

export interface MicroEmpathyTracking {
  microMoments: MicroEmpathyMoment[];
  dailyMicroAverage: number; // 0-100, average micro-empathy per day
  microEmpathyQuality: number; // 0-100, quality of micro-empathy moments
  microEmpathyConsistency: number; // 0-100, consistency across days
  spontaneousEmpathy: number; // 0-100, unprompted empathic responses
  mindfulEmpathy: number; // 0-100, intentional empathic responses
  empathyInterruptions: EmpathyInterruption[];
  empathyRecovery: EmpathyRecoveryMoment[];
}

export interface MicroEmpathyMoment {
  timestamp: Date;
  duration: number; // seconds
  intensity: number; // 0-100
  type: 'spontaneous' | 'requested' | 'reciprocal' | 'self-directed';
  trigger: string;
  response: string;
  effectOnOther: number; // 0-100, perceived positive impact
  effectOnSelf: number; // 0-100, impact on own wellbeing
  qualityIndicators: string[];
}

export interface EmpathyInterruption {
  timestamp: Date;
  interruptionCause: string;
  resumptionTime: number; // minutes to resume empathy
  impactLevel: number; // 0-100, severity of interruption
  recoveryStrategy: string;
  learningOpportunity: string;
}

export interface EmpathyRecoveryMoment {
  timestamp: Date;
  recoveryTrigger: string;
  recoveryTime: number; // minutes
  recoveryQuality: number; // 0-100, quality of empathy after recovery
  supportUsed: string[];
  strengthsUtilized: string[];
}

export interface PredictiveEmpathyModel {
  empathyForecast: EmpathyForecast[];
  riskPrediction: EmpathyRiskPrediction[];
  opportunityPrediction: EmpathyOpportunityPrediction[];
  burnoutRisk: BurnoutRiskAssessment;
  growthPotential: GrowthPotentialAssessment;
  adaptiveRecommendations: AdaptiveRecommendation[];
  personalizedInterventions: PersonalizedIntervention[];
}

export interface EmpathyForecast {
  timeframe: string; // next week, next month
  predictedEmpathyLevel: number; // 0-100
  confidenceInterval: { min: number; max: number };
  influencingFactors: string[];
  recommendedPreparations: string[];
}

export interface EmpathyRiskPrediction {
  riskType: 'empathy_fatigue' | 'emotional_overload' | 'boundary_erosion' | 'compassion_fatigue';
  riskLevel: number; // 0-100
  timeToRisk: number; // days until risk materializes
  earlyWarningSignals: string[];
  preventionStrategies: string[];
  mitigation: string[];
}

export interface EmpathyOpportunityPrediction {
  opportunityType: 'growth_window' | 'teaching_moment' | 'healing_opportunity' | 'connection_potential';
  potentialImpact: number; // 0-100
  timeWindow: string; // when this opportunity is likely
  preparationNeeded: string[];
  supportRequired: string[];
  expectedOutcomes: string[];
}

export interface BurnoutRiskAssessment {
  currentRiskLevel: number; // 0-100
  riskFactors: string[];
  protectiveFactors: string[];
  timeToIntervention: number; // days before intervention needed
  interventionStrategies: string[];
  recoveryTimeline: string;
}

export interface GrowthPotentialAssessment {
  currentGrowthTrajectory: number; // 0-100
  growthAccelerators: string[];
  growthBarriers: string[];
  optimalGrowthConditions: string[];
  expectedTimeline: string;
  supportNeeded: string[];
}

export interface AdaptiveRecommendation {
  id: string;
  type: 'preventive' | 'corrective' | 'enhancing' | 'stabilizing';
  urgency: number; // 0-100
  recommendation: string;
  rationale: string;
  implementation: string[];
  expectedOutcome: string;
  monitoringPlan: string[];
}

export interface PersonalizedIntervention {
  id: string;
  targetArea: string;
  interventionType: 'micro-intervention' | 'daily-practice' | 'weekly-focus' | 'monthly-theme';
  personalizationFactors: string[];
  customizedApproach: string;
  dosage: string; // how much/how often
  progressIndicators: string[];
  adaptationTriggers: string[];
}
