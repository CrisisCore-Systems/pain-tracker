import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { Button } from '../../design-system';
import { Badge } from '../../design-system';
import { Input } from '../../design-system';
import { Search, Filter, X, Save, Bookmark } from 'lucide-react';
import type { PainEntry } from '../../types';

export interface FilterCriteria {
  dateRange: {
    start: string;
    end: string;
  };
  painLevelRange: {
    min: number;
    max: number;
  };
  locations: string[];
  symptoms: string[];
  medications: string[];
  treatments: string[];
  sleepQualityRange: {
    min: number;
    max: number;
  };
  moodImpactRange: {
    min: number;
    max: number;
  };
  workImpact: {
    hasMissedWork: boolean;
    hasModifiedDuties: boolean;
  };
  searchText: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  criteria: FilterCriteria;
  createdAt: string;
}

interface AdvancedFiltersProps {
  entries: PainEntry[];
  onFiltersChange: (filteredEntries: PainEntry[]) => void;
  savedFilters: SavedFilter[];
  onSaveFilter: (name: string, criteria: FilterCriteria) => void;
  onLoadFilter: (filter: SavedFilter) => void;
  onDeleteFilter: (filterId: string) => void;
}

const defaultFilters: FilterCriteria = {
  dateRange: {
    start: '',
    end: '',
  },
  painLevelRange: {
    min: 1,
    max: 10,
  },
  locations: [],
  symptoms: [],
  medications: [],
  treatments: [],
  sleepQualityRange: {
    min: 1,
    max: 10,
  },
  moodImpactRange: {
    min: 1,
    max: 10,
  },
  workImpact: {
    hasMissedWork: false,
    hasModifiedDuties: false,
  },
  searchText: '',
};

