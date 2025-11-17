/**
 * Physical Accommodation Components
 * Designed for users with physical limitations and motor difficulties
 */

import React, { useState, useRef, useEffect } from 'react';
import { TouchOptimizedButton } from './TraumaInformedUX';
import { useTraumaInformed } from './TraumaInformedHooks';
import { Mic, MicOff, Eye, Mouse } from 'lucide-react';
import type { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent, SpeechRecognitionConstructor } from '../../types/speech';

// Extend global Window interface
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    webgazer?: unknown; // cspell:disable-line
    HeadJS?: unknown;
  }
}

// Voice Input Component
interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export function VoiceInput({ onTranscript, className = "" }: VoiceInputProps) {
  const { preferences } = useTraumaInformed();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!preferences.voiceInput) return;

    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Voice input not supported in this browser");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript);
      
      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Voice recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [preferences.voiceInput, onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError(null);
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (!preferences.voiceInput) return null;

  return (
    <div className={`voice-input ${className}`}>
      <div className="flex items-center space-x-3">
        <TouchOptimizedButton
          variant={isListening ? "primary" : "secondary"}
          onClick={toggleListening}
          disabled={!!error}
          size="large"
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 mr-2" />
              Speak
            </>
          )}
        </TouchOptimizedButton>
        
        {isListening && (
          <div className="flex-1 bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-blue-700">
                {transcript || "Listening..."}
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      )}

      {!isListening && transcript && (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded">
          <p className="text-sm text-gray-700 dark:text-gray-300">{transcript}</p>
        </div>
      )}
    </div>
  );
}

// Large Touch Slider
interface LargeTouchSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  vertical?: boolean;
}

export function LargeTouchSlider({
  value,
  onChange,
  min = 0,
  max = 10,
  step = 1,
  label,
  showValue = true,
  vertical = false
}: LargeTouchSliderProps) {
  const { preferences } = useTraumaInformed();
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleInteraction = (event: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    let percentage;
    if (vertical) {
      percentage = 1 - (clientY - rect.top) / rect.height;
    } else {
      percentage = (clientX - rect.left) / rect.width;
    }
    
    percentage = Math.max(0, Math.min(1, percentage));
    const newValue = Math.round((min + percentage * (max - min)) / step) * step;
    onChange(newValue);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    handleInteraction(event);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      handleInteraction(event);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    event.preventDefault();
    setIsDragging(true);
    handleInteraction(event);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    event.preventDefault();
    if (isDragging) {
      handleInteraction(event);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (isDragging && sliderRef.current) {
        const rect = sliderRef.current.getBoundingClientRect();
        let percentage;
        if (vertical) {
          percentage = 1 - (event.clientY - rect.top) / rect.height;
        } else {
          percentage = (event.clientX - rect.left) / rect.width;
        }
        percentage = Math.max(0, Math.min(1, percentage));
        const newValue = Math.round((min + percentage * (max - min)) / step) * step;
        onChange(newValue);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, min, max, step, onChange, vertical]);

  const percentage = ((value - min) / (max - min)) * 100;
  const sliderSize = preferences.touchTargetSize === 'extra-large' ? 'h-16' : 'h-12';
  const thumbSize = preferences.touchTargetSize === 'extra-large' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div className="large-touch-slider">
      {label && (
        <div className="flex justify-between items-center mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
          {showValue && (
            <span className="text-lg font-bold text-blue-600">{value}</span>
          )}
        </div>
      )}
      
      <div
        ref={sliderRef}
        className={`
          relative bg-gray-200 rounded-full cursor-pointer
          ${vertical ? `w-12 ${sliderSize}` : `${sliderSize} w-full`}
          ${isDragging ? 'ring-4 ring-blue-300' : ''}
        `}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
        tabIndex={0}
      >
        {/* Progress fill */}
        <div
          className="absolute bg-blue-500 rounded-full transition-all duration-150"
          style={vertical ? {
            bottom: 0,
            left: 0,
            right: 0,
            height: `${percentage}%`
          } : {
            top: 0,
            left: 0,
            bottom: 0,
            width: `${percentage}%`
          }}
        />
        
        {/* Thumb */}
        <div
          className={`
            absolute ${thumbSize} bg-white border-4 border-blue-500 rounded-full
            shadow-lg transform transition-all duration-150
            ${isDragging ? 'scale-110' : 'hover:scale-105'}
          `}
          style={vertical ? {
            left: '50%',
            bottom: `calc(${percentage}% - 1rem)`,
            transform: 'translateX(-50%)'
          } : {
            top: '50%',
            left: `calc(${percentage}% - 1rem)`,
            transform: 'translateY(-50%)'
          }}
        />
      </div>
      
      {/* Value labels */}
      <div className={`flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 ${vertical ? 'flex-col h-24' : ''}`}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

// Gesture-based Navigation
interface GestureNavigationProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function GestureNavigation({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  children,
  disabled = false
}: GestureNavigationProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (disabled) return;
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd || disabled) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    // Prioritize horizontal swipes
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      } else if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
    } else {
      if (isUpSwipe && onSwipeUp) {
        onSwipeUp();
      } else if (isDownSwipe && onSwipeDown) {
        onSwipeDown();
      }
    }
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
      className="w-full h-full"
    >
      {children}
    </div>
  );
}

