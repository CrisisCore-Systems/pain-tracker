# Privacy-first, offline-capable, trauma-informed, open-source health tools should be the default

(Version 5: Coercion-resilient consent + implementation science completion)

<!-- markdownlint-disable MD013 -->

Most pain-tracking apps I tried made me want to throw my phone across the room.

The evidence for pain diaries is strong, and chronic pain is everywhere, but most tools feel like surveillance systems pretending to be care. They prioritize data extraction, cloud integration, and paternalistic UX over privacy, autonomy, and trauma awareness.

Drawing on the design choices, architecture, and open-source ecosystem around PainTracker.ca (plus the Dev.to build logs, the X account, and the CrisisCore-Systems GitHub org), I argue that privacy-first, offline-capable, trauma-informed, open-source tools should become the default standard in digital health. But this paper also makes a harder claim that earlier drafts left implicit: architecture that protects against *corporate* surveillance can still fail under *institutional* power. If patient-controlled sharing becomes a condition of credibility, medication continuation, or care access, “consent” can degrade into coerced disclosure. A trauma-informed system cannot define consent solely as a UI action. It must account for coercive contexts and implement workflows that preserve autonomy under pressure.

## Positionality and method

(Why this paper is written this way)

I write as both a chronic pain patient and a systems designer building through fluctuating capacity, including flare days where attention collapses, fine motor control degrades, and “one more form” is not a reasonable ask. These constraints are not aesthetic preferences; they come from repeated contact with the failure modes of mainstream tools in low-resource, high-stress conditions. That lived contact is also a form of stress testing: it reveals where designs break first, and who pays the cost.

This is a design-based argument grounded in lived experience and a public, inspectable implementation. It treats architecture and interaction design as evidence about what is technically feasible and what harms are structurally produced (or prevented) by default patterns in digital health. It does not claim that randomized controlled trials (RCTs) are “wrong” as a general epistemological framework; instead, it argues that trauma-informed tools require evaluation regimes that can measure power, coercion risk, and capacity collapse—outcomes that standard RCT endpoints often exclude or flatten. RCTs may remain useful for specific clinical endpoints, but they are insufficient as the sole legitimacy structure for tools whose core harms (or safety) emerge from context, power asymmetry, and implementation reality.

## Abstract (250–300 words)

Background: Pain diaries and longitudinal symptom tracking are widely supported in chronic pain care. However, many mainstream pain-tracking apps are built around cloud dependence, account-centric workflows, and engagement mechanics that can feel coercive or unsafe—especially for people living with trauma. Empirical audits have documented privacy risks in accredited health apps, including opaque data transmission and weak safeguards (Huckvale et al.), and public polling shows widespread concern about health-app privacy (Teale).

Objective: To argue that privacy-first, offline-capable, trauma-informed, open-source architectures should be treated as the default standard for digital health tools—and that this standard must include coercion-resilient consent workflows to prevent institutional leverage from replacing corporate surveillance.

Methods: Using PainTracker.ca as a concrete countermodel (a progressive web app with offline-first behavior, local-only encrypted storage, no default telemetry, and crisis-aware UX), this paper analyzes how architectural choices and interaction patterns shift privacy risk, autonomy, psychological safety, and crisis usability compared with typical cloud-centered pain apps documented in prior audits. It also extends the analysis to implementation science: how patient-controlled sharing functions in time-pressured care, and how power asymmetry can convert “voluntary sharing” into coerced disclosure.

Results: Local-first architectures reduce structural privacy risk by removing centralized data hoards and third-party analytics pathways. Trauma-informed, crisis-aware UX improves usability under low-capacity conditions. However, patient-controlled sharing introduces a remaining vulnerability: in clinical contexts, dependency and gatekeeping can make export actions effectively mandatory. This paper therefore specifies coercion-resilient consent principles (minimum-necessary summaries, layered disclosure, refusal-safe alternatives, time-bounded access, and clinic-realistic implementation kits) and proposes measurable endpoints for coercion risk.

Conclusions: Privacy-first, offline-capable, trauma-informed, open-source tools should be a normative baseline for evaluation, procurement, and funding—paired with coercion-resilient clinical workflows that preserve autonomy under pressure. The question is no longer whether such tools are possible; it is whether institutions will choose them and protect patients from both corporate surveillance and institutional leverage.

