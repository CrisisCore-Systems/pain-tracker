import { getPosts } from '@/lib/hashnode';
import { PostCard } from '@/components/PostCard';
import { siteConfig } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: siteConfig.description,
};

// Revalidate every hour
export const revalidate = 3600;

export default async function HomePage() {
  const { posts, total } = await getPosts(20);

  // Separate featured post from the rest
  const [featuredPost, ...restPosts] = posts;

  return (
    <div className="container-blog py-12">
      {/* Hero Section */}
      <section className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">Pain Tracker</span> Blog
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Insights on chronic pain management, privacy-first health technology, 
          and building software with empathy.
        </p>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="mb-12">
          <h2 className="sr-only">Featured Post</h2>
          <PostCard post={featuredPost} featured />
        </section>
      )}

      {/* Posts Grid */}
      {restPosts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {posts.length === 0 && (
        <section className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No posts yet</h2>
          <p className="text-muted-foreground">
            Check back soon for new articles on chronic pain management and health tech.
          </p>
        </section>
      )}

      {/* Posts Count */}
      {total > 0 && (
        <p className="text-sm text-muted-foreground mt-8 text-center">
          Showing {posts.length} of {total} articles
        </p>
      )}
    </div>
  );
}
