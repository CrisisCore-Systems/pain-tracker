/**
 * Trauma-Informed UX Types and Constants
 */

// User Preferences Interface
export interface TraumaInformedPreferences {
  // Cognitive Support
  simplifiedMode: boolean;
  showMemoryAids: boolean;
  autoSave: boolean;
  showProgress: boolean;
  showCognitiveLoadIndicators: boolean;
  adaptiveComplexity: boolean;

  // Visual Preferences
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  contrast: 'normal' | 'high' | 'extra-high';
  reduceMotion: boolean;

  // Interaction Preferences
  touchTargetSize: 'normal' | 'large' | 'extra-large';
  confirmationLevel: 'minimal' | 'standard' | 'high';
  voiceInput: boolean;

  // Emotional Safety
  gentleLanguage: boolean;
  hideDistressingContent: boolean;
  showComfortPrompts: boolean;
  enableContentWarnings: boolean;
  contentWarningLevel: 'minimal' | 'standard' | 'comprehensive';

  // Crisis Support
  enableCrisisDetection: boolean;
  crisisDetectionSensitivity: 'low' | 'medium' | 'high';
  showCrisisResources: boolean;

  // Progressive Disclosure
  enableProgressiveDisclosure: boolean;
  defaultDisclosureLevel: 'essential' | 'helpful' | 'advanced' | 'expert';
  adaptiveDisclosure: boolean;

  // Validation Technology Features
  realTimeValidation: boolean;
  theme: 'light' | 'dark' | 'high-contrast' | 'auto';
  reminderFrequency: 'none' | 'daily' | 'twice-daily' | 'weekly';
}

// Default preferences optimized for trauma-informed care
export const defaultPreferences: TraumaInformedPreferences = {
  simplifiedMode: true,
  showMemoryAids: true,
  autoSave: true,
  showProgress: true,
  showCognitiveLoadIndicators: true,
  adaptiveComplexity: true,
  fontSize: 'medium',
  contrast: 'normal',
  reduceMotion: false,
  touchTargetSize: 'large',
  confirmationLevel: 'standard',
  voiceInput: false,
  gentleLanguage: true,
  hideDistressingContent: false,
  showComfortPrompts: true,
  enableContentWarnings: true,
  contentWarningLevel: 'standard',
  enableCrisisDetection: true,
  crisisDetectionSensitivity: 'medium',
  showCrisisResources: true,
  enableProgressiveDisclosure: true,
  defaultDisclosureLevel: 'helpful',
  adaptiveDisclosure: true,
  realTimeValidation: true,
  theme: 'auto',
  reminderFrequency: 'daily',
};

// Context interface
export interface TraumaInformedContextType {
  preferences: TraumaInformedPreferences;
  updatePreferences: (updates: Partial<TraumaInformedPreferences>) => void;
}

// Helper functions
export const getFontSizeValue = (size: TraumaInformedPreferences['fontSize']): string => {
  const fontSizeMap = {
    small: '14px',
    medium: '16px',
    large: '18px',
    xl: '20px',
  };
  return fontSizeMap[size];
};

export const getTouchSizeValue = (size: TraumaInformedPreferences['touchTargetSize']): string => {
  const touchSizeMap = {
    normal: '44px',
    large: '56px',
    'extra-large': '72px',
  };
  return touchSizeMap[size];
};
