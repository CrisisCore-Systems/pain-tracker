/**
 * Customizable Dashboard Widgets System
 * Allows users to add, remove, and rearrange dashboard widgets with persistent preferences
 */

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../../design-system/utils';
import { type FilterCriteria, type SavedFilter } from './AdvancedFilters';
import { useSavedFilters } from '../../hooks/useSavedFilters';
import type { PainEntry } from '../../types';
import { WidgetManagementModal } from './WidgetManagementModal';
import { useDashboardLayout } from './useDashboardLayout';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSectionNavigation } from './DashboardSectionNavigation';
import { DashboardGridSection } from './DashboardGridSection';
import { DashboardFiltersModal } from './DashboardFiltersModal';
import {
  SECTION_WIDGETS,
  DASHBOARD_SECTIONS,
  type DashboardSection,
} from './dashboardSectionConfig';

function getFilterSummary(criteria: FilterCriteria | null, activeCount: number): string | null {
  if (!criteria || activeCount === 0) {
    return null;
  }

  const summaryCandidates: Array<() => string | null> = [
    () => (criteria.searchText ? `Search: "${criteria.searchText}"` : null),
    () =>
      criteria.painLevelRange.min !== 1 || criteria.painLevelRange.max !== 10
        ? `Pain ${criteria.painLevelRange.min}-${criteria.painLevelRange.max}`
        : null,
    () =>
      criteria.locations.length > 0
        ? `${criteria.locations.length} location${criteria.locations.length === 1 ? '' : 's'}`
        : null,
    () =>
      criteria.symptoms.length > 0
        ? `${criteria.symptoms.length} symptom${criteria.symptoms.length === 1 ? '' : 's'}`
        : null,
    () =>
      criteria.workImpact.hasMissedWork || criteria.workImpact.hasModifiedDuties
        ? 'Work impact'
        : null,
    () =>
      criteria.medications.length > 0
        ? `${criteria.medications.length} medication${criteria.medications.length === 1 ? '' : 's'}`
        : null,
    () =>
      criteria.treatments.length > 0
        ? `${criteria.treatments.length} treatment${criteria.treatments.length === 1 ? '' : 's'}`
        : null,
    () =>
      criteria.sleepQualityRange.min !== 1 || criteria.sleepQualityRange.max !== 10
        ? `Sleep ${criteria.sleepQualityRange.min}-${criteria.sleepQualityRange.max}`
        : null,
    () =>
      criteria.moodImpactRange.min !== 1 || criteria.moodImpactRange.max !== 10
        ? `Mood ${criteria.moodImpactRange.min}-${criteria.moodImpactRange.max}`
        : null,
  ];

  const summaryParts: string[] = [];
  for (const candidate of summaryCandidates) {
    const value = candidate();
    if (value) {
      summaryParts.push(value);
    }
  }

  const summaryText = summaryParts.slice(0, 3).join(' • ');
  return summaryText || `${activeCount} filters active`;
}

// Main Customizable Dashboard Component
interface CustomizableDashboardProps {
  entries: PainEntry[];
  onAddEntry: (entry: Omit<PainEntry, 'id' | 'timestamp'>) => void;
  onStartWalkthrough: () => void;
  onOpenGoalManager?: () => void;
  className?: string;
}

