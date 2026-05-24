# PainTracker Visual Asset Pack

Created for PainTracker.ca page visuals.

## Files

1. `paintracker-local-first-architecture.svg`
   - Best placement: homepage after the hero or on the privacy/offline-first page.
   - Purpose: makes the local-first boundary instantly understandable.

2. `paintracker-flare-safe-logging-flow.svg`
   - Best placement: feature section, getting-started page, app explanation block.
   - Purpose: shows the app is designed for pain spikes, brain fog, and interrupted sessions.

3. `paintracker-no-account-no-cloud-og.svg`
   - Best placement: Open Graph/social image, resource hero, privacy card.
   - Purpose: clear shareable message: no account, no cloud, no silent sharing.

4. `paintracker-privacy-refusal-strip.svg`
   - Best placement: homepage trust strip, resource pages, privacy page.
   - Purpose: visualizes what the product refuses to impose by default.

5. `paintracker-asset-embed.css`
   - Optional helper styles for embedding.

## Basic HTML embed

```html
<section class="paintracker-asset-shell" aria-label="PainTracker local-first architecture">
  <img
    src="/assets/paintracker-local-first-architecture.svg"
    alt="PainTracker stores pain records locally on the user's device, works offline, avoids account gates, and exports only when the user chooses."
    loading="lazy"
  />
</section>
```

## Suggested asset routes

```text
/public/assets/paintracker-local-first-architecture.svg
/public/assets/paintracker-flare-safe-logging-flow.svg
/public/assets/paintracker-no-account-no-cloud-og.svg
/public/assets/paintracker-privacy-refusal-strip.svg
```

## Open Graph example

```html
<meta property="og:image" content="https://www.paintracker.ca/assets/paintracker-no-account-no-cloud-og.svg" />
<meta name="twitter:image" content="https://www.paintracker.ca/assets/paintracker-no-account-no-cloud-og.svg" />
```

Note: some social platforms prefer PNG/JPG for previews. Keep this SVG as the source asset and export a PNG copy for maximum compatibility.
