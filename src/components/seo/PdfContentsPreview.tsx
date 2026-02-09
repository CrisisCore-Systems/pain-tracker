/**
 * Shared PDF Contents Preview Component
 * Renders a 3-column grid showing what's in each page of a PDF template.
 */

import React from 'react';
import type { ColorScheme } from './StatsBanner';

export interface PdfPage {
  page: number;
  title: string;
  desc: string;
}

const ACCENT_COLOR_MAP: Record<ColorScheme, string> = {
  purple:  'text-purple-600',
  amber:   'text-amber-600',
  blue:    'text-blue-600',
  indigo:  'text-indigo-600',
  teal:    'text-teal-600',
  red:     'text-red-600',
  pink:    'text-pink-600',
  rose:    'text-rose-600',
  emerald: 'text-emerald-600',
  violet:  'text-violet-600',
  orange:  'text-orange-600',
  sky:     'text-sky-600',
};

const BADGE_BG_MAP: Record<ColorScheme, string> = {
  purple:  'bg-purple-100 text-purple-700',
  amber:   'bg-amber-100 text-amber-700',
  blue:    'bg-blue-100 text-blue-700',
  indigo:  'bg-indigo-100 text-indigo-700',
  teal:    'bg-teal-100 text-teal-700',
  red:     'bg-red-100 text-red-700',
  pink:    'bg-pink-100 text-pink-700',
  rose:    'bg-rose-100 text-rose-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  violet:  'bg-violet-100 text-violet-700',
  orange:  'bg-orange-100 text-orange-700',
  sky:     'bg-sky-100 text-sky-700',
};

interface PdfContentsPreviewProps {
  pages: PdfPage[];
  accentColor: ColorScheme;
  /** Optional heading override (default: "What's in the PDF (N Pages)") */
  heading?: string;
  /** Optional subtitle below the heading */
  subtitle?: string;
  /** 'card' = PAGE X grid cards (default), 'badge' = numbered circle badges in bordered panel */
  variant?: 'card' | 'badge';
}

export const PdfContentsPreview: React.FC<PdfContentsPreviewProps> = ({
  pages,
  accentColor,
  heading,
  subtitle,
  variant = 'card',
}) => {
  const accent = ACCENT_COLOR_MAP[accentColor];
  const displayHeading = heading ?? `What\u2019s in the PDF (${pages.length} Pages)`;

  if (variant === 'badge') {
    const badgeClasses = BADGE_BG_MAP[accentColor];
    return (
      <div className="my-10 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <h3 className="text-xl font-bold text-slate-800 mb-2">{displayHeading}</h3>
        {subtitle && <p className="text-sm text-slate-500 mb-6">{subtitle}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pages.map((p) => (
            <div key={p.page} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 border border-slate-100">
              <span className={`flex-shrink-0 w-7 h-7 rounded-full ${badgeClasses} text-xs font-bold flex items-center justify-center`}>
                {p.page}
              </span>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">{p.title}</h4>
                <p className="text-xs text-slate-500">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">{displayHeading}</h3>
      {subtitle && <p className="text-sm text-slate-500 mb-6">{subtitle}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((p) => (
          <div key={p.page} className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow">
            <div className={`text-xs font-bold ${accent} mb-2`}>PAGE {p.page}</div>
            <h4 className="font-semibold text-slate-800 mb-1">{p.title}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
