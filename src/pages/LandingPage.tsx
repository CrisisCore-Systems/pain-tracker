import React, { useEffect } from 'react';
import '../styles/pages/landing.css';
import {
  Hero,
  UseCases,
  BenefitsGrid,
  PricingPreview,
  TrustIndicators,
  FeatureShowcase,
  Testimonials,
  WorkSafeBCCaseStudy,
  FeaturedBlogPosts,
  FAQ as Faq,
  LandingFooter,
} from '../components/landing';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateSoftwareApplicationSchema,
  combineSchemas,
} from '../lib/seo';

export const LandingPage: React.FC = () => {
  // Generate structured data for homepage
  const organizationSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();
  const softwareSchema = generateSoftwareApplicationSchema();
  const combinedSchema = combineSchemas(organizationSchema, webSiteSchema, softwareSchema);

  useEffect(() => {
    // Set page title
    document.title = 'Pain Tracker Pro - Privacy-First Pain Tracking';
    
    // Reset canonical URL to homepage
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', 'https://www.paintracker.ca/');
    }

    // Announce page to screen readers
    const announcement =
      'Welcome to Pain Tracker Pro. A privacy-first chronic pain tracking application.';
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('role', 'status');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.className = 'sr-only';
    ariaLive.textContent = announcement;
    document.body.appendChild(ariaLive);

    return () => {
      // Safe cleanup - element may already be removed during fast navigation
      try {
        ariaLive?.remove();
      } catch {
        // Element already removed, ignore
      }
      document.title = 'Pain Tracker Pro';
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: combinedSchema }}
      />
      
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* Main Content */}
      <main id="main-content" role="main">
        <Hero />
        <UseCases />
        <WorkSafeBCCaseStudy />
        <BenefitsGrid />
        <PricingPreview />
        <TrustIndicators />
        <FeatureShowcase />
        <Testimonials />
        <FeaturedBlogPosts />
        <Faq />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};