## Keywords

privacy-by-design; offline-first; trauma-informed design; chronic pain; progressive web apps; implementation science; coercion-resilient consent

## I. Introduction

Digital health is marketed as a future where granular, real-time data powers individualized treatment. If that promise were real, chronic pain should be one of its clearest success stories. In Canada, the Canadian Pain Task Force estimates that about 7.6 million people—roughly one in five—live with chronic pain (Health Canada). Chronic pain is not only common; it is often lifelong and tightly bound up with disability, depression, substance use, and socioeconomic precarity (Health Canada). On paper, digital tools for tracking symptoms, function, and treatments should anchor humane, data-informed pain care.

The market moved fast. App stores are full of pain trackers, migraine diaries, and chronic illness apps with tens or hundreds of thousands of downloads. One Android pain app lists 100K+ downloads, indicating real demand (CareClinic). Clinicians are also nudged toward electronic questionnaires and patient-reported outcome measures. At UW Medicine’s Center for Pain Relief, the PainTracker questionnaire is completed prior to visits to monitor pain, mood, sleep, and function over time (University of Washington, “PainTracker”). This looks like an evidence-based success: pain research meets ubiquitous personal computing.

My lived experience said otherwise—and it aligns with known barriers to incorporating diary data into clinical reality. Marceau et al. report that physicians cited being too busy and often forgetting to incorporate diary summary data into visits (Marceau et al.). That “too busy” constraint is not a minor detail; it shapes what kinds of tools can survive implementation. As someone with chronic pain and trauma, I found many tools unusable during flares, cognitively overwhelming, and psychologically unsafe. Many demanded account creation, passwords, and constant connectivity precisely when I was exhausted, dissociated, or in severe distress. Others nagged me with notifications and streak metrics that felt less like support and more like compliance enforcement. The underlying message was clear: perform your pain inside our system, on our terms, or your pain does not count.

At the same time, empirical work shows that many health apps are structurally risky from a privacy perspective. In a systematic assessment of apps previously listed in the UK NHS Health Apps Library, Huckvale and colleagues found serious gaps: 89% (70/79) of apps transmitted information to online services; among apps sending identifying information, 20% (7/35) had no privacy policy and 66% (23/35) did so without encryption; and many privacy policies failed to clearly describe what data was included in transmissions (Huckvale et al.). Public surveys show a matching pattern: 64% of U.S. adults were concerned about the privacy of their health information on an app (Teale). Over and over, the system asks people in pain to trade away privacy and autonomy for hypothetical clinical benefit.

PainTracker.ca is a deliberate refusal of that trade. It is a privacy-first, offline-capable, trauma-informed progressive web app (PWA) that runs entirely in the browser and stores encrypted data locally rather than uploading it to remote servers. The codebase is open-sourced under the MIT license in the CrisisCore-Systems GitHub org (CrisisCore-Systems / pain-tracker). I built it for people like me: chronic pain patients and trauma survivors who need something that still works during their worst hours without quietly turning their suffering into somebody else’s data asset (CrisisCore Systems, “Trauma-Informed Design”; “Building a Pain Tracker”).

Two questions drive this paper:

1. How does PainTracker.ca respond—architecturally, ethically, and experientially—to the failures of mainstream digital pain tools?
2. What additional requirements (implementation science, coercion-resilient consent) are necessary so that patient-controlled sharing does not become coerced disclosure in clinical contexts?

## II. Chronic pain and why tracking still matters

### A. Chronic pain as structural public health crisis

Chronic pain is a structural public health problem, frequently interwoven with mental health conditions and substance use, and disproportionately affecting people facing marginalization and precarity (Health Canada). Many report being disbelieved or dismissed; that stigma can become a secondary trauma and distort care (Health Canada). Meanwhile, health systems remain optimized for acute problems and short visits, producing thin snapshots: a single 0–10 rating plus a rushed verbal summary of weeks of symptoms.

This is where tracking matters. Longitudinal, structured data can bridge the gap between lived reality and clinical decision-making. When diaries are done well, day-to-day experience can arrive in the clinic in a form another human can interpret and act on.

### B. Why diaries and systematic tracking still matter

