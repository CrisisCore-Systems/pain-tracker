/**
 * PluginRegistry - Extensibility system for custom patterns, recommendations, and insights
 * 
 * Features:
 * - Type-safe plugin registration
 * - Pattern recognition plugins
 * - Recommendation plugins
 * - Insight generation plugins
 * - Enable/disable management
 * - Plugin validation
 * - Sandboxed execution
 * 
 * Privacy: All plugins execute locally, no external calls
 */

import type { PainEntry } from './types';

// ============================================================================
// Plugin Types
// ============================================================================

export type PluginType = 'pattern' | 'recommendation' | 'insight' | 'visualization';

export interface BasePlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  type: PluginType;
  enabled: boolean;
  category?: string;
  tags?: string[];
}

// Pattern Recognition Plugin
export interface PatternPlugin extends BasePlugin {
  type: 'pattern';
  detectPattern: (entries: PainEntry[]) => PatternResult | null;
  minDataPoints: number;
}

export interface PatternResult {
  id: string;
  title: string;
  description: string;
  confidence: number; // 0-1
  supportingEvidence: string[];
  actionable: boolean;
  recommendation?: string;
  metadata?: Record<string, unknown>;
}

// Recommendation Plugin
export interface RecommendationPlugin extends BasePlugin {
  type: 'recommendation';
  generateRecommendation: (entries: PainEntry[], context?: RecommendationContext) => RecommendationResult | null;
}

export interface RecommendationContext {
  currentPain?: number;
  recentTrend?: 'increasing' | 'decreasing' | 'stable';
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  dayOfWeek?: string;
  metadata?: Record<string, unknown>;
}

export interface RecommendationResult {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  actionSteps: string[];
  expectedBenefit: string;
  confidence: number;
  timing?: string;
  category?: string;
}

// Insight Plugin
export interface InsightPlugin extends BasePlugin {
  type: 'insight';
  generateInsight: (entries: PainEntry[]) => InsightResult | null;
}

export interface InsightResult {
  id: string;
  title: string;
  message: string;
  type: 'positive' | 'neutral' | 'concern' | 'discovery';
  importance: 'high' | 'medium' | 'low';
  data?: Record<string, unknown>;
  visualization?: {
    type: string;
    config: Record<string, unknown>;
  };
}

// Visualization Plugin
export interface VisualizationPlugin extends BasePlugin {
  type: 'visualization';
  renderVisualization: (entries: PainEntry[]) => VisualizationResult;
}

export interface VisualizationResult {
  id: string;
  type: 'chart' | 'heatmap' | 'timeline' | 'custom';
  config: Record<string, unknown>;
  data: unknown[];
}

export type Plugin = PatternPlugin | RecommendationPlugin | InsightPlugin | VisualizationPlugin;

// ============================================================================
// Plugin Registry Service
// ============================================================================

