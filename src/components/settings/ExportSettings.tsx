import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../design-system';
import { exportToCSV, exportToJSON, exportToPDF, downloadData } from '../../utils/pain-tracker/export';
import type { PainEntry } from '../../types';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

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
    <Card>
      <CardHeader>
        <CardTitle>Export & Sharing</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Export your data for sharing with healthcare providers.</p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2"><input type="radio" name="format" checked={format === 'json'} onChange={() => setFormat('json')} /> JSON</label>
            <label className="flex items-center gap-2"><input type="radio" name="format" checked={format === 'csv'} onChange={() => setFormat('csv')} /> CSV</label>
            <label className="flex items-center gap-2"><input type="radio" name="format" checked={format === 'pdf'} onChange={() => setFormat('pdf')} /> PDF</label>
          </div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={includeCharts} onChange={e => setIncludeCharts(e.target.checked)} /> Include charts (may increase file size)</label>
          <div className="flex items-center gap-3">
            <Button onClick={handleExport}>Export now</Button>
            <Button variant="outline">Schedule exports</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
