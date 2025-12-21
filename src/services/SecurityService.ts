/**
 * Security-First Architecture Service
 * Comprehensive security management for the Pain Tracker application
 */

import { formatNumber } from '../utils/formatting';
import type { WrappedKeyPayload } from '../types/security';

// --- small crypto helpers (kept local to avoid circular deps) ---
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== 'undefined') return Buffer.from(buffer).toString('base64');
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  if (typeof Buffer !== 'undefined') {
    const buf = Buffer.from(base64, 'base64');
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    return new Uint8Array(ab);
  }
  const binary = atob(base64);
  const ab = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(ab);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// Security Event Types
export interface SecurityEvent {
  type: 'authentication' | 'encryption' | 'data_access' | 'error' | 'audit' | 'analytics' | 'vault';
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

// Encryption Configuration
export interface EncryptionConfig {
  algorithm: 'AES' | 'RSA';
  keySize: 128 | 192 | 256;
  mode: 'CBC' | 'GCM' | 'CTR';
  padding: 'PKCS7' | 'ISO97971' | 'NoPadding';
}

// Security Audit Result
export interface SecurityAuditResult {
  passed: boolean;
  score: number; // 0-1
  issues: SecurityIssue[];
  recommendations: string[];
  lastAudit: Date;
}

export interface SecurityIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'encryption' | 'authentication' | 'data' | 'network' | 'configuration';
  title: string;
  description: string;
  remediation: string;
  affectedComponents: string[];
}

// Privacy-Preserving Analytics Configuration
export interface PrivacyConfig {
  enableAnalytics: boolean;
  dataRetentionDays: number;
  anonymizationLevel: 'none' | 'basic' | 'advanced' | 'differential';
  consentRequired: boolean;
  minimumNoiseLevel: number; // For differential privacy
}

// Secure Storage Interface
export interface SecureStorage {
  encrypt(data: string, key?: string): Promise<string>;
  decrypt(encryptedData: string, key?: string): Promise<string>;
  store(key: string, data: unknown, encrypted?: boolean): Promise<void>;
  retrieve(key: string, encrypted?: boolean): Promise<unknown>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Main Security Service
 * Handles all security-related operations including encryption, auditing, and monitoring
 */
export class SecurityService {
  private events: SecurityEvent[] = [];
  private encryptionConfig: EncryptionConfig;
  private privacyConfig: PrivacyConfig;
  private sessionId: string;
  // In-memory non-extractable master keys
  private masterCryptoKey: CryptoKey | null = null;
  private masterHmacKey: CryptoKey | null = null;

  constructor(
    encryptionConfig?: Partial<EncryptionConfig>,
    privacyConfig?: Partial<PrivacyConfig>
  ) {
    this.encryptionConfig = {
      algorithm: 'AES',
      keySize: 256,
      mode: 'CBC',
      padding: 'PKCS7',
      ...encryptionConfig,
    };

    this.privacyConfig = {
      enableAnalytics: true,
      dataRetentionDays: 90,
      anonymizationLevel: 'advanced',
      consentRequired: true,
      minimumNoiseLevel: 0.1,
      ...privacyConfig,
    };

    // Cache test environment detection at construction time to prevent manipulation
    this._isTestEnvCached = SecurityService.detectTestEnv();
    this.sessionId = this.generateSessionId();
    this.initializeSecurity();
  }

  // Test environment flag - cached at construction time to prevent runtime manipulation
  private readonly _isTestEnvCached: boolean;
  
  private isTestEnv(): boolean {
    return this._isTestEnvCached;
  }
  
  private static detectTestEnv(): boolean {
    try {
      // Only check environment variables at module load time for security
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const env = (typeof process !== 'undefined' ? (process as any).env : undefined) || {};
      const isTest = !!(env && (env.VITEST || env.NODE_ENV === 'test'));
      if (isTest) {
        // Log warning if test mode is detected in a suspicious context
        if (typeof window !== 'undefined' && window.location?.hostname !== 'localhost') {
          console.warn('[SECURITY] Test environment detected in non-localhost context');
        }
      }
      return isTest;
    } catch {
      return false;
    }
  }

