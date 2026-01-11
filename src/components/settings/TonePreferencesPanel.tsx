import React from 'react';
import { useTone, useAdaptiveCopy } from '../../contexts/useTone';
import { settingsCopy } from '../../content/microcopy';

export default function TonePreferencesPanel() {
  const { preferences, updatePreferences } = useTone();

  const warmthLabel = useAdaptiveCopy(settingsCopy.toneWarmthLabel);
  const coachLabel = useAdaptiveCopy(settingsCopy.coachIntensityLabel);
  const lightnessLabel = useAdaptiveCopy(settingsCopy.lightnessLabel);
  const lightnessHint = useAdaptiveCopy(settingsCopy.lightnessHint);
  const medicalLabel = useAdaptiveCopy(settingsCopy.medicalTermsLabel);
  const medicalHint = useAdaptiveCopy(settingsCopy.medicalTermsHint);

  return (
    <div className="rounded-xl p-5 bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Tone & Communication</h4>

      <div className="space-y-4">
        <div>
          <div className="font-medium text-gray-700 dark:text-slate-200">{warmthLabel}</div>
          <div className="mt-2">
            <select
              value={String(preferences.warmth)}
              onChange={e => updatePreferences({ warmth: Number(e.target.value) as 0 | 1 })}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all bg-gray-100 dark:bg-slate-700/80 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-slate-200"
              aria-label={warmthLabel}
            >
              <option value="0">{settingsCopy.toneWarmthOptions.neutral}</option>
              <option value="1">{settingsCopy.toneWarmthOptions.warm}</option>
            </select>
          </div>
        </div>

        <div>
          <div className="font-medium text-gray-700 dark:text-slate-200">{coachLabel}</div>
          <div className="mt-2">
            <select
              value={String(preferences.coachIntensity)}
              onChange={e => updatePreferences({ coachIntensity: Number(e.target.value) as 0 | 1 })}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all bg-gray-100 dark:bg-slate-700/80 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-slate-200"
              aria-label={coachLabel}
            >
              <option value="0">{settingsCopy.coachIntensityOptions.minimal}</option>
              <option value="1">{settingsCopy.coachIntensityOptions.guided}</option>
            </select>
          </div>
        </div>

        <label className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-gray-700 dark:text-slate-200">{medicalLabel}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">{medicalHint}</div>
          </div>
          <input
            type="checkbox"
            checked={preferences.medicalTerms}
            onChange={e => updatePreferences({ medicalTerms: e.target.checked })}
            className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-white dark:focus:ring-offset-slate-900"
          />
        </label>

        <label className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-gray-700 dark:text-slate-200">{lightnessLabel}</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">{lightnessHint}</div>
          </div>
          <input
            type="checkbox"
            checked={preferences.allowLightness}
            onChange={e => updatePreferences({ allowLightness: e.target.checked })}
            className="h-5 w-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-white dark:focus:ring-offset-slate-900"
          />
        </label>

        <p className="text-sm text-gray-500 dark:text-slate-400">
          This only changes wording and guidance style in the UI. It does not change what is recorded in your logs.
        </p>
      </div>
    </div>
  );
}
