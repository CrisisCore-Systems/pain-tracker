/**
 * SEO Page Layout Component
 * Reusable layout for all SEO-optimized landing pages following the ranking blueprint.
 * 
 * Structure:
 * 1. Above-the-fold clarity (headline, subhead, CTA)
 * 2. Instant utility block (download/tool preview)
 * 3. Ultra-clear explanation (what, who, how, why)
 * 4. Clinical & legal trust signals
 * 5. Soft conversion into the app
 * 6. Internal authority links
 * 7. FAQ block
 * 8. Structured data (invisible SEO)
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Download, 
  CheckCircle, 
  Shield, 
  FileText, 
  ArrowRight
} from 'lucide-react';
import { LandingFooter } from '../landing/LandingFooter';
import {
  generateMedicalWebPageSchema,
  generateFAQSchema,
  generateSoftwareApplicationSchema,
  generateBreadcrumbSchema,
  combineSchemas,
  type FAQItem,
  type BreadcrumbItem
} from '../../lib/seo';
import '../../styles/pages/landing.css';

export interface SEOPageContent {
  // Meta & SEO
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  
  // Above-the-fold
  badge?: string;
  headline: string;
  subheadline: string;
  primaryCTA: {
    text: string;
    href: string;
    download?: boolean;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
  
  // Utility block
  utilityBlock: {
    type: 'pdf-preview' | 'tool-embed' | 'download';
    previewImage?: string;
    downloadUrl?: string;
    downloadFileName?: string;
  };
  
  // Content sections
  whatIsThis: string;
  whoShouldUse: string[];
  howToUse: Array<{ step: number; title: string; description: string }>;
  whyItMatters: string;
  
  // Trust signals
  trustSignals?: {
    medicalNote?: string;
    privacyNote?: string;
    legalNote?: string;
  };
  
  // FAQ
  faqs: FAQItem[];
  
  // Related links
  relatedLinks: Array<{
    title: string;
    description: string;
    href: string;
  }>;
  
  // Breadcrumbs
  breadcrumbs: BreadcrumbItem[];
}

interface SEOPageLayoutProps {
  content: SEOPageContent;
  children?: React.ReactNode;
}

export const SEOPageLayout: React.FC<SEOPageLayoutProps> = ({ content, children }) => {
  // Set document title and meta tags
  useEffect(() => {
    document.title = content.metaTitle;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', content.metaDescription);
    }
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', content.keywords.join(', '));
    }
    
    // Update OG tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', content.metaTitle);
    }
    
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', content.metaDescription);
    }
    
    // Announce page to screen readers
    const announcement = `${content.headline}. ${content.subheadline}`;
    const ariaLive = document.createElement('div');
    ariaLive.setAttribute('role', 'status');
    ariaLive.setAttribute('aria-live', 'polite');
    ariaLive.className = 'sr-only';
    ariaLive.textContent = announcement;
    document.body.appendChild(ariaLive);
    
    return () => {
      try {
        if (ariaLive && ariaLive.parentNode === document.body) {
          document.body.removeChild(ariaLive);
        }
      } catch {
        // Element already removed
      }
    };
  }, [content]);
  
  // Generate structured data
  const medicalPageSchema = generateMedicalWebPageSchema({
    name: content.title,
    description: content.metaDescription,
    url: `https://paintracker.ca/resources/${content.slug}`,
    keywords: content.keywords
  });
  
  const faqSchema = generateFAQSchema(content.faqs);
  const softwareSchema = generateSoftwareApplicationSchema();
  const breadcrumbSchema = generateBreadcrumbSchema(content.breadcrumbs);
  
  const combinedSchema = combineSchemas(
    medicalPageSchema,
    faqSchema,
    softwareSchema,
    breadcrumbSchema
  );
  
  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: combinedSchema }}
      />
      
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 nav-floating-glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="landing-brand text-xl">Pain Tracker Pro</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/resources"
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                Resources
              </Link>
              <Link
                to="/start"
                className="btn-cta-primary px-4 py-2 text-sm font-medium rounded-lg"
              >
                Open App
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Breadcrumbs */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm">
              {content.breadcrumbs.map((crumb, index) => (
                <li key={crumb.url} className="flex items-center gap-2">
                  {index > 0 && <span className="text-slate-600">/</span>}
                  {index === content.breadcrumbs.length - 1 ? (
                    <span className="text-slate-400">{crumb.name}</span>
                  ) : (
                    <Link
                      to={crumb.url}
                      className="text-slate-300 hover:text-primary transition-colors"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
      
      <main id="main-content" role="main">
        {/* ===== SECTION 1: Above-the-Fold Clarity ===== */}
        <section className="hero-section-dramatic py-16 sm:py-24">
          <div className="hero-bg-mesh" />
          <div className="hero-grid-pattern" />
          
          {/* Floating orbs for visual interest */}
          <div className="orb-container">
            <div className="orb-glow orb-glow-sky w-96 h-96 -top-48 -left-48" />
            <div className="orb-glow orb-glow-purple w-72 h-72 top-1/4 -right-36" />
            <div className="orb-glow orb-glow-emerald w-64 h-64 bottom-0 left-1/4" />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {content.badge && (
              <div className="inline-flex items-center gap-2 landing-badge mb-6">
                <FileText className="w-4 h-4" />
                <span>{content.badge}</span>
              </div>
            )}
            
            <h1 className="landing-headline landing-headline-lg text-white mb-6">
              {content.headline}
            </h1>
            
            <p className="landing-subhead text-lg sm:text-xl max-w-2xl mx-auto mb-8">
              {content.subheadline}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {content.primaryCTA.download ? (
                <a
                  href={content.primaryCTA.href}
                  download={content.utilityBlock.downloadFileName}
                  className="btn-cta-primary px-8 py-4 text-lg font-semibold rounded-xl flex items-center gap-3"
                >
                  <Download className="w-5 h-5" />
                  {content.primaryCTA.text}
                </a>
              ) : (
                <Link
                  to={content.primaryCTA.href}
                  className="btn-cta-primary px-8 py-4 text-lg font-semibold rounded-xl flex items-center gap-3"
                >
                  {content.primaryCTA.text}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              
              {content.secondaryCTA && (
                <Link
                  to={content.secondaryCTA.href}
                  className="px-8 py-4 text-lg font-medium text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-xl transition-all"
                >
                  {content.secondaryCTA.text}
                </Link>
              )}
            </div>
          </div>
        </section>
        
        {/* ===== SECTION 2: Instant Utility Block ===== */}
        <section className="py-12 bg-slate-900 border-y border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {content.utilityBlock.type === 'pdf-preview' && content.utilityBlock.previewImage && (
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <img
                  src={content.utilityBlock.previewImage}
                  alt={`Preview of ${content.title}`}
                  className="w-full h-auto"
                  loading="eager"
                />
              </div>
            )}
            
            {content.utilityBlock.type === 'download' && (
              <div className="text-center">
                <div className="inline-flex items-center gap-4 bg-slate-800 rounded-2xl p-6 border border-slate-700">
                  <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">
                      {content.utilityBlock.downloadFileName || 'Download PDF'}
                    </h3>
                    <p className="text-slate-400 text-sm">Ready to print • Free forever</p>
                  </div>
                  <a
                    href={content.utilityBlock.downloadUrl}
                    download={content.utilityBlock.downloadFileName}
                    className="btn-cta-primary px-6 py-3 rounded-xl flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </a>
                </div>
              </div>
            )}
            
            {/* Custom children slot for tool embeds */}
            {children}
          </div>
        </section>
        
        {/* ===== SECTION 3: Ultra-Clear Explanation ===== */}
        <section className="py-16 bg-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12">
              {/* What is this */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">What is this?</h2>
                <p className="text-slate-300 text-lg leading-relaxed">
                  {content.whatIsThis}
                </p>
              </div>
              
              {/* Who should use it */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Who should use it?</h2>
                <ul className="space-y-3">
                  {content.whoShouldUse.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300 text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* How to use it */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">How to use it</h2>
                <ol className="space-y-6">
                  {content.howToUse.map((step) => (
                    <li key={step.step} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold">{step.step}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                        <p className="text-slate-400">{step.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              
              {/* Why it matters */}
              <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-4">Why tracking pain matters</h2>
                <p className="text-slate-300 text-lg leading-relaxed">
                  {content.whyItMatters}
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* ===== SECTION 4: Clinical & Legal Trust Signals ===== */}
        {content.trustSignals && (
          <section className="py-12 bg-slate-800/50 border-y border-slate-700">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid sm:grid-cols-3 gap-6">
                {content.trustSignals.medicalNote && (
                  <div className="flex items-start gap-4 p-4 bg-slate-800 rounded-xl">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Medical Use</h3>
                      <p className="text-sm text-slate-400">{content.trustSignals.medicalNote}</p>
                    </div>
                  </div>
                )}
                
                {content.trustSignals.privacyNote && (
                  <div className="flex items-start gap-4 p-4 bg-slate-800 rounded-xl">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Privacy First</h3>
                      <p className="text-sm text-slate-400">{content.trustSignals.privacyNote}</p>
                    </div>
                  </div>
                )}
                
                {content.trustSignals.legalNote && (
                  <div className="flex items-start gap-4 p-4 bg-slate-800 rounded-xl">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Documentation</h3>
                      <p className="text-sm text-slate-400">{content.trustSignals.legalNote}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
        
        {/* ===== SECTION 5: Soft Conversion ===== */}
        <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Want automatic tracking instead of paper?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Pain Tracker Pro automatically logs your symptoms, generates medical reports, 
              and keeps everything private on your device. No signup required.
            </p>
            <Link
              to="/start"
              className="btn-cta-primary px-8 py-4 text-lg font-semibold rounded-xl inline-flex items-center gap-3"
            >
              Open Pain Tracker
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
        
        {/* ===== SECTION 6: Internal Authority Links ===== */}
        <section className="py-16 bg-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-8">Related pain tracking resources</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.relatedLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.href}
                  className="group p-6 bg-slate-800 hover:bg-slate-750 rounded-xl border border-slate-700 hover:border-primary/50 transition-all"
                >
                  <h3 className="font-semibold text-white group-hover:text-primary transition-colors mb-2">
                    {link.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-3">{link.description}</p>
                  <span className="text-sm text-primary flex items-center gap-1">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
        
        {/* ===== SECTION 7: FAQ Block ===== */}
        <section className="py-16 bg-slate-800/50 border-t border-slate-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {content.faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-slate-800 rounded-xl border border-slate-700"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <h3 className="font-semibold text-white pr-4">{faq.question}</h3>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default SEOPageLayout;
