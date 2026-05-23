# PainTracker.ca Audit v3 Implementation

## Positioning
Private pain documentation for people who need records without surrendering their health data.

## Homepage Copy Structure
1. Hero
2. Privacy proof
3. What you can track
4. Why structured records help
5. Export and share by choice
6. Choose your path
7. Built differently
8. FAQ
9. Final CTA

## Homepage Copy (Deployed)
### Hero
- Headline: Track chronic pain privately, even offline.
- Primary CTA: Start Tracking Free
- Secondary CTA: Download Printable Pain Journal
- Trust line: No account. No cloud pain database. Works offline after first load.

### Privacy Proof
- Section title: Private by architecture, not by promise.
- Four proof cards:
  - No account required
  - Local records
  - Offline capable
  - Export by choice
- Architecture bullets:
  - No account gate.
  - No central pain entry database.
  - No required cloud login.
  - No forced sharing.

### What You Can Track
- Pain intensity
- Body location
- Symptoms
- Medication
- Triggers
- Daily function
- Notes
- Exports

### Why It Matters
- Core framing:
  - Pain is hard to explain after the fact.
  - Appointments are short.
  - Memory is unreliable.
  - Flares blur together.

### Export and Sharing
- Core framing: Share records only when you choose.
- Disclaimer:
  - PainTracker.ca does not provide medical advice, diagnosis, treatment, legal advice, or guaranteed claim outcomes.
  - Always review exports before sharing them.

### Choose Your Path
- Start tracking privately
- Use paper first
- Prepare for an appointment
- Document injury or disability impact
- Review the privacy model

### Built Differently
- Built by CrisisCore Systems.
- Protective Computing language remains architecture-focused and non-theatrical.

### FAQ (Deployed Set)
- Do I need an account?
- Where are my pain records stored?
- Does it work offline?
- Can I export my records?
- What happens if I lose my device?
- What happens if I forget my passphrase?
- Is this medical advice?
- Can it guarantee a claim outcome?

## SEO Separation Matrix
| Page | Primary job | Title | H1 |
|---|---|---|---|
| Homepage | Brand trust + broad conversion | PainTracker.ca | Free Private Pain Tracker App That Works Offline | Track chronic pain privately, even offline. |
| Pain tracking app page | Category search intent | Private Offline Pain Tracking App for Chronic Pain and Flares | A private pain tracking app built for real life. |
| Download page | Install intent | Download PainTracker Free | Private Offline Pain Tracker | Download PainTracker free. |
| Printable page | Printable template intent | Free Daily Pain Tracker Printable PDF | Free daily pain tracker printable. |
| WorkSafeBC template page | Workplace documentation intent | WorkSafeBC Pain Journal Template for Workplace Injury Notes | Pain journal template for workplace injury documentation. |

## Legal and Claims Language Guardrails
### Allowed
- may help
- can help organize documentation
- claim-related review
- workplace injury discussions

### Not allowed
- claim-ready
- guaranteed approval
- win your claim
- legal outcome promises
- definitive legal/medical interpretations

### Required disclaimer placement
- Export section on homepage
- WorkSafeBC-related page trust/legal area

## Technical Verification Checklist
### Critical data-flow checks
- [ ] Confirm no pain entry data is sent to analytics.
- [ ] Confirm no pain entry data appears in server logs.
- [ ] Confirm service worker does not cache sensitive API responses incorrectly.
- [ ] Confirm offline app shell loads from a cold browser state.
- [ ] Confirm app route works when opened directly offline after install.
- [ ] Confirm encrypted storage behavior matches public claims.
- [ ] Confirm passphrase loss messaging is explicit.
- [ ] Confirm export files do not contain hidden metadata you do not intend.

### Performance and split checks
- [ ] Homepage does not load app-only code.
- [ ] Homepage does not load export libraries.
- [ ] Homepage does not load charting libraries.
- [ ] Homepage does not load Stripe code.
- [ ] Marketing pages remain mostly static.
- [ ] App functionality is route split.
- [ ] Export modules are lazy loaded.
- [ ] Chart modules are lazy loaded.

### PWA checks
- [ ] Manifest exists.
- [ ] Theme color matches brand.
- [ ] Maskable icons exist.
- [ ] Install prompt behavior is clean.
- [ ] Offline fallback works.
- [ ] Deep links do not collapse offline.
- [ ] Service worker updates are explicit and non-destructive.
- [ ] Storage persistence warnings are clear.

## Pain-Aware UX Copy Rules
### Avoid
- You missed a day.
- Keep your streak.
- Stay consistent.
- Complete your daily goal.
- You are falling behind.

### Prefer
- Log what you can.
- Partial records are still useful.
- You can add context later.
- A missed day does not erase the pattern.
- Your record does not need to be perfect to be helpful.
