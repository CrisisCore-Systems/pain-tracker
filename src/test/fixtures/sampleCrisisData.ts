/**
 * Comprehensive crisis testing scenarios and data
 * Covers various crisis levels, behavioral patterns, and stress indicators
 */

import type {
  CrisisState,
  CrisisTrigger,
  StressIndicators,
  StressMetrics,
  CrisisSession,
} from '../../../components/accessibility/CrisisStateTypes';

/**
 * Sample crisis states covering severity spectrum
 */
export const sampleCrisisStates: CrisisState[] = [
  // Mild stress
  {
    isInCrisis: false,
    severity: 'mild',
    triggers: [
      {
        type: 'pain_spike',
        value: 0.3,
        threshold: 0.5,
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        context: 'Brief pain increase during activity',
      },
    ],
    detectedAt: new Date(Date.now() - 1000 * 60 * 5),
    duration: 300, // 5 minutes
    previousEpisodes: 0,
  },

  // Moderate stress
  {
    isInCrisis: true,
    severity: 'moderate',
    triggers: [
      {
        type: 'cognitive_fog',
        value: 0.6,
        threshold: 0.5,
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        context: 'Difficulty completing form fields',
      },
      {
        type: 'rapid_input',
        value: 0.7,
        threshold: 0.6,
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        context: 'Multiple rapid clicks and corrections',
      },
    ],
    detectedAt: new Date(Date.now() - 1000 * 60 * 15),
    duration: 900, // 15 minutes
    previousEpisodes: 2,
  },

  // Severe stress
  {
    isInCrisis: true,
    severity: 'severe',
    triggers: [
      {
        type: 'pain_spike',
        value: 0.9,
        threshold: 0.7,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        context: 'Severe pain episode reported',
      },
      {
        type: 'emotional_distress',
        value: 0.8,
        threshold: 0.7,
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        context: 'High anxiety indicators in form responses',
      },
      {
        type: 'error_pattern',
        value: 0.85,
        threshold: 0.7,
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        context: 'Frequent navigation errors and back button usage',
      },
    ],
    detectedAt: new Date(Date.now() - 1000 * 60 * 30),
    duration: 1800, // 30 minutes
    previousEpisodes: 5,
  },

  // Emergency/Critical
  {
    isInCrisis: true,
    severity: 'emergency',
    triggers: [
      {
        type: 'pain_spike',
        value: 1.0,
        threshold: 0.8,
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        context: 'Maximum pain level reported',
      },
      {
        type: 'emotional_distress',
        value: 0.95,
        threshold: 0.8,
        timestamp: new Date(Date.now() - 1000 * 60 * 40),
        context: 'Crisis keywords detected in notes',
      },
      {
        type: 'rapid_input',
        value: 0.9,
        threshold: 0.7,
        timestamp: new Date(Date.now() - 1000 * 60 * 38),
        context: 'Erratic input patterns, possible panic',
      },
      {
        type: 'time_pressure',
        value: 0.85,
        threshold: 0.7,
        timestamp: new Date(Date.now() - 1000 * 60 * 35),
        context: 'Attempting to complete forms very quickly',
      },
    ],
    detectedAt: new Date(Date.now() - 1000 * 60 * 45),
    duration: 2700, // 45 minutes
    previousEpisodes: 10,
  },

  // Acute crisis
  {
    isInCrisis: true,
    severity: 'acute',
    triggers: [
      {
        type: 'pain_spike',
        value: 1.0,
        threshold: 0.8,
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        context: 'Sudden severe pain onset',
      },
      {
        type: 'emotional_distress',
        value: 1.0,
        threshold: 0.8,
        timestamp: new Date(Date.now() - 1000 * 60 * 8),
        context: 'Panic indicators, help-seeking behavior',
      },
    ],
    detectedAt: new Date(Date.now() - 1000 * 60 * 10),
    duration: 600, // 10 minutes
    previousEpisodes: 3,
  },
];

/**
 * Sample stress indicators and metrics
 */
