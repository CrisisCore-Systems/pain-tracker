/**
 * 12-Month Chronic Pain Seed Data Generator
 * 
 * Simulates realistic daily life with chronic pain including:
 * - Baseline pain levels with natural variation
 * - Flare-up cycles (typically 3-7 days)
 * - Weather correlation patterns
 * - Medication effects and tolerance
 * - Sleep/pain feedback loops
 * - Work impact patterns
 * - Seasonal variations
 * - Treatment progression
 * - Good days and bad days
 */

import type { PainEntry } from '../types';
import type { MoodEntry } from '../types/quantified-empathy';

// ============================================================================
// Configuration Constants
// ============================================================================

const CHRONIC_PAIN_PROFILE = {
  // Base characteristics
  baselinePain: 5, // Average daily pain (0-10)
  painVariance: 1.5, // Daily fluctuation range
  condition: 'Chronic Lower Back Pain with Radiculopathy',
  injuryDate: '2024-11-15', // Approximately 12 months ago
  
  // Flare patterns
  flareFrequency: 0.15, // ~15% chance of flare starting any day
  flareDurationMin: 3,
  flareDurationMax: 7,
  flarePainIncrease: 2.5, // Pain increases during flares
  
  // Weather sensitivity (common in chronic pain)
  weatherSensitivity: 0.7, // How much weather affects pain
  
  // Sleep correlation
  sleepPainCorrelation: 0.6, // Poor sleep -> higher pain next day
  
  // Medication tolerance
  medicationEffectiveness: 0.7, // Starting effectiveness
  toleranceBuildup: 0.001, // Daily tolerance increase
  
  // Activity patterns
  overexertionThreshold: 7, // Activity level that triggers flare
  restBenefit: 0.3, // Pain reduction from rest days
};

// Pain locations and their frequencies
const PAIN_LOCATIONS = [
  { location: 'Lower Back', frequency: 0.95 },
  { location: 'Right Leg', frequency: 0.7 },
  { location: 'Left Leg', frequency: 0.4 },
  { location: 'Right Hip', frequency: 0.5 },
  { location: 'Neck', frequency: 0.3 },
  { location: 'Shoulders', frequency: 0.25 },
];

const SYMPTOMS = {
  baseline: ['Aching', 'Stiffness', 'Tightness'],
  moderate: ['Sharp pain', 'Burning', 'Throbbing', 'Muscle spasms'],
  severe: ['Radiating pain', 'Numbness', 'Tingling', 'Shooting pain', 'Weakness'],
};

const TRIGGERS = [
  'Prolonged sitting',
  'Standing too long',
  'Weather change',
  'Poor sleep',
  'Stress',
  'Physical activity',
  'Lifting',
  'Bending',
  'Cold weather',
  'Damp weather',
  'Overexertion',
  'Missed medication',
  'Work stress',
  'Long commute',
];

const ACTIVITIES_AFFECTED = {
  mild: ['Running', 'Heavy lifting', 'Sports'],
  moderate: ['Walking long distances', 'Household chores', 'Gardening', 'Shopping'],
  severe: ['Sitting', 'Standing', 'Walking', 'Dressing', 'Bathing', 'Sleeping'],
};

const RELIEF_METHODS = [
  'Rest',
  'Ice pack',
  'Heat therapy',
  'Stretching',
  'Pain medication',
  'Muscle relaxant',
  'TENS unit',
  'Massage',
  'Hot bath',
  'Lying down',
  'Walking slowly',
  'Gentle yoga',
];

const PAIN_QUALITIES = {
  mild: ['Aching', 'Stiff', 'Tight', 'Sore'],
  moderate: ['Sharp', 'Burning', 'Throbbing', 'Cramping', 'Pinching'],
  severe: ['Shooting', 'Stabbing', 'Radiating', 'Electric', 'Numbing', 'Pins and needles'],
};

