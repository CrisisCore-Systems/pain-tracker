/**
 * Security-First Architecture Service
 * Comprehensive security management for the Pain Tracker application
 */

import CryptoJS from 'crypto-js';
import { formatNumber } from '../utils/formatting';

// Security Event Types
export interface SecurityEvent {
  type: 'authentication' | 'encryption' | 'data_access' | 'error' | 'audit' | 'analytics';
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
  private masterKey: string | null = null;

  constructor(
    encryptionConfig?: Partial<EncryptionConfig>,
    privacyConfig?: Partial<PrivacyConfig>
  ) {
    this.encryptionConfig = {
      algorithm: 'AES',
      keySize: 256,
      mode: 'CBC',
      padding: 'PKCS7',
      ...encryptionConfig
    };

    this.privacyConfig = {
      enableAnalytics: true,
      dataRetentionDays: 90,
      anonymizationLevel: 'advanced',
      consentRequired: true,
      minimumNoiseLevel: 0.1,
      ...privacyConfig
    };

    this.sessionId = this.generateSessionId();
    this.initializeSecurity();
  }

  private generateSessionId(): string {
    return CryptoJS.lib.WordArray.random(16).toString();
  }

  private initializeSecurity(): void {
    this.logSecurityEvent({
      type: 'audit',
      level: 'info',
      message: 'Security service initialized',
      metadata: {
        encryptionAlgorithm: this.encryptionConfig.algorithm,
        keySize: this.encryptionConfig.keySize,
        privacyLevel: this.privacyConfig.anonymizationLevel
      },
      timestamp: new Date(),
      sessionId: this.sessionId
    });
  }

  /**
   * Initialize or derive a master key for encryption
   */
  async initializeMasterKey(password?: string): Promise<void> {
    try {
      if (password) {
        // Derive key from password using PBKDF2
        const salt = CryptoJS.lib.WordArray.random(16);
        this.masterKey = CryptoJS.PBKDF2(password, salt, {
          keySize: this.encryptionConfig.keySize / 32,
          iterations: 10000
        }).toString();
      } else {
        // Generate a random master key
        this.masterKey = CryptoJS.lib.WordArray.random(this.encryptionConfig.keySize / 8).toString();
      }

      this.logSecurityEvent({
        type: 'encryption',
        level: 'info',
        message: 'Master key initialized',
        timestamp: new Date(),
        sessionId: this.sessionId
      });
    } catch (error) {
      this.logSecurityEvent({
        type: 'encryption',
        level: 'error',
        message: 'Failed to initialize master key',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date(),
        sessionId: this.sessionId
      });
      throw new Error('Failed to initialize encryption key');
    }
  }

  /**
   * Encrypt data using AES encryption
   */
  async encryptData(data: string, customKey?: string): Promise<string> {
    try {
      const key = customKey || this.masterKey;
      if (!key) {
        throw new Error('Encryption key not available');
      }

      const encrypted = CryptoJS.AES.encrypt(data, key).toString();
      
      this.logSecurityEvent({
        type: 'encryption',
        level: 'info',
        message: 'Data encrypted successfully',
        metadata: { dataLength: data.length },
        timestamp: new Date(),
        sessionId: this.sessionId
      });

      return encrypted;
    } catch (error) {
      this.logSecurityEvent({
        type: 'encryption',
        level: 'error',
        message: 'Data encryption failed',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date(),
        sessionId: this.sessionId
      });
      throw error;
    }
  }

  /**
   * Decrypt data using AES decryption
   */
  async decryptData(encryptedData: string, customKey?: string): Promise<string> {
    try {
      const key = customKey || this.masterKey;
      if (!key) {
        throw new Error('Decryption key not available');
      }

      const decrypted = CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Decryption failed - invalid key or corrupted data');
      }

      this.logSecurityEvent({
        type: 'encryption',
        level: 'info',
        message: 'Data decrypted successfully',
        timestamp: new Date(),
        sessionId: this.sessionId
      });

      return decrypted;
    } catch (error) {
      this.logSecurityEvent({
        type: 'encryption',
        level: 'error',
        message: 'Data decryption failed',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date(),
        sessionId: this.sessionId
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
        const finalData = encrypted ? await this.encryptData(serialized) : serialized;
        localStorage.setItem(key, finalData);
        
        this.logSecurityEvent({
          type: 'data_access',
          level: 'info',
          message: `Data stored: ${key}`,
          metadata: { encrypted, dataSize: serialized.length },
          timestamp: new Date(),
          sessionId: this.sessionId
        });
      },

      retrieve: async (key: string, encrypted = true) => {
        const stored = localStorage.getItem(key);
        if (!stored) return null;

        try {
          const data = encrypted ? await this.decryptData(stored) : stored;
          return JSON.parse(data);
        } catch (error) {
          this.logSecurityEvent({
            type: 'data_access',
            level: 'error',
            message: `Failed to retrieve data: ${key}`,
            metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
            timestamp: new Date(),
            sessionId: this.sessionId
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
          sessionId: this.sessionId
        });
      },

      clear: async () => {
        localStorage.clear();
        this.logSecurityEvent({
          type: 'data_access',
          level: 'warning',
          message: 'All local storage cleared',
          timestamp: new Date(),
          sessionId: this.sessionId
        });
      }
    };
  }

  /**
   * Log security events for monitoring and auditing
   */
  logSecurityEvent(event: SecurityEvent): void {
    this.events.push({
      ...event,
      sessionId: event.sessionId || this.sessionId
    });

    // Keep only recent events to prevent memory issues
    if (this.events.length > 1000) {
      this.events = this.events.slice(-500);
    }

    // Log critical events to console
    if (event.level === 'critical' || event.level === 'error') {
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
    if (!this.masterKey) {
      issues.push({
        id: 'no-master-key',
        severity: 'high',
        category: 'encryption',
        title: 'No Master Key Initialized',
        description: 'Encryption is not properly configured',
        remediation: 'Initialize master key using initializeMasterKey()',
        affectedComponents: ['SecureStorage', 'DataEncryption']
      });
      recommendations.push('Initialize encryption system with a strong master key');
    }

    // Check for recent security errors
    const recentErrors = this.events
      .filter(e => e.level === 'error' || e.level === 'critical')
      .filter(e => (Date.now() - e.timestamp.getTime()) < 24 * 60 * 60 * 1000); // Last 24 hours

    if (recentErrors.length > 0) {
      issues.push({
        id: 'recent-security-errors',
        severity: 'medium',
        category: 'configuration',
        title: 'Recent Security Errors Detected',
        description: `${recentErrors.length} security errors in the last 24 hours`,
        remediation: 'Review security event logs and address recurring issues',
        affectedComponents: ['SecurityMonitoring']
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
        affectedComponents: ['SecureStorage']
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
        score
      },
      timestamp: new Date(),
      sessionId: this.sessionId
    });

    return {
      passed: score >= 0.8 && criticalIssues === 0,
      score,
      issues,
      recommendations,
      lastAudit: new Date()
    };
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
      sessionId: this.sessionId
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
      encryptionEnabled: !!this.masterKey,
      masterKeyInitialized: !!this.masterKey,
      recentEvents: recentEvents.length,
      recentErrors: recentErrors.length,
      lastAudit: lastAuditEvent?.timestamp || null
    };
  }
}

// Export singleton instance
export const securityService = new SecurityService();
