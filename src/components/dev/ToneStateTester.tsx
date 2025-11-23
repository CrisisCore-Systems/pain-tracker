/**
 * @fileoverview Tone System State Testing Utility
 *
 * Use this component in development to test all 4 patient states
 * and verify adaptive copy changes throughout the app.
 *
 * Usage:
 * 1. Import and render in App.tsx (dev only)
 * 2. Click buttons to force different states
 * 3. Navigate through app to see copy adapt
 * 4. Check QuickLogStepper, PanicMode, Dashboard, Empty States
 *
 * Keyboard shortcuts:
 * - Ctrl+T: Toggle visibility
 * - Escape: Minimize panel
 * - 1-4: Force states (when visible)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTone } from '../../contexts/useTone';
import type { PatientState } from '../../types/tone';

export function ToneStateTester() {
  const isDev = import.meta.env.DEV;
  const { context, forceState, preferences, updatePreferences } = useTone();
  const [isVisible, setIsVisible] = useState(false); // Start minimized by default

  const toggleVisibility = useCallback(() => {
    setIsVisible(v => !v);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Ctrl+T to toggle
      if (e.key === 't' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggleVisibility();
      }
      // Escape to minimize
      else if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
      // Number keys 1-4 to force states (when visible and not in input)
      else if (isVisible && !isInputField && ['1', '2', '3', '4'].includes(e.key)) {
        const states: PatientState[] = ['stable', 'rising', 'flare', 'recovery'];
        const stateIndex = parseInt(e.key) - 1;
        if (states[stateIndex]) {
          forceState(states[stateIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, toggleVisibility, forceState]);

  if (!isDev) return null; // Only show in development

  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed bottom-24 right-4 z-50 px-3 py-2 bg-purple-600/90 hover:bg-purple-500 text-white text-xs rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 backdrop-blur-sm"
        aria-label="Show tone state tester (Ctrl+T)"
        title="Tone Tester (Ctrl+T)"
      >
        🎭 Tone Tester
      </button>
    );
  }

  const states: Array<{ state: PatientState; emoji: string; description: string; key: string }> = [
    { state: 'stable', emoji: '😌', description: 'Brief, upbeat, professional-warm', key: '1' },
    { state: 'rising', emoji: '😟', description: 'Steady, specific, encouraging', key: '2' },
    { state: 'flare', emoji: '😣', description: 'Short lines, imperative, slow cadence', key: '3' },
    { state: 'recovery', emoji: '🙂', description: 'Warm, factual, no cheerleading', key: '4' },
  ];

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-gray-900 dark:bg-gray-100 text-white p-4 rounded-lg shadow-2xl max-w-md max-h-[85vh] overflow-y-auto border-2 border-purple-600 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-3 sticky top-0 bg-gray-900 dark:bg-gray-100 pb-2 border-b border-gray-700 dark:border-gray-300 z-10">
        <h3 className="text-sm font-bold text-purple-400">🎭 Tone State Tester</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 dark:text-gray-500 hover:text-white text-xl leading-none px-2 py-1 rounded hover:bg-gray-800 dark:bg-gray-200 transition-colors"
          aria-label="Minimize tone state tester (Esc)"
          title="Minimize (Esc)"
        >
          ×
        </button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mb-3 p-2 bg-purple-900/30 rounded border border-purple-700/50 text-xs text-purple-300">
        <div className="font-bold mb-1">⌨️ Shortcuts:</div>
        <div className="space-y-0.5 text-purple-200">
          <div>
            <kbd className="px-1 py-0.5 bg-gray-800 dark:bg-gray-200 rounded text-xs">Ctrl+T</kbd>{' '}
            Toggle panel
          </div>
          <div>
            <kbd className="px-1 py-0.5 bg-gray-800 dark:bg-gray-200 rounded text-xs">Esc</kbd>{' '}
            Minimize
          </div>
          <div>
            <kbd className="px-1 py-0.5 bg-gray-800 dark:bg-gray-200 rounded text-xs">1-4</kbd>{' '}
            Force states
          </div>
        </div>
      </div>

      {/* Current State */}
      <div className="mb-3 p-2 bg-gray-800 dark:bg-gray-200 rounded border border-gray-700 dark:border-gray-300">
        <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">Current State:</div>
        <div className="text-sm font-mono font-bold text-purple-300">
          {context.state.toUpperCase()}
        </div>
        {context.painTrend && (
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Pain: {context.painTrend.current.toFixed(1)} (
            {context.painTrend.direction === 'up'
              ? '↑'
              : context.painTrend.direction === 'down'
                ? '↓'
                : '→'}
            )
          </div>
        )}
      </div>

      {/* State Buttons */}
      <div className="space-y-2 mb-3">
        <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">Force State:</div>
        {states.map(({ state, emoji, description, key }) => (
          <button
            key={state}
            onClick={() => forceState(state)}
            className={`w-full px-3 py-2 text-left text-xs rounded transition-all ${
              context.state === state
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="mr-2">{emoji}</span>
                <span className="font-bold">{state}</span>
              </div>
              <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-300 rounded text-xs">
                {key}
              </kbd>
            </div>
            <div className="text-xs opacity-70 mt-1">{description}</div>
          </button>
        ))}
      </div>

      {/* Preferences */}
      <div className="border-t border-gray-700 dark:border-gray-300 pt-3 space-y-2">
        <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">Preferences:</div>

        <label className="flex items-center justify-between text-xs cursor-pointer hover:bg-gray-800 dark:bg-gray-200 p-1 rounded transition-colors">
          <span>Warmth</span>
          <select
            value={preferences.warmth}
            onChange={e => updatePreferences({ warmth: Number(e.target.value) as 0 | 1 })}
            className="bg-gray-800 dark:bg-gray-200 border border-gray-700 dark:border-gray-300 rounded px-2 py-1 text-xs hover:border-purple-600 transition-colors"
          >
            <option value="0">Neutral</option>
            <option value="1">Warm</option>
          </select>
        </label>

        <label className="flex items-center justify-between text-xs cursor-pointer hover:bg-gray-800 dark:bg-gray-200 p-1 rounded transition-colors">
          <span>Coach Intensity</span>
          <select
            value={preferences.coachIntensity}
            onChange={e => updatePreferences({ coachIntensity: Number(e.target.value) as 0 | 1 })}
            className="bg-gray-800 dark:bg-gray-200 border border-gray-700 dark:border-gray-300 rounded px-2 py-1 text-xs hover:border-purple-600 transition-colors"
          >
            <option value="0">Minimal</option>
            <option value="1">Guided</option>
          </select>
        </label>

        <label className="flex items-center justify-between text-xs cursor-pointer hover:bg-gray-800 dark:bg-gray-200 p-1 rounded transition-colors">
          <span>Medical Terms</span>
          <input
            type="checkbox"
            checked={preferences.medicalTerms}
            onChange={e => updatePreferences({ medicalTerms: e.target.checked })}
            className="bg-gray-800 dark:bg-gray-200 border border-gray-700 dark:border-gray-300 rounded"
          />
        </label>

        <label className="flex items-center justify-between text-xs cursor-pointer hover:bg-gray-800 dark:bg-gray-200 p-1 rounded transition-colors">
          <span>Allow Lightness</span>
          <input
            type="checkbox"
            checked={preferences.allowLightness}
            onChange={e => updatePreferences({ allowLightness: e.target.checked })}
            className="bg-gray-800 dark:bg-gray-200 border border-gray-700 dark:border-gray-300 rounded"
          />
        </label>
      </div>

      {/* Testing Instructions */}
      <div className="border-t border-gray-700 dark:border-gray-300 pt-3 mt-3">
        <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
          <div className="font-bold mb-1">Test Areas:</div>
          <div>• QuickLogStepper: Pain slider, locations, notes</div>
          <div>• PanicMode: Greeting, breathing, crisis text</div>
          <div>• Dashboard: Empty states, insights</div>
          <div>• Analytics: Progress summaries</div>
        </div>
      </div>
    </div>
  );
}
