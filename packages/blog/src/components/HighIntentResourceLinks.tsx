import Link from 'next/link';

const ROOT_SITE_URL = 'https://www.paintracker.ca';

interface HighIntentLink {
  href: string;
  label: string;
  description: string;
  slug?: string;
}

type HighIntentTopic =
  | 'general'
  | 'printable'
  | 'chronic-pain'
  | 'pain-journal'
  | 'pain-scale'
  | 'privacy'
  | 'workplace-injury';

const topicLinks: Record<HighIntentTopic, HighIntentLink[]> = {
  general: [
    {
      href: `${ROOT_SITE_URL}/`,
      label: 'free private offline pain tracker app',
      description:
        'Open the no-account pain tracker when you want private local records instead of another cloud workflow.',
    },
    {
      href: `${ROOT_SITE_URL}/resources`,
      label: 'pain tracking resources',
      description:
        'Use the central resource hub for printables, journal guides, pain scale charts, app paths, and privacy details.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/daily-pain-tracker-printable`,
      label: 'daily pain tracker printable',
      description:
        'Start with one printable day sheet for pain level, medications, triggers, function, and appointment notes.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/chronic-pain-diary-template`,
      label: 'chronic pain diary template',
      description:
        'Track longer term baseline, flare, medication, sleep, and function patterns across weeks or months.',
    },
    {
      href: `${ROOT_SITE_URL}/tracking-data-policy`,
      label: 'tracking data policy',
      description:
        'Review what PainTracker stores locally, what it avoids collecting, and how exports are handled.',
    },
  ],
  printable: [
    {
      href: `${ROOT_SITE_URL}/resources/daily-pain-tracker-printable`,
      label: 'daily pain tracker printable',
      description:
        'Start with one printable day sheet for pain level, medications, triggers, function, and appointment notes.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/pain-scale-chart-printable`,
      label: 'pain scale chart printable',
      description:
        'Use a 0-10 reference beside printable trackers so pain scores are easier to compare later.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/what-to-include-in-pain-journal`,
      label: 'what to include in a pain journal',
      description:
        'Keep printable entries focused on the details that help appointments without overloading every day.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/chronic-pain-diary-template`,
      label: 'chronic pain diary template',
      description:
        'Move from one-day sheets into longer baseline and flare patterns when the record needs more context.',
    },
    {
      href: `${ROOT_SITE_URL}/download`,
      label: 'download PainTracker',
      description:
        'Install or open PainTracker when paper becomes hard to carry, review, or summarize.',
    },
  ],
  'chronic-pain': [
    {
      href: `${ROOT_SITE_URL}/resources/chronic-pain-diary-template`,
      label: 'chronic pain diary template',
      description:
        'Use the long-term diary for baseline pain, flares, function, medication response, and monthly trends.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/what-to-include-in-pain-journal`,
      label: 'what to include in a pain journal',
      description:
        'Keep chronic pain records focused on high-signal details instead of trying to capture everything.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/daily-pain-tracker-printable`,
      label: 'daily pain tracker printable',
      description: 'Use a single-day printable when a longer diary is too much on a bad day.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/pain-scale-chart-printable`,
      label: 'pain scale chart printable',
      description:
        'Pair chronic pain notes with consistent 0-10 ratings so changes are easier to review.',
    },
    {
      href: `${ROOT_SITE_URL}/`,
      label: 'free private pain tracker',
      description:
        'Use the app for private local tracking when repeated paper entries become hard to manage.',
    },
  ],
  'pain-journal': [
    {
      href: `${ROOT_SITE_URL}/resources/what-to-include-in-pain-journal`,
      label: 'what to include in a pain journal',
      description:
        'Use the checklist before appointments so journal entries stay useful and maintainable.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/daily-pain-tracker-printable`,
      label: 'daily pain tracker printable',
      description: 'Start with a short printable entry when a full journal would be too much.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/chronic-pain-diary-template`,
      label: 'chronic pain diary template',
      description:
        'Use a longer diary when baseline pain, flares, and treatment response need more structure.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/pain-scale-chart-printable`,
      label: 'pain scale chart printable',
      description:
        'Keep pain scores more consistent across journal entries and appointment summaries.',
    },
    {
      href: `${ROOT_SITE_URL}/download`,
      label: 'download PainTracker',
      description:
        'Move the same habit into an offline-capable app when digital entries are easier to keep up with.',
    },
  ],
  'pain-scale': [
    {
      href: `${ROOT_SITE_URL}/resources/pain-scale-chart-printable`,
      label: 'pain scale chart printable',
      description:
        'Use the 0-10 chart as a reference before writing pain scores in any tracker or diary.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/daily-pain-tracker-printable`,
      label: 'daily pain tracker printable',
      description:
        'Record the rating alongside medication, activity, triggers, function, and notes.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/what-to-include-in-pain-journal`,
      label: 'what to include in a pain journal',
      description: 'Add context around pain scores so the number is easier to interpret later.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/chronic-pain-diary-template`,
      label: 'chronic pain diary template',
      description:
        'Track whether pain scores are part of a baseline, flare, treatment change, or longer trend.',
    },
    {
      href: `${ROOT_SITE_URL}/`,
      label: 'free private offline pain tracker',
      description:
        'Use the app when you want timestamps and private local history without a cloud account.',
    },
  ],
  privacy: [
    {
      href: `${ROOT_SITE_URL}/`,
      label: 'free private offline pain tracker',
      description:
        'Open the app path when you want local records without creating an account first.',
    },
    {
      href: `${ROOT_SITE_URL}/tracking-data-policy`,
      label: 'tracking data policy',
      description:
        'See what is stored locally, what is not collected by default, and how optional analytics and exports work.',
    },
    {
      href: `${ROOT_SITE_URL}/resources`,
      label: 'local first pain tracking resources',
      description:
        'Use the resource hub for printables and guides that do not require cloud accounts.',
    },
    {
      href: `${ROOT_SITE_URL}/download`,
      label: 'download PainTracker',
      description:
        'Install the app when you need offline-capable tracking under your own device control.',
    },
  ],
  'workplace-injury': [
    {
      href: `${ROOT_SITE_URL}/download`,
      label: 'download PainTracker',
      description:
        'Use the app when you need cleaner pain and function records for appointment or claim-related discussions.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/daily-pain-tracker-printable`,
      label: 'daily pain tracker printable',
      description:
        'Capture daily pain, medication response, and functional limits without waiting on a digital workflow.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/chronic-pain-diary-template`,
      label: 'chronic pain diary template',
      description:
        'Track longer patterns when injury recovery, flares, and function need more than one-day notes.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/what-to-include-in-pain-journal`,
      label: 'what to include in a pain journal',
      description:
        'Keep claim-facing notes factual and focused on pain, function, timing, and treatment response.',
    },
    {
      href: `${ROOT_SITE_URL}/resources/worksafebc-pain-journal-template`,
      label: 'WorkSafeBC pain journal template',
      description: 'Use the BC-oriented documentation aid when workplace injury context matters.',
    },
  ],
};

