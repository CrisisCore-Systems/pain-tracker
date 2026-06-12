import React, { useState, useRef, useCallback, useEffect } from 'react';
import { executeSoftPanic, executeHardPanic, hasDeepVaultAccess } from '../../services/DuressVaultService';

const HOLD_DURATION_MS = 3000;
const VISUAL_FEEDBACK_INTERVAL_MS = 200;

type PanicTriggerType = 'soft' | 'hard';

interface HoldToActuateButtonProps {
  type?: PanicTriggerType;
  className?: string;
  children: React.ReactNode;
  onActivated?: () => void;
  disabled?: boolean;
}

export const HoldToActuateButton: React.FC<HoldToActuateButtonProps> = ({
  type = 'soft',
  className = '',
  children,
  onActivated,
  disabled = false,
}) => {
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visualFeedbackRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartRef = useRef<number>(0);
  const [glitchIntensity, setGlitchIntensity] = useState(0);

  const clearTimers = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (visualFeedbackRef.current) {
      clearInterval(visualFeedbackRef.current);
      visualFeedbackRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const handleActivation = useCallback(async () => {
    clearTimers();
    setIsHolding(false);
    setHoldProgress(0);
    setGlitchIntensity(0);

    try {
      if (type === 'soft') {
        await executeSoftPanic();
      } else {
        await executeHardPanic();
      }
    } catch {
      // Ignore errors during panic activation
    }

    onActivated?.();
  }, [type, clearTimers, onActivated]);

  const handlePointerDown = useCallback(() => {
    if (disabled) return;

    setIsHolding(true);
    setHoldProgress(0);
    setGlitchIntensity(0);
    holdStartRef.current = Date.now();

    // Start visual feedback timer - creates subtle glitch effect
    visualFeedbackRef.current = setInterval(() => {
      setGlitchIntensity(prev => (prev + 1) % 4);
    }, VISUAL_FEEDBACK_INTERVAL_MS);

    holdTimerRef.current = setTimeout(() => {
      handleActivation();
    }, HOLD_DURATION_MS);
  }, [disabled, handleActivation]);

  const handlePointerUp = useCallback(() => {
    if (disabled) return;

    clearTimers();
    setIsHolding(false);
    setHoldProgress(0);
    setGlitchIntensity(0);
  }, [disabled, clearTimers]);

  const handlePointerLeave = useCallback(() => {
    if (disabled) return;

    clearTimers();
    setIsHolding(false);
    setHoldProgress(0);
    setGlitchIntensity(0);
  }, [disabled, clearTimers]);

  // Progress bar animation during hold
  useEffect(() => {
    if (!isHolding) return;

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setHoldProgress(progress);
    }, 50);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isHolding]);

  // Keyboard accessibility - hold Enter/Space for 3 seconds
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePointerDown();
    }
  }, [disabled, handlePointerDown]);

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePointerUp();
    }
  }, [handlePointerUp]);

  // Clean up on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Only show when in deep vault (not decoy mode)
  if (!hasDeepVaultAccess()) {
    return null;
  }

  const glitchClasses = [
    'transition-all duration-75',
    glitchIntensity === 1 && 'translate-x-[0.5px] skew-y-0.5deg',
    glitchIntensity === 2 && '-translate-x-[0.5px] -skew-y-0.5deg',
    glitchIntensity === 3 && 'saturate-75 brightness-90',
  ].filter(Boolean).join(' ');

  const progressColor = type === 'soft' 
    ? 'from-indigo-500 to-purple-500' 
    : 'from-red-500 to-orange-500';

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={type === 'soft' ? 'Quick Exit' : 'Secure Reset'}
      aria-disabled={disabled}
    >
      <div className="relative">
        {children}
        
        {/* Glitch overlay - appears as rendering artifact to observers */}
        {isHolding && (
          <>
            <div 
              className={`absolute inset-0 pointer-events-none ${glitchClasses}`}
              aria-hidden="true"
            />
            <div 
              className={`absolute -inset-1 -z-10 opacity-20 bg-gradient-to-r ${progressColor} rounded-full`}
              aria-hidden="true"
            />
          </>
        )}
      </div>

      {/* Hidden progress indicator - looks like artifact to observers */}
      {isHolding && (
        <div 
          className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-40"
          style={{ 
            width: `${holdProgress}%`,
            transition: 'width 50ms linear',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

// Quick Exit trigger - styled as a benign navigation element
export const QuickExitTrigger: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <HoldToActuateButton type="soft" className={className}>
      <span className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
        Quick Exit
      </span>
    </HoldToActuateButton>
  );
};

// Hard panic trigger - styled as a status indicator
export const EmergencyResetTrigger: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <HoldToActuateButton type="hard" className={className}>
      <span className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
        &bull;&bull;&bull;
      </span>
    </HoldToActuateButton>
  );
};