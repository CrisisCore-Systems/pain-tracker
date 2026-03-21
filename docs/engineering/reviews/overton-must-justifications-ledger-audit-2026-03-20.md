# Overton MUST Justifications Ledger Audit

Date: 2026-03-20
Status: Working audit note
Authoritative posture: Canon is normative. Companion operationalizes verification.

## 1. Location of the closest authoritative ledger

No standalone file literally named "MUST Justifications Ledger" was found in this workspace.

Closest authoritative sources:

1. Canon normative spec
   - `overton-framework/canon/overton-framework-protective-computing-v1.3.md`
   - Workspace mirror PDF source also exists in `docs/engineering/overton-framework-protective-computing-v1.3.md`
2. Implementation and Evidence Companion control catalog
   - `overton-framework/companion/overton-framework-protective-computing-companion-v0.1.md`
   - Companion PDF: `overton-framework/companion/overton-framework-protective-computing-companion-v0.1.pdf`
3. Scope/status note for source authority
   - `overton-framework/README.md`
   - `overton-framework/STATUS.md`

Important source caveat:

- `docs/engineering/reviews/response-to-peer-review-overton-framework-v1.3-2026-02-17.md` points at a stale companion path under `docs/engineering/`. The actual companion in this repo lives under `overton-framework/companion/`.

## 2. Scope and version mapping

- Canon version: `v1.3`
- Companion version: `v0.2 (February 2026)`
- Relationship:
  - Canon is normative and scope-locked.
  - Companion is fast-moving operational guidance.
  - Companion says any conflict with the Canon must be resolved in the next Companion revision.

Working interpretation for this audit:

- Use the Canon for the normative requirement basis.
- Use the Companion as the nearest thing to a "justifications ledger" because it turns the Canon into explicit controls, evidence artifacts, and repeatable verification procedures.
- Use the worked walkthroughs as the strongest available exact-step verification material.

## 3. Quick index of MUST entries by principle and topic

Primary detailed index below covers the Companion control-catalog MUST entries because they are the most directly verifiable.

### Principle 1. Radical Reversibility

- `PC-2.1` Reversibility window for destructive actions
- `PC-2.2` Offline recovery without vendor intervention

### Principle 2. Minimum Necessary Exposure

- `PC-3.1` No remote plaintext access
- `PC-3.2` Telemetry optional/minimized, no covert telemetry-off bypass

### Principle 3. Failure Containment / Local Authority

- `PC-1.1` Essential operations usable offline for documented guarantee window
- `PC-1.2` Remote service loss must not block local reads or required local writes

### Principle 4. Cognitive Load Preservation / Crisis UX

- `PC-4.1` Accessible enter/exit mechanism for protective modes
- `PC-4.2` Nonessential prompt suppression and safe exit preservation

### Principle 5. Asymmetric Power Defense / Coercion

- `PC-5.1` User-controlled duress or concealment mechanism
- `PC-5.2` Offline non-proprietary export without vendor mediation
- `PC-5.3` Neutral presentation must avoid observable tells

### Principle 6. Supply Chain / Update Integrity

- `PC-6.1` Security-critical updates authenticated and change-controlled

## 4. Detailed MUST index

Verification hardness scale:

- `Automated`: can be credibly exercised with scripted tests and deterministic artifacts
- `Mixed`: requires automation plus manual review or human judgment
- `Manual-heavy`: depends materially on human-factors evaluation or governance review

