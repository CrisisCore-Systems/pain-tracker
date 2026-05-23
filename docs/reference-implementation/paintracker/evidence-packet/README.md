# PainTracker Reference Evidence Packet

Status: commit-bound reference packet (candidate reference implementation)
Date: 2026-05-09

This packet is a commit-bound evidence bundle for PainTracker.

Protective Computing Specification v1.0 is a founder-authored normative design specification. Current implementation claims are conformance claims, not certification. A system may be described as self-attested, repo backed, CI backed, externally reviewed, or certified only according to the published proof badge taxonomy.

PainTracker is a candidate reference implementation with a public reference packet, explicit limitations, and bounded evidence anchors. It is not certified. Its current posture is Level 2 to Level 3 alignment where evidence exists, with unresolved gaps in active-coercion resistance, accessibility-complete degraded mode, and external review.

## Packet Rules

- Every claim must have one explicit proof badge.
- Every repo-backed claim must include repository file paths.
- Every CI-backed claim must include workflow name, run link, and commit SHA.
- Every unsupported claim must be listed in `FALSE_CLAIM_REGISTER.md`.
- The packet must explicitly state what PainTracker does not prove.

## Contents

- `CLAIMS.md`
- `CLAIM_BADGES.md`
- `EVIDENCE_INDEX.md`
- `FALSE_CLAIM_REGISTER.md`
- `THREAT_BOUNDARY.md`
- `DEGRADED_MODE_REVIEW_SCOPE.md`
- `PLS_WALKTHROUGH.md`
- `CONFORMANCE_CLAIM.json`
- `COMMIT.txt`
- `HASHES.txt`

## Non-Claim Boundary

This packet does not certify PainTracker. It documents bounded evidence and explicit unresolved gaps.
