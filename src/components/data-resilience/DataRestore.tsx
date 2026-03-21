import React, { useState, useRef } from 'react';
import type { PainEntry } from '../../types';
import {
  applyVaultPayloadToStore,
  decryptVaultExportV1,
  logVaultExportFailure,
  VAULT_EXPORT_SCHEMA,
  VAULT_EXPORT_VERSION,
  type VaultExportV1,
} from '../../lib/vault-export/vaultExportPolicy';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

interface DataRestoreProps {
  onDataRestore: (entries: PainEntry[]) => void;
}

function getRestoreStatusTone(restoreStatus: string) {
  if (
    restoreStatus.includes('Error') ||
    restoreStatus.includes('Invalid') ||
    restoreStatus.includes('Failed')
  ) {
    return 'bg-red-100 text-red-700';
  }
  if (restoreStatus.includes('Successfully')) {
    return 'bg-green-100 text-green-700';
  }
  if (restoreStatus.includes('Warning')) {
    return 'bg-yellow-100 text-yellow-700';
  }
  return 'bg-blue-100 text-blue-700';
}

export const DataRestore: React.FC<DataRestoreProps> = ({ onDataRestore }) => {
  const [password, setPassword] = useState('');
  const [confirmToken, setConfirmToken] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [vaultMeta, setVaultMeta] = useState<Pick<VaultExportV1, 'createdAt' | 'manifest'> | null>(
    null
  );
  const [restoreStatus, setRestoreStatus] = useState<string>('');
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setRestoreStatus('');
    setVaultMeta(null);

    try {
      const fileContent = await file.text();
      const parsed = JSON.parse(fileContent) as unknown;
      if (!parsed || typeof parsed !== 'object') {
        setRestoreStatus('Invalid vault export file format');
        return;
      }

      const rec = parsed as Record<string, unknown>;
      if (rec.schema !== VAULT_EXPORT_SCHEMA || rec.version !== VAULT_EXPORT_VERSION) {
        setRestoreStatus('Unsupported vault export file (wrong schema/version)');
        return;
      }

      const meta = rec as VaultExportV1;
      setVaultMeta({ createdAt: meta.createdAt, manifest: meta.manifest });
    } catch {
      setRestoreStatus('Error reading vault export file');
    }
  };

  const decryptAndRestore = async () => {
    if (!selectedFile) return;

    setIsRestoring(true);
    setRestoreStatus('Restoring data...');

    try {
      const fileContent = await selectedFile.text();
      const payload = await decryptVaultExportV1({
        vaultExportJson: fileContent,
        passphrase: password,
        confirmToken: confirmToken.trim(),
      });

      const result = applyVaultPayloadToStore({ payload, mode: 'merge' });
      // Use store entries after merge so callback receives normalized IDs.
      onDataRestore(usePainTrackerStore.getState().entries);
      setRestoreStatus(
        `Successfully restored ${payload.entries.length} pain entries (${result.mergedCount} applied)`
      );
    } catch (error) {
      logVaultExportFailure({
        stage: 'import',
        reason: error instanceof Error ? error.message : 'unknown',
      });
      setRestoreStatus(
        `Error restoring data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsRestoring(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setVaultMeta(null);
    setPassword('');
    setConfirmToken('');
    setRestoreStatus('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span role="img" aria-label="restore">
          📥
        </span>
        <span>Vault Import (Encrypted)</span>
      </h2>

      <div className="space-y-6">
        {/* File Selection */}
        <div>
          <label htmlFor="vault-import-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Backup File
          </label>
          <div className="flex items-center gap-3">
            <input
              id="vault-import-file"
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-600 dark:bg-gray-400 text-white rounded hover:bg-gray-700"
            >
              Choose File
            </button>
            {selectedFile && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedFile.name}
                </span>
                <button
                  onClick={clearSelection}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Backup Information */}
        {vaultMeta && (
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-medium mb-2">Vault Export Information</h3>
            <div className="text-sm space-y-1">
              <div>• Created: {new Date(vaultMeta.createdAt).toLocaleString()}</div>
              <div>• Version: {VAULT_EXPORT_VERSION}</div>
              <div>• Entries: {vaultMeta.manifest?.recordCounts?.entries ?? 'Unknown'}</div>
              <div>• Encryption: 🔒 Encrypted</div>
            </div>
          </div>
        )}

        {/* Passphrase + Confirm */}
        <div>
          <label htmlFor="vault-export-passphrase" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Vault Export Passphrase
          </label>
          <input
            id="vault-export-passphrase"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter vault export passphrase"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            minLength={12}
          />
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Enter the passphrase used when creating this vault export.
          </p>
        </div>

        <div>
          <label htmlFor="vault-import-confirm-token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type IMPORT to confirm
          </label>
          <input
            id="vault-import-confirm-token"
            type="text"
            value={confirmToken}
            onChange={e => setConfirmToken(e.target.value)}
            placeholder="IMPORT"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            inputMode="text"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        {/* Restore Button */}
        <div className="space-y-3">
          <button
            onClick={decryptAndRestore}
            disabled={!selectedFile || isRestoring || !password || confirmToken.trim() !== 'IMPORT'}
            className="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRestoring ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Restoring Data...
              </>
            ) : (
              <>
                <span role="img" aria-hidden="true">
                  📂
                </span>
                <span>Restore Data</span>
              </>
            )}
          </button>

          {restoreStatus && (
            <div className={`p-3 rounded text-sm ${getRestoreStatusTone(restoreStatus)}`}>
              {restoreStatus}
            </div>
          )}
        </div>

        {/* Warning Notice */}
        <div className="border-l-4 border-red-400 bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Data Restore Warning</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Restoring will merge data with existing entries</li>
                  <li>Duplicate entries (same ID) will be overwritten</li>
                  <li>Create a backup of current data before restoring if needed</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
