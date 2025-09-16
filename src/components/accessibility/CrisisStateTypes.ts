/**
 * Crisis State Types and Interfaces
 * Defines types for emergency modes, stress detection, and crisis-responsive features
 */

// Crisis State Detection
export interface CrisisState {
  isInCrisis: boolean;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  triggers: CrisisTrigger[];
  detectedAt: Date;
  duration: number; // in seconds
  previousEpisodes: number;
}

export interface CrisisTrigger {
  type: 'pain_spike' | 'cognitive_fog' | 'emotional_distress' | 'rapid_input' | 'error_pattern' | 'time_pressure';
  value: number; // normalized 0-1
  threshold: number;
  timestamp: Date;
  context?: string;
}

// Stress Monitoring
export interface StressIndicators {
  painLevel: number; // 0-10
  cognitiveLoad: number; // 0-1, calculated from behavior patterns
  inputErraticBehavior: number; // 0-1, based on input patterns
  timeSpentOnTasks: number; // compared to baseline
  errorRate: number; // form errors, navigation mistakes
  frustrationMarkers: number; // back button presses, help clicks
}

export interface StressMetrics {
  current: StressIndicators;
  baseline: StressIndicators;
  trend: 'improving' | 'stable' | 'worsening';
  lastUpdated: Date;
}

// Emergency Mode Configuration
export interface EmergencyModeConfig {
  enabled: boolean;
  autoActivate: boolean;
  activationThreshold: number; // stress level 0-1
  simplificationLevel: 'minimal' | 'moderate' | 'maximum';
  essentialFunctionsOnly: boolean;
  emergencyContactsVisible: boolean;
  autoSaveFrequency: number; // seconds
  timeoutExtensions: boolean;
}

// Cognitive Fog Navigation
export interface CognitiveFogState {
  isActive: boolean;
  severity: 'mild' | 'moderate' | 'severe';
  indicators: {
    memoryDifficulty: boolean;
    concentrationIssues: boolean;
    decisionFatigue: boolean;
    sequencingProblems: boolean;
  };
  adaptations: CognitiveFogAdaptations;
}

export interface CognitiveFogAdaptations {
  showBreadcrumbs: boolean;
  enableStepByStep: boolean;
  reduceChoices: boolean;
  increaseMemoryAids: boolean;
  enableVoiceGuidance: boolean;
  simplifyLanguage: boolean;
  showProgress: boolean;
  allowPause: boolean;
}

// Multi-Modal Input Configuration
export interface MultiModalInputConfig {
  voice: {
    enabled: boolean;
    sensitivity: 'low' | 'medium' | 'high';
    language: string;
    commands: VoiceCommand[];
    continualListening: boolean;
    emergencyPhrases: string[];
  };
  gesture: {
    enabled: boolean;
    sensitivity: 'low' | 'medium' | 'high';
    swipeToNavigate: boolean;
    pinchToZoom: boolean;
    tapPatterns: boolean;
  };
  touch: {
    targetSizeMultiplier: number;
    pressureThreshold: number;
    dwellTime: number;
    hapticFeedback: boolean;
    errorCorrection: boolean;
  };
}

export interface VoiceCommand {
  phrase: string;
  aliases: string[];
  action: string;
  parameters?: Record<string, unknown>;
  emergencyCommand: boolean;
  requiresConfirmation: boolean;
}

export interface EmergencyGesture {
  pattern: string; // "swipe_up_triple" | "shake" | "long_press"
  action: string;
  description: string;
  enabled: boolean;
}

// Stress-Responsive UI Configuration
export interface StressResponsiveUIConfig {
  enabled: boolean;
  colorAdaptation: {
    calmingColors: boolean;
    reducedContrast: boolean;
    warmTonePalette: boolean;
  };
  animationAdaptation: {
    reduceMotion: boolean;
    slowerTransitions: boolean;
    essentialAnimationsOnly: boolean;
  };
  layoutAdaptation: {
    increaseWhitespace: boolean;
    simplifyStructure: boolean;
    prioritizeContent: boolean;
    hideNonEssential: boolean;
  };
  interactionAdaptation: {
    increaseTouchTargets: boolean;
    addConfirmations: boolean;
    enableUndo: boolean;
    showHelp: boolean;
  };
}

// Crisis Response Actions
export interface CrisisResponse {
  id: string;
  type: 'ui_adaptation' | 'notification' | 'contact_emergency' | 'save_data' | 'provide_resources';
  priority: 'low' | 'medium' | 'high' | 'critical';
  trigger: CrisisTrigger;
  action: unknown;
  timestamp: Date;
  completed: boolean;
  effectiveness?: number; // user feedback 0-1
}

