/**
 * Synthetic Data Generator
 * ========================
 * Core module for generating realistic synthetic data for validation testing.
 * 
 * Supports various usage scenarios:
 * - Normal daily usage (3 entries/day)
 * - Crisis periods (high pain, frequent logging)
 * - Recovery periods (declining pain over time)
 * - Flare patterns (cyclical pain increases)
 * - Realistic user profiles with different conditions
 * 
 * Part of: VALIDATION PROTOCOL v1.0
 */

import type { PainEntry } from '../../types';
import type { MoodEntry } from '../../types/quantified-empathy';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface SyntheticDataConfig {
  /** Number of days to simulate */
  days: number;
  /** Base entries per day (with natural variation) */
  entriesPerDay: number;
  /** Seed for deterministic random generation (optional) */
  seed?: number;
  /** User profile type */
  profile?: UserProfile;
  /** Include crisis periods */
  includeCrisisPeriods?: boolean;
  /** Include recovery periods */
  includeRecoveryPeriods?: boolean;
  /** Include flare patterns */
  includeFlarePeriods?: boolean;
}

export type UserProfile = 
  | 'chronic-back-pain'
  | 'fibromyalgia'
  | 'migraine'
  | 'arthritis'
  | 'post-surgical'
  | 'mixed-condition';

export interface SyntheticScenario {
  name: string;
  description: string;
  entries: PainEntry[];
  moodEntries?: MoodEntry[];
  expectedPatterns: string[];
}

// ============================================================================
// Random Number Generator with Optional Seeding
// ============================================================================

class SeededRandom {
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed ?? Date.now();
  }

  next(): number {
    // Simple LCG algorithm for reproducible random numbers
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextBool(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  pickRandom<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  pickMultiple<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => this.next() - 0.5);
    return shuffled.slice(0, Math.min(count, array.length));
  }
}

// ============================================================================
// Data Constants for Realistic Generation
// ============================================================================

const LOCATIONS = {
  back: ['lower back', 'upper back', 'mid back'],
  neck: ['neck', 'cervical'],
  head: ['head', 'temples', 'forehead'],
  joints: ['knees', 'hips', 'ankles', 'wrists', 'elbows'],
  shoulders: ['left shoulder', 'right shoulder', 'shoulders'],
  extremities: ['hands', 'feet', 'fingers', 'toes'],
  chest: ['chest', 'ribs'],
  abdomen: ['abdomen', 'lower abdomen'],
};

const ALL_LOCATIONS = Object.values(LOCATIONS).flat();

const SYMPTOMS = {
  acute: ['sharp pain', 'stabbing', 'shooting'],
  chronic: ['aching', 'dull pain', 'throbbing'],
  nerve: ['burning', 'tingling', 'numbness'],
  muscle: ['stiffness', 'tightness', 'cramping'],
  general: ['fatigue', 'weakness', 'heaviness'],
};

const ALL_SYMPTOMS = Object.values(SYMPTOMS).flat();

const TRIGGERS = [
  'weather changes', 'stress', 'poor sleep', 'physical activity',
  'prolonged sitting', 'prolonged standing', 'lifting', 'cold weather',
  'humidity', 'barometric pressure', 'lack of exercise', 'overexertion',
];

const ACTIVITIES = [
  'walking', 'sitting', 'standing', 'lifting', 'bending',
  'reaching', 'driving', 'sleeping', 'working', 'exercising',
  'cooking', 'cleaning', 'shopping', 'climbing stairs',
];

const RELIEF_METHODS = [
  'rest', 'heat', 'ice', 'medication', 'stretching',
  'massage', 'physical therapy', 'acupuncture', 'relaxation',
  'distraction', 'walking', 'swimming',
];

const MEDICATIONS = [
  { name: 'Ibuprofen', dosage: '400mg', frequency: 'as needed' },
  { name: 'Acetaminophen', dosage: '500mg', frequency: 'every 6 hours' },
  { name: 'Gabapentin', dosage: '300mg', frequency: 'twice daily' },
  { name: 'Tramadol', dosage: '50mg', frequency: 'as needed' },
  { name: 'Naproxen', dosage: '500mg', frequency: 'twice daily' },
  { name: 'Cyclobenzaprine', dosage: '10mg', frequency: 'at bedtime' },
];

// ============================================================================
// Profile-Specific Generators
// ============================================================================

