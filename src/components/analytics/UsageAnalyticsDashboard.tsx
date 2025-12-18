/**
 * Usage Analytics Dashboard
 *
 * Comprehensive dashboard showing user engagement and feature usage patterns.
 * This provides internal visibility into how users interact with the app,
 * including navigation, feature usage, accessibility settings, and sessions.
 *
 * PRIVACY NOTE: All data shown here is stored locally on your device.
 * No personal data is sent to external servers - only anonymized aggregate
 * metrics go to Google Analytics.
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Activity,
  BarChart3,
  Clock,
  Eye,
  FileText,
  Heart,
  Layers,
  MousePointer,
  Navigation,
  RefreshCw,
  Settings,
  TrendingUp,
  Download,
  Accessibility,
  Sun,
  Moon,
  Shield,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../../design-system';
import { cn } from '../../design-system/utils';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import { useTraumaInformed } from '../accessibility/TraumaInformedHooks';
import {
  getStoredData,
  getSessionStats,
  getSessionStartTime,
  trackUsageEvent,
  STORAGE_KEYS,
  type UsageEvent,
  type ExportActivity,
} from '../../utils/usage-tracking';

// ============================================
// TYPES
// ============================================

interface UsageStats {
  totalSessions: number;
  averageSessionDuration: number;
  totalActions: number;
  featureUsage: Record<string, number>;
  navigationPatterns: Record<string, number>;
  peakUsageHours: number[];
  accessibilityPreferences: Record<string, boolean | string>;
  exportActivity: ExportActivity[];
  lastActive: number;
}

interface FeatureUsageItem {
  name: string;
  count: number;
  percentage: number;
  icon: React.ReactNode;
  category: string;
}

// ============================================
// DASHBOARD COMPONENT
// ============================================

interface UsageAnalyticsDashboardProps {
  className?: string;
}

export function UsageAnalyticsDashboard({ className }: UsageAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const [refreshKey, setRefreshKey] = useState(0);
  const { entries, moodEntries } = usePainTrackerStore();
  const { preferences: traumaPrefs } = useTraumaInformed();

  // Refresh stats periodically
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Calculate time filter
  const getTimeFilter = useCallback(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    switch (timeRange) {
      case 'today':
        return now - day;
      case '7d':
        return now - 7 * day;
      case '30d':
        return now - 30 * day;
      default:
        return 0;
    }
  }, [timeRange]);

  // Aggregate usage stats
  const usageStats = useMemo<UsageStats>(() => {
    const cutoff = getTimeFilter();
    const events = getStoredData<UsageEvent[]>(STORAGE_KEYS.USAGE_EVENTS, []).filter(
      e => e.timestamp >= cutoff
    );
    const featureCounts = getStoredData<Record<string, number>>(STORAGE_KEYS.FEATURE_COUNTS, {});
    const navPatterns = getStoredData<Record<string, number>>(STORAGE_KEYS.NAV_PATTERNS, {});
    const exportHistory = getStoredData<ExportActivity[]>(STORAGE_KEYS.EXPORT_HISTORY, []).filter(
      e => e.timestamp >= cutoff
    );

    // Calculate sessions (approximate: session_start events)
    const sessionStarts = events.filter(e => e.type === 'session_start');
    const totalSessions = Math.max(sessionStarts.length, 1);

    // Peak hours
    const hourCounts: Record<number, number> = {};
    events.forEach(e => {
      const hour = new Date(e.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const sortedHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([h]) => parseInt(h));

    return {
      totalSessions,
      averageSessionDuration: 300, // Placeholder - would need actual tracking
      totalActions: events.length,
      featureUsage: featureCounts,
      navigationPatterns: navPatterns,
      peakUsageHours: sortedHours,
      accessibilityPreferences: {
        gentleLanguage: traumaPrefs.gentleLanguage,
        showMemoryAids: traumaPrefs.showMemoryAids,
        showComfortPrompts: traumaPrefs.showComfortPrompts,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        darkMode: document.documentElement.classList.contains('dark'),
      },
      exportActivity: exportHistory,
      lastActive: events.length > 0 ? events[events.length - 1].timestamp : Date.now(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getTimeFilter, traumaPrefs, refreshKey]);

  // Feature usage breakdown
  const featureUsageList = useMemo<FeatureUsageItem[]>(() => {
    const total = Object.values(usageStats.featureUsage).reduce((sum, v) => sum + v, 0);
    if (total === 0) return [];

    const features: FeatureUsageItem[] = [
      {
        name: 'Pain Entry',
        count: usageStats.featureUsage['pain:entry_logged'] || 0,
        percentage: 0,
        icon: <Activity className="h-4 w-4" />,
        category: 'Core',
      },
      {
        name: 'Mood Entry',
        count: usageStats.featureUsage['mood:entry_logged'] || 0,
        percentage: 0,
        icon: <Heart className="h-4 w-4" />,
        category: 'Core',
      },
      {
        name: 'Analytics View',
        count: usageStats.featureUsage['navigation:analytics'] || 0,
        percentage: 0,
        icon: <BarChart3 className="h-4 w-4" />,
        category: 'Analysis',
      },
      {
        name: 'History View',
        count: usageStats.featureUsage['navigation:history'] || 0,
        percentage: 0,
        icon: <Clock className="h-4 w-4" />,
        category: 'Analysis',
      },
      {
        name: 'Settings',
        count: usageStats.featureUsage['settings:opened'] || 0,
        percentage: 0,
        icon: <Settings className="h-4 w-4" />,
        category: 'Config',
      },
      {
        name: 'Exports',
        count: usageStats.exportActivity.length,
        percentage: 0,
        icon: <Download className="h-4 w-4" />,
        category: 'Export',
      },
      {
        name: 'Theme Toggle',
        count: usageStats.featureUsage['theme:toggled'] || 0,
        percentage: 0,
        icon: <Sun className="h-4 w-4" />,
        category: 'Personalization',
      },
    ].map(f => ({
      ...f,
      percentage: total > 0 ? (f.count / total) * 100 : 0,
    })).sort((a, b) => b.count - a.count);

    return features;
  }, [usageStats]);

  // Navigation flow
  const topNavigationPaths = useMemo(() => {
    return Object.entries(usageStats.navigationPatterns)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([path, count]) => ({ path, count }));
  }, [usageStats]);

  // Session info
  const currentSession = useMemo(() => {
    const stats = getSessionStats();
    return {
      duration: stats.duration,
      actions: stats.actions,
      startTime: getSessionStartTime(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Format duration
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  // Format relative time
  const formatRelativeTime = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Track dashboard view
  useEffect(() => {
    trackUsageEvent('usage_dashboard_viewed', 'analytics');
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MousePointer className="h-6 w-6 text-blue-500" />
            Usage Analytics
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track how you use Pain Tracker to optimize your workflow
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['today', '7d', '30d', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  timeRange === range
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                {range === 'today' ? 'Today' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Session */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-blue-200" />
              <Badge className="bg-blue-400/30 text-blue-100 border-0">Live</Badge>
            </div>
            <div className="text-2xl font-bold">{formatDuration(currentSession.duration)}</div>
            <div className="text-sm text-blue-200">Current Session</div>
            <div className="text-xs text-blue-300 mt-1">{currentSession.actions} actions</div>
          </CardContent>
        </Card>

        {/* Total Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {usageStats.totalActions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Actions</div>
            <div className="text-xs text-gray-500 mt-1">
              {timeRange === 'all' ? 'All time' : `Last ${timeRange === 'today' ? '24h' : timeRange}`}
            </div>
          </CardContent>
        </Card>

        {/* Data Entries */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Layers className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{entries.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pain Entries</div>
            <div className="text-xs text-gray-500 mt-1">{moodEntries?.length || 0} mood entries</div>
          </CardContent>
        </Card>

        {/* Exports */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {usageStats.exportActivity.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Exports Generated</div>
            <div className="text-xs text-gray-500 mt-1">
              {usageStats.exportActivity.length > 0
                ? formatRelativeTime(usageStats.exportActivity[usageStats.exportActivity.length - 1].timestamp)
                : 'No exports yet'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Usage & Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Feature Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {featureUsageList.length > 0 ? (
              <div className="space-y-3">
                {featureUsageList.slice(0, 8).map(feature => (
                  <div key={feature.name} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                      {feature.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {feature.name}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {feature.count}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(feature.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {feature.category}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MousePointer className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No feature usage data yet</p>
                <p className="text-sm mt-1">Start using the app to see analytics</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Navigation className="h-5 w-5 text-purple-500" />
              Navigation Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topNavigationPaths.length > 0 ? (
              <div className="space-y-2">
                {topNavigationPaths.map(nav => (
                  <div
                    key={nav.path}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                      {nav.path}
                    </span>
                    <Badge variant="secondary">{nav.count}×</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Navigation className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No navigation data yet</p>
                <p className="text-sm mt-1">Navigate between views to see patterns</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preferences & Export Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Accessibility className="h-5 w-5 text-green-500" />
              Active Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(usageStats.accessibilityPreferences).map(([key, value]) => {
                const isEnabled = typeof value === 'boolean' ? value : value === 'true';
                const labels: Record<string, { label: string; icon: React.ReactNode }> = {
                  gentleLanguage: { label: 'Gentle Language', icon: <Heart className="h-4 w-4" /> },
                  showMemoryAids: { label: 'Memory Aids', icon: <Eye className="h-4 w-4" /> },
                  showComfortPrompts: { label: 'Comfort Prompts', icon: <Shield className="h-4 w-4" /> },
                  reducedMotion: { label: 'Reduced Motion', icon: <Activity className="h-4 w-4" /> },
                  darkMode: { label: 'Dark Mode', icon: <Moon className="h-4 w-4" /> },
                };

                const config = labels[key] || { label: key, icon: <Settings className="h-4 w-4" /> };

                return (
                  <div
                    key={key}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg border transition-colors',
                      isEnabled
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                    )}
                  >
                    <div
                      className={cn(
                        'flex-shrink-0',
                        isEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                      )}
                    >
                      {config.icon}
                    </div>
                    <span
                      className={cn(
                        'text-sm',
                        isEnabled
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-gray-600 dark:text-gray-400'
                      )}
                    >
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Export Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5 text-orange-500" />
              Export History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usageStats.exportActivity.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {usageStats.exportActivity.slice().reverse().map((exp, idx) => (
                  <div
                    key={`${exp.timestamp}-${idx}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          'text-xs uppercase',
                          exp.type === 'csv'
                            ? 'bg-green-100 text-green-700'
                            : exp.type === 'pdf'
                              ? 'bg-red-100 text-red-700'
                              : exp.type === 'json'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                        )}
                      >
                        {exp.type}
                      </Badge>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {exp.recordCount} records
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(exp.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Download className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No exports yet</p>
                <p className="text-sm mt-1">Export your data to see history here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Peak Usage Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-indigo-500" />
            Peak Usage Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 24 }, (_, hour) => {
              const isPeak = usageStats.peakUsageHours.includes(hour);
              const label = hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`;
              return (
                <div
                  key={hour}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isPeak
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  )}
                >
                  {label}
                </div>
              );
            })}
          </div>
          {usageStats.peakUsageHours.length > 0 && (
            <p className="text-sm text-gray-500 mt-3">
              💡 You&apos;re most active around{' '}
              {usageStats.peakUsageHours.map(h => (h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`)).join(', ')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Privacy Note:</strong> All usage data shown here is stored locally on your device.
            Only anonymized, aggregate metrics (like &quot;feature X was used N times&quot;) are sent to
            analytics for product improvement. No personal information or health data leaves your device.
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsageAnalyticsDashboard;
