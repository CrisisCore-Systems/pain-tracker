/**
 * Voice Command Service
 * Central dispatcher for voice commands with full action execution
 * 
 * This service handles:
 * - Natural language parsing for pain levels and commands
 * - Command matching against registered voice commands
 * - Action execution through callbacks
 * - Audio feedback for command confirmation
 */

import { VoiceCommand, EMERGENCY_VOICE_COMMANDS } from '../components/accessibility/CrisisStateTypes';

// ============================================================================
// Speech Synthesis Configuration Constants
// ============================================================================
const SPEECH_FEEDBACK_CONFIG = {
  normalVolume: 0.6,
  emergencyVolume: 0.8,
  normalRate: 1.1,
  emergencyRate: 1.0,
  normalPitch: 1.0,
  emergencyPitch: 1.1,
} as const;

// Voice command action types
export type VoiceCommandAction =
  | 'set_pain_level'
  | 'navigate_back'
  | 'navigate_forward'
  | 'activate_emergency_mode'
  | 'call_primary_contact'
  | 'emergency_save'
  | 'activate_simple_mode'
  | 'enable_voice_guidance'
  | 'activate_break_mode'
  | 'start_breathing_exercise'
  | 'save_entry'
  | 'cancel_entry'
  | 'add_location'
  | 'add_symptom'
  | 'read_summary'
  | 'help'
  | 'unknown';

// Command result type
export interface VoiceCommandResult {
  success: boolean;
  action: VoiceCommandAction;
  parameters?: Record<string, unknown>;
  feedback?: string;
  isEmergency?: boolean;
}

// Command handler type
export type VoiceCommandHandler = (
  action: VoiceCommandAction,
  parameters?: Record<string, unknown>
) => void | Promise<void>;