export function CustomizableDashboard({
  entries,
  onAddEntry,
  onStartWalkthrough,
  onOpenGoalManager,
  className,
}: CustomizableDashboardProps) {
  const { layout, isLoaded, toggleWidget, resetLayout, updateLayoutSettings } =
    useDashboardLayout();

  const [showWidgetManager, setShowWidgetManager] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [filteredEntries, setFilteredEntries] = useState<PainEntry[]>(entries);
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);
  const [lastCriteria, setLastCriteria] = useState<FilterCriteria | null>(null);
  const [filterSummary, setFilterSummary] = useState<string | null>(null);
  const { savedFilters, saveFilter, deleteFilter } = useSavedFilters();

  // Update filtered entries when entries change
  useEffect(() => {
    setFilteredEntries(entries);
  }, [entries]);

  useEffect(() => {
    setFilterSummary(getFilterSummary(lastCriteria, activeFilterCount));
  }, [lastCriteria, activeFilterCount]);

  // Get visible widgets sorted by position
  const visibleWidgets = layout.widgets
    .filter(widget => widget.visible)
    .sort((a, b) => a.position - b.position);

  const sectionWidgetTypes = SECTION_WIDGETS[activeSection] ?? [];
  const sectionWidgets =
    sectionWidgetTypes.length > 0
      ? visibleWidgets.filter(widget => sectionWidgetTypes.includes(widget.type))
      : visibleWidgets;

  // Handle drag start
  const handleDragStart = (widgetId: string) => {
    setDraggedWidget(widgetId);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  // Handle drop
  const handleDrop = (targetWidgetId: string) => {
    if (!draggedWidget || draggedWidget === targetWidgetId) return;

    const draggedIndex = layout.widgets.findIndex(w => w.id === draggedWidget);
    const targetIndex = layout.widgets.findIndex(w => w.id === targetWidgetId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Reorder widgets
      const newWidgets = Array.from(layout.widgets);
      const [removed] = newWidgets.splice(draggedIndex, 1);
      newWidgets.splice(targetIndex, 0, removed);

      // Update positions
      const updatedWidgets = newWidgets.map((widget, index) => ({
        ...widget,
        position: index,
      }));

      updateLayoutSettings({ widgets: updatedWidgets });
    }
  };

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilteredEntries: PainEntry[]) => {
    setFilteredEntries(newFilteredEntries);
  }, []);

  const handleCriteriaChange = useCallback((criteria: FilterCriteria) => {
    setLastCriteria(criteria);
  }, []);

  const handleActiveFiltersChange = useCallback((count: number) => {
    setActiveFilterCount(count);
  }, []);

  // Handle saving a filter
  const handleSaveFilter = useCallback(
    (name: string, criteria: FilterCriteria) => {
      saveFilter(name, criteria);
    },
    [saveFilter]
  );

  // Handle loading a filter
  const handleLoadFilter = useCallback((filter: SavedFilter) => {
    // The filter criteria will be applied through the AdvancedFilters component
    // Log in development for debugging
    if (import.meta.env.DEV) {
      console.log('Loading filter:', filter.name);
    }
  }, []);

  // Handle deleting a filter
  const handleDeleteFilter = useCallback(
    (filterId: string) => {
      deleteFilter(filterId);
    },
    [deleteFilter]
  );

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <DashboardHeader
        totalEntries={entries.length}
        visibleEntries={filteredEntries.length}
        activeFilterCount={activeFilterCount}
        filterSummary={filterSummary}
        onOpenFilters={() => setShowFilters(true)}
        onOpenCustomize={() => setShowWidgetManager(true)}
      />

      <DashboardSectionNavigation
        sections={DASHBOARD_SECTIONS}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <DashboardGridSection
        layout={layout}
        widgets={sectionWidgets}
        filteredEntries={filteredEntries}
        allEntries={entries}
        activeSection={activeSection}
        sections={DASHBOARD_SECTIONS}
        onAddEntry={onAddEntry}
        onStartWalkthrough={onStartWalkthrough}
        onOpenGoalManager={onOpenGoalManager}
        onShowFilters={() => setShowFilters(true)}
        onShowWidgetManager={() => setShowWidgetManager(true)}
        draggedWidget={draggedWidget}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
      />

      <DashboardFiltersModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        entries={entries}
        savedFilters={savedFilters}
        onFiltersChange={handleFiltersChange}
        onSaveFilter={handleSaveFilter}
        onLoadFilter={handleLoadFilter}
        onDeleteFilter={handleDeleteFilter}
        onCriteriaChange={handleCriteriaChange}
        onActiveFiltersChange={handleActiveFiltersChange}
      />

      {/* Widget Management Modal */}
      <WidgetManagementModal
        isOpen={showWidgetManager}
        onClose={() => setShowWidgetManager(false)}
        layout={layout}
        onToggleWidget={toggleWidget}
        onResetLayout={resetLayout}
        onUpdateLayoutSettings={updateLayoutSettings}
      />
    </div>
  );
}
