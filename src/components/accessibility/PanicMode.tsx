import React, { useEffect, useState } from 'react';
import { X, Heart } from 'lucide-react';
import { cn } from '../../design-system/utils';
import { useAdaptiveCopy, useTone } from '../../contexts/useTone';
import { panicModeCopy } from '../../content/microcopy';

/**
 * Panic Mode Component - Trauma-Informed Crisis Support
 * 
 * WCAG 2.2 AAA: Provides low-stimulus, calming interface during pain flares or emotional crises
 * Target: <2 second activation time from anywhere in app
 * 
 * Features:
 * - Breathing guide with visual pulse
 * - Haptic feedback (if supported)
 * - Gentle language and affirmations
 * - Low-contrast, calm color palette
 * - Large tap targets (≥56px)
 * - Option to redact/hide sensitive data
 * - Quick exit to safety resources
 */

export interface PanicModeProps {
  /** Whether Panic Mode is active */
  isActive: boolean;
  /** Callback when user closes Panic Mode */
  onClose: () => void;
  /** Optional custom affirmations */
  affirmations?: string[];
  /** Show redaction toggle for privacy */
  showRedactionToggle?: boolean;
}

// Use affirmations from microcopy instead of hardcoded
const DEFAULT_AFFIRMATIONS = panicModeCopy.affirmations;

const BREATHING_PATTERN = {
  inhale: 4000,    // 4 seconds
  hold: 4000,      // 4 seconds
  exhale: 6000,    // 6 seconds
  pause: 2000      // 2 seconds
};

