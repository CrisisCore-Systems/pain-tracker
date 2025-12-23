import React, { useEffect } from 'react';
import {
  Hero,
  UseCases,
  BenefitsGrid,
  PricingPreview,
  TrustIndicators,
  FeatureShowcase,
  Testimonials,
  FeaturedBlogPosts,
  FAQ,
  LandingFooter,
} from '../components/landing';

export const LandingPage: React.FC = () => {
  useEffect(() => {
    // Set page title
    document.title = 'Pain Tracker Pro - Privacy-First Pain Tracking';

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
        if (ariaLive && ariaLive.parentNode === document.body) {
          document.body.removeChild(ariaLive);
        }
      } catch {
        // Element already removed, ignore
      }
      document.title = 'Pain Tracker Pro';
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
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
        <BenefitsGrid />
        <PricingPreview />
        <TrustIndicators />
        <FeatureShowcase />
        <Testimonials />
        <FeaturedBlogPosts />
        <FAQ />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};
