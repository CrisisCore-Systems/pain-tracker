import React from 'react';
import type { PredictiveIndicator } from '../../services/AdvancedAnalyticsEngine';

interface PredictiveIndicatorPanelProps {
  indicators: PredictiveIndicator[];
  className?: string;
}

/**
 * Predictive Indicator Alert Panel
 * 
 * Displays early warning indicators and pattern-based predictions.
 * Trauma-informed design with clear, non-alarming language.
 */
export const PredictiveIndicatorPanel: React.FC<PredictiveIndicatorPanelProps> = ({
  indicators,
  className = '',
}) => {
  if (indicators.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Predictive Indicators
        </h3>
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <span className="text-2xl">✓</span>
          <div>
            <p className="font-medium text-green-800 dark:text-green-300 mb-1">
              No Warning Indicators
            </p>
            <p className="text-sm text-green-700 dark:text-green-400">
              Your current data shows no concerning patterns. Continue your tracking
              routine!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: PredictiveIndicator['type']): string => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'onset':
        return '🔔';
      case 'escalation':
        return '📈';
    }
  };

  const getTypeLabel = (type: PredictiveIndicator['type']): string => {
    switch (type) {
      case 'warning':
        return 'Warning';
      case 'onset':
        return 'Onset Indicator';
      case 'escalation':
        return 'Escalation Alert';
    }
  };

  const getTypeColor = (type: PredictiveIndicator['type']): string => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'onset':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'escalation':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
  };

  const getTypeBadgeColor = (type: PredictiveIndicator['type']): string => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'onset':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'escalation':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
  };

  const getConfidenceWidth = (confidence: number): string => {
    return `${confidence * 100}%`;
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'bg-green-500 dark:bg-green-600';
    if (confidence >= 0.6) return 'bg-blue-500 dark:bg-blue-600';
    if (confidence >= 0.4) return 'bg-yellow-500 dark:bg-yellow-600';
    return 'bg-gray-400 dark:bg-gray-500';
  };

  // Group by type
  const escalationIndicators = indicators.filter((i) => i.type === 'escalation');
  const warningIndicators = indicators.filter((i) => i.type === 'warning');
  const onsetIndicators = indicators.filter((i) => i.type === 'onset');

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          Predictive Indicators
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Early warning patterns detected in your pain data
        </p>
      </div>

      <div className="space-y-4" role="list" aria-label="Predictive indicators">
        {/* Escalation Alerts (Highest Priority) */}
        {escalationIndicators.map((indicator, index) => (
          <div
            key={`escalation-${index}`}
            className={`border rounded-lg p-4 ${getTypeColor(indicator.type)}`}
            role="listitem"
            aria-label={`${getTypeLabel(indicator.type)}: ${indicator.indicator}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0" aria-hidden="true">
                {getTypeIcon(indicator.type)}
              </span>
              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {indicator.indicator}
                  </h4>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getTypeBadgeColor(
                      indicator.type
                    )}`}
                  >
                    {getTypeLabel(indicator.type)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {indicator.description}
                </p>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Lead Time
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {indicator.leadTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Confidence Level
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${getConfidenceColor(
                            indicator.confidence
                          )} transition-all duration-300`}
                          style={{ width: getConfidenceWidth(indicator.confidence) }}
                          role="progressbar"
                          aria-valuenow={indicator.confidence * 100}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(indicator.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Warning Indicators */}
        {warningIndicators.map((indicator, index) => (
          <div
            key={`warning-${index}`}
            className={`border rounded-lg p-4 ${getTypeColor(indicator.type)}`}
            role="listitem"
            aria-label={`${getTypeLabel(indicator.type)}: ${indicator.indicator}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0" aria-hidden="true">
                {getTypeIcon(indicator.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {indicator.indicator}
                  </h4>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getTypeBadgeColor(
                      indicator.type
                    )}`}
                  >
                    {getTypeLabel(indicator.type)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {indicator.description}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Lead Time
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {indicator.leadTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Confidence
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${getConfidenceColor(
                            indicator.confidence
                          )}`}
                          style={{ width: getConfidenceWidth(indicator.confidence) }}
                          role="progressbar"
                          aria-valuenow={indicator.confidence * 100}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(indicator.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Onset Indicators */}
        {onsetIndicators.map((indicator, index) => (
          <div
            key={`onset-${index}`}
            className={`border rounded-lg p-4 ${getTypeColor(indicator.type)}`}
            role="listitem"
            aria-label={`${getTypeLabel(indicator.type)}: ${indicator.indicator}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0" aria-hidden="true">
                {getTypeIcon(indicator.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {indicator.indicator}
                  </h4>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getTypeBadgeColor(
                      indicator.type
                    )}`}
                  >
                    {getTypeLabel(indicator.type)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {indicator.description}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Lead Time
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {indicator.leadTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Confidence
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${getConfidenceColor(
                            indicator.confidence
                          )}`}
                          style={{ width: getConfidenceWidth(indicator.confidence) }}
                          role="progressbar"
                          aria-valuenow={indicator.confidence * 100}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(indicator.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actionable guidance */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
          <span>💡</span> What to do with these insights
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 ml-6 list-disc">
          <li>Share these patterns with your healthcare provider</li>
          <li>Prepare preventive strategies for predictable patterns</li>
          <li>Keep rescue medications/interventions accessible</li>
          <li>Document what happens after each indicator appears</li>
        </ul>
      </div>
    </div>
  );
};