const ACTIVITIES_DONE = {
  low: ['Resting', 'Short walk', 'Gentle stretching', 'Heat/ice routine', 'Light meal prep'],
  moderate: [
    'Physio exercises',
    'Household chores',
    'Grocery run',
    'Desk work',
    'Driving/commute',
    'Laundry',
    'Cooking',
  ],
  high: ['Longer walk', 'Errands (multiple stops)', 'Gardening (light)', 'Cleaning (deeper)', 'Social outing'],
};

const SOCIAL_IMPACTS = [
  'Cancelled plans with friends',
  'Skipped family event',
  'Reduced social activities',
  'Avoided going out',
  'Unable to attend event',
  'Limited time with family',
  'Missed celebration',
  'Avoided physical activities with others',
];

// ============================================================================
// Utility Functions
// ============================================================================

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function gaussianRandom(random: () => number, mean: number, stdDev: number): number {
  const u1 = random();
  const u2 = random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdDev;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function pickRandom<T>(array: T[], random: () => number): T {
  return array[Math.floor(random() * array.length)];
}

function pickMultiple<T>(array: T[], count: number, random: () => number): T[] {
  const shuffled = [...array].sort(() => random() - 0.5);
  return shuffled.slice(0, count);
}

function getWeatherFactor(dayOfYear: number, random: () => number): number {
  // Simulate weather patterns - worse in winter/rainy seasons
  const seasonalBase = Math.sin((dayOfYear / 365) * 2 * Math.PI - Math.PI / 2) * 0.45;
  const winterBoost = dayOfYear < 60 || dayOfYear > 330 ? 0.15 : 0;
  const dailyVariation = (random() - 0.5) * 0.35;
  // Occasional "bad weather" days
  const badWeatherChance = random() < 0.12 ? 0.5 : 0;
  return seasonalBase + winterBoost + dailyVariation + badWeatherChance;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))];
}

