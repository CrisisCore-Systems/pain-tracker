Here’s a tightened, sharpened version with the same spine and grit:

---

# Coding Through Collapse

Behind a gas station in Vernon there’s a three-walled concrete nook where the wind can’t quite reach you.

You build your fire in the corner. Back to the wall. Phone on low power.

I’ve done this. More than once. Last winter, after my truck rolled and I walked away with nothing but the clothes I was wearing.

That’s where I sat, frost building on my jacket, checking whether my latest commit to Pain Tracker passed CI on 8% battery.

Real fire. Real concrete. Real desperation.

I’m telling you this so you understand **who** writes code like this, and **why**.

---

## When Everything Goes Sideways

January. Snow coming down hard. SUV hits black ice and rolls twice.

I crawl out thinking maybe I can still drive it home.

I can’t.

What follows:

* Dragging everything I own in carts through slush that freezes into cement around the wheels
* Motels when I’ve got money, concrete and bus stops when I don’t
* Transit that doesn’t run when you need it
* Cold that makes “maybe I lose a couple toes” sound reasonable

Four days later I’m initializing a new git repo called `pain-tracker`.

Because apparently losing your wheels and your roof still isn’t enough to stop you from pushing code.

---

## Why This Thing Exists

Somewhere in my chart there’s a word: **“Addict.”**

Once that’s there, you’re not sick anymore—you’re suspicious.

* Every symptom is “drug-seeking” until proven otherwise
* Every request for relief goes through the stigma filter
* Every appointment is a trial where you’re already guilty

Their solution: NA, step work, repeat the label until it fuses with your name.

For me it wasn’t recovery, it was reinforcement.

> You are what they wrote you down as.
> You are what they bill you as.

No one cared that their “help” made everything worse.

So I built something that **wasn’t** another system designed to manage me.

---

## How the Damage Gets Installed

Origin story, short version:

* Baby: brief adoption, then back to grandparents and father. Ages 1–8, mostly alone, absorbing chaos without protection.
* **Eight years old:** Mom kicks me out. Twice. Actual sidewalk in Surrey, bags and all.
* **Alberta:** Shipped to relatives with legal guardianship. They confiscate my CDs—Limp Bizkit, ICP, everything keeping me sane—and make me sit there while they dissect the lyrics. Tell a kid his lifeline is poison.
* **Back to dad’s basement:** His buddy forces his way in while I’m alone and blows crack smoke in my face. I’m maybe eleven.
* **The music again:** Dad pawns my entire CD collection for drug money. My emotional support system traded for a hit.

Pattern installed early:

> Love doesn’t last.
> Home doesn’t last.
> Good things get taken.
> People leave.

By my teens I’m back with my grandma, clothes reeking of smoke, disappearing for days, heavy into drugs, selling, carving names into my skin. A missing-person report gets filed when I vanish for a week.

I thought I’d paid my chaos tax up front. That after everything I’d already seen and done, the universe owed me some stability.

The universe doesn’t run that ledger.

---

## Harrison

I have a son. Harrison.

He didn’t “save” me—that’s too much weight for a kid—but he’s the one fixed point when everything else feels negotiable.

When the dark options show up—gun, rope, exit stage left—there’s always the same counter-thought:

> Don’t leave him the way you were left.

I can imagine him losing his bike, his favorite toy, his home. I cannot imagine him growing up wondering why his dad *chose* to disappear.

Last year we were at a museum. He’s pointing at fossils, asking questions I don’t know the answers to, and it hits me:

> This is the one thing I haven’t completely destroyed. Don’t start now.

I’m still breathing largely because of that.

---

## What Gets Built From Wreckage

Fast-forward: motel room, no vehicle, housing collapsing, legal shit ongoing, pension tangled with assistance in a way that punishes you for having backup plans. Parole check-ins I almost miss because, when you’re drowning, dates stop meaning anything.

And I’m still writing React components.

Not because coding is “my therapy.” Not because I’m above it all.

Because **building is the only thing that still makes sense** when every other system is hostile or indifferent.

If every structure around you fails, you either collapse with it or you start designing structures that work differently.

I build.

---

## Architecture Written in Scar Tissue

Every tech decision in Pain Tracker is a direct response to a way I’ve been burned.

### 1. No Backend

```ts
// Your data lives on YOUR device.
// No server, no central database, nothing to subpoena or leak.

const store = create()(
  persist(
    (set) => ({
      entries: [],
      // Your pain stays here. Encrypted. Local.
    }),
    { name: 'pain-tracker-local' }
  )
);
```

I know what it’s like when a single line in a chart follows you forever. One note, one label, and every future clinician sees you through that lens.

Pain Tracker literally **cannot** do that. It doesn’t know who you are. It has nothing to say about you behind your back.

### 2. No Accounts

No email, no password, no login.

The second you create an account, you’ve tied sensitive data to a handle that can be reset, recovered, sold, hacked, or subpoenaed.

Open the app, it works. Close it, it forgets you.

### 3. No Judgment Engine

No “compliance score.” No streaks, no shame, no AI advice.

