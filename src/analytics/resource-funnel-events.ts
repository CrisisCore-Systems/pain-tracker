import { trackGA4EventName } from './ga4-events';

export type ResourcePageType = 'general' | 'printable' | 'doctor' | 'claims';

export interface ResourceFunnelEventContext {
  resourcePageSlug: string;
  resourcePageType: ResourcePageType;
  resourceCtaLocation: string;
  routeTarget?: string;
}

const RESOURCE_PREFIX = '/resources';

export function inferResourcePageType(slug: string): ResourcePageType {
  if (/worksafebc|disability|claim|injury|functioning|benefits/i.test(slug)) {
    return 'claims';
  }

  if (/doctor|appointment|specialist|share-pain-records/i.test(slug)) {
    return 'doctor';
  }

  if (/printable|template|pdf|diary|journal|tracker/i.test(slug)) {
    return 'printable';
  }

  return 'general';
}

export function getResourcePageSlugFromPath(pathname?: string | null): string | null {
  if (!pathname || typeof pathname !== 'string') return null;
  if (!pathname.startsWith(RESOURCE_PREFIX)) {
    return null;
  }

  const normalizedPath = pathname.replace(/\/+$/, '');
  const slug = normalizedPath.slice(RESOURCE_PREFIX.length).replace(/^\//, '');

  return slug || 'index';
}

export function resolveResourcePageSlug(explicitSlug?: string): string | null {
  if (explicitSlug) {
    return explicitSlug;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  return getResourcePageSlugFromPath(window.location.pathname);
}

export function resolveResourcePageType(
  explicitType?: ResourcePageType,
  slug?: string | null,
): ResourcePageType | null {
  if (explicitType) {
    return explicitType;
  }

  if (!slug) {
    return null;
  }

  return inferResourcePageType(slug);
}

export function trackResourceStartTrackingFreeClick({
  resourcePageSlug,
  resourcePageType,
  resourceCtaLocation,
  routeTarget = '/start',
}: ResourceFunnelEventContext): void {
  trackGA4EventName('resource_start_tracking_free_click', {
    resource_page_slug: resourcePageSlug,
    resource_page_type: resourcePageType,
    resource_cta_location: resourceCtaLocation,
    route_target: routeTarget,
  });
}

export function trackResourcePrintableDownloadClick({
  resourcePageSlug,
  resourcePageType,
  resourceCtaLocation,
  routeTarget,
}: ResourceFunnelEventContext): void {
  trackGA4EventName('resource_printable_download_click', {
    resource_page_slug: resourcePageSlug,
    resource_page_type: resourcePageType,
    resource_cta_location: resourceCtaLocation,
    route_target: routeTarget,
  });
}