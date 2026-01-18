---
title: "Launched: Pain Tracker v1.0.0 (Open Source, Local-First, Trauma-Informed)"
published: false
description: "After months of build logs and testing, the security-first pain tracker is live. Here is the final stack and how to use it."
tags: ["showdev", "opensource", "react", "privacy"]
cover_image: "https://paintracker.ca/og-image.png"
canonical_url: "https://paintracker.ca/blog/launch-v1"
series: "Pain Tracker Launch"
---

For the last two months, I've been documenting the engineering challenges of building a **security-first, offline-first** health app in public.

You might have read my deep dives on:
*   [Client-Side Encryption](https://dev.to/crisiscore/client-side-encryption-for-healthcare-apps-478h)
*   [Trauma-Informed React Hooks](https://dev.to/crisiscore/trauma-informed-react-hooks-2g90)
*   [Testing "User in Crisis" States](https://dev.to/crisiscore/how-to-test-user-is-in-crisis-without-treating-humans-like-mock-objects-2d7k)

Today, the theory becomes reality.

**Pain Tracker v1.0.0 is officially live.**

*   **Repo**: [github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)
*   **Live App**: [paintracker.ca](https://paintracker.ca)

## What We Shipped

This isn't just a demo. It's a public v1.0.0 release PWA designed for people with chronic pain who want clinically useful data without sacrificing privacy.

### 1. The "Black Box" Architecture
As discussed in *"No Backend, No Excuses"*, we committed to a local-first architecture with client-side encryption.
*   **Class A Data (Health)**: Encrypted with AES-GCM at rest; stored locally by default.
*   **Analytics**: Minimal, privacy-preserving, and optional (when enabled).
*   **Exports**: User-initiated; you control the JSON.

### 2. The "Panic Mode" UI
We implemented the **Trauma-Informed Design** principles from the build logs.
When you log a pain level of 9 or 10, the app detects a high-cognitive-load state and:
*   Simplifies the UI instantly.
*   Removes non-essential navigation.
*   Increases contrast and button size.

### 3. WorkSafeBC Workflows
The goal was utility, not just philosophy. The app can generate **PDF reports** oriented around WorkSafeBC workflows and common insurance-claim documentation.

Always verify requirements and review/edit exports before submitting.

## The Tech Stack (Final v1.0)

For those following the build, here is where we landed for the stable release:

*   **Core**: React 18 + TypeScript + Vite
*   **State**: Zustand + Immer (Immutable state is crucial for our undo/redo safety)
*   **Storage**: IndexedDB (via `idb`)
*   **Validation**: Zod (Runtime schema validation for all imports)
*   **Testing**: Vitest + Playwright (E2E testing for offline flows)

## What's Next?

Planned next: a new **"Ritual" Splash Screen** that signals the transition into a private, local-first environment.

We are now moving into **Phase 2**:
1.  Local-only Machine Learning for pattern recognition.
2.  Deeper EMR integrations.

## Try It Out

If you've been following the *CrisisCore Build Log*, thank you. Your feedback on encryption protocols and accessibility standards shaped this release.

Go break it (and file an issue):

👉 **[paintracker.ca](https://paintracker.ca)**

#ShowDev #OpenSource #Privacy #HealthTech
