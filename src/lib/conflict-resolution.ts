/**
 * Advanced Conflict Resolution Service
 * Handles sophisticated merge strategies and user-guided conflict resolution for offline data sync
 */

import { offlineStorage } from './offline-storage';
import { secureStorage } from './storage/secureStorage';

// Conflict resolution types
export interface DataConflict {
  id: string;
  entityType: 'pain-entry' | 'settings' | 'emergency-data' | 'activity-log';
  entityId: string | number;
  conflictType: 'modification' | 'deletion' | 'creation' | 'version';
  localVersion: DataEntity | null;
  remoteVersion: DataEntity | null;
  localTimestamp: string;
  remoteTimestamp: string;
  localChecksum?: string;
  remoteChecksum?: string;
  metadata: {
    userDeviceId?: string;
    conflictDetectedAt: string;
    priority: 'high' | 'medium' | 'low';
    autoResolvable: boolean;
  };
}

export interface ConflictResolutionStrategy {
  name: string;
  description: string;
  automatic: boolean;
  traumaInformed: boolean;
  preservesUserAgency: boolean;
  apply: (conflict: DataConflict) => Promise<ConflictResolution>;
}

export interface ConflictResolution {
  strategy: string;
  resolved: boolean;
  mergedData?: DataEntity | Record<string, unknown> | null;
  userAction?: 'accept-local' | 'accept-remote' | 'merge' | 'manual-edit' | 'postpone';
  confidence: number; // 0-100
  requiresUserReview: boolean;
  explanation: string;
  preservedUserChanges: boolean;
}

export interface MergeRule {
  field: string;
  strategy:
    | 'last-writer-wins'
    | 'prefer-local'
    | 'prefer-remote'
    | 'user-decides'
    | 'merge-arrays'
    | 'sum-numbers'
    | 'min-value'
    | 'max-value';
  priority: number;
  condition?: (local: unknown, remote: unknown) => boolean;
  traumaInformed?: boolean; // Protects user from losing important emotional data
}

// Internal persistence record shapes (stored under settings via key-value helpers)
interface DeletionRecord {
  itemId: string | number;
  timestamp: string;
}

interface StoredConflictResolutionRecord {
  conflictId: string;
  resolution: ConflictResolution;
  timestamp: string;
}

interface PostponedConflictRecord {
  conflictId: string;
  postponeUntil: string; // ISO
  conflict: DataConflict;
}

// Generic entity shape for conflict comparison & merging
export interface DataEntity {
  id: string | number;
  type?: 'pain-entry' | 'settings' | 'emergency-data' | 'activity-log' | string;
  lastModified?: string;
  timestamp?: string;
  notes?: string;
  baselineData?: {
    pain?: number;
    [k: string]: unknown;
  };
  qualityOfLife?: {
    moodImpact?: unknown;
    [k: string]: unknown;
  };
  [k: string]: unknown; // Allow additional dynamic fields
}

export class ConflictResolutionService {
  private static instance: ConflictResolutionService;
  private conflicts: Map<string, DataConflict> = new Map();
  private strategies: Map<string, ConflictResolutionStrategy> = new Map();
  private mergeRules: Map<string, MergeRule[]> = new Map();

  private constructor() {
    this.initializeStrategies();
    this.initializeMergeRules();
  }

  static getInstance(): ConflictResolutionService {
    if (!ConflictResolutionService.instance) {
      ConflictResolutionService.instance = new ConflictResolutionService();
    }
    return ConflictResolutionService.instance;
  }

  private initializeStrategies(): void {
    // Trauma-informed automatic resolution
    this.strategies.set('trauma-informed-auto', {
      name: 'Trauma-Informed Auto Resolution',
      description:
        'Automatically resolves conflicts while preserving user emotional data and agency',
      automatic: true,
      traumaInformed: true,
      preservesUserAgency: true,
      apply: this.applyTraumaInformedAutoResolution.bind(this),
    });

    // Conservative merge - preserves all user data
    this.strategies.set('conservative-merge', {
      name: 'Conservative Merge',
      description: 'Merges data while preserving all user changes, may result in duplicate entries',
      automatic: true,
      traumaInformed: true,
      preservesUserAgency: true,
      apply: this.applyConservativeMerge.bind(this),
    });

    // Smart merge using field-level rules
    this.strategies.set('smart-merge', {
      name: 'Smart Field-Level Merge',
      description: 'Applies intelligent merge rules based on data type and context',
      automatic: true,
      traumaInformed: true,
      preservesUserAgency: false,
      apply: this.applySmartMerge.bind(this),
    });

    // User-guided resolution
    this.strategies.set('user-guided', {
      name: 'User-Guided Resolution',
      description: 'Presents conflict to user with gentle, clear options',
      automatic: false,
      traumaInformed: true,
      preservesUserAgency: true,
      apply: this.prepareUserGuidedResolution.bind(this),
    });

    // Timestamp-based resolution
    this.strategies.set('timestamp-based', {
      name: 'Most Recent Changes Win',
      description: 'Automatically chooses the most recently modified version',
      automatic: true,
      traumaInformed: false,
      preservesUserAgency: false,
      apply: this.applyTimestampBasedResolution.bind(this),
    });
  }

