---
title: "Local-First Pain Tracking: A Practical Blueprint for Private Health Data"
seoTitle: "Build Privacy-First Health Apps: Local-First Architecture Blueprint (2026)"
seoDescription: "A practical walkthrough for building private-by-default health trackers using local storage as source of truth, with optional sync. Template architecture for any sensitive health use case."
datePublished: Mon Jan 20 2026 12:00:00 GMT+0000 (Coordinated Universal Time)
slug: local-first-pain-tracking-practical-blueprint-private-health-data
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1764400000000/local-first-blueprint-cover.png
tags: webdev, pwa, privacy, healthcare, typescript, indexeddb, local-first, offline-first, security, architecture, chronic-pain

---

# Local-First Pain Tracking: A Practical Blueprint for Private Health Data

> **TL;DR:** This article walks through building a private-by-default health tracker using local storage as the source of truth. I'll cover the stack decisions, UX patterns that work for people having bad days, safety rails that actually matter, and a template architecture you can adapt for any sensitive health use case.

---

## The Problem: Health Apps Are Failing the People Who Need Them Most

Let me tell you about three problems that shouldn't coexist but do:

### 1. Health Apps Are Leaking Data at Scale

The health app ecosystem has become a surveillance operation dressed in calming colors. A [2024 Duke University study](https://www.dukechronicle.com/article/2024/02/duke-university-data-broker-study-health-information-for-sale) found that data brokers openly advertise health profiles—including lists of people with depression, chronic pain, and anxiety—for as little as $0.12 per person.

When someone downloads a "free" pain tracker, they're often not getting a health tool. They're becoming a product—and a potential customer for the app's parent company, which might just happen to sell spinal cord stimulators or opioid alternatives.

### 2. Dark Patterns Around Consent Are Everywhere

The consent flow in most health apps follows a predictable script:

```
Install app
   ↓
47-page Terms of Service appears
   ↓
"I agree" button is prominent and green
   ↓
You've just consented to:
  • Location tracking
  • Data sharing with "affiliates and partners"
  • Anonymized data for "research purposes"
  • Retention for "up to 7 years for legal purposes"
   ↓
Your pain diary is now a commodity
```

"Anonymized" sounds harmless until you learn that 87% of Americans can be uniquely re-identified from just ZIP code, birth date, and gender (Sweeney, 2000). Your "anonymous" pain data has a name attached to it in someone's database.

### 3. Chronic Pain Users Are Already Overwhelmed

Here's what most app developers don't understand about their users with chronic pain:

- **Cognitive fog is real.** Brain fog, medication effects, and pain itself make complex interfaces unusable.
- **Motor impairment is common.** Fine motor control varies day to day.
- **Energy is finite.** Every extra tap, every unnecessary decision, costs energy they may not have.
- **The worst days need the most documentation.** The days when logging is hardest are exactly when the data matters most.

When your app only works well on good days, it's not really a health tool—it's a journal for people who happen to also have pain sometimes.

---

## The Principle: Local-First Means Privacy by Architecture

Here's the fundamental insight that shapes everything else:

> **Local-first for symptom logs; cloud is an optimization, not a requirement.**

This isn't just a privacy philosophy. It's an architectural constraint that makes certain problems impossible.

### What "Local-First" Actually Means

Let me be precise about terminology, because marketing has ruined these words:

| Term | What It Actually Means | What Marketing Says |
|------|------------------------|---------------------|
| **Offline-capable** | The UI loads without internet; core workflows might still fail | "Works offline!" |
| **Offline-first** | Core workflows work offline; sync is a bonus | "Always available!" |
| **Local-first** | Local storage is the source of truth; sharing is explicit | "Your data stays with you!" |

**Pain Tracker is local-first.** That's a stronger guarantee than offline-first. It means:

1. **Data lives on your device by default.** Not "synced to your device" or "cached locally"—originated and stored there.
2. **The app doesn't need a backend to function.** No account creation, no authentication service, no cloud database.
3. **Sharing is an explicit action you take.** Export → Hand to doctor. Not "your data is automatically shared with our research partners."

### Why This Matters: The Trust Boundary Shifts

In traditional health apps:

```
You ──► App Servers ──► Database ──► Who knows?
        (Company-controlled)

Access: You, Company, Partners, Advertisers,
        Hackers (breach), Law enforcement (subpoena)
```

In local-first health apps:

```
You ──► Your Device ──► End of Journey

Access: You.
        (Plus anyone you explicitly export data to)
```

The privacy guarantee isn't a promise. It's architecture. We can't see your data because we never receive it.

### The Cloud as Optimization (Not Requirement)

"But what about sync? What about backups?"

Those are legitimate needs. The local-first principle doesn't forbid cloud features—it changes their role:

| Feature | Traditional Approach | Local-First Approach |
|---------|---------------------|---------------------|
| Multi-device | Account + cloud sync | End-to-end encrypted sync (optional, user-controlled keys) |
| Backup | Automatic cloud backup | Encrypted export → user-managed storage |
| Sharing | "Share" button sends to server | Export → user delivers file |
| Analytics | Server-side collection | Local analytics only (or explicit opt-in telemetry) |

The cloud becomes a transport layer and optional storage, not the source of truth.

---

## The Stack: What We Actually Built

Let me walk through the concrete technical decisions in [Pain Tracker](https://github.com/CrisisCore-Systems/pain-tracker) that make local-first work.

### Overview

```
┌─────────────────────────────────────────────────────────┐
│                     React 18 + TypeScript               │
├─────────────────────────────────────────────────────────┤
│  Zustand + Immer         │  UI State + Immutable Updates│
├──────────────────────────┼──────────────────────────────┤
│  Zod Validation          │  Schema-first data integrity │
├──────────────────────────┼──────────────────────────────┤
│  IndexedDB               │  Durable local storage       │
│  (+ encryption layer)    │  (AES-GCM / XChaCha20)       │
├──────────────────────────┼──────────────────────────────┤
│  Service Worker          │  Offline-first PWA shell     │
├──────────────────────────┼──────────────────────────────┤
│  Export Pipeline         │  PDF, CSV, JSON generation   │
└─────────────────────────────────────────────────────────┘
```

### 1. IndexedDB as the Source of Truth

Why IndexedDB over localStorage?

| localStorage | IndexedDB |
|--------------|-----------|
| 5-10 MB limit | Hundreds of MB |
| Synchronous (blocks UI) | Asynchronous (non-blocking) |
| Key-value only | Structured data + indexes |
| No transactional safety | ACID transactions |
| String values only | Stores objects directly |

For a pain journal that might contain years of entries, localStorage just doesn't scale.

Here's the actual storage pattern from Pain Tracker (simplified for clarity):

```typescript
// Simplified from src/lib/offline-storage.ts
// Full implementation includes type definitions and helper methods

interface StoredData {
  timestamp: string;
  type: 'painEntry' | 'settings' | 'sync';
  data: Record<string, unknown>;
  synced: boolean;
  lastModified: string;
}

export class OfflineStorageService {
  private dbName = 'pain-tracker-offline';
  private stores = {
    data: 'offline-data',
    syncQueue: 'sync-queue',
    cache: 'cache-metadata',
  };

  async storeData(type: string, data: Record<string, unknown>): Promise<number> {
    const entry: StoredData = {
      timestamp: new Date().toISOString(),
      type: type as StoredData['type'],
      data,
      synced: false,
      lastModified: new Date().toISOString(),
    };
    
    // addToStore wraps IndexedDB transaction
    return this.addToStore(this.stores.data, entry);
  }
  
  // Helper method (simplified)
  private async addToStore(storeName: string, data: StoredData): Promise<number> {
    const db = await this.openDatabase();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    return store.add(data) as unknown as Promise<number>;
  }
}
```

**Key design decisions:**

- **Layered persistence**: Zustand store for in-memory state, IndexedDB for durability, localStorage as a fast cache for preferences.
- **Sync queue built-in**: Even without cloud sync, the `sync-queue` store supports future optional sync features without schema changes.
- **Indexed timestamps**: Fast queries for "show me last 30 days" without scanning all records.

### 2. Encryption at Rest

Local storage doesn't mean "secure by default." If someone gets access to your device, unencrypted IndexedDB is readable through DevTools.

Pain Tracker implements client-side encryption:

```typescript
// From src/lib/storage/encryptedIndexedDB.ts
export interface VaultIndexedDBRecord {
  v: 'xchacha20-poly1305';  // Algorithm version
  n: string;                 // Nonce (base64)
  c: string;                 // Ciphertext (base64)
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

  const encoder = new TextEncoder();
  const payload = encoder.encode(value);
  const { nonce, cipher } = vaultService.encryptBytes(payload);
  
  const record: VaultIndexedDBRecord = {
    v: 'xchacha20-poly1305',
    n: nonce,
    c: cipher,
    createdAt: new Date().toISOString(),
    keyVersion: vaultService.getStatus().metadata?.version ?? 'unknown',
  };
  
  // Stored locally, never transmitted
  const db = await openDb(dbName, storeName);
  const tx = db.transaction(storeName, 'readwrite');
  tx.objectStore(storeName).put(record, entryKey);
}
```

**Why XChaCha20-Poly1305?**

- **192-bit nonce**: Dramatically reduces collision risk compared to AES-GCM's 96-bit IV.
- **Nonce reuse safety**: If a nonce is accidentally reused (bad, but possible), XChaCha20 degrades more gracefully.
- **libsodium availability**: The `libsodium-wrappers` package makes correct implementation straightforward.

**The Vault Metaphor:**

We implemented a "vault" system where your data is encrypted at rest. The user provides a passphrase, a key is derived via a memory-hard KDF, and entries are encrypted before storage. Key material is kept client-side during normal use.

This means:
- **Device theft**: Encrypted gibberish without the passphrase.
- **Casual access**: Can't just open DevTools and read entries.
- **Lost passphrase**: Data is genuinely unrecoverable (intentional trade-off).

### 3. Service Worker for PWA Reliability

For chronic pain tracking, reliability matters more than features. The service worker strategy is intentionally conservative:

```javascript
// From public/sw.js (simplified)
const CACHE_NAME = 'pain-tracker-static-v1';

// Network-first for navigations (to avoid stale HTML)
if (isNavigationRequest(event.request)) {
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      return (
        (await cache.match('/offline.html')) ||
        (await cache.match('/')) ||
        new Response(null, { status: 504 })
      );
    })
  );
  return;
}

// Cache-first for static assets
event.respondWith(
  caches.match(event.request).then((cached) => {
    return cached || fetch(event.request);
  })
);
```

**Design principles:**

- **Network-first for HTML**: So app updates deploy cleanly.
- **Cache-first for assets**: So the app shell loads instantly.
- **Versioned caches**: So old assets get garbage collected.
- **Explicit fallback**: So offline behavior is predictable.

**Why conservative?** A clever service worker can break your app in ways that are almost impossible to debug for users. "My app won't update" is worse than "my app loads 200ms slower."

### 4. Explicit Export/Share Flows

The export pipeline is where local-first apps interface with the outside world. Pain Tracker supports:

- **CSV**: For spreadsheets and basic analysis
- **JSON**: For interoperability and backups
- **PDF**: For clinical visits and disability claims
- **WorkSafe BC format**: Structured for BC workers' compensation claims

All generation happens client-side:

```typescript
// Conceptual flow (simplified)
function exportToPDF(entries: PainEntry[], dateRange: DateRange): Blob {
  // 1. Filter entries by date range
  const filtered = filterByRange(entries, dateRange);
  
  // 2. Generate statistics locally
  const stats = calculateStatistics(filtered);
  
  // 3. Render to PDF using jsPDF (client-side)
  const doc = new jsPDF();
  renderPainReport(doc, filtered, stats);
  
  // 4. Return blob for download
  return doc.output('blob');
}
```

**No server round-trip.** The PDF contains your data, generated on your device, downloaded to your filesystem. We never see it.

---

## UX Details: Making Logging 10–20 Seconds Max

Here's the uncomfortable truth about health app UX: **if logging takes too long, people stop logging.** And for chronic pain patients, the worst days—when documentation matters most—are exactly when cognitive load is highest.

Our target: **10–20 seconds to log a pain entry, even on bad days.**

### Pattern 1: Smart Defaults from Last Entry

The most common pain entry looks a lot like the previous one. Same locations, similar medications, familiar triggers.

```typescript
// Pseudo-code for smart defaults
function getDefaultsForNewEntry(entries: PainEntry[]): Partial<PainEntry> {
  const recent = getMostRecent(entries);
  if (!recent || daysSince(recent.timestamp) > 7) {
    return {}; // Too old to be useful
  }
  
  return {
    location: recent.location,      // Same body areas
    medications: recent.medications, // Same meds (but not auto-log doses)
    // Don't copy: painLevel, notes, timestamp (obviously)
  };
}
```

**Why this works:** For recurring pain patterns, users can accept defaults and only change what's different. A 10-field form becomes "verify 2 things, change 1."

### Pattern 2: Presets for Common Scenarios

Many users have 3-5 "types" of pain days:

- "Morning stiffness" (specific locations, low mobility)
- "Flare day" (high intensity, specific pattern)
- "Work aggravation" (activity-triggered, specific body area)

**Presets** let users save these patterns and apply them in one tap:

```typescript
interface PainPreset {
  id: string;
  name: string;
  icon?: string;
  template: Partial<PainEntry>;
  usageCount: number;  // For sorting by frequency
}

// One-tap entry creation
function createFromPreset(preset: PainPreset): PainEntry {
  return {
    ...preset.template,
    id: generateId(),
    timestamp: new Date(),
    // User only needs to adjust intensity and add notes
  };
}
```

**Key insight:** The preset system should surface frequently-used presets first. The goal is one tap to get 80% of the entry filled.

### Pattern 3: Keyboard-First Design

Motor impairment is common with chronic pain. Mouse precision varies day to day. A keyboard-first interface works consistently:

```tsx
// Accessible pain slider with full keyboard support
<AccessiblePainSlider
  value={painLevel}
  onChange={setPainLevel}
  min={0}
  max={10}
  // Full keyboard navigation
  // Arrow keys for fine adjustment
  // Page Up/Down for larger jumps
  // Home/End for min/max
/>
```

**Design requirements:**

- Every control reachable via Tab
- Arrow keys for sliders and selections
- Enter to submit from any field
- Visible focus indicators (not just for accessibility—for usability on high-pain days)

### Pattern 4: Progressive Disclosure

Not every entry needs every field. The entry form should:

1. **Show essentials first**: Pain level, primary location
2. **Reveal details on demand**: Secondary locations, triggers, detailed notes
3. **Remember preferences**: If a user always uses certain fields, show them by default

```tsx
// Simplified progressive form structure
<PainEntryForm>
  {/* Always visible */}
  <PainLevelSlider />
  <PrimaryLocationSelector />
  
  {/* Expandable sections */}
  <Accordion defaultExpanded={userPrefersDetails}>
    <AccordionSection title="Additional Locations">
      <MultiLocationSelector />
    </AccordionSection>
    <AccordionSection title="Activities & Triggers">
      <TriggerSelector />
    </AccordionSection>
    <AccordionSection title="Notes">
      <NotesTextarea />
    </AccordionSection>
  </Accordion>
  
  <SubmitButton />
</PainEntryForm>
```

### Pattern 5: Forgiving Input

When someone is having a bad pain day, they're not going to format dates correctly or spell medication names right. The app should meet them where they are:

- **Fuzzy timestamp entry**: "yesterday", "2 hours ago", "9am" all work
- **Medication autocomplete**: Partial matches, common misspellings
- **Voice notes** (future): Because typing hurts sometimes

### The 10-Second Flow in Practice

Here's what a typical fast entry looks like:

```
1. Open app (already on entry form)           ~1s
2. Pain slider: tap/drag to level             ~2s
3. Location: tap body map region              ~2s
4. Accept pre-filled defaults                 ~1s
5. Optional: add quick note                   ~3s
6. Submit                                     ~1s
─────────────────────────────────────────────
Total: ~10 seconds
```

On a bad day with preset:

```
1. Open app                                   ~1s
2. Tap "Flare Day" preset                     ~1s
3. Adjust pain level if needed                ~2s
4. Submit                                     ~1s
─────────────────────────────────────────────
Total: ~5 seconds
```

---

## Safety Rails: What Actually Protects Users

Privacy architecture is necessary but not sufficient. Here are the safety rails that make local-first health apps actually safe.

### 1. Encryption at Rest (Revisited)

We covered the implementation above. The key points:

- **Strong algorithm**: XChaCha20-Poly1305 or AES-GCM with proper IV handling
- **Memory-hard KDF**: Argon2id or PBKDF2 with sufficient iterations
- **Key material handling**: Keys stay client-side during normal use; never transmitted

**What we're protecting against:**

- Device theft → Encrypted data is useless without passphrase
- Casual access → Can't browse IndexedDB in DevTools
- Malware that exfiltrates storage → Gets ciphertext, not plaintext

**What we're NOT claiming to protect against:**

- Compromised OS with keylogger → They get the passphrase
- Shoulder surfing → They see the data while app is open
- Sophisticated targeted attack → Different threat model

Honest threat modeling matters. Don't overclaim.

### 2. Transparent Backup Strategy

"Local-first" means users are responsible for their own backups. The app must make this easy and clear:

```typescript
// Regular backup prompts
function shouldPromptBackup(lastBackup: Date, entries: PainEntry[]): boolean {
  const entriesSinceBackup = entries.filter(
    e => new Date(e.timestamp) > lastBackup
  ).length;
  
  // Prompt if: >30 days since backup OR >50 new entries
  return (
    daysSince(lastBackup) > 30 ||
    entriesSinceBackup > 50
  );
}

// Backup flow
async function createBackup(): Promise<Blob> {
  const entries = await getAllEntries();
  const encrypted = await encryptForExport(entries);
  return new Blob([encrypted], { type: 'application/octet-stream' });
}
```

**UX for backup:**

- **Regular prompts**: "You haven't backed up in 30 days. Would you like to export now?"
- **Clear explanation**: "Your data lives on this device. If you lose this device, you lose your data. Export regularly to stay safe."
- **Easy restore**: Import from backup file with passphrase verification

### 3. No 3rd-Party Analytics in Core Flow

This is a hard rule: **the core tracking experience must not send data to third-party services.**

Not "we anonymize it." Not "it's just usage metrics." Not "Google Analytics is industry standard."

```typescript
// What we DON'T do
trackEvent('pain_entry_created', {
  pain_level: entry.painLevel,  // NEVER
  location: entry.location,     // NEVER
  user_id: getUserId(),         // NEVER
});

// What we MIGHT do (optional, explicit opt-in)
if (userOptedInToAnonymousTelemetry) {
  trackEvent('feature_used', {
    feature: 'pain_entry',
    // No details about the entry itself
  });
}
```

**Why this matters:**

- Third-party SDKs are black boxes. You can't verify what they collect.
- "Anonymized" analytics can often be de-anonymized with enough data points.
- The presence of tracking code changes the trust model fundamentally.

If you need analytics, keep them local (aggregate stats computed on-device) or make them explicitly opt-in with clear disclosure.

### 4. Audit Logging (Minimal and Non-Reconstructive)

For compliance and debugging, some logging is necessary. The rule: **log actions, not content.**

```typescript
// Good: Action logging
await auditLog({
  action: 'entry_created',
  timestamp: new Date().toISOString(),
  outcome: 'success',
  metadata: { entryCount: 1 }
});

// Bad: Content logging
await auditLog({
  action: 'entry_created',
  entry: entry,  // NEVER log the actual entry
  notes: entry.notes  // NEVER log free text
});
```

The audit log proves "a pain entry was created at 2:30 PM" without recording what the entry said.

### 5. Content Security Policy

CSP headers prevent XSS attacks from running arbitrary code:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  connect-src 'self';
  frame-ancestors 'none';
  object-src 'none';
```

**Why this matters for local-first:**

Even without a backend to attack, XSS can:
- Steal data from IndexedDB
- Exfiltrate to attacker-controlled servers
- Capture passphrases

A strict CSP limits what malicious scripts can do if they somehow execute.

---

## Template Architecture: Reuse This for Any Sensitive Health Use Case

Here's the generalizable pattern you can adapt for any health-adjacent application:

### Core Principles

1. **Local storage is the source of truth.** Cloud is optional transport.
2. **Encryption at rest is mandatory.** Don't ship plaintext health data.
3. **Sharing is explicit.** No ambient data collection.
4. **The app must work offline.** Core features can't depend on network.
5. **UX must work on bad days.** Design for your users' worst moments.

### Recommended Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **UI Framework** | React/Vue/Svelte | Component-based UI |
| **State Management** | Zustand/Pinia/Svelte stores | Reactive state with persistence |
| **Local Storage** | IndexedDB (via Dexie or idb) | Durable, queryable storage |
| **Encryption** | libsodium or Web Crypto API | Client-side encryption |
| **Validation** | Zod/Yup/Valibot | Schema-first data integrity |
| **PWA** | Vite PWA Plugin / Workbox | Offline-first shell |
| **Export** | jsPDF, PapaParse | Client-side document generation |

### Data Flow Pattern

```
User Input
    │
    ▼
┌─────────────────┐
│ Validation      │ ← Zod schema
│ (Client-side)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ State Update    │ ← Zustand/Immer
│ (In-memory)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Encryption      │ ← Before storage
│ (If sensitive)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ IndexedDB       │ ← Durable storage
│ (Local)         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Local Analytics │ ← Computed on-device
│ (If needed)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User-Triggered  │ ← Explicit action
│ Export          │
└─────────────────┘
```

### Migration Strategy

Local-first apps must handle schema evolution carefully:

```typescript
// Version your schemas
const CURRENT_VERSION = 2;

// Migrations are functions from old → new
const migrations = {
  1: (state) => ({
    ...state,
    entries: state.entries.map(e => ({
      ...e,
      id: e.id || generateId(),  // Add missing IDs
    })),
    version: 2,
  }),
};

// Apply on load
function migrateState(state: unknown): CurrentState {
  let current = state as { version?: number };
  while (current.version < CURRENT_VERSION) {
    current = migrations[current.version](current);
  }
  return current as CurrentState;
}
```

**Rules for migrations:**

- Additive changes only (new optional fields) when possible
- Never silently drop data
- Migrations must be idempotent
- Test migration paths from every previous version

### Security Checklist for Health Apps

Before shipping, verify:

- [ ] Encryption key derived from user input, not stored plaintext
- [ ] All sensitive data encrypted before IndexedDB storage
- [ ] No third-party analytics in core tracking flow
- [ ] CSP headers configured (frame-ancestors: none, object-src: none)
- [ ] Export functionality works entirely client-side
- [ ] Backup prompts implemented with clear messaging
- [ ] Audit logs capture actions, not content
- [ ] Offline functionality tested (airplane mode)
- [ ] Service worker doesn't cache sensitive data
- [ ] Passphrase requirements explained clearly

---

## Takeaways

### For Developers Building Health Apps

1. **Start with the threat model.** Who are you protecting users from? What can you honestly claim to prevent?

2. **Local-first is architecture, not marketing.** If data touches your server by default, you're not local-first—you're offline-capable with cloud sync.

3. **Encryption is necessary but not sufficient.** You also need good key handling, clear backup flows, and honest communication about limitations.

4. **Design for your users' worst days.** A chronic pain app that only works well when users feel good is not fit for purpose.

5. **The best privacy policy is "we never see your data."** When privacy is architectural rather than promissory, verification is possible.

### For Users Evaluating Health Apps

Ask these questions:

1. **Where does my data live?** (Local by default, or cloud?)
2. **Can I export my data for free?** (Data portability is a right)
3. **Does the app work offline?** (If not, data is being sent somewhere)
4. **Is the code open source?** (Can claims be verified?)
5. **What's the business model?** (If it's free and VC-funded, you're probably the product)

### The Larger Point

The health app ecosystem treats patient data as a commodity. But it doesn't have to be this way.

Local-first architecture proves that you can build useful health tools without surveillance. You can track chronic pain without feeding insurance risk models. You can document your medical journey without becoming a marketing lead.

The technology exists. The patterns are proven. What's missing is the will to prioritize patient privacy over data extraction.

Pain Tracker is one example. I hope it becomes one of many.

---

## Try It Yourself

The entire Pain Tracker codebase is open source and available at [github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker).

**Key files to explore:**

- `src/lib/offline-storage.ts` — IndexedDB persistence layer
- `src/lib/storage/encryptedIndexedDB.ts` — Encryption implementation
- `src/stores/pain-tracker-store.ts` — Zustand state management
- `docs/engineering/ARCHITECTURE.md` — Full architecture documentation
- `docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md` — Migration patterns

**Run it locally:**

```bash
git clone https://github.com/CrisisCore-Systems/pain-tracker.git
cd pain-tracker
npm install
npm run dev
```

Questions? Find me on [GitHub](https://github.com/CrisisCore-Systems) or open an issue. I'm always happy to talk about building health tech that actually respects patients.

---

*Building a health app? The most secure data is data you never collect. Sometimes the best architecture is the one that makes privacy violations impossible by design.*
