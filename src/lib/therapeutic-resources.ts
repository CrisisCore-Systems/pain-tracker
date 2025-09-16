/**
 * Offline Therapeutic Resources System
 * Provides access to coping mechanisms, therapeutic resources, and crisis interventions when offline
 */

import { OfflineStorageService } from './offline-storage';
import type { 
  UserContext as BaseUserContext,
  SessionOutcomes as BaseSessionOutcomes, 
  ResourceRecommendation as BaseResourceRecommendation,
  TherapeuticResourceData,
  CopingSessionData,
  ResourceAnalyticsData
} from '../types/extended-storage';

// Extended UserContext for this service
export interface UserContext extends BaseUserContext {
  currentPainLevel?: number;
  currentMood?: string;
  availableTime?: number;
  previouslyUsed?: string[];
  timeOfDay: string;
}

// Re-export types with proper names
export type SessionOutcomes = BaseSessionOutcomes;
export type ResourceRecommendation = BaseResourceRecommendation;

export interface ResourceAnalytics {
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

export interface TherapeuticResource {
  id: string;
  title: string;
  description: string;
  category: 'breathing' | 'grounding' | 'mindfulness' | 'movement' | 'distraction' | 'crisis' | 'sleep' | 'communication';
  content: string;
  duration?: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  effectiveness: number; // 0-100 based on user feedback
  traumaInformed: boolean;
  accessibilityFeatures: string[];
  instructions: string[];
  warnings?: string[];
  alternatives?: string[];
  followUp?: string[];
  lastAccessed?: string;
  timesUsed: number;
}

export interface CopingSession {
  id: string;
  resourceId: string;
  startTime: string;
  endTime?: string;
  completed: boolean;
  effectiveness?: number; // 1-10
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

export interface CrisisResource {
  id: string;
  title: string;
  type: 'hotline' | 'text' | 'chat' | 'local' | 'emergency';
  contact: string;
  availability: string;
  description: string;
  traumaSpecific: boolean;
  anonymous: boolean;
  languageSupport: string[];
  specialties: string[];
}

export class OfflineTherapeuticResourcesService {
  private static instance: OfflineTherapeuticResourcesService;
  private offlineStorage: OfflineStorageService;
  private currentSession: CopingSession | null = null;

  private constructor() {
    this.offlineStorage = OfflineStorageService.getInstance();
    this.loadDefaultResources();
  }

  static getInstance(): OfflineTherapeuticResourcesService {
    if (!OfflineTherapeuticResourcesService.instance) {
      OfflineTherapeuticResourcesService.instance = new OfflineTherapeuticResourcesService();
    }
    return OfflineTherapeuticResourcesService.instance;
  }

