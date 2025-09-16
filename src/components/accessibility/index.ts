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
  AccessibleField 
} from './ScreenReaderUtils';
export { LanguageSelector } from './LanguageSelector';

// Trauma-Informed UX Components
// Core types and interfaces
export type { 
  TraumaInformedPreferences
} from './TraumaInformedTypes';

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
  AutoSaveIndicator
} from './TraumaInformedUX';

// Physical accommodation components
export {
  VoiceInput,
  LargeTouchSlider,
  GestureNavigation,
  TremorFriendlyInput,
  SwitchControl
} from './PhysicalAccommodations';

// Trauma-informed form components
export {
  TraumaInformedPainEntryForm
} from './TraumaInformedPainForm';

// Settings and customization
export { AccessibilitySettingsPanel } from './AccessibilitySettings';

// Layout components
export {
  TraumaInformedLayout,
  TraumaInformedPage,
  TraumaInformedSection
} from './TraumaInformedLayout';

// Testing and validation components
export {
  TraumaInformedValidationPanel,
  TraumaInformedTestingChecklist
} from './TraumaInformedValidation';

// Integration summary
export { IntegrationSummary } from './IntegrationSummary';
