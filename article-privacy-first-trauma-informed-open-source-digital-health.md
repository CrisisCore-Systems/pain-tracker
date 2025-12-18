# Privacy-first, offline-capable, trauma-informed, open-source health tools should be the default

<!-- markdownlint-disable MD013 -->

Most pain-tracking apps I tried made me want to throw my phone across the room.

The evidence for pain diaries is strong, and chronic pain is everywhere,
but most tools feel like surveillance systems pretending to be care.
They prioritize data extraction, cloud integration, and paternalistic UX
over privacy, autonomy, and trauma awareness.

Drawing on the design choices, architecture, and open-source ecosystem around PainTracker.ca
(plus the Dev.to build logs, the X account, and the CrisisCore-Systems GitHub org),
I argue that privacy-first, offline-capable, trauma-informed, open-source tools
should become the default standard in digital health.
They not only serve people living with chronic pain better,
they offer a realistic way to reconcile clinical usefulness
with ethical duties around data governance, user control, and psychological safety.

## Abstract

*Background:* Pain diaries and longitudinal symptom tracking are widely supported in chronic pain care.
However, many mainstream pain-tracking apps are built around cloud dependence, account-centric workflows,
and engagement mechanics that can feel coercive or unsafe—especially for people living with trauma.

*Objective:* To argue that privacy-first, offline-capable, trauma-informed, open-source architectures
should be treated as the default standard for digital health tools.

*Methods:* Using PainTracker.ca (a privacy-first, offline-capable, trauma-informed progressive web app)
as a countermodel, this paper analyzes how architectural choices (local-only encrypted storage,
explicit user-triggered sharing, and absence of default telemetry) and crisis-aware UX patterns
shift privacy risk, user autonomy, and usability under low-capacity conditions.

*Results:* Centralized, surveillance-aligned architectures expose users to misuse, breach,
and secondary harms—including stigma or disability-claim risks—and often fail core crisis-usability
requirements. The countermodel reduces structural privacy risk by removing centralized data hoards,
improves psychological safety by aligning with trauma-informed principles (choice, transparency,
and non-coercion), and preserves clinical usefulness through exportable summaries.

*Conclusions:* The trade-offs of local-first design (eg, reduced seamless multi-device sync and
constrained passive population analytics) are framed as ethically appropriate defaults rather than
limitations to be “fixed” via surveillance. When centralization is necessary, it should be narrowly
scoped, user-consented, and auditable. Privacy-first, trauma-informed, open-source implementations
should be treated as a baseline for the ethical evaluation, procurement, and funding of digital health
software—not just pain-tracking tools.

## Keywords

privacy-by-design; offline-first; trauma-informed design; chronic pain; progressive web apps

## I. Introduction

Digital health is marketed as a future where granular, real-time data powers individualized treatment.
If that promise were real, chronic pain should be one of its clearest success stories.
In Canada, the Canadian Pain Task Force estimates that millions of people live with chronic pain (Health Canada).
Chronic pain is often lifelong and tightly bound up with disability,
depression, substance use, and socioeconomic precarity (Health Canada).
On paper, it is obvious that digital tools for tracking symptoms, function, and treatments
could anchor humane, data-informed pain care.

The market moved fast.
App stores are full of “pain tracker,” “migraine diary,” and “chronic illness” apps
with tens or hundreds of thousands of downloads.
One Android pain-tracking app, for example, lists 100K+ downloads,
which tells us that people in pain are actively searching for something that works (CareClinic).
Clinicians are also nudged toward electronic questionnaires and patient-reported outcome measures.
At UW Medicine’s Center for Pain Relief, the PainTracker questionnaire is completed prior to visits
to monitor pain, mood, sleep, and function over time (University of Washington, “PainTracker”).
On the surface, this looks like an evidence-based success:
pain research meets ubiquitous personal computing.

My lived experience said otherwise.
As someone with chronic pain and trauma,
I found that the very tools supposedly built for me
were often unusable during flares, cognitively overwhelming, and psychologically unsafe.
Many apps demanded account creation, passwords, and constant connectivity
precisely when I was exhausted, dissociated, or in severe distress.
Others nagged me with notifications and streak metrics
that felt less like support and more like compliance enforcement.
The underlying message was clear:
perform your pain inside our system, on our terms, or your pain does not count.