Clinicians have long used pain diaries and questionnaires to record intensity, location, timing, and response to interventions. Early electronic diaries attempted to reduce recall bias, but implementation barriers persisted—especially time pressure and workflow mismatch (Marceau et al.).

Modern instruments like UW’s PainTracker questionnaire ask patients to report regularly on pain intensity, interference, mood, sleep, and other domains and provide clinicians visual trajectories to support decisions (University of Washington, “PainTracker”; CoMotion). Educational material aimed at patients echoes the same logic: consistent logging can help identify triggers and improve management by correlating symptoms with activities, medication, and context (“Using a Pain Diary”).

Three points are difficult to dispute:

* Pain is variable; a single rating cannot capture it.
* Tracking can be empowering when it reveals actionable patterns.
* Clinicians can make better decisions when they can see structured trends.

So the question is not whether to track, but how to architect tracking tools that do not reproduce surveillance, coercion, and trauma.

### C. Where paper and first-generation digital tools hit their limits

Paper diaries are easy to lose and hard to analyze. Early electronic tools were often bolted onto clinic workflows in ways that clinicians experienced as clumsy or time-consuming (Marceau et al.). Smartphones looked like the fix. In practice, many first-wave pain apps reproduced old problems and added new ones: bright glare, dense layouts, forced sign-up before value, long intake forms, tiny tap targets, multi-step flows that assumed stable attention (CrisisCore Systems, “Building a Pain Tracker”). During a flare—when pain, fatigue, and cognitive load spike—these are not inconveniences; they are hard stops.

Once diaries moved into the general app economy, another risk became unavoidable: intimate logs now lived on remote servers controlled by entities with incentives users have no reason to trust. A pain diary is not a step counter. It captures what someone did, what they took, how they slept, what they felt, and sometimes whether they wanted to live. Handing that over to someone else’s infrastructure is not a neutral act.

## III. What mainstream digital pain apps normalize

### A. Surveillance as default architecture (even in “trusted” app ecosystems)

Most pain apps live inside commercial ecosystems where sustainability is not primarily user payment but data-driven product loops. Analytics dashboards, third-party SDKs, centralized databases, and background telemetry follow naturally when users are treated as behavioral data streams. Huckvale et al.’s audit is especially damning because it examined apps in an accredited library context—meaning these failures are not limited to fringe apps; they can persist even under formal approval regimes (Huckvale et al.).

Pain data are especially sensitive. They intersect with disability claims, mental health, opioid prescribing, employment, and trauma histories. In hostile hands, such logs can be used to deny benefits, question credibility, or surveil behavior. Yet in typical architectures, large-scale centralization and long-term retention are treated as non-negotiable.

### B. Why people distrust these tools

Public distrust is rational. A survey reported that 64% of U.S. adults were concerned about the privacy of their health information on an app (Teale). For people living with chronic pain, disability, or trauma, the distrust can be sharper: logs can be used against them—by employers, insurers, agencies, or even clinicians. When privacy policies are vague or missing and audits show undisclosed transmission, fear is not paranoia; it is pattern recognition (Huckvale et al.).

### C. Trauma-uninformed UX as design harm

Even if privacy were perfect, many pain apps fail at the UX level. Chronic pain brings fatigue, cognitive fog, and unstable attention. Trauma layers in hypervigilance, shame, avoidance, and sudden drops in capacity. Tools that demand long sequences of micro-decisions or sustained focus do not match this reality.

Trauma-informed design emphasizes choice, transparency, emotional safety, and non-coercion (Danquah and Addae). Many apps violate these principles through streaks, gamified reminders that frame lapses as failure, mandatory long forms before value, and intrusive prompts that demand logging on the app’s schedule rather than the user’s.

### D. Clinician tools and institutional blind spots

Institutional tools like UW’s PainTracker operate inside EHR-linked regimes and generally have stronger governance than consumer apps (University of Washington, “PainTracker”; CoMotion). But their architectures still center institutional needs: centralized dashboards, billing codes, and quality metrics. Patients often become data providers for the system, with limited control over retention, export, or downstream use.

PainTracker.ca answers a different design question: How do we build something that primarily serves the person using it—and only secondarily, and on their terms, anyone else?

## IV. PainTracker.ca as countermodel: architecture-as-argument

