/**
 * Fibromyalgia-Specific Types and Interfaces
 * Based on ACR 2016 Revised Diagnostic Criteria
 */

export interface FibromyalgiaEntry {
  id: number;
  timestamp: string;
  userId?: string;

  // Widespread Pain Index (WPI) - 19 body regions
  wpi: {
    // Upper body
    leftShoulder: boolean;
    rightShoulder: boolean;
    leftUpperArm: boolean;
    rightUpperArm: boolean;
    leftLowerArm: boolean;
    rightLowerArm: boolean;
    leftHip: boolean;
    rightHip: boolean;
    leftUpperLeg: boolean;
    rightUpperLeg: boolean;
    leftLowerLeg: boolean;
    rightLowerLeg: boolean;
    
    // Axial
    jaw: boolean;
    chest: boolean;
    abdomen: boolean;
    upperBack: boolean;
    lowerBack: boolean;
    neck: boolean;
  };
  
  // Symptom Severity Scale (SSS) - 0-12 scale
  sss: {
    fatigue: 0 | 1 | 2 | 3; // 0=none, 3=severe
    waking_unrefreshed: 0 | 1 | 2 | 3;
    cognitive_symptoms: 0 | 1 | 2 | 3; // "fibro fog"
    somatic_symptoms: 0 | 1 | 2 | 3; // headaches, IBS, etc.
  };

  // Additional Fibromyalgia-Specific Symptoms
  symptoms: {
    // Common comorbidities
    headache: boolean;
    migraine: boolean;
    ibs: boolean;
    temporomandibularDisorder: boolean;
    restlessLegSyndrome: boolean;
    
    // Environmental sensitivities
    lightSensitivity: boolean;
    soundSensitivity: boolean;
    temperatureSensitivity: boolean;
    chemicalSensitivity: boolean;
    
    // Allodynia (pain from non-painful stimuli)
    clothingSensitivity: boolean;
    touchSensitivity: boolean;
    
    // Other symptoms
    numbnessTingling: boolean;
    muscleStiffness: boolean;
    jointPain: boolean;
    brainfog: boolean;
    memoryProblems: boolean;
    concentrationDifficulty: boolean;
  };

  // Triggers
  triggers: {
    weather?: 'humidity' | 'barometric_pressure' | 'cold' | 'heat';
    stress?: boolean;
    poorSleep?: boolean;
    overexertion?: boolean;
    underActivity?: boolean;
    foodSensitivity?: string[];
    hormonalChanges?: boolean;
  };

  // Quality of Life Impact
  impact: {
    sleepQuality: 0 | 1 | 2 | 3 | 4 | 5; // 0=excellent, 5=terrible
    moodRating: 0 | 1 | 2 | 3 | 4 | 5; // 0=great, 5=very depressed
    anxietyLevel: 0 | 1 | 2 | 3 | 4 | 5;
    functionalAbility: 0 | 1 | 2 | 3 | 4 | 5; // 0=full function, 5=bedbound
  };

  // Pacing & Activity
  activity: {
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'high';
    restPeriods: number; // number of rest breaks needed
    overexerted: boolean;
    paybackPeriod: boolean; // post-exertional malaise
  };

  // Interventions Used
  interventions: {
    medication?: string[];
    physicalTherapy?: boolean;
    meditation?: boolean;
    heatTherapy?: boolean;
    coldTherapy?: boolean;
    massage?: boolean;
    yoga?: boolean;
    tai_chi?: boolean;
    aquaTherapy?: boolean;
    cbd?: boolean;
    supplements?: string[];
  };

  // Notes
  notes?: string;
}

export interface FibromyalgiaAnalytics {
  // ACR Diagnostic Criteria
  wpiScore: number; // 0-19
  sssScore: number; // 0-12
  meetsDiagnosticCriteria: boolean; // WPI ≥7 and SSS ≥5, or WPI 4-6 and SSS ≥9
  
  // Pattern Analysis
  mostAffectedRegions: Array<{
    region: string;
    frequency: number;
    percentage: number;
  }>;
  
  commonTriggers: Array<{
    trigger: string;
    frequency: number;
  }>;
  
  symptomTrends: {
    fatigue: {
      current: number;
      trend: 'improving' | 'stable' | 'worsening';
      average: number;
    };
    cognition: {
      current: number;
      trend: 'improving' | 'stable' | 'worsening';
      average: number;
    };
    sleep: {
      current: number;
      trend: 'improving' | 'stable' | 'worsening';
      average: number;
    };
  };
  
  // Flare Tracking
  flareFrequency: number; // flares per month
  averageFlareDuration: number; // days
  flareIntensity: 'mild' | 'moderate' | 'severe';
  
  // Quality of Life Metrics
  functionalCapacity: {
    average: number;
    goodDays: number;
    badDays: number;
    bedridden: number;
  };
  
  // Effective Interventions
  effectiveInterventions: Array<{
    intervention: string;
    correlationWithImprovement: number;
  }>;
}

export interface FibromyalgiaEducation {
  id: string;
  category: 'diagnosis' | 'symptoms' | 'management' | 'research' | 'support';
  title: string;
  content: string;
  sources: string[];
  tags: string[];
}

export interface FibromyalgiaPacingPlan {
  id: string;
  name: string;
  description: string;
  
  // Activity Guidelines
  maxActivityDuration: number; // minutes
  requiredRestInterval: number; // minutes
  dailyActivityBudget: number; // total minutes
  
  // Energy Envelope
  baseline: {
    goodDayCapacity: number;
    averageDayCapacity: number;
    badDayCapacity: number;
  };
  
  // Warning Signs
  warningSignsToRest: string[];
  
  // Activity Examples
  lightActivities: string[];
  moderateActivities: string[];
  highActivities: string[];
}

export const FIBROMYALGIA_TENDER_POINTS = [
  'Occiput (base of skull)',
  'Low Cervical (neck)',
  'Trapezius (shoulders)',
  'Supraspinatus (shoulder blades)',
  'Second Rib (upper chest)',
  'Lateral Epicondyle (elbows)',
  'Gluteal (buttocks)',
  'Greater Trochanter (hips)',
  'Knees'
] as const;

export const FIBROMYALGIA_SYMPTOM_CLUSTERS = {
  pain: ['widespread pain', 'tender points', 'allodynia', 'muscle stiffness'],
  fatigue: ['chronic fatigue', 'post-exertional malaise', 'unrefreshing sleep'],
  cognitive: ['fibro fog', 'memory problems', 'concentration difficulty', 'word-finding difficulty'],
  sensory: ['light sensitivity', 'sound sensitivity', 'temperature sensitivity', 'chemical sensitivity'],
  autonomic: ['dizziness', 'irregular heartbeat', 'breathing difficulties'],
  digestive: ['IBS', 'nausea', 'food sensitivities'],
  mood: ['anxiety', 'depression', 'emotional sensitivity']
} as const;
