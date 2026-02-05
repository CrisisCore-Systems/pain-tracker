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
  Shield
} from 'lucide-react';
import { LandingFooter } from '../../components/landing/LandingFooter';
import '../../styles/pages/landing.css';

interface ResourceCard {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  category: 'template' | 'guide' | 'tool';
}

const resources: ResourceCard[] = [
  // Tier 1: Core printable/download intent
  {
    title: 'Pain Diary Template PDF',
    description: 'Comprehensive daily pain tracking template. Record pain levels, symptoms, medications, and triggers.',
    href: '/resources/pain-diary-template-pdf',
    icon: <FileText className="w-6 h-6" />,
    badge: 'Most Popular',
    category: 'template'
  },
  {
    title: 'Daily Pain Tracker Printable',
    description: 'Simple one-page daily tracking sheet for quick, consistent entries.',
    href: '/resources/daily-pain-tracker-printable',
    icon: <Calendar className="w-6 h-6" />,
    category: 'template'
  },
  {
    title: 'Weekly Pain Log PDF',
    description: '7-day spread format showing your pain patterns at a glance.',
    href: '/resources/weekly-pain-log-pdf',
    icon: <ClipboardList className="w-6 h-6" />,
    category: 'template'
  },
  {
    title: 'Monthly Pain Tracker',
    description: 'Monthly overview for tracking long-term pain trends and treatment effectiveness.',
    href: '/resources/monthly-pain-tracker-printable',
    icon: <Calendar className="w-6 h-6" />,
    category: 'template'
  },
  {
    title: 'Pain Scale Chart Printable',
    description: 'Visual pain scale reference chart (0-10 NRS) for consistent pain rating.',
    href: '/resources/pain-scale-chart-printable',
    icon: <Scale className="w-6 h-6" />,
    category: 'template'
  },
  {
    title: 'Symptom Tracker Printable',
    description: 'Track symptoms beyond pain: fatigue, sleep quality, mood, and daily functioning.',
    href: '/resources/symptom-tracker-printable',
    icon: <Heart className="w-6 h-6" />,
    category: 'template'
  },
  
  // Tier 2: Medical & Appointment Intent
  {
    title: 'How to Track Pain for Doctors',
    description: 'What doctors actually want to see in your pain records and how to present it.',
    href: '/resources/how-to-track-pain-for-doctors',
    icon: <BookOpen className="w-6 h-6" />,
    badge: 'Guide',
    category: 'guide'
  },
  {
    title: 'What to Include in a Pain Journal',
    description: 'Complete guide to the information that makes pain tracking clinically useful.',
    href: '/resources/what-to-include-in-pain-journal',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide'
  },
  
  // Tier 3: Disability/Legal Documentation
  {
    title: 'Documenting Pain for Disability Claims',
    description: 'How to create pain documentation that supports WorkSafeBC and insurance claims.',
    href: '/resources/documenting-pain-for-disability-claim',
    icon: <Shield className="w-6 h-6" />,
    badge: 'Important',
    category: 'guide'
  },
  {
    title: 'WorkSafeBC Pain Journal Template',
    description: 'Template specifically designed to meet WorkSafeBC documentation requirements.',
    href: '/resources/worksafebc-pain-journal-template',
    icon: <FileText className="w-6 h-6" />,
    category: 'template'
  },
  
  // Tier 4: Condition-Specific
  {
    title: 'Migraine Pain Diary',
    description: 'Specialized template for tracking migraine-specific symptoms, triggers, and auras.',
    href: '/resources/migraine-pain-diary-printable',
    icon: <FileText className="w-6 h-6" />,
    category: 'template'
  },
  {
    title: 'Fibromyalgia Pain Diary',
    description: 'Template designed for tracking fibromyalgia symptoms including widespread pain and fatigue.',
    href: '/resources/fibromyalgia-pain-diary',
    icon: <FileText className="w-6 h-6" />,
    category: 'template'
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

  const templates = resources.filter(r => r.category === 'template');
  const guides = resources.filter(r => r.category === 'guide');

  return (
    <div className="min-h-screen bg-background">
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
              {templates.map((resource) => (
                <Link
                  key={resource.href}
                  to={resource.href}
                  className="group p-6 bg-slate-800 hover:bg-slate-750 rounded-xl border border-slate-700 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                      {resource.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white group-hover:text-primary transition-colors truncate">
                          {resource.title}
                        </h3>
                        {resource.badge && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full flex-shrink-0">
                            {resource.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2">{resource.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-primary">
                    <span>Download free</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        
        {/* Guides Section */}
        <section className="py-16 bg-slate-800/50 border-t border-slate-700">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-8">Guides & How-To</h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {guides.map((resource) => (
                <Link
                  key={resource.href}
                  to={resource.href}
                  className="group p-6 bg-slate-800 hover:bg-slate-750 rounded-xl border border-slate-700 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 flex-shrink-0">
                      {resource.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                          {resource.title}
                        </h3>
                        {resource.badge && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
                            {resource.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{resource.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-primary">
                    <span>Read guide</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
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
