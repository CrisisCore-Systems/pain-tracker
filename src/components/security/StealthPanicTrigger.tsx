import React, { useState, useEffect, useRef, useCallback } from 'react';
import { executeSoftPanic, hasDeepVaultAccess } from '../../services/DuressVaultService';

const HOLD_DURATION_MS = 3000;

interface StealthPanicTriggerProps {
  onTrigger?: () => void;
  holdDurationMs?: number;
  children: React.ReactNode;
  className?: string;
}

export const StealthPanicTrigger: React.FC<StealthPanicTriggerProps> = ({
  onTrigger,
  holdDurationMs = HOLD_DURATION_MS,
  children,
  className = '',
}) => {
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const triggerFiredRef = useRef<boolean>(false);

  const clearHoldState = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsPressing(false);
    setProgress(0);
    triggerFiredRef.current = false;
  }, []);

  const tick = useCallback(() => {
    if (!isPressing || triggerFiredRef.current) return;

    const elapsed = performance.now() - startTimeRef.current;
    const currentProgress = Math.min((elapsed / holdDurationMs) * 100, 100);

    setProgress(currentProgress);

    if (elapsed < holdDurationMs) {
      animationRef.current = requestAnimationFrame(tick);
    }
  }, [isPressing, holdDurationMs]);

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if ('button' in e && e.button !== 0) return;

      clearHoldState();
      setIsPressing(true);
      triggerFiredRef.current = false;
      startTimeRef.current = performance.now();

      animationRef.current = requestAnimationFrame(tick);

      timerRef.current = setTimeout(() => {
        triggerFiredRef.current = true;
        executeSoftPanic();
        onTrigger?.();
        clearHoldState();
      }, holdDurationMs);
    },
    [holdDurationMs, onTrigger, clearHoldState, tick]
  );

  useEffect(() => {
    return () => clearHoldState();
  }, [clearHoldState]);

  const computeStealthStyle = (): React.CSSProperties => {
    if (!isPressing) return {};

    const desaturateValue = 1 - (progress / 100) * 0.4;
    const opacityValue = 1 - (progress / 100) * 0.15;

    return {
      filter: `saturate(${desaturateValue})`,
      opacity: opacityValue,
      transition: 'filter 100ms linear, opacity 100ms linear',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    };
  };

  if (!hasDeepVaultAccess()) {
    return null;
  }

  return (
    <div
      onMouseDown={handleStart}
      onMouseUp={clearHoldState}
      onMouseLeave={clearHoldState}
      onTouchStart={handleStart}
      onTouchEnd={clearHoldState}
      onTouchCancel={clearHoldState}
      style={computeStealthStyle()}
      className={`stealth-panic-gate ${className}`}
      role="presentation"
    >
      {children}
    </div>
  );
};