# Protective Computing v1.0 Requirements Audit

Date: 2026-03-20
Status: Working extraction note

## Source of truth

Canonical published sources:

- Specification: `https://protective-computing.github.io/docs/spec/v1.0.html`
- MUST justifications annex: `https://protective-computing.github.io/docs/spec/v1.0-must-justifications.html`
- Canonical paper DOI cited by the spec: `https://doi.org/10.5281/zenodo.18887610`

In-repo locator:

- `docs/content/blog/devto-architecting-for-vulnerability.md` points to the published v1.0 spec and confirms this repo treats PainTracker as a reference implementation.

Important note:

- This file does not reproduce the full external specification verbatim.
- It paraphrases the published requirements and maps them into an audit format.
- For exact text, use the published spec and annex URLs above.

## Counting rule used here

Included:

- normative `MUST`, `MUST NOT`, and `SHOULD` statements from the published v1.0 specification
- principle-level normative statements
- conformance-level normative statements outside Section 4 where they impose product or claim requirements

Excluded:

- `MAY` statements
- illustrative examples
- non-normative narrative prose not phrased as a requirement
- the parenthetical `should` in the non-scope section (`systems may (and should)`) because it is guidance, not a conformance requirement

Counting note:

- The published MUST-justifications annex reports `37` ledger rows.
- This audit note intentionally splits some compound normative sentences into smaller audit units where one published row contains multiple independently testable obligations.
- Use the annex row count for canonical MUST-ledger accounting.
- Use this file's finer-grained rows for implementation review and dependency mapping.

## Full-text retrieval result

The full text of the v1.0 specification was successfully located at the published spec URL above. The MUST-justifications annex was also located and used for threat tags and failure rationale.

## Principle tags used in this audit

- `reversibility`
- `exposure minimization`
- `local authority`
- `coercion resistance`
- `degraded functionality`
- `essential utility`

## Threat scenario tags used in this audit

Primary tags come from the annex controlled vocabulary and were expanded into shorter audit labels where useful:

- `connectivity loss`
- `forced disclosure`
- `device seizure`
- `network tampering`
- `institutional control`
- `state surveillance`
- `cognitive overload`
- `resource scarcity`
- `accessibility exclusion`
- `dark-pattern coercion`

## MUST inventory

### Threat model and conformance MUSTs

| ID | Requirement paraphrase | Principle tag | Threat scenario tag | What could go wrong | Dependency notes | Needs definitions |
|---|---|---|---|---|---|---|
| `SPEC-M001` | Systems claiming compliance must assume hostile networks. | exposure minimization | network tampering | A design that treats transport as friendly will leak or accept manipulated traffic under routine attack. | Enables transport encryption and exposure minimization controls. | `hostile`, `sensitive data` |
| `SPEC-M002` | Systems claiming compliance must assume administrators are not trustworthy. | exposure minimization | institutional control | Plaintext server-side access turns internal operators and subpoenas into bulk disclosure paths. | Prerequisite for user-held-key and no-plaintext-server posture. | `administrators`, `trusted` |
| `SPEC-M003` | Systems claiming compliance must assume infrastructure failure. | local authority | connectivity loss | If failure is treated as exceptional instead of normal, essential workflows collapse during outages. | Prerequisite for offline workflows and graceful degradation. | `infrastructure failure`, `essential` |
| `SPEC-M004` | Systems claiming compliance must assume users are under constant monitoring. | coercion resistance | state surveillance | Telemetry, notifications, and visible UI state can become external evidence against the user. | Strengthens minimization and coercion-resistance requirements. | `constant monitoring` |
| `SPEC-M005` | A conformant system must implement all six core principles at its declared level. | essential utility | institutional control | Selective compliance lets weak areas hide behind stronger claims elsewhere. | Depends on all principle-specific requirements. | `declared level` |
| `SPEC-M006` | A conformant system must document threat assumptions and scope. | coercion resistance | institutional control | Users and reviewers cannot tell which adversaries or deployments the system actually protects against. | Enables threat-model documentation requirements under coercion resistance. | `scope`, `threat assumptions` |
| `SPEC-M007` | A system making higher-level compliance claims must provide third-party audit evidence at the appropriate level. | essential utility | institutional control | Unverified high-trust claims can be used in procurement or care contexts without real assurance. | Depends on compliance-level framework. | `third-party audit`, `level 3+` |
| `SPEC-M008` | A system claiming v1.0 compliance must maintain that compliance across v1.x minors. | essential utility | institutional control | Minor-version drift can quietly invalidate an earlier safety claim while keeping the same label. | Depends on versioning policy and release review. | `maintain compliance` |
| `SPEC-M009` | Public claims must name the exact version-specific compliance state. | essential utility | institutional control | A vague “Protective Computing compliant” claim hides version drift and criteria differences. | Depends on compliance matrix and versioning policy. | `version-specific compliance` |
| `SPEC-M010` | All six principles are mandatory for compliance and must be implemented at the declared level. | essential utility | institutional control | A system can look compliant overall while failing a single safety-critical principle. | Reinforced by weakest-principle rule. | `declared level` |
| `SPEC-M011` | Any system claiming compliance must declare a level for each principle, and overall status resolves to the weakest principle. | essential utility | institutional control | Teams can otherwise cherry-pick strong areas and conceal weak ones. | Depends on per-principle assessment. | `weakest principle` |

