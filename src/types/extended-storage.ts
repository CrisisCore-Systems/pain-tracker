/**
 * Extended types for offline storage
 * Extends the base offline storage types to support new data categories
 */

// Import base types
import type { PainEntry } from '../types';

// Base types from offline-storage.ts
export type PainEntryData = {
  pain_level: number;
  location: string;
  description?: string;
  triggers?: string[];
  medications?: string[];
  activities?: string[];
  mood?: string;
  weather?: string;
  notes?: string;
};

export type EmergencyData = {
  contactName: string;
  phoneNumber: string;
  relationship: string;
  medicalInfo?: string;
  allergies?: string[];
  medications?: string[];
};

export type ActivityLogData = {
  activity: string;
  duration?: number;
  intensity?: number;
  painBefore?: number;
  painAfter?: number;
  notes?: string;
};

export type SettingsData = {
  key: string;
  value: unknown;
} | {
  [key: string]: unknown;
};

export type SyncQueueData = {
  operation: string;
  payload: unknown;
  priority: 'high' | 'medium' | 'low';
};

// Extended types for new functionality
export interface TherapeuticResourceData {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  duration?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  effectiveness: number;
  traumaInformed: boolean;
  accessibilityFeatures: string[];
  lastAccessed?: string;
  timesUsed: number;
}

export interface CopingSessionData {
  id: string;
  resourceId: string;
  startTime: string;
  endTime?: string;
  completed: boolean;
  effectiveness?: number;
  painBefore?: number;
  painAfter?: number;
  notes?: string;
  techniques: string[];
  interruptions?: string[];
  mood: {
    before?: string;
    after?: string;
  };
}

export interface ResourceAnalyticsData {
  resourceId: string;
  totalUses: number;
  effectivenessRatings: number[];
  averageEffectiveness: number;
  painReductions: number[];
  averagePainReduction: number;
  completionRate: number;
  averageDuration: number;
  lastUpdated: string;
  trending: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
}

export interface ConflictData {
  id: string;
  taskId: string;
  tableName: string;
  conflict: {
    local: Record<string, unknown>;
    server: Record<string, unknown>;
    type: string;
    field?: string;
  };
  createdAt: string;
  status: 'pending' | 'resolved' | 'ignored';
  resolution?: {
    strategy: string;
    resolvedData: Record<string, unknown>;
    userChoice?: boolean;
  };
}

export interface HealthInsightData {
  id: string;
  type: 'pattern' | 'trend' | 'correlation' | 'anomaly' | 'prediction' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: Record<string, unknown>;
  generatedAt: string;
  validUntil?: string;
  traumaInformed: boolean;
  actionable: boolean;
  metadata: Record<string, unknown>;
}

// Union type for all extended data types
export type ExtendedStoredDataPayload = 
  | PainEntryData 
  | EmergencyData 
  | ActivityLogData 
  | SettingsData 
  | SyncQueueData
  | TherapeuticResourceData
  | CopingSessionData
  | ResourceAnalyticsData
  | ConflictData
  | HealthInsightData;

// Extended storage type enum
export type ExtendedStorageType = 
  | 'pain-entry' 
  | 'emergency-data' 
  | 'activity-log' 
  | 'settings' 
  | 'sync-queue'
  | 'therapeutic-resource'
  | 'coping-session'
  | 'resource-analytics'
  | 'sync-conflicts'
  | 'health-insights';

// Context types for therapeutic resources
export interface UserContext {
  symptoms?: string[];
  painLevel?: number;
  mood?: string;
  timeOfDay?: string;
  recentActivities?: string[];
  preferences?: {
    resourceTypes?: string[];
    difficulty?: string;
    duration?: number;
    accessibility?: string[];
  };
  history?: {
    effectiveResources?: string[];
    preferredTechniques?: string[];
    lastSession?: string;
  };
}

export interface SessionOutcomes {
  effectiveness: number; // 1-10
  painReduction: number; // percentage
  mood: string;
  completed: boolean;
  notes?: string;
  wouldRecommend: boolean;
  interruptions?: string[];
}

export interface ResourceRecommendation {
  resource: TherapeuticResourceData;
  relevanceScore: number;
  reason: string;
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high';
  adaptations?: string[];
  timing: 'immediate' | 'today' | 'this_week' | 'when_ready';
}

// Server sync types
export interface ServerChangeData {
  id: string;
  type: 'create' | 'update' | 'delete';
  tableName: string;
  data?: Record<string, unknown>;
  timestamp: string;
  version: number;
}

export interface SyncConflictData {
  local: Record<string, unknown>;
  server: Record<string, unknown>;
  type: string;
  field?: string;
}

export interface ServerResponse {
  success: boolean;
  timestamp: string;
  conflicts?: SyncConflictData[];
  serverChanges?: ServerChangeData[];
  mergedData?: Record<string, unknown>[];
  data?: ServerChangeData[];
}

export interface SyncStatus {
  isOnline: boolean;
  currentStrategy: string;
  queueSize: number;
  activeSyncs: number;
  networkCondition: {
    type: 'offline' | 'slow-2g' | '2g' | '3g' | '4g' | 'wifi' | 'unknown';
    downlink?: number;
    rtt?: number;
    effectiveType?: string;
    saveData?: boolean;
  };
  metrics: {
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    conflictsResolved: number;
    bytesTransferred: number;
    averageSyncTime: number;
    compressionSaved: number;
    lastSync: string | null;
    networkEfficiency: number;
  };
  pendingChanges: Array<{
    table: string;
    count: number;
  }>;
}
