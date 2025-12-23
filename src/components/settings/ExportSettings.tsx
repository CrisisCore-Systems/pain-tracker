import React, { useState } from 'react';
import { exportToCSV, exportToJSON, exportToPDF, downloadData } from '../../utils/pain-tracker/export';
import type { PainEntry } from '../../types';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

export default function ExportSettings() {
  const entries = usePainTrackerStore(state => state.entries);
  const [format, setFormat] = useState<'json' | 'csv' | 'pdf'>('json');

  const handleExport = async () => {
    if (format === 'json') {
      const data = exportToJSON(entries as PainEntry[]);
      downloadData(data, `pain-tracker-export-${new Date().toISOString()}.json`, 'application/json');
    } else if (format === 'csv') {
      const data = exportToCSV(entries as PainEntry[]);
      downloadData(data, `pain-tracker-export-${new Date().toISOString()}.csv`, 'text/csv');
    } else if (format === 'pdf') {
      const dataUri = exportToPDF(entries as PainEntry[]);
      downloadData(dataUri, `pain-tracker-report-${new Date().toISOString()}.pdf`, 'application/pdf');
    }
  };

  return (
    <div className="rounded-xl p-5 bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Export & Sharing</h4>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-slate-400">Export your data for sharing with healthcare providers.</p>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="format" 
              checked={format === 'json'} 
              onChange={() => setFormat('json')}
              className="text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-white dark:focus:ring-offset-slate-900"
            />
            <span className="text-sm text-gray-600 dark:text-slate-300">JSON</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="format" 
              checked={format === 'csv'} 
              onChange={() => setFormat('csv')}
              className="text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-white dark:focus:ring-offset-slate-900"
            />
            <span className="text-sm text-gray-600 dark:text-slate-300">CSV</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="format" 
              checked={format === 'pdf'} 
              onChange={() => setFormat('pdf')}
              className="text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-white dark:focus:ring-offset-slate-900"
            />
            <span className="text-sm text-gray-600 dark:text-slate-300">PDF</span>
          </label>
        </div>
        
        <div className="flex items-center gap-3 pt-2">
          <button 
            onClick={handleExport}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 bg-gradient-to-r from-cyan-500 to-sky-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
          >
            Export now
          </button>
        </div>
      </div>
    </div>
  );
}
