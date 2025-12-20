/**
 * Advanced Offline Capabilities
 * Enhanced PWA features with sophisticated conflict resolution and background processing
 */

import { offlineStorage, enhancedStorage } from './offline-storage';

// Base data structure for all syncable entities
interface SyncableData {
  id: string;
  lastModified?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// Pain tracking specific types
interface PainEntry extends SyncableData {
  timestamp: string;
  data: {
    pain_level?: number;
    painLevel?: number;
    medications?: string[];
    triggers?: string[];
    mood?: string;
    notes?: string;
    readings?: Array<{ timestamp: string; value: number }>;
    symptoms?: string[];
  };
}

// Enhanced Data Structures
interface ConflictResolutionStrategy {
  type: 'client-wins' | 'server-wins' | 'merge' | 'manual' | 'latest-timestamp';
  customResolver?: (local: SyncableData, remote: SyncableData) => SyncableData;
}

interface OfflineResource {
  id: string;
  title: string;
  content: string;
  type: 'coping-strategy' | 'exercise' | 'meditation' | 'emergency-contact' | 'medication-guide';
  tags: string[];
  lastUpdated: string;
  size: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  mediaUrls?: string[];
}

interface HealthInsightData {
  weeklyPatterns?: Array<{
    day: string;
    averagePain: number;
    entryCount: number;
  }>;
  timePatterns?: Array<{
    hour: number;
    averagePain: number;
    entryCount: number;
  }>;
  trend?: string;
  medications?: Array<{
    medication: string;
    averagePainLevel: number;
    usageCount: number;
    effectiveness: string;
  }>;
  triggers?: Array<{
    trigger: string;
    averagePainLevel: number;
    occurrences: number;
    severity: string;
  }>;
  correlations?: Array<{
    mood: string;
    averagePainLevel: number;
    occurrences: number;
  }>;
  analysisDate: string;
  sampleSize: number;
}

interface HealthInsight {
  id: string;
  type: 'pain-pattern' | 'medication-effectiveness' | 'trigger-analysis' | 'mood-correlation';
  data: HealthInsightData;
  confidence: number;
  generatedAt: string;
  source: 'local-analysis' | 'ai-model' | 'statistical-analysis';
  recommendations?: string[];
}

interface SyncConflict {
  id: string;
  entityType: string;
  entityId: string;
  localVersion: SyncableData;
  remoteVersion: SyncableData;
  conflictFields: string[];
  detectedAt: string;
  resolution?: 'pending' | 'resolved' | 'ignored';
  strategy?: ConflictResolutionStrategy;
}

// Advanced Conflict Resolution Service
export class ConflictResolutionService {
  private conflicts: Map<string, SyncConflict> = new Map();
  private resolutionStrategies: Map<string, ConflictResolutionStrategy> = new Map();

  constructor() {
    this.setupDefaultStrategies();
  }

  private setupDefaultStrategies(): void {
    // Pain entries: prefer latest timestamp with merge for non-conflicting fields
    this.resolutionStrategies.set('pain-entry', {
      type: 'merge',
      customResolver: this.mergePainEntry.bind(this),
    });

    // Emergency contacts: prefer client version (user knows best)
    this.resolutionStrategies.set('emergency-contact', {
      type: 'client-wins',
    });

    // Settings: merge non-conflicting, prefer client for preferences
    this.resolutionStrategies.set('settings', {
      type: 'merge',
      customResolver: this.mergeSettings.bind(this),
    });

    // Activity logs: prefer latest timestamp
    this.resolutionStrategies.set('activity-log', {
      type: 'latest-timestamp',
    });
  }

  async detectConflicts(
    localData: SyncableData,
    remoteData: SyncableData,
    entityType: string
  ): Promise<SyncConflict[]> {
    const conflicts: SyncConflict[] = [];

    // Compare timestamps first
    const localTimestamp = new Date(localData.lastModified || localData.updatedAt || 0);
    const remoteTimestamp = new Date(remoteData.lastModified || remoteData.updatedAt || 0);

    // If timestamps are significantly different, check for field conflicts
    if (Math.abs(localTimestamp.getTime() - remoteTimestamp.getTime()) > 60000) {
      // 1 minute threshold
      const conflictFields = this.findConflictingFields(localData, remoteData);

      if (conflictFields.length > 0) {
        const conflict: SyncConflict = {
          id: `${entityType}-${localData.id}-${Date.now()}`,
          entityType,
          entityId: localData.id,
          localVersion: localData,
          remoteVersion: remoteData,
          conflictFields,
          detectedAt: new Date().toISOString(),
          resolution: 'pending',
        };

        conflicts.push(conflict);
        this.conflicts.set(conflict.id, conflict);
      }
    }

    return conflicts;
  }