// Natural language patterns for pain level parsing
const PAIN_LEVEL_PATTERNS = [
  // Direct number statements
  /(?:my\s+)?pain\s+(?:level\s+)?(?:is|at|feels?\s+like)\s*(\d+)/i,
  /(?:it'?s?\s+)?(?:a\s+)?(\d+)\s*(?:out\s+of\s+10|\/10)?/i,
  /(?:level|rate|rating)\s*(?:is\s+)?(\d+)/i,
  /(?:set|make)\s+(?:it|pain)\s+(?:to\s+)?(\d+)/i,
  // Word-based levels
  /(?:no\s+pain|pain\s*free|zero\s+pain)/i, // 0
  /(?:very\s+mild|barely\s+noticeable|minimal)/i, // 1
  /(?:mild|slight|minor)/i, // 2-3
  /(?:uncomfortable|annoying)/i, // 4
  /(?:moderate|medium)/i, // 5
  /(?:distracting|interfering)/i, // 6
  /(?:distressing|hard\s+to\s+focus)/i, // 7
  /(?:intense|strong|significant)/i, // 8
  /(?:very\s+intense|severe|extreme)/i, // 9
  /(?:unbearable|worst|can'?t\s+function)/i, // 10
];

// Word to number mapping for pain levels
// Note: These are stored as key-value pairs but we sort by phrase length
// during matching to ensure longer phrases (like "very mild") are matched
// before shorter substrings (like "mild")
const WORD_TO_PAIN_LEVEL: Record<string, number> = {
  'no pain': 0,
  'pain free': 0,
  'zero pain': 0,
  'very mild': 1,
  'barely noticeable': 1,
  'minimal': 1,
  'mild': 2,
  'slight': 2,
  'minor': 3,
  'uncomfortable': 4,
  'annoying': 4,
  'moderate': 5,
  'medium': 5,
  'distracting': 6,
  'interfering': 6,
  'distressing': 7,
  'hard to focus': 7,
  'very intense': 9,  // Must come before 'intense' to match correctly
  'intense': 8,
  'strong': 8,
  'significant': 8,
  'severe': 9,
  'extreme': 9,
  'unbearable': 10,
  'worst': 10,
  "can't function": 10,
};

// Pre-sorted array of pain level phrases by length (longest first)
// This ensures "very mild" is matched before "mild"
const SORTED_PAIN_PHRASES = Object.entries(WORD_TO_PAIN_LEVEL)
  .sort(([a], [b]) => b.length - a.length);

// Location keywords for body part recognition
const LOCATION_KEYWORDS: Record<string, string[]> = {
  'Lower back': ['lower back', 'lumbar', 'low back'],
  'Upper back': ['upper back', 'thoracic', 'shoulder blade area'],
  'Neck': ['neck', 'cervical'],
  'Head': ['head', 'headache', 'temple', 'forehead'],
  'Shoulder (L)': ['left shoulder', 'l shoulder'],
  'Shoulder (R)': ['right shoulder', 'r shoulder'],
  'Wrist (L)': ['left wrist', 'l wrist'],
  'Wrist (R)': ['right wrist', 'r wrist'],
  'Hip (L)': ['left hip', 'l hip'],
  'Hip (R)': ['right hip', 'r hip'],
  'Knee (L)': ['left knee', 'l knee'],
  'Knee (R)': ['right knee', 'r knee'],
  'Ankle (L)': ['left ankle', 'l ankle'],
  'Ankle (R)': ['right ankle', 'r ankle'],
  'Abdomen': ['abdomen', 'stomach', 'belly', 'gut'],
};

// Symptom keywords
const SYMPTOM_KEYWORDS: Record<string, string[]> = {
  'Aching': ['aching', 'achy', 'ache'],
  'Sharp': ['sharp', 'stabbing', 'piercing'],
  'Dull ache': ['dull', 'dull ache'],
  'Burning': ['burning', 'burn', 'hot'],
  'Throbbing': ['throbbing', 'pulsing', 'pounding'],
  'Tingling': ['tingling', 'pins and needles', 'prickling'],
  'Numbness': ['numb', 'numbness', 'dead feeling'],
  'Stiffness': ['stiff', 'stiffness', 'tight', 'tightness'],
  'Weakness': ['weak', 'weakness', 'giving out'],
  'Cramping': ['cramping', 'cramp', 'spasm'],
};

/**
 * Parse natural language to extract pain level
 */
export function parsePainLevel(transcript: string): number | null {
  const normalizedText = transcript.toLowerCase().trim();

  // Try numeric patterns first
  for (const pattern of PAIN_LEVEL_PATTERNS.slice(0, 4)) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      const level = parseInt(match[1], 10);
      if (level >= 0 && level <= 10) {
        return level;
      }
    }
  }

  // Try word-based matching using sorted phrases (longest first)
  // This ensures "very mild" is matched before "mild"
  for (const [phrase, level] of SORTED_PAIN_PHRASES) {
    if (normalizedText.includes(phrase)) {
      return level;
    }
  }

  return null;
}

/**
 * Parse transcript to extract mentioned body locations
 */
export function parseLocations(transcript: string): string[] {
  const normalizedText = transcript.toLowerCase().trim();
  const foundLocations: string[] = [];

  for (const [location, keywords] of Object.entries(LOCATION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword)) {
        if (!foundLocations.includes(location)) {
          foundLocations.push(location);
        }
        break;
      }
    }
  }

  return foundLocations;
}

/**
 * Parse transcript to extract mentioned symptoms
 */
export function parseSymptoms(transcript: string): string[] {
  const normalizedText = transcript.toLowerCase().trim();
  const foundSymptoms: string[] = [];

  for (const [symptom, keywords] of Object.entries(SYMPTOM_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword)) {
        if (!foundSymptoms.includes(symptom)) {
          foundSymptoms.push(symptom);
        }
        break;
      }
    }
  }

  return foundSymptoms;
}

/**
 * Extended voice commands including pain-specific commands
 */