### Table 1. Mainstream defaults vs PainTracker.ca (countermodel)

| Design axis      | Mainstream pain apps (typical)  | PainTracker.ca (countermodel)                         | Real-world impact on vulnerable users                                                              |
| ---------------- | ------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Data location    | Centralized backend by default  | Local-only by default (on-device)                     | Centralization amplifies breach, misuse, and secondary harm risk; local-first reduces blast radius |
| Connectivity     | Online-first; degraded offline  | Offline-first; identical offline                      | Crisis days and unstable housing often mean unstable connectivity; offline-first preserves access  |
| Identity         | Accounts/login as gate          | No account required                                   | Credential friction can block use during flares; no-login lowers abandonment                       |
| Data flow        | Telemetry/analytics SDKs common | Optional anonymous usage analytics (deploy-configured) | Reduces “quiet extraction” when disabled; requires clear defaults and user control when enabled    |
| Consent          | Broad, ongoing, hard to revoke  | Explicit, user-triggered export/share                 | Shifts control to user, but requires coercion-resilient workflows in clinical contexts             |
| Crisis usability | Dense forms, streaks, nudges    | Low-cognitive-load flows; crisis-aware simplification | Respects capacity collapse; reduces shame cycles and drop-off                                      |
| Trust model      | “Trust the vendor”              | Inspectable open-source code + minimal exposure       | Verifiability substitutes for trust; supports accountable adoption                                 |

### A. Origin and non-negotiable constraints

PainTracker.ca began with frustration and a simple threat to myself: if no existing app is livable, build one that is. Under the CrisisCore-Systems umbrella, I set hard constraints:

* The app must function fully offline.
* Network calls should be optional and user-controlled; avoid transmitting sensitive content by default.
* The interface must be usable under low-capacity conditions.
* The code must be open so claims are inspectable.

These constraints are documented in the build logs and essays (“Building a Healthcare PWA”; “Building a Pain Tracker”; “Trauma-Informed Design”).

### B. Architectural choices: offline-first, local-only, no default telemetry

The central move is straightforward: treat the device as the system. A service worker caches the app shell; local storage (eg, IndexedDB) holds user data; behavior is identical online or offline. The repository includes optional analytics and other network-capable features that can be enabled/disabled; the privacy goal is to keep sensitive content local by default and make any sharing or telemetry explicit and minimal.

This design removes entire risk classes:

* no centralized database to breach or misconfigure
* no vendor unilateral policy shift that repurposes user logs
* no bulk dataset to monetize

The trade-offs are real: no automatic multi-device sync, no seamless EHR integration, and no vendor-managed backups. PainTracker.ca chooses explicit user-controlled export as the ethical default.

### C. Trauma-informed and crisis-aware UX (local adaptation without spying)

Architecture is the skeleton; UX is the nervous system. The interface is designed for the possibility that the user is not okay:

* reduced glare and visual overload
* large tap targets
* shallow navigation
* short flows where only essential questions show by default

PainTracker.ca also experiments with a local rules engine meant to detect “strain” without surveillance. It uses only local signals (eg, spikes in pain scores and skipped entries) and adapts the interface locally. A simple illustrative rule might be: multiple days of skipped entries combined with high recent pain scores triggers a “simplify mode” that reduces fields and shortens flows. Crucially: no external notifications, no clinician alerts, no emergency contact triggers, and no data leaving the device.

This is what “local math, not cloud AI” looks like as a trauma-informed pattern: supportive adaptation without extraction (CrisisCore Systems, “Trauma-Informed Design”; Danquah and Addae).

### D. Open source as ethical infrastructure (inspectability, accountability, reuse)

Open source is not a branding choice; it is ethical infrastructure. In an ecosystem where privacy policies often fail to describe actual data flows (Huckvale et al.), inspectability is part of safety. The PainTracker.ca repository is MIT-licensed (CrisisCore-Systems / pain-tracker), enabling audit, reuse, and adaptation without licensing friction.

### E. A misfit position and governance advantage

PainTracker.ca is not a platform, does not monetize data, and resists default cloud patterns. It behaves like a local utility that anyone can run. This “misfit” has a governance advantage: independence from surveillance-driven funding keeps the roadmap user-first rather than investor-first. If sustainability requires support, it should be acknowledged transparently rather than hidden behind extraction.

