/**
 * useVoiceCommands Hook
 * 
 * Provides voice command functionality for React components with full integration
 * to the VoiceCommandService for action execution.
 * 
 * Features:
 * - Speech recognition initialization and management
 * - Command processing and execution
 * - Audio feedback
 * - Permission and error handling
 * - Offline status awareness
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  voiceCommandService,
  VoiceCommandAction,
  VoiceCommandResult,
  parsePainLevel,
  parseLocations,
  parseSymptoms,
} from '../services/VoiceCommandService';
import type {
  SpeechRecognition,
  SpeechRecognitionConstructor,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
} from '../types/speech';

// Window type with speech recognition
type SpeechRecognitionWindow = Window & {
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
  SpeechRecognition?: SpeechRecognitionConstructor;
};

// Error messages map
const ERROR_MESSAGES: Record<string, string> = {
  'not-allowed': 'Microphone access was denied. Please enable microphone permissions.',
  'network': 'Speech recognition requires a network connection on this browser.',
  'no-speech': 'No speech detected. Please try again.',
  'audio-capture': 'No microphone was found. Please check your audio settings.',
  'aborted': 'Speech recognition was stopped.',
  'service-not-allowed': 'Speech recognition service is not allowed.',
};

// Hook options
export interface UseVoiceCommandsOptions {
  /** Callback when pain level is recognized */
  onPainLevel?: (level: number) => void;
  /** Callback when locations are recognized */
  onLocations?: (locations: string[]) => void;
  /** Callback when symptoms are recognized */
  onSymptoms?: (symptoms: string[]) => void;
  /** Callback for navigation actions */
  onNavigate?: (direction: 'back' | 'forward') => void;
  /** Callback for save action */
  onSave?: () => void;
  /** Callback for cancel action */
  onCancel?: () => void;
  /** Callback for emergency actions */
  onEmergency?: (action: string) => void;
  /** Callback for any action (generic handler) */
  onAction?: (action: VoiceCommandAction, parameters?: Record<string, unknown>) => void;
  /** Enable continuous listening mode */
  continuous?: boolean;
  /** Enable interim results */
  interimResults?: boolean;
  /** Language for speech recognition */
  language?: string;
  /** Enable voice feedback */
  voiceFeedback?: boolean;
}

// Hook return type
export interface UseVoiceCommandsReturn {
  /** Whether speech recognition is supported in this browser */
  isSupported: boolean;
  /** Whether currently listening for voice input */
  isListening: boolean;
  /** Current transcript from speech recognition */
  transcript: string;
  /** Interim (in-progress) transcript */
  interimTranscript: string;
  /** Last recognized command result */
  lastCommand: VoiceCommandResult | null;
  /** Command history */
  commandHistory: VoiceCommandResult[];
  /** Current error message, if any */
  error: string | null;
  /** Whether device is offline */
  isOffline: boolean;
  /** Start listening for voice input */
  startListening: () => void;
  /** Stop listening for voice input */
  stopListening: () => void;
  /** Toggle listening state */
  toggleListening: () => void;
  /** Clear current transcript */
  clearTranscript: () => void;
  /** Clear error */
  clearError: () => void;
  /** Process transcript manually (for testing or custom input) */
  processTranscript: (text: string) => VoiceCommandResult;
  /** Get help text for available commands */
  getHelpText: () => string;
  /** Get list of available commands */
  getAvailableCommands: () => { phrase: string; description: string; isEmergency: boolean }[];
}

/**
 * Custom hook for voice command functionality
 */
export function useVoiceCommands(options: UseVoiceCommandsOptions = {}): UseVoiceCommandsReturn {
  const {
    onPainLevel,
    onLocations,
    onSymptoms,
    onNavigate,
    onSave,
    onCancel,
    onEmergency,
    onAction,
    continuous = false,
    interimResults = true,
    language = 'en-US',
    voiceFeedback = true,
  } = options;

  // State
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<VoiceCommandResult | null>(null);
  const [commandHistory, setCommandHistory] = useState<VoiceCommandResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastTranscriptRef = useRef('');

  // Set up voice command handler
  useEffect(() => {
    voiceCommandService.setVoiceFeedbackEnabled(voiceFeedback);

    voiceCommandService.setHandler((action, parameters) => {
      // Call generic handler if provided
      onAction?.(action, parameters);

      // Call specific handlers based on action
      switch (action) {
        case 'set_pain_level':
          if (parameters?.level !== undefined) {
            onPainLevel?.(parameters.level as number);
          }
          break;

        case 'add_location':
          if (parameters?.locations) {
            onLocations?.(parameters.locations as string[]);
          }
          break;

        case 'add_symptom':
          if (parameters?.symptoms) {
            onSymptoms?.(parameters.symptoms as string[]);
          }
          break;

        case 'navigate_back':
          onNavigate?.('back');
          break;

        case 'navigate_forward':
          onNavigate?.('forward');
          break;

        case 'save_entry':
          onSave?.();
          break;

        case 'cancel_entry':
          onCancel?.();
          break;

        case 'activate_emergency_mode':
        case 'call_primary_contact':
        case 'emergency_save':
          onEmergency?.(action);
          break;

        case 'help':
          // Speak help text
          if ('speechSynthesis' in window && voiceFeedback) {
            const helpText = voiceCommandService.getHelpText();
            const utterance = new SpeechSynthesisUtterance(helpText);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
          }
          break;
      }
    });
  }, [onPainLevel, onLocations, onSymptoms, onNavigate, onSave, onCancel, onEmergency, onAction, voiceFeedback]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const speechWindow = window as unknown as SpeechRecognitionWindow;
    const SpeechRecognitionCtor =
      speechWindow.webkitSpeechRecognition || speechWindow.SpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognitionCtor();
    
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      setInterimTranscript(interim);

      if (finalTranscript && finalTranscript !== lastTranscriptRef.current) {
        lastTranscriptRef.current = finalTranscript;
        setTranscript(finalTranscript);

        // Process the final transcript through voice command service
        const result = voiceCommandService.processTranscript(finalTranscript);
        setLastCommand(result);
        
        if (result.success) {
          setCommandHistory(prev => [...prev, result].slice(-10));
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      const errorMessage = ERROR_MESSAGES[event.error] || 
        `Speech recognition error: ${event.error}`;
      setError(errorMessage);
      console.warn('Voice recognition error:', event.error, event.message);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [continuous, interimResults, language]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    lastTranscriptRef.current = '';

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setError('Failed to start voice input. Please check microphone permissions.');
      setIsListening(false);
    }
  }, [isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.warn('Failed to stop speech recognition:', err);
    }
    setIsListening(false);
  }, [isListening]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    lastTranscriptRef.current = '';
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Process transcript manually
  const processTranscript = useCallback((text: string): VoiceCommandResult => {
    const result = voiceCommandService.processTranscript(text);
    setLastCommand(result);
    if (result.success) {
      setCommandHistory(prev => [...prev, result].slice(-10));
    }
    return result;
  }, []);

  // Get help text
  const getHelpText = useCallback(() => {
    return voiceCommandService.getHelpText();
  }, []);

  // Get available commands
  const getAvailableCommands = useCallback(() => {
    return voiceCommandService.getAvailableCommands();
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    lastCommand,
    commandHistory,
    error,
    isOffline,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    clearError,
    processTranscript,
    getHelpText,
    getAvailableCommands,
  };
}

// Re-export utilities for convenience
export { parsePainLevel, parseLocations, parseSymptoms };

export default useVoiceCommands;
