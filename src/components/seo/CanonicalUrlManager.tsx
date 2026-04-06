import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://www.paintracker.ca';

export function toCanonicalUrl(pathname: string): string {
  if (!pathname || pathname === '/') {
    return `${SITE_URL}/`;
  }

  // Ensure we don't end up with double slashes.
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function shouldNoindexRoute(pathname: string, search: string): boolean {
  return pathname === '/resources' && search.trim().length > 0;
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
    const noindexRoute = shouldNoindexRoute(location.pathname, location.search);

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

    for (const name of ['robots', 'googlebot']) {
      let robotsMeta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      const managedByCanonicalManager =
        robotsMeta?.getAttribute('data-managed-by') === 'CanonicalUrlManager';

      if (noindexRoute) {
        if (!robotsMeta) {
          robotsMeta = document.createElement('meta');
          robotsMeta.setAttribute('name', name);
          document.head.appendChild(robotsMeta);
        }

        robotsMeta.setAttribute('content', 'noindex,follow');
        robotsMeta.setAttribute('data-managed-by', 'CanonicalUrlManager');
      } else if (managedByCanonicalManager) {
        robotsMeta?.remove();
      }
    }
  }, [location.pathname, location.search]);

  return null;
}
