# Subdomain Internal Linking Architecture

> Version 2.0 | Updated: 2026-06-05
> Architecture for `www.paintracker.ca` (root) and `blog.paintracker.ca` (subdomain)

---

## Domain Topology

| Domain                | Purpose                                                                 | Tech                 |
| --------------------- | ----------------------------------------------------------------------- | -------------------- |
| `www.paintracker.ca`  | App entry points, resource hub, printables, data policy, download route | Vite SPA (React)     |
| `blog.paintracker.ca` | Topical authority cluster and long-form articles                        | Next.js (App Router) |

Google treats subdomains as related but separate sites. Without deliberate cross-domain linking, SEO authority can stay concentrated on the blog while the root-domain resources and app entry points stay underfed.

The root domain is the authority destination because it contains the user actions and durable resource pages. Blog links must therefore be useful to readers and must point to current crawlable root-domain routes, not retired placeholder URLs.

---

## Root-Domain Resource Cluster Targets

Authority should flow toward the current public resource cluster:

| Target                            | URL                                                                    | Primary intent                                      |
| --------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------- |
| Resource hub                      | `https://www.paintracker.ca/resources`                                 | General pain tracking resources and route discovery |
| Daily Pain Tracker Printable      | `https://www.paintracker.ca/resources/daily-pain-tracker-printable`    | Printable one-day pain tracking worksheet           |
| Chronic Pain Diary Template       | `https://www.paintracker.ca/resources/chronic-pain-diary-template`     | Longer-term chronic pain and flare tracking         |
| Pain Scale Chart Printable        | `https://www.paintracker.ca/resources/pain-scale-chart-printable`      | 0-10 pain scale reference                           |
| What to Include in a Pain Journal | `https://www.paintracker.ca/resources/what-to-include-in-pain-journal` | Appointment and journal guidance                    |
| Download PainTracker              | `https://www.paintracker.ca/download`                                  | Install/open path for the app                       |
| Tracking Data Policy              | `https://www.paintracker.ca/tracking-data-policy`                      | Data storage, collection, and export explanation    |
| App homepage                      | `https://www.paintracker.ca/`                                          | Free private offline pain tracker app entry point   |

Do not reintroduce the retired root-domain targets:

- `/offline-pain-diary`
- `/private-pain-tracker`
- `/pain-log-for-doctors`
- `/track-chronic-pain-symptoms`

Those phrases may remain as blog article slugs, but they are not the canonical root-domain authority targets.

---

## Linking Rules

### Rule A - Every Blog Article Links to a Current Root-Domain Target

Each SEO article on `blog.paintracker.ca` should include:

1. One contextual link to a current root-domain resource, policy, or app target.
2. One CTA link to `https://www.paintracker.ca/` using a truthful app-entry anchor.
3. A high-intent resource block that points to the most relevant resource cluster for that article.

This keeps cross-domain authority transfer useful to readers and avoids dead or misleading URLs.

### Rule B - Blog Articles Interlink Locally

Each blog article should also link to one related blog article on `blog.paintracker.ca`.

This preserves topical clustering, crawl efficiency, and long-tail discovery without making every link point away from the blog.

### Rule C - High-Intent Blocks Are Topic-Aware

The article templates render `HighIntentResourceLinks`. The block should stay topic-aware rather than keyword-stuffed:

| Topic                       | Main root-domain links                                                               |
| --------------------------- | ------------------------------------------------------------------------------------ |
| General                     | Homepage, `/resources`, daily printable, chronic diary, tracking data policy         |
| Printable / paper           | Daily printable, pain scale chart, pain journal guide, chronic diary, `/download`    |
| Chronic pain                | Chronic diary, pain journal guide, daily printable, pain scale chart, homepage       |
| Pain journal / appointments | Pain journal guide, daily printable, chronic diary, pain scale chart, `/download`    |
| Pain scale                  | Pain scale chart, daily printable, pain journal guide, chronic diary, homepage       |
| Privacy / offline           | Homepage, tracking data policy, resource hub, `/download`                            |
| Workplace injury / claims   | `/download`, daily printable, chronic diary, pain journal guide, WorkSafeBC template |

The block is meant to help the reader move from learning to a useful record. It must not imply medical, legal, privacy, or offline guarantees that are not structurally supported.

---

## Article to Resource-Target Mapping

The historical article-slug groups are still useful for routing authority, but their root targets now map to current resource-cluster pages.

### Privacy / Offline Cluster -> Homepage and Tracking Data Policy

