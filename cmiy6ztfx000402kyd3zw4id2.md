---
title: "Coding Through Collapse: Building Software From Motel Rooms and Concrete Nooks"
seoTitle: "Coding Through Collapse: How a Homeless Developer Built a Trauma-Infor"
seoDescription: "Building a trauma-informed health app while surviving homelessness. Open-source, privacy-first, and coded from bus stops and motel rooms."
datePublished: Tue Dec 09 2025 06:21:30 GMT+0000 (Coordinated Universal Time)
cuid: cmiy6ztfx000402kyd3zw4id2
slug: coding-through-collapse
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1765267858224/64500532-a513-445e-bdd5-e042dd53f222.png

---

There's a three-walled concrete space behind a gas station in Vernon, BC. If you build your fire in the corner and sit with your back to the wall, the wind can't reach you.

Last winter, I sat there, frost forming on my jacket, checking whether my latest commit passed CI on 8% battery.

Real fire. Real concrete. Real desperation.  
I'm telling you this so you understand who writes code like this, and why.

---

## The Wreck

December 2023. Night. Snow. The SUV hits black ice and rolls twice.

I crawl out thinking, *Maybe it's still drivable*.  
It isn't.

What follows: dragging everything I own through freezing slush in shopping carts. Motels when there's cash. That concrete corner when there isn't. Buses that don't run Sundays. Cold that makes you negotiate with yourself about frostbite.

January 4th, 2025: I initialize a new repository:  
`pain-tracker`.

Because apparently losing your vehicle and your roof isn't enough to stop you from pushing code.

---

## The Label

Somewhere in my medical chart, the word **addict** appears.

Once it's there, you're not a patient anymore—you're a risk. Every symptom is suspicious. Every request for help gets filtered through that lens.

They sent me to NA meetings. Standard protocol.

Every circle, every "Hi, I'm \_\_\_ and I'm an addict," hammered the identity deeper. It didn't feel like recovery—it felt like confirmation.

*You are what they say you are.*

The system's prescribed help only deepened the damage. And I couldn't get anyone to see it.

---

## The Template

I was a kid. Maybe twelve. My father's basement.

I had a CD collection. Limp Bizkit. ICP. Eminem. Slipknot. This was my lifeline. When home was chaos, when adults were unreliable, when I didn't know where I'd sleep next month—the music stayed. The music was *mine*.

One day I came home and they were gone. All of them.

My father pawned them. Every disc. For drug money.

He said it was because his coworkers told him the lyrics were bad for me.

---

That's the template. That's what I learned:

> Love doesn't last  
> Home doesn't last  
> Good things get taken  
> People leave

I won't list every move. Every time my mother kicked me onto the street. The relatives who confiscated my music and dissected the lyrics like it was therapy. The "friend" who blew crack smoke in my face when I was home alone.

Every system that should have protected me either left, shamed me, or traded me for something it needed more.

By my teens, I was living in my grandmother's one-bedroom, clothes reeking of smoke, deep into using and selling, carving a name into my thigh, listed as missing in a police report.

I told myself: *I've pre-paid my chaos. The universe owes me calm.*

The universe doesn't work that way.

---

## Harrison

I have a son.

He's why I'm typing this instead of being a statistic.

I won't say he "saved" me—that's too much weight for a child. But when the dark thoughts get loud (*shotgun, rope, vanishing*), there's this counter-signal:

**Don't leave him like you were left.**

Last year, we visited a museum. He pointed at dinosaur bones, asking questions I didn't know the answers to.

*This is the one thing I haven't screwed up. Don't start now.*

---

## Why I Build

Motel room, no vehicle, unstable housing, ongoing legal proceedings—all blur together in survival mode. Support systems tangled in ways that punish you for having backup plans. Parole check-ins I barely make because when you're drowning, dates lose meaning.

And I'm writing React components.

Not because I've transcended anything.  
Not because code is my therapy.

Because when every system fails you—family, medical, housing, legal—you either collapse entirely or start building systems that work differently.

I build.

---

That template—*good things get taken, systems fail*—became the spec sheet for everything I build now.

## The Architecture of Refusal

Every technical decision answers a specific wound.

### No Backend

