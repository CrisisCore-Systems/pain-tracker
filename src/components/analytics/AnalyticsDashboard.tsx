import React, { useEffect, useState } from 'react';
import { AdvancedAnalyticsEngine } from '../../services/AdvancedAnalyticsEngine';
import { CorrelationMatrixView } from './CorrelationMatrixView';
import { InterventionScorecard } from './InterventionScorecard';
import { TriggerPatternTimeline } from './TriggerPatternTimeline';
import { PredictiveIndicatorPanel } from './PredictiveIndicatorPanel';
import { WeeklyClinicalBriefCard } from './WeeklyClinicalBriefCard';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import type {
  CorrelationResult,
  InterventionScore,
  TriggerPattern,
  PredictiveIndicator,
  WeeklyClinicalBrief,
} from '../../services/AdvancedAnalyticsEngine';

interface AnalyticsDashboardProps {
  className?: string;
}

/**
 * Advanced Analytics Dashboard
 * 
 * Main container for all analytics visualizations.
 * Orchestrates data processing and component rendering.
 */
export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
}) => {
  const { entries, moodEntries } = usePainTrackerStore();
  const [analytics, setAnalytics] = useState<{
    correlations: CorrelationResult[];
    interventions: InterventionScore[];
    triggers: TriggerPattern[];
    indicators: PredictiveIndicator[];
    brief: WeeklyClinicalBrief | null;
    loading: boolean;
    error: string | null;
  }>({
    correlations: [],
    interventions: [],
    triggers: [],
    indicators: [],
    brief: null,
    loading: true,
    error: null,
  });

  const [activeTab, setActiveTab] = useState<
    'overview' | 'correlations' | 'interventions' | 'triggers' | 'predictive'
  >('overview');

  useEffect(() => {
    const processAnalytics = async () => {
      try {
        setAnalytics((prev) => ({ ...prev, loading: true, error: null }));

        if (entries.length === 0) {
          setAnalytics({
            correlations: [],
            interventions: [],
            triggers: [],
            indicators: [],
            brief: null,
            loading: false,
            error: null,
          });
          return;
        }

        const engine = new AdvancedAnalyticsEngine();

        // Run analytics (simulated async for UI responsiveness)
        await new Promise((resolve) => setTimeout(resolve, 100));

        const correlations = engine.calculateCorrelationMatrix(entries, moodEntries);
        const interventions = engine.scoreInterventions(entries);
        const triggers = engine.detectTriggerPatterns(entries);
        const indicators = engine.identifyPredictiveIndicators(entries);
        const brief = engine.generateWeeklyClinicalBrief(entries, moodEntries);

        setAnalytics({
          correlations,
          interventions,
          triggers,
          indicators,
          brief,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Analytics processing error:', error);
        setAnalytics((prev) => ({
          ...prev,
          loading: false,
          error: 'Failed to process analytics. Please try again.',
        }));
      }
    };

    processAnalytics();
  }, [entries, moodEntries]);

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📊' },
    { id: 'correlations' as const, label: 'Correlations', icon: '🔗' },
    { id: 'interventions' as const, label: 'Interventions', icon: '💊' },
    { id: 'triggers' as const, label: 'Triggers', icon: '⚠️' },
    { id: 'predictive' as const, label: 'Predictive', icon: '🔮' },
  ];

  if (analytics.loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 ${className}`}>
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Processing analytics...</p>
        </div>
      </div>
    );
  }

  if (analytics.error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">{analytics.error}</p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 ${className}`}>
        <div className="text-center">
          <span className="text-6xl mb-4 block">📊</span>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            No Data Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start tracking your pain to unlock powerful analytics and insights!
          </p>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            onClick={() => {
              // TODO: Navigate to pain entry form
              alert('Navigate to pain entry form');
            }}
          >
            Create First Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow-md">
        <nav
          className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto"
          role="tablist"
          aria-label="Analytics sections"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="mt-6 space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div
            role="tabpanel"
            id="overview-panel"
            aria-labelledby="overview-tab"
            className="space-y-6"
          >
            {analytics.brief && <WeeklyClinicalBriefCard brief={analytics.brief} />}

            {analytics.indicators.length > 0 && (
              <PredictiveIndicatorPanel indicators={analytics.indicators} />
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {analytics.interventions.length > 0 && (
                <InterventionScorecard interventions={analytics.interventions.slice(0, 5)} />
              )}
              {analytics.triggers.length > 0 && (
                <TriggerPatternTimeline patterns={analytics.triggers.slice(0, 5)} />
              )}
            </div>
          </div>
        )}

        {/* Correlations Tab */}
        {activeTab === 'correlations' && (
          <div role="tabpanel" id="correlations-panel" aria-labelledby="correlations-tab">
            <CorrelationMatrixView correlations={analytics.correlations} />
          </div>
        )}

        {/* Interventions Tab */}
        {activeTab === 'interventions' && (
          <div role="tabpanel" id="interventions-panel" aria-labelledby="interventions-tab">
            <InterventionScorecard interventions={analytics.interventions} />
          </div>
        )}

        {/* Triggers Tab */}
        {activeTab === 'triggers' && (
          <div role="tabpanel" id="triggers-panel" aria-labelledby="triggers-tab">
            <TriggerPatternTimeline patterns={analytics.triggers} />
          </div>
        )}

        {/* Predictive Tab */}
        {activeTab === 'predictive' && (
          <div role="tabpanel" id="predictive-panel" aria-labelledby="predictive-tab">
            <PredictiveIndicatorPanel indicators={analytics.indicators} />
          </div>
        )}
      </div>

      {/* Data Summary Footer */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Analytics based on <strong>{entries.length}</strong> pain entries
          {moodEntries && moodEntries.length > 0 && (
            <> and <strong>{moodEntries.length}</strong> mood entries</>
          )}
          . Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};
