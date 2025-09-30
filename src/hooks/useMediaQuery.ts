/**
 * useMediaQuery Hook
 * 
 * Provides responsive breakpoint detection for mobile optimization
 * Based on Tailwind CSS breakpoints
 */

import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

// Tailwind breakpoints from tailwind.config.cjs
const breakpoints: Record<Breakpoint, string> = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  '3xl': '1600px',
  '4xl': '1920px',
};

/**
 * Hook to detect if a media query matches
 * @param query - CSS media query string
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query]);

  return matches;
}

/**
 * Hook to detect if viewport is at or above a specific breakpoint
 * @param breakpoint - Tailwind breakpoint name
 * @returns boolean indicating if viewport is at or above the breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const query = `(min-width: ${breakpoints[breakpoint]})`;
  return useMediaQuery(query);
}

/**
 * Hook to get current responsive state
 * @returns object with boolean flags for common device sizes
 */
export function useResponsive() {
  const isMobile = !useBreakpoint('md'); // < 768px
  const isTablet = useBreakpoint('md') && !useBreakpoint('lg'); // 768px - 1024px
  const isDesktop = useBreakpoint('lg'); // >= 1024px
  const isWidescreen = useBreakpoint('xl'); // >= 1280px

  return {
    isMobile,
    isTablet,
    isDesktop,
    isWidescreen,
  };
}

/**
 * Hook to detect touch device
 * @returns boolean indicating if device supports touch
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    // Check on mount and on resize (for device orientation changes)
    checkTouch();
    window.addEventListener('resize', checkTouch);
    
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  return isTouch;
}
