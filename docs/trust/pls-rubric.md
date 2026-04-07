# Protective Legitimacy Score (PLS)

Score each release candidate using evidence-backed criteria.

## Dimensions

### Reversibility

- Can risky changes be rolled back safely?
- Are migrations bounded and recoverable?

### Exposure Minimization

- Did the release reduce or hold steady on sensitive data exposure?
- Are logs and analytics non-reconstructive?

### Local Authority

- Does the user keep control over local data and export boundaries?
- Did any new remote dependency or egress path appear?

### Auditability

- Are claims mapped to tests, docs, and scenario receipts?
- Are security-critical changes explicitly reviewed?

## Scoring

Use `0-3` for each dimension.

- `0`: missing or regressed
- `1`: partial controls
- `2`: acceptable controls and evidence
- `3`: strong controls with repeatable evidence

Total score:
Release decision:
Evidence links:
