# Study 001 Landing Page Deployment Guide

## Overview

Two versions of the Study 001 landing page are included:

1. `src/pages/StudyLanding.tsx` for integration into the React app.
2. `public/study-001.html` for standalone static deployment.

The page is intentionally exposure-minimizing. It does not submit, store, log, or silently transmit sign-up data. It validates required fields and opens a user-controlled email draft to the research contact.

## React Component

Location: `src/pages/StudyLanding.tsx`

Features:

- React form state and validation.
- Dark mode support.
- Skip link and associated form labels.
- Responsive layout.
- Explicit mail draft submission instead of hidden collection.
- Current consent/protocol requests routed through email until public documents are available.

To add this page to app routing:

```tsx
import StudyLanding from '../pages/StudyLanding';

{
  path: '/study-001',
  element: <StudyLanding />,
}
```

## Static HTML Version

Location: `public/study-001.html`

The static page can be served directly at `/study-001.html`. It uses the same no-backend mail draft behavior as the React component.

## Form Submission Handling

Current behavior:

- Client-side validation only.
- No browser console logging of entered contact information.
- No success copy claiming that interest was recorded by the site.
- Opens a `mailto:` draft addressed to `crisiscore-systems@proton.me`.
- Leaves review and sending under the participant's control.

If backend submission is later added, it must be treated as a high-risk exposure change. Before deployment, document:

1. The exact endpoint and host.
2. The fields transmitted.
3. Transport security.
4. Storage location.
5. Access controls.
6. Retention period.
7. Deletion path.
8. Rate limiting and abuse handling.
9. Whether the participant can submit without entering private medical details.

Do not replace the mail draft with hidden collection until those safeguards exist.

## Consent Form and Protocol Links

The landing page currently uses email links to request the current consent form and protocol. Do not point users at dead anchors or unpublished documents.

If public documents are created later, prefer stable public URLs such as:

```html
<a href="/research/study-001-consent.pdf">Read Consent Form</a>
<a href="/research/study-001-protocol.pdf">Read Study Protocol</a>
```

Only publish those links after confirming the documents are current and complete.

## Accessibility Checks

Before deployment:

- Verify keyboard navigation through all fields and links.
- Verify visible focus indicators.
- Verify mobile layout at 375px width.
- Verify dark mode contrast.
- Verify the `mailto:` draft opens without clearing the form.
- Verify error text is specific and does not imply data loss.

## Security and Protective Notes

1. Never collect medical information in the sign-up form.
2. Do not log form data.
3. Do not add analytics or telemetry to this page without explicit protective review.
4. Use backend validation if server submission is added.
5. Encrypt contact data in transit and at rest if it is stored.
6. Document retention and deletion before collecting submissions.
7. Keep participation voluntary and avoid urgency or pressure language.

## Related Files

- React component: `src/pages/StudyLanding.tsx`
- Static page: `public/study-001.html`
- Research materials: `research/study-001-local-first-pain-tracking/`