  private findConflictingFields(local: SyncableData, remote: SyncableData): string[] {
    const conflicts: string[] = [];
    const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);

    for (const key of allKeys) {
      if (key === 'id' || key === 'lastModified' || key === 'updatedAt') continue;

      const localValue = local[key];
      const remoteValue = remote[key];

      if (this.valuesConflict(localValue, remoteValue)) {
        conflicts.push(key);
      }
    }

    return conflicts;
  }

  private valuesConflict(local: unknown, remote: unknown): boolean {
    if (local === remote) return false;

    // Handle arrays
    if (Array.isArray(local) && Array.isArray(remote)) {
      return JSON.stringify(local.sort()) !== JSON.stringify(remote.sort());
    }

    // Handle objects
    if (
      typeof local === 'object' &&
      typeof remote === 'object' &&
      local !== null &&
      remote !== null
    ) {
      return JSON.stringify(local) !== JSON.stringify(remote);
    }

    return true;
  }

  async resolveConflict(
    conflictId: string,
    strategy?: ConflictResolutionStrategy
  ): Promise<SyncableData | { conflict: SyncConflict; requiresManualResolution: boolean }> {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) throw new Error('Conflict not found');

    const resolutionStrategy = strategy ||
      this.resolutionStrategies.get(conflict.entityType) || { type: 'server-wins' };

    let resolvedData: SyncableData;

    switch (resolutionStrategy.type) {
      case 'client-wins':
        resolvedData = conflict.localVersion;
        break;
      case 'server-wins':
        resolvedData = conflict.remoteVersion;
        break;
      case 'latest-timestamp':
        resolvedData = this.resolveByTimestamp(conflict.localVersion, conflict.remoteVersion);
        break;
      case 'merge':
        resolvedData = resolutionStrategy.customResolver
          ? resolutionStrategy.customResolver(conflict.localVersion, conflict.remoteVersion)
          : this.defaultMerge(conflict.localVersion, conflict.remoteVersion);
        break;
      case 'manual':
        // Return conflict for manual resolution
        return { conflict, requiresManualResolution: true };
      default:
        resolvedData = conflict.remoteVersion;
    }

    // Mark conflict as resolved
    conflict.resolution = 'resolved';
    conflict.strategy = resolutionStrategy;

    return resolvedData;
  }

  private resolveByTimestamp(local: SyncableData, remote: SyncableData): SyncableData {
    const localTime = new Date(local.lastModified || local.updatedAt || 0).getTime();
    const remoteTime = new Date(remote.lastModified || remote.updatedAt || 0).getTime();
    return localTime > remoteTime ? local : remote;
  }

  private defaultMerge(local: SyncableData, remote: SyncableData): SyncableData {
    // Prefer remote for base, overlay with local changes
    const merged = { ...remote };

    // Preserve local modifications for specific fields
    const localPreferredFields = ['notes', 'personalNotes', 'customTags'];
    for (const field of localPreferredFields) {
      if (local[field] !== undefined) {
        merged[field] = local[field];
      }
    }

    return merged;
  }

  private mergePainEntry(local: SyncableData, remote: SyncableData): SyncableData {
    const localPain = local as PainEntry;
    const remotePain = remote as PainEntry;
    const merged = { ...remotePain };

    // Merge pain readings (take latest)
    if (localPain.data.readings && remotePain.data.readings) {
      const allReadings = [...localPain.data.readings, ...remotePain.data.readings];
      merged.data.readings = allReadings
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10); // Keep last 10 readings
    }

    // Merge symptoms (union of both)
    if (localPain.data.symptoms || remotePain.data.symptoms) {
      merged.data.symptoms = [
        ...new Set([...(localPain.data.symptoms || []), ...(remotePain.data.symptoms || [])]),
      ];
    }

    // Prefer local notes
    if (localPain.data.notes) merged.data.notes = localPain.data.notes;

    return merged;
  }

  private mergeSettings(local: SyncableData, remote: SyncableData): SyncableData {
    const merged = { ...remote };

    // Prefer local user preferences
    const localPreferences = ['theme', 'notifications', 'privacy', 'accessibility'];
    for (const pref of localPreferences) {
      if (local[pref] !== undefined) {
        merged[pref] = local[pref];
      }
    }

    return merged;
  }

  getUnresolvedConflicts(): SyncConflict[] {
    return Array.from(this.conflicts.values()).filter(c => c.resolution === 'pending');
  }
}

