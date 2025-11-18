import React from 'react';
import type { InterventionScore } from '../../services/AdvancedAnalyticsEngine';

interface InterventionScorecardProps {
  interventions: InterventionScore[];
  className?: string;
}

/**
 * Intervention Effectiveness Scorecard
 *
 * Displays ranked interventions with effectiveness scores and recommendations.
 * Trauma-informed design with gentle language and actionable insights.
 */
export const InterventionScorecard: React.FC<InterventionScorecardProps> = ({
  interventions,
  className = '',
}) => {
  if (interventions.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Intervention Effectiveness
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start tracking your relief methods to see what works best for you!
        </p>
      </div>
    );
  }

  const getTypeIcon = (type: InterventionScore['type']) => {
    switch (type) {
      case 'medication':
        return '💊';
      case 'treatment':
        return '🩺';
      case 'coping_strategy':
        return '🧘';
      case 'lifestyle':
        return '🌱';
    }
  };

  const getTypeLabel = (type: InterventionScore['type']) => {
    switch (type) {
      case 'medication':
        return 'Medication';
      case 'treatment':
        return 'Treatment';
      case 'coping_strategy':
        return 'Coping Strategy';
      case 'lifestyle':
        return 'Lifestyle';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-blue-600 dark:text-blue-400';
    if (score >= 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 dark:bg-green-900';
    if (score >= 50) return 'bg-blue-100 dark:bg-blue-900';
    if (score >= 30) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-gray-100 dark:bg-gray-700';
  };

  const getConfidenceBadge = (confidence: InterventionScore['confidence']) => {
    const colors = {
      high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[confidence];
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Intervention Effectiveness
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your most effective relief methods ranked by performance
        </p>
      </div>

      <div className="space-y-4" role="list" aria-label="Intervention scores">
        {interventions.map((intervention, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            role="listitem"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl" role="img" aria-label={getTypeLabel(intervention.type)}>
                  {getTypeIcon(intervention.type)}
                </span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {intervention.intervention}
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getTypeLabel(intervention.type)}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getConfidenceBadge(
                        intervention.confidence
                      )}`}
                    >
                      {intervention.confidence} confidence
                    </span>
                  </div>
                </div>
              </div>

              {/* Score badge */}
              <div
                className={`flex flex-col items-center justify-center ${getScoreBgColor(
                  intervention.effectivenessScore
                )} rounded-lg px-4 py-2 min-w-[80px]`}
                aria-label={`Effectiveness score: ${intervention.effectivenessScore} out of 100`}
              >
                <span
                  className={`text-2xl font-bold ${getScoreColor(intervention.effectivenessScore)}`}
                >
                  {intervention.effectivenessScore}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">/ 100</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Times Used</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {intervention.usageCount}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg. Reduction</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {intervention.averagePainReduction > 0 ? '-' : '+'}
                  {Math.abs(intervention.averagePainReduction).toFixed(1)}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded p-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Success Rate</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {intervention.successRate}%
                </p>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong className="text-blue-700 dark:text-blue-400">Recommendation:</strong>{' '}
                {intervention.recommendation}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Educational footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <details className="text-sm">
          <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline font-medium">
            How effectiveness is calculated
          </summary>
          <div className="mt-3 space-y-2 text-gray-600 dark:text-gray-400">
            <p>
              <strong>Score (0-100):</strong> Combines pain reduction, success rate, and usage
              frequency to provide a comprehensive effectiveness rating.
            </p>
            <p>
              <strong>Confidence:</strong> Based on number of uses. More data points = higher
              confidence in the score.
            </p>
            <p>
              <strong>Note:</strong> Individual results vary. Use this data to guide conversations
              with your healthcare provider about your pain management plan.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
};
