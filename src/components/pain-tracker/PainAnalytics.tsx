import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format as formatDate } from 'date-fns';
import { formatNumber } from '../../utils/formatting';
import type { PainEntry } from '../../types';
import {
  analyzeTrends,
  calculateStatistics,
  buildDailySeries
} from '../../utils/pain-tracker/trending';
import { predictPainAndFlares } from '../../utils/pain-tracker/predictionEngine';
import { exportToCSV, exportToJSON, downloadData } from '../../utils/pain-tracker/export';
import { ComparisonAnalytics, LocationHeatmap, TreatmentOverlay } from './analytics-v2';
import { VisitSummary, ClinicalExports } from './clinician-export';
import { AccessibilityControls, LanguageSelector } from '../accessibility';
import { useReducedMotion } from '../../design-system/utils/accessibility';
import { EncryptedBackup, DataRestore } from '../data-resilience';
import { TemplateLibrary } from '../templates';

interface PainAnalyticsProps {
  entries: PainEntry[];
  onDataRestore?: (entries: PainEntry[]) => void;
  onApplyTemplate?: (template: Partial<PainEntry>) => void;
}

type TabId =
  | 'overview'
  | 'predictions'
  | 'comparison'
  | 'heatmap'
  | 'treatment'
  | 'clinical'
  | 'accessibility'
  | 'backup'
  | 'templates';

