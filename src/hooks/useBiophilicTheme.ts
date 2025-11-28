/**
 * useBiophilicTheme
 * ------------------
 * A React hook that manages the biophilic (nature-inspired) theme state.
 * Persists preference to localStorage and toggles the `.biophilic` class on <html>.
 *
 * Usage:
 * ```tsx
 * const { enabled, toggle, enable, disable } = useBiophilicTheme();
 * ```
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pain-tracker:biophilic-theme';

export interface UseBiophilicThemeReturn {
  /** Whether the biophilic theme is currently enabled */
  enabled: boolean;
  /** Toggle the theme on/off */
  toggle: () => void;
  /** Explicitly enable the theme */
  enable: () => void;
  /** Explicitly disable the theme */
  disable: () => void;
}

/**
 * Returns controls and state for the biophilic (nature-inspired) theme.
 * The preference is persisted to localStorage and the `.biophilic` class
 * is added/removed from the document root element.
 *
 * @param defaultEnabled - initial value when no stored preference exists (defaults to true)
 */
export function useBiophilicTheme(defaultEnabled = true): UseBiophilicThemeReturn {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return defaultEnabled;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) return stored === 'true';
    } catch {
      // localStorage may be unavailable (e.g., private browsing)
    }
    return defaultEnabled;
  });

  // Sync class on <html> whenever enabled changes
  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('biophilic');
    } else {
      root.classList.remove('biophilic');
    }
  }, [enabled]);

  // Persist preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // ignore storage errors
    }
  }, [enabled]);

  const toggle = useCallback(() => setEnabled((prev) => !prev), []);
  const enable = useCallback(() => setEnabled(true), []);
  const disable = useCallback(() => setEnabled(false), []);

  return { enabled, toggle, enable, disable };
}

export default useBiophilicTheme;