## V. Strengths, limitations, and the missing vulnerability: coercion

### A. What the countermodel gets right

The primary strength is structural: there is no centralized hoard of pain data waiting to leak. The usual horror scenarios for health apps—misconfigured cloud storage, undisclosed sharing, sudden policy shifts—do not apply in the same way. The local-only model also changes the emotional climate of logging: honesty becomes safer when the system cannot silently export it. Offline-first behavior remains essential in low-connectivity conditions.

### B. Known limitations (integration, backups, research aggregation)

The same choices that protect users make integration harder. Clinicians cannot “just log in.” Sharing requires deliberate action: screen-sharing, printing, or export. Device loss can mean data loss; encrypted user-triggered backups become necessary. For researchers, the absence of passive aggregation constrains conventional big-data analytics; consented exports become the ethical gateway.

### C. The epistemic gap: what RCTs measure vs what trauma-informed tools must prevent

Earlier drafts risked implying—without stating—that standard RCT frameworks are the problem. The claim here is narrower and more defensible: RCTs can be useful for certain clinical endpoints (eg, symptom trajectories), but trauma-informed tools require evaluation regimes that also measure capacity collapse, psychological safety, and coercion risk. A tool can “improve adherence” while increasing fear-driven compliance or suppressing honest reporting. If those harms are not measured, they can be mistaken for success.

### D. The implementation science gap that becomes a power problem

Earlier versions acknowledged that patient-controlled sharing requires deliberate action from clinicians. The deeper vulnerability is not just friction. It is power asymmetry.

Even if a tool requires an explicit export action, the social conditions of care can make sharing effectively mandatory. If a clinician implies that care, medication continuation, or credibility depends on producing a diary, the patient’s “choice” becomes constrained by dependency and fear. In that scenario, the architecture protects against corporate surveillance but may not protect against institutional coercion.

A trauma-informed system cannot define consent solely as a UI action. Consent is a social relation embedded in power structures. If the tool is to be ethically coherent, it must be designed not only against corporate extraction but against coercive contexts of use.

## VI. Why this architecture should be the default standard—and what the standard must include

### A. Turning bioethics into engineering constraints

Autonomy means the option to keep data on-device, to decide if and when to share, and to revoke sharing without pleading with a vendor. A local-only, export-based architecture supports that.

Beneficence and non-maleficence mean reducing new harms introduced by digital implementation: breaches, misuse, re-traumatization, and coercive logging demands (Huckvale et al.; Danquah and Addae).

Justice means recognizing that chronic pain and surveillance both weigh heaviest on marginalized groups. Safer-by-default architectures matter most for those who have the least margin for secondary harm. Open source also advances justice by enabling adoption and adaptation without per-seat licensing.

### B. Baseline requirements for ethical digital health tools

The baseline expectation should be:

* Local-first by default, with opt-in, scoped, revocable remote storage only when necessary.
* No default telemetry; data minimization as a default behavior, not a toggle.
* Trauma-informed UX evaluated for emotional safety, transparency, non-coercion (Danquah and Addae).
* Inspectability of data flows and critical logic (open source or equivalent independent audit).
* Coercion-resilient consent: design and workflow requirements that preserve autonomy under pressure.

These map naturally onto data minimization and purpose limitation principles referenced across privacy regimes (including Canadian frameworks such as PIPEDA and provincial health information laws), and they reduce breach and third-party risk surfaces in ways institutions can operationally value (PIPEDA; PHIPA).

### C. Consent is not a button: coercion-resilient sharing principles

Patient-controlled export is necessary but insufficient. A coercion-resilient system should implement:

1. Minimum-necessary summaries by default
   Default export should be a one-page clinician summary optimized for time-pressured care, not raw diaries.

2. Layered disclosure and redaction controls
   Sharing should be granular: time ranges, domains (sleep, mood, meds), and free-text notes should be independently shareable. Patients should be able to generate a “clinical-safe” export excluding sensitive narrative content.

3. Refusal-safe workflows and non-retaliation norms
   Patients must be able to decline sharing without punishment or implied denial of care. When documentation is requested, privacy-preserving alternatives must exist.

4. Time-bounded access and patient-held control
   Prefer screen-sharing, printed summaries, or time-bounded access mechanisms that reduce permanent institutional retention when feasible.

