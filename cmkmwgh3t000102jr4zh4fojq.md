---
title: "From PWA to Native: When and How to Branch"
seoTitle: "How PainTracker Ships Changes Safely Without Surveillance"
seoDescription: "How PainTracker ships changes safely with redacted logs, minimal observability, and a small incident loop without surveillance"
datePublished: Tue Jan 20 2026 18:00:29 GMT+0000 (Coordinated Universal Time)
cuid: cmkmwgh3t000102jr4zh4fojq
slug: part-11-from-pwa-to-native-when-and-how-to-branch
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1767513241347/4347f8b0-a74c-40c7-a0a7-3b401f541d15.png
ogImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1767516277881/6b227f7f-16f3-4546-b85e-e951ead4f2a2.png
tags: accessibility, privacy, logging, pwa, observability, incident-response, local-first, health-tech, paintracker, trauma-informed-design

---

Most teams don’t decide “native vs web” in a calm moment. They decide when they’re under pressure.
This part is about making that decision on purpose.

PWAs can be “native-enough” for many health tools, especially when local-first and offline-first are
the priority.

But there are legitimate reasons to go native later.

Separate “we need native” from “we need to fix reliability.” One is a platform choice. The other is
product discipline.

## When a PWA is enough

PWAs often win when:

- offline reliability is good
- your UI is simple and fast
- you don’t need deep OS integrations
- you prioritize easy updates and broad device reach

## When native starts to matter

Native becomes attractive when you need:

- deeper background execution (reliability requirements beyond the browser)
- tighter integration with platform storage and security
- platform-specific assistive tech edge cases
- distribution constraints (some orgs prefer app stores)

The key is to avoid switching platforms as a panic response.

## How to structure code so you can branch later

Even if you stay PWA-only for years, you can architect for optional native:

- keep domain logic separate from UI (model, validation, trends)
- keep storage behind an interface (so implementations can change)
- keep exports behind a boundary (so output generation is consistent)
- keep a11y patterns as shared components and rules

This makes “native later” a packaging decision, not a rewrite.

If you do choose to go native, treat it as a continuation of the same values: local-first defaults,
accessible flows, and honest boundaries around what you can and can’t protect.

## Native migration quick check (decision checklist)

1) You can name the specific limitation the PWA cannot meet
2) You can measure the user harm caused by that limitation
3) You have a plan to share core logic across platforms
4) You can preserve privacy-first defaults in the new platform

## Next: Part 12 — Lessons Learned from PainTracker

Next, Part 12 closes with an honest retrospective and a distilled checklist you can reuse for your own
accessibility-critical, privacy-first health tools.

---
