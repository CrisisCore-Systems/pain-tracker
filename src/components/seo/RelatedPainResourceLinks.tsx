import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export interface RelatedPainResourceLink {
  title: string;
  description: string;
  href: string;
}

export type RelatedPainResourceTopic =
  | 'general'
  | 'printable'
  | 'chronic-pain'
  | 'pain-journal'
  | 'pain-scale'
  | 'privacy'
  | 'offline'
  | 'workplace-injury'
  | 'download';

export const CORE_RELATED_PAIN_RESOURCE_LINKS: RelatedPainResourceLink[] = [
  {
    title: 'pain tracking resources',
    description:
      'Start from the resource hub when you need printables, journal guidance, app paths, or privacy details in one place.',
    href: '/resources',
  },
  {
    title: 'daily pain tracker printable',
    description:
      'Print one daily sheet for pain level, medication response, triggers, function, and appointment notes.',
    href: '/resources/daily-pain-tracker-printable',
  },
  {
    title: 'chronic pain diary template',
    description:
      'Use a longer-term diary when you need baseline, flare, function, and medication patterns over weeks or months.',
    href: '/resources/chronic-pain-diary-template',
  },
  {
    title: 'pain scale chart printable',
    description:
      'Keep pain ratings more consistent with a printable 0-10 reference before entries or appointments.',
    href: '/resources/pain-scale-chart-printable',
  },
  {
    title: 'what to include in a pain journal',
    description:
      'Use the checklist when you need to know which details are worth recording and which can wait.',
    href: '/resources/what-to-include-in-pain-journal',
  },
];

export const TOPIC_RELATED_PAIN_RESOURCE_LINKS: Record<
  RelatedPainResourceTopic,
  RelatedPainResourceLink[]
