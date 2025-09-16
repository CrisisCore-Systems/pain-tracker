/**
 * Validation Technology Integration - Main Export Index
 * 
 * This file provides easy access to all validation technology components
 * and services for integration into the pain tracker application.
 */

// Core Validation Services
export { 
  EmotionalValidation, 
  ValidationHistory, 
  type ValidationResponse 
} from '../services/EmotionalValidationService';

export { 
  validationIntegration,
  type ValidationEvent,
  type ValidationPattern,
  type ProgressInsights 
} from '../services/ValidationIntegrationService';

// Progress Tracking Components
export { 
  HolisticProgressTracker,
  type WellbeingMetrics,
  type ProgressEntry 
} from '../components/progress/HolisticProgressTracker';

// User Agency Components
export { 
  UserControlPanel, 
  ChoiceEmphasis, 
  EmpowermentMessageDisplay 
} from '../components/agency/UserAgencyComponents';

// Main Integration Components
export { 
  ValidationTechnologyIntegration,
  ValidationIntegratedPainForm,
  ValidationDashboard 
} from '../components/integration/ValidationTechnologyIntegration';

// React Hooks
export { useEmotionalValidation } from '../hooks/useEmotionalValidation';

// Extended Type Definitions (for reference)
export type { TraumaInformedPreferences } from '../components/accessibility/TraumaInformedTypes';

/**
 * Quick Start Guide:
 * 
 * 1. Basic emotional validation:
 *    import { EmotionalValidation } from './validation-technology';
 *    <EmotionalValidation text={userInput} onValidation={handleValidation} />
 * 
 * 2. Holistic progress tracking:
 *    import { HolisticProgressTracker } from './validation-technology';
 *    <HolisticProgressTracker painEntries={entries} onProgressUpdate={handleProgress} />
 * 
 * 3. User agency features:
 *    import { UserControlPanel } from './validation-technology';
 *    <UserControlPanel />
 * 
 * 4. Complete integration:
 *    import { ValidationTechnologyIntegration } from './validation-technology';
 *    <ValidationTechnologyIntegration painEntries={entries} />
 * 
 * 5. Form integration:
 *    import { ValidationIntegratedPainForm } from './validation-technology';
 *    <ValidationIntegratedPainForm onSubmit={handleSubmit} painEntries={entries} />
 */