At the same time, empirical work shows that these tools are structurally risky
from a privacy perspective.
In a systematic assessment of apps previously listed in the UK NHS Health Apps Library, Huckvale and colleagues found serious gaps: 89% (70/79) of apps transmitted information to online services; among apps sending identifying information, 20% (7/35) had no privacy policy and 66% (23/35) did so without encryption; and many privacy policies failed to clearly describe what data was included in transmissions (Huckvale et al.).
Public surveys show a matching pattern:
64 percent of U.S. adults were concerned about the privacy of their health information on an app (Teale).
Over and over, the system asks people in pain to trade away privacy and autonomy
in exchange for hypothetical clinical benefit.

PainTracker.ca is a deliberate refusal of that trade.
It is a privacy-first, offline-capable, trauma-informed Progressive Web App (PWA)
that runs entirely in the browser and stores encrypted data locally
instead of uploading it to remote servers.
The codebase is open-sourced under the MIT license in the CrisisCore-Systems GitHub org
(CrisisCore-Systems / pain-tracker).
I built it for people like me:
chronic pain patients and trauma survivors who need something that still works
during their worst hours without quietly turning their suffering
into somebody else’s data asset (CrisisCore Systems, “Trauma-Informed Design”; “Building a Pain Tracker”).

*Framing note (genre/method):* This is a design-based argument grounded in lived experience
and a public, inspectable implementation.
It treats the architecture and interaction design of a working system as evidence about what is
technically feasible and what kinds of harms are structurally produced (or prevented)
by default patterns in digital health.

Two questions drive this essay:

1. How does PainTracker.ca respond—architecturally, ethically, and experientially—
   to the failures of mainstream digital pain tools?
2. Can its combination of offline-first architecture, strict local storage,
   trauma-informed UX, and open-source transparency
   serve as a normative benchmark for digital health more broadly?

I proceed in seven sections.
Section II outlines the epidemiology of chronic pain and the evidence base for pain tracking.
Section III dissects mainstream digital pain apps as a surveillance-driven, paternalistic paradigm.
Section IV explains how I designed PainTracker.ca as a countermodel.
Section V evaluates its strengths, limitations, and unresolved tensions.
Section VI builds the normative and policy argument.
Section VII sketches a research agenda.
I close by arguing that digital health must stop extracting more data from suffering bodies
and instead return control, dignity, and safety to the people living in those bodies.

## II. Chronic pain and why tracking still matters

### A. Chronic pain as structural public health crisis

Chronic pain is not a niche complaint; it is a structural public health problem. The Canadian Pain Task Force estimates that about 7.6 million people in Canada—roughly one in five people in Canada—live with chronic pain (Health Canada). They stress that chronic pain is frequently interwoven with mental health conditions and substance use, and it disproportionately affects women, older adults, Indigenous people, and those with low income or precarious employment (Health Canada). Pain amplifies existing inequities rather than sitting beside them.

The consequences are severe: reduced function, disturbed sleep, depression, anxiety, lost productivity, early retirement, heavy health-care utilization, and complex medication regimens. Many people report being disbelieved, shamed, or dismissed by providers; that stigma becomes a secondary trauma and compounds harm and distorts care (Health Canada). International data tell a similar story: prevalence estimates in many countries hover around 20–30 percent of adults, with major personal and economic costs.

Meanwhile, health systems are still built for acute problems and short visits. Primary care clinicians usually see only thin snapshots of a patient’s pain: a single 0–10 rating taken under time pressure plus a rushed verbal summary of weeks’ worth of symptoms. The dynamic, contextual nature of pain—the way it responds to sleep, stress, movement, mood, weather, and medication—remains largely invisible at the point of care.

This is where tracking matters. Longitudinal, structured data can bridge the gap between lived reality and clinical decision-making. When diaries are done well, they allow my day-to-day experience to arrive in the clinic in a form another human can interpret and act on.

### B. Why diaries and systematic tracking still matter