function getProfileConfig(profile: UserProfile) {
  const configs: Record<UserProfile, {
    primaryLocations: string[];
    primarySymptoms: string[];
    basePainRange: [number, number];
    flareMultiplier: number;
    commonTriggers: string[];
  }> = {
    'chronic-back-pain': {
      primaryLocations: ['lower back', 'upper back', 'mid back', 'hips'],
      primarySymptoms: ['aching', 'stiffness', 'dull pain', 'sharp pain'],
      basePainRange: [3, 6],
      flareMultiplier: 1.5,
      commonTriggers: ['prolonged sitting', 'lifting', 'bending', 'cold weather'],
    },
    'fibromyalgia': {
      primaryLocations: ALL_LOCATIONS.slice(0, 12), // Widespread
      primarySymptoms: ['aching', 'fatigue', 'stiffness', 'burning', 'tingling'],
      basePainRange: [4, 7],
      flareMultiplier: 1.3,
      commonTriggers: ['stress', 'poor sleep', 'weather changes', 'overexertion'],
    },
    'migraine': {
      primaryLocations: ['head', 'temples', 'forehead', 'neck'],
      primarySymptoms: ['throbbing', 'sharp pain', 'stabbing'],
      basePainRange: [2, 5],
      flareMultiplier: 2.0, // Migraines can spike dramatically
      commonTriggers: ['stress', 'lack of sleep', 'bright lights', 'weather changes'],
    },
    'arthritis': {
      primaryLocations: ['knees', 'hips', 'hands', 'wrists', 'ankles'],
      primarySymptoms: ['stiffness', 'aching', 'swelling', 'weakness'],
      basePainRange: [3, 5],
      flareMultiplier: 1.4,
      commonTriggers: ['cold weather', 'humidity', 'physical activity', 'prolonged sitting'],
    },
    'post-surgical': {
      primaryLocations: ['lower back', 'abdomen'], // Generic surgical site
      primarySymptoms: ['sharp pain', 'aching', 'stiffness', 'weakness'],
      basePainRange: [4, 8], // Higher initial pain
      flareMultiplier: 1.2,
      commonTriggers: ['physical activity', 'lifting', 'prolonged standing'],
    },
    'mixed-condition': {
      primaryLocations: ALL_LOCATIONS.slice(0, 8),
      primarySymptoms: ALL_SYMPTOMS.slice(0, 8),
      basePainRange: [3, 6],
      flareMultiplier: 1.4,
      commonTriggers: TRIGGERS.slice(0, 6),
    },
  };
  return configs[profile];
}

// ============================================================================
// Core Entry Generation
// ============================================================================