| ID | Principle + topic | Requirement statement | Threat tags / rationale | Verification procedure (exact steps) | Evidence expectations | Hardness | Ambiguity / verifier notes |
|---|---|---|---|---|---|---|---|
| `PC-1.1` | Failure containment, offline window | System must remain usable for Essential Operations with no network connectivity for at least the documented offline guarantee window. | `lockout`, `dependency creep`, `service outage`, `stability bias` | 1. Declare the profile's Essential Operations and offline guarantee window. 2. Disable all IP connectivity and remote identity/auth dependencies. 3. Execute each Essential Operation. 4. Repeat within the claimed window. 5. Record any non-IP local dependency needed. | Scope declaration, offline guarantee window statement, scenario logs, screenshots/video, network-disabled proof, dependency note. | Mixed | Depends on a prior canonical scope declaration of what counts as an Essential Operation for the product profile. |
| `PC-1.2` | Failure containment, remote outage isolation | Loss of remote services must not deny local read access or block local creation of records required for Essential Operations. | `lockout`, `outage`, `local authority`, `capture failure` | 1. Seed local records. 2. Simulate remote service outage or auth failure. 3. Verify local read access still works. 4. Create new required local records. 5. Confirm no remote recovery step is required. | Outage simulation record, local-read screenshots, created record artifact, request log showing no required remote dependency. | Automated | "Required for Essential Operations" must be declared upstream. |
| `PC-2.1` | Reversibility, restoration window | Except where explicitly declared irreversible, destructive actions must be reversible within a documented restoration window. | `irreversibility`, `panic deletion`, `coercive deletion`, `data loss` | 1. Enumerate destructive actions. 2. Create representative records. 3. Perform each destructive action. 4. Restore within the documented window. 5. Verify exact or record-equivalent recovery. 6. Repeat through interruption/restart variants where applicable. | Restoration policy, deletion lifecycle spec, before/after record evidence, restore logs, integrity hashes or equivalence proof. | Mixed | Fails if irreversible actions are not explicitly carved out in scope. |
| `PC-2.2` | Reversibility, no vendor dependency | Recovery must be available offline and must not require vendor intervention. | `vendor lock-in`, `recovery lockout`, `institutional dependency` | 1. Put the system in an offline state. 2. Trigger a recoverable destructive event. 3. Perform recovery locally. 4. Verify no admin key, vendor call, or remote workflow is needed. | Offline proof, recovery steps, local restore artifacts, logs showing no remote dependency. | Automated | Strongly testable if recovery exists; ambiguous where product has no reversible path. |
| `PC-3.1` | Exposure minimization, plaintext boundary | Remote services must not access plaintext user content except where the Canon explicitly allows a remote-processing carve-out with stated bounds. | `disclosure`, `plaintext egress`, `server compromise`, `institutional compulsion` | 1. Identify all remote paths used in representative workflows. 2. Capture egress. 3. Inspect payload contents. 4. Verify content stays encrypted or absent. 5. If any remote-processing carve-out exists, confirm written bounds and threat assumptions. | Crypto boundary spec, network captures, payload inspection notes, carve-out disclosure if present. | Automated | Carve-out handling is only verifiable if written bounds exist; otherwise any plaintext path is a direct failure. |
| `PC-3.2` | Exposure minimization, telemetry discipline | Telemetry must be optional and minimized, and must not use covert signals to bypass telemetry-off. | `covert telemetry`, `surveillance`, `timing beacon`, `crash beacon`, `trust theater` | 1. Turn telemetry off. 2. Run representative workflows. 3. Capture network traffic, logs, and runtime events. 4. Inspect analytics/crash integrations statically. 5. Confirm no timing or crash-beacon bypass path remains. | Telemetry-off config proof, network capture, static inspection notes, runtime logs, documented defaults. | Mixed | Proving absence of covert signals is inherently incomplete; strongest honest claim is layered evidence, not perfect absence. |
| `PC-4.1` | Crisis UX, accessible protective modes | System must provide an Accessible Mechanism to enter and exit protective modes and map them to the Canon's state model. | `cognitive overload`, `a11y failure`, `mode lockout`, `state confusion` | 1. Identify protective modes. 2. Exercise enter and exit using keyboard-only, screen reader, and constrained-input scenarios. 3. Verify visible focus and predictable placement. 4. Confirm state mapping documentation exists. | Mode spec, accessibility review notes, keyboard/screen-reader walkthrough evidence, screenshots/video. | Mixed | Mapping to `S1/S2/S3` is documentary as much as behavioral; mode-state semantics may be underspecified per product. |
| `PC-4.2` | Crisis UX, safe exit and suppression | In protective modes, nonessential prompts must be suppressed and Safe Exit preserved in a fixed, predictable location and gesture budget. | `prompt overload`, `interruption`, `unsafe trap`, `crisis friction` | 1. Enter protective mode. 2. Trigger representative prompts and modal candidates. 3. Verify nonessential prompts do not appear. 4. Verify Safe Exit remains reachable, fixed, and consistent. 5. Repeat under time pressure or constrained input. | Prompt inventory, screenshots/video, scenario notes, accessibility evidence, failure log if any prompt intrudes. | Mixed | Requires product-specific classification of what is nonessential and what counts as Safe Exit. |
| `PC-5.1` | Coercion defense, duress/concealment | System must support a user-controlled duress or concealment mechanism with predictable, documented, and where applicable reversible behavior. | `coercion`, `forced disclosure`, `shoulder surfing`, `device seizure` | 1. Identify the duress/concealment trigger. 2. Baseline visible sensitive state. 3. Trigger mechanism. 4. Verify observed behavior matches disclosure. 5. If reversible, restore and verify no unintended loss. 6. Confirm no network dependency. | Duress behavior spec, state/mode spec, screenshots/video before and after, disclosure text, network capture. | Manual-heavy | High-risk because correctness includes outward appearance, predictability, and coercion context, not just code behavior. |
| `PC-5.2` | Coercion defense, export sovereignty | System must provide offline export in non-proprietary formats without vendor mediation. | `vendor lock-in`, `institutional delay`, `portability failure`, `evidence access` | 1. Disable network. 2. Generate complete export. 3. Verify format is non-proprietary. 4. Confirm no vendor portal or service is required. 5. Validate at least one artifact is usable by an external tool or person. | Export files, offline proof, format documentation, screenshots, optional open/parse validation. | Automated | "Complete" export content scope can be ambiguous unless data-class coverage is documented. |
| `PC-5.3` | Coercion defense, neutral presentation | Neutral presentation modes must avoid externally observable tells that increase coercion risk. | `coercion`, `revealing UI tell`, `observer inference`, `safety theater` | 1. Define normal and neutral presentations. 2. Run a scripted spot-the-difference check with at least 2 naive observers. 3. For audit-grade review, run independent-rater evaluation with predefined tell classes. 4. Measure timing/latency differences if mode gates distinct partitions. 5. Fail on consistent cue identification. | Neutral presentation spec, rater protocol, ratings/results, screenshots/video, timing measurements, redesign notes if cues found. | Manual-heavy | Most ambiguous and least directly automatable control. "No obvious tell" is human-factors evidence, not binary static proof. |
| `PC-6.1` | Supply chain, update integrity | Updates to security-critical components must be authenticated and subject to change-control. | `supply chain compromise`, `malicious update`, `untracked security drift` | 1. Enumerate security-critical components. 2. Verify update authentication mechanism. 3. Inspect change-control records for recent changes. 4. Confirm unsigned or untracked updates are rejected or blocked. | Signing policy, build/release records, provenance or approval records, test of signature enforcement if available. | Mixed | Depends on release-process maturity. Often verifiable only partly from repo artifacts. |