Long before smartphones, clinicians relied on paper pain diaries and questionnaires to record intensity, location, quality, timing, and response to interventions. Early electronic diaries on dedicated devices or clinic terminals tried to reduce recall bias and missing data, but they brought their own friction: Marceau et al. report that physicians cited being too busy and often forgetting to incorporate diary summary data into visits (Marceau et al.).

Modern instruments like the University of Washington’s PainTracker questionnaire build on this history. PainTracker asks patients to report regularly on pain intensity, interference, mood, sleep, and other domains, and it gives clinicians visual trajectories to support treatment decisions (University of Washington, “PainTracker”). Because it is embedded in routine care, it functions both as a clinical tool and a quality-improvement system (University of Washington, CoMotion).

Educational material aimed at patients echoes the same logic. News-Medical’s overview of pain diaries argues that consistent logging can help identify triggers, plan around flare patterns, and improve management by correlating symptoms with activities, medications, and context (“Using a Pain Diary”). Diaries can also strengthen communication by moving conversations beyond vague recollections toward shared inspection of concrete patterns.

From all of this, three points are hard to dispute:

- Pain is variable; a single rating cannot capture it.
- Tracking can be empowering, especially when it reveals patterns patients can act on.
- Clinicians make better decisions when they can see structured trends instead of relying on memory.

My problem is not with tracking itself. It is with the way tracking has been implemented in mainstream digital tools.

### C. Where paper and first-generation digital tools hit their limits

Paper diaries and early electronic systems did real work but had predictable weaknesses. Paper is easy to lose, damage, or under-use, and hard to analyze. Early electronic diaries were often bolted onto clinic workflows in ways that clinicians experienced as clumsy and time-consuming (Marceau et al.).

Smartphones looked like the fix: always-with-you devices, rich UIs, cheap storage, and constant connectivity. In practice, many first-wave pain apps reproduced old problems and added new ones.

When I systematically tested pain apps from the stores, certain patterns kept repeating: bright, high-glare screens; dense layouts; mandatory registration before a single entry; long intake forms; tiny tap targets; and multi-step flows that assumed steady attention (CrisisCore Systems, “Building a Pain Tracker”). During a flare—when pain, fatigue, and cognitive load spike—these are not minor inconveniences; they are hard stops.

Once diaries moved into the general app economy, another risk became unavoidable: intimate data now lived on remote servers, owned and controlled by companies whose incentives I had no reason to trust. A pain diary is not a step counter. It captures what I did, what I took, how I slept, what I felt, and sometimes whether I wanted to live. Handing that over to someone else’s infrastructure is not a neutral act.

Two truths kept colliding:

- We do need good tracking.
- The tools we are offered are often unacceptable.

That contradiction is what pushed me toward building my own system.

## III. What I saw when I looked closely at mainstream digital pain apps

### A. Surveillance as default architecture

Most pain apps live inside commercial ecosystems. Their sustainability rarely depends on patients paying for the product; it depends on data. Business models lean on analytics dashboards, “insights,” partnerships, or broader wellness platforms. Once a company treats users primarily as behavioral data streams, accounts, centralized databases, third-party analytics SDKs, and background telemetry follow almost automatically.

In a systematic assessment of apps previously listed in the UK NHS Health Apps Library, Huckvale and colleagues found serious gaps: 89% (70/79) of apps transmitted information to online services; among apps sending identifying information, 20% (7/35) had no privacy policy and 66% (23/35) did so without encryption; and many privacy policies failed to clearly describe what data was included in transmissions (Huckvale et al.).

Pain data are especially sensitive. They intersect with disability claims, mental health, opioid prescribing, employment status, and trauma histories. In hostile hands, such logs can be used to deny benefits, question credibility, or surveil behavior. Yet in typical architectures, large-scale centralization and long-term retention are treated as non-negotiable.

When the main design unit is the backend table, not the person in pain, diaries become raw fuel—for engagement algorithms, risk scores, predictive models, or product roadmaps. Even promises of “deidentified” data do not change the basic asymmetry: the company keeps control.

### B. Why people distrust these tools

