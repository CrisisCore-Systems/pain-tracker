/**
 * Cognitive Fog Hook
 * Hook for other components to access fog level and related utilities
 */

import { useCrisisDetection } from './useCrisisDetection';

export function useCognitiveFog() {
  const { crisisLevel, behaviorData } = useCrisisDetection();
  
  // Calculate cognitive load from behavior data
  const cognitiveLoad = (behaviorData.errorCount * 0.2 + behaviorData.rapidClicks * 0.1) / 10;
  
  return {
    cognitiveLoad: Math.min(1, cognitiveLoad),
    hasFog: cognitiveLoad > 0.3,
    isSevere: cognitiveLoad > 0.7,
    isInCrisis: crisisLevel !== 'none'
  };
}
