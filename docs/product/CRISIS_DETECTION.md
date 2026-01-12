# Crisis Detection (Local-only)

✅ Purpose: Provide a local, privacy-first heuristic that alerts users when their recent pain ratings show a meaningful increase over their baseline.

## Algorithm
- Baseline: mean intensity over the last 7 days (falls back to overall mean when fewer entries exist).
- Detection rule: alert when the latest pain intensity is >= baseline * 1.2 (20% increase) AND absolute increase >= 2 points.
- Behavior: fully local-only by default. No network calls, no automatic provider escalation.

## UI
- A temporary banner notifies the user: "High pain alert — Get help".
- The banner opens a modal with clear, trauma-informed wording and crisis resources (emergency numbers, local resources link).

## Privacy & Safety
- We log a **coarse** audit event (actionType: 'alert', resourceType: 'crisis_alert') without storing PHI or detailed notes to maintain auditability while protecting privacy.
- Analytics events are emitted only if the user has consented to analytics; they **do not** contain PHI.
- Any networked escalation (provider notifications, SMS, or call) is a high-risk feature and requires explicit product and legal review before implementation.

## Configuration
- Crisis detection can be toggled off in Settings (pref stored in the app store).

## Tests
- Unit tests validate baseline computation and detection thresholds in `src/utils/pain-tracker/__tests__/crisis.test.ts`.

## Next Steps / Human Review
- Consider adding PHQ-9/GAD-7 opt-in screening and clinician-facing alerts only after a thorough security & policy review.
- Any automatic external notifications require design and legal approval.
