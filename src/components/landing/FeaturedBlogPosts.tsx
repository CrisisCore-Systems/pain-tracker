import React from 'react';
import { BookOpen, Clock, ArrowRight, Sparkles } from 'lucide-react';

interface BlogPost {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  readTime: string;
  tag: string;
  tagColor: string;
}

const featuredPosts: BlogPost[] = [
  {
    title: "Building a Pain Tracker That Actually Gets It",
    slug: "building-a-pain-tracker-that-actually-gets-it-no-market-research-required",
    description: "Why lived experience beats market research when building health software. The story behind Pain Tracker Pro.",
    coverImage: "https://cdn.hashnode.com/res/hashnode/image/upload/v1731544846794/c8b1a3f0-1b3e-4f3e-8d1e-5a1234567890.png",
    readTime: "8 min",
    tag: "Origin Story",
    tagColor: "#a855f7"
  },
  {
    title: "Crisis Detection Engine That Never Phones Home",
    slug: "i-built-a-crisis-detection-engine-that-never-phones-home",
    description: "How we detect mental health crises using local AI without sending a single byte to external servers.",
    coverImage: "https://cdn.hashnode.com/res/hashnode/image/upload/v1731544846794/crisis-detection-cover.png",
    readTime: "12 min",
    tag: "Privacy Tech",
    tagColor: "#38bdf8"
  },
  {
    title: "Trauma-Informed Design in Practice",
    slug: "building-software-that-actually-gives-a-damn-my-journey-with-trauma-informed-design",
    description: "What trauma-informed design actually means and how it shapes every pixel of Pain Tracker Pro.",
    coverImage: "https://cdn.hashnode.com/res/hashnode/image/upload/v1731544846794/trauma-informed-cover.png",
    readTime: "10 min",
    tag: "UX Design",
    tagColor: "#34d399"
  }
];

export const FeaturedBlogPosts: React.FC = () => {
  return (
    <section 
      className="landing-always-dark relative py-20 overflow-hidden"
      style={{ background: '#0f172a' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div 
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-6"
            style={{ 
              background: 'rgba(168, 85, 247, 0.15)', 
              border: '1px solid rgba(168, 85, 247, 0.3)' 
            }}
          >
            <Sparkles className="h-4 w-4" style={{ color: '#c084fc' }} />
            <span style={{ color: '#d8b4fe' }}>From Our Blog</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Insights & Stories from the{' '}
            <span className="bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">
              Frontlines
            </span>
          </h2>
          
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Deep dives into privacy-first healthcare tech, trauma-informed design, and building software that actually helps.
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {featuredPosts.map(post => (
            <a
              key={post.slug}
              href={`https://blog.paintracker.ca/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
              style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = post.tagColor + '40';
                e.currentTarget.style.boxShadow = `0 8px 40px ${post.tagColor}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
              }}
            >
              {/* Cover Image Placeholder */}
              <div 
                className="h-48 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${post.tagColor}30 0%, ${post.tagColor}10 100%)`,
                }}
              >
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-30">
                  <div 
                    className="absolute top-4 right-4 w-20 h-20 rounded-full blur-xl"
                    style={{ background: post.tagColor }}
                  />
                  <div 
                    className="absolute bottom-4 left-4 w-16 h-16 rounded-full blur-xl"
                    style={{ background: post.tagColor, opacity: 0.5 }}
                  />
                </div>
                
                {/* Blog icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen 
                    className="h-16 w-16 opacity-20 group-hover:opacity-30 transition-opacity" 
                    style={{ color: post.tagColor }}
                  />
                </div>

                {/* Tag badge */}
                <div 
                  className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ 
                    background: post.tagColor + '20',
                    color: post.tagColor,
                    border: `1px solid ${post.tagColor}40`
                  }}
                >
                  {post.tag}
                </div>

                {/* Read time */}
                <div 
                  className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#94a3b8'
                  }}
                >
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 
                  className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-white transition-colors"
                  style={{ color: '#e2e8f0' }}
                >
                  {post.title}
                </h3>
                
                <p 
                  className="text-sm mb-4 line-clamp-3"
                  style={{ color: '#94a3b8' }}
                >
                  {post.description}
                </p>

                {/* Read more link */}
                <div 
                  className="flex items-center gap-2 text-sm font-medium transition-all group-hover:gap-3"
                  style={{ color: post.tagColor }}
                >
                  <span>Read Article</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <a
            href="https://blog.paintracker.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
            style={{
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              color: '#d8b4fe'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(168, 85, 247, 0.25)';
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
            }}
          >
            <BookOpen className="h-4 w-4" />
            View All Posts
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
