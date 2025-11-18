import React from 'react';
import type { CorrelationResult } from '../../services/AdvancedAnalyticsEngine';

interface CorrelationMatrixViewProps {
  correlations: CorrelationResult[];
  className?: string;
}

/**
 * Correlation Matrix Visualization
 *
 * Displays correlation analysis results in an accessible, easy-to-understand format.
 * Uses color coding and clear labels for trauma-informed presentation.
 */
export const CorrelationMatrixView: React.FC<CorrelationMatrixViewProps> = ({
  correlations,
  className = '',
}) => {
  if (correlations.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Correlation Analysis
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Not enough data yet for correlation analysis. Keep tracking to unlock insights!
        </p>
      </div>
    );
  }

  const getStrengthColor = (strength: CorrelationResult['strength']) => {
    switch (strength) {
      case 'very strong':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'strong':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'moderate':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'weak':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'very weak':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getDirectionIcon = (direction: CorrelationResult['direction']) => {
    switch (direction) {
      case 'positive':
        return '↗';
      case 'negative':
        return '↘';
      case 'none':
        return '→';
    }
  };

  const getDirectionLabel = (direction: CorrelationResult['direction']) => {
    switch (direction) {
      case 'positive':
        return 'Positive relationship';
      case 'negative':
        return 'Inverse relationship';
      case 'none':
        return 'No clear relationship';
    }
  };

  const formatCoefficient = (coef: number) => {
    return coef >= 0 ? `+${coef.toFixed(3)}` : coef.toFixed(3);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Correlation Analysis
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Understanding relationships between your pain and various factors
        </p>
      </div>

      <div className="space-y-4" role="list" aria-label="Correlation results">
        {correlations.map((correlation, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            role="listitem"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {correlation.variable1} vs. {correlation.variable2}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getDirectionLabel(correlation.direction)}
                </p>
              </div>
              <div
                className="text-3xl ml-4"
                aria-label={`Direction: ${getDirectionLabel(correlation.direction)}`}
              >
                {getDirectionIcon(correlation.direction)}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Coefficient</p>
                <p
                  className="font-mono text-sm font-semibold text-gray-900 dark:text-white"
                  aria-label={`Correlation coefficient: ${formatCoefficient(correlation.coefficient)}`}
                >
                  {formatCoefficient(correlation.coefficient)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Strength</p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStrengthColor(
                    correlation.strength
                  )}`}
                  aria-label={`Strength: ${correlation.strength}`}
                >
                  {correlation.strength}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sample Size</p>
                <p
                  className="text-sm font-medium text-gray-900 dark:text-white"
                  aria-label={`Based on ${correlation.sampleSize} data points`}
                >
                  n = {correlation.sampleSize}
                </p>
              </div>
            </div>

            {/* Interpretation help */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {correlation.direction === 'positive' &&
                  `These factors tend to increase together. Higher ${correlation.variable2} is associated with higher ${correlation.variable1}.`}
                {correlation.direction === 'negative' &&
                  `These factors move in opposite directions. Higher ${correlation.variable2} is associated with lower ${correlation.variable1}.`}
                {correlation.direction === 'none' &&
                  `No clear pattern found between these factors in your data.`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Educational footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <details className="text-sm">
          <summary className="cursor-pointer text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Understanding correlation analysis
          </summary>
          <div className="mt-3 space-y-2 text-gray-600 dark:text-gray-400">
            <p>
              <strong>Coefficient:</strong> Ranges from -1 to +1. Values closer to +1 or -1 indicate
              stronger relationships.
            </p>
            <p>
              <strong>Direction:</strong> Positive means factors increase together. Negative means
              one increases as the other decreases.
            </p>
            <p>
              <strong>Important:</strong> Correlation does not prove causation. These patterns help
              identify potential relationships worth discussing with your healthcare provider.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
};
