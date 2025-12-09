---
title: "Coding Through Collapse: Building Software From Motel Rooms and Concrete Nooks"
datePublished: Tue Dec 09 2025 06:21:30 GMT+0000 (Coordinated Universal Time)
cuid: cmiy6ztfx000402kyd3zw4id2
slug: coding-through-collapse
tags: privacy, healthcare, mental-health, open-source, developer-stories, personal-story

---

---
title: "Building From Rubble"
seoTitle: "Homeless Developer Builds Privacy-First Healthcare App | A True Story"
seoDescription: "From motel rooms with no vehicle to shipping trauma-aware software. The real story of building Pain Tracker while everything else collapsed."
datePublished: Sun Dec 08 2025 18:00:00 GMT+0000 (Coordinated Universal Time)
slug: building-from-rubble
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1764600000000/building-from-rubble-cover.png
tags: healthcare, mental-health, open-source, homelessness, trauma-informed, developer-stories, privacy, offline-first, personal-story

---


There's a three-sided concrete structure behind a gas station in Vernon, BC. If you build a fire in the back corner and sit with your spine against the wall, the wind doesn't hit you directly.

Last winter I sat there, frost on my jacket, checking if my commit passed CI.

Not a metaphor. Literal fire. Literal concrete. Phone at 4% battery.

---

## The Wreck

December 2023. Night. Snow. The SUV rolls.

I'm not wearing a seatbelt. Glass, metal, white, dark. One thought: *I hope this is still drivable.*

It isn't.

I walk away physically intact. No vehicle. Middle of nowhere. Winter coming.

What follows: dragging belongings in carts through slush that freezes around the wheels. Motels in Lumby, Vernon, Kelowna. That concrete nook. Buses that don't run Sundays. Cold that makes you negotiate with yourself about frostbite.

January 4th, 2025: I start a new repository.

`pain-tracker`

---

## The Label

Somewhere in my medical file, the word **addict** appears.

Once it's there, you're not a patient. You're a risk. Your pain is suspicious. Your requests for help are manipulation.

They sent me to NA. Standard protocol.

Every meeting, every "Hi, I'm ___ and I'm an addict," hammered the identity deeper. The rooms didn't feel like recovery. They felt like confirmation.

*You are what they say you are.*

The treatment made it worse. I'm not saying NA doesn't work—for some people it's lifesaving. For me, it fueled the destruction.

The system's help was not help. And I couldn't make anyone see that.

---

## Before

I need to give you one story so the rest makes sense.

I'm a kid. Maybe twelve. My father's basement suite.

I have a CD collection. Limp Bizkit. ICP. Eminem. Slipknot. This is my lifeline. When home is chaos, when adults are unreliable, when I don't know where I'll be living next month—the music stays. The music is *mine.*

One day I come home and the CDs are gone. All of them.

My father pawned them. Every disc. To buy drugs.

He justified it with something his coworkers said about my music being bad for me.

---

That's the template. That's what I learned: **if something good exists, someone will take it.** Love is temporary. Home is temporary. Safety is temporary. The thing keeping you alive can be sold without warning.

I won't list every move. Every time my mother kicked me onto the street. The aunt and uncle in Alberta who confiscated my remaining music and made me sit while they dissected lyrics like it was therapy. The "friend" of my father's who forced entry and blew crack smoke in my face while I was home alone.

The point is: every system that should have protected me either left, shamed me, or traded me for something it needed more.

By my teens I was living with my grandmother in a one-bedroom, clothes smelling like smoke, heavy into drugs and selling, carving a name into my thigh, reported missing at one point.

I told myself: *I've pre-paid my chaos. The universe owes me calm.*

The universe doesn't work that way.

---

## Harrison

I have a son.

He's why I'm writing this instead of being a statistic.

I won't say he "saved" me—that's too much weight for a child. But when the thoughts get loud (*shotgun, hanging, disappearing*), there's a counter-signal:

**I won't leave him the way I was left.**

Last year we went to a museum. He pointed at dinosaur bones, asking questions I didn't know the answers to.

