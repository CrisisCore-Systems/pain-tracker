import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPostBySlug, getAllPostSlugs, getRelatedPosts } from '@/lib/hashnode';
import { MarkdownContent } from '@/components/MarkdownContent';
import { PostCard } from '@/components/PostCard';
import { ShareButtons } from '@/components/ShareButtons';
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
          <ShareButtons
            url={`${siteConfig.url}/blog/${post.slug}`}
            title={post.title}
          />
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
