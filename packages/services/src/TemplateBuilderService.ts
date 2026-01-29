/**
 * Template Builder Service
 * 
 * Manages customizable templates for prompts, rituals, patterns, and workflows.
 * Enables users to create, customize, and share their pain tracking experience.
 * 
 * Privacy-First: All templates stored locally in localStorage
 * Validation: Zod schemas ensure data integrity
 * Extensibility: Easy to add new template types
 */

import { z } from 'zod';

// Base Template Schema
const BaseTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  author: z.string().optional(),
  isCustom: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Prompt Template Schema
export const PromptTemplateSchema = BaseTemplateSchema.extend({
  type: z.literal('prompt'),
  category: z.enum(['morning', 'afternoon', 'evening', 'night', 'custom']),
  tone: z.enum(['gentle', 'encouraging', 'curious', 'neutral', 'supportive']),
  text: z.string().min(10).max(500),
  triggers: z.array(z.string()).optional(),
  variables: z.array(z.string()).optional(),
  frequency: z.enum(['daily', 'weekly', 'custom']).optional(),
});

// Ritual Template Schema
export const RitualTemplateSchema = BaseTemplateSchema.extend({
  type: z.literal('ritual'),
  timing: z.enum(['morning', 'evening', 'bedtime', 'custom']),
  steps: z.array(z.object({
    order: z.number().int().positive(),
    action: z.string().min(1).max(200),
    duration: z.number().int().positive().optional(), // minutes
    optional: z.boolean().default(false),
  })).min(1),
  estimatedDuration: z.number().int().positive(), // minutes
  completionCriteria: z.string().max(200).optional(),
});

// Pattern Template Schema
export const PatternTemplateSchema = BaseTemplateSchema.extend({
  type: z.literal('pattern'),
  detectionLogic: z.object({
    conditions: z.array(z.object({
      field: z.string(),
      operator: z.enum(['=', '!=', '>', '<', '>=', '<=', 'in', 'not in', 'contains']),
      value: z.union([z.string(), z.number(), z.boolean(), z.array(z.union([z.string(), z.number()]))]),
    })),
    minOccurrences: z.number().int().positive().default(3),
    timeWindow: z.number().int().positive().optional(), // days
  }),
  confidence: z.number().min(0).max(1).default(0.5),
  actionable: z.boolean().default(true),
  recommendation: z.string().max(300).optional(),
  visualization: z.enum(['chart', 'heatmap', 'timeline', 'custom']).optional(),
});

// Workflow Template Schema
export const WorkflowTemplateSchema = BaseTemplateSchema.extend({
  type: z.literal('workflow'),
  trigger: z.object({
    type: z.enum(['pain_level', 'time', 'pattern', 'manual', 'condition']),
    threshold: z.number().optional(),
    condition: z.string().optional(),
  }),
  steps: z.array(z.object({
    order: z.number().int().positive(),
    type: z.enum(['prompt', 'check', 'recommendation', 'track', 'notify', 'custom']),
    action: z.string().min(1).max(200),
    data: z.record(z.string(), z.any()).optional(),
  })).min(1),
  goal: z.string().max(200).optional(),
});

// Union Type for All Templates
export const TemplateSchema = z.discriminatedUnion('type', [
  PromptTemplateSchema,
  RitualTemplateSchema,
  PatternTemplateSchema,
  WorkflowTemplateSchema,
]);

// TypeScript Types
export type BaseTemplate = z.infer<typeof BaseTemplateSchema>;
export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;
export type RitualTemplate = z.infer<typeof RitualTemplateSchema>;
export type PatternTemplate = z.infer<typeof PatternTemplateSchema>;
export type WorkflowTemplate = z.infer<typeof WorkflowTemplateSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type TemplateType = Template['type'];

// Filter Options
export interface TemplateFilter {
  type?: TemplateType;
  category?: string;
  isCustom?: boolean;
  author?: string;
}

// Import Result
export interface ImportResult {
  success: boolean;
  template?: Template;
  errors?: z.ZodIssue[];
}

/**
 * Template Builder Service
 * Manages template CRUD, import/export, and application
 */
export class TemplateBuilderService {
  private storageKey = 'pain-tracker-templates';
  private templates: Map<string, Template> = new Map();

  constructor() {
    this.loadTemplates();
  }

