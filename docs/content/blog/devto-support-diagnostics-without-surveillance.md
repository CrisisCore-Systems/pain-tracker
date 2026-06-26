---
title: "Support Diagnostics Without Surveillance in Sensitive Apps"
description: "How to design user-controlled diagnostic exports that help debugging without silently collecting sensitive state."
tags:
  - privacy
  - security
  - devops
  - architecture
published: false
---
<!-- pain-tracker:target-link:start -->
> Check the data boundary: [tracking data policy](https://paintracker.ca/tracking-data-policy)
<!-- pain-tracker:target-link:end -->
Support diagnostics are where a lot of privacy promises quietly fail.

The app says it is privacy-first.

Then the first hard bug arrives, and the support path asks for "logs."

Not scoped logs. Not redacted logs. Not a user-reviewed diagnostic packet.

Just logs.

In a normal SaaS product, that may already be risky. In a sensitive app, it is a structural boundary. Diagnostics can expose timestamps, routes, device details, retry loops, feature flags, error messages, and sometimes fragments of the user's actual content. If those records leave the device silently, the product has built a second data pipeline and called it support.

That is not support. That is telemetry with better manners.

The better pattern is a diagnostic export that is local, bounded, redacted, inspectable, and user-sent.

This is the support-side companion to [Analytics without surveillance](https://dev.to/crisiscoresystems/analytics-without-surveillance-explicit-consent-layered-gates-and-never-sending-class-a-data-59f1) and [Trust Boundaries in Client-Side Health Apps](https://dev.to/crisiscoresystems/trust-boundaries-in-client-side-health-apps-2pa9): the same boundary has to hold when something breaks.

## Start with a forbidden list

Before deciding what to collect, decide what the diagnostic path is not allowed to collect.

For a sensitive local-first app, the forbidden list should include:

- raw notes
- free-text symptom descriptions
- attachments
- precise location
- passphrases or key material
- complete identifiers
- full URLs with sensitive query strings
- raw local database rows
- raw stack traces if they can include user-entered values
- behavior trails that reconstruct intimate use

The [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html) is useful here because it treats logging as a security design problem, not just an operations convenience. The key move is to stop treating logs as harmless leftovers.

They are data.

They need a threat model.

## Make the diagnostic packet an allowlist

The implementation should not be "dump everything, then redact."

That fails under pressure because new fields keep getting added to the dump path. The safer design is an allowlist: only explicitly named diagnostic facts are eligible for export.

Example:

```ts
type DiagnosticPacket = {
  schemaVersion: 1;
  generatedAt: string;
  appVersion: string;
  buildHash: string;
  browser: {
    name: string;
    majorVersion: number | null;
  };
  storage: {
    persisted: boolean | null;
    quotaBucket: "low" | "ok" | "unknown";
    indexedDbOpen: "ok" | "failed" | "unknown";
  };
  serviceWorker: {
    controller: "present" | "absent" | "unknown";
    registrationState: "active" | "waiting" | "installing" | "none" | "unknown";
  };
  recentErrors: Array<{
    code: string;
    subsystem: "storage" | "export" | "sync" | "render" | "unknown";
    firstSeenAt: string;
    count: number;
  }>;
};
```

Notice what is missing.

There is no raw entry body.

There is no "last thing the user typed."

There is no full event stream.

There is no browser fingerprint dressed up as diagnostics.

The packet gives maintainers enough to distinguish storage failure from service worker failure, version mismatch, quota pressure, and repeated rendering errors. It does not turn support into surveillance.

## Generate locally, then let the user inspect it

The diagnostic packet should be generated on the user's device.

It should not be uploaded automatically.

A protective flow looks like this:

1. User opens Help or Diagnostics.
2. App explains that no diagnostic report is sent automatically.
3. User clicks "Create diagnostic report."
4. App builds the packet locally from the allowlist.
5. User can preview the packet before export.
6. User downloads or copies it.
7. User decides whether to send it.

This is not just privacy polish.

It changes authority.

The user remains the transfer boundary. The app is not quietly deciding that a bug grants permission to transmit state.

## Separate error memory from user memory

Sensitive apps often need some local error memory. If an IndexedDB migration failed, the app should remember enough to avoid pretending everything is fine. But that does not mean the error store should sit beside user records with the same retention and detail.

Use a narrow diagnostic store:

```ts
type LocalErrorRecord = {
  code: string;
  subsystem: string;
  firstSeenAt: string;
  lastSeenAt: string;
  count: number;
  safeContext?: Record<string, string | number | boolean | null>;
};
```

Then constrain it:

- fixed maximum number of records
- fixed retention window
- no user-entered strings
- no raw request or response bodies
- no secret-bearing headers
- no identifiers unless hashed or truncated for collision detection
- clear local reset path

The diagnostic store should help answer "which subsystem failed?" It should not answer "what was the user doing in detail?"

## Support should degrade safely

Diagnostics also need a degraded-mode path.

If storage is unavailable, the diagnostic page should still be able to render a small in-memory report. If the service worker is broken, the report should not depend on the service worker to load. If the user is offline, the export should still work as a local file or copied text.

The support path is not optional when the app is failing.

It is part of recovery.

## The review checklist

Before adding diagnostics to a sensitive app, ask:

- What exact fields can leave the device?
- Which fields are forbidden?
- Can the user inspect the report before sending it?
- Does the app upload anything automatically?
- Is retention bounded?
- Can the user clear local diagnostic state?
- Does the report still work offline?
- Would this packet be safe if shown to a hostile administrator, partner, or institution?

The last question matters.

A diagnostic report may be created when the user is already distressed. Do not make them debug the privacy boundary at the same time.

Support is a real product feature.

It should help fix the app without quietly extracting the person.
