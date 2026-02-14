import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://www.paintracker.ca';

function toCanonicalUrl(pathname: string): string {
  if (!pathname || pathname === '/') {
    return `${SITE_URL}/`;
  }

  // Ensure we don't end up with double slashes.
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${SITE_URL}${normalizedPath}`;
}

/**
 * Keeps canonical + OG URL deterministic across SPA route changes.
 *
 * Important: this enforces the canonical host (`www.paintracker.ca`) so we don't
 * emit mixed hostnames across SPA navigation.
 */
export function CanonicalUrlManager() {
  const location = useLocation();

  useEffect(() => {
    const canonicalUrl = toCanonicalUrl(location.pathname);

    let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', canonicalUrl);
    }

    const twitterUrl = document.querySelector<HTMLMetaElement>('meta[name="twitter:url"]');
    if (twitterUrl) {
      twitterUrl.setAttribute('content', canonicalUrl);
    }
  }, [location.pathname]);

  return null;
}
