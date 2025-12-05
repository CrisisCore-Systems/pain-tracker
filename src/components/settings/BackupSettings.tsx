import React, { useState } from 'react';
import { secureStorage } from '../../lib/storage/secureStorage';

// Glassmorphism card styling
const glassCardStyle = {
  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
};

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
    <div className="rounded-xl p-5" style={glassCardStyle}>
      <h4 className="font-semibold text-white mb-4">Local Backup</h4>
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          Create a local backup of your data or import an existing backup JSON file. Be cautious
          when importing backups; this may overwrite local data.
        </p>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#a78bfa',
            }}
          >
            Export backup
          </button>
          <label className="cursor-pointer">
            <input type="file" accept="application/json" onChange={handleFileInput} className="hidden" />
            <span
              className="inline-block px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
              }}
            >
              Import backup
            </span>
          </label>
        </div>

        {lastExport && (
          <div className="text-xs text-slate-500">Last export: {new Date(lastExport).toLocaleString()}</div>
        )}
        {importError && (
          <div className="text-xs text-red-400">{importError}</div>
        )}
        {importResult && (
          <div className="text-xs text-emerald-400">{importResult}</div>
        )}
      </div>
    </div>
  );
}
