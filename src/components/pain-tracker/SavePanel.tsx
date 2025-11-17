import React, { useState, useRef } from 'react';
import type { PainEntry } from '../../types';
import { format as formatDate } from 'date-fns';
import { ErrorBoundary } from './ErrorBoundary';

interface SavePanelProps {
  entries: PainEntry[];
  onClearData?: () => void;
  onExport?: (format: 'json' | 'csv') => void;
}

export function SavePanel({ entries, onClearData, onExport }: SavePanelProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [focusedButton, setFocusedButton] = useState<string | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const dateRange = entries.length > 0
    ? {
        start: formatDate(new Date(Math.min(...entries.map(e => new Date(e.timestamp).getTime()))), 'MMM d, yyyy'),
        end: formatDate(new Date(Math.max(...entries.map(e => new Date(e.timestamp).getTime()))), 'MMM d, yyyy')
      }
    : null;

  const handleExport = (format: 'json' | 'csv') => {
    let data: string;
    let mimeType: string;
    let filename: string;

    if (format === 'json') {
      data = JSON.stringify(entries, null, 2);
      mimeType = 'application/json';
      filename = 'pain-tracker-export.json';
    } else {
      // CSV format
      const headers = [
        'Date',
        'Pain Level',
        'Locations',
        'Symptoms',
        'Limited Activities',
        'Medications',
        'Notes'
      ];

      const rows = entries.map(entry => {
        const medications = (entry.medications?.current ?? [])
          .map(med => `${med.name} ${med.dosage}`)
          .join(';');
        
        const rowData = [
          formatDate(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm:ss'),
          entry.baselineData.pain.toString(),
          Array.prototype.join.call(entry.baselineData.locations ?? [], ';'),
          Array.prototype.join.call(entry.baselineData.symptoms ?? [], ';'),
          Array.prototype.join.call(entry.functionalImpact?.limitedActivities ?? [], ';'),
          medications,
          `"${entry.notes || ''}"`
        ];
        return rowData;
      });

      data = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      mimeType = 'text/csv';
      filename = 'pain-tracker-export.csv';
    }

    if (onExport) {
      onExport(format);
    } else {
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (showConfirmation) {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowLeft':
          event.preventDefault();
          if (focusedButton === 'confirm') {
            setFocusedButton('cancel');
            cancelButtonRef.current?.focus();
          } else {
            setFocusedButton('confirm');
            confirmButtonRef.current?.focus();
          }
          break;
        case 'Escape':
          event.preventDefault();
          setShowConfirmation(false);
          break;
      }
    }
  };

  return (
    <ErrorBoundary>
      <div 
        className="bg-white p-6 rounded-lg shadow-md"
        role="region"
        aria-label="Data Management"
      >
        <h3 className="text-lg font-semibold mb-4">Data Management</h3>
        
        <div className="space-y-4">
          {/* Entry Count and Date Range */}
          <div 
            className="text-sm text-gray-600 dark:text-gray-400"
            aria-live="polite"
          >
            <p>Total Entries: {entries.length}</p>
            {dateRange && (
              <p>Date Range: {dateRange.start} - {dateRange.end}</p>
            )}
          </div>

          {/* Export Options */}
          <div 
            role="group" 
            aria-label="Export Options"
            className="space-x-4"
          >
            <button
              onClick={() => handleExport('json')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Export as JSON"
            >
              Export JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Export as CSV"
            >
              Export CSV
            </button>
          </div>

          {/* Clear Data */}
          {entries.length > 0 && onClearData && (
            <div>
              {!showConfirmation ? (
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label="Clear all data"
                >
                  Clear Data
                </button>
              ) : (
                <div 
                  role="alertdialog"
                  aria-labelledby="confirm-dialog-title"
                  aria-describedby="confirm-dialog-desc"
                  onKeyDown={handleKeyDown}
                  className="mt-4 p-4 border border-red-200 rounded-lg bg-red-50"
                >
                  <h4 
                    id="confirm-dialog-title"
                    className="text-red-700 font-medium mb-2"
                  >
                    Confirm Clear Data
                  </h4>
                  <p 
                    id="confirm-dialog-desc"
                    className="text-red-600 mb-4"
                  >
                    Are you sure you want to clear all data? This action cannot be undone.
                  </p>
                  <div className="space-x-4">
                    <button
                      ref={confirmButtonRef}
                      onClick={() => {
                        onClearData();
                        setShowConfirmation(false);
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      aria-label="Confirm clear data"
                      autoFocus
                    >
                      Yes, Clear Data
                    </button>
                    <button
                      ref={cancelButtonRef}
                      onClick={() => setShowConfirmation(false)}
                      className="bg-gray-500 dark:bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      aria-label="Cancel clear data"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
} 