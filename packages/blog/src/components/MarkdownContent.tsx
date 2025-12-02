'use client';

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
                    className="inline-block ml-1 h-3 w-3"
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

          // Custom image handling
          img: ({ src, alt, ...props }) => {
            if (!src) return null;
            return (
              <figure className="my-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt || ''}
                  className="rounded-lg shadow-md mx-auto"
                  loading="lazy"
                  {...props}
                />
                {alt && (
                  <figcaption className="text-center text-sm text-muted-foreground mt-2">
                    {alt}
                  </figcaption>
                )}
              </figure>
            );
          },

          // Custom blockquote styling
          blockquote: ({ children, ...props }) => {
            return (
              <blockquote
                className="border-l-4 border-primary bg-primary/5 py-2 px-4 my-6"
                {...props}
              >
                {children}
              </blockquote>
            );
          },

          // Custom table styling
          table: ({ children, ...props }) => {
            return (
              <div className="overflow-x-auto my-6">
                <table className="min-w-full" {...props}>
                  {children}
                </table>
              </div>
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
 * Copy button for code blocks
 */
function CopyButton({ code }: { code: string }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-2 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Copy code to clipboard"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
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
