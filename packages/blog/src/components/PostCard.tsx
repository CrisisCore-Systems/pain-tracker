import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/lib/hashnode';
import { formatDate, formatReadingTime, getTagColor, formatRelativeDate } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  featured?: boolean;
  priority?: boolean;
}

export function PostCard({ post, featured = false, priority = false }: PostCardProps) {
  if (featured) {
    return (
      <article className="group relative" role="article">
        <div className="card card-featured card-interactive overflow-hidden md:grid md:grid-cols-2">
          {/* Cover Image */}
          {post.coverImage && (
            <Link
              href={`/blog/${post.slug}`}
              className="relative block overflow-hidden aspect-[4/3] md:aspect-auto md:min-h-[420px]"
              aria-label={`Read article: ${post.title}`}
            >
              <Image
                src={post.coverImage.url}
                alt=""
                fill
                className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={priority}
              />
              {/* Enhanced gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10 md:bg-gradient-to-r md:from-transparent md:via-black/5 md:to-black/20" />
              
              {/* Mobile title overlay */}
              <div className="absolute inset-0 flex items-end p-6 md:hidden">
                <h2 className="text-2xl font-bold text-white leading-tight drop-shadow-lg line-clamp-3">
                  {post.title}
                </h2>
              </div>

              {/* Featured badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                Featured
              </div>
            </Link>
          )}

          {/* Content */}
          <div className="flex flex-col p-6 md:p-10 lg:p-12">
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {post.tags.slice(0, 3).map((tag) => (
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

            {/* Title - hidden on mobile since shown on image */}
            <h2 className="hidden md:block text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight mb-5">
              <Link
                href={`/blog/${post.slug}`}
                className="hover:text-primary transition-colors duration-300 text-balance"
              >
                {post.title}
              </Link>
            </h2>

            {/* Brief */}
            <p className="text-muted-foreground text-base md:text-lg mb-6 flex-1 line-clamp-3 md:line-clamp-4 leading-relaxed">
              {post.brief}
            </p>

            {/* Author & Meta */}
            <div className="flex items-center justify-between pt-6 border-t border-border/40">
              <div className="flex items-center gap-4">
                {post.author.profilePicture && (
                  <div className="relative">
                    <Image
                      src={post.author.profilePicture}
                      alt={`Profile picture of ${post.author.name}`}
                      width={52}
                      height={52}
                      className="rounded-full ring-2 ring-background shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-success to-emerald-500 border-2 border-card flex items-center justify-center shadow-sm">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-foreground">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                    <span className="text-border">·</span>
                    <span title={`Updated ${formatRelativeDate(post.updatedAt || post.publishedAt)}`}>
                      {formatRelativeDate(post.publishedAt)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Read time badge */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 text-sm font-medium">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatReadingTime(post.readTimeInMinutes)}</span>
              </div>
            </div>

            {/* Read More Link */}
            <Link
              href={`/blog/${post.slug}`}
              className="mt-6 inline-flex items-center gap-2 text-primary font-semibold group/link hover:gap-4 transition-all duration-300"
            >
              Read full article
              <svg 
                className="w-5 h-5 transition-transform duration-300 group-hover/link:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // Regular card
  return (
    <article className="card card-interactive flex flex-col h-full group" role="article">
      {/* Cover Image */}
      {post.coverImage && (
        <Link
          href={`/blog/${post.slug}`}
          className="relative block overflow-hidden aspect-[16/10] rounded-t-2xl"
          aria-label={`Read article: ${post.title}`}
        >
          <Image
            src={post.coverImage.url}
            alt=""
            fill
            className="object-cover transition-all duration-700 ease-out group-hover:scale-[1.06]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Sophisticated hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
          
          {/* Read more on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
            <span className="px-6 py-3 rounded-full bg-white/95 dark:bg-black/80 text-foreground font-semibold text-sm shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 backdrop-blur-sm">
              Read Article →
            </span>
          </div>

          {/* Read time badge */}
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold shadow-lg">
            {formatReadingTime(post.readTimeInMinutes)}
          </div>
        </Link>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 2).map((tag) => (
              <Link
                key={tag.slug}
                href={`/tag/${tag.slug}`}
                className={`tag text-[10px] ${getTagColor(tag.name)}`}
              >
                {tag.name}
              </Link>
            ))}
            {post.tags.length > 2 && (
              <span className="tag text-[10px] bg-muted text-muted-foreground">
                +{post.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h2 className="text-xl font-bold leading-snug mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
          <Link href={`/blog/${post.slug}`} className="text-balance">
            {post.title}
          </Link>
        </h2>

        {/* Brief */}
        <p className="text-muted-foreground text-sm mb-5 flex-1 line-clamp-3 leading-relaxed">
          {post.brief}
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 pt-5 border-t border-border/40">
          {post.author.profilePicture && (
            <Image
              src={post.author.profilePicture}
              alt={`Profile picture of ${post.author.name}`}
              width={40}
              height={40}
              className="rounded-full ring-2 ring-background shadow-md"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">{post.author.name}</p>
            <p className="text-xs text-muted-foreground">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Skeleton loader for PostCard
 */
export function PostCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={`card overflow-hidden ${
        featured ? 'md:grid md:grid-cols-2' : 'flex flex-col'
      }`}
    >
      {/* Cover Image Skeleton */}
      <div
        className={`animate-shimmer ${
          featured ? 'aspect-[4/3] md:aspect-auto md:min-h-[400px]' : 'aspect-[16/10]'
        }`}
      />

      {/* Content Skeleton */}
      <div className={`p-6 ${featured ? 'md:p-10' : ''} space-y-4`}>
        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-6 w-20 animate-shimmer rounded-full" />
          <div className="h-6 w-24 animate-shimmer rounded-full" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className={`h-7 animate-shimmer rounded-lg w-full ${featured ? 'md:h-9' : ''}`} />
          <div className={`h-7 animate-shimmer rounded-lg w-3/4 ${featured ? 'md:h-9' : ''}`} />
        </div>

        {/* Brief */}
        <div className="space-y-2 pt-2">
          <div className="h-4 animate-shimmer rounded w-full" />
          <div className="h-4 animate-shimmer rounded w-full" />
          <div className="h-4 animate-shimmer rounded w-2/3" />
        </div>

        {/* Author */}
        <div className="flex items-center gap-4 pt-6 border-t border-border/50">
          <div className="h-12 w-12 animate-shimmer rounded-full" />
          <div className="space-y-2">
            <div className="h-4 w-32 animate-shimmer rounded" />
            <div className="h-3 w-24 animate-shimmer rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
