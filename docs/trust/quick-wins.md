# Quick Wins Backlog (7-Day)

Use this list for immediate hardening with low implementation risk.

## Data Minimization

- [ ] Remove or aggregate reconstructive log fields.
- [ ] Add explicit tests that sensitive free-text payloads are never logged.
- [ ] Confirm default analytics remains disabled unless explicitly enabled.

## Safe Exit and Crisis Anchors

- [ ] Verify safety resources are in fixed locations across key views.
- [ ] Verify panic mode does not hide critical stabilization controls.
- [ ] Verify keyboard-only path to panic/safe-exit actions.

## Release Controls

- [ ] Add trust-evidence section to PR template.
- [ ] Require human review for red-zone file changes.
- [ ] Attach release evidence packet for security-sensitive changes.