| Article slug                                                    | Root target                                       | Related blog article             |
| --------------------------------------------------------------- | ------------------------------------------------- | -------------------------------- |
| `offline-pain-diary`                                            | `https://www.paintracker.ca/`                     | `cloud-vs-local-pain-tracking`   |
| `cloud-vs-local-pain-tracking`                                  | `https://www.paintracker.ca/tracking-data-policy` | `why-offline-health-apps-matter` |
| `why-offline-health-apps-matter`                                | `https://www.paintracker.ca/`                     | `best-pain-tracking-apps`        |
| `zero-cloud-medical-privacy`                                    | `https://www.paintracker.ca/`                     | `best-pain-tracking-apps`        |
| `paper-vs-app-pain-diary`                                       | `https://www.paintracker.ca/`                     | `why-offline-health-apps-matter` |
| `building-a-healthcare-pwa-that-actually-works-when-it-matters` | `https://www.paintracker.ca/`                     | `best-pain-tracking-apps`        |
| `getting-started`                                               | `https://www.paintracker.ca/`                     | `how-detailed-pain-diary`        |

### Privacy / Security Cluster -> Tracking Data Policy

| Article slug                      | Root target                                       | Related blog article      |
| --------------------------------- | ------------------------------------------------- | ------------------------- |
| `private-pain-tracker`            | `https://www.paintracker.ca/tracking-data-policy` | `best-pain-tracking-apps` |
| `encrypted-health-data-safety`    | `https://www.paintracker.ca/tracking-data-policy` | `best-pain-tracking-apps` |
| `local-only-encryption-explained` | `https://www.paintracker.ca/tracking-data-policy` | `best-pain-tracking-apps` |
| `health-data-threat-model`        | `https://www.paintracker.ca/tracking-data-policy` | `best-pain-tracking-apps` |
| `security-architecture`           | `https://www.paintracker.ca/tracking-data-policy` | `best-pain-tracking-apps` |
| `why-paintracker-is-open-source`  | `https://www.paintracker.ca/tracking-data-policy` | `best-pain-tracking-apps` |
| `best-pain-tracking-apps`         | `https://www.paintracker.ca/tracking-data-policy` | `paper-vs-app-pain-diary` |

### Clinical / Documentation Cluster -> Pain Journal Guide

| Article slug                             | Root target                                                            | Related blog article                     |
| ---------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------- |
| `pain-log-for-doctors`                   | `https://www.paintracker.ca/resources/what-to-include-in-pain-journal` | `what-doctors-look-for-symptom-journals` |
| `can-doctors-trust-offline-diaries`      | `https://www.paintracker.ca/resources/what-to-include-in-pain-journal` | `what-doctors-look-for-symptom-journals` |
| `what-doctors-look-for-symptom-journals` | `https://www.paintracker.ca/resources/what-to-include-in-pain-journal` | `can-doctors-trust-offline-diaries`      |
| `export-pain-logs-pdf`                   | `https://www.paintracker.ca/resources/what-to-include-in-pain-journal` | `pain-diary-template`                    |
| `pain-diary-template`                    | `https://www.paintracker.ca/resources/what-to-include-in-pain-journal` | `export-pain-logs-pdf`                   |
| `pain-tracking-insurance-evidence`       | `https://www.paintracker.ca/resources/what-to-include-in-pain-journal` | `paintracker-worksafebc-claims`          |
| `paintracker-worksafebc-claims`          | `https://www.paintracker.ca/resources/what-to-include-in-pain-journal` | `pain-tracking-insurance-evidence`       |
| `how-detailed-pain-diary`                | `https://www.paintracker.ca/resources/what-to-include-in-pain-journal` | `what-doctors-look-for-symptom-journals` |
| `preparing-physiotherapy-pain-logs`      | `https://www.paintracker.ca/resources/what-to-include-in-pain-journal` | `export-pain-logs-pdf`                   |
| `sharing-symptom-data-safely`            | `https://www.paintracker.ca/resources/what-to-include-in-pain-journal` | `paintracker-worksafebc-claims`          |

### Chronic Conditions Cluster -> Chronic Pain Diary Template

| Article slug                         | Root target                                                        | Related blog article                 |
| ------------------------------------ | ------------------------------------------------------------------ | ------------------------------------ |
| `track-chronic-pain-symptoms`        | `https://www.paintracker.ca/resources/chronic-pain-diary-template` | `pain-tracking-fibromyalgia`         |
| `pain-tracking-fibromyalgia`         | `https://www.paintracker.ca/resources/chronic-pain-diary-template` | `migraine-symptom-diary`             |
| `migraine-symptom-diary`             | `https://www.paintracker.ca/resources/chronic-pain-diary-template` | `pain-tracking-fibromyalgia`         |
| `tracking-flare-ups-chronic-illness` | `https://www.paintracker.ca/resources/chronic-pain-diary-template` | `identifying-pain-triggers`          |
| `identifying-pain-triggers`          | `https://www.paintracker.ca/resources/chronic-pain-diary-template` | `tracking-flare-ups-chronic-illness` |
| `tracking-recovery-after-injury`     | `https://www.paintracker.ca/resources/chronic-pain-diary-template` | `paintracker-worksafebc-claims`      |
| `accessibility-in-pain-tracking`     | `https://www.paintracker.ca/resources/chronic-pain-diary-template` | `best-pain-tracking-apps`            |

