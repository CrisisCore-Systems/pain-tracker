/**
 * @fileoverview Comprehensive Microcopy Dictionary
 * 
 * All user-facing copy with adaptive variations for patient state,
 * warmth level, and medical terminology preferences.
 * 
 * Voice Pillars:
 * 1. Calm, competent, human
 * 2. Actionable empathy
 * 3. Empowering evidence
 * 4. Plain language, precise edges
 */

import type { AdaptiveCopy, EmptyStateCopy, ReflectionPrompt } from '../types/tone';

/**
 * HOME / DASHBOARD
 */
export const homeCopy = {
  /** Quick log CTA */
  quickLogCTA: {
    base: "Log pain (10s)",
    states: {
      stable: "Log today in 10 seconds",
      rising: "Check in (10s)",
      flare: "Log pain",
      recovery: "Check in (quick)",
    },
    mobile: "Log (10s)",
  } as AdaptiveCopy,

  /** After log confirmation */
  logConfirmation: {
    base: "Saved. I'll watch the trend—you can carry on.",
    states: {
      stable: "Saved. I'll watch the trend.",
      rising: "Saved. I'll watch the pattern.",
      flare: "Saved. You're safe here.",
      recovery: "Saved. You're tracking well.",
    },
    warmth: {
      neutral: "Saved. Tracking your pattern.",
      warm: "Saved. I'll watch the trend—you can carry on.",
    },
  } as AdaptiveCopy,

  /** Panic mode CTA */
  panicModeCTA: {
    base: "Need a moment? Breathing guide",
    states: {
      stable: "Calm breathing",
      rising: "Need a moment?",
      flare: "Breathe with me",
      recovery: "Calm breathing",
    },
    srText: "Activate calm breathing mode",
  } as AdaptiveCopy,
};

/**
 * QUICK LOG STEPPER
 */
export const quickLogCopy = {
  /** Step 1: Pain slider */
  painSliderLabel: {
    base: "Pain intensity (0–10)",
    states: {
      flare: "Pain level",
    },
    medical: {
      plain: "Pain intensity",
      withTerms: "Pain intensity (numeric rating scale)",
    },
  } as AdaptiveCopy,

  painSliderHint: {
    base: "Use slider or enter number directly",
    states: {
      flare: "Pick your number",
    },
  } as AdaptiveCopy,

  /** Step 2: Locations */
  locationsLabel: {
    base: "Where does it hurt?",
    states: {
      stable: "Affected areas",
      flare: "Location",
    },
  } as AdaptiveCopy,

  locationsHint: {
    base: "Choose all that apply",
    states: {
      flare: "Tap all areas",
    },
  } as AdaptiveCopy,

  bodyMapToggle: {
    base: "Or choose from a list",
    states: {
      flare: "Use list instead",
    },
  } as AdaptiveCopy,

  /** Step 3: Notes */
  notesLabel: {
    base: "Anything worth noting?",
    states: {
      stable: "Notes (optional)",
      flare: "Notes",
    },
    warmth: {
      neutral: "Additional notes",
      warm: "Anything worth noting?",
    },
  } as AdaptiveCopy,

  notesPlaceholder: {
    base: "What triggered it? What helped?",
    states: {
      stable: "Triggers, relief strategies, context...",
      flare: "What happened?",
    },
  } as AdaptiveCopy,

  /** Navigation */
  continueButton: {
    base: "Continue",
    states: {
      flare: "Next",
    },
  } as AdaptiveCopy,

  saveButton: {
    base: "Save entry",
    states: {
      stable: "Save and finish",
      flare: "Save",
    },
  } as AdaptiveCopy,

  keyboardHint: {
    base: "Press Enter to continue",
    states: {
      flare: "Enter = next",
    },
  } as AdaptiveCopy,
};

/**
 * PANIC MODE
 */
export const panicModeCopy = {
  /** Entry */
  greeting: {
    base: "You're safe. We'll go step by step.",
    warmth: {
      neutral: "Flare mode. Follow the guide.",
      warm: "You're safe. We'll go step by step.",
    },
  } as AdaptiveCopy,

  /** Breathing instructions */
  breathingPhases: {
    inhale: {
      base: "Inhale… 4",
      states: {
        flare: "In… 4",
      },
    },
    hold: {
      base: "Hold… 4",
      states: {
        flare: "Hold… 4",
      },
    },
    exhale: {
      base: "Exhale… 6",
      states: {
        flare: "Out… 6",
      },
    },
    pause: {
      base: "Pause… 2",
      states: {
        flare: "Rest… 2",
      },
    },
  },

  /** Affirmations (rotate) */
  affirmations: [
    "This will pass.",
    "You've managed this before.",
    "One breath at a time.",
    "You're doing what helps.",
    "Your body is working to calm.",
    "This is temporary.",
    "You're safe right now.",
    "Each breath helps.",
  ],

  /** Crisis resources */
  crisisPrompt: {
    base: "Need immediate support?",
    states: {
      flare: "Need help now?",
    },
  } as AdaptiveCopy,

  crisisHotline: {
    base: "988 Suicide & Crisis Lifeline",
    srText: "Call 988 for immediate crisis support",
  } as AdaptiveCopy,

  /** Close */
  closeButton: {
    base: "I'm feeling better",
    states: {
      flare: "Done",
    },
    warmth: {
      neutral: "Exit",
      warm: "I'm feeling better",
    },
  } as AdaptiveCopy,

  cycleCounter: {
    base: (count: number) => `${count} breathing round${count !== 1 ? 's' : ''} complete`,
    states: {
      flare: (count: number) => `${count} done`,
    },
  },
};

