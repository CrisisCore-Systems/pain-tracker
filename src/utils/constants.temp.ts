interface Activities {
  BASIC: string[];
  HOUSEHOLD: string[];
  WORK_RELATED: string[];
  SOCIAL: string[];
  MOBILITY_AIDS: string[];
}

interface AssistanceLevels {
  INDEPENDENT: string;
  MODIFIED: string;
  ASSISTANCE: string;
  UNABLE: string;
}

interface Medications {
  TYPES: string[];
  FREQUENCY: string[];
  EFFECTIVENESS: string[];
}

interface Interventions {
  TYPES: string[];
  FREQUENCY: string[];
  STATUS: string[];
}

interface ComparisonMetrics {
  PAIN_LEVEL: string;
  FREQUENCY: string;
  DURATION: string;
  LIMITATIONS: string;
  WORK_IMPACT: string;
  TREATMENT_NEEDS: string;
}

interface WorkStatus {
  REGULAR_DUTIES: string;
  MODIFIED_DUTIES: string;
  UNABLE_TO_WORK: string;
  PARTIALLY_DISABLED: string;
  FULLY_DISABLED: string;
}

export const BASELINE_YEAR: number = 2019;

export const PAIN_LOCATIONS: string[] = [
  // Head and Neck
  "Head", "Temples", "Jaw", "Neck (Left)", "Neck (Right)", "Neck (Back)",
  // Upper Body
  "Shoulder (Left)", "Shoulder (Right)", 
  "Upper Back (Left)", "Upper Back (Right)",
  "Arm (Left)", "Arm (Right)",
  "Elbow (Left)", "Elbow (Right)",
  "Wrist (Left)", "Wrist (Right)",
  "Hand (Left)", "Hand (Right)",
  // Torso
  "Chest", "Upper Back", "Middle Back", "Lower Back",
  "Abdomen", "Ribs (Left)", "Ribs (Right)",
  // Lower Body
  "Hip (Left)", "Hip (Right)",
  "Leg (Left)", "Leg (Right)",
  "Knee (Left)", "Knee (Right)",
  "Ankle (Left)", "Ankle (Right)",
  "Foot (Left)", "Foot (Right)"
];

export const SYMPTOMS: string[] = [
  "Nausea",
  "Dizziness",
  "Fatigue",
  "Sensitivity to Light",
  "Sensitivity to Sound",
  "Visual Disturbances",
  "Brain Fog",
  "Anxiety",
  "Depression"
];

export const ACTIVITIES: Activities = {
  BASIC: [
    "Walking", "Standing", "Sitting", "Lying down",
    "Getting dressed", "Personal care", "Sleep"
  ],
  HOUSEHOLD: [
    "Cooking", "Cleaning", "Laundry", "Shopping",
    "Yard work", "Home maintenance"
  ],
  WORK_RELATED: [
    "Desk work", "Lifting", "Bending", "Reaching",
    "Computer use", "Driving"
  ],
  SOCIAL: [
    "Family activities", "Social events", "Hobbies",
    "Community participation"
  ],
  MOBILITY_AIDS: [
    "Cane", "Walker", "Wheelchair", "Crutches",
    "Braces/Supports", "Orthopedic shoes"
  ]
};

export const ASSISTANCE_LEVELS: AssistanceLevels = {
  INDEPENDENT: "Can perform independently",
  MODIFIED: "Can perform with modification",
  ASSISTANCE: "Requires assistance",
  UNABLE: "Unable to perform"
};

export const MEDICATIONS: Medications = {
  TYPES: [
    "Pain medication", "Anti-inflammatory",
    "Muscle relaxants", "Sleep aids",
    "Anxiety/Depression medication", "Other"
  ],
  FREQUENCY: [
    "As needed", "Once daily", "Twice daily",
    "Three times daily", "Four times daily"
  ],
  EFFECTIVENESS: [
    "Very effective", "Moderately effective",
    "Slightly effective", "Not effective"
  ]
};

export const INTERVENTIONS: Interventions = {
  TYPES: [
    "Physiotherapy", "Massage therapy",
    "Chiropractic", "Acupuncture",
    "Counseling", "Pain clinic",
    "Surgery", "Injections"
  ],
  FREQUENCY: [
    "Daily", "Weekly", "Bi-weekly",
    "Monthly", "As needed"
  ],
  STATUS: [
    "Currently receiving", "Completed",
    "Planned", "On waitlist"
  ]
};

export const COMPARISON_METRICS: ComparisonMetrics = {
  PAIN_LEVEL: "Pain intensity compared to 2019",
  FREQUENCY: "Frequency of pain episodes",
  DURATION: "Duration of pain episodes",
  LIMITATIONS: "Impact on daily activities",
  WORK_IMPACT: "Impact on work capacity",
  TREATMENT_NEEDS: "Need for medical interventions"
};

export const WORK_STATUS: WorkStatus = {
  REGULAR_DUTIES: "Regular duties",
  MODIFIED_DUTIES: "Modified duties",
  UNABLE_TO_WORK: "Unable to work",
  PARTIALLY_DISABLED: "Partially disabled",
  FULLY_DISABLED: "Fully disabled"
};

export const COMPARISON_RATINGS = [
  "Much worse than 2019",
  "Somewhat worse than 2019",
  "Same as 2019",
  "Slightly improved from 2019",
  "Much improved from 2019"
];
