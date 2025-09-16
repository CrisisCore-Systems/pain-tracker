/**
 * Crisis Mode Context
 * React context for managing crisis mode state
 */

import { createContext } from 'react';

// Crisis Mode Context Types
export interface CrisisModeContextType {
  isCrisisModeActive: boolean;
  crisisFeatures: {
    emergencyMode: boolean;
    cognitiveFogSupport: boolean;
    multiModalInput: boolean;
    stressResponsiveUI: boolean;
  };
  toggleCrisisFeature: (feature: keyof CrisisModeContextType['crisisFeatures']) => void;
  activateEmergencyMode: () => void;
  deactivateEmergencyMode: () => void;
  crisisSettings: CrisisSettings;
  updateCrisisSettings: (settings: Partial<CrisisSettings>) => void;
}

export interface CrisisSettings {
  autoActivation: {
    enabled: boolean;
    thresholds: {
      mild: boolean;
      moderate: boolean;
      severe: boolean;
      emergency: boolean;
    };
  };
  emergencyContacts: Array<{
    name: string;
    phone: string;
    type: 'emergency' | 'support' | 'healthcare';
    priority: number;
  }>;
  preferences: {
    showStressIndicator: boolean;
    enableHapticFeedback: boolean;
    reducedAnimations: boolean;
    highContrast: boolean;
    largeText: boolean;
    voiceGuidance: boolean;
  };
  customization: {
    primaryColor: string;
    emergencyColor: string;
    fontScale: number;
    buttonSize: 'normal' | 'large' | 'extra-large';
  };
}

export const defaultCrisisSettings: CrisisSettings = {
  autoActivation: {
    enabled: true,
    thresholds: {
      mild: false,
      moderate: true,
      severe: true,
      emergency: true
    }
  },
  emergencyContacts: [
    {
      name: 'Emergency Services',
      phone: '911',
      type: 'emergency',
      priority: 1
    },
    {
      name: 'Crisis Hotline',
      phone: '988',
      type: 'support',
      priority: 2
    }
  ],
  preferences: {
    showStressIndicator: true,
    enableHapticFeedback: true,
    reducedAnimations: false,
    highContrast: false,
    largeText: false,
    voiceGuidance: false
  },
  customization: {
    primaryColor: '#3b82f6',
    emergencyColor: '#dc2626',
    fontScale: 1.0,
    buttonSize: 'normal'
  }
};

export const CrisisModeContext = createContext<CrisisModeContextType | null>(null);