/**
 * ANALYTICS / INSIGHTS
 */
export const analyticsCopy = {
  /** Progress summary */
  progressSummary: (avgPrev: number, avgCurr: number, days: number) => ({
    base: `Last ${days} days: average pain ${avgPrev.toFixed(1)} → ${avgCurr.toFixed(1)}.`,
    states: {
      stable: `${days}-day average: ${avgPrev.toFixed(1)} → ${avgCurr.toFixed(1)}`,
    },
    medical: {
      plain: `Average pain: ${avgPrev.toFixed(1)} → ${avgCurr.toFixed(1)} (${days} days)`,
      withTerms: `Mean pain intensity: ${avgPrev.toFixed(1)} → ${avgCurr.toFixed(1)} (${days}-day trend)`,
    },
  } as AdaptiveCopy),

  /** Likely factors */
  factorsHeading: {
    base: "Likely contributors:",
    states: {
      stable: "Patterns noticed:",
    },
    medical: {
      plain: "Likely contributors",
      withTerms: "Contributing factors (observational)",
    },
  } as AdaptiveCopy,

  /** Confidence badge */
  confidence: {
    high: "high confidence",
    medium: "moderate confidence",
    low: "early pattern",
  },

  /** Suggested action */
  suggestedActionPrefix: {
    base: "Worth trying:",
    states: {
      stable: "Next step:",
      rising: "Consider:",
    },
    warmth: {
      neutral: "Suggested action:",
      warm: "Worth trying:",
    },
  } as AdaptiveCopy,

  /** Chart toggle */
  chartToggle: {
    base: "View as table",
    states: {
      stable: "Switch to data table",
    },
    srText: "Toggle between chart and accessible data table",
  } as AdaptiveCopy,

  tableToggle: {
    base: "View as chart",
    states: {
      stable: "Switch to visual chart",
    },
  } as AdaptiveCopy,
};

/**
 * EMPTY STATES
 */
export const emptyStates = {
  /** No pain logs yet */
  noLogs: {
    headline: { base: "Two days of logs unlock patterns." } as AdaptiveCopy,
    subtext: { base: "Start with today—10 seconds." } as AdaptiveCopy,
    cta: { base: "Log first entry" } as AdaptiveCopy,
    secondaryCta: { base: "Learn how tracking helps" } as AdaptiveCopy,
  },

  /** No trends yet */
  noTrends: {
    headline: { base: "Not enough data for trends yet." } as AdaptiveCopy,
    subtext: { base: "Three entries will show your first pattern." } as AdaptiveCopy,
    cta: { base: "Add another log" } as AdaptiveCopy,
  },

  /** No reflections */
  noReflections: {
    headline: { base: "Reflections help spot what works." } as AdaptiveCopy,
    subtext: { base: "Name one thing that helped, even a small one." } as AdaptiveCopy,
    cta: { base: "Start first reflection" } as AdaptiveCopy,
  },

  /** No messages */
  noMessages: {
    headline: { base: "No messages yet." } as AdaptiveCopy,
    subtext: { base: "You can share a 7-day summary anytime." } as AdaptiveCopy,
    cta: { base: "Compose message" } as AdaptiveCopy,
  },
};

/**
 * DAILY REFLECTION (MMP-style)
 */
export const reflectionCopy = {
  /** Prompt */
  prompt: {
    question: "Name one thing that helped today.",
    suggestions: [
      "warm shower",
      "paced tasks",
      "called a friend",
      "rested early",
      "gentle walk",
      "breathing break",
      "distraction",
      "medication",
    ],
    acknowledgment: "Noted. We'll look for patterns that repeat.",
    followUp: "Tomorrow, we'll check if this helps again.",
  } as ReflectionPrompt,

  /** Flare reflection */
  flarePrompt: {
    question: "What eased the flare (even a little)?",
    suggestions: [
      "breathing",
      "pacing",
      "medication",
      "heat",
      "cold",
      "rest",
      "distraction",
      "position change",
    ],
    acknowledgment: "Flare eased. Noted.",
  } as ReflectionPrompt,
};

