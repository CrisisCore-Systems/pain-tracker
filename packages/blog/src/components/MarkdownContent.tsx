'use client';

import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div className={`prose-blog ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          // Custom link handling for external links
          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
                {isExternal && (
                  <svg
                    className="inline-block ml-1 h-3 w-3 opacity-60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                )}
              </a>
            );
          },

          // Add copy button to code blocks
          pre: ({ children, ...props }) => {
            return (
              <div className="relative group">
                <pre {...props}>{children}</pre>
                <CopyButton code={extractCode(children)} />
              </div>
            );
          },

          // Custom image handling with lightbox potential
          img: ({ src, alt, ...props }) => {
            if (!src) return null;
            return (
              <figure className="my-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt || ''}
                  className="rounded-2xl shadow-xl mx-auto transition-transform duration-300 hover:scale-[1.02] cursor-zoom-in"
                  loading="lazy"
                  {...props}
                />
                {alt && (
                  <figcaption className="text-center text-sm text-muted-foreground mt-4 italic">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          },

          // Enhanced blockquote styling
          blockquote: ({ children, ...props }) => {
            return (
              <blockquote
                className="border-l-4 border-primary bg-gradient-to-r from-primary/8 to-transparent py-4 px-6 my-8 rounded-r-2xl"
                {...props}
              >
                {children}
              </blockquote>
            );
          },

          // Custom table styling with horizontal scroll
          table: ({ children, ...props }) => {
            return (
              <div className="overflow-x-auto my-8 rounded-xl border border-border shadow-sm">
                <table className="min-w-full" {...props}>
                  {children}
                </table>
              </div>
            );
          },

          // Enhanced heading with anchor links
          h2: ({ children, ...props }) => {
            const id = typeof children === 'string' 
              ? children.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
              : undefined;
            return (
              <h2 id={id} className="scroll-mt-24 group" {...props}>
                {children}
                {id && (
                  <a 
                    href={`#${id}`} 
                    className="ml-2 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity text-primary"
                    aria-label={`Link to ${children}`}
                  >
                    #
                  </a>
                )}
              </h2>
            );
          },

          h3: ({ children, ...props }) => {
            const id = typeof children === 'string' 
              ? children.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
              : undefined;
            return (
              <h3 id={id} className="scroll-mt-24 group" {...props}>
                {children}
                {id && (
                  <a 
                    href={`#${id}`} 
                    className="ml-2 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity text-primary"
                    aria-label={`Link to ${children}`}
                  >
                    #
                  </a>
                )}
              </h3>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/**
 * Copy button for code blocks with visual feedback
 */
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className={`absolute top-3 right-3 p-2.5 rounded-lg transition-all duration-200 ${
        copied 
          ? 'bg-success text-white' 
          : 'bg-slate-700/80 hover:bg-slate-600 text-slate-300 opacity-0 group-hover:opacity-100'
      }`}
      aria-label={copied ? 'Copied!' : 'Copy code to clipboard'}
    >
      {copied ? (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  );
}

/**
 * Extract text content from React children
 */
function extractCode(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) {
    return children.map(extractCode).join('');
  }
  if (children && typeof children === 'object' && 'props' in children) {
    return extractCode((children as React.ReactElement).props.children);
  }
  return '';
}
