# Subdomain Internal Linking Architecture

> **Version 1.0** | Created: **2026-02-06**
> Architecture for `paintracker.ca` (root) ↔ `blog.paintracker.ca` (subdomain)

---

## Domain Topology

| Domain | Purpose | Tech |
|--------|---------|------|
| `paintracker.ca` | App + 4 pillar landing pages | Vite SPA (React) |
| `blog.paintracker.ca` | 30-page topical authority cluster + Hashnode blog | Next.js (App Router) |

Google treats subdomains as **related but separate sites**. Without deliberate cross-domain linking, SEO authority gets trapped on the subdomain and the root domain (where conversions happen) stays weak.

---

## Root Domain Pillar Pages (Conversion Targets)

All authority must flow toward these 4 URLs:

| Pillar | URL | Cluster |
|--------|-----|---------|
| Offline | `https://paintracker.ca/offline-pain-diary` | Privacy / Offline |
| Privacy | `https://paintracker.ca/private-pain-tracker` | Privacy / Security |
| Clinical | `https://paintracker.ca/pain-log-for-doctors` | Clinical / Documentation |
| Chronic | `https://paintracker.ca/track-chronic-pain-symptoms` | Chronic Conditions |

**App entry point:** `https://paintracker.ca/app`

---

## Linking Rules

### Rule A — Every Blog Article → Root Domain (Cross-Domain Authority Transfer)

Each of the 30 SEO articles on `blog.paintracker.ca` MUST include:

1. **1 contextual link to its assigned root-domain pillar** (mid-article, not footer)
2. **1 CTA link to `https://paintracker.ca/app`** (bottom of article)

This ensures PageRank flows **blog → root**.

### Rule B — Blog Articles Interlink Locally (Topical Clustering)

Each blog article MUST also link to:

- **1 related blog article** on `blog.paintracker.ca`

This preserves topical clustering, crawl efficiency, and long-tail rankings.

### Rule C — 3 Links Per Article (Exact Formula)

Every blog article has exactly **3 outbound links**:

| # | Link Type | Target Domain | Placement |
|---|-----------|---------------|-----------|
| 1 | Pillar link | `paintracker.ca` | Mid-article contextual |
| 2 | Related article | `blog.paintracker.ca` | Mid-article or end |
| 3 | App CTA | `paintracker.ca/app` | Bottom CTA block |

---

## Complete Article → Pillar Mapping

### Privacy / Offline Cluster → `paintracker.ca/offline-pain-diary`

| Article Slug | Related Blog Article |
|---|---|
| `cloud-vs-local-pain-tracking` | `why-offline-health-apps-matter` |
| `why-offline-health-apps-matter` | `cloud-vs-local-pain-tracking` |
| `zero-cloud-medical-privacy` | `encrypted-health-data-safety` |
| `paper-vs-app-pain-diary` | `why-offline-health-apps-matter` |

### Privacy / Security Cluster → `paintracker.ca/private-pain-tracker`

| Article Slug | Related Blog Article |
|---|---|
| `encrypted-health-data-safety` | `local-only-encryption-explained` |
| `local-only-encryption-explained` | `encrypted-health-data-safety` |
| `health-data-threat-model` | `security-architecture` |
| `security-architecture` | `health-data-threat-model` |
| `why-paintracker-is-open-source` | `security-architecture` |

### Clinical / Documentation Cluster → `paintracker.ca/pain-log-for-doctors`

| Article Slug | Related Blog Article |
|---|---|
| `can-doctors-trust-offline-diaries` | `what-doctors-look-for-symptom-journals` |
| `what-doctors-look-for-symptom-journals` | `can-doctors-trust-offline-diaries` |
| `export-pain-logs-pdf` | `pain-diary-template` |
| `pain-diary-template` | `export-pain-logs-pdf` |
| `pain-tracking-insurance-evidence` | `paintracker-worksafebc-claims` |
| `paintracker-worksafebc-claims` | `pain-tracking-insurance-evidence` |
| `how-detailed-pain-diary` | `what-doctors-look-for-symptom-journals` |
| `preparing-physiotherapy-pain-logs` | `export-pain-logs-pdf` |
| `sharing-symptom-data-safely` | `can-doctors-trust-offline-diaries` |

### Chronic Conditions Cluster → `paintracker.ca/track-chronic-pain-symptoms`

| Article Slug | Related Blog Article |
|---|---|
| `pain-tracking-fibromyalgia` | `migraine-symptom-diary` |
| `migraine-symptom-diary` | `pain-tracking-fibromyalgia` |
| `tracking-flare-ups-chronic-illness` | `identifying-pain-triggers` |
| `identifying-pain-triggers` | `tracking-flare-ups-chronic-illness` |
| `tracking-recovery-after-injury` | `tracking-flare-ups-chronic-illness` |

### Cross-Cluster / Comparison Articles

| Article Slug | Assigned Pillar | Related Blog Article |
|---|---|---|
| `best-pain-tracking-apps` | `private-pain-tracker` | `paper-vs-app-pain-diary` |
| `accessibility-in-pain-tracking` | `track-chronic-pain-symptoms` | `best-pain-tracking-apps` |
| `getting-started` | `offline-pain-diary` | `how-detailed-pain-diary` |

