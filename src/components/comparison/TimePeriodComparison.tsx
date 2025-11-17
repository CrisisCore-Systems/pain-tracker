import React, { useState, useEffect } from 'react';
import { formatNumber } from '../../utils/formatting';
import type { PainEntry } from '../../types';
import type {
  TimePeriodComparison,
  ComparisonDataset,
  ComparisonResult,
} from '../../types/comparison';
import { DataComparisonEngine } from '../../utils/comparison/engine';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Badge } from '../../design-system/components/Badge';
import { Calendar, TrendingUp, BarChart3, Activity, RefreshCw } from 'lucide-react';
import { PlannedFeatureNotice } from '../common/PlannedFeatureNotice';

interface TimePeriodComparisonProps {
  entries: PainEntry[];
  onComparisonComplete?: (result: ComparisonResult) => void;
  className?: string;
}

export const TimePeriodComparisonComponent: React.FC<TimePeriodComparisonProps> = ({
  entries,
  onComparisonComplete,
  className = '',
}) => {
  const [comparisonType, setComparisonType] = useState<
    'day-to-day' | 'week-to-week' | 'month-to-month' | 'custom-range'
  >('week-to-week');
  const [baselineStart, setBaselineStart] = useState('');
  const [baselineEnd, setBaselineEnd] = useState('');
  const [comparisonStart, setComparisonStart] = useState('');
  const [comparisonEnd, setComparisonEnd] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  // Get insights from result for easier access
  const insights = result?.insights || [];

  // Set default date ranges based on comparison type
  useEffect(() => {
    const now = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (comparisonType) {
      case 'day-to-day': {
        // Yesterday vs Today
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const dayBeforeYesterday = new Date(yesterday);
        dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

        setBaselineStart(formatDate(dayBeforeYesterday));
        setBaselineEnd(formatDate(yesterday));
        setComparisonStart(formatDate(yesterday));
        setComparisonEnd(formatDate(now));
        break;
      }

      case 'week-to-week': {
        // Last week vs This week
        const lastWeekStart = new Date(now);
        lastWeekStart.setDate(lastWeekStart.getDate() - 14);
        const lastWeekEnd = new Date(now);
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(thisWeekStart.getDate() - 7);

        setBaselineStart(formatDate(lastWeekStart));
        setBaselineEnd(formatDate(lastWeekEnd));
        setComparisonStart(formatDate(thisWeekStart));
        setComparisonEnd(formatDate(now));
        break;
      }

      case 'month-to-month': {
        // Last month vs This month
        const lastMonthStart = new Date(now);
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 2);
        lastMonthStart.setDate(1);
        const lastMonthEnd = new Date(now);
        lastMonthEnd.setMonth(lastMonthEnd.getMonth() - 1);
        lastMonthEnd.setDate(0);
        const thisMonthStart = new Date(now);
        thisMonthStart.setMonth(thisMonthStart.getMonth() - 1);
        thisMonthStart.setDate(1);

        setBaselineStart(formatDate(lastMonthStart));
        setBaselineEnd(formatDate(lastMonthEnd));
        setComparisonStart(formatDate(thisMonthStart));
        setComparisonEnd(formatDate(now));
        break;
      }

      case 'custom-range': {
        // Last 30 days vs Previous 30 days
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date(now);
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        setBaselineStart(formatDate(sixtyDaysAgo));
        setBaselineEnd(formatDate(thirtyDaysAgo));
        setComparisonStart(formatDate(thirtyDaysAgo));
        setComparisonEnd(formatDate(now));
        break;
      }
    }
  }, [comparisonType]);

  const handleCompare = async () => {
    if (!baselineStart || !baselineEnd || !comparisonStart || !comparisonEnd) {
      return;
    }

    setIsLoading(true);
    try {
      // Filter entries for each period
      const baselineEntries = entries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= new Date(baselineStart) && entryDate <= new Date(baselineEnd);
      });

      const comparisonEntries = entries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= new Date(comparisonStart) && entryDate <= new Date(comparisonEnd);
      });

      if (baselineEntries.length === 0 || comparisonEntries.length === 0) {
        alert('Not enough data for the selected time periods. Please adjust the date ranges.');
        return;
      }

      // Create datasets
      const datasets: ComparisonDataset[] = [
        {
          id: 'baseline',
          name: 'Baseline Period',
          description: `${baselineStart} to ${baselineEnd}`,
          entries: baselineEntries,
          color: '#3B82F6', // Blue
          metadata: {
            source: 'time-period-comparison',
            dateRange: {
              start: new Date(baselineStart),
              end: new Date(baselineEnd),
            },
          },
        },
        {
          id: 'comparison',
          name: 'Comparison Period',
          description: `${comparisonStart} to ${comparisonEnd}`,
          entries: comparisonEntries,
          color: '#EF4444', // Red
          metadata: {
            source: 'time-period-comparison',
            dateRange: {
              start: new Date(comparisonStart),
              end: new Date(comparisonEnd),
            },
          },
        },
      ];

      // Create comparison config
      const config: TimePeriodComparison = {
        type: 'time-period',
        periodType: comparisonType,
        baselinePeriod: {
          start: new Date(baselineStart),
          end: new Date(baselineEnd),
        },
        comparisonPeriod: {
          start: new Date(comparisonStart),
          end: new Date(comparisonEnd),
        },
        datasets,
      };

      // Run comparison
      const comparisonResult = await DataComparisonEngine.compareDatasets(config, datasets);
      setResult(comparisonResult);

      if (onComparisonComplete) {
        onComparisonComplete(comparisonResult);
      }
    } catch (error) {
      console.error('Comparison failed:', error);
      alert('Failed to perform comparison. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderComparisonForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Time Period Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comparison Type Selection */}
        <div>
          <label htmlFor="comparison-type" className="text-sm font-medium">
            Comparison Type
          </label>
          <select
            id="comparison-type"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={comparisonType}
            onChange={e => setComparisonType(e.target.value as typeof comparisonType)}
          >
            <option value="day-to-day">Day-to-Day (Yesterday vs Today)</option>
            <option value="week-to-week">Week-to-Week (Last Week vs This Week)</option>
            <option value="month-to-month">Month-to-Month (Last Month vs This Month)</option>
            <option value="custom-range">Custom Date Range</option>
          </select>
        </div>

        {/* Date Range Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Baseline Period */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Baseline Period
            </h3>
            <div className="space-y-2">
              <div>
                <label htmlFor="baseline-start" className="text-sm font-medium">
                  Start Date
                </label>
                <Input
                  id="baseline-start"
                  type="date"
                  value={baselineStart}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setBaselineStart(e.target.value)
                  }
                />
              </div>
              <div>
                <label htmlFor="baseline-end" className="text-sm font-medium">
                  End Date
                </label>
                <Input
                  id="baseline-end"
                  type="date"
                  value={baselineEnd}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setBaselineEnd(e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Comparison Period */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Comparison Period
            </h3>
            <div className="space-y-2">
              <div>
                <label htmlFor="comparison-start" className="text-sm font-medium">
                  Start Date
                </label>
                <Input
                  id="comparison-start"
                  type="date"
                  value={comparisonStart}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setComparisonStart(e.target.value)
                  }
                />
              </div>
              <div>
                <label htmlFor="comparison-end" className="text-sm font-medium">
                  End Date
                </label>
                <Input
                  id="comparison-end"
                  type="date"
                  value={comparisonEnd}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setComparisonEnd(e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button onClick={handleCompare} disabled={isLoading} className="min-w-32">
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Comparing...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Compare Periods
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderComparisonResults = () => {
    if (!result) return null;

    const { statistics } = result;

    return (
      <div className="space-y-6">
        {/* Overview Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Comparison Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(statistics.overall.baselineMean, 1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Baseline Avg</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(statistics.overall.comparisonMean, 1)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Comparison Avg</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    statistics.overall.percentageChange < 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {statistics.overall.percentageChange > 0 ? '+' : ''}
                  {formatNumber(statistics.overall.percentageChange, 1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Change</div>
              </div>
            </div>

            {/* Statistical Significance */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Statistical Significance</span>
                <Badge
                  variant={
                    statistics.overall.statisticalSignificance < 0.05 ? 'default' : 'secondary'
                  }
                >
                  {statistics.overall.statisticalSignificance < 0.05
                    ? 'Significant'
                    : 'Not Significant'}
                </Badge>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                p-value: {formatNumber(statistics.overall.statisticalSignificance, 3)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        {insights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.map(insight => (
                  <div key={insight.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {insight.description}
                        </p>
                        {insight.recommendation && (
                          <p className="text-sm text-blue-600 mt-2 font-medium">
                            💡 {insight.recommendation}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline" className="text-xs">
                          {Math.round(insight.confidence)}% confidence
                        </Badge>
                        <Badge
                          variant={
                            insight.severity === 'high'
                              ? 'destructive'
                              : insight.severity === 'medium'
                                ? 'default'
                                : 'secondary'
                          }
                          className="text-xs"
                        >
                          {insight.severity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Visual Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Charts will be displayed here</p>
              <PlannedFeatureNotice feature="visualComparison" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      <div className="w-full">
        <div className="grid w-full grid-cols-2 gap-2 border-b">
          <button
            className={`py-2 text-sm font-medium ${!result ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            aria-selected={!result}
          >
            Setup Comparison
          </button>
          <button
            className={`py-2 text-sm font-medium ${result ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
            aria-selected={!!result}
            disabled={!result}
          >
            Results{' '}
            {result && (
              <Badge variant="outline" className="ml-2">
                {insights.length}
              </Badge>
            )}
          </button>
        </div>

        <div className="mt-6">{!result ? renderComparisonForm() : renderComparisonResults()}</div>
      </div>
    </div>
  );
};
