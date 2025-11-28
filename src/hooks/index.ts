/**
 * Hooks Index
 * Centralized exports for all custom React hooks
 */

// Responsive and Media Query Hooks
export {
  useMediaQuery,
  useBreakpoint,
  useResponsive,
  useIsTouchDevice,
  type Breakpoint,
} from './useMediaQuery';

// Other Hooks
export { useAsyncRetry } from './useAsyncRetry';
export { useAutomaticTriggerAnalysis } from './useAutomaticTriggerAnalysis';
export { useEmotionalValidation } from './useEmotionalValidation';
export { useEmpathyConsent } from './useEmpathyConsent';
export { useEmpathyMetrics } from './useEmpathyMetrics';
export { useFetch } from './useFetch';
export { useIntelligentTriggers } from './useIntelligentTriggers';
export { default as useIsMounted } from './useIsMounted';
export { default as useLocalStorage } from './useLocalStorage';
export { usePWA } from './usePWA';
export { usePWAStatus, useInstallPWA, useBackgroundSync } from './usePWASimple';
export { usePainTrackerStorage } from './usePainTrackerStorage';
export { usePatternAlerts } from './usePatternAlerts';
export { useSavedFilters } from './useSavedFilters';
export { useBiophilicTheme } from './useBiophilicTheme';
