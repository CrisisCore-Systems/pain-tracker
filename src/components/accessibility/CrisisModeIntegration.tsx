/**
 * Crisis Mode Integration
 * Integrates all crisis features into the main application with proper context management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useCrisisDetection } from './useCrisisDetection';
import { useTraumaInformed } from './TraumaInformedHooks';
import { EmergencyModeLayout } from './EmergencyModeInterface';
import { CognitiveBreadcrumbs, StepByStepNavigation } from './CognitiveFogNavigation';
import { MultiModalInputManager } from './MultiModalInputSystem';
import { 
  StressResponsiveContainer, 
  StressLevelIndicator, 
  CrisisAlertBanner 
} from './StressResponsiveUI';
import { 
  CrisisModeContext, 
  CrisisModeContextType,
  CrisisSettings,
  defaultCrisisSettings 
} from './CrisisModeContext';
import { useCrisisMode } from './useCrisisMode';

// Crisis Mode Provider
interface CrisisModeProviderProps {
  children: React.ReactNode;
  initialSettings?: Partial<CrisisSettings>;
}

export function CrisisModeProvider({ children, initialSettings = {} }: CrisisModeProviderProps) {
  const { crisisLevel, resetCrisisDetection } = useCrisisDetection();
  const { preferences } = useTraumaInformed();
  
  const [isCrisisModeActive, setIsCrisisModeActive] = useState(false);
  const [crisisFeatures, setCrisisFeatures] = useState({
    emergencyMode: false,
    cognitiveFogSupport: false,
    multiModalInput: false,
    stressResponsiveUI: true
  });
  
  const [crisisSettings, setCrisisSettings] = useState<CrisisSettings>({
    ...defaultCrisisSettings,
    ...initialSettings
  });

  // Auto-activate crisis mode based on stress level
  useEffect(() => {
    if (crisisSettings.autoActivation.enabled) {
      const shouldActivate = 
        (crisisLevel === 'mild' && crisisSettings.autoActivation.thresholds.mild) ||
        (crisisLevel === 'moderate' && crisisSettings.autoActivation.thresholds.moderate) ||
        (crisisLevel === 'severe' && crisisSettings.autoActivation.thresholds.severe) ||
        (crisisLevel === 'emergency' && crisisSettings.autoActivation.thresholds.emergency);
      
      if (shouldActivate && !isCrisisModeActive) {
        setIsCrisisModeActive(true);
        setCrisisFeatures(prev => ({
          ...prev,
          emergencyMode: crisisLevel === 'severe' || crisisLevel === 'emergency',
          cognitiveFogSupport: true,
          multiModalInput: true,
          stressResponsiveUI: true
        }));
      } else if (crisisLevel === 'none' && isCrisisModeActive) {
        // Auto-deactivate when stress returns to normal
        setTimeout(() => {
          setIsCrisisModeActive(false);
          setCrisisFeatures(prev => ({
            ...prev,
            emergencyMode: false,
            cognitiveFogSupport: false,
            multiModalInput: false
          }));
        }, 5000); // 5 second delay to prevent flapping
      }
    }
  }, [crisisLevel, crisisSettings.autoActivation, isCrisisModeActive]);

  // Apply user preferences to crisis settings
  useEffect(() => {
    setCrisisSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        reducedAnimations: preferences.reduceMotion,
        highContrast: preferences.contrast === 'high',
        largeText: preferences.fontSize === 'large' || preferences.fontSize === 'xl',
        voiceGuidance: false
      }
    }));
  }, [preferences]);

  const toggleCrisisFeature = useCallback((feature: keyof typeof crisisFeatures) => {
    setCrisisFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  }, []);

  const activateEmergencyMode = useCallback(() => {
    setIsCrisisModeActive(true);
    setCrisisFeatures({
      emergencyMode: true,
      cognitiveFogSupport: true,
      multiModalInput: true,
      stressResponsiveUI: true
    });
  }, []);

  const deactivateEmergencyMode = useCallback(() => {
    setIsCrisisModeActive(false);
    setCrisisFeatures({
      emergencyMode: false,
      cognitiveFogSupport: false,
      multiModalInput: false,
      stressResponsiveUI: true
    });
    resetCrisisDetection();
  }, [resetCrisisDetection]);

  const updateCrisisSettings = useCallback((settings: Partial<CrisisSettings>) => {
    setCrisisSettings(prev => ({
      ...prev,
      ...settings
    }));
  }, []);

  const contextValue: CrisisModeContextType = {
    isCrisisModeActive,
    crisisFeatures,
    toggleCrisisFeature,
    activateEmergencyMode,
    deactivateEmergencyMode,
    crisisSettings,
    updateCrisisSettings
  };

  return (
    <CrisisModeContext.Provider value={contextValue}>
      {children}
    </CrisisModeContext.Provider>
  );
}

// Crisis Mode Layout Wrapper
interface CrisisModeLayoutProps {
  children: React.ReactNode;
  showControls?: boolean;
  className?: string;
}

export function CrisisModeLayout({ 
  children, 
  showControls = false,
  className = '' 
}: CrisisModeLayoutProps) {
  const { 
    isCrisisModeActive, 
    crisisFeatures, 
    crisisSettings,
    deactivateEmergencyMode 
  } = useCrisisMode();
  const { crisisLevel } = useCrisisDetection();
  
  const [showAlertBanner, setShowAlertBanner] = useState(false);

  useEffect(() => {
    setShowAlertBanner(isCrisisModeActive && crisisLevel !== 'none');
  }, [isCrisisModeActive, crisisLevel]);

  const handleEmergencyAction = useCallback((action: string) => {
    switch (action) {
      case 'call_emergency': {
        const emergencyContact = crisisSettings.emergencyContacts.find(
          (contact: CrisisSettings['emergencyContacts'][0]) => contact.type === 'emergency'
        );
        if (emergencyContact) {
          window.location.href = `tel:${emergencyContact.phone}`;
        }
        break;
      }
      case 'call_support': {
        const supportContact = crisisSettings.emergencyContacts.find(
          (contact: CrisisSettings['emergencyContacts'][0]) => contact.type === 'support'
        );
        if (supportContact) {
          window.location.href = `tel:${supportContact.phone}`;
        }
        break;
      }
      case 'exit_crisis_mode':
        deactivateEmergencyMode();
        break;
      default:
        console.log('Emergency action:', action);
    }
  }, [crisisSettings.emergencyContacts, deactivateEmergencyMode]);

  const handleVoiceCommand = useCallback((command: string) => {
    switch (command) {
      case 'emergency_help':
        handleEmergencyAction('call_emergency');
        break;
      case 'call_support':
        handleEmergencyAction('call_support');
        break;
      case 'calm_mode':
        deactivateEmergencyMode();
        break;
      default:
        console.log('Voice command:', command);
    }
  }, [handleEmergencyAction, deactivateEmergencyMode]);

  return (
    <StressResponsiveContainer 
      className={`crisis-mode-layout ${className}`}
      enableStressAdaptation={crisisFeatures.stressResponsiveUI}
    >
      {/* Crisis Alert Banner */}
      {showAlertBanner && (
        <CrisisAlertBanner
          onDismiss={() => setShowAlertBanner(false)}
          actions={[
            {
              label: 'Get Help',
              action: () => handleEmergencyAction('call_emergency'),
              urgency: 'critical'
            },
            {
              label: 'Call Support',
              action: () => handleEmergencyAction('call_support'),
              urgency: 'high'
            },
            {
              label: 'Exit Crisis Mode',
              action: () => handleEmergencyAction('exit_crisis_mode'),
              urgency: 'medium'
            }
          ]}
          autoHide={false}
        />
      )}

      {/* Stress Level Indicator */}
      {crisisSettings.preferences.showStressIndicator && (
        <StressLevelIndicator
          showLabel={true}
          position="top-right"
          size="medium"
        />
      )}

      {/* Emergency Mode Interface */}
      {crisisFeatures.emergencyMode && (
        <div className="crisis-emergency-overlay">
          <EmergencyModeLayout
            isActive={true}
            severity="moderate"
          >
            {/* Emergency mode content would go here */}
            <div className="p-4">Emergency mode is active</div>
          </EmergencyModeLayout>
        </div>
      )}

      {/* Cognitive Fog Navigation */}
      {crisisFeatures.cognitiveFogSupport && (
        <div className="crisis-navigation-wrapper">
          <CognitiveBreadcrumbs 
            steps={['Home', 'Pain Tracker', 'Current Page']}
            currentStep={2}
            onStepClick={(stepIndex) => console.log('Navigate to step:', stepIndex)}
            allowBackNavigation={true}
          />
          {(crisisLevel === 'severe' || crisisLevel === 'emergency') && (
            <StepByStepNavigation
              session={{
                id: 'crisis-session',
                title: 'Crisis Support Session',
                description: 'Step-by-step guidance through crisis',
                steps: [
                  {
                    id: '1',
                    title: 'Assessment',
                    description: 'Assess current situation',
                    component: <div>Assessment content</div>,
                    isCompleted: false,
                    isOptional: false,
                    estimatedTime: 2
                  }
                ],
                currentStepIndex: 0,
                startTime: new Date(),
                totalEstimatedTime: 10,
                allowBackNavigation: true,
                showProgress: true
              }}
              onStepComplete={(stepId) => console.log('Step completed:', stepId)}
              onNavigateBack={() => console.log('Navigate back')}
              onNavigateNext={() => console.log('Navigate next')}
              onSessionComplete={() => console.log('Session complete')}
              onSessionExit={() => console.log('Session exit')}
            />
          )}
        </div>
      )}

      {/* Multi-Modal Input System */}
      {crisisFeatures.multiModalInput && (
        <div className="crisis-input-wrapper">
          <MultiModalInputManager
            onCommand={handleVoiceCommand}
            onEmergencyAction={handleEmergencyAction}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="crisis-content-wrapper">
        {children}
      </div>

      {/* Crisis Mode Controls (for testing/debugging) */}
      {showControls && (
        <div className="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border">
          <h3 className="text-sm font-medium mb-2">Crisis Mode Controls</h3>
          <div className="space-y-2 text-xs">
            <div>
              <strong>Status:</strong> {isCrisisModeActive ? 'Active' : 'Inactive'}
            </div>
            <div>
              <strong>Level:</strong> {crisisLevel}
            </div>
            <div>
              <strong>Features:</strong>
              <ul className="ml-2">
                {Object.entries(crisisFeatures).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value ? '✓' : '✗'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </StressResponsiveContainer>
  );
}

// Crisis Mode Settings Panel
interface CrisisModeSettingsPanelProps {
  onClose: () => void;
  className?: string;
}

export function CrisisModeSettingsPanel({ 
  onClose, 
  className = '' 
}: CrisisModeSettingsPanelProps) {
  const { 
    crisisSettings, 
    updateCrisisSettings, 
    crisisFeatures, 
    toggleCrisisFeature 
  } = useCrisisMode();

  const handleAutoActivationChange = (level: keyof typeof crisisSettings.autoActivation.thresholds) => {
    updateCrisisSettings({
      autoActivation: {
        ...crisisSettings.autoActivation,
        thresholds: {
          ...crisisSettings.autoActivation.thresholds,
          [level]: !crisisSettings.autoActivation.thresholds[level]
        }
      }
    });
  };

  const handlePreferenceChange = (key: keyof typeof crisisSettings.preferences) => {
    updateCrisisSettings({
      preferences: {
        ...crisisSettings.preferences,
        [key]: !crisisSettings.preferences[key]
      }
    });
  };

  return (
    <StressResponsiveContainer className={`crisis-settings-panel ${className}`}>
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Crisis Mode Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Auto-Activation Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Auto-Activation</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={crisisSettings.autoActivation.enabled}
                onChange={(e) => updateCrisisSettings({
                  autoActivation: {
                    ...crisisSettings.autoActivation,
                    enabled: e.target.checked
                  }
                })}
                className="mr-2"
              />
              Enable automatic crisis mode activation
            </label>
            {crisisSettings.autoActivation.enabled && (
              <div className="ml-4 space-y-1">
                {(Object.entries(crisisSettings.autoActivation.thresholds) as Array<[string, boolean]>).map(([level, enabled]) => (
                  <label key={level} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={() => handleAutoActivationChange(level as keyof typeof crisisSettings.autoActivation.thresholds)}
                      className="mr-2"
                    />
                    Activate on {level} stress
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Crisis Features</h3>
          <div className="space-y-2">
            {(Object.entries(crisisFeatures) as Array<[string, boolean]>).map(([feature, enabled]) => (
              <label key={feature} className="flex items-center">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => toggleCrisisFeature(feature as keyof typeof crisisFeatures)}
                  className="mr-2"
                />
                {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </label>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Preferences</h3>
          <div className="space-y-2">
            {(Object.entries(crisisSettings.preferences) as Array<[string, boolean]>).map(([pref, enabled]) => (
              <label key={pref} className="flex items-center">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => handlePreferenceChange(pref as keyof typeof crisisSettings.preferences)}
                  className="mr-2"
                />
                {pref.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </label>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Emergency Contacts</h3>
          <div className="space-y-2">
            {crisisSettings.emergencyContacts.map((contact: CrisisSettings['emergencyContacts'][0], index: number) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                <div className="font-medium">{contact.name}</div>
                <div className="text-gray-600">{contact.phone} ({contact.type})</div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </StressResponsiveContainer>
  );
}

export default {
  CrisisModeProvider,
  CrisisModeLayout,
  CrisisModeSettingsPanel
};
