---
title: "A Small Checklist for Apps That Handle Vulnerable User Data"
description: "Architecture-level checklist context: health app privacy architecture     A normal web app checklist..."
tags:
  - architecture
  - data
  - privacy
  - security
canonical_url: "https://dev.to/crisiscoresystems/a-small-checklist-for-apps-that-handle-vulnerable-user-data-44i"
cover_image: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2Fbqlpyp968m8iqgyqjiah.png"
---
<!-- pain-tracker:target-link:start -->
> Architecture-level checklist context: [health app privacy architecture](https://paintracker.ca/privacy-architecture)
<!-- pain-tracker:target-link:end -->
A normal web app checklist asks whether the feature works.

A protective checklist asks who gets hurt when it does not.

<!-- pain-tracker:cta-top -->
> If you want privacy-first, offline health tech to exist *without* surveillance funding it: sponsor the build → https://github.com/sponsors/CrisisCore-Systems

Most software reviews focus on function, performance, and bugs. Those matter. But when the app handles vulnerable user data, another layer is required.

The question becomes:

does this system preserve user agency under stress?

## What counts as vulnerable user data?

Vulnerable user data is not limited to medical records.

It can include:

- health symptoms
- pain history
- medication notes
- disability documentation
- legal notes
- financial hardship details
- crisis journaling
- identity documents
- private family, housing, or work records

The common feature is not the file type.

The common feature is consequence.

If exposure, loss, confusion, or forced disclosure could materially harm the user, the data deserves a stricter review.

## The core checklist

Here is a compact starting point.

| Question | Why it matters |
| --- | --- |
| Can the user use the core feature without unnecessary exposure? | Reduces coercive data collection |
| What happens offline? | Prevents lost records |
| What happens if the session expires? | Prevents forced repetition |
| Can the user export clearly? | Supports agency |
| Is sharing intentional? | Preserves consent |
| Are errors understandable? | Reduces panic |
| Can the user recover? | Prevents ordinary failure from becoming catastrophic |
| Is account creation actually necessary? | Reduces premature identity capture |
| Is the data minimized? | Reduces exposure |
| Are limitations clearly stated? | Prevents false trust |

This list is not a compliance framework.

It is a product and architecture smell test.

## The Protective Computing lens

Protective Computing treats failure modes as part of the product surface.

The app is not only judged by successful use.

It is judged by degraded use.

What happens when the network drops? When the user is interrupted? When the device is shared? When the tab reloads? When export is misunderstood? When support is not available? When an optional subsystem fails?

If those questions sound like edge cases, the product is still assuming stability.

Sensitive apps should not.

## PainTracker as a checklist example

PainTracker is one practical example.

| Protective concern | PainTracker design response |
| --- | --- |
| User may be offline | Offline-capable core use |
| User may distrust accounts | No account needed for core use |
| Pain details are sensitive | Local-first storage |
| Sharing should be intentional | User-controlled export |
| Reports may be misunderstood | Patient-generated labeling |

That does not make the app perfect.

It makes the boundaries inspectable.

The point of the checklist is not to declare victory. It is to expose where claims need proof.

## What still needs work

Honest review should also name unfinished evidence.

For PainTracker, that includes:

- more usability testing
- clearer backup education
- more accessibility review
- more clinician feedback
- more report format testing
- continued degraded-mode verification

Those limitations are not marketing problems.

They are part of the trust model.

If a product claims to be resilient, private, local-first, or user-controlled, it should be clear where the evidence is strong and where it is still developing.

## Copyable checklist

Before shipping a sensitive feature, ask:

```text
[ ] What does this feature expose?
[ ] What does it require from the user?
[ ] What happens if the user is interrupted?
[ ] What happens if the network fails?
[ ] What happens if the device is shared?
[ ] What happens if export is misunderstood?
[ ] What happens if the user cannot contact support?
[ ] What is the safest degraded state?
```

Then answer in terms of system behavior, not intention.

"We care about privacy" is not an answer.

"The record stays local unless the user exports it" is closer.

"The export preview shows what is included before the file is shared" is better.

## The useful takeaway

Sensitive apps need a different review posture.

Not only "does it work?"

Also:

what does it expose, lose, demand, or break when the user is under pressure?

I am applying this checklist through PainTracker.ca and the broader Protective Computing work at CrisisCore Systems.

Use it, modify it, critique it.
<!-- pain-tracker:cta-bottom -->
---
## Support this work

- Sponsor the project (primary): https://github.com/sponsors/CrisisCore-Systems
- Star the repo (secondary): https://github.com/CrisisCore-Systems/pain-tracker