5. Implementation kits designed for clinic reality
   Tools should ship with clinic-adapted workflows: pre-visit export steps, standard summary formats, staff instructions, and scripts that normalize autonomy.

These principles do not claim to make coercion impossible; they aim to make it harder, reduce its blast radius, and create refusal-safe pathways.

### D. Why institutions would choose to limit themselves: a theory of adoption under constraint

Coercion-aware architecture is necessary but not sufficient. The unresolved question is why institutions—clinics, health systems, insurers, regulators—would adopt models that reduce informational control. The answer is incentive alignment.

First, local-first, no-telemetry architectures function as institutional risk controls. By eliminating centralized data hoards and third-party analytics dependencies, they reduce breach surface area, vendor exposure, and secondary data-sharing pathways. In operational terms, data minimization reduces incident likelihood and magnitude, lowers response burden, and limits downstream harms from misconfiguration.

Second, coercion-resilient sharing reduces clinical conflict. In time-pressured care, clinicians may default to “give me everything” because negotiation takes time. Summary-first exports and layered disclosure replace an all-or-nothing dynamic with structured necessity, which can be faster than raw-log review and less adversarial than “hand it over.”

Third, patient-controlled models can be implemented without adding appointment friction if workflow design is treated as part of the intervention, not an afterthought. A practical default is a pre-visit summary export that takes under 60 seconds, supported by standardized formats and clinic scripts that normalize patient autonomy. Where a patient declines, refusal-safe alternatives prevent punitive denial-of-care dynamics.

Finally, adoption accelerates when procurement and funding frameworks reward privacy-preserving defaults. When purchasers require auditable minimization and refusal-safe sharing options, institutions and vendors adapt. In this view, the question is not whether institutions surrender power out of goodwill, but whether the ecosystem makes privacy-first, coercion-resilient practice the path of least resistance.

### E. A time-pressured visit workflow: how this works in practice

A common objection is that patient-controlled sharing cannot survive short appointments. This is only true if “sharing” means exporting raw diaries. A coercion-resilient workflow is summary-first:

1. Before the visit, the patient generates a one-page summary (last 14–30 days) with trends, key triggers, medication response, and a short “what I need today” section.
2. In the visit, the clinician reviews the summary (30–90 seconds), asks targeted questions, and requests additional domains only if clinically necessary.
3. If the patient declines further sharing, the clinician uses refusal-safe alternatives (brief structured questionnaires or functional prompts) without punitive signaling.
4. Documentation focuses on minimum-necessary clinical content rather than raw logs, reducing long-term institutional retention of sensitive narrative data.

This workflow treats the diary as primarily for the patient; clinical sharing is a secondary, harm-reduced interface.

### F. The opioid prescribing and disability claims “hard case”

In high-stakes contexts (eg, opioid prescribing regimes, disability adjudication), coercion can be structural rather than interpersonal. If documentation is treated as a condition of care, “voluntary sharing” becomes constrained disclosure. In these cases, privacy-first tools cannot fully prevent coercion; they can only reduce its blast radius through minimum-necessary summaries, granular domain sharing, and refusal-safe alternatives. Where policies mandate surveillance beyond clinical necessity, the ethical problem is not a missing UX feature but a governance failure that requires policy-level correction.

## VII. What needs to be studied next (including coercion as an endpoint)

If privacy-first, coercion-resilient architectures are to move from GitHub into mainstream practice, research must evaluate both clinical outcomes and power-context harms.

* Head-to-head studies (mixed-methods): Compare local-only tools with typical cloud-based apps on adherence, data completeness, trust, privacy anxiety, and clinical outcomes—paired with qualitative interviews focused on perceived safety and honesty under use (Health Canada; “Using a Pain Diary”; University of Washington, “PainTracker”).
* Operationalizing trauma-informed UX: Develop measures of perceived safety, shame activation, re-traumatization, and cognitive load during app use, and test how specific patterns affect these measures (Danquah and Addae).
* Coercion and consent-under-asymmetry as endpoints: Measure perceived pressure to share, fear of care denial, conditionality experiences, and downstream avoidance of care due to privacy concerns. Evaluate whether layered disclosure and refusal-safe workflows reduce these harms.
* Implementation science in real clinics: Test clinic workflows (pre-visit summary generation, standard formats, staff scripts) and evaluate feasibility, clinician burden, fidelity, and sustainability under time constraints (Marceau et al.).
* Participatory studies with high-risk cohorts: Include housing-insecure, disability-claim-exposed, and trauma-surviving participants—groups whose capacity gaps and coercion risks are often excluded from “general user” samples.
* Privacy-preserving interoperability: Experiment with user-triggered encrypted exports and privacy-preserving aggregation approaches that do not recreate centralized surveillance.

