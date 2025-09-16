/**
 * Hook for emotional validation functionality
 */

import { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Shield, 
  Sun, 
  Moon, 
  CloudRain,
  Feather,
  Star,
  Target
} from 'lucide-react';

interface EmotionalState {
  feeling: string;
  intensity: number;
  painRelated: boolean;
  needsSupport: boolean;
  timestamp: Date;
}

interface ValidationResponse {
  message: string;
  supportType: 'acknowledgment' | 'encouragement' | 'practical' | 'celebration';
  icon: React.ComponentType;
  actionSuggestions?: string[];
  affirmations?: string[];
}

// Emotional validation responses based on different scenarios
const validationResponses = {
  highPain: [
    {
      message: "I see you're experiencing significant pain right now. Your courage in tracking this shows incredible strength.",
      supportType: 'acknowledgment' as const,
      icon: Shield,
      affirmations: [
        "Your pain is real and valid",
        "You're doing your best with what you have",
        "This moment doesn't define your entire day"
      ],
      actionSuggestions: [
        "Try a gentle breathing exercise",
        "Consider your comfort kit strategies",
        "Remember: it's okay to rest"
      ]
    },
    {
      message: "High pain days are tough, and you're tougher. Thank you for taking care of yourself by tracking this.",
      supportType: 'encouragement' as const,
      icon: Heart,
      affirmations: [
        "You're resilient and strong",
        "Every small step counts",
        "You deserve compassion, especially from yourself"
      ]
    }
  ],
  struggling: [
    {
      message: "It sounds like you're having a difficult time right now. Your feelings are completely valid and understandable.",
      supportType: 'acknowledgment' as const,
      icon: CloudRain,
      affirmations: [
        "It's okay to have hard days",
        "Your struggles don't make you weak",
        "You've overcome challenges before"
      ],
      actionSuggestions: [
        "Reach out to someone you trust",
        "Try one small comfort activity",
        "Remember your coping strategies"
      ]
    },
    {
      message: "Struggling doesn't mean you're failing. It means you're human, and you're doing something incredibly difficult.",
      supportType: 'encouragement' as const,
      icon: Feather,
      affirmations: [
        "You don't have to be perfect",
        "Progress isn't always linear",
        "You're worthy of support and care"
      ]
    }
  ],
  smallVictory: [
    {
      message: "Look at you go! What might seem small to others is actually huge when you're managing pain. I'm proud of you.",
      supportType: 'celebration' as const,
      icon: Star,
      affirmations: [
        "Your efforts matter",
        "Small victories are still victories",
        "You're making progress in your own way"
      ]
    },
    {
      message: "Every positive step you take is worth celebrating. You're building strength and resilience with each choice.",
      supportType: 'encouragement' as const,
      icon: Sparkles,
      affirmations: [
        "You're capable of amazing things",
        "Your persistence is inspiring",
        "You deserve to feel proud"
      ]
    }
  ],
  consistentTracking: [
    {
      message: "Your consistency in tracking shows incredible self-awareness and dedication to your wellbeing. That's remarkable.",
      supportType: 'celebration' as const,
      icon: Target,
      affirmations: [
        "Consistency is a form of self-love",
        "You're learning about yourself",
        "This data helps you and your care team"
      ]
    }
  ],
  lowPainDay: [
    {
      message: "A lower pain day - what a gift! I hope you're able to enjoy this moment and be gentle with yourself.",
      supportType: 'celebration' as const,
      icon: Sun,
      affirmations: [
        "You deserve these good moments",
        "It's okay to feel hopeful",
        "Your body is working with you today"
      ],
      actionSuggestions: [
        "Do something that brings you joy",
        "Connect with someone you care about",
        "Store up this positive energy"
      ]
    }
  ],
  eveningReflection: [
    {
      message: "You made it through another day, and that's worth acknowledging. Your perseverance is remarkable.",
      supportType: 'acknowledgment' as const,
      icon: Moon,
      affirmations: [
        "You did your best today",
        "Rest is earned and deserved",
        "Tomorrow is a new opportunity"
      ]
    }
  ]
};

// Real-time emotional validation hook
export function useEmotionalValidation() {
  const [validationQueue, setValidationQueue] = useState<ValidationResponse[]>([]);
  const [currentEmotionalState, setCurrentEmotionalState] = useState<EmotionalState | null>(null);

  const triggerValidation = (
    context: 'pain-spike' | 'struggling' | 'victory' | 'consistency' | 'low-pain' | 'evening'
  ) => {
    let responses: ValidationResponse[] = [];
    
    switch (context) {
      case 'pain-spike':
        responses = validationResponses.highPain;
        break;
      case 'struggling':
        responses = validationResponses.struggling;
        break;
      case 'victory':
        responses = validationResponses.smallVictory;
        break;
      case 'consistency':
        responses = validationResponses.consistentTracking;
        break;
      case 'low-pain':
        responses = validationResponses.lowPainDay;
        break;
      case 'evening':
        responses = validationResponses.eveningReflection;
        break;
    }

    if (responses.length > 0) {
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setValidationQueue(prev => [...prev, randomResponse]);
    }
  };

  const processNextValidation = () => {
    if (validationQueue.length > 0) {
      const [next, ...rest] = validationQueue;
      setValidationQueue(rest);
      return next;
    }
    return null;
  };

  const recordEmotionalState = (state: EmotionalState) => {
    setCurrentEmotionalState(state);
    
    // Auto-trigger appropriate validation
    if (state.needsSupport) {
      triggerValidation('struggling');
    } else if (state.intensity <= 3 && !state.painRelated) {
      triggerValidation('victory');
    }
  };

  return {
    triggerValidation,
    processNextValidation,
    recordEmotionalState,
    currentEmotionalState,
    hasQueuedValidation: validationQueue.length > 0
  };
}

export type { EmotionalState, ValidationResponse };
