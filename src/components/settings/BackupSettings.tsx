import React, { useMemo, useState } from 'react';
import { secureStorage } from '../../lib/storage/secureStorage';
import {
  SETTINGS_BACKUP_LIMITS,
  applySettingsBackupImport,
  buildSettingsBackupEnvelope,
  parseSettingsBackupEnvelopeJson,
  planSettingsBackupImport,
  type SettingsBackupEnvelopeV1,
  type SettingsBackupImportRow,
} from '../../lib/backup/settingsBackupPolicy';

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
  const [pendingImport, setPendingImport] = useState<{
    envelope: SettingsBackupEnvelopeV1;
    preview: SettingsBackupImportRow[];
    safeData: Record<string, unknown>;
  } | null>(null);
  const [confirmText, setConfirmText] = useState<string>('');

  const handleExport = async () => {
    try {
      const envelope = buildSettingsBackupEnvelope({
        allKeys: secureStorage.keys(),
        readValue: key => secureStorage.get(key),
      });
      const data = JSON.stringify(envelope, null, 2);
      downloadJSON(`pain-tracker-settings-backup-${new Date().toISOString()}.json`, data);
      setLastExport(new Date().toISOString());
      setImportError(null);
      setImportResult('Export completed');
      setPendingImport(null);
      setConfirmText('');
    } catch {
      setImportError('Failed to export backup');
    }
  };

  const handleImport = async (file: File | null) => {
    setImportError(null);
    setImportResult(null);
    if (!file) return;
    try {
      if (file.size > SETTINGS_BACKUP_LIMITS.maxFileBytes) {
        throw new Error('File too large');
      }

      const text = await file.text();
      const envelope = parseSettingsBackupEnvelopeJson(text);
      const { safeData, preview } = planSettingsBackupImport({
        envelope,
        existingKeys: secureStorage.keys(),
      });
      setPendingImport({ envelope, preview, safeData });
      setConfirmText('');
      setImportResult(null);
    } catch {
      setImportError('Failed to import backup');
    }
  };

  const previewCounts = useMemo(() => {
    const rows = pendingImport?.preview ?? [];
    let add = 0;
    let overwrite = 0;
    let blocked = 0;
    for (const r of rows) {
      if (r.action === 'add') add++;
      else if (r.action === 'overwrite') overwrite++;
      else blocked++;
    }
    return { add, overwrite, blocked, total: rows.length };
  }, [pendingImport]);

  const confirmInputId = 'pt-settings-backup-import-confirm';

  const actionTextClass = (action: SettingsBackupImportRow['action']): string => {
    if (action === 'overwrite') return 'text-amber-700 dark:text-amber-300';
    if (action === 'add') return 'text-emerald-700 dark:text-emerald-300';
    return 'text-gray-500 dark:text-slate-500';
  };

  const actionLabel = (action: SettingsBackupImportRow['action']): string => {
    if (action === 'overwrite') return 'overwrite';
    if (action === 'add') return 'add';
    return 'blocked';
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

        {pendingImport ? (
          <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-slate-900/30 p-3">
            <div className="font-medium text-gray-700 dark:text-slate-200">Import preview</div>
            <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">
              This will apply {previewCounts.add + previewCounts.overwrite} keys ({previewCounts.overwrite}{' '}
              overwrite, {previewCounts.add} add). Blocked: {previewCounts.blocked}.
            </div>

            <div className="mt-2 max-h-40 overflow-auto rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800/70">
              <ul className="divide-y divide-gray-100 dark:divide-white/10">
                {pendingImport.preview.map(row => (
                  <li key={`${row.action}:${row.key}`} className="px-3 py-2 text-xs flex items-center justify-between gap-3">
                    <span className="text-gray-700 dark:text-slate-200 break-all">{row.key}</span>
                    <span
                      className={actionTextClass(row.action)}
                    >
                      {actionLabel(row.action)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3">
              <label htmlFor={confirmInputId} className="block text-xs text-gray-600 dark:text-slate-400">
                Type <span className="font-semibold">IMPORT</span> to apply
              </label>
              <input
                id={confirmInputId}
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-slate-200"
                placeholder="IMPORT"
              />
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                disabled={
                  confirmText !== 'IMPORT' ||
                  Object.keys(pendingImport.safeData).length === 0
                }
                onClick={async () => {
                  try {
                    const res = applySettingsBackupImport({
                      safeData: pendingImport.safeData,
                      confirmToken: confirmText,
                      existingKeys: secureStorage.keys(),
                      readValue: key => secureStorage.get(key),
                      removeValue: key => {
                        secureStorage.remove(key);
                      },
                      writeValue: (key, value) => {
                        const result = secureStorage.set(key, value);
                        if (!result.success) {
                          throw new Error(result.error ?? 'SETTINGS_IMPORT_WRITE_FAILED');
                        }
                      },
                    });
                    setImportError(null);
                    setImportResult(
                      `Import applied (${res.written.length} keys).`
                    );
                    setPendingImport(null);
                    setConfirmText('');
                  } catch {
                    setImportError('Failed to import backup');
                  }
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply import
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingImport(null);
                  setConfirmText('');
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}

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
