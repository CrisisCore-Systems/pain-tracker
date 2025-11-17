/**
 * Data Export Modal Component
 * Provides comprehensive data export functionality with filtering options
 */

import React, { useState, useMemo } from 'react';
import {
  Download,
  FileText,
  FileJson,
  FileSpreadsheet,
  Filter,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Modal, Button, Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import {
  exportToCSV,
  exportToJSON,
  exportToPDF,
  downloadData,
} from '../../utils/pain-tracker/export';
import type { PainEntry } from '../../types';
import { cn } from '../../design-system/utils';

export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportFilters {
  dateRange: {
    start: string;
    end: string;
  };
  painLevelRange: {
    min: number;
    max: number;
  };
  symptoms: string[];
  locations: string[];
  includeQualityOfLife: boolean;
  includeWorkImpact: boolean;
  includeMedications: boolean;
  includeTreatments: boolean;
}

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: PainEntry[];
  title?: string;
}

export function DataExportModal({
  isOpen,
  onClose,
  entries,
  title = 'Export Pain Data',
}: DataExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [filters, setFilters] = useState<ExportFilters>({
    dateRange: {
      start: '',
      end: '',
    },
    painLevelRange: {
      min: 0,
      max: 10,
    },
    symptoms: [],
    locations: [],
    includeQualityOfLife: true,
    includeWorkImpact: true,
    includeMedications: true,
    includeTreatments: true,
  });

  // Get unique symptoms and locations for filtering
  const availableSymptoms = useMemo(() => {
    const symptomSet = new Set<string>();
    entries.forEach(entry => {
      if (entry.baselineData.symptoms) {
        entry.baselineData.symptoms.forEach(symptom => symptomSet.add(symptom));
      }
    });
    return Array.from(symptomSet).sort();
  }, [entries]);

  const availableLocations = useMemo(() => {
    const locationSet = new Set<string>();
    entries.forEach(entry => {
      if (entry.baselineData.locations) {
        entry.baselineData.locations.forEach(location => locationSet.add(location));
      }
    });
    return Array.from(locationSet).sort();
  }, [entries]);

  // Filter entries based on current filters
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      // Date range filter
      if (filters.dateRange.start && filters.dateRange.end) {
        const entryDate = new Date(entry.timestamp);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (entryDate < startDate || entryDate > endDate) return false;
      }

      // Pain level filter
      if (
        entry.baselineData.pain < filters.painLevelRange.min ||
        entry.baselineData.pain > filters.painLevelRange.max
      ) {
        return false;
      }

      // Symptoms filter
      if (filters.symptoms.length > 0) {
        const hasMatchingSymptom = filters.symptoms.some(symptom =>
          entry.baselineData.symptoms?.includes(symptom)
        );
        if (!hasMatchingSymptom) return false;
      }

      // Locations filter
      if (filters.locations.length > 0) {
        const hasMatchingLocation = filters.locations.some(location =>
          entry.baselineData.locations?.includes(location)
        );
        if (!hasMatchingLocation) return false;
      }

      return true;
    });
  }, [entries, filters]);

  const handleExport = async () => {
    if (filteredEntries.length === 0) {
      setExportStatus('error');
      return;
    }

    setIsExporting(true);
    setExportStatus('idle');

    try {
      let data: string;
      let filename: string;
      const timestamp = new Date().toISOString().split('T')[0];

      switch (selectedFormat) {
        case 'csv':
          data = exportToCSV(filteredEntries);
          filename = `pain-data-${timestamp}.csv`;
          break;
        case 'json':
          data = exportToJSON(filteredEntries);
          filename = `pain-data-${timestamp}.json`;
          break;
        case 'pdf':
          data = exportToPDF(filteredEntries);
          filename = `pain-report-${timestamp}.pdf`;
          break;
        default:
          throw new Error('Unsupported export format');
      }

      downloadData(data, filename);
      setExportStatus('success');

      // Auto-close after successful export
      setTimeout(() => {
        onClose();
        setExportStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    {
      id: 'csv' as const,
      label: 'CSV (Spreadsheet)',
      description: 'Compatible with Excel, Google Sheets',
      icon: FileSpreadsheet,
      extension: '.csv',
    },
    {
      id: 'json' as const,
      label: 'JSON (Data)',
      description: 'For developers and data analysis',
      icon: FileJson,
      extension: '.json',
    },
    {
      id: 'pdf' as const,
      label: 'PDF (Report)',
      description: 'Formatted report for sharing',
      icon: FileText,
      extension: '.pdf',
    },
  ];

  const updateFilter = <K extends keyof ExportFilters>(key: K, value: ExportFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = <K extends keyof ExportFilters>(key: K, value: string) => {
    if (!Array.isArray(filters[key])) return;

    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];

    updateFilter(key, newArray as ExportFilters[K]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Download className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">
                Export {filteredEntries.length} of {entries.length} entries
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Export Format Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Export Format</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formatOptions.map(format => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={cn(
                      'p-4 border rounded-lg text-left transition-all hover:shadow-md',
                      selectedFormat === format.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="h-8 w-8 text-primary mt-1" />
                      <div>
                        <h3 className="font-medium">{format.label}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{format.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">{format.extension}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={e =>
                    updateFilter('dateRange', {
                      ...filters.dateRange,
                      start: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={e =>
                    updateFilter('dateRange', {
                      ...filters.dateRange,
                      end: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Pain Level Range */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Pain Level Range: {filters.painLevelRange.min} - {filters.painLevelRange.max}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={filters.painLevelRange.min}
                  onChange={e =>
                    updateFilter('painLevelRange', {
                      ...filters.painLevelRange,
                      min: parseInt(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={filters.painLevelRange.max}
                  onChange={e =>
                    updateFilter('painLevelRange', {
                      ...filters.painLevelRange,
                      max: parseInt(e.target.value),
                    })
                  }
                  className="flex-1"
                />
              </div>
            </div>

            {/* Symptoms Filter */}
            {availableSymptoms.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Symptoms</label>
                <div className="flex flex-wrap gap-2">
                  {availableSymptoms.map(symptom => (
                    <button
                      key={symptom}
                      onClick={() => toggleArrayFilter('symptoms', symptom)}
                      className={cn(
                        'px-3 py-1 text-sm rounded-full border transition-colors',
                        filters.symptoms.includes(symptom)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:border-primary/50'
                      )}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Locations Filter */}
            {availableLocations.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Locations</label>
                <div className="flex flex-wrap gap-2">
                  {availableLocations.map(location => (
                    <button
                      key={location}
                      onClick={() => toggleArrayFilter('locations', location)}
                      className={cn(
                        'px-3 py-1 text-sm rounded-full border transition-colors',
                        filters.locations.includes(location)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:border-primary/50'
                      )}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Data Inclusion Options */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">Include Data Types</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'includeQualityOfLife', label: 'Quality of Life' },
                  { key: 'includeWorkImpact', label: 'Work Impact' },
                  { key: 'includeMedications', label: 'Medications' },
                  { key: 'includeTreatments', label: 'Treatments' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters[key as keyof ExportFilters] as boolean}
                      onChange={e => updateFilter(key as keyof ExportFilters, e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Status */}
        {exportStatus !== 'idle' && (
          <Card
            className={cn(
              'border',
              exportStatus === 'success'
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            )}
          >
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                {exportStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <p
                  className={cn(
                    'text-sm',
                    exportStatus === 'success' ? 'text-green-800' : 'text-red-800'
                  )}
                >
                  {exportStatus === 'success'
                    ? `Successfully exported ${filteredEntries.length} entries!`
                    : filteredEntries.length === 0
                      ? 'No entries match your filters. Please adjust your criteria.'
                      : 'Export failed. Please try again.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {filteredEntries.length} entries will be exported
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || filteredEntries.length === 0}
              className="min-w-[120px]"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {selectedFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
