export const PAIN_LOCATIONS = [
  // Head & Neck
  'head',
  'neck',
  'cervical spine',
  // Upper Body
  'shoulders',
  'upper back',
  'thoracic spine',
  'lower back',
  'lumbar spine',
  'chest',
  'abdomen',
  // Arms & Hands
  'left arm',
  'right arm',
  'left elbow',
  'right elbow',
  'left forearm',
  'right forearm',
  'left wrist',
  'right wrist',
  'left hand',
  'right hand',
  // Hips & Pelvis
  'hips',
  'left hip',
  'right hip',
  // Upper Legs
  'left thigh',
  'right thigh',
  'inner left thigh',
  'inner right thigh',
  'outer left thigh',
  'outer right thigh',
  // Knees (detailed for nerve pain)
  'left knee',
  'right knee',
  'inner left knee',
  'inner right knee',
  'outer left knee',
  'outer right knee',
  // Lower Legs (detailed for nerve pain)
  'left shin',
  'right shin',
  'left shin front',
  'right shin front',
  'left shin back',
  'right shin back',
  'left calf',
  'right calf',
  // Ankles
  'left ankle',
  'right ankle',
  // Feet (medial/lateral for nerve pain)
  'left foot',
  'right foot',
  'left foot medial',
  'right foot medial',
  'left foot lateral',
  'right foot lateral',
  // Toes (medial/lateral for nerve pain)
  'left toes',
  'right toes',
  'left toes medial',
  'right toes medial',
  'left toes lateral',
  'right toes lateral',
  // Legacy compatibility
  'arms',
  'elbows',
  'wrists',
  'hands',
  'knees',
  'ankles',
  'feet',
  'right leg',
  'left leg',
  'outer right leg',
  'outer left leg',
  'inner right leg',
  'inner left leg',
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
  'cramping',
] as const;

export const ACTIVITIES = {
  BASIC: [
    'walking',
    'standing',
    'sitting',
    'bending',
    'lifting',
    'reaching',
    'climbing stairs',
  ] as string[],
  HOUSEHOLD: [
    'cooking',
    'cleaning',
    'laundry',
    'shopping',
    'yard work',
    'home maintenance',
  ] as string[],
  WORK_RELATED: [
    'typing',
    'writing',
    'driving',
    'operating machinery',
    'physical labor',
    'prolonged sitting',
    'prolonged standing',
  ] as string[],
  SOCIAL: [
    'socializing',
    'dining out',
    'attending events',
    'traveling',
    'exercising',
    'hobbies',
    'sports',
  ] as string[],
  MOBILITY_AIDS: [
    'cane',
    'walker',
    'wheelchair',
    'crutches',
    'braces',
    'orthopedic shoes',
    'mobility scooter',
  ] as string[],
} as const;

export type PainLocation = (typeof PAIN_LOCATIONS)[number];
export type Symptom = (typeof SYMPTOMS)[number];

export const PAIN_TRIGGERS = [
  // Environmental
  'weather change',
  'cold weather',
  'hot weather',
  'humidity',
  'barometric pressure',
  // Physical
  'physical activity',
  'prolonged sitting',
  'prolonged standing',
  'lifting',
  'repetitive motion',
  'lack of sleep',
  'poor sleep',
  // Emotional/Mental
  'stress',
  'anxiety',
  'emotional distress',
  'overexertion',
  // Dietary
  'certain foods',
  'alcohol',
  'caffeine',
  'dehydration',
  // Other
  'travel',
  'work',
  'menstrual cycle',
  'illness',
  'medication change',
] as const;

export const RELIEF_METHODS = [
  // Medications
  'over-the-counter pain relievers',
  'prescription medication',
  'topical creams',
  // Physical
  'rest',
  'heat therapy',
  'cold therapy',
  'stretching',
  'exercise',
  'massage',
  'physical therapy exercises',
  // Relaxation
  'deep breathing',
  'meditation',
  'relaxation techniques',
  // Other
  'position change',
  'elevation',
  'compression',
  'distraction',
  'sleep',
] as const;

export type PainTrigger = (typeof PAIN_TRIGGERS)[number];
export type ReliefMethod = (typeof RELIEF_METHODS)[number];

export const PAIN_QUALITIES = [
  // Acute descriptors
  'sharp',
  'stabbing',
  'shooting',
  'piercing',
  // Dull descriptors
  'dull',
  'aching',
  'throbbing',
  'pounding',
  // Burning/Heat
  'burning',
  'hot',
  'searing',
  // Cold/Tingling
  'cold',
  'tingling',
  'pins and needles',
  'numbness',
  // Pressure
  'pressure',
  'squeezing',
  'crushing',
  'tight',
  // Other sensations
  'radiating',
  'constant',
  'intermittent',
  'cramping',
  'stiff',
  'sore',
  'tender',
  'raw',
] as const;

export type PainQuality = (typeof PAIN_QUALITIES)[number];

// Flat array of physical activities for easy selection
export const PHYSICAL_ACTIVITIES = [
  // Basic movement
  'walking',
  'standing',
  'sitting',
  'lying down',
  'bending',
  'lifting',
  'reaching',
  'climbing stairs',
  // Exercise
  'stretching',
  'light exercise',
  'moderate exercise',
  'intense exercise',
  'swimming',
  'cycling',
  'yoga',
  'physical therapy',
  // Daily activities
  'cooking',
  'cleaning',
  'shopping',
  'driving',
  'gardening',
  'work tasks',
  // Sedentary
  'desk work',
  'watching TV',
  'reading',
  'minimal activity',
] as const;

export type PhysicalActivity = (typeof PHYSICAL_ACTIVITIES)[number];
