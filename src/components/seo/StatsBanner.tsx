/**
 * Shared Stats Banner Component
 * Renders a 4-stat grid used across all SEO landing pages.
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface StatItem {
  value: string;
  label: string;
  icon: LucideIcon;
}

export type ColorScheme =
  | 'purple' | 'amber' | 'blue' | 'indigo' | 'teal' | 'red'
  | 'pink' | 'rose' | 'emerald' | 'violet' | 'orange' | 'sky';

const COLOR_MAP: Record<ColorScheme, { bg: string; border: string; text: string }> = {
  purple:  { bg: 'bg-purple-50',  border: 'border-purple-100',  text: 'text-purple-600' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-100',   text: 'text-amber-600' },
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-100',    text: 'text-blue-600' },
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-100',  text: 'text-indigo-600' },
  teal:    { bg: 'bg-teal-50',    border: 'border-teal-100',    text: 'text-teal-600' },
  red:     { bg: 'bg-red-50',     border: 'border-red-100',     text: 'text-red-600' },
  pink:    { bg: 'bg-pink-50',    border: 'border-pink-100',    text: 'text-pink-600' },
  rose:    { bg: 'bg-rose-50',    border: 'border-rose-100',    text: 'text-rose-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600' },
  violet:  { bg: 'bg-violet-50',  border: 'border-violet-100',  text: 'text-violet-600' },
  orange:  { bg: 'bg-orange-50',  border: 'border-orange-100',  text: 'text-orange-600' },
  sky:     { bg: 'bg-sky-50',     border: 'border-sky-100',     text: 'text-sky-600' },
};

const VALUE_COLOR_MAP: Record<ColorScheme, string> = {
  purple:  'text-purple-700',
  amber:   'text-amber-700',
  blue:    'text-blue-700',
  indigo:  'text-indigo-700',
  teal:    'text-teal-700',
  red:     'text-red-700',
  pink:    'text-pink-700',
  rose:    'text-rose-700',
  emerald: 'text-emerald-700',
  violet:  'text-violet-700',
  orange:  'text-orange-700',
  sky:     'text-sky-700',
};

interface StatsBannerProps {
  stats: StatItem[];
  colorScheme: ColorScheme;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ stats, colorScheme }) => {
  const colors = COLOR_MAP[colorScheme];
  const valueColor = VALUE_COLOR_MAP[colorScheme];

  return (
    <div className="my-10 grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className={`text-center p-4 rounded-xl ${colors.bg} border ${colors.border}`}>
          <s.icon className={`w-5 h-5 mx-auto mb-2 ${colors.text}`} aria-hidden="true" />
          <div className={`text-2xl font-bold ${valueColor}`}>{s.value}</div>
          <div className="text-xs text-slate-500 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
};
