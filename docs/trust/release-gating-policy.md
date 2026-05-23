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

## Gate 6: Accessibility Claim Evidence (Required When Claiming WCAG 2.2 AA)

If any public surface claims WCAG 2.2 AA (or equivalent accessibility conformance),
the release packet must include both automated and manual evidence.

- Automated evidence captured (for example `e2e/accessibility.spec.ts` run output)
- Manual assistive-technology validation completed and attached
- Evidence packet reference present (dated file under `docs/trust/`)
- Named reviewer sign-off recorded

Manual validation minimum set:

- Keyboard-only navigation and visible focus on critical flows
- Screen reader pass on NVDA + VoiceOver (or documented equivalent)
- Reflow/zoom checks at 200%
- Reduced-motion and contrast preference behavior checks
- Error messaging and form recovery checks on core workflows

Release decision:
- `pass`: all gates satisfied
- `conditional`: non-critical exception explicitly accepted
- `fail`: any mandatory gate missing