### Reversibility MUSTs

| ID | Requirement paraphrase | Principle tag | Threat scenario tag | What could go wrong | Dependency notes | Needs definitions |
|---|---|---|---|---|---|---|
| `SPEC-M012` | User actions and system changes must be undoable inside documented recovery windows. | reversibility | cognitive overload | A mistaken or coerced action can permanently destroy records before the user stabilizes. | Foundational reversibility rule. | `documented recovery window` |
| `SPEC-M013` | Failures must not turn into irreversible harm. | reversibility | institutional control | A crash, timeout, or threshold event can convert a transient problem into data loss. | Depends on undo, delay, and restore pathways. | `irreversible harm` |
| `SPEC-M014` | All destructive user actions must expose an undo or restoration mechanism. | reversibility | cognitive overload | Delete, modify, or publish flows can create one-step irreversible errors under stress. | Depends on action inventory and recovery-window policy. | `destructive action` |
| `SPEC-M015` | The user must be shown the recovery-window duration for destructive actions. | reversibility | state surveillance | A hidden countdown prevents informed decisions about when risk becomes permanent. | Depends on visible UI disclosure and backend policy alignment. | `recovery window duration` |
| `SPEC-M016` | The system must not permanently delete user data without explicit confirmation and a mandatory delay of at least seven days. | reversibility | forced disclosure | Immediate purge enables accidental erasure or coercive deletion before the user can contest it. | Depends on deletion lifecycle and delayed purge controls. | `explicit confirmation`, `mandatory delay` |
| `SPEC-M017` | The system must document which actions are reversible and which are irreversible. | reversibility | institutional control | Reviewers and users will assume reversibility that does not exist, then discover the boundary too late. | Depends on a state-transition inventory. | `reversible`, `irreversible` |

### Exposure minimization MUSTs

| ID | Requirement paraphrase | Principle tag | Threat scenario tag | What could go wrong | Dependency notes | Needs definitions |
|---|---|---|---|---|---|---|
| `SPEC-M018` | Data may only be collected when it is essential. | exposure minimization | state surveillance | Extra fields create profiling and subpoena surface without improving core utility. | Supports field-level minimization audit. | `essential` |
| `SPEC-M019` | Collected data must be protected with cryptography. | exposure minimization | device seizure | Sensitive records at rest or in transit become trivially extractable when a device or server is taken. | Depends on key-management and encryption boundary. | `cryptography`, `collected data` |
| `SPEC-M020` | Retention must be minimal and automatic. | exposure minimization | institutional control | Indefinite storage turns every old record into future disclosure risk. | Depends on per-field retention policy. | `minimal`, `automatic` |
| `SPEC-M021` | The system must perform a data-minimization audit with justification for every collected field. | exposure minimization | state surveillance | Schema drift adds unjustified fields that nobody re-evaluates. | Depends on field inventory and schema change discipline. | `justify every field` |
| `SPEC-M022` | Sensitive data at rest must be encrypted to the required baseline. | exposure minimization | device seizure | Lost hardware or extracted storage reveals plaintext history. | Depends on encryption implementation and key handling. | `sensitive data` |
| `SPEC-M023` | All in-transit data must use the required TLS baseline. | exposure minimization | network tampering | Sync or backup traffic can be intercepted or downgraded on hostile links. | Depends on endpoint inventory and transport configuration. | `all data in transit` |
| `SPEC-M024` | Every field must have an explicit retention policy. | exposure minimization | institutional control | Teams cannot prove data expires if no field-level rule exists. | Depends on schema inventory and expiry behavior. | `every data field`, `retention policy` |
| `SPEC-M025` | The system must not sell, share, or broker data without explicit opt-in informed consent. | exposure minimization | institutional control | Third-party transfer creates irreversible surveillance and discrimination exposure. | Depends on egress inventory and consent-state enforcement. | `explicit informed consent` |