  private async loadDefaultResources(): Promise<void> {
    try {
      // Check if resources already exist
      const existingResources = await this.getAllResources();
      if (existingResources.length > 0) {
        return;
      }

      // Load default therapeutic resources
      const defaultResources: TherapeuticResource[] = [
        {
          id: 'breathing-4-7-8',
          title: '4-7-8 Breathing Technique',
          description: 'A calming breathing pattern that helps reduce anxiety and pain perception',
          category: 'breathing',
          content: 'Inhale for 4 counts, hold for 7 counts, exhale for 8 counts. Repeat 3-4 times.',
          duration: 5,
          difficulty: 'beginner',
          tags: ['anxiety', 'sleep', 'quick', 'anywhere'],
          effectiveness: 85,
          traumaInformed: true,
          accessibilityFeatures: ['audio-guided', 'visual-cues', 'customizable-pace'],
          instructions: [
            'Find a comfortable seated or lying position',
            'Place one hand on chest, one on belly',
            'Inhale slowly through nose for 4 counts',
            'Hold breath for 7 counts',
            'Exhale slowly through mouth for 8 counts',
            'Repeat 3-4 cycles or until feeling calmer'
          ],
          warnings: ['Stop if feeling dizzy', 'Start with fewer cycles if new to technique'],
          alternatives: ['Box breathing if 4-7-8 feels too long', 'Simple deep breathing'],
          followUp: ['Notice any changes in pain or tension', 'Log effectiveness in pain tracker'],
          timesUsed: 0
        },
        {
          id: 'grounding-5-4-3-2-1',
          title: '5-4-3-2-1 Grounding Technique',
          description: 'Uses five senses to anchor you to the present moment during pain flares or anxiety',
          category: 'grounding',
          content: 'Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.',
          duration: 10,
          difficulty: 'beginner',
          tags: ['anxiety', 'dissociation', 'trauma-informed', 'present-moment'],
          effectiveness: 78,
          traumaInformed: true,
          accessibilityFeatures: ['adapted-for-low-vision', 'quiet-version', 'seated-option'],
          instructions: [
            'Sit or stand comfortably and take a deep breath',
            'Look around and name 5 things you can see',
            'Touch 4 different textures around you',
            'Listen for 3 different sounds',
            'Notice 2 different smells',
            'Identify 1 taste in your mouth'
          ],
          alternatives: ['Use only available senses', 'Mental imagery if mobility limited'],
          followUp: ['Rate current pain level', 'Notice any shift in anxiety'],
          timesUsed: 0
        },
        {
          id: 'progressive-muscle-relaxation',
          title: 'Progressive Muscle Relaxation',
          description: 'Systematic tensing and relaxing of muscle groups to reduce overall tension',
          category: 'movement',
          content: 'Tense each muscle group for 5 seconds, then relax for 10 seconds, moving from toes to head.',
          duration: 20,
          difficulty: 'intermediate',
          tags: ['tension', 'full-body', 'bedtime', 'chronic-pain'],
          effectiveness: 82,
          traumaInformed: true,
          accessibilityFeatures: ['chair-adapted', 'partial-body-option', 'voice-guided'],
          instructions: [
            'Find a comfortable position lying down or seated',
            'Start with your toes - tense for 5 seconds, then relax',
            'Move up to calves, thighs, glutes',
            'Continue with arms, shoulders, face',
            'Notice the contrast between tension and relaxation',
            'End with a few deep breaths'
          ],
          warnings: ['Skip areas of acute pain', 'Gentle tension only'],
          alternatives: ['Relaxation without tensing', 'Focus on one body area'],
          timesUsed: 0
        }
      ];

      // Crisis resources
      const crisisResources: CrisisResource[] = [
        {
          id: 'crisis-text-line',
          title: 'Crisis Text Line',
          type: 'text',
          contact: 'Text HOME to 741741',
          availability: '24/7',
          description: 'Free, confidential crisis support via text message',
          traumaSpecific: true,
          anonymous: true,
          languageSupport: ['English', 'Spanish'],
          specialties: ['mental health', 'crisis intervention', 'trauma']
        },
        {
          id: 'suicide-prevention-lifeline',
          title: 'National Suicide Prevention Lifeline',
          type: 'hotline',
          contact: '988',
          availability: '24/7',
          description: 'National network of local crisis centers providing free and confidential support',
          traumaSpecific: false,
          anonymous: true,
          languageSupport: ['English', 'Spanish'],
          specialties: ['suicide prevention', 'mental health crisis']
        }
      ];

      // Store resources
      for (const resource of defaultResources) {
        await this.storeResource(resource);
      }

      console.log('Default therapeutic resources loaded');
    } catch (error) {
      console.error('Failed to load default resources:', error);
    }
  }

  private async storeResource(resource: TherapeuticResource): Promise<void> {
    try {
      // Convert to the storage format expected by offline storage
      const resourceData: TherapeuticResourceData = {
        id: resource.id,
        title: resource.title,
        description: resource.description,
        category: resource.category,
        content: resource.content,
        duration: resource.duration,
        difficulty: resource.difficulty,
        tags: resource.tags,
        effectiveness: resource.effectiveness,
        traumaInformed: resource.traumaInformed,
        accessibilityFeatures: resource.accessibilityFeatures,
        lastAccessed: resource.lastAccessed,
        timesUsed: resource.timesUsed
      };

      // For now, store in settings until we extend the storage service
      await this.offlineStorage.storeData('settings', {
        key: `therapeutic-resource-${resource.id}`,
        value: resourceData
      });
    } catch (error) {
      console.error('Failed to store resource:', error);
    }
  }

  // Public API methods
  async getResourcesByCategory(category: string): Promise<TherapeuticResource[]> {
    const allResources = await this.getAllResources();
    return allResources.filter(resource => resource.category === category);
  }

