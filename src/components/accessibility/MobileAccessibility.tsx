/**
 * Mobile Accessibility Enhancements
 * Voice input, haptic feedback, and mobile-specific accessibility features
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { Button } from '../../design-system';
import { ScreenReaderAnnouncement } from './ScreenReaderUtils';
import type {
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
} from '../../types/speech';

interface VoiceInputProps {
  onResult: (text: string) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  disabled?: boolean;
  language?: string;
  continuous?: boolean;
}

export function VoiceInput({
  onResult,
  onError,
  placeholder = 'Tap to speak...',
  disabled = false,
  language = 'en-US',
  continuous = false,
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = React.useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = event => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          onResult(finalTranscript);
          setTranscript('');
        }
      };

      recognition.onerror = event => {
        setIsListening(false);
        onError?.(`Speech recognition error: ${event.error}`);
        // Haptic feedback for error
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setTranscript('');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [continuous, language, onResult, onError]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        setIsListening(true);
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        recognitionRef.current.start();
      } catch (error) {
        setIsListening(false);
        onError?.('Failed to start speech recognition');
      }
    }
  }, [isListening, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  if (!isSupported) {
    return null; // Don't render if not supported
  }

  return (
    <div className="relative">
      <Button
        onClick={isListening ? stopListening : startListening}
        disabled={disabled}
        variant={isListening ? 'destructive' : 'outline'}
        size="lg"
        className="min-h-[48px] min-w-[48px]"
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        aria-pressed={isListening}
      >
        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        <span className="sr-only">{isListening ? 'Stop listening' : 'Start voice input'}</span>
      </Button>

      {isListening && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-card border rounded-lg px-3 py-2 shadow-lg z-10 min-w-[200px] text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Listening...</span>
          </div>
          {transcript && <p className="text-xs text-muted-foreground mt-1">{transcript}</p>}
        </div>
      )}

      <ScreenReaderAnnouncement
        message={isListening ? 'Voice input active' : 'Voice input inactive'}
        priority="assertive"
      />
    </div>
  );
}

// Text-to-Speech Hook
export function useTextToSpeech() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speak = useCallback(
    (text: string, options: Partial<SpeechSynthesisUtterance> = {}) => {
      if (!isSupported || isSpeaking) return;

      const utterance = new SpeechSynthesisUtterance(text);

      // Apply options
      if (options.lang) utterance.lang = options.lang;
      if (options.rate !== undefined) utterance.rate = options.rate;
      if (options.pitch !== undefined) utterance.pitch = options.pitch;
      if (options.volume !== undefined) utterance.volume = options.volume;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, isSpeaking]
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, isSupported };
}

// Text-to-Speech Button Component
interface TextToSpeechButtonProps {
  text: string;
  children?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function TextToSpeechButton({
  text,
  children,
  className,
  size = 'default',
}: TextToSpeechButtonProps) {
  const { speak, stop, isSpeaking, isSupported } = useTextToSpeech();

  if (!isSupported) return null;

  const handleClick = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      size={size}
      className={className}
      aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}
      aria-pressed={isSpeaking}
    >
      {children || <Volume2 className={`h-4 w-4 ${isSpeaking ? 'text-primary' : ''}`} />}
      <span className="sr-only">{isSpeaking ? 'Stop text-to-speech' : 'Start text-to-speech'}</span>
    </Button>
  );
}

// Mobile Gesture Hints Component
interface GestureHintProps {
  gesture: 'swipe' | 'pinch' | 'tap' | 'long-press';
  direction?: 'left' | 'right' | 'up' | 'down';
  description: string;
  show?: boolean;
}

export function GestureHint({ gesture, direction, description, show = true }: GestureHintProps) {
  if (!show) return null;

  const getGestureIcon = () => {
    switch (gesture) {
      case 'swipe':
        return direction === 'left'
          ? '←'
          : direction === 'right'
            ? '→'
            : direction === 'up'
              ? '↑'
              : '↓';
      case 'pinch':
        return '🤏';
      case 'tap':
        return '👆';
      case 'long-press':
        return '👇';
      default:
        return '👋';
    }
  };

  return (
    <div className="gesture-hint fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-card border rounded-lg px-4 py-2 shadow-lg z-40 max-w-xs text-center">
      <div className="flex items-center justify-center space-x-2 mb-1">
        <span className="text-lg">{getGestureIcon()}</span>
        <span className="text-sm font-medium">{description}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {gesture === 'swipe' && `Swipe ${direction} to navigate`}
        {gesture === 'pinch' && 'Pinch to zoom in/out'}
        {gesture === 'tap' && 'Tap to interact'}
        {gesture === 'long-press' && 'Press and hold for options'}
      </p>
    </div>
  );
}

// Mobile Accessibility Preferences Hook
export function useMobileAccessibility() {
  const [preferences, setPreferences] = useState({
    voiceInput: false,
    textToSpeech: false,
    hapticFeedback: true,
    largeText: false,
    highContrast: false,
    reducedMotion: false,
  });

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mobile-accessibility-prefs');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load mobile accessibility preferences:', error);
    }
  }, []);

  // Save preferences to localStorage
  const updatePreferences = useCallback(
    (updates: Partial<typeof preferences>) => {
      const newPrefs = { ...preferences, ...updates };
      setPreferences(newPrefs);
      try {
        localStorage.setItem('mobile-accessibility-prefs', JSON.stringify(newPrefs));
      } catch (error) {
        console.warn('Failed to save mobile accessibility preferences:', error);
      }
    },
    [preferences]
  );

  return { preferences, updatePreferences };
}

// High Contrast Mode Toggle
export function HighContrastToggle() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    setIsHighContrast(prefersHighContrast);

    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handleChange = (e: MediaQueryListEvent) => setIsHighContrast(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', isHighContrast);
  }, [isHighContrast]);

  return (
    <Button
      onClick={() => setIsHighContrast(!isHighContrast)}
      variant="outline"
      size="sm"
      aria-label={`Toggle high contrast mode ${isHighContrast ? 'off' : 'on'}`}
      aria-pressed={isHighContrast}
    >
      {isHighContrast ? '☀️' : '🌙'} Contrast
    </Button>
  );
}
