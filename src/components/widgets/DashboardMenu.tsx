import React from 'react';
import { BarChart3, LineChart, History } from 'lucide-react';
import { Button } from '../../design-system';
import { cn } from '../../design-system/utils';
import { glassmorphism } from '../../design-system/theme/effects';

export type DashboardTab = 'overview' | 'charts' | 'recent';

const tabs: Array<{
  id: DashboardTab;
  label: string;
  icon: React.ElementType;
  description: string;
}> = [
  {
    id: 'overview',
    label: 'Overview',
    icon: BarChart3,
    description: 'Snapshot of today and key metrics',
  },
  {
    id: 'charts',
    label: 'Insights',
    icon: LineChart,
    description: 'Interactive charts and advanced trends',
  },
  {
    id: 'recent',
    label: 'Recent',
    icon: History,
    description: 'Latest entries and quick review',
  },
];

export function DashboardMenu({
  active,
  onChange,
}: {
  active: DashboardTab;
  onChange: (t: DashboardTab) => void;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
      <div className="flex items-center space-x-3">
        <div
          className={cn(
            'inline-flex items-center gap-2 rounded-full border border-border/40 px-4 py-2 text-xs font-medium text-muted-foreground',
            glassmorphism.nav,
            'shadow-[0_8px_24px_-12px_rgba(15,23,42,0.35)] backdrop-saturate-[1.2]'
          )}
        >
          <span className="hidden sm:inline">Navigate dashboard</span>
          <span className="sm:hidden">Sections</span>
        </div>
      </div>

      <div
        className={cn(
          'relative flex w-full flex-wrap items-center justify-start gap-2 rounded-2xl border border-border/40 p-1 md:w-auto',
          glassmorphism.nav,
          'shadow-lg shadow-primary/5 backdrop-blur-xl transition-colors'
        )}
        role="tablist"
        aria-label="Dashboard sections"
      >
        {tabs.map(tab => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              type="button"
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative flex items-center space-x-2 rounded-2xl px-4 py-2 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/60',
                'min-h-[40px] min-w-[40px] text-sm',
                isActive
                  ? 'shadow-[0_12px_30px_-12px_rgba(37,99,235,0.55)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'
              )}
              role="tab"
              aria-selected={isActive}
              aria-pressed={isActive}
            >
              <Icon
                className={cn('h-4 w-4', isActive ? 'text-primary-foreground' : 'text-primary')}
                aria-hidden="true"
              />
              <span>{tab.label}</span>
              <span className="sr-only">{tab.description}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardMenu;
