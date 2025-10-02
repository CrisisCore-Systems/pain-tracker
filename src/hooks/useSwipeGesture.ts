/**
 * Swipe Gesture Hook for Mobile Navigation
 * Provides swipe gesture detection and handling for touch devices
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface SwipeConfig {
  threshold?: number; // Minimum distance for swipe detection
  velocity?: number; // Minimum velocity for swipe detection
  restorePosition?: boolean; // Whether to restore position after swipe
  preventDefault?: boolean; // Whether to prevent default touch behavior
}

export interface SwipeState {
  isSwiping: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
  velocity: number;
}

export interface SwipeHandlers {
  onSwipeStart?: (state: SwipeState) => void;
  onSwipeMove?: (state: SwipeState) => void;
  onSwipeEnd?: (state: SwipeState) => void;
  onSwipeLeft?: (distance: number, velocity: number) => void;
  onSwipeRight?: (distance: number, velocity: number) => void;
  onSwipeUp?: (distance: number, velocity: number) => void;
  onSwipeDown?: (distance: number, velocity: number) => void;
}

const defaultConfig: Required<SwipeConfig> = {
  threshold: 50,
  velocity: 0.3,
  restorePosition: true,
  preventDefault: true,
};

export function useSwipeGesture(
  config: SwipeConfig = {},
  handlers: SwipeHandlers = {}
) {
  const finalConfig = { ...defaultConfig, ...config };
  const elementRef = useRef<HTMLElement>(null);
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    direction: null,
    distance: 0,
    velocity: 0,
  });

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const animationFrameRef = useRef<number>();

  const calculateDirection = useCallback((deltaX: number, deltaY: number): SwipeState['direction'] => {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  const calculateVelocity = useCallback((distance: number, time: number): number => {
    return Math.abs(distance) / Math.max(time, 1); // pixels per ms
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (finalConfig.preventDefault) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    setSwipeState({
      isSwiping: true,
      direction: null,
      distance: 0,
      velocity: 0,
    });

    handlers.onSwipeStart?.(swipeState);
  }, [finalConfig.preventDefault, swipeState, handlers]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    if (finalConfig.preventDefault) {
      e.preventDefault();
    }

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const direction = calculateDirection(deltaX, deltaY);
    const timeElapsed = Date.now() - touchStartRef.current.time;
    const velocity = calculateVelocity(distance, timeElapsed);

    const newState: SwipeState = {
      isSwiping: true,
      direction,
      distance,
      velocity,
    };

    setSwipeState(newState);
    handlers.onSwipeMove?.(newState);
  }, [finalConfig.preventDefault, calculateDirection, calculateVelocity, handlers]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const direction = calculateDirection(deltaX, deltaY);
    const timeElapsed = Date.now() - touchStartRef.current.time;
    const velocity = calculateVelocity(distance, timeElapsed);

    const finalState: SwipeState = {
      isSwiping: false,
      direction,
      distance,
      velocity,
    };

    // Trigger direction-specific handlers if threshold and velocity are met
    if (distance >= finalConfig.threshold && velocity >= finalConfig.velocity) {
      switch (direction) {
        case 'left':
          handlers.onSwipeLeft?.(distance, velocity);
          break;
        case 'right':
          handlers.onSwipeRight?.(distance, velocity);
          break;
        case 'up':
          handlers.onSwipeUp?.(distance, velocity);
          break;
        case 'down':
          handlers.onSwipeDown?.(distance, velocity);
          break;
      }
    }

    setSwipeState(finalState);
    handlers.onSwipeEnd?.(finalState);

    touchStartRef.current = null;
  }, [calculateDirection, calculateVelocity, finalConfig.threshold, finalConfig.velocity, handlers]);

  // Set up event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ref: elementRef,
    swipeState,
    isSwiping: swipeState.isSwiping,
    direction: swipeState.direction,
    distance: swipeState.distance,
    velocity: swipeState.velocity,
  };
}

// Higher-level hook for navigation swipes
export function useNavigationSwipe(
  onNavigateLeft?: () => void,
  onNavigateRight?: () => void,
  config: SwipeConfig = {}
) {
  return useSwipeGesture(
    { threshold: 75, velocity: 0.5, ...config },
    {
      onSwipeLeft: () => onNavigateLeft?.(),
      onSwipeRight: () => onNavigateRight?.(),
    }
  );
}

// Hook for pull-to-refresh functionality
export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  config: SwipeConfig & { pullThreshold?: number } = {}
) {
  const { pullThreshold = 80 } = config;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const swipeGesture = useSwipeGesture(
    { threshold: 10, velocity: 0.1, ...config },
    {
      onSwipeMove: (state) => {
        if (state.direction === 'down' && !isRefreshing) {
          setPullDistance(Math.max(0, state.distance));
        }
      },
      onSwipeEnd: async (state) => {
        if (state.direction === 'down' && state.distance >= pullThreshold && !isRefreshing) {
          setIsRefreshing(true);
          setPullDistance(0);
          try {
            await onRefresh();
          } finally {
            setIsRefreshing(false);
          }
        } else {
          setPullDistance(0);
        }
      },
    }
  );

  return {
    ...swipeGesture,
    isRefreshing,
    pullDistance,
    pullProgress: Math.min(pullDistance / pullThreshold, 1),
  };
}