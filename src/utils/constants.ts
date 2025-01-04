export const PAIN_LOCATIONS = [
  'head',
  'neck',
  'shoulders',
  'upper back',
  'lower back',
  'chest',
  'abdomen',
  'hips',
  'knees',
  'ankles',
  'feet',
  'arms',
  'elbows',
  'wrists',
  'hands'
] as const;

export const SYMPTOMS = [
  'sharp',
  'dull',
  'aching',
  'burning',
  'tingling',
  'numbness',
  'stiffness',
  'weakness',
  'spasm',
  'swelling',
  'radiating',
  'throbbing'
] as const;

export const ACTIVITIES = {
  BASIC: [
    'walking',
    'standing',
    'sitting',
    'bending',
    'lifting',
    'reaching',
    'climbing stairs'
  ],
  HOUSEHOLD: [
    'cooking',
    'cleaning',
    'laundry',
    'shopping',
    'yard work',
    'home maintenance'
  ],
  WORK_RELATED: [
    'typing',
    'writing',
    'driving',
    'operating machinery',
    'physical labor',
    'prolonged sitting',
    'prolonged standing'
  ]
} as const;

export type PainLocation = typeof PAIN_LOCATIONS[number];
export type Symptom = typeof SYMPTOMS[number]; 