/**
 * EDUCATION / COACH
 */
export const educationCopy = {
  /** Pacing module */
  pacing: {
    title: "Pacing: why 'just enough' beats 'all or nothing'",
    lead: "Pushing through often triggers flares. Stopping at 80% lets you sustain activity longer.",
    action: "Try 'stop at 80%' for three days. I'll ask how it went.",
    cta: "Start pacing trial",
  },

  /** Sleep module */
  sleep: {
    title: "Sleep and pain: the feedback loop",
    lead: "After <6h sleep, pain tends to rise +1.2 next day (high confidence in your data).",
    action: "Try moving bedtime 15 minutes earlier.",
    cta: "Set sleep goal",
  },

  /** Breathing module */
  breathing: {
    title: "Breathwork for pain: 4-4-6-2 pattern",
    lead: "Extended exhale activates your calming system. Three rounds can reduce pain spikes.",
    action: "Try 3-minute breathwork during prodromes.",
    cta: "Practice now",
  },
};

/**
 * NOTIFICATIONS
 */
export const notificationCopy = {
  /** Log reminder */
  logReminder: {
    base: "Time to log? Takes 10 seconds.",
    states: {
      stable: "Quick check-in?",
      rising: "Check in on your pain?",
    },
    warmth: {
      neutral: "Daily log available",
      warm: "Time to log? Takes 10 seconds.",
    },
  } as AdaptiveCopy,

  /** Insight ready */
  insightReady: {
    base: "New pattern spotted in your data.",
    states: {
      stable: "Insight ready: 14-day trend",
    },
  } as AdaptiveCopy,

  /** Message reply */
  messageReply: {
    base: "Provider replied to your message.",
    states: {
      stable: "New message from your care team",
    },
  } as AdaptiveCopy,
};

/**
 * ERRORS (non-blocking, reassuring)
 */
export const errorCopy = {
  /** Sync failed */
  syncFailed: {
    base: "Didn't send yet. Your log is safe here—retry.",
    states: {
      flare: "Not sent. Data safe. Retry?",
    },
    warmth: {
      neutral: "Sync failed. Data saved locally. Retry available.",
      warm: "Didn't send yet. Your log is safe here—retry.",
    },
  } as AdaptiveCopy,

  /** Export failed */
  exportFailed: {
    base: "Export didn't complete. Try again?",
    states: {
      stable: "Export error. Your data is safe. Retry?",
    },
  } as AdaptiveCopy,

  /** Generic error */
  genericError: {
    base: "Something went wrong. Your data is safe.",
    states: {
      flare: "Error. Data safe.",
    },
  } as AdaptiveCopy,

  /** Retry button */
  retryButton: {
    base: "Retry",
    states: {
      flare: "Try again",
    },
  } as AdaptiveCopy,
};

/**
 * OFFLINE
 */
export const offlineCopy = {
  /** Offline banner */
  offlineBanner: {
    base: "Offline. Logs saved on your device.",
    states: {
      stable: "Working offline—everything saved locally",
      flare: "Offline mode. Data safe.",
    },
  } as AdaptiveCopy,

  /** Sync pending */
  syncPending: {
    base: "I'll sync when you're back online.",
    states: {
      stable: "Will sync when connection returns",
    },
  } as AdaptiveCopy,
};

/**
 * EXPORT / SHARE
 */
export const exportCopy = {
  /** Preview prompt */
  previewPrompt: {
    base: "Preview what's shared. You're in control.",
    states: {
      stable: "Review before sharing",
    },
  } as AdaptiveCopy,

  /** Clinician summary intro */
  clinicianSummaryIntro: {
    base: "Ready to share with your clinician?",
    states: {
      stable: "Share 7-day summary with provider?",
    },
    warmth: {
      neutral: "Clinical summary ready for export",
      warm: "Ready to share with your clinician?",
    },
  } as AdaptiveCopy,

  /** PDF export */
  pdfExportCTA: {
    base: "Download PDF",
    states: {
      stable: "Export as PDF",
    },
  } as AdaptiveCopy,

  /** WorkSafe BC export */
  wcbExportCTA: {
    base: "Export for WorkSafe BC",
    states: {
      stable: "Generate WCB report",
    },
    medical: {
      plain: "WorkSafe BC report",
      withTerms: "WorkSafe BC claim documentation",
    },
  } as AdaptiveCopy,
};

/**
 * SETTINGS / PREFERENCES
 */
