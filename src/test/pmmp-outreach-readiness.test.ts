import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, '..', '..');

const readUtf8 = (relativePath: string) =>
  fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

describe('PMMP outreach readiness', () => {
  it('publishes a PMMP provider route with explicit no-integration boundaries', () => {
    const providerPage = readUtf8('src/pages/providers/PMMPProviderPage.tsx');
    const appRoutes = readUtf8('src/App.tsx');

    expect(appRoutes).toContain('path="/providers/pmmp"');
    expect(appRoutes).toContain('path="/clinics/pain-and-medication-management"');

    for (const phrase of [
      'No clinic login',
      'No EMR integration',
      'No staff dashboard',
      'No monitoring',
      'No automatic clinic access',
      'not a diagnostic tool',
      'not medical advice',
      'not an official WorkSafeBC form',
      'Provider feedback without patient data access',
    ]) {
      expect(providerPage).toContain(phrase);
    }
  });

  it('routes public clinic URLs to a noindex boundary instead of a portal demo', () => {
    const appRoutes = readUtf8('src/App.tsx');
    const boundaryPage = readUtf8('src/pages/ClinicRouteBoundaryPage.tsx');

    expect(appRoutes).toContain('path="/clinic" element={<ClinicRouteBoundaryPage />}');
    expect(appRoutes).toContain('path="/clinic/*" element={<ClinicRouteBoundaryPage />}');
    expect(appRoutes).not.toContain('ClinicPortal');
    expect(boundaryPage).toContain('noindex,nofollow');
    expect(boundaryPage).toContain('does not provide a public clinic login');
    expect(boundaryPage).toContain('staff dashboards');
    expect(boundaryPage).toContain('automatic access to worker records');
  });

  it('keeps WorkSafeBC public copy away from outcome and evidence guarantees', () => {
    const files = [
      'src/pages/resources/WorkSafeBCPainJournalTemplatePage.tsx',
      'src/pages/resources/ExpansionPackPages4.tsx',
      'src/components/reports/ReportsPage.tsx',
      'src/utils/pain-tracker/wcb-export.ts',
      'docs/user-guide/EXPORT_DATA.md',
      'docs/user-guide/FAQ.md',
      'README.md',
      'src/seo/publicRouteMetadata.js',
    ];
    const combined = files.map(readUtf8).join('\n');

    for (const phrase of [
      'Faster claim resolution',
      'strengthen their documentation',
      'evidence from Day 1',
      'Log all treatments and compliance',
      'Case manager reviews documentation',
      'Medical advisor evaluates records',
      'Share pain journal summaries',
      'supports permanent partial disability ratings',
      'Permanent partial disability rating',
      'ongoing treatment coverage',
      'What WCB Evaluators Actually Look For',
      'weaken otherwise valid claims',
      'directly support modified duty',
      'WCB needs it',
      'reduce or deny benefits for non-compliance',
      'share summaries strategically',
      'justifies modified duties',
      'Hostile bureaucracy',
      'Clinical Documentation Report',
      'Confidential clinical summary',
    ]) {
      expect(combined).not.toContain(phrase);
    }

    expect(combined).toContain('Worker-Provided Summary');
    expect(combined).toContain('WorkSafeBC-related summary');
    expect(combined).toContain('worker-controlled');
  });

  it('does not ship stale FHIR or clinic-integration claims in public branding surfaces', () => {
    const combined = [
      'public/logos/pain-tracker-wordmark.svg',
      'src/components/branding/BrandedLoadingScreen.tsx',
      'src/components/branding/MarketingAssets.tsx',
      'src/components/landing/LandingFooter.tsx',
      'src/components/landing/FeatureShowcase.tsx',
      'src/components/landing/UseCases.tsx',
      'src/components/landing/PricingPreview.tsx',
      'src/config/subscription-tiers.ts',
    ]
      .map(readUtf8)
      .join('\n');

    for (const phrase of [
      'FHIR Compliant',
      'FHIR Compliance',
      'Clinical Integration',
      'Predictive Analytics',
      'healthcare professionals',
      'Clinical PDF Export',
      'WorkSafe BC Reports',
    ]) {
      expect(combined).not.toContain(phrase);
    }
  });

  it('keeps static headers aligned with the strict deployed CSP', () => {
    const headers = readUtf8('public/_headers');

    expect(headers).toContain("connect-src 'self'");
    expect(headers).toContain("script-src 'self' 'wasm-unsafe-eval'");
    expect(headers).not.toContain('googletagmanager.com');
    expect(headers).not.toContain('google-analytics.com');
    expect(headers).not.toContain('static.cloudflareinsights.com');
    expect(headers).not.toContain('api.wcb.gov');
  });
});