function generatePainEntry(
  rng: SeededRandom,
  config: {
    day: number;
    entryNum: number;
    baseTime: number;
    painLevel: number;
    profile: ReturnType<typeof getProfileConfig>;
    isCrisis?: boolean;
    isFlare?: boolean;
  }
): PainEntry {
  const { day, entryNum, baseTime, painLevel, profile, isCrisis, isFlare } = config;
  
  // Calculate timestamp
  const dayOffset = day * 86400000;
  const entryOffset = entryNum * (86400000 / 4); // Spread entries through day
  const jitter = rng.nextInt(-3600000, 3600000); // ±1 hour jitter
  const timestamp = new Date(baseTime - dayOffset - entryOffset + jitter);

  // Select locations (more during crisis/flare)
  const numLocations = isCrisis || isFlare 
    ? rng.nextInt(2, 4) 
    : rng.nextInt(1, 3);
  const locations = rng.pickMultiple(profile.primaryLocations, numLocations);

  // Select symptoms
  const numSymptoms = isCrisis || isFlare
    ? rng.nextInt(2, 5)
    : rng.nextInt(1, 3);
  const symptoms = rng.pickMultiple(profile.primarySymptoms, numSymptoms);

  // Limited activities (more during high pain)
  const numLimitedActivities = painLevel > 6 ? rng.nextInt(2, 5) : rng.nextInt(0, 2);
  const limitedActivities = rng.pickMultiple(ACTIVITIES, numLimitedActivities);

  // Sleep and mood inversely correlated with pain
  const sleepQuality = Math.max(1, Math.min(10, 11 - painLevel + rng.nextInt(-2, 2)));
  const moodImpact = Math.max(1, Math.min(10, painLevel + rng.nextInt(-2, 2)));

  // Triggers more likely during high pain
  const triggers = painLevel > 5 
    ? rng.pickMultiple(profile.commonTriggers, rng.nextInt(1, 3))
    : rng.nextBool(0.3) ? [rng.pickRandom(profile.commonTriggers)] : [];

  // Relief methods attempted
  const reliefMethods = painLevel > 4
    ? rng.pickMultiple(RELIEF_METHODS, rng.nextInt(1, 3))
    : [];

  // Medications (more likely during higher pain)
  const hasMedication = painLevel > 5 || rng.nextBool(0.4);
  const currentMedications = hasMedication
    ? rng.pickMultiple(MEDICATIONS, rng.nextInt(1, 2)).map(med => ({
        ...med,
        effectiveness: rng.pickRandom(['very effective', 'moderately effective', 'somewhat effective', 'not effective']),
      }))
    : [];

  // Work impact
  const missedWork = painLevel > 7 ? (rng.nextBool(0.6) ? 1 : 0) : (rng.nextBool(0.1) ? 1 : 0);

  // Generate contextual notes
  const noteTemplates = [
    `Day ${day + 1} - Pain level ${painLevel}/10. ${symptoms[0]} in ${locations[0]}.`,
    `${isCrisis ? 'Crisis day' : isFlare ? 'Flare day' : 'Normal day'}. ${triggers.length > 0 ? `Triggered by ${triggers[0]}.` : ''}`,
    `${reliefMethods.length > 0 ? `Tried ${reliefMethods.join(', ')}.` : 'No relief measures taken.'}`,
    `Sleep quality: ${sleepQuality}/10. Mood: ${moodImpact}/10 affected.`,
  ];
  const notes = noteTemplates.slice(0, rng.nextInt(1, 3)).join(' ');

  return {
    id: `synthetic-${day}-${entryNum}`,
    timestamp: timestamp.toISOString(),
    baselineData: {
      pain: painLevel,
      locations,
      symptoms,
    },
    functionalImpact: {
      limitedActivities,
      assistanceNeeded: painLevel > 7 ? rng.pickMultiple(['dressing', 'bathing', 'cooking'], rng.nextInt(0, 2)) : [],
      mobilityAids: painLevel > 8 ? (rng.nextBool(0.3) ? ['cane'] : []) : [],
    },
    medications: {
      current: currentMedications,
      changes: rng.nextBool(0.1) ? 'Recent dosage adjustment' : '',
      effectiveness: currentMedications.length > 0 ? rng.pickRandom(['improving', 'stable', 'not helping']) : '',
    },
    treatments: {
      recent: rng.nextBool(0.2) ? [{
        type: rng.pickRandom(['Physical therapy', 'Massage', 'Acupuncture']),
        provider: 'Local clinic',
        date: new Date(timestamp.getTime() - rng.nextInt(1, 7) * 86400000).toISOString().split('T')[0],
        effectiveness: rng.pickRandom(['good', 'moderate', 'minimal']),
      }] : [],
      effectiveness: '',
      planned: [],
    },
    qualityOfLife: {
      sleepQuality,
      moodImpact,
      socialImpact: moodImpact > 6 ? rng.pickMultiple(['Cancelled plans', 'Reduced social activities', 'Relationship strain'], rng.nextInt(0, 2)) : [],
    },
    workImpact: {
      missedWork,
      modifiedDuties: painLevel > 6 ? rng.pickMultiple(['Limited lifting', 'Frequent breaks', 'Reduced hours'], rng.nextInt(0, 2)) : [],
      workLimitations: painLevel > 5 ? ['Cannot perform full duties'] : [],
    },
    comparison: {
      worseningSince: isFlare ? new Date(timestamp.getTime() - 7 * 86400000).toISOString().split('T')[0] : '',
      newLimitations: isFlare ? ['Increased limitations during flare'] : [],
    },
    notes,
    triggers,
    intensity: painLevel,
    location: locations[0] || 'unspecified',
    quality: symptoms.slice(0, 2),
    reliefMethods,
    activityLevel: Math.max(1, 10 - painLevel),
    weather: rng.pickRandom(['clear', 'cloudy', 'rainy', 'cold', 'humid']),
    sleep: sleepQuality,
    mood: 10 - moodImpact,
    stress: Math.min(10, painLevel + rng.nextInt(-1, 2)),
    activities: limitedActivities.length > 0 ? ['rest'] : rng.pickMultiple(['walking', 'light exercise', 'stretching'], 1),
    medicationAdherence: currentMedications.length > 0 ? rng.pickRandom(['as_prescribed', 'partial', 'missed']) : 'not_applicable',
  };
}

// ============================================================================
// Scenario Generators
// ============================================================================

/**
 * Generate entries for a normal usage period
 */
