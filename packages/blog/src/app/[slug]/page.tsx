import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/utils';
import {
  articleJsonLd,
  webPageJsonLd,
  howToJsonLd,
  faqPageJsonLd,
  breadcrumbJsonLd,
} from '@/lib/schema';
import { articles, getArticleBySlug, APP_CTA_URL } from '@/data/articles';
import type { ArticleData } from '@/data/articles';

// ── Static params for all 30 SEO pages ──────────────────────────────

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

// ── Metadata ─────────────────────────────────────────────────────────

type Props = { params: Promise<{ slug: string }> };

function safeJsonLdStringify(value: unknown): string {
  const json = JSON.stringify(value) ?? 'null';
  return json
    .replaceAll('<', String.raw`\u003c`)
    .replaceAll('\u2028', String.raw`\u2028`)
    .replaceAll('\u2029', String.raw`\u2029`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      url: `${siteConfig.url}/${slug}`,
      type: 'article',
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
    alternates: {
      canonical: `${siteConfig.url}/${slug}`,
    },
  };
}

// ── JSON-LD builder ──────────────────────────────────────────────────

function buildSchemas(article: ArticleData) {
  const url = `${siteConfig.url}/${article.slug}`;
  const schemas: Record<string, unknown>[] = [];

  // Primary schema
  if (article.schemaTypes.includes('Article')) {
    schemas.push(articleJsonLd({ title: article.h1, description: article.description, url }));
  }
  if (article.schemaTypes.includes('WebPage')) {
    schemas.push(webPageJsonLd({ title: article.h1, description: article.description, url }));
  }
  if (article.schemaTypes.includes('HowTo') && article.howToSteps) {
    schemas.push(
      howToJsonLd({
        title: article.h1,
        description: article.description,
        steps: article.howToSteps,
      }),
    );
  }

  // FAQ overlay
  if (article.schemaTypes.includes('FAQPage') && article.faqs?.length) {
    schemas.push(faqPageJsonLd(article.faqs));
  }

  // Breadcrumb
  schemas.push(
    breadcrumbJsonLd([
      { name: 'Home', url: siteConfig.url },
      { name: article.h1, url },
    ]),
  );

  return schemas;
}

// ── Cluster labels for breadcrumb UI ─────────────────────────────────

const clusterLabels: Record<string, string> = {
  pillar: 'Guides',
  privacy: 'Privacy',
  clinical: 'Clinical Documentation',
  chronic: 'Chronic Conditions',
  comparison: 'Comparisons',
  transparency: 'Transparency',
  utility: 'Resources',
};

// ── Related articles helper ──────────────────────────────────────────

function getRelated(article: ArticleData): ArticleData[] {
  return articles
    .filter((a) => a.slug !== article.slug && a.cluster === article.cluster)
    .slice(0, 3);
}

// ── Page component ───────────────────────────────────────────────────

export default async function ArticlePage({ params }: Readonly<Props>) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const schemas = buildSchemas(article);
  const related = getRelated(article);

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(schemas) }}
      />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-700 dark:text-gray-200">
              {clusterLabels[article.cluster] ?? article.cluster}
            </li>
          </ol>
        </nav>

        {/* Pillar badge */}
        {article.isPillar && (
          <span className="mb-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Pillar Guide
          </span>
        )}

        {/* H1 */}
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
          {article.h1}
        </h1>

        {/* Intro / meta description as lead */}
        <p className="mb-10 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
          {article.description}
        </p>

        {article.resourceLinks && article.resourceLinks.length > 0 && (
          <aside className="mb-10 rounded-xl border border-emerald-100 bg-emerald-50/70 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Helpful printables and next steps
            </h2>
            <ul className="mt-4 space-y-3">
              {article.resourceLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-medium text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-800 hover:decoration-blue-500 dark:text-blue-400 dark:decoration-blue-600 dark:hover:text-blue-300"
                  >
                    {link.title}
                  </a>
                  {link.description && (
                    <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      {link.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* Sections with mid-article contextual linking */}
        {article.sections.map((section, sectionIndex) => (
          <section key={section.h2} className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">
              {section.h2}
            </h2>
            {section.paragraphs.map((p, paragraphIndex) => (
              <p
                key={`${sectionIndex}-${paragraphIndex}`}
                className="mb-4 leading-relaxed text-gray-600 dark:text-gray-300"
              >
                {p}
              </p>
            ))}

            {/* Contextual pillar link — injected after the 2nd section (mid-article) */}
            {sectionIndex === 1 && article.internalLinks && (
              <aside className="my-6 rounded-lg border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-800/50 dark:bg-blue-900/20">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  <span className="mr-1.5 inline-block text-blue-600 dark:text-blue-400" aria-hidden="true">→</span>
                  Learn more in our comprehensive guide:{' '}
                  <a
                    href={article.internalLinks.pillarUrl}
                    className="font-medium text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-800 hover:decoration-blue-500 dark:text-blue-400 dark:decoration-blue-600 dark:hover:text-blue-300"
                  >
                    {article.internalLinks.pillarLabel}
                  </a>
                </p>
              </aside>
            )}

            {/* Related article link — injected after the 4th section (or last if fewer) */}
            {sectionIndex === Math.min(3, article.sections.length - 1) && article.internalLinks && (
              <aside className="my-6 rounded-lg border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-700/50 dark:bg-gray-800/30">
                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  <span className="mr-1.5 inline-block text-gray-500 dark:text-gray-400" aria-hidden="true">📖</span>
                  Related reading:{' '}
                  <Link
                    href={`/${article.internalLinks.relatedSlug}`}
                    className="font-medium text-blue-600 underline decoration-blue-300 underline-offset-2 hover:text-blue-800 hover:decoration-blue-500 dark:text-blue-400 dark:decoration-blue-600 dark:hover:text-blue-300"
                  >
                    {articles.find(a => a.slug === article.internalLinks!.relatedSlug)?.title ?? article.internalLinks.relatedSlug}
                  </Link>
                </p>
              </aside>
            )}
          </section>
        ))}

        {/* FAQ section (visible + schema) */}
        {article.faqs && article.faqs.length > 0 && (
          <section className="mb-10 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800/50">
            <h2 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Frequently Asked Questions
            </h2>
            <dl className="space-y-6">
              {article.faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="mb-1 font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </dt>
                  <dd className="text-gray-600 dark:text-gray-300">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* CTA — links to root domain for authority transfer */}
        <div className="mb-12 rounded-lg border border-blue-200 bg-blue-50 p-6 text-center dark:border-blue-800 dark:bg-blue-900/30">
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Ready to start tracking?
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            PainTracker is free, private, and works offline. No account required.
          </p>
          <a
            href={APP_CTA_URL}
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Open PainTracker
          </a>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">
              Related reading
            </h2>
            <ul className="space-y-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/${r.slug}`}
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