The public is not blind to this dynamic. A Morning Consult survey reported that 64 percent of U.S. adults were concerned about the privacy of their health information on an app (Teale).

For people living with chronic pain, disability, or trauma, the distrust is sharper. Community conversations are full of stories about apps that feel more like surveillance than support. Some users worry that their logs could later be used against them—to discredit their pain, attack their character, or undermine disability claims. If you have already been gaslit by professionals, the idea of pouring intimate details into an opaque corporate backend feels dangerous.

When privacy policies are vague or missing, and when work like Huckvale et al.’s shows that policies often fail to clearly describe what data are transmitted, that fear is rational (Huckvale et al.).

PainTracker.ca assumes that people with these experiences will never fully trust a system that demands centralization by default. So instead of asking for trust, the architecture removes the need: there is no remote database to hand your diary to.

### C. Trauma-uninformed UX as design harm

Even if privacy were perfect, most pain apps would still fail at the UX level. Chronic pain brings fatigue, cognitive fog, and unstable attention. Trauma layers in hypervigilance, shame, avoidance, and sudden drops in capacity. Tools that demand long sequences of micro-decisions, fine motor precision, or sustained focus simply do not match that reality.

In my build log, I describe testing apps until “every single one” made me want to throw my phone because of glare, clutter, forced sign-up flows, and long questionnaires on first launch (CrisisCore Systems, “Building a Pain Tracker”). These designs implicitly say, “Prove you’re worthy of access” rather than, “What can you handle right now?”

Trauma-informed design offers a different lens. Danquah and Addae argue that digital systems can reproduce trauma by mimicking surveillance and coercion, and they identify principles such as choice, transparency, emotional safety, and non-coercion as core design obligations (“Why Trauma-Informed Digital Design Is Relevant”). Many pain apps violate these principles:

- streaks and gamified reminders that frame lapses as failure
- long mandatory forms before any value is delivered
- intrusive prompts that demand “rate your pain now” on the app’s schedule

These patterns treat people primarily as data sources, not as humans whose capacity and safety fluctuate.

### D. Clinician tools and their blind spots

Not all digital pain systems are consumer apps. Tools like UW’s PainTracker live inside institutional privacy regimes and EHRs (University of Washington, “PainTracker”; CoMotion). They generally have better governance than commercial apps.

But here too, the architecture centers institutional needs: centralized databases, dashboards, billing codes, and quality metrics. Patients become data providers for the system. Their control over their information is usually limited to portal views and constrained export options.

The core design question becomes, “How do we get structured data from patients into our workflows?” instead of, “What does this feel like for someone actually living with this pain?”

PainTracker.ca answers a different question: “How do we build something that primarily serves the person using it—and only secondarily, and on their terms, anyone else?”

## IV. PainTracker.ca as countermodel

### Quick comparison: mainstream defaults vs. PainTracker.ca

| Design axis | Mainstream pain apps (typical) | PainTracker.ca (countermodel) |
| --- | --- | --- |
| Data location | Centralized backend by default | Local-only by default (on-device) |
| Connectivity | Online-first; degraded offline | Offline-first; identical offline |
| Identity | Accounts/login as gate | No account required |
| Data flow | Background telemetry/analytics common | No default telemetry; no “phone home” |
| Consent | Broad, ongoing, hard to revoke | Explicit, user-triggered export/share |
| Crisis usability | Dense forms, streaks, push nudges | Low-cognitive-load flows; crisis-aware simplification |
| Trust model | “Trust the vendor” | Inspectable code + minimal data exposure |

### A. Origin and non-negotiable constraints

PainTracker.ca began with frustration and a simple threat to myself: if no existing app is livable, build one that is.

Under the CrisisCore Systems umbrella, I set several hard constraints:

- The app must function fully offline.
- The app must never send my data anywhere without an explicit, deliberate action from me.
- The interface must be usable “with one hand, half a brain, and tears in my eyes.”
- The code must be open so anyone can verify what it does.

I documented this publicly in articles like “Building a Healthcare PWA That Actually Works When It Matters” and “Building a Pain Tracker That Actually Gets It—No Market Research Required” (CrisisCore Systems, “Building a Healthcare PWA”; “Building a Pain Tracker”). The end result is the PWA at PainTracker.ca plus an open repository and a running build log on Dev.to and X.

