import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'building-a-healthcare-pwa-that-actually-works-when-it-matters',
  title: 'Building a Pain Tracking App That Still Works Offline: What a Reliable Healthcare PWA Must Do in Real Life',
  description:
    'Most health apps fail the moment a patient loses signal, closes the tab, or runs low on battery. Here is how to build a healthcare PWA that keeps working when conditions are not ideal — which is most of the time.',
  h1: 'Building a Pain Tracking App That Still Works Offline',
  cluster: 'transparency',
  isPillar: false,
  schemaTypes: ['Article'],
  sections: [
    {
      h2: 'The wrong starting assumption',
      paragraphs: [
        'Most healthcare PWA tutorials start from the same premise: the user has reliable internet, a charged device, uninterrupted time, and the cognitive headroom to navigate an unfamiliar interface. For general productivity apps that assumption is approximately correct. For chronic pain tracking it is almost entirely wrong.',
        'Patients logging pain entries are, by definition, experiencing pain. They may be exhausted, cognitively impaired by medication, sitting in a clinic waiting room with weak signal, or interrupted mid-entry by the very thing they are trying to document. Building a healthcare PWA that "actually works" means building for those conditions first — not as edge cases but as the primary operating environment.',
      ],
    },
    {
      h2: 'Offline-first is a product decision, not a technical one',
      paragraphs: [
        'Offline-first architecture is often treated as a technical constraint to engineer around. In healthcare apps it is a product requirement. A pain log entry that fails to save because the user walked out of range is not a minor UX inconvenience — it is a data loss event that directly harms the clinical value of the app.',
        'The practical implication is that every write path must succeed locally before any network call is attempted. If sync exists, it must be asynchronous, non-blocking, and invisible to the user during the write. The user\'s confirmation that their entry was saved must be based on local persistence, not network acknowledgement. PainTracker achieves this by persisting all data to IndexedDB synchronously on every entry, with no cloud backend involved at any point in the write path.',
      ],
    },
    {
      h2: 'What "works offline" actually requires',
      paragraphs: [
        'Claiming a healthcare PWA works offline usually means one of three things: (1) the app opens without internet, (2) data entry works without internet, or (3) all features work without internet. These are meaningfully different. The first is a marketing claim. The second is a basic requirement. The third is what reliable health tracking actually demands.',
        'For a pain tracking app, offline completeness means the core write path (logging an entry), the read path (reviewing past entries), and the export path (generating PDF or CSV for clinicians) all function without connectivity. Trend analysis, medication correlation, and functional impact summaries must run locally. If any of these features require a server, the app fails the patients who most need it — those with unstable access.',
      ],
    },
    {
      h2: 'Service worker design for interrupted sessions',
      paragraphs: [
        'Service workers in healthcare PWAs need stricter caching discipline than general applications. The temptation is to cache everything aggressively. The risk is serving stale medication data, outdated clinical reference values, or cached export templates that no longer match the current data schema after an update.',
        'A workable pattern is to separate the service worker\'s caching strategy by data type: app shell and UI assets can use stale-while-revalidate; clinical reference data should use network-first with a short cache TTL; user health data must never be routed through a service worker cache at all — it lives in IndexedDB, accessed directly by the app. Audit what your service worker caches and ask: if this data is 48 hours stale, what is the harm to a patient acting on it?',
      ],
    },
    {
      h2: 'Local-only analytics and pattern recognition',
      paragraphs: [
        'Pattern recognition is one of the highest-value features of a pain tracking app — correlating pain levels with weather, sleep, medications, and activity to reveal actionable triggers. The architectural choice that determines whether this feature is acceptable is where the computation happens.',
        'Remote processing of health data for analytics, even anonymised, creates exposure that patients have not meaningfully consented to and that persists beyond the app relationship. Local-only computation using the Web Workers API keeps the analysis on the patient\'s device, eliminates transmission risk, and actually produces better results: it has access to the full entry history without rate limits, without API costs, and without any privacy tradeoff. PainTracker runs all correlations in a local Web Worker against the full IndexedDB dataset, returning results without a single byte of health data leaving the device.',
      ],
    },
    {
      h2: 'Clinical export as a core feature, not an afterthought',
      paragraphs: [
        'Healthcare PWAs typically treat export as a secondary feature — something requested by power users. Pain tracking reverses this priority. The entire point of consistent symptom logging is to produce records that clinicians and claims reviewers can use. If the export is hard to read, clinically incomplete, or formatted for screenshot sharing rather than professional review, the app has failed at its primary purpose.',
        'Practical requirements for clinical-grade PDF export in a local-first PWA: the generation must run entirely in the browser using a library like pdf-lib or jsPDF; the output must follow clinical documentation conventions (summary statistics first, then chronological detail); exports must be available for any date range without requiring server-side data aggregation; and the PDF must be directly printable without reformatting. Treating export quality as a differentiator rather than a checkbox is what makes a pain tracking app genuinely useful in the healthcare contexts that matter.',
      ],
    },
  ],
  faqs: [
    {
      question: 'Does a healthcare PWA need a backend at all?',
      answer: 'For pain tracking specifically, no. All entry storage, analytics, and export can run locally. A backend is only warranted if you need cross-device sync, practitioner-facing portals, or institution-level reporting — and each of those requires explicit consent architecture to handle health data responsibly.',
    },
    {
      question: 'How do you handle PWA updates without breaking persisted health data?',
      answer: 'Schema versioning in IndexedDB with a migration layer is essential. Every change to the stored entry format must include a migration path that upgrades existing records. Never wipe stored data during an update. Test upgrades against a seeded database before release.',
    },
    {
      question: 'What is the minimum viable offline test for a healthcare PWA?',
      answer: 'Enable airplane mode, reload the app, log an entry, view your history, and generate an export. If any step fails, the app is not genuinely offline-capable. Run this test on a throttled 3G connection as well — slow networks expose race conditions that offline mode masks.',
    },
  ],
};

export default article;
