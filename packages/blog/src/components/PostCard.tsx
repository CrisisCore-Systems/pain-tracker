import Image from 'next/image';
import Link from 'next/link';
import type { Post } from '@/lib/hashnode';
import { formatDate, formatReadingTime, getTagColor } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

export function PostCard({ post, featured = false }: PostCardProps) {
  return (
    <article
      className={`card overflow-hidden ${
        featured ? 'md:grid md:grid-cols-2 md:gap-6' : 'flex flex-col'
      }`}
    >
      {/* Cover Image */}
      {post.coverImage && (
        <Link
          href={`/blog/${post.slug}`}
          className={`relative block overflow-hidden ${
            featured ? 'aspect-[16/10] md:aspect-auto' : 'aspect-[16/9]'
          }`}
        >
          <Image
            src={post.coverImage.url}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
            priority={featured}
          />
        </Link>
      )}

      {/* Content */}
      <div className={`flex flex-col ${post.coverImage ? 'p-6' : 'p-6'}`}>
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
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

        {/* Title */}
        <h2
          className={`font-bold leading-tight mb-2 ${
            featured ? 'text-2xl md:text-3xl' : 'text-xl'
          }`}
        >
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-primary transition-colors"
          >
            {post.title}
          </Link>
        </h2>

        {/* Brief */}
        <p className="text-muted-foreground mb-4 line-clamp-3 flex-1">
          {post.brief}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {/* Author */}
          <div className="flex items-center gap-2">
            {post.author.profilePicture && (
              <Image
                src={post.author.profilePicture}
                alt={post.author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <span>{post.author.name}</span>
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
      className={`card overflow-hidden animate-pulse ${
        featured ? 'md:grid md:grid-cols-2 md:gap-6' : 'flex flex-col'
      }`}
    >
      {/* Cover Image Skeleton */}
      <div
        className={`bg-muted ${
          featured ? 'aspect-[16/10] md:aspect-auto md:min-h-[300px]' : 'aspect-[16/9]'
        }`}
      />

      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-muted rounded-full" />
          <div className="h-5 w-20 bg-muted rounded-full" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-6 bg-muted rounded w-1/2" />
        </div>

        {/* Brief */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4">
          <div className="h-6 w-6 bg-muted rounded-full" />
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
