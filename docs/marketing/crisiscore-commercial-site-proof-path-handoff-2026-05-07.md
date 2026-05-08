# CrisisCore Commercial Site Proof-Path Handoff

Generated May 7, 2026.

This handoff package is for the repo or system that controls `https://crisiscore-systems.ca`.

## Objective
- Route discovery traffic through the commercial site first.
- Remove dead or vague trust CTAs.
- Reuse the existing PainTracker proof surface instead of writing a second, weaker trust story.

## Existing Proof Surface Already Live In PainTracker
- PainTracker case-study route: `/case-study`
- PainTracker proof route: `/proof`
- GitHub org: `https://github.com/CrisisCore-Systems`

These routes already express the proof narrative that the commercial site should mirror or point to.

## Required Commercial-Site Deliverables
### 1. Case-study trust route
- Route: `/case-study` or an equivalent stable path on the commercial site.
- Job: convert and prove.
- Required sections:
  - composite-example headline and subhead.
  - problem statement centered on paperwork burden, memory fragmentation, and documentation inconsistency.
  - before-vs-after workflow summary.
  - privacy boundary summary: local-first, review before sharing, no outcome promises.
  - trust disclaimer: not affiliated with or endorsed by WorkSafeBC; not medical or legal advice.
  - CTA block: view PainTracker, inspect proof materials, contact CrisisCore.

### 2. Proof route
- Route: `/proof` or an equivalent stable path on the commercial site.
- Job: prove and route.
- Required sections:
  - what the page is: release evidence, trust case materials, and verification receipts.
  - what it is not: not a claim of perfect security or universal protection.
  - artifact index: defensibility packet, threat model, release evidence, verification policy.
  - verification path: what to inspect and in what order.
  - CTA block: inspect docs, view GitHub org, contact for audit work.

### 3. GitHub proof-of-work link
- Place the GitHub org in the commercial-site trust path.
- Explain why it exists: public proof-of-work, public docs, and inspectable artifacts.

## Preferred Implementation Strategy
1. If the commercial site can host the content directly, mirror the PainTracker trust structure with commercial framing.
2. If that is slower, ship stable commercial-site routes that clearly point to the existing PainTracker proof pages.
3. Do not leave trust CTAs unresolved while waiting for a perfect rebuild.

## Copy Guardrails
- Put non-guarantees in visible positions, not footnotes.
- Keep composite-example disclaimers ahead of metrics or claimed improvements.
- Do not promise legal success, claim acceptance, medical efficacy, or perfect security.
- Distinguish inspection artifacts from marketing copy.

## Minimum Link Set
1. `https://crisiscore-systems.ca`
2. `https://paintracker.ca/case-study` or the mirrored commercial-site case-study route
3. `https://paintracker.ca/proof` or the mirrored commercial-site proof route
4. `https://github.com/CrisisCore-Systems`

## Acceptance Checks
- No dead trust CTA remains on the commercial site.
- The commercial site is the first routing destination from public discovery profiles.
- The GitHub org is reachable from the commercial-site trust path.
- The trust path explains what can be inspected and what is out of scope.
- Copy makes no unsupported claims about outcomes or guarantees.