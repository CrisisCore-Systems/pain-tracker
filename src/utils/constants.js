export const BASELINE_YEAR = 2019;

export const PAIN_LOCATIONS = {
  HEAD_NECK: [
    "Head", "Temples", "Jaw", "Neck (Left)", "Neck (Right)", "Neck (Back)"
  ],
  UPPER_BODY: [
    "Shoulder (Left)", "Shoulder (Right)", 
    "Upper Back (Left)", "Upper Back (Right)",
    "Arm (Left)", "Arm (Right)",
    "Elbow (Left)", "Elbow (Right)",
    "Wrist (Left)", "Wrist (Right)",
    "Hand (Left)", "Hand (Right)"
  ],
  TORSO: [
    "Chest", "Upper Back", "Middle Back", "Lower Back",
    "Abdomen", "Ribs (Left)", "Ribs (Right)"
  ],
  LOWER_BODY: [
    "Hip (Left)", "Hip (Right)",
    "Leg (Left)", "Leg (Right)",
    "Knee (Left)", "Knee (Right)",
    "Ankle (Left)", "Ankle (Right)",
    "Foot (Left)", "Foot (Right)"
  ]
};

export const SYMPTOMS = {
  PAIN_TYPES: [
    "Aching", "Burning", "Cramping", "Dull",
    "Sharp", "Shooting", "Stabbing", "Throbbing"
  ],
  SENSATIONS: [
    "Numbness", "Tingling", "Pins and needles",
    "Weakness", "Stiffness", "Tightness"
  ],
  TIMING: [
    "Constant", "Intermittent", "Worse in morning",
    "Worse at night", "Aggravated by activity",
    "Improves with rest"
  ]
};

export const ACTIVITIES = {
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
  ]
};

export const ASSISTANCE_LEVELS = {
  INDEPENDENT: "Can perform independently",
  MODIFIED: "Can perform with modification",
  ASSISTANCE: "Requires assistance",
  UNABLE: "Unable to perform"
};

export const MEDICATIONS = {
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

export const INTERVENTIONS = {
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

export const COMPARISON_METRICS = {
  PAIN_LEVEL: "Pain intensity compared to 2019",
  FREQUENCY: "Frequency of pain episodes",
  DURATION: "Duration of pain episodes",
  LIMITATIONS: "Impact on daily activities",
  WORK_IMPACT: "Impact on work capacity",
  TREATMENT_NEEDS: "Need for medical interventions"
};

export const WORK_STATUS = {
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