export const settingsCopy = {
  /** Tone warmth */
  toneWarmthLabel: {
    base: "Tone warmth",
    medical: {
      plain: "App tone",
      withTerms: "Communication style preference",
    },
  } as AdaptiveCopy,

  toneWarmthOptions: {
    neutral: "Neutral (direct and brief)",
    warm: "Warm (encouraging and personal)",
  },

  /** Coach intensity */
  coachIntensityLabel: {
    base: "Coaching prompts",
  } as AdaptiveCopy,

  coachIntensityOptions: {
    minimal: "Minimal (only when I ask)",
    guided: "Guided (suggest next steps)",
  },

  /** Lightness */
  lightnessLabel: {
    base: "Allow light tone in stable states",
  } as AdaptiveCopy,

  lightnessHint: {
    base: "Pop-culture GIFs, casual language (never during flares)",
  } as AdaptiveCopy,

  /** Medical terms */
  medicalTermsLabel: {
    base: "Medical terminology",
  } as AdaptiveCopy,

  medicalTermsHint: {
    base: "Include clinical terms with plain-language definitions",
  } as AdaptiveCopy,
};

/**
 * CLINICIAN-FACING COPY
 */
export const clinicianCopy = {
  /** Patient summary (concise) */
  summaryTemplate: (data: {
    days: number;
    painAvg: number;
    painChange: number;
    variability: 'low' | 'medium' | 'high';
    flareCount: number;
    sleepChange?: number;
    adherence: number;
    adherenceChange: number;
    newSymptoms?: string[];
  }) => {
    const variabilitySymbol = data.variability === 'low' ? '↓' : data.variability === 'high' ? '↑' : '→';
    const painChangeSymbol = data.painChange > 0 ? '↑' : data.painChange < 0 ? '↓' : '→';
    
    let summary = `${data.days}-day: pain avg ${data.painAvg.toFixed(1)} (${painChangeSymbol}${Math.abs(data.painChange).toFixed(1)}), `;
    summary += `variability ${variabilitySymbol}, `;
    summary += `flares ${data.flareCount}. `;
    
    if (data.sleepChange) {
      summary += `Sleep ${data.sleepChange > 0 ? '+' : ''}${Math.round(data.sleepChange)}m. `;
    }
    
    summary += `Adherence ${data.adherence}% (${data.adherenceChange > 0 ? '+' : ''}${data.adherenceChange}%). `;
    
    if (data.newSymptoms && data.newSymptoms.length > 0) {
      summary += `New: ${data.newSymptoms.join(', ')}.`;
    }
    
    return summary;
  },

  /** Smart-insert note (EHR-safe) */
  smartInsertTemplate: (data: {
    days: number;
    painAvg: number;
    painChange: number;
    variability: string;
    flareCount: number;
    contributors?: string[];
    plan?: string;
  }) => {
    let note = `Patient-reported outcomes (${data.days}d): `;
    note += `Pain ${data.painAvg.toFixed(1)} avg (${data.painChange > 0 ? '↑' : '↓'}${Math.abs(data.painChange).toFixed(1)}); `;
    note += `variability ${data.variability}. `;
    note += `${data.flareCount} flare${data.flareCount !== 1 ? 's' : ''}`;
    
    if (data.contributors && data.contributors.length > 0) {
      note += `. Likely contributors: ${data.contributors.join(', ')}`;
    }
    
    if (data.plan) {
      note += `. Plan: ${data.plan}`;
    }
    
    note += '.';
    
    return note;
  },

  /** Orders/Plan */
  planTemplates: {
    pacing: "Pacing template A applied. Review in 2 weeks.",
    breathing: "Breathwork trial: 3-min sessions during prodromes. Monitor effectiveness.",
    sleep: "Sleep hygiene intervention. Target: +30m/night. Reassess 14d.",
  },
};

/**
 * ACCESSIBILITY
 */
export const a11yCopy = {
  /** Skip link */
  skipToMain: {
    base: "Skip to main content",
  } as AdaptiveCopy,

  /** Screen reader helpers */
  loadingStatus: {
    base: "Loading your data...",
    states: {
      flare: "Loading...",
    },
  } as AdaptiveCopy,

  savingStatus: {
    base: "Saving entry...",
    states: {
      flare: "Saving...",
    },
  } as AdaptiveCopy,

  savedStatus: {
    base: "Entry saved successfully",
    states: {
      flare: "Saved",
    },
  } as AdaptiveCopy,
};

/**
 * MEASUREMENTS (for A/B testing)
 */
export const measurementCopy = {
  /** Test variations */
  reflectionVariants: {
    control: "What helped today?",
    variant: "One thing worth keeping?",
  },

  insightFramingVariants: {
    control: "Likely contributors:",
    variant: "Patterns we noticed:",
  },

  nudgeTimingVariants: {
    control: "5pm reminder",
    variant: "3 hours since last activity",
  },
};
