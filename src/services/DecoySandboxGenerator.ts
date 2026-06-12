import type { PainEntry } from '../types';
import type { MoodEntry } from '../types/quantified-empathy';

const PAIN_LOCATIONS = [
  'lower-back',
  'upper-back',
  'neck',
  'shoulders',
  'knees',
  'hips',
  'wrists',
  'ankles',
];

const SYMPTOMS = [
  'aching',
  'burning',
  'stiffness',
  'numbness',
  'tingling',
  'tightness',
];

const ACTIVITIES = [
  'Morning stretches',
  'Evening walk',
  'Physical therapy',
  'Yoga session',
  'Rest day',
  'Light gardening',
  'Household chores',
];

const NOTE_TEMPLATES = [
  'Feeling okay today, just taking it slow.',
  'Had a rough night but managing.',
  'Good day overall, pain stayed manageable.',
  'Tried a new stretch routine, seems helpful.',
  'Medication timing seems to be working better.',
  'Weather changes definitely affect my symptoms.',
  'Regular check-in, nothing major to report.',
  'Had to cancel plans, pain flared up midday.',
  'Slight pull in lumbar region while lifting storage bins. Applied cold pack.',
  'Morning stiffness worked out after coffee and gentle movement.',
  'Knee felt stiff after sitting too long at desk.',
  'Routine day, just logging to stay consistent.',
  'No major changes, tracking steady at baseline.',
  'Sleep was better last night, feeling less tense.',
];

const MEDICATION_NAMES = [
  'Ibuprofen',
  'Acetaminophen',
  'Topical NSAID cream',
  'OTC pain reliever',
  'Magnesium supplement',
];

const MISSING_ENTRY_RATE = 0.12;

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDecoyNotes(): string {
  return randomElement(NOTE_TEMPLATES);
}

function applyTimeSkew(baseDate: Date): Date {
  const hourSkew = randomBetween(-6, 3);
  const minuteSkew = Math.random() < 0.3 ? randomBetween(0, 59) : randomBetween(0, 15);
  const skewed = new Date(baseDate.getTime());
  skewed.setHours(skewed.getHours() + hourSkew);
  skewed.setMinutes(skewed.getMinutes() + (Math.random() < 0.25 ? minuteSkew : 0));
  return skewed;
}

function shouldSkipEntry(): boolean {
  return Math.random() < MISSING_ENTRY_RATE;
}

function generateMedicationEntry(): {
  name: string;
  dosage: string;
  frequency: string;
  effectiveness: string;
} | undefined {
  if (Math.random() < 0.3) return undefined;
  
  const name = randomElement(MEDICATION_NAMES);
  const dosageOptions: Record<string, string> = {
    Ibuprofen: '200-400mg',
    Acetaminophen: '500mg',
    'Topical NSAID cream': 'As directed',
    'OTC pain reliever': '1-2 tablets',
    'Magnesium supplement': '250mg',
  };

  return {
    name,
    dosage: dosageOptions[name] ?? 'As needed',
    frequency: Math.random() < 0.5 ? 'as needed' : 'daily',
    effectiveness: randomBetween(4, 7) > 5 ? 'Good' : 'Fair',
  };
}

export function generateDecoySandbox(
  options?: {
    minDays?: number;
    maxDays?: number;
  }
): { entries: PainEntry[]; moodEntries: MoodEntry[] } {
  const minDays = options?.minDays ?? 30;
  const maxDays = options?.maxDays ?? 90;
  const dayCount = randomBetween(minDays, maxDays);

  const entries: PainEntry[] = [];
  const moodEntries: MoodEntry[] = [];

  for (let i = 0; i < dayCount; i++) {
    if (shouldSkipEntry()) continue;

    const daysAgo = i;
    const baseDate = new Date(Date.now() - daysAgo * 86400000);
    const skewedDate = applyTimeSkew(baseDate);
    const timestamp = skewedDate.toISOString();

    const pain = randomBetween(1, 8);
    const locations = [randomElement(PAIN_LOCATIONS)];
    const symptoms = [randomElement(SYMPTOMS)];

    const medication = generateMedicationEntry();

    entries.push({
      id: `decoy-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp,
      baselineData: {
        pain,
        locations,
        symptoms,
      },
      functionalImpact: {
        limitedActivities: pain > 6 ? [randomElement(ACTIVITIES)] : [],
        assistanceNeeded: pain > 7 ? ['Occasional'] : [],
        mobilityAids: [],
      },
      medications: {
        current: medication ? [medication] : [],
        changes: Math.random() < 0.1 ? 'Adjusted timing' : '',
        effectiveness: medication ? 'Moderate' : '',
      },
      treatments: {
        recent: [],
        effectiveness: '',
        planned: [],
      },
      qualityOfLife: {
        sleepQuality: randomBetween(3, 9),
        moodImpact: randomBetween(2, 7),
        socialImpact: pain > 6 ? ['Reduced social activities'] : [],
      },
      workImpact: {
        missedWork: pain > 7 ? randomBetween(0, 1) : 0,
        modifiedDuties: [],
        workLimitations: pain > 6 ? ['Need frequent breaks'] : [],
      },
      comparison: {
        worseningSince: '',
        newLimitations: [],
      },
      notes: generateDecoyNotes(),
    });

    moodEntries.push({
      id: i + 1,
      timestamp,
      mood: randomBetween(1, 10),
      energy: randomBetween(3, 9),
      anxiety: randomBetween(2, 7),
      stress: randomBetween(2, 6),
      hopefulness: randomBetween(4, 9),
      selfEfficacy: randomBetween(3, 8),
      emotionalClarity: randomBetween(3, 9),
      emotionalRegulation: randomBetween(3, 9),
      context: pain < 4 ? 'Routine day' : 'Pain management focus',
      triggers: pain > 5 ? ['Pain flare'] : [],
      copingStrategies: ['Breathing exercises', 'Grounding techniques'],
      socialSupport: 'moderate' as const,
      notes: pain < 4 ? 'Good day overall.' : 'Challenging but manageable.',
    });
  }

  return { entries, moodEntries };
}