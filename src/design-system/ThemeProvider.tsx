/* eslint-disable react-refresh/only-export-components */
// @refresh reset
/**
 * Theme Provider Component
 * Manages dark/light mode and provides theme context throughout the app
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { secureStorage } from '../lib/storage/secureStorage';
import { brand } from './brand';
import { ThemeMode, getThemeColors, ThemeColors } from './theme';

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  colors: ReturnType<typeof getThemeColors>;
  setMode: (mode: ThemeMode) => void;
  isHighContrast: boolean;
  hasReducedMotion: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultMode = 'light' 
}) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    // Check localStorage for saved theme preference
    if (typeof window !== 'undefined') {
      try {
  const savedMode = secureStorage.get<string>('pain-tracker-theme');
        if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'high-contrast') {
          return savedMode;
        }
        
        // Check system preference for high contrast
        if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
          return 'high-contrast';
        }
        
        // Check system preference for dark mode
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      } catch (error) {
        console.warn('Failed to access localStorage for theme preference:', error);
      }
    }
    return defaultMode;
  });

  const [hasReducedMotion, setHasReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const colors = getThemeColors(mode);

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
  root.style.setProperty('--chart-series-1', hexToRgb(themeColors.primary ?? brand.colors.primary[500]));
  root.style.setProperty('--chart-series-2', hexToRgb(themeColors.secondary ?? brand.colors.secondary[500]));
  root.style.setProperty('--chart-series-3', hexToRgb(themeColors.accent ?? brand.colors.accent[500]));
  root.style.setProperty('--chart-series-4', hexToRgb(themeColors.warning ?? brand.colors.status.warning));
  root.style.setProperty('--chart-series-5', hexToRgb(themeColors.info ?? brand.colors.status.info));
  root.style.setProperty('--chart-series-6', hexToRgb(themeColors.destructive ?? brand.colors.status.error));

    // Pain-specific tokens
  root.style.setProperty('--color-pain-none', hexToRgb(themeColors.success ?? brand.colors.pain.none));
  root.style.setProperty('--color-pain-mild', hexToRgb(themeColors.success ?? brand.colors.pain.mild));
  root.style.setProperty('--color-pain-moderate', hexToRgb(themeColors.warning ?? brand.colors.pain.moderate));
  root.style.setProperty('--color-pain-severe', hexToRgb(themeColors.warning ?? brand.colors.pain.severe));
  root.style.setProperty('--color-pain-extreme', hexToRgb(themeColors.destructive ?? brand.colors.pain.extreme));
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', newMode);
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    try {
  secureStorage.set('pain-tracker-theme', newMode);
    } catch (error) {
      console.warn('Failed to save theme preference to localStorage:', error);
    }
    
    // Update CSS custom properties
    updateCSSVariables(newMode);
  }, [updateCSSVariables]);

  const toggleMode = useCallback(() => {
    const nextMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'high-contrast' : 'light';
    setMode(nextMode);
  }, [mode, setMode]);

  // Listen for system accessibility preferences
  useEffect(() => {
    const mediaQueries = [
      { query: '(prefers-color-scheme: dark)', handler: (e: MediaQueryListEvent) => {
        try {
          const savedMode = secureStorage.get<string>('pain-tracker-theme');
          // Only update if user hasn't set a preference and not already in high contrast
          if (!savedMode && mode !== 'high-contrast') {
            setMode(e.matches ? 'dark' : 'light');
          }
        } catch (error) {
          console.warn('Failed to access localStorage for system theme detection:', error);
        }
      }},
      { query: '(prefers-contrast: high)', handler: (e: MediaQueryListEvent) => {
        try {
          const savedMode = secureStorage.get<string>('pain-tracker-theme');
          // Update to high contrast if system preference changes
          if (!savedMode && e.matches) {
            setMode('high-contrast');
          }
        } catch (error) {
          console.warn('Failed to handle high contrast preference:', error);
        }
      }},
      { query: '(prefers-reduced-motion: reduce)', handler: (e: MediaQueryListEvent) => {
        setHasReducedMotion(e.matches);
      }}
    ];

    const cleanupFunctions: (() => void)[] = [];

    mediaQueries.forEach(({ query, handler }) => {
      const mediaQuery = window.matchMedia(query);
      
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handler);
        cleanupFunctions.push(() => mediaQuery.removeEventListener('change', handler));
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handler);
        cleanupFunctions.push(() => mediaQuery.removeListener(handler));
      }
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [mode, setMode]);

  // Initial CSS variables setup
  useEffect(() => {
    updateCSSVariables(mode);
  }, [mode, updateCSSVariables]);

  const value: ThemeContextType = {
    mode,
    toggleMode,
    colors,
    setMode,
    isHighContrast: mode === 'high-contrast',
    hasReducedMotion,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};