```typescript
// Your data lives HERE. Encrypted. Local.
// No servers to subpoena. No databases to breach.
const store = create()(persist(
  (set) => ({ entries: [] }),
  { name: 'pain-tracker-local' }
));

// Web Crypto API, not external libraries
const encryptEntry = async (entry: PainEntry) => {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  // Encrypts locally before any storage
  // Zero plaintext in IndexedDB
  return encrypted;
};
```

I've had my data used against me. Chart notes that followed me. Flags that decided what I was before any provider met me.

Pain Tracker can't do that. It doesn't phone home. It forgets you the moment you close it.

### No Accounts

No email. No password. No recoverable identity.

The second you create an account, you've linked your health data to something that can be correlated, sold, subpoenaed, leaked.

Open the app. Use it. Close it. Gone.

### No Judgment

It doesn't calculate compliance scores. Doesn't streak-shame. Doesn't analyze your patterns or tell you you're improving or getting worse.

It records.

Sometimes witness is enough. Sometimes the most helpful thing technology can do is shut up and hold your data until you need it.

### Panic Mode

```typescript
// One button. Crisis resources. Now.
// Built after a night when my hands wouldn't stop shaking
// and I couldn't find what I needed.
const panicButton = () => {
  // Immediate navigation to crisis resources
  // No confirmations, no delays
  window.location.href = '/crisis';
};
```

When you're there, you can't navigate menus. You need something that just functions.

---

## Parallel Work

**CrisisCore-Systems**: I audit smart contracts for flaws. Not from a finance background—from living inside systems as they fail. Last month I found a reentrancy bug that could have locked $2M in user funds. I spotted it because I've learned to look for systems that collapse when people are desperate.

**TaintedStrokes**: Collapse artifacts. Rage poetry. Notebooks filled with "I NEED HELP" next to mandala drawings and integration tests.

The throughline:  
*I build systems that refuse to betray the user in the exact ways the world betrayed me.*

---

## The Notebooks

Scattered across motel rooms and storage:

* Benefit appeals, reassessment forms, side-hustle plans
    
* "I NEED HELP WITH EVERYTHING" in huge letters
    
* Architecture diagrams for the empathy engine
    
* "Life's a cosmic joke and not the funny kind"
    
* Perfectly colored sacred geometry
    
* Unit tests for the crisis detection module
    
* "I can't live like this anymore…"
    

The mess doesn't invalidate the work.  
The work doesn't fix the mess.  
Both exist.

If you're building while drowning, you're not alone. We just don't talk about it, because the approved developer story doesn't include motel rooms and concrete corners and pages that say we want to die.

---

## The App

It exists. If you need something that won't judge you, won't leak your data, won't demand you be functional before it helps—it's there.

[paintracker.ca](http://paintracker.ca)  
[GitHub](https://github.com/CrisisCore-Systems/pain-tracker)

Free. Open source. Auditable.  
I'm not making money from your pain.

---

## If You're in the Rubble

I won't tell you it gets better. Sometimes it does. Sometimes it doesn't.

I won't tell you to call a crisis line. They help some people. They hurt others.

What I'll say:

You're not broken because systems broke you.  
You're not an addict because someone wrote it down.  
You're not worthless because people treated you like garbage.

If you're still reading this, still breathing—that counts. Even when it doesn't feel like it.

**Canada / US:** 988  
**SAMHSA:** 1-800-662-4357  
**International:** [findahelpline.com](http://findahelpline.com)

If those don't work, find one person. Tell them you're not okay. Sometimes that's the only thing that holds.

---

## The Core

The kid who learned that safety is temporary now builds systems that aren't.  
The adult who keeps losing things builds software that can't be taken.  
The developer who codes from bus shelters makes apps that work without WiFi.

That's the throughline: from concrete corners to clean code, from survival to systems that might help someone else survive better.

A kid who learned that home, love, and safety were temporary becomes an adult who keeps losing all three.  
And that adult, from motel rooms and bus shelters and three-sided concrete nooks, insists on building systems that refuse to abandon people the way he was abandoned.

---

The fire's still burning.  
I'm still building.

---

*Systems engineer & builder at CrisisCore-Systems. Turning survival into code so others don't have to.*  
[*GitHub*](https://github.com/CrisisCore-Systems) *·* [*Pain Tracker*](https://paintracker.ca)