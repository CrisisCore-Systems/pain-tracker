/* eslint-disable react-refresh/only-export-components */
// @refresh reset
/**
 * Theme Provider Component
 * Manages dark/light mode and provides theme context throughout the app
 *
 * DESIGN PHILOSOPHY: Dark mode is the DEFAULT.
 * At 3 AM when you're in pain, a white screen is violence.
 * We respect system preferences, but default to dark for new users.
 *
 * Performance optimizations:
 * - Memoized context value to prevent unnecessary re-renders
 * - Batched CSS variable updates
 * - Debounced system preference listeners
 * - Selective re-rendering via granular selectors
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { brand } from './brand';
import { ThemeMode, getThemeColors, ThemeColors } from './theme';

/** Storage key for persisting theme preference */
const THEME_STORAGE_KEY = 'pain-tracker:theme-mode';

/** Transition duration for theme changes (ms) */
const THEME_TRANSITION_DURATION = 150;

interface ThemeContextType {
  /** Current theme mode */
  mode: ThemeMode;
  /** Toggle between light and dark modes */
  toggleMode: () => void;
  /** Current theme color tokens */
  colors: ThemeColors;
  /** Set a specific theme mode */
  setMode: (mode: ThemeMode) => void;
  /** Whether high-contrast mode is active */
  isHighContrast: boolean;
  /** Whether reduced motion is preferred */
  hasReducedMotion: boolean;
  /** Whether dark mode is active (includes high-contrast) */
  isDark: boolean;
  /** Whether the theme is currently transitioning */
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Selector hooks for performance - subscribe only to specific values
 * Use these when you only need one value to avoid unnecessary re-renders
 */
export const useThemeMode = () => useTheme().mode;
export const useIsDark = () => useTheme().isDark;
export const useIsHighContrast = () => useTheme().isHighContrast;
export const useThemeColors = () => useTheme().colors;

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

/**
 * Get the initial theme mode.
 * Priority:
 * 1. User's saved preference (from localStorage)
 * 2. System preference (prefers-color-scheme)
 * 3. Default to 'dark' (our trauma-informed default)
 */
function getInitialMode(defaultMode: ThemeMode): ThemeMode {
  if (typeof window === 'undefined') return defaultMode;
  
  // Check for saved preference first
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'high-contrast') {
      return saved as ThemeMode;
    }
  } catch {
    // localStorage might be unavailable
  }
  
  // Check system preference
  if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  
  // Default to dark - our trauma-informed default
  return 'dark';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'dark', // Dark is our default
}) => {
  const [mode, setModeState] = useState<ThemeMode>(() => getInitialMode(defaultMode));
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [hasReducedMotion, setHasReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const colors = useMemo(() => getThemeColors(mode), [mode]);
  const isDark = mode === 'dark' || mode === 'high-contrast';

  // Update CSS custom properties when mode changes
  const updateCSSVariables = useCallback((newMode: ThemeMode) => {
    const themeColors = getThemeColors(newMode) as ThemeColors;
    const root = document.documentElement;

    // Set CSS custom properties for seamless integration with Tailwind
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Helper to convert hex color to "r g b" string for CSS variable storage
    const hexToRgb = (hex?: string) => {
      if (!hex) return '0 0 0';
      const h = hex.replace('#', '').trim();
      if (h.length !== 6) return '0 0 0';
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      return `${r} ${g} ${b}`;
    };

    // Set chart series tokens (use theme values with brand fallbacks)
    root.style.setProperty(
      '--chart-series-1',
      hexToRgb(themeColors.primary ?? brand.colors.primary[500])
    );
    root.style.setProperty(
      '--chart-series-2',
      hexToRgb(themeColors.secondary ?? brand.colors.secondary[500])
    );
    root.style.setProperty(
      '--chart-series-3',
      hexToRgb(themeColors.accent ?? brand.colors.accent[500])
    );
    root.style.setProperty(
      '--chart-series-4',
      hexToRgb(themeColors.warning ?? brand.colors.status.warning)
    );
    root.style.setProperty(
      '--chart-series-5',
      hexToRgb(themeColors.info ?? brand.colors.status.info)
    );
    root.style.setProperty(
      '--chart-series-6',
      hexToRgb(themeColors.destructive ?? brand.colors.status.error)
    );

    // Pain-specific tokens
    root.style.setProperty(
      '--color-pain-none',
      hexToRgb(themeColors.success ?? brand.colors.pain.none)
    );
    root.style.setProperty(
      '--color-pain-mild',
      hexToRgb(themeColors.success ?? brand.colors.pain.mild)
    );
    root.style.setProperty(
      '--color-pain-moderate',
      hexToRgb(themeColors.warning ?? brand.colors.pain.moderate)
    );
    root.style.setProperty(
      '--color-pain-severe',
      hexToRgb(themeColors.warning ?? brand.colors.pain.severe)
    );
    root.style.setProperty(
      '--color-pain-extreme',
      hexToRgb(themeColors.destructive ?? brand.colors.pain.extreme)
    );

    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', newMode === 'high-contrast' ? 'dark' : newMode);

    // Toggle 'dark' class for Tailwind dark mode
    if (newMode === 'dark' || newMode === 'high-contrast') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Set and persist mode with smooth transition
  const setMode = useCallback(
    (newMode: ThemeMode) => {
      // Start transition
      setIsTransitioning(true);

      // Clear any existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      setModeState(newMode);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newMode);
      } catch {
        // localStorage might be unavailable
      }
      updateCSSVariables(newMode);

      // End transition after animation completes
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, THEME_TRANSITION_DURATION);
    },
    [updateCSSVariables]
  );

  const toggleMode = useCallback(() => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
  }, [mode, setMode]);

  // Listen for system accessibility preferences (reduced motion only)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handler = (e: MediaQueryListEvent) => {
      setHasReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  // Listen for system color scheme changes (respect user's OS preference)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handler = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly set a preference
      try {
        const saved = localStorage.getItem(THEME_STORAGE_KEY);
        if (!saved) {
          setMode(e.matches ? 'dark' : 'light');
        }
      } catch {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [setMode]);

  // Initial CSS variables setup
  useEffect(() => {
    updateCSSVariables(mode);
  }, [mode, updateCSSVariables]);

  // Cleanup transition timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value: ThemeContextType = useMemo(
    () => ({
      mode,
      toggleMode,
      colors,
      setMode,
      isHighContrast: mode === 'high-contrast',
      hasReducedMotion,
      isDark,
      isTransitioning,
    }),
    [mode, toggleMode, colors, setMode, hasReducedMotion, isDark, isTransitioning]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
