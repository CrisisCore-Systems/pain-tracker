# Response to Peer Review

Document: The Overton Framework: A Canon for Protective Computing in Conditions of Human Vulnerability (v1.3)

Date: 2026-02-17

This memo maps each major critique in the peer review to the relevant sections in the v1.3 manuscript and notes targeted revisions made to strengthen prescriptive guidance while keeping the Canon scope-locked.

Peer review sources archived in-repo:
- [docs/engineering/reviews/peer-review-overton-framework-v1.3-2026-02-17.md](peer-review-overton-framework-v1.3-2026-02-17.md)
- [docs/engineering/reviews/peer-review-overton-framework-v1.3-2026-02-17-protective-computing-notes.md](peer-review-overton-framework-v1.3-2026-02-17-protective-computing-notes.md)

---

## 1) Core equation: $H = f(D, V, I)$

**Reviewer concern:** Equation risks reading as pseudo-formal; unclear whether conceptual or operational.

**Manuscript response (v1.3):**
- The manuscript explicitly frames $H = f(D,V,I)$ as a *design-time analytical device* for reasoning about failure trajectories and motivating architectural properties.
- It explicitly states it is *not* proposed as a runtime classifier and is *not* operationalized with a validated measurement model in this manuscript.

Where:
- Stability Bias section: [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex)

---

## 2) Vulnerability State Machine (VSM)

### 2a) State meaning / axes

**Reviewer concern:** S0–S3 may conflate axes; unclear whether system/user/interaction state.

**Manuscript response (v1.3):**
- The VSM is positioned as human state modeling to replace static personas, with explicit emphasis that inferred state is non-authoritative and must be user-contestable.
- Transition logic includes explicit precedence rules (user declaration first), duress/contestation support, and surveillance boundary constraints.

Where:
- VSM table + transition logic: [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex)

### 2c) The “tell” problem in coercive environments ($S_3$)

**Reviewer concern:** The system MUST NOT create an externally observable “tell” when entering evasion/neutral presentation; a drastic UI swap can itself become evidence.

**Manuscript response (v1.3):**
- Canonically prohibits auto-hiding behavior that creates coercion-relevant tells, and requires user-triggerable neutral presentation/rapid exit that does not rely on correct coercion inference.

**Revision made:**
- Added an explicit clarification that neutral presentation SHOULD remain plausibly functional and avoid sudden/conspicuous transformations that increase coercion risk.

