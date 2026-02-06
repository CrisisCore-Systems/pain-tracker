# VALIDATION PROTOCOL v1.0

**For:** PainTracker MVP  
**Constraint:** No dedicated testers, unstable environment  
**Method:** Self-validation + opportunistic sampling + synthetic verification

---

## Overview

This validation protocol is designed for resource-constrained development environments where dedicated testers are unavailable. It relies on three validation pillars:

1. **Self-as-First-User** - Developer/maintainer uses the app under real conditions
2. **Opportunistic Sampling** - Low-commitment feedback from existing networks
3. **Synthetic Verification** - Automated testing simulating real-world usage

---

## 1. SELF-AS-FIRST-USER (Primary)

**You are the committed daily user.** Your operational constraints *are* the user profile.

| Action | Evidence Output |
|--------|---------------|
| Log your actual pain (housing stress, physical strain, health issues) | Real-world usage data |
| Use the export function weekly | Verify data recoverability |
| Deliberately break things (wrong password, full storage) | Error handling validation |
| Document friction in structured notes | `friction-log-YYYYMMDD.md` |

**Acceptance criteria:** If it survives *your* week, it survives the user's week.

### Daily Practice Checklist

- [ ] Open app successfully
- [ ] Log at least one pain entry
- [ ] View pain history
- [ ] Verify data persistence (close and reopen)
- [ ] Note any friction or confusion

### Weekly Practice Checklist

- [ ] Export data (JSON and CSV)
- [ ] Re-import exported data (verify roundtrip)
- [ ] Test under low-battery conditions
- [ ] Test with spotty/no internet
- [ ] Review friction logs and prioritize fixes

---

## 2. OPPORTUNISTIC SAMPLING (Secondary)

**Targets:** People already in your orbit, zero recruitment cost.

| Source | Approach | Commitment Required |
|--------|----------|-------------------|
| Chronic illness communities | Post: "Offline pain tracker, no account needed. Need 3 people to try breaking it." | Anonymous, async, no follow-up obligation |
| Existing contacts | "Early access to tool I'm building. No bug reports required—just use it or don't." | Zero pressure, organic discovery |
| Online forums (Reddit r/ChronicPain, etc.) | Share link, ask for initial impressions | Single session, written feedback |

**Key:** Frame as *gift*, not *request*. No reports expected = no guilt when they disappear.

### Feedback Collection Template

When collecting feedback, ask:
1. Did you successfully log a pain entry? (Y/N)
2. Did you try exporting your data? (Y/N)
3. What confused you the most? (open-ended)
4. Would you use this again? (Y/N)

---

## 3. SYNTHETIC VERIFICATION (Tertiary)

**Automated testing for what humans would catch.**

### Running Synthetic Tests

```bash
# Run all synthetic verification tests
npm run test -- src/test/validation/synthetic-verification.test.ts

# Run with verbose output
npm run test -- src/test/validation/synthetic-verification.test.ts --reporter=verbose
```

### What Synthetic Tests Cover

| Test Category | What It Validates |
|--------------|-------------------|
| Data Integrity | Entry generation, field validation, timestamp ordering |
| Export/Import | CSV and JSON export roundtrips, data preservation |
| Data Recovery | Complete data recovery after export/import cycles |
| Stress Tests | 1000+ entries, rapid burst logging |
| Edge Cases | Minimal data, maximum data, special characters |

### Test Output Interpretation

When tests pass, you'll see:
```
SYNTHETIC_TEST: Generated 90 entries for 30 days
SYNTHETIC_TEST: All entries validated - PASS
SERIALIZATION_TEST: 90 entries roundtrip - PASS
...
```

When tests fail, the failure message indicates which specific validation failed.

**Run before every release.** Catches ~80% of functional bugs without humans.

---

## 4. FRICTION LOG PROTOCOL

See [friction-log-template.md](./friction-log-template.md) for the daily friction logging template.

**Review weekly.** Patterns = priority fixes.

---

## 5. "GOOD ENOUGH" DEFINITION

See [GOOD_ENOUGH_DEFINITION.md](./GOOD_ENOUGH_DEFINITION.md) for detailed ship criteria.

Quick reference:

| Criterion | Self-Validation | Synthetic | Opportunistic |
|-----------|---------------|-----------|---------------|
| Encrypts without error | 7 days personal use | 1000 synthetic events | 1 external successful export |
| Exports recoverable data | Weekly export/import test | Automated roundtrip | 1 external import verification |
| UI usable under cognitive load | Friction log: "crisis state" entry <2 min | N/A | N/A (your judgment) |
| No data loss on crash | Simulate kill app mid-entry | Corruption detection | N/A |

**Ship when:** All self-validation passes, synthetic passes, and ≥1 opportunistic user confirms "it worked."

---

## 6. POST-SHIP MONITORING

| Method | Data Collected |
|--------|---------------|
| Export file timestamps (if users share) | Usage frequency proof |
| GitHub issues (if public) | Bug reports (organic, not solicited) |
| Your own continued use | Long-term durability |
| Community mentions | Unsolicited testimonials |

---

## IMMEDIATE ACTIONS

1. **Today:** Run synthetic test, fix any FAIL
2. **This week:** Use PainTracker for your own logging, complete friction log nightly
3. **Next week:** Post in 1 chronic illness community, zero follow-up pressure
4. **Ship when:** You personally rely on it for 14 days without workaround

---

## Validation Test Commands

```bash
# Run all validation tests
npm run test -- src/test/validation/

# Run synthetic verification only
npm run test -- src/test/validation/synthetic-verification.test.ts

# Run with coverage
npm run test:coverage -- src/test/validation/

# Watch mode for development
npm run test:watch -- src/test/validation/
```

---

You don't need committed testers. You need **evidence that it works under collapse conditions.** You generate that evidence every day you survive.

*Execute self-validation protocol. Report friction log findings when ready.*