### B. Architectural choices: offline-first, local-only

The central architectural move is straightforward: treat the device as the system.

PainTracker.ca uses standard PWA patterns. A service worker caches the app shell. IndexedDB (or a similar local store) holds all user data. The app does not require connectivity to function. If you are in a rural motel, a hospital basement, or a waiting room with unstable Wi-Fi, the behavior is identical.

Equally important: the app does not silently transmit logs to any server. In my trauma-informed design write-up, I put it plainly: the app “runs entirely in your browser, keeps your data on your device, and never phones home” (CrisisCore Systems, “Trauma-Informed Design”). Where encryption is used, it is applied to protect local data rather than to stage it for default cloud sync.

This design eliminates whole categories of risk:

- no centralized databases to breach or misconfigure
- no vendor with unilateral power to change policy and repurpose data
- no bulk pain datasets for sale

It is my architectural answer to the failures documented by Huckvale et al. and the fears surfaced by public polling (Huckvale et al.; Teale).

The trade-offs are real: no automatic multi-device sync, no seamless EHR integration, no vendor-managed backups. I chose explicit, user-controlled exports over default data hoarding.

### C. Trauma-informed and crisis-aware UX

Architecture is the skeleton; UX is the nervous system. The interface had to assume that the user might be not okay.

I designed the UI on the assumption that the person holding the phone might be in a pain flare or an emotional crash:

- muted color palette instead of hard white glare
- large tap targets
- shallow navigation with minimal nesting
- short flows where only essential questions show by default

In the build log, I describe repeatedly cutting fields and interactions that added cognitive load without materially improving the value of the diary (CrisisCore Systems, “Building a Pain Tracker”).

One of the more experimental elements is the local crisis-detection engine. I wanted the app to be able to notice when I was struggling more than usual without spying on me.

So I built a small rules engine that looks only at local signals: spikes in pain scores, skipped entries, and patterns in free-text notes. All of this computation happens on-device. In my write-up, I describe it as “local math, not cloud AI” (CrisisCore Systems, “Trauma-Informed Design”).

When the engine flags possible crisis, it does not notify outsiders. It does not message clinicians, call emergency services, or send data anywhere. Instead, it quietly adjusts the interface: fewer fields, simpler language, faster pathways to coping strategies I have configured. The goal is to lower cognitive load and offer scaffolding, not to seize control.

This is what trauma-informed design looks like when translated into behavior: choice, collaboration, transparency, and emotional safety instead of coercion (Danquah and Addae).

### D. Open source as inspectability and accountability

I do not expect anyone to trust a privacy promise just because I wrote it. The entire project is open-sourced under the MIT license (CrisisCore-Systems / pain-tracker).

That decision has several consequences:

- Because it’s open source, independent reviewers can audit data flows; the project also states that health data stays local by default.
- Security researchers can inspect how data are stored and encrypted.
- Clinicians, nonprofits, and other developers can fork or adapt the code without licensing friction.

In an ecosystem where studies show that policies often fail to clearly describe what apps actually transmit (Huckvale et al.), inspectability is not cosmetic; it is part of the ethical core.

### E. A misfit position in the current ecosystem

All of this leaves PainTracker.ca as an outlier. It is not a platform, does not monetize data, and resists the default cloud patterns. It behaves more like a local utility that anyone can run.

I think of it as an edge-sovereign tool: computation and data live at the edge, under the user’s control. That aligns closely with trauma-informed values of empowerment, choice, and safety (Danquah and Addae), but it clashes with prevailing commercial and institutional logics.

## V. Strengths, limitations, and unresolved tensions

### A. What PainTracker.ca gets right

Architecturally, the key strength is simple: there is no central hoard of pain data waiting to leak. The usual horror scenarios for health apps—misconfigured cloud buckets, undisclosed sharing, sudden policy shifts—do not apply in the same way.