// Eye Tracking Support Component (for future implementation)
export function EyeTrackingIndicator() {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check for WebGazer or other eye tracking libraries
    // cspell:disable-next-line
    setIsSupported(!!window.webgazer);
  }, []);

  if (!isSupported) return null;

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
      <Eye className="w-4 h-4" />
      <span>Eye tracking {isActive ? 'active' : 'available'}</span>
      <TouchOptimizedButton
        variant="secondary"
        onClick={() => setIsActive(!isActive)}
        size="normal"
      >
        {isActive ? 'Disable' : 'Enable'}
      </TouchOptimizedButton>
    </div>
  );
}

// Switch Control Support
interface SwitchControlProps {
  onActivate: () => void;
  children: React.ReactNode;
  highlighted?: boolean;
}

export function SwitchControl({ onActivate, children, highlighted = false }: SwitchControlProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Space or Enter for switch activation
      if (highlighted && (event.code === 'Space' || event.code === 'Enter')) {
        event.preventDefault();
        onActivate();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [highlighted, onActivate]);

  return (
    <div
      className={`
        switch-control transition-all duration-200
        ${highlighted ? 'ring-4 ring-yellow-400 bg-yellow-50' : ''}
      `}
    >
      {children}
    </div>
  );
}

// Head Mouse Support Indicator
export function HeadMouseIndicator() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check for head tracking libraries or hardware
    setIsSupported(!!navigator.getGamepads || !!window.HeadJS);
  }, []);

  if (!isSupported) return null;

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
      <Mouse className="w-4 h-4" />
      <span>Head mouse supported</span>
    </div>
  );
}

// Tremor-Friendly Input
interface TremorFriendlyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  autoComplete?: boolean;
}

export function TremorFriendlyInput({
  value,
  onChange,
  placeholder,
  multiline = false,
  autoComplete = true
}: TremorFriendlyInputProps) {
  const { preferences } = useTraumaInformed();
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    
    // Debounce the onChange to reduce jitter from tremors
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      onChange(newValue);
    }, 300); // 300ms debounce
    
    setDebounceTimer(timer);
  };

  const inputProps = {
    value: internalValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
      handleChange(e.target.value),
    placeholder,
    className: `
      w-full p-4 border-2 border-gray-300 rounded-lg
      focus:border-blue-500 focus:ring-2 focus:ring-blue-200
      text-lg leading-relaxed
      ${preferences.touchTargetSize === 'extra-large' ? 'text-xl p-6' : ''}
    `,
    style: {
      fontSize: 'var(--ti-font-size)',
      minHeight: preferences.touchTargetSize === 'extra-large' ? '72px' : '56px'
    },
    autoComplete: autoComplete ? 'on' : 'off',
    // cspell:disable-next-line
    'data-gramm': 'false', // Disable Grammarly to reduce interference
    spellCheck: false // Reduce distractions for users with cognitive fog
  };

  return multiline ? (
    <textarea {...inputProps} rows={4} />
  ) : (
    <input {...inputProps} type="text" />
  );
}