export function AdvancedFilters({
  entries,
  onFiltersChange,
  savedFilters,
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter,
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterCriteria>(defaultFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Load filters from URL on mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const filterParam = urlParams.get('filters');
      if (filterParam) {
        const parsedFilters = JSON.parse(decodeURIComponent(filterParam));
        setFilters(parsedFilters);
      }
    } catch (error) {
      console.warn('Failed to load filters from URL:', error);
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const hasActiveFilters = filters.searchText ||
        filters.dateRange.start ||
        filters.dateRange.end ||
        filters.painLevelRange.min !== 1 ||
        filters.painLevelRange.max !== 10 ||
        filters.locations.length > 0 ||
        filters.symptoms.length > 0 ||
        filters.medications.length > 0 ||
        filters.treatments.length > 0 ||
        filters.sleepQualityRange.min !== 1 ||
        filters.sleepQualityRange.max !== 10 ||
        filters.moodImpactRange.min !== 1 ||
        filters.moodImpactRange.max !== 10 ||
        filters.workImpact.hasMissedWork ||
        filters.workImpact.hasModifiedDuties;

      if (hasActiveFilters) {
        url.searchParams.set('filters', encodeURIComponent(JSON.stringify(filters)));
      } else {
        url.searchParams.delete('filters');
      }

      // Update URL without triggering a page reload
      window.history.replaceState({}, '', url.toString());
    } catch (error) {
      console.warn('Failed to update URL with filters:', error);
    }
  }, [filters]);

  // Extract unique values for filter options
  const filterOptions = useMemo(() => {
    const locations = new Set<string>();
    const symptoms = new Set<string>();
    const medications = new Set<string>();
    const treatments = new Set<string>();
    const searchTerms = new Set<string>();

    entries.forEach(entry => {
      if (entry.baselineData.locations) {
        entry.baselineData.locations.forEach(loc => {
          locations.add(loc);
          // Add to search terms for suggestions
          loc.toLowerCase().split(' ').forEach(word => searchTerms.add(word));
        });
      }
      if (entry.baselineData.symptoms) {
        entry.baselineData.symptoms.forEach(symptom => {
          symptoms.add(symptom);
          symptom.toLowerCase().split(' ').forEach(word => searchTerms.add(word));
        });
      }
      if (entry.medications?.current) {
        entry.medications.current.forEach(med => {
          medications.add(med.name);
          med.name.toLowerCase().split(' ').forEach(word => searchTerms.add(word));
        });
      }
      if (entry.treatments?.recent) {
        entry.treatments.recent.forEach(treatment => {
          treatments.add(treatment.type);
          treatment.type.toLowerCase().split(' ').forEach(word => searchTerms.add(word));
        });
      }

      // Add words from notes
      if (entry.notes) {
        entry.notes.toLowerCase().split(/\s+/).forEach(word => {
          if (word.length > 2) searchTerms.add(word);
        });
      }
    });

    return {
      locations: Array.from(locations).sort(),
      symptoms: Array.from(symptoms).sort(),
      medications: Array.from(medications).sort(),
      treatments: Array.from(treatments).sort(),
      searchTerms: Array.from(searchTerms).sort().slice(0, 20) // Limit to top 20 suggestions
    };
  }, [entries]);

  // Apply filters to entries
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Date range filter
      if (filters.dateRange.start && new Date(entry.timestamp) < new Date(filters.dateRange.start)) {
        return false;
      }
      if (filters.dateRange.end && new Date(entry.timestamp) > new Date(filters.dateRange.end)) {
        return false;
      }

      // Pain level filter
      if (entry.baselineData.pain < filters.painLevelRange.min ||
          entry.baselineData.pain > filters.painLevelRange.max) {
        return false;
      }

      // Location filter
      if (filters.locations.length > 0 &&
          !filters.locations.some(loc => entry.baselineData.locations?.includes(loc))) {
        return false;
      }

      // Symptoms filter
      if (filters.symptoms.length > 0 &&
          !filters.symptoms.some(symptom => entry.baselineData.symptoms?.includes(symptom))) {
        return false;
      }

      // Medications filter
      if (filters.medications.length > 0 &&
          !filters.medications.some(med =>
            entry.medications?.current?.some(entryMed => entryMed.name === med))) {
        return false;
      }

      // Treatments filter
      if (filters.treatments.length > 0 &&
          !filters.treatments.some(treatment =>
            entry.treatments?.recent?.some(entryTreatment => entryTreatment.type === treatment))) {
        return false;
      }

      // Sleep quality filter
      if (entry.qualityOfLife?.sleepQuality !== undefined &&
          (entry.qualityOfLife.sleepQuality < filters.sleepQualityRange.min ||
          entry.qualityOfLife.sleepQuality > filters.sleepQualityRange.max)) {
        return false;
      }

      // Mood impact filter
      if (entry.qualityOfLife?.moodImpact !== undefined &&
          (entry.qualityOfLife.moodImpact < filters.moodImpactRange.min ||
          entry.qualityOfLife.moodImpact > filters.moodImpactRange.max)) {
        return false;
      }

      // Work impact filter
      if (filters.workImpact.hasMissedWork && (entry.workImpact?.missedWork ?? 0) === 0) {
        return false;
      }
      if (filters.workImpact.hasModifiedDuties && (entry.workImpact?.modifiedDuties?.length ?? 0) === 0) {
        return false;
      }

      // Text search filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const searchableFields: (string | undefined)[] = [
          entry.notes,
          ...(entry.baselineData.symptoms || []),
          ...(entry.baselineData.locations || []),
          ...(entry.medications?.current?.map(m => m.name) || []),
          ...(entry.medications?.current?.map(m => m.dosage) || []),
          ...(entry.medications?.current?.map(m => m.effectiveness) || []),
          entry.medications?.changes,
          ...(entry.treatments?.recent?.map(t => t.type) || []),
          ...(entry.treatments?.recent?.map(t => t.provider) || []),
          ...(entry.treatments?.recent?.map(t => t.effectiveness) || []),
          entry.treatments?.effectiveness,
          entry.treatments?.planned?.join(' '),
          ...(entry.functionalImpact?.limitedActivities || []),
          ...(entry.functionalImpact?.assistanceNeeded || []),
          ...(entry.functionalImpact?.mobilityAids || []),
          ...(entry.workImpact?.modifiedDuties || []),
          ...(entry.workImpact?.workLimitations || []),
          entry.comparison?.worseningSince,
          ...(entry.comparison?.newLimitations || []),
          entry.qualityOfLife?.socialImpact?.join(' ')
        ];

        const hasMatch = searchableFields.some(field =>
          field && field.toString().toLowerCase().includes(searchLower)
        );

        if (!hasMatch) {
          return false;
        }
      }

      return true;
    });
  }, [entries, filters]);

  // Update parent component with filtered entries
  React.useEffect(() => {
    onFiltersChange(filteredEntries);
  }, [filteredEntries, onFiltersChange]);

  const updateFilter = (key: keyof FilterCriteria, value: FilterCriteria[keyof FilterCriteria]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNestedFilter = (parentKey: keyof FilterCriteria, childKey: string, value: unknown) => {
    setFilters(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as Record<string, unknown>),
        [childKey]: value,
      },
    }));
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.painLevelRange.min !== 1 || filters.painLevelRange.max !== 10) count++;
    if (filters.locations.length > 0) count++;
    if (filters.symptoms.length > 0) count++;
    if (filters.medications.length > 0) count++;
    if (filters.treatments.length > 0) count++;
    if (filters.sleepQualityRange.min !== 1 || filters.sleepQualityRange.max !== 10) count++;
    if (filters.moodImpactRange.min !== 1 || filters.moodImpactRange.max !== 10) count++;
    if (filters.workImpact.hasMissedWork || filters.workImpact.hasModifiedDuties) count++;
    if (filters.searchText) count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const handleSaveFilter = () => {
    if (saveFilterName.trim()) {
      onSaveFilter(saveFilterName.trim(), filters);
      setSaveFilterName('');
      setShowSaveDialog(false);
    }
  };

  const handleShareFilters = useCallback(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('filters', encodeURIComponent(JSON.stringify(filters)));
      navigator.clipboard.writeText(url.toString());
      // You could add a toast notification here
      console.log('Filter URL copied to clipboard:', url.toString());
    } catch (error) {
      console.error('Failed to copy filter URL:', error);
    }
  }, [filters]);

  const hasActiveFilters = useMemo(() => {
    return filters.searchText ||
      filters.dateRange.start ||
      filters.dateRange.end ||
      filters.painLevelRange.min !== 1 ||
      filters.painLevelRange.max !== 10 ||
      filters.locations.length > 0 ||
      filters.symptoms.length > 0 ||
      filters.medications.length > 0 ||
      filters.treatments.length > 0 ||
      filters.sleepQualityRange.min !== 1 ||
      filters.sleepQualityRange.max !== 10 ||
      filters.moodImpactRange.min !== 1 ||
      filters.moodImpactRange.max !== 10 ||
      filters.workImpact.hasMissedWork ||
      filters.workImpact.hasModifiedDuties;
  }, [filters]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Advanced Filters & Search</span>
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 border-transparent"
                style={{
                  backgroundColor: 'hsl(var(--color-badge-bg))',
                  color: 'hsl(var(--color-badge-foreground))'
                }}
              >
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={activeFiltersCount === 0}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareFilters}
                title="Copy shareable link with current filters"
              >
                <Save className="h-4 w-4 mr-1" />
                Share
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search across all fields (notes, symptoms, medications, treatments...)"
                value={filters.searchText}
                onChange={(e) => updateFilter('searchText', e.target.value)}
                className="pl-9 pr-9"
              />
              {filters.searchText && (
                <button
                  onClick={() => updateFilter('searchText', '')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {filters.searchText && (
              <div className="text-xs text-muted-foreground">
                Searching across: notes, symptoms, locations, medications, treatments, functional impact, work impact, and more
              </div>
            )}
            {!filters.searchText && filterOptions.searchTerms.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-muted-foreground mb-1">Popular search terms:</div>
                <div className="flex flex-wrap gap-1">
                  {filterOptions.searchTerms.slice(0, 8).map(term => (
                    <button
                      key={term}
                      onClick={() => updateFilter('searchText', term)}
                      className="text-xs px-2 py-1 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex space-x-2">
              <Input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => updateNestedFilter('dateRange', 'start', e.target.value)}
                placeholder="Start date"
              />
              <Input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => updateNestedFilter('dateRange', 'end', e.target.value)}
                placeholder="End date"
              />
            </div>
          </div>

          {/* Pain Level Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Pain Level ({filters.painLevelRange.min}-{filters.painLevelRange.max})</label>
            <div className="flex space-x-2">
              <Input
                type="number"
                min="1"
                max="10"
                value={filters.painLevelRange.min}
                onChange={(e) => updateNestedFilter('painLevelRange', 'min', parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <Input
                type="number"
                min="1"
                max="10"
                value={filters.painLevelRange.max}
                onChange={(e) => updateNestedFilter('painLevelRange', 'max', parseInt(e.target.value) || 10)}
                className="w-20"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Results</label>
            <div className="text-2xl font-bold text-primary">
              {filteredEntries.length}
            </div>
            <div className="text-xs text-muted-foreground">
              of {entries.length} entries
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Locations */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Locations</label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {filterOptions.locations.map(location => (
                    <div key={location} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`location-${location}`}
                        checked={filters.locations.includes(location)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter('locations', [...filters.locations, location]);
                          } else {
                            updateFilter('locations', filters.locations.filter(l => l !== location));
                          }
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={`location-${location}`} className="text-sm">
                        {location}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Symptoms</label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {filterOptions.symptoms.map(symptom => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`symptom-${symptom}`}
                        checked={filters.symptoms.includes(symptom)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter('symptoms', [...filters.symptoms, symptom]);
                          } else {
                            updateFilter('symptoms', filters.symptoms.filter(s => s !== symptom));
                          }
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={`symptom-${symptom}`} className="text-sm">
                        {symptom}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medications */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Medications</label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {filterOptions.medications.map(medication => (
                    <div key={medication} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`medication-${medication}`}
                        checked={filters.medications.includes(medication)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter('medications', [...filters.medications, medication]);
                          } else {
                            updateFilter('medications', filters.medications.filter(m => m !== medication));
                          }
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={`medication-${medication}`} className="text-sm">
                        {medication}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Treatments */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Treatments</label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {filterOptions.treatments.map(treatment => (
                    <div key={treatment} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`treatment-${treatment}`}
                        checked={filters.treatments.includes(treatment)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilter('treatments', [...filters.treatments, treatment]);
                          } else {
                            updateFilter('treatments', filters.treatments.filter(t => t !== treatment));
                          }
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={`treatment-${treatment}`} className="text-sm">
                        {treatment}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sleep Quality */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sleep Quality ({filters.sleepQualityRange.min}-{filters.sleepQualityRange.max})</label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={filters.sleepQualityRange.min}
                    onChange={(e) => updateNestedFilter('sleepQualityRange', 'min', parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={filters.sleepQualityRange.max}
                    onChange={(e) => updateNestedFilter('sleepQualityRange', 'max', parseInt(e.target.value) || 10)}
                    className="w-20"
                  />
                </div>
              </div>

              {/* Mood Impact */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Mood Impact ({filters.moodImpactRange.min}-{filters.moodImpactRange.max})</label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={filters.moodImpactRange.min}
                    onChange={(e) => updateNestedFilter('moodImpactRange', 'min', parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={filters.moodImpactRange.max}
                    onChange={(e) => updateNestedFilter('moodImpactRange', 'max', parseInt(e.target.value) || 10)}
                    className="w-20"
                  />
                </div>
              </div>
            </div>

            {/* Work Impact */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Work Impact</label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="has-missed-work"
                    checked={filters.workImpact.hasMissedWork}
                    onChange={(e) => updateNestedFilter('workImpact', 'hasMissedWork', e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="has-missed-work" className="text-sm">
                    Has missed work
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="has-modified-duties"
                    checked={filters.workImpact.hasModifiedDuties}
                    onChange={(e) => updateNestedFilter('workImpact', 'hasModifiedDuties', e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="has-modified-duties" className="text-sm">
                    Has modified duties
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Saved Filters</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
              >
                <Save className="h-4 w-4 mr-1" />
                Save Current
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map(filter => (
                <Button
                  key={filter.id}
                  variant="outline"
                  size="sm"
                  onClick={() => onLoadFilter(filter)}
                  className="flex items-center space-x-1"
                >
                  <Bookmark className="h-3 w-3" />
                  <span>{filter.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFilter(filter.id);
                    }}
                    className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Save Filter Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-background/80 backdrop-blur-sm" onClick={() => setShowSaveDialog(false)} />
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-card shadow-xl rounded-lg border">
                <h3 className="text-lg font-medium mb-4">Save Filter Preset</h3>
                <Input
                  placeholder="Filter name"
                  value={saveFilterName}
                  onChange={(e) => setSaveFilterName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveFilter()}
                  autoFocus
                />
                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveFilter} disabled={!saveFilterName.trim()}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
