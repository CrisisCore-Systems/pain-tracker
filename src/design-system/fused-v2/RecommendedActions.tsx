import React, { useMemo } from 'react';
import { Activity, TrendingUp, FileText, Lightbulb, Calendar, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PainEntry } from '../../types';
import { cn } from '../utils';

interface RecommendedAction {
  id: string;
  priority: 'primary' | 'secondary' | 'tertiary';
  icon: LucideIcon;
  title: string;
  subtitle: string;
  action: () => void;
  badge?: string;
  estimatedTime?: string;
}

interface RecommendedActionsProps {
  entries: PainEntry[];
  onLogNow: () => void;
  onViewCalendar: () => void;
  onViewAnalytics: () => void;
  onExport: () => void;
}

export function RecommendedActions({
  entries,
  onLogNow,
  onViewCalendar,
  onViewAnalytics,
  onExport,
}: RecommendedActionsProps) {
  const actions = useMemo(() => {
    const recommendations: RecommendedAction[] = [];

    // Check time since last entry
    const lastEntry =
      entries.length > 0
        ? entries.reduce((latest, e) =>
            new Date(e.timestamp) > new Date(latest.timestamp) ? e : latest
          )
        : null;

    const hoursSinceLastEntry = lastEntry
      ? (Date.now() - new Date(lastEntry.timestamp).getTime()) / (1000 * 60 * 60)
      : Infinity;

    // PRIMARY: Log pain (if >4h since last entry or no entries)
    if (hoursSinceLastEntry > 4 || entries.length === 0) {
      recommendations.push({
        id: 'log-pain',
        priority: 'primary',
        icon: Activity,
        title: 'Log pain now',
        subtitle: lastEntry
          ? `Last entry: ${Math.floor(hoursSinceLastEntry)}h ago`
          : 'Start your tracking journey',
        action: onLogNow,
        badge: 'Quick',
        estimatedTime: '~10s',
      });
    }

    // SECONDARY: Review trends (if 7+ entries)
    if (entries.length >= 7) {
      const last7Days = entries.filter(e => {
        const date = new Date(e.timestamp);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return date >= sevenDaysAgo;
      });

      if (last7Days.length >= 5) {
        recommendations.push({
          id: 'review-trends',
          priority: 'secondary',
          icon: TrendingUp,
          title: 'Review weekly trends',
          subtitle: `${last7Days.length} entries logged this week`,
          action: onViewAnalytics,
          estimatedTime: '2 min',
        });
      }
    }

    // SECONDARY: View calendar (if 3+ entries)
    if (entries.length >= 3) {
      recommendations.push({
        id: 'view-calendar',
        priority: 'secondary',
        icon: Calendar,
        title: 'View calendar',
        subtitle: 'See your pain patterns at a glance',
        action: onViewCalendar,
        estimatedTime: '1 min',
      });
    }

    // TERTIARY: Export report (if 7+ entries in last 7 days)
    const recentEntries = entries.filter(e => {
      const date = new Date(e.timestamp);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return date >= sevenDaysAgo;
    });

    if (recentEntries.length >= 7) {
      recommendations.push({
        id: 'export-report',
        priority: 'tertiary',
        icon: FileText,
        title: 'Share report with provider',
        subtitle: '7 days of data ready to export',
        action: onExport,
        badge: 'Ready',
        estimatedTime: '30s',
      });
    }

    // TERTIARY: Learn about patterns (if high variability)
    if (entries.length >= 7) {
      const painValues = recentEntries.map(e => e.baselineData.pain);
      const mean = painValues.reduce((sum, p) => sum + p, 0) / painValues.length;
      const variance =
        painValues.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / painValues.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev > 2) {
        recommendations.push({
          id: 'learn-patterns',
          priority: 'tertiary',
          icon: Lightbulb,
          title: 'Explore flare triggers',
          subtitle: 'High pain variability detected',
          action: onViewAnalytics,
          badge: 'Insight',
          estimatedTime: '3 min',
        });
      }
    }

    return recommendations;
  }, [entries, onLogNow, onViewCalendar, onViewAnalytics, onExport]);

  if (actions.length === 0) {
    return null;
  }

  const primaryAction = actions.find(a => a.priority === 'primary');
  const secondaryActions = actions.filter(a => a.priority === 'secondary');
  const tertiaryActions = actions.filter(a => a.priority === 'tertiary');

  return (
    <div className="surface-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-body-medium text-ink-100">Recommended for You</h2>
        <div className="flex items-center gap-1.5 text-ink-500">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-tiny">Updated just now</span>
        </div>
      </div>

      <div className="space-y-2">
        {/* Primary Action - Always prominent */}
        {primaryAction && (
          <button
            onClick={primaryAction.action}
            className={cn(
              'w-full flex items-center justify-between p-4 rounded-[var(--radius-md)]',
              'bg-primary-500 hover:bg-primary-400',
              'transition-all duration-[var(--duration-fast)]',
              'text-left group',
              'hover:scale-[1.01] active:scale-[0.99]'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ink-900/20 rounded-[var(--radius-sm)] group-hover:bg-ink-900/30 transition-colors">
                <primaryAction.icon className="w-5 h-5 text-ink-900" />
              </div>
              <div>
                <div className="text-body-medium text-ink-900 mb-0.5">{primaryAction.title}</div>
                <div className="text-tiny text-ink-800">
                  {primaryAction.subtitle}
                  {primaryAction.estimatedTime && ` • ${primaryAction.estimatedTime}`}
                </div>
              </div>
            </div>
            {primaryAction.badge && (
              <div className="text-tiny text-mono bg-ink-900/20 px-2.5 py-1 rounded-full text-ink-900 font-medium">
                {primaryAction.badge}
              </div>
            )}
          </button>
        )}

        {/* Secondary Actions - Medium prominence */}
        {secondaryActions.map(action => (
          <button
            key={action.id}
            onClick={action.action}
            className={cn(
              'w-full flex items-center justify-between p-3 rounded-[var(--radius-md)]',
              'bg-surface-700 hover:bg-surface-600 border border-surface-600',
              'transition-all duration-[var(--duration-fast)]',
              'text-left group',
              'hover:border-surface-500'
            )}
          >
            <div className="flex items-center gap-3">
              <action.icon className="w-4 h-4 text-ink-400 group-hover:text-ink-300 transition-colors" />
              <div>
                <span className="text-small text-ink-200 group-hover:text-ink-100 transition-colors">
                  {action.title}
                </span>
                <div className="text-tiny text-ink-400 mt-0.5">
                  {action.subtitle}
                  {action.estimatedTime && ` • ${action.estimatedTime}`}
                </div>
              </div>
            </div>
            {action.badge && (
              <div className="text-tiny text-mono bg-surface-600 px-2 py-0.5 rounded text-ink-400 border border-surface-500">
                {action.badge}
              </div>
            )}
          </button>
        ))}

        {/* Tertiary Actions - Subtle */}
        {tertiaryActions.map(action => (
          <button
            key={action.id}
            onClick={action.action}
            className={cn(
              'w-full flex items-center justify-between p-2.5 rounded-[var(--radius-sm)]',
              'hover:bg-surface-800/50',
              'transition-colors duration-[var(--duration-fast)]',
              'text-left group'
            )}
          >
            <div className="flex items-center gap-2.5">
              <action.icon className="w-3.5 h-3.5 text-ink-500 group-hover:text-ink-400 transition-colors" />
              <div>
                <span className="text-small text-ink-300 group-hover:text-ink-200 transition-colors">
                  {action.title}
                </span>
                <div className="text-tiny text-ink-500 mt-0.5">{action.subtitle}</div>
              </div>
            </div>
            {action.badge && (
              <div className="text-tiny text-mono px-2 py-0.5 rounded text-ink-500">
                {action.badge}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