## 5. Canon-level MUSTs that shape interpretation

These are not separate detailed entries above because the Companion already operationalizes most of them, but they are the canonical baseline that explains why the control catalog exists.

| Canon principle | Canon requirement summary | Why it matters for verification |
|---|---|---|
| Principle 1 | No action in a vulnerability state may result in immediate or irreversible data loss. | Forces reversibility testing under crisis, confusion, and coercion contexts, not just normal use. |
| Principle 2 | Remote exposure must be minimized; user content must be encrypted before transmission; servers must not decrypt it. | Forces payload inspection and metadata minimization review. |
| Principle 3 | Essential read capability and data integrity must survive external infrastructure failure; local DB must be authoritative. | Forces offline and outage tests that prove local authority rather than nominal local caching. |
| Principle 4 | Vulnerability-state interfaces must minimize executive demand, survive interruption, and suppress non-critical prompts. | Forces constrained-input and crash/reboot recovery checks. |
| Principle 5 | Systems must actively mitigate coercion, surveillance exposure, and vendor lock-in; duress credentials and offline export are mandatory. | Forces highest-scrutiny review of concealment, duress, export, and panic behaviors. |

## 6. MUSTs that are ambiguous or not directly verifiable

Highest ambiguity:

1. `PC-5.3` Neutral presentation has no obvious tell
   - Reason: depends on human observers, threat-model assumptions, and latency side channels.
