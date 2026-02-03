---
title: "Testing Accessibility with Free Tools and Real Users"
seoTitle: "Testing Accessibility with Free Tools and Real Users"
seoDescription: "Layered accessibility testing for small teams using automated checks, keyboard testing, screen readers, and respectful real‑user observation."
datePublished: Tue Feb 03 2026 18:00:45 GMT+0000 (Coordinated Universal Time)
cuid: cml6wmqt9000002lac3v01s9a
slug: part-09-testing-accessibility-with-free-tools-and-real-users
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1767509973900/66e2009d-78e7-4a1c-a8df-a8da8556cb3f.png
ogImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1767510313757/5fb49737-ccb5-4247-abf5-2c592f321fee.png
tags: web-development, accessibility, testing, ux-design, healthtech, trauma-informed-design, a11y-tools

---

It’s easy to ship a screen that “looks fine” and still blocks someone from completing the task.
Testing is how you catch that early, before it becomes a habit.

Accessibility isn’t a checklist you complete once.

It’s a feedback loop: you test, you learn where users struggle, and you adjust the UI so it works
under real constraints.

Here’s a workflow that is realistic for small teams.

The goal isn’t to “pass a test.” It’s to stop shipping screens that quietly lock people out.

## Layer 1: automated checks (fast feedback, not full coverage)

Automated tools catch:

- missing labels
- low contrast
- obvious ARIA misuse
- keyboard traps (sometimes)

But they do not catch:

- confusing wording
- cognitive overload
- bad focus flow
- “it technically works but feels awful”

Use automation to prevent regressions, not to declare victory.

## Layer 2: keyboard-only test (the fastest reality check)

Run this test on every primary flow:

1) Start at the top
2) Tab through the page
3) Confirm you can activate controls and complete the flow
4) Confirm focus returns somewhere sensible after actions

If you can’t do the task by keyboard, many assistive tech users can’t either.

## Layer 3: screen reader smoke tests (NVDA/VoiceOver)

You don’t need to be an expert screen reader user to catch the big problems.

Smoke-test questions:

- Does each control announce a meaningful label?
- Are errors announced when they appear?
- Do headings make sense as a page outline?
- Do dialogs announce themselves and trap focus correctly?

## Layer 4: real-user observation (small, targeted, respectful)

Even 2–3 sessions can reveal patterns.

Keep it simple and trauma-informed:

- ask users to complete one task (log an entry, find last week’s pattern, export)
- avoid making them “perform” their disability or pain
- watch where they hesitate, not just where they fail
- treat frustration as signal, not user error

## Accessibility testing quick check

1) Automated checks run in CI or before release
2) Keyboard-only test passes for primary flows
3) Screen reader smoke tests run on key screens
4) At least occasional real-user observation informs changes
5) Fixes are regression-tested (a11y bugs don’t come back)

## Next: Part 10 — Shipping, Observability, and Incident Handling

Next, Part 10 covers shipping discipline for a privacy-first health tool: error handling, minimal
observability, redaction boundaries, and a lightweight incident process.

---
