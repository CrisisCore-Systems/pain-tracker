import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Eye,
  Hand,
  Keyboard,
  Gamepad2,
  Accessibility,
  Volume2,
  VolumeX,
  Pause,
  Settings,
  Check,
  AlertCircle,
  HelpCircle,
  Smartphone,
  Monitor,
  Zap,
} from 'lucide-react';
import { TouchOptimizedButton } from './TraumaInformedUX';

// Minimal, local SpeechRecognition-like typings to avoid relying on lib.dom variants
// Use local window access for SpeechRecognition to avoid conflicting global augmentations
// (PhysicalAccommodations.tsx provides a full global declaration). We intentionally
// avoid re-declaring global types here to prevent TS2717 duplicate-property errors.

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEventLike) => void;
}

interface SpeechRecognitionEventLike {
  results: Iterable<{ 0: { transcript: string } }>;
}

// Multi-modal input types
interface InputMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'available' | 'unavailable' | 'testing' | 'active';
  capabilities: string[];
  requirements: string[];
}

interface MultiModalInputProps {
  onInputMethodChange?: (method: InputMethod, enabled: boolean) => void;
  onAccessibilitySettingChange?: (setting: string, value: boolean | number | string) => void;
  className?: string;
}

// Type interfaces for hooks
interface VoiceRecognitionHook {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
}

interface EyeTrackingHook {
  isActive: boolean;
  calibrationStatus: 'uncalibrated' | 'calibrating' | 'calibrated';
  startCalibration: () => void;
  stopEyeTracking: () => void;
}

interface AccessibilitySettings {
  voiceCommands: boolean;
  dwellTime: number;
  gestureThreshold: number;
  switchScanSpeed: number;
  touchTargetSize: string;
  reducedMotion: boolean;
  highContrast: boolean;
  audioFeedback: boolean;
}

// Voice recognition hook
function useVoiceRecognition(): VoiceRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const win = window as unknown as Window;
    const SpeechRecognitionCtor = win.webkitSpeechRecognition || win.SpeechRecognition;

    if (SpeechRecognitionCtor) {
      setIsSupported(true);
      // Cast the platform SpeechRecognition instance to our lightweight interface
      // so we don't require exact runtime types. Use a defensive null-check
      // before accessing instance properties to satisfy strict null checks.
      recognitionRef.current = new SpeechRecognitionCtor() as unknown as SpeechRecognitionLike;

      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: SpeechRecognitionEventLike) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(r => r.transcript)
            .join('');
          setTranscript(transcript);
        };
      }
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, transcript, isSupported, startListening, stopListening };
}

// Eye tracking simulation hook
function useEyeTracking() {
  const [isActive, setIsActive] = useState(false);
  const [calibrationStatus, setCalibrationStatus] = useState<
    'uncalibrated' | 'calibrating' | 'calibrated'
  >('uncalibrated');

  const startCalibration = () => {
    setCalibrationStatus('calibrating');
    // Simulate calibration process
    setTimeout(() => {
      setCalibrationStatus('calibrated');
      setIsActive(true);
    }, 3000);
  };

  const stopEyeTracking = () => {
    setIsActive(false);
    setCalibrationStatus('uncalibrated');
  };

  return {
    isActive,
    calibrationStatus,
    startCalibration,
    stopEyeTracking,
  };
}

