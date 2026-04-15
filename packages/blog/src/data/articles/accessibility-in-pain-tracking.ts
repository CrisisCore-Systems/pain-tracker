import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'accessibility-in-pain-tracking',
  title: 'Accessibility in Pain Tracking: Inclusive Design for Chronic Pain',
  description:
    'The people who most need pain tracking tools are often the least served by inaccessible design. Here is what WCAG 2.2 AA compliance and trauma-informed UX actually mean in practice.',
  h1: 'Accessibility in Pain Tracking: Designed for Everyone',
  cluster: 'transparency',
  isPillar: false,
  schemaTypes: ['WebPage'],
  sections: [
    {
      h2: 'Accessibility is a health equity issue, not a checkbox',
      paragraphs: [
        'People who most need pain tracking tools are disproportionately likely to have accessibility needs. Chronic pain conditions frequently co-occur with mobility impairments, visual difficulties, cognitive fog, and fatigue. All of these affect how someone interacts with digital tools. An inaccessible pain tracker excludes exactly the people it is designed to serve. That is not an oversight. That is a failure.',
        'Accessibility is not an add-on feature. It is a design commitment that shapes every interaction, from the size of touch targets to the language used in error messages. Pain Tracker treats accessibility as a first-class constraint: features are not shipped until they meet accessibility standards, because the people tracking pain during a flare, at low capacity, under stress, deserve a tool that works for them in those exact conditions.',
      ],
    },
    {
      h2: 'What WCAG 2.2 AA means in practice',
      paragraphs: [
        'Pain Tracker targets Web Content Accessibility Guidelines 2.2 at the AA conformance level. In practical terms: all interactive elements are keyboard accessible, visual content meets minimum contrast ratios, touch targets are large enough for users with motor impairments, screen readers can navigate and interpret all content, and time-sensitive interactions provide sufficient time for all users.',
        'WCAG 2.2 introduced criteria particularly relevant to pain tracking: minimum target sizes for touch inputs, focus appearance requirements for keyboard navigation, and accessible authentication flows. Pain Tracker\'s passphrase entry and daily tracking interface are designed to meet these updated standards.',
      ],
    },
    {
      h2: 'Trauma-informed design in a health tool',
      paragraphs: [
        'Chronic pain is frequently associated with trauma, and pain tracking itself can be emotionally difficult. It asks you to engage with your own suffering on a daily basis. Pain Tracker\'s trauma-informed design philosophy addresses this through concrete practices: gentle, non-judgmental language throughout the interface, user control over the tracking experience, reduced cognitive load through structured inputs, and quick exit mechanisms.',
        'Error messages never blame the user. The interface does not pressure completion. Every interaction is designed with the understanding that the person using the app may be in significant pain, distress, or fatigue right now. That is not a use case. That is the primary scenario.',
      ],
    },
    {
      h2: 'Designing for reduced capacity',
      paragraphs: [
        'Pain flares reduce cognitive capacity, motor control, and tolerance for complexity. A pain tracker that only works on good days fails at its core purpose. Pain Tracker\'s interface is designed for worst-case capacity: large touch targets, minimal required interactions, clear visual hierarchy, and a one-swipe minimal entry path that captures essential data when you cannot manage more.',
        'The application adapts to user preferences for text size, colour contrast, and motion sensitivity. These are not cosmetic settings. They are functional accommodations that determine whether the app is usable during a severe flare. Respecting the user\'s system-level accessibility preferences is a baseline requirement, not a bonus.',
      ],
    },
    {
      h2: 'Privacy and accessibility point to the same thing',
      paragraphs: [
        'Accessible design benefits all users, not just those with identified disabilities. Larger touch targets are easier for everyone on a bus or in a moving vehicle. Clear language helps everyone understand faster. Keyboard navigation supports power users and people with temporary injuries alike.',
        'For Pain Tracker, accessibility and privacy are both expressions of the same core commitment: respect for the user. Respecting privacy means not taking data without consent. Respecting accessibility means not building tools people cannot use. Neither is optional. Neither is a later-stage feature.',
      ],
    },
  ],
};

export default article;
