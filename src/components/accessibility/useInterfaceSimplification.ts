/**
 * Interface Simplification Hook
 * Hook for components to check simplification state and adapt accordingly
 */

import { useCrisisDetection } from './useCrisisDetection';
import { useCognitiveFog } from './useCognitiveFog';
import { useTraumaInformed } from './TraumaInformedHooks';

export function useInterfaceSimplification() {
  const { crisisLevel } = useCrisisDetection();
  const { hasFog, isSevere } = useCognitiveFog();
  const { preferences } = useTraumaInformed();
  
  const isSimplified = preferences.simplifiedMode || 
    crisisLevel === 'severe' || 
    crisisLevel === 'emergency' ||
    (hasFog && isSevere);
  
  return {
    isSimplified,
    shouldHideDecorative: isSimplified,
    shouldUseLargeTouchTargets: isSimplified,
    shouldReduceColors: isSimplified,
    shouldRemoveAnimations: isSimplified
  };
}