// Input method definitions
const inputMethods: InputMethod[] = [
  {
    id: 'voice-recognition',
    name: 'Voice Recognition',
    description:
      'Speak your pain levels and symptoms naturally. Say "My pain is 7" or "I feel stiff in my neck"',
    icon: Mic,
    status: 'available',
    capabilities: [
      'Pain level entry by voice',
      'Symptom description',
      'Medication logging',
      'Quick notes dictation',
      'Navigation commands',
    ],
    requirements: ['Microphone access', 'Quiet environment preferred'],
  },
  {
    id: 'eye-tracking',
    name: 'Eye Tracking',
    description: 'Control the interface with eye movements - look and dwell to select options',
    icon: Eye,
    status: 'testing',
    capabilities: [
      'Gaze-based navigation',
      'Dwell-click selection',
      'Eye gesture commands',
      'Hands-free operation',
      'Fatigue-reducing interaction',
    ],
    requirements: ['Webcam access', 'Good lighting', 'Head stability'],
  },
  {
    id: 'gesture-control',
    name: 'Gesture Control',
    description: 'Use hand gestures and movements to interact when touch is difficult',
    icon: Hand,
    status: 'testing',
    capabilities: [
      'Air gesture recognition',
      'Hand wave navigation',
      'Finger pointing selection',
      'Gesture-based pain rating',
      'Motion-based input',
    ],
    requirements: ['Camera access', 'Adequate lighting', 'Visible hand movements'],
  },
  {
    id: 'switch-access',
    name: 'Switch Access',
    description: 'Use external switches, buttons, or sip-and-puff devices for control',
    icon: Gamepad2,
    status: 'available',
    capabilities: [
      'Single-switch scanning',
      'Multi-switch direct access',
      'Sip-and-puff control',
      'Foot switch operation',
      'Head switch activation',
    ],
    requirements: ['Compatible switch device', 'USB or Bluetooth connection'],
  },
  {
    id: 'keyboard-navigation',
    name: 'Enhanced Keyboard',
    description: 'Full keyboard navigation with customizable shortcuts and sticky keys',
    icon: Keyboard,
    status: 'available',
    capabilities: [
      'Tab navigation',
      'Custom keyboard shortcuts',
      'Sticky keys support',
      'One-handed typing',
      'Voice-to-text combination',
    ],
    requirements: ['Physical or virtual keyboard'],
  },
  {
    id: 'large-touch-targets',
    name: 'Large Touch Targets',
    description: 'Enlarged buttons and touch areas for limited dexterity or tremor',
    icon: Smartphone,
    status: 'available',
    capabilities: [
      'Oversized buttons',
      'Reduced precision requirements',
      'Tremor compensation',
      'Accidental touch prevention',
      'Swipe gesture alternatives',
    ],
    requirements: ['Touch screen device'],
  },
];