Psychologically, the local-only model and trauma-aware UX change the emotional climate of logging. Knowing that entries never leave the device unless I choose to export them lowers the fear around being completely honest. The crisis-aware interface keeps the tool usable on days when I would otherwise abandon it.

Operationally, in my testing and deployment context, offline-first behavior has been essential in low-connectivity settings. Chronic pain does not schedule around internet uptime. A tool that degrades gracefully to “no network” is not a luxury; it is a requirement.

### B. Where the model is weak

The same choices that protect users make integration harder. Because PainTracker.ca does not automatically sync to a server, clinicians cannot “just log in” to see my diary. Any sharing requires deliberate action on both sides—screen-sharing in the exam room, printing, or exporting structured data.

Local-first also means device loss or compromise can mean data loss, so encrypted, user-triggered exports and backups become the ethical escape hatch.

For researchers, the absence of automatic aggregation is also a constraint. You cannot passively mine millions of user trajectories from my design. Any study requires explicit consent and explicit data transmission. I view that as ethically appropriate, but it complicates conventional “big data” projects.

Evidence is another gap. While there is solid support for pain diaries in general, we do not yet have randomized trials showing that this particular combination of offline-first, local-only storage and trauma-informed UX yields superior adherence or outcomes (Health Canada; “Using a Pain Diary”; University of Washington, “PainTracker”). That remains an empirical question.

Accessibility is still incomplete. Open source makes external contributions possible, but without sustained attention and funding, there will be gaps—for screen-reader users, people with cognitive disabilities beyond pain fog, and those who need languages other than English.

### C. Deep tensions I have not fully resolved

Several conceptual tensions remain live:

- Privacy vs. population analytics. Local-only storage protects individuals but limits passive epidemiology. Techniques like federated learning or differentially private aggregation could help, but they risk re-centralizing power if implemented carelessly.
- Inference vs. autonomy. Even local crisis detection involves interpretation of behavior by the system. To prevent that from feeling like surveillance, it must stay transparent, minimal, and fully optional.
- Open source vs. regulation. Current SaMD and health-IT frameworks assume commercial vendors. It is unclear how to certify, monitor, or insure an MIT-licensed tool that clinics can fork and modify independently.

These tensions do not make the model unworkable, but they do keep it intellectually honest.

## VI. Why this architecture should be the default standard in ethical digital health

### A. Turning bioethical principles into engineering constraints

PainTracker.ca is less an app than a thought experiment in what happens when you take basic bioethical principles seriously in software.

Autonomy. Genuine autonomy over pain data means the option to keep it entirely on-device, to decide if and when to share, and to revoke that sharing without pleading with a vendor. That is exactly what a local-only, export-based architecture supports.

Beneficence and non-maleficence. Pain diaries can help, but centralized digital implementations introduce new harms: breaches, misuse, and re-traumatization (Health Canada; “Using a Pain Diary”; Huckvale et al.; Danquah and Addae). I designed PainTracker.ca to strip out as many of those structural harms as possible.

Justice. Chronic pain and surveillance both weigh heaviest on marginalized groups. Tools that are safer for them, not just for the most privileged patients, are a matter of justice. Open-source licensing also supports justice by allowing under-resourced clinics and communities to adopt and adapt the tool without per-seat licenses.

Once these principles are treated as hard engineering constraints rather than slogans, architectures like PainTracker.ca stop looking like exotic experiments and start looking like baselines.

### B. What a new baseline would look like

For pain apps specifically—and for many health tools more broadly—I believe the default expectations should be:

- Local-first by default. Data are stored and processed on the device. Any remote storage is opt-in, scoped, and revocable.
- Trauma-informed UX. Interfaces are evaluated not only for usability but for emotional safety, transparency, and non-coercion (Danquah and Addae).
- Inspectability. Data flows and critical logic must be auditable. Wherever public money or public trust is involved, open-source or expert review should be the norm.

PainTracker.ca is one concrete implementation of that baseline. It demonstrates that the technical barriers are lower than the cultural and economic ones.

