# Trust Architecture Docs

This folder contains verification-first trust architecture artifacts for Pain Tracker.

Use these files to move from narrative claims to auditable evidence.

## Core Artifacts

- `defensibility-packet.md`: release-by-release trust summary with evidence links
- `threat-model.md`: adversaries, assets, and mitigations
- `boundary-statement.md`: what the system can and cannot protect
- `quick-wins.md`: immediate hardening backlog
- `verification-interlocks.md`: AI-speed safety controls and review gates
- `pv-metric.md`: generation/verification pressure metric
- `pls-rubric.md`: Protective Legitimacy Score framework
- `release-evidence-template.md`: required evidence bundle per release
- `release-evidence-2026-03-12.md`: dated execution evidence snapshot
- `scenario-test-protocol.md`: reproducible runtime drills
- `release-gating-policy.md`: hard merge/release gates
- `trust-hardening-roadmap-2026q1.md`: 4-12 week phased execution plan with gate criteria

## Operating Rules

- Claims must map to code paths and test artifacts.
- Security-critical paths require human review.
- Class A data never leaves the device by default.
- If evidence is missing, the claim is not accepted.
