# The Ethics of Simulation: How to Test Trauma-Informed Features Without Exploiting Real Pain

*Part of the CrisisCore Build Log - when the testing strategy becomes a moral question*

---

Here's a question nobody asks in the testing literature:

**Where does your test data come from?**

For most applications, nobody cares. Mock users. Fake addresses. Random strings.

For a pain tracker? The test data is descriptions of suffering. And that raises questions I didn't expect when I started this project:

- Is it ethical to generate realistic crisis scenarios?
- Who gets to write test cases about suicidal ideation?
- How do you test a trauma-informed system without retraumatizing your own team?

This post is my attempt to think through those questions honestly.

---

## The Uncomfortable Reality

To test Pain Tracker properly, I need test data that looks like this:

```typescript
const sampleMoodEntries: MoodEntry[] = [
  {
    mood: 2,
    energy: 1,
    anxiety: 9,
    context: 'Severe pain flare-up, emergency room visit',
    triggers: ['acute pain', 'medical emergency', 'work absence'],
    notes: 'Overwhelmed by sudden pain onset. Anxious about work and recovery.',
  },
  // ...
];
```

That's someone's worst day, encoded in TypeScript.

The more realistic the test data, the better my crisis detection works. But realism has a cost. Every time a developer opens that fixture file, they're reading a description of suffering.

Where's the line between **testing rigor** and **trauma exploitation**?

---

## Principle 1: Synthetic Data Should Be Fictional, Not Extracted

There are two ways to get realistic test data:

**Option A: Extract from real users**
- High realism
- Privacy nightmare
- Even anonymized, you're commodifying someone's pain

**Option B: Synthesize from patterns**
- Slightly lower realism
- No privacy concerns
- The pain described never happened to anyone

I chose Option B exclusively. Here's why:

### The Extraction Problem

Real pain journals contain specific, identifiable details:
- "My boss yelled at me after the third sick day"
- "The new medication made me throw up during my daughter's recital"
- "I'm scared my wife will leave"

Even "anonymized," these remain someone's lived experience. Using them in tests means:
- Developers read private moments repeatedly
- Data could be reconstructed from patterns
- The person never consented to their worst days becoming test fixtures

### The Synthesis Approach

Instead, I generate fictional-but-plausible data:

```typescript
/**
 * SYNTHETIC DATA GENERATION
 * 
 * These entries are FICTIONAL. They represent patterns, not people.
 * No real person's pain journal was used to create these fixtures.
 */
export function generateSyntheticMoodEntry(
  scenario: 'crisis' | 'recovery' | 'stable' | 'declining'
): MoodEntry {
  const patterns = {
    crisis: {
      moodRange: [1, 3],
      anxietyRange: [7, 10],
      contextTemplates: [
        'Unexpected pain flare',
        'Sleep disruption for multiple days',
        'Medication change with difficult adjustment',
      ],
      triggerPool: ['pain spike', 'sleep loss', 'isolation', 'work stress'],
    },
    // ... other scenarios
  };
  
  const pattern = patterns[scenario];
  
  return {
    id: generateId(),
    timestamp: generateTimestamp(),
    mood: randomInRange(pattern.moodRange),
    anxiety: randomInRange(pattern.anxietyRange),
    context: randomChoice(pattern.contextTemplates),
    triggers: randomSubset(pattern.triggerPool, 2, 4),
    // Notes are generic, never mimicking real journal entries
    notes: generateGenericNote(scenario),
  };
}
```

The data is realistic enough to test patterns, but it doesn't represent any real person's experience.

---

## Principle 2: Consent-First Testing with Lived Experience

Synthetic data tests the code. But does the code actually help real people?

For that, you need human testers. And recruiting people with chronic pain to test a pain tracker requires serious ethical consideration.

### What I Don't Do

**❌ "Could you log some real entries so I can see how the app handles them?"**

This extracts labor and data without proper compensation or consent.

**❌ Recruiting from pain support communities without disclosure**

People in support groups are there for support, not to be user research subjects.

**❌ Offering "free premium access" as the only compensation**

That's not compensation—that's a discount on a product you're asking them to improve.

### What I Do

**✅ Clear opt-in with informed consent**

```
PARTICIPANT INFORMATION SHEET

What we're asking:
- Use the app during normal daily activities
- Share feedback on whether the crisis features felt helpful
- Optionally: describe moments where the app did/didn't meet your needs

What we're NOT asking:
- Access to your actual pain data
- Details of your medical history
- Any information you don't want to share

You can withdraw at any time without explanation.
```

**✅ Compensation that values emotional labor**

Testing a trauma-informed app means potentially confronting your own trauma. That's emotional labor. My minimum compensation rate for lived-experience testing is 2x what I'd pay for generic UX testing.

**✅ Exit ramps and support resources**

