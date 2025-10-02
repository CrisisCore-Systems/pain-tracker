import React, { useState } from 'react';
import { encryptionService } from '../../services/EncryptionService';
import { format } from 'date-fns';
import type { PainEntry } from '../../types';
import { downloadData } from '../../utils/pain-tracker/export';

interface EncryptedBackupProps {
  entries: PainEntry[];
}

interface BackupData {
  metadata: {
    version: string;
    timestamp: string;
    entryCount: number;
    encrypted: boolean;
  };
  data: PainEntry[];
}

export const EncryptedBackup: React.FC<EncryptedBackupProps> = ({ entries }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string>('');

  const validatePassword = () => {
    if (isEncrypted && (!password || password.length < 8)) {
      setBackupStatus('Password must be at least 8 characters long');
      return false;
    }
    if (isEncrypted && password !== confirmPassword) {
      setBackupStatus('Passwords do not match');
      return false;
    }
    return true;
  };

  const createBackup = async () => {
    if (!validatePassword()) return;

    setIsCreatingBackup(true);
    setBackupStatus('Creating backup...');

    try {
      const backupData: BackupData = {
        metadata: {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          entryCount: entries.length,
          encrypted: isEncrypted
        },
        data: entries
      };

      let backupContent = '';
      if (isEncrypted && password) {
        // Use centralized encryption service to create a password-protected backup
        backupContent = await encryptionService.createEncryptedBackup(backupData, password);
      } else if (isEncrypted && !password) {
        // Use default service key
        backupContent = await encryptionService.createEncryptedBackup(backupData);
      } else {
        backupContent = JSON.stringify(backupData, null, 2);
      }

      const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
      const filename = `pain-tracker-backup-${timestamp}${isEncrypted ? '-encrypted' : ''}.json`;
      
      downloadData(backupContent, filename);
      setBackupStatus(`Backup created successfully: ${filename}`);
    } catch (error) {
      setBackupStatus(`Error creating backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(password);
    setConfirmPassword(password);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span role="img" aria-label="backup">💾</span>
        Create Encrypted Backup
      </h2>

      {entries.length === 0 ? (
        <p className="text-gray-600">No data available to backup.</p>
      ) : (
        <div className="space-y-6">
          {/* Backup Options */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isEncrypted}
                onChange={(e) => setIsEncrypted(e.target.checked)}
                className="rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="font-medium">Enable encryption (recommended)</span>
            </label>
            <p className="text-sm text-gray-600 mt-1">
              Encrypt backup with a password for enhanced security
            </p>
          </div>

          {/* Password Fields */}
          {isEncrypted && (
            <div className="space-y-4 p-4 bg-gray-50 rounded">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Backup Password
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a strong password"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={generateSecurePassword}
                    className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Minimum 8 characters. Store this password safely - you'll need it to restore the backup.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Backup Info */}
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-medium mb-2">Backup Contents</h3>
            <div className="text-sm space-y-1">
              <div>• Total entries: {entries.length}</div>
              <div>• Date range: {entries.length > 0 ? `${format(new Date(entries[entries.length - 1].timestamp), 'MMM d, yyyy')} - ${format(new Date(entries[0].timestamp), 'MMM d, yyyy')}` : 'No data'}</div>
              <div>• Encryption: {isEncrypted ? 'AES-256 encryption enabled' : 'Plain text (not recommended)'}</div>
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
                <>
                  <span role="img" aria-hidden="true">📦</span>
                  Create Backup
                </>
              )}
            </button>

            {backupStatus && (
              <div className={`p-3 rounded text-sm ${
                backupStatus.includes('Error') ? 'bg-red-100 text-red-700' : 
                backupStatus.includes('successfully') ? 'bg-green-100 text-green-700' : 
                'bg-blue-100 text-blue-700'
              }`}>
                {backupStatus}
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Security Notice
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Store your backup password securely - it cannot be recovered if lost</li>
                    <li>Keep backup files in a secure location</li>
                    <li>Consider creating multiple backups and storing them separately</li>
                    <li>Test backup restoration periodically to ensure data integrity</li>
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
