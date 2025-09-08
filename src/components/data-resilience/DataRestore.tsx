import React, { useState, useRef } from 'react';
import CryptoJS from 'crypto-js';
import type { PainEntry } from '../../types';

interface DataRestoreProps {
  onDataRestore: (entries: PainEntry[]) => void;
}

interface BackupMetadata {
  version: string;
  timestamp: string;
  entryCount: number;
  encrypted: boolean;
}

export const DataRestore: React.FC<DataRestoreProps> = ({ onDataRestore }) => {
  const [password, setPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [backupMetadata, setBackupMetadata] = useState<BackupMetadata | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<string>('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [previewData, setPreviewData] = useState<PainEntry[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setRestoreStatus('');
    setPreviewData(null);

    try {
      const fileContent = await file.text();
      const backupData = JSON.parse(fileContent);

      if (backupData.metadata) {
        setBackupMetadata(backupData.metadata);
        
        // If not encrypted, show preview
        if (!backupData.encrypted && backupData.data) {
          setPreviewData(backupData.data.slice(0, 3)); // Show first 3 entries as preview
        }
      } else {
        setRestoreStatus('Invalid backup file format');
      }
    } catch (error) {
      setRestoreStatus('Error reading backup file');
    }
  };

  const decryptAndRestore = async () => {
    if (!selectedFile || !backupMetadata) return;

    setIsRestoring(true);
    setRestoreStatus('Restoring data...');

    try {
      const fileContent = await selectedFile.text();
      const backupData = JSON.parse(fileContent);

      let entries: PainEntry[] = [];

      if (backupData.encrypted) {
        if (!password) {
          setRestoreStatus('Password required for encrypted backup');
          setIsRestoring(false);
          return;
        }

        try {
          const decryptedData = CryptoJS.AES.decrypt(backupData.data, password);
          const decryptedText = decryptedData.toString(CryptoJS.enc.Utf8);
          
          if (!decryptedText) {
            setRestoreStatus('Invalid password or corrupted backup file');
            setIsRestoring(false);
            return;
          }

          const parsedData = JSON.parse(decryptedText);
          entries = parsedData.data || [];
        } catch (error) {
          setRestoreStatus('Failed to decrypt backup - check your password');
          setIsRestoring(false);
          return;
        }
      } else {
        entries = backupData.data || [];
      }

      // Validate data structure
      if (!Array.isArray(entries)) {
        setRestoreStatus('Invalid backup data format');
        setIsRestoring(false);
        return;
      }

      // Basic validation of pain entries
      const validEntries = entries.filter(entry => 
        entry && 
        typeof entry.id === 'number' &&
        typeof entry.timestamp === 'string' &&
        entry.baselineData &&
        typeof entry.baselineData.pain === 'number'
      );

      if (validEntries.length !== entries.length) {
        setRestoreStatus(`Warning: ${entries.length - validEntries.length} invalid entries were skipped`);
      }

      onDataRestore(validEntries);
      setRestoreStatus(`Successfully restored ${validEntries.length} pain entries`);
    } catch (error) {
      setRestoreStatus(`Error restoring data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRestoring(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setBackupMetadata(null);
    setPassword('');
    setRestoreStatus('');
    setPreviewData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <span role="img" aria-label="restore">📥</span>
        Restore from Backup
      </h2>

      <div className="space-y-6">
        {/* File Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Backup File
          </label>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Choose File
            </button>
            {selectedFile && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedFile.name}</span>
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
        {backupMetadata && (
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-medium mb-2">Backup Information</h3>
            <div className="text-sm space-y-1">
              <div>• Created: {new Date(backupMetadata.timestamp).toLocaleString()}</div>
              <div>• Version: {backupMetadata.version}</div>
              <div>• Entries: {backupMetadata.entryCount}</div>
              <div>• Encryption: {backupMetadata.encrypted ? '🔒 Encrypted' : '🔓 Plain text'}</div>
            </div>
          </div>
        )}

        {/* Password Input for Encrypted Backups */}
        {backupMetadata?.encrypted && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Backup Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter backup password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-600 mt-1">
              Enter the password used when creating this backup
            </p>
          </div>
        )}

        {/* Data Preview */}
        {previewData && (
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-medium mb-2">Data Preview</h3>
            <div className="text-sm space-y-2">
              {previewData.map((entry, index) => (
                <div key={index} className="border-b border-gray-200 pb-1">
                  <div>Date: {new Date(entry.timestamp).toLocaleDateString()}</div>
                  <div>Pain Level: {entry.baselineData.pain}/10</div>
                  <div>Locations: {entry.baselineData.locations.join(', ')}</div>
                </div>
              ))}
              {backupMetadata && backupMetadata.entryCount > 3 && (
                <div className="text-gray-500">... and {backupMetadata.entryCount - 3} more entries</div>
              )}
            </div>
          </div>
        )}

        {/* Restore Button */}
        <div className="space-y-3">
          <button
            onClick={decryptAndRestore}
            disabled={!selectedFile || isRestoring || (backupMetadata?.encrypted && !password)}
            className="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRestoring ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Restoring Data...
              </>
            ) : (
              <>
                <span role="img" aria-hidden="true">📂</span>
                Restore Data
              </>
            )}
          </button>

          {restoreStatus && (
            <div className={`p-3 rounded text-sm ${
              restoreStatus.includes('Error') || restoreStatus.includes('Invalid') || restoreStatus.includes('Failed') ? 'bg-red-100 text-red-700' : 
              restoreStatus.includes('Successfully') ? 'bg-green-100 text-green-700' : 
              restoreStatus.includes('Warning') ? 'bg-yellow-100 text-yellow-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {restoreStatus}
            </div>
          )}
        </div>

        {/* Warning Notice */}
        <div className="border-l-4 border-red-400 bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Data Restore Warning
              </h3>
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
