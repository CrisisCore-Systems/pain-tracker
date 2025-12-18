# I Haven't Looked at a Single Competitor Yet — And That's Why This Might Actually Work

---

I should probably be embarrassed to admit this.

I'm building a healthcare app. A pain tracking app, specifically. And I haven't done a single competitive analysis. I haven't signed up for MyFitnessPal's pain feature. I haven't downloaded that highly-rated fibromyalgia app with 4.7 stars. I haven't even Googled "best chronic pain apps 2025."

Not because I'm arrogant. Because I couldn't.

---

## The Problem With "Market Research"

Every time I've tried to use an existing health app—as an actual person with chronic pain, not as a product researcher—I close it in under 30 seconds.

Too bright. Too many onboarding screens. Too many requests to connect my Apple Watch. Pop-up asking for my email. Pop-up asking for push notifications. Pop-up asking if I want to "upgrade to premium for advanced insights."

I'm already in pain. I'm probably exhausted. It's probably 3 AM and I can't sleep because my back is screaming. And now this app wants me to create a password with at least one uppercase letter, one number, and one special character before I can even *write down how I feel*?

No.

I decided: if I can't even stand to look at them, I'm not going to study them.

---

## The Only Design Rule

So I started from scratch. React + TypeScript. A blank canvas.

And I gave myself exactly one rule:

> **"If it feels bad to me at 3 AM when I'm spiraling, I delete it."**

That's it. That's the entire product strategy. That's the design system. That's the accessibility framework.

If it makes me feel worse when I'm already at my worst, it doesn't belong here.

---

## The First 5 Decisions That Came From That Rule

### 1. Dark theme by default

Not "dark mode available." Dark *first*. Because at 3 AM, a white screen is violence.

The preference persists to localStorage. If you switch it once, it stays. No re-asking every session.

### 2. No account required. Ever.

You can open this app and start tracking your pain in literally 2 seconds. No email. No password. No "sign up to continue." Nothing.

Your data goes straight into IndexedDB on your own device. It never touches our servers—we don't *have* servers for user data. There's nothing to sync because there's nowhere to sync to.

Want to create an account later for cross-device sync? Fine. We might build that someday. But you'll never be *forced* to.

The badge on our landing page says "No Account Required" right next to "100% Local & Private." Because the person at 3 AM doesn't need another account. They need to write something down before they forget.

### 3. No push notifications by default

We technically *have* notification capability. For medication reminders, if someone wants them.

But the permission prompt? It's not on app launch. It's not after your first entry. It shows up *much* later, as a gentle toast in the corner: "Get gentle notifications?" with the option to dismiss forever with one click.

And if you click X? We store `'dismissed'` and never ask again. Not ever. We respect no.

Most health apps treat notification permissions like a prize to win. We treat it like a door to someone's home. You don't knock twice.

### 4. Trauma-informed defaults

This one takes more than a sentence.

Our defaults assume you might be a trauma survivor. They assume you might have fibro fog. They assume you might be overwhelmed, dissociated, or barely holding it together.

So:
- **Simplified mode** is ON by default (streamlined interface, only essential features)
- **Auto-save** is ON (you will never lose data because you forgot to click "Save")
- **Memory aids** are ON (gentle tips and reminders)
- **Gentle language** is ON (supportive, never clinical or cold)
- **Comfort prompts** are ON ("Remember to take a break if you need one")
- **Large touch targets** are ON (56px minimum—your hands might be shaking)
- **Reduced motion** is respected (CSS `prefers-reduced-motion`)
- **Progressive disclosure** means we never dump everything on you at once

There's also a setting called `crisisDetectionSensitivity`. We have crisis detection. We surface crisis resources. We take it seriously.

Every single one of these is *off* on every competitor I've ever opened. Because "normal users" don't need them. Except we're not building for normal users. We're building for *us*.

### 5. You can use it offline, because the worst moments rarely happen with WiFi

Everything works offline. Full offline support. The entire app loads from cache. IndexedDB stores everything locally.

Because pain flares don't wait for a stable connection. And if you're in a rural area, or in the ER with no signal, or in bed where your router doesn't reach—you still need this to work.

The app registers a service worker on first load. After that, you could throw your router out the window and still track your pain.

---

## The Stupid Part

I know this is probably stupid.

I know you're supposed to study the market. I know you're supposed to find the "gap in the competitive landscape" and "differentiate your value proposition."

But I think the gap is simpler than that.

The gap is: nobody is building for people at their worst.

Everyone is building for the version of you that has energy. The version that wants to "gamify" their health journey. The version that enjoys filling out forms and earning badges and sharing achievements.

That's not who I am at 3 AM. And I'm guessing it's not who you are either.

---

## The Promise

I don't know if this will work.

I don't know if ignoring the market is genius or hubris or just garden-variety naivety.

But I know this: **at least it won't hurt anyone.**

The defaults are gentle. The interface is calm. The data stays on your device. The darkest moments get the softest treatment.

If Pain Tracker fails, it'll fail quietly. And the people who tried it will have had a moment of peace instead of another app demanding their email.

That feels like enough.

---

*Building in public at [github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker). Privacy-first, local-only, and unreasonably gentle.*
