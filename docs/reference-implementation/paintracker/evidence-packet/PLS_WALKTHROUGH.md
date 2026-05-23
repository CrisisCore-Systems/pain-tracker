# PLS Walkthrough 0001: PainTracker Reference Implementation

Verdict:

PainTracker is useful as the first PLS walkthrough precisely because it contains both strong protective architecture and unresolved proof gaps. The purpose of this walkthrough is not to declare maturity. The purpose is to make maturity measurable.

## 1. Scope

- This walkthrough scores the publicly documented PainTracker reference implementation posture using bounded evidence.
- This is a scored demonstration, not certification.

## 2. Commit under review

- `169c9fd0dca1ae6c582a8ed753a281a4346616e8`

## 3. Claims under review

- Candidate reference implementation status.
- Local-first journaling and bounded export behavior.
- Trust-claims governance and release evidence practices.
- Non-claims and unresolved gaps.

## 4. Evidence sources

- `docs/trust/paintracker-protective-computing-reference-packet-v1.0.md`
- `docs/CLAIMS_BASELINE.md`
- `docs/trust/release-evidence-2026-05-08.md`
- `docs/trust/release-gating-policy.md`
- `docs/reference-implementation/paintracker/evidence-packet/CLAIMS.md`
- `docs/reference-implementation/paintracker/evidence-packet/EVIDENCE_INDEX.md`

## 5. Scoring method

- Use the published Protective Legitimacy Score framing as a bounded, evidence-first scoring exercise.
- Assign conservative scores only where direct evidence is linked.
- Downgrade any claim lacking direct evidence or with stale evidence.

## 6. Principle-by-principle score

| Principle | Score posture | Evidence status |
|---|---|---|
| Local authority | Moderate-strong | Partially supported by repo and release evidence |
| Exposure minimization | Moderate | Partially supported; zero metadata claim explicitly rejected |
| Reversibility | Moderate | Partially supported; complete history non-claim remains |
| Degraded functionality resilience | Moderate | Partially supported; narrow external accessibility review pending |
| Coercion resistance | Limited | Unresolved active-coercion gap |
| Truthful claims discipline | Improving | Supported by baseline + false claim register |

## 7. Disqualifying gaps

- No independent certification.
- No complete active-coercion resistance evidence.
- No externally reviewed accessibility-complete degraded mode evidence.

## 8. Reviewer notes

- This walkthrough should be rerun on new commits when trust-surface claims change.
- Scores are bounded to linked evidence and can move down if evidence decays.

## 9. False claims avoided

- Certified compliance.
- Zero metadata visibility.
- mTLS without proof.
- CRDT/OT sync without shipped implementation.
- Native keychain/Keystore claim for current PWA.

## 10. Revision plan

1. Complete narrow external degraded-mode accessibility review.
2. Publish per-claim CI run IDs for CI-backed claims.
3. Expand coercion-resistance evidence and reviewer signoff.
4. Re-score and publish walkthrough update.
