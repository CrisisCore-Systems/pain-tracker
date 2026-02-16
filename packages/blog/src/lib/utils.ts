/**
 * Utility functions for the blog
 */

import { format, formatDistanceToNow, parseISO } from 'date-fns';

function normalizeBlogSiteUrl(raw: string | undefined): string {
  const fallback = 'https://blog.paintracker.ca';
  const trimmed = (raw ?? '').trim();
  if (!trimmed) return fallback;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (url.hostname === 'paintracker.ca' || url.hostname === 'www.paintracker.ca') {
      url.hostname = 'blog.paintracker.ca';
    }
    // Normalize to no trailing slash for consistency.
    return url.toString().replace(/\/$/, '');
  } catch {
    return fallback;
  }
}

/**
 * Format a date string for display
 */
export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'MMMM d, yyyy');
}

/**
 * Format a date as relative time (e.g., "2 days ago")
 */
export function formatRelativeDate(dateString: string): string {
  const date = parseISO(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Generate reading time string
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return 'Less than 1 min read';
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Generate a URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replaceAll(/[^\w\s-]/g, '')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/--+/g, '-')
    .trim();
}

/**
 * Get contrasting text color for a background
 */
export function getContrastColor(hexColor: string): 'white' | 'black' {
  const r = Number.parseInt(hexColor.slice(1, 3), 16);
  const g = Number.parseInt(hexColor.slice(3, 5), 16);
  const b = Number.parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? 'black' : 'white';
}

/**
 * Generate tag colors based on tag name
 */
export function getTagColor(tagName: string): string {
  const colors = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  ];

  // Generate consistent color based on tag name
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = (tagName.codePointAt(i) ?? 0) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Site configuration
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'Pain Tracker',
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    'Insights on chronic pain management, privacy-first health tech, and building empathetic software.',
  url: normalizeBlogSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  author: {
    name: 'CrisisCore Systems',
    twitter: '@crisiscore',
    github: 'https://github.com/CrisisCore-Systems',
  },
  links: {
    app: 'https://www.paintracker.ca/app',
    github: 'https://github.com/CrisisCore-Systems/pain-tracker',
    twitter: 'https://twitter.com/crisiscore',
  },
};
