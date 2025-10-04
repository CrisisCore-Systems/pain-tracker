import React from 'react';
import type { WeeklyClinicalBrief } from '../../services/AdvancedAnalyticsEngine';

interface WeeklyClinicalBriefCardProps {
  brief: WeeklyClinicalBrief;
  className?: string;
}

/**
 * Weekly Clinical Brief Display
 * 
 * Professional-grade weekly summary optimized for clinical review.
 * Clean, printable design with actionable insights.
 */
export const WeeklyClinicalBriefCard: React.FC<WeeklyClinicalBriefCardProps> = ({
  brief,
  className = '',
}) => {
  const getTrendIcon = (trend: WeeklyClinicalBrief['overallTrend']): string => {
    switch (trend) {
      case 'improving':
        return '📉';
      case 'stable':
        return '➡️';
      case 'worsening':
        return '📈';
    }
  };

  const getTrendColor = (trend: WeeklyClinicalBrief['overallTrend']): string => {
    switch (trend) {
      case 'improving':
        return 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'stable':
        return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'worsening':
        return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
  };

  const getTrendLabel = (trend: WeeklyClinicalBrief['overallTrend']): string => {
    switch (trend) {
      case 'improving':
        return 'Improving';
      case 'stable':
        return 'Stable';
      case 'worsening':
        return 'Worsening';
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const changeDirection = brief.painLevelChange > 0 ? '↑' : brief.painLevelChange < 0 ? '↓' : '→';
  const changeColor =
    brief.painLevelChange > 0
      ? 'text-red-600 dark:text-red-400'
      : brief.painLevelChange < 0
      ? 'text-green-600 dark:text-green-400'
      : 'text-gray-600 dark:text-gray-400';

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}
      role="article"
      aria-label="Weekly clinical brief"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-xl font-bold mb-1">Weekly Clinical Brief</h3>
            <p className="text-blue-100 text-sm">
              {formatDate(brief.weekStartDate)} – {formatDate(brief.weekEndDate)}
            </p>
          </div>
          <span className="text-3xl" aria-hidden="true">
            {getTrendIcon(brief.overallTrend)}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Trend Summary */}
        <div className={`border rounded-lg p-4 ${getTrendColor(brief.overallTrend)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-75 mb-1">Overall Trend</p>
              <p className="text-2xl font-bold">{getTrendLabel(brief.overallTrend)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium opacity-75 mb-1">Avg Pain Level</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">{brief.avgPainLevel}</p>
                <span className="text-sm">/10</span>
              </div>
              <p className={`text-sm font-medium ${changeColor}`}>
                {changeDirection} {Math.abs(brief.painLevelChange).toFixed(1)} from last week
              </p>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <section>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
            Key Insights
          </h4>
          <ul className="space-y-2">
            {brief.keyInsights.map((insight, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Top Triggers */}
        {brief.topTriggers.length > 0 && (
          <section>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
              Top Triggers This Week
            </h4>
            <div className="flex flex-wrap gap-2">
              {brief.topTriggers.map((trigger, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-full text-sm font-medium"
                >
                  ⚠️ {trigger}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Effective Interventions */}
        {brief.effectiveInterventions.length > 0 && (
          <section>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
              Effective Interventions
            </h4>
            <div className="flex flex-wrap gap-2">
              {brief.effectiveInterventions.map((intervention, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full text-sm font-medium"
                >
                  ✓ {intervention}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Concerns */}
        {brief.concerns.length > 0 && (
          <section>
            <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span>⚠️</span> Clinical Concerns
            </h4>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <ul className="space-y-2">
                {brief.concerns.map((concern, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-red-800 dark:text-red-300"
                  >
                    <span className="mt-0.5">•</span>
                    <span>{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Recommendations */}
        <section>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-2">
            <span>💡</span> Recommendations
          </h4>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <ol className="space-y-2 list-decimal list-inside">
              {brief.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="text-sm text-blue-800 dark:text-blue-300"
                >
                  {rec}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3 flex items-center gap-2">
            <span>📋</span> Next Steps
          </h4>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <ul className="space-y-2">
              {brief.nextSteps.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-purple-800 dark:text-purple-300"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                    aria-label={`Action item: ${step}`}
                  />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            onClick={() => window.print()}
            aria-label="Print clinical brief"
          >
            🖨️ Print Brief
          </button>
          <button
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
            onClick={() => {
              // Trigger PDF export from parent component
              const event = new CustomEvent('exportClinicalPDF', { 
                detail: { weeklyBrief: brief } 
              });
              window.dispatchEvent(event);
            }}
            aria-label="Export to PDF"
          >
            📄 Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};
