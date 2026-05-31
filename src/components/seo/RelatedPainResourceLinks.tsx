import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export interface RelatedPainResourceLink {
  title: string;
  description: string;
  href: string;
}

export const CORE_RELATED_PAIN_RESOURCE_LINKS: RelatedPainResourceLink[] = [
  {
    title: 'free private pain tracker app',
    description:
      'Open the no-account pain tracker when you want private local records instead of another cloud account.',
    href: '/',
  },
  {
    title: 'free pain tracker templates and printables',
    description:
      'Use the resource hub to compare printable diaries, appointment guides, and private tracking paths.',
    href: '/resources',
  },
  {
    title: 'daily pain tracker printable',
    description:
      'Start with one printable daily sheet for pain level, medication response, triggers, function, and notes.',
    href: '/resources/daily-pain-tracker-printable',
  },
  {
    title: 'what to include in a pain journal',
    description:
      'Use the checklist when you need to know which details are worth recording and which can wait.',
    href: '/resources/what-to-include-in-pain-journal',
  },
  {
    title: '7-day pain diary template',
    description:
      'Build one week of records for an appointment, treatment change, flare review, or short tracking trial.',
    href: '/resources/7-day-pain-diary-template',
  },
  {
    title: 'monthly pain tracker printable',
    description:
      'See longer patterns across flare cycles, sleep disruption, medication changes, and functional limits.',
    href: '/resources/monthly-pain-tracker-printable',
  },
  {
    title: 'best pain tracking apps',
    description:
      'Compare pain tracking apps by storage model, offline access, privacy defaults, and export usefulness.',
    href: 'https://blog.paintracker.ca/best-pain-tracking-apps',
  },
];

const normalizeHref = (href: string) =>
  href
    .replace(/^https:\/\/(?:www\.)?paintracker\.ca/i, '')
    .replace(/^https:\/\/blog\.paintracker\.ca/i, 'https://blog.paintracker.ca')
    .replace(/\/$/, '') || '/';

export const mergeRelatedPainResourceLinks = (
  links: RelatedPainResourceLink[] = []
): RelatedPainResourceLink[] => {
  const seen = new Set<string>();
  return [...CORE_RELATED_PAIN_RESOURCE_LINKS, ...links].filter(link => {
    const key = normalizeHref(link.href);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

interface RelatedPainResourceLinksProps {
  heading?: string;
  intro?: string;
  links?: RelatedPainResourceLink[];
  className?: string;
  maxWidthClassName?: string;
}

const isExternalHref = (href: string) => /^https?:\/\//i.test(href);

export const RelatedPainResourceLinks: React.FC<RelatedPainResourceLinksProps> = ({
  heading = 'Related pain tracking resources',
  intro = 'Use these core paths when you need a printable, a short setup guide, the full resource hub, or a privacy-first app path.',
  links = [],
  className = 'py-16 sm:py-20 bg-slate-800/30 border-t border-slate-700/50',
  maxWidthClassName = 'max-w-6xl',
}) => {
  const relatedLinks = mergeRelatedPainResourceLinks(links);

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
