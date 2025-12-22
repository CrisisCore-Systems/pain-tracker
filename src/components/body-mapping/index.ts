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

export { REGION_TO_LOCATION_MAP, regionsToLocations, locationsToRegions } from './mapping';

