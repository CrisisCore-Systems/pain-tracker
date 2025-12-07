import { useState, useEffect } from 'react';
import type { FilterCriteria, SavedFilter } from '../components/dashboard/AdvancedFilters';
import { secureStorage } from '../lib/storage/secureStorage';

const SAVED_FILTERS_KEY = 'saved-filters';

export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // Load saved filters from secureStorage on mount
  useEffect(() => {
    try {
      const stored = secureStorage.get<SavedFilter[]>(SAVED_FILTERS_KEY);
      if (stored && Array.isArray(stored)) {
        setSavedFilters(stored);
      }
    } catch (error) {
      console.error('Failed to load saved filters:', error);
    }
  }, []);

  // Save filters to secureStorage whenever they change
  useEffect(() => {
    try {
      secureStorage.set(SAVED_FILTERS_KEY, savedFilters);
    } catch (error) {
      console.error('Failed to save filters:', error);
    }
  }, [savedFilters]);

  const saveFilter = (name: string, criteria: FilterCriteria) => {
    const newFilter: SavedFilter = {
      id: `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      criteria: { ...criteria },
      createdAt: new Date().toISOString(),
    };

    setSavedFilters(prev => [...prev, newFilter]);
    return newFilter;
  };

  const loadFilter = (filter: SavedFilter) => {
    return filter.criteria;
  };

  const deleteFilter = (filterId: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== filterId));
  };

  const updateFilter = (filterId: string, name: string, criteria: FilterCriteria) => {
    setSavedFilters(prev =>
      prev.map(f =>
        f.id === filterId ? { ...f, name: name.trim(), criteria: { ...criteria } } : f
      )
    );
  };

  return {
    savedFilters,
    saveFilter,
    loadFilter,
    deleteFilter,
    updateFilter,
  };
}