  private initializeMergeRules(): void {
    // Pain entry merge rules
    this.mergeRules.set('pain-entry', [
      {
        field: 'baselineData.pain',
        strategy: 'prefer-local', // User's pain assessment is most important
        priority: 1,
        traumaInformed: true,
      },
      {
        field: 'baselineData.locations',
        strategy: 'merge-arrays', // Combine pain locations
        priority: 2,
        traumaInformed: true,
      },
      {
        field: 'baselineData.symptoms',
        strategy: 'merge-arrays', // Combine symptoms
        priority: 2,
        traumaInformed: true,
      },
      {
        field: 'notes',
        strategy: 'user-decides', // Never lose user notes
        priority: 1,
        traumaInformed: true,
      },
      {
        field: 'medications.current',
        strategy: 'prefer-local', // User knows current medications best
        priority: 1,
        traumaInformed: true,
      },
      {
        field: 'qualityOfLife.moodImpact',
        strategy: 'prefer-local', // User's mood assessment is personal
        priority: 1,
        traumaInformed: true,
      },
      {
        field: 'timestamp',
        strategy: 'prefer-local', // Keep user's timing
        priority: 1,
        traumaInformed: true,
      },
    ]);

    // Settings merge rules
    this.mergeRules.set('settings', [
      {
        field: 'accessibility.*',
        strategy: 'prefer-local', // User accessibility needs are critical
        priority: 1,
        traumaInformed: true,
      },
      {
        field: 'privacy.*',
        strategy: 'prefer-local', // User privacy choices are paramount
        priority: 1,
        traumaInformed: true,
      },
      {
        field: 'notifications.*',
        strategy: 'prefer-local', // User notification preferences
        priority: 2,
        traumaInformed: true,
      },
      {
        field: 'theme',
        strategy: 'prefer-local', // User interface preferences
        priority: 3,
        traumaInformed: false,
      },
    ]);

    // Emergency data merge rules
    this.mergeRules.set('emergency-data', [
      {
        field: '*',
        strategy: 'user-decides', // Emergency data is too critical for automatic merge
        priority: 1,
        traumaInformed: true,
      },
    ]);
  }

  async detectConflicts(
    localData: DataEntity[],
    remoteData: DataEntity[]
  ): Promise<DataConflict[]> {
    const conflicts: DataConflict[] = [];
    const remoteMap = new Map(remoteData.map(item => [item.id, item]));

    for (const localItem of localData) {
      const remoteItem = remoteMap.get(localItem.id);

      if (remoteItem) {
        const conflict = await this.compareVersions(localItem, remoteItem);
        if (conflict) {
          conflicts.push(conflict);
          this.conflicts.set(conflict.id, conflict);
        }
      }
    }

    // Check for items that exist remotely but not locally (potential deletions)
    for (const remoteItem of remoteData) {
      const localExists = localData.some(item => item.id === remoteItem.id);
      if (!localExists) {
        const conflict = await this.handleMissingLocal(remoteItem);
        if (conflict) {
          conflicts.push(conflict);
          this.conflicts.set(conflict.id, conflict);
        }
      }
    }

    return conflicts;
  }