This baseline also has practical governance implications.
Local-first storage and explicit exports map naturally onto common privacy principles
(eg, data minimization, purpose limitation, and user control) that underpin regimes such as GDPR
and Canadian privacy expectations shaped by provincial health information statutes (eg, Ontario’s PHIPA) and federal private-sector privacy framing (PIPEDA).
It does not eliminate compliance work—device security, backup strategy, and export workflows still matter—
but it materially reduces the blast radius of breach and the incentives for secondary data use.

### C. Implications for stakeholders

For clinicians and health systems, adopting this baseline means shifting from “continuous, automatic data ingestion” to “collaborative, patient-controlled sharing.” That might involve patients bringing their device to the visit, sharing screens, or exporting encrypted summaries.

For developers and companies, it means abandoning business models that depend on surveillance and behavioral exploitation. Revenue has to come from transparent sources—public funding, institutional contracts, or direct pricing—not from selling or repurposing intimate data.

For policymakers and regulators, it means inverting the burden of justification. Surveillance-heavy architectures should face stricter scrutiny, higher security obligations, and tighter limits. Privacy-by-design, trauma-informed, open tools should be favored in funding decisions, procurement, and certification.

## VII. What needs to be studied next

If architectures like PainTracker.ca are to move from GitHub into mainstream practice, we need a structured research agenda.

- Head-to-head trials. Compare local-only tools with typical cloud-based apps on adherence, data completeness, user trust, privacy anxiety, and clinical outcomes such as pain intensity, interference, sleep, and mood (Health Canada; “Using a Pain Diary”; University of Washington, “PainTracker”).
- Operationalizing trauma-informed UX. Develop and validate measures of perceived safety, re-traumatization, and cognitive load during app use, and test how specific UX patterns affect those measures (Danquah and Addae).
- Privacy-preserving interoperability. Experiment with user-triggered encrypted exports, federated analytics, and differentially private summaries to allow research and clinical use without recreating centralized surveillance.
- Equity and accessibility audits. Use participatory design with diverse chronic pain communities to evaluate whether trauma-informed features and accessibility actually work across language, disability, and cultural contexts.
- Regulatory frameworks for open-source health tools. Explore how agencies can certify, monitor, and support community-maintained software like PainTracker.ca without crushing experimentation.

## VIII. Conclusion

Chronic pain shapes millions of lives. There is solid evidence that structured tracking and pain diaries can improve management, enable more personalized treatment, and strengthen patient–provider communication (Health Canada; “Using a Pain Diary”; University of Washington, “PainTracker”). Digital tools should be the obvious way to scale that.

Instead, the current landscape is dominated by surveillance-driven architectures and trauma-uninformed UX. Empirical work shows that many apps lack coherent privacy policies or that policies fail to clearly describe what data are transmitted (Huckvale et al.). Public polling reveals widespread distrust (Teale). People living with pain are repeatedly asked to trade away privacy and autonomy for tools that often fail them when they need help most (CrisisCore Systems, “Building a Pain Tracker”; “Trauma-Informed Design”).

PainTracker.ca is my counterexample: a working proof that it is technically straightforward to build a serious, useful health tool that does not spy. By keeping data local, operating offline, designing the UX around crisis realities, and releasing the code under an open license, it shows one way to align digital practice with the ethical principles we claim to value.

The stakes reach far beyond chronic pain. The same logic applies to mental-health apps, reproductive-health trackers, HIV adherence tools, and any system where digital logs intersect with stigma and power. Once we accept that at least one health tool can operate without hoarding intimate data, the old excuse—“this is just how digital health works”—falls apart.

One plausible path forward is not a single vendor platform, but a federated ecosystem of patient-owned,
offline-capable PWAs with interoperable, user-triggered exports.
In that model, clinical integration and research become consented interfaces layered onto patient control,
rather than control being the price of participation.

The real question is no longer whether privacy-first, trauma-informed, open-source tools are possible. The question is whether funders, regulators, and institutions are willing to choose them.

## Works Cited

CareClinic. *Pain Tracker – CareClinic – Apps on Google Play.* Google Play Store,
<https://play.google.com/store/apps/details?hl=en_CA&id=com.careclinicsoftware.careclinic&listing=chronic-pain-tracker-app>. Accessed 1 Dec. 2025.

