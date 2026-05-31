import Link from 'next/link';

const ROOT_SITE_URL = 'https://www.paintracker.ca';

interface HighIntentLink {
  href: string;
  label: string;
  description: string;
  slug?: string;
}

const highIntentLinks: HighIntentLink[] = [
  {
    href: `${ROOT_SITE_URL}/`,
    label: 'free private pain tracker app',
    description:
      'Open the no-account pain tracker when you want private local records instead of another cloud account.',
  },
  {
    href: `${ROOT_SITE_URL}/resources/daily-pain-tracker-printable`,
    label: 'daily pain tracker printable',
    description:
      'Start with one printable day sheet for pain level, medications, triggers, function, and appointment notes.',
  },
  {
    href: `${ROOT_SITE_URL}/resources/what-to-include-in-pain-journal`,
    label: 'what to include in a pain journal',
    description:
      'Use the checklist when you need to know which details are worth recording and which can wait.',
  },
  {
    href: `${ROOT_SITE_URL}/resources/7-day-pain-diary-template`,
    label: '7-day pain diary template',
    description:
      'Build one week of records for an appointment, treatment change, flare review, or short tracking trial.',
  },
  {
    href: `${ROOT_SITE_URL}/resources/monthly-pain-tracker-printable`,
    label: 'monthly pain tracker printable',
    description:
      'See longer patterns across flare cycles, sleep disruption, medication changes, and functional limits.',
  },
  {
    href: '/best-pain-tracking-apps',
    label: 'best pain tracking apps',
    description:
      'Compare pain tracking apps by storage model, offline access, privacy defaults, and export usefulness.',
    slug: 'best-pain-tracking-apps',
  },
];

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
  const links = highIntentLinks.filter(link => link.slug !== currentSlug);

  return (
    <section className="mb-10 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
      <h2 className="mb-3 text-2xl font-semibold text-gray-800 dark:text-gray-100">
        Related pain tracking resources
      </h2>
      <p className="mb-5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        These are the core resource paths for moving from reading to a useful record without adding
        another cloud-dependent workflow.
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
