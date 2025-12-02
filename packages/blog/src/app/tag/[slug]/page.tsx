import { getPostsByTag } from '@/lib/hashnode';
import { PostCard } from '@/components/PostCard';
import Link from 'next/link';
import type { Metadata } from 'next';

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tagName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `Posts tagged "${tagName}"`,
    description: `Browse all articles tagged with ${tagName}`,
  };
}

// Revalidate every hour
export const revalidate = 3600;

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const posts = await getPostsByTag(slug, 20);
  const tagName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="container-blog py-12">
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
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 text-primary bg-primary/10 px-3 py-1 rounded-full text-sm font-medium mb-4">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          Tag
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{tagName}</h1>
        <p className="text-muted-foreground">
          {posts.length} {posts.length === 1 ? 'article' : 'articles'} with this tag
        </p>
      </header>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No posts found</h2>
          <p className="text-muted-foreground mb-6">
            There are no articles with this tag yet.
          </p>
          <Link href="/" className="btn-primary">
            Browse all articles
          </Link>
        </div>
      )}
    </div>
  );
}
