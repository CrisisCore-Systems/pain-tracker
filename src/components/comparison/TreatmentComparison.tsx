import React, { useState, useMemo, useEffect } from 'react';
import { formatNumber } from '../../utils/formatting';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  CheckCircle,
  Clock,
  Pill,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import Chart from '../../design-system/components/Chart';
import { colorVar } from '../../design-system/utils/theme';
import type { PainEntry } from '../../types';
import type {
  ComparisonInsight,
  ComparisonDataset,
  TreatmentComparison as TreatmentCfg,
} from '../../types/comparison';
import { DataComparisonEngine } from '../../utils/comparison/engine';
import { cn } from '../../design-system/utils';

interface TreatmentComparisonProps {
  entries: PainEntry[];
  className?: string;
}

interface TreatmentOption {
  name: string;
  count: number;
  lastUsed: Date;
}

interface TreatmentComparisonResult {
  treatment: string;
  baselineStats: {
    averagePain: number;
    entries: number;
    period: { start: Date; end: Date };
  };
  treatmentStats: {
    averagePain: number;
    entries: number;
    period: { start: Date; end: Date };
  };
  change: {
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

export function TreatmentComparison({ entries, className }: TreatmentComparisonProps) {
  const [selectedTreatment, setSelectedTreatment] = useState<string>('');
  const [baselineDays, setBaselineDays] = useState<number>(14);
  const [treatmentDays, setTreatmentDays] = useState<number>(14);
  const [isComparing, setIsComparing] = useState(false);

  // Get available treatments
  const availableTreatments = useMemo((): TreatmentOption[] => {
    const treatmentMap = new Map<string, { count: number; lastUsed: Date }>();

    entries.forEach(entry => {
      const meds = entry.medications?.current || [];
      meds.forEach(treatment => {
        const existing = treatmentMap.get(treatment.name);
        if (existing) {
          existing.count++;
          if (new Date(entry.timestamp) > existing.lastUsed) {
            existing.lastUsed = new Date(entry.timestamp);
          }
        } else {
          treatmentMap.set(treatment.name, {
            count: 1,
            lastUsed: new Date(entry.timestamp),
          });
        }
      });
    });

    return Array.from(treatmentMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        lastUsed: data.lastUsed,
      }))
      .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime());
  }, [entries]);

  // Comparison results
  const [comparisonResult, setComparisonResult] = useState<TreatmentComparisonResult | null>(null);

  useEffect(() => {
    if (!selectedTreatment || entries.length < 2) {
      setComparisonResult(null);
      return;
    }
    setIsComparing(true);
    (async () => {
      try {
        const baselineStart = new Date(
          Date.now() - (baselineDays + treatmentDays) * 24 * 60 * 60 * 1000
        );
        const baselineEnd = new Date(Date.now() - treatmentDays * 24 * 60 * 60 * 1000);
        const treatmentStart = new Date(Date.now() - treatmentDays * 24 * 60 * 60 * 1000);
        const treatmentEnd = new Date();

        const baselineEntries = entries.filter(e => {
          const d = new Date(e.timestamp);
          return d >= baselineStart && d <= baselineEnd;
        });
        const treatmentEntries = entries.filter(e => {
          const d = new Date(e.timestamp);
          return (
            d >= treatmentStart &&
            d <= treatmentEnd &&
            (e.medications?.current || []).some(m => m.name === selectedTreatment)
          );
        });

        const datasets: ComparisonDataset[] = [
          {
            id: 'baseline',
            name: 'Baseline Period',
            entries: baselineEntries as unknown as PainEntry[],
            color: '#3B82F6',
            metadata: {},
          },
          {
            id: 'treatment',
            name: 'Treatment Period',
            entries: treatmentEntries as unknown as PainEntry[],
            color: '#22C55E',
            metadata: { treatment: selectedTreatment },
          },
        ];

        const cfg: TreatmentCfg = {
          type: 'treatment',
          treatmentName: selectedTreatment,
          beforeTreatment: {
            start: baselineStart,
            end: baselineEnd,
            entries: baselineEntries as unknown as PainEntry[],
          },
          afterTreatment: {
            start: treatmentStart,
            end: treatmentEnd,
            entries: treatmentEntries as unknown as PainEntry[],
          },
          treatmentDate: treatmentStart,
          datasets,
        };

        const result = await DataComparisonEngine.compareDatasets(cfg, datasets);

        const baselineAvg = result.statistics.overall.baselineMean;
        const treatmentAvg = result.statistics.overall.comparisonMean;

        const change = {
          absolute: treatmentAvg - baselineAvg,
          percentage: baselineAvg > 0 ? ((treatmentAvg - baselineAvg) / baselineAvg) * 100 : 0,
          significance: 1 - result.statistics.overall.statisticalSignificance,
        };

        // Generate chart data
        const chartData = {
          labels: ['Baseline Period', 'Treatment Period'],
          datasets: [
            {
              label: 'Average Pain Level',
              data: [baselineAvg, treatmentAvg],
              backgroundColor: [
                colorVar('color-muted') ?? '#64748b',
                change.absolute < 0
                  ? (colorVar('color-success') ?? '#22c55e')
                  : (colorVar('color-destructive') ?? '#ef4444'),
              ],
            },
          ],
        };

        setIsComparing(false);
        setComparisonResult({
          treatment: selectedTreatment,
          baselineStats: {
            averagePain: baselineAvg,
            entries: datasets[0].entries.length,
            period: { start: baselineStart, end: baselineEnd },
          },
          treatmentStats: {
            averagePain: treatmentAvg,
            entries: datasets[1].entries.length,
            period: { start: treatmentStart, end: treatmentEnd },
          },
          change,
          insights: result.insights || [],
          chartData,
        });
      } catch (error) {
        console.error('Treatment comparison failed:', error);
        setIsComparing(false);
        setComparisonResult(null);
      }
    })();
  }, [selectedTreatment, baselineDays, treatmentDays, entries]);

  const getChangeIcon = (change: number) => {
    if (change < -0.5) return <TrendingDown className="h-4 w-4 text-green-600" />;
    if (change > 0.5) return <TrendingUp className="h-4 w-4 text-red-600" />;
    return <Target className="h-4 w-4 text-blue-600" />;
  };

  const getSignificanceBadge = (significance: number) => {
    if (significance > 0.8)
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          High Confidence
        </Badge>
      );
    if (significance > 0.6)
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
          Moderate Confidence
        </Badge>
      );
    return <Badge variant="outline">Low Confidence</Badge>;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Pill className="h-5 w-5" />
            <span>Treatment Comparison</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            Compare pain levels before and after treatments or medication changes
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
            {/* Treatment Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Treatment/Medication</label>
              <select
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedTreatment}
                onChange={e => setSelectedTreatment(e.target.value)}
              >
                <option value="">Select a treatment...</option>
                {availableTreatments.map(treatment => (
                  <option key={treatment.name} value={treatment.name}>
                    {treatment.name} ({treatment.count} entries)
                  </option>
                ))}
              </select>
            </div>

            {/* Baseline Period */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Baseline Period (days)</label>
              <select
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={baselineDays.toString()}
                onChange={e => setBaselineDays(parseInt(e.target.value))}
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
              </select>
            </div>

            {/* Treatment Period */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Treatment Period (days)</label>
              <select
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={treatmentDays.toString()}
                onChange={e => setTreatmentDays(parseInt(e.target.value))}
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
              </select>
            </div>
          </div>

          {availableTreatments.length === 0 && (
            <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
              <Info className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No treatments found. Start adding treatments to your pain entries to enable
                comparisons.
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
            {/* Baseline */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Baseline Period</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(comparisonResult.baselineStats.averagePain, 1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {comparisonResult.baselineStats.entries} entries
                    </p>
                  </div>
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Treatment */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Treatment Period</p>
                    <p className="text-2xl font-bold">
                      {formatNumber(comparisonResult.treatmentStats.averagePain, 1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {comparisonResult.treatmentStats.entries} entries
                    </p>
                  </div>
                  <Activity className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Change */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Change</p>
                    <div className="flex items-center space-x-2">
                      {getChangeIcon(comparisonResult.change.absolute)}
                      <p className="text-2xl font-bold">
                        {comparisonResult.change.absolute > 0 ? '+' : ''}
                        {formatNumber(comparisonResult.change.absolute, 1)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {comparisonResult.change.percentage > 0 ? '+' : ''}
                      {formatNumber(comparisonResult.change.percentage, 1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    {getSignificanceBadge(comparisonResult.change.significance)}
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
              <Chart data={comparisonResult.chartData} type="bar" height={300} />
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
                        {insight.type === 'improvement' && (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        )}
                        {insight.type === 'worsening' && (
                          <TrendingUp className="h-4 w-4 text-red-600" />
                        )}
                        {insight.type === 'pattern' && <Target className="h-4 w-4 text-blue-600" />}
                        {insight.type === 'correlation' && (
                          <BarChart3 className="h-4 w-4 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span
                            className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              insight.confidence > 0.8
                                ? 'bg-green-100 text-green-800'
                                : insight.confidence > 0.6
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-orange-100 text-orange-800'
                            )}
                          >
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
            <p className="text-sm text-muted-foreground">Analyzing treatment effectiveness...</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedTreatment && availableTreatments.length > 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <h3 className="font-medium mb-2">Select a Treatment to Compare</h3>
            <p className="text-sm text-muted-foreground">
              Choose a treatment or medication from the dropdown above to see how it affects your
              pain levels.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
