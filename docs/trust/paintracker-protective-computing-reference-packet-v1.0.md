# PainTracker Protective Computing Reference Packet v1.0

Status: canonical implementation artifact (versioned proof packet)
Date: 2026-05-09

The canonical PainTracker implementation artifact is the PainTracker Protective Computing Reference Packet v1.0. Legacy mappings are retained only as historical drafts until rewritten against the current repository, CI evidence, and claim badge taxonomy.

Protective Computing Specification v1.0 is a founder-authored normative design specification. Current implementation claims are conformance claims, not certification. A system may be described as self-attested, repo backed, CI backed, externally reviewed, or certified only according to the published proof badge taxonomy.

PainTracker is a candidate reference implementation with a public reference packet, explicit limitations, and bounded evidence anchors. It is not certified. Its current posture is Level 2 to Level 3 alignment where evidence exists, with unresolved gaps in active-coercion resistance, accessibility-complete degraded mode, and external review.

## Scope and Claim Boundary

- This packet is a versioned proof packet, not certification.
- Claims in this packet are bounded to repository evidence and named artifacts.
- If evidence is missing, the claim must be downgraded.

Known open gaps called out explicitly:

- Active-coercion resistance: not fully implemented/reviewed.
- Degraded-functionality accessibility: evidence is partial and requires ongoing manual validation.

## Proof Badge Taxonomy

- `Self attested`: Founder/project claim. No direct public evidence yet.
- `Repo backed`: Source file, doc, config, or test exists in public repo.
- `CI backed`: Automated workflow verifies the claim on a commit.
- `Externally reviewed`: Named reviewer has published or signed a bounded review.
- `Certified`: Recognized external body has issued certification.

Rule: A claim cannot inherit a stronger badge from a nearby claim. Every major statement has its own proof level.

## Major Claims and Current Proof Level

| Claim | Current badge | Evidence anchor |
|---|---|---|
| PainTracker is a candidate Protective Computing reference implementation. | Repo backed | `docs/content/blog/devto-architecting-for-vulnerability.md`, `docs/engineering/checklists/paintracker-overton-v1.3-compliance-matrix.md` |
| PainTracker is certified Protective Computing compliant. | Self attested | False claim; do not claim certification. |
| PainTracker supports local-first journaling. | Repo backed | `src/stores/pain-tracker-store.ts`, `src/utils/pwa-utils.ts` |
| PainTracker claims zero operator plaintext access on documented local-first paths. | Repo backed | `docs/trust/threat-model.md`, `docs/security/ENCRYPTION_KEY_MANAGEMENT.md` |
| PainTracker has zero metadata visibility. | Self attested | False claim; metadata visibility is not zero-proven and must not be claimed. |
| PainTracker is accessibility complete. | Self attested | Do not claim. Accessibility is target-based with known manual validation dependencies. |
| PainTracker has externally reviewed degraded-mode behavior. | Self attested | Not yet; reviewer sign-off is pending. |
| Protective Computing has CI audit gates in this repo. | Repo backed | `docs/trust/release-gating-policy.md`, `docs/trust/release-evidence-template.md` |

## Linked Artifacts

- `docs/trust/defensibility-packet.md`
- `docs/trust/release-gating-policy.md`
- `docs/trust/scenario-test-protocol.md`
- `docs/trust/wcag-manual-validation-2026-05-09.md`
- `docs/engineering/checklists/paintracker-overton-v0.2-control-mapping.md` (legacy draft)

## Truthfulness Note

Claims in marketing, docs, or public pages should quote badge level verbatim and include a direct evidence link.