  private async compareVersions(
    localItem: DataEntity,
    remoteItem: DataEntity
  ): Promise<DataConflict | null> {
    // Generate checksums for comparison
    const localChecksum = await this.generateChecksum(localItem);
    const remoteChecksum = await this.generateChecksum(remoteItem);

    if (localChecksum === remoteChecksum) {
      return null; // No conflict
    }

    // Determine conflict type
    let conflictType: DataConflict['conflictType'] = 'modification';

    if (localItem.lastModified && remoteItem.lastModified) {
      const localTime = new Date(localItem.lastModified);
      const remoteTime = new Date(remoteItem.lastModified);

      if (Math.abs(localTime.getTime() - remoteTime.getTime()) < 1000) {
        conflictType = 'version'; // Simultaneous edits
      }
    }

    // Determine priority based on data type and content
    const priority = this.determinePriority(localItem, remoteItem);
    const autoResolvable = this.isAutoResolvable(localItem, remoteItem);

    const entityType: DataConflict['entityType'] = (
      ['pain-entry', 'settings', 'emergency-data', 'activity-log'] as const
    ).includes(localItem.type as DataConflict['entityType'])
      ? (localItem.type as DataConflict['entityType'])
      : 'pain-entry';
    return {
      id: `${localItem.type || 'unknown'}-${localItem.id}-${Date.now()}`,
      entityType,
      entityId: localItem.id,
      conflictType,
      localVersion: localItem,
      remoteVersion: remoteItem,
      localTimestamp: localItem.lastModified || localItem.timestamp || new Date().toISOString(),
      remoteTimestamp: remoteItem.lastModified || remoteItem.timestamp || new Date().toISOString(),
      localChecksum,
      remoteChecksum,
      metadata: {
        userDeviceId: this.getDeviceId(),
        conflictDetectedAt: new Date().toISOString(),
        priority,
        autoResolvable,
      },
    };
  }

  private async handleMissingLocal(remoteItem: DataEntity): Promise<DataConflict | null> {
    // Check if this was intentionally deleted locally
    const deletionRecord = await this.checkDeletionRecord(remoteItem.id);

    if (deletionRecord) {
      const entityType: DataConflict['entityType'] = (
        ['pain-entry', 'settings', 'emergency-data', 'activity-log'] as const
      ).includes(remoteItem.type as DataConflict['entityType'])
        ? (remoteItem.type as DataConflict['entityType'])
        : 'pain-entry';
      return {
        id: `deletion-${remoteItem.id}-${Date.now()}`,
        entityType,
        entityId: remoteItem.id,
        conflictType: 'deletion',
        localVersion: null,
        remoteVersion: remoteItem,
        localTimestamp: deletionRecord.timestamp,
        remoteTimestamp:
          remoteItem.lastModified || remoteItem.timestamp || new Date().toISOString(),
        metadata: {
          userDeviceId: this.getDeviceId(),
          conflictDetectedAt: new Date().toISOString(),
          priority: 'medium',
          autoResolvable: false,
        },
      };
    }

    return null; // Probably just a new remote item
  }

  async resolveConflict(conflictId: string, strategy?: string): Promise<ConflictResolution> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    // Choose strategy
    const strategyName = strategy || this.selectBestStrategy(conflict);
    const resolutionStrategy = this.strategies.get(strategyName);

    if (!resolutionStrategy) {
      throw new Error(`Unknown strategy: ${strategyName}`);
    }

