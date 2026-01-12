---
title: "Building From Rubble: How a Homeless Developer Made Healthcare Software That Won't Betray You"
seoTitle: "Homeless Developer Builds Privacy-First Healthcare App | Pain Tracker Story"
seoDescription: "From motel rooms and no vehicle to architecting trauma-aware healthcare software. The real story behind Pain Tracker and why it refuses to betray users."
datePublished: Sun Dec 08 2025 18:00:00 GMT+0000 (Coordinated Universal Time)
slug: building-from-rubble-pain-tracker-story
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1764600000000/building-from-rubble-cover.png
tags: healthcare, mental-health, open-source, chronic-illness, homelessness, trauma-informed, developer-stories, privacy, offline-first

---

# Building From Rubble: How a Homeless Developer Made Healthcare Software That Won't Betray You

I started the Pain Tracker repository on January 4th, 2025.

At the time, I was living in a motel room. I had no vehicle—it had rolled into a snowbank a few weeks earlier, and I'd walked away from the wreck with nothing but the thought: *"I hope this is still drivable."* It wasn't.

I was dragging my belongings in carts through slush that froze around the wheels like concrete. Building fires in three-sided concrete nooks to stay warm while waiting for buses that might not come. Rotating between motels across Lumby, Vernon, Kelowna—wherever I could land for a few nights before the next displacement.

And somewhere in the middle of that, I decided to build a healthcare app.

Not because I had stability. Not because I had a business plan. But because I'd spent my whole life being failed by systems that were supposed to help—and I wanted to build something that wouldn't do that to someone else.

---

## The Origin Story Nobody Wants to Hear

Most developer origin stories are clean. "I learned to code in college." "I got my first job at a startup." "I built this in my garage."

Mine isn't clean.

I was born into chaos. Within my first year, I spent about 90 days in adoption before being placed back with my grandparents and father. From there, it was a sequence of dislodgements:

- Moved from grandparents to my mother around age 8
- Twice, she literally kicked me and my stuff out onto city streets
- Sent to an aunt and uncle in Alberta who confiscated my music and made me sit while they dissected the lyrics—what felt like emotional torture
- Moved to my dad's basement suite, where a "friend" of his forced entry while I was home alone and blew crack smoke in my face. I was a kid.
- My dad pawned my entire CD collection—my emotional lifeline—to buy drugs

Every caregiver that should have protected me either abandoned me, shamed me, or used me as collateral for their own damage.

By my teen years, I was living with my grandmother again in a crowded one-bedroom, clothes always smelling like smoke. Heavy drug use, selling, volatile relationships. At one point I was reported missing.

I told myself: *"I've already partied harder and gone further off the rails than most people will in their whole lives. I've pre-paid my chaos. Now I deserve to calm down later."*

The universe doesn't honor that deal.

---

## The Label

Somewhere along the way, I got labeled. **Drug addict.**

Once that's in your chart, you stop being a patient. You become a problem to be managed. Every interaction with healthcare starts from suspicion. Your pain is probably manipulation. Your requests for help are probably drug-seeking.

They sent me to NA meetings. On paper, the right call. In practice? It made everything worse.

Sitting in those rooms, saying "I'm an addict" over and over, reinforced the worst beliefs I had about myself. It didn't feel like recovery—it felt like hammering nails into a coffin I was already building.

The system gave me a diagnosis and a protocol. What it didn't give me was anyone who actually listened.

I spiraled. The "help" fueled the self-destruction instead of stopping it.

---

## What Kept Me Here

I have a son. Harrison.

He's both anchor and knife. Anchor because he's the one person I would never abandon, no matter what. I'd never leave him on the street, never refuse him shelter if he were homeless. I stay because of him.

Knife because I watch how other adults treat me in front of him. I wonder what lesson he absorbs when his mother drops me at a bus stop in the cold, knowing I have nowhere to go.

The suicidal thoughts are real. "I may as well just hang myself right now." "Shotgun in my mouth." I've written those words in notebooks at 3 AM in motel rooms.

But there's always a counter-force. I won't leave him the way I was left.

---

## Building in the Rubble

So why build a healthcare app in the middle of housing collapse?

Because I finally understood something: **the systems that failed me weren't broken by accident. They were designed without people like me in mind.**

Health apps that harvest your data and sell it to insurers? They're not thinking about what happens when that data gets used to deny you coverage.

Pain trackers that require accounts and cloud storage? They're not thinking about people whose credibility has already been destroyed by their own medical records.

"Wellness" apps with streaks and compliance scores and nudges? They're not thinking about people who've been shamed and monitored and judged their whole lives.

I built Pain Tracker for the people those systems forget. The people they harm.

---

## The Architecture of Refusal

Every technical decision in Pain Tracker is a refusal to repeat what was done to me:

### No Backend

```typescript
// Your data lives here and nowhere else
const painStore = create()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (data) =>
        set((state) => ({
          entries: [
            ...state.entries,
            {
              id: crypto.randomUUID(),
              timestamp: Date.now(),
              ...data,
            },
          ],
        })),
    }),
    {
      name: 'pain-tracker-storage',
      // Encrypted. Local. Yours.
    }
  )
);
```

