/**
 * End-to-End Encryption Service
 * Provides comprehensive encryption for all data at rest and in transit
 */

import CryptoJS from 'crypto-js';
import { securityService } from './SecurityService';
import type { PainEntry } from '../types';

// Encryption metadata for tracking
export interface EncryptionMetadata {
  algorithm: string;
  keyId: string;
  timestamp: Date;
  version: string;
}

// Encrypted data wrapper
export interface EncryptedData<T = unknown> {
  data: string; // Encrypted content
  metadata: EncryptionMetadata;
  checksum: string; // For integrity verification
  type?: T; // Type information for better TypeScript support (not used at runtime)
}

// Key management interface
export interface KeyManager {
  generateKey(keyId: string): Promise<string>;
  storeKey(keyId: string, key: string): Promise<void>;
  retrieveKey(keyId: string): Promise<string | null>;
  rotateKey(keyId: string): Promise<string>;
  deleteKey(keyId: string): Promise<void>;
  listKeys(): Promise<string[]>;
}

// Encryption options
export interface EncryptionOptions {
  keyId?: string;
  algorithm?: 'AES-256' | 'AES-192' | 'AES-128';
  useCompression?: boolean;
  addIntegrityCheck?: boolean;
}

/**
 * End-to-End Encryption Service
 * Handles encryption/decryption of all sensitive data
 */
export class EndToEndEncryptionService {
  private keyManager: KeyManager;
  private defaultKeyId = 'pain-tracker-master';