    try {
      const resolution = await resolutionStrategy.apply(conflict);

      // Store resolution for audit trail
      await this.storeResolution(conflictId, resolution);

      // Remove resolved conflict
      if (resolution.resolved) {
        this.conflicts.delete(conflictId);
      }

      return resolution;
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      throw new Error(`Failed to resolve conflict: ${error}`);
    }
  }

  private selectBestStrategy(conflict: DataConflict): string {
    // For trauma-informed care, prefer strategies that preserve user agency
    if (conflict.metadata.priority === 'high') {
      return 'user-guided'; // High priority conflicts need user input
    }

    if (conflict.metadata.autoResolvable) {
      return 'trauma-informed-auto'; // Safe automatic resolution
    }

    if (conflict.entityType === 'emergency-data') {
      return 'user-guided'; // Emergency data always needs user review
    }

    if (conflict.entityType === 'pain-entry') {
      return 'smart-merge'; // Pain entries can use intelligent merging
    }

    return 'conservative-merge'; // Default to conservative approach
  }

  private async applyTraumaInformedAutoResolution(
    conflict: DataConflict
  ): Promise<ConflictResolution> {
    const rules = this.mergeRules.get(conflict.entityType) || [];
    const traumaInformedRules = rules.filter(rule => rule.traumaInformed);

    if (traumaInformedRules.length === 0) {
      // No trauma-informed rules, defer to user
      return {
        strategy: 'trauma-informed-auto',
        resolved: false,
        requiresUserReview: true,
        confidence: 0,
        explanation:
          'This conflict requires your review to ensure your personal data is handled correctly.',
        preservedUserChanges: true,
      };
    }

    const mergedData = await this.applyMergeRules(
      (conflict.localVersion || {}) as Record<string, unknown>,
      (conflict.remoteVersion || {}) as Record<string, unknown>,
      traumaInformedRules
    );

    return {
      strategy: 'trauma-informed-auto',
      resolved: true,
      mergedData,
      confidence: 85,
      requiresUserReview: false,
      explanation:
        'Automatically resolved while preserving all your personal data and preferences.',
      preservedUserChanges: true,
    };
  }

  private async applyConservativeMerge(conflict: DataConflict): Promise<ConflictResolution> {
    // Always preserve user data, merge arrays, keep both versions of conflicting fields
    const merged: Record<string, unknown> = { ...(conflict.remoteVersion || {}) };

    // Overlay local changes
    for (const [key, value] of Object.entries(conflict.localVersion || {})) {
      if (Array.isArray(value) && Array.isArray(merged[key])) {
        // Merge arrays and remove duplicates
        merged[key] = [...new Set([...merged[key], ...value])];
      } else if (key === 'notes' && merged[key] && value) {
        // Combine notes
        merged[key] = `${merged[key]}\n\n[Local changes]: ${value}`;
      } else {
        // Prefer local changes
        merged[key] = value;
      }
    }

    return {
      strategy: 'conservative-merge',
      resolved: true,
      mergedData: merged,
      confidence: 75,
      requiresUserReview: false,
      explanation: 'Combined both versions while preserving all your local changes.',
      preservedUserChanges: true,
    };
  }

  private async applySmartMerge(conflict: DataConflict): Promise<ConflictResolution> {
    const rules = this.mergeRules.get(conflict.entityType) || [];
    const mergedData = await this.applyMergeRules(
      (conflict.localVersion || {}) as Record<string, unknown>,
      (conflict.remoteVersion || {}) as Record<string, unknown>,
      rules
    );

    const preservedUserChanges = conflict.localVersion
      ? this.checkUserChangesPreserved(conflict.localVersion, mergedData)
      : true;

    return {
      strategy: 'smart-merge',
      resolved: true,
      mergedData,
      confidence: 90,
      requiresUserReview: !preservedUserChanges,
      explanation: preservedUserChanges
        ? 'Intelligently merged data while preserving your changes.'
        : 'Merged data - please review to ensure your important changes are preserved.',
      preservedUserChanges,
    };
  }

  private async prepareUserGuidedResolution(conflict: DataConflict): Promise<ConflictResolution> {
    // Prepare user-friendly conflict presentation
    const explanation = this.generateUserFriendlyExplanation(conflict);

    return {
      strategy: 'user-guided',
      resolved: false,
      requiresUserReview: true,
      confidence: 100, // User will decide
      explanation,
      preservedUserChanges: true, // User will control this
    };
  }

  private async applyTimestampBasedResolution(conflict: DataConflict): Promise<ConflictResolution> {
    const localTime = new Date(conflict.localTimestamp);
    const remoteTime = new Date(conflict.remoteTimestamp);

    const useLocal = localTime > remoteTime;
    const winner = useLocal ? conflict.localVersion : conflict.remoteVersion;

    return {
      strategy: 'timestamp-based',
      resolved: true,
      mergedData: winner,
      confidence: 70,
      requiresUserReview: false,
      explanation: `Used ${useLocal ? 'your local' : 'remote'} version as it was modified more recently.`,
      preservedUserChanges: useLocal,
    };
  }

  private async applyMergeRules<T extends Record<string, unknown>>(
    local: T,
    remote: T,
    rules: MergeRule[]
  ): Promise<T> {
    const merged: T = { ...(remote as Record<string, unknown>) } as T; // Start with remote as base

    // Sort rules by priority
    const sortedRules = rules.sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      const localValue = this.getValueByPath(local, rule.field);
      const remoteValue = this.getValueByPath(remote, rule.field);

      if (localValue === undefined && remoteValue === undefined) {
        continue;
      }

      const mergedValue = await this.applyMergeStrategy(localValue, remoteValue, rule.strategy);

      this.setValueByPath(merged, rule.field, mergedValue);
    }

    return merged;
  }

  private async applyMergeStrategy(
    local: unknown,
    remote: unknown,
    strategy: MergeRule['strategy']
  ): Promise<unknown> {
    switch (strategy) {
      case 'prefer-local':
        return local !== undefined ? local : remote;

      case 'prefer-remote':
        return remote !== undefined ? remote : local;

      case 'last-writer-wins':
        // Would need timestamp comparison logic
        return local; // Simplified

      case 'merge-arrays':
        if (Array.isArray(local) && Array.isArray(remote)) {
          return [...new Set([...remote, ...local])];
        }
        return local !== undefined ? local : remote;

      case 'sum-numbers':
        if (typeof local === 'number' && typeof remote === 'number') {
          return local + remote;
        }
        return local !== undefined ? local : remote;

      case 'max-value':
        if (typeof local === 'number' && typeof remote === 'number') {
          return Math.max(local, remote);
        }
        return local !== undefined ? local : remote;

      case 'min-value':
        if (typeof local === 'number' && typeof remote === 'number') {
          return Math.min(local, remote);
        }
        return local !== undefined ? local : remote;

      case 'user-decides':
        // Mark for user review
        return { _conflict: true, local, remote } as Record<string, unknown>;

      default:
        return local !== undefined ? local : remote;
    }
  }

  private getValueByPath(obj: unknown, path: string): unknown {
    if (path === '*') return obj;
    const segments = path.split('.');
    let current: unknown = obj;
    for (const key of segments) {
      if (key.endsWith('*')) {
        const prefix = key.slice(0, -1);
        if (current && typeof current === 'object') {
          const out: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(current as Record<string, unknown>)) {
            if (k.startsWith(prefix)) out[k] = v;
          }
          current = out;
        } else {
          current = undefined;
        }
      } else if (
        current &&
        typeof current === 'object' &&
        key in (current as Record<string, unknown>)
      ) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }
    return current;
  }

  private setValueByPath(obj: Record<string, unknown>, path: string, value: unknown): void {
    if (path === '*') {
      Object.assign(obj, value);
      return;
    }

    const keys = path.split('.');
    const lastKey = keys.pop()!;

    const target = keys.reduce<Record<string, unknown>>((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {} as Record<string, unknown>;
      }
      return current[key] as Record<string, unknown>;
    }, obj);
    target[lastKey] = value as unknown;
  }

  private determinePriority(local: DataEntity, remote: DataEntity): 'high' | 'medium' | 'low' {
    // Emergency data is always high priority
    if (local.type === 'emergency-data' || remote.type === 'emergency-data') {
      return 'high';
    }

    // Pain entries with notes are high priority (user's personal thoughts)
    if ((local.notes && local.notes.trim()) || (remote.notes && remote.notes.trim())) {
      return 'high';
    }

    // Settings changes are medium priority
    if (local.type === 'settings' || remote.type === 'settings') {
      return 'medium';
    }

    return 'low';
  }

  private isAutoResolvable(local: DataEntity, remote: DataEntity): boolean {
    // Don't auto-resolve emergency data
    if (local.type === 'emergency-data' || remote.type === 'emergency-data') {
      return false;
    }

    // Don't auto-resolve if there are user notes that differ significantly
    if (local.notes && remote.notes && local.notes !== remote.notes) {
      return false;
    }

    // Don't auto-resolve pain level conflicts (too personal)
    if (local.baselineData?.pain !== remote.baselineData?.pain) {
      return false;
    }

    return true;
  }

  private checkUserChangesPreserved(
    original: DataEntity,
    merged: Record<string, unknown> | DataEntity | null
  ): boolean {
    // Check if critical user fields are preserved
    const criticalFields = ['notes', 'baselineData.pain', 'qualityOfLife.moodImpact'];

    for (const field of criticalFields) {
      const originalValue = this.getValueByPath(original, field);
      const mergedValue = this.getValueByPath(merged, field);

      if (originalValue !== undefined && originalValue !== mergedValue) {
        return false;
      }
    }

    return true;
  }

  private generateUserFriendlyExplanation(conflict: DataConflict): string {
    const entityName = this.getEntityDisplayName(conflict.entityType);
    const timeAgo = this.getTimeAgo(conflict.remoteTimestamp);

    return (
      `We found differences in your ${entityName} data. The version on our servers was updated ${timeAgo}, ` +
      `but you've also made changes locally. We want to make sure your personal data is handled exactly how you prefer.`
    );
  }

  private getEntityDisplayName(type: string): string {
    switch (type) {
      case 'pain-entry':
        return 'pain entry';
      case 'emergency-data':
        return 'emergency contact information';
      case 'settings':
        return 'app settings';
      case 'activity-log':
        return 'activity log';
      default:
        return 'data';
    }
  }

  private getTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
  }

  private async generateChecksum(data: DataEntity): Promise<string> {
    const normalized = JSON.stringify(data, Object.keys(data).sort());
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private getDeviceId(): string {
    let deviceId = secureStorage.get<string>('device-id');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      secureStorage.set('device-id', deviceId, { encrypt: true });
    }
    return deviceId;
  }

  private async checkDeletionRecord(
    itemId: string | number
  ): Promise<{ timestamp: string } | null> {
    try {
      // Deletion records are stored under a dedicated key in settings
      const deletionRecords = await offlineStorage.getItem<DeletionRecord[]>('conflict:deletions');
      if (Array.isArray(deletionRecords)) {
        const match = deletionRecords.find(r => r.itemId === itemId);
        return match ? { timestamp: match.timestamp } : null;
      }
      return null;
    } catch {
      return null;
    }
  }

  private async storeResolution(conflictId: string, resolution: ConflictResolution): Promise<void> {
    try {
      const key = 'conflict:resolutions';
      const existing = (await offlineStorage.getItem<StoredConflictResolutionRecord[]>(key)) || [];
      existing.push({ conflictId, resolution, timestamp: new Date().toISOString() });
      await offlineStorage.setItem(key, existing);
    } catch (error) {
      console.error('Failed to store conflict resolution:', error);
    }
  }

  // Public API methods
  async getAllConflicts(): Promise<DataConflict[]> {
    return Array.from(this.conflicts.values());
  }

  async getConflictsByPriority(priority: 'high' | 'medium' | 'low'): Promise<DataConflict[]> {
    return Array.from(this.conflicts.values()).filter(
      conflict => conflict.metadata.priority === priority
    );
  }

  async resolveAllAutoResolvable(): Promise<ConflictResolution[]> {
    const autoResolvable = Array.from(this.conflicts.values()).filter(
      conflict => conflict.metadata.autoResolvable
    );

    const resolutions: ConflictResolution[] = [];

    for (const conflict of autoResolvable) {
      try {
        const resolution = await this.resolveConflict(conflict.id);
        resolutions.push(resolution);
      } catch (error) {
        console.error(`Failed to auto-resolve conflict ${conflict.id}:`, error);
      }
    }

    return resolutions;
  }

  async postponeConflict(conflictId: string, postponeUntil: Date): Promise<void> {
    const conflict = this.conflicts.get(conflictId);
    if (conflict) {
      // Store postponement info under key-value settings
      try {
        const key = 'conflict:postponed';
        const existing = (await offlineStorage.getItem<PostponedConflictRecord[]>(key)) || [];
        existing.push({ conflictId, postponeUntil: postponeUntil.toISOString(), conflict });
        await offlineStorage.setItem(key, existing);
      } catch (error) {
        console.error('Failed to store postponed conflict:', error);
      }

      // Remove from active conflicts
      this.conflicts.delete(conflictId);
    }
  }

  async getAvailableStrategies(conflict: DataConflict): Promise<ConflictResolutionStrategy[]> {
    return Array.from(this.strategies.values()).filter(strategy => {
      // Filter strategies based on conflict context
      if (conflict.entityType === 'emergency-data' && strategy.automatic) {
        return false; // Emergency data should not be auto-resolved
      }
      return true;
    });
  }
}

// Export singleton instance
export const conflictResolver = ConflictResolutionService.getInstance();

// Helper functions for UI components
export function isConflictCritical(conflict: DataConflict): boolean {
  return (
    conflict.metadata.priority === 'high' ||
    conflict.entityType === 'emergency-data' ||
    !conflict.metadata.autoResolvable
  );
}

export function getConflictDisplayData(conflict: DataConflict) {
  return {
    title: `${conflictResolver['getEntityDisplayName'](conflict.entityType)} conflict`,
    description: conflictResolver['generateUserFriendlyExplanation'](conflict),
    priority: conflict.metadata.priority,
    canAutoResolve: conflict.metadata.autoResolvable,
    isTraumaInformed: true, // All our conflicts are handled with trauma-informed care
  };
}
