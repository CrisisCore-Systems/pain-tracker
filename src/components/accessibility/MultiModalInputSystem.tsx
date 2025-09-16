/**
 * Multi-Modal Input System for Crisis Situations
 * Combines voice commands, gesture recognition, and touch adaptations
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCrisisDetection } from './useCrisisDetection';
import { useTraumaInformed } from './TraumaInformedHooks';
import { TouchOptimizedButton } from './TraumaInformedUX';
import { VoiceInput } from './PhysicalAccommodations';
import {
  EMERGENCY_VOICE_COMMANDS,
  EMERGENCY_GESTURES,
  MultiModalInputConfig
} from './CrisisStateTypes';
import {
  Mic,
  MicOff,
  Hand,
  Eye,
  EyeOff,
  Zap,
  Settings,
  Shield,
  RefreshCw,
  Power
} from 'lucide-react';

// Multi-Modal Input Manager
interface MultiModalInputManagerProps {
  onCommand: (command: string, parameters?: Record<string, unknown>) => void;
  onEmergencyAction: (action: string) => void;
  isEmergencyMode?: boolean;
  sensitivity?: 'low' | 'medium' | 'high';
}

export function MultiModalInputManager({
  onCommand,
  onEmergencyAction,
  isEmergencyMode = false,
  sensitivity = 'medium'
}: MultiModalInputManagerProps) {
  const { preferences } = useTraumaInformed();
  const { crisisLevel } = useCrisisDetection();
  const isInCrisis = crisisLevel !== 'none';
  const crisisSeverity = crisisLevel === 'none' ? 'mild' : crisisLevel === 'emergency' ? 'critical' : crisisLevel;
  
  const [isListening, setIsListening] = useState(false);
  const [gestureEnabled, setGestureEnabled] = useState(true);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);

  const config: MultiModalInputConfig = {
    voice: {
      enabled: preferences.voiceInput || isEmergencyMode,
      sensitivity,
      language: 'en-US',
      commands: EMERGENCY_VOICE_COMMANDS,
      continualListening: isEmergencyMode,
      emergencyPhrases: ["help me", "emergency", "call doctor"]
    },
    gesture: {
      enabled: gestureEnabled,
      sensitivity,
      swipeToNavigate: true,
      pinchToZoom: true,
      tapPatterns: true
    },
    touch: {
      targetSizeMultiplier: preferences.touchTargetSize === 'extra-large' ? 2.0 : 
                            preferences.touchTargetSize === 'large' ? 1.5 : 1.0,
      pressureThreshold: 0.3,
      dwellTime: isInCrisis ? 100 : 150,
      hapticFeedback: true,
      errorCorrection: true
    }
  };

  // Voice Command Processing
  const processVoiceCommand = useCallback((transcript: string) => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    // Find matching command
    const matchingCommand = config.voice.commands.find(cmd => 
      cmd.phrase.toLowerCase() === normalizedTranscript ||
      cmd.aliases.some(alias => alias.toLowerCase() === normalizedTranscript)
    );

    if (matchingCommand) {
      setLastCommand(matchingCommand.phrase);
      setCommandHistory(prev => [...prev, matchingCommand.phrase].slice(-10)); // Keep last 10

      if (matchingCommand.emergencyCommand) {
        onEmergencyAction(matchingCommand.action);
      } else {
        onCommand(matchingCommand.action, matchingCommand.parameters);
      }

      // Provide feedback
      if ('speechSynthesis' in window && preferences.voiceInput) {
        const feedback = new SpeechSynthesisUtterance(
          matchingCommand.emergencyCommand 
            ? `Emergency action: ${matchingCommand.phrase}` 
            : `Command executed: ${matchingCommand.phrase}`
        );
        feedback.volume = 0.6;
        feedback.rate = 1.1;
        window.speechSynthesis.speak(feedback);
      }
    } else {
      // Handle partial matches or suggestions
      const partialMatches = config.voice.commands.filter(cmd =>
        cmd.phrase.toLowerCase().includes(normalizedTranscript) ||
        cmd.aliases.some(alias => alias.toLowerCase().includes(normalizedTranscript))
      );

      if (partialMatches.length > 0) {
        console.log('Partial matches found:', partialMatches.map(cmd => cmd.phrase));
      }
    }
  }, [config.voice.commands, onCommand, onEmergencyAction, preferences.voiceInput]);

  return (
    <div className={`
      multi-modal-input-manager
      ${isEmergencyMode ? 'emergency-mode' : ''}
      ${isInCrisis ? `crisis-${crisisSeverity}` : ''}
    `}>
      {/* Voice Input Section */}
      <VoiceInputSection
        config={config.voice}
        isListening={isListening}
        onListeningChange={setIsListening}
        onTranscript={processVoiceCommand}
        lastCommand={lastCommand}
        isEmergencyMode={isEmergencyMode}
      />

      {/* Gesture Recognition Section */}
      <GestureRecognitionSection
        config={config.gesture}
        onGesture={(gesture) => {
          const emergencyGesture = EMERGENCY_GESTURES.find(g => g.pattern === gesture);
          if (emergencyGesture) {
            onEmergencyAction(emergencyGesture.action);
          } else {
            onCommand('gesture_' + gesture);
          }
        }}
        isEnabled={gestureEnabled}
        onEnabledChange={setGestureEnabled}
        isEmergencyMode={isEmergencyMode}
      />

      {/* Touch Adaptation Section */}
      <TouchAdaptationSection
        config={config.touch}
        isEmergencyMode={isEmergencyMode}
        crisisSeverity={crisisSeverity}
      />

      {/* Command History */}
      {commandHistory.length > 0 && (
        <CommandHistorySection
          commands={commandHistory}
          onRepeat={(command) => {
            const cmd = config.voice.commands.find(c => c.phrase === command);
            if (cmd) {
              onCommand(cmd.action, cmd.parameters);
            }
          }}
        />
      )}
    </div>
  );
}

