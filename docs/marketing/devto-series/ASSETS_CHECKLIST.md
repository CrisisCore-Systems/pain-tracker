# Dev.to series assets checklist

Use this checklist to keep screenshots and diagrams consistent, safe, and privacy-preserving.

## Non-negotiables

- [ ] Never screenshot real entries, notes, identifiers, or export payloads.
- [ ] Prefer demo routes and synthetic data.
- [ ] Avoid showing browser extensions, open tabs, or notifications.
- [ ] Treat exports as sensitive: use redacted/composite examples only.

## Recommended images

1) **Architecture overview**

- [ ] One diagram showing: UI → state → storage → export boundary

1) **Trust boundaries**

- [ ] Local-first core vs optional integrations (weather, auth, payments)

1) **Service worker proof**

- [ ] DevTools → Application → Service Workers (registered / activated)
- [ ] Cache Storage entries (static assets only)

1) **Offline UX proof**

- [ ] Network offline mode + app continues functioning

1) **Quality gates**

- [ ] Terminal screenshot of `npm run check` passing (no tokens/secrets)

## File naming

- `devto-series-01-*.png`
- `devto-series-02-*.png`

## Suggested tools

- Windows: Snipping Tool
- Image optimization: TinyPNG
