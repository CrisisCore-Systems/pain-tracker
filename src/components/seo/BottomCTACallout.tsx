/**
 * Shared Bottom CTA Callout Component
 * Gradient call-to-action block used at the bottom of SEO landing pages.
 */

import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** Tailwind `from-{color}` / `to-{color}` / tint classes passed directly */
interface BottomCTACalloutProps {
  icon: LucideIcon;
  heading: string;
  body: string;
  pdfUrl: string;
  pdfFilename?: string;
  /** e.g. "from-purple-600 to-indigo-600" */
  gradientClasses: string;
  /** e.g. "text-purple-100" for body text */
  tintClass: string;
  /** e.g. "text-purple-700" for primary button text */
  buttonTextClass: string;
  /** e.g. "hover:bg-purple-50" for primary button hover */
  buttonHoverClass?: string;
  /** Override primary button label (default: "Download PDF") */
  primaryLabel?: string;
  /** Override secondary button label (default: "Try Digital Version") */
  secondaryLabel?: string;
  /** Set false to render a normal link instead of a download link */
  download?: boolean;
}

export const BottomCTACallout: React.FC<BottomCTACalloutProps> = ({
  icon: Icon,
  heading,
  body,
  pdfUrl,
  pdfFilename,
  gradientClasses,
  tintClass,
  buttonTextClass,
  buttonHoverClass = 'hover:bg-slate-50',
  primaryLabel = 'Download PDF',
  secondaryLabel = 'Try Digital Version',
  download: isDownload = true,
}) => (
  <div className={`my-10 bg-gradient-to-r ${gradientClasses} rounded-2xl p-6 md:p-8 text-white`}>
    <div className="flex items-start gap-4">
      <Icon className="w-8 h-8 flex-shrink-0 opacity-80" aria-hidden="true" />
      <div>
        <h3 className="text-lg font-bold mb-2">{heading}</h3>
        <p className={`${tintClass} text-sm leading-relaxed mb-4`}>{body}</p>
        <div className="flex flex-wrap gap-3">
          <a
            href={pdfUrl}
            {...(isDownload ? { download: pdfFilename ?? true } : {})}
            className={`inline-flex items-center gap-2 bg-white ${buttonTextClass} px-4 py-2 rounded-lg font-medium text-sm ${buttonHoverClass} transition-colors`}
          >
            {primaryLabel} <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/start"
            className="inline-flex items-center gap-2 border border-white/30 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-white/10 transition-colors"
          >
            {secondaryLabel}
          </a>
        </div>
      </div>
    </div>
  </div>
);