> = {
  general: [
    {
      title: 'free private offline pain tracker app',
      description:
        'Open the no-account tracker when you want private local records instead of another cloud workflow.',
      href: '/',
    },
    ...CORE_RELATED_PAIN_RESOURCE_LINKS,
  ],
  printable: [
    {
      title: 'daily pain tracker printable',
      description:
        'Start with one daily sheet for pain level, medication response, triggers, function, and notes.',
      href: '/resources/daily-pain-tracker-printable',
    },
    {
      title: 'pain scale chart printable',
      description:
        'Use a 0-10 reference alongside printed sheets so pain ratings stay easier to compare.',
      href: '/resources/pain-scale-chart-printable',
    },
    {
      title: 'what to include in a pain journal',
      description:
        'Check which details matter before you add more fields to a paper or digital journal.',
      href: '/resources/what-to-include-in-pain-journal',
    },
    {
      title: 'chronic pain diary template',
      description:
        'Move from one-day tracking into longer baseline and flare patterns when the record needs more context.',
      href: '/resources/chronic-pain-diary-template',
    },
    {
      title: 'download PainTracker',
      description:
        'Install or open PainTracker when paper becomes hard to review, carry, or summarize.',
      href: '/download',
    },
  ],
  'chronic-pain': [
    {
      title: 'chronic pain diary template',
      description:
        'Use the long-term diary for baseline pain, flares, function, medication response, and monthly trends.',
      href: '/resources/chronic-pain-diary-template',
    },
    {
      title: 'what to include in a pain journal',
      description:
        'Keep the record focused on the details that help appointments instead of overloading every entry.',
      href: '/resources/what-to-include-in-pain-journal',
    },
    {
      title: 'daily pain tracker printable',
      description:
        'Use a single-day printable when longer diary pages feel too heavy on a bad day.',
      href: '/resources/daily-pain-tracker-printable',
    },
    {
      title: 'free private pain tracker',
      description:
        'Use the app for private local tracking when repeated paper entries become hard to manage.',
      href: '/',
    },
    {
      title: 'tracking data policy',
      description:
        'Review what PainTracker stores, what it avoids collecting, and where exports stay under your control.',
      href: '/tracking-data-policy',
    },
  ],
  'pain-journal': [
    {
      title: 'what to include in a pain journal',
      description:
        'Start with the checklist before deciding which details belong in your daily record.',
      href: '/resources/what-to-include-in-pain-journal',
    },
    {
      title: 'daily pain tracker printable',
      description:
        'Use a simple printable when you want a journal entry that is short enough to repeat.',
      href: '/resources/daily-pain-tracker-printable',
    },
    {
      title: 'chronic pain diary template',
      description:
        'Use a longer diary when you need to separate baseline pain, flares, and treatment response.',
      href: '/resources/chronic-pain-diary-template',
    },
    {
      title: 'pain scale chart printable',
      description:
        'Pair journal notes with a consistent pain score reference for clearer review later.',
      href: '/resources/pain-scale-chart-printable',
    },
    {
      title: 'download PainTracker',
      description:
        'Move the same habit into the offline-capable app when digital entries are easier to keep up with.',
      href: '/download',
    },
  ],
  'pain-scale': [
    {
      title: 'pain scale chart printable',
      description:
        'Use the 0-10 chart as a reference before writing pain scores in any tracker or diary.',
      href: '/resources/pain-scale-chart-printable',
    },
    {
      title: 'daily pain tracker printable',
      description:
        'Record the rating alongside medication, activity, triggers, function, and notes.',
      href: '/resources/daily-pain-tracker-printable',
    },
    {
      title: 'what to include in a pain journal',
      description: 'Add context around pain scores so the number is easier to interpret later.',
      href: '/resources/what-to-include-in-pain-journal',
    },
    {
      title: 'chronic pain diary template',
      description:
        'Track whether pain scores are part of a baseline, flare, treatment change, or longer trend.',
      href: '/resources/chronic-pain-diary-template',
    },
    {
      title: 'free private offline pain tracker',
      description:
        'Use the app when you want timestamps and private local history without a cloud account.',
      href: '/',
    },
  ],
  privacy: [
    {
      title: 'free private offline pain tracker',
      description: 'Open the app path when you want local records without making an account first.',
      href: '/',
    },
    {
      title: 'tracking data policy',
      description:
        'See what is stored locally, what is not collected by default, and how optional analytics and exports work.',
      href: '/tracking-data-policy',
    },
    {
      title: 'local first pain tracking resources',
      description:
        'Use the resource hub for printables and guides that do not require cloud accounts.',
      href: '/resources',
    },
    {
      title: 'download PainTracker',
      description:
        'Install the app when you need offline-capable tracking under your own device control.',
      href: '/download',
    },
  ],
  offline: [
    {
      title: 'free private offline pain tracker',
      description:
        'Start from the no-account app path when connectivity or account friction is the wrong dependency.',
      href: '/',
    },
    {
      title: 'download PainTracker',
      description: 'Use the download page for install options and browser-based access.',
      href: '/download',
    },
    {
      title: 'pain tracking resources',
      description:
        'Keep printable fallback tools available when device, battery, or browser state is unstable.',
      href: '/resources',
    },
    {
      title: 'tracking data policy',
      description:
        'Review the local storage, export, and optional analytics boundaries before relying on the app.',
      href: '/tracking-data-policy',
    },
  ],
  'workplace-injury': [
    {
      title: 'download PainTracker',
      description:
        'Use the app when you need cleaner pain and function records for appointment or claim-related discussions.',
      href: '/download',
    },
    {
      title: 'daily pain tracker printable',
      description:
        'Capture daily pain, medication response, and functional limits without waiting on a digital workflow.',
      href: '/resources/daily-pain-tracker-printable',
    },
    {
      title: 'chronic pain diary template',
      description:
        'Track longer patterns when injury recovery, flares, and function need more than one-day notes.',
      href: '/resources/chronic-pain-diary-template',
    },
    {
      title: 'what to include in a pain journal',
      description:
        'Keep claim-facing notes factual and focused on pain, function, timing, and treatment response.',
      href: '/resources/what-to-include-in-pain-journal',
    },
    {
      title: 'WorkSafeBC pain journal template',
      description: 'Use the BC-oriented documentation aid when workplace injury context matters.',
      href: '/resources/worksafebc-pain-journal-template',
    },
  ],
  download: [
    {
      title: 'download PainTracker',
      description:
        'Install or open PainTracker when you want private, offline-capable digital tracking.',
      href: '/download',
    },
    {
      title: 'free private offline pain tracker',
      description: 'Use the browser app directly when you need a no-account path.',
      href: '/',
    },
    {
      title: 'pain tracking resources',
      description: 'Keep printable tools available as a fallback or bridge into the app.',
      href: '/resources',
    },
    {
      title: 'tracking data policy',
      description:
        'Review storage, export, and optional analytics boundaries before relying on digital records.',
      href: '/tracking-data-policy',
    },
  ],
};

