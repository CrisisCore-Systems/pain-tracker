/**
 * Accessibility Components - Including Trauma-Informed UX
 * Comprehensive export of all accessibility and trauma-informed UX components
 */

// Existing accessibility components
export { AccessibilityControls } from './AccessibilityControls';
export { KeyboardNavigation, useFocusManagement } from './KeyboardNavigation';
export {
  ScreenReaderAnnouncement,
  useScreenReader,
  SkipLink,
  VisuallyHidden,
  AccessibleButton,
  AccessibleField,
} from './ScreenReaderUtils';
export { LanguageSelector } from './LanguageSelector';

// Trauma-Informed UX Components
// Core types and interfaces
export type { TraumaInformedPreferences } from './TraumaInformedTypes';

// Context and hooks
export { TraumaInformedContext } from './TraumaInformedHooks';
export { useTraumaInformed } from './TraumaInformedHooks';
export { TraumaInformedProvider } from './TraumaInformedContext';

// Core UX components
export {
  ProgressiveDisclosure,
  MemoryAid,
  GentleValidation,
  TouchOptimizedButton,
  CognitiveLoadReducer,
  ComfortPrompt,
  AutoSaveIndicator,
} from './TraumaInformedUX';

// Physical accommodation components
export {
  VoiceInput,
  LargeTouchSlider,
  GestureNavigation,
  TremorFriendlyInput,
  SwitchControl,
} from './PhysicalAccommodations';

// Trauma-informed form components
export { TraumaInformedPainEntryForm } from './TraumaInformedPainForm';

// Settings and customization
export { AccessibilitySettingsPanel } from './AccessibilitySettings';

// Layout components
export {
  TraumaInformedLayout,
  TraumaInformedPage,
  TraumaInformedSection,
} from './TraumaInformedLayout';

// Testing and validation components
export {
  TraumaInformedValidationPanel,
  TraumaInformedTestingChecklist,
} from './TraumaInformedValidation';

// Integration summary
export { IntegrationSummary } from './IntegrationSummary';

// Enhanced trauma-informed components (new)
export {
  CognitiveLoadIndicator,
  CognitiveLoadWrapper,
  CognitiveLoadMonitor,
} from './CognitiveLoadIndicator';

export { CognitiveFogIndicator } from './CognitiveFogIndicator';

export { CrisisNavigationBar, CrisisCompassNavigation } from './CrisisNavigationPatterns';

export { CrisisStateAdaptation } from './CrisisStateAdaptation';

export { ContentWarning, InlineContentWarning, AutoContentWarning } from './ContentWarning';

export { EnhancedContentWarning } from './EnhancedContentWarning';

export {
  ProgressiveDisclosure as EnhancedProgressiveDisclosure,
  LayeredDisclosure,
  AdaptiveDisclosure,
} from './ProgressiveDisclosurePatterns';

export {
  MedicalProgressiveDisclosure,
  OrganizedMedicalSections,
} from './MedicalProgressiveDisclosure';

export { InterfaceSimplifier } from './InterfaceSimplification';

export { SmartFormSimplifier } from './SmartFormSimplifier';

// WCAG 2.2 AA Accessibility Components (Phase 1.5)
export { AccessiblePainSlider } from './AccessiblePainSlider';
export { FocusTrap, AccessibleModal } from './FocusTrap';

// Panic Mode for trauma-informed crisis support
export { PanicMode } from './PanicMode';

// Utility functions and hooks
export * from './cognitiveLoadUtils';
export { useCrisisDetection } from './useCrisisDetection';
export { useCognitiveFog } from './useCognitiveFog';
export { useInterfaceSimplification } from './useInterfaceSimplification';