  async getResourcesForContext(context: UserContext): Promise<ResourceRecommendation[]> {
    try {
      const allResources = await this.getAllResources();
      const recommendations: ResourceRecommendation[] = [];

      for (const resource of allResources) {
        const relevanceScore = this.calculateRelevanceScore(resource, context);
        if (relevanceScore > 50) { // Only recommend relevant resources
          recommendations.push({
            resource: {
              id: resource.id,
              title: resource.title,
              description: resource.description,
              category: resource.category,
              content: resource.content,
              duration: resource.duration,
              difficulty: resource.difficulty,
              tags: resource.tags,
              effectiveness: resource.effectiveness,
              traumaInformed: resource.traumaInformed,
              accessibilityFeatures: resource.accessibilityFeatures,
              lastAccessed: resource.lastAccessed,
              timesUsed: resource.timesUsed
            },
            relevanceScore,
            reason: this.generateRecommendationReason(resource, context),
            estimatedDuration: resource.duration || 10,
            priority: relevanceScore > 80 ? 'high' : relevanceScore > 65 ? 'medium' : 'low',
            timing: this.determineTiming(resource, context)
          });
        }
      }

      return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      console.error('Failed to get resources for context:', error);
      return [];
    }
  }

  private calculateRelevanceScore(resource: TherapeuticResource, context: UserContext): number {
    let score = 50; // Base score

    // Pain level consideration
    if (context.currentPainLevel) {
      if (context.currentPainLevel > 7 && resource.category === 'crisis') score += 30;
      if (context.currentPainLevel > 5 && resource.tags.includes('quick')) score += 20;
      if (context.currentPainLevel <= 3 && resource.difficulty === 'advanced') score += 10;
    }

    // Time availability
    if (context.availableTime) {
      const resourceDuration = resource.duration || 10;
      if (resourceDuration <= context.availableTime) score += 15;
      if (resourceDuration > context.availableTime * 2) score -= 20;
    }

    // Symptom matching
    if (context.symptoms) {
      const matchingSymptoms = context.symptoms.filter((symptom: string) =>
        resource.tags.includes(symptom.toLowerCase())
      );
      score += matchingSymptoms.length * 10;
    }

    // Previous usage
    if (context.previouslyUsed && context.previouslyUsed.includes(resource.id)) {
      score -= 15; // Slight penalty for recently used
    }

    // Time of day
    if (context.timeOfDay === 'night' && resource.tags.includes('sleep')) score += 20;
    if (context.timeOfDay === 'work' && resource.tags.includes('anywhere')) score += 15;

    // Effectiveness rating
    score += resource.effectiveness * 0.3;

    return Math.min(100, Math.max(0, score));
  }

  private generateRecommendationReason(resource: TherapeuticResource, context: UserContext): string {
    const reasons: string[] = [];

    if (context.currentPainLevel && context.currentPainLevel > 6) {
      reasons.push('Helpful for high pain levels');
    }

    if (context.availableTime && resource.duration && resource.duration <= context.availableTime) {
      reasons.push(`Fits your available time (${resource.duration} minutes)`);
    }

    if (resource.traumaInformed) {
      reasons.push('Trauma-informed approach');
    }

    if (resource.effectiveness > 80) {
      reasons.push('Highly effective based on user feedback');
    }

    return reasons.length > 0 ? reasons.join(', ') : 'Good general coping technique';
  }

  private determineTiming(resource: TherapeuticResource, context: UserContext): 'immediate' | 'today' | 'this_week' | 'when_ready' {
    if (context.currentPainLevel && context.currentPainLevel > 7) return 'immediate';
    if (resource.tags.includes('quick') || (resource.duration && resource.duration <= 5)) return 'immediate';
    if (resource.difficulty === 'beginner') return 'today';
    return 'when_ready';
  }

  // Session management
  async startCopingSession(resourceId: string, context: UserContext): Promise<string> {
    try {
      this.currentSession = {
        id: crypto.randomUUID(),
        resourceId,
        startTime: new Date().toISOString(),
        completed: false,
        techniques: [],
        mood: {
          before: context.currentMood
        }
      };

      await this.storeSession(this.currentSession);
      return this.currentSession.id;
    } catch (error) {
      console.error('Failed to start coping session:', error);
      throw error;
    }
  }

