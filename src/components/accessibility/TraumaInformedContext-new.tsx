/**
 * Trauma-Informed UX Provider
 */

import { ReactNode, useState, useEffect } from 'react';
import {
  TraumaInformedPreferences,
  defaultPreferences,
  getFontSizeValue,
  getTouchSizeValue,
} from './TraumaInformedTypes';
import { secureStorage } from '../../lib/storage/secureStorage';
import { TraumaInformedContext } from './TraumaInformedHooks';

// Provider component
interface TraumaInformedProviderProps {
  children: ReactNode;
}

export function TraumaInformedProvider({ children }: TraumaInformedProviderProps) {
  const sanitizePreferences = (raw: unknown): TraumaInformedPreferences => {
    if (!raw || typeof raw !== 'object') return defaultPreferences;
    const obj = raw as Record<string, unknown>;
    const sanitized: TraumaInformedPreferences = { ...defaultPreferences };
    (Object.keys(defaultPreferences) as (keyof TraumaInformedPreferences)[]).forEach(key => {
      if (key in obj) {
        (sanitized as unknown as Record<string, unknown>)[key as string] = obj[key as string];
      }
    });
    return sanitized;
  };

  const [preferences, setPreferences] = useState<TraumaInformedPreferences>(() => {
    const secure = secureStorage.get<TraumaInformedPreferences>('trauma-informed-preferences', {
      encrypt: true,
    });
    if (secure) return sanitizePreferences(secure);
    try {
      const legacy = localStorage.getItem('trauma-informed-preferences');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        secureStorage.set('trauma-informed-preferences', parsed, { encrypt: true });
        return sanitizePreferences(parsed);
      }
    } catch {
      /* ignore */
    }
    return defaultPreferences;
  });

  const updatePreferences = (updates: Partial<TraumaInformedPreferences>) => {
    const newPreferences = sanitizePreferences({ ...preferences, ...updates });
    setPreferences(newPreferences);
    secureStorage.set('trauma-informed-preferences', newPreferences, { encrypt: true });
  };

  // Apply CSS custom properties when preferences change
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    root.style.setProperty('--ti-font-size', getFontSizeValue(preferences.fontSize));

    // Touch target size
    root.style.setProperty('--ti-touch-size', getTouchSizeValue(preferences.touchTargetSize));

    // Contrast
    const contrastClass = `ti-contrast-${preferences.contrast}`;
    document.body.className = document.body.className.replace(/ti-contrast-\w+/g, '');
    document.body.classList.add(contrastClass);

    // Motion
    if (preferences.reduceMotion) {
      document.body.classList.add('ti-reduce-motion');
    } else {
      document.body.classList.remove('ti-reduce-motion');
    }

    // Simplified mode
    if (preferences.simplifiedMode) {
      document.body.classList.add('ti-simplified');
    } else {
      document.body.classList.remove('ti-simplified');
    }
  }, [preferences]);

  return (
    <TraumaInformedContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </TraumaInformedContext.Provider>
  );
}
