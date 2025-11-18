import React from 'react';
import { Card, CardContent, Button } from '../../design-system';
import { cn } from '../../design-system/utils';
import type { PainEntry } from '../../types';
import type { DashboardLayout } from './constants';
import { DashboardWidget } from './DashboardWidget';
import type { DashboardSectionDefinition, DashboardSection } from './dashboardSectionConfig';

interface DashboardGridSectionProps {
  layout: Pick<DashboardLayout, 'layout' | 'columns'>;
  widgets: DashboardLayout['widgets'];
  filteredEntries: PainEntry[];
  allEntries: PainEntry[];
  activeSection: DashboardSection;
  sections: DashboardSectionDefinition[];
  onAddEntry: (entry: Omit<PainEntry, 'id' | 'timestamp'>) => void;
  onStartWalkthrough: () => void;
  onOpenGoalManager?: () => void;
  onShowFilters: () => void;
  onShowWidgetManager: () => void;
  draggedWidget: string | null;
  onDragStart: (widgetId: string) => void;
  onDragEnd: () => void;
  onDrop: (targetWidgetId: string) => void;
}

function getGridLayoutClasses(layout: Pick<DashboardLayout, 'layout' | 'columns'>) {
  if (layout.layout === 'list') {
    return 'flex flex-col gap-6';
  }

  const safeColumns = layout.columns === 1 ? 1 : 2;
  const baseGrid = 'grid gap-6 auto-rows-[minmax(120px,_auto)]';

  if (layout.layout === 'masonry') {
    return cn(baseGrid, safeColumns === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2');
  }

  const columnClass = safeColumns === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2';

  return cn(baseGrid, columnClass);
}

export function DashboardGridSection({
  layout,
  widgets,
  filteredEntries,
  allEntries,
  activeSection,
  sections,
  onAddEntry,
  onStartWalkthrough,
  onOpenGoalManager,
  onShowFilters,
  onShowWidgetManager,
  draggedWidget,
  onDragStart,
  onDragEnd,
  onDrop,
}: DashboardGridSectionProps) {
  const sectionDefinition = sections.find(section => section.id === activeSection);
  const sectionLabel = sectionDefinition?.label ?? 'current';
  const gridClasses = getGridLayoutClasses(layout);
  const isEmpty = widgets.length === 0;

  return (
    <section aria-live="polite" className="space-y-4">
      {isEmpty ? (
        <Card className="border-dashed border-border/60 bg-background/40">
          <CardContent className="flex flex-col gap-3 py-12 text-center">
            <h3 className="text-lg font-semibold text-foreground">
              This space is clear and ready.
            </h3>
            <p className="text-sm text-muted-foreground">
              Add widgets that fit your {sectionLabel.toLowerCase()} view, or adjust filters to see
              more data.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" onClick={onShowWidgetManager}>
                Manage widgets
              </Button>
              <Button variant="ghost" onClick={onShowFilters}>
                Open filters
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={cn('w-full', gridClasses)}>
          {widgets.map(widget => (
            <div
              key={widget.id}
              className={cn('min-w-0', layout.layout === 'masonry' && 'break-inside-avoid')}
            >
              <DashboardWidget
                widget={widget}
                entries={filteredEntries}
                allEntries={allEntries}
                onAddEntry={onAddEntry}
                onStartWalkthrough={onStartWalkthrough}
                onOpenGoalManager={onOpenGoalManager}
                onDragStart={(event, widgetId) => {
                  event.dataTransfer?.setData('text/plain', widgetId);
                  onDragStart(widgetId);
                }}
                onDragEnd={event => {
                  event.preventDefault();
                  onDragEnd();
                }}
                onDrop={(event, widgetId) => {
                  event.preventDefault();
                  onDrop(widgetId);
                }}
                isDragging={draggedWidget === widget.id}
                layout={layout.layout}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
