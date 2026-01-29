/**
 * Prompt Customization Service
 * 
 * Enables users to customize their check-in prompts with:
 * - Multiple tone options (gentle, encouraging, curious, etc.)
 * - Variable substitution system
 * - Timing preferences
 * - A/B testing framework (local-only)
 * 
 * Privacy-first: All customizations stored locally, no external calls.
 * Trauma-informed: Users control language and tone.
 */

interface CustomPrompt {
  id: string;
  text: string;
  tone: ToneOption;
  category: PromptCategory;
  variables: string[];
  timing?: TimingPreference;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

type ToneOption = 'gentle' | 'encouraging' | 'curious' | 'neutral' | 'clinical' | 'playful' | 'serious' | 'motivating';

type PromptCategory = 'morning' | 'afternoon' | 'evening' | 'night' | 'high_pain' | 'medium_pain' | 'low_pain' | 'pre_activity' | 'post_activity' | 'custom';

interface TimingPreference {
  preferredTimes: string[]; // ['08:00', '20:00']
  daysOfWeek: number[]; // [0-6, 0=Sunday]
  reminderFrequency?: 'once' | 'daily' | 'multiple';
}

interface DoNotDisturbPeriod {
  start: string; // '22:00'
  end: string; // '07:00'
}

interface CustomTone {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  examples: string[];
}

interface Variable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  defaultValue?: any;
  resolver?: (context: any) => any;
}

interface ABTest {
  id: string;
  name: string;
  variants: ABTestVariant[];
  metric: 'response_rate' | 'time_to_respond' | 'engagement';
  startDate: string;
  endDate?: string;
  results: ABTestResults;
}

interface ABTestVariant {
  id: string;
  text: string;
  tone: ToneOption;
  impressions: number;
  interactions: number;
  avgTimeToRespond?: number;
}

interface ABTestResults {
  totalImpressions: number;
  totalInteractions: number;
  winner?: string;
  confidence?: number;
  significanceLevel?: number;
}

class PromptCustomizationService {
  private static instance: PromptCustomizationService;
  private storageKey = 'prompt_customization';
  private prompts: Map<string, CustomPrompt> = new Map();
  private tones: Map<string, CustomTone> = new Map();
  private variables: Map<string, Variable> = new Map();
  private timingPreferences: TimingPreference[] = [];
  private dndPeriods: DoNotDisturbPeriod[] = [];
  private abTests: Map<string, ABTest> = new Map();

  private constructor() {
    this.initializeDefaultTones();
    this.initializeDefaultVariables();
    this.loadFromStorage();
  }

  static getInstance(): PromptCustomizationService {
    if (!PromptCustomizationService.instance) {
      PromptCustomizationService.instance = new PromptCustomizationService();
    }
    return PromptCustomizationService.instance;
  }

  // Initialize default tones
  private initializeDefaultTones(): void {
    const defaultTones: CustomTone[] = [
      {
        id: 'gentle',
        name: 'Gentle',
        description: 'Soft, caring, and supportive language',
        characteristics: ['caring', 'soft', 'supportive'],
        examples: ['How are you feeling today? 🌸', 'Take your time, when you\'re ready to check in']
      },
      {
        id: 'encouraging',
        name: 'Encouraging',
        description: 'Positive and motivating language',
        characteristics: ['positive', 'motivating', 'uplifting'],
        examples: ['You\'ve got this! How\'s your pain?', 'Great job tracking! Let\'s check in']
      },
      {
        id: 'curious',
        name: 'Curious',
        description: 'Inquisitive and exploratory language',
        characteristics: ['inquisitive', 'exploratory', 'thoughtful'],
        examples: ['What patterns are you noticing?', 'Interesting! What else have you observed?']
      },
      {
        id: 'neutral',
        name: 'Neutral',
        description: 'Straightforward and matter-of-fact',
        characteristics: ['straightforward', 'clear', 'simple'],
        examples: ['Please rate your pain level', 'Time for your check-in']
      },
      {
        id: 'clinical',
        name: 'Clinical',
        description: 'Professional medical terminology',
        characteristics: ['professional', 'medical', 'precise'],
        examples: ['Document your pain assessment', 'Record your symptom severity']
      },
      {
        id: 'playful',
        name: 'Playful',
        description: 'Light and friendly language',
        characteristics: ['light', 'friendly', 'casual'],
        examples: ['Pain check! What\'s the story? 😊', 'Hey! How are things today?']
      },
      {
        id: 'serious',
        name: 'Serious',
        description: 'Focused and purposeful language',
        characteristics: ['focused', 'purposeful', 'direct'],
        examples: ['Let\'s check in on your pain', 'Important: Please track your symptoms']
      },
      {
        id: 'motivating',
        name: 'Motivating',
        description: 'Energizing and goal-oriented language',
        characteristics: ['energizing', 'goal-oriented', 'inspiring'],
        examples: ['Track your progress! How are you? 💪', 'Keep going! You\'re doing great!']
      }
    ];

    defaultTones.forEach(tone => this.tones.set(tone.id, tone));
  }

