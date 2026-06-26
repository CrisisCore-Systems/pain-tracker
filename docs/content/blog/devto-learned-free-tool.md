---
title: "What I Learned Building a Free Tool Before Anyone Asked for It"
description: "User-facing starting point: how to start a pain journal     PainTracker started as a tool I thought..."
tags:
  - learning
  - privacy
  - showdev
  - sideprojects
canonical_url: "https://dev.to/crisiscoresystems/what-i-learned-building-a-free-tool-before-anyone-asked-for-it-1pdh"
cover_image: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F0du3axrt9p6xbwzbsrld.png"
---
<!-- pain-tracker:target-link:start -->
> User-facing starting point: [how to start a pain journal](https://paintracker.ca/resources/how-to-start-a-pain-journal)
<!-- pain-tracker:target-link:end -->
PainTracker started as a tool I thought should exist.

Not because a market report said so.

<!-- pain-tracker:cta-top -->
> If you want privacy-first, offline health tech to exist *without* surveillance funding it: sponsor the build → https://github.com/sponsors/CrisisCore-Systems

Because pain documentation is easy to lose, hard to reconstruct, and usually demanded after the fact.

This is not a deep personal essay. It is a product and engineering lesson.

Some tools have to become real before the market can describe them clearly.

That does not remove the need for discipline, boundaries, and proof.

## Building before validation

Some problems are hard to validate before a product exists.

People may know they have a problem:

- they forget symptoms
- they lose notes
- they struggle before appointments
- they cannot explain functional impact clearly
- they reconstruct timelines under pressure

But they may not search for "local-first offline pain tracking app."

They may search for a printable diary, a symptom tracker, a way to prepare for a doctor, or nothing at all until they are already overwhelmed.

That creates a product problem:

how do you build something useful before the demand vocabulary is stable?

For PainTracker, the answer was to build the smallest protective surface first.

## What I refused to build

I did not want PainTracker's core value to depend on account capture, cloud storage, ads, forced sync, or provider access.

Those choices would have made the product easier to explain in ordinary SaaS terms.

They also would have weakened the boundary I cared about most:

a person should be able to record pain privately before trusting a platform.

That meant core tracking needed to be accountless. The write path needed to be local-first. Export needed to stay user-controlled. Product copy needed to avoid unsupported medical or institutional claims.

Those constraints made the product less flashy.

They also made it more honest.

## Why free core use matters

The people who need pain tracking may not have spare money.

Pain can affect work. Injury can affect income. Chronic illness can create administrative and financial drag. A paywall before basic tracking would weaken the mission.

That does not mean every feature must be free forever.

It means the core utility should remain accessible:

record what happened, review it later, and export context when needed.

If monetization exists, it should not turn basic private pain documentation into a locked door.

## Trust before traction

PainTracker has to earn trust through structure, not volume.

That means:

- clear privacy boundaries
- honest limitations
- useful resources
- technical transparency
- no exaggerated health claims
- no fake authority
- no hidden sharing

This is slower than a louder launch.

It is also better suited to the type of tool this is.

Health-adjacent products cannot borrow trust indefinitely. Eventually, users and reviewers look for the actual boundaries.

## What early discovery showed

The site is indexed.

Some resource pages are getting organic search interest.

External links are beginning to appear from developer and community surfaces.

That is useful, but it is not proof of product-market fit. It is only a signal that the language around the problem is discoverable.

The stronger validation still has to come from specific feedback:

- do users understand the app quickly?
- are reports clear?
- do clinicians find summaries useful?
- are privacy boundaries clear enough?
- does offline behavior hold up?
- what would make the tool easier to use on a bad day?

Those are better questions than "how do we make this louder?"

## Advice to solo developers

Build the smallest useful protective surface.

Then make it real.

Do not overclaim.

Make the tool useful before making the pitch loud.

Write the privacy page early.

Write limitations before marketing copy.

Treat failure modes as product requirements.

Make one thing genuinely useful.

That approach will not always produce fast growth. It will produce a clearer product.

## The useful takeaway

PainTracker.ca is live and free to use.

The most useful feedback right now is specific:

what would make the tool easier to trust, easier to use during a bad pain day, or easier to review before an appointment?

That is the question I am trying to answer next.
<!-- pain-tracker:cta-bottom -->
---
## Support this work

- Sponsor the project (primary): https://github.com/sponsors/CrisisCore-Systems
- Star the repo (secondary): https://github.com/CrisisCore-Systems/pain-tracker