*This is the only thing I've done right. Don't fuck this up.*

---

## Why I Build

Motel room. No vehicle. Housing unstable. Legal proceedings. WCB tangled with income assistance in ways that penalize having any safety net. Parole check-ins I nearly miss because dates blur in survival mode.

And I'm writing React components.

Not because I've transcended anything. Because building is the only thing that makes sense.

When every system fails you—family, healthcare, housing, legal—you collapse entirely or you build systems that work differently.

I build.

---

## The Architecture of Refusal

Every technical decision is scar tissue.

### No Backend

```typescript
const store = create()(persist(
  (set) => ({ entries: [] }),
  { name: 'pain-tracker-local' }
  // Your data stays HERE. I will never see it.
  // No servers to subpoena. No databases to breach.
  // It can't testify against you because it doesn't know you exist.
));
```

I've had my data used against me. Chart notes that followed me. Flags that pre-decided what I was before any provider met me.

Pain Tracker can't do that. It doesn't phone home. It forgets you the moment you close it.

### No Accounts

No email. No password. No recoverable identity.

The moment you create an account, you've linked your health data to something that can be correlated, sold, subpoenaed, leaked.

Open the app. Use it. Close it. Gone.

### No Judgment

It doesn't calculate compliance scores. Doesn't streak-shame. Doesn't analyze your patterns. Doesn't tell you you're getting worse. Doesn't tell you you're getting better.

It records.

Sometimes witness is enough. Sometimes the most helpful thing technology can do is shut up and hold your data until you need it.

### Panic Mode

```typescript
// One button. Crisis resources. Now.
// I built this after a night when my hands wouldn't stop shaking
// and I couldn't find the numbers I needed.
```

When you're in that place, you can't navigate menus. You need something that just works.

---

## Parallel Work

**CrisisCore-Systems**: Collapse Systems Engineer. I audit smart contracts for vulnerabilities. Not because I came from finance—because I've lived inside systems as they fail.

**TaintedStrokes**: Memorywear. Collapse artifacts. Poetry about rage and grief.

The throughline:

*I build systems that refuse to betray the user in the exact ways the world has betrayed me.*

---

## The Notebooks

Scattered across motel rooms and storage boxes:

*WCB appeals, reassessment requests*—next page—*I NEED HELP with everything*—next page—*Architecture diagram for the empathy engine*—next page—*Life is not fair. Life must be some sort of fucked up cosmic joke*—next page—*A carefully colored Seed of Life mandala*—next page—*Integration tests*—next page—*I am not normal. I can't stand living like this anymore.*

The mess doesn't invalidate the work.
The work doesn't fix the mess.
Both exist.

If you're building while drowning, you're not alone. We don't talk about it because the story we're supposed to tell doesn't include motel rooms and concrete nooks and pages that say we want to die.

---

## The App

It exists. If you need something that won't judge you, won't share your data, won't require you to be okay first—it's there.

[paintracker.ca](https://paintracker.ca) · [source](https://github.com/CrisisCore-Systems/pain-tracker)

Free. Open. I'm not making money from your pain.

---

## If You're in the Rubble

I won't tell you it gets better. Sometimes it does. Sometimes it doesn't.

I won't tell you to call a crisis line. They have their uses. Sometimes they make things worse too.

What I'll say:

You're not broken because systems broke you. You're not an addict because someone wrote it in your chart. You're not worthless because people treated you like you were.

If you're still reading this, still breathing—that counts. Even when it doesn't feel like it.

**Canada / US:** 988
**SAMHSA:** 1-800-662-4357
**International:** [findahelpline.com](https://findahelpline.com)

If those don't work, find one human. Just one. Tell them you're not okay.

---

## The Core

A kid who learned that home, love, and safety were temporary becomes an adult who keeps losing all three.

And that adult, from motel rooms and bus shelters and three-sided concrete nooks, insists on building systems that refuse to abandon people the way he was abandoned.

---

The fire's still burning.

I'm still building.

---

*[GitHub](https://github.com/CrisisCore-Systems) · [Pain Tracker](https://paintracker.ca)*