// Offline Resource Manager for Coping Mechanisms
export class OfflineResourceManager {
  private resources: Map<string, OfflineResource> = new Map();
  private downloadQueue: Set<string> = new Set();
  private storageQuota: number = 50 * 1024 * 1024; // 50MB

  constructor() {
    this.loadCachedResources();
  }

  private async loadCachedResources(): Promise<void> {
    try {
      const cachedResources = await enhancedStorage.getItem('offline-resources');
      if (cachedResources && Array.isArray(cachedResources)) {
        for (const resource of cachedResources) {
          this.resources.set(resource.id, resource);
        }
      }
    } catch (error) {
      console.error('Failed to load cached resources:', error);
    }
  }

  async downloadResource(resourceId: string, url: string): Promise<boolean> {
    if (this.resources.has(resourceId)) {
      return true; // Already downloaded
    }

    if (this.downloadQueue.has(resourceId)) {
      return false; // Already downloading
    }

    this.downloadQueue.add(resourceId);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      const content = await response.text();
      const size = new Blob([content]).size;

      // Check storage quota
      if (await this.wouldExceedQuota(size)) {
        await this.freeUpSpace(size);
      }

      const resource: OfflineResource = {
        id: resourceId,
        title: this.extractTitle(content),
        content,
        type: this.inferType(url, content),
        tags: this.extractTags(content),
        lastUpdated: new Date().toISOString(),
        size,
        priority: this.determinePriority(resourceId, content),
      };

      // Download media files if present
      const mediaUrls = this.extractMediaUrls(content);
      if (mediaUrls.length > 0) {
        resource.mediaUrls = await this.downloadMedia(mediaUrls);
      }

      this.resources.set(resourceId, resource);
      await this.persistResources();

      console.log(`Downloaded offline resource: ${resourceId} (${size} bytes)`);
      return true;
    } catch (error) {
      console.error(`Failed to download resource ${resourceId}:`, error);
      return false;
    } finally {
      this.downloadQueue.delete(resourceId);
    }
  }

  async downloadEssentialResources(): Promise<void> {
    const essentialResources = [
      'breathing-exercises',
      'emergency-contacts',
      'pain-management-basics',
      'medication-guide',
      'crisis-coping-strategies',
    ];

    const downloadPromises = essentialResources.map(async resourceId => {
      const url = `/resources/${resourceId}.json`;
      return this.downloadResource(resourceId, url);
    });

    await Promise.allSettled(downloadPromises);
  }

  getOfflineResource(resourceId: string): OfflineResource | null {
    return this.resources.get(resourceId) || null;
  }

  searchOfflineResources(query: string, type?: string): OfflineResource[] {
    const normalizedQuery = query.toLowerCase();
    return Array.from(this.resources.values()).filter(resource => {
      const matchesType = !type || resource.type === type;
      const matchesQuery =
        resource.title.toLowerCase().includes(normalizedQuery) ||
        resource.content.toLowerCase().includes(normalizedQuery) ||
        resource.tags.some(tag => tag.toLowerCase().includes(normalizedQuery));

      return matchesType && matchesQuery;
    });
  }

  getCopingStrategies(painLevel: number, location?: string): OfflineResource[] {
    const strategies = this.searchOfflineResources('', 'coping-strategy');

    // Filter and rank based on pain level and location
    return strategies
      .filter(strategy => {
        const content = strategy.content.toLowerCase();
        if (painLevel >= 7) {
          return content.includes('severe') || content.includes('high');
        } else if (painLevel >= 4) {
          return content.includes('moderate') || content.includes('medium');
        } else {
          return content.includes('mild') || content.includes('low');
        }
      })
      .sort((a, b) => {
        // Prioritize by relevance to location if provided
        if (location) {
          const aRelevant = a.content.toLowerCase().includes(location.toLowerCase());
          const bRelevant = b.content.toLowerCase().includes(location.toLowerCase());
          if (aRelevant && !bRelevant) return -1;
          if (!aRelevant && bRelevant) return 1;
        }

        // Then by priority
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }

  private async wouldExceedQuota(additionalSize: number): Promise<boolean> {
    const currentUsage = Array.from(this.resources.values()).reduce(
      (total, resource) => total + resource.size,
      0
    );

    return currentUsage + additionalSize > this.storageQuota;
  }

  private async freeUpSpace(neededSpace: number): Promise<void> {
    const resourcesByPriority = Array.from(this.resources.values()).sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    let freedSpace = 0;
    const toDelete: string[] = [];

    for (const resource of resourcesByPriority) {
      if (resource.priority === 'critical') continue;

      toDelete.push(resource.id);
      freedSpace += resource.size;

      if (freedSpace >= neededSpace) break;
    }

    for (const id of toDelete) {
      this.resources.delete(id);
    }

    await this.persistResources();
    console.log(`Freed ${freedSpace} bytes by removing ${toDelete.length} resources`);
  }

  private extractTitle(content: string): string {
    // Try to extract title from content
    const titleMatch =
      content.match(/<title>(.*?)<\/title>/i) ||
      content.match(/^#\s+(.+)$/m) ||
      content.match(/"title":\s*"([^"]+)"/);

    return titleMatch ? titleMatch[1] : 'Untitled Resource';
  }

  private inferType(url: string, content: string): OfflineResource['type'] {
    if (url.includes('coping') || content.includes('coping')) return 'coping-strategy';
    if (url.includes('exercise') || content.includes('exercise')) return 'exercise';
    if (url.includes('meditation') || content.includes('meditation')) return 'meditation';
    if (url.includes('emergency') || content.includes('emergency')) return 'emergency-contact';
    if (url.includes('medication') || content.includes('medication')) return 'medication-guide';

    return 'coping-strategy'; // default
  }

  private extractTags(content: string): string[] {
    const tags: string[] = [];

    // Extract from JSON metadata
    const tagsMatch = content.match(/"tags":\s*\[(.*?)\]/);
    if (tagsMatch) {
      const jsonTags = JSON.parse(`[${tagsMatch[1]}]`);
      tags.push(...jsonTags);
    }

    // Extract from markdown-style tags
    const hashTags = content.match(/#(\w+)/g);
    if (hashTags) {
      tags.push(...hashTags.map(tag => tag.substring(1)));
    }

    return [...new Set(tags)];
  }

  private determinePriority(resourceId: string, content: string): OfflineResource['priority'] {
    if (resourceId.includes('emergency') || content.includes('emergency')) return 'critical';
    if (resourceId.includes('essential') || content.includes('crisis')) return 'high';
    if (resourceId.includes('basic') || content.includes('fundamental')) return 'medium';
    return 'low';
  }

  private extractMediaUrls(content: string): string[] {
    const urls: string[] = [];

    // Extract image URLs
    const imgMatches = content.match(/src="([^"]+\.(jpg|jpeg|png|gif|webp))"/gi);
    if (imgMatches) {
      urls.push(
        ...(imgMatches.map(match => match.match(/src="([^"]+)"/)?.[1]).filter(Boolean) as string[])
      );
    }

    // Extract audio URLs
    const audioMatches = content.match(/src="([^"]+\.(mp3|wav|ogg))"/gi);
    if (audioMatches) {
      urls.push(
        ...(audioMatches
          .map(match => match.match(/src="([^"]+)"/)?.[1])
          .filter(Boolean) as string[])
      );
    }

    return urls;
  }

  private async downloadMedia(urls: string[]): Promise<string[]> {
    const downloadedUrls: string[] = [];

    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          downloadedUrls.push(objectUrl);
        }
      } catch (error) {
        console.warn(`Failed to download media: ${url}`, error);
      }
    }

    return downloadedUrls;
  }

  private async persistResources(): Promise<void> {
    try {
      const resourceArray = Array.from(this.resources.values());
      await enhancedStorage.setItem('offline-resources', resourceArray);
    } catch (error) {
      console.error('Failed to persist resources:', error);
    }
  }
}

