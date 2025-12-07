import { getPosts } from '@/lib/hashnode';
import { PostCard } from '@/components/PostCard';
import { NewsletterForm } from '@/components/NewsletterForm';
import { siteConfig } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.url,
  },
};

// Revalidate every hour
export const revalidate = 3600;

export default async function HomePage() {
  const { posts, total } = await getPosts(20);

  // Separate featured post from the rest
  const [featuredPost, ...restPosts] = posts;

  return (
    <div className="relative">
      {/* Hero Section - Full width dramatic */}
      <section className="relative overflow-hidden" aria-labelledby="hero-heading">
        {/* Background decoration */}
        <div className="absolute inset-0 gradient-bg-vibrant opacity-50" aria-hidden="true" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" aria-hidden="true" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} aria-hidden="true" />
        
        <div className="container-blog relative py-20 md:py-28 lg:py-36">
          <div className="max-w-4xl animate-fade-in-up">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 animate-fade-in-down" style={{ animationDelay: '200ms' }}>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" aria-hidden="true" />
              Insights for the chronic pain community
            </div>

            {/* Main headline */}
            <h1 id="hero-heading" className="mb-8">
              <span className="block text-foreground/90">Stories from</span>
              <span className="gradient-text-vibrant">Pain Tracker</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed mb-10" style={{ animationDelay: '400ms' }}>
              Deep dives into chronic pain management, privacy-first health technology, 
              and building software with <em className="text-primary font-medium not-italic">empathy</em>.
            </p>

            {/* Stats or quick info */}
            <div className="flex flex-wrap items-center gap-8 text-sm" style={{ animationDelay: '600ms' }}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-foreground">{total} Articles</p>
                  <p className="text-muted-foreground text-xs">and growing</p>
                </div>
              </div>
              <div className="w-px h-10 bg-border hidden sm:block" aria-hidden="true" />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-foreground">100% Private</p>
                  <p className="text-muted-foreground text-xs">No tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="container-blog-wide py-12 md:py-16" aria-labelledby="featured-heading">
          <div className="flex items-center gap-4 mb-8">
            <h2 id="featured-heading" className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-2 rounded-full">
              Featured
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" aria-hidden="true" />
          </div>
          <PostCard post={featuredPost} featured priority />
        </section>
      )}

      {/* Posts Grid */}
      {restPosts.length > 0 && (
        <section className="container-blog-wide py-12 md:py-20" aria-labelledby="articles-heading">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <h2 id="articles-heading" className="text-3xl md:text-4xl font-bold mb-2">
                Latest <span className="gradient-text">Articles</span>
              </h2>
              <p className="text-muted-foreground">
                Fresh perspectives and insights from our team
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" aria-hidden="true" />
              Updated regularly
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {restPosts.map((post, index) => (
              <div 
                key={post.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {posts.length === 0 && (
        <section className="container-blog text-center py-24 md:py-32" aria-labelledby="empty-heading">
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary/20 animate-bounce-in" style={{ animationDelay: '500ms' }} aria-hidden="true" />
          </div>
          <h2 id="empty-heading" className="text-3xl font-bold mb-4">No posts yet</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            We&apos;re working on some great content. Check back soon for articles on chronic pain management and health tech.
          </p>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="container-blog py-16 md:py-24" aria-labelledby="newsletter-heading">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border p-8 md:p-12 lg:p-16">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" aria-hidden="true" />
          
          <div className="relative max-w-2xl">
            <h2 id="newsletter-heading" className="text-2xl md:text-3xl font-bold mb-4">
              Stay in the loop
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Get notified when we publish new articles about pain management, 
              privacy-first health tech, and building software with empathy.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* Posts Count */}
      {total > 0 && (
        <div className="container-blog pb-16 text-center">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-bold text-foreground">{posts.length}</span> of{' '}
            <span className="font-bold text-foreground">{total}</span> articles
          </p>
        </div>
      )}
    </div>
  );
}