export const sampleStressMetrics: StressMetrics[] = [
  // Low stress baseline
  {
    current: {
      painLevel: 2,
      cognitiveLoad: 0.2,
      inputErraticBehavior: 0.1,
      timeSpentOnTasks: 1.0, // Normal
      errorRate: 0.05,
      frustrationMarkers: 0,
    },
    baseline: {
      painLevel: 2,
      cognitiveLoad: 0.2,
      inputErraticBehavior: 0.1,
      timeSpentOnTasks: 1.0,
      errorRate: 0.05,
      frustrationMarkers: 0,
    },
    trend: 'stable',
    lastUpdated: new Date(),
  },

  // Increasing stress
  {
    current: {
      painLevel: 6,
      cognitiveLoad: 0.6,
      inputErraticBehavior: 0.5,
      timeSpentOnTasks: 1.8, // Taking longer
      errorRate: 0.3,
      frustrationMarkers: 5,
    },
    baseline: {
      painLevel: 3,
      cognitiveLoad: 0.3,
      inputErraticBehavior: 0.2,
      timeSpentOnTasks: 1.0,
      errorRate: 0.1,
      frustrationMarkers: 1,
    },
    trend: 'worsening',
    lastUpdated: new Date(),
  },

  // Improving from crisis
  {
    current: {
      painLevel: 5,
      cognitiveLoad: 0.4,
      inputErraticBehavior: 0.3,
      timeSpentOnTasks: 1.2,
      errorRate: 0.15,
      frustrationMarkers: 2,
    },
    baseline: {
      painLevel: 3,
      cognitiveLoad: 0.3,
      inputErraticBehavior: 0.2,
      timeSpentOnTasks: 1.0,
      errorRate: 0.1,
      frustrationMarkers: 1,
    },
    trend: 'improving',
    lastUpdated: new Date(),
  },

  // High stress state
  {
    current: {
      painLevel: 9,
      cognitiveLoad: 0.9,
      inputErraticBehavior: 0.85,
      timeSpentOnTasks: 3.0, // Much slower
      errorRate: 0.6,
      frustrationMarkers: 15,
    },
    baseline: {
      painLevel: 3,
      cognitiveLoad: 0.3,
      inputErraticBehavior: 0.2,
      timeSpentOnTasks: 1.0,
      errorRate: 0.1,
      frustrationMarkers: 1,
    },
    trend: 'worsening',
    lastUpdated: new Date(),
  },
];

/**
 * Sample crisis sessions with outcomes
 */
export const sampleCrisisSessions: CrisisSession[] = [
  // Successfully resolved session
  {
    id: 'session-1',
    startTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    endTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    triggers: [
      {
        type: 'pain_spike',
        value: 0.7,
        threshold: 0.6,
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        context: 'Sudden pain increase',
      },
      {
        type: 'cognitive_fog',
        value: 0.6,
        threshold: 0.5,
        timestamp: new Date(Date.now() - 1000 * 60 * 55),
        context: 'Difficulty focusing on form',
      },
    ],
    responses: [
      {
        actionType: 'ui_simplification',
        actionTaken: 'Simplified interface activated',
        timestamp: new Date(Date.now() - 1000 * 60 * 58),
        effectiveness: 'high',
        userFeedback: 'helpful',
      },
      {
        actionType: 'break_suggestion',
        actionTaken: 'Suggested 5-minute break',
        timestamp: new Date(Date.now() - 1000 * 60 * 50),
        effectiveness: 'high',
        userFeedback: 'helpful',
      },
    ],
    userActions: [
      'Accepted simplified interface',
      'Took suggested break',
      'Returned and completed form',
    ],
    outcome: 'resolved',
    duration: 1800, // 30 minutes
    effectiveInterventions: [
      'UI simplification',
      'Break suggestion',
      'Increased touch targets',
    ],
    userFeedback: 'The simplified interface and break suggestion were very helpful. Felt less overwhelmed.',
  },

  // Escalated session
  {
    id: 'session-2',
    startTime: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    endTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    triggers: [
      {
        type: 'pain_spike',
        value: 0.95,
        threshold: 0.8,
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        context: 'Severe pain episode',
      },
      {
        type: 'emotional_distress',
        value: 0.9,
        threshold: 0.8,
        timestamp: new Date(Date.now() - 1000 * 60 * 115),
        context: 'High anxiety detected',
      },
    ],
    responses: [
      {
        actionType: 'crisis_resources',
        actionTaken: 'Displayed crisis support contacts',
        timestamp: new Date(Date.now() - 1000 * 60 * 118),
        effectiveness: 'high',
        userFeedback: 'helpful',
      },
      {
        actionType: 'emergency_mode',
        actionTaken: 'Activated emergency interface',
        timestamp: new Date(Date.now() - 1000 * 60 * 115),
        effectiveness: 'high',
        userFeedback: 'helpful',
      },
    ],
    userActions: [
      'Viewed crisis resources',
      'Called support line',
      'Closed application',
    ],
    outcome: 'escalated',
    duration: 3600, // 1 hour
    effectiveInterventions: [
      'Crisis resources display',
      'Emergency mode activation',
      'Direct support line access',
    ],
    userFeedback: 'Needed to call for help. Glad the resources were easily accessible.',
  },

  // Ongoing session
  {
    id: 'session-3',
    startTime: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
    triggers: [
      {
        type: 'cognitive_fog',
        value: 0.7,
        threshold: 0.6,
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        context: 'Struggling with form completion',
      },
      {
        type: 'error_pattern',
        value: 0.65,
        threshold: 0.6,
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        context: 'Multiple form errors',
      },
    ],
    responses: [
      {
        actionType: 'progressive_disclosure',
        actionTaken: 'Simplified form to one field at a time',
        timestamp: new Date(Date.now() - 1000 * 60 * 18),
        effectiveness: 'medium',
        userFeedback: null,
      },
      {
        actionType: 'cognitive_load_reduction',
        actionTaken: 'Reduced visual complexity',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        effectiveness: 'medium',
        userFeedback: null,
      },
    ],
    userActions: [
      'Using simplified form',
      'Taking time with each field',
    ],
    outcome: 'ongoing',
    duration: 1200, // 20 minutes so far
    effectiveInterventions: [
      'Progressive disclosure',
      'Cognitive load reduction',
    ],
    userFeedback: undefined,
  },

  // Transferred to professional care
  {
    id: 'session-4',
    startTime: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
    endTime: new Date(Date.now() - 1000 * 60 * 150), // 2.5 hours ago
    triggers: [
      {
        type: 'emotional_distress',
        value: 1.0,
        threshold: 0.9,
        timestamp: new Date(Date.now() - 1000 * 60 * 180),
        context: 'Severe emotional crisis detected',
      },
      {
        type: 'pain_spike',
        value: 1.0,
        threshold: 0.9,
        timestamp: new Date(Date.now() - 1000 * 60 * 178),
        context: 'Maximum pain level',
      },
    ],
    responses: [
      {
        actionType: 'emergency_alert',
        actionTaken: 'Displayed emergency resources prominently',
        timestamp: new Date(Date.now() - 1000 * 60 * 179),
        effectiveness: 'high',
        userFeedback: 'helpful',
      },
      {
        actionType: 'professional_referral',
        actionTaken: 'Suggested calling emergency services',
        timestamp: new Date(Date.now() - 1000 * 60 * 175),
        effectiveness: 'high',
        userFeedback: 'helpful',
      },
    ],
    userActions: [
      'Called emergency services',
      'Application referred to 911',
    ],
    outcome: 'transferred',
    duration: 1800, // 30 minutes
    effectiveInterventions: [
      'Emergency resources',
      'Professional referral',
      'Clear emergency contacts',
    ],
    userFeedback: 'Needed emergency care. The clear emergency contact information was crucial.',
  },
];