export const getRelatedPainResourceLinks = (
  topic: RelatedPainResourceTopic = 'general'
): RelatedPainResourceLink[] => TOPIC_RELATED_PAIN_RESOURCE_LINKS[topic];

const normalizeHref = (href: string) =>
  href
    .replace(/^https:\/\/(?:www\.)?paintracker\.ca/i, '')
    .replace(/^https:\/\/blog\.paintracker\.ca/i, 'https://blog.paintracker.ca')
    .replace(/\/$/, '') || '/';

export const mergeRelatedPainResourceLinks = (
  links: RelatedPainResourceLink[] = [],
  topic: RelatedPainResourceTopic = 'general'
): RelatedPainResourceLink[] => {
  const seen = new Set<string>();
  return [...getRelatedPainResourceLinks(topic), ...links].filter(link => {
    const key = normalizeHref(link.href);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const inferRelatedPainResourceTopic = (slug?: string): RelatedPainResourceTopic => {
  if (!slug) {
    return 'general';
  }

  if (/worksafebc|worker|compensation|claim|disability|injury|functioning/i.test(slug)) {
    return 'workplace-injury';
  }

  if (/privacy|encrypted|local|offline|zero-knowledge/i.test(slug)) {
    return 'privacy';
  }

  if (/pain-scale|scale|rating/i.test(slug)) {
    return 'pain-scale';
  }

  if (
    /chronic|flare|fibromyalgia|arthritis|nerve|migraine|endometriosis|crps|back-pain/i.test(slug)
  ) {
    return 'chronic-pain';
  }

  if (/journal|diary|doctor|appointment|what-to-include|describe|examples/i.test(slug)) {
    return 'pain-journal';
  }

  if (/printable|template|pdf|log|tracker|checklist/i.test(slug)) {
    return 'printable';
  }

  return 'general';
};

interface RelatedPainResourceLinksProps {
  heading?: string;
  intro?: string;
  topic?: RelatedPainResourceTopic;
  links?: RelatedPainResourceLink[];
  className?: string;
  maxWidthClassName?: string;
}

const isExternalHref = (href: string) => /^https?:\/\//i.test(href);

export const RelatedPainResourceLinks: React.FC<RelatedPainResourceLinksProps> = ({
  heading = 'Related pain tracking resources',
  intro = 'Need a simpler record before your next appointment? Start with the daily pain tracker printable, compare symptoms with the pain scale chart, or use the chronic pain diary template for longer term patterns.',
  topic = 'general',
  links = [],
  className = 'py-16 sm:py-20 bg-slate-800/30 border-t border-slate-700/50',
  maxWidthClassName = 'max-w-6xl',
}) => {
  const relatedLinks = mergeRelatedPainResourceLinks(links, topic);

  const renderCard = (link: RelatedPainResourceLink) => {
    const cardContent = (
      <>
        <h3 className="font-semibold text-white group-hover:text-primary transition-colors mb-2">
          {link.title}
        </h3>
        <p className="text-sm text-slate-400 mb-3">{link.description}</p>
        <span className="text-sm text-primary flex items-center gap-1">
          Open resource{' '}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </>
    );

    const cardClassName =
      'group p-6 bg-slate-800/60 hover:bg-slate-800/80 rounded-xl border border-slate-700/50 hover:border-primary/40 transition-all';

    if (isExternalHref(link.href)) {
      return (
        <a key={link.href} href={link.href} className={cardClassName}>
          {cardContent}
        </a>
      );
    }

    return (
      <Link key={link.href} to={link.href} className={cardClassName}>
        {cardContent}
      </Link>
    );
  };

  return (
    <section className={className} aria-labelledby="related-pain-resources-heading">
      <div className={`${maxWidthClassName} mx-auto px-4 sm:px-6 lg:px-8`}>
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-3">
            Keep Reading
          </p>
          <h2 id="related-pain-resources-heading" className="text-2xl font-bold text-white">
            {heading}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{intro}</p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {relatedLinks.map(renderCard)}
        </div>
      </div>
    </section>
  );
};