It doesn’t tell you you’re better, worse, non-compliant, or failing. It just records what you decide to put in.

Sometimes the most ethical thing technology can do is **witness without commentary**.

### 4. Offline-First

Built so it runs:

* In motels with garbage WiFi
* On burner phones
* In small towns where data is a luxury

I’ve been in all those places. Health tracking shouldn’t require a stable connection to a cloud that doesn’t care if you live or die.

### 5. Panic Mode

```ts
// One tap. Crisis numbers. Right now.
// No nested menus. No cognitive load.

```

I added this after a night when I needed help and couldn’t navigate my own phone because my hands wouldn’t stop shaking.

When you’re there, you don’t need “features.” You need a button that just works.

---

## The Other Systems I Build

Pain Tracker isn’t the only thing grown out of wreckage.

### CrisisCore-Systems

I audit smart contracts and model protocol collapse.

Not because I’m a traditional finance guy, but because I **know** what structural failure feels like from the inside. I’ve lived inside systems that pretend to help while quietly pushing you off a cliff.

That perspective catches things the spreadsheets miss.

### TaintedStrokes

The art side. Collapse artifacts, glitchcore, body horror, rage poetry:

* Photos of rolled trucks and burned forests under smeared stars
* Hand-drawn mandalas and glyphs
* Pages that say “I NEED HELP WITH EVERYTHING” in letters big enough to tear the paper
* Knife handles I carve when my brain won’t slow down

The breakdown and the precision live in the same notebook.

Common thread across all of it:

> I build systems that refuse to exploit people the way I was exploited.

---

## For Anyone Coding From the Rubble

If your life is **actually** falling apart—not “my sprint is stressful,” but survival-mode collapse—hear this:

You can still ship.

I’ve pushed commits:

* From bus stops at midnight
* On motel WiFi that barely holds for a `git push`
* At gas stations charging my phone off an outlet by the bathroom
* In that concrete nook behind the gas station, warming my hands over a fire

Not every commit is elegant. Not every day is productive. But each one is proof of life.

The industry’s official story of “real developers” skips people like us:

School → bootcamp → internship → junior dev → imposter syndrome as a fun quirk.

Reality: some of the most important tools get written by people the brochure never mentions:

* Disabled devs hacking together accessibility because they need it
* Survivors building crisis tools because nothing else worked when they needed it
* Privacy hardliners who got burned and refused to let it happen again

You don’t need a stable life to write meaningful code. You just need to keep not-quitting.

---

## The Notebooks

Inside view, unfiltered:

* Benefit appeal plans, WCB notes, side-income schemes
* Tenant dispute timelines and evidence lists
* Pain Tracker wireframes and data models
* “I CAN’T LIVE LIKE THIS ANYMORE” scrawled across a page
* “LIFE IS A COSMIC JOKE AND NOT THE FUNNY KIND”
* Precise sacred geometry diagrams, colored perfectly
* To-do lists next to suicidal ideation
* Unit tests for a world that would actually be humane

The mess doesn’t invalidate the work.
The work doesn’t magically heal the mess.
They coexist.

I’m showing you this because the sanitized “developer” image harms people. If you’re building from a motel bed, a shelter bunk, a car, or a concrete corner, you’re not an imposter.

You’re just off-script.

---

## What Exists Right Now

No hype, no funnel.

* **Pain Tracker**: a trauma-aware, privacy-first pain journal that doesn’t track you back.
* Free, open-source, auditable.
* No accounts, no analytics, no surveillance business model.

> [paintracker.ca](https://paintracker.ca)
> Source: `github.com/CrisisCore-Systems/pain-tracker`

Use it, fork it, ignore it—your call. The point is: it exists, and it does **not** monetize your suffering.

---

## If You’re in the Wreckage

I won’t lie and say “it gets better” as a guarantee. Sometimes it does, sometimes it doesn’t.

I won’t pretend hotlines are a magic fix. They help some, hurt others.

What I *will* say:

* You’re not broken because broken systems broke you.
* You’re not just a label because someone typed it into a chart.
* You’re not worthless because people treated you like you were disposable.

If you’re still here reading this, that already counts, even if it feels meaningless.

If you do want numbers:

* **Canada/US:** 988
* **SAMHSA (US):** 1-800-662-4357
* **International directory:** findahelpline.com

If those aren’t your route, pick one human and say, “I’m not okay.” Sometimes that’s the only thread that keeps you tethered.

---

## Bottom Line

A kid who learned early that safety and love are temporary grows into an adult who keeps losing all three—transport, housing, relationships, reputation.

That same adult, from motel rooms and concrete windbreaks, keeps building systems that **refuse** to abandon people the way he was abandoned.

That’s the whole story.

Fire’s still going. So is the code.

---

*Architect at CrisisCore-Systems. Build collapse-aware software, audit contracts, and turn survival into infrastructure. My son is the reason I’m still here.*

*Work: [GitHub](https://github.com/CrisisCore-Systems) · [Pain Tracker](https://paintracker.ca)*
