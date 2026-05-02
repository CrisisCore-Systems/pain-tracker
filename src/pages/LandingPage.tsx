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
      title: 'PainTracker.ca - Free Private Pain Tracker App That Works Offline',
      description: 'Track pain, flares, medications, triggers, and daily function privately. PainTracker.ca works offline, needs no account, stores records on your device, and supports appointment-ready exports.',
      keywords:
        'free pain tracker app, pain tracker app, pain tracker, private pain tracker, offline pain tracker, pain diary template, symptom tracker printable, doctor visit records, worksafebc pain journal',
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
      'Welcome to PainTracker. Track chronic pain privately, even offline, with no account required and export records only when you choose.';
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
      eyebrow: 'Daily pain tracking',
      title: 'Track pain privately on bad days too',
      description: 'Log pain intensity, body location, symptoms, medication, triggers, and notes in under a minute. Built for brain fog, low energy, and interrupted days.',
      href: '/start',
      cta: 'Start tracking free',
    },
    {
      eyebrow: 'Appointments and documentation',
      title: 'Bring structured records to doctors and claims',
      description: 'Turn scattered symptoms into usable records for doctors, physiotherapy, disability paperwork, or WorkSafeBC-related documentation conversations.',
      href: '/share-pain-records-with-doctor-without-giving-an-app-your-data',
      cta: 'Prepare records',
    },
    {
      eyebrow: 'Printable backup lane',
      title: 'Download a printable pain diary today',
      description: 'Start with a printable pain journal, daily pain tracker, or symptom log if paper feels safer or easier right now.',
      href: '/resources/pain-diary-template-pdf',
      cta: 'Download printable pain diary',
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
                <span className="text-white">Choose the next useful step </span>
                <span className="gradient-text-animated">without hunting for it</span>
              </h2>
              <p className="landing-subhead text-lg">
                PainTracker works best when the homepage acts like triage: start tracking, get records ready, or take the printable route if digital feels like too much today.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3 stagger-fade-up">
              {intentPages.map((page) => (
                <Link
                  key={page.href}
                  to={page.href}
                  className="glass-card-premium rounded-2xl p-6 border border-white/10 hover:border-sky-400/40 transition-all"
                >
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-300 mb-3">{page.eyebrow}</p>
                  <h3 className="text-white font-semibold text-xl mb-2">{page.title}</h3>
                  <p className="text-slate-400 leading-relaxed mb-5">{page.description}</p>
                  <span className="text-sm font-medium text-emerald-300">{page.cta} -&gt;</span>
                </Link>
              ))}
            </div>
            <div className="max-w-4xl mx-auto mt-8 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-6 stagger-fade-up">
              <h3 className="text-lg font-semibold text-white mb-2">Local-first means you control the backup too</h3>
              <p className="text-slate-300 leading-relaxed">
                If you clear browser storage, lose your device, or forget your passphrase, your local records may not be recoverable. Export backups regularly before risky changes or device cleanup.
              </p>
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
