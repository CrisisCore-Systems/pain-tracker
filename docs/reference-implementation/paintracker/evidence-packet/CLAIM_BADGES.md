# Proof Badge Taxonomy

- `Self attested`: Founder or project assertion without linked public evidence.
- `Repo backed`: Evidence exists in repository files, tests, or configuration.
- `CI backed`: Automated workflow evidence is linked with workflow name, run link, and commit SHA.
- `Externally reviewed`: Named external reviewer provides scoped review output.
- `Certified`: Independent certifying body provides formal certification.

## Assignment rules

- Every claim gets exactly one current badge.
- A claim cannot inherit a stronger badge from nearby claims.
- If evidence is partial or stale, downgrade the claim badge.
- If no direct evidence is linked, use `Self attested` and list claim in `FALSE_CLAIM_REGISTER.md` when unsafe for public language.
- `Certified` cannot be used for PainTracker unless a published independent certification record is linked.

## Current packet status

- Highest safe project-wide posture in this packet: `Level 2 to Level 3 alignment where evidence exists`.
- Do not present this packet as certification.
