import React, { useMemo } from 'react';
import {
  Clock,
  Brain,
  AlertTriangle,
  BarChart3,
  LineChart,
  MapPin,
  Pill,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../design-system/utils';
import { Badge } from '../../design-system';
import { MetricCard } from '../../design-system/fused-v2/MetricCard';
import { InsightChip } from '../../design-system/fused-v2/InsightChip';
import { ChartWithTableToggle } from '../accessibility/ChartWithTableToggle';
import { colorVar } from '../../design-system/utils/theme';
import type { PainEntry } from '../../types';
import { useAdaptiveCopy } from '../../contexts/useTone';
import { emptyStates } from '../../content/microcopy';
import { WeatherCorrelationPanel } from './WeatherCorrelationPanel';
import '../../design-system/tokens/fused-v2.css';

interface AdvancedAnalyticsViewProps {
  entries: PainEntry[];
}

export function AdvancedAnalyticsView({ entries }: AdvancedAnalyticsViewProps) {
  // Adaptive tone copy
  const noTrendsHeadline = useAdaptiveCopy(emptyStates.noTrends.headline);
  const noTrendsSubtext = useAdaptiveCopy(emptyStates.noTrends.subtext);

  // Calculate analytics
  const analytics = useMemo(() => {
    if (entries.length === 0) return null;

    // Sort entries by date
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Pain trends
    const painLevels = sortedEntries.map(e => e.baselineData.pain);
    const avgPain = painLevels.reduce((sum, p) => sum + p, 0) / painLevels.length;
    const maxPain = Math.max(...painLevels);
    const minPain = Math.min(...painLevels);

    // Recent trend (last 7 entries vs previous 7)
    const recentEntries = sortedEntries.slice(-7);
    const previousEntries = sortedEntries.slice(-14, -7);
    const recentAvg =
      recentEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / recentEntries.length;
    const previousAvg =
      previousEntries.length > 0
        ? previousEntries.reduce((sum, e) => sum + e.baselineData.pain, 0) / previousEntries.length
        : recentAvg;
    const trend = recentAvg - previousAvg;

    // Location frequency
    const locationMap = new Map<string, number>();
    sortedEntries.forEach(e => {
      e.baselineData.locations?.forEach(loc => {
        locationMap.set(loc, (locationMap.get(loc) || 0) + 1);
      });
    });
    const topLocations = Array.from(locationMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Symptom frequency
    const symptomMap = new Map<string, number>();
    sortedEntries.forEach(e => {
      e.baselineData.symptoms?.forEach(sym => {
        symptomMap.set(sym, (symptomMap.get(sym) || 0) + 1);
      });
    });
    const topSymptoms = Array.from(symptomMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Time of day patterns
    const timePatterns = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    sortedEntries.forEach(e => {
      const hour = new Date(e.timestamp).getHours();
      if (hour >= 5 && hour < 12) timePatterns.morning++;
      else if (hour >= 12 && hour < 17) timePatterns.afternoon++;
      else if (hour >= 17 && hour < 21) timePatterns.evening++;
      else timePatterns.night++;
    });

    // Quality of life metrics
    const qolEntries = sortedEntries.filter(e => e.qualityOfLife);
    const avgSleep =
      qolEntries.length > 0
        ? qolEntries.reduce((sum, e) => sum + (e.qualityOfLife?.sleepQuality || 0), 0) /
          qolEntries.length
        : 0;
    const avgMood =
      qolEntries.length > 0
        ? qolEntries.reduce((sum, e) => sum + (e.qualityOfLife?.moodImpact || 0), 0) /
          qolEntries.length
        : 0;

    // Medication effectiveness
    const medEntries = sortedEntries.filter(e => {
      const current = e.medications?.current;
      return current && Array.isArray(current) && current.length > 0;
    });
    const medFrequency = new Map<string, number>();
    medEntries.forEach(e => {
      const current = e.medications?.current;
      if (current && Array.isArray(current)) {
        current.forEach(med => {
          medFrequency.set(med.name, (medFrequency.get(med.name) || 0) + 1);
        });
      }
    });
    const topMedications = Array.from(medFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      avgPain,
      maxPain,
      minPain,
      trend,
      topLocations,
      topSymptoms,
      timePatterns,
      avgSleep,
      avgMood,
      topMedications,
      totalEntries: entries.length,
    };
  }, [entries]);

  // Chart data
  const painTrendData = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return {
      labels: sorted.map(e =>
        new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ),
      datasets: [
        {
          label: 'Pain Level',
          data: sorted.map(e => e.baselineData.pain),
          borderColor: colorVar('--color-primary'),
          backgroundColor: colorVar('--color-primary') + '20',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [entries]);

  const locationData = useMemo(() => {
    if (!analytics) return { labels: [], datasets: [] };

    return {
      labels: analytics.topLocations.map(([loc]) => loc),
      datasets: [
        {
          label: 'Frequency',
          data: analytics.topLocations.map(([, count]) => count),
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(234, 179, 8, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
          ],
        },
      ],
    };
  }, [analytics]);

  const timeOfDayData = useMemo(() => {
    if (!analytics) return { labels: [], datasets: [] };

    return {
      labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
      datasets: [
        {
          label: 'Entries',
          data: [
            analytics.timePatterns.morning,
            analytics.timePatterns.afternoon,
            analytics.timePatterns.evening,
            analytics.timePatterns.night,
          ],
          backgroundColor: [
            'rgba(251, 191, 36, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(99, 102, 241, 0.8)',
          ],
        },
      ],
    };
  }, [analytics]);

  if (!analytics) {
    return (
      <div className="text-center py-20">
        <BarChart3 className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {noTrendsHeadline}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">{noTrendsSubtext}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Advanced Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Deep insights into your pain patterns and trends
          </p>
        </div>
        <Badge variant="outline" className="rounded-full">
          <Sparkles className="h-3 w-3 mr-1" />
          {analytics.totalEntries} Entries Analyzed
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Average Pain"
          value={analytics.avgPain.toFixed(1)}
          unit="/10"
          delta={{
            value: -analytics.trend,
            direction: analytics.trend < -0.5 ? 'down' : analytics.trend > 0.5 ? 'up' : 'neutral',
            label: 'vs previous period',
          }}
          severity={Math.round(analytics.avgPain) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}
        />

        <MetricCard
          title="Pain Range"
          value={`${analytics.minPain}-${analytics.maxPain}`}
          delta={{
            value: 0,
            direction: 'neutral',
            label: 'min to max',
          }}
        />

        <MetricCard
          title="Avg Sleep Quality"
          value={analytics.avgSleep.toFixed(1)}
          unit="/10"
          delta={{
            value: 0,
            direction: 'neutral',
            label:
              analytics.avgSleep >= 7
                ? 'Good'
                : analytics.avgSleep >= 5
                  ? 'Fair'
                  : 'Needs attention',
          }}
        />

        <MetricCard
          title="Avg Mood Impact"
          value={analytics.avgMood.toFixed(1)}
          unit="/10"
          delta={{
            value: 0,
            direction: 'neutral',
            label:
              analytics.avgMood >= 7
                ? 'Positive'
                : analytics.avgMood >= 5
                  ? 'Moderate'
                  : 'Challenging',
          }}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pain Trend - Accessible */}
        <ChartWithTableToggle
          title="Pain Trend"
          description="Your pain levels over time"
          type="line"
          chartData={painTrendData}
          tableData={[...entries]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map(e => ({
              label: new Date(e.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: '2-digit',
              }),
              value: e.baselineData.pain,
              additionalInfo: `Pain level: ${e.baselineData.pain}/10`,
            }))}
          icon={LineChart}
          height={256}
        />

        {/* Top Locations - Accessible */}
        <ChartWithTableToggle
          title="Affected Areas"
          description="Most common pain locations"
          type="bar"
          chartData={locationData}
          tableData={
            analytics?.topLocations.map(([location, count]) => ({
              label: location,
              value: count,
              additionalInfo: `Reported ${count} time${count > 1 ? 's' : ''}`,
            })) || []
          }
          icon={MapPin}
          height={256}
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time of Day Patterns - Accessible */}
        <ChartWithTableToggle
          title="Time Patterns"
          description="When you track most often"
          type="doughnut"
          chartData={timeOfDayData}
          tableData={[
            {
              label: 'Morning (5am-12pm)',
              value: analytics?.timePatterns.morning || 0,
              additionalInfo: `${analytics?.timePatterns.morning || 0} entries`,
            },
            {
              label: 'Afternoon (12pm-5pm)',
              value: analytics?.timePatterns.afternoon || 0,
              additionalInfo: `${analytics?.timePatterns.afternoon || 0} entries`,
            },
            {
              label: 'Evening (5pm-9pm)',
              value: analytics?.timePatterns.evening || 0,
              additionalInfo: `${analytics?.timePatterns.evening || 0} entries`,
            },
            {
              label: 'Night (9pm-5am)',
              value: analytics?.timePatterns.night || 0,
              additionalInfo: `${analytics?.timePatterns.night || 0} entries`,
            },
          ]}
          icon={Clock}
          height={256}
        />

        {/* Insights Panel */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500 rounded-xl">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Key Insights</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Explainable observations</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Trend Insight */}
            <InsightChip
              statement={
                analytics.trend < -0.5
                  ? `Pain improving by ${Math.abs(analytics.trend).toFixed(1)} points`
                  : analytics.trend > 0.5
                    ? `Pain increasing by ${analytics.trend.toFixed(1)} points`
                    : 'Pain levels stable'
              }
              confidence={
                Math.abs(analytics.trend) > 1 ? 3 : Math.abs(analytics.trend) > 0.5 ? 2 : 1
              }
              rationale={
                analytics.trend < -0.5
                  ? `Your pain levels are trending downward. Recent average is ${analytics.avgPain.toFixed(1)}, showing improvement from previous period. Keep up with your current treatment plan.`
                  : analytics.trend > 0.5
                    ? `Your pain has increased recently from previous period. Average is ${analytics.avgPain.toFixed(1)}. Consider consulting with your healthcare provider.`
                    : 'Your pain levels are relatively stable. Continue monitoring for changes and patterns.'
              }
            />

            {/* Most Common Location */}
            {analytics.topLocations[0] && (
              <InsightChip
                statement={`Primary pain area: ${analytics.topLocations[0][0]}`}
                confidence={analytics.topLocations[0][1] > 5 ? 3 : 2}
                rationale={`${analytics.topLocations[0][0]} is your most frequently reported location, appearing in ${analytics.topLocations[0][1]} entries. This consistent pattern helps identify treatment targets.`}
              />
            )}

            {/* Sleep Correlation */}
            {analytics.avgSleep > 0 && (
              <InsightChip
                statement={
                  analytics.avgSleep >= 7
                    ? 'Good sleep quality observed'
                    : 'Sleep quality may need attention'
                }
                confidence={2}
                rationale={
                  analytics.avgSleep >= 7
                    ? `Your average sleep quality is ${analytics.avgSleep.toFixed(1)}/10, which is good and may be helping with pain management. Research shows quality sleep aids recovery.`
                    : `Your average sleep quality is ${analytics.avgSleep.toFixed(1)}/10. Improving sleep could help reduce pain levels. Consider discussing sleep hygiene with your healthcare provider.`
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Details Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Symptoms */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-950/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Common Symptoms</h3>
          </div>
          <div className="space-y-2">
            {analytics.topSymptoms.map(([symptom, count], idx) => (
              <div
                key={symptom}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                      idx === 0 && 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400',
                      idx === 1 &&
                        'bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
                      idx === 2 &&
                        'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400',
                      idx >= 3 && 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    )}
                  >
                    {idx + 1}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{symptom}</span>
                </div>
                <Badge variant="outline" className="rounded-full">
                  {count} times
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Top Medications */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
              <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Frequent Medications
            </h3>
          </div>
          {analytics.topMedications.length > 0 ? (
            <div className="space-y-2">
              {analytics.topMedications.map(([med, count], idx) => (
                <div
                  key={med}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                        idx === 0 &&
                          'bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
                        idx === 1 &&
                          'bg-cyan-100 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400',
                        idx === 2 &&
                          'bg-teal-100 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400'
                      )}
                    >
                      {idx + 1}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{med}</span>
                  </div>
                  <Badge variant="outline" className="rounded-full">
                    {count} entries
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{noTrendsSubtext}</p>
            </div>
          )}
        </div>
      </div>

      {/* Weather Correlations */}
      <WeatherCorrelationPanel entries={entries} />
    </div>
  );
}

export default AdvancedAnalyticsView;
