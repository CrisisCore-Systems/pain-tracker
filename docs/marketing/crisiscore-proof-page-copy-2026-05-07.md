# CrisisCore `/proof` Page Copy Draft

Generated May 7, 2026.

Purpose: replace the unresolved redacted artifact CTA on `crisiscore-systems.ca` with a truthful proof index anchored to existing trust documentation.

## Page role
- Primary job: prove.
- Secondary job: route technically-minded buyers to the right artifacts.

## URL
- Preferred path: `/proof`

## SEO draft
- Title: `Proof Materials and Release Evidence | CrisisCore Systems`
- Description: `Inspect release evidence, threat model documents, and defensibility materials behind CrisisCore’s trust claims.`

## Hero
### Eyebrow
Release evidence and trust materials

### Headline
Trust is only useful if someone else can inspect it.

### Subhead
This page collects the public proof materials behind the CrisisCore trust story: release evidence, boundary statements, threat-model context, and defensibility artifacts.

### Trust note
These materials show what was checked, what was in scope, and what remains out of scope. They are not a claim of perfect security or universal protection.

### Primary CTA
View GitHub proof-of-work

### Secondary CTA
Contact CrisisCore

## Section 1: What This Page Is
This is not a marketing badge wall.

It is an index of public materials that make trust claims inspectable:

- what the system says it does
- what the threat model includes
- what the release evidence captured
- what verification steps ran
- what non-guarantees still apply

## Section 2: What This Page Is Not
- Not a promise of zero risk.
- Not a substitute for independent review.
- Not a claim that every threat is solved.
- Not a claim that documents alone prove the deployed system forever.

## Section 3: Recommended Artifact Index
### Defensibility packet
Use this first if you want the shortest release-evidence summary.

Suggested artifact link target:
- `docs/trust/defensibility-packet.md`

Suggested description:
- Execution snapshot covering scope, checks run, provisional PLS scoring, and gate decision.

### Threat model
Use this if you want to understand the adversaries, exclusions, and exposure assumptions.

Suggested artifact link target:
- `docs/trust/threat-model.md`

### Boundary statement
Use this if you want to see what guarantees are being claimed and what is explicitly not being claimed.

Suggested artifact link target:
- `docs/trust/boundary-statement.md`

### Release evidence
Use this if you want dated receipts from concrete verification passes.

Suggested artifact link targets:
- `docs/trust/release-evidence-2026-03-20.md`
- `docs/trust/release-evidence-2026-03-19.md`
- `docs/trust/release-evidence-2026-03-12.md`

### Verification and release policy
Use these if you want the rules behind the evidence.

Suggested artifact link targets:
- `docs/trust/release-gating-policy.md`
- `docs/trust/scenario-test-protocol.md`
- `docs/trust/reversibility-contract.md`

## Section 4: Why This Matters
Anyone can say a product is privacy-first, local-first, or security-minded.

The harder question is whether the trust story stays legible once you ask for artifacts, constraints, test evidence, and explicit non-guarantees.

That is the point of the proof path.

## Section 5: Verification Path For Reviewers
Suggested reading order:

1. Start with the defensibility packet.
2. Read the threat model and boundary statement.
3. Check the dated release evidence.
4. Inspect the GitHub org and related repository materials.
5. Contact CrisisCore if you want a review of your own trust path.

## Section 6: GitHub Proof Surface
Public code and docs are part of the proof path because they let reviewers inspect claims at the source instead of taking summary copy on faith.

Suggested link target:
- `https://github.com/CrisisCore-Systems`

Suggested supporting line:

`Use the GitHub organization to inspect implementation surfaces, docs, tests, and public artifacts that support the trust narrative.`

## Section 7: CTA Block
### Heading
Need this level of evidence for your own product?

### Body
If your trust story depends on people believing the copy instead of inspecting the system, the proof path is incomplete.

### CTA options
- View GitHub org
- Explore PainTracker
- Contact CrisisCore Systems

## Footer note
These artifacts describe specific verification passes and release evidence snapshots. They should be read as dated evidence, not timeless guarantees.
