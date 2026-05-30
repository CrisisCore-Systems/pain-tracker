import React, { useState } from 'react';
import {
  DEFAULT_WORKFLOW_PREFERENCES,
  readWorkflowPreferences,
  writeWorkflowPreferences,
  type WcbTemplateStyle,
} from '../../utils/workflowPreferences';

export default function WorkflowPreferencesPanel() {
  const [preferences, setPreferences] = useState(() =>
    typeof window === 'undefined' ? DEFAULT_WORKFLOW_PREFERENCES : readWorkflowPreferences()
  );

  const updatePreferences = (updates: Partial<typeof preferences>) => {
    const next = writeWorkflowPreferences(updates);
    setPreferences(next);
  };

  return (
    <div className="rounded-xl p-5 bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Workflow & Field Mode</h4>

      <div className="space-y-5">
        <div>
          <div className="font-medium text-gray-700 dark:text-slate-200">Default WorkSafeBC export template</div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Choose which documentation style opens by default when you export a WorkSafeBC report.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {([
              {
                value: 'standard',
                label: 'Standard clinical summary',
                description: 'Balanced presentation with the existing summary layout.',
              },
              {
                value: 'hostile-bureaucracy',
                label: 'Hostile bureaucracy',
                description: 'Monochrome, amendment-aware, audit-style print layout.',
              },
            ] as const).map(option => (
              <button
                key={option.value}
                type="button"
                aria-pressed={preferences.defaultWcbTemplateStyle === option.value}
                onClick={() =>
                  updatePreferences({ defaultWcbTemplateStyle: option.value as WcbTemplateStyle })
                }
                className={
                  preferences.defaultWcbTemplateStyle === option.value
                    ? 'rounded-lg border border-cyan-500/50 bg-cyan-50 dark:bg-cyan-500/10 px-4 py-3 text-left'
                    : 'rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-slate-700/40 px-4 py-3 text-left'
                }
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</div>
                <div className="mt-1 text-xs text-gray-600 dark:text-slate-400">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-gray-700 dark:text-slate-200">Industrial / thick-glove mode</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              Prioritize quick entry, larger controls, and a field-first start instead of landing on the dashboard.
            </div>
          </div>
          <input
            type="checkbox"
            checked={preferences.industrialFieldMode}
            onChange={e => updatePreferences({ industrialFieldMode: e.target.checked })}
            className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-white dark:focus:ring-offset-slate-900"
          />
        </label>

        <label className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-gray-700 dark:text-slate-200">Show Fibromyalgia Hub in navigation</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              Hide this top-level item if you do not want fibromyalgia-specific navigation in the main app menu.
            </div>
          </div>
          <input
            type="checkbox"
            checked={preferences.showFibromyalgiaHubNavItem}
            onChange={e => updatePreferences({ showFibromyalgiaHubNavItem: e.target.checked })}
            className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-white dark:focus:ring-offset-slate-900"
          />
        </label>

        <p className="text-sm text-gray-500 dark:text-slate-400">
          These preferences only change local workflow defaults. They do not alter stored entries unless you explicitly log new information.
        </p>
      </div>
    </div>
  );
}