// Background Health Insights Processor
export class HealthInsightsProcessor {
  private insights: Map<string, HealthInsight> = new Map();
  private processingQueue: Set<string> = new Set();

  constructor() {
    this.loadCachedInsights();
    this.startBackgroundProcessing();
  }

  private async loadCachedInsights(): Promise<void> {
    try {
      const cached = await enhancedStorage.getItem('health-insights');
      if (cached && Array.isArray(cached)) {
        for (const insight of cached) {
          this.insights.set(insight.id, insight);
        }
      }
    } catch (error) {
      console.error('Failed to load cached insights:', error);
    }
  }

  private startBackgroundProcessing(): void {
    // Process insights every hour
    setInterval(
      () => {
        this.processNewInsights();
      },
      60 * 60 * 1000
    );

    // Initial processing
    setTimeout(() => this.processNewInsights(), 5000);
  }

  async processNewInsights(): Promise<void> {
    if (this.processingQueue.size > 0) return; // Already processing

    try {
      // Get raw data and transform to proper types
      const rawPainEntries = await offlineStorage.getData('pain-entry');

      // Transform to proper types
      const painEntries: PainEntry[] = rawPainEntries
        .filter(entry => entry.type === 'pain-entry')
        .map(entry => ({
          id: entry.id?.toString() || '',
          timestamp: entry.timestamp,
          lastModified: entry.lastModified,
          data: entry.data as PainEntry['data'],
        }));

      // Generate different types of insights
      await Promise.all([
        this.analyzePainPatterns(painEntries),
        this.analyzeMedicationEffectiveness(painEntries),
        this.analyzeTriggers(painEntries),
        this.analyzeMoodCorrelations(painEntries),
      ]);

      await this.persistInsights();
    } catch (error) {
      console.error('Failed to process health insights:', error);
    }
  }