### Local authority MUSTs

| ID | Requirement paraphrase | Principle tag | Threat scenario tag | What could go wrong | Dependency notes | Needs definitions |
|---|---|---|---|---|---|---|
| `SPEC-M026` | Users must retain local control and local function. | local authority | connectivity loss | A remote outage, takedown, or account freeze becomes total loss of access. | Foundational for degraded functionality and coercion resistance. | `local control`, `function locally` |
| `SPEC-M027` | Essential operations must not require internet access. | local authority | connectivity loss | “Offline-capable” systems can still hard-block on auth, sync, or metadata fetches. | Depends on essential-workflow declaration. | `essential operations` |
| `SPEC-M028` | All essential workflows must work offline. | local authority | institutional control | A critical create/read/update flow can fail at the moment the user most needs it. | Depends on workflow inventory and offline storage. | `essential workflow` |
| `SPEC-M029` | Essential data must be cached on the user’s device so the user keeps a local copy. | local authority | device seizure | Without a full local copy, remote unavailability becomes practical denial of self-access. | Depends on local storage authority. | `essential data`, `local copy` |
| `SPEC-M030` | Sync must not block the user workflow and must reconcile asynchronously. | local authority | network tampering | High latency or packet loss can freeze writing and force manual recovery. | Depends on queueing and eventual reconciliation. | `gracefully`, `blocking` |
| `SPEC-M031` | Offline access to cached data must not require authentication. | local authority | institutional control | Identity-provider failure or coerced account loss can lock a user out of their own local records. | Depends on local unlock path separate from live auth. | `authentication`, `cached user data` |
| `SPEC-M032` | Offline/online parity and sync behavior must be documented. | local authority | state surveillance | Users cannot predict when data is local, remote, or exposed during transition states. | Depends on sync model and feature-matrix documentation. | `feature parity`, `sync behavior` |

### Coercion resistance MUSTs

| ID | Requirement paraphrase | Principle tag | Threat scenario tag | What could go wrong | Dependency notes | Needs definitions |
|---|---|---|---|---|---|---|
| `SPEC-M033` | Users must be able to preserve confidentiality and integrity under physical or legal coercion. | coercion resistance | forced disclosure | Protective behavior disappears in the exact scenario the principle is supposed to address. | Depends on local authority, encryption, and threat-model clarity. | `coercion`, `confidentiality`, `integrity` |
| `SPEC-M034` | Encryption must be structured so users hold the keys and the system cannot decrypt their data. | coercion resistance | institutional control | Server operators or compelled disclosure can reveal everything without the user’s involvement. | Depends on local key custody and no-backdoor rule. | `users hold keys`, `system cannot decrypt` |
| `SPEC-M035` | Strong passphrases must be supported. | coercion resistance | device seizure | Captured encrypted stores become brute-force recoverable if passphrase policy is weak. | Depends on key-derivation configuration and UX enforcement. | `strong passphrase`, `entropy` |
| `SPEC-M036` | Slow password-based key derivation must be used, and weak KDFs must not be used. | coercion resistance | device seizure | Commodity cracking rigs can turn encrypted storage into plaintext history. | Depends on cryptographic implementation review. | `slow key derivation` |
| `SPEC-M037` | Administrative backdoors and master keys must not exist. | coercion resistance | institutional control | A single privileged path nullifies all user-facing security claims. | Depends on key hierarchy and privileged API audit. | `administrative backdoor`, `master key` |
| `SPEC-M038` | The threat model must clearly state what adversaries can and cannot extract. | coercion resistance | forced disclosure | Users may deploy the system in conditions it cannot honestly protect against. | Depends on scope documentation and coercion scenario testing. | `adversaries`, `extract` |

### Degraded functionality MUSTs

