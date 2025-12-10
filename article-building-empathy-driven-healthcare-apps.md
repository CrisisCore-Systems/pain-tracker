---
title: "No Backend, No Excuses: Building a Pain Tracker That Doesn't Sell You Out"
published: true
description: "Local-first architecture for chronic pain tracking. AES-256 encryption, zero telemetry, trauma-informed UX. Built from necessity."
tags: ["react", "typescript", "healthtech", "privacy"]
cover_image: https://dev-to-uploads.s3.amazonaws.com/uploads/articles/empathy-driven-healthcare-cover.png
canonical_url: 
---

# No Backend, No Excuses: Building a Pain Tracker That Doesn't Sell You Out

Started this project January 2025. Still housing-unstable. Still shipping.

Pain Tracker is a chronic pain management app. No accounts. No cloud sync. No telemetry. Your health data stays on your device or it doesn't exist.

---

## The Problem

Download a "free" health app. Create an account. Sync to their servers.

Your pain levels, your medication history, your worst days—now they live on infrastructure you don't control. Sold to insurers. Leaked in breaches. Subpoenaed in custody disputes. Used to deny disability claims.

The people who need pain tracking most are the ones most vulnerable to this. Chronic illness. Disability claims. Workers' comp fights. Medical trauma.

I know because I'm one of them. I've had my health data used against me in actual court. So I built something else.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR DEVICE                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  React UI   │ →  │   Zustand   │ →  │  IndexedDB  │     │
│  │             │    │             │    │ (Encrypted) │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                            ↓                                │
│                   ┌─────────────┐                           │
│                   │  PDF/CSV    │ → Your doctor. Your call. │
│                   └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘

              NO CLOUD. NO SERVERS. NO TELEMETRY.
```

Data stays on the device. If you want to share it with your doctor or WorkSafe BC, you export it manually. You decide. Every time.

---

## State Management

Zustand with Immer. Immutable updates. Full audit trail.

```typescript
export const usePainTrackerStore = create<PainTrackerState>()(
  subscribeWithSelector(
    persist(
      devtools(
        immer((set) => ({
          entries: [],
          
          addEntry: (entryData) => set((state) => {
            state.entries.push({
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              version: 1,
              ...entryData
            });
          }),
        }))
      ),
      {
        name: 'pain-tracker-storage',
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);
```

Every entry has a version. Every update is immutable. If I need to prove what the data looked like at a specific time, I can.

---

## Encryption

AES-256-GCM. Web Crypto API. No external dependencies.

```typescript
const iv = crypto.getRandomValues(new Uint8Array(12));

const ciphertext = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  encryptionKey,
  plaintextBytes
);
```

Fresh IV every encryption. HMAC verification on decrypt. 150,000 PBKDF2 iterations for password-derived keys.

That iteration count isn't best practice. It's the minimum I need to make brute-force take longer than I need to burn the key.

---

## Trauma-Informed UX

The interface was unusable when I needed it most.

That was the feedback. During pain flares—exactly when users needed the app—cognitive fog, trembling hands, and emotional distress made it impossible.

So I built adaptive interfaces:

```typescript
const activateEmergencyMode = useCallback(() => {
  updatePreferences({
    simplifiedMode: true,
    touchTargetSize: 'extra-large',  // 72px
    autoSave: true,
    showMemoryAids: true,
  });
}, [updatePreferences]);
```

Crisis detection watches for:
- Pain level spikes (7+)
- High error rates (cognitive fog)
- Erratic input patterns (distress)

When detected, the interface simplifies automatically. Larger buttons. Fewer options. Auto-save on every change. The user doesn't have to ask for help.

None of this data leaves the device. All of it can be deleted.

---

## Fibromyalgia Assessment

ACR 2016 criteria. Widespread Pain Index. Symptom Severity Scale.

```typescript
export function calculateFibromyalgiaScore(
  painLocations: string[],
  symptomScores: SymptomScores
): FibromyalgiaAssessment {
  const wpi = painLocations.length;  // 0-19
  const sss = symptomScores.fatigue + 
              symptomScores.wakingUnrefreshed + 
              symptomScores.cognitiveSymptoms;  // 0-12
  
  const meetsCriteria = (wpi >= 7 && sss >= 5) || 
                        (wpi >= 4 && wpi <= 6 && sss >= 9);
  
  return {
    wpiScore: wpi,
    sssScore: sss,
    meetsFibromyalgiaCriteria: meetsCriteria,
    assessmentDate: new Date().toISOString(),
  };
}
```

Not a diagnosis. A validated assessment that produces documentation for doctors who need numbers. Built because I got tired of trying to explain what "everything hurts" means.

---

## WorkSafe BC Export

Workers' comp requires specific formats. I know because I've filed claims.

```typescript
interface WCBExportOptions {
  format: 'csv' | 'json' | 'pdf';
  dateRange: { start: Date; end: Date };
  includeMetadata: boolean;
  wcbClaimNumber?: string;
}

export async function exportForWCB(
  entries: PainEntry[],
  options: WCBExportOptions
): Promise<Blob> {
  const filtered = entries.filter(e => 
    new Date(e.timestamp) >= options.dateRange.start &&
    new Date(e.timestamp) <= options.dateRange.end
  );
  
  // Format according to WCB documentation requirements
  // ...
}
```

CSV for spreadsheets. PDF for submissions. JSON for when I need to prove the data wasn't modified.

---

## Security Audit Trail

Every sensitive operation gets logged. Locally.

```typescript
await hipaaService.logAuditEvent({
  actionType: 'export',
  resourceType: 'PainEntry',
  outcome: 'success',
  details: {
    format: 'pdf',
    entryCount: entries.length,
    dateRange: options.dateRange,
  }
});
```

If someone asks what the app did with my data, I can show them. Without involving a server. Without involving anyone who might decide my pain journal is evidence of something.

---

## What I Learned

Privacy is architecture. You can't bolt it on. The moment data touches a server you don't control, you've lost.

Accessibility isn't a feature. When your users include people with chronic pain and cognitive fog, "good enough" accessibility is hostile.

Domain knowledge matters more than algorithms. I didn't need ML to understand pain patterns. I needed to pay attention to my own body for 15 years.

---

## What's Next

Q1 2026: Local ML inference. Pattern recognition that never phones home.

Q2 2026: EMR/EHR export. Talk to hospital systems without leaking data.

Q3 2026: Native apps. Same architecture, different platforms.

---

## Repository

[github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)

Files worth reading:
- `src/services/EmpathyIntelligenceEngine.ts` - 2,076 lines of heuristic pain analysis
- `src/services/EncryptionService.ts` - client-side encryption
- `src/components/accessibility/` - trauma-informed hooks
- `src/stores/pain-tracker-store.ts` - state management with audit trail

---

Still housing-unstable. Still shipping.

Take what's useful. Build something better.
