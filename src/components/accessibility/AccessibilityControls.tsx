import React from 'react';
import { useTheme } from '../../design-system';

export const AccessibilityControls: React.FC = () => {
  const { mode, setMode, isHighContrast, hasReducedMotion } = useTheme();

  const handleThemeChange = (newMode: 'light' | 'dark' | 'high-contrast') => {
    setMode(newMode);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border" role="group" aria-labelledby="accessibility-controls">
      <h3 id="accessibility-controls" className="font-semibold mb-4 flex items-center gap-2">
        <span role="img" aria-label="accessibility">♿</span>
        Accessibility Settings
      </h3>
      
      <div className="space-y-4">
        {/* Theme Selection */}
        <div>
          <fieldset>
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Visual Theme
            </legend>
            <div className="space-y-2">
              {[
                { value: 'light' as const, label: 'Light Theme', icon: '☀️' },
                { value: 'dark' as const, label: 'Dark Theme', icon: '🌙' },
                { value: 'high-contrast' as const, label: 'High Contrast', icon: '⚫' }
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={option.value}
                    checked={mode === option.value}
                    onChange={() => handleThemeChange(option.value)}
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                  <span role="img" aria-hidden="true">{option.icon}</span>
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Accessibility Status Indicators */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            System Accessibility Settings
          </h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isHighContrast ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span>High Contrast: {isHighContrast ? 'Enabled' : 'Disabled'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${hasReducedMotion ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span>Reduced Motion: {hasReducedMotion ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="pt-4 border-t border-gray-200">
          <details className="text-sm">
            <summary className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Keyboard Navigation Tips
            </summary>
            <div className="mt-2 space-y-1 text-gray-600 dark:text-gray-400">
              <div>• Tab: Navigate between elements</div>
              <div>• Space/Enter: Activate buttons and links</div>
              <div>• Arrow keys: Navigate within components</div>
              <div>• Escape: Close dialogs and menus</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};