export interface EmergencyResource {
  id: string;
  type: 'hotline' | 'website' | 'app' | 'contact' | 'technique' | 'medication';
  title: string;
  description: string;
  accessMethod: string; // phone number, URL, etc.
  availability: '24/7' | 'business_hours' | 'emergency_only';
  category: 'medical' | 'mental_health' | 'support' | 'technique';
  priority: number;
  lastUsed?: Date;
}

// Crisis Session Tracking
export interface CrisisSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  triggers: CrisisTrigger[];
  responses: CrisisResponse[];
  userActions: string[];
  outcome: 'resolved' | 'escalated' | 'transferred' | 'ongoing';
  duration: number;
  effectiveInterventions: string[];
  userFeedback?: string;
}

// Voice Command Patterns for Crisis Situations
export const EMERGENCY_VOICE_COMMANDS: VoiceCommand[] = [
  {
    phrase: "help me",
    aliases: ["I need help", "emergency", "crisis"],
    action: "activate_emergency_mode",
    emergencyCommand: true,
    requiresConfirmation: false
  },
  {
    phrase: "call doctor",
    aliases: ["contact doctor", "call emergency contact"],
    action: "call_primary_contact",
    emergencyCommand: true,
    requiresConfirmation: true
  },
  {
    phrase: "save everything",
    aliases: ["save all", "backup data"],
    action: "emergency_save",
    emergencyCommand: true,
    requiresConfirmation: false
  },
  {
    phrase: "simplify interface",
    aliases: ["make it simple", "reduce complexity"],
    action: "activate_simple_mode",
    emergencyCommand: false,
    requiresConfirmation: false
  },
  {
    phrase: "read to me",
    aliases: ["speak text", "voice guidance"],
    action: "enable_voice_guidance",
    emergencyCommand: false,
    requiresConfirmation: false
  },
  {
    phrase: "go back",
    aliases: ["previous page", "undo"],
    action: "navigate_back",
    emergencyCommand: false,
    requiresConfirmation: false
  },
  {
    phrase: "take a break",
    aliases: ["pause", "stop"],
    action: "activate_break_mode",
    emergencyCommand: false,
    requiresConfirmation: false
  },
  {
    phrase: "breathing exercise",
    aliases: ["calm down", "relax"],
    action: "start_breathing_exercise",
    emergencyCommand: false,
    requiresConfirmation: false
  }
];

// Emergency Gesture Patterns
export const EMERGENCY_GESTURES: EmergencyGesture[] = [
  {
    pattern: "shake_device",
    action: "activate_emergency_mode",
    description: "Shake device rapidly to activate emergency mode",
    enabled: true
  },
  {
    pattern: "triple_tap",
    action: "call_emergency_contact",
    description: "Triple tap screen to call primary emergency contact",
    enabled: true
  },
  {
    pattern: "swipe_up_three_fingers",
    action: "simplify_interface",
    description: "Swipe up with three fingers to simplify interface",
    enabled: true
  },
  {
    pattern: "long_press_corner",
    action: "show_help_menu",
    description: "Long press screen corner to show help options",
    enabled: true
  },
  {
    pattern: "pinch_in_hold",
    action: "activate_focus_mode",
    description: "Pinch screen and hold to activate focus mode",
    enabled: true
  }
];

// Default Crisis State Configuration
export const DEFAULT_CRISIS_CONFIG = {
  emergencyMode: {
    enabled: true,
    autoActivate: true,
    activationThreshold: 0.7,
    simplificationLevel: 'moderate' as const,
    essentialFunctionsOnly: false,
    emergencyContactsVisible: true,
    autoSaveFrequency: 30,
    timeoutExtensions: true
  },
  stressResponsiveUI: {
    enabled: true,
    colorAdaptation: {
      calmingColors: true,
      reducedContrast: false,
      warmTonePalette: true
    },
    animationAdaptation: {
      reduceMotion: true,
      slowerTransitions: true,
      essentialAnimationsOnly: true
    },
    layoutAdaptation: {
      increaseWhitespace: true,
      simplifyStructure: true,
      prioritizeContent: true,
      hideNonEssential: false
    },
    interactionAdaptation: {
      increaseTouchTargets: true,
      addConfirmations: true,
      enableUndo: true,
      showHelp: true
    }
  },
  multiModalInput: {
    voice: {
      enabled: true,
      sensitivity: 'medium' as const,
      language: 'en-US',
      commands: EMERGENCY_VOICE_COMMANDS,
      continualListening: false,
      emergencyPhrases: ["help me", "emergency", "call doctor"]
    },
    gesture: {
      enabled: true,
      sensitivity: 'medium' as const,
      swipeToNavigate: true,
      pinchToZoom: true,
      tapPatterns: true,
      emergencyGestures: EMERGENCY_GESTURES
    },
    touch: {
      targetSizeMultiplier: 1.5,
      pressureThreshold: 0.3,
      dwellTime: 150,
      hapticFeedback: true,
      errorCorrection: true
    }
  }
};