/**
 * Behavioral patterns for crisis simulation
 */
export const crisisBehavioralPatterns = {
  mild: {
    rapidClicks: false,
    erraticMovement: true,
    longPauses: false,
    frustrationIndicators: false,
    errorRate: 0.1,
    navigationPatterns: 'normal',
    formCompletionTime: 1.2, // 20% slower than baseline
  },
  moderate: {
    rapidClicks: true,
    erraticMovement: true,
    longPauses: true,
    frustrationIndicators: true,
    errorRate: 0.3,
    navigationPatterns: 'confused',
    formCompletionTime: 1.8, // 80% slower
  },
  severe: {
    rapidClicks: true,
    erraticMovement: true,
    longPauses: true,
    frustrationIndicators: true,
    errorRate: 0.5,
    navigationPatterns: 'highly-confused',
    formCompletionTime: 2.5, // 150% slower
  },
  emergency: {
    rapidClicks: true,
    erraticMovement: true,
    longPauses: true,
    frustrationIndicators: true,
    errorRate: 0.7,
    navigationPatterns: 'panic',
    formCompletionTime: 4.0, // 300% slower or unable to complete
  },
};

/**
 * Expected system responses by crisis level
 */
export const expectedCrisisResponses = {
  mild: [
    'UI slightly enlarges touch targets',
    'Stress indicator appears',
    'Subtle color adaptations',
    'Gentle reminder to take breaks',
  ],
  moderate: [
    'Larger buttons and touch targets',
    'Cognitive fog navigation activates',
    'Color scheme adapts to warmer tones',
    'Animation speeds reduce',
    'Break suggestions become more prominent',
  ],
  severe: [
    'Emergency mode interface appears',
    'Multi-modal input system activates',
    'Crisis alert banner shows',
    'Simplified navigation enabled',
    'Direct access to support resources',
  ],
  emergency: [
    'Full emergency interface active',
    'All animations disabled',
    'Maximum contrast enabled',
    'Emergency contacts readily accessible',
    'Voice commands working',
    'One-click access to crisis support',
    'Professional help suggestions',
  ],
};

/**
 * Helper to create crisis state
 */
export function makeCrisisState(
  severity: CrisisState['severity'] = 'none'
): CrisisState {
  return {
    isInCrisis: severity !== 'none',
    severity,
    triggers: [],
    detectedAt: new Date(),
    duration: 0,
    previousEpisodes: 0,
  };
}

/**
 * Helper to create stress indicators
 */
export function makeStressIndicators(
  painLevel: number = 3
): StressIndicators {
  return {
    painLevel,
    cognitiveLoad: painLevel / 10,
    inputErraticBehavior: Math.max(0, (painLevel - 5) / 10),
    timeSpentOnTasks: 1.0 + (painLevel / 20),
    errorRate: Math.max(0, (painLevel - 5) / 20),
    frustrationMarkers: Math.max(0, painLevel - 5),
  };
}
