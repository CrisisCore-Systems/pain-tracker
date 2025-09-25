/**
 * Emergency Mode Interface Components
 * Simplified, crisis-responsive UI components for emergency situations
 */

import React, { useState, useEffect } from 'react';
import { useCrisisDetection } from './useCrisisDetection';
import { useTraumaInformed } from './TraumaInformedHooks';
import { TouchOptimizedButton } from './TraumaInformedUX';
import { VoiceInput } from './PhysicalAccommodations';
import { 
  Phone, 
  AlertTriangle, 
  Heart, 
  Clock, 
  Shield, 
  Home, 
  Save,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Pause,
  Play,
  RotateCcw,
  Zap
} from 'lucide-react';
import type { EmergencyContact, EmergencyProtocol } from '../../types';

// Emergency Mode Layout
interface EmergencyModeLayoutProps {
  children: React.ReactNode;
  isActive?: boolean;
  onExit?: () => void;
  severity?: 'mild' | 'moderate' | 'severe' | 'critical';
}

export function EmergencyModeLayout({ 
  children, 
  isActive = false, 
  onExit,
  severity = 'moderate' 
}: EmergencyModeLayoutProps) {
  const crisisDetection = useCrisisDetection();
  const { activateEmergencyMode, deactivateEmergencyMode } = crisisDetection;
  
  useEffect(() => {
    if (isActive) {
      activateEmergencyMode();
    } else {
      deactivateEmergencyMode();
    }
  }, [isActive, activateEmergencyMode, deactivateEmergencyMode]);

  const severityColors = {
    mild: 'bg-yellow-50 border-yellow-200',
    moderate: 'bg-orange-50 border-orange-200',
    severe: 'bg-red-50 border-red-200',
    critical: 'bg-red-100 border-red-300'
  };

  if (!isActive) return <>{children}</>;

  return (
    <div className={`emergency-mode-layout min-h-screen ${severityColors[severity]}`}>
      {/* Emergency Header */}
      <div className="emergency-header bg-white border-b-4 border-red-500 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold text-red-700">Emergency Mode</h1>
                <p className="text-sm text-red-600">Simplified interface active</p>
              </div>
            </div>
            
            {onExit && (
              <TouchOptimizedButton
                onClick={onExit}
                variant="secondary"
                size="large"
                className="text-gray-600 hover:text-gray-800"
              >
                Exit Emergency Mode
              </TouchOptimizedButton>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Content */}
      <div className="emergency-content max-w-4xl mx-auto px-6 py-8">
        {children}
      </div>
    </div>
  );
}

// Emergency Action Panel
interface EmergencyActionPanelProps {
  contacts: EmergencyContact[];
  protocols: EmergencyProtocol[];
  currentPainLevel: number;
  onPainLevelUpdate: (level: number) => void;
  onContactCall: (contact: EmergencyContact) => void;
  onProtocolActivate: (protocol: EmergencyProtocol) => void;
}

export function EmergencyActionPanel({
  contacts,
  protocols,
  currentPainLevel,
  onPainLevelUpdate,
  onContactCall,
  onProtocolActivate
}: EmergencyActionPanelProps) {
  const crisisDetection = useCrisisDetection();
  const { trackHelpRequest } = crisisDetection;
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);

  // Find the most critical protocol for current pain level
  const activeProtocol = protocols
    .filter(p => currentPainLevel >= p.painThreshold)
    .sort((a, b) => b.painThreshold - a.painThreshold)[0];

  // Get primary contacts (healthcare providers first)
  const primaryContacts = contacts
    .filter(c => c.isHealthcareProvider)
    .slice(0, 2)
    .concat(
      contacts
        .filter(c => !c.isHealthcareProvider)
        .slice(0, 2)
    );

  const handleEmergencyCall = (contact: EmergencyContact) => {
    trackHelpRequest();
    onContactCall(contact);
  };

  const handleProtocolActivation = (protocol: EmergencyProtocol) => {
    trackHelpRequest();
    onProtocolActivate(protocol);
  };

  const handleVoiceCommand = (transcript: string) => {
    const command = transcript.toLowerCase();
    
    if (command.includes('call') || command.includes('phone')) {
      if (primaryContacts.length > 0) {
        handleEmergencyCall(primaryContacts[0]);
      }
    } else if (command.includes('save')) {
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 3000);
    } else if (command.includes('help')) {
      trackHelpRequest();
    }
  };

  return (
    <div className="emergency-action-panel space-y-6">
      {/* Crisis Alert */}
      {activeProtocol && (
        <div className="crisis-alert bg-red-100 border-2 border-red-300 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="w-12 h-12 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-red-800 mb-2">
                High Pain Level Detected ({currentPainLevel}/10)
              </h2>
              <p className="text-red-700 mb-4">
                Protocol activated: {activeProtocol.name}
              </p>
              
              <TouchOptimizedButton
                onClick={() => handleProtocolActivation(activeProtocol)}
                variant="primary"
                size="large"
                className="bg-red-600 hover:bg-red-700 text-white w-full"
              >
                <Zap className="w-6 h-6 mr-2" />
                Follow Emergency Protocol
              </TouchOptimizedButton>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Emergency Contacts */}
          {primaryContacts.map((contact) => (
            <TouchOptimizedButton
              key={contact.id}
              onClick={() => handleEmergencyCall(contact)}
              variant="primary"
              size="large"
              className="bg-green-600 hover:bg-green-700 text-white h-20"
            >
              <div className="flex items-center space-x-3">
                <Phone className="w-8 h-8" />
                <div className="text-left">
                  <div className="font-semibold">{contact.name}</div>
                  <div className="text-sm opacity-90">{contact.relationship}</div>
                </div>
              </div>
            </TouchOptimizedButton>
          ))}

          {/* Auto Save */}
          <TouchOptimizedButton
            onClick={() => {
              setAutoSaved(true);
              setTimeout(() => setAutoSaved(false), 3000);
            }}
            variant={autoSaved ? "primary" : "secondary"}
            size="large"
            className={`h-20 ${autoSaved ? 'bg-green-600 text-white' : ''}`}
          >
            <div className="flex items-center space-x-3">
              <Save className="w-8 h-8" />
              <div className="text-left">
                <div className="font-semibold">
                  {autoSaved ? 'Saved!' : 'Save Data'}
                </div>
                <div className="text-sm opacity-75">
                  Backup all information
                </div>
              </div>
            </div>
          </TouchOptimizedButton>

          {/* Return Home */}
          <TouchOptimizedButton
            onClick={() => window.location.href = '/'}
            variant="secondary"
            size="large"
            className="h-20"
          >
            <div className="flex items-center space-x-3">
              <Home className="w-8 h-8" />
              <div className="text-left">
                <div className="font-semibold">Go Home</div>
                <div className="text-sm opacity-75">
                  Return to main page
                </div>
              </div>
            </div>
          </TouchOptimizedButton>
        </div>
      </div>

      {/* Voice Control */}
      <div className="voice-control bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Voice Control</h2>
          <TouchOptimizedButton
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            variant={isVoiceEnabled ? "primary" : "secondary"}
            size="normal"
          >
            {isVoiceEnabled ? (
              <>
                <Volume2 className="w-5 h-5 mr-2" />
                On
              </>
            ) : (
              <>
                <VolumeX className="w-5 h-5 mr-2" />
                Off
              </>
            )}
          </TouchOptimizedButton>
        </div>

        {isVoiceEnabled && (
          <div className="space-y-4">
            <VoiceInput
              onTranscript={handleVoiceCommand}
              className="voice-emergency-input"
            />
            
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Voice Commands:</p>
              <ul className="space-y-1">
                <li>• "Call [contact name]" - Call emergency contact</li>
                <li>• "Save data" - Auto-save all information</li>
                <li>• "Help me" - Get assistance</li>
                <li>• "Go home" - Return to main page</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Pain Level Quick Update */}
      <div className="pain-level-update bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Pain Level</h2>
        
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-3xl font-bold text-red-600">{currentPainLevel}/10</span>
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div 
                className={`h-6 rounded-full transition-all duration-300 ${
                  currentPainLevel >= 8 ? 'bg-red-600' :
                  currentPainLevel >= 6 ? 'bg-orange-500' :
                  currentPainLevel >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${(currentPainLevel / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
            <TouchOptimizedButton
              key={level}
              onClick={() => onPainLevelUpdate(level)}
              variant={currentPainLevel === level ? "primary" : "secondary"}
              size="normal"
              className="h-16 text-lg font-bold"
            >
              {level}
            </TouchOptimizedButton>
          ))}
        </div>
      </div>
    </div>
  );
}

// Emergency Protocol Display
interface EmergencyProtocolDisplayProps {
  protocol: EmergencyProtocol;
  onComplete: () => void;
  onSkip: () => void;
}

export function EmergencyProtocolDisplay({ 
  protocol, 
  onComplete, 
  onSkip 
}: EmergencyProtocolDisplayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setCompletedSteps(new Array(protocol.immediateActions.length).fill(false));
  }, [protocol]);

  const handleStepComplete = (stepIndex: number) => {
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[stepIndex] = true;
    setCompletedSteps(newCompletedSteps);

    if (stepIndex === currentStep && stepIndex < protocol.immediateActions.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const allStepsCompleted = completedSteps.every(step => step);

  return (
    <div className="emergency-protocol bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{protocol.name}</h2>
            <p className="text-gray-600">Emergency Protocol</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <TouchOptimizedButton
            onClick={() => setIsPaused(!isPaused)}
            variant="secondary"
            size="normal"
          >
            {isPaused ? (
              <>
                <Play className="w-5 h-5 mr-2" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            )}
          </TouchOptimizedButton>

          <TouchOptimizedButton
            onClick={onSkip}
            variant="secondary"
            size="normal"
          >
            Skip Protocol
          </TouchOptimizedButton>
        </div>
      </div>

      {!isPaused && (
        <>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{completedSteps.filter(s => s).length} of {protocol.immediateActions.length} steps</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(completedSteps.filter(s => s).length / protocol.immediateActions.length) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Protocol Steps */}
          <div className="space-y-4 mb-6">
            {protocol.immediateActions.map((action: string, index: number) => (
              <div 
                key={index}
                className={`protocol-step p-4 rounded-lg border-2 transition-all ${
                  completedSteps[index] 
                    ? 'bg-green-50 border-green-300' 
                    : index === currentStep 
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
                      : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold
                    ${completedSteps[index] ? 'bg-green-500' : index === currentStep ? 'bg-blue-500' : 'bg-gray-400'}
                  `}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-lg font-medium text-gray-800 mb-2">{action}</p>
                    
                    {index === currentStep && !completedSteps[index] && (
                      <TouchOptimizedButton
                        onClick={() => handleStepComplete(index)}
                        variant="primary"
                        size="large"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Mark Complete
                      </TouchOptimizedButton>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Medications */}
          {protocol.medications.length > 0 && (
            <div className="medications bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">Emergency Medications</h3>
              <div className="space-y-3">
                {protocol.medications.map((med: { name: string; dosage: string; instructions: string }, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-yellow-300">
                    <div className="flex items-center space-x-3 mb-2">
                      <Heart className="w-6 h-6 text-red-500" />
                      <div>
                        <p className="font-semibold text-gray-800">{med.name}</p>
                        <p className="text-sm text-gray-600">Dosage: {med.dosage}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{med.instructions}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completion */}
          {allStepsCompleted && (
            <div className="completion bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Protocol Completed</h3>
                <p className="text-green-700">All emergency steps have been completed successfully.</p>
              </div>
              
              <TouchOptimizedButton
                onClick={onComplete}
                variant="primary"
                size="large"
                className="bg-green-600 hover:bg-green-700"
              >
                Mark Protocol Complete
              </TouchOptimizedButton>
            </div>
          )}
        </>
      )}

      {isPaused && (
        <div className="paused-state text-center py-12">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Protocol Paused</h3>
          <p className="text-gray-500 mb-6">Take your time. Resume when you're ready.</p>
          
          <TouchOptimizedButton
            onClick={() => setIsPaused(false)}
            variant="primary"
            size="large"
          >
            <Play className="w-6 h-6 mr-2" />
            Resume Protocol
          </TouchOptimizedButton>
        </div>
      )}
    </div>
  );
}

// Emergency Settings Panel
export function EmergencySettingsPanel() {
  const crisisDetection = useCrisisDetection();
  const { config } = crisisDetection;
  const { preferences, updatePreferences } = useTraumaInformed();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="emergency-settings bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Emergency Settings</h2>
        <TouchOptimizedButton
          onClick={() => setIsExpanded(!isExpanded)}
          variant="secondary"
          size="normal"
        >
          {isExpanded ? (
            <>
              <EyeOff className="w-5 h-5 mr-2" />
              Hide
            </>
          ) : (
            <>
              <Eye className="w-5 h-5 mr-2" />
              Show
            </>
          )}
        </TouchOptimizedButton>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="setting-item">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoActivateEmergencyMode}
                readOnly
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-gray-700">Auto-activate emergency mode</span>
            </label>
          </div>

          <div className="setting-item">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.voiceInput}
                onChange={(e) => updatePreferences({ voiceInput: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-gray-700">Enable voice commands</span>
            </label>
          </div>

          <div className="setting-item">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.showComfortPrompts}
                onChange={(e) => updatePreferences({ showComfortPrompts: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-gray-700">Show comfort prompts</span>
            </label>
          </div>

          <div className="setting-item">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Touch target size</span>
              <select
                value={preferences.touchTargetSize}
                onChange={(e) => updatePreferences({ 
                  touchTargetSize: e.target.value as 'normal' | 'large' | 'extra-large' 
                })}
                className="rounded-md border-gray-300 text-sm"
              >
                <option value="normal">Normal</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra Large</option>
              </select>
            </div>
          </div>

          <TouchOptimizedButton
            onClick={() => {
              // Reset to emergency defaults
              updatePreferences({
                simplifiedMode: true,
                showMemoryAids: true,
                autoSave: true,
                touchTargetSize: 'extra-large',
                confirmationLevel: 'high',
                showComfortPrompts: true,
                voiceInput: true
              });
            }}
            variant="secondary"
            size="large"
            className="w-full"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Reset to Emergency Defaults
          </TouchOptimizedButton>
        </div>
      )}
    </div>
  );
}
