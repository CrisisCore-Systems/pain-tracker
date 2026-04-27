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
  landingFaqs,
  LandingFooter,
} from '../components/landing';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateSoftwareApplicationSchema,
  generateFAQSchema,
  combineSchemas,
  defaultSEOConfig,
} from '../lib/seo';

export const LandingPage: React.FC = () => {
  // Generate structured data for homepage
  const organizationSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();
  const softwareSchema = generateSoftwareApplicationSchema();
  const faqSchema = generateFAQSchema(landingFaqs.map((faq) => ({
    question: faq.question,
    answer: faq.answer,
  })));
  const combinedSchema = combineSchemas(organizationSchema, webSiteSchema, softwareSchema, faqSchema);

  useEffect(() => {
    const meta = {
      title: 'Free Pain Tracker App That Works Offline and Keeps Data Private | PainTracker',
      description: 'Track pain, symptoms, medications, and triggers with a free pain tracker app that works offline and keeps your records private. No account required.',
      keywords:
        'free pain tracker app, pain tracker app, pain tracker, private pain tracker, offline pain tracker, pain diary template, symptom tracker printable, doctor visit records',
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
    updateMeta('meta[property="og:site_name"]', defaultSEOConfig.siteName);
    updateMeta('meta[name="twitter:title"]', meta.title);
    updateMeta('meta[name="twitter:description"]', meta.description);
    
    // Reset canonical URL to homepage
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `${defaultSEOConfig.siteUrl}/`);
    }

    // Announce page to screen readers
    const announcement =
      'Welcome to PainTracker. Use a free pain tracker app for private offline symptom tracking and clearer doctor visit records.';
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
      document.title = defaultSEOConfig.siteName;
    };
  }, []);

  const intentPages = [
    {
      title: 'Use the free pain tracker',
      description: 'Start daily pain tracking in the app with no account required and private local-first records by default.',
      href: '/start',
    },
    {
      title: 'Get the printable PDF',
      description: 'Get a pain journal template, daily pain tracker, or symptom log you can print today.',
      href: '/resources/pain-diary-template-pdf',
    },
    {
      title: 'Prepare for doctor visits',
      description: 'Use the record-sharing workflow to bring clearer pain records to a doctor without handing an app your day-to-day data.',
      href: '/share-pain-records-with-doctor-without-giving-an-app-your-data',
    },
    {
      title: 'Prepare documentation',
      description: 'Build records for disability, insurance, or WorkSafeBC workflows using the patient-first resource funnel.',
      href: '/resources/documenting-pain-for-disability-claim',
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
                <span className="text-white">Start with the patient lane, </span>
                <span className="gradient-text-animated">not the doctrine lane</span>
              </h2>
              <p className="landing-subhead text-lg">
                The public front door should help people in pain do the next useful thing fast: use the app, print a tracker, or prepare records for appointments and documentation.
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