export const EXTENDED_VOICE_COMMANDS: VoiceCommand[] = [
  ...EMERGENCY_VOICE_COMMANDS,
  // Pain entry commands
  {
    phrase: 'save entry',
    aliases: ['save', 'done', 'submit', 'finish'],
    action: 'save_entry',
    emergencyCommand: false,
    requiresConfirmation: false,
  },
  {
    phrase: 'cancel',
    aliases: ['cancel entry', 'discard', 'nevermind', 'never mind'],
    action: 'cancel_entry',
    emergencyCommand: false,
    requiresConfirmation: true,
  },
  {
    phrase: 'read summary',
    aliases: ['what did I enter', 'summary', 'review', 'read back'],
    action: 'read_summary',
    emergencyCommand: false,
    requiresConfirmation: false,
  },
  {
    phrase: 'help',
    aliases: ['what can I say', 'commands', 'voice commands', 'options'],
    action: 'help',
    emergencyCommand: false,
    requiresConfirmation: false,
  },
  {
    phrase: 'next',
    aliases: ['continue', 'next step', 'go forward', 'forward'],
    action: 'navigate_forward',
    emergencyCommand: false,
    requiresConfirmation: false,
  },
];

/**
 * Voice Command Service class
 * Central dispatcher for voice command processing and execution
 */
export class VoiceCommandService {
  private commands: VoiceCommand[];
  private handler: VoiceCommandHandler | null = null;
  private voiceFeedbackEnabled: boolean = true;

  constructor(commands: VoiceCommand[] = EXTENDED_VOICE_COMMANDS) {
    this.commands = commands;
  }

  /**
   * Register a handler for command execution
   */
  setHandler(handler: VoiceCommandHandler): void {
    this.handler = handler;
  }

  /**
   * Enable or disable voice feedback
   */
  setVoiceFeedbackEnabled(enabled: boolean): void {
    this.voiceFeedbackEnabled = enabled;
  }

