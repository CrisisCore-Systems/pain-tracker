import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    const meta = {
      title: 'PainTracker - Private Offline-First Pain Tracking App',
      description:
        'Track pain, symptoms, triggers, and daily patterns with a private offline-first pain tracker app. Local-first by default, no account required, and clinician-friendly exports when you choose.',
      keywords:
        'pain tracker, pain tracker app, pain tracking app, chronic pain tracker, pain diary app, pain journal app, pain diary template, pain log template',
    };

    document.title = meta.title;

    const updateMeta = (selector: string, content: string) => {
      const element = document.querySelector(selector);
      if (element) {
        element.setAttribute('content', content);
      }
    };

    updateMeta('meta[name="description"]', meta.description);
    updateMeta('meta[name="keywords"]', meta.keywords);
    updateMeta('meta[property="og:title"]', meta.title);
    updateMeta('meta[property="og:description"]', meta.description);
    updateMeta('meta[property="og:site_name"]', 'PainTracker');
    updateMeta('meta[name="twitter:title"]', meta.title);
    updateMeta('meta[name="twitter:description"]', meta.description);
    
    // Reset canonical URL to homepage
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', 'https://www.paintracker.ca/');
    }

    // Announce page to screen readers
    const announcement =
      'Welcome to PainTracker. A private offline-first pain tracker app.';
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
      document.title = 'PainTracker';
    };
  }, []);

  const intentPages = [
    {
      title: 'Pain Tracker App',
      description: 'See the core app page for daily logging, symptom tracking, and clinician-friendly exports.',
      href: '/pain-tracker-app',
    },
    {
      title: 'Pain Diary Template',
      description: 'Start with a printable pain diary template, pain log, or paper-first tracking workflow.',
      href: '/pain-diary-template',
    },
    {
      title: 'Pain Tracking Apps Comparison',
      description: 'Compare privacy, offline use, doctor-visit readiness, and what to look for before choosing an app.',
      href: '/pain-tracking-apps-comparison',
    },
    {
      title: 'Privacy and Offline Use',
      description: 'Read how PainTracker approaches local-first use, privacy, and trauma-informed design.',
      href: '/privacy-offline-first-pain-tracker',
    },
  ];

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
        <section className="landing-always-dark relative py-16 lg:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/60 to-slate-900" />
          <div className="relative container mx-auto px-4">
            <div className="text-center mb-10 max-w-3xl mx-auto stagger-fade-up">
              <h2 className="landing-headline landing-headline-md mb-4">
                <span className="text-white">Choose the page that matches </span>
                <span className="gradient-text-animated">what you searched</span>
              </h2>
              <p className="landing-subhead text-lg">
                Google is already testing the site for several pain-tracking intents. These pages make each answer explicit.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 stagger-fade-up">
              {intentPages.map((page) => (
                <Link
                  key={page.href}
                  to={page.href}
                  className="glass-card-premium rounded-2xl p-6 border border-white/10 hover:border-sky-400/40 transition-all"
                >
                  <h3 className="text-white font-semibold text-xl mb-2">{page.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{page.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
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
