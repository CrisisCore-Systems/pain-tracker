# WorkSafeBC Case Study — Publication Kit

This folder contains **supporting assets and a checklist** for publishing the composite WorkSafeBC case study.

**Source post (repo):** `docs/content/blog/blog-worksafe-bc-case-study-documentation-time-savings.md`

## Publish checklist (Hashnode)

1. Publish the post via API:

```powershell
cd C:\Users\kay\Documents\Projects\pain-tracker

# Reuse your existing values from publish-hashnode.ps1 (session-only)
$env:HASHNODE_TOKEN="<token>"
$env:HASHNODE_PUBLICATION_ID="<publicationId>"

powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\publish-hashnode-worksafe-bc-case-study.ps1
```

2. Add/update the landing link UTM params (already added in `WorkSafeBCCaseStudy.tsx`):

- `utm_source=paintracker.app`
- `utm_medium=landing`
- `utm_campaign=wcb_case_study`

## Visual assets (SVG)

SVGs live in `docs/case-studies/worksafe-bc/assets/`.

Recommended export sizes:
- Social image: **1200×630**
- LinkedIn single image: **1200×1200**

## Sample WorkSafeBC export PDF (redacted/watermarked)

This repo already generates WorkSafeBC exports from within the app.

Suggested safest workflow (no code changes):

1. In the app: open **Reports** → choose a date range.
2. Generate **WorkSafeBC export**.
3. Save the PDF as a **sample**.
4. Redact any sensitive text and add a watermark:
   - Watermark text: `SAMPLE REPORT — FOR DEMONSTRATION ONLY`
   - Ensure no names, addresses, claim numbers, employer identifiers, or free-text notes are visible.

If you want me to automate generating a **synthetic** sample PDF (no real user data) using the exporter, confirm and I’ll add a small script + fixture dataset. (This touches the export pipeline.)

### Automated synthetic sample (recommended for public marketing)

This repo includes a local-only generator that produces a **watermarked PDF** using **synthetic fixture data**.

Run:

```powershell
cd C:\Users\kay\Documents\Projects\pain-tracker

npx tsx .\scripts\generate-wcb-sample-pdf.ts
```

Output:
- `docs/case-studies/worksafe-bc/generated/PainTracker-WCB-SAMPLE.pdf`

Notes:
- The generated PDF is ignored by git (intentionally) so it doesn’t get committed by accident.