Every testing session includes:
- A clear way to pause or stop
- Crisis resources (9-8-8, etc.) visible throughout
- A debrief where participants can process the experience
- Follow-up check-in 24-48 hours later

**✅ Veto power over findings**

If a participant shares something during testing and later regrets it, they can request it be excluded from any analysis or documentation.

---

## Principle 3: Trigger Warnings in Test Suites

Here's something almost no one talks about: **developers have trauma too**.

When I open a test file that contains crisis scenarios, I'm reading descriptions of distress. Repeatedly. For hours.

If a developer on my team has personal experience with chronic pain, suicidal ideation, or medical trauma, those test files aren't neutral.

### Test Environment Content Warnings

I mark fixture files with content warnings:

```typescript
/**
 * @fileoverview Mood and crisis test fixtures
 * 
 * ⚠️ CONTENT WARNING: This file contains synthetic test data
 * representing crisis states, including:
 * - High anxiety/distress scenarios
 * - Pain flare simulations
 * - Low mood/hopelessness patterns
 * 
 * These are FICTIONAL and generated from patterns, not real data.
 * If you need to step away, the test suite will run without modification.
 * 
 * Crisis resources: 988 (US), 9-8-8 (Canada)
 */
```

### Separating Sensitive Tests

I organize tests so developers can choose their exposure:

```
src/test/
├── fixtures/
│   ├── pain-entries.ts          # Basic pain data
│   ├── mood-entries.ts          # Mood tracking data
│   └── crisis-scenarios.ts      # ⚠️ Crisis state simulations
├── __tests__/
│   ├── analytics/               # Can run without crisis data
│   ├── export/                  # Can run without crisis data
│   └── crisis/                  # Requires crisis fixtures
│       └── README.md            # Content warning + rationale
```

Test commands allow selective execution:

```json
{
  "scripts": {
    "test": "vitest",
    "test:no-crisis": "vitest --exclude='**/crisis/**'",
    "test:crisis-only": "vitest crisis/"
  }
}
```

A developer having a hard day can run `npm run test:no-crisis` and still validate their work.

---

## Principle 4: The Representation vs. Exploitation Line

When does test data cross from "representing pain patterns" to "exploiting suffering for engineering purposes"?

I don't have a perfect answer, but I have a framework:

### Questions I Ask Before Creating Test Data

**1. Would I want this test case written about my worst day?**

If I'd feel exposed or uncomfortable seeing my own experience reduced to a TypeScript object, the test case is probably too specific.

**2. Does this test case require specificity, or is it testing pattern recognition?**

Crisis detection doesn't need to know that "Sarah's boss made her cry in the break room after her third flare this month." It needs to know that "high stress + pain spike + sleep disruption = elevated risk."

Test the pattern. Not the story.

**3. Who benefits from this realism?**

If hyper-realistic test data makes the tests more impressive but doesn't improve detection accuracy, the realism is voyeuristic.

**4. Could someone reconstruct a real person from this data?**

Even fictional data can accidentally describe real experiences. I review synthetic data for combinations that might match specific, identifiable situations.

### The Voyeurism Test

Here's my gut check: **Would reading this test file feel like reading someone's diary without permission?**

If yes, the data is too intimate. Generalize it.

```typescript
// ❌ Too specific, feels voyeuristic
notes: "I screamed at my kids this morning. I'm becoming my mother."

// ✅ Tests the same pattern, respects dignity
notes: "Difficulty managing frustration. Family stress elevated."
```

---

## Principle 5: Anonymization Isn't Enough

