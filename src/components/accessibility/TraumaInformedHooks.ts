/**
 * Trauma-Informed UX Hooks
 *
 * Provides comprehensive accessibility and trauma-informed preferences management.
 * These hooks enable components to adapt their behavior and presentation
 * based on user needs and preferences.
 */

import { useContext, createContext, useCallback, useMemo } from 'react';
import {
  TraumaInformedContextType,
  TraumaInformedPreferences,
  defaultPreferences,
  getFontSizeValue,
  getTouchSizeValue,
} from './TraumaInformedTypes';

// Context for trauma-informed preferences
export const TraumaInformedContext = createContext<TraumaInformedContextType>({
  preferences: defaultPreferences,
  updatePreferences: () => {},
});

/**
 * Main hook for accessing trauma-informed preferences
 * @returns Current preferences and update function
 */
export const useTraumaInformed = () => useContext(TraumaInformedContext);

/**
 * Hook for cognitive load management
 * Returns computed values for managing cognitive complexity
 */
export function useCognitiveSupport() {
  const { preferences } = useTraumaInformed();

  return useMemo(
    () => ({
      /** Whether to show simplified UI */
      isSimplified: preferences.simplifiedMode,
      /** Whether to show memory aids and hints */
      showMemoryAids: preferences.showMemoryAids,
      /** Whether to auto-save user input */
      autoSave: preferences.autoSave,
      /** Whether to show progress indicators */
      showProgress: preferences.showProgress,
      /** Current cognitive load indicator preference */
      showLoadIndicators: preferences.showCognitiveLoadIndicators,
      /** Whether complexity should adapt to user behavior */
      adaptiveComplexity: preferences.adaptiveComplexity,
      /** Current disclosure level for progressive disclosure */
      disclosureLevel: preferences.defaultDisclosureLevel,
    }),
    [preferences]
  );
}

/**
 * Hook for visual accessibility preferences
 * Returns CSS values and computed flags for visual adaptations
 */
export function useVisualPreferences() {
  const { preferences } = useTraumaInformed();

  return useMemo(
    () => ({
      /** Current font size CSS value */
      fontSize: getFontSizeValue(preferences.fontSize),
      /** Current font size setting */
      fontSizeSetting: preferences.fontSize,
      /** Current contrast level */
      contrast: preferences.contrast,
      /** Whether high contrast is enabled */
      isHighContrast: preferences.contrast !== 'normal',
      /** Whether motion should be reduced */
      reduceMotion: preferences.reduceMotion,
      /** CSS animation duration based on motion preference */
      animationDuration: preferences.reduceMotion ? '0ms' : undefined,
    }),
    [preferences]
  );
}

/**
 * Hook for interaction preferences
 * Returns values for touch targets and confirmation behaviors
 */
export function useInteractionPreferences() {
  const { preferences } = useTraumaInformed();

  return useMemo(
    () => ({
      /** Current touch target size CSS value */
      touchTargetSize: getTouchSizeValue(preferences.touchTargetSize),
      /** Current touch target setting */
      touchTargetSetting: preferences.touchTargetSize,
      /** Current confirmation level */
      confirmationLevel: preferences.confirmationLevel,
      /** Whether to require confirmation for important actions */
      requireConfirmation: preferences.confirmationLevel !== 'minimal',
      /** Whether to show extra confirmation for destructive actions */
      strictConfirmation: preferences.confirmationLevel === 'high',
      /** Whether voice input is enabled */
      voiceInputEnabled: preferences.voiceInput,
    }),
    [preferences]
  );
}

/**
 * Hook for emotional safety preferences
 * Returns flags for gentle language and content warnings
 */
export function useEmotionalSafety() {
  const { preferences } = useTraumaInformed();

  return useMemo(
    () => ({
      /** Whether to use gentle, empathetic language */
      useGentleLanguage: preferences.gentleLanguage,
      /** Whether to hide potentially distressing content */
      hideDistressing: preferences.hideDistressingContent,
      /** Whether to show comfort prompts during difficult moments */
      showComfortPrompts: preferences.showComfortPrompts,
      /** Whether to show content warnings */
      enableContentWarnings: preferences.enableContentWarnings,
      /** Current content warning level */
      warningLevel: preferences.contentWarningLevel,
      /** Helper to get appropriate message based on gentle language setting */
      getMessage: (gentle: string, standard: string) =>
        preferences.gentleLanguage ? gentle : standard,
    }),
    [preferences]
  );
}

/**
 * Hook for crisis detection and support
 * Returns flags and helpers for crisis management
 */
export function useCrisisSupport() {
  const { preferences } = useTraumaInformed();

  return useMemo(
    () => ({
      /** Whether crisis detection is enabled */
      crisisDetectionEnabled: preferences.enableCrisisDetection,
      /** Current detection sensitivity */
      sensitivity: preferences.crisisDetectionSensitivity,
      /** Whether to show crisis resources */
      showResources: preferences.showCrisisResources,
      /** Crisis detection thresholds based on sensitivity */
      thresholds: {
        painLevel:
          preferences.crisisDetectionSensitivity === 'high'
            ? 7
            : preferences.crisisDetectionSensitivity === 'medium'
              ? 8
              : 9,
        distressKeywords:
          preferences.crisisDetectionSensitivity === 'high'
            ? 1
            : preferences.crisisDetectionSensitivity === 'medium'
              ? 2
              : 3,
      },
    }),
    [preferences]
  );
}

/**
 * Hook for progressive disclosure preferences
 */
export function useProgressiveDisclosure() {
  const { preferences } = useTraumaInformed();

  const getVisibilityForLevel = useCallback(
    (requiredLevel: TraumaInformedPreferences['defaultDisclosureLevel']) => {
      if (!preferences.enableProgressiveDisclosure) return true;

      const levels = ['essential', 'helpful', 'advanced', 'expert'] as const;
      const currentIndex = levels.indexOf(preferences.defaultDisclosureLevel);
      const requiredIndex = levels.indexOf(requiredLevel);

      return currentIndex >= requiredIndex;
    },
    [preferences.enableProgressiveDisclosure, preferences.defaultDisclosureLevel]
  );

  return useMemo(
    () => ({
      /** Whether progressive disclosure is enabled */
      enabled: preferences.enableProgressiveDisclosure,
      /** Current disclosure level */
      level: preferences.defaultDisclosureLevel,
      /** Whether disclosure adapts based on user behavior */
      adaptive: preferences.adaptiveDisclosure,
      /** Check if content at a given level should be visible */
      isVisible: getVisibilityForLevel,
      /** Convenience flags for common levels */
      showEssential: true,
      showHelpful: getVisibilityForLevel('helpful'),
      showAdvanced: getVisibilityForLevel('advanced'),
      showExpert: getVisibilityForLevel('expert'),
    }),
    [preferences, getVisibilityForLevel]
  );
}

/**
 * Combined hook that returns all preference categories
 * Use this when you need access to multiple preference types
 */
export function useAllTraumaInformedPreferences() {
  const { preferences, updatePreferences } = useTraumaInformed();
  const cognitive = useCognitiveSupport();
  const visual = useVisualPreferences();
  const interaction = useInteractionPreferences();
  const emotional = useEmotionalSafety();
  const crisis = useCrisisSupport();
  const disclosure = useProgressiveDisclosure();

  return useMemo(
    () => ({
      raw: preferences,
      update: updatePreferences,
      cognitive,
      visual,
      interaction,
      emotional,
      crisis,
      disclosure,
    }),
    [preferences, updatePreferences, cognitive, visual, interaction, emotional, crisis, disclosure]
  );
}
