import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Activity,
  ArrowRight,
  Eye,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../design-system';
import type { PainEntry } from '../../types';
import type { ComparisonInsight } from '../../types/comparison';
// Using engine inside child components; this widget aggregates simple stats without directly invoking engine APIs here.
import { cn } from '../../design-system/utils';
import { isSameLocalDay } from '../../utils/dates';

interface ComparisonDashboardWidgetProps {
  entries: PainEntry[];
  className?: string;
  onViewDetailedComparison?: (comparisonType: string) => void;
}

interface InsightCardProps {
  insight: ComparisonInsight;
  onViewDetails?: () => void;
}

function InsightCard({ insight, onViewDetails }: InsightCardProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improvement':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'worsening':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'pattern':
        return <Target className="h-4 w-4 text-blue-600" />;
      case 'correlation':
        return <BarChart3 className="h-4 w-4 text-purple-600" />;
      case 'anomaly':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="mt-0.5">
              {getInsightIcon(insight.type)}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm leading-tight">{insight.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getConfidenceColor(insight.confidence))}>
                  {Math.round(insight.confidence * 100)}% confidence
                </span>
                {insight.recommendation && (
                  <span className="text-xs text-muted-foreground">
                    {insight.recommendation}
                  </span>
                )}
              </div>
            </div>
          </div>
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewDetails}
              className="ml-2 p-1 h-8 w-8"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ComparisonMetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

function ComparisonMetricCard({ title, value, change, icon, onClick, className }: ComparisonMetricCardProps) {
  const TrendIcon = change?.trend === 'up' ? TrendingUp :
                   change?.trend === 'down' ? TrendingDown : Target;

  const trendColor = change?.trend === 'up' ? 'text-green-600' :
                    change?.trend === 'down' ? 'text-red-600' : 'text-blue-600';

  return (
    <Card
      className={cn('transition-all hover:shadow-md cursor-pointer', className)}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-xl font-bold text-foreground">{value}</p>
            {change && (
              <div className={cn('flex items-center text-sm mt-1', trendColor)}>
                <TrendIcon className="h-4 w-4 mr-1" />
                <span>{change.value > 0 ? '+' : ''}{change.value}% {change.label}</span>
              </div>
            )}
          </div>
          <div className="text-muted-foreground ml-2">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ComparisonDashboardWidget({
  entries,
  className,
  onViewDetailedComparison
}: ComparisonDashboardWidgetProps) {
  const [selectedInsight, setSelectedInsight] = useState<ComparisonInsight | null>(null);

  const comparisonData = useMemo(() => {
    if (entries.length < 2) {
      return {
        insights: [],
        metrics: {
          totalComparisons: 0,
          significantFindings: 0,
          improvementAreas: 0,
          correlationsFound: 0
        },
        chartData: [],
        recentComparisons: []
      };
    }

  // Aggregate simple heuristics for now; detailed insights come from sub-comparisons
  const topInsights: ComparisonInsight[] = [];

    // Calculate metrics
    const metrics = {
      totalComparisons: 0,
      significantFindings: 0,
      improvementAreas: 0,
      correlationsFound: 0
    };

    // Generate chart data for comparison trends
    const chartData = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayEntries = entries.filter(entry => isSameLocalDay(entry.timestamp, date));

      const avgPain = dayEntries.length > 0
        ? dayEntries.reduce((sum, entry) => sum + entry.baselineData.pain, 0) / dayEntries.length
        : null;

      chartData.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        data: avgPain !== null ? [avgPain] : [0]
      });
    }

    // Recent comparisons (mock data for now - would be stored in state)
    const recentComparisons = [
      {
        id: '1',
        type: 'time-period',
        title: 'Last Week vs Previous Week',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        significance: 0.85
      },
      {
        id: '2',
        type: 'treatment',
        title: 'Pain Levels Before/After Treatment',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        significance: 0.72
      }
    ];

    return {
      insights: topInsights,
      metrics,
      chartData,
      recentComparisons
    };
  }, [entries]);

  const getComparisonTypeIcon = (type: string) => {
    switch (type) {
      case 'time-period':
        return <Calendar className="h-4 w-4" />;
      case 'treatment':
        return <Activity className="h-4 w-4" />;
      case 'condition':
        return <Target className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const handleViewDetailedComparison = (comparisonType: string) => {
    if (onViewDetailedComparison) {
      onViewDetailedComparison(comparisonType);
    }
  };

  const handleViewInsightDetails = (insight: ComparisonInsight) => {
    setSelectedInsight(insight);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with title and quick actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Data Comparisons</h3>
          <p className="text-sm text-muted-foreground">
            Discover patterns and insights from your pain data
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetailedComparison('time-period')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Time Periods
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetailedComparison('treatment')}
          >
            <Activity className="h-4 w-4 mr-2" />
            Treatments
          </Button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ComparisonMetricCard
          title="Total Comparisons"
          value={comparisonData.metrics.totalComparisons}
          icon={<BarChart3 className="h-5 w-5" />}
          onClick={() => handleViewDetailedComparison('overview')}
        />
        <ComparisonMetricCard
          title="Significant Findings"
          value={comparisonData.metrics.significantFindings}
          icon={<Zap className="h-5 w-5" />}
          onClick={() => handleViewDetailedComparison('significant')}
        />
        <ComparisonMetricCard
          title="Improvement Areas"
          value={comparisonData.metrics.improvementAreas}
          icon={<TrendingUp className="h-5 w-5" />}
          onClick={() => handleViewDetailedComparison('improvements')}
        />
        <ComparisonMetricCard
          title="Correlations Found"
          value={comparisonData.metrics.correlationsFound}
          icon={<Target className="h-5 w-5" />}
          onClick={() => handleViewDetailedComparison('correlations')}
        />
      </div>

      {/* Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Key Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comparisonData.insights.length > 0 ? (
            <div className="space-y-3">
              {comparisonData.insights.map((insight, index) => (
                <InsightCard
                  key={`${insight.type}-${index}`}
                  insight={insight}
                  onViewDetails={() => handleViewInsightDetails(insight)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No insights available yet</p>
              <p className="text-sm">Continue tracking to unlock comparison insights</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Comparisons */}
      {comparisonData.recentComparisons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Comparisons</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comparisonData.recentComparisons.map((comparison) => (
                <div
                  key={comparison.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleViewDetailedComparison(comparison.type)}
                >
                  <div className="flex items-center space-x-3">
                    {getComparisonTypeIcon(comparison.type)}
                    <div>
                      <h4 className="font-medium text-sm">{comparison.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(comparison.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {Math.round(comparison.significance * 100)}% significant
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insight Details Modal would go here */}
      {selectedInsight && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Insight Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">{selectedInsight.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedInsight.description}
                </p>
              </div>
              {/* Additional details could be displayed here in the future */}
              {selectedInsight.recommendation && (
                <div>
                  <h5 className="font-medium text-sm">Recommendation</h5>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedInsight.recommendation}
                  </p>
                </div>
              )}
              <div className="flex justify-end">
                <Button onClick={() => setSelectedInsight(null)}>
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
