/**
 * Return Incentive Widget
 * 
 * Displays pending insights and progress toward unlocking new features.
 * Creates curiosity loops and encourages return visits.
 */

import React, { useEffect, useState } from 'react';
import { retentionLoopService } from '@pain-tracker/services';
import type { PendingInsight } from '@pain-tracker/services';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { Lock, TrendingUp, Calendar, Sparkles } from 'lucide-react';

interface ReturnIncentiveWidgetProps {
  entries: any[];
  className?: string;
}

export const ReturnIncentiveWidget: React.FC<ReturnIncentiveWidgetProps> = ({
  entries,
  className = '',
}) => {
  const [pendingInsights, setPendingInsights] = useState<PendingInsight[]>([]);

  useEffect(() => {
    const insights = retentionLoopService.getPendingInsights(entries);
    setPendingInsights(insights);
  }, [entries]);

  if (pendingInsights.length === 0) {
    return null;
  }

  const getIcon = (type: PendingInsight['type']) => {
    switch (type) {
      case 'correlation':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'milestone':
        return <Calendar className="w-5 h-5 text-green-600" />;
      case 'pattern':
        return <Sparkles className="w-5 h-5 text-yellow-600" />;
      default:
        return <Lock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getProgressPercentage = (insight: PendingInsight) => {
    return Math.min((insight.currentEntries / insight.requiredEntries) * 100, 100);
  };

  return (
    <Card className={`bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Unlock New Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Keep tracking to unlock deeper insights about your patterns
        </p>
        <div className="space-y-4">
          {pendingInsights.map((insight) => (
            <div key={insight.id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-2">
                {getIcon(insight.type)}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>
                    {insight.currentEntries} of {insight.requiredEntries} entries
                  </span>
                  <span>{Math.round(getProgressPercentage(insight))}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 transition-all duration-300 rounded-full"
                    style={{ width: `${getProgressPercentage(insight)}%` }}
                  />
                </div>
                <p className="text-xs text-purple-600 font-medium mt-2">
                  {insight.unlockMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
