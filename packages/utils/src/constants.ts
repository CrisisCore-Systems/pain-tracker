export const PAIN_LOCATIONS = [
  'head',
  'neck',
  'cervical spine',
  'shoulders',
  'upper back',
  'thoracic spine',
  'lower back',
  'lumbar spine',
  'chest',
  'abdomen',
  'hips',
  'knees',
  'ankles',
  'feet',
  'arms',
  'elbows',
  'wrists',
  'hands',
  'right leg',
  'left leg',
  'right foot',
  'left foot',
  'right toes',
  'left toes',
  'outer right leg',
  'outer left leg',
  'inner right leg',
  'inner left leg'
] as const;

export const SYMPTOMS = [
  'sharp',
  'dull',
  'dull ache',
  'aching',
  'burning',
  'tingling',
  'numbness',
  'stiffness',
  'weakness',
  'spasm',
  'swelling',
  'radiating',
  'throbbing',
  'pins and needles',
  'electric shock sensation',
  'hypersensitivity',
  'reduced sensation',
  'muscle weakness',
  'loss of reflexes',
  'cramping'
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
  ] as string[],
  HOUSEHOLD: [
    'cooking',
    'cleaning',
    'laundry',
    'shopping',
    'yard work',
    'home maintenance'
  ] as string[],
  WORK_RELATED: [
    'typing',
    'writing',
    'driving',
    'operating machinery',
    'physical labor',
    'prolonged sitting',
    'prolonged standing'
  ] as string[],
  SOCIAL: [
    'socializing',
    'dining out',
    'attending events',
    'traveling',
    'exercising',
    'hobbies',
    'sports'
  ] as string[],
  MOBILITY_AIDS: [
    'cane',
    'walker',
    'wheelchair',
    'crutches',
    'braces',
    'orthopedic shoes',
    'mobility scooter'
  ] as string[]
} as const;

export type PainLocation = typeof PAIN_LOCATIONS[number];
export type Symptom = typeof SYMPTOMS[number];
