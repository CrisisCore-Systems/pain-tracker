/**
 * @fileoverview Unified Tone System Types
 * 
 * Voice Pillars:
 * 1. Calm, competent, human (never cutesy; never sterile)
 * 2. Actionable empathy ("what to do next" > platitudes)
 * 3. Empowering evidence (show progress and why it matters)
 * 4. Plain language, precise edges (5th–8th grade; medical terms glossed inline)
 */

/**
 * Patient state drives adaptive tone
 */
export type PatientState = 
  | 'stable'      // Maintenance: brief, upbeat, professional-warm
  | 'rising'      // Yellow: steady, specific, encouraging
  | 'flare'       // Red: short lines, imperative, slow cadence
  | 'recovery';   // Post-flare: warm, factual, no cheerleading

/**
 * Intent determines copy pattern
 */
export type CopyIntent = 
  | 'log'         // Fast, neutral, choice-light
  | 'coach'       // One specific next step
  | 'insight'     // Evidence + confidence
  | 'motivate'    // Agency + progress (no shame/gamification)
  | 'notify'      // Value-first (not alarmist)
  | 'educate';    // Plain lead + action

/**
 * Personalization settings (opt-in)
 */
export interface TonePreferences {
  /** Warmth level: 0 = neutral, 1 = warm */
  warmth: 0 | 1;
  
  /** Coach intensity: 0 = minimal prompts, 1 = guided nudges */
  coachIntensity: 0 | 1;
  
  /** Lightness: allow pop-culture GIFs in non-flare contexts */
  allowLightness: boolean;
  
  /** Use medical terminology (glossed inline) vs plain only */
  medicalTerms: boolean;
}

/**
 * Tone context for adaptive copy
 */
export interface ToneContext {
  /** Current patient state */
  state: PatientState;
  
  /** User's tone preferences */
  preferences: TonePreferences;
  
  /** Recent pain trend (for context-aware messaging) */
  painTrend?: {
    current: number;
    previous: number;
    direction: 'up' | 'down' | 'stable';
  };
  
  /** Time since last flare (for recovery messaging) */
  timeSinceFlare?: number; // hours
  
  /** Sleep quality (affects coaching) */
  sleepQuality?: 'poor' | 'fair' | 'good';
}

/**
 * Copy variation for A/B testing
 */
export interface CopyVariation {
  id: string;
  intent: CopyIntent;
  variants: {
    control: string;
    variant: string;
  };
  metrics?: {
    acceptanceRate?: number;
    completionRate?: number;
    timeToAction?: number; // seconds
  };
}

/**
 * Microcopy with adaptive variations
 */
export interface AdaptiveCopy {
  /** Base copy (stable state, neutral tone) */
  base: string;
  
  /** State-specific variations */
  states?: {
    stable?: string;
    rising?: string;
    flare?: string;
    recovery?: string;
  };
  
  /** Warmth variations */
  warmth?: {
    neutral: string;
    warm: string;
  };
  
  /** Medical terminology variation */
  medical?: {
    plain: string;
    withTerms: string;
  };
  
  /** Screen reader alternative (if different) */
  srText?: string;
  
  /** Character limit for mobile (if constrained) */
  mobile?: string;
}

/**
 * Empty state copy pattern
 */
export interface EmptyStateCopy {
  /** Headline (empathetic, not pushy) */
  headline: string;
  
  /** Subtext (actionable, not demanding) */
  subtext: string;
  
  /** Primary CTA */
  cta: string;
  
  /** Secondary action (optional) */
  secondaryCta?: string;
}

/**
 * Progress insight copy
 */
export interface ProgressInsight {
  /** Evidence-based summary */
  summary: string;
  
  /** Likely factors (not causal claims) */
  factors?: string[];
  
  /** Confidence level */
  confidence: 'low' | 'medium' | 'high';
  
  /** Suggested action (one small step) */
  suggestedAction?: string;
}

/**
 * Reflection prompt (MMP-style)
 */
export interface ReflectionPrompt {
  /** Main question */
  question: string;
  
  /** Quick chip suggestions */
  suggestions: string[];
  
  /** Post-save acknowledgment */
  acknowledgment: string;
  
  /** Optional follow-up */
  followUp?: string;
}

/**
 * Clinician summary format
 */
export interface ClinicianSummary {
  /** Concise clinical format */
  summary: string;
  
  /** Plain-text safe note insert */
  smartInsert: string;
  
  /** Key metrics */
  metrics: {
    painAvg: number;
    painChange: number;
    variability: 'low' | 'medium' | 'high';
    flareCount: number;
    adherence: number; // percentage
  };
  
  /** Notable changes */
  changes: string[];
}

/**
 * Tone measurement data
 */
export interface ToneMeasurement {
  /** Metric type */
  metric: 
    | 'prompt_acceptance'
    | 'reflection_completion'
    | 'time_to_calm'
    | 'note_edit_delta'
    | 'perceived_burden';
  
  /** Value */
  value: number;
  
  /** Context */
  context: {
    state: PatientState;
    intent: CopyIntent;
    variation?: string;
  };
  
  /** Timestamp */
  timestamp: string;
}

/**
 * Default tone preferences
 */
export const DEFAULT_TONE_PREFERENCES: TonePreferences = {
  warmth: 0,              // Neutral by default
  coachIntensity: 0,      // Minimal prompts
  allowLightness: false,  // No GIFs by default
  medicalTerms: false,    // Plain language only
};

/**
 * State detection thresholds
 */
export const STATE_THRESHOLDS = {
  /** Pain increase to trigger 'rising' state */
  risingPainIncrease: 1.5,
  
  /** Pain level to trigger 'flare' state */
  flarePainLevel: 7,
  
  /** Hours since flare to return to 'stable' */
  recoveryHours: 24,
  
  /** Pain variability (std dev) for 'stable' */
  stableVariability: 1.2,
} as const;

/**
 * Readability targets
 */
export const READABILITY = {
  /** Target grade level (5th-8th) */
  gradeLevel: { min: 5, max: 8 },
  
  /** Max sentence length (words) */
  maxSentenceLength: 20,
  
  /** Flare state max sentence length */
  flareMaxSentenceLength: 10,
  
  /** Max syllables per word (avg) */
  maxSyllablesPerWord: 2.5,
} as const;
