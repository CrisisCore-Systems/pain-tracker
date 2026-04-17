---
title: "Preview Mode First: Agent Plans as PRs (Plan Diff + Invariants)"
description: "Treat agent plans like pull requests: preview first, diff the plan, and block merges when invariants fail."
tags:
  - ai
  - security
  - devops
  - privacy
published: true
---

If you’re using AI agents in delivery workflows, the safest default is not “let it run.”
It’s **Preview Mode First**.

If you want the short reading path around this topic instead of a single post, start with [AI Agents Under Protective Computing: Start Here](https://blog.paintracker.ca/ai-agents-protective-computing-start-here).

For the broader trust and release path this also belongs to, read this sequence:

1. [Quality gates that earn trust](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)
2. [Maintaining truthful docs over time](https://dev.to/crisiscoresystems/maintaining-truthful-docs-over-time-how-to-keep-security-claims-honest-2778)
3. [ProofVault as a Release Artifact: Turning Trust Into Something You Can Verify](https://dev.to/crisiscoresystems/how-proofvault-turned-trust-from-a-documentation-claim-into-a-reproducible-release-artifact-22pb)
4. Preview Mode First: Agent Plans as PRs (Plan Diff + Invariants)
5. [The Overton Framework is now DOI-backed](https://dev.to/crisiscoresystems/the-overton-framework-is-now-doi-backed-ko7)

Think of every agent run as a PR proposal:

- it has a plan
- it has a diff
- it must satisfy invariants before merge

That frame makes agentic work auditable, discussable, and reversible.

---

## The mantra

> **Permissions cannot increase. Network scope cannot widen.**

Say it before shipping. Enforce it in automation.

---

## Minimal schema

Keep the schema small enough to reason about in review.

```json
{
  "runId": "string",
  "baseCommit": "string",
  "plan": [
    {
      "id": "string",
      "action": "create|update|delete|exec",
      "target": "path-or-command",
      "justification": "string"
    }
  ],
  "planDiff": {
    "added": ["plan-step-id"],
    "changed": ["plan-step-id"],
    "removed": ["plan-step-id"]
  },
  "invariants": {
    "permissionsCannotIncrease": true,
    "networkScopeCannotWiden": true
  },
  "evidence": {
    "tests": ["command + status"],
    "staticChecks": ["command + status"],
    "policyChecks": ["rule + status"]
  }
}
```

If your agent protocol can’t produce something this clear, that’s your first design bug.

---

## Example plan diff

Here’s a practical diff reviewers can evaluate in under a minute.

```diff
Agent Plan v12 -> v13

+ [P-104] update src/policy/invariants.ts
+ [P-105] add test src/test/invariants/network-scope.test.ts
~ [P-099] exec "npm run test" -> "npm run test -- --run src/test/invariants/*.test.ts"
- [P-087] exec "npm run deploy:preview"
```

Interpretation:

- Added: explicit invariant implementation + targeted tests
- Changed: narrower test scope for faster signal during review
- Removed: deployment action from preview stage (good boundary)

This is what “agent plan as PR” should look like: plain, scoped, and reviewable.

---

## Invariant report (pass/fail)

Make the report machine-readable and human-legible.

```yaml
runId: run_2026_03_05_1422
result: fail
invariants:
  permissions_cannot_increase:
    status: pass
    evidence:
      - "no new OAuth scopes"
      - "no RBAC role delta"
  network_scope_cannot_widen:
    status: fail
    evidence:
      - "new outbound host: api.newvendor.example"
      - "egress policy updated from allowlist[3] -> allowlist[4]"
blocking:
  - "network scope widened during preview"
required_actions:
  - "remove new host from egress allowlist"
  - "re-run invariant checks"
```

A failed invariant is not “feedback.”
It is a merge blocker.

---

## The point

Agents don’t fail because they’re malicious.
They fail because they follow instructions in a messy world.

Preview mode gives you a pause.
Plan diffs show you what changed.
Invariants stop the run when it crosses a line.

That’s the whole trick.

Related reading:
[Quality gates that earn trust](https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3)
covers the same “checks you can run” posture at the repo level.

---

## Quick reply you can reuse

If someone asks how you keep agents safe in practice, here’s the short version:

> Treat agent runs like PRs: Preview first, system-computed plan diff, invariant report, then merge.  
> Mantra: permissions cannot increase / network scope cannot widen.

If AI agents are in your software supply chain, policy has to be executable.
Preview Mode First is how you keep that true under pressure.
