/**
 * Body Mapping Components
 * 
 * Interactive body map for pain location selection and visualization.
 * Supports both visual (SVG) and accessible (list) interaction modes.
 * 
 * Features:
 * - Interactive SVG body map with detailed anatomical regions
 * - Detailed regions for nerve pain tracking (inner/outer thigh, knee, foot, toes)
 * - Front and back body views
 * - Pain heatmap visualization mode
 * - Keyboard navigation support
 * - WCAG 2.1 AA accessible list alternative
 * - Export to PNG functionality
 * - Zoom and fullscreen controls
 * 
 * @example
 * ```tsx
 * import { InteractiveBodyMap, BodyMapAccessible } from './components/body-mapping';
 * 
 * // Selection mode
 * <InteractiveBodyMap
 *   selectedRegions={selectedRegions}
 *   onRegionSelect={setSelectedRegions}
 *   mode="selection"
 * />
 * 
 * // Heatmap mode with pain entries
 * <InteractiveBodyMap
 *   entries={painEntries}
 *   mode="heatmap"
 * />
 * 
 * // Accessible list view
 * <BodyMapAccessible
 *   selectedRegions={selectedRegions}
 *   onChange={setSelectedRegions}
 * />
 * ```
 */

export { InteractiveBodyMap } from './InteractiveBodyMap';
export { BodyMappingSection } from './BodyMappingSection';
export { BodyMapPage } from './BodyMapPage';
export { BodyMapAccessible, BODY_REGIONS as ACCESSIBLE_BODY_REGIONS } from '../accessibility/BodyMapAccessible';

// Re-export types
export type { BodyRegion as AccessibleBodyRegion } from '../accessibility/BodyMapAccessible';

/**
 * Mapping utilities for converting between region IDs and location names
 */
export const REGION_TO_LOCATION_MAP: Record<string, string> = {
  'head': 'head',
  'neck': 'neck',
  'left-shoulder': 'shoulders',
  'right-shoulder': 'shoulders',
  'left-upper-arm': 'arms',
  'right-upper-arm': 'arms',
  'left-elbow': 'elbows',
  'right-elbow': 'elbows',
  'left-forearm': 'arms',
  'right-forearm': 'arms',
  'left-hand': 'hands',
  'right-hand': 'hands',
  'chest': 'chest',
  'upper-back': 'upper back',
  'abdomen': 'abdomen',
  'lower-back': 'lower back',
  'left-hip': 'hips',
  'right-hip': 'hips',
  'left-thigh-outer': 'outer left leg',
  'left-thigh-inner': 'inner left leg',
  'right-thigh-outer': 'outer right leg',
  'right-thigh-inner': 'inner right leg',
  'left-knee-outer': 'knees',
  'left-knee-inner': 'knees',
  'right-knee-outer': 'knees',
  'right-knee-inner': 'knees',
  'left-shin-outer': 'left leg',
  'left-shin-inner': 'left leg',
  'right-shin-outer': 'right leg',
  'right-shin-inner': 'right leg',
  'left-calf-outer': 'left leg',
  'left-calf-inner': 'left leg',
  'right-calf-outer': 'right leg',
  'right-calf-inner': 'right leg',
  'left-ankle': 'ankles',
  'right-ankle': 'ankles',
  'left-foot-lateral': 'left foot',
  'left-foot-medial': 'left foot',
  'right-foot-lateral': 'right foot',
  'right-foot-medial': 'right foot',
  'left-toes-lateral': 'left toes',
  'left-toes-medial': 'left toes',
  'right-toes-lateral': 'right toes',
  'right-toes-medial': 'right toes',
};

/**
 * Convert region IDs to unique location names
 */
export function regionsToLocations(regionIds: string[]): string[] {
  const locations = new Set<string>();
  regionIds.forEach(id => {
    const location = REGION_TO_LOCATION_MAP[id];
    if (location) {
      locations.add(location);
    }
  });
  return Array.from(locations);
}

/**
 * Convert location names to region IDs (returns all matching regions)
 */
export function locationsToRegions(locations: string[]): string[] {
  const regions: string[] = [];
  locations.forEach(location => {
    Object.entries(REGION_TO_LOCATION_MAP).forEach(([regionId, loc]) => {
      if (loc === location && !regions.includes(regionId)) {
        regions.push(regionId);
      }
    });
  });
  return regions;
}