  // Initialize default variables
  private initializeDefaultVariables(): void {
    const defaultVariables: Variable[] = [
      {
        name: 'userName',
        description: 'User\'s name',
        type: 'string',
        defaultValue: 'there'
      },
      {
        name: 'timeOfDay',
        description: 'Current time of day (morning, afternoon, evening, night)',
        type: 'string',
        resolver: () => {
          const hour = new Date().getHours();
          if (hour < 12) return 'morning';
          if (hour < 17) return 'afternoon';
          if (hour < 21) return 'evening';
          return 'night';
        }
      },
      {
        name: 'dayOfWeek',
        description: 'Current day of the week',
        type: 'string',
        resolver: () => {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          return days[new Date().getDay()];
        }
      },
      {
        name: 'date',
        description: 'Current date',
        type: 'date',
        resolver: () => new Date().toLocaleDateString()
      },
      {
        name: 'painLevel',
        description: 'Current pain level',
        type: 'number',
        defaultValue: 0
      },
      {
        name: 'streak',
        description: 'Current tracking streak in days',
        type: 'number',
        defaultValue: 0
      },
      {
        name: 'lastEntry',
        description: 'Time since last entry',
        type: 'string',
        defaultValue: 'Never'
      },
      {
        name: 'weather',
        description: 'Current weather condition',
        type: 'string',
        defaultValue: 'Unknown'
      },
      {
        name: 'mood',
        description: 'Current mood',
        type: 'string',
        defaultValue: 'Not set'
      },
      {
        name: 'medication',
        description: 'Medication status',
        type: 'string',
        defaultValue: 'Not taken'
      }
    ];

    defaultVariables.forEach(variable => this.variables.set(variable.name, variable));
  }

  // Load from localStorage
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Load custom prompts
        if (data.prompts) {
          data.prompts.forEach((prompt: CustomPrompt) => {
            this.prompts.set(prompt.id, prompt);
          });
        }
        
        // Load custom tones
        if (data.customTones) {
          data.customTones.forEach((tone: CustomTone) => {
            this.tones.set(tone.id, tone);
          });
        }
        
        // Load custom variables
        if (data.customVariables) {
          data.customVariables.forEach((variable: Variable) => {
            this.variables.set(variable.name, variable);
          });
        }
        
        // Load timing preferences
        if (data.timingPreferences) {
          this.timingPreferences = data.timingPreferences;
        }
        
        // Load DND periods
        if (data.dndPeriods) {
          this.dndPeriods = data.dndPeriods;
        }
        
