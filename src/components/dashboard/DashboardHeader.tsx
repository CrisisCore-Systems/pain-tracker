import React from 'react';
import { ListFilter, Settings } from 'lucide-react';
import { Button, Badge } from '../../design-system';

interface DashboardHeaderProps {
  totalEntries: number;
  visibleEntries: number;
  activeFilterCount: number;
  filterSummary: string | null;
  onOpenFilters: () => void;
  onOpenCustomize: () => void;
}

export function DashboardHeader({
  totalEntries,
  visibleEntries,
  activeFilterCount,
  filterSummary,
  onOpenFilters,
  onOpenCustomize
}: DashboardHeaderProps) {
  const hasFiltersActive = activeFilterCount > 0 || visibleEntries !== totalEntries;
  const showingPercentage = totalEntries === 0
    ? 100
    : Math.round((visibleEntries / totalEntries) * 100);
  const safeFilterCount = activeFilterCount > 99 ? '99+' : activeFilterCount;

  const stats = [
    {
      label: 'Entries tracked',
      value: totalEntries,
      sublabel: totalEntries === 0 ? 'Start with your first entry' : 'All time',
    },
    {
      label: 'Currently showing',
      value: visibleEntries,
      sublabel: `Focus view • ${showingPercentage}%`,
    },
    {
      label: 'Filters active',
      value: activeFilterCount,
      sublabel: hasFiltersActive ? 'Tap to adjust' : 'None applied',
    },
  ];

  const filterLabel = filterSummary ?? `${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}`;

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card/95 to-card shadow-sm shadow-primary/5 p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary/70">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary/70" aria-hidden="true" />
              Personalized overview
            </div>
            <div className="space-y-2">
              <h2 className="text-balance text-3xl font-semibold text-foreground">Custom dashboard, intentionally calmer</h2>
              <p className="text-base text-muted-foreground">
                Reduce overwhelm with curated widgets, flexible focus modes, and trauma-informed pacing.
              </p>
            </div>
          </div>
          <div className="w-full max-w-xl grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border/50 bg-background/70 backdrop-blur-sm px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {stat.label === 'Filters active' ? safeFilterCount : stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/80">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>

        {hasFiltersActive && (
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
              <ListFilter className="h-4 w-4" />
              {filterLabel}
            </span>
            <button
              type="button"
              onClick={onOpenFilters}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Adjust filters
            </button>
            <span className="text-muted-foreground">
              Showing {visibleEntries} of {totalEntries} entries
            </span>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant={activeFilterCount > 0 ? 'default' : 'outline'}
            onClick={onOpenFilters}
            leftIcon={<ListFilter className="h-4 w-4" />}
            className="min-w-[150px]"
          >
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {safeFilterCount}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onOpenCustomize}
            leftIcon={<Settings className="h-4 w-4" />}
            className="min-w-[150px]"
          >
            Customize
          </Button>
        </div>
      </div>
    </section>
  );
}
