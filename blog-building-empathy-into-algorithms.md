---
title: "Building Empathy into Algorithms: Lessons from Pain Tracker Development"
seoTitle: "How to Build Trauma-Informed Software with Empathetic Algorithms"
seoDescription: "Learn how incorporating user feedback loops and trauma-informed design creates more effective health tools. Real code examples from Pain Tracker development."
datePublished: Mon Dec 01 2025 20:00:00 GMT+0000 (Coordinated Universal Time)
slug: building-empathy-into-algorithms-pain-tracker-lessons
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1764620000000/empathy-algorithms-cover.png
tags: ux, accessibility, typescript, healthcare, trauma-informed, user-experience, empathy, mental-health

---

# Building Empathy into Algorithms: Lessons from Pain Tracker Development

"Your app feels like it actually understands what I'm going through."

That single piece of user feedback made eighteen months of painstaking development worth it. Not because we had achieved some magical AI breakthrough—we hadn't. We'd simply done something most tech companies consider impossible: **we built software that treats humans like humans**.

When I started building [Pain Tracker](https://paintracker.ca), I thought the hard part would be the encryption, the offline storage, the clinical export formats. Those were challenging, sure. But the real engineering challenge? Teaching an algorithm to respond with kindness.

Here's what I learned about building empathy into code—with real examples you can adapt for your own projects.

---

## The Problem: Most Health Apps Feel Like Interrogations

Open any mainstream health tracking app and you'll notice something immediately: they treat you like a data source, not a person.

- "Rate your pain 1-10" (cold, clinical)
- "You missed yesterday's entry" (guilt-inducing)
- "Your average pain increased 15%" (anxiety-provoking)
- "Share with your doctor?" (before you're ready)

For someone already struggling with chronic pain—often accompanied by anxiety, depression, trauma, and medical gaslighting—these interactions can be actively harmful.

**The questions we asked ourselves:**

1. How do we collect necessary health data without making users feel interrogated?
2. How do we present analytics without inducing anxiety?
3. How do we support users during crisis moments without being intrusive?
4. How do we celebrate progress without diminishing struggles?

The answers required rethinking every interaction from the ground up.

---

## Principle 1: Emotional Validation Before Data Collection

Most apps jump straight to "What's your pain level?" We took a different approach: **acknowledge the human before asking for data**.

### The Emotional Validation Hook

We built a validation system that provides contextual emotional support based on what the user is experiencing:

```typescript
// From src/components/accessibility/useEmotionalValidation.ts

interface ValidationResponse {
  message: string;
  supportType: 'acknowledgment' | 'encouragement' | 'practical' | 'celebration';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  affirmations?: string[];
  actionSuggestions?: string[];
}

const validationResponses = {
  highPain: [
    {
      message: "I see you're experiencing significant pain right now. " +
               "Your courage in tracking this shows incredible strength.",
      supportType: 'acknowledgment',
      icon: Shield,
      affirmations: [
        'Your pain is real and valid',
        "You're doing your best with what you have",
        "This moment doesn't define your entire day",
      ],
      actionSuggestions: [
        'Try a gentle breathing exercise',
        'Consider your comfort kit strategies',
        "Remember: it's okay to rest",
      ],
    },
  ],
  
  struggling: [
    {
      message: "It sounds like you're having a difficult time right now. " +
               "Your feelings are completely valid and understandable.",
      supportType: 'acknowledgment',
      icon: CloudRain,
      affirmations: [
        "It's okay to have hard days",
        "Your struggles don't make you weak",
        "You've overcome challenges before",
      ],
    },
  ],
  
  smallVictory: [
    {
      message: "Look at you go! What might seem small to others " +
               "is actually huge when you're managing pain. I'm proud of you.",
      supportType: 'celebration',
      icon: Star,
      affirmations: [
        'Your efforts matter',
        'Small victories are still victories',
        "You're making progress in your own way",
      ],
    },
  ],
};
```

### How It Works in Practice

The hook integrates into components and triggers contextually:

```typescript
export function useEmotionalValidation() {
  const [validationQueue, setValidationQueue] = useState<ValidationResponse[]>([]);

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
      // ... more contexts
    }

    if (responses.length > 0) {
      // Random selection prevents responses from feeling robotic
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setValidationQueue(prev => [...prev, randomResponse]);
    }
  };

  return { triggerValidation, /* ... */ };
}
```

**Key insight**: We provide *multiple* possible responses for each context, randomly selected. This prevents the app from feeling scripted. The third time you log high pain, you don't get the exact same message—because a caring friend wouldn't say the exact same thing either.

---

## Principle 2: Trauma-Informed Preferences That Actually Adapt

"Trauma-informed" has become a buzzword. We tried to make it mean something real: **the app adapts its behavior based on what the user needs, not what we think looks good**.

### The Preferences System

We built a comprehensive preferences framework that lets users control their experience:

```typescript
// From src/components/accessibility/TraumaInformedTypes.ts

export interface TraumaInformedPreferences {
  // Cognitive Support
  simplifiedMode: boolean;        // Reduce interface complexity
  showMemoryAids: boolean;        // Help with "fibro fog"
  autoSave: boolean;              // Don't lose work during brain fog
  showProgress: boolean;          // Visual progress indicators
  adaptiveComplexity: boolean;    // Auto-adjust based on behavior

  // Emotional Safety
  gentleLanguage: boolean;        // Empathetic vs clinical language
  hideDistressingContent: boolean; // Content warnings
  showComfortPrompts: boolean;    // Breathing exercises, etc.
  enableContentWarnings: boolean;
  contentWarningLevel: 'minimal' | 'standard' | 'comprehensive';

  // Crisis Support
  enableCrisisDetection: boolean;
  crisisDetectionSensitivity: 'low' | 'medium' | 'high';
  showCrisisResources: boolean;

  // Progressive Disclosure
  enableProgressiveDisclosure: boolean;
  defaultDisclosureLevel: 'essential' | 'helpful' | 'advanced' | 'expert';
  adaptiveDisclosure: boolean;    // Learn from user behavior
}
```

### Hooks That Make Preferences Usable

Rather than checking preferences everywhere, we created specialized hooks:

```typescript
// From src/components/accessibility/TraumaInformedHooks.ts

export function useEmotionalSafety() {
  const { preferences } = useTraumaInformed();

  return useMemo(() => ({
    /** Whether to use gentle, empathetic language */
    useGentleLanguage: preferences.gentleLanguage,
    
    /** Whether to show comfort prompts during difficult moments */
    showComfortPrompts: preferences.showComfortPrompts,
    
    /** Helper to get appropriate message based on gentle language setting */
    getMessage: (gentle: string, standard: string) =>
      preferences.gentleLanguage ? gentle : standard,
  }), [preferences]);
}

// Usage in a component:
function PainLevelLabel({ level }: { level: number }) {
  const { getMessage } = useEmotionalSafety();
  
  if (level >= 8) {
    return getMessage(
      "You're experiencing significant discomfort right now",  // gentle
      "Pain level: severe"  // standard
    );
  }
  // ...
}
```

**Key insight**: We don't force gentle language on everyone. Some users—especially those with medical backgrounds or who've been dismissed by providers—*want* clinical language. They feel patronized by gentle phrasing. The preference system respects that.

---

## Principle 3: Progressive Disclosure for Cognitive Load Management

People with chronic pain often experience cognitive symptoms—"fibro fog," medication side effects, exhaustion. We designed the interface to reveal information gradually based on what users can handle.

### The Progressive Disclosure Component

```typescript
// From src/components/accessibility/ProgressiveDisclosurePatterns.tsx

interface ProgressiveDisclosureProps {
  title: string;
  level: 'essential' | 'helpful' | 'advanced' | 'expert';
  children: React.ReactNode;
  memoryAid?: string;
  estimatedTime?: number;
  cognitiveLoad?: 'minimal' | 'moderate' | 'high' | 'overwhelming';
}

const levelConfig = {
  essential: {
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    priority: 1,
    description: 'Core information you need',
  },
  helpful: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    priority: 2,
    description: 'Additional context that may help',
  },
  advanced: {
    icon: Layers,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    priority: 3,
    description: 'Detailed information for deeper understanding',
  },
  expert: {
    icon: Brain,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    priority: 4,
    description: 'Technical details and comprehensive options',
  },
};

export function ProgressiveDisclosure({
  title,
  level,
  children,
  cognitiveLoad,
  // ...
}: ProgressiveDisclosureProps) {
  const { preferences } = useTraumaInformed();
  
  // Auto-hide advanced content in simplified mode
  const shouldShow = !preferences.simplifiedMode || 
                     level === 'essential' || 
                     level === 'helpful';

  if (!shouldShow) return null;

  return (
    <div className={`rounded-lg border ${levelConfig[level].bgColor}`}>
      <DisclosureHeader /* ... */ />
      {isOpen && (
        <div className="p-4">
          {cognitiveLoad && (
            <CognitiveLoadIndicator 
              level={cognitiveLoad}
              description={`This section contains complex information`}
            />
          )}
          {children}
        </div>
      )}
    </div>
  );
}
```

### Real-World Application

When a user is in "simplified mode" (either by choice or triggered by crisis detection), the interface automatically hides advanced options:

```tsx
<ProgressiveDisclosure title="Basic Pain Entry" level="essential">
  {/* Always visible: pain scale, primary location */}
</ProgressiveDisclosure>

<ProgressiveDisclosure title="Additional Details" level="helpful">
  {/* Hidden in simplified mode: triggers, notes */}
</ProgressiveDisclosure>

<ProgressiveDisclosure title="Advanced Tracking" level="advanced">
  {/* Hidden by default: multiple locations, symptom correlations */}
</ProgressiveDisclosure>
```

**Key insight**: Information hierarchy isn't just about UI design—it's about respecting cognitive bandwidth. On a bad pain day, users might only have capacity for the essentials. The interface should adapt to that reality.

---

## Principle 4: Crisis Detection Without Surveillance

Here's where things get technically interesting. We wanted to detect when users might be in crisis and offer support—but without the surveillance that most "crisis detection" systems rely on.

### The Detection Algorithm

Our crisis detection runs entirely in the browser, using only information the user has already provided:

```typescript
// Simplified from src/components/accessibility/useCrisisDetection.ts

interface StressIndicators {
  painLevel: number;           // From current/recent pain entries
  cognitiveLoad: number;       // Calculated from behavior patterns
  inputErraticBehavior: number; // Rapid clicking, form errors
  errorRate: number;           // Recent mistakes
  frustrationMarkers: number;  // Back button, help requests
}

const calculateOverallStress = (indicators: StressIndicators): number => {
  // Weighted combination - weights are transparent and adjustable
  return (
    (indicators.painLevel / 10) * 0.3 +      // 30% weight
    indicators.cognitiveLoad * 0.25 +         // 25% weight
    indicators.inputErraticBehavior * 0.2 +   // 20% weight
    indicators.errorRate * 0.15 +             // 15% weight
    indicators.frustrationMarkers * 0.1       // 10% weight
  );
};

// Determine crisis severity
const getSeverity = (stress: number) => {
  if (stress >= 0.8) return 'critical';
  if (stress >= 0.6) return 'severe';
  if (stress >= 0.4) return 'moderate';
  if (stress >= 0.2) return 'mild';
  return 'none';
};
```

### Response: Adaptation, Not Alerts

Here's the crucial difference from mainstream approaches: **we don't alert anyone**. We don't send data anywhere. We don't even show scary crisis warnings.

Instead, the app quietly adapts:

```typescript
const activateEmergencyMode = useCallback(() => {
  updatePreferences({
    simplifiedMode: true,           // Reduce cognitive overload
    showMemoryAids: true,           // Help with brain fog
    autoSave: true,                 // Don't lose work
    touchTargetSize: 'extra-large', // Easier when shaky
    confirmationLevel: 'high',      // Prevent accidental clicks
    showComfortPrompts: true,       // Breathing exercises
    showProgress: true,             // Reduce anxiety
  });
}, [updatePreferences]);
```

The interface becomes more forgiving. The language gets softer. Crisis resources appear (for the user only). **No notifications to anyone else. No data leaving the device.**

**Key insight**: Most crisis detection systems are built for observers (hospitals, family members, platforms). We built ours for the person experiencing the crisis. That's a fundamentally different design philosophy.

---

## Principle 5: The Empathy Intelligence Engine

This is where we went deep. We built an entire analytics system designed around empathy rather than pure metrics.

### Beyond Pain Scores

Traditional pain tracking apps give you charts that show your pain going up and down. That's... not helpful for most people. So we built something different:

```typescript
// From src/services/EmpathyDrivenAnalytics.ts

export interface DignityPreservingReport {
  userDefinedSuccess: string[];    // What success means to THIS user
  strengthsBased: {
    resilience: string[];          // Evidence of resilience
    resourcefulness: string[];     // Creative coping strategies
    wisdom: string[];              // Insights gained
    courage: string[];             // Difficult things faced
  };
  growthOriented: {
    learnings: string[];           // New understanding
    adaptations: string[];         // Successful adjustments
    newSkills: string[];           // Developed capabilities
    perspectives: string[];        // Shifted viewpoints
  };
  personCentered: {
    values: string[];              // What matters to user
    priorities: string[];          // Current focus areas
    preferences: string[];         // How they want to engage
    goals: string[];               // User-defined objectives
  };
}
```

### Quantified Empathy Metrics

The Empathy Intelligence Engine calculates metrics that actually matter to people in chronic pain:

```typescript
// From src/services/EmpathyIntelligenceEngine.ts

interface QuantifiedEmpathyMetrics {
  emotionalIntelligence: {
    selfAwareness: number;
    selfRegulation: number;
    motivation: number;
    empathy: number;
    socialSkills: number;
  };
  
  resilience: {
    hopefulness: number;
    postTraumaticGrowth: number;
    meaningMaking: number;
    adaptiveReframing: number;
    compassionFatigue: number;  // Tracks caregiver burnout
  };
  
  empathyKPIs: {
    validationReceived: number;   // Feeling understood
    validationGiven: number;      // Supporting others
    emotionalSupport: number;     // Support network engagement
    understandingFelt: number;    // Perceived understanding
    connectionQuality: number;    // Relationship quality
  };
}
```

### How It Works

The engine analyzes patterns in user entries—not through invasive monitoring, but through the data users voluntarily provide:

```typescript
// Simplified example of pattern detection

private calculateMeaningMaking(moodEntries: MoodEntry[]): number {
  if (moodEntries.length === 0) return 50;

  // Look for indicators of meaning-making in user notes
  const meaningIndicators = moodEntries.filter(entry =>
    entry.notes.toLowerCase().includes('learned') ||
    entry.notes.toLowerCase().includes('realized') ||
    entry.notes.toLowerCase().includes('understand now') ||
    entry.notes.toLowerCase().includes('purpose') ||
    entry.notes.toLowerCase().includes('growth')
  ).length;

  // Also consider stated coping strategies
  const growthCoping = moodEntries.filter(entry =>
    entry.copingStrategies.includes('journaling') ||
    entry.copingStrategies.includes('therapy') ||
    entry.copingStrategies.includes('meditation')
  ).length;

  return Math.min(
    100,
    50 + (meaningIndicators / moodEntries.length) * 30 + 
         (growthCoping / moodEntries.length) * 20
  );
}
```

**Key insight**: We're not trying to predict or diagnose. We're trying to reflect back to users the growth and resilience they might not see in themselves. People in chronic pain often feel like they're failing—the algorithm helps them see evidence of their strength.

---

## Principle 6: User Agency as a Core Feature

The final piece: making sure users feel in control of their experience at all times.

### The User Control Panel

```typescript
// From src/components/agency/UserAgencyComponents.tsx

export function UserControlPanel() {
  const { preferences, updatePreferences } = useTraumaInformed();
  const [activeTab, setActiveTab] = useState<
    'preferences' | 'goals' | 'data' | 'privacy'
  >('preferences');

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-800">
          <Crown className="w-5 h-5 mr-2" />
          You're in Control
        </CardTitle>
      </CardHeader>

      <CardContent>
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6">
          {[
            { id: 'preferences', label: 'Preferences', icon: Settings },
            { id: 'goals', label: 'My Goals', icon: Star },
            { id: 'data', label: 'My Data', icon: Shield },
            { id: 'privacy', label: 'Privacy', icon: Eye },
          ].map(tab => (
            <TabButton 
              key={tab.id} 
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              /* ... */
            />
          ))}
        </div>

        {/* Content renders based on activeTab */}
      </CardContent>
    </Card>
  );
}
```

### The Philosophy

Every empathy feature we built includes an off switch. Crisis detection? Adjustable sensitivity or fully disableable. Gentle language? Toggle it off if you prefer clinical terms. Comfort prompts? Optional.

**We don't know what's best for our users. They do.**

```typescript
// Privacy controls that actually give control

{activeTab === 'privacy' && (
  <div className="space-y-4">
    <div className="flex items-center text-green-700 bg-green-100 p-3 rounded-lg">
      <Eye className="w-4 h-4" />
      <span>Your privacy is paramount. You control what's shared and with whom.</span>
    </div>

    <div className="bg-white p-4 rounded-lg border">
      <h4 className="font-medium">Privacy Controls</h4>
      <div className="space-y-4">
        <label className="flex items-center justify-between">
          <div>
            <span className="font-medium">Share anonymized data for research</span>
            <p className="text-xs text-gray-600">Help improve pain management for others</p>
          </div>
          <Switch 
            checked={preferences.allowAnonymizedResearch}
            onChange={/* ... */}
          />
        </label>
        {/* More privacy controls */}
      </div>
    </div>
  </div>
)}
```

---

## The Feedback Loop: How Users Shaped Everything

None of this would work without constant user feedback. Here's our process:

### 1. Build With Users, Not For Them

Before writing code, we talked to chronic pain patients. We asked:
- What makes existing apps frustrating?
- When do you most need support?
- What language feels dismissive vs. supportive?
- What would make tracking feel less like a chore?

### 2. Test Emotional Responses

When testing new features, we didn't just ask "did this work?" We asked:
- How did this make you feel?
- Did any wording feel off?
- When would you NOT want to see this?

### 3. Iterate on Language Obsessively

The difference between "You missed yesterday's entry" and "We noticed you didn't track yesterday—no judgment, tracking when you can is what matters" isn't just tone. It's the difference between guilt and support. We tested every piece of user-facing text.

### 4. Build in Opt-Outs Everywhere

Every "smart" feature has an off switch. Because the moment software makes a decision someone didn't want, trust is broken.

---

## What We Learned

After eighteen months of building empathy into algorithms, here's what I know:

### Empathy is Not a Feature—It's Architecture

You can't bolt empathy onto a system designed for data extraction. It has to inform every decision: what data you collect, how you present it, what language you use, what happens when things go wrong.

### Transparency Builds Trust

Every algorithm in Pain Tracker is documented, open-source, and readable. Users can see exactly how crisis detection works. They can verify claims about local storage. Trust comes from verifiability, not promises.

### Users Know What They Need

The most successful features came from listening to users, not from our assumptions about what would help. "Simplified mode" came from a user describing fibro fog. The emotional validation system came from someone saying "I just want the app to acknowledge that this sucks."

### Technology Can Be Gentle

We've been trained to accept that software is cold, clinical, transactional. It doesn't have to be. With intentional design, code can feel like it understands—because it was built by people who listened.

---

## Try It Yourself

Pain Tracker is open source. Everything I've described is available for you to read, adapt, and build upon:

- **Live app**: [paintracker.ca](https://paintracker.ca)
- **GitHub**: [CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)

Key files to explore:
- `src/components/accessibility/TraumaInformedHooks.ts` - The preference system
- `src/components/accessibility/useEmotionalValidation.ts` - Emotional validation hook
- `src/components/accessibility/useCrisisDetection.ts` - Crisis detection logic
- `src/services/EmpathyIntelligenceEngine.ts` - The empathy analytics engine
- `src/components/accessibility/ProgressiveDisclosurePatterns.tsx` - Cognitive load management

If you're building something that touches human vulnerability—health apps, mental wellness tools, support platforms—I hope these patterns are useful. The world needs more software that treats people like people.

Questions? Find me on [GitHub](https://github.com/CrisisCore-Systems). I'm always happy to talk about building technology that actually serves the humans using it.

---

*Building software for vulnerable populations? The best feature you can add is respect. The best architecture is one that puts users in control. The best algorithm is one that knows when to step back and let humans be human.*
