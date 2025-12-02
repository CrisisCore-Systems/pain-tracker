import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPostBySlug, getAllPostSlugs, getRelatedPosts } from '@/lib/hashnode';
import { MarkdownContent } from '@/components/MarkdownContent';
import { PostCard } from '@/components/PostCard';
import { formatDate, formatReadingTime, getTagColor, siteConfig } from '@/lib/utils';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static paths for all posts
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata for each post
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const ogImage = post.ogMetaData?.image || post.coverImage?.url;

  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.brief,
    openGraph: {
      title: post.seo?.title || post.title,
      description: post.seo?.description || post.brief,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo?.title || post.title,
      description: post.seo?.description || post.brief,
      images: ogImage ? [ogImage] : [],
    },
  };
}

// Revalidate every hour
export const revalidate = 3600;

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get related posts
  const relatedPosts = await getRelatedPosts(slug, post.tags);

  return (
    <article className="container-blog py-12">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to blog
      </Link>

      {/* Header */}
      <header className="mb-8">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/tag/${tag.slug}`}
                className={`tag ${getTagColor(tag.name)}`}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
          {/* Author */}
          <div className="flex items-center gap-2">
            {post.author.profilePicture && (
              <Image
                src={post.author.profilePicture}
                alt={post.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-foreground">{post.author.name}</p>
            </div>
          </div>

          {/* Separator */}
          <span aria-hidden="true">•</span>

          {/* Date */}
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>

          {/* Separator */}
          <span aria-hidden="true">•</span>

          {/* Read Time */}
          <span>{formatReadingTime(post.readTimeInMinutes)}</span>
        </div>
      </header>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="relative aspect-[2/1] mb-8 rounded-lg overflow-hidden">
          <Image
            src={post.coverImage.url}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
          />
        </div>
      )}

      {/* Content */}
      <div className="mb-12">
        <MarkdownContent content={post.content.markdown} />
      </div>

      {/* Share Section */}
      <section className="border-t border-b py-6 mb-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-medium">Share this article</p>
          <div className="flex gap-2">
            <ShareButton
              platform="twitter"
              url={`${siteConfig.url}/blog/${post.slug}`}
              title={post.title}
            />
            <ShareButton
              platform="linkedin"
              url={`${siteConfig.url}/blog/${post.slug}`}
              title={post.title}
            />
            <ShareButton
              platform="copy"
              url={`${siteConfig.url}/blog/${post.slug}`}
              title={post.title}
            />
          </div>
        </div>
      </section>

      {/* Author Bio */}
      {post.author.bio && (
        <section className="bg-muted/50 rounded-lg p-6 mb-12">
          <div className="flex items-start gap-4">
            {post.author.profilePicture && (
              <Image
                src={post.author.profilePicture}
                alt={post.author.name}
                width={64}
                height={64}
                className="rounded-full"
              />
            )}
            <div>
              <h2 className="font-bold mb-1">Written by {post.author.name}</h2>
              <p className="text-muted-foreground">{post.author.bio.text}</p>
            </div>
          </div>
        </section>
      )}

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <PostCard key={relatedPost.id} post={relatedPost} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

/**
 * Share button component
 */
function ShareButton({
  platform,
  url,
  title,
}: {
  platform: 'twitter' | 'linkedin' | 'copy';
  url: string;
  title: string;
}) {
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    copy: url,
  };

  const icons = {
    twitter: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
    linkedin: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    copy: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    ),
  };

  const labels = {
    twitter: 'Share on Twitter',
    linkedin: 'Share on LinkedIn',
    copy: 'Copy link',
  };

  if (platform === 'copy') {
    return (
      <button
        onClick={() => navigator.clipboard.writeText(url)}
        className="btn-outline p-2"
        aria-label={labels[platform]}
      >
        {icons[platform]}
      </button>
    );
  }

  return (
    <a
      href={shareUrls[platform]}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-outline p-2"
      aria-label={labels[platform]}
    >
      {icons[platform]}
    </a>
  );
}
