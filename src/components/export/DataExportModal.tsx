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
  clearExportArtifacts,
  type RedactionPolicy,
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
}

interface DataExportModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly entries: readonly PainEntry[];
  readonly title?: string;
}

type ArrayFilterKey = 'symptoms' | 'locations';

export function DataExportModal({
  isOpen,
  onClose,
  entries,
  title = 'Export Pain Data',
}: DataExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [redactionPolicy, setRedactionPolicy] = useState<RedactionPolicy>('minimal');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [acknowledgedUnencryptedRisk, setAcknowledgedUnencryptedRisk] = useState(false);
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
  });

  // Get unique symptoms and locations for filtering
  const availableSymptoms = useMemo(() => {
    const symptomSet = new Set<string>();
    entries.forEach(entry => {
      if (entry.baselineData.symptoms) {
        entry.baselineData.symptoms.forEach(symptom => symptomSet.add(symptom));
      }
    });
    return Array.from(symptomSet).sort((a, b) => a.localeCompare(b));
  }, [entries]);

  const availableLocations = useMemo(() => {
    const locationSet = new Set<string>();
    entries.forEach(entry => {
      if (entry.baselineData.locations) {
        entry.baselineData.locations.forEach(location => locationSet.add(location));
      }
    });
    return Array.from(locationSet).sort((a, b) => a.localeCompare(b));
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
    if (!acknowledgedUnencryptedRisk) {
      setExportStatus('error');
      return;
    }

    if (filteredEntries.length === 0) {
      setExportStatus('error');
      return;
    }

    setIsExporting(true);
    setExportStatus('idle');

    try {
      let data: string;
      let filename: string;
      let mimeType: string;
      const timestamp = new Date().toISOString().split('T')[0];

      switch (selectedFormat) {
        case 'csv':
          data = exportToCSV(filteredEntries, redactionPolicy);
          filename = `pain-data-${timestamp}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          data = exportToJSON(filteredEntries, redactionPolicy);
          filename = `pain-data-${timestamp}.json`;
          mimeType = 'application/json';
          break;
        case 'pdf':
          data = await exportToPDF(filteredEntries, redactionPolicy);
          filename = `pain-report-${timestamp}.pdf`;
          mimeType = 'application/pdf';
          break;
        default:
          throw new Error('Unsupported export format');
      }

      downloadData(data, filename, mimeType);
      setExportStatus('success');
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCloseAndClearExportMemory = () => {
    clearExportArtifacts();
    setExportStatus('idle');
    setAcknowledgedUnencryptedRisk(false);
    onClose();
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

  const toggleArrayFilter = (key: ArrayFilterKey, value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];

    updateFilter(key, newArray);
  };

  const getExportStatusMessage = () => {
    if (exportStatus === 'success') {
      return `Successfully exported ${filteredEntries.length} entries!`;
    }
    if (filteredEntries.length === 0) {
      return 'No entries match your filters. Please adjust your criteria.';
    }
    if (acknowledgedUnencryptedRisk === false) {
      return 'You must acknowledge the unencrypted export warning before downloading.';
    }
    return 'Export failed. Please try again.';
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
                <label htmlFor="export-start-date" className="block text-sm font-medium mb-2">
                  Start Date
                </label>
                <input
                  id="export-start-date"
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
                <label htmlFor="export-end-date" className="block text-sm font-medium mb-2">
                  End Date
                </label>
                <input
                  id="export-end-date"
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
                      min: Number.parseInt(e.target.value, 10),
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
                      max: Number.parseInt(e.target.value, 10),
                    })
                  }
                  className="flex-1"
                />
              </div>
            </div>

            {/* Symptoms Filter */}
            {availableSymptoms.length > 0 && (
              <fieldset>
                <legend className="block text-sm font-medium mb-2">
                  Symptoms
                </legend>
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
              </fieldset>
            )}

            {/* Locations Filter */}
            {availableLocations.length > 0 && (
              <fieldset>
                <legend className="block text-sm font-medium mb-2">
                  Locations
                </legend>
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
              </fieldset>
            )}
          </CardContent>
        </Card>

        {/* Redaction Policy */}
        <Card>
          <CardHeader>
            <CardTitle>Data Sensitivity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <label className="flex items-start gap-2">
                <input
                  type="radio"
                  name="redactionPolicy"
                  value="minimal"
                  checked={redactionPolicy === 'minimal'}
                  onChange={() => setRedactionPolicy('minimal')}
                />
                <span className="text-sm">
                  <strong>Minimal (clinical/compliance)</strong>: includes timestamps, pain levels,
                  symptoms, and medication logs. Excludes notes, locations, mood/context markers.
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="radio"
                  name="redactionPolicy"
                  value="full"
                  checked={redactionPolicy === 'full'}
                  onChange={() => setRedactionPolicy('full')}
                />
                <span className="text-sm">
                  <strong>Full (personal/diagnostic)</strong>: includes all available fields.
                </span>
              </label>
              {selectedFormat === 'pdf' && (
                <p className="text-xs text-muted-foreground">
                  PDF export respects the selected policy and labels minimal exports as redacted.
                </p>
              )}
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
                  {getExportStatusMessage()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="pt-6 space-y-3">
            <div className="text-sm font-medium text-amber-900">Unencrypted export warning</div>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>This file is not protected by your app passphrase.</li>
              <li>Delete this file as soon as you are finished sharing it.</li>
            </ul>
            <label className="flex items-start gap-2 text-sm text-amber-900">
              <input
                type="checkbox"
                checked={acknowledgedUnencryptedRisk}
                onChange={e => setAcknowledgedUnencryptedRisk(e.target.checked)}
                className="mt-0.5"
              />
              <span>I understand this export leaves app protection once saved to my device.</span>
            </label>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {filteredEntries.length} entries will be exported
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleCloseAndClearExportMemory}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || filteredEntries.length === 0 || !acknowledgedUnencryptedRisk}
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
            {exportStatus === 'success' && (
              <Button variant="secondary" onClick={handleCloseAndClearExportMemory}>
                Close Export & Clear Memory
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