export function PanicMode({
  isActive,
  onClose,
  affirmations = DEFAULT_AFFIRMATIONS,
  showRedactionToggle = false
}: PanicModeProps) {
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [isRedacted, setIsRedacted] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const [activationTime] = useState(Date.now());

  // Adaptive copy
  const { trackTimeToCalm } = useTone();
  const greetingText = useAdaptiveCopy(panicModeCopy.greeting);
  const crisisPromptText = useAdaptiveCopy(panicModeCopy.crisisPrompt);
  const crisisHotlineText = useAdaptiveCopy(panicModeCopy.crisisHotline);
  const closeButtonText = useAdaptiveCopy(panicModeCopy.closeButton);
  const inhaleText = useAdaptiveCopy(panicModeCopy.breathingPhases.inhale);
  const holdText = useAdaptiveCopy(panicModeCopy.breathingPhases.hold);
  const exhaleText = useAdaptiveCopy(panicModeCopy.breathingPhases.exhale);
  const pauseText = useAdaptiveCopy(panicModeCopy.breathingPhases.pause);

  // Add close handler that tracks time to calm
  const handleClose = () => {
    const timeElapsed = (Date.now() - activationTime) / 1000; // seconds
    trackTimeToCalm(timeElapsed);
    onClose();
  };

  // Haptic feedback helper (if browser supports it)
  const triggerHaptic = (pattern: 'light' | 'medium' | 'heavy') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30, 10, 30]
      };
      navigator.vibrate(patterns[pattern]);
    }
  };

  // Breathing cycle management
  useEffect(() => {
    if (!isActive) return;

    const phases: Array<{ phase: typeof breathingPhase; duration: number }> = [
      { phase: 'inhale', duration: BREATHING_PATTERN.inhale },
      { phase: 'hold', duration: BREATHING_PATTERN.hold },
      { phase: 'exhale', duration: BREATHING_PATTERN.exhale },
      { phase: 'pause', duration: BREATHING_PATTERN.pause }
    ];

    let currentPhaseIndex = 0;

    const advancePhase = () => {
      currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
      const { phase, duration } = phases[currentPhaseIndex];
      
      setBreathingPhase(phase);
      
      // Haptic feedback on phase change
      if (phase === 'inhale') {
        triggerHaptic('light');
        setCycleCount(prev => prev + 1);
      } else if (phase === 'exhale') {
        triggerHaptic('medium');
      }

      return setTimeout(advancePhase, duration);
    };

    const timer = setTimeout(advancePhase, phases[0].duration);

    return () => clearTimeout(timer);
  }, [isActive, breathingPhase]);

  // Rotate affirmations every 10 seconds
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCurrentAffirmation(prev => (prev + 1) % affirmations.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [isActive, affirmations.length]);

  // Reset state when activated
  useEffect(() => {
    if (isActive) {
      setBreathingPhase('inhale');
      setCurrentAffirmation(0);
      setCycleCount(0);
      triggerHaptic('heavy');
    }
  }, [isActive]);

  if (!isActive) return null;

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale': return inhaleText;
      case 'hold': return holdText;
      case 'exhale': return exhaleText;
      case 'pause': return pauseText;
    }
  };

  const getBreathingScale = () => {
    switch (breathingPhase) {
      case 'inhale': return 'scale-150';
      case 'hold': return 'scale-150';
      case 'exhale': return 'scale-100';
      case 'pause': return 'scale-100';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 flex items-center justify-center p-4 animate-in fade-in duration-500"
      role="dialog"
      aria-modal="true"
      aria-labelledby="panic-mode-title"
      aria-describedby="panic-mode-description"
    >
      {/* Close Button - Large, easy to tap */}
      <button
        onClick={handleClose}
        className={cn(
          'absolute top-6 right-6 z-10',
          'w-14 h-14 min-w-[56px] min-h-[56px]',
          'bg-white/10 hover:bg-white/20 rounded-full',
          'flex items-center justify-center',
          'text-white/60 hover:text-white/90',
          'transition-all duration-300',
          'focus:outline-none focus:ring-4 focus:ring-white/30',
          'backdrop-blur-sm'
        )}
        aria-label={closeButtonText}
      >
        <X className="w-6 h-6" />
      </button>

      {/* Redaction Toggle (Optional) */}
      {showRedactionToggle && (
        <button
          onClick={() => setIsRedacted(!isRedacted)}
          className={cn(
            'absolute top-6 left-6 z-10',
            'px-4 py-2 min-h-[44px]',
            'bg-white/10 hover:bg-white/20 rounded-full',
            'text-white/60 hover:text-white/90 text-sm',
            'transition-all duration-300',
            'focus:outline-none focus:ring-4 focus:ring-white/30',
            'backdrop-blur-sm'
          )}
          aria-label={isRedacted ? 'Show content' : 'Hide sensitive content'}
          aria-pressed={isRedacted}
        >
          {isRedacted ? '👁️ Show' : '🙈 Hide'}
        </button>
      )}

      {/* Main Content */}
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Title */}
        <div>
          <h1
            id="panic-mode-title"
            className="text-4xl md:text-5xl font-bold text-white mb-3 animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            {greetingText}
          </h1>
          <p
            id="panic-mode-description"
            className="text-xl text-white/70 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100"
          >
            {affirmations[currentAffirmation]}
          </p>
        </div>

        {/* Breathing Circle */}
        <div className="flex items-center justify-center py-12">
          <div
            className={cn(
              'relative w-64 h-64 rounded-full',
              'bg-gradient-to-br from-blue-400/30 to-purple-400/30',
              'backdrop-blur-xl border-4 border-white/20',
              'flex items-center justify-center',
              'transition-transform duration-[4000ms] ease-in-out',
              getBreathingScale()
            )}
            role="img"
            aria-label={`Breathing guide: ${getBreathingInstruction()}`}
            aria-live="polite"
          >
            {/* Inner glow */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-300/20 to-purple-300/20 blur-xl" />
            
            {/* Center icon */}
            <Heart className="w-16 h-16 text-white/50 animate-pulse" aria-hidden="true" />
          </div>
        </div>

        {/* Breathing Instructions */}
        <div
          className="text-2xl md:text-3xl font-medium text-white animate-in fade-in duration-500"
          aria-live="assertive"
          aria-atomic="true"
        >
          {getBreathingInstruction()}
        </div>

        {/* Progress Indicator */}
        <div className="text-sm text-white/50">
          {cycleCount} breathing {cycleCount === 1 ? 'cycle' : 'cycles'} completed
        </div>

        {/* Helper Text */}
        <div className="text-sm text-white/40 max-w-md mx-auto space-y-2">
          <p>Follow the expanding and contracting circle</p>
          <p>Take your time. There's no rush.</p>
          <p className="text-xs mt-4">Press the × button when you're ready to return</p>
        </div>

        {/* Emergency Resources (Optional) */}
        <div className="pt-8 border-t border-white/10">
          <p className="text-xs text-white/40 mb-3">{crisisPromptText}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="tel:988"
              className={cn(
                'px-6 py-3 min-h-[48px]',
                'bg-white/10 hover:bg-white/20 rounded-full',
                'text-white/80 hover:text-white text-sm font-medium',
                'transition-all duration-300',
                'focus:outline-none focus:ring-4 focus:ring-white/30'
              )}
            >
              {crisisHotlineText}
            </a>
            <button
              onClick={handleClose}
              className={cn(
                'px-6 py-3 min-h-[48px]',
                'bg-white/10 hover:bg-white/20 rounded-full',
                'text-white/80 hover:text-white text-sm font-medium',
                'transition-all duration-300',
                'focus:outline-none focus:ring-4 focus:ring-white/30'
              )}
            >
              {closeButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
