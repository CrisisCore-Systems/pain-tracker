---
title: "PainTracker.ca: Pain Tracking Without Surveillance"
seoTitle: "PainTracker.ca: A Privacy-First, Trauma-Informed Pain App"
seoDescription: "Most pain apps feel like surveillance. PainTracker.ca is an offline-first, open-source, trauma-informed pain diary that keeps data encrypted on your device."
datePublished: Fri Feb 13 2026 01:00:22 GMT+0000 (Coordinated Universal Time)
cuid: cmlk6l1ir000102lc9zbefrwd
slug: paintracker-privacy-first-trauma-informed-pain-app
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1765617263232/fd020563-1297-44b0-b508-af094bccb968.jpeg
ogImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1765619471480/8830908e-4ff4-45f3-a816-4abe1be6edb8.jpeg
tags: ux, web-development, opensource, privacy, pwa, healthtech, mental-health, chronic-pain

---

*By CrisisCore Systems*

I built [**PainTracker.ca**](http://PainTracker.ca) because every mainstream pain-tracking app I tried made me want to throw my phone across the room.

Not because pain diaries are useless. The evidence for tracking is solid, and chronic pain is everywhere. But most “tracking” tools don’t feel like care. They feel like surveillance systems wearing a wellness costume: cloud defaults, account gates, analytics, nagging prompts, and UX designed for compliance instead of capacity.

[**PainTracker.ca**](http://PainTracker.ca) **is a refusal of that trade.**

It’s a privacy-first, offline-capable, trauma-informed Progressive Web App that stores encrypted data locally by default and shares data only when the user deliberately exports it. The code is open-source, because privacy claims shouldn’t be marketing — they should be inspectable.

This essay argues that privacy-first, offline-capable, trauma-informed, open-source tools should become the default standard in digital health. They reconcile clinical usefulness with ethical obligations around data governance, user control, and psychological safety — without forcing people in pain to surrender their lives to someone else’s backend.

---

## Two questions drive this essay

1. **How does** [**PainTracker.ca**](http://PainTracker.ca) **respond — architecturally, ethically, and experientially — to the failures of mainstream digital pain tools?**
    
2. **Can the combination of offline-first architecture, strict local storage, trauma-informed UX, and open-source transparency serve as a benchmark for digital health more broadly?**
    

---

## Method (brief, transparent)

This is a build-from-inside analysis: the [PainTracker.ca](http://PainTracker.ca) architecture and design doctrine, the open repository, and the real constraints of tracking during flares, instability, and cognitive collapse — compared against published research on chronic pain prevalence, pain diaries, and privacy risks in health apps.

---

# I. Chronic Pain and Why Tracking Still Matters

**Claim:** tracking helps — when it’s usable and safe.  
**Problem:** most tools are neither.

---

## A. Chronic pain is a structural public health crisis

Chronic pain isn’t a niche complaint. It’s a public health condition with gravity: function loss, disturbed sleep, depression, anxiety, relationship strain, and economic precarity.

Health Canada’s Canadian Pain Task Force estimates roughly **one in four Canadians aged 15+** live with chronic pain — millions of people. They also emphasize what many patients learn the hard way: chronic pain is frequently entangled with mental health, substance use, stigma, and uneven access to care. Pain doesn’t sit beside inequity. It amplifies it.

Meanwhile, most health systems are still optimized for acute problems and short visits. Chronic pain doesn’t show up cleanly in a 15-minute appointment. It shows up as a month of unstable sleep, fog, medication shifts, activity limits, and flare patterns — compressed into a rushed **“0–10 today?”**

That compression isn’t just inconvenient. **It shapes outcomes.**

---

## B. Why diaries and systematic tracking still matter

A well-structured diary changes the clinical conversation. A clinician sees a snapshot; a diary shows the movie.

When tracking is done well, it can:

* reveal patterns across sleep, stress, movement, weather, and medication
    
* surface triggers and pacing limits
    
* improve communication and credibility
    
* help justify treatment decisions, accommodations, and claims
    

This logic is old. Paper diaries existed long before apps. Tools like the University of Washington’s PainTracker questionnaire formalize this structure in clinic settings, monitoring pain, mood, sleep, and function over time.

The point isn’t “apps are the future.” The point is simpler:

**Pain varies. Memory lies. Patterns matter.**

---

## C. Where paper and first-generation tools hit their limits

Paper is fragile and hard to analyze. Early electronic systems were often clunky and disruptive to workflow.

Smartphones looked like the fix: always-with-you devices, rich UI, cheap storage. In practice, many pain apps reproduced the old problems and added new ones:

* bright, high-glare screens
    
* dense layouts
    
* tiny tap targets
    
* long intake flows
    
* forced registration before you can log a single entry
    
* “helpful” notifications that feel like enforcement
    

During a flare — when pain spikes, sleep collapses, and cognition turns to fog — those aren’t mild annoyances.

**They’re hard stops.**

That contradiction is what pushed me toward building my own system:

We need tracking.  
**The tools we’re offered are often unacceptable.**

---

# II. What Breaks in Mainstream Pain Apps

**Claim:** the dominant pain-app paradigm is surveillance-first and capacity-blind.  
**Result:** distrust, abandonment, and harm.

---

## A. Surveillance becomes the default architecture

Most pain apps live inside commercial ecosystems. And commercial ecosystems tend to survive on data: analytics dashboards, behavioral insights, engagement funnels, partnerships, integrations, and centralized storage.

When the backend table becomes the design unit — not the person in pain — accounts, centralized databases, SDKs, and telemetry follow.

Research has shown that many health and wellness apps carry serious privacy failures: missing policies, insecure transmission, and mismatches between what they claim and what they do. Even when apps are “accredited,” the gap between policy and behavior can be wide.

Pain data is not step-count data. A pain diary can contain:

* medication history
    
* disability context
    
* work capacity patterns
    
* mental health signals
    
* trauma disclosures
    
* days where survival is in question
    

In hostile hands, that record can be used to deny benefits, undermine credibility, or surveil behavior. Asking people to centralize that data by default is not neutral.

---

## B. Why people distrust these tools

Public concern about health app privacy is high. And for people living with chronic pain, disability, or trauma, distrust is sharper.

If you’ve been dismissed, disbelieved, or punished for telling the truth, the idea of pouring intimate detail into an opaque corporate system isn’t “paranoia.”

It’s pattern recognition.

So [PainTracker.ca](http://PainTracker.ca) does not ask for trust. **It removes the need.**

No remote database.  
No silent telemetry.  
No hidden pipeline.

---

## C. Trauma-uninformed UX becomes design harm

Even if privacy were perfect, most pain apps still fail on usability under stress.

Chronic pain brings fatigue and cognitive load. Trauma can bring hypervigilance, shame, avoidance, and sudden capacity drops. Tools that demand sustained attention, long sequences of micro-decisions, fine motor precision, or constant compliance don’t match the reality of living inside a flare.

Many apps also embed coercive patterns:

* streaks and gamification that treat lapses as failure
    
* “rate your pain now” prompts on the app’s schedule
    
* mandatory intake walls before any value is delivered
    

That’s not support. **That’s behavior shaping.**

Trauma-informed design is the opposite stance: choice, transparency, non-coercion, emotional safety, and respect for fluctuating capacity.

Pain apps rarely meet that bar.

---

## D. Clinician tools: better governance, but still not patient-centered

Institutional tools like UW’s PainTracker generally have stronger governance than consumer apps. But they’re often designed to serve institutional workflow first: dashboards, metrics, billing, centralized storage.

The design question becomes:

> **How do we ingest structured data?**

Not:

> **What does this feel like for someone living through it?**

[PainTracker.ca](http://PainTracker.ca) answers a different question:

**How do we build something that primarily serves the person using it — and only secondarily, and on their terms, anyone else?**

---

# III. [PainTracker.ca](http://PainTracker.ca) as a Countermodel

**Claim:** if you treat dignity as a constraint, the architecture changes.

---

## A. Origin and non-negotiable constraints

[PainTracker.ca](http://PainTracker.ca) began with a simple threat to myself:

**If no existing app is livable, build one that is.**

Hard constraints:

* works fully offline
    
* never sends data anywhere by default
    
* usable with low cognition and high distress
    
* transparent enough to verify
    
* built for lived reality, not “ideal user flows”
    

---

## B. Offline-first, local-only: treat the device as the system

The central architectural move is blunt:

**The device is the system.**

[PainTracker.ca](http://PainTracker.ca) runs as a PWA. The app shell can be cached for offline use. Data lives locally (IndexedDB or equivalent). Logs are encrypted locally.

The app doesn’t require connectivity to function. If you’re in a rural motel, a hospital basement, or anywhere signal is unstable, behavior remains the same.

Equally important:

**The app does not silently transmit logs to a server.**

This eliminates entire categories of risk:

* no centralized database to breach
    
* no vendor able to repurpose data later
    
* no bulk pain datasets to monetize
    
* no forced trust in shifting privacy policies
    

The trade-offs are real:

* no automatic cross-device sync
    
* no seamless EHR integration
    
* backups are user-controlled, not vendor-managed
    

That’s intentional. **Convenience should not be bought with captivity.**

---

## C. Trauma-informed UX: design for “not okay” days

Architecture is the skeleton. UX is the nervous system.

The interface assumes the user may be:

* exhausted
    
* in pain
    
* fogged
    
* dissociated
    
* emotionally unstable
    
* operating one-handed
    

So the UI prioritizes:

* low glare, calmer visuals
    
* large tap targets
    
* shallow navigation
    
* minimal nesting
    
* fast logging paths
    
* optional detail, not mandatory walls
    

The rule is simple: **remove friction that doesn’t add value.**

---

## D. Crisis-aware behavior without surveillance

One of the more experimental elements is a local crisis-detection engine.

I wanted the app to notice when I was struggling — **without spying.**

So the system looks only at local signals:

* spikes in pain
    
* missed entries
    
* patterns in user text (if enabled)
    

All computation stays on device. No cloud AI. No “send to model.” No phone-home.

When the engine flags possible crisis, it does not notify outsiders. It does not message clinicians or emergency services. It doesn’t escalate.

It adjusts the interface:

* fewer fields
    
* simpler language
    
* faster pathways to coping scaffolds the user chooses
    

The goal is not control. **It’s support without coercion.**

---

## E. Open source as inspectability and accountability

I don’t expect anyone to trust a privacy claim because I said “trust me.”

So the code is open under the MIT license.

That means:

* anyone can confirm there are no hidden analytics SDKs
    
* anyone can inspect network behavior
    
* anyone can audit local storage and encryption handling
    
* the project is forkable by clinics, nonprofits, or communities
    

In a world where policies often diverge from actual behavior, inspectability isn’t a virtue signal.

**It’s the ethical core.**

---

# IV. Strengths, Limitations, and Tensions

**Claim:** sovereignty improves safety — but challenges integration.

---

## A. What [PainTracker.ca](http://PainTracker.ca) gets right

* **Architectural safety:** no central hoard of pain data waiting to leak
    
* **Psychological safety:** honesty feels safer when nothing leaves the device by default
    
* **Operational reality:** offline-first works in the places people are actually suffering
    

A tool that fails without Wi-Fi is not “modern.”

**It’s fragile.**

---

## B. Where the model is weak

The same choices that protect users make integration harder.

Clinicians can’t “just log in” and see your diary. Sharing requires deliberate action:

* show your device
    
* export a report
    
* print
    
* share a structured summary
    

That’s slower. It’s also more ethical.

Evidence is another gap. We have support for diaries in general, but we do not yet have direct trials proving that this particular combination — offline-first, local-only, trauma-informed UX — yields better adherence or outcomes versus typical cloud apps.

Accessibility is ongoing work. Open source makes improvement possible, but sustained funding and contribution are the bottlenecks — not feasibility.

---

## C. Tensions that remain live

* **Privacy vs population analytics:** local-only design limits passive aggregation. Federated learning or privacy-preserving summaries could help, but can also re-centralize power if done carelessly.
    
* **Inference vs autonomy:** even local crisis detection is interpretation. To avoid “soft surveillance,” it must remain transparent, optional, minimal, and user-controlled.
    
* **Open source vs regulation:** current SaMD frameworks assume centralized vendors. Certifying and maintaining trust in open, forkable health tools is still an unresolved systems problem.
    

These tensions don’t invalidate the model. **They keep it honest.**

---

# V. Why This Should Be the Default Standard

**Claim:** bioethics should be engineering constraints — not slogans.

---

## A. Autonomy, turned into architecture

If autonomy is real, users must be able to:

* keep their data entirely local
    
* decide if and when to share
    
* revoke sharing without begging a vendor
    

A local-first, export-based model supports that by default.

---

## B. Non-maleficence: remove structural harm

Pain tracking can help. But mainstream digital implementations add harms:

* breaches
    
* misuse
    
* coercive UX
    
* re-traumatization through surveillance patterns
    

When you treat harm reduction as an architectural requirement, “cloud by default” stops looking inevitable.

---

## C. Justice: build for the people most harmed by surveillance

Chronic pain and surveillance both weigh hardest on marginalized groups.

Tools that are safer for those users are not “nice.”

**They’re just.**

Open licensing also supports justice:

* under-resourced clinics can deploy without per-seat fees
    
* communities can adapt the tool without permission
    

---

## D. What the new baseline should be

For pain tools — and many other health tools — the default expectations should be:

### 1) Local-first by default

Data stored and processed on device. Any remote storage is opt-in, scoped, and revocable.

### 2) Trauma-informed UX

Design for fluctuating capacity. Reduce coercion. Ensure transparency and emotional safety.

### 3) Inspectability

Data flows and critical logic should be auditable. Where public trust is involved, open review should be normal.

[PainTracker.ca](http://PainTracker.ca) is one working example of that baseline.

The technical barriers are lower than the cultural and economic ones.

---

# VI. What Needs to Be Studied Next

If this approach is going to move from GitHub into mainstream use, it needs a research agenda:

* **Head-to-head trials:** local-only tools vs cloud apps on adherence, trust, privacy anxiety, and clinical outcomes
    
* **Measuring trauma-informed UX:** validated measures for perceived safety, cognitive load, and coercion effects
    
* **Privacy-preserving interoperability:** encrypted exports, privacy-preserving summaries, consent-first research pathways
    
* **Equity and accessibility audits:** participatory testing across disability types, languages, and communities
    
* **Regulatory frameworks for open tools:** certification models that don’t require central vendors or closed code
    

---

# VII. Conclusion

Chronic pain shapes millions of lives. There is strong evidence that structured tracking and pain diaries can improve management and clinical communication.

But the current landscape is dominated by surveillance-heavy architectures and trauma-blind UX. People in pain are repeatedly asked to trade away privacy and autonomy for tools that often fail them when they need support most.

[PainTracker.ca](http://PainTracker.ca) is a counterexample: proof that it is technically straightforward to build a serious health tool that does not spy.

By keeping data local, working offline, designing around crisis realities, and shipping as open source, it demonstrates a different standard — one aligned with user dignity instead of data extraction.

The stakes reach beyond chronic pain. The same logic applies to mental health apps, reproductive health trackers, HIV adherence tools, and any system where logs intersect with stigma and power.

Once we accept that at least one health tool can operate without hoarding intimate data, the old excuse — “this is just how digital health works” — stops working.

The question is no longer whether privacy-first, trauma-informed, open tools are possible.

**The question is whether funders, regulators, and institutions are willing to choose them.**

---

## Works Cited

* CareClinic. “Pain Tracker – CareClinic.” Google Play Store. Accessed 1 Dec. 2025.
    
* CrisisCore-Systems. *pain-tracker* (GitHub repository). Accessed 1 Dec. 2025.
    
* CrisisCore Systems. “Building a Healthcare PWA That Actually Works When It Matters.” DEV Community. Accessed 1 Dec. 2025.
    
* CrisisCore Systems. “Building a Pain Tracker That Actually Gets It — No Market Research Required.” DEV Community. Accessed 1 Dec. 2025.
    
* CrisisCore Systems. “Trauma-Informed Design Left Everyone Asking: ‘How Does It Actually Know I’m Struggling without Spying?’” DEV Community. Accessed 1 Dec. 2025.
    
* Danquah, Ama, and Kobi Addae. “Why Trauma-Informed Digital Design Is Relevant in 2022.” Centric Community Research. Accessed 1 Dec. 2025.
    
* Health Canada. *Chronic Pain in Canada: Laying a Foundation for Action (Canadian Pain Task Force, June 2019–May 2020).* Government of Canada, Sept. 2020. Accessed 1 Dec. 2025.
    
* Jamison, Robert N., et al. “In-Clinic Use of Electronic Pain Diaries: Barriers of Implementation among Pain Physicians.” *Journal of Pain and Palliative Care Pharmacotherapy*, 2010. Accessed 1 Dec. 2025.
    
* Luong, Thanh-Tam, et al. “Unaddressed Privacy Risks in Accredited Health and Wellness Apps: A Cross-Sectional Systematic Assessment.” *BMC Medicine*, 2015. Accessed 1 Dec. 2025.
    
* News-Medical Life Sciences. “Using a Pain Diary.” 2019. Accessed 1 Dec. 2025.
    
* University of Washington. “PainTracker Patient Questionnaire.” UW Medicine Center for Pain Relief. Accessed 1 Dec. 2025.
    
* University of Washington. “PainTracker.” CoMotion. Accessed 1 Dec. 2025.
    
* Wiggers, Alex. “A Major Obstacle to Tech Companies Developing Health Apps: About 2 in 3 Adults Worry About Their Privacy.” *Morning Consult Pro*, 2021. Accessed 1 Dec. 2025.
    
* [PainTracker.ca](http://PainTracker.ca). [PainTracker.ca](http://PainTracker.ca). Accessed 1 Dec. 2025.