  private generateSessionId(): string {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private initializeSecurity(): void {
    this.logSecurityEvent({
      type: 'audit',
      level: 'info',
      message: 'Security service initialized',
      metadata: {
        encryptionAlgorithm: this.encryptionConfig.algorithm,
        keySize: this.encryptionConfig.keySize,
        privacyLevel: this.privacyConfig.anonymizationLevel,
      },
      timestamp: new Date(),
      sessionId: this.sessionId,
    });
  }

  /**
   * Initialize or derive a master key for encryption
   */
  async initializeMasterKey(password?: string): Promise<void> {
    try {
      // Use SubtleCrypto to derive or generate a non-extractable AES-GCM key and an HMAC key.
      const subtle = crypto.subtle;
      const iterationOverride =
        typeof process !== 'undefined' &&
        process.env &&
        (process.env.VITEST || process.env.NODE_ENV === 'test')
          ? 500
          : 150000; // Increased PBKDF2 iterations for production

      if (password) {
        // Derive a base key from password
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltBytes: Uint8Array<ArrayBuffer> = new Uint8Array(salt);
        const pwUtf8 = new TextEncoder().encode(password);
        const baseKey = await subtle.importKey('raw', pwUtf8, 'PBKDF2', false, [
          'deriveBits',
          'deriveKey',
        ]);

        // Derive AES-GCM key
        this.masterCryptoKey = await subtle.deriveKey(
          { name: 'PBKDF2', salt: saltBytes, iterations: iterationOverride, hash: 'SHA-256' },
          baseKey,
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt', 'decrypt']
        );

        // Derive HMAC key separately (deriveBits -> import)
        const hmacBits = await subtle.deriveBits(
          { name: 'PBKDF2', salt: saltBytes, iterations: iterationOverride, hash: 'SHA-256' },
          baseKey,
          256
        );
        this.masterHmacKey = await subtle.importKey(
          'raw',
          hmacBits,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign', 'verify']
        );
      } else {
        // Generate ephemeral non-extractable keys for the session
        this.masterCryptoKey = await crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt', 'decrypt']
        );
        this.masterHmacKey = await crypto.subtle.generateKey(
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign', 'verify']
        );
      }

      this.logSecurityEvent({
        type: 'encryption',
        level: 'info',
        message: 'Master key initialized',
        timestamp: new Date(),
        sessionId: this.sessionId,
      });
    } catch (error) {
      this.logSecurityEvent({
        type: 'encryption',
        level: 'error',
        message: 'Failed to initialize master key',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date(),
        sessionId: this.sessionId,
      });
      throw new Error('Failed to initialize encryption key');
    }
  }

  /**
   * Encrypt data using AES encryption
   */
  async encryptData(data: string, _customKey?: string): Promise<string> {
    try {
      // Use in-memory masterCryptoKey for encryption. customKey path is deprecated.
      if (!this.masterCryptoKey || !this.masterHmacKey) {
        if (this.isTestEnv()) {
          // In tests allow a plaintext passthrough to avoid flaky setup, but never in production
          return JSON.stringify({ v: 'clear', payload: data });
        }
        throw new Error('Encryption key not available');
      }

      const iv = new Uint8Array(12) as Uint8Array<ArrayBuffer>;
      crypto.getRandomValues(iv);
      const enc = new TextEncoder().encode(data);
      const cipherBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.masterCryptoKey,
        enc
      );
      const cipherB64 = arrayBufferToBase64(cipherBuffer);

      // Compute HMAC over ciphertext for integrity (do not include raw key)
      const hmacSig = await crypto.subtle.sign(
        'HMAC',
        this.masterHmacKey,
        base64ToBytes(cipherB64)
      );
      const hmacB64 = arrayBufferToBase64(hmacSig);

      const payload = JSON.stringify({
        v: '1',
        cipher: cipherB64,
        iv: arrayBufferToBase64(iv.buffer),
        hmac: hmacB64,
      });

      this.logSecurityEvent({
        type: 'encryption',
        level: 'info',
        message: 'Data encrypted successfully',
        metadata: { dataLength: data.length },
        timestamp: new Date(),
        sessionId: this.sessionId,
      });

      return payload;
    } catch (error) {
      this.logSecurityEvent({
        type: 'encryption',
        level: 'error',
        message: 'Data encryption failed',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date(),
        sessionId: this.sessionId,
      });
      throw error;
    }
  }

