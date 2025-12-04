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
    <article className="relative">
      {/* Hero Section with Cover Image */}
      {post.coverImage ? (
        <div className="relative">
          {/* Full-width cover image */}
          <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] min-h-[400px] max-h-[800px] w-full overflow-hidden">
            <Image
              src={post.coverImage.url}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-transparent h-32" />
          </div>
          
          {/* Floating header content */}
          <div className="container-blog relative -mt-48 md:-mt-64 lg:-mt-80 z-10 pb-8 md:pb-12">
            {/* Back Link */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors mb-6 group"
            >
              <svg 
                className="h-4 w-4 transition-transform group-hover:-translate-x-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to articles
            </Link>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-8 text-balance max-w-4xl">
              {post.title}
            </h1>

            {/* Author Card */}
            <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-card/80 backdrop-blur-xl border shadow-xl">
              {post.author.profilePicture && (
                <Image
                  src={post.author.profilePicture}
                  alt={post.author.name}
                  width={56}
                  height={56}
                  className="rounded-full ring-4 ring-primary/20"
                />
              )}
              <div>
                <p className="font-bold text-lg text-foreground">{post.author.name}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <time dateTime={post.publishedAt} className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(post.publishedAt)}
                  </time>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatReadingTime(post.readTimeInMinutes)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Header without cover image */
        <header className="container-blog pt-12 pb-8">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <svg 
              className="h-4 w-4 transition-transform group-hover:-translate-x-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to articles
          </Link>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-8 text-balance">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-4">
              {post.author.profilePicture && (
                <Image
                  src={post.author.profilePicture}
                  alt={post.author.name}
                  width={56}
                  height={56}
                  className="rounded-full ring-4 ring-primary/10"
                />
              )}
              <div>
                <p className="font-bold text-lg text-foreground">{post.author.name}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  <span>•</span>
                  <span>{formatReadingTime(post.readTimeInMinutes)}</span>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Content */}
      <div className="container-blog py-12 md:py-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <MarkdownContent content={post.content.markdown} />
      </div>

      {/* Share Section */}
      <section className="container-blog">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border p-8 md:p-12 mb-16">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Enjoyed this article?</h2>
              <p className="text-muted-foreground">
                Share it with others who might find it helpful.
              </p>
            </div>
            <ShareButtons
              url={`${siteConfig.url}/blog/${post.slug}`}
              title={post.title}
            />
          </div>
        </div>
      </section>

      {/* Author Bio */}
      {post.author.bio && (
        <section className="container-blog mb-16">
          <div className="card p-8 md:p-10 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            
            <div className="relative flex flex-col sm:flex-row items-start gap-6">
              {post.author.profilePicture && (
                <div className="relative">
                  <Image
                    src={post.author.profilePicture}
                    alt={post.author.name}
                    width={100}
                    height={100}
                    className="rounded-2xl ring-4 ring-primary/10 shadow-xl"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-success flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Written by</p>
                <h2 className="text-2xl font-bold mb-3">{post.author.name}</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">{post.author.bio.text}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="container-blog-wide py-16 md:py-20 border-t">
          <div className="container-blog mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Continue <span className="gradient-text">Reading</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              More articles you might enjoy
            </p>
          </div>
          <div className="container-blog-wide">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
              {relatedPosts.map((relatedPost) => (
                <PostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
