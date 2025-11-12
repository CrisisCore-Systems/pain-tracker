/**
 * @fileoverview Tone Context Hooks
 * 
 * Separated from ToneContext.tsx to fix Fast Refresh warnings
 */

import { useContext, useCallback } from 'react';
import type { AdaptiveCopy, CopyIntent } from '../types/tone';
import { ToneContext, type ToneProviderValue } from './ToneContext';

/**
 * Hook to access tone context
 */
export function useTone() {
  const context = useContext(ToneContext);
  
  if (!context) {
    throw new Error('useTone must be used within ToneProvider');
  }
  
  return context;
}

/**
 * Hook to get adaptive copy
 * 
 * Usage:
 * ```tsx
 * const copy = useAdaptiveCopy({
 *   base: "Log pain (10s)",
 *   states: {
 *     flare: "Log pain",
 *   },
 * });
 * ```
 */
export function useAdaptiveCopy(copy: AdaptiveCopy): string {
  const { getCopy } = useTone();
  return getCopy(copy);
}

/**
 * Hook to track prompt interactions
 * 
 * Usage:
 * ```tsx
 * const trackPrompt = usePromptTracking('coach');
 * 
 * // When user accepts prompt
 * trackPrompt(true);
 * 
 * // When user dismisses
 * trackPrompt(false);
 * ```
 */
export function usePromptTracking(intent: CopyIntent) {
  const { trackInteraction } = useTone();
  
  return useCallback((accepted: boolean) => {
    trackInteraction(intent, accepted);
  }, [intent, trackInteraction]);
}
