/**
 * Validation Technology Integration - Export Index
 * Comprehensive emotional validation, progress tracking, and user agency system
 */

// Real-time Emotional Validation
export { 
  EmotionalValidation, 
  ValidationHistory,
  type ValidationResponse,
  type EmotionalState 
} from '../../services/EmotionalValidationService';

// Holistic Progress Tracking
export { 
  HolisticProgressTracker,
  type WellbeingMetrics,
  type ProgressMilestone,
  type CopingStrategy,
  type ProgressEntry 
} from '../progress/HolisticProgressTracker';

// User Agency & Empowerment
export { 
  UserControlPanel,
  ChoiceEmphasis,
  EmpowermentMessageDisplay
} from '../agency/UserAgencyComponents';

// Integration Services
export { 
  ValidationAnalyticsService,
  ValidationIntegrationService,
  validationAnalytics,
  validationIntegration,
  type ValidationMetrics,
  type ValidationPattern,
  type ValidationPreferences 
} from '../../services/ValidationIntegrationService';

// Main Integration Components
export { 
  ValidationTechnologyIntegration,
  ValidationIntegratedPainForm,
  ValidationDashboard 
} from '../integration/ValidationTechnologyIntegration';

// Hooks
export { useEmotionalValidation } from '../../hooks/useEmotionalValidation';

/**
 * Quick Setup Guide:
 * 
 * 1. Import the main integration component:
 *    import { ValidationTechnologyIntegration } from './path/to/validation-technology';
 * 
 * 2. Use it in your pain tracker:
 *    <ValidationTechnologyIntegration 
 *      painEntries={entries}
 *      onPainEntrySubmit={handleSubmit}
 *      showDashboard={true}
 *    />
 * 
 * 3. Or use individual components:
 *    - EmotionalValidation: Real-time supportive messaging
 *    - HolisticProgressTracker: Beyond pain score tracking
 *    - UserControlPanel: User empowerment and control
 * 
 * Features included:
 * ✓ Real-time emotional validation with empathetic messaging
 * ✓ Holistic progress tracking (emotional, functional, social, coping)
 * ✓ User agency reinforcement with choice emphasis
 * ✓ Data persistence and analytics
 * ✓ Trauma-informed UX patterns
 * ✓ Accessibility integration
 * ✓ Privacy-first design
 */