CrisisCore Systems. “Building a Healthcare PWA That Actually Works When It Matters.” *DEV Community*, posted 27 Nov. 2025,
<https://dev.to/crisiscoresystems/building-a-healthcare-pwa-that-actually-works-when-it-matters-md4>. Accessed 1 Dec. 2025.

—. “Building a Pain Tracker That Actually Gets It — No Market Research Required.” *DEV Community*, posted 30 Nov. 2025,
<https://dev.to/crisiscoresystems/building-a-pain-tracker-that-actually-gets-it-no-market-research-required-4511>. Accessed 1 Dec. 2025.

—. “Trauma-Informed Design Left Everyone Asking: ‘How Does It Actually Know I’m Struggling without Spying?’” *DEV Community*, posted 29 Nov. 2025; edited 14 Dec. 2025,
<https://dev.to/crisiscoresystems/trauma-informed-design-left-everyone-asking-how-does-it-actually-know-im-struggling-without-26a0>. Accessed 1 Dec. 2025.

Danquah, Shaun, and Paul Addae. “Why Trauma-Informed Digital Design Is Relevant in 2022.” *Centric*, 1 Aug. 2022,
<https://centric.org.uk/blog/why-trauma-informed-digital-design-is-relevant-in-2022>. Accessed 1 Dec. 2025.

Health Canada. *Canadian Pain Task Force Report: March 2021.* Government of Canada,
<https://www.canada.ca/en/health-canada/corporate/about-health-canada/public-engagement/external-advisory-bodies/canadian-pain-task-force/report-2021.html>. Accessed 1 Dec. 2025.

Marceau, L. Diane, et al. “In-Clinic Use of Electronic Pain Diaries: Barriers of Implementation among Pain Physicians.” *Journal of Pain and Symptom Management*, vol. 40, no. 3, 2010, pp. 391–404. doi:10.1016/j.jpainsymman.2009.12.021.
PubMed, <https://pubmed.ncbi.nlm.nih.gov/20580526/>. PubMed Central, <https://pmc.ncbi.nlm.nih.gov/articles/PMC2934898/>. Accessed 1 Dec. 2025.

Huckvale, K., et al. “Unaddressed Privacy Risks in Accredited Health and Wellness Apps: A Cross-Sectional Systematic Assessment.” *BMC Medicine*, vol. 13, 2015, article 214,
<https://bmcmedicine.biomedcentral.com/articles/10.1186/s12916-015-0444-y>. Accessed 1 Dec. 2025.

“Using a Pain Diary.” *News-Medical Life Sciences*, 2019,
<https://www.news-medical.net/health/Using-a-Pain-Diary.aspx>. Accessed 1 Dec. 2025.

University of Washington. “PainTracker Patient Questionnaire.” UW Medicine Center for Pain Relief,
<https://paintracker.uwmedicine.org>. Accessed 1 Dec. 2025.

—. “PainTracker.” CoMotion at the University of Washington,
<https://els2.comotion.uw.edu/product/paintracker>. Accessed 1 Dec. 2025.

Teale, Chris. “A Major Obstacle to Tech Companies Developing Health Apps: About 2 in 3 Adults Worry About Their Privacy.” *Morning Consult Pro*, 1 Oct. 2021,
<https://pro.morningconsult.com/articles/health-tech-tracking-apps-data-privacy-poll>. Accessed 1 Dec. 2025.

Personal Information Protection and Electronic Documents Act (PIPEDA). Justice Laws Website (Government of Canada),
<https://laws-lois.justice.gc.ca/eng/acts/p-8.6/>. Accessed 1 Dec. 2025.

Personal Health Information Protection Act, 2004 (PHIPA). CanLII,
<https://www.canlii.org/en/on/laws/stat/so-2004-c-3-sch-a/latest/so-2004-c-3-sch-a.html>. Accessed 1 Dec. 2025.

PainTracker.ca. CrisisCore Systems, <https://paintracker.ca/>. Accessed 1 Dec. 2025.

CrisisCore-Systems / pain-tracker. GitHub, <https://github.com/CrisisCore-Systems/pain-tracker>. Accessed 1 Dec. 2025.