Contribution statement: This paper contributes (1) a design-based critique of surveillance-centered pain apps, (2) an implemented countermodel demonstrating feasibility of offline, local-only, trauma-informed architecture, (3) a coercion-resilient consent framework for clinical deployment, and (4) a research and implementation agenda that treats coercion risk and psychological safety as measurable outcomes.

## VIII. Conclusion

Chronic pain shapes millions of lives, and there is solid evidence that structured tracking can improve management and strengthen patient–provider communication (Health Canada; “Using a Pain Diary”; University of Washington, “PainTracker”). Digital tools should be the obvious way to scale that.

Instead, the current landscape is dominated by surveillance-aligned architectures and trauma-uninformed UX. Audits show that even accredited health apps can transmit data in ways users cannot meaningfully evaluate (Huckvale et al.). Public polling reveals widespread distrust (Teale). People living with pain are repeatedly asked to trade away privacy and autonomy for tools that often fail them when they need help most (CrisisCore Systems, “Building a Pain Tracker”; “Trauma-Informed Design”).

PainTracker.ca is a working proof that it is technically straightforward to build a useful health tool that does not spy: local-only encrypted storage, offline-first behavior, crisis-aware UX, and open-source inspectability. But a final hard truth remains: architecture alone cannot guarantee autonomy if clinical power can turn sharing into compliance. A default standard worthy of the name must pair privacy-first technical design with coercion-resilient workflows—minimum-necessary summaries, granular sharing, refusal-safe alternatives, and clinic-realistic implementation supports.

The stakes reach far beyond chronic pain. The same logic applies to mental health, reproductive health, HIV adherence, and any domain where logs intersect with stigma and power. The real question is no longer whether privacy-first, trauma-informed, open-source tools are possible. The question is whether funders, regulators, and institutions are willing to choose them—and willing to protect patients not only from corporate surveillance, but from institutional leverage.

## Works Cited

