/**
 * Blog & Resources — In-app hub
 *
 * Surfaces blog articles, guides, templates, and condition-specific
 * resources without leaving the app. External links open in new tabs.
 */

import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Download,
  ExternalLink,
  Shield,
  Heart,
  Calendar,
  Scale,
  ClipboardList,
  Stethoscope,
  Zap,
  ArrowRight,
  Search,
  Newspaper,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ResourceItem {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  category: 'blog' | 'guide' | 'template' | 'condition';
  external?: boolean;
}

type CategoryFilter = 'all' | 'blog' | 'guide' | 'template' | 'condition';

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const BLOG_URL = 'https://blog.paintracker.ca';

const blogArticles: ResourceItem[] = [
  {
    title: 'Understanding Chronic Pain Patterns',
    description: 'How tracking pain over time reveals hidden patterns that can guide treatment decisions.',
    href: `${BLOG_URL}/understanding-chronic-pain-patterns`,
    icon: <Newspaper className="w-5 h-5" />,
    category: 'blog',
    external: true,
  },
  {
    title: 'Privacy-First Health Tracking',
    description: 'Why your health data should stay on your device and how Pain Tracker protects it.',
    href: `${BLOG_URL}/privacy-first-health-tracking`,
    icon: <Shield className="w-5 h-5" />,
    category: 'blog',
    external: true,
  },
  {
    title: 'Pain Tracking Guides',
    description: 'Comprehensive collection of guides for getting the most from your pain diary.',
    href: `${BLOG_URL}/pain-tracking-guides`,
    icon: <BookOpen className="w-5 h-5" />,
    category: 'blog',
    external: true,
  },
  {
    title: 'Browse All Articles',
    description: 'Visit the full blog for the latest articles on pain management and health tech.',
    href: BLOG_URL,
    icon: <ArrowRight className="w-5 h-5" />,
    badge: 'Blog',
    category: 'blog',
    external: true,
  },
];

const guides: ResourceItem[] = [
  {
    title: 'How to Track Pain for Doctors',
    description: 'What clinicians actually want to see in your pain records.',
    href: '/resources/how-to-track-pain-for-doctors',
    icon: <Stethoscope className="w-5 h-5" />,
    badge: 'Popular',
    category: 'guide',
  },
  {
    title: 'What to Include in a Pain Journal',
    description: 'Complete guide to clinically useful pain tracking.',
    href: '/resources/what-to-include-in-pain-journal',
    icon: <BookOpen className="w-5 h-5" />,
    category: 'guide',
  },
  {
    title: 'How Doctors Use Pain Diaries',
    description: 'Understanding the clinical perspective on pain tracking.',
    href: '/resources/how-doctors-use-pain-diaries',
    icon: <BookOpen className="w-5 h-5" />,
    category: 'guide',
  },
  {
    title: 'Pain Diary for Specialist Appointments',
    description: 'Prepare effectively for rheumatology, neurology, and pain specialist visits.',
    href: '/resources/pain-diary-for-specialist-appointment',
    icon: <Calendar className="w-5 h-5" />,
    category: 'guide',
  },
  {
    title: 'Documenting Pain for Disability Claims',
    description: 'Create documentation that supports WorkSafeBC and insurance claims.',
    href: '/resources/documenting-pain-for-disability-claim',
    icon: <Shield className="w-5 h-5" />,
    badge: 'Important',
    category: 'guide',
  },
  {
    title: 'Symptom Tracking Before Diagnosis',
    description: 'Building a symptom history while pursuing a diagnosis.',
    href: '/resources/symptom-tracking-before-diagnosis',
    icon: <Search className="w-5 h-5" />,
    category: 'guide',
  },
];

const templates: ResourceItem[] = [
  {
    title: 'Pain Diary Template PDF',
    description: 'Comprehensive daily pain tracking template.',
    href: '/resources/pain-diary-template-pdf',
    icon: <FileText className="w-5 h-5" />,
    badge: 'Most Popular',
    category: 'template',
  },
  {
    title: 'Daily Pain Tracker Printable',
    description: 'Simple one-page daily tracking sheet.',
    href: '/resources/daily-pain-tracker-printable',
    icon: <Download className="w-5 h-5" />,
    category: 'template',
  },
  {
    title: 'Weekly Pain Log PDF',
    description: '7-day spread showing your pain patterns at a glance.',
    href: '/resources/weekly-pain-log-pdf',
    icon: <ClipboardList className="w-5 h-5" />,
    category: 'template',
  },
  {
    title: 'Monthly Pain Tracker',
    description: 'Monthly overview for long-term trends.',
    href: '/resources/monthly-pain-tracker-printable',
    icon: <Calendar className="w-5 h-5" />,
    category: 'template',
  },
  {
    title: 'Pain Scale Chart Printable',
    description: 'Visual pain scale reference chart (0-10 NRS).',
    href: '/resources/pain-scale-chart-printable',
    icon: <Scale className="w-5 h-5" />,
    category: 'template',
  },
  {
    title: 'WorkSafeBC Pain Journal Template',
    description: 'Designed for WorkSafeBC documentation requirements.',
    href: '/resources/worksafebc-pain-journal-template',
    icon: <Shield className="w-5 h-5" />,
    category: 'template',
  },
  {
    title: '7-Day Pain Diary Template',
    description: 'One-week format for doctor appointment prep.',
    href: '/resources/7-day-pain-diary-template',
    icon: <Calendar className="w-5 h-5" />,
    category: 'template',
  },
];

