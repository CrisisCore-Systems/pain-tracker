# Trust Release Gating Policy

This policy defines non-negotiable trust gates for security-sensitive and crisis-sensitive changes.

## Gate 1: Baseline Quality

- `make check` passes.
- Relevant tests for changed scope pass.

## Gate 2: Sensitive Path Review

Required when touching encryption, key handling, local persistence, exports, audit logging, CSP/service worker, crisis logic, or Class A data handling.

- Security checklist completed: `docs/security/SECURITY_CHANGE_CHECKLIST.md`
- Chokepoint invariants checked: `SECURITY_INVARIANTS.md`
- Human reviewer approval captured.

## Gate 3: Verification Interlocks

- Compute `Pv` from `docs/trust/pv-metric.md`.
- If `Pv > 1` on sensitive scope, apply hard interlock and block release.

## Gate 4: Runtime Scenario Evidence

- Offline scenario completed and attached.
- Coercion/panic-mode scenario completed and attached.

## Gate 5: PLS and Evidence Packet

- PLS rubric completed: `docs/trust/pls-rubric.md`
- Release evidence packet completed: `docs/trust/release-evidence-template.md`

Release decision:
- `pass`: all gates satisfied
- `conditional`: non-critical exception explicitly accepted
- `fail`: any mandatory gate missing
