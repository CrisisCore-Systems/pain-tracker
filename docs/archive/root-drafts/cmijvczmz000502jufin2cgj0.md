---
title: "I Built a Crisis-Detection Engine That Never Phones Home"
seoTitle: "How Pain Tracker Detects Crises Without Spying"
seoDescription: "Pain Tracker detects crises using only your device—never sends data, never spies. 100 % local, encrypted, open-source. Real code inside."
datePublished: Sat Nov 29 2025 05:47:03 GMT+0000 (Coordinated Universal Time)
cuid: cmijvczmz000502jufin2cgj0
slug: i-built-a-crisis-detection-engine-that-never-phones-home
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1764314379127/cf7d89c5-b846-415b-bdd7-992500592757.png
ogImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1764394821313/b090c279-d3b3-4a37-9197-f0fa5f172a2b.png

---

> **Try Pain Tracker →** [Start Tracking (Free & Private)](https://paintracker.ca)

# **Trauma-informed design left everyone asking: "How does it actually know I'm struggling without spying?"**

This answers it—with real code and real ethics.

---

## The Question That Keeps Me Up at Night

When I launched [Pain Tracker](https://paintracker.ca), the feedback from trauma survivors hit me like a truck:

> "Okay, but how does it detect a crisis... without sending my data somewhere?"

They weren't being paranoid. They were being smart. Most "wellness" apps that claim to detect distress? They're basically digital stalkers—harvesting your biometrics, tracking where you go, sending everything to some server farm for "analysis." For people who've already had their privacy violated, that's not healthcare—it's re-traumatization.

So I built something that felt impossible: a crisis-detection engine that runs entirely in your browser, keeps everything encrypted on your device, and **never phones home**.

Here's the messy, technical truth of how it actually works.

---

## The Architecture: Your Device, Your Data, Period

Pain Tracker is a Progressive Web App built with React 18 and TypeScript. The whole thing runs client-side—no exceptions. Your health data lives in **encrypted IndexedDB** storage on your device. Not on my servers. Not in some cloud database. Not anywhere I could peek even if I wanted to.

```typescript
export interface VaultIndexedDBRecord {
  v: 'xchacha20-poly1305';
  n: string;  // nonce
  c: string;  // cipher
  createdAt: string;
  keyVersion: string;
  metadata?: Record<string, unknown>;
}

export async function encryptAndStore(
  dbName: string,
  storeName: string,
  entryKey: string,
  value: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (!vaultService.isUnlocked()) {
    throw new Error('Vault must be unlocked before storing encrypted data.');
  }

  const db = await openDb(dbName, storeName);
  const encoder = new TextEncoder();
  const payload = encoder.encode(value);
  const { nonce, cipher } = vaultService.encryptBytes(payload);
  
  const record: VaultIndexedDBRecord = {
    v: 'xchacha20-poly1305',
    n: nonce,
    c: cipher,
    createdAt: new Date().toISOString(),
    keyVersion: vaultService.getStatus().metadata?.version ?? 'unknown',
    metadata,
  };
  // ... stored locally, never transmitted
}
```

Every pain entry gets encrypted with XChaCha20-Poly1305 before it even touches storage. Your encryption key never leaves your device. There's no "sync to cloud" toggle that could accidentally leak your most vulnerable moments.

---

## How Crisis Detection Actually Happens (Spoiler: It's All Local Math)

The `useCrisisDetection` hook watches for behavioral patterns **entirely in-browser**. No network calls. No external APIs. No machine learning models calling home for answers.

### What Gets Monitored (And Why It Matters)

The engine tracks six stress indicators, all computed from stuff you've already entered or from how you're using the app:

```typescript
interface StressIndicators {
  painLevel: number;           // 0-10, straight from your pain entries
  cognitiveLoad: number;       // 0-1, calculated from behavior patterns
  inputErraticBehavior: number; // 0-1, based on input patterns
  timeSpentOnTasks: number;    // compared to your baseline
  errorRate: number;           // form errors, navigation mistakes
  frustrationMarkers: number;  // back button mashing, help clicks
}
```

### The Detection Logic (No Black Boxes Here)

Every 10 seconds (you can change this), the engine runs a completely transparent analysis:

```typescript
const DEFAULT_CONFIG: CrisisDetectionConfig = {
  enabled: true,
  sensitivity: 'medium',
  monitoringInterval: 10000, // 10 seconds
  painThreshold: 7,
  stressThreshold: 0.7,
  cognitiveLoadThreshold: 0.6,
  autoActivateEmergencyMode: true,
};
```

It looks for specific red flags:

```typescript
// Pain spike detection
if (currentIndicators.painLevel >= fullConfig.painThreshold) {
  triggers.push({
    type: 'pain_spike',
    value: currentIndicators.painLevel / 10,
    threshold: fullConfig.painThreshold / 10,
    timestamp: now,
    context: `Pain level: ${currentIndicators.painLevel}/10`,
  });
}

// Cognitive fog detection
if (currentIndicators.cognitiveLoad >= fullConfig.cognitiveLoadThreshold) {
  triggers.push({
    type: 'cognitive_fog',
    value: currentIndicators.cognitiveLoad,
    threshold: fullConfig.cognitiveLoadThreshold,
    timestamp: now,
    context: 'High cognitive load detected',
  });
}

// Erratic input detection (rapid clicking, chaotic navigation)
if (currentIndicators.inputErraticBehavior >= 0.7) {
  triggers.push({
    type: 'rapid_input',
    value: currentIndicators.inputErraticBehavior,
    threshold: 0.7,
    timestamp: now,
    context: 'Erratic input patterns detected',
  });
}
```

### The Stress Formula (Because Math Should Be Transparent)

Overall stress gets calculated with weights you can actually see and verify:

```typescript
const overallStress =
  (currentIndicators.painLevel / 10) * 0.3 +      // 30% weight
  currentIndicators.cognitiveLoad * 0.25 +         // 25% weight
  currentIndicators.inputErraticBehavior * 0.2 +   // 20% weight
  currentIndicators.errorRate * 0.15 +             // 15% weight
  currentIndicators.frustrationMarkers * 0.1;      // 10% weight

// Severity thresholds
let severity: CrisisState['severity'] = 'none';
if (overallStress >= 0.8) severity = 'critical';
else if (overallStress >= 0.6) severity = 'severe';
else if (overallStress >= 0.4) severity = 'moderate';
else if (overallStress >= 0.2) severity = 'mild';
```

**No mystery algorithms. No hidden models. Just math you can read, understand, and question.**

---

## What Actually Happens During a Crisis

When stress crosses the threshold, the app doesn't alert anyone. It doesn't ping a server. It doesn't notify your emergency contacts. Instead, it **quietly adapts to help you**:

```typescript
const activateEmergencyMode = useCallback(() => {
  updatePreferences({
    simplifiedMode: true,        // Reduce cognitive overload
    showMemoryAids: true,        // Help with brain fog
    autoSave: true,              // Don't lose your work
    touchTargetSize: 'extra-large', // Easier to tap when shaky
    confirmationLevel: 'high',   // Prevent accidental clicks
    showComfortPrompts: true,    // Gentle reminders to breathe
    showProgress: true,          // Reduce anxiety about tasks
  });
}, [updatePreferences]);
```

The language gets softer. The interface becomes more forgiving. Crisis resources appear—but only for you, only on your device.

---

## The Empathy Engine: How It Talks to You When You're Hurting

Crisis detection isn't just algorithms—it's about how the app *responds*. Pain Tracker includes an emotional validation engine that offers support based on your specific situation:

```typescript
const validationResponses = {
  highPain: [
    {
      message:
        "I see you're experiencing significant pain right now. Your courage in tracking this shows incredible strength.",
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
  // ... more contextual responses
};
```

When your pain spikes to 9/10, you don't get a sterile notification—you get acknowledgment. When you've been consistently tracking for weeks, you get celebration. All computed locally, all tailored to your patterns, all staying between you and your device.

---

## The Ethical Line in the Sand

### What We Absolutely Don't Do

* ❌ **No network calls** for crisis detection (seriously, search the codebase)
    
* ❌ **No telemetry** about your mental state
    
* ❌ **No cloud storage** of health data
    
* ❌ **No third-party analytics** tracking your pain patterns
    
* ❌ **No device fingerprinting**
    
* ❌ **No behavioral data sold, shared, or analyzed by us**
    

### What We Actually Do

* ✅ **XChaCha20-Poly1305 encryption** for everything stored
    
* ✅ **User-controlled thresholds** (you define what "crisis" means)
    
* ✅ **Fully auditable algorithms** (open source, MIT licensed)
    
* ✅ **Opt-in everything** (crisis detection can be completely disabled)
    
* ✅ **Local-only processing** (your device, your data, your rules)
    

From our documentation:

> "Health data and payment data MUST remain completely separate. Health Data: IndexedDB (encrypted, local-first). Never store payment information in the same database as health data."

---

## How We Detect Cognitive Fog (Without Being Creepy)

Here's the actual function that figures out if you're struggling cognitively—using only data from your current session:

```typescript
const calculateCognitiveLoad = useCallback(() => {
  // Count errors in the last minute
  const recentErrors = errorEvents.current.filter(
    time => Date.now() - time.getTime() < 60000
  ).length;

  // Count help requests in the last minute
  const recentHelp = helpRequests.current.filter(
    time => Date.now() - time.getTime() < 60000
  ).length;

  // Weighted combination (normalized to 0-1)
  return Math.min(
    1,
    recentErrors * 0.2 + 
    recentHelp * 0.3 + 
    behaviorMetrics.current.timeSpentOnPage * 0.1
  );
}, []);
```

Making more form errors than usual? Clicking help three times in a minute? Taking forever on a simple page? The app notices locally, in a JavaScript function running in your browser. No server ever sees this data.

---

## Frustration Detection: The Back Button Tells a Story

```typescript
const calculateFrustrationMarkers = useCallback(() => {
  const backNavigation = behaviorMetrics.current.backNavigationCount;
  const helpRequestsCount = behaviorMetrics.current.helpRequestsCount;

  return Math.min(1, backNavigation * 0.1 + helpRequestsCount * 0.2);
}, []);
```

Hitting back repeatedly? Spam-clicking the help button? These aren't data points to harvest—they're signs you might need gentler support. The app uses them to **help**, not to profile you for advertisers.

---

## Why This Architecture Matters

Most health tech treats privacy like a marketing feature. "Your data is secure" usually translates to "secure on our servers, where we can mine it for insights."

Pain Tracker takes a fundamentally different approach: **We can't spy on you because we literally have no way to access your data.**

* Encryption keys are generated and stored locally
    
* Health data never leaves your device
    
* Crisis detection runs entirely in your browser
    
* There's no backend database to breach or subpoena
    

For trauma survivors—people who've had their autonomy violated, their pain dismissed, their data weaponized against them—this isn't just a nice feature. It's non-negotiable.

---

## Test It, Break It, Make It Better

The entire codebase is open source under MIT license. You can:

1. **Try the app**: [paintracker.ca](http://paintracker.ca) (works offline!)
    
2. **Read the crisis logic**: [`src/components/accessibility/useCrisisDetection.ts`](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/components/accessibility/useCrisisDetection.ts)
    
3. **Audit the encryption**: [`src/lib/storage/encryptedIndexedDB.ts`](https://github.com/CrisisCore-Systems/pain-tracker/blob/main/src/lib/storage/encryptedIndexedDB.ts)
    
4. **Hunt for network calls**: Search the entire repo for health data transmission (spoiler: you won't find any)
    
5. **Fork and improve**: Make it work better for your community
    

**GitHub:** [CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)

---

## The Real Answer

"How does it know I'm struggling without spying?"

It knows because you told it your pain level is 8/10 today. It knows because it noticed you've been clicking help and making form errors. It knows because the algorithm—running locally, with your encrypted data, in your browser—calculated that you might benefit from a gentler interface right now.

Then it quietly adapts. No alerts. No notifications to anyone else. No data leaving your device.

It just becomes a little more patient with you.

That's what trauma-informed technology actually looks like. That's privacy by architecture, not by promise. That's building tools that serve the people using them, not the companies collecting their data.

---

[*Pain Tracker*](https://paintracker.ca) *is a privacy-first PWA for chronic pain tracking with offline functionality, clinical exports, and WorkSafe BC compliance. All health data stays on your device. MIT Licensed. Currently in beta.*

---

### 💬 Discussion
**What health app has failed you in crisis? Share below.**

### 🛠️ Contribute
See something to improve? [Open an issue →](https://github.com/CrisisCore-Systems/pain-tracker/issues)

### 📬 Stay Updated
[Get notified when I publish technical deep-dives](https://blog.paintracker.ca/newsletter)
