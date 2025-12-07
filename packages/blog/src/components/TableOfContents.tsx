'use client';

import { useEffect, useState, useCallback } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  /** The markdown content to extract headings from */
  content: string;
  /** Minimum heading level to include (default: 2) */
  minLevel?: number;
  /** Maximum heading level to include (default: 3) */
  maxLevel?: number;
}

export function TableOfContents({
  content,
  minLevel = 2,
  maxLevel = 3,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);

  // Extract headings from markdown content
  useEffect(() => {
    const headingRegex = /^(#{2,6})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      if (level >= minLevel && level <= maxLevel) {
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');
        items.push({ id, text, level });
      }
    }

    setTocItems(items);
  }, [content, minLevel, maxLevel]);

  // Track active heading
  const handleScroll = useCallback(() => {
    const headings = tocItems.map(item => document.getElementById(item.id));
    const scrollPosition = window.scrollY + 150; // Offset for sticky header

    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      if (heading && heading.offsetTop <= scrollPosition) {
        setActiveId(tocItems[i].id);
        return;
      }
    }
    setActiveId('');
  }, [tocItems]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Don't render if there are fewer than 3 headings
  if (tocItems.length < 3) return null;

  return (
    <nav
      className="hidden xl:block fixed right-8 top-32 w-64 max-h-[calc(100vh-200px)] overflow-y-auto"
      aria-label="Table of contents"
    >
      <div className="p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 hover:text-foreground transition-colors"
          aria-expanded={isExpanded}
        >
          <span>On this page</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <ul className="space-y-1">
            {tocItems.map((item) => (
              <li
                key={item.id}
                style={{ paddingLeft: `${(item.level - minLevel) * 12}px` }}
              >
                <a
                  href={`#${item.id}`}
                  className={`block py-1.5 text-sm transition-all duration-200 border-l-2 pl-3 ${
                    activeId === item.id
                      ? 'text-primary border-primary font-medium'
                      : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(item.id);
                    if (element) {
                      const y = element.getBoundingClientRect().top + window.scrollY - 100;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  );
}