If I ever did need to use real data (I currently don't), anonymization isn't sufficient.

### Why Anonymization Fails for Pain Data

Standard anonymization removes:
- Names
- Dates
- Locations
- Direct identifiers

But chronic pain journals contain:
- Specific life events ("my wedding anniversary flare")
- Relationship dynamics ("my partner doesn't believe me")
- Medical details that narrow possibilities
- Unique combinations of symptoms and triggers

Even "anonymous" data can be cross-referenced with other information to identify individuals.

### Differential Privacy: A Better Model

If I needed to derive patterns from real data, I would use differential privacy:

```typescript
/**
 * Add noise to aggregate statistics so individual entries
 * cannot be reconstructed from the output.
 */
function differentiallyPrivateAverage(
  values: number[],
  epsilon: number = 1.0
): number {
  const trueAverage = values.reduce((a, b) => a + b, 0) / values.length;
  const sensitivity = 10 / values.length; // Pain is 0-10
  const noise = laplacianNoise(sensitivity / epsilon);
  return trueAverage + noise;
}
```

The output reveals population-level patterns without exposing individual entries.

But for Pain Tracker, I've avoided this entirely by using synthetic data from the start.

---

## Principle 6: Compensation Models That Value Emotional Labor

If you're asking someone to use a pain tracker during a flare and then tell you about it, you're asking for:

1. **Time** — The hours spent using and evaluating the app
2. **Expertise** — Their lived knowledge of what actually helps
3. **Emotional labor** — The cost of re-engaging with painful experiences
4. **Vulnerability** — The risk of sharing personal information

Standard UX research compensation covers (1) and maybe (2). It rarely accounts for (3) and (4).

### My Compensation Framework

| Activity | Compensation | Rationale |
|----------|--------------|-----------|
| Survey about feature preferences | $25 | Low emotional load |
| 30-min usability session | $75 | Moderate engagement |
| Week-long diary study | $200 | Sustained emotional labor |
| Crisis feature testing | $150/hour | High emotional load, specific expertise |
| Follow-up interview about difficult moments | $100 + debrief | Vulnerability compensation |

All participants also get:
- Final product access (not as compensation—as thanks)
- Opt-out of any findings at any time
- Credit in acknowledgments (optional, with explicit consent)

### Why This Matters

Underpaying lived-experience testers sends a message: "Your pain is valuable to us, but not *that* valuable."

If trauma-informed design means anything, it means not recreating extractive dynamics in your own research process.

---

## Framework: Trauma-Informed User Research Protocol

Based on everything above, here's the protocol I use:

### Before Research

1. **Ethical review** — Even for informal testing, I document the purpose, risks, and mitigation strategies
2. **Clear scope** — Participants know exactly what they're being asked to do and share
3. **Opt-in recruitment** — I never recruit from support groups or communities without explicit partnership with community leaders
4. **Compensation clarity** — Payment amounts and structure communicated upfront

### During Research

1. **Check-ins** — Every 15-20 minutes: "How are you doing? Do you want to continue?"
2. **Exit ramps** — Participants can pause, skip questions, or end early without losing compensation
3. **No pressure for specificity** — "As much or as little detail as you're comfortable with"
4. **Crisis resources visible** — 9-8-8 / 988 information present throughout

### After Research

1. **Debrief** — 10-15 minutes to process the experience
2. **Follow-up** — Check-in within 48 hours
3. **Veto rights** — Participants can request any of their input be excluded
4. **Transparency** — Participants see how their input shaped the product

---

## What I Got Wrong (And What I'd Do Differently)

### Early Mistake: Using "Realistic" Notes in Fixtures

In early development, I wrote test fixtures with specific, narrative notes:

```typescript
// ❌ What I originally wrote
notes: "Day 4 of this flare. Can't get out of bed. Called in sick again. 
        Pretty sure my boss is going to fire me. Maybe that would be easier."
```

That's not a test case. That's trauma cosplay.

I rewrote all fixtures to be pattern-based, not narrative:

```typescript
// ✅ What I use now
notes: "Extended flare duration. Mobility limited. Work impact concerns."
```

Same signal. Less exploitation.

### Early Mistake: Not Warning Myself

Before I added content warnings to files, I'd sometimes open crisis fixtures after a bad day and find myself spiraling. The test data I wrote was triggering... me.

Now every sensitive file has a header warning, and I practice what I preach about selective test running.

---

## The Bigger Question

Testing trauma-informed software requires confronting this:

**Your test suite is a model of human suffering.**

That model can be:
- **Extractive** — treating real pain as raw material
- **Voyeuristic** — fetishizing crisis for engineering purposes
- **Respectful** — representing patterns without exploiting people

The technical quality of your tests is irrelevant if the ethical quality is absent.

---

## Summary: The Principles

1. **Synthetic over extracted** — Generate fictional patterns, don't mine real journals
2. **Consent-first testing** — Informed, compensated, with exit ramps
3. **Trigger warnings for developers** — Your team has trauma too
4. **Representation, not exploitation** — Test patterns, not stories
5. **Anonymization isn't enough** — Differential privacy or don't use real data
6. **Value emotional labor** — Compensate accordingly

---

## Resources

- [Trauma-Informed Design Research](https://www.nngroup.com/articles/trauma-informed-research/) — NNGroup
- [Differential Privacy](https://www.cis.upenn.edu/~aaroth/Papers/privacybook.pdf) — Dwork & Roth (academic)
- [Ethical UX Research](https://www.smashingmagazine.com/2022/06/ethics-ux-research/) — Smashing Magazine
- [HIPAA and Synthetic Data](https://www.hhs.gov/hipaa/for-professionals/privacy/special-topics/de-identification/index.html) — HHS
- Pain Tracker source: [github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)

---

*Next in the series: "Offline Crisis Support: What Happens When the Network Dies at the Worst Moment"*

---

If you're building in this space and want to discuss ethics, I'm open to conversation. The questions are hard, and I don't have all the answers.

If your pages look anything like mine:
- In Canada, call or text **9-8-8**
- In the US, call or text **988**

You're not test data. You're a person. And you deserve software that remembers that.