2. `PC-5.1` Predictable duress/concealment behavior
   - Reason: predictability for the user must be balanced against non-obviousness to an observer.
3. `PC-4.1` Mapping to `S1/S2/S3`
   - Reason: product may not expose a one-to-one state model, so proof may be partly documentary.
4. `PC-1.1` Essential Operations and offline guarantee window
   - Reason: verification is only as strong as the declared scope profile.
5. `PC-5.2` Complete offline export
   - Reason: "complete" needs explicit field/class coverage or the claim can overreach.
6. `PC-6.1` Security-critical component list
   - Reason: supply-chain verification is weak if the critical-component boundary is not declared.

Verification-limited but still testable:

1. `PC-3.2`
   - Layered evidence can reduce risk but cannot perfectly prove absence of covert telemetry in all future states.
2. `PC-2.1`
   - Requires an explicit list of destructive actions and declared irreversible carve-outs.

## 7. Highest-risk MUSTs

These are the MUSTs most likely to fail dangerously or be overclaimed.

1. `PC-5.3` Neutral presentation tell resistance
   - Risk: a decoy or concealment mode that visibly changes behavior can increase coercion risk rather than reduce it.
2. `PC-5.1` Duress/concealment mechanism
   - Risk: if it is inconsistent, network-dependent, or not truly user-controlled, it can create false safety claims.
3. `PC-2.1` and `PC-2.2` Reversibility and offline recovery
   - Risk: irreversibility or vendor-gated recovery directly creates lockout and data-loss harm.
4. `PC-3.1` and `PC-3.2` Exposure and telemetry boundaries
   - Risk: plaintext egress or covert telemetry defeats the core privacy and coercion posture.
5. `PC-1.1` and `PC-1.2` Offline essential operations and remote outage isolation
   - Risk: remote auth or service dependency converts instability into direct user harm.

## 8. Follow-up questions that require author clarification

1. What is the canonical scope declaration for the target product profile, specifically the exact list of Essential Operations for `PC-1.*` verification?
2. Is there a separate authoritative "MUST Justifications Ledger" outside this workspace, or is the intent that the Companion v0.2 control catalog serves that role?
3. For `PC-5.2`, what exact data-coverage standard qualifies an export as "complete" for signoff: all Protected Records, all user-visible data, or all reconstructive state required for restore?
4. For `PC-5.1` and `PC-5.3`, what observer model is authoritative: naive observer only, informed observer, coercive partner, institutional reviewer, or all of the above?
5. For `PC-4.2`, what is the canonical definition of `Safe Exit` and the acceptable gesture budget across desktop, mobile, and assistive-tech contexts?
6. For `PC-6.1`, which components are explicitly classified as security-critical in the standard, and what minimum evidence satisfies change-control?
7. Does the canon intend `cryptographic erasure` to remain a `SHOULD` for all profiles, or can some profiles elevate it to a MUST through a profile-specific threat model?
8. Is the stale companion path in the peer-review response note intentionally preserved for historical chain-of-custody, or should it be corrected to the current `overton-framework/companion/` location?

## 9. Bottom line

- No standalone MUST ledger was found.
- The strongest truthful substitute is:
  - Canon v1.3 for normative MUST statements
  - Companion v0.2 for justifications, evidence expectations, and verification procedures
- If this material is going to be used for signoff, the next hardening step is not more prose. It is a profile-specific declaration of Essential Operations, Safe Exit, export completeness, observer model, and security-critical component boundaries.