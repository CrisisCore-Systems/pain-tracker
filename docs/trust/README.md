# Trust Architecture Docs

This folder contains verification-first trust architecture artifacts for Pain Tracker.

Use these files to move from narrative claims to auditable evidence.

The canonical PainTracker implementation artifact is the PainTracker Protective Computing Reference Packet v1.0. Legacy mappings are retained only as historical drafts until rewritten against the current repository, CI evidence, and claim badge taxonomy.

Protective Computing Specification v1.0 is a founder-authored normative design specification. Current implementation claims are conformance claims, not certification. A system may be described as self-attested, repo backed, CI backed, externally reviewed, or certified only according to the published proof badge taxonomy.

PainTracker is a candidate reference implementation with a public reference packet, explicit limitations, and bounded evidence anchors. It is not certified. Its current posture is Level 2 to Level 3 alignment where evidence exists, with unresolved gaps in active-coercion resistance, accessibility-complete degraded mode, and external review.

## Core Artifacts

- `paintracker-protective-computing-reference-packet-v1.0.md`: canonical versioned proof packet (not certification)

- `defensibility-packet.md`: release-by-release trust summary with evidence links
- `threat-model.md`: adversaries, assets, and mitigations
- `boundary-statement.md`: what the system can and cannot protect
- `quick-wins.md`: immediate hardening backlog
- `verification-interlocks.md`: AI-speed safety controls and review gates
- `pv-metric.md`: generation/verification pressure metric
- `pls-rubric.md`: Protective Legitimacy Score framework
- `protective-computing-design-patterns.md`: provisional design-pattern stub with scope and publication plan
- `reversibility-contract.md`: live destructive/share action inventory, rollback requirements, and honest gaps
- `reversibility-verification.md`: automated/manual verification procedure and required evidence outputs
- `release-evidence-template.md`: required evidence bundle per release
- `release-evidence-2026-03-12.md`: dated execution evidence snapshot
- `release-evidence-2026-03-19.md`: degraded-functionality evidence packet summary and signoff status
- `release-evidence-2026-03-20.md`: reversibility verification evidence update for live undo/cancel/import claims
- `scenario-test-protocol.md`: reproducible runtime drills
- `release-gating-policy.md`: hard merge/release gates
- `trust-hardening-roadmap-2026q1.md`: 4-12 week phased execution plan with gate criteria

## Operating Rules

- Claims must map to code paths and test artifacts.
- Security-critical paths require human review.
- Class A data never leaves the device by default.
- If evidence is missing, the claim is not accepted.