export function MultiModalInputSupport({
  onInputMethodChange,
  onAccessibilitySettingChange,
  className = '',
}: MultiModalInputProps) {
  const [activeInputMethods, setActiveInputMethods] = useState<string[]>([]);
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    voiceCommands: false,
    dwellTime: 1000,
    gestureThreshold: 0.7,
    switchScanSpeed: 1500,
    touchTargetSize: 'normal',
    reducedMotion: false,
    highContrast: false,
    audioFeedback: true,
  });

  const voiceRecognition = useVoiceRecognition();
  const eyeTracking = useEyeTracking();

  const handleInputMethodToggle = (method: InputMethod) => {
    const isActive = activeInputMethods.includes(method.id);
    const updatedMethods = isActive
      ? activeInputMethods.filter(id => id !== method.id)
      : [...activeInputMethods, method.id];

    setActiveInputMethods(updatedMethods);

    if (onInputMethodChange) {
      onInputMethodChange(method, !isActive);
    }
  };

  const handleAccessibilityChange = (setting: string, value: boolean | number | string) => {
    setAccessibilitySettings(prev => ({ ...prev, [setting]: value }));

    if (onAccessibilitySettingChange) {
      onAccessibilitySettingChange(setting, value);
    }
  };

  return (
    <div
      className={`bg-white border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-start space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Accessibility className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Multi-Modal Input Support
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Choose input methods that work best for your physical needs and abilities. Multiple
            methods can be used together for maximum accessibility and comfort.
          </p>
        </div>
      </div>

      {/* Active Voice Recognition Status */}
      {voiceRecognition.isSupported && activeInputMethods.includes('voice-recognition') && (
        <VoiceRecognitionPanel voiceRecognition={voiceRecognition} />
      )}

      {/* Active Eye Tracking Status */}
      {activeInputMethods.includes('eye-tracking') && (
        <EyeTrackingPanel eyeTracking={eyeTracking} />
      )}

      {/* Input Method Selection */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
          <Monitor className="w-5 h-5" />
          <span>Available Input Methods</span>
        </h3>

        <div className="grid gap-4">
          {inputMethods.map(method => {
            const isActive = activeInputMethods.includes(method.id);

            return (
              <InputMethodCard
                key={method.id}
                method={method}
                isActive={isActive}
                onToggle={() => handleInputMethodToggle(method)}
              />
            );
          })}
        </div>
      </div>

      {/* Accessibility Settings */}
      <AccessibilitySettingsPanel
        settings={accessibilitySettings}
        onSettingChange={handleAccessibilityChange}
      />

      {/* Quick Setup Recommendations */}
      <QuickSetupRecommendations
        activeInputMethods={activeInputMethods}
        onMethodToggle={handleInputMethodToggle}
      />
    </div>
  );
}

// Voice recognition panel
function VoiceRecognitionPanel({ voiceRecognition }: { voiceRecognition: VoiceRecognitionHook }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Mic className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">Voice Recognition Active</h4>
        </div>
        <div className="flex items-center space-x-2">
          <TouchOptimizedButton
            variant={voiceRecognition.isListening ? 'primary' : 'secondary'}
            onClick={
              voiceRecognition.isListening
                ? voiceRecognition.stopListening
                : voiceRecognition.startListening
            }
            className="px-3 py-1"
          >
            {voiceRecognition.isListening ? (
              <>
                <MicOff className="w-4 h-4 mr-1" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-1" />
                Start Listening
              </>
            )}
          </TouchOptimizedButton>
        </div>
      </div>

      {voiceRecognition.isListening && (
        <div className="bg-white p-3 rounded border">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Listening... Try saying:</p>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>• "My pain level is 5"</li>
            <li>• "I have a headache"</li>
            <li>• "Save entry"</li>
            <li>• "Go to calendar"</li>
          </ul>
          {voiceRecognition.transcript && (
            <div className="mt-3 p-2 bg-blue-100 rounded">
              <p className="text-sm font-medium text-blue-900">
                Heard: "{voiceRecognition.transcript}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Eye tracking panel
function EyeTrackingPanel({ eyeTracking }: { eyeTracking: EyeTrackingHook }) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-purple-600" />
          <h4 className="font-semibold text-purple-900">Eye Tracking</h4>
        </div>
        <div className="flex items-center space-x-2">
          {eyeTracking.calibrationStatus === 'uncalibrated' && (
            <TouchOptimizedButton
              variant="primary"
              onClick={eyeTracking.startCalibration}
              className="px-3 py-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              Calibrate
            </TouchOptimizedButton>
          )}
          {eyeTracking.isActive && (
            <TouchOptimizedButton
              variant="secondary"
              onClick={eyeTracking.stopEyeTracking}
              className="px-3 py-1"
            >
              <Pause className="w-4 h-4 mr-1" />
              Stop
            </TouchOptimizedButton>
          )}
        </div>
      </div>

      <div className="text-sm">
        {eyeTracking.calibrationStatus === 'calibrating' && (
          <div className="flex items-center space-x-2 text-purple-700">
            <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
            <span>Calibrating eye tracking... Look at the dots as they appear</span>
          </div>
        )}
        {eyeTracking.calibrationStatus === 'calibrated' && (
          <div className="flex items-center space-x-2 text-green-700">
            <Check className="w-4 h-4" />
            <span>Eye tracking calibrated and ready</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Input method card
function InputMethodCard({
  method,
  isActive,
  onToggle,
}: {
  method: InputMethod;
  isActive: boolean;
  onToggle: () => void;
}) {
  const Icon = method.icon;
  const statusColors = {
    available: 'text-green-600 bg-green-100',
    testing: 'text-yellow-600 bg-yellow-100',
    unavailable: 'text-red-600 bg-red-100',
    active: 'text-blue-600 bg-blue-100',
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 transition-all ${
        isActive ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${isActive ? 'bg-blue-100' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            <Icon
              className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
            />
          </div>
          <div>
            <h4
              className={`font-semibold ${isActive ? 'text-blue-900' : 'text-gray-900 dark:text-gray-100'}`}
            >
              {method.name}
            </h4>
            <span className={`px-2 py-1 text-xs rounded-full ${statusColors[method.status]}`}>
              {method.status}
            </span>
          </div>
        </div>
        <TouchOptimizedButton
          variant={isActive ? 'primary' : 'secondary'}
          onClick={onToggle}
          className="px-4 py-2"
        >
          {isActive ? 'Disable' : 'Enable'}
        </TouchOptimizedButton>
      </div>

      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{method.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Capabilities:</h5>
          <ul className="space-y-1">
            {method.capabilities.map((capability, index) => (
              <li key={index} className="flex items-start space-x-2">
                <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">{capability}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Requirements:</h5>
          <ul className="space-y-1">
            {method.requirements.map((requirement, index) => (
              <li key={index} className="flex items-start space-x-2">
                <AlertCircle className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">{requirement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Accessibility settings panel
function AccessibilitySettingsPanel({
  settings,
  onSettingChange,
}: {
  settings: AccessibilitySettings;
  onSettingChange: (setting: string, value: boolean | number | string) => void;
}) {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Accessibility Settings
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Audio Feedback
            </label>
            <TouchOptimizedButton
              variant={settings.audioFeedback ? 'primary' : 'secondary'}
              onClick={() => onSettingChange('audioFeedback', !settings.audioFeedback)}
              className="px-3 py-1"
            >
              {settings.audioFeedback ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </TouchOptimizedButton>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              High Contrast
            </label>
            <TouchOptimizedButton
              variant={settings.highContrast ? 'primary' : 'secondary'}
              onClick={() => onSettingChange('highContrast', !settings.highContrast)}
              className="px-3 py-1"
            >
              {settings.highContrast ? 'On' : 'Off'}
            </TouchOptimizedButton>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Reduced Motion
            </label>
            <TouchOptimizedButton
              variant={settings.reducedMotion ? 'primary' : 'secondary'}
              onClick={() => onSettingChange('reducedMotion', !settings.reducedMotion)}
              className="px-3 py-1"
            >
              {settings.reducedMotion ? 'On' : 'Off'}
            </TouchOptimizedButton>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Dwell Time (ms): {settings.dwellTime}
            </label>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={settings.dwellTime}
              onChange={e => onSettingChange('dwellTime', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Touch Target Size
            </label>
            <select
              value={settings.touchTargetSize}
              onChange={e => onSettingChange('touchTargetSize', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="small">Small</option>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick setup recommendations
function QuickSetupRecommendations({
  activeInputMethods,
  onMethodToggle,
}: {
  activeInputMethods: string[];
  onMethodToggle: (method: InputMethod) => void;
}) {
  const recommendations = [
    {
      title: 'Limited Hand Mobility',
      description: 'Voice recognition + eye tracking for hands-free control',
      methods: ['voice-recognition', 'eye-tracking'],
      icon: Hand,
    },
    {
      title: 'Fatigue Management',
      description: 'Large touch targets + voice commands for energy conservation',
      methods: ['large-touch-targets', 'voice-recognition'],
      icon: Zap,
    },
    {
      title: 'Tremor Support',
      description: 'Switch access + large targets for precise control',
      methods: ['switch-access', 'large-touch-targets'],
      icon: Gamepad2,
    },
  ];

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex items-center space-x-2 mb-4">
        <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Quick Setup Recommendations
        </h3>
      </div>

      <div className="grid gap-3">
        {recommendations.map((rec, index) => {
          const Icon = rec.icon;
          const isActive = rec.methods.every(methodId => activeInputMethods.includes(methodId));

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{rec.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{rec.description}</p>
                </div>
              </div>
              <TouchOptimizedButton
                variant={isActive ? 'primary' : 'secondary'}
                onClick={() => {
                  rec.methods.forEach(methodId => {
                    const method = inputMethods.find(m => m.id === methodId);
                    if (method) onMethodToggle(method);
                  });
                }}
                className="px-3 py-1"
              >
                {isActive ? 'Active' : 'Enable'}
              </TouchOptimizedButton>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MultiModalInputSupport;