export function generateNormalUsage(config: SyntheticDataConfig): PainEntry[] {
  const rng = new SeededRandom(config.seed);
  const profile = getProfileConfig(config.profile || 'mixed-condition');
  const entries: PainEntry[] = [];
  const baseTime = Date.now();

  for (let day = 0; day < config.days; day++) {
    const dailyEntryCount = Math.max(1, config.entriesPerDay + rng.nextInt(-1, 1));
    
    for (let entryNum = 0; entryNum < dailyEntryCount; entryNum++) {
      const basePain = rng.nextInt(profile.basePainRange[0], profile.basePainRange[1]);
      const painLevel = Math.max(1, Math.min(10, basePain + rng.nextInt(-1, 1)));
      
      entries.push(generatePainEntry(rng, {
        day,
        entryNum,
        baseTime,
        painLevel,
        profile,
      }));
    }
  }

  return entries;
}

/**
 * Generate entries for a crisis period (high pain, frequent logging)
 */
export function generateCrisisPeriod(days: number, seed?: number): PainEntry[] {
  const rng = new SeededRandom(seed);
  const profile = getProfileConfig('mixed-condition');
  const entries: PainEntry[] = [];
  const baseTime = Date.now();

  for (let day = 0; day < days; day++) {
    // More entries during crisis
    const dailyEntryCount = rng.nextInt(3, 6);
    
    for (let entryNum = 0; entryNum < dailyEntryCount; entryNum++) {
      // Higher pain during crisis (7-10)
      const painLevel = rng.nextInt(7, 10);
      
      entries.push(generatePainEntry(rng, {
        day,
        entryNum,
        baseTime,
        painLevel,
        profile,
        isCrisis: true,
      }));
    }
  }

  return entries;
}

/**
 * Generate entries for a recovery period (declining pain over time)
 * Pain starts high in the past and declines to lower levels in the present
 */
export function generateRecoveryPeriod(days: number, seed?: number): PainEntry[] {
  const rng = new SeededRandom(seed);
  const profile = getProfileConfig('post-surgical');
  const entries: PainEntry[] = [];
  const baseTime = Date.now();

  const startPain = 8;  // Pain level at start of recovery (oldest entries)
  const endPain = 3;    // Pain level at end of recovery (newest entries)
  const painDecline = (startPain - endPain) / days;

  for (let day = 0; day < days; day++) {
    const dailyEntryCount = rng.nextInt(2, 4);
    // day 0 = today (most recent), should have LOW pain (endPain)
    // day (days-1) = oldest, should have HIGH pain (startPain)
    // Pain formula: startPain at oldest, declining to endPain at newest
    const daysFromOldest = days - 1 - day;  // day 0 -> days-1 days from oldest, day (days-1) -> 0 days from oldest
    const dailyBasePain = Math.max(endPain, startPain - daysFromOldest * painDecline);
    
    for (let entryNum = 0; entryNum < dailyEntryCount; entryNum++) {
      const painLevel = Math.max(1, Math.min(10, Math.round(dailyBasePain + rng.nextInt(-1, 1))));
      
      entries.push(generatePainEntry(rng, {
        day,
        entryNum,
        baseTime,
        painLevel,
        profile,
      }));
    }
  }

  return entries;
}

/**
 * Generate entries with flare pattern (cyclical increases)
 */
export function generateFlarePeriod(days: number, flareCycleDays: number = 7, seed?: number): PainEntry[] {
  const rng = new SeededRandom(seed);
  const profile = getProfileConfig('fibromyalgia');
  const entries: PainEntry[] = [];
  const baseTime = Date.now();

  for (let day = 0; day < days; day++) {
    const cyclePosition = (day % flareCycleDays) / flareCycleDays;
    // Pain peaks mid-cycle
    const flareIntensity = Math.sin(cyclePosition * Math.PI);
    const basePain = profile.basePainRange[0] + 
      flareIntensity * (profile.basePainRange[1] - profile.basePainRange[0]) * profile.flareMultiplier;
    
    const isFlare = flareIntensity > 0.7;
    const dailyEntryCount = isFlare ? rng.nextInt(3, 5) : rng.nextInt(2, 3);
    
    for (let entryNum = 0; entryNum < dailyEntryCount; entryNum++) {
      const painLevel = Math.max(1, Math.min(10, Math.round(basePain + rng.nextInt(-1, 1))));
      
      entries.push(generatePainEntry(rng, {
        day,
        entryNum,
        baseTime,
        painLevel,
        profile,
        isFlare,
      }));
    }
  }

  return entries;
}

/**
 * Generate a complete synthetic scenario
 */