  /**
   * Load templates from localStorage
   */
  private loadTemplates(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach(template => {
            try {
              const validated = TemplateSchema.parse(template);
              this.templates.set(validated.id, validated);
            } catch (error) {
              console.warn(`Failed to load template ${template.id}:`, error);
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to load templates from localStorage:', error);
    }
  }

  /**
   * Save templates to localStorage
   */
  private saveTemplates(): void {
    try {
      const templates = Array.from(this.templates.values());
      localStorage.setItem(this.storageKey, JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save templates to localStorage:', error);
    }
  }

  /**
   * Create a new template
   */
  createTemplate(template: Template): Template {
    // Validate
    const validated = TemplateSchema.parse(template);

    // Check for duplicate ID
    if (this.templates.has(validated.id)) {
      throw new Error(`Template with ID '${validated.id}' already exists`);
    }

    // Add timestamps
    const now = new Date().toISOString();
    const withTimestamps = {
      ...validated,
      createdAt: validated.createdAt || now,
      updatedAt: now,
    };

    // Save
    this.templates.set(withTimestamps.id, withTimestamps);
    this.saveTemplates();

    return withTimestamps;
  }

  /**
   * Update an existing template
   */
  updateTemplate(id: string, updates: Partial<Template>): Template {
    const existing = this.templates.get(id);
    if (!existing) {
      throw new Error(`Template with ID '${id}' not found`);
    }

    // Merge and validate
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    const validated = TemplateSchema.parse(updated);

    // Save
    this.templates.set(id, validated);
    this.saveTemplates();

    return validated;
  }

  /**
   * Delete a template
   */
  deleteTemplate(id: string): boolean {
    const deleted = this.templates.delete(id);
    if (deleted) {
      this.saveTemplates();
    }
    return deleted;
  }

  /**
   * Get a template by ID
   */
  getTemplate(id: string): Template | undefined {
    return this.templates.get(id);
  }

  /**
   * List all templates with optional filtering
   */
  listTemplates(filter?: TemplateFilter): Template[] {
    let templates = Array.from(this.templates.values());

    if (filter) {
      if (filter.type) {
        templates = templates.filter(t => t.type === filter.type);
      }
      if (filter.category !== undefined) {
        templates = templates.filter(t => 
          'category' in t && t.category === filter.category
        );
      }
      if (filter.isCustom !== undefined) {
        templates = templates.filter(t => t.isCustom === filter.isCustom);
      }
      if (filter.author) {
        templates = templates.filter(t => t.author === filter.author);
      }
    }

    return templates;
  }

  /**
   * Search templates by name or description
   */
  searchTemplates(query: string): Template[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.templates.values()).filter(template => 
      template.name.toLowerCase().includes(lowerQuery) ||
      (template.description && template.description.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get templates by type
   */
  getTemplatesByType<T extends TemplateType>(type: T): Extract<Template, { type: T }>[] {
    return this.listTemplates({ type }) as Extract<Template, { type: T }>[];
  }

  /**
   * Export a template as JSON
   */
  exportTemplate(id: string): string {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template with ID '${id}' not found`);
    }
    return JSON.stringify(template, null, 2);
  }

  /**
   * Export all templates as JSON
   */
  exportAllTemplates(): string {
    const templates = Array.from(this.templates.values());
    return JSON.stringify(templates, null, 2);
  }

  /**
   * Import a template from JSON
   */
  importTemplate(json: string | object): ImportResult {
    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      const validated = TemplateSchema.parse(data);

      // Check if template already exists
      if (this.templates.has(validated.id)) {
        // Update existing
        this.updateTemplate(validated.id, validated);
      } else {
        // Create new
        this.createTemplate(validated);
      }

      return {
        success: true,
        template: validated,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.issues,
        };
      }
      return {
        success: false,
        errors: [{ code: 'custom' as any, message: String(error), path: [] }],
      };
    }
  }

  /**
   * Import multiple templates from JSON array
   */
  importTemplates(json: string | object[]): ImportResult[] {
    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      if (!Array.isArray(data)) {
        return [{
          success: false,
          errors: [{ code: 'custom' as any, message: 'Expected array of templates', path: [] }],
        }];
      }

      return data.map(template => this.importTemplate(template));
    } catch (error) {
      return [{
        success: false,
        errors: [{ code: 'custom' as any, message: String(error), path: [] }],
      }];
    }
  }

  /**
   * Compile a template (replace variables)
   */
  compileTemplate(id: string, variables?: Record<string, any>): string | null {
    const template = this.templates.get(id);
    if (!template) {
      return null;
    }

    if (template.type === 'prompt') {
      let text = template.text;
      if (variables && template.variables) {
        template.variables.forEach(varName => {
          if (variables[varName] !== undefined) {
            text = text.replace(new RegExp(`\\{${varName}\\}`, 'g'), String(variables[varName]));
          }
        });
      }
      return text;
    }

    return JSON.stringify(template, null, 2);
  }

  /**
   * Apply a template (integrate with system)
   */
  applyTemplate(id: string): boolean {
    const template = this.templates.get(id);
    if (!template) {
      return false;
    }

    // Implementation would integrate with relevant systems
    // For now, just return success
    console.log(`Applied template: ${template.name}`);
    return true;
  }

  /**
   * Preview a template (get compiled version without applying)
   */
  previewTemplate(id: string, variables?: Record<string, any>): string | null {
    return this.compileTemplate(id, variables);
  }

  /**
   * Get template statistics
   */
  getStatistics(): {
    total: number;
    byType: Record<TemplateType, number>;
    custom: number;
    builtin: number;
  } {
    const templates = Array.from(this.templates.values());
    
    return {
      total: templates.length,
      byType: {
        prompt: templates.filter(t => t.type === 'prompt').length,
        ritual: templates.filter(t => t.type === 'ritual').length,
        pattern: templates.filter(t => t.type === 'pattern').length,
        workflow: templates.filter(t => t.type === 'workflow').length,
      },
      custom: templates.filter(t => t.isCustom).length,
      builtin: templates.filter(t => !t.isCustom).length,
    };
  }

  /**
   * Clear all templates (use with caution!)
   */
  clearAllTemplates(): void {
    this.templates.clear();
    this.saveTemplates();
  }

  /**
   * Validate a template without saving
   */
  validateTemplate(template: any): { valid: boolean; errors?: z.ZodIssue[] } {
    try {
      TemplateSchema.parse(template);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { valid: false, errors: error.issues };
      }
      return { valid: false, errors: [{ code: 'custom' as any, message: String(error), path: [] }] };
    }
  }
}

// Singleton instance
export const templateBuilderService = new TemplateBuilderService();
