export interface ReadingPath {
  slug: string;
  title: string;
  description: string;
  postCount: number;
  startLabel: string;
  startHref: string;
  relatedSlugs: string[];
}

export const readingPaths: ReadingPath[] = [
  {
    slug: 'protective-computing-doctrine',
    title: 'Protective Computing Doctrine',
    description:
      'Start with the core doctrine posts that define why safety claims only count when the architecture can defend them.',
    postCount: 3,
    startLabel: 'Protective Computing Is Not Privacy Theater',
    startHref:
      'https://dev.to/crisiscoresystems/protective-computing-is-not-privacy-theater-2job',
    relatedSlugs: [
      'protective-computing-is-not-privacy-theater-2job',
      'architecting-for-vulnerability-introducing-protective-computing-core-v10-91g',
      'the-overton-framework-is-now-doi-backed-ko7',
    ],
  },
  {
    slug: 'trauma-informed-design',
    title: 'Trauma-Informed Design',
    description:
      'A path through lived experience, product philosophy, hooks, and architecture for software that must stay usable on bad days.',
    postCount: 5,
    startLabel: 'Two People, Same Body',
    startHref:
      'https://dev.to/crisiscoresystems/two-people-same-body-a-developers-crisis-architecture-25ko',
    relatedSlugs: [
      'two-people-same-body-a-developers-crisis-architecture-25ko',
      'building-software-that-actually-gives-a-damn-my-journey-with-trauma-informed-design-12h3',
      'trauma-informed-react-hooks-483n',
      'trauma-informed-ux-accessibility-as-architecture-not-polish-22jg',
      'building-a-pain-tracker-that-actually-gets-it-no-market-research-required-4511',
    ],
  },
  {
    slug: 'client-side-encryption',
    title: 'Client-Side Encryption for Health Apps',
    description:
      'The encryption trilogy on user-held keys, fake encryption claims, and the Web Crypto implementation details that make the boundary real.',
    postCount: 3,
    startLabel: 'Keeping Your Health Data Out of Court',
    startHref: 'https://blog.paintracker.ca/keeping-your-health-data-out-of-court',
    relatedSlugs: [
      'keeping-your-health-data-out-of-court',
      'if-your-health-app-cant-explain-its-encryption-it-doesnt-have-any',
      'client-side-encryption-for-healthcare-apps',
    ],
  },
  {
    slug: 'verifiable-trust',
    title: 'Documentation Integrity / Verifiable Trust',
    description:
      'Read the trust path that moves from local gates to truthful docs to reproducible release artifacts and explicit delivery invariants.',
    postCount: 4,
    startLabel: 'Quality gates that earn trust',
    startHref:
      'https://dev.to/crisiscoresystems/quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3',
    relatedSlugs: [
      'quality-gates-that-earn-trust-checks-you-can-run-not-promises-you-cant-58a3',
      'maintaining-truthful-docs-over-time-how-to-keep-security-claims-honest-2778',
      'how-proofvault-turned-trust-from-a-documentation-claim-into-a-reproducible-release-artifact-22pb',
      'preview-mode-first-agent-plans-as-prs-plan-diff-invariants-4ikd',
    ],
  },
  {
    slug: 'worksafebc-workflows',
    title: 'WorkSafeBC Documentation Workflows',
    description:
      'A careful path through structured summaries, export boundaries, and privacy-safe documentation workflows for claims support.',
    postCount: 3,
    startLabel: 'How Pain Tracker Streamlines WorkSafeBC Claims',
    startHref:
      'https://blog.paintracker.ca/worksafe-bc-case-study-documentation-time-savings',
    relatedSlugs: [
      'worksafe-bc-case-study-documentation-time-savings',
      'how-pain-tracker-pro-streamlines-worksafebc-claims-a-composite-case-study',
    ],
  },
  {
    slug: 'ai-agents',
    title: 'AI Agents Under Protective Computing',
    description:
      'A compact path on why agent speed increases verification pressure and how preview-mode guardrails keep automation reviewable.',
    postCount: 3,
    startLabel: 'Preview Mode First',
    startHref:
      'https://dev.to/crisiscoresystems/preview-mode-first-agent-plans-as-prs-plan-diff-invariants-4ikd',
    relatedSlugs: [
      'protective-computing-is-not-privacy-theater-2job',
      'the-micro-coercion-of-speed-why-friction-is-an-engineering-prerequisite-g4j',
      'preview-mode-first-agent-plans-as-prs-plan-diff-invariants-4ikd',
    ],
  },
];

export function findReadingPathsForSlug(slug: string): ReadingPath[] {
  return readingPaths.filter((path) => path.relatedSlugs.includes(slug));
}