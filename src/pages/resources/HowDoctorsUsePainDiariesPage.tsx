/**
 * How Doctors Use Pain Diaries - SEO Landing Page
 * 
 * Target keyword: "how doctors use pain diaries"
 * Search intent: User wants to understand the clinical perspective
 * Conversion goal: Guide → Download templates → discover Pain Tracker Pro
 * 
 * Tier 2 - Medical & Appointment Intent
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'how-doctors-use-pain-diaries',
  title: 'How Doctors Use Pain Diaries',
  metaTitle: 'How Doctors Use Pain Diaries - Clinical Perspective Guide | Pain Tracker Pro',
  metaDescription: 'Learn how doctors actually use pain diaries in clinical practice. Understand what they look for, how it influences treatment decisions, and why your tracking matters.',
  keywords: [
    'how doctors use pain diaries',
    'pain diary clinical use',
    'doctor pain diary',
    'pain tracking medical use',
    'physician pain diary',
    'clinical pain diary',
    'pain diary treatment decisions',
    'medical pain documentation'
  ],
  
  // Above-the-fold
  badge: 'Clinical Guide',
  headline: 'How Doctors Use Pain Diaries',
  subheadline: 'Understanding the clinical perspective: what doctors actually look for in pain diaries, how it influences treatment decisions, and why your tracking genuinely matters.',
  primaryCTA: {
    text: 'Get Free Templates',
    href: '/resources/pain-diary-template-pdf',
    download: false
  },
  secondaryCTA: {
    text: 'Start Digital Tracking',
    href: '/start'
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/clinical-pain-diary-guide.pdf',
    downloadFileName: 'clinical-pain-diary-guide.pdf'
  },
  
  // Content sections
  whatIsThis: 'This guide explains the clinical perspective on pain diaries—how doctors actually use them, what they look for, and why your tracking efforts aren\'t wasted. Understanding the medical viewpoint helps you track more effectively and present your data in ways that genuinely influence your care. Pain diaries aren\'t just homework; they\'re clinical tools.',
  
  whoShouldUse: [
    'Patients who wonder if their pain diary actually gets read',
    'Anyone curious about the clinical value of pain tracking',
    'People wanting to align their tracking with medical expectations',
    'Those whose doctors recommended pain tracking but didn\'t explain why',
    'Anyone frustrated that their pain reports don\'t seem to change their treatment'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Understand what doctors can\'t see',
      description: 'Doctors see you for 15 minutes. They can\'t observe your pain between visits. Your diary provides data from the 99% of time they\'re not with you—that\'s why it matters clinically.'
    },
    {
      step: 2,
      title: 'Recognize the patterns doctors seek',
      description: 'Doctors look for: pain intensity trends, timing patterns, treatment response, functional impact, and consistency. Structure your tracking to highlight these elements.'
    },
    {
      step: 3,
      title: 'Learn how diaries influence treatment',
      description: 'Treatment decisions change based on documented patterns. "Pain averaging 7, no response to current medication" leads to different decisions than just saying "it still hurts."'
    },
    {
      step: 4,
      title: 'Present your diary effectively',
      description: 'Bring a summary, not just raw data. "Here\'s what I tracked, here\'s what I noticed, here\'s what I\'d like to discuss." Make it easy for your doctor to use your data.'
    }
  ],
  
  whyItMatters: 'Pain is subjective and invisible—doctors can\'t measure it objectively. Your pain diary is often the most reliable data they have about your experience between visits. Studies show that treatment decisions change 40-60% of the time when patients bring structured pain diaries versus verbal reports alone. Your tracking genuinely influences your care.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Based on clinical practice guidelines and physician input on pain diary utilization.',
    privacyNote: 'Understanding clinical use helps you decide what to share and what to keep private.',
    legalNote: 'Knowing how documentation is used clinically also applies to disability evaluations.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'Do doctors actually read pain diaries?',
      answer: 'Most do, though time constraints mean they often scan rather than read word-by-word. That\'s why summaries and clear formatting help. Doctors look for patterns, trends, and treatment response—make these easy to find. A well-organized diary gets more attention than pages of unstructured notes.'
    },
    {
      question: 'What patterns do doctors look for?',
      answer: 'Key patterns include: (1) Overall trend—improving, stable, or worsening? (2) Timing patterns—worse at certain times, days, or with certain activities? (3) Treatment response—did medication changes help? (4) Flare frequency and triggers. (5) Functional impact—what can\'t you do?'
    },
    {
      question: 'How does a pain diary change treatment?',
      answer: 'Documented patterns lead to specific actions: if pain peaks in the morning, timing of medications might change; if certain activities trigger flares, activity modification is discussed; if current treatment isn\'t reducing pain scores, alternatives are considered. Without data, decisions are guesswork.'
    },
    {
      question: 'What if my doctor doesn\'t seem interested?',
      answer: 'Try offering a brief summary: "I\'ve been tracking—can I share what I noticed?" If they consistently dismiss your documented data, that\'s worth addressing directly or considering whether this provider is right for complex pain management.'
    },
    {
      question: 'Should I track differently based on my doctor type?',
      answer: 'Somewhat. Primary care doctors need broad overviews. Pain specialists want detailed patterns. Surgeons need functional impact data. Physical therapists want activity correlations. Tailor your summary to who you\'re seeing, even if your underlying tracking is the same.'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'How to Track Pain for Doctors',
      description: 'What information to include in your diary',
      href: '/resources/how-to-track-pain-for-doctors'
    },
    {
      title: 'Pain Diary Template PDF',
      description: 'Clinically-focused tracking template',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'What to Include in a Pain Journal',
      description: 'Elements that matter clinically',
      href: '/resources/what-to-include-in-pain-journal'
    },
    {
      title: 'Pain Diary for Specialist Appointment',
      description: 'Prepare for specialist consultations',
      href: '/resources/pain-diary-for-specialist-appointment'
    },
    {
      title: 'Weekly Pain Log PDF',
      description: 'Show weekly patterns to doctors',
      href: '/resources/weekly-pain-log-pdf'
    },
    {
      title: 'Pain Scale Chart Printable',
      description: 'Use ratings doctors understand',
      href: '/resources/pain-scale-chart-printable'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'How Doctors Use Pain Diaries', url: '/resources/how-doctors-use-pain-diaries' }
  ]
};

export const HowDoctorsUsePainDiariesPage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default HowDoctorsUsePainDiariesPage;