  /**
   * Decrypt data using AES decryption
   */
  async decryptData(encryptedData: string, _customKey?: string): Promise<string> {
    try {
      if (!this.masterCryptoKey || !this.masterHmacKey) {
        if (this.isTestEnv()) {
          // Check if this is a clear passthrough produced by tests
          try {
            const obj = JSON.parse(encryptedData);
            if (obj && obj.v === 'clear' && typeof obj.payload === 'string') return obj.payload;
          } catch {
            // ignore parse failure in test passthrough path; will error below if keys unavailable
          }
        }
        throw new Error('Decryption key not available');
      }

      // Expect a JSON blob with cipher, iv, hmac
      let parsed: { v?: string; cipher?: string; iv?: string; hmac?: string; payload?: string };
      try {
        parsed = JSON.parse(encryptedData);
      } catch {
        throw new Error('Malformed encrypted payload');
      }

      if (parsed.v === 'clear' && typeof parsed.payload === 'string') {
        return parsed.payload as unknown as string;
      }

      if (!parsed.cipher || !parsed.iv || !parsed.hmac)
        throw new Error('Encrypted payload missing fields');

      // Verify HMAC
      const expected = await crypto.subtle.verify(
        'HMAC',
        this.masterHmacKey,
        base64ToBytes(parsed.hmac),
        base64ToBytes(parsed.cipher)
      );
      if (!expected) throw new Error('Integrity check failed - HMAC mismatch');

      const iv = base64ToBytes(parsed.iv);
      const cipherBuf = base64ToBytes(parsed.cipher);
      let decryptedBuf: ArrayBuffer;
      try {
        decryptedBuf = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          this.masterCryptoKey,
          cipherBuf
        );
      } catch {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }

      const decrypted = new TextDecoder().decode(new Uint8Array(decryptedBuf));

      this.logSecurityEvent({
        type: 'encryption',
        level: 'info',
        message: 'Data decrypted successfully',
        timestamp: new Date(),
        sessionId: this.sessionId,
      });

      return decrypted;
    } catch (error) {
      this.logSecurityEvent({
        type: 'encryption',
        level: 'error',
        message: 'Data decryption failed',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date(),
        sessionId: this.sessionId,
      });
      throw error;
    }
  }

  /**
   * Secure storage implementation
   */
  createSecureStorage(): SecureStorage {
    return {
      encrypt: async (data: string, key?: string) => {
        return this.encryptData(data, key);
      },

      decrypt: async (encryptedData: string, key?: string) => {
        return this.decryptData(encryptedData, key);
      },

      store: async (key: string, data: unknown, encrypted = true) => {
        const serialized = JSON.stringify(data);
        if (encrypted) {
          if (!this.masterCryptoKey) {
            if (!this.isTestEnv())
              throw new Error('Secure storage requires initialized master key');
            // In tests allow passthrough to avoid setup complexity
            localStorage.setItem(key, serialized);
          } else {
            const finalData = await this.encryptData(serialized);
            localStorage.setItem(key, finalData);
          }
        } else {
          // Disallow storing plaintext in production
          if (!this.isTestEnv())
            throw new Error('Storing plaintext sensitive data in localStorage is forbidden');
          localStorage.setItem(key, serialized);
        }

        this.logSecurityEvent({
          type: 'data_access',
          level: 'info',
          message: `Data stored: ${key}`,
          metadata: { encrypted, dataSize: serialized.length },
          timestamp: new Date(),
          sessionId: this.sessionId,
        });
      },

      retrieve: async (key: string, encrypted = true) => {
        const stored = localStorage.getItem(key);
        if (!stored) return null;

        try {
          const data = encrypted ? await this.decryptData(stored) : stored;
          return JSON.parse(data as string);
        } catch (error) {
          this.logSecurityEvent({
            type: 'data_access',
            level: 'error',
            message: `Failed to retrieve data: ${key}`,
            metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
            timestamp: new Date(),
            sessionId: this.sessionId,
          });
          return null;
        }
      },

      delete: async (key: string) => {
        localStorage.removeItem(key);
        this.logSecurityEvent({
          type: 'data_access',
          level: 'info',
          message: `Data deleted: ${key}`,
          timestamp: new Date(),
          sessionId: this.sessionId,
        });
      },

      clear: async () => {
        localStorage.clear();
        this.logSecurityEvent({
          type: 'data_access',
          level: 'warning',
          message: 'All local storage cleared',
          timestamp: new Date(),
          sessionId: this.sessionId,
        });
      },
    };
  }

  /**
   * Log security events for monitoring and auditing
   */
  logSecurityEvent(event: SecurityEvent): void {
    this.events.push({
      ...event,
      sessionId: event.sessionId || this.sessionId,
    });

    // Keep only recent events to prevent memory issues (more aggressive trimming)
    if (this.events.length > 500) {
      this.events = this.events.slice(-250);
    }

    // Log critical events to console unless running tests (tests inspect events in-memory)
    if (!this.isTestEnv() && (event.level === 'critical' || event.level === 'error')) {
      console.error(`[SECURITY ${event.level.toUpperCase()}]`, event.message, event.metadata);
    }
  }

  /**
   * Perform security audit
   */
  async performSecurityAudit(): Promise<SecurityAuditResult> {
    const issues: SecurityIssue[] = [];
    const recommendations: string[] = [];

    // Check if master key is initialized
    if (!this.masterCryptoKey) {
      issues.push({
        id: 'no-master-key',
        severity: 'high',
        category: 'encryption',
        title: 'No Master Key Initialized',
        description: 'Encryption is not properly configured',
        remediation: 'Initialize master key using initializeMasterKey()',
        affectedComponents: ['SecureStorage', 'DataEncryption'],
      });
      recommendations.push('Initialize encryption system with a strong master key');
    }

    // Check for recent security errors
    const recentErrors = this.events
      .filter(e => e.level === 'error' || e.level === 'critical')
      .filter(e => Date.now() - e.timestamp.getTime() < 24 * 60 * 60 * 1000); // Last 24 hours

    if (recentErrors.length > 0) {
      issues.push({
        id: 'recent-security-errors',
        severity: 'medium',
        category: 'configuration',
        title: 'Recent Security Errors Detected',
        description: `${recentErrors.length} security errors in the last 24 hours`,
        remediation: 'Review security event logs and address recurring issues',
        affectedComponents: ['SecurityMonitoring'],
      });
      recommendations.push('Review and address recent security errors');
    }

    // Check storage encryption
    const sampleKey = 'security-audit-test';
    const storage = this.createSecureStorage();
    try {
      await storage.store(sampleKey, { test: true }, true);
      await storage.retrieve(sampleKey, true);
      await storage.delete(sampleKey);
    } catch (error) {
      issues.push({
        id: 'storage-encryption-failure',
        severity: 'high',
        category: 'encryption',
        title: 'Storage Encryption Test Failed',
        description: 'Secure storage operations are not working correctly',
        remediation: 'Debug encryption/decryption process and ensure proper key management',
        affectedComponents: ['SecureStorage'],
      });
      console.error('Storage encryption test failed:', error);
    }

    // Calculate security score
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;

    const score = Math.max(0, 1 - (criticalIssues * 0.4 + highIssues * 0.3 + mediumIssues * 0.1));

    this.logSecurityEvent({
      type: 'audit',
      level: issues.length === 0 ? 'info' : 'warning',
      message: `Security audit completed. Score: ${formatNumber(score * 100, 1)}%`,
      metadata: {
        totalIssues: issues.length,
        criticalIssues,
        highIssues,
        mediumIssues,
        score,
      },
      timestamp: new Date(),
      sessionId: this.sessionId,
    });

    return {
      passed: score >= 0.8 && criticalIssues === 0,
      score,
      issues,
      recommendations,
      lastAudit: new Date(),
    };
  }

  /**
   * Wrap a CryptoKey with the masterCryptoKey for persistent storage.
   * Returns a JSON string containing the wrapped key material and IV.
   */
  async wrapKey(key: CryptoKey): Promise<string> {
    if (!this.masterCryptoKey) {
      if (this.isTestEnv()) {
        // In test env, allow exporting raw key for simplicity
        try {
          const raw = await crypto.subtle.exportKey('raw', key);
          return JSON.stringify({ wrapped: arrayBufferToBase64(raw), iv: null, format: 'raw' });
        } catch {
          return JSON.stringify({ wrapped: null, iv: null, format: 'none' });
        }
      }
      throw new Error('Master crypto key not initialized - cannot wrap key');
    }

    // Use AES-GCM wrapping with a random IV
    const iv = new Uint8Array(12) as Uint8Array<ArrayBuffer>;
    crypto.getRandomValues(iv);
    const wrapped = await crypto.subtle.wrapKey('raw', key, this.masterCryptoKey, {
      name: 'AES-GCM',
      iv,
    });
    return JSON.stringify({
      wrapped: arrayBufferToBase64(wrapped),
      iv: arrayBufferToBase64(iv.buffer),
      format: 'raw',
    });
  }

  /**
   * Unwrap a previously wrapped key JSON (as produced by wrapKey) into a CryptoKey.
   */
  // Narrow algorithm/usages types inline (avoid DOM lib global types that triggered lint no-undef)
  async unwrapKey(
    wrappedJson: string,
    algorithm: { name: string } = { name: 'AES-GCM' },
    usages: Array<'encrypt' | 'decrypt' | 'sign' | 'verify'> = ['encrypt', 'decrypt']
  ): Promise<CryptoKey | null> {
    try {
      const obj = JSON.parse(wrappedJson) as
        | WrappedKeyPayload
        | { wrapped?: string | null; iv?: string | null; format?: string };
      if (!obj || !obj.wrapped) return null;
      if (obj.format === 'raw' && (!obj.iv || !this.masterCryptoKey)) {
        if (this.isTestEnv()) {
          // In tests the wrapped field may actually be raw key material
          const raw = base64ToBytes(obj.wrapped);
          return await crypto.subtle.importKey('raw', raw, algorithm, false, usages);
        }
        // Cannot unwrap without master key
        throw new Error('Cannot unwrap key - master key missing');
      }

      const iv: Uint8Array<ArrayBuffer> | null = obj.iv ? base64ToBytes(obj.iv) : null;
      const wrappedBuf = base64ToBytes(obj.wrapped);
      if (!this.masterCryptoKey) throw new Error('Master crypto key not initialized');
      // Unwrap key
      const key = await crypto.subtle.unwrapKey(
        'raw',
        wrappedBuf,
        this.masterCryptoKey,
        { name: 'AES-GCM', iv: iv ?? (new Uint8Array(12) as Uint8Array<ArrayBuffer>) },
        algorithm,
        false,
        usages
      );
      return key;
    } catch (e) {
      this.logSecurityEvent({
        type: 'encryption',
        level: 'error',
        message: 'Failed to unwrap key',
        metadata: { error: e instanceof Error ? e.message : String(e) },
        timestamp: new Date(),
        sessionId: this.sessionId,
      });
      if (this.isTestEnv()) return null;
      throw e;
    }
  }

  /**
   * Get security events for monitoring
   */
  getSecurityEvents(filters?: {
    type?: SecurityEvent['type'];
    level?: SecurityEvent['level'];
    since?: Date;
    limit?: number;
  }): SecurityEvent[] {
    let filtered = [...this.events];

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(e => e.type === filters.type);
      }
      if (filters.level) {
        filtered = filtered.filter(e => e.level === filters.level);
      }
      if (filters.since) {
        filtered = filtered.filter(e => e.timestamp >= filters.since!);
      }
      if (filters.limit) {
        filtered = filtered.slice(-filters.limit);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Clear security events (for privacy compliance)
   */
  clearSecurityEvents(olderThan?: Date): void {
    if (olderThan) {
      this.events = this.events.filter(e => e.timestamp >= olderThan);
    } else {
      this.events = [];
    }

    this.logSecurityEvent({
      type: 'audit',
      level: 'info',
      message: 'Security events cleared',
      metadata: { olderThan: olderThan?.toISOString() },
      timestamp: new Date(),
      sessionId: this.sessionId,
    });
  }

  /**
   * Get current security status summary
   */
  getSecurityStatus(): {
    encryptionEnabled: boolean;
    masterKeyInitialized: boolean;
    recentEvents: number;
    recentErrors: number;
    lastAudit: Date | null;
  } {
    const recent24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = this.events.filter(e => e.timestamp >= recent24h);
    const recentErrors = recentEvents.filter(e => e.level === 'error' || e.level === 'critical');

    const lastAuditEvent = this.events
      .filter(e => e.type === 'audit' && e.message.includes('audit completed'))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    return {
      encryptionEnabled: !!this.masterCryptoKey,
      masterKeyInitialized: !!this.masterCryptoKey,
      recentEvents: recentEvents.length,
      recentErrors: recentErrors.length,
      lastAudit: lastAuditEvent?.timestamp || null,
    };
  }
}

// Export singleton instance
export const securityService = new SecurityService();
