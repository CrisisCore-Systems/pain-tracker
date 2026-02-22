'use client';

import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = '' }: Readonly<MarkdownContentProps>) {
  return (
    <div className={`prose-blog ${className}`}>
      <ReactMarkdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function headingIdFromChildren(children: React.ReactNode): string | undefined {
  if (typeof children !== 'string') return undefined;
  return children
    .toLowerCase()
    .replaceAll(/\s+/g, '-')
    .replaceAll(/[^\w-]/g, '');
}

function MarkdownLink({ href, children, ...props }: any) {
  const safeHref = sanitizeHref(href);
  if (!safeHref) {
    return <span {...props}>{children}</span>;
  }

  const isExternalHttp = /^https?:\/\//i.test(safeHref);
  return (
    <a
      href={safeHref}
      target={isExternalHttp ? '_blank' : undefined}
      rel={isExternalHttp ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
      {isExternalHttp && (
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
}

function MarkdownPre({ children, ...props }: any) {
  return (
    <div className="relative group">
      <pre {...props}>{children}</pre>
      <CopyButton code={extractCode(children)} />
    </div>
  );
}

function MarkdownImage({ src, alt, ...props }: any) {
  if (!src) return null;
  return (
    <figure className="my-10">
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
}

function MarkdownBlockquote({ children, ...props }: any) {
  return (
    <blockquote
      className="border-l-4 border-primary bg-gradient-to-r from-primary/8 to-transparent py-4 px-6 my-8 rounded-r-2xl"
      {...props}
    >
      {children}
    </blockquote>
  );
}

function MarkdownTable({ children, ...props }: any) {
  return (
    <div className="overflow-x-auto my-8 rounded-xl border border-border shadow-sm">
      <table className="min-w-full" {...props}>
        {children}
      </table>
    </div>
  );
}

function MarkdownH2({ children, ...props }: any) {
  const id = headingIdFromChildren(children);
  return (
    <h2 id={id} className="scroll-mt-24 group" {...props}>
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="ml-2 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity text-primary"
          aria-label={typeof children === 'string' ? `Link to ${children}` : 'Link to section'}
        >
          #
        </a>
      )}
    </h2>
  );
}

function MarkdownH3({ children, ...props }: any) {
  const id = headingIdFromChildren(children);
  return (
    <h3 id={id} className="scroll-mt-24 group" {...props}>
      {children}
      {id && (
        <a
          href={`#${id}`}
          className="ml-2 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity text-primary"
          aria-label={typeof children === 'string' ? `Link to ${children}` : 'Link to section'}
        >
          #
        </a>
      )}
    </h3>
  );
}

const markdownComponents: Components = {
  a: MarkdownLink,
  pre: MarkdownPre,
  img: MarkdownImage,
  blockquote: MarkdownBlockquote,
  table: MarkdownTable,
  h2: MarkdownH2,
  h3: MarkdownH3,
};

function sanitizeHref(href: string | undefined): string | undefined {
  if (!href) return undefined;

  const trimmed = href.trim();
  if (!trimmed) return undefined;

  // Allow hash and relative URLs.
  if (
    trimmed.startsWith('#') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../')
  ) {
    return trimmed;
  }

  // If a scheme is present, only allow a small set.
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
  if (!hasScheme) return trimmed;

  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:' || protocol === 'tel:') {
      return trimmed;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Copy button for code blocks with visual feedback
 */
function CopyButton(props: Readonly<{ code: string }>) {
  const { code } = props;
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