No servers. No accounts. No data leaving your device. Nothing that can be subpoenaed, sold, or used against you.

I've had my information used against me too many times. I won't build something that does that to someone else.

### No Judgment

The app doesn't calculate compliance scores. It doesn't guilt you for missing entries. It doesn't analyze your patterns and tell you what you're doing wrong.

It just records. Because sometimes people don't need to be optimized—they need a tool that quietly works without demanding anything.

### No Abandonment

Offline-first architecture means the app works without internet. It works on a cheap phone with spotty data. It works when you're in a motel room in Lumby with terrible WiFi.

I've been in too many situations where I couldn't access what I needed because the connection dropped or the service went down. Pain Tracker doesn't require you to be connected to deserve help.

### Panic Mode

One button. One tap. Crisis resources appear immediately.

I built this after a night when everything got very dark and I couldn't find the numbers I needed. When you're in that place, you can't navigate menus or read instructions. You need something that just *works*.

---

## The Parallel Tracks

Pain Tracker isn't the only thing I've built from this rubble.

**CrisisCore-Systems** became my umbrella identity. Collapse Systems Engineer. I audit smart contracts for vulnerabilities. I write about DeFi collapse patterns and protocol threat modeling. I build frameworks for people who need to understand how systems fail—because I've lived inside failing systems my whole life.

**TaintedStrokes** is the artistic layer. Memorywear, collapse artifacts, poetry about rage and grief and survival. Turning the stuff that could have killed me into something with form and meaning.

The throughline across all of it:

**I build systems that refuse to betray the user in the exact ways the world has betrayed me.**

---

## What I'm Building From

Right now, as I write this, I'm dealing with:

- Aftermath of vehicle loss
- Serial housing instability
- An active tenancy dispute, fighting eviction and seeking relocation fees
- Income constraints because of how my WCB pension interacts with assistance
- Ongoing legal proceedings
- Parole check-ins I nearly missed because dates blur together when you're in survival mode

And I'm still shipping code.

Not because I'm superhuman. Not because I've transcended my circumstances. But because building is the only thing that makes sense to me.

When I look at the sky—and I photograph a lot of skies—it's the only ceiling that hasn't collapsed on me yet. When I write code, I'm making something that works the way I wish the world worked.

---

## For Other Developers in the Rubble

If you're building something while your life is falling apart, here's what I've learned:

### Your circumstances don't disqualify your work

Some of the best insights come from people who've been failed by systems. You understand failure modes that comfortable developers never encounter. That's not a liability—it's expertise.

### Small commits matter

I've pushed code from motel lobbies, from buses, from places I probably shouldn't admit. Not every commit is a masterpiece. But every commit is proof that you're still building.

### Build what you needed

The best accessibility features come from disabled developers. The best mental health tools come from people who've struggled. The best privacy architecture comes from people who've been burned.

Not because suffering makes you wise—it mostly just hurts. But because you can't understand what's needed until you've needed it.

### It's okay to be a mess and still build good things

The notebooks next to my laptop have pages that say "I NEED HELP with everything" in huge letters. The same notebooks have careful architecture diagrams and handwritten code.

Both are true. The mess doesn't invalidate the work.

---

## The Core of It

A kid who learned early that home, love, and safety were temporary grows into an adult who keeps losing all three—vehicle, housing, partner, reputation.

And that adult insists on building systems, stories, and tools that refuse to abandon people the way he's been abandoned.

That's the whole story.

Pain Tracker isn't a startup. It's not a business. It's a refusal—built in motel rooms and bus shelters and wherever else I could find wifi and a few hours of stability.

It's the tool I needed and couldn't find. Now it exists, and it's free, and it won't betray you.

---

## Try Pain Tracker

Free. Open-source. Private by design. No accounts, no servers, no data sharing. No labels. No judgment.

Just documentation that belongs to you.

[**Try it at paintracker.ca**](https://paintracker.ca)

[**View the source code on GitHub**](https://github.com/CrisisCore-Systems/pain-tracker)

---

*If you're in the rubble right now—housing falling apart, life unraveling, dark thoughts getting loud—please know that the rubble doesn't define you. And you don't have to white-knuckle it alone.*

*Grab a lifeline:*
- **Canada:** 988 Suicide Crisis Helpline
- **US:** 988 Suicide and Crisis Lifeline  
- **UK:** 116 123 (Samaritans)
- **SAMHSA Helpline:** 1-800-662-4357
- **International:** [findahelpline.com](https://findahelpline.com)

---

**About the Author:** I'm the architect of CrisisCore-Systems. I build collapse-aware software, audit smart contracts, and turn survival into systems. Pain Tracker is one piece of that work. My son is the reason I'm still here to write this.

*Find my work: [GitHub](https://github.com/CrisisCore-Systems) | [CrisisCore-Systems](https://crisiscore.systems)*