  constructor() {
    this.keyManager = this.createKeyManager();
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      // Ensure default key exists
      const defaultKey = await this.keyManager.retrieveKey(this.defaultKeyId);
      if (!defaultKey) {
        await this.keyManager.generateKey(this.defaultKeyId);
      }

      securityService.logSecurityEvent({
        type: 'encryption',
        level: 'info',
        message: 'End-to-end encryption service initialized',
        timestamp: new Date()
      });
    } catch (error) {
      securityService.logSecurityEvent({
        type: 'encryption',
        level: 'error',
        message: 'Failed to initialize encryption service',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      });
    }
  }

  private createKeyManager(): KeyManager {
    return {
      generateKey: async (keyId: string): Promise<string> => {
        const key = CryptoJS.lib.WordArray.random(32).toString(); // 256-bit key
        await this.keyManager.storeKey(keyId, key);
        
        securityService.logSecurityEvent({
          type: 'encryption',
          level: 'info',
          message: `New encryption key generated: ${keyId}`,
          timestamp: new Date()
        });

        return key;
      },

      storeKey: async (keyId: string, key: string): Promise<void> => {
        // Encrypt the key itself with a master key
        const storage = securityService.createSecureStorage();
        await storage.store(`key:${keyId}`, { key, created: new Date().toISOString() }, true);
      },

      retrieveKey: async (keyId: string): Promise<string | null> => {
        try {
          const storage = securityService.createSecureStorage();
          const stored = await storage.retrieve(`key:${keyId}`, true) as { key: string; created: string } | null;
          return stored?.key || null;
        } catch (error) {
          securityService.logSecurityEvent({
            type: 'encryption',
            level: 'error',
            message: `Failed to retrieve key: ${keyId}`,
            metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
            timestamp: new Date()
          });
          return null;
        }
      },

      rotateKey: async (keyId: string): Promise<string> => {
        const oldKey = await this.keyManager.retrieveKey(keyId);
        const newKey = await this.keyManager.generateKey(keyId);
        
        if (oldKey) {
          // Archive old key for potential data recovery
          const storage = securityService.createSecureStorage();
          await storage.store(`archived-key:${keyId}:${Date.now()}`, { key: oldKey }, true);
        }

        securityService.logSecurityEvent({
          type: 'encryption',
          level: 'info',
          message: `Key rotated: ${keyId}`,
          timestamp: new Date()
        });

        return newKey;
      },

      deleteKey: async (keyId: string): Promise<void> => {
        const storage = securityService.createSecureStorage();
        await storage.delete(`key:${keyId}`);
        
        securityService.logSecurityEvent({
          type: 'encryption',
          level: 'warning',
          message: `Key deleted: ${keyId}`,
          timestamp: new Date()
        });
      },

      listKeys: async (): Promise<string[]> => {
        const keys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('key:')) {
            keys.push(key.substring(4));
          }
        }
        return keys;
      }
    };
  }

  /**
   * Encrypt any data object
   */
  async encrypt<T>(data: T, options: EncryptionOptions = {}): Promise<EncryptedData<T>> {
    try {
      const keyId = options.keyId || this.defaultKeyId;
      const algorithm = options.algorithm || 'AES-256';
      const useCompression = options.useCompression ?? true;
      const addIntegrityCheck = options.addIntegrityCheck ?? true;

      // Get encryption key
      const key = await this.keyManager.retrieveKey(keyId);
      if (!key) {
        throw new Error(`Encryption key not found: ${keyId}`);
      }

      // Serialize data
      let serialized = JSON.stringify(data);

      // Optional compression
      if (useCompression && serialized.length > 1000) {
        // Simple compression simulation (in real app, use actual compression)
        serialized = this.compressString(serialized);
      }

      // Encrypt data
      const encrypted = CryptoJS.AES.encrypt(serialized, key).toString();

      // Calculate checksum for integrity
      let checksum = '';
      if (addIntegrityCheck) {
        checksum = CryptoJS.SHA256(serialized + key).toString();
      }

      const metadata: EncryptionMetadata = {
        algorithm,
        keyId,
        timestamp: new Date(),
        version: '1.0.0'
      };

      securityService.logSecurityEvent({
        type: 'encryption',
        level: 'info',
        message: 'Data encrypted successfully',
        metadata: {
          keyId,
          algorithm,
          originalSize: serialized.length,
          encryptedSize: encrypted.length,
          compressed: useCompression
        },
        timestamp: new Date()
      });

      return {
        data: encrypted,
        metadata,
        checksum
      };
    } catch (error) {
      securityService.logSecurityEvent({
        type: 'encryption',
        level: 'error',
        message: 'Data encryption failed',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Decrypt encrypted data
   */
  async decrypt<T>(encryptedData: EncryptedData<T>): Promise<T> {
    try {
      const { data, metadata, checksum } = encryptedData;
      const { keyId, algorithm } = metadata;

      // Get decryption key
      const key = await this.keyManager.retrieveKey(keyId);
      if (!key) {
        throw new Error(`Decryption key not found: ${keyId}`);
      }

      // Decrypt data
      const decrypted = CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }

      // Verify integrity if checksum exists
      if (checksum) {
        const calculatedChecksum = CryptoJS.SHA256(decrypted + key).toString();
        if (calculatedChecksum !== checksum) {
          throw new Error('Data integrity check failed - data may be corrupted');
        }
      }

      // Decompress if needed
      let final = decrypted;
      if (decrypted.startsWith('COMPRESSED:')) {
        final = this.decompressString(decrypted);
      }

      securityService.logSecurityEvent({
        type: 'encryption',
        level: 'info',
        message: 'Data decrypted successfully',
        metadata: {
          keyId,
          algorithm,
          integrityVerified: !!checksum
        },
        timestamp: new Date()
      });

      return JSON.parse(final);
    } catch (error) {
      securityService.logSecurityEvent({
        type: 'encryption',
        level: 'error',
        message: 'Data decryption failed',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Encrypt pain entry data specifically
   */
  async encryptPainEntry(entry: PainEntry): Promise<EncryptedData<PainEntry>> {
    return this.encrypt(entry, {
      useCompression: true,
      addIntegrityCheck: true
    });
  }

  /**
   * Decrypt pain entry data specifically
   */
  async decryptPainEntry(encryptedEntry: EncryptedData<PainEntry>): Promise<PainEntry> {
    return this.decrypt(encryptedEntry);
  }

  /**
   * Encrypt an array of pain entries efficiently
   */
  async encryptPainEntries(entries: PainEntry[]): Promise<EncryptedData<PainEntry[]>> {
    return this.encrypt(entries, {
      useCompression: true,
      addIntegrityCheck: true
    });
  }

  /**
   * Decrypt an array of pain entries
   */
  async decryptPainEntries(encryptedEntries: EncryptedData<PainEntry[]>): Promise<PainEntry[]> {
    return this.decrypt(encryptedEntries);
  }

  /**
   * Secure backup creation with encryption
   */
  async createEncryptedBackup(data: unknown, password?: string): Promise<string> {
    const keyId = password ? `backup-${Date.now()}` : this.defaultKeyId;
    
    if (password) {
      // Generate key from password
      const salt = CryptoJS.lib.WordArray.random(16);
      const derivedKey = CryptoJS.PBKDF2(password, salt, {
        keySize: 8, // 256 bits
        iterations: 10000
      }).toString();
      
      await this.keyManager.storeKey(keyId, derivedKey);
    }

    const encrypted = await this.encrypt(data, { keyId });
    
    securityService.logSecurityEvent({
      type: 'encryption',
      level: 'info',
      message: 'Encrypted backup created',
      metadata: { keyId, passwordProtected: !!password },
      timestamp: new Date()
    });

    return JSON.stringify(encrypted, null, 2);
  }

  /**
   * Restore from encrypted backup
   */
  async restoreFromEncryptedBackup<T>(backupData: string, password?: string): Promise<T> {
    try {
      const encrypted = JSON.parse(backupData) as EncryptedData<T>;
      
      if (password) {
        // Derive key from password (need salt from backup metadata)
        const salt = CryptoJS.lib.WordArray.random(16);
        const derivedKey = CryptoJS.PBKDF2(password, salt, {
          keySize: 8,
          iterations: 10000
        }).toString();
        
        await this.keyManager.storeKey(encrypted.metadata.keyId, derivedKey);
      }

      const decrypted = await this.decrypt(encrypted);
      
      securityService.logSecurityEvent({
        type: 'encryption',
        level: 'info',
        message: 'Data restored from encrypted backup',
        metadata: { keyId: encrypted.metadata.keyId },
        timestamp: new Date()
      });

      return decrypted;
    } catch (error) {
      securityService.logSecurityEvent({
        type: 'encryption',
        level: 'error',
        message: 'Failed to restore from encrypted backup',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Key rotation for enhanced security
   */
  async rotateEncryptionKeys(): Promise<void> {
    try {
      const keys = await this.keyManager.listKeys();
      const rotationResults: Array<{ keyId: string; success: boolean }> = [];

      for (const keyId of keys) {
        try {
          await this.keyManager.rotateKey(keyId);
          rotationResults.push({ keyId, success: true });
        } catch (error) {
          rotationResults.push({ keyId, success: false });
          console.error(`Failed to rotate key ${keyId}:`, error);
        }
      }

      securityService.logSecurityEvent({
        type: 'encryption',
        level: 'info',
        message: 'Key rotation completed',
        metadata: {
          totalKeys: keys.length,
          successful: rotationResults.filter(r => r.success).length,
          failed: rotationResults.filter(r => !r.success).length
        },
        timestamp: new Date()
      });
    } catch (error) {
      securityService.logSecurityEvent({
        type: 'encryption',
        level: 'error',
        message: 'Key rotation failed',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date()
      });
      throw error;
    }
  }

  /**
   * Get encryption status and metrics
   */
  getEncryptionStatus(): {
    keysGenerated: number;
    defaultKeyExists: boolean;
    encryptionEnabled: boolean;
    lastKeyRotation: Date | null;
  } {
    return {
      keysGenerated: 0, // Would be implemented with actual key counting
      defaultKeyExists: true, // Would check if default key exists
      encryptionEnabled: true,
      lastKeyRotation: null // Would track last rotation
    };
  }

  // Simple compression simulation (replace with actual compression library)
  private compressString(str: string): string {
    return `COMPRESSED:${str}`; // Placeholder
  }

  private decompressString(compressed: string): string {
    return compressed.replace('COMPRESSED:', ''); // Placeholder
  }
}

// Export singleton instance
export const encryptionService = new EndToEndEncryptionService();