function buildSyntheticWeatherSummary(
  dayOfYear: number,
  hour: number,
  entryPain: number,
  weatherFactor: number,
  random: () => number
): string {
  // Temperature follows a yearly cycle; then bias "worse" weather to align with higher pain.
  // This makes the Weather Correlations panel meaningful without requiring network fetches.
  const seasonalTemp = 13 + Math.sin((dayOfYear / 365) * 2 * Math.PI - Math.PI / 2) * 10; // ~3°C..23°C
  const diurnalAdjustment = hour < 10 ? -2 : hour > 18 ? -1 : 0; // mornings coolest
  const painTempBias = entryPain >= 7 ? -3 : entryPain <= 3 ? 1 : 0;
  const temp = clamp(
    Math.round(seasonalTemp + diurnalAdjustment + painTempBias + gaussianRandom(random, 0, 2)),
    -15,
    35
  );

  const baseHumidity = 55 + (random() - 0.5) * 20;
  const humidityBias = entryPain >= 7 ? 18 : entryPain <= 3 ? -8 : 0;
  const humidity = clamp(Math.round(baseHumidity + humidityBias + weatherFactor * 20), 20, 98);

  const rainChance =
    0.18 +
    Math.max(0, weatherFactor) * 0.35 +
    (temp <= 8 ? 0.12 : 0) +
    (entryPain >= 7 ? 0.25 : 0);
  const isRaining = random() < clamp(rainChance, 0, 0.9);

  const condition = isRaining
    ? pickRandom(['Light rain', 'Rain', 'Showers', 'Drizzle'], random)
    : temp >= 25
      ? pickRandom(['Clear', 'Sunny', 'Partly cloudy'], random)
      : temp <= 5
        ? pickRandom(['Overcast', 'Cloudy', 'Fog'], random)
        : pickRandom(['Partly cloudy', 'Cloudy', 'Overcast'], random);

  const parts: string[] = [];
  parts.push(`${temp}°C`);
  parts.push(condition);
  if (isRaining) parts.push('🌧️');
  parts.push(`${humidity}% humidity`);
  return parts.join(', ');
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatDate(date: Date): string {
  return date.toISOString();
}

// ============================================================================
// Main Generator
// ============================================================================

export interface ChronicPainSeedOptions {
  startDate?: Date;
  endDate?: Date;
  entriesPerDay?: number; // 1-3, averaging multiple check-ins
  seed?: number;
  includeDetailedNotes?: boolean;
}

export function generateChronicPain12MonthData(
  options: ChronicPainSeedOptions = {}
): { painEntries: PainEntry[]; moodEntries: MoodEntry[] } {
  const {
    startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 12 months ago
    endDate = new Date(),
    entriesPerDay = 1.5, // Average 1-2 entries per day
    seed = 42,
    includeDetailedNotes = true,
  } = options;

  const random = seededRandom(seed);
  const painEntries: PainEntry[] = [];
  const moodEntries: MoodEntry[] = [];

  // State tracking
  let currentFlare = false;
  let flareDaysRemaining = 0;
  let previousSleepQuality = 6;
  let medicationTolerance = 0;
  let consecutiveHighPainDays = 0;
  let entryId = 1;
  let moodId = 1;

  // Medications - evolve over time
  const medicationHistory = [
    { name: 'Naproxen', dosage: '500mg', frequency: 'Twice daily', startDay: 0 },
    { name: 'Cyclobenzaprine', dosage: '10mg', frequency: 'At bedtime', startDay: 14 },
    { name: 'Gabapentin', dosage: '300mg', frequency: 'Three times daily', startDay: 60 },
  ];

  // Treatment history
  const treatmentMilestones = [
    { day: 7, treatment: 'Initial GP consultation', provider: 'Family Doctor' },
    { day: 21, treatment: 'Physiotherapy started', provider: 'City Physio Clinic' },
    { day: 45, treatment: 'MRI scan', provider: 'Imaging Center' },
    { day: 60, treatment: 'Pain specialist consultation', provider: 'Pain Management Clinic' },
    { day: 90, treatment: 'Epidural steroid injection', provider: 'Pain Management Clinic' },
    { day: 150, treatment: 'Second epidural injection', provider: 'Pain Management Clinic' },
    { day: 200, treatment: 'Acupuncture trial', provider: 'Wellness Center' },
    { day: 270, treatment: 'Chronic pain program enrolled', provider: 'Rehabilitation Hospital' },
  ];

  let currentDay = new Date(startDate);
  let dayNumber = 0;

  while (currentDay <= endDate) {
    const dayOfYear = getDayOfYear(currentDay);
    const isWeekendDay = isWeekend(currentDay);

    // Weather factor
    const weatherFactor = getWeatherFactor(dayOfYear, random);

    // Check for flare start/continuation
    if (!currentFlare && random() < CHRONIC_PAIN_PROFILE.flareFrequency) {
      currentFlare = true;
      flareDaysRemaining =
        Math.floor(
          random() *
            (CHRONIC_PAIN_PROFILE.flareDurationMax - CHRONIC_PAIN_PROFILE.flareDurationMin + 1)
        ) + CHRONIC_PAIN_PROFILE.flareDurationMin;
    }

    if (currentFlare) {
      flareDaysRemaining--;
      if (flareDaysRemaining <= 0) {
        currentFlare = false;
      }
    }

    // Calculate base pain for the day
    let basePain = gaussianRandom(
      random,
      CHRONIC_PAIN_PROFILE.baselinePain,
      CHRONIC_PAIN_PROFILE.painVariance
    );

    // Apply modifiers
    if (currentFlare) {
      basePain += CHRONIC_PAIN_PROFILE.flarePainIncrease * (1 + random() * 0.5);
    }

    // Weather effect
    basePain += weatherFactor * CHRONIC_PAIN_PROFILE.weatherSensitivity * 2;

    // Sleep correlation (poor sleep yesterday = more pain today)
    if (previousSleepQuality < 5) {
      basePain += (5 - previousSleepQuality) * 0.3;
    }

    // Weekend bonus (often slightly better due to rest)
    if (isWeekendDay) {
      basePain -= random() * 0.5;
    }

    // Medication tolerance over time
    medicationTolerance += CHRONIC_PAIN_PROFILE.toleranceBuildup;
    const medEffectiveness = Math.max(
      0.3,
      CHRONIC_PAIN_PROFILE.medicationEffectiveness - medicationTolerance
    );
    basePain -= medEffectiveness * 1.5;

    // Recovery trend over 12 months (slight improvement)
    const recoveryFactor = Math.min(0.5, dayNumber / 365 * 0.5);
    basePain -= recoveryFactor;

    basePain = clamp(Math.round(basePain * 10) / 10, 1, 10);

    // Track consecutive high pain days
    if (basePain >= 7) {
      consecutiveHighPainDays++;
    } else {
      consecutiveHighPainDays = Math.max(0, consecutiveHighPainDays - 1);
    }

    // Determine number of entries for this day
    const numEntries =
      basePain >= 7
        ? Math.ceil(entriesPerDay + random())
        : random() < entriesPerDay % 1
          ? Math.ceil(entriesPerDay)
          : Math.floor(entriesPerDay);

    // Generate entries for the day
    for (let e = 0; e < numEntries; e++) {
      // Time of day affects pain (often worse in morning, improves midday, worse evening)
      const hour = e === 0 ? 8 + Math.floor(random() * 2) : 14 + Math.floor(random() * 6);
      const entryTime = new Date(currentDay);
      entryTime.setHours(hour, Math.floor(random() * 60), 0, 0);

      // Morning stiffness factor
      let entryPain = basePain;
      if (hour < 10) {
        entryPain += 0.5 + random() * 0.5; // Morning stiffness
      } else if (hour > 18) {
        entryPain += random() * 0.5; // Evening fatigue
      }

      // Synthetic weather summary (string field used by WeatherCorrelationPanel)
      const weather = buildSyntheticWeatherSummary(dayOfYear, hour, entryPain, weatherFactor, random);
      entryPain = clamp(Math.round(entryPain * 10) / 10, 1, 10);

      // Select locations based on pain level and frequency
      const numLocations = Math.min(
        PAIN_LOCATIONS.length,
        Math.max(1, Math.floor(entryPain / 3) + 1)
      );
      const locations = PAIN_LOCATIONS.filter((l) => random() < l.frequency)
        .slice(0, numLocations)
        .map((l) => l.location);
      if (locations.length === 0) locations.push('Lower Back');

      // Select symptoms based on severity
      let symptoms: string[];
      if (entryPain <= 4) {
        symptoms = pickMultiple(SYMPTOMS.baseline, 2, random);
      } else if (entryPain <= 6) {
        symptoms = [
          ...pickMultiple(SYMPTOMS.baseline, 1, random),
          ...pickMultiple(SYMPTOMS.moderate, 2, random),
        ];
      } else {
        symptoms = [
          ...pickMultiple(SYMPTOMS.moderate, 2, random),
          ...pickMultiple(SYMPTOMS.severe, 2, random),
        ];
      }

      // Triggers for the day
      const numTriggers = Math.floor(random() * 3) + 1;
      const triggers = pickMultiple(TRIGGERS, numTriggers, random);

      // Activity limitations
      let limitedActivities: string[];
      if (entryPain <= 4) {
        limitedActivities = pickMultiple(ACTIVITIES_AFFECTED.mild, 2, random);
      } else if (entryPain <= 6) {
        limitedActivities = [
          ...ACTIVITIES_AFFECTED.mild,
          ...pickMultiple(ACTIVITIES_AFFECTED.moderate, 2, random),
        ];
      } else {
        limitedActivities = [
          ...ACTIVITIES_AFFECTED.mild,
          ...ACTIVITIES_AFFECTED.moderate,
          ...pickMultiple(ACTIVITIES_AFFECTED.severe, Math.floor(entryPain - 5), random),
        ];
      }

      // Assistance needed
      const assistanceNeeded: string[] = [];
      if (entryPain >= 7) {
        assistanceNeeded.push('Getting out of bed');
        if (entryPain >= 8) assistanceNeeded.push('Getting dressed', 'Household tasks');
        if (entryPain >= 9) assistanceNeeded.push('Bathing', 'Meal preparation');
      }

      // Mobility aids
      const mobilityAids: string[] = [];
      if (entryPain >= 6) mobilityAids.push('Cane');
      if (entryPain >= 8) mobilityAids.push('Back brace');

      // Current medications based on day
      const currentMeds = medicationHistory
        .filter((m) => m.startDay <= dayNumber)
        .map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          effectiveness:
            entryPain <= 5
              ? 'Good relief'
              : entryPain <= 7
                ? 'Moderate relief'
                : 'Minimal relief',
        }));

      // Sleep quality (inversely related to previous day's pain)
      const sleepQuality = clamp(
        Math.round(
          gaussianRandom(random, 10 - basePain * 0.7, 1.5)
        ),
        1,
        10
      );
      previousSleepQuality = sleepQuality;

      // Mood impact
      const moodImpact = clamp(
        Math.round(10 - entryPain * 0.8 + (random() - 0.5) * 2),
        1,
        10
      );

      // Extended analytics fields (optional in schema)
      const activityBaseline =
        (isWeekendDay ? 5.5 : 6.5) + (hour >= 12 && hour < 18 ? 0.5 : 0) - (hour < 10 ? 0.7 : 0);
      const activityLevel = clamp(
        Math.round(gaussianRandom(random, activityBaseline - entryPain * 0.45 + (random() - 0.5), 1.6)),
        0,
        10
      );

      const stressBaseline =
        (isWeekendDay ? 4.5 : 6) + (entryPain >= 7 && !isWeekendDay ? 1.2 : 0) + (weatherFactor > 0.25 ? 0.8 : 0);
      const stress = clamp(
        Math.round(gaussianRandom(random, stressBaseline + entryPain * 0.35 + (random() - 0.5), 1.7)),
        0,
        10
      );

      const qualityPool = entryPain >= 7 ? PAIN_QUALITIES.severe : entryPain >= 5 ? PAIN_QUALITIES.moderate : PAIN_QUALITIES.mild;
      const qualityCount = entryPain >= 8 ? 3 : entryPain >= 6 ? 2 : 1;
      const quality = uniqueStrings([
        ...pickMultiple(qualityPool, qualityCount, random),
        ...(hour < 10 ? ['Stiff'] : []),
        ...(symptoms.some(s => s.toLowerCase().includes('burn')) ? ['Burning'] : []),
        ...(symptoms.some(s => s.toLowerCase().includes('shoot') || s.toLowerCase().includes('radiat')) ? ['Shooting', 'Radiating'] : []),
      ]).slice(0, 4);

      const reliefIntensity = entryPain >= 8 ? 3 : entryPain >= 6 ? 2 : entryPain >= 4 ? 1 : 0;
      const reliefMethods =
        reliefIntensity === 0
          ? random() < 0.45
            ? pickMultiple(RELIEF_METHODS, 1, random)
            : []
          : uniqueStrings([
              'Rest',
              ...(sleepQuality <= 5 ? ['Heat therapy'] : []),
              ...pickMultiple(RELIEF_METHODS, reliefIntensity, random),
            ]).slice(0, 4);

      const activityCount = activityLevel >= 7 ? 3 : activityLevel >= 4 ? 2 : 1;
      const activityPool =
        activityLevel >= 7
          ? [...ACTIVITIES_DONE.moderate, ...ACTIVITIES_DONE.high]
          : activityLevel >= 4
            ? [...ACTIVITIES_DONE.low, ...ACTIVITIES_DONE.moderate]
            : ACTIVITIES_DONE.low;
      const activities = uniqueStrings(pickMultiple(activityPool, activityCount, random)).slice(0, 4);

      // Social impact
      const socialImpact: string[] = [];
      if (entryPain >= 6 && random() < 0.4) {
        socialImpact.push(...pickMultiple(SOCIAL_IMPACTS, Math.floor(entryPain / 3), random));
      }

      // Work impact
      const missedWork = isWeekendDay
        ? 0
        : entryPain >= 8
          ? 1
          : entryPain >= 7 && random() < 0.5
            ? 1
            : 0;

      const workLimitations: string[] = [];
      if (!isWeekendDay && entryPain >= 5) {
        workLimitations.push('Cannot sit for long periods');
        if (entryPain >= 6) workLimitations.push('Limited standing', 'Cannot lift');
        if (entryPain >= 7) workLimitations.push('Frequent breaks needed', 'Reduced concentration');
      }

      const modifiedDuties: string[] = [];
      if (!isWeekendDay && entryPain >= 5 && missedWork === 0) {
        modifiedDuties.push('Desk-based tasks only');
        if (entryPain >= 6) modifiedDuties.push('Reduced hours');
      }

      // Recent treatments
      const recentTreatment = treatmentMilestones.find(
        (t) => dayNumber >= t.day && dayNumber < t.day + 14
      );
      const recentTreatments = recentTreatment
        ? [
            {
              type: recentTreatment.treatment,
              provider: recentTreatment.provider,
              date: formatDate(currentDay),
              effectiveness: 'Ongoing assessment',
            },
          ]
        : dayNumber > 21
          ? [
              {
                type: 'Physiotherapy',
                provider: 'City Physio Clinic',
                date: formatDate(currentDay),
                effectiveness:
                  entryPain <= 5
                    ? 'Helping with mobility'
                    : 'Maintaining function',
              },
            ]
          : [];

      // Generate detailed notes
      let notes = '';
      if (includeDetailedNotes) {
        const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
        const painDesc =
          entryPain <= 3
            ? 'manageable'
            : entryPain <= 5
              ? 'moderate'
              : entryPain <= 7
                ? 'difficult'
                : 'severe';

        notes = `${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} check-in. Pain is ${painDesc} today (${entryPain}/10). `;

        if (currentFlare) {
          notes += `Currently in a flare-up (day ${CHRONIC_PAIN_PROFILE.flareDurationMax - flareDaysRemaining + 1}). `;
        }

        if (weatherFactor > 0.3) {
          notes += 'Weather seems to be affecting pain levels. ';
        }

        if (sleepQuality < 5) {
          notes += `Poor sleep last night (${sleepQuality}/10). `;
        }

        if (triggers.length > 0) {
          notes += `Main triggers: ${triggers.slice(0, 2).join(', ')}. `;
        }

        if (entryPain >= 7) {
          notes += 'Struggling with daily activities today. ';
        }

        if (random() < 0.3) {
          const reliefUsed = pickMultiple(RELIEF_METHODS, 2, random);
          notes += `Using ${reliefUsed.join(' and ')} for relief. `;
        }
      }

      // Comparison data
      const comparison = {
        worseningSince:
          consecutiveHighPainDays > 3
            ? `Pain has been elevated for ${consecutiveHighPainDays} days`
            : dayNumber < 30
              ? 'Initial injury still healing'
              : entryPain > CHRONIC_PAIN_PROFILE.baselinePain + 1
                ? 'Above baseline today'
                : 'Consistent with baseline',
        newLimitations:
          entryPain >= 7 && consecutiveHighPainDays > 2
            ? pickMultiple(
                ['Increased difficulty walking', 'New numbness patterns', 'Worse morning stiffness'],
                Math.floor(random() * 2) + 1,
                random
              )
            : [],
      };

      const entry: PainEntry = {
        id: entryId++,
        timestamp: formatDate(entryTime),
        baselineData: {
          pain: entryPain,
          locations,
          symptoms,
        },
        triggers,
        weather,
        quality,
        reliefMethods,
        activityLevel,
        stress,
        activities,
        functionalImpact: {
          limitedActivities,
          assistanceNeeded,
          mobilityAids,
        },
        medications: {
          current: currentMeds,
          changes:
            dayNumber === 14
              ? 'Added muscle relaxant'
              : dayNumber === 60
                ? 'Started gabapentin for nerve pain'
                : '',
          effectiveness:
            entryPain <= 5
              ? 'Good relief'
              : entryPain <= 7
                ? 'Moderate relief'
                : 'Minimal relief',
        },
        treatments: {
          recent: recentTreatments,
          effectiveness:
            dayNumber < 21
              ? 'Too early to assess'
              : entryPain <= 5
                ? 'Seeing improvement'
                : 'Maintaining function',
          planned:
            dayNumber < 45
              ? ['MRI scheduled']
              : dayNumber < 90
                ? ['Epidural injection scheduled']
                : ['Ongoing physiotherapy'],
        },
        qualityOfLife: {
          sleepQuality,
          moodImpact,
          socialImpact,
        },
        workImpact: {
          missedWork,
          modifiedDuties,
          workLimitations,
        },
        comparison,
        notes: notes.trim(),
      };

      painEntries.push(entry);

      // Generate corresponding mood entry (not for every pain entry)
      if (e === 0 || random() < 0.3) {
        const moodScore = clamp(
          Math.round(10 - entryPain * 0.6 - (currentFlare ? 1 : 0) + (random() - 0.5) * 2),
          1,
          10
        );

        const moodNotes: string[] = [];
        if (moodScore <= 3) {
          moodNotes.push('Feeling overwhelmed by pain');
        } else if (moodScore <= 5) {
          moodNotes.push('Managing but struggling');
        } else if (moodScore <= 7) {
          moodNotes.push('Coping okay today');
        } else {
          moodNotes.push('Good day despite pain');
        }

        if (sleepQuality < 5) moodNotes.push('Tired from poor sleep');
        if (currentFlare) moodNotes.push('Flare-up affecting mood');
        if (isWeekendDay && moodScore >= 5) moodNotes.push('Nice to rest on weekend');

        // Energy inversely related to pain
        const energy = clamp(Math.round(10 - entryPain * 0.7 + (random() - 0.5) * 2), 1, 10);
        // Anxiety increases with pain
        const anxiety = clamp(Math.round(entryPain * 0.6 + (currentFlare ? 2 : 0) + (random() - 0.5) * 2), 1, 10);
        // Stress correlates with pain and work
        const stress = clamp(Math.round(entryPain * 0.5 + (!isWeekendDay ? 1 : 0) + (random() - 0.5) * 2), 1, 10);
        // Hopefulness - tends to improve over time with treatment
        const hopefulness = clamp(Math.round(5 + (dayNumber / 365) * 2 - (currentFlare ? 2 : 0) + (random() - 0.5) * 3), 1, 10);
        // Self-efficacy grows with treatment experience
        const selfEfficacy = clamp(Math.round(4 + (dayNumber / 365) * 3 + (random() - 0.5) * 2), 1, 10);
        // Emotional clarity
        const emotionalClarity = clamp(Math.round(5 + (random() - 0.5) * 3), 1, 10);
        // Emotional regulation improves with time
        const emotionalRegulation = clamp(Math.round(4 + (dayNumber / 365) * 2 + (random() - 0.5) * 2), 1, 10);

        // Context based on time of day and pain
        const contexts = [
          'At home resting',
          'After work',
          'Morning routine',
          'Evening wind-down',
          'During flare-up',
          'Recovering from activity',
          'Post-physiotherapy',
        ];
        const context = entryPain >= 7 
          ? 'During flare-up' 
          : pickRandom(contexts.slice(0, 4), random);

        // Coping strategies used
        const allCopingStrategies = [
          'Deep breathing',
          'Meditation',
          'Distraction with TV/reading',
          'Gentle stretching',
          'Talking to family',
          'Pacing activities',
          'Heat/ice therapy',
          'Short walks',
          'Mindfulness',
          'Journaling',
        ];
        const copingStrategies = pickMultiple(allCopingStrategies, Math.floor(random() * 3) + 1, random);

        // Social support level
        const socialSupport: 'none' | 'minimal' | 'moderate' | 'strong' = 
          moodScore >= 7 ? 'strong' :
          moodScore >= 5 ? 'moderate' :
          moodScore >= 3 ? 'minimal' : 'none';

        moodEntries.push({
          id: moodId++,
          timestamp: formatDate(entryTime),
          mood: moodScore,
          energy,
          anxiety,
          stress,
          hopefulness,
          selfEfficacy,
          emotionalClarity,
          emotionalRegulation,
          context,
          triggers: triggers.slice(0, 2),
          copingStrategies,
          socialSupport,
          notes: moodNotes.join('. ') + '.',
        });
      }
    }

    // Move to next day
    currentDay = new Date(currentDay.getTime() + 24 * 60 * 60 * 1000);
    dayNumber++;
  }

  return { painEntries, moodEntries };
}