  async updateSession(notes: string, techniques: string[]): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    this.currentSession.notes = notes;
    this.currentSession.techniques = [...this.currentSession.techniques, ...techniques];
    
    await this.storeSession(this.currentSession);
  }

  async completeSession(outcomes: SessionOutcomes): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.completed = true;
    this.currentSession.effectiveness = outcomes.effectiveness;
    this.currentSession.painBefore = this.currentSession.painBefore;
    this.currentSession.painAfter = outcomes.painReduction;
    this.currentSession.mood.after = outcomes.mood;

    await this.storeSession(this.currentSession);
    
    if (this.currentSession.resourceId) {
      await this.updateResourceAnalytics(this.currentSession.resourceId, outcomes);
    }

    this.currentSession = null;
  }

  private async storeSession(session: CopingSession): Promise<void> {
    const sessionData: CopingSessionData = session;
    await this.offlineStorage.storeData('settings', {
      key: `coping-session-${session.id}`,
      value: sessionData
    });
  }

  private async updateResourceAnalytics(resourceId: string, outcomes: SessionOutcomes): Promise<void> {
    try {
      let analytics = await this.getResourceAnalytics(resourceId);
      
      if (!analytics) {
        analytics = {
          resourceId,
          totalUses: 0,
          effectivenessRatings: [],
          averageEffectiveness: 0,
          painReductions: [],
          averagePainReduction: 0,
          completionRate: 0,
          averageDuration: 0,
          lastUpdated: new Date().toISOString(),
          trending: { daily: [], weekly: [], monthly: [] }
        };
      }

      analytics.totalUses++;
      analytics.effectivenessRatings.push(outcomes.effectiveness);
      analytics.painReductions.push(outcomes.painReduction);
      
      if (analytics.effectivenessRatings.length > 0) {
        analytics.averageEffectiveness = analytics.effectivenessRatings.reduce((a: number, b: number) => a + b, 0) / analytics.effectivenessRatings.length;
      }
      
      if (analytics.painReductions.length > 0) {
        analytics.averagePainReduction = analytics.painReductions.reduce((a: number, b: number) => a + b, 0) / analytics.painReductions.length;
      }

      await this.offlineStorage.storeData('settings', {
        key: `resource-analytics-${resourceId}`,
        value: analytics
      });
    } catch (error) {
      console.error('Failed to update resource analytics:', error);
    }
  }

  private async getResourceAnalytics(resourceId: string): Promise<ResourceAnalytics | null> {
    try {
      const data = await this.offlineStorage.getData('settings');
      const analyticsEntry = data.find(item => 
        typeof item.data === 'object' && 
        item.data !== null && 
        'key' in item.data && 
        item.data.key === `resource-analytics-${resourceId}`
      );
      
      if (analyticsEntry && typeof analyticsEntry.data === 'object' && 'value' in analyticsEntry.data) {
        return analyticsEntry.data.value as ResourceAnalytics;
      }
      return null;
    } catch (error) {
      console.error('Failed to get resource analytics:', error);
      return null;
    }
  }

  async getAllResources(): Promise<TherapeuticResource[]> {
    try {
      const data = await this.offlineStorage.getData('settings');
      const resourceEntries = data.filter(item => 
        typeof item.data === 'object' && 
        item.data !== null && 
        'key' in item.data && 
        typeof item.data.key === 'string' &&
        item.data.key.startsWith('therapeutic-resource-')
      );

      return resourceEntries.map(entry => {
        if (typeof entry.data === 'object' && entry.data !== null && 'value' in entry.data) {
          const resourceData = entry.data.value as TherapeuticResourceData;
          return {
            id: resourceData.id,
            title: resourceData.title,
            description: resourceData.description,
            category: resourceData.category as TherapeuticResource['category'],
            content: resourceData.content,
            duration: resourceData.duration,
            difficulty: resourceData.difficulty,
            tags: resourceData.tags,
            effectiveness: resourceData.effectiveness,
            traumaInformed: resourceData.traumaInformed,
            accessibilityFeatures: resourceData.accessibilityFeatures,
            instructions: [], // These would need to be stored separately
            lastAccessed: resourceData.lastAccessed,
            timesUsed: resourceData.timesUsed
          };
        }
        throw new Error('Invalid resource data format');
      });
    } catch (error) {
      console.error('Failed to get all resources:', error);
      return [];
    }
  }

