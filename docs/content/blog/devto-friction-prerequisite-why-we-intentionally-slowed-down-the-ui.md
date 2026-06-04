---
title: "The Friction Prerequisite: Why We Intentionally Slowed Down the UI"
description: "Fast is not always safe. In vulnerable-state software, some delays, confirmations, and extra steps are not UX debt. They are protective controls."
tags:
  - design
  - accessibility
  - privacy
  - webdev
published: false
---
<!-- pain-tracker:target-link:start -->
> Printable flow with intentional friction: [free pain journal templates](https://paintracker.ca/resources/daily-pain-tracker-printable)
<!-- pain-tracker:target-link:end -->
If you want the short route into this argument, read these first:

1. [The Micro-Coercion of Speed: Why Friction Is an Engineering Prerequisite](https://dev.to/crisiscoresystems/the-micro-coercion-of-speed-why-friction-is-an-engineering-prerequisite-g4j)
2. [Coercion-Resistant UX: Designing Interfaces That Don't Pressure Users Under Stress](https://dev.to/crisiscoresystems/coercion-resistant-ux-designing-interfaces-that-dont-pressure-users-under-stress-18m9)
3. [Protective Computing Is Not Privacy Theater](https://dev.to/crisiscoresystems/protective-computing-is-not-privacy-theater-2job)

This piece is the product-level version of that argument.

It is about the moments where a team knows how to make a flow faster and
chooses not to.

Not because the team is confused.

Not because the team forgot how to make a clean interface.

Because some kinds of speed shift risk onto the person using the system.

## Boundary notes, because truth matters

- This is not a claim that every extra click is protective.
- This is not an excuse for sloppy UX.
- This is not a defense of friction that blocks legitimate use or punishes tired users.

The claim is narrower than that.

In vulnerable-state software, some delays, confirmations, acknowledgements, and
recovery windows are load-bearing.

Remove them carelessly and the interface may become faster, but less honest,
less reversible, and more coercive.

## Speed pressure does not disappear at the interface layer

Teams usually recognize speed pressure in engineering before they recognize it
in product design.

They can see the CI shortcut.
They can see the unsafe deploy.
They can see the code path that skipped review.

But the same pressure appears in interfaces.

Make it faster.
Reduce clicks.
Collapse the steps.
Hide the warning.
Trust the user to understand the consequence.

That sounds efficient until the action is irreversible, sensitive, or easy to
misread under stress.

Then the so-called optimization is just risk transfer.

The user absorbs the cost of the team's desire for smoothness.

## A fast path can become a coercive path

This is the part most product teams understate.

People do not interact with software under ideal conditions.

They are tired.
Distracted.
In pain.
Rushing.
On a bad connection.
Trying to finish something before they lose the window to do it.

In that state, fast paths do not only feel convenient.

They become behavioral rails.

The bigger and easier button wins.
The default wins.
The buried consequence loses.
The thing that requires careful reading gets skipped.

That is why protective friction exists.

Not to obstruct the user.

To keep the interface from silently deciding on the user's behalf.

## Friction is only good when it protects a real boundary

There is a lazy version of this argument that says any extra step is virtuous.

That is wrong.

Bad friction wastes time.
Protective friction preserves agency.

The difference is whether the delay is attached to a real boundary.

Examples of real boundaries:

- exporting sensitive records,
- sharing or revealing data outside the device,
- deleting or wiping high-value information,
- accepting defaults that change exposure,
- confirming an irreversible action,
- or interrupting a flow long enough for the user to notice what will happen next.

If the boundary is real, the friction may be carrying actual ethical weight.

If the boundary is fake, the friction is just theater.

## What intentional slowing down looks like

Intentional slowing down is usually small.

It is not a dramatic lock screen for everything.

It is targeted.

One explicit risk acknowledgement before an unencrypted export.
One recovery window before a destructive action becomes final.
One confirmation step that uses plain language instead of vague button copy.
One interface pause that forces the consequence into view before the system moves on.

Those patterns are not there because the team failed to simplify.

They are there because simplification can lie.

## The export flow is a good example

This is where a lot of products tell on themselves.

They claim to respect privacy, then make export feel instant and harmless even
when the file contains the person's most sensitive history.

The safer pattern is slower on purpose.

The user should have to explicitly choose the export.
The interface should disclose the risk when the artifact is not encrypted.
Generated file references should not linger forever after the job is done.

That is not bureaucracy.

It is what it looks like when the interface admits that crossing the export
boundary changes the exposure surface.

If you want the underlying boundary model, read [Exports are a security boundary](https://dev.to/crisiscoresystems/exports-are-a-security-boundary-the-moment-local-first-becomes-shareable-3gj9).

## Calm UX is often slower UX

There is a reason protective interfaces tend to feel calmer than growth-shaped
ones.

Calm interfaces do not try to outrun the user's hesitation.

They leave space.

They explain what will happen.
They make the safe option visible.
They allow reversal when the security model permits it.
They do not weaponize momentum.

That usually means some flows take longer.

Good.

If the system is handling records, safety settings, exports, or other high-cost
actions, the goal is not maximum throughput.

The goal is honest interaction under less-than-ideal conditions.

## The product question is not “can we remove this step?”

The product question is whether removing the step transfers hidden burden onto
the user.

Does it make accidental disclosure easier?
Does it make deletion easier to misfire?
Does it hide a real consequence behind a cleaner screen?
Does it erase the recovery window that protected the user from one bad moment?
Does it make the unsafe path easier than the safe one?

If the answer is yes, the step was not waste.

It was a control.

## The friction prerequisite

This is the standard I keep coming back to.

If a flow crosses a real trust boundary, the system should earn the right to be
fast.

Not the other way around.

Speed is the thing you get after clarity, reversibility, and consequence have
been made explicit.

When teams skip straight to smoothness, they often end up compressing the only
moment where the user could still notice what was about to happen.

That is the friction prerequisite.

The interface has to prove it can stay honest before it gets to be fast.

## The protective test

Before removing a step from a sensitive workflow, ask the harder question.

What user burden is this step currently absorbing?
What failure becomes easier if it disappears?
What risk becomes less visible?
Who benefits from the simplification?
Can the user still understand, reverse, or refuse the action afterward?

If removing the step makes the flow cleaner for the team but riskier for the
person using it, the interface has not improved.

It has become more coercive.

## Read next

If you want the engineering-layer version of this argument, read [The Micro-Coercion of Speed](https://dev.to/crisiscoresystems/the-micro-coercion-of-speed-why-friction-is-an-engineering-prerequisite-g4j).

If you want the interface ethics layer underneath it, read [Coercion-Resistant UX](https://dev.to/crisiscoresystems/coercion-resistant-ux-designing-interfaces-that-dont-pressure-users-under-stress-18m9).

If you want the doctrine that treats these controls as architectural rather than stylistic, read [Protective Computing Is Not Privacy Theater](https://dev.to/crisiscoresystems/protective-computing-is-not-privacy-theater-2job).