export const PainAnalytics: React.FC<PainAnalyticsProps> = ({
  entries,
  onDataRestore = () => {},
  onApplyTemplate = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const prefersReducedMotion = useReducedMotion();
  const trends = analyzeTrends(entries, { advanced: true });
  const stats = calculateStatistics(entries);

  const advanced = trends.advanced;
  const formatCorrelation = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'Not enough data';
    if (!Number.isFinite(value)) return 'Not enough data';
    const rounded = Math.round(value * 100) / 100;
    return rounded.toFixed(2);
  };

  const formatTagLabel = (key: string) =>
    key
      .split(' ')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  const topTags = (
    map: Record<string, { count: number; avgPain: number }> | undefined,
    limit = 3
  ) => {
    if (!map) return [] as Array<{ key: string; count: number; avgPain: number }>;
    return Object.entries(map)
      .map(([key, value]) => ({ key, count: value.count, avgPain: value.avgPain }))
      .sort((a, b) => b.count - a.count || b.avgPain - a.avgPain)
      .slice(0, limit);
  };

  const topBuckets = (
    buckets:
      | Record<string, { count: number; totalPain: number; avgPain: number }>
      | undefined,
    direction: 'best' | 'worst',
    limit = 3,
    minCount = 2
  ) => {
    if (!buckets) return [] as Array<{ key: string; count: number; avgPain: number }>;
    const ranked = Object.entries(buckets)
      .filter(([, stat]) => stat.count >= minCount)
      .map(([key, stat]) => ({ key, count: stat.count, avgPain: stat.avgPain }))
      .sort((a, b) => (direction === 'worst' ? b.avgPain - a.avgPain : a.avgPain - b.avgPain));
    return ranked.slice(0, limit);
  };

  // Central daily series shared across analytics visualizations (UTC date keys)
  const dailySeries = buildDailySeries(entries);
  const weeklyChartData = dailySeries.slice(-7).map(d => ({ date: d.date, pain: d.pain }));

  const tabs: Array<{ id: TabId; label: string; icon: string }> = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'predictions', label: 'Predictions', icon: '🤖' },
    { id: 'comparison', label: 'Comparisons', icon: '📈' },
    { id: 'heatmap', label: 'Body Heatmap', icon: '🗺️' },
    { id: 'treatment', label: 'Treatment Timeline', icon: '💊' },
    { id: 'clinical', label: 'Clinical Export', icon: '🏥' },
    { id: 'backup', label: 'Data Backup', icon: '💾' },
    { id: 'templates', label: 'Templates', icon: '📋' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' },
  ];
  // --- Predictions Tab Logic ---
  const prediction = predictPainAndFlares(entries);

  const timeOfDayData = Object.entries(trends.timeOfDayPattern).map(([hour, pain]) => ({
    hour,
    avgPain:
      pain /
      Math.max(
        1,
        entries.filter(e => {
          const h = new Date(e.timestamp).getHours();
          return `${h.toString().padStart(2, '0')}:00` === hour;
        }).length
      ),
  }));

  const locationData = Object.entries(trends.locationFrequency).map(([location, frequency]) => ({
    location,
    frequency,
    avgPain: stats.locationStats[location]?.avgPain || 0,
  }));

  const symptomData = Object.entries(trends.symptomCorrelations).map(([symptom]) => ({
    symptom,
    frequency: stats.symptomStats[symptom]?.frequency || 0,
    avgPain: stats.symptomStats[symptom]?.avgPain || 0,
  }));

  const handleExport = (format: 'csv' | 'json') => {
    const timestamp = formatDate(new Date(), 'yyyy-MM-dd');
    if (format === 'csv') {
      const csvData = exportToCSV(entries);
      downloadData(csvData, `pain-tracker-export-${timestamp}.csv`);
    } else {
      const jsonData = exportToJSON(entries);
      downloadData(jsonData, `pain-tracker-export-${timestamp}.json`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Analytics Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8 p-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Pain Overview</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport('csv')}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Export JSON
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat-card">
                <h3 className="text-gray-600 dark:text-gray-400">Average Pain</h3>
                <p className="text-2xl font-bold">{formatNumber(stats.mean, 1)}</p>
              </div>
              <div className="stat-card">
                <h3 className="text-gray-600 dark:text-gray-400">Most Common Level</h3>
                <p className="text-2xl font-bold">{stats.mode}</p>
              </div>
              <div className="stat-card">
                <h3 className="text-gray-600 dark:text-gray-400">Pain Trend</h3>
                <p className="text-2xl font-bold">
                  {trends.painTrends.increasing ? '↑' : '↓'}{' '}
                  {formatNumber(Math.abs(trends.painTrends.averageChange), 1)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Narrative Summary</h2>
            <p className="text-gray-700 dark:text-gray-300">{trends.narrativeSummary}</p>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{trends.confidenceNote}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Pain by Time of Day</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeOfDayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend wrapperStyle={{ whiteSpace: 'normal', maxWidth: 200 }} />
                  <Line
                    type="monotone"
                    dataKey="avgPain"
                    stroke="#8884d8"
                    name="Average Pain Level"
                    isAnimationActive={!prefersReducedMotion}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Weekly Trend</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={d => formatDate(new Date(d), 'EEE')} />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend wrapperStyle={{ whiteSpace: 'normal', maxWidth: 200 }} />
                  <Line
                    type="monotone"
                    dataKey="pain"
                    stroke="#ef4444"
                    name="Average"
                    isAnimationActive={!prefersReducedMotion}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-2">Pattern insights (optional)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              These patterns are informational only. Correlation does not prove cause.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Highlights
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Best / worst time-of-day
                    </p>
                    {advanced?.bestTimeOfDay && advanced?.worstTimeOfDay ? (
                      <p className="text-gray-700 dark:text-gray-300">
                        Best: <span className="font-medium">{advanced.bestTimeOfDay.key}</span> ({advanced.bestTimeOfDay.count}×)
                        <br />
                        Toughest: <span className="font-medium">{advanced.worstTimeOfDay.key}</span> ({advanced.worstTimeOfDay.count}×)
                      </p>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">Not enough time-of-day variety yet.</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Best / worst day-of-week
                    </p>
                    {advanced?.bestDayOfWeek && advanced?.worstDayOfWeek ? (
                      <p className="text-gray-700 dark:text-gray-300">
                        Best: <span className="font-medium">{advanced.bestDayOfWeek.key}</span> ({advanced.bestDayOfWeek.count}×)
                        <br />
                        Toughest: <span className="font-medium">{advanced.worstDayOfWeek.key}</span> ({advanced.worstDayOfWeek.count}×)
                      </p>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">Not enough day coverage yet.</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Toughest hours
                      </p>
                      {topBuckets(advanced?.timeOfDayBuckets, 'worst').length ? (
                        <ul className="space-y-1">
                          {topBuckets(advanced?.timeOfDayBuckets, 'worst').map(bucket => (
                            <li key={bucket.key} className="flex justify-between gap-3">
                              <span className="text-gray-700 dark:text-gray-300">{bucket.key}</span>
                              <span className="font-medium">
                                {bucket.avgPain.toFixed(1)}
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                  (n={bucket.count})
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400">Not enough data.</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Easiest hours
                      </p>
                      {topBuckets(advanced?.timeOfDayBuckets, 'best').length ? (
                        <ul className="space-y-1">
                          {topBuckets(advanced?.timeOfDayBuckets, 'best').map(bucket => (
                            <li key={bucket.key} className="flex justify-between gap-3">
                              <span className="text-gray-700 dark:text-gray-300">{bucket.key}</span>
                              <span className="font-medium">
                                {bucket.avgPain.toFixed(1)}
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                  (n={bucket.count})
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400">Not enough data.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Correlations (r)
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-700 dark:text-gray-300">Sleep ↔ Pain</span>
                    <span className="font-medium">{formatCorrelation(advanced?.correlations.sleepToPain)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-700 dark:text-gray-300">Mood ↔ Pain</span>
                    <span className="font-medium">{formatCorrelation(advanced?.correlations.moodToPain)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-700 dark:text-gray-300">Stress ↔ Pain</span>
                    <span className="font-medium">{formatCorrelation(advanced?.correlations.stressToPain)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-700 dark:text-gray-300">Activity level ↔ Pain</span>
                    <span className="font-medium">
                      {formatCorrelation(advanced?.correlations.activityLevelToPain)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Top tags
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Triggers</p>
                    {topTags(advanced?.tags.triggers).length ? (
                      <ul className="space-y-1">
                        {topTags(advanced?.tags.triggers).map(tag => (
                          <li key={tag.key} className="flex justify-between gap-3">
                            <span className="text-gray-700 dark:text-gray-300">{formatTagLabel(tag.key)}</span>
                            <span className="font-medium">{tag.count}×</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">Not enough tagged entries yet.</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Relief</p>
                    {topTags(advanced?.tags.reliefMethods).length ? (
                      <ul className="space-y-1">
                        {topTags(advanced?.tags.reliefMethods).map(tag => (
                          <li key={tag.key} className="flex justify-between gap-3">
                            <span className="text-gray-700 dark:text-gray-300">{formatTagLabel(tag.key)}</span>
                            <span className="font-medium">{tag.count}×</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">Not enough tagged entries yet.</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Activities</p>
                    {topTags(advanced?.tags.activities).length ? (
                      <ul className="space-y-1">
                        {topTags(advanced?.tags.activities).map(tag => (
                          <li key={tag.key} className="flex justify-between gap-3">
                            <span className="text-gray-700 dark:text-gray-300">{formatTagLabel(tag.key)}</span>
                            <span className="font-medium">{tag.count}×</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">Not enough tagged entries yet.</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Quality</p>
                    {topTags(advanced?.tags.quality).length ? (
                      <ul className="space-y-1">
                        {topTags(advanced?.tags.quality).map(tag => (
                          <li key={tag.key} className="flex justify-between gap-3">
                            <span className="text-gray-700 dark:text-gray-300">{formatTagLabel(tag.key)}</span>
                            <span className="font-medium">{tag.count}×</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">Not enough tagged entries yet.</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Weather</p>
                    {topTags(advanced?.tags.weather).length ? (
                      <ul className="space-y-1">
                        {topTags(advanced?.tags.weather).map(tag => (
                          <li key={tag.key} className="flex justify-between gap-3">
                            <span className="text-gray-700 dark:text-gray-300">{formatTagLabel(tag.key)}</span>
                            <span className="font-medium">{tag.count}×</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">Not enough tagged entries yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Pain by Location</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Legend wrapperStyle={{ whiteSpace: 'normal', maxWidth: 200 }} />
                    <Bar dataKey="frequency" fill="#8884d8" name="Frequency" />
                    <Bar dataKey="avgPain" fill="#82ca9d" name="Avg Pain" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Symptoms Analysis</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={symptomData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="symptom" />
                    <YAxis />
                    <Tooltip />
                    <Legend wrapperStyle={{ whiteSpace: 'normal', maxWidth: 200 }} />
                    <Bar dataKey="frequency" fill="#8884d8" name="Frequency" />
                    <Bar dataKey="avgPain" fill="#82ca9d" name="Avg Pain" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-8 p-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">AI Predictions</h2>
            <div className="mb-4">
              <strong>Pain Level (next 24h):</strong> <span className="text-lg font-bold">{prediction.predictedPain}</span>
              <span className="ml-2 text-xs text-muted-foreground">Confidence: {(prediction.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="mb-4">
              <strong>Flare Prediction:</strong> {prediction.flareInDays !== null ? (
                <span>
                  High pain day likely in <span className="font-bold">{prediction.flareInDays} days</span>
                  <span className="ml-2 text-xs text-muted-foreground">Confidence: {prediction.flareConfidence !== null ? (prediction.flareConfidence * 100).toFixed(0) : '--'}%</span>
                </span>
              ) : 'No flare predicted'}
            </div>
            <div className="mb-4">
              <strong>Medication Effectiveness:</strong>
              <ul className="list-disc pl-6 mt-2">
                {prediction.medicationEffectiveness.length ? prediction.medicationEffectiveness.map(med => (
                  <li key={med.medication}>
                    {med.medication}: {med.effectiveness.toFixed(1)} / 5
                    <span className="ml-2 text-xs text-muted-foreground">Confidence: {(med.confidence * 100).toFixed(0)}%</span>
                  </li>
                )) : <li>No medication data</li>}
              </ul>
            </div>
            <div className="mb-2 text-xs text-muted-foreground">
              <strong>Methodology:</strong> {prediction.methodology}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && <ComparisonAnalytics entries={entries} />}
      {activeTab === 'heatmap' && <LocationHeatmap entries={entries} />}
      {activeTab === 'treatment' && <TreatmentOverlay entries={entries} />}
      {activeTab === 'clinical' && (
        <div className="space-y-6">
          <VisitSummary entries={entries} />
          <ClinicalExports entries={entries} />
        </div>
      )}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          <EncryptedBackup entries={entries} />
          <DataRestore onDataRestore={onDataRestore} />
        </div>
      )}
      {activeTab === 'templates' && <TemplateLibrary onApplyTemplate={onApplyTemplate} />}
      {activeTab === 'accessibility' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AccessibilityControls />
            <LanguageSelector />
          </div>
        </div>
      )}
    </div>
  );
};
