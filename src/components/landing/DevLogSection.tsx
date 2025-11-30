import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

interface BlogPost {
  title: string;
  href: string;
  summary: string;
}

const posts: BlogPost[] = [
  {
    title: "Trauma-Informed Design: How It Knows You're Struggling Without Spying",
    href: 'https://paintracker.hashnode.dev/trauma-informed-design-left-everyone-asking-how-does-it-know-im-struggling-without-spying',
    summary:
      "How I'm baking empathy and privacy into PainTracker's core instead of bolting it on.",
  },
  {
    title: 'Building Software That Actually Gives a Damn',
    href: 'https://paintracker.hashnode.dev/building-software-that-actually-gives-a-damn',
    summary:
      "Why I'm building this app from my own collapse, not a comfy office.",
  },
  {
    title: 'Building a Healthcare PWA That Works on the Worst Days',
    href: 'https://paintracker.hashnode.dev/building-a-healthcare-pwa-that-actually-works-when-it-matters',
    summary:
      'Offline-first, brain-fog-friendly design decisions under the hood.',
  },
];

export const DevLogSection: React.FC = () => {
  return (
    <section
      id="dev-log"
      className="bg-gradient-to-b from-background to-muted/30"
      aria-labelledby="dev-log-heading"
    >
      <div className="container mx-auto px-4 py-16 md:py-20">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs sm:text-sm font-medium text-primary mb-4">
            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Dev Blog</span>
          </div>
          <h2
            id="dev-log-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3"
          >
            From the Dev Log
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Stories and breakdowns from building PainTracker in the real world.
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {posts.map((post) => (
            <a
              key={post.href}
              href={post.href}
              className="group block rounded-xl border border-border/50 bg-card p-5 sm:p-6 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={`Read: ${post.title}`}
            >
              <h3 className="text-base sm:text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {post.summary}
              </p>
              <span className="inline-flex items-center gap-1 mt-4 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Read more <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </a>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <a
            href="https://paintracker.hashnode.dev"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1"
            aria-label="View all blog posts on Hashnode"
          >
            View all posts
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
