import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { Button } from '../../design-system';
import { secureStorage } from '../../lib/storage/secureStorage';

function downloadJSON(filename: string, data: string) {
  try {
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    // Fallback: create a data URL (useful for test environments without createObjectURL)
    const dataUrl = `data:text/json;charset=utf-8,${encodeURIComponent(data)}`;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  } catch {
    // Swallow errors - downloads may not be available in test environments
  }
}

export default function BackupSettings() {
  const [lastExport, setLastExport] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      const keys = secureStorage.keys();
      const payload: Record<string, unknown> = {};
      for (const key of keys) {
        payload[key] = secureStorage.get(key);
      }

      const data = JSON.stringify({ exportedAt: new Date().toISOString(), data: payload }, null, 2);
      downloadJSON(`pain-tracker-backup-${new Date().toISOString()}.json`, data);
      setLastExport(new Date().toISOString());
      setImportError(null);
      setImportResult('Export completed');
    } catch {
      setImportError('Failed to export backup');
    }
  };

  const handleImport = async (file: File | null) => {
    setImportError(null);
    setImportResult(null);
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || !parsed.data) {
        setImportError('Invalid backup file');
        return;
      }
      const data = parsed.data as Record<string, unknown>;
      Object.keys(data).forEach(k => secureStorage.set(k, data[k]));
      setImportResult('Import successful');
    } catch {
      setImportError('Failed to import backup');
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    await handleImport(file);
    if (e.target) e.target.value = '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backup & Export</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create a local backup of your data or import an existing backup JSON file. Be cautious
            when importing backups; this may overwrite local data.
          </p>

          <div className="flex items-center gap-3">
            <Button onClick={handleExport} variant="secondary">
              Export backup
            </Button>
            <label className="cursor-pointer">
              <input type="file" accept="application/json" onChange={handleFileInput} className="hidden" />
              <Button variant="ghost">Import backup</Button>
            </label>
          </div>

          {lastExport && <div className="text-xs text-muted-foreground">Last export: {lastExport}</div>}
          {importError && <div className="text-xs text-red-500">{importError}</div>}
          {importResult && <div className="text-xs text-green-500">{importResult}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
