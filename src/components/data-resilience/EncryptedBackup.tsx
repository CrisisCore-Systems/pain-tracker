import React, { useState } from 'react';
import { format } from 'date-fns';
import type { PainEntry } from '../../types';
import { downloadData } from '../../utils/pain-tracker/export';
import {
  buildVaultPayloadV1,
  createVaultExportV1,
  logVaultExportFailure,
} from '../../lib/vault-export/vaultExportPolicy';

interface EncryptedBackupProps {
  entries: PainEntry[];
}

export const EncryptedBackup: React.FC<EncryptedBackupProps> = ({ entries }) => {
  const [password, setPassword] = useState('');
  const [confirmToken, setConfirmToken] = useState('');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string>('');

  let backupStatusClass = 'bg-blue-100 text-blue-700';
  if (backupStatus.includes('Error')) backupStatusClass = 'bg-red-100 text-red-700';
  else if (backupStatus.includes('successfully')) backupStatusClass = 'bg-green-100 text-green-700';

  const newestEntry = entries.at(0);
  const oldestEntry = entries.at(-1);

  const validateInputs = () => {
    if (!password || password.length < 12) {
      setBackupStatus('Passphrase must be at least 12 characters long');
      return false;
    }
    if (confirmToken.trim() !== 'EXPORT') {
      setBackupStatus("Type EXPORT to confirm");
      return false;
    }
    return true;
  };

  const createBackup = async () => {
    if (!validateInputs()) return;

    setIsCreatingBackup(true);
    setBackupStatus('Creating vault export...');

    try {
      const payload = buildVaultPayloadV1({ entries });
      const vaultExport = await createVaultExportV1({
        payload,
        passphrase: password,
        confirmToken: confirmToken.trim(),
      });

      const backupContent = JSON.stringify(vaultExport, null, 2);

      const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
      const filename = `pain-tracker-vault-export-${timestamp}.json`;

      downloadData(backupContent, filename);
      setBackupStatus(`Backup created successfully: ${filename}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logVaultExportFailure({
        stage: 'export',
        reason: message,
      });
      setBackupStatus(`Error creating backup: ${message}`);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        Vault Export (Encrypted)
      </h2>

      {entries.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No data available to backup.</p>
      ) : (
        <div className="space-y-6">
          {/* Passphrase + Confirm */}
          <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">
            <div>
              <label
                htmlFor="vault-export-passphrase"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Vault Export Passphrase
              </label>
              <input
                id="vault-export-passphrase"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter a strong passphrase"
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                minLength={12}
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Minimum 12 characters. Store this passphrase safely — it cannot be recovered.
              </p>
            </div>

            <div>
              <label
                htmlFor="vault-export-confirm"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Type EXPORT to confirm
              </label>
              <input
                id="vault-export-confirm"
                type="text"
                value={confirmToken}
                onChange={e => setConfirmToken(e.target.value)}
                placeholder="EXPORT"
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                inputMode="text"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Backup Info */}
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-medium mb-2">Backup Contents</h3>
            <div className="text-sm space-y-1">
              <div>• Total entries: {entries.length}</div>
              <div>
                • Date range:{' '}
                {newestEntry && oldestEntry
                  ? `${format(new Date(oldestEntry.timestamp), 'MMM d, yyyy')} - ${format(new Date(newestEntry.timestamp), 'MMM d, yyyy')}`
                  : 'No data'}
              </div>
              <div>
                • Encryption: AES-256-GCM (passphrase-protected)
              </div>
              <div>• File format: JSON</div>
            </div>
          </div>

          {/* Create Backup Button */}
          <div className="space-y-3">
            <button
              onClick={createBackup}
              disabled={isCreatingBackup}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreatingBackup ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Backup...
                </>
              ) : (
                <>Create Vault Export</>
              )}
            </button>

            {backupStatus && (
              <div
                className={`p-3 rounded text-sm ${backupStatusClass}`}
              >
                {backupStatus}
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>This file contains encrypted health data. Treat it as sensitive.</li>
                    <li>Store your passphrase securely — it cannot be recovered if lost.</li>
                    <li>Keep vault export files in a secure location.</li>
                    <li>Test restoration periodically to ensure you can recover when needed.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
