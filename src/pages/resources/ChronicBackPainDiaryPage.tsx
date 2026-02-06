/**
 * Chronic Back Pain Diary - SEO Landing Page
 * 
 * Target keyword: "chronic back pain diary"
 * Search intent: User needs back pain-specific tracking
 * Conversion goal: Download template → discover Pain Tracker Pro
 * 
 * Tier 4 - Condition-Specific Long-Tail
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'chronic-back-pain-diary',
  title: 'Chronic Back Pain Diary (Free)',
  metaTitle: 'Chronic Back Pain Diary - Free Back Pain Tracker Template | Pain Tracker Pro',
  metaDescription: 'Download our free chronic back pain diary. Track pain location, activities, posture, and treatments. Essential for physical therapy and spine specialist appointments.',
  keywords: [
    'chronic back pain diary',
    'back pain tracker',
    'spine pain journal',
    'lower back pain log',
    'back pain activity tracker',
    'lumbar pain diary',
    'back pain template',
    'spinal pain tracking'
  ],
  
  // Above-the-fold
  badge: 'Free Download',
  headline: 'Chronic Back Pain Diary',
  subheadline: 'Track back pain location, intensity, and what affects it. Document activities, posture, and treatments to identify what helps and what hurts your back.',
  primaryCTA: {
    text: 'Download Free PDF',
    href: '/assets/chronic-back-pain-diary.pdf',
    download: true
  },
  secondaryCTA: {
    text: 'Try Digital Version',
    href: '/start'
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/chronic-back-pain-diary.pdf',
    downloadFileName: 'chronic-back-pain-diary.pdf'
  },
  
  // Content sections
  whatIsThis: 'A chronic back pain diary is specifically designed for tracking spinal and back-related pain. It includes space for detailed location tracking (upper, middle, lower back, with radiation patterns), activity correlations (sitting, standing, lifting, exercise), posture notes, and treatment responses (physical therapy, medications, stretches, heat/ice). Back pain is highly activity-dependent, and this diary captures those crucial connections.',
  
  whoShouldUse: [
    'Anyone with chronic lower back, upper back, or spinal pain',
    'People working with physical therapists or chiropractors',
    'Patients preparing for spine specialist consultations',
    'Those with herniated discs, sciatica, or degenerative conditions',
    'Workers whose job contributes to back pain (desk workers, labor, healthcare)'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Be specific about location',
      description: 'Don\'t just write "back pain." Note exactly where: lower left, upper middle, along the spine. Track radiation—does it go into your buttocks, leg, or foot? Precise location helps diagnose the source.'
    },
    {
      step: 2,
      title: 'Connect pain to activities',
      description: 'Back pain is strongly activity-related. Note what you were doing before pain increased: sitting at desk, lifting, bending, exercising. Also note activities that provided relief.'
    },
    {
      step: 3,
      title: 'Track position and posture',
      description: 'Note your posture patterns: hours sitting, standing, sleeping position. If you have a desk job, track workstation setup and breaks. Posture patterns often reveal fixable contributors to pain.'
    },
    {
      step: 4,
      title: 'Document treatment response',
      description: 'Record which treatments help: PT exercises, stretches, medications, heat vs. ice, massage, position changes. Your body\'s responses guide treatment selection.'
    }
  ],
  
  whyItMatters: 'Back pain is the leading cause of disability worldwide, yet treatment often fails because it\'s not targeted to the individual\'s specific patterns. Research shows that patients who keep detailed back pain diaries work more effectively with physical therapists and have better outcomes. The diary reveals whether your pain is mechanical (posture/activity-related), inflammatory (morning stiffness), or neurological (radiation, numbness)—each requiring different treatment.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Includes elements recommended by spine specialists and physical therapists for back pain assessment.',
    privacyNote: 'Paper format keeps your health information completely under your control.',
    legalNote: 'Activity-correlated back pain documentation is essential for workplace injury claims.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'What back pain details matter most?',
      answer: 'Location (be precise), radiation pattern (does it travel?), quality (sharp, dull, burning, aching), timing (constant vs. intermittent), and activity correlation (what makes it better or worse). The activity connection is often the most actionable information for treatment.'
    },
    {
      question: 'How do I know if my back pain is serious?',
      answer: 'Red flags that require immediate medical attention: pain with fever, progressive leg weakness, loss of bladder/bowel control, pain after major trauma, unexplained weight loss, or pain that wakes you from sleep. Your diary should note any of these symptoms for urgent provider review.'
    },
    {
      question: 'Should I track exercises and stretches?',
      answer: 'Absolutely. Note which exercises you did, how many reps/how long, and how your back felt during and after. This data is gold for physical therapists. They can see what exercises help, what aggravates, and how to progress your program.'
    },
    {
      question: 'How does sitting vs. standing affect tracking?',
      answer: 'Track time spent in each position and pain levels during/after. Many people with disc issues hurt more sitting; those with spinal stenosis hurt more standing. Your pattern suggests the underlying problem and guides treatment.'
    },
    {
      question: 'Is this useful for worker\'s compensation claims?',
      answer: 'Very useful. Documenting the connection between work activities (lifting, repetitive motion, prolonged sitting) and pain is essential for workers\' comp claims. Note job tasks alongside symptoms: "Pain 7/10 after 3 hours at desk" or "Sharp increase after lifting patient."'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Pain Diary Template PDF',
      description: 'Comprehensive general pain tracking',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'WorkSafeBC Pain Journal',
      description: 'For BC workplace back injuries',
      href: '/resources/worksafebc-pain-journal-template'
    },
    {
      title: 'Daily Pain Tracker Printable',
      description: 'Quick daily format for back pain',
      href: '/resources/daily-pain-tracker-printable'
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'Present back pain data to specialists',
      href: '/resources/how-to-track-pain-for-doctors'
    },
    {
      title: 'Nerve Pain Symptom Log',
      description: 'For sciatica and radicular pain',
      href: '/resources/nerve-pain-symptom-log'
    },
    {
      title: 'Documenting Pain for Disability',
      description: 'Back pain documentation for claims',
      href: '/resources/documenting-pain-for-disability-claim'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Chronic Back Pain Diary', url: '/resources/chronic-back-pain-diary' }
  ]
};

export const ChronicBackPainDiaryPage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default ChronicBackPainDiaryPage;