  private async analyzePainPatterns(entries: PainEntry[]): Promise<void> {
    if (entries.length < 7) return; // Need at least a week of data

    const insightId = 'pain-patterns-' + Date.now();
    this.processingQueue.add(insightId);

    try {
      const sortedEntries = entries.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Analyze weekly patterns
      const weeklyPatterns = this.calculateWeeklyPatterns(sortedEntries);

      // Analyze time-of-day patterns
      const timePatterns = this.calculateTimePatterns(sortedEntries);

      // Analyze trending
      const trend = this.calculatePainTrend(sortedEntries);

      const insight: HealthInsight = {
        id: insightId,
        type: 'pain-pattern',
        data: {
          weeklyPatterns,
          timePatterns,
          trend,
          analysisDate: new Date().toISOString(),
          sampleSize: entries.length,
        },
        confidence: this.calculateConfidence(entries.length, 'pattern'),
        generatedAt: new Date().toISOString(),
        source: 'statistical-analysis',
        recommendations: this.generatePainPatternRecommendations(
          weeklyPatterns,
          timePatterns,
          trend
        ),
      };

      this.insights.set(insightId, insight);
    } finally {
      this.processingQueue.delete(insightId);
    }
  }

  private async analyzeMedicationEffectiveness(entries: PainEntry[]): Promise<void> {
    const medicationEntries = entries.filter(
      entry => entry.data.medications && entry.data.medications.length > 0
    );

    if (medicationEntries.length < 5) return;

    const insightId = 'medication-effectiveness-' + Date.now();
    this.processingQueue.add(insightId);

    try {
      const effectiveness = this.calculateMedicationEffectiveness(medicationEntries);

      const insight: HealthInsight = {
        id: insightId,
        type: 'medication-effectiveness',
        data: {
          medications: effectiveness,
          analysisDate: new Date().toISOString(),
          sampleSize: medicationEntries.length,
        },
        confidence: this.calculateConfidence(medicationEntries.length, 'medication'),
        generatedAt: new Date().toISOString(),
        source: 'statistical-analysis',
        recommendations: this.generateMedicationRecommendations(effectiveness),
      };

      this.insights.set(insightId, insight);
    } finally {
      this.processingQueue.delete(insightId);
    }
  }

  private async analyzeTriggers(painEntries: PainEntry[]): Promise<void> {
    if (painEntries.length < 10) return;

    const insightId = 'trigger-analysis-' + Date.now();
    this.processingQueue.add(insightId);

    try {
      const triggers = this.identifyPainTriggers(painEntries);

      const insight: HealthInsight = {
        id: insightId,
        type: 'trigger-analysis',
        data: {
          triggers,
          analysisDate: new Date().toISOString(),
          sampleSize: painEntries.length,
        },
        confidence: this.calculateConfidence(painEntries.length, 'trigger'),
        generatedAt: new Date().toISOString(),
        source: 'statistical-analysis',
        recommendations: this.generateTriggerRecommendations(triggers),
      };

      this.insights.set(insightId, insight);
    } finally {
      this.processingQueue.delete(insightId);
    }
  }