---

## Navigation Architecture

### Blog Header

| Label       | URL                                                           | Domain                |
| ----------- | ------------------------------------------------------------- | --------------------- |
| Articles    | `/`                                                           | `blog.paintracker.ca` |
| Guides      | `/pain-tracking-guides`                                       | `blog.paintracker.ca` |
| Features    | `/features`                                                   | `blog.paintracker.ca` |
| Resources   | `https://www.paintracker.ca/resources`                        | `www.paintracker.ca`  |
| Try the App | `https://www.paintracker.ca/start` via `siteConfig.links.app` | `www.paintracker.ca`  |

The header should keep one clear root-domain resource link plus the app CTA. It should not use retired root URLs as navigation targets.

### Blog Footer

**Resource Guides section:**

- Pain Tracking Resources -> `https://www.paintracker.ca/resources`
- Daily Pain Tracker Printable -> `https://www.paintracker.ca/resources/daily-pain-tracker-printable`
- What to Include in a Pain Journal -> `https://www.paintracker.ca/resources/what-to-include-in-pain-journal`
- Chronic Pain Diary Template -> `https://www.paintracker.ca/resources/chronic-pain-diary-template`

**Resources section:**

- Free Private Offline Pain Tracker -> `https://www.paintracker.ca/`
- Privacy -> `/privacy`
- Security -> `/security`
- Open Source on GitHub -> external

**Main-site app actions:**

- Open App -> `https://www.paintracker.ca/start` via `siteConfig.links.app`
- Article app CTA -> `https://www.paintracker.ca/` via `APP_CTA_URL`

The split is intentional: SEO reading paths can point to the homepage authority target, while explicit app-opening controls can still use the installed/open route.

---

## Root Resource Hub Architecture

**URL:** `https://www.paintracker.ca/resources`

### Purpose

- Expose the crawlable hub for pain tracking resources.
- Link prominently to the four primary resource pages.
- Preserve pathways to the app homepage, download route, and tracking data policy.
- Avoid forcing a digital workflow before a user has a useful printable or planning record.

### Required Crawlable Links

The resource hub should include plain crawlable links to:

- `/resources/daily-pain-tracker-printable`
- `/resources/chronic-pain-diary-template`
- `/resources/pain-scale-chart-printable`
- `/resources/what-to-include-in-pain-journal`
- `/download`
- `/tracking-data-policy`
- `/`

The prerendered route metadata must include the same high-priority resource paths so crawlers can see them before client-side hydration.

---

## Blog Master Hub Page

**URL:** `https://blog.paintracker.ca/pain-tracking-guides`

### Purpose

- List the blog article cluster.
- Bridge topical authority from the blog to current root-domain resource targets.
- Keep local blog interlinks available for topical clustering.
- Avoid over-concentrating all authority on the homepage.

The hub should prefer current root-domain resource cluster targets over retired pillar URLs.

---

## Subdomain vs Subfolder Analysis

### Current Setup: Subdomain (`blog.paintracker.ca`)

**Advantages:**

- Clean separation of concerns between the Next.js blog and Vite SPA.
- Independent deployments.
- Different frameworks can be maintained without a proxy layer.

**Disadvantages:**

- Search engines may treat the blog and root as separate properties.
- Cross-domain authority transfer must be intentional and maintained.
- Internal link drift is easier when root routes change.

### Alternative: Subfolder (`www.paintracker.ca/blog/`)

**Advantages:**

- Stronger same-site consolidation.
- Simpler internal-link semantics.
- Unified route and analytics ownership.

**Disadvantages:**

- Requires reverse proxying or framework consolidation.
- Requires redirect planning from all indexed subdomain URLs.
- Adds deployment and routing complexity.

### Current Verdict

Stay on the subdomain for now, but enforce current cross-domain links and keep the resource cluster updated.

Revisit a subfolder migration if Search Console evidence shows that the root resource cluster is not benefiting from blog traffic despite current linking, or if the operational burden of two deploy targets starts to create user-facing route drift.

---

## Enforcement Checklist

- [x] Blog article baseline links map legacy article topics to current root-domain targets.
- [x] Blog high-intent resource block is topic-aware.
- [x] Blog header links to the root resource hub.
- [x] Blog footer links to the resource hub and primary resource pages.
- [x] Root resource hub links to the four primary resource pages, `/download`, `/tracking-data-policy`, and homepage.
- [x] Prerender metadata for `/resources` exposes the same high-priority resource links.
- [x] Retired root-domain URLs are documented as prohibited targets.
- [ ] Periodically scan for retired root-domain URL reintroduction in `src`, `packages/blog/src`, `docs/content`, and `scripts/devto`.
- [ ] Recheck Search Console after enough crawl time before changing route architecture again.