### Pillar Self-Links (Pillar articles on subdomain link to their root counterpart)

| Subdomain Pillar Slug | Root Pillar URL | Related Blog Article |
|---|---|---|
| `offline-pain-diary` | `paintracker.ca/offline-pain-diary` | `cloud-vs-local-pain-tracking` |
| `private-pain-tracker` | `paintracker.ca/private-pain-tracker` | `encrypted-health-data-safety` |
| `pain-log-for-doctors` | `paintracker.ca/pain-log-for-doctors` | `what-doctors-look-for-symptom-journals` |
| `track-chronic-pain-symptoms` | `paintracker.ca/track-chronic-pain-symptoms` | `pain-tracking-fibromyalgia` |

---

## Navigation Architecture

### Blog Header (site-wide authority flow → root)

| Label | URL | Domain |
|---|---|---|
| Articles | `/` | blog.paintracker.ca |
| Pain Tracking Guides | `/pain-tracking-guides` | blog.paintracker.ca |
| Features | `/features` | blog.paintracker.ca |
| Offline Pain Diary | `https://paintracker.ca/offline-pain-diary` | paintracker.ca |
| For Doctors | `https://paintracker.ca/pain-log-for-doctors` | paintracker.ca |
| Try the App | `https://paintracker.ca/app` | paintracker.ca |

### Blog Footer (mass PageRank transfer)

**Pillar Pages section:**
- Offline Pain Diary → `https://paintracker.ca/offline-pain-diary`
- Private Pain Tracker → `https://paintracker.ca/private-pain-tracker`
- Pain Log for Doctors → `https://paintracker.ca/pain-log-for-doctors`
- Track Chronic Pain → `https://paintracker.ca/track-chronic-pain-symptoms`

**Resources section:**
- Pain Tracking Guides → `/pain-tracking-guides`
- Privacy → `/privacy`
- Security → `/security`
- Open Source on GitHub → external

**Main site:**
- Homepage → `https://paintracker.ca`
- Open the App → `https://paintracker.ca/app`

---

## Blog Master Hub Page

**URL:** `https://blog.paintracker.ca/pain-tracking-guides`

### Purpose
- Lists **all 30 articles** grouped by cluster
- Links to **all 4 root pillars** prominently
- Sits in **blog header navigation**
- Acts as the **authority bridge** between subdomain → root domain

### Structure
1. Hero: "Complete Pain Tracking Guides"
2. Pillar highlight cards (4, linking to root domain)
3. Article listings by cluster (Privacy, Clinical, Chronic, Comparison, Transparency, Utility)
4. Bottom CTA → app

---

## Subdomain vs Subfolder Analysis

### Current Setup: Subdomain (`blog.paintracker.ca`)

**Advantages:**
- Clean separation of concerns (Next.js blog vs Vite SPA)
- Independent deployments
- Separate Vercel projects
- Can use different frameworks

**Disadvantages:**
- Google treats as separate site → authority split
- Requires deliberate cross-domain linking (this document)
- Slower authority consolidation
- More complex analytics setup

### Alternative: Subfolder (`paintracker.ca/blog/`)

**Advantages:**
- Google treats as same site → automatic authority consolidation
- 30-70% SEO performance improvement (industry data)
- Simpler internal linking
- Unified analytics

**Disadvantages:**
- Requires reverse proxy or Next.js rewrite to serve blog at `/blog/`
- More complex deployment (must proxy Vite SPA + Next.js)
- Potential build/routing conflicts

### Verdict for PainTracker

**Stay on subdomain for now** — but with the linking architecture in this document strictly enforced.

Reasons:
1. The existing infrastructure (separate Vercel deployments) works well
2. The blog is already deployed and indexed at `blog.paintracker.ca`
3. Migration to subfolder would require DNS changes, Vercel rewrites, and redirect chains
4. With proper cross-domain linking, the authority split can be significantly mitigated
5. The 4 pillar pages on the root domain will pull authority from 30 blog articles

**Revisit in 3-6 months** if:
- Pillar pages are not ranking despite strong blog traffic
- Google Search Console shows poor authority signals on root domain
- Competitor analysis shows subfolder sites outperforming

### If/When You Migrate to Subfolder

1. Set up Next.js rewrite: `paintracker.ca/blog/*` → blog Next.js app
2. 301 redirect ALL `blog.paintracker.ca/*` URLs → `paintracker.ca/blog/*`
3. Update all internal links
4. Update sitemap
5. Monitor Search Console for 8 weeks

---

## Implementation Checklist

- [x] Document linking architecture
- [ ] Add `internalLinks` field to `ArticleData` type
- [ ] Populate linking data for all 30 articles
- [ ] Render contextual pillar links mid-article
- [ ] Render related article links
- [ ] Update blog Header with pillar nav items
- [ ] Update blog Footer with root-domain pillar links
- [ ] Create `/pain-tracking-guides` hub page
- [ ] Verify all cross-domain links use absolute URLs
- [ ] Add `rel="noopener"` to external (cross-domain) links
