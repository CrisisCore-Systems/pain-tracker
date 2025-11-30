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
import { trackAccessibilitySettingChanged } from '../../analytics/ga4-events';
import { trackUsageEvent, incrementSessionAction } from '../../utils/usage-tracking';

// Provider component
interface TraumaInformedProviderProps {
  children: ReactNode;
}

export function TraumaInformedProvider({ children }: TraumaInformedProviderProps) {
  const [preferences, setPreferences] = useState<TraumaInformedPreferences>(() => {
    // Attempt secure retrieval first
    const secure = secureStorage.get<TraumaInformedPreferences>('trauma-informed-preferences', {
      encrypt: true,
    });
    if (secure) return { ...defaultPreferences, ...secure };
    // Legacy fallback from raw localStorage (one-time migration path)
    try {
      const legacy = localStorage.getItem('trauma-informed-preferences');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        // Persist into secure storage for future loads
        secureStorage.set('trauma-informed-preferences', parsed, { encrypt: true });
        return { ...defaultPreferences, ...parsed };
      }
    } catch {
      /* ignore parse errors */
    }
    return defaultPreferences;
  });

  const updatePreferences = (updates: Partial<TraumaInformedPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    secureStorage.set('trauma-informed-preferences', newPreferences, { encrypt: true });

    // Track accessibility setting changes
    Object.keys(updates).forEach(key => {
      const settingName = key as keyof TraumaInformedPreferences;
      const value = updates[settingName];
      trackAccessibilitySettingChanged(settingName, String(value));
      trackUsageEvent(`accessibility_${settingName}`, 'accessibility', { value });
    });
    incrementSessionAction();
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