// Voice Input Section
interface VoiceInputSectionProps {
  config: MultiModalInputConfig['voice'];
  isListening: boolean;
  onListeningChange: (listening: boolean) => void;
  onTranscript: (text: string) => void;
  lastCommand: string | null;
  isEmergencyMode: boolean;
}

function VoiceInputSection({
  config,
  isListening,
  onListeningChange,
  onTranscript,
  lastCommand,
  isEmergencyMode
}: VoiceInputSectionProps) {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }, []);

  if (!config.enabled || !isSupported) return null;

  return (
    <div className={`voice-input-section bg-white rounded-xl shadow-sm p-4 mb-4 ${
      isEmergencyMode ? 'border-l-4 border-red-500' : ''
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Mic className={`w-6 h-6 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
          <div>
            <h3 className="font-medium text-gray-800">Voice Commands</h3>
            <p className="text-sm text-gray-600">
              {isListening ? 'Listening...' : 'Click to activate voice control'}
            </p>
          </div>
        </div>

        <TouchOptimizedButton
          onClick={() => onListeningChange(!isListening)}
          variant={isListening ? "primary" : "secondary"}
          size="normal"
          className={isListening ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 mr-2" />
              Start
            </>
          )}
        </TouchOptimizedButton>
      </div>

      <VoiceInput
        onTranscript={onTranscript}
        className="voice-crisis-input"
      />

      {lastCommand && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
          <span className="text-green-700">Last command: "{lastCommand}"</span>
        </div>
      )}

      {/* Emergency Voice Commands */}
      {isEmergencyMode && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Emergency Commands:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {config.emergencyPhrases.map((phrase, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded p-2">
                <span className="text-red-700 font-medium">"{phrase}"</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Gesture Recognition Section
interface GestureRecognitionSectionProps {
  config: MultiModalInputConfig['gesture'];
  onGesture: (gesture: string) => void;
  isEnabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  isEmergencyMode: boolean;
}

function GestureRecognitionSection({
  config,
  onGesture,
  isEnabled,
  onEnabledChange,
  isEmergencyMode
}: GestureRecognitionSectionProps) {
  const [detectedGesture, setDetectedGesture] = useState<string | null>(null);
  const [shakeCount, setShakeCount] = useState(0);
  const gestureTimeoutRef = useRef<NodeJS.Timeout>();

  // Shake detection
  useEffect(() => {
    if (!isEnabled || !config.enabled) return;

    let lastX = 0, lastY = 0, lastZ = 0;
    let shakeThreshold = config.sensitivity === 'high' ? 15 : 
                       config.sensitivity === 'medium' ? 20 : 25;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration || 
          acceleration.x === null || 
          acceleration.y === null || 
          acceleration.z === null) return;

      const { x, y, z } = acceleration;
      
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      if (deltaX > shakeThreshold || deltaY > shakeThreshold || deltaZ > shakeThreshold) {
        setShakeCount(prev => prev + 1);
        
        if (gestureTimeoutRef.current) {
          clearTimeout(gestureTimeoutRef.current);
        }
        
        gestureTimeoutRef.current = setTimeout(() => {
          if (shakeCount >= 3) {
            setDetectedGesture('shake_device');
            onGesture('shake_device');
          }
          setShakeCount(0);
        }, 1000);
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    };

    window.addEventListener('devicemotion', handleDeviceMotion);
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current);
      }
    };
  }, [isEnabled, config.enabled, config.sensitivity, shakeCount, onGesture]);

  // Touch gesture detection
  const handleTouchGesture = useCallback((gesture: string) => {
    setDetectedGesture(gesture);
    onGesture(gesture);
    
    setTimeout(() => setDetectedGesture(null), 2000);
  }, [onGesture]);

  if (!config.enabled) return null;

  return (
    <div className={`gesture-recognition-section bg-white rounded-xl shadow-sm p-4 mb-4 ${
      isEmergencyMode ? 'border-l-4 border-orange-500' : ''
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Hand className="w-6 h-6 text-orange-500" />
          <div>
            <h3 className="font-medium text-gray-800">Gesture Recognition</h3>
            <p className="text-sm text-gray-600">
              {isEnabled ? 'Gesture detection active' : 'Gesture detection disabled'}
            </p>
          </div>
        </div>

        <TouchOptimizedButton
          onClick={() => onEnabledChange(!isEnabled)}
          variant={isEnabled ? "primary" : "secondary"}
          size="normal"
        >
          {isEnabled ? (
            <>
              <Eye className="w-5 h-5 mr-2" />
              Enabled
            </>
          ) : (
            <>
              <EyeOff className="w-5 h-5 mr-2" />
              Disabled
            </>
          )}
        </TouchOptimizedButton>
      </div>

      {isEnabled && (
        <>
          {/* Gesture Detection Area */}
          <GestureDetectionArea
            onGesture={handleTouchGesture}
            sensitivity={config.sensitivity}
          />

          {detectedGesture && (
            <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
              <span className="text-orange-700">Detected gesture: {detectedGesture}</span>
            </div>
          )}

          {/* Emergency Gestures */}
          {isEmergencyMode && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Emergency Gestures:</h4>
              <div className="space-y-2">
                {EMERGENCY_GESTURES.filter(g => g.enabled).map((gesture, index) => (
                  <div key={index} className="bg-orange-50 border border-orange-200 rounded p-2 text-xs">
                    <div className="font-medium text-orange-800">{gesture.pattern}</div>
                    <div className="text-orange-600">{gesture.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Gesture Detection Area
function GestureDetectionArea({ onGesture, sensitivity }: { onGesture: (gesture: string) => void; sensitivity: string }) {
  const [touchCount, setTouchCount] = useState(0);
  const [lastTouchTime, setLastTouchTime] = useState(0);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout>();

  const sensitivityThresholds = {
    low: { swipeDistance: 100, tapSpeed: 500 },
    medium: { swipeDistance: 75, tapSpeed: 400 },
    high: { swipeDistance: 50, tapSpeed: 300 }
  };

  const threshold = sensitivityThresholds[sensitivity as keyof typeof sensitivityThresholds] || sensitivityThresholds.medium;

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    
    const now = Date.now();
    if (now - lastTouchTime < threshold.tapSpeed) {
      setTouchCount(prev => prev + 1);
    } else {
      setTouchCount(1);
    }
    setLastTouchTime(now);

    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }

    touchTimeoutRef.current = setTimeout(() => {
      if (touchCount >= 3) {
        onGesture('triple_tap');
      }
      setTouchCount(0);
    }, threshold.tapSpeed);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touchStartPos) return;

    const deltaX = touch.clientX - touchStartPos.x;
    const deltaY = touch.clientY - touchStartPos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > threshold.swipeDistance) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          onGesture('swipe_right');
        } else {
          onGesture('swipe_left');
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          onGesture('swipe_down');
        } else {
          onGesture('swipe_up');
        }
      }
    }

    setTouchStartPos(null);
  };

  const handleLongPress = () => {
    onGesture('long_press_corner');
  };

  return (
    <div
      className="gesture-detection-area bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => {
        e.preventDefault();
        handleLongPress();
      }}
    >
      <Hand className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 text-sm">
        Touch area for gesture detection
      </p>
      <p className="text-gray-500 text-xs mt-2">
        Try swiping, tapping, or long-pressing
      </p>
    </div>
  );
}

// Touch Adaptation Section
interface TouchAdaptationSectionProps {
  config: MultiModalInputConfig['touch'];
  isEmergencyMode: boolean;
  crisisSeverity: 'mild' | 'moderate' | 'severe' | 'critical';
}

function TouchAdaptationSection({ config, isEmergencyMode, crisisSeverity }: TouchAdaptationSectionProps) {
  const [hapticSupported, setHapticSupported] = useState(false);

  useEffect(() => {
    setHapticSupported('vibrate' in navigator);
  }, []);

  // Apply touch adaptations to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--touch-target-multiplier', config.targetSizeMultiplier.toString());
    root.style.setProperty('--touch-dwell-time', `${config.dwellTime}ms`);
  }, [config]);

  const severityStyles = {
    mild: 'border-yellow-300 bg-yellow-50',
    moderate: 'border-orange-300 bg-orange-50',
    severe: 'border-red-300 bg-red-50',
    critical: 'border-red-500 bg-red-100'
  };

  return (
    <div className={`touch-adaptation-section bg-white rounded-xl shadow-sm p-4 mb-4 ${
      isEmergencyMode ? `border-l-4 ${severityStyles[crisisSeverity]}` : ''
    }`}>
      <div className="flex items-center space-x-3 mb-3">
        <Zap className="w-6 h-6 text-blue-500" />
        <div>
          <h3 className="font-medium text-gray-800">Touch Adaptations</h3>
          <p className="text-sm text-gray-600">
            Enhanced touch interactions for crisis situations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="adaptation-item">
          <div className="font-medium text-gray-700">Target Size</div>
          <div className="text-gray-600">{Math.round(config.targetSizeMultiplier * 100)}% larger</div>
        </div>

        <div className="adaptation-item">
          <div className="font-medium text-gray-700">Dwell Time</div>
          <div className="text-gray-600">{config.dwellTime}ms</div>
        </div>

        <div className="adaptation-item">
          <div className="font-medium text-gray-700">Haptic Feedback</div>
          <div className="text-gray-600">
            {hapticSupported && config.hapticFeedback ? 'Enabled' : 'Not available'}
          </div>
        </div>

        <div className="adaptation-item">
          <div className="font-medium text-gray-700">Error Correction</div>
          <div className="text-gray-600">{config.errorCorrection ? 'Enabled' : 'Disabled'}</div>
        </div>
      </div>

      {isEmergencyMode && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Emergency Mode Active</span>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Touch targets are automatically enlarged and sensitivity is increased for easier interaction during crisis situations.
          </p>
        </div>
      )}
    </div>
  );
}

// Command History Section
interface CommandHistorySectionProps {
  commands: string[];
  onRepeat: (command: string) => void;
}

function CommandHistorySection({ commands, onRepeat }: CommandHistorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="command-history-section bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-800">Recent Commands</h3>
        </div>

        <TouchOptimizedButton
          onClick={() => setIsExpanded(!isExpanded)}
          variant="secondary"
          size="normal"
        >
          {isExpanded ? 'Hide' : 'Show'} ({commands.length})
        </TouchOptimizedButton>
      </div>

      {isExpanded && (
        <div className="space-y-2">
          {commands.slice(-5).reverse().map((command, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-2">
              <span className="text-sm text-gray-700">"{command}"</span>
              <TouchOptimizedButton
                onClick={() => onRepeat(command)}
                variant="secondary"
                size="normal"
                className="text-xs"
              >
                Repeat
              </TouchOptimizedButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Multi-Modal Settings Panel
export function MultiModalSettingsPanel() {
  const { preferences, updatePreferences } = useTraumaInformed();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="multimodal-settings bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-gray-500" />
          <h3 className="font-medium text-gray-800">Multi-Modal Input Settings</h3>
        </div>

        <TouchOptimizedButton
          onClick={() => setIsExpanded(!isExpanded)}
          variant="secondary"
          size="normal"
        >
          {isExpanded ? 'Hide' : 'Show'} Settings
        </TouchOptimizedButton>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="setting-group">
            <h4 className="font-medium text-gray-700 mb-2">Voice Control</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.voiceInput}
                  onChange={(e) => updatePreferences({ voiceInput: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Enable voice commands</span>
              </label>
            </div>
          </div>

          <div className="setting-group">
            <h4 className="font-medium text-gray-700 mb-2">Touch Adaptations</h4>
            <div className="space-y-2">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Touch Target Size</label>
                <select
                  value={preferences.touchTargetSize}
                  onChange={(e) => updatePreferences({ 
                    touchTargetSize: e.target.value as 'normal' | 'large' | 'extra-large' 
                  })}
                  className="w-full rounded border-gray-300"
                >
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                  <option value="extra-large">Extra Large</option>
                </select>
              </div>
            </div>
          </div>

          <TouchOptimizedButton
            onClick={() => {
              updatePreferences({
                voiceInput: true,
                touchTargetSize: 'extra-large',
                confirmationLevel: 'high'
              });
            }}
            variant="primary"
            size="large"
            className="w-full"
          >
            <Power className="w-5 h-5 mr-2" />
            Enable Crisis Mode Defaults
          </TouchOptimizedButton>
        </div>
      )}
    </div>
  );
}
