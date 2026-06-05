import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import {
  getResourcePageSlugFromPath,
  inferResourcePageType,
  resolveResourcePageSlug,
  resolveResourcePageType,
  trackResourcePrintableDownloadClick,
  trackResourceStartTrackingFreeClick,
} from './resource-funnel-events';

const CONSENT_KEY = 'pain-tracker:analytics-consent';

describe('resource funnel analytics helpers', () => {
  let originalGtag: typeof window.gtag;
  let originalEnableAnalytics: string | undefined;
  let mockGtag: Mock<(...args: unknown[]) => void>;

  beforeEach(() => {
    originalEnableAnalytics = process.env.VITE_ENABLE_ANALYTICS;
    process.env.VITE_ENABLE_ANALYTICS = 'true';
    localStorage.setItem(CONSENT_KEY, 'granted');

    originalGtag = window.gtag;
    mockGtag = vi.fn<(...args: unknown[]) => void>();
    window.gtag = mockGtag as (...args: unknown[]) => void;
  });

  afterEach(() => {
    window.gtag = originalGtag;
    localStorage.removeItem(CONSENT_KEY);
    if (originalEnableAnalytics === undefined) {
      delete process.env.VITE_ENABLE_ANALYTICS;
    } else {
      process.env.VITE_ENABLE_ANALYTICS = originalEnableAnalytics;
    }
    window.history.replaceState({}, '', '/');
  });

  it('infers resource page type from the slug', () => {
    expect(inferResourcePageType('monthly-pain-tracker-printable')).toBe('printable');
    expect(inferResourcePageType('how-to-track-pain-for-doctors')).toBe('doctor');
    expect(inferResourcePageType('pain-journal-for-disability-benefits')).toBe('claims');
    expect(inferResourcePageType('resources-index')).toBe('general');
  });

  it('extracts the resource page slug from a resource path', () => {
    expect(getResourcePageSlugFromPath('/resources/monthly-pain-tracker-printable')).toBe('monthly-pain-tracker-printable');
    expect(getResourcePageSlugFromPath('/resources')).toBe('index');
    expect(getResourcePageSlugFromPath('/download')).toBeNull();
  });

  it('resolves resource page context from the current window path', () => {
    window.history.pushState({}, '', '/resources/how-to-track-pain-for-doctors');

    const slug = resolveResourcePageSlug();

    expect(slug).toBe('how-to-track-pain-for-doctors');
    expect(resolveResourcePageType(undefined, slug)).toBe('doctor');
  });

  it('tracks the standardized start tracking free event with coarse metadata only', () => {
    trackResourceStartTrackingFreeClick({
      resourcePageSlug: 'how-to-track-pain-for-doctors',
      resourcePageType: 'doctor',
      resourceCtaLocation: 'hero_secondary_start_free',
    });

    expect(mockGtag).toHaveBeenCalledWith(
      'event',
      'resource_start_tracking_free_click',
      expect.objectContaining({
        resource_page_slug: 'how-to-track-pain-for-doctors',
        resource_page_type: 'doctor',
        resource_cta_location: 'hero_secondary_start_free',
        route_target: '/start',
      }),
    );
  });

  it('tracks printable download clicks with route target metadata', () => {
    trackResourcePrintableDownloadClick({
      resourcePageSlug: 'monthly-pain-tracker-printable',
      resourcePageType: 'printable',
      resourceCtaLocation: 'hero_primary_download',
      routeTarget: '/assets/monthly-pain-tracker.pdf',
    });

    expect(mockGtag).toHaveBeenCalledWith(
      'event',
      'resource_printable_download_click',
      expect.objectContaining({
        resource_page_slug: 'monthly-pain-tracker-printable',
        resource_page_type: 'printable',
        resource_cta_location: 'hero_primary_download',
        route_target: '/assets/monthly-pain-tracker.pdf',
      }),
    );
  });
});
