import React, { useState, useMemo, useEffect } from 'react';
import { formatNumber } from '../../utils/formatting';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  CheckCircle,
  Clock,
  Activity,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { Chart } from '../../design-system/components/Chart';
import type { PainEntry } from '../../types';
import type { ComparisonInsight, ComparisonDataset } from '../../types/comparison';
import type { ConditionComparison as ConditionCfg } from '../../types/comparison';
import { DataComparisonEngine } from '../../utils/comparison/engine';
import { cn } from '../../design-system/utils';

interface ConditionComparisonProps {
  entries: PainEntry[];
  className?: string;
}

interface ConditionOption {
  name: string;
  count: number;
  lastUsed: Date;
  averagePain: number;
}

interface ComparisonResult {
  condition1: string;
  condition2: string;
  condition1Stats: {
    averagePain: number;
    entries: number;
    period: { start: Date; end: Date };
  };
  condition2Stats: {
    averagePain: number;
    entries: number;
    period: { start: Date; end: Date };
  };
  difference: {
    absolute: number;
    percentage: number;
    significance: number;
  };
  insights: ComparisonInsight[];
  chartData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
    }>;
  };
}

// Local extension for optional tags on PainEntry used in condition filtering
type Tagged = { triggers?: Array<{ name: string }>; conditions?: Array<{ name: string }> };

