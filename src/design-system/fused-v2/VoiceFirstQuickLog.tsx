/**
 * VoiceFirstQuickLog Component
 * 
 * A voice-optimized quick log flow designed for "can barely use hands" scenarios.
 * Features:
 * - Single primary toggle for "Voice Mode"
 * - Clear visual states: Idle → Listening → Interpreting → Confirming → Saved
 * - Spoken + visual confirmations for each captured field
 * - Minimal review strip showing pain, locations, symptoms, notes
 * - Voice commands: next/back/save/cancel/help
 * - Safe Emergency behavior (info panel, no actual calls)
 * - Offline awareness banner
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  HelpCircle,
  AlertTriangle,
  WifiOff,
  Check,
  X,
  ChevronLeft,
  Phone,
  Save,
} from 'lucide-react';
import { cn } from '../utils';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import type { VoiceCommandResult as _VoiceCommandResult } from '../../services/VoiceCommandService';
import '../tokens/fused-v2.css';

// Voice states for the flow
export type VoiceState =
  | 'idle'
  | 'listening'
  | 'interpreting'
  | 'confirming'
  | 'saved'
  | 'error';

// Component props
export interface VoiceFirstQuickLogProps {
  onComplete: (data: {
    pain: number;
    locations: string[];
    symptoms: string[];
    notes: string;
  }) => void;
  onCancel: () => void;
  /** Initial pain level (default: 5) */
  initialPain?: number;
  /** Auto-start listening when component mounts */
  autoStart?: boolean;
}

// Pain level labels
const PAIN_LABELS = [
  'No pain',
  'Very mild',
  'Mild',
  'Uncomfortable',
  'Moderate',
  'Distracting',
  'Distressing',
  'Intense',
  'Very intense',
  'Severe',
  'Unbearable',
];

// Location tags available
const LOCATION_TAGS = [
  'Lower back',
  'Upper back',
  'Neck',
  'Shoulder (L)',
  'Shoulder (R)',
  'Hip (L)',
  'Hip (R)',
  'Knee (L)',
  'Knee (R)',
  'Head',
  'Abdomen',
];

// Symptom tags available
const SYMPTOM_TAGS = [
  'Aching',
  'Sharp',
  'Burning',
  'Throbbing',
  'Stabbing',
  'Tingling',
  'Numbness',
  'Stiffness',
  'Weakness',
];

/**
 * VoiceFirstQuickLog - Voice-optimized quick pain logging
 */