| ID | Requirement paraphrase | Principle tag | Threat scenario tag | What could go wrong | Dependency notes | Needs definitions |
|---|---|---|---|---|---|---|
| `SPEC-M039` | Systems must remain usable under severe bandwidth, power, compute, or cognitive limits. | degraded functionality | resource scarcity | Low-resource users are forced onto centralized or inaccessible fallbacks when the system degrades. | Foundational degraded-mode rule. | `usable`, `severely constrained` |
| `SPEC-M040` | The baseline path must be tested on 2G-class networking and meet the HTML budget requirement. | degraded functionality | connectivity loss | Payload-heavy apps cannot reach first interaction on weak links. | Depends on baseline path definition and build budgets. | `baseline path`, `2G` |
| `SPEC-M041` | The system must work on devices below the RAM floor. | degraded functionality | resource scarcity | Core workflows crash or thrash on older or cheaper devices. | Depends on reproducible low-memory evidence. | `<512MB RAM`, `function` |
| `SPEC-M042` | Complete keyboard-only navigation must be supported. | degraded functionality | accessibility exclusion | Pointer-only controls block users who rely on keyboard or switch access. | Depends on full control inventory and input parity. | `complete keyboard-only navigation` |
| `SPEC-M043` | Features must degrade gracefully under constrained resources. | degraded functionality | network tampering | Non-critical features fail in ways that also take down essential ones. | Depends on feature-priority policy and fallback design. | `gracefully degrade` |
| `SPEC-M044` | Media must not auto-load; the user must explicitly request audio or video. | degraded functionality | network tampering | Auto-fetching media silently burns bandwidth and leaks activity on monitored connections. | Depends on explicit media request boundary. | `auto-load media` |
| `SPEC-M045` | The product must meet WCAG 2.1 AA accessibility minimums. | degraded functionality | accessibility exclusion | Disabled users are denied essential workflows even when the product appears functionally complete. | Depends on semantics, contrast, keyboard, and screen-reader support. | `WCAG 2.1 AA` |

### Essential utility MUSTs

| ID | Requirement paraphrase | Principle tag | Threat scenario tag | What could go wrong | Dependency notes | Needs definitions |
|---|---|---|---|---|---|---|
| `SPEC-M046` | Systems must optimize for survival and autonomy rather than engagement or extraction. | essential utility | institutional control | Product incentives drift toward retention, monetization, or control instead of user welfare. | Master constraint over all other principles. | `survival`, `autonomy` |
| `SPEC-M047` | Features must serve essential needs rather than engagement metrics or extraction goals. | essential utility | dark-pattern coercion | Non-essential features accumulate friction, data collection, and dependence loops. | Depends on essential-use-case inventory. | `essential needs`, `extraction` |
| `SPEC-M048` | Essential use cases must be documented and every feature must be justified against them. | essential utility | institutional control | Scope creep becomes invisible and gradually erodes the protective posture. | Depends on feature inventory and subtraction testing. | `essential use case`, `justify every feature` |
| `SPEC-M049` | Dark patterns must not be used. | essential utility | dark-pattern coercion | Users can be nudged into unsafe disclosure, retention, or payment behavior under stress. | Depends on flow audit across onboarding, exit, destructive, and billing paths. | `dark patterns` |
| `SPEC-M050` | Addictive mechanics must not be included. | essential utility | state surveillance | Engagement mechanics increase exposure time and behavior capture while undermining autonomy. | Depends on product behavior and notification audit. | `addictive mechanics` |
| `SPEC-M051` | Success must be measured by user goal completion, not engagement time or adoption. | essential utility | institutional control | Roadmaps drift toward growth KPIs that directly conflict with user welfare. | Depends on metric inventory and planning artifact review. | `user goal completion` |
| `SPEC-M052` | Essential features must not be paywalled. | essential utility | institutional control | Users in crisis or poverty lose access to core utility at the moment they need it most. | Depends on canonical essential-workflow list and free-tier testing. | `essential feature`, `paywall` |

## SHOULD inventory

| ID | Requirement paraphrase | Principle tag | Threat scenario tag | What could go wrong | Dependency notes | Needs definitions |
|---|---|---|---|---|---|---|
| `SPEC-S001` | The system should keep full version history with point-in-time rollback. | reversibility | cognitive overload | Undo inside a short window may still be too weak for later-discovered or multi-step damage. | Builds on destructive-action reversibility. | `complete version history`, `point-in-time rollback` |
| `SPEC-S002` | The system should implement zero-knowledge architecture so only ciphertext is stored remotely. | exposure minimization | institutional control | Even encrypted-at-rest systems can still expose plaintext to operators if server-side processing holds keys. | Builds on user-held-key model. | `zero-knowledge architecture` |
| `SPEC-S003` | Sync should use eventual consistency rather than strong global consistency. | local authority | connectivity loss | Strong consistency introduces online coordination points that break offline continuity. | Depends on asynchronous sync design. | `eventual consistency`, `strong global consistency` |
| `SPEC-S004` | The product should implement plausible-deniability features such as decoys or hidden data. | coercion resistance | forced disclosure | A user can satisfy a demand to show the system while still having no concealment option for sensitive partitions. | Builds on coercion-resistance baseline. | `plausible deniability` |
| `SPEC-S005` | The product should implement progressive enhancement so plain HTML still works without JavaScript. | degraded functionality | resource scarcity | JS failure becomes total failure instead of a reduced but usable baseline. | Builds on degraded-mode baseline. | `progressive enhancement` |
| `SPEC-S006` | The UX should minimize cognitive load through simpler screens, plain language, and visible defaults. | essential utility | cognitive overload | Users in pain, fear, or exhaustion misread complex flows and make high-impact mistakes. | Supports degraded functionality and reversibility. | `cognitive load`, `visible defaults` |
| `SPEC-S007` | Funding should be transparent and not rely on user-data sales. | essential utility | institutional control | Revenue pressure can silently reintroduce extraction incentives even when the product claims protective goals. | Supports no-brokerage and no-paywall rules. | `fund transparently` |