function inferHighIntentTopic(currentSlug?: string): HighIntentTopic {
  if (!currentSlug) return 'general';
  if (/worksafe|wcb|claim|injury|compensation|disability|documentation|forms/i.test(currentSlug)) {
    return 'workplace-injury';
  }
  if (/privacy|security|encryption|offline|local|zero-cloud|zero-knowledge/i.test(currentSlug)) {
    return 'privacy';
  }
  if (/scale|rating/i.test(currentSlug)) {
    return 'pain-scale';
  }
  if (/journal|diary|doctor|appointment|symptom/i.test(currentSlug)) {
    return 'pain-journal';
  }
  if (/chronic|fibromyalgia|migraine|flare|arthritis|nerve|recovery/i.test(currentSlug)) {
    return 'chronic-pain';
  }
  if (/printable|template|pdf|download|paper/i.test(currentSlug)) {
    return 'printable';
  }
  return 'general';
}

function getHighIntentLinks(currentSlug?: string): HighIntentLink[] {
  return topicLinks[inferHighIntentTopic(currentSlug)] ?? topicLinks.general;
}

function HighIntentAnchor({ link }: Readonly<{ link: HighIntentLink }>) {
  const className =
    'block rounded-lg border border-gray-200 bg-white/80 p-4 transition hover:border-blue-300 hover:bg-blue-50/80 dark:border-gray-700 dark:bg-gray-900/50 dark:hover:border-blue-700 dark:hover:bg-blue-950/30';

  const content = (
    <>
      <span className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 dark:text-blue-300 dark:decoration-blue-700">
        {link.label}
      </span>
      <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {link.description}
      </span>
    </>
  );

  if (link.href.startsWith('/')) {
    return (
      <Link href={link.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <a href={link.href} className={className}>
      {content}
    </a>
  );
}

export function HighIntentResourceLinks({ currentSlug }: Readonly<{ currentSlug?: string }>) {
  const links = getHighIntentLinks(currentSlug).filter(link => link.slug !== currentSlug);

  return (
    <section className="mb-10 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
      <h2 className="mb-3 text-2xl font-semibold text-gray-800 dark:text-gray-100">
        Related pain tracking resources
      </h2>
      <p className="mb-5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        These resource paths move from reading to a useful record without adding another
        cloud-dependent workflow.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {links.map(link => (
          <HighIntentAnchor key={link.href} link={link} />
        ))}
      </div>
    </section>
  );
}

export function AppCtaBlock() {
  return (
    <section className="mb-10 rounded-lg border border-blue-200 bg-blue-50 p-6 text-center dark:border-blue-800 dark:bg-blue-900/30">
      <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
        Track pain privately without an account
      </h2>
      <p className="mb-4 text-gray-600 dark:text-gray-300">
        PainTracker works offline after first load, keeps core records on your device, and helps you
        document pain patterns for appointments, claims, and personal records.
      </p>
      <a
        href={`${ROOT_SITE_URL}/`}
        className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
      >
        Use the free private pain tracker app
      </a>
    </section>
  );
}
