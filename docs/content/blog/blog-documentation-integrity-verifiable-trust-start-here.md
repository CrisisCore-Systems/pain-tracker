# Documentation Integrity / Verifiable Trust: Start Here

*A reading path for the posts that treat trust as something you can inspect, reproduce, and challenge instead of something you are asked to accept.*

---

This cluster is about a simple distinction:

- documentation claims
- evidence-backed claims

Plenty of projects say they are privacy-first, secure, resilient, or trustworthy.

That is not the same thing as making those claims legible.

In this repo, the useful path runs from local quality gates, to truthful documentation, to concrete trust artifacts, to delivery rules that keep agentic or automated changes inside explicit boundaries.

That is why these posts belong together.

---

## Read these in order

1. [Quality gates that earn trust](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)
2. [Maintaining truthful docs over time](https://dev.to/crisiscoresystems/maintaining-truthful-docs-over-time-how-to-keep-security-claims-honest-2778)
3. [ProofVault as a Release Artifact: Turning Trust Into Something You Can Verify](https://dev.to/crisiscoresystems/how-proofvault-turned-trust-from-a-documentation-claim-into-a-reproducible-release-artifact-22pb)
4. [Preview Mode First: Agent Plans as PRs (Plan Diff + Invariants)](https://dev.to/crisiscoresystems/preview-mode-first-agent-plans-as-prs-plan-diff-invariants-4ikd)

If you want the doctrine-level publication context behind this trust posture, read [Protective Computing Canon v1.0 is now DOI-backed](https://dev.to/crisiscoresystems/the-overton-framework-is-now-doi-backed-ko7) after the four core posts.

---

## What each post contributes

Quality gates that earn trust

- the local verification baseline
- why runnable checks matter more than confidence language
- the repo-level habit of proving regressions are harder to ship

Maintaining truthful docs over time

- the anti-drift layer
- how to keep docs anchored to commands, tests, and actual code paths
- why honest claims are narrower but stronger

ProofVault as a Release Artifact: Turning Trust Into Something You Can Verify

- the release-artifact layer
- what it looks like when trust is tied to a specimen, pinned outputs, and drift detection
- why a trust case has to survive hosted CI, not just the author’s machine

Preview Mode First

- the delivery-governance layer
- how agent or automation work stays reviewable, bounded, and reversible
- why plan diffs and invariants matter before anything merges or ships

---

## The short version

If you only want the fastest useful path:

1. [Quality gates that earn trust](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)
2. [Maintaining truthful docs over time](https://dev.to/crisiscoresystems/maintaining-truthful-docs-over-time-how-to-keep-security-claims-honest-2778)
3. [ProofVault as a Release Artifact: Turning Trust Into Something You Can Verify](https://dev.to/crisiscoresystems/how-proofvault-turned-trust-from-a-documentation-claim-into-a-reproducible-release-artifact-22pb)

If you are working with agents or automated delivery, do not skip [Preview Mode First](https://dev.to/crisiscoresystems/preview-mode-first-agent-plans-as-prs-plan-diff-invariants-4ikd).

---

## Why this path exists

Trust collapses into theater when:

- docs drift away from code
- security language outruns evidence
- release artifacts cannot be regenerated
- automation is allowed to widen scope without review

This reading path exists to keep those failure modes visible.

The point is not to sound careful.

The point is to make careful claims that survive contact with the repo.