  async getRecentSessions(limit: number = 10): Promise<CopingSession[]> {
    try {
      const data = await this.offlineStorage.getData('settings');
      const sessionEntries = data.filter(item => 
        typeof item.data === 'object' && 
        item.data !== null && 
        'key' in item.data && 
        typeof item.data.key === 'string' &&
        item.data.key.startsWith('coping-session-')
      );

      const sessions = sessionEntries.map(entry => {
        if (typeof entry.data === 'object' && entry.data !== null && 'value' in entry.data) {
          return entry.data.value as CopingSession;
        }
        throw new Error('Invalid session data format');
      });

      return sessions
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get recent sessions:', error);
      return [];
    }
  }

  async getResourceAnalyticsSummary(): Promise<Record<string, ResourceAnalytics>> {
    try {
      const data = await this.offlineStorage.getData('settings');
      const analyticsEntries = data.filter(item => 
        typeof item.data === 'object' && 
        item.data !== null && 
        'key' in item.data && 
        typeof item.data.key === 'string' &&
        item.data.key.startsWith('resource-analytics-')
      );

      const summary: Record<string, ResourceAnalytics> = {};
      
      for (const entry of analyticsEntries) {
        if (typeof entry.data === 'object' && entry.data !== null && 'key' in entry.data && 'value' in entry.data) {
          const key = entry.data.key as string;
          const resourceId = key.replace('resource-analytics-', '');
          summary[resourceId] = entry.data.value as ResourceAnalytics;
        }
      }

      return summary;
    } catch (error) {
      console.error('Failed to get analytics summary:', error);
      return {};
    }
  }

  // Quick access methods
  async getQuickCopingStrategies(): Promise<TherapeuticResource[]> {
    const allResources = await this.getAllResources();
    return allResources.filter(resource => 
      resource.tags.includes('quick') || 
      (resource.duration && resource.duration <= 5)
    );
  }

  async getEmergencyResources(): Promise<TherapeuticResource[]> {
    const allResources = await this.getAllResources();
    return allResources.filter(resource => resource.category === 'crisis');
  }

  async getTodaysRecommendations(userContext: UserContext): Promise<ResourceRecommendation[]> {
    // Get personalized recommendations based on user context
    const recommendations = await this.getResourcesForContext(userContext);
    
    // Filter for today's recommendations (high relevance, appropriate timing)
    return recommendations.filter(rec => 
      rec.timing === 'immediate' || rec.timing === 'today'
    ).slice(0, 3); // Limit to top 3
  }

  // Crisis intervention
  async getCrisisInterventions(): Promise<CrisisResource[]> {
    // Return crisis resources - in a real implementation, these would be stored in the database
    return [
      {
        id: 'crisis-text-line',
        title: 'Crisis Text Line',
        type: 'text',
        contact: 'Text HOME to 741741',
        availability: '24/7',
        description: 'Free, confidential crisis support via text message',
        traumaSpecific: true,
        anonymous: true,
        languageSupport: ['English', 'Spanish'],
        specialties: ['mental health', 'crisis intervention', 'trauma']
      },
      {
        id: 'suicide-prevention-lifeline',
        title: 'National Suicide Prevention Lifeline',
        type: 'hotline',
        contact: '988',
        availability: '24/7',
        description: 'National network of local crisis centers providing free and confidential support',
        traumaSpecific: false,
        anonymous: true,
        languageSupport: ['English', 'Spanish'],
        specialties: ['suicide prevention', 'mental health crisis']
      }
    ];
  }

  // Accessibility helpers
  async getAccessibleResources(needFeatures: string[]): Promise<TherapeuticResource[]> {
    const allResources = await this.getAllResources();
    return allResources.filter(resource =>
      needFeatures.some(feature => resource.accessibilityFeatures.includes(feature))
    );
  }
}

// Export singleton instance
export const therapeuticResources = OfflineTherapeuticResourcesService.getInstance();