export function VoiceFirstQuickLog({
  onComplete,
  onCancel,
  initialPain = 5,
  autoStart = false,
}: VoiceFirstQuickLogProps) {
  // Captured data
  const [pain, setPain] = useState(initialPain);
  const [locations, setLocations] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Voice state
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceFeedbackEnabled, setVoiceFeedbackEnabled] = useState(true);

  // UI state
  const [showHelp, setShowHelp] = useState(false);
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    action: string;
    data: Record<string, unknown>;
  } | null>(null);

  // Refs
  const confirmTimeoutRef = useRef<number | null>(null);
  const savedTimeoutRef = useRef<number | null>(null);

  // Use the voice commands hook with handlers
  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    lastCommand: _lastCommand,
    error: voiceError,
    isOffline,
    startListening,
    stopListening,
    clearTranscript: _clearTranscript,
    clearError,
    getAvailableCommands: _getAvailableCommands,
    getHelpText: _getHelpText,
  } = useVoiceCommands({
    onPainLevel: (level) => {
      setPain(level);
      setPendingConfirmation({
        action: 'set_pain',
        data: { level },
      });
      setVoiceState('confirming');
    },
    onLocations: (newLocations) => {
      setLocations((prev) => {
        const combined = [...new Set([...prev, ...newLocations])];
        return combined;
      });
      setPendingConfirmation({
        action: 'add_locations',
        data: { locations: newLocations },
      });
      setVoiceState('confirming');
    },
    onSymptoms: (newSymptoms) => {
      setSymptoms((prev) => {
        const combined = [...new Set([...prev, ...newSymptoms])];
        return combined;
      });
      setPendingConfirmation({
        action: 'add_symptoms',
        data: { symptoms: newSymptoms },
      });
      setVoiceState('confirming');
    },
    onNavigate: (direction) => {
      if (direction === 'back') {
        // Go back / cancel
        onCancel();
      }
    },
    onSave: () => {
      handleSave();
    },
    onCancel: () => {
      onCancel();
    },
    onEmergency: (_action) => {
      // Safe emergency behavior - show info panel, never place calls
      setShowEmergencyPanel(true);
      // Speak a calming message
      if (voiceFeedbackEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          'Emergency panel opened. This app does not place calls. Please review the resources shown.'
        );
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    },
    onAction: (action, _parameters) => {
      // Handle help action
      if (action === 'help') {
        setShowHelp(true);
      }
      // Handle read_summary action
      if (action === 'read_summary') {
        speakSummary();
      }
    },
    voiceFeedback: voiceFeedbackEnabled,
  });

  // Auto-start listening if configured
  useEffect(() => {
    if (autoStart && isSupported && !isListening) {
      const timer = setTimeout(() => {
        startListening();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoStart, isSupported, isListening, startListening]);

  // Update voice state based on listening state
  useEffect(() => {
    if (isListening) {
      if (interimTranscript || transcript) {
        setVoiceState('interpreting');
      } else {
        setVoiceState('listening');
      }
    } else if (voiceState === 'listening' || voiceState === 'interpreting') {
      // Only reset to idle if we were actively listening
      if (!pendingConfirmation) {
        setVoiceState('idle');
      }
    }
  }, [isListening, transcript, interimTranscript, pendingConfirmation, voiceState]);

  // Auto-clear confirmation after a delay
  useEffect(() => {
    if (pendingConfirmation && voiceState === 'confirming') {
      confirmTimeoutRef.current = window.setTimeout(() => {
        setPendingConfirmation(null);
        setVoiceState(isListening ? 'listening' : 'idle');
      }, 3000);
    }
    return () => {
      if (confirmTimeoutRef.current) {
        clearTimeout(confirmTimeoutRef.current);
      }
    };
  }, [pendingConfirmation, voiceState, isListening]);

  // Handle voice error
  useEffect(() => {
    if (voiceError) {
      setVoiceState('error');
    }
  }, [voiceError]);

  // Speak summary of captured data
  const speakSummary = useCallback(() => {
    if (!voiceFeedbackEnabled || !('speechSynthesis' in window)) return;

    let summary = `Pain level: ${pain}, ${PAIN_LABELS[pain]}.`;
    if (locations.length > 0) {
      summary += ` Locations: ${locations.join(', ')}.`;
    }
    if (symptoms.length > 0) {
      summary += ` Symptoms: ${symptoms.join(', ')}.`;
    }
    if (notes) {
      summary += ` Notes: ${notes}.`;
    }
    if (locations.length === 0) {
      summary += ' No locations selected yet.';
    }

    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, [pain, locations, symptoms, notes, voiceFeedbackEnabled]);

  // Handle save
  const handleSave = useCallback(() => {
    setVoiceState('saved');
    
    if (voiceFeedbackEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Entry saved successfully.');
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }

    savedTimeoutRef.current = window.setTimeout(() => {
      onComplete({ pain, locations, symptoms, notes });
    }, 1500);
  }, [pain, locations, symptoms, notes, onComplete, voiceFeedbackEnabled]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  // Toggle voice mode
  const toggleVoiceMode = useCallback(() => {
    if (isListening) {
      stopListening();
      setVoiceState('idle');
    } else {
      clearError();
      startListening();
    }
  }, [isListening, startListening, stopListening, clearError]);

  // Toggle voice feedback (audio output)
  const toggleVoiceFeedback = useCallback(() => {
    setVoiceFeedbackEnabled((prev) => !prev);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Get state-specific styles and labels
  const getStateInfo = () => {
    switch (voiceState) {
      case 'listening':
        return {
          bgClass: 'bg-primary-500/20',
          borderClass: 'border-primary-500',
          iconClass: 'text-primary-500 animate-pulse',
          label: 'Listening...',
          description: 'Speak your pain level, location, or symptom',
        };
      case 'interpreting':
        return {
          bgClass: 'bg-warn-500/20',
          borderClass: 'border-warn-500',
          iconClass: 'text-warn-500',
          label: 'Processing...',
          description: transcript || interimTranscript,
        };
      case 'confirming':
        return {
          bgClass: 'bg-good-500/20',
          borderClass: 'border-good-500',
          iconClass: 'text-good-500',
          label: 'Confirmed',
          description: getConfirmationMessage(),
        };
      case 'saved':
        return {
          bgClass: 'bg-good-500/30',
          borderClass: 'border-good-500',
          iconClass: 'text-good-400',
          label: 'Saved!',
          description: 'Entry saved successfully',
        };
      case 'error':
        return {
          bgClass: 'bg-danger-500/20',
          borderClass: 'border-danger-500',
          iconClass: 'text-danger-500',
          label: 'Error',
          description: voiceError || 'Something went wrong',
        };
      default:
        return {
          bgClass: 'bg-surface-800',
          borderClass: 'border-surface-600',
          iconClass: 'text-ink-400',
          label: 'Ready',
          description: 'Tap the microphone or say "help" for commands',
        };
    }
  };

  // Get confirmation message based on pending action
  const getConfirmationMessage = () => {
    if (!pendingConfirmation) return '';
    
    switch (pendingConfirmation.action) {
      case 'set_pain':
        return `Pain set to ${pendingConfirmation.data.level}`;
      case 'add_locations':
        return `Location: ${(pendingConfirmation.data.locations as string[]).join(', ')}`;
      case 'add_symptoms':
        return `Symptom: ${(pendingConfirmation.data.symptoms as string[]).join(', ')}`;
      default:
        return 'Action confirmed';
    }
  };

  const stateInfo = getStateInfo();

  // Toggle a tag
  const toggleTag = (tag: string, list: string[], setter: (val: string[]) => void) => {
    if (list.includes(tag)) {
      setter(list.filter((t) => t !== tag));
    } else {
      setter([...list, tag]);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 text-ink-100 flex flex-col">
      {/* Offline Banner */}
      {isOffline && (
        <div
          className="bg-warn-500/20 border-b border-warn-500/50 px-4 py-3 flex items-center gap-3"
          role="alert"
          aria-live="polite"
        >
          <WifiOff className="w-5 h-5 text-warn-400 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="text-small text-warn-200 font-medium">Offline</p>
            <p className="text-tiny text-warn-300">
              Speech recognition may depend on your browser/OS. Some browsers require internet.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-20 bg-surface-900/95 backdrop-blur-sm border-b border-surface-700">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-[var(--radius-md)]',
              'min-w-[48px] min-h-[48px]',
              'text-small text-ink-300 hover:text-ink-100 hover:bg-surface-800',
              'transition-colors duration-[var(--duration-fast)]',
              'focus:outline-none focus:ring-2 focus:ring-primary-500'
            )}
            aria-label="Cancel and go back"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Cancel</span>
          </button>

          <h1 className="text-body-medium text-ink-200 font-medium">
            Voice Quick Log
          </h1>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleVoiceFeedback}
              className={cn(
                'p-3 rounded-[var(--radius-md)]',
                'min-w-[48px] min-h-[48px]',
                'text-ink-400 hover:text-ink-200 hover:bg-surface-800',
                'transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
              aria-label={voiceFeedbackEnabled ? 'Mute voice feedback' : 'Enable voice feedback'}
              aria-pressed={voiceFeedbackEnabled}
            >
              {voiceFeedbackEnabled ? (
                <Volume2 className="w-5 h-5" aria-hidden="true" />
              ) : (
                <VolumeX className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className={cn(
                'p-3 rounded-[var(--radius-md)]',
                'min-w-[48px] min-h-[48px]',
                'text-ink-400 hover:text-ink-200 hover:bg-surface-800',
                'transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
              aria-label="Show help"
              aria-expanded={showHelp}
            >
              <HelpCircle className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Help Panel */}
      {showHelp && (
        <div
          className="bg-surface-800 border-b border-surface-700 px-4 py-4"
          role="region"
          aria-label="Voice command help"
        >
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-body-medium text-ink-100 font-medium">
                Voice Commands
              </h2>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="p-2 text-ink-400 hover:text-ink-200"
                aria-label="Close help"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-small">
              <div className="text-ink-400">
                <span className="text-ink-200">"My pain is [0-10]"</span> - Set pain level
              </div>
              <div className="text-ink-400">
                <span className="text-ink-200">"Lower back"</span> - Add location
              </div>
              <div className="text-ink-400">
                <span className="text-ink-200">"Sharp" / "Aching"</span> - Add symptom
              </div>
              <div className="text-ink-400">
                <span className="text-ink-200">"Save" / "Done"</span> - Save entry
              </div>
              <div className="text-ink-400">
                <span className="text-ink-200">"Go back" / "Cancel"</span> - Exit
              </div>
              <div className="text-ink-400">
                <span className="text-ink-200">"Read summary"</span> - Hear what's captured
              </div>
              <div className="text-ink-400">
                <span className="text-ink-200">"Help"</span> - Show commands
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Panel - Safe behavior, no actual calls */}
      {showEmergencyPanel && (
        <div
          className="bg-danger-500/10 border-b border-danger-500/30 px-4 py-4"
          role="alertdialog"
          aria-label="Emergency information panel"
        >
          <div className="max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="w-6 h-6 text-danger-400 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="flex-1">
                <h2 className="text-body-medium text-danger-200 font-medium mb-2">
                  Emergency Resources
                </h2>
                <p className="text-small text-danger-300 mb-3">
                  <strong>This app does not place calls.</strong> If you need immediate help,
                  please contact emergency services directly.
                </p>
                <div className="space-y-2 text-small">
                  <div className="flex items-center gap-2 text-ink-200">
                    <Phone className="w-4 h-4 text-danger-400" aria-hidden="true" />
                    <span>Emergency: 911 (US/Canada) / 999 (UK) / 112 (EU)</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-200">
                    <Phone className="w-4 h-4 text-warn-400" aria-hidden="true" />
                    <span>Crisis Line: 988 (Suicide & Crisis Lifeline, US)</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmergencyPanel(false)}
                className="p-2 text-danger-400 hover:text-danger-200"
                aria-label="Close emergency panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Voice State Indicator */}
          <div
            className={cn(
              'rounded-[var(--radius-xl)] border-2 p-6 transition-all duration-300',
              stateInfo.bgClass,
              stateInfo.borderClass
            )}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              {isSupported ? (
                <button
                  type="button"
                  onClick={toggleVoiceMode}
                  disabled={voiceState === 'saved'}
                  className={cn(
                    'w-20 h-20 rounded-full flex items-center justify-center',
                    'transition-all duration-300',
                    'focus:outline-none focus:ring-4 focus:ring-primary-500/50',
                    isListening
                      ? 'bg-primary-500 text-ink-900 shadow-lg scale-110'
                      : 'bg-surface-700 text-ink-200 hover:bg-surface-600',
                    voiceState === 'saved' && 'opacity-50 cursor-not-allowed'
                  )}
                  aria-label={isListening ? 'Stop listening' : 'Start listening'}
                  aria-pressed={isListening}
                >
                  {isListening ? (
                    <Mic className="w-10 h-10 animate-pulse" aria-hidden="true" />
                  ) : (
                    <MicOff className="w-10 h-10" aria-hidden="true" />
                  )}
                </button>
              ) : (
                <div className="w-20 h-20 rounded-full bg-surface-700 flex items-center justify-center">
                  <MicOff className="w-10 h-10 text-ink-500" aria-hidden="true" />
                </div>
              )}
            </div>

            <div className="text-center">
              <p className={cn('text-h2 font-medium mb-1', stateInfo.iconClass)}>
                {stateInfo.label}
              </p>
              <p className="text-small text-ink-400 max-w-md mx-auto">
                {isSupported
                  ? stateInfo.description
                  : 'Voice mode not available in this browser. Use the controls below.'}
              </p>
            </div>

            {/* Live transcript display */}
            {(transcript || interimTranscript) && voiceState !== 'confirming' && (
              <div className="mt-4 p-3 bg-surface-900/50 rounded-[var(--radius-md)]">
                <p className="text-small text-ink-300 text-center">
                  {transcript || interimTranscript}
                  {isListening && interimTranscript && (
                    <span className="text-ink-500 animate-pulse">...</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Review Strip - Shows captured data */}
          <section
            className="bg-surface-800 rounded-[var(--radius-xl)] border border-surface-700 p-4"
            aria-label="Captured data summary"
          >
            <h2 className="text-small text-ink-400 mb-3 font-medium uppercase tracking-wide">
              Review
            </h2>

            {/* Pain Level */}
            <div className="flex items-center justify-between py-3 border-b border-surface-700">
              <span className="text-ink-300">Pain</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPain(Math.max(0, pain - 1))}
                  disabled={pain === 0}
                  className={cn(
                    'w-10 h-10 rounded-full bg-surface-700 text-ink-200',
                    'hover:bg-surface-600 disabled:opacity-50 disabled:cursor-not-allowed',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500'
                  )}
                  aria-label="Decrease pain level"
                >
                  −
                </button>
                <div className="text-center min-w-[80px]">
                  <span className="text-h2 text-primary-400 font-bold">{pain}</span>
                  <span className="text-small text-ink-400 block">{PAIN_LABELS[pain]}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPain(Math.min(10, pain + 1))}
                  disabled={pain === 10}
                  className={cn(
                    'w-10 h-10 rounded-full bg-surface-700 text-ink-200',
                    'hover:bg-surface-600 disabled:opacity-50 disabled:cursor-not-allowed',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500'
                  )}
                  aria-label="Increase pain level"
                >
                  +
                </button>
              </div>
            </div>

            {/* Locations */}
            <div className="py-3 border-b border-surface-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-ink-300">Locations</span>
                <span className="text-tiny text-ink-500">
                  {locations.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {LOCATION_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag, locations, setLocations)}
                    className={cn(
                      'px-3 py-2 rounded-full text-small',
                      'min-h-[44px] min-w-[44px]',
                      'transition-all duration-150',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500',
                      locations.includes(tag)
                        ? 'bg-primary-500 text-ink-900 font-medium'
                        : 'bg-surface-700 text-ink-300 hover:bg-surface-600'
                    )}
                    role="checkbox"
                    aria-checked={locations.includes(tag)}
                  >
                    {locations.includes(tag) && (
                      <Check className="w-3 h-3 inline mr-1" aria-hidden="true" />
                    )}
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="py-3 border-b border-surface-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-ink-300">Symptoms</span>
                <span className="text-tiny text-ink-500">
                  {symptoms.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag, symptoms, setSymptoms)}
                    className={cn(
                      'px-3 py-2 rounded-full text-small',
                      'min-h-[44px] min-w-[44px]',
                      'transition-all duration-150',
                      'focus:outline-none focus:ring-2 focus:ring-warn-500',
                      symptoms.includes(tag)
                        ? 'bg-warn-500 text-ink-900 font-medium'
                        : 'bg-surface-700 text-ink-300 hover:bg-surface-600'
                    )}
                    role="checkbox"
                    aria-checked={symptoms.includes(tag)}
                  >
                    {symptoms.includes(tag) && (
                      <Check className="w-3 h-3 inline mr-1" aria-hidden="true" />
                    )}
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="py-3">
              <label
                htmlFor="voice-notes"
                className="text-ink-300 block mb-2"
              >
                Notes
              </label>
              <textarea
                id="voice-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional: Add any additional notes..."
                maxLength={500}
                className={cn(
                  'w-full h-24 p-3 rounded-[var(--radius-md)]',
                  'bg-surface-900 border border-surface-600',
                  'text-body text-ink-100 placeholder:text-ink-500',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'resize-none'
                )}
              />
              <div className="flex justify-end mt-1">
                <span className="text-tiny text-ink-500">
                  {500 - notes.length} remaining
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer - Sticky action buttons */}
      <footer className="sticky bottom-0 left-0 right-0 p-4 bg-surface-900/95 backdrop-blur-sm border-t border-surface-700 z-10">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'px-6 py-4 rounded-[var(--radius-xl)]',
              'min-h-[56px] min-w-[56px]',
              'bg-surface-800 hover:bg-surface-700',
              'text-body-medium text-ink-200 font-medium',
              'transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary-500'
            )}
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={voiceState === 'saved'}
            className={cn(
              'flex-1 px-6 py-4 rounded-[var(--radius-xl)]',
              'min-h-[56px]',
              'bg-primary-500 hover:bg-primary-400',
              'text-body-medium text-ink-900 font-semibold',
              'transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              'flex items-center justify-center gap-2',
              voiceState === 'saved' && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Save entry"
          >
            <Save className="w-5 h-5" aria-hidden="true" />
            Save Entry
          </button>
        </div>
      </footer>
    </div>
  );
}

export default VoiceFirstQuickLog;
