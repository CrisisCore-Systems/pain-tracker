---
title: "How to Add AI to Sensitive Apps Without Turning It Into an Extraction Path"
description: "A boundary pattern for AI assistants that keeps core use local, requires explicit send, and treats model output as untrusted."
tags:
  - ai
  - privacy
  - architecture
  - security
published: false
---
<!-- pain-tracker:target-link:start -->
> Review the local data boundary: [privacy architecture](https://paintracker.ca/privacy-architecture)
<!-- pain-tracker:target-link:end -->
AI is often added to sensitive apps through the worst possible door.

The app already has intimate local data.

The team wants summaries, suggestions, classifications, or chat.

So they add a model call near the data layer and start sending context.

The feature looks useful.

The architecture just created a new extraction path.

If the core product is local-first, privacy-first, or high-trust, AI cannot be treated as a normal helper function. It has to sit behind an explicit boundary.

This extends the agent boundary argument from [OpenClaw and the Boundary Problem](https://dev.to/crisiscoresystems/openclaw-and-the-boundary-problem-5f85) and the review posture in [Preview Mode First](https://dev.to/crisiscoresystems/preview-mode-first-agent-plans-as-prs-plan-diff-invariants-4ikd) into sensitive product architecture.

## Core use must not depend on AI

The first rule is simple:

The user must be able to complete the essential task without AI.

If the user needs to record a note, export a report, restore a backup, or inspect their data, that path should not require a model, a network call, a token budget, or a third-party inference service.

AI can assist.

It cannot become the gate.

That means the feature flag should be around the assistant, not around the core workflow.

```ts
type CoreCapability =
  | "write-local-record"
  | "read-local-record"
  | "export-local-data"
  | "restore-backup";

type OptionalCapability =
  | "summarize-selected-records"
  | "draft-question-list"
  | "classify-user-selected-text";
```

The architecture should make that distinction hard to violate.

## Use an explicit send boundary

Remote AI use should require a user-selected payload and an explicit send action.

Not "analyze my account."

Not "improve my experience."

Not automatic background summarization.

A safer flow:

1. User selects the exact records or text.
2. App shows what will be sent.
3. App removes fields that are not needed.
4. User confirms the transfer.
5. App sends only that bounded payload.
6. App labels the output as generated and editable.

That preview matters.

It turns a hidden upload into a visible boundary.

## Redact before transport

Do not rely on prompt wording as a privacy control.

Prompting a model "do not expose private data" does not reduce what the app already transmitted.

Create a transport model that is narrower than the local model:

```ts
type LocalPainEntry = {
  id: string;
  createdAt: string;
  painLevel: number;
  bodyRegion?: string;
  note?: string;
  medication?: string;
  attachmentIds: string[];
};

type AiSummaryInput = {
  dateBucket: string;
  painLevel: number;
  bodyRegion?: string;
  noteExcerpt?: string;
};
```

Then make the redaction function testable:

```ts
function toAiSummaryInput(entry: LocalPainEntry): AiSummaryInput {
  return {
    dateBucket: entry.createdAt.slice(0, 10),
    painLevel: entry.painLevel,
    bodyRegion: entry.bodyRegion,
    noteExcerpt: entry.note ? entry.note.slice(0, 280) : undefined,
  };
}
```

The example is intentionally conservative. A real app may need a different model. The principle is the same: the remote payload is a separate type with a smaller surface.

## Treat model output as untrusted

AI output should not directly mutate high-stakes state.

Generated summaries, labels, and suggestions should be drafts. The user should be able to edit, discard, or export them without confusing them for source records.

Use provenance:

```ts
type GeneratedDraft = {
  id: string;
  sourceRecordIds: string[];
  generatedAt: string;
  modelLabel: string;
  status: "draft" | "accepted" | "discarded";
  text: string;
};
```

Do not overwrite the original record with the generated version.

Do not let a model silently classify a person in a way that becomes load-bearing later.

Do not convert probabilistic output into irreversible state.

## Keep keys and local encryption boundaries separate

If the app uses local encryption, do not blur that boundary for the AI feature.

The [Web Cryptography API](https://www.w3.org/TR/webcrypto/) gives browsers cryptographic primitives, but primitives are not a product guarantee. The important product question is where decrypted content exists and when it crosses process or network boundaries.

An AI feature should not get casual access to decrypted local stores just because it is convenient.

Make the handoff explicit:

- local encrypted record
- user-selected decrypted view
- redacted AI payload
- remote request
- generated draft
- user-reviewed action

Those are different states.

Name them.

## The boundary checklist

Before shipping AI inside a sensitive app, require yes-or-no answers:

- Can core use work with AI disabled?
- Is remote AI off by default?
- Does the user choose the payload?
- Can the user inspect the payload before send?
- Is there a redaction allowlist?
- Are generated outputs marked as drafts?
- Are source records preserved?
- Is there a local delete path for generated outputs?
- Are failed model calls non-destructive?
- Does documentation say exactly what leaves the device?

If the answer is vague, the boundary is vague.

AI can be useful in sensitive tools.

But usefulness is not enough.

The feature has to preserve local authority, minimize exposure, and fail without trapping the core workflow behind a model call.

Otherwise the assistant is not protective.

It is just another upload path.