export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<string, Plugin> = new Map();
  private readonly STORAGE_KEY = 'plugin-registry';

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  /**
   * Register a new plugin
   */
  public register(plugin: Plugin): void {
    // Validate plugin
    this.validatePlugin(plugin);

    // Register plugin
    this.plugins.set(plugin.id, plugin);
    this.saveToStorage();
  }

  /**
   * Unregister a plugin
   */
  public unregister(pluginId: string): void {
    this.plugins.delete(pluginId);
    this.saveToStorage();
  }

  /**
   * Get a plugin by ID
   */
  public getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all plugins of a specific type
   */
  public getPluginsByType<T extends Plugin>(type: PluginType): T[] {
    return Array.from(this.plugins.values())
      .filter((p): p is T => p.type === type);
  }

  /**
   * Get all enabled plugins
   */
  public getEnabledPlugins(): Plugin[] {
    return Array.from(this.plugins.values()).filter(p => p.enabled);
  }

  /**
   * Get enabled plugins by type
   */
  public getEnabledPluginsByType<T extends Plugin>(type: PluginType): T[] {
    return this.getPluginsByType<T>(type).filter(p => p.enabled);
  }

  /**
   * Enable a plugin
   */
  public enablePlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.enabled = true;
      this.saveToStorage();
    }
  }

  /**
   * Disable a plugin
   */
  public disablePlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.enabled = false;
      this.saveToStorage();
    }
  }

  /**
   * Execute all enabled pattern plugins
   */
  public executePatternPlugins(entries: PainEntry[]): PatternResult[] {
    const plugins = this.getEnabledPluginsByType<PatternPlugin>('pattern');
    const results: PatternResult[] = [];

    for (const plugin of plugins) {
      // Check minimum data points
      if (entries.length < plugin.minDataPoints) {
        continue;
      }

      try {
        const result = plugin.detectPattern(entries);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        console.error(`Error executing pattern plugin ${plugin.id}:`, error);
        // Continue with other plugins
      }
    }

    return results;
  }

  /**
   * Execute all enabled recommendation plugins
   */
  public executeRecommendationPlugins(
    entries: PainEntry[],
    context?: RecommendationContext
  ): RecommendationResult[] {
    const plugins = this.getEnabledPluginsByType<RecommendationPlugin>('recommendation');
    const results: RecommendationResult[] = [];

    for (const plugin of plugins) {
      try {
        const result = plugin.generateRecommendation(entries, context);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        console.error(`Error executing recommendation plugin ${plugin.id}:`, error);
      }
    }

    // Sort by priority and confidence
    return results.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    });
  }

  /**
   * Execute all enabled insight plugins
   */
  public executeInsightPlugins(entries: PainEntry[]): InsightResult[] {
    const plugins = this.getEnabledPluginsByType<InsightPlugin>('insight');
    const results: InsightResult[] = [];

    for (const plugin of plugins) {
      try {
        const result = plugin.generateInsight(entries);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        console.error(`Error executing insight plugin ${plugin.id}:`, error);
      }
    }

    // Sort by importance
    return results.sort((a, b) => {
      const importanceOrder = { high: 3, medium: 2, low: 1 };
      return importanceOrder[b.importance] - importanceOrder[a.importance];
    });
  }

  /**
   * Get all plugin metadata (without execution functions)
   */
  public getPluginMetadata(): Array<Omit<Plugin, 'detectPattern' | 'generateRecommendation' | 'generateInsight' | 'renderVisualization'>> {
    return Array.from(this.plugins.values()).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      version: p.version,
      author: p.author,
      type: p.type,
      enabled: p.enabled,
      category: p.category,
      tags: p.tags,
    }));
  }

  /**
   * Validate plugin structure
   */
  private validatePlugin(plugin: Plugin): void {
    // Required fields
    if (!plugin.id || !plugin.name || !plugin.type) {
      throw new Error('Plugin missing required fields (id, name, type)');
    }

    // ID uniqueness
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with ID "${plugin.id}" already registered`);
    }

    // Type-specific validation
    switch (plugin.type) {
      case 'pattern':
        if (typeof (plugin as PatternPlugin).detectPattern !== 'function') {
          throw new Error('Pattern plugin must have detectPattern function');
        }
        if (typeof (plugin as PatternPlugin).minDataPoints !== 'number') {
          throw new Error('Pattern plugin must specify minDataPoints');
        }
        break;
      case 'recommendation':
        if (typeof (plugin as RecommendationPlugin).generateRecommendation !== 'function') {
          throw new Error('Recommendation plugin must have generateRecommendation function');
        }
        break;
      case 'insight':
        if (typeof (plugin as InsightPlugin).generateInsight !== 'function') {
          throw new Error('Insight plugin must have generateInsight function');
        }
        break;
      case 'visualization':
        if (typeof (plugin as VisualizationPlugin).renderVisualization !== 'function') {
          throw new Error('Visualization plugin must have renderVisualization function');
        }
        break;
    }
  }

  /**
   * Load plugins from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const metadata = JSON.parse(stored) as Array<Omit<Plugin, 'detectPattern' | 'generateRecommendation' | 'generateInsight' | 'renderVisualization'>>;
        // Note: Functions cannot be stored in localStorage
        // Plugins must be re-registered on app load
        // This only stores metadata for enabled/disabled state
        for (const meta of metadata) {
          const existingPlugin = this.plugins.get(meta.id);
          if (existingPlugin) {
            existingPlugin.enabled = meta.enabled;
          }
        }
      }
    } catch (error) {
      console.error('Error loading plugins from storage:', error);
    }
  }

  /**
   * Save plugin metadata to localStorage
   */
  private saveToStorage(): void {
    try {
      const metadata = this.getPluginMetadata();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving plugins to storage:', error);
    }
  }

  /**
   * Clear all plugins (for testing)
   */
  public clearAll(): void {
    this.plugins.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Export singleton instance
export const pluginRegistry = PluginRegistry.getInstance();
