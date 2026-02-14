/**
 * Resources Index Page
 * Landing page listing all free resources, templates, and guides
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Calendar,
  ClipboardList,
  BookOpen,
  Scale,
  Heart,
  ArrowRight,
  Shield,
  Clock
} from 'lucide-react';
import { LandingFooter } from '../../components/landing/LandingFooter';
import '../../styles/pages/landing.css';
import { combineSchemas, generateBreadcrumbSchema } from '../../lib/seo';

interface ResourceCard {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  category: 'template' | 'guide' | 'tool';
  implemented: boolean;
}

const resources: ResourceCard[] = [
  // Tier 1: Core printable/download intent - IMPLEMENTED
  {
    title: 'Pain Diary Template PDF',
    description: 'Comprehensive daily pain tracking template. Record pain levels, symptoms, medications, and triggers.',
    href: '/resources/pain-diary-template-pdf',
    icon: <FileText className="w-6 h-6" />,
    badge: 'Most Popular',
    category: 'template',
    implemented: true
  },
  {
    title: 'Daily Pain Tracker Printable',
    description: 'Simple one-page daily tracking sheet for quick, consistent entries.',
    href: '/resources/daily-pain-tracker-printable',
    icon: <Calendar className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Weekly Pain Log PDF',
    description: '7-day spread format showing your pain patterns at a glance.',
    href: '/resources/weekly-pain-log-pdf',
    icon: <ClipboardList className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Monthly Pain Tracker',
    description: 'Monthly overview for tracking long-term pain trends and treatment effectiveness.',
    href: '/resources/monthly-pain-tracker-printable',
    icon: <Calendar className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Pain Scale Chart Printable',
    description: 'Visual pain scale reference chart (0-10 NRS) for consistent pain rating.',
    href: '/resources/pain-scale-chart-printable',
    icon: <Scale className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Symptom Tracker Printable',
    description: 'Track symptoms beyond pain: fatigue, sleep quality, mood, and daily functioning.',
    href: '/resources/symptom-tracker-printable',
    icon: <Heart className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Migraine Pain Diary',
    description: 'Specialized template for tracking migraine-specific symptoms, triggers, and auras.',
    href: '/resources/migraine-pain-diary-printable',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  
  // Tier 2: Medical & Appointment Intent
  {
    title: 'How to Track Pain for Doctors',
    description: 'What doctors actually want to see in your pain records and how to present it.',
    href: '/resources/how-to-track-pain-for-doctors',
    icon: <BookOpen className="w-6 h-6" />,
    badge: 'Guide',
    category: 'guide',
    implemented: true
  },
  {
    title: 'What to Include in a Pain Journal',
    description: 'Complete guide to the information that makes pain tracking clinically useful.',
    href: '/resources/what-to-include-in-pain-journal',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  
  // Tier 3: Disability/Legal Documentation
  {
    title: 'Documenting Pain for Disability Claims',
    description: 'How to create pain documentation that supports WorkSafeBC and insurance claims.',
    href: '/resources/documenting-pain-for-disability-claim',
    icon: <Shield className="w-6 h-6" />,
    badge: 'Important',
    category: 'guide',
    implemented: true
  },
  {
    title: 'WorkSafeBC Pain Journal Template',
    description: 'Template specifically designed to meet WorkSafeBC documentation requirements.',
    href: '/resources/worksafebc-pain-journal-template',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  
  // Tier 4: Condition-Specific
  {
    title: 'Fibromyalgia Pain Diary',
    description: 'Template designed for tracking fibromyalgia symptoms including widespread pain and fatigue.',
    href: '/resources/fibromyalgia-pain-diary',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Chronic Back Pain Diary',
    description: 'Track back pain location, activities, posture, and treatments for spine specialists.',
    href: '/resources/chronic-back-pain-diary',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Arthritis Pain Tracker',
    description: 'Monitor joint pain, stiffness, swelling, and mobility across multiple joints.',
    href: '/resources/arthritis-pain-tracker',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Nerve Pain Symptom Log',
    description: 'Track burning, tingling, numbness, and shooting pain for neuropathy conditions.',
    href: '/resources/nerve-pain-symptom-log',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Printable Pain Log Sheet',
    description: 'Simple, clean pain tracking sheet for quick daily documentation.',
    href: '/resources/printable-pain-log-sheet',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Chronic Pain Diary Template',
    description: 'Designed for long-term chronic pain tracking with baseline and flare documentation.',
    href: '/resources/chronic-pain-diary-template',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: '7-Day Pain Diary Template',
    description: 'One-week format perfect for preparing for doctor appointments.',
    href: '/resources/7-day-pain-diary-template',
    icon: <Calendar className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'How Doctors Use Pain Diaries',
    description: 'Understanding the clinical perspective on pain tracking.',
    href: '/resources/how-doctors-use-pain-diaries',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Diary for Specialist Appointment',
    description: 'Prepare effectively for rheumatology, neurology, and pain specialist visits.',
    href: '/resources/pain-diary-for-specialist-appointment',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Symptom Tracking Before Diagnosis',
    description: 'Strategic tracking when seeking a diagnosis for unexplained symptoms.',
    href: '/resources/symptom-tracking-before-diagnosis',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Journal for Disability Benefits',
    description: 'Documentation strategies for disability benefit applications.',
    href: '/resources/pain-journal-for-disability-benefits',
    icon: <Shield className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Daily Functioning Log for Disability',
    description: 'Track functional limitations that disability evaluators need to see.',
    href: '/resources/daily-functioning-log-for-disability',
    icon: <Shield className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Endometriosis Pain Log',
    description: 'Track endo symptoms throughout your cycle: pelvic pain, GI issues, and more.',
    href: '/resources/endometriosis-pain-log',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'CRPS Pain Diary Template',
    description: 'Track Complex Regional Pain Syndrome symptoms: burning, swelling, color changes.',
    href: '/resources/crps-pain-diary-template',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Neuropathy Symptom Tracker',
    description: 'Monitor peripheral neuropathy: numbness, tingling, and progression over time.',
    href: '/resources/neuropathy-symptom-tracker',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
];

export const ResourcesIndexPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Free Pain Tracking Resources & Templates | Pain Tracker Pro';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Free downloadable pain diary templates, printable pain logs, symptom trackers, and guides for medical documentation. Perfect for doctor appointments and disability claims.'
      );
    }
  }, []);

  const schema = combineSchemas(
    generateBreadcrumbSchema(
      [
        { name: 'Home', url: '/' },
        { name: 'Resources', url: '/resources' },
      ],
      { siteUrl: 'https://www.paintracker.ca' }
    )
  );

  const templates = resources.filter(r => r.category === 'template');
  const guides = resources.filter(r => r.category === 'guide');

  const renderResourceCard = (resource: ResourceCard) => {
    const cardContent = (
      <>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 ${resource.implemented ? 'bg-primary/20' : 'bg-slate-700'} rounded-xl flex items-center justify-center ${resource.implemented ? 'text-primary' : 'text-slate-500'} flex-shrink-0`}>
            {resource.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`font-semibold ${resource.implemented ? 'text-white group-hover:text-primary' : 'text-slate-400'} transition-colors truncate`}>
                {resource.title}
              </h3>
              {resource.badge && resource.implemented && (
                <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full flex-shrink-0">
                  {resource.badge}
                </span>
              )}
              {!resource.implemented && (
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-700 text-slate-400 rounded-full flex-shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Coming Soon
                </span>
              )}
            </div>
            <p className={`text-sm ${resource.implemented ? 'text-slate-400' : 'text-slate-500'} line-clamp-2`}>{resource.description}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-primary">
          {resource.implemented ? (
            <>
              <span>Download free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          ) : (
            <span className="text-slate-500">Available soon</span>
          )}
        </div>
      </>
    );

    if (resource.implemented) {
      return (
        <Link
          key={resource.href}
          to={resource.href}
          className="group p-6 bg-slate-800 hover:bg-slate-750 rounded-xl border border-slate-700 hover:border-primary/50 transition-all"
        >
          {cardContent}
        </Link>
      );
    }

    return (
      <div
        key={resource.href}
        className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 opacity-75 cursor-not-allowed"
      >
        {cardContent}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background landing-always-dark">
      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
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
                to="/pricing"
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                Pricing
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
      
      <main id="main-content" role="main">
        {/* Hero */}
        <section className="hero-section-dramatic py-16 sm:py-24">
          <div className="hero-bg-mesh" />
          <div className="hero-grid-pattern" />
          
          <div className="orb-container">
            <div className="orb-glow orb-glow-sky w-96 h-96 -top-48 -left-48" />
            <div className="orb-glow orb-glow-purple w-72 h-72 top-1/4 -right-36" />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 landing-badge mb-6">
              <Download className="w-4 h-4" />
              <span>Free Resources</span>
            </div>
            
            <h1 className="landing-headline landing-headline-lg text-white mb-6">
              Free Pain Tracking Templates & Guides
            </h1>
            
            <p className="landing-subhead text-lg sm:text-xl max-w-2xl mx-auto">
              Download printable pain diaries, symptom trackers, and guides designed for 
              medical documentation and disability claims. All free, no signup required.
            </p>
          </div>
        </section>
        
        {/* Templates Section */}
        <section className="py-16 bg-slate-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-8">Printable Templates</h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(renderResourceCard)}
            </div>
          </div>
        </section>
        
        {/* Guides Section */}
        <section className="py-16 bg-slate-800/50 border-t border-slate-700">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-8">Guides & How-To</h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {guides.map(renderResourceCard)}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-800 border-t border-slate-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Prefer digital tracking?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Pain Tracker Pro does everything these templates do—automatically. 
              Generate medical reports, track patterns, and keep everything private on your device.
            </p>
            <Link
              to="/start"
              className="btn-cta-primary px-8 py-4 text-lg font-semibold rounded-xl inline-flex items-center gap-3"
            >
              Try Pain Tracker Pro
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>
      
      <LandingFooter />
    </div>
  );
};

export default ResourcesIndexPage;