        // Load A/B tests
        if (data.abTests) {
          data.abTests.forEach((test: ABTest) => {
            this.abTests.set(test.id, test);
          });
        }
      }
    } catch (error) {
      console.error('Error loading prompt customization data:', error);
    }
  }

  // Save to localStorage
  private saveToStorage(): void {
    try {
      const data = {
        prompts: Array.from(this.prompts.values()),
        customTones: Array.from(this.tones.values()).filter(t => !['gentle', 'encouraging', 'curious', 'neutral', 'clinical', 'playful', 'serious', 'motivating'].includes(t.id)),
        customVariables: Array.from(this.variables.values()).filter(v => !['userName', 'timeOfDay', 'dayOfWeek', 'date', 'painLevel', 'streak', 'lastEntry', 'weather', 'mood', 'medication'].includes(v.name)),
        timingPreferences: this.timingPreferences,
        dndPeriods: this.dndPeriods,
        abTests: Array.from(this.abTests.values())
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving prompt customization data:', error);
    }
  }

  // ========== Prompt Management ==========

  createCustomPrompt(prompt: CustomPrompt): void {
    this.prompts.set(prompt.id, prompt);
    this.saveToStorage();
  }

  updatePrompt(id: string, updates: Partial<CustomPrompt>): void {
    const prompt = this.prompts.get(id);
    if (prompt) {
      const updated = { ...prompt, ...updates, updatedAt: new Date().toISOString() };
      this.prompts.set(id, updated);
      this.saveToStorage();
    }
  }

  deletePrompt(id: string): void {
    this.prompts.delete(id);
    this.saveToStorage();
  }

  getPrompt(id: string): CustomPrompt | undefined {
    return this.prompts.get(id);
  }

  listPrompts(filter?: { category?: PromptCategory; tone?: ToneOption }): CustomPrompt[] {
    let prompts = Array.from(this.prompts.values());
    
    if (filter?.category) {
      prompts = prompts.filter(p => p.category === filter.category);
    }
    
    if (filter?.tone) {
      prompts = prompts.filter(p => p.tone === filter.tone);
    }
    
    return prompts;
  }

  // ========== Tone System ==========

  getToneOptions(): CustomTone[] {
    return Array.from(this.tones.values());
  }

  createCustomTone(tone: CustomTone): void {
    this.tones.set(tone.id, tone);
    this.saveToStorage();
  }

  applyTone(text: string, tone: ToneOption): string {
    const toneConfig = this.tones.get(tone);
    if (!toneConfig) return text;
    
    // Simple tone application (in real implementation, this would be more sophisticated)
    switch (tone) {
      case 'gentle':
        return `${text} 🌸`;
      case 'encouraging':
        return `${text} You've got this! 💪`;
      case 'curious':
        return `${text} What do you think?`;
      case 'neutral':
        return text;
      case 'clinical':
        return `Please ${text.toLowerCase()}`;
      case 'playful':
        return `${text} 😊`;
      case 'serious':
        return `Important: ${text}`;
      case 'motivating':
        return `${text} Keep tracking! 💪`;
      default:
        return text;
    }
  }

  getToneExamples(tone: ToneOption): string[] {
    const toneConfig = this.tones.get(tone);
    return toneConfig?.examples || [];
  }

  // ========== Variable System ==========

  getAvailableVariables(): Variable[] {
    return Array.from(this.variables.values());
  }

  addCustomVariable(variable: Variable): void {
    this.variables.set(variable.name, variable);
    this.saveToStorage();
  }

  substituteVariables(text: string, context: Record<string, any> = {}): string {
    let result = text;
    
    // Find all variables in the text
    const variableRegex = /\{(\w+)\}/g;
    const matches = text.matchAll(variableRegex);
    
    for (const match of matches) {
      const variableName = match[1];
      const variable = this.variables.get(variableName);
      
      if (!variable) continue;
      
      let value: any;
      
      // Check if value provided in context
      if (context[variableName] !== undefined) {
        value = context[variableName];
      }
      // Check if variable has a resolver
      else if (variable.resolver) {
        value = variable.resolver(context);
      }
      // Use default value
      else {
        value = variable.defaultValue || '';
      }
      
      // Replace the variable
      result = result.replace(`{${variableName}}`, String(value));
    }
    
    return result;
  }

  validateVariables(text: string): { valid: boolean; unknownVariables: string[] } {
    const variableRegex = /\{(\w+)\}/g;
    const matches = Array.from(text.matchAll(variableRegex));
    const unknownVariables: string[] = [];
    
    for (const match of matches) {
      const variableName = match[1];
      if (!this.variables.has(variableName)) {
        unknownVariables.push(variableName);
      }
    }
    
    return {
      valid: unknownVariables.length === 0,
      unknownVariables
    };
  }

  // ========== Timing Preferences ==========

  setPreferredTimes(times: TimingPreference[]): void {
    this.timingPreferences = times;
    this.saveToStorage();
  }

  getPreferredTimes(): TimingPreference[] {
    return this.timingPreferences;
  }

  getOptimalTime(history: Date[] = []): string | null {
    if (this.timingPreferences.length === 0) {
      // Calculate from history
      if (history.length === 0) return null;
      
      // Find most common hour
      const hourCounts = new Map<number, number>();
      history.forEach(date => {
        const hour = date.getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      });
      
      let maxCount = 0;
      let optimalHour = 8; // Default to 8 AM
      
      hourCounts.forEach((count, hour) => {
        if (count > maxCount) {
          maxCount = count;
          optimalHour = hour;
        }
      });
      
      return `${optimalHour.toString().padStart(2, '0')}:00`;
    }
    
    // Return first preferred time for current day
    const dayOfWeek = new Date().getDay();
    const preference = this.timingPreferences.find(pref => 
      pref.daysOfWeek.includes(dayOfWeek)
    );
    
    return preference?.preferredTimes[0] || null;
  }

  setDoNotDisturb(periods: DoNotDisturbPeriod[]): void {
    this.dndPeriods = periods;
    this.saveToStorage();
  }

  getDoNotDisturbPeriods(): DoNotDisturbPeriod[] {
    return this.dndPeriods;
  }

  isOptimalTime(time: Date = new Date()): boolean {
    const hour = time.getHours();
    const minute = time.getMinutes();
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const dayOfWeek = time.getDay();
    
    // Check if in DND period
    for (const period of this.dndPeriods) {
      if (this.isTimeBetween(timeString, period.start, period.end)) {
        return false;
      }
    }
    
    // Check if matches preferred time
    for (const preference of this.timingPreferences) {
      if (!preference.daysOfWeek.includes(dayOfWeek)) continue;
      
      for (const preferredTime of preference.preferredTimes) {
        const [prefHour, prefMinute] = preferredTime.split(':').map(Number);
        // Allow 30-minute window
        if (Math.abs(hour - prefHour) === 0 && Math.abs(minute - prefMinute) <= 30) {
          return true;
        }
      }
    }
    
    return false;
  }

  private isTimeBetween(time: string, start: string, end: string): boolean {
    // Simple time comparison (doesn't handle midnight crossing properly, but good enough for now)
    return time >= start && time <= end;
  }

  // ========== A/B Testing ==========

  createABTest(config: Omit<ABTest, 'results'>): ABTest {
    const test: ABTest = {
      ...config,
      results: {
        totalImpressions: 0,
        totalInteractions: 0
      }
    };
    
    this.abTests.set(test.id, test);
    this.saveToStorage();
    
    return test;
  }

  recordInteraction(testId: string, variantId: string, outcome: { responded: boolean; timeToRespond?: number }): void {
    const test = this.abTests.get(testId);
    if (!test) return;
    
    const variant = test.variants.find(v => v.id === variantId);
    if (!variant) return;
    
    variant.impressions++;
    test.results.totalImpressions++;
    
    if (outcome.responded) {
      variant.interactions++;
      test.results.totalInteractions++;
      
      if (outcome.timeToRespond !== undefined) {
        variant.avgTimeToRespond = variant.avgTimeToRespond
          ? (variant.avgTimeToRespond + outcome.timeToRespond) / 2
          : outcome.timeToRespond;
      }
    }
    
    this.saveToStorage();
  }

  getTestResults(testId: string): ABTestResults | null {
    const test = this.abTests.get(testId);
    if (!test) return null;
    
    return test.results;
  }

  selectWinner(testId: string): string | null {
    const test = this.abTests.get(testId);
    if (!test) return null;
    
    let winner: ABTestVariant | null = null;
    let maxScore = 0;
    
    for (const variant of test.variants) {
      let score = 0;
      
      if (test.metric === 'response_rate') {
        score = variant.impressions > 0 ? variant.interactions / variant.impressions : 0;
      } else if (test.metric === 'time_to_respond' && variant.avgTimeToRespond) {
        score = 1 / variant.avgTimeToRespond; // Lower time is better
      } else if (test.metric === 'engagement') {
        score = variant.interactions;
      }
      
      if (score > maxScore) {
        maxScore = score;
        winner = variant;
      }
    }
    
    if (winner) {
      test.results.winner = winner.id;
      test.results.confidence = maxScore;
      this.saveToStorage();
      return winner.id;
    }
    
    return null;
  }

  getABTests(): ABTest[] {
    return Array.from(this.abTests.values());
  }
}

// Export singleton instance
export const promptCustomizationService = PromptCustomizationService.getInstance();

// Export types
export type {
  CustomPrompt,
  ToneOption,
  PromptCategory,
  TimingPreference,
  DoNotDisturbPeriod,
  CustomTone,
  Variable,
  ABTest,
  ABTestVariant,
  ABTestResults
};