  private async analyzeMoodCorrelations(painEntries: PainEntry[]): Promise<void> {
    const moodEntries = painEntries.filter(entry => entry.data.mood);
    if (moodEntries.length < 7) return;

    const insightId = 'mood-correlation-' + Date.now();
    this.processingQueue.add(insightId);

    try {
      const correlations = this.calculateMoodCorrelations(moodEntries);

      const insight: HealthInsight = {
        id: insightId,
        type: 'mood-correlation',
        data: {
          correlations,
          analysisDate: new Date().toISOString(),
          sampleSize: moodEntries.length,
        },
        confidence: this.calculateConfidence(moodEntries.length, 'mood'),
        generatedAt: new Date().toISOString(),
        source: 'statistical-analysis',
        recommendations: this.generateMoodRecommendations(correlations),
      };

      this.insights.set(insightId, insight);
    } finally {
      this.processingQueue.delete(insightId);
    }
  }

  // Analysis helper methods
  private calculateWeeklyPatterns(
    entries: PainEntry[]
  ): Array<{ day: string; averagePain: number; entryCount: number }> {
    const dayOfWeekCounts = new Array(7).fill(0);
    const dayOfWeekPain = new Array(7).fill(0);

    entries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dayOfWeek = date.getDay();
      const painLevel = this.extractPainLevel(entry);

      dayOfWeekCounts[dayOfWeek]++;
      dayOfWeekPain[dayOfWeek] += painLevel;
    });

    return dayOfWeekCounts.map((count, index) => ({
      day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index],
      averagePain: count > 0 ? dayOfWeekPain[index] / count : 0,
      entryCount: count,
    }));
  }

  private calculateTimePatterns(
    entries: PainEntry[]
  ): Array<{ hour: number; averagePain: number; entryCount: number }> {
    const hourCounts = new Array(24).fill(0);
    const hourPain = new Array(24).fill(0);

    entries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const hour = date.getHours();
      const painLevel = this.extractPainLevel(entry);

      hourCounts[hour]++;
      hourPain[hour] += painLevel;
    });

    return hourCounts.map((count, hour) => ({
      hour,
      averagePain: count > 0 ? hourPain[hour] / count : 0,
      entryCount: count,
    }));
  }

  private calculatePainTrend(entries: PainEntry[]): string {
    if (entries.length < 14) return 'insufficient-data';

    const recentEntries = entries.slice(-7);
    const olderEntries = entries.slice(-14, -7);

    const recentAvg =
      recentEntries.reduce((sum, entry) => sum + this.extractPainLevel(entry), 0) /
      recentEntries.length;
    const olderAvg =
      olderEntries.reduce((sum, entry) => sum + this.extractPainLevel(entry), 0) /
      olderEntries.length;

    const difference = recentAvg - olderAvg;

    if (difference > 0.5) return 'worsening';
    if (difference < -0.5) return 'improving';
    return 'stable';
  }

  private calculateMedicationEffectiveness(entries: PainEntry[]): Array<{
    medication: string;
    averagePainLevel: number;
    usageCount: number;
    effectiveness: string;
  }> {
    const medicationStats = new Map<string, { painLevels: number[]; count: number }>();

    entries.forEach(entry => {
      const medications = entry.data.medications || [];
      const painLevel = this.extractPainLevel(entry);

      medications.forEach((med: string) => {
        if (!medicationStats.has(med)) {
          medicationStats.set(med, { painLevels: [], count: 0 });
        }
        const stats = medicationStats.get(med)!;
        stats.painLevels.push(painLevel);
        stats.count++;
      });
    });

    return Array.from(medicationStats.entries()).map(([medication, stats]) => ({
      medication,
      averagePainLevel:
        stats.painLevels.reduce((a: number, b: number) => a + b, 0) / stats.painLevels.length,
      usageCount: stats.count,
      effectiveness: this.rateEffectiveness(stats.painLevels),
    }));
  }

  private identifyPainTriggers(painEntries: PainEntry[]): Array<{
    trigger: string;
    averagePainLevel: number;
    occurrences: number;
    severity: string;
  }> {
    const triggers = new Map<string, { painLevels: number[]; occurrences: number }>();

    painEntries.forEach(entry => {
      const painLevel = this.extractPainLevel(entry);
      const entryTriggers = entry.data.triggers || [];

      entryTriggers.forEach((trigger: string) => {
        if (!triggers.has(trigger)) {
          triggers.set(trigger, { painLevels: [], occurrences: 0 });
        }
        const triggerStats = triggers.get(trigger)!;
        triggerStats.painLevels.push(painLevel);
        triggerStats.occurrences++;
      });
    });

    return Array.from(triggers.entries()).map(([trigger, stats]) => ({
      trigger,
      averagePainLevel:
        stats.painLevels.reduce((a: number, b: number) => a + b, 0) / stats.painLevels.length,
      occurrences: stats.occurrences,
      severity: this.categorizeTriggerSeverity(stats.painLevels),
    }));
  }

  private calculateMoodCorrelations(entries: PainEntry[]): Array<{
    mood: string;
    averagePainLevel: number;
    occurrences: number;
  }> {
    const moodPainMap = new Map<string, number[]>();

    entries.forEach(entry => {
      const mood = entry.data.mood!;
      const painLevel = this.extractPainLevel(entry);

      if (!moodPainMap.has(mood)) {
        moodPainMap.set(mood, []);
      }
      moodPainMap.get(mood)!.push(painLevel);
    });

    return Array.from(moodPainMap.entries()).map(([mood, painLevels]) => ({
      mood,
      averagePainLevel: painLevels.reduce((a: number, b: number) => a + b, 0) / painLevels.length,
      occurrences: painLevels.length,
    }));
  }

  private extractPainLevel(entry: PainEntry): number {
    return entry.data.pain_level || entry.data.painLevel || 0;
  }

  private calculateConfidence(sampleSize: number, analysisType: string): number {
    const baseConfidence = Math.min(sampleSize / 30, 1); // Max confidence at 30+ samples

    const typeMultiplier =
      {
        pattern: 0.8,
        medication: 0.9,
        trigger: 0.7,
        mood: 0.6,
      }[analysisType] || 0.5;

    return Math.round(baseConfidence * typeMultiplier * 100);
  }

  private rateEffectiveness(painLevels: number[]): string {
    const avgPain = painLevels.reduce((a, b) => a + b, 0) / painLevels.length;

    if (avgPain <= 3) return 'highly-effective';
    if (avgPain <= 5) return 'moderately-effective';
    if (avgPain <= 7) return 'minimally-effective';
    return 'ineffective';
  }

  private categorizeTriggerSeverity(painLevels: number[]): string {
    const avgPain = painLevels.reduce((a, b) => a + b, 0) / painLevels.length;

    if (avgPain >= 8) return 'severe';
    if (avgPain >= 6) return 'moderate';
    if (avgPain >= 4) return 'mild';
    return 'minimal';
  }

  // Recommendation generators
  private generatePainPatternRecommendations(
    weekly: Array<{ day: string; averagePain: number; entryCount: number }>,
    time: Array<{ hour: number; averagePain: number; entryCount: number }>,
    trend: string
  ): string[] {
    const recommendations: string[] = [];

    // Weekly pattern recommendations
    const worstDay = weekly.reduce((prev, curr) =>
      curr.averagePain > prev.averagePain ? curr : prev
    );
    if (worstDay.averagePain > 6) {
      recommendations.push(`Consider extra rest or preventive measures on ${worstDay.day}s`);
    }

    // Time pattern recommendations
    const worstHours = time.filter(h => h.averagePain > 6).map(h => h.hour);
    if (worstHours.length > 0) {
      recommendations.push(
        `Pain tends to peak around ${worstHours.join(', ')}:00. Consider timing medication accordingly.`
      );
    }

    // Trend recommendations
    if (trend === 'worsening') {
      recommendations.push(
        'Your pain levels have increased recently. Consider consulting your healthcare provider.'
      );
    } else if (trend === 'improving') {
      recommendations.push(
        'Great news! Your pain levels are trending downward. Keep up your current management strategy.'
      );
    }

    return recommendations;
  }

  private generateMedicationRecommendations(
    medications: Array<{
      medication: string;
      averagePainLevel: number;
      usageCount: number;
      effectiveness: string;
    }>
  ): string[] {
    const recommendations: string[] = [];

    const effective = medications.filter(m => m.effectiveness === 'highly-effective');
    const ineffective = medications.filter(m => m.effectiveness === 'ineffective');

    if (effective.length > 0) {
      recommendations.push(
        `${effective.map(m => m.medication).join(', ')} appear to be most effective for your pain.`
      );
    }

    if (ineffective.length > 0) {
      recommendations.push(
        `Consider discussing alternatives to ${ineffective.map(m => m.medication).join(', ')} with your healthcare provider.`
      );
    }

    return recommendations;
  }

  private generateTriggerRecommendations(
    triggers: Array<{
      trigger: string;
      averagePainLevel: number;
      occurrences: number;
      severity: string;
    }>
  ): string[] {
    const recommendations: string[] = [];

    const severeTriggers = triggers.filter(t => t.severity === 'severe').slice(0, 3);

    severeTriggers.forEach(trigger => {
      recommendations.push(
        `${trigger.trigger} appears to be a significant pain trigger. Consider avoidance strategies.`
      );
    });

    return recommendations;
  }

  private generateMoodRecommendations(
    correlations: Array<{
      mood: string;
      averagePainLevel: number;
      occurrences: number;
    }>
  ): string[] {
    const recommendations: string[] = [];

    const highPainMoods = correlations.filter(c => c.averagePainLevel > 6);
    const lowPainMoods = correlations.filter(c => c.averagePainLevel < 4);

    if (lowPainMoods.length > 0) {
      recommendations.push(
        `Your pain tends to be lower when feeling ${lowPainMoods.map(m => m.mood).join(', ')}. Consider mood-supporting activities.`
      );
    }

    if (highPainMoods.length > 0) {
      recommendations.push(
        `Pain levels are higher when feeling ${highPainMoods.map(m => m.mood).join(', ')}. Consider stress management techniques.`
      );
    }

    return recommendations;
  }

  // Public methods
  getInsights(type?: HealthInsight['type']): HealthInsight[] {
    const allInsights = Array.from(this.insights.values());
    return type ? allInsights.filter(insight => insight.type === type) : allInsights;
  }

  getLatestInsight(type: HealthInsight['type']): HealthInsight | null {
    const insights = this.getInsights(type);
    return insights.length > 0 ? insights[insights.length - 1] : null;
  }

  private async persistInsights(): Promise<void> {
    try {
      const insightArray = Array.from(this.insights.values());
      await enhancedStorage.setItem('health-insights', insightArray);
    } catch (error) {
      console.error('Failed to persist insights:', error);
    }
  }
}

