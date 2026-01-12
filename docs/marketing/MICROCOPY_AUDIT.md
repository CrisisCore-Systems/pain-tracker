Trauma-informed microcopy guidance
=================================

Purpose
-------
Provide concise guidance and examples for writing gentle, helpful microcopy across forms and UI states in Pain Tracker. The aim is to reduce user frustration, encourage completion, and avoid judgmental language.

Principles
----------
- Use calm, neutral language. Avoid words like "failed", "mistake", or "invalid" when possible.
- Tell users what happened, why it matters, and what they can do next. Keep each part short (1–2 sentences).
- Offer choices and control. When asking for data, explain how it will be used and give an option to skip non-essential fields.
- Prefer positive framing: what users can do, not what they did wrong.
- Respect privacy and safety: avoid unnecessary requests for sensitive details.
- Use microcopy to reduce cognitive load: one clear action per message and use examples for clarity.

Tone and voice
--------------
- Gentle: "It looks like we missed a small detail" vs "You forgot to...".
- Collaborative: "You can add more details later" vs "You must provide...".
- Reassuring: "This is saved locally only" when relevant for privacy-sensitive fields.

Validation patterns
-------------------
Required field
- Error (inline): "Please tell us briefly what hurts — a few words are fine."
- Why it matters (hint/helper): "This helps you spot patterns over time; you can add details later."
- Recovery CTA: show a focused input and a Save button with supportive label: "Save entry — you can edit later".

Format/Value guidance
- Inline hint: "Use numbers 0–10 (0 = no pain, 10 = worst)."
- Example text: show placeholder or helper text: "e.g. 'lower back', 'right shoulder'"

Success and error announcements (aria-live)
- Success (polite): "Saved successfully. You can add more details later if you'd like." (aria-live="polite")
- Error (assertive when blocking): "We couldn't save right now. Please check your connection and try again." (aria-live="assertive")

Disabled/Read-only states
-------------------------
- Explain why a control is disabled and what to do: "Entry locked while syncing — it will become editable when sync completes." Keep the language neutral and brief.

Examples — do and don't
------------------------
- Bad: "Invalid input." (short, unhelpful)
- Good: "Please enter a date in this format: YYYY-MM-DD. Example: 2024-06-30." (explains, examples)

- Bad: "You missed the pain description." (blaming)
- Good: "Please tell us briefly what hurts — even a few words help us track patterns." (non-judgmental)

Microcopy snippets (ready to reuse)
- Required: "Please provide this information to continue — you can change it later if needed."
- Optional hint: "Optional — helps us give better insights, but you can skip for now." 
- Loading: "Finding your insights — thanks for your patience." 
- Saving: "Saving… this may take a moment." 
- Saved: "Saved locally — you can edit anytime." 
- Error save: "We couldn't save just now. Check your connection or try again." 
- Disabled: "Unavailable while we sync — it will be available shortly." 

Checklist for implementers
-------------------------
1. Use inline validation for each form field with an explanatory error string and an example where helpful.
2. Keep errors concise; include a clear next step (what they should do next).
3. Always announce success and important errors with `aria-live` region(s).
4. Provide a way to recover or retry for transient failures (network/save issues).
5. Run microcopy through a trauma-informed lens: avoid absolutes, avoid shaming language, offer help and control.

Where to apply first (P1)
-------------------------
- Pain entry form (title, intensity, location) — inline validation + examples
- Onboarding flows (first-time use) — helpful CTAs and gentle onboarding copy
- Error/Save banners — always use aria-live announcements and calm language

Next steps
----------
- Run a microcopy pass across the main flows and flag any copy that uses negative or absolute language.
- Add a living styleguide or Storybook with examples of inline validation and announcements.