CareClinic. Pain Tracker – CareClinic – Apps on Google Play. Google Play Store,
[https://play.google.com/store/apps/details?hl=en_CA&id=com.careclinicsoftware.careclinic&listing=chronic-pain-tracker-app](https://play.google.com/store/apps/details?hl=en_CA&id=com.careclinicsoftware.careclinic&listing=chronic-pain-tracker-app). Accessed 1 Dec. 2025.

CrisisCore Systems. “Building a Healthcare PWA That Actually Works When It Matters.” DEV Community, posted 27 Nov. 2025,
[https://dev.to/crisiscoresystems/building-a-healthcare-pwa-that-actually-works-when-it-matters-md4](https://dev.to/crisiscoresystems/building-a-healthcare-pwa-that-actually-works-when-it-matters-md4). Accessed 1 Dec. 2025.

—. “Building a Pain Tracker That Actually Gets It — No Market Research Required.” DEV Community, posted 30 Nov. 2025,
[https://dev.to/crisiscoresystems/building-a-pain-tracker-that-actually-gets-it-no-market-research-required-4511](https://dev.to/crisiscoresystems/building-a-pain-tracker-that-actually-gets-it-no-market-research-required-4511). Accessed 1 Dec. 2025.

—. “Trauma-Informed Design Left Everyone Asking: ‘How Does It Actually Know I’m Struggling without Spying?’” DEV Community, posted 29 Nov. 2025; edited 14 Dec. 2025,
[https://dev.to/crisiscoresystems/trauma-informed-design-left-everyone-asking-how-does-it-actually-know-im-struggling-without-26a0](https://dev.to/crisiscoresystems/trauma-informed-design-left-everyone-asking-how-does-it-actually-know-im-struggling-without-26a0). Accessed 1 Dec. 2025.

Danquah, Shaun, and Paul Addae. “Why Trauma-Informed Digital Design Is Relevant in 2022.” Centric, 1 Aug. 2022,
[https://centric.org.uk/blog/why-trauma-informed-digital-design-is-relevant-in-2022](https://centric.org.uk/blog/why-trauma-informed-digital-design-is-relevant-in-2022). Accessed 1 Dec. 2025.

Health Canada. Canadian Pain Task Force Report: March 2021. Government of Canada,
[https://www.canada.ca/en/health-canada/corporate/about-health-canada/public-engagement/external-advisory-bodies/canadian-pain-task-force/report-2021.html](https://www.canada.ca/en/health-canada/corporate/about-health-canada/public-engagement/external-advisory-bodies/canadian-pain-task-force/report-2021.html). Accessed 1 Dec. 2025.

Marceau, L. Diane, et al. “In-Clinic Use of Electronic Pain Diaries: Barriers of Implementation among Pain Physicians.” Journal of Pain and Symptom Management, vol. 40, no. 3, 2010, pp. 391–404. doi:10.1016/j.jpainsymman.2009.12.021.
PubMed: [https://pubmed.ncbi.nlm.nih.gov/20580526/](https://pubmed.ncbi.nlm.nih.gov/20580526/). PubMed Central: [https://pmc.ncbi.nlm.nih.gov/articles/PMC2934898/](https://pmc.ncbi.nlm.nih.gov/articles/PMC2934898/). Accessed 1 Dec. 2025.

Huckvale, K., et al. “Unaddressed Privacy Risks in Accredited Health and Wellness Apps: A Cross-Sectional Systematic Assessment.” BMC Medicine, vol. 13, 2015, article 214,
[https://bmcmedicine.biomedcentral.com/articles/10.1186/s12916-015-0444-y](https://bmcmedicine.biomedcentral.com/articles/10.1186/s12916-015-0444-y). Accessed 1 Dec. 2025.

“Using a Pain Diary.” News-Medical Life Sciences, 2019,
[https://www.news-medical.net/health/Using-a-Pain-Diary.aspx](https://www.news-medical.net/health/Using-a-Pain-Diary.aspx). Accessed 1 Dec. 2025.

University of Washington. “PainTracker Patient Questionnaire.” UW Medicine Center for Pain Relief,
[https://paintracker.uwmedicine.org](https://paintracker.uwmedicine.org). Accessed 1 Dec. 2025.

—. “PainTracker.” CoMotion at the University of Washington,
[https://els2.comotion.uw.edu/product/paintracker](https://els2.comotion.uw.edu/product/paintracker). Accessed 1 Dec. 2025.

Teale, Chris. “A Major Obstacle to Tech Companies Developing Health Apps: About 2 in 3 Adults Worry About Their Privacy.” Morning Consult Pro, 1 Oct. 2021,
[https://pro.morningconsult.com/articles/health-tech-tracking-apps-data-privacy-poll](https://pro.morningconsult.com/articles/health-tech-tracking-apps-data-privacy-poll). Accessed 1 Dec. 2025.

Personal Information Protection and Electronic Documents Act (PIPEDA). Justice Laws Website (Government of Canada),
[https://laws-lois.justice.gc.ca/eng/acts/p-8.6/](https://laws-lois.justice.gc.ca/eng/acts/p-8.6/). Accessed 1 Dec. 2025.

Personal Health Information Protection Act, 2004 (PHIPA). CanLII,
[https://www.canlii.org/en/on/laws/stat/so-2004-c-3-sch-a/latest/so-2004-c-3-sch-a.html](https://www.canlii.org/en/on/laws/stat/so-2004-c-3-sch-a/latest/so-2004-c-3-sch-a.html). Accessed 1 Dec. 2025.

PainTracker.ca. CrisisCore Systems, [https://paintracker.ca/](https://paintracker.ca/). Accessed 1 Dec. 2025.

CrisisCore-Systems / pain-tracker. GitHub, [https://github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker). Accessed 1 Dec. 2025.

---

[![Pain Tracker - Privacy-first PWA for chronic pain tracking & management | Product Hunt](https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1063103&theme=light)](https://www.producthunt.com/products/pain-tracker?utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-pain-tracker)