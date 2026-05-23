# Claims Baseline

This baseline defines language that is safe to claim publicly in this repository.

The canonical PainTracker implementation artifact is the PainTracker Protective Computing Reference Packet v1.0. Legacy mappings are retained only as historical drafts until rewritten against the current repository, CI evidence, and claim badge taxonomy.

Reference packet:

- `docs/trust/paintracker-protective-computing-reference-packet-v1.0.md`

## Specification and Certification Language

Protective Computing Specification v1.0 is a founder-authored normative design specification. Current implementation claims are conformance claims, not certification. A system may be described as self-attested, repo backed, CI backed, externally reviewed, or certified only according to the published proof badge taxonomy.

PainTracker is a candidate reference implementation with a public reference packet, explicit limitations, and bounded evidence anchors. It is not certified. Its current posture is Level 2 to Level 3 alignment where evidence exists, with unresolved gaps in active-coercion resistance, accessibility-complete degraded mode, and external review.

## Current proof level badges

- `Self attested`: Founder/project claim. No direct public evidence yet.
- `Repo backed`: Source file, doc, config, or test exists in public repo.
- `CI backed`: Automated workflow verifies the claim on a commit.
- `Externally reviewed`: Named reviewer has published or signed a bounded review.
- `Certified`: Recognized external body has issued certification.

Hard rule: A claim cannot inherit a stronger badge from a nearby claim. Every major statement needs its own proof level.

## Major claim examples and current badge

| Claim | Current badge |
|---|---|
| PainTracker is a candidate Protective Computing reference implementation. | Repo backed |
| PainTracker is certified Protective Computing compliant. | Self attested (false claim; do not claim certification) |
| PainTracker supports local-first journaling. | Repo backed |
| PainTracker claims zero operator plaintext access on documented local-first paths. | Repo backed |
| PainTracker has zero metadata visibility. | Self attested (false claim; metadata visibility is not zero-proven) |
| PainTracker is accessibility complete. | Self attested (do not claim) |
| PainTracker has externally reviewed degraded-mode behavior. | Self attested (not yet externally reviewed) |
| Protective Computing has CI audit gates. | Repo backed (upgrade to CI backed only when linked to workflow run/artifact) |

## Dangerous Claims Downgrade Register

These claims must remain removed or qualified unless repo and evidence packet proof is added:

- Zero-knowledge sync: replace with `encrypted backup architecture under review` or `zero operator plaintext access claimed; metadata visibility not zero`.
- CRDT / operational transform sync: removed from implementation claims unless a shipped implementation and tests are linked.
- Mutual TLS: removed from implementation claims unless deploy config plus verification evidence is linked.
- Grant funding: removed from implementation claims unless public award evidence is linked.
- Native mobile Keychain / Android Keystore: removed from PWA implementation claims; use browser/Web Crypto + local storage boundary language.
- Complete version history: replace with `versioning evidence exists where linked`.
- Certified compliance: replace with `self-attested conformance draft` or `candidate reference implementation`.

## Allowed Claims

Use claims like these:

- local by default
- optional network-assisted features
- user-triggered exports
- privacy settings available
- encrypted storage for specific surfaces only, where proven

## Disallowed Claims (unless specifically proven for the exact surface)

- HIPAA compliant
- secure portal
- military-grade
- never leaves your device
- fully encrypted
- protected by default across all features

## Enforcement

- Automated check: `npm run claims:validate`
- CI/deploy pipelines should fail on disallowed phrases in product/marketing/docs surfaces.
- If a phrase must appear in explanatory context (for example, describing what to avoid), explicitly document it in an allowlist in `scripts/validate-trust-claims.js`.
