import React from 'react';
import { Button, Modal } from '../../design-system';
import { AdvancedFilters, type FilterCriteria, type SavedFilter } from './AdvancedFilters';
import type { PainEntry } from '../../types';
import { X } from 'lucide-react';

interface DashboardFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: PainEntry[];
  savedFilters: SavedFilter[];
  onFiltersChange: (entries: PainEntry[]) => void;
  onSaveFilter: (name: string, criteria: FilterCriteria) => void;
  onLoadFilter: (filter: SavedFilter) => void;
  onDeleteFilter: (filterId: string) => void;
  onCriteriaChange: (criteria: FilterCriteria) => void;
  onActiveFiltersChange: (count: number) => void;
}

export function DashboardFiltersModal({
  isOpen,
  onClose,
  entries,
  savedFilters,
  onFiltersChange,
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter,
  onCriteriaChange,
  onActiveFiltersChange
}: DashboardFiltersModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" aria-label="Advanced dashboard filters">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Advanced Filters</h2>
            <p className="text-sm text-muted-foreground">
              Focus on the entries that matter today. Filters stay saved for future visits.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <AdvancedFilters
          entries={entries}
          onFiltersChange={onFiltersChange}
          savedFilters={savedFilters}
          onSaveFilter={onSaveFilter}
          onLoadFilter={onLoadFilter}
          onDeleteFilter={onDeleteFilter}
          onCriteriaChange={onCriteriaChange}
          onActiveFiltersChange={onActiveFiltersChange}
        />
      </div>
    </Modal>
  );
}
