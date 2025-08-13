/**
 * Theme Provider Component
 * Manages dark/light mode and provides theme context throughout the app
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, getThemeColors } from './theme';

interface ThemeContextType {
  mode: ThemeMode;
  toggleMode: () => void;
  colors: ReturnType<typeof getThemeColors>;
  setMode: (mode: ThemeMode) => void;
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
        const savedMode = localStorage.getItem('pain-tracker-theme');
        if (savedMode === 'light' || savedMode === 'dark') {
          return savedMode;
        }
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return 'dark';
        }
      } catch (error) {
        console.warn('Failed to access localStorage for theme preference:', error);
      }
    }
    return defaultMode;
  });

  const colors = getThemeColors(mode);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem('pain-tracker-theme', newMode);
    } catch (error) {
      console.warn('Failed to save theme preference to localStorage:', error);
    }
    
    // Update CSS custom properties
    updateCSSVariables(newMode);
  };

  const toggleMode = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  // Update CSS custom properties when mode changes
  const updateCSSVariables = (newMode: ThemeMode) => {
    const colors = getThemeColors(newMode);
    const root = document.documentElement;
    
    // Set CSS custom properties for seamless integration with Tailwind
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', newMode);
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        const savedMode = localStorage.getItem('pain-tracker-theme');
        // Only update if user hasn't set a preference
        if (!savedMode) {
          setMode(e.matches ? 'dark' : 'light');
        }
      } catch (error) {
        console.warn('Failed to access localStorage for system theme detection:', error);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Initial CSS variables setup
  useEffect(() => {
    updateCSSVariables(mode);
  }, [mode]);

  const value: ThemeContextType = {
    mode,
    toggleMode,
    colors,
    setMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};