import React, { useState } from 'react';
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
    <div className="rounded-xl p-5 bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Local Backup</h4>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-slate-400">
          Create a local backup of your data or import an existing backup JSON file. Be cautious
          when importing backups; this may overwrite local data.
        </p>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-purple-100 dark:bg-purple-500/15 border border-purple-300 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-500/25"
          >
            Export backup
          </button>
          <label className="cursor-pointer">
            <input type="file" accept="application/json" onChange={handleFileInput} className="hidden" />
            <span className="inline-block px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10">
              Import backup
            </span>
          </label>
        </div>

        {lastExport && (
          <div className="text-xs text-gray-500 dark:text-slate-500">Last export: {new Date(lastExport).toLocaleString()}</div>
        )}
        {importError && (
          <div className="text-xs text-red-600 dark:text-red-400">{importError}</div>
        )}
        {importResult && (
          <div className="text-xs text-emerald-600 dark:text-emerald-400">{importResult}</div>
        )}
      </div>
    </div>
  );
}