// ============================================================================
// Pre-generated Dataset Export
// ============================================================================

const generatedData = generateChronicPain12MonthData({
  seed: 20241204, // Deterministic seed for consistency
  entriesPerDay: 1.3, // ~1-2 entries per day = ~400-500 entries total
  includeDetailedNotes: true,
});

// More comprehensive year dataset (higher density) for stress-testing UI/analytics
const generatedComprehensiveYearData = generateChronicPain12MonthData({
  seed: 20250110,
  entriesPerDay: 2.0, // ~2 entries per day = ~700+ entries total
  includeDetailedNotes: true,
});

export const chronicPain12MonthPainEntries: PainEntry[] = generatedData.painEntries;
export const chronicPain12MonthMoodEntries: MoodEntry[] = generatedData.moodEntries;

export const comprehensive365DayPainEntries: PainEntry[] = generatedComprehensiveYearData.painEntries;
export const comprehensive365DayMoodEntries: MoodEntry[] = generatedComprehensiveYearData.moodEntries;

// Summary stats for verification
export const chronicPainDataStats = {
  totalPainEntries: generatedData.painEntries.length,
  totalMoodEntries: generatedData.moodEntries.length,
  dateRange: {
    start: generatedData.painEntries[0]?.timestamp,
    end: generatedData.painEntries[generatedData.painEntries.length - 1]?.timestamp,
  },
  averagePain:
    generatedData.painEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) /
    generatedData.painEntries.length,
  highPainDays: generatedData.painEntries.filter((e) => e.baselineData.pain >= 7).length,
  flareDays: generatedData.painEntries.filter((e) => e.baselineData.pain >= 8).length,
};

export const comprehensive365DayDataStats = {
  totalPainEntries: generatedComprehensiveYearData.painEntries.length,
  totalMoodEntries: generatedComprehensiveYearData.moodEntries.length,
  dateRange: {
    start: generatedComprehensiveYearData.painEntries[0]?.timestamp,
    end: generatedComprehensiveYearData.painEntries[generatedComprehensiveYearData.painEntries.length - 1]?.timestamp,
  },
  averagePain:
    generatedComprehensiveYearData.painEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) /
    generatedComprehensiveYearData.painEntries.length,
  highPainDays: generatedComprehensiveYearData.painEntries.filter((e) => e.baselineData.pain >= 7).length,
  flareDays: generatedComprehensiveYearData.painEntries.filter((e) => e.baselineData.pain >= 8).length,
};

console.log('[Chronic Pain Seed Data] Generated:', chronicPainDataStats);