  /**
   * Provide audio feedback for a command
   */
  private provideFeedback(message: string, isEmergency: boolean = false): void {
    if (!this.voiceFeedbackEnabled) return;
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.volume = isEmergency 
      ? SPEECH_FEEDBACK_CONFIG.emergencyVolume 
      : SPEECH_FEEDBACK_CONFIG.normalVolume;
    utterance.rate = isEmergency 
      ? SPEECH_FEEDBACK_CONFIG.emergencyRate 
      : SPEECH_FEEDBACK_CONFIG.normalRate;
    utterance.pitch = isEmergency 
      ? SPEECH_FEEDBACK_CONFIG.emergencyPitch 
      : SPEECH_FEEDBACK_CONFIG.normalPitch;
    
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Process a voice transcript and execute matching command
   */
  processTranscript(transcript: string): VoiceCommandResult {
    const normalizedTranscript = transcript.toLowerCase().trim();

    // First, check for pain level in the transcript
    const painLevel = parsePainLevel(transcript);
    if (painLevel !== null) {
      const result: VoiceCommandResult = {
        success: true,
        action: 'set_pain_level',
        parameters: { level: painLevel },
        feedback: `Setting pain level to ${painLevel}`,
        isEmergency: false,
      };

      this.provideFeedback(result.feedback!);
      this.executeAction(result.action, result.parameters);
      return result;
    }

    // Check for location mentions
    const locations = parseLocations(transcript);
    if (locations.length > 0 && !this.isCommandMatch(normalizedTranscript)) {
      const result: VoiceCommandResult = {
        success: true,
        action: 'add_location',
        parameters: { locations },
        feedback: `Adding location${locations.length > 1 ? 's' : ''}: ${locations.join(', ')}`,
        isEmergency: false,
      };

      this.provideFeedback(result.feedback!);
      this.executeAction(result.action, result.parameters);
      return result;
    }

    // Check for symptom mentions
    const symptoms = parseSymptoms(transcript);
    if (symptoms.length > 0 && !this.isCommandMatch(normalizedTranscript)) {
      const result: VoiceCommandResult = {
        success: true,
        action: 'add_symptom',
        parameters: { symptoms },
        feedback: `Adding symptom${symptoms.length > 1 ? 's' : ''}: ${symptoms.join(', ')}`,
        isEmergency: false,
      };

      this.provideFeedback(result.feedback!);
      this.executeAction(result.action, result.parameters);
      return result;
    }

    // Match against registered commands
    const matchingCommand = this.commands.find(
      cmd =>
        cmd.phrase.toLowerCase() === normalizedTranscript ||
        cmd.aliases.some(alias => alias.toLowerCase() === normalizedTranscript)
    );

    if (matchingCommand) {
      const result: VoiceCommandResult = {
        success: true,
        action: matchingCommand.action as VoiceCommandAction,
        parameters: matchingCommand.parameters,
        feedback: matchingCommand.emergencyCommand
          ? `Emergency action: ${matchingCommand.phrase}`
          : `${matchingCommand.phrase}`,
        isEmergency: matchingCommand.emergencyCommand,
      };

      this.provideFeedback(result.feedback!, result.isEmergency);
      this.executeAction(result.action, result.parameters);
      return result;
    }

    // Check for partial matches (fuzzy matching)
    const partialMatch = this.findPartialMatch(normalizedTranscript);
    if (partialMatch) {
      const result: VoiceCommandResult = {
        success: true,
        action: partialMatch.action as VoiceCommandAction,
        parameters: partialMatch.parameters,
        feedback: `${partialMatch.phrase}`,
        isEmergency: partialMatch.emergencyCommand,
      };

      this.provideFeedback(result.feedback!, result.isEmergency);
      this.executeAction(result.action, result.parameters);
      return result;
    }

    // No match found
    return {
      success: false,
      action: 'unknown',
      feedback: "Sorry, I didn't understand that command.",
    };
  }

  /**
   * Check if transcript matches any command
   */
  private isCommandMatch(normalizedTranscript: string): boolean {
    return this.commands.some(
      cmd =>
        cmd.phrase.toLowerCase() === normalizedTranscript ||
        cmd.aliases.some(alias => alias.toLowerCase() === normalizedTranscript)
    );
  }

  /**
   * Find partial/fuzzy match for transcript
   */
  private findPartialMatch(normalizedTranscript: string): VoiceCommand | null {
    // Check if transcript contains command phrase or alias
    for (const cmd of this.commands) {
      if (normalizedTranscript.includes(cmd.phrase.toLowerCase())) {
        return cmd;
      }
      for (const alias of cmd.aliases) {
        if (normalizedTranscript.includes(alias.toLowerCase())) {
          return cmd;
        }
      }
    }
    return null;
  }

  /**
   * Execute the action through the registered handler
   */
  private executeAction(action: VoiceCommandAction, parameters?: Record<string, unknown>): void {
    if (this.handler) {
      this.handler(action, parameters);
    }
  }

  /**
   * Get available commands for help display
   */
  getAvailableCommands(): { phrase: string; description: string; isEmergency: boolean }[] {
    return this.commands.map(cmd => ({
      phrase: cmd.phrase,
      description: cmd.aliases.length > 0 
        ? `Also: "${cmd.aliases.slice(0, 2).join('", "')}"`
        : '',
      isEmergency: cmd.emergencyCommand,
    }));
  }

  /**
   * Get help text for voice commands
   */
  getHelpText(): string {
    const regularCommands = this.commands.filter(c => !c.emergencyCommand);
    const emergencyCommands = this.commands.filter(c => c.emergencyCommand);

    let helpText = 'Available voice commands: ';
    helpText += regularCommands.map(c => c.phrase).join(', ');
    
    if (emergencyCommands.length > 0) {
      helpText += '. Emergency commands: ';
      helpText += emergencyCommands.map(c => c.phrase).join(', ');
    }

    helpText += '. You can also say your pain level, like "my pain is 7" or "moderate pain".';

    return helpText;
  }
}

// Singleton instance for app-wide use
export const voiceCommandService = new VoiceCommandService();

export default voiceCommandService;