Where:
- “Tell” constraint: [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex#L491)
- Neutral presentation plausibly functional note: [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex#L492)
- Contested state/duress requirement: [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex#L519)

### 2b) Explicit mapping: states → principles

**Reviewer suggestion:** Add a table mapping S0–S3 to primary/secondary governing principles.

**Revision made:**
- Added an *informative* mapping table “States to Principle Emphasis” to make prescriptive prioritization explicit without overriding Canon gates.

Where:
- Mapping table: [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex#L463-L482)

---

## 3) Protective Legitimacy Score (PLS)

**Reviewer concern:** Single metric is gameable; needs upfront Goodhart’s Law disclaimer; should be treated as diagnostic dashboard / probe points.

**Manuscript response (v1.3):**
- The manuscript already frames PLS as provisional, emphasizes calibration needs, and includes pass/fail Principle Gates plus a control-based evidence pathway.
- It explicitly states composite scoring should be treated as a research instrument pending evaluation.

**Revision made:**
- Added a direct Goodhart’s Law / anti-gaming caveat stating PLS is not an optimization target and should be paired with control gates, evidence artifacts, and independent review.

Where:
- Goodhart caveat: [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex#L975)
- Principle Gates + control families: [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex)

Note on “worked auditor walkthrough”:
- v1.3 includes an illustrative PLS calculation for the reference artifact.
- A step-by-step auditor walkthrough for an external feature (e.g., fall detection) is better suited to the Implementation & Evidence Companion, since it is explicitly designed to evolve without destabilizing the Canon.

---

## 4) Reference implementation feasibility

**Reviewer concern:** Feasibility claim needs concrete implementation description.

**Manuscript response (v1.3):**
- Includes a dedicated case study describing what PainTracker is, what features exist in-repo, and what it is *not* (no clinical efficacy claims; no patient user studies).
- Includes explicit implementation tensions surfaced and limited-feasibility demonstrations (including partial realization of Radical Reversibility).

Where:
- Case Study II: [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex)

---

## 5) Positioning and related work

**Reviewer concern:** Needs clearer engagement with adjacent fields.

**Manuscript response (v1.3):**
- Includes “Position Within Prior Work,” engaging safety-critical HCI, VSD/PbD, resilience/local-first, and technology-facilitated abuse research.
- Includes participatory/trauma-aligned methodological constraints in Human Grounding section.

Where:
- Position Within Prior Work: [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex)

---

## Build and generation notes

- The pandoc Markdown generation task now injects the correct bibliography metadata so the generated frontmatter references the v1.3 BibTeX file.

Where:
- Task update: [.vscode/tasks.json](../../../.vscode/tasks.json)

---

## 6) Local-first vs legal discovery / device seizure

**Reviewer concern:** Local-first reduces institutional denial (Type I) but increases risk under physical device seizure; Principle 5 should explicitly address cryptographic erasure (crypto-shredding).

**Manuscript response (v1.3):**
- Threat model explicitly includes State/Regulatory adversary capabilities including physical device seizure.
- Principle 5 already requires coercion-resistant controls (duress codes, neutral presentation, clearing volatile memory) and emphasizes audit-critical key handling surfaces.

**Revision made:**
- Added explicit mention of destroying/disable access keys (cryptographic erasure) as a possible user-triggered safety routine, and added it as an example in the Panic Protocol pattern.

Where:
- Threat model includes device seizure: [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex#L589)
- Principle 5 coercion-resistant authentication: [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex#L764)
- Cryptographic erasure mention: [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex#L770)
- Panic Protocol example updated: [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex#L783)

---

## 7) Mathematical notation consistency (Total Harm and Sovereignty Gap)

**Reviewer concern:** Keep notation relationships consistently represented.

**Manuscript response (v1.3):**
- Defines the Sovereignty Gap explicitly as $\Delta P = P_i - P_u$ and uses $\Delta P$ consistently.
- Frames $H = f(D,V,I)$ as a design-time device; the manuscript does not claim a validated closed-form relation between $H$ and $\Delta P$ (and should not imply one).

Where:
- Sovereignty Gap equation: [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex#L540)

---

## 8) “Suggested refinements for v1.4” items

These items are recorded as forward-looking refinements; where they are already present in v1.3, the relevant location is noted.

### 8a) Digital iatrogenesis definition

**Reviewer suggestion:** Define explicitly as harm caused by the care/protection system itself.

**Manuscript response (v1.3):**
- Already defines “Digital Iatrogenesis” explicitly in the digital medicine section.

Where:
- Digital iatrogenesis definition: [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex#L1151)

### 8b) PLS weighting vs irreversibility / local-first

**Reviewer suggestion:** Clarify whether high irreversibility can ever pass without local-first.

**Manuscript response (v1.3):**
- Treats PLS as provisional and explicitly pairs it with pass/fail Principle Gates.
- The Canon’s principles (especially P2/P3) heavily constrain architectures that require cloud authority for essential utility; precise PLS weight calibration is deferred to evidence practice.

Where:
- PLS anti-gaming caveat (Goodhart): [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex#L975)

### 8c) Temporal buffering for destructive actions

**Reviewer suggestion:** Stage destructive actions in $S_2$/$S_3$ with a cooling-off period in $S_0$ before they become permanent.

**Manuscript response (v1.3):**
- Already requires restoration windows and deliberate confirmation for high-impact operations.

**Revision made:**
- Added an explicit optional temporal-buffering pattern (cooling-off delays/staged execution) under Principle 1’s destructive friction, as an implementation technique that does not change existing MUST requirements.

Where:
- Temporal buffering note: [docs/engineering/overton-framework-protective-computing-v1.3.tex](../../engineering/overton-framework-protective-computing-v1.3.tex#L664)

---

## Implementation & Evidence Companion (control catalog)

The control catalog requested by reviewers is intentionally housed in the fast-moving Companion, not the Canon.

### Companion v0.2: Deep-review clarifications incorporated

These items reflect additional tightening and auditability improvements made in the Companion in response to a later deep review (without changing Canon scope or claims).

**Clarification:** The items below are Companion-only operationalization and auditability upgrades; they do not modify the Canon v1.3 normative requirements, scope boundaries, or manuscript claims.

- **Offline / “network connectivity” loopholes:** Added an explicit definition of network connectivity for offline tests (IP paths + reliance on remote identity/authorization), and required documentation of non-IP local dependencies (e.g., Bluetooth peripherals) when they are required for Essential Operations.
	- Where: Network connectivity definition: [docs/engineering/overton-framework-protective-computing-companion-v0.1.md](../../engineering/overton-framework-protective-computing-companion-v0.1.md#L18)
	- Where: PC-1.1 offline scope: [docs/engineering/overton-framework-protective-computing-companion-v0.1.md](../../engineering/overton-framework-protective-computing-companion-v0.1.md#L26)

- **Reconstructive metadata guidance:** Added a concrete definition plus examples to reduce ambiguity and improve audit consistency.
	- Where: Definition + examples: [docs/engineering/overton-framework-protective-computing-companion-v0.1.md](../../engineering/overton-framework-protective-computing-companion-v0.1.md#L19)

- **Accessibility precision for crisis-mode controls:** Defined “Accessible Mechanism” and applied it explicitly to PC-4.1.
	- Where: Definition: [docs/engineering/overton-framework-protective-computing-companion-v0.1.md](../../engineering/overton-framework-protective-computing-companion-v0.1.md#L20)
	- Where: PC-4.1: [docs/engineering/overton-framework-protective-computing-companion-v0.1.md](../../engineering/overton-framework-protective-computing-companion-v0.1.md#L40)

- **MUST vs SHOULD rationale (incl. PC-5.4):** Added a short note explaining when the Companion uses MUST vs SHOULD, and explicitly justified why cryptographic erasure remains SHOULD (Type I harm risk tradeoff) while still requiring disclosure and alternative mitigation when omitted.
	- Where: Normative strength note: [docs/engineering/overton-framework-protective-computing-companion-v0.1.md](../../engineering/overton-framework-protective-computing-companion-v0.1.md#L49)

- **Measurement harness clarifications (RQ/ER):** Clarified that record-hash-equivalence should be computed over canonical plaintext (post-decrypt), and that ER’s denominator instrumentation is a test-lab measurement and MUST NOT become production telemetry.
	- Where: RQ note: [docs/engineering/overton-framework-protective-computing-companion-v0.1.md](../../engineering/overton-framework-protective-computing-companion-v0.1.md#L89)
	- Where: ER lab-only note: [docs/engineering/overton-framework-protective-computing-companion-v0.1.md](../../engineering/overton-framework-protective-computing-companion-v0.1.md#L90)

- **Threat modeling / human-factor / telemetry audit guidance:** Added minimal, lightweight guidance blocks to reduce “hand-wave” risk and to make evaluation procedures more repeatable.
	- Where: Threat modeling: [docs/engineering/overton-framework-protective-computing-companion-v0.1.md](../../engineering/overton-framework-protective-computing-companion-v0.1.md#L67)
	- Where: Human-factor evaluation: [docs/engineering/overton-framework-protective-computing-companion-v0.1.md](../../engineering/overton-framework-protective-computing-companion-v0.1.md#L69)
	- Where: Telemetry/covert-signal audit techniques: [docs/engineering/overton-framework-protective-computing-companion-v0.1.md](../../engineering/overton-framework-protective-computing-companion-v0.1.md#L71)

- **Future walkthrough roadmap (non-normative):** Added suggested next walkthroughs for PC-5.3 (neutral presentation tell evaluation) and PC-1.1 (offline guarantee window stress suite) to address reviewer requests for broader executable audit procedures.
	- Where: Suggested next walkthroughs: [docs/engineering/overton-framework-protective-computing-companion-v0.1.md](../../engineering/overton-framework-protective-computing-companion-v0.1.md#L152)

Where:
- Companion draft: [docs/engineering/overton-framework-protective-computing-companion-v0.1.md](../../engineering/overton-framework-protective-computing-companion-v0.1.md)