// Main Advanced Offline Manager
export class AdvancedOfflineManager {
  public conflictResolver: ConflictResolutionService;
  public resourceManager: OfflineResourceManager;
  public insightsProcessor: HealthInsightsProcessor;

  constructor() {
    this.conflictResolver = new ConflictResolutionService();
    this.resourceManager = new OfflineResourceManager();
    this.insightsProcessor = new HealthInsightsProcessor();

    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Download essential offline resources
      await this.resourceManager.downloadEssentialResources();

      // Start background processing
      this.insightsProcessor.processNewInsights();

      console.log('Advanced offline capabilities initialized');
    } catch (error) {
      console.error('Failed to initialize advanced offline capabilities:', error);
    }
  }

  async handleDataSync(
    localData: SyncableData,
    remoteData: SyncableData,
    entityType: string
  ): Promise<SyncableData | { conflict: SyncConflict; requiresManualResolution: boolean }> {
    // Detect conflicts
    const conflicts = await this.conflictResolver.detectConflicts(
      localData,
      remoteData,
      entityType
    );

    if (conflicts.length === 0) {
      return remoteData; // No conflicts, use remote data
    }

    // Resolve conflicts automatically
    const resolvedData = await this.conflictResolver.resolveConflict(conflicts[0].id);

    if (
      typeof resolvedData === 'object' &&
      'requiresManualResolution' in resolvedData &&
      resolvedData.requiresManualResolution
    ) {
      // Emit event for manual resolution
      window.dispatchEvent(
        new CustomEvent('data-conflict-detected', {
          detail: resolvedData.conflict,
        })
      );
      return localData; // Keep local data until resolved
    }

    return resolvedData as SyncableData;
  }

  getOfflineCopingStrategies(painLevel: number, location?: string): OfflineResource[] {
    return this.resourceManager.getCopingStrategies(painLevel, location);
  }

  getHealthInsights(): HealthInsight[] {
    return this.insightsProcessor.getInsights();
  }

  getStatus(): {
    resourcesAvailable: number;
    insightsGenerated: number;
    unresolvedConflicts: number;
    storageUsed: string;
  } {
    return {
      resourcesAvailable: this.resourceManager['resources'].size,
      insightsGenerated: this.insightsProcessor['insights'].size,
      unresolvedConflicts: this.conflictResolver.getUnresolvedConflicts().length,
      storageUsed: `${Math.round(Array.from(this.resourceManager['resources'].values()).reduce((total, r) => total + r.size, 0) / 1024)}KB`,
    };
  }
}

// Export singleton instance
export const advancedOfflineManager = new AdvancedOfflineManager();
