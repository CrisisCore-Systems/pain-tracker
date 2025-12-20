/**
 * @fileoverview Tone Context Provider
 *
 * Provides adaptive tone throughout the app based on patient state
 * and user preferences.
 */

import React, { createContext, useState, useCallback, useEffect } from 'react';
import type {
  PatientState,
  TonePreferences,
  ToneContext as ToneContextType,
  AdaptiveCopy,
  CopyIntent,
  ToneMeasurement,
} from '../types/tone';
import { DEFAULT_TONE_PREFERENCES } from '../types/tone';
import { toneEngine } from '../services/ToneEngine';
import { usePainTrackerStore } from '../stores/pain-tracker-store';

export interface ToneProviderValue {
  /** Current tone context */
  context: ToneContextType;

  /** User's tone preferences */
  preferences: TonePreferences;

  /** Update tone preferences */
  updatePreferences: (updates: Partial<TonePreferences>) => void;

  /** Get adaptive copy for current context */
  getCopy: (copy: AdaptiveCopy) => string;

  /** Track user interaction with copy */
  trackInteraction: (intent: CopyIntent, accepted: boolean) => void;

  /** Track time to calm in panic mode */
  trackTimeToCalm: (seconds: number) => void;

  /** Force state change (for testing) */
  forceState: (state: PatientState) => void;
}

export const ToneContext = createContext<ToneProviderValue | undefined>(undefined);

interface ToneProviderProps {
  children: React.ReactNode;
}

/**
 * Tone Provider Component
 *
 * Wraps the app and provides adaptive tone based on patient state
 */
export function ToneProvider({ children }: ToneProviderProps) {
  // Get pain entries from store
  const entries = usePainTrackerStore(state => state.entries || []);

  // Tone preferences (stored in localStorage)
  const [preferences, setPreferences] = useState<TonePreferences>(() => {
    const stored = localStorage.getItem('tone-preferences');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_TONE_PREFERENCES;
      }
    }
    return DEFAULT_TONE_PREFERENCES;
  });

  // Build tone context
  const [context, setContext] = useState<ToneContextType>(() =>
    toneEngine.buildContext(entries, preferences)
  );

  // Update context when entries or preferences change
  useEffect(() => {
    const newContext = toneEngine.buildContext(entries, preferences, {
      // Could add sleep quality, time since flare, etc.
    });
    setContext(newContext);
  }, [entries, preferences]);

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<TonePreferences>) => {
    setPreferences(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('tone-preferences', JSON.stringify(next));
      return next;
    });
  }, []);

  // Get copy for current context
  const getCopy = useCallback(
    (copy: AdaptiveCopy): string => {
      return toneEngine.selectCopy(copy, context);
    },
    [context]
  );

  // Track user interaction (prompt acceptance)
  const trackInteraction = useCallback(
    (intent: CopyIntent, accepted: boolean) => {
      const measurement: ToneMeasurement = {
        metric: 'prompt_acceptance',
        value: accepted ? 1 : 0,
        context: {
          state: context.state,
          intent,
        },
        timestamp: new Date().toISOString(),
      };

      toneEngine.trackMeasurement(measurement);
    },
    [context.state]
  );

  // Track time to calm
  const trackTimeToCalm = useCallback((seconds: number) => {
    const measurement: ToneMeasurement = {
      metric: 'time_to_calm',
      value: seconds,
      context: {
        state: 'flare',
        intent: 'coach',
      },
      timestamp: new Date().toISOString(),
    };

    toneEngine.trackMeasurement(measurement);
  }, []);

  // Force state (for testing)
  const forceState = useCallback((state: PatientState) => {
    setContext(prev => ({ ...prev, state }));
  }, []);

  const value: ToneProviderValue = {
    context,
    preferences,
    updatePreferences,
    getCopy,
    trackInteraction,
    trackTimeToCalm,
    forceState,
  };

  return <ToneContext.Provider value={value}>{children}</ToneContext.Provider>;
}
