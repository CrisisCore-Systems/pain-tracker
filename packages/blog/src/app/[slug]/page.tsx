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
import { articles, getArticleBySlug } from '@/data/articles';
import type { ArticleData } from '@/data/articles';

// ── Static params for all 30 SEO pages ──────────────────────────────

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

// ── Metadata ─────────────────────────────────────────────────────────

type Props = { params: Promise<{ slug: string }> };

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

export default async function ArticlePage({ params }: Props) {
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
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

        {/* Sections */}
        {article.sections.map((section) => (
          <section key={section.h2} className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">
              {section.h2}
            </h2>
            {section.paragraphs.map((p, i) => (
              <p
                key={i}
                className="mb-4 leading-relaxed text-gray-600 dark:text-gray-300"
              >
                {p}
              </p>
            ))}
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

        {/* CTA */}
        <div className="mb-12 rounded-lg border border-blue-200 bg-blue-50 p-6 text-center dark:border-blue-800 dark:bg-blue-900/30">
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Ready to start tracking?
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            PainTracker is free, private, and works offline. No account required.
          </p>
          <Link
            href="/app"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Open PainTracker
          </Link>
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
