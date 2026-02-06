import type { MetadataRoute } from 'next';
import { getPosts } from '@/lib/hashnode';
import { articles } from '@/data/articles';

const BLOG_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.paintracker.ca';

/**
 * Dynamic sitemap for blog.paintracker.ca
 *
 * Generates entries for:
 *  - Homepage (/)
 *  - About page (/about)
 *  - Feature pages (/features/*)
 *  - Use-case pages (/use-cases/*)
 *  - Trust pages (/privacy, /security)
 *  - SEO content pages (30 articles at /slug)
 *  - All published blog posts (/blog/<slug>)
 *
 * Revalidated at build time + ISR (same cadence as pages).
 */

/* ── Feature & use-case slugs (from prior SSR expansion) ── */
const featureSlugs = [
  'offline-first',
  'encrypted-storage',
  'clinical-exports',
  'worksafebc',
  'pain-analytics',
  'accessibility',
];
const useCaseSlugs = [
  'chronic-pain-management',
  'worksafebc-claims',
  'clinical-documentation',
  'personal-tracking',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  /* ── Core static pages ── */
  const staticPages: MetadataRoute.Sitemap = [
    { url: BLOG_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BLOG_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BLOG_URL}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BLOG_URL}/security`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  /* ── Feature detail pages ── */
  const featureEntries: MetadataRoute.Sitemap = featureSlugs.map((slug) => ({
    url: `${BLOG_URL}/features/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  /* ── Use-case detail pages ── */
  const useCaseEntries: MetadataRoute.Sitemap = useCaseSlugs.map((slug) => ({
    url: `${BLOG_URL}/use-cases/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  /* ── SEO content articles (30 pages) ── */
  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BLOG_URL}/${a.slug}`,
    lastModified: now,
    changeFrequency: (a.isPillar ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
    priority: a.isPillar ? 0.9 : 0.7,
  }));

  /* ── Blog posts from Hashnode CMS ── */
  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const { posts } = await getPosts(50);
    postEntries = posts.map((post) => ({
      url: `${BLOG_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt
        ? new Date(post.updatedAt)
        : new Date(post.publishedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    // Fail gracefully — static pages still get indexed
    console.error('Sitemap: failed to fetch blog posts:', error);
  }

  return [
    ...staticPages,
    ...featureEntries,
    ...useCaseEntries,
    ...articleEntries,
    ...postEntries,
  ];
}