export function ConditionComparison({ entries, className }: ConditionComparisonProps) {
  const [selectedCondition1, setSelectedCondition1] = useState<string>('');
  const [selectedCondition2, setSelectedCondition2] = useState<string>('');
  const [comparisonPeriod, setComparisonPeriod] = useState<number>(30); // days
  const [isComparing, setIsComparing] = useState(false);

  // Get available conditions/triggers
  const availableConditions = useMemo((): ConditionOption[] => {
    const conditionMap = new Map<string, { count: number; lastUsed: Date; totalPain: number }>();

    type Tagged = { triggers?: Array<{ name: string }>; conditions?: Array<{ name: string }> };
    entries.forEach(entry => {
      const { triggers } = (entry as PainEntry & Partial<Tagged>);
      if (triggers && triggers.length > 0) {
        triggers.forEach(trigger => {
          const existing = conditionMap.get(trigger.name);
          if (existing) {
            existing.count++;
            existing.totalPain += entry.baselineData.pain;
            if (new Date(entry.timestamp) > existing.lastUsed) {
              existing.lastUsed = new Date(entry.timestamp);
            }
          } else {
            conditionMap.set(trigger.name, {
              count: 1,
              lastUsed: new Date(entry.timestamp),
              totalPain: entry.baselineData.pain
            });
          }
        });
      }

      // Also include other conditions if present
  const { conditions } = (entry as PainEntry & Partial<Tagged>);
      if (conditions && conditions.length > 0) {
        conditions.forEach(condition => {
          const existing = conditionMap.get(condition.name);
          if (existing) {
            existing.count++;
            existing.totalPain += entry.baselineData.pain;
            if (new Date(entry.timestamp) > existing.lastUsed) {
              existing.lastUsed = new Date(entry.timestamp);
            }
          } else {
            conditionMap.set(condition.name, {
              count: 1,
              lastUsed: new Date(entry.timestamp),
              totalPain: entry.baselineData.pain
            });
          }
        });
      }
    });

    return Array.from(conditionMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        lastUsed: data.lastUsed,
        averagePain: data.totalPain / data.count
      }))
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime());
  }, [entries]);

  // Comparison results
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  useEffect(() => {
    if (!selectedCondition1 || !selectedCondition2 || entries.length < 2) { setComparisonResult(null); return; }
    setIsComparing(true);
    (async () => {
      try {
      const periodStart = new Date(Date.now() - comparisonPeriod * 24 * 60 * 60 * 1000);
      const periodEnd = new Date();

      const filtered = entries.filter(e => {
        const d = new Date(e.timestamp);
        return d >= periodStart && d <= periodEnd;
      });

      const setFor = (name: string) => filtered.filter(e => {
        const { triggers, conditions } = (e as PainEntry & Partial<Tagged>);
        return (triggers && triggers.some(t => t.name === name)) || (conditions && conditions.some(c => c.name === name));
      });

      const dataset1 = setFor(selectedCondition1);
      const dataset2 = setFor(selectedCondition2);

      const datasets: ComparisonDataset[] = [
        { id: 'c1', name: selectedCondition1, entries: dataset1, color: '#64748b', metadata: {} },
        { id: 'c2', name: selectedCondition2, entries: dataset2, color: '#ef4444', metadata: {} },
      ];

      const cfg: ConditionCfg = {
        type: 'condition',
        conditionName: `${selectedCondition1} vs ${selectedCondition2}`,
        conditionTags: [selectedCondition1, selectedCondition2],
        comparisonCondition: selectedCondition2,
        datasets
      };

      const result = await DataComparisonEngine.compareDatasets(cfg, datasets);

      const c1Avg = result.statistics.overall.baselineMean;
      const c2Avg = result.statistics.overall.comparisonMean;

      const difference = {
  absolute: c2Avg - c1Avg,
  percentage: c1Avg > 0 ? ((c2Avg - c1Avg) / c1Avg) * 100 : 0,
  significance: 1 - result.statistics.overall.statisticalSignificance
      };

      // Generate chart data
      const chartData = {
        labels: [selectedCondition1, selectedCondition2],
        datasets: [{
          label: 'Average Pain Level',
          data: [c1Avg, c2Avg],
          backgroundColor: [
            'hsl(var(--color-muted))',
            difference.absolute > 0 ? 'hsl(var(--color-destructive))' : 'hsl(var(--color-success))'
          ]
        }]
      };

      setIsComparing(false);
      setComparisonResult({
        condition1: selectedCondition1,
        condition2: selectedCondition2,
        condition1Stats: {
          averagePain: c1Avg,
          entries: datasets[0].entries.length,
          period: { start: periodStart, end: periodEnd }
        },
        condition2Stats: {
          averagePain: c2Avg,
          entries: datasets[1].entries.length,
          period: { start: periodStart, end: periodEnd }
        },
        difference,
        insights: result.insights || [],
        chartData
      });
    } catch (error) {
      console.error('Condition comparison failed:', error);
      setIsComparing(false);
      setComparisonResult(null);
    }
    })();
  }, [selectedCondition1, selectedCondition2, comparisonPeriod, entries]);

  const getDifferenceIcon = (difference: number) => {
    if (difference < -0.5) return <TrendingDown className="h-4 w-4 text-green-600" />;
    if (difference > 0.5) return <TrendingUp className="h-4 w-4 text-red-600" />;
    return <Target className="h-4 w-4 text-blue-600" />;
  };

  const getSignificanceBadge = (significance: number) => {
    if (significance > 0.8) return <Badge variant="default" className="bg-green-100 text-green-800">High Confidence</Badge>;
    if (significance > 0.6) return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Moderate Confidence</Badge>;
    return <Badge variant="outline">Low Confidence</Badge>;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Condition Comparison</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            Compare pain patterns across different conditions, triggers, or health states
          </p>
        </div>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Comparison Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Condition 1 Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">First Condition/Trigger</label>
              <select className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={selectedCondition1} onChange={(e) => setSelectedCondition1(e.target.value)}>
                <option value="">Select first condition...</option>
                {availableConditions.map(condition => (
                  <option key={condition.name} value={condition.name}>
                    {condition.name} ({condition.count} entries, avg: {formatNumber(condition.averagePain, 1)})
                  </option>
                ))}
              </select>
            </div>

            {/* Condition 2 Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Second Condition/Trigger</label>
              <select className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={selectedCondition2} onChange={(e) => setSelectedCondition2(e.target.value)}>
                <option value="">Select second condition...</option>
                {availableConditions
                  .filter(condition => condition.name !== selectedCondition1)
                  .map(condition => (
                    <option key={condition.name} value={condition.name}>
                      {condition.name} ({condition.count} entries, avg: {formatNumber(condition.averagePain, 1)})
                    </option>
                  ))}
              </select>
            </div>

            {/* Time Period */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Analysis Period (days)</label>
              <select className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={comparisonPeriod.toString()} onChange={(e) => setComparisonPeriod(parseInt(e.target.value))}>
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
                <option value="60">Last 60 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>

          {availableConditions.length < 2 && (
            <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Need at least 2 different conditions or triggers to compare. Add more entries with different conditions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {comparisonResult && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Condition 1 */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{comparisonResult.condition1}</p>
                    <p className="text-2xl font-bold">{formatNumber(comparisonResult.condition1Stats.averagePain, 1)}</p>
                    <p className="text-xs text-muted-foreground">
                      {comparisonResult.condition1Stats.entries} entries
                    </p>
                  </div>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Condition 2 */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{comparisonResult.condition2}</p>
                    <p className="text-2xl font-bold">{formatNumber(comparisonResult.condition2Stats.averagePain, 1)}</p>
                    <p className="text-xs text-muted-foreground">
                      {comparisonResult.condition2Stats.entries} entries
                    </p>
                  </div>
                  <Activity className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Difference */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Difference</p>
                    <div className="flex items-center space-x-2">
                      {getDifferenceIcon(comparisonResult.difference.absolute)}
                      <p className="text-2xl font-bold">
                        {comparisonResult.difference.absolute > 0 ? '+' : ''}
                        {formatNumber(comparisonResult.difference.absolute, 1)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {comparisonResult.difference.percentage > 0 ? '+' : ''}
                      {formatNumber(comparisonResult.difference.percentage, 1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    {getSignificanceBadge(comparisonResult.difference.significance)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Pain Level Comparison</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Chart
                data={comparisonResult.chartData}
                type="bar"
                height={300}
              />
            </CardContent>
          </Card>

          {/* Insights */}
          {comparisonResult.insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Key Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {comparisonResult.insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                      <div className="mt-0.5">
                        {insight.type === 'improvement' && <TrendingDown className="h-4 w-4 text-green-600" />}
                        {insight.type === 'worsening' && <TrendingUp className="h-4 w-4 text-red-600" />}
                        {insight.type === 'pattern' && <Target className="h-4 w-4 text-blue-600" />}
                        {insight.type === 'correlation' && <BarChart3 className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={cn('px-2 py-1 rounded-full text-xs font-medium',
                            insight.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                            insight.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-orange-100 text-orange-800'
                          )}>
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
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Loading State */}
      {isComparing && (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Analyzing condition patterns...</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedCondition1 || !selectedCondition2 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <h3 className="font-medium mb-2">Select Conditions to Compare</h3>
            <p className="text-sm text-muted-foreground">
              Choose two different conditions or triggers from the dropdowns above to see how they affect your pain levels.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
