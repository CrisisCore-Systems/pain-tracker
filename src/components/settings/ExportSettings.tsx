import React, { useState } from 'react';
import { exportToCSV, exportToJSON, exportToPDF, downloadData } from '../../utils/pain-tracker/export';
import type { PainEntry } from '../../types';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

// Glassmorphism card styling
const glassCardStyle = {
  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
};

export default function ExportSettings() {
  const entries = usePainTrackerStore(state => state.entries);
  const [format, setFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [includeCharts, setIncludeCharts] = useState(true);

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
    <div className="rounded-xl p-5" style={glassCardStyle}>
      <h4 className="font-semibold text-white mb-4">Export & Sharing</h4>
      <div className="space-y-4">
        <p className="text-sm text-slate-400">Export your data for sharing with healthcare providers.</p>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="format" 
              checked={format === 'json'} 
              onChange={() => setFormat('json')}
              className="text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-slate-900"
            />
            <span className="text-sm text-slate-300">JSON</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="format" 
              checked={format === 'csv'} 
              onChange={() => setFormat('csv')}
              className="text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-slate-900"
            />
            <span className="text-sm text-slate-300">CSV</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="format" 
              checked={format === 'pdf'} 
              onChange={() => setFormat('pdf')}
              className="text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-slate-900"
            />
            <span className="text-sm text-slate-300">PDF</span>
          </label>
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={includeCharts} 
            onChange={e => setIncludeCharts(e.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500/50 focus:ring-offset-slate-900"
          />
          <span className="text-sm text-slate-300">Include charts (may increase file size)</span>
        </label>
        
        <div className="flex items-center gap-3 pt-2">
          <button 
            onClick={handleExport}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
              boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)',
            }}
          >
            Export now
          </button>
          <button 
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              color: '#38bdf8',
            }}
          >
            Schedule exports
          </button>
        </div>
      </div>
    </div>
  );
}
