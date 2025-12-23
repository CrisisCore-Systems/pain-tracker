import React from 'react';
import { FibroScoringGuide } from './FibroScoringGuide';
import { LearnAboutFibroHub } from './LearnAboutFibroHub';
import { FibroSupportTips } from './FibroSupportTips';
// Analytics and diagnostic logic imports

import { computeFibroDiagnosticHistory } from '../../utils/pain-tracker/fibroDiagnostic';
import { computeFibroAnalytics } from '../../utils/pain-tracker/fibroAnalytics';





export function FibromyalgiaHub() {
  const fibroEntries = usePainTrackerStore(state => state.fibromyalgiaEntries);
  const { latest, history } = computeFibroDiagnosticHistory(fibroEntries);
  const analytics = computeFibroAnalytics(fibroEntries);

  return (
    <main className="max-w-3xl mx-auto py-8 px-2">
      <h1 className="text-3xl font-bold mb-6">Fibromyalgia Hub</h1>
      <FibroScoringGuide />
      <section className="mt-8 mb-8">
        <h2 className="text-xl font-semibold mb-2">Your Diagnostic Status</h2>
        {latest ? (
          <div className="p-4 rounded bg-blue-50 dark:bg-blue-900/30 mb-2">
            <div className="text-sm">
              <strong>Most recent:</strong> WPI {latest.wpi}, SSS {latest.sss} —{' '}
              {latest.meetsCriteria ? (
                <span className="text-green-600 font-semibold">Meets criteria for fibromyalgia</span>
              ) : (
                <span className="text-red-600 font-semibold">Does not meet criteria</span>
              )}
              <span className="ml-2 text-xs text-muted-foreground">({new Date(latest.date).toLocaleDateString()})</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No entries yet. Track your symptoms to see your status.</div>
        )}
        {history.length > 1 && (
          <div className="mt-2 text-xs text-muted-foreground">
            <strong>History:</strong> {history.map(h => `WPI ${h.wpi}, SSS ${h.sss} (${h.meetsCriteria ? '✔' : '✗'})`).join(' → ')}
          </div>
        )}
      </section>
      <section className="mt-8 mb-8">
        <h2 className="text-xl font-semibold mb-2">Fibromyalgia Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded bg-slate-50 dark:bg-slate-800/50">
            <div className="font-medium mb-1">Most Affected Regions</div>
            <ul className="text-xs">
              {analytics.mostAffectedRegions.length ? analytics.mostAffectedRegions.map(r => (
                <li key={r.region}>{r.region}: {r.frequency} ({r.percentage.toFixed(1)}%)</li>
              )) : <li>No data</li>}
            </ul>
          </div>
          <div className="p-4 rounded bg-slate-50 dark:bg-slate-800/50">
            <div className="font-medium mb-1">Common Triggers</div>
            <ul className="text-xs">
              {analytics.commonTriggers.length ? analytics.commonTriggers.map(t => (
                <li key={t.trigger}>{t.trigger}: {t.frequency}</li>
              )) : <li>No data</li>}
            </ul>
          </div>
          <div className="p-4 rounded bg-slate-50 dark:bg-slate-800/50">
            <div className="font-medium mb-1">Symptom Trends</div>
            <ul className="text-xs">
              <li>Fatigue: {analytics.symptomTrends.fatigue.current} ({analytics.symptomTrends.fatigue.trend})</li>
              <li>Cognition: {analytics.symptomTrends.cognition.current} ({analytics.symptomTrends.cognition.trend})</li>
              <li>Sleep: {analytics.symptomTrends.sleep.current} ({analytics.symptomTrends.sleep.trend})</li>
            </ul>
          </div>
          <div className="p-4 rounded bg-slate-50 dark:bg-slate-800/50">
            <div className="font-medium mb-1">Flare Patterns</div>
            <ul className="text-xs">
              <li>Flare Frequency: {analytics.flareFrequency.toFixed(1)} / month</li>
              <li>Average Flare Duration: {analytics.averageFlareDuration} days</li>
              <li>Flare Intensity: {analytics.flareIntensity}</li>
            </ul>
          </div>
        </div>
      </section>
      <LearnAboutFibroHub />
      <FibroSupportTips />
    </main>
  );
}