## Requirement dependencies

### Foundational dependencies

| Requirement or family | Depends on | Why |
|---|---|---|
| Local authority family | Essential-use-case definition | You cannot test offline support until you know which workflows are essential. |
| Reversibility family | State-transition inventory | You cannot guarantee recovery if destructive transitions are not fully enumerated. |
| Exposure minimization family | Data-field inventory | Per-field justification, retention, and crypto only work if the schema and runtime writes are known. |
| Coercion resistance family | Local key custody + threat model clarity | User-held-key claims and coercion claims collapse if keys or adversaries are not explicitly modeled. |
| Degraded functionality family | Essential workflow baseline | Graceful degradation is meaningful only if the baseline essential path is explicit. |
| Essential utility family | Feature inventory + metrics inventory | Feature-justification, dark-pattern review, and goal-completion metrics all depend on a complete inventory. |

### Reinforcement relationships from the v1.0 spec

- `local authority` is foundational for all other principles.
- `coercion resistance` depends materially on both `exposure minimization` and `local authority`.
- `degraded functionality` and `essential utility` reinforce each other.
- `essential utility` is the master constraint across the whole framework.
- `reversibility` and `exposure minimization` are synergistic but can create tension around retention depth.

### Known tensions explicitly called out by the spec

- Strong consistency vs local authority: availability wins.
- Server-side processing vs exposure minimization: local processing wins where possible.
- Feature richness vs degraded functionality: essential features must survive first.

## Terms that still need definitions for audit-grade use

These terms appear in the published requirements but remain too soft for high-confidence verification unless a profile defines them:

- `essential`
- `essential operations`
- `essential user workflows`
- `essential data`
- `critical data`
- `sensitive data`
- `local`
- `local copy`
- `gracefully degrade`
- `documented recovery window`
- `explicit informed consent`
- `strong passphrase`
- `complete keyboard-only navigation`
- `dark patterns`
- `addictive mechanics`
- `goal completion`
- `third-party audit`
- `version-specific compliance`

## Top 10 MUSTs for quick audits

These are the fastest high-value checks if an auditor cannot run the full matrix.

1. Essential workflows must function offline.
2. Offline access must not require live authentication.
3. Sensitive data must be encrypted at rest and in transit.
4. The system must not hold user-decryptable plaintext or master backdoors.
5. Destructive actions must be undoable within visible recovery windows.
6. Permanent deletion must require explicit confirmation and a delay.
7. Essential features must not be paywalled.
8. The product must avoid dark patterns and addictive mechanics.
9. Core workflows must remain usable under constrained bandwidth, RAM, and accessibility needs.
10. Public compliance claims must declare per-principle levels and resolve overall status to the weakest principle.

## Practical audit sequence

If this is used for implementation review, the fastest order is:

1. Define essential workflows and essential data.
2. Inventory fields, features, metrics, and destructive transitions.
3. Verify local authority and degraded baseline.
4. Verify exposure and coercion boundaries.
5. Verify reversibility and deletion timing.
6. Verify accessibility and keyboard parity.
7. Verify business-model constraints: no dark patterns, no addictive mechanics, no paywall on essentials.
8. Verify public claim language and weakest-principle compliance declaration.

## Bottom line

- The published v1.0 specification and its MUST-justifications annex were both located successfully.
- The spec contains a dense core of MUST obligations centered on offline essential workflows, reversible high-impact actions, user-held-key confidentiality, graceful degradation, and anti-extractive product constraints.
- The most important missing ingredient for audit-grade product evaluation is not more prose from the framework. It is product-specific definitions of `essential`, `local`, `sensitive`, and `graceful degradation` tied to a concrete workflow inventory.