const conditionSpecific: ResourceItem[] = [
  {
    title: 'Fibromyalgia Pain Diary',
    description: 'Track widespread pain, fatigue, and fibro-specific symptoms.',
    href: '/resources/fibromyalgia-pain-diary',
    icon: <Heart className="w-5 h-5" />,
    category: 'condition',
  },
  {
    title: 'Chronic Back Pain Diary',
    description: 'Track location, activities, posture, and spine-specific treatments.',
    href: '/resources/chronic-back-pain-diary',
    icon: <FileText className="w-5 h-5" />,
    category: 'condition',
  },
  {
    title: 'Arthritis Pain Tracker',
    description: 'Monitor joint pain, stiffness, swelling, and mobility.',
    href: '/resources/arthritis-pain-tracker',
    icon: <FileText className="w-5 h-5" />,
    category: 'condition',
  },
  {
    title: 'Nerve Pain Symptom Log',
    description: 'Track burning, tingling, numbness for neuropathy conditions.',
    href: '/resources/nerve-pain-symptom-log',
    icon: <Zap className="w-5 h-5" />,
    category: 'condition',
  },
  {
    title: 'Migraine Pain Diary',
    description: 'Track migraine-specific symptoms, triggers, and auras.',
    href: '/resources/migraine-pain-diary-printable',
    icon: <FileText className="w-5 h-5" />,
    category: 'condition',
  },
  {
    title: 'Chronic Pain Diary Template',
    description: 'Long-term tracking with baseline and flare documentation.',
    href: '/resources/chronic-pain-diary-template',
    icon: <FileText className="w-5 h-5" />,
    category: 'condition',
  },
];

const allResources: ResourceItem[] = [
  ...blogArticles,
  ...guides,
  ...templates,
  ...conditionSpecific,
];

const categoryLabels: Record<CategoryFilter, string> = {
  all: 'All',
  blog: 'Blog Articles',
  guide: 'Guides',
  template: 'Templates',
  condition: 'Condition-Specific',
};

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  blog: { bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.25)', text: '#3b82f6' },
  guide: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)', text: '#10b981' },
  template: { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.25)', text: '#a855f7' },
  condition: { bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.25)', text: '#f43e5e' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BlogResourcesPage() {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = allResources.filter(item => {
    const matchesCategory = filter === 'all' || item.category === filter;
    const matchesSearch =
      search.trim() === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-sky-400" />
          Blog & Resources
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Guides, templates, and articles to help you get the most from your pain tracking.
          Resources open within the app; blog articles open on{' '}
          <a
            href={BLOG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:underline inline-flex items-center gap-1"
          >
            blog.paintracker.ca
            <ExternalLink className="h-3 w-3" />
          </a>.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search resources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/40 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40 transition-all"
            aria-label="Search resources"
          />
        </div>

        <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Filter resources by category">
          {(Object.keys(categoryLabels) as CategoryFilter[]).map(key => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === key
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
              }`}
            >
              {categoryLabels[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? 'resource' : 'resources'}
        {filter !== 'all' && ` in ${categoryLabels[filter]}`}
        {search && ` matching "${search}"`}
      </p>

      {/* Resource Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => {
            const colors = categoryColors[item.category];
            const isExternal = item.external;

            const CardContent = (
              <div
                className="group relative flex flex-col h-full rounded-xl p-5 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg cursor-pointer"
                style={{
                  background: 'var(--color-card, rgba(15, 23, 42, 0.6))',
                  border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
                }}
              >
                {/* Category dot + badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="p-2 rounded-lg"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {item.icon}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: colors.text }}
                    >
                      {categoryLabels[item.category as CategoryFilter] ?? item.category}
                    </span>
                  </div>
                  {item.badge && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        background: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-foreground group-hover:text-sky-400 transition-colors mb-1.5 flex items-center gap-1.5">
                  {item.title}
                  {isExternal && <ExternalLink className="h-3 w-3 opacity-40 group-hover:opacity-80 transition-opacity" />}
                </h3>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                  {item.description}
                </p>

                {/* Bottom action hint */}
                <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isExternal ? 'Read on blog' : 'Open resource'}
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            );

            if (isExternal) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block focus:outline-none focus:ring-2 focus:ring-sky-500/50 rounded-xl"
                >
                  {CardContent}
                </a>
              );
            }

            return (
              <a
                key={item.href}
                href={item.href}
                className="block focus:outline-none focus:ring-2 focus:ring-sky-500/50 rounded-xl"
              >
                {CardContent}
              </a>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No matching resources found.</p>
          <button
            onClick={() => { setSearch(''); setFilter('all'); }}
            className="mt-2 text-sky-400 text-xs hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
