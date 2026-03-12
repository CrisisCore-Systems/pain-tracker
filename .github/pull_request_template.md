# Summary

Describe what this PR changes and why.

## Checklist

- [ ] Tests: ran relevant tests (`make test` or focused `npm run test ...`)
- [ ] Docs: updated docs if behavior or APIs changed

### Security & Data Safety (only if applicable)

If this PR touches encryption, key handling, local persistence (localStorage/IndexedDB), migrations, exports, audit logging, or PHI/PII handling:

- [ ] Followed `docs/security/SECURITY_CHANGE_CHECKLIST.md`
- [ ] Verified persistence/migration implications in `docs/engineering/LOCAL_DATA_AND_MIGRATIONS.md`
- [ ] Human review requested for security-critical changes

### CrisisCore Chokepoints (governance)

- [ ] If this PR touches a chokepoint file, linked the relevant section in `SECURITY_INVARIANTS.md`
- [ ] If adding/changing a network route: decided whether it is replayable; if yes, updated `ALLOWED_SYNC_ROUTES` + pinned test and explained why
- [ ] If changing CSP/headers/rewrites: updated the CSP CI guard as needed and justified any widening

### Trust Evidence (verification-first)

- [ ] If this PR touches security-critical or crisis-critical behavior, attached a release evidence packet using `docs/trust/release-evidence-template.md`
- [ ] Recorded `Pv` (velocity pressure) for sensitive scope using `docs/trust/pv-metric.md`
- [ ] Completed PLS scoring for release candidates using `docs/trust/pls-rubric.md`
- [ ] Linked scenario drill evidence when runtime behavior changed (`docs/trust/scenario-test-protocol.md`)

## Notes for reviewers

Anything risky, user-facing, or migration-related? Link issues/docs here.
