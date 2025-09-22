import { useState, useEffect } from 'react';
import type { FilterCriteria, SavedFilter } from '../components/dashboard/AdvancedFilters';

const SAVED_FILTERS_KEY = 'pain-tracker-saved-filters';

export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // Load saved filters from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVED_FILTERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedFilters(parsed);
      }
    } catch (error) {
      console.error('Failed to load saved filters:', error);
    }
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(savedFilters));
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
    setSavedFilters(prev => prev.map(f =>
      f.id === filterId
        ? { ...f, name: name.trim(), criteria: { ...criteria } }
        : f
    ));
  };

  return {
    savedFilters,
    saveFilter,
    loadFilter,
    deleteFilter,
    updateFilter,
  };
}
