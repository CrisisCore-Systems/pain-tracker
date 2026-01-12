# Two People, Same Body

## The Developer You See

Most people meet me through code.

I'm the one building offline healthcare apps, ranting about client-side encryption, writing way too much about trauma-informed design patterns.

You see:

* clean GitHub repos
* careful architecture diagrams
* React hooks that try to notice when a user is falling apart and quietly soften the interface

From that angle I look controlled. Professional. Like someone who has his shit mostly together.

## The Other Guy

You don't see the 3 AM version.

Motel room. Laptop balanced on my knees. Floor covered in notebook pages where I've carved **"I WANT TO DIE"** so hard the ink almost cuts through the paper.

Same body. Same brain. Same person.

Both of us built the same app.

---

## Why Pain Tracker Exists

Most healthcare software is written by people who've never actually needed it in an emergency. They build **data-harvesting machines** dressed up as "wellness apps."

Open any pain tracker and watch what happens:

1. "Create an account"
2. "Connect your email / phone / insurance"
3. "Agree to our 4000-word privacy policy"

Meanwhile your worst days—med changes, breakdowns, flare-ups—get piped straight into someone's analytics dashboard. That data can be sold, leaked, or quietly pulled into legal systems you never agreed to.

I've had my health data used against me. I've watched doctors treat my pain like a lie because some risk model flagged me as "drug-seeking." Once you've stood on *that* side of the table, "your data is safe with us" stops sounding reassuring.

So I built something else.

No servers.
No accounts.
No "growth funnel."

Everything lives on your device, encrypted with keys only you hold.

```typescript
// Your pain data lives here and nowhere else
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
    })
  )
);
```

When your housing is unstable, when an insurer is digging through your history, when your credibility is already under attack—you need your records physically and cryptographically with *you*, not scattered across platforms that can lock you out or hand them over.

---

## The Beast in the Code

Here's the part I didn't expect: the ugliest experiences produced the best features.

Chronic pain scrambles cognition. Fibro fog, trauma brain, whatever label you like—focus fragments, memory slips, simple forms suddenly feel like exams.

Pain Tracker watches for that state. Not with magic "emotion AI," just simple signals:

* lots of corrections
* unusually slow progress
* repeated back-and-forth on the same field

When cognitive load spikes, the app drops into emergency mode: bigger tap targets, simpler language, fewer choices, aggressive autosave so you don't lose the entry when your brain just… stops.

```typescript
const useCrisisDetection = () => {
  const [cognitiveLoad, setCognitiveLoad] = useState(0);

  useEffect(() => {
    if (cognitiveLoad > threshold) {
      // Make everything easier
      dispatch({ type: "ACTIVATE_EMERGENCY_UI" });
    }
  }, [cognitiveLoad]);
};
```

The goal isn't to psychoanalyze you. It's to recognize:
"You're clearly struggling. I'll get out of the way."

That logic came straight from the nights when *I* was struggling and every extra click felt like an insult.

---

## The Notebooks

I keep two types of documentation.

**1. Git commits** – `refactor crypto helper`, `improve offline sync`, `fix race condition`.

**2. Torn paper** – pages that say things like:

> "There's something that steps in when I can't cope. I call it the Beast. Pure rage, zero fear. If I can't be safe, I can at least be dangerous."

> "To whatever's listening: take anything you want from me, just stop the constant grinding pain. But leave my son out of this."

For a long time I saw those pages as proof of failure.

Now I read them like crash logs. A system under impossible load, doing the only thing it could do: **record**.

And when I line them up beside the code, the mapping is obvious:

* unstable housing → local-first storage
* data weaponized in court → zero-server architecture
* being talked down to by professionals → copy that assumes you're competent and already trying
* brain fog in crisis → UI that simplifies itself instead of punishing you for being slow

The Beast didn't just wreck my life.
It handed The Developer the most honest spec sheet I've ever seen.

---

## Living Split

Nothing is magically resolved.

I still push a cart full of my belongings up hills. Still argue with landlords and agencies designed to grind people down. Still have nights when the ceiling feels like it's slowly collapsing.

But the roles have changed.

The Beast doesn't get root access anymore. It's on **guard-dog duty**, not CEO.

A typical day looks like:

* **Morning** – legal calls, paperwork, systems that assume you have infinite time and no pain
* **Afternoon** – writing about Web Crypto, local-first design, trauma-aware UI patterns
* **Evening** – pushing commits, reading comments from strangers who say "this feels human"
* **Night** – sometimes quiet, sometimes the old thoughts circling like vultures

The difference now is this: the worst hour of the day no longer gets to define the whole day.

---

## If You Have Your Own Pages

Maybe you have your own version of those notebooks—voice memos you never replay, drafts you refuse to save, stuff carved into margins and then hidden in drawers.

Here's what I'd tell you as both a developer and a fellow broken-in-progress human:

* "I'm done, I want out" is a **crash report**, not a blueprint.
* That brutal, cold persona you become when cornered? That's **emergency firmware**, not your true self.
* Being able to build beautifully one hour and then collapse the next doesn't make you fake. It makes you a person operating at maximum load with no redundancy.

From my vantage point—living as both the guy in the motel bed and the one shipping code—my technical assessment is this:

You're not fundamentally defective.
You're running a system with missing resources, hostile inputs, and zero safety margin. That's an engineering problem, not a moral one.

Those "goodbye letters" you're scared of? They might secretly be:

1. Failure modes no professional has ever asked you to describe
2. Hard boundaries you refuse to cross
3. Requirements for support or tools that don't exist yet
4. Evidence that even at your lowest, there's someone or something you still love enough to fight for

That is not nothing.

---

## Current Status

Pain Tracker is live. The code is open source. People are starting to say things like "this actually understands bad days," and honestly that means more to me than any user count.

The external chaos hasn't evaporated—legal mess, money stress, unstable housing—all still very real.

But the integration is deeper now. Every new feature has to pass one test:

> "Would this have helped the version of me in that motel room?"

If the answer is yes, it ships.
If the answer is no, it waits.

Those old pages are archived—not as evidence against me, but as **founding documents**. The prime directive hasn't changed: my son does not inherit this darkness if I can help it.

---

## Build Log Continues

We talk a lot about "building in public." Usually that means product screenshots and growth charts.

This is my version: architecture diagrams laid next to notebook pages.
The Beast and The Developer running on the same hardware.

Your foundation isn't defined by how smooth the ground was when you started. It's defined by how honestly you map the cracks and how stubbornly you reinforce them.

My ground is unstable, fractured, littered with previous collapses.
But it's mine.

And from that ground, I'm trying to build tools that might make someone else's terrain a little less lethal.

The story isn't finished.

---

If your pages look anything like mine and you're actively thinking about ending things:

* In Canada, you can call or text **9-8-8** for support.
* Elsewhere, look up your local crisis line or emergency service.

You're not a defective machine.
You're a system under extreme load.
Systems can be stabilized.
