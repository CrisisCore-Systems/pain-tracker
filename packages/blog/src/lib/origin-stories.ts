/**
 * Origin Stories - Foundational posts about why PainTracker exists
 * 
 * These posts are the "why" behind the project and should be featured
 * prominently in About pages, onboarding, and marketing.
 */

export interface OriginStory {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  publishedAt: string;
  isPinned: boolean;
}

export const originStories: OriginStory[] = [
  {
    slug: 'spire-0033',
    title: "When I Was 33, Everything I'd Been Standing On Just... Disappeared",
    subtitle: "That was the year my wife left and took what I thought was home with her.",
    excerpt: "Anything another person can take away with a single decision was never really yours to begin with. If I wanted something that would survive breakups and evictions and caseworkers who lose your file, I'd have to build it myself.",
    publishedAt: '2025-12-06',
    isPinned: true,
  },
];

export const featuredOriginStory = originStories.find(s => s.isPinned) || originStories[0];
