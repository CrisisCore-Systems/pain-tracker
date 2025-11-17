import React, { useMemo } from 'react';
import {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardTitle,
  EnhancedCardContent,
} from '../../design-system/components/EnhancedCard';
import { Clock, CheckCircle, Activity, AlertTriangle, Zap } from 'lucide-react';
import type { PainEntry } from '../../types';
import { cn } from '../../design-system/utils';
import { Badge } from '../../design-system';
import { StaggeredChildren } from '../../design-system/components/PageTransition';
import { gradients } from '../../design-system/theme/gradients';
function getSeverityMeta(pain: number) {
  if (pain <= 2) {
    return {
      label: 'Mild',
      gradientClass: `${gradients.healing} text-white`,
      indicatorClass: gradients.healing,
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" aria-hidden="true" />,
      message: 'Gentle day logged. Celebrate the moments of ease.',
      accent: 'text-emerald-500',
    };
  }

  if (pain <= 5) {
    return {
      label: 'Moderate',
      gradientClass: `${gradients.alert} text-white`,
      indicatorClass: gradients.alert,
      icon: <Activity className="h-5 w-5 text-amber-500" aria-hidden="true" />,
      message: 'Notice what supports you around these pain levels.',
      accent: 'text-amber-500',
    };
  }

  if (pain <= 8) {
    return {
      label: 'Severe',
      gradientClass: `${gradients.critical} text-white`,
      indicatorClass: gradients.critical,
      icon: <AlertTriangle className="h-5 w-5 text-orange-500" aria-hidden="true" />,
      message: 'A more intense moment. Make note of what you need.',
      accent: 'text-orange-500',
    };
  }

  return {
    label: 'Extreme',
    gradientClass: `${gradients.critical} text-white`,
    indicatorClass: gradients.critical,
    icon: <Zap className="h-5 w-5 text-rose-500" aria-hidden="true" />,
    message: 'Thank you for tracking this difficult moment—share with your care team.',
    accent: 'text-rose-500',
  };
}

export function DashboardRecent({ entries }: { entries: PainEntry[] }) {
  const recent = useMemo(
    () =>
      entries
        .slice()
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5),
    [entries]
  );

  const relativeFormatter = useMemo(
    () => new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }),
    []
  );
  const absoluteFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
    []
  );

  const getRelativeTimeLabel = React.useCallback(
    (timestamp: string) => {
      const date = new Date(timestamp);
      if (Number.isNaN(date.getTime())) return 'Unknown time';

      const diffMs = date.getTime() - Date.now();
      const diffMinutes = Math.round(diffMs / 60000);

      if (Math.abs(diffMinutes) < 60) {
        return relativeFormatter.format(diffMinutes, 'minute');
      }

      const diffHours = Math.round(diffMinutes / 60);
      if (Math.abs(diffHours) < 24) {
        return relativeFormatter.format(diffHours, 'hour');
      }

      const diffDays = Math.round(diffHours / 24);
      return relativeFormatter.format(diffDays, 'day');
    },
    [relativeFormatter]
  );

  return (
    <EnhancedCard
      variant="glass"
      hoverable
      animated
      className="relative overflow-hidden border border-border/40 bg-card/70 backdrop-blur-xl"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
        aria-hidden="true"
      />
      <EnhancedCardHeader icon={<Clock className="h-5 w-5" />}>
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div>
            <EnhancedCardTitle gradient>Recent Activity</EnhancedCardTitle>
            <p className="text-sm text-muted-foreground">
              Your latest entries with gentle prompts for reflection.
            </p>
          </div>
          <Badge
            variant="outline"
            className="rounded-full border-primary/20 bg-primary/5 text-xs text-primary"
          >
            {recent.length > 0 ? `${recent.length} highlighted` : 'Nothing logged yet'}
          </Badge>
        </div>
      </EnhancedCardHeader>
      <EnhancedCardContent>
        {recent.length > 0 ? (
          <div className="relative pl-6">
            <div
              className="absolute left-[10px] top-3 bottom-3 w-px bg-gradient-to-b from-primary/30 via-primary/15 to-transparent"
              aria-hidden="true"
            />
            <StaggeredChildren className="space-y-4" delay={80}>
              {recent.map((item, index) => {
                const severity = getSeverityMeta(item.baselineData.pain);
                const entryDate = new Date(item.timestamp);
                const relativeLabel = getRelativeTimeLabel(item.timestamp);
                const absoluteLabel = Number.isNaN(entryDate.getTime())
                  ? 'Unknown time'
                  : absoluteFormatter.format(entryDate);
                const symptoms = (
                  (item as unknown as { symptoms?: string[] }).symptoms ?? []
                ).filter(Boolean);
                const quality =
                  (
                    item as unknown as {
                      qualityOfLife?: { sleepQuality: number; moodImpact: number };
                    }
                  ).qualityOfLife ?? null;

                return (
                  <div key={item.id} className="relative pl-6">
                    {index !== recent.length - 1 && (
                      <div
                        className="absolute left-[-26px] top-12 bottom-[-24px] w-px bg-gradient-to-b from-primary/20 via-primary/10 to-transparent"
                        aria-hidden="true"
                      />
                    )}
                    <div className="absolute left-[-32px] top-10 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 shadow-inner">
                      <span
                        className={cn(
                          'block h-3.5 w-3.5 rounded-full shadow',
                          severity.indicatorClass
                        )}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="rounded-2xl border border-border/40 bg-card/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl backdrop-blur-lg">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
                            {severity.icon}
                          </span>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">
                                Pain level {item.baselineData.pain}/10
                              </span>
                              <span
                                className={cn(
                                  'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm',
                                  severity.gradientClass
                                )}
                              >
                                {severity.label}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Logged {relativeLabel} • {absoluteLabel}
                            </p>
                          </div>
                        </div>

                        {quality && (
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <Badge
                              variant="outline"
                              className="rounded-full border-emerald-300/40 bg-emerald-300/15 text-emerald-700 dark:text-emerald-300"
                            >
                              Sleep {quality.sleepQuality}/10
                            </Badge>
                            <Badge
                              variant="outline"
                              className="rounded-full border-sky-300/40 bg-sky-300/15 text-sky-700 dark:text-sky-300"
                            >
                              Mood {quality.moodImpact}/10
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        {symptoms.length > 0 ? (
                          <>
                            {symptoms.slice(0, 3).map(symptom => (
                              <Badge
                                key={symptom}
                                variant="secondary"
                                className="rounded-full bg-primary/10 text-primary"
                              >
                                {symptom}
                              </Badge>
                            ))}
                            {symptoms.length > 3 && (
                              <span className="text-muted-foreground">
                                +{symptoms.length - 3} more
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">No symptoms recorded</span>
                        )}
                      </div>

                      <p className={cn('mt-4 text-xs font-medium', severity.accent)}>
                        {severity.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </StaggeredChildren>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-dashed border-border/60 bg-card/60 px-8 py-12 text-center text-muted-foreground">
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent"
              aria-hidden="true"
            />
            <Clock className="mx-auto mb-4 h-12 w-12 opacity-50" aria-hidden="true" />
            <p className="text-base font-medium text-foreground">No recent activity yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Entries you add will appear here with supportive summaries.
            </p>
          </div>
        )}
      </EnhancedCardContent>
    </EnhancedCard>
  );
}

export default DashboardRecent;