export function generateSyntheticScenario(
  name: string,
  config: SyntheticDataConfig
): SyntheticScenario {
  const entries: PainEntry[] = [];
  const rng = new SeededRandom(config.seed);
  const profile = getProfileConfig(config.profile || 'mixed-condition');

  let currentDay = 0;

  // Generate normal baseline period
  const normalDays = Math.floor(config.days * 0.4);
  entries.push(...generateNormalUsage({
    ...config,
    days: normalDays,
    seed: rng.nextInt(0, 1000000),
  }));
  currentDay += normalDays;

  // Add crisis period if configured
  if (config.includeCrisisPeriods) {
    const crisisDays = Math.floor(config.days * 0.15);
    const crisisEntries = generateCrisisPeriod(crisisDays, rng.nextInt(0, 1000000));
    entries.push(...crisisEntries.map((e, i) => ({
      ...e,
      id: `synthetic-${currentDay + Math.floor(i / 4)}-${i % 4}`,
    })));
    currentDay += crisisDays;
  }

  // Add recovery period if configured
  if (config.includeRecoveryPeriods) {
    const recoveryDays = Math.floor(config.days * 0.25);
    const recoveryEntries = generateRecoveryPeriod(recoveryDays, rng.nextInt(0, 1000000));
    entries.push(...recoveryEntries.map((e, i) => ({
      ...e,
      id: `synthetic-${currentDay + Math.floor(i / 3)}-${i % 3}`,
    })));
    currentDay += recoveryDays;
  }

  // Add flare pattern if configured
  if (config.includeFlarePeriods) {
    const flareDays = Math.floor(config.days * 0.2);
    const flareEntries = generateFlarePeriod(flareDays, 7, rng.nextInt(0, 1000000));
    entries.push(...flareEntries.map((e, i) => ({
      ...e,
      id: `synthetic-${currentDay + Math.floor(i / 3)}-${i % 3}`,
    })));
  }

  // Determine expected patterns based on scenario
  const expectedPatterns: string[] = [];
  if (config.includeCrisisPeriods) expectedPatterns.push('crisis-period');
  if (config.includeRecoveryPeriods) expectedPatterns.push('recovery-trend');
  if (config.includeFlarePeriods) expectedPatterns.push('cyclical-flare');

  return {
    name,
    description: `Synthetic scenario: ${name} with ${entries.length} entries over ${config.days} days`,
    entries,
    expectedPatterns,
  };
}

/**
 * Main entry point - generates entries based on full configuration
 */
export function generateSyntheticEntries(
  days: number,
  entriesPerDay: number = 3,
  options?: Partial<SyntheticDataConfig>
): PainEntry[] {
  const config: SyntheticDataConfig = {
    days,
    entriesPerDay,
    profile: 'mixed-condition',
    ...options,
  };

  if (options?.includeCrisisPeriods || options?.includeRecoveryPeriods || options?.includeFlarePeriods) {
    return generateSyntheticScenario('full-scenario', config).entries;
  }

  return generateNormalUsage(config);
}

// ============================================================================
// Predefined Scenarios for Testing
// ============================================================================

export const PREDEFINED_SCENARIOS = {
  /** 30 days normal usage - typical user */
  normalUsage30Days: () => generateSyntheticScenario('normal-30-days', {
    days: 30,
    entriesPerDay: 3,
    profile: 'chronic-back-pain',
    seed: 12345,
  }),

  /** 90 days with all pattern types */
  fullPattern90Days: () => generateSyntheticScenario('full-pattern-90-days', {
    days: 90,
    entriesPerDay: 3,
    profile: 'fibromyalgia',
    includeCrisisPeriods: true,
    includeRecoveryPeriods: true,
    includeFlarePeriods: true,
    seed: 54321,
  }),

  /** Migraine patient - 60 days */
  migrainePattern: () => generateSyntheticScenario('migraine-60-days', {
    days: 60,
    entriesPerDay: 2,
    profile: 'migraine',
    includeFlarePeriods: true,
    seed: 98765,
  }),

  /** Post-surgical recovery - 45 days */
  postSurgicalRecovery: () => generateSyntheticScenario('post-surgical-45-days', {
    days: 45,
    entriesPerDay: 4,
    profile: 'post-surgical',
    includeRecoveryPeriods: true,
    seed: 11111,
  }),

  /** Crisis scenario - 14 days high intensity */
  crisisScenario: () => ({
    name: 'crisis-14-days',
    description: 'High-intensity crisis period simulation',
    entries: generateCrisisPeriod(14, 22222),
    expectedPatterns: ['crisis-period', 'high-severity'],
  }),

  /** Stress test - 365 days */
  yearLongUsage: () => generateSyntheticScenario('year-long-365-days', {
    days: 365,
    entriesPerDay: 3,
    profile: 'mixed-condition',
    includeCrisisPeriods: true,
    includeRecoveryPeriods: true,
    includeFlarePeriods: true,
    seed: 99999,
  }),
};

export type PredefinedScenarioName = keyof typeof PREDEFINED_SCENARIOS;
