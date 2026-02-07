# Maintainer Safety Plan (Crisis Protocol)

This project is built around trauma-informed and safety-first principles. That includes the humans building it.

This document is a lightweight, practical protocol for maintainers/contributors to reduce avoidable risk
(burnout, sleep deprivation, unsafe late-night decisions), and to keep security-critical work inside healthy
boundaries.

## Non‑Negotiables

- No security-critical changes without human review.
- No shipping while exhausted.
- No “just one more fix” after cutoff.

## Daily Baseline (Eating / Sleeping / Cutoff)

- **Sleep target**: 7–9 hours.
- **Meals**: 2–3 meals (or equivalent) + water. If meals are hard, prioritize *something* before coding.
- **Hard code cutoff**: stop coding by **21:00 local time**.
- **Hard deploy cutoff**: no production deploys after **18:00 local time**.

If you’re already sleep-deprived, the only acceptable work is:

- documentation,
- low-risk refactors,
- or reading/triage.

## “Stop Conditions” (Pause Work Immediately)

Pause and switch to rest/grounding if any of these are true:

- You notice tunnel vision, agitation, or dissociation.
- You’re skipping food/water to keep coding.
- You’re rewriting crypto/export/persistence logic “quickly”.
- You feel compelled to push changes without tests.

## Red-Zone Boundaries

Do not work on these areas alone or late at night:

- encryption/key handling/unlock flows
- exports/report generation formats (PDF/CSV/JSON)
- CSP/service worker/cache/security headers
- anything that introduces network calls, telemetry, or third‑party SDKs

See `docs/security/DATA_FLOW_MAP.md` for a full inventory of data ingress/egress paths and storage surfaces.

## Work Rhythm

- **Pomodoro default**: 25/5, with a longer break every 2 hours.
- **Body check**: every break—water, bathroom, posture.
- **“Done for today” rule**: end the session after the first clean green test run.

## Escalation & Safety Net

- If you’re stuck in a spiral (debugging loop, panic, or shame), step away for 20–60 minutes.
- If returning doesn’t help, stop for the day and leave a short note in an issue/PR describing the state and next steps.
- If you need help, ask another maintainer to pair-review or take over.

## Phrases That Keep This Project Safe

- “This is a red-zone change — I’m pausing for review.”
- “I can’t trust my judgment right now — I’m stopping.”
- “Shipping can wait; safety can’t.”
