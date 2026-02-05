/**
 * Migraine Pain Diary Printable - SEO Landing Page
 * 
 * Target keyword: "migraine pain diary printable"
 * Search intent: User needs migraine-specific tracking
 * Conversion goal: Download template → discover Pain Tracker Pro
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'migraine-pain-diary-printable',
  title: 'Migraine Pain Diary Printable (Free)',
  metaTitle: 'Migraine Pain Diary Printable - Free Headache Tracker Template | Pain Tracker Pro',
  metaDescription: 'Download our free migraine diary printable. Track headache intensity, auras, triggers, medications, and duration. Essential for identifying migraine patterns and treatment effectiveness.',
  keywords: [
    'migraine pain diary printable',
    'migraine tracker',
    'headache diary template',
    'migraine log',
    'migraine journal',
    'headache tracker printable',
    'migraine trigger tracker',
    'migraine symptom log'
  ],
  
  // Above-the-fold
  badge: 'Free Download',
  headline: 'Migraine Pain Diary Printable',
  subheadline: 'Track migraine-specific symptoms: auras, triggers, duration, location, and treatments. Designed to help you identify patterns and find what works.',
  primaryCTA: {
    text: 'Download Free PDF',
    href: '/assets/migraine-pain-diary.pdf',
    download: true
  },
  secondaryCTA: {
    text: 'Try Digital Version',
    href: '/start'
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/migraine-pain-diary.pdf',
    downloadFileName: 'migraine-pain-diary.pdf'
  },
  
  // Content sections
  whatIsThis: 'A migraine diary is a specialized tracking tool designed for the unique aspects of migraine headaches. Unlike general pain diaries, it captures migraine-specific data: aura symptoms (visual disturbances, numbness, speech issues), prodrome signs (early warning symptoms), headache phase details (location, quality, intensity), postdrome effects ("migraine hangover"), triggers (foods, sleep, stress, hormones), and treatment effectiveness. This comprehensive picture helps identify patterns that general tracking misses.',
  
  whoShouldUse: [
    'Anyone with recurring migraines trying to identify triggers',
    'Patients working with neurologists or headache specialists',
    'People testing new migraine medications or treatments',
    'Those with menstrual migraines tracking hormonal patterns',
    'Anyone needing documentation for disability or accommodation requests'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Start before the headache',
      description: 'If you notice prodrome symptoms (yawning, mood changes, food cravings), note them immediately. Many migraine patterns become clear only when you capture the pre-headache phase.'
    },
    {
      step: 2,
      title: 'Document the complete episode',
      description: 'For each migraine, record: when it started, any aura symptoms, headache location and quality, peak intensity, total duration, and recovery time. Include treatments tried and how well they worked.'
    },
    {
      step: 3,
      title: 'Track potential triggers',
      description: 'Note what you ate, how you slept, stress levels, weather changes, and hormonal factors in the 24-48 hours before. Not everything is a trigger, but patterns emerge over time.'
    },
    {
      step: 4,
      title: 'Review monthly for patterns',
      description: 'After 2-3 months, analyze your data. What triggers appear repeatedly? Which treatments work fastest? Do migraines cluster at certain times? This analysis guides prevention strategies.'
    }
  ],
  
  whyItMatters: 'Research shows that detailed migraine diaries are the most effective tool for identifying triggers—more effective than allergy testing or elimination diets alone. A landmark study found that patients who kept migraine diaries for 3+ months were able to reduce migraine frequency by 30-50% through trigger avoidance alone, before any medication changes. The diary is literally a treatment in itself.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Includes all elements recommended by the American Headache Society for migraine tracking.',
    privacyNote: 'Paper format keeps your detailed health information completely private.',
    legalNote: 'Comprehensive migraine documentation is essential for FMLA and disability accommodation requests.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'What migraine triggers should I track?',
      answer: 'Common triggers include: sleep changes (too much or too little), stress, hormone changes (menstruation), certain foods (aged cheese, alcohol, processed meats, MSG, artificial sweeteners), weather changes, bright lights, strong smells, skipped meals, and dehydration. Track what\'s relevant to your life—you\'ll discover your personal triggers over time.'
    },
    {
      question: 'Should I track headache-free days too?',
      answer: 'Yes! Tracking migraine-free days is crucial for identifying what\'s different about them. Did you sleep better? Eat differently? Have less stress? Understanding your good days can be as valuable as understanding your bad ones. It also provides baseline data showing migraine frequency.'
    },
    {
      question: 'How do I know if something is actually a trigger?',
      answer: 'A true trigger will correlate with migraines consistently—not every time, but frequently. If you get a migraine within 24 hours of consuming a food at least 50% of the time across multiple exposures, that\'s likely a trigger. One-time correlations are usually coincidence. That\'s why tracking over months matters.'
    },
    {
      question: 'What information do neurologists want from my diary?',
      answer: 'Neurologists want: migraine frequency (attacks per month), average duration, intensity pattern, aura presence, medication usage and effectiveness, identified triggers, and impact on daily function. A good diary provides all of this. Bring a summary to appointments rather than the raw diary.'
    },
    {
      question: 'Can this help me qualify for disability or accommodations?',
      answer: 'Comprehensive migraine documentation is essential for FMLA, ADA accommodations, or disability claims. It demonstrates frequency, severity, and functional impact. Document not just the headache, but the total time affected including prodrome and postdrome, and specific activities you couldn\'t perform.'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Pain Diary Template PDF',
      description: 'General pain tracking for non-migraine days',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'Symptom Tracker Printable',
      description: 'Track accompanying symptoms like nausea and fatigue',
      href: '/resources/symptom-tracker-printable'
    },
    {
      title: 'Monthly Pain Tracker',
      description: 'See your migraine patterns month-over-month',
      href: '/resources/monthly-pain-tracker-printable'
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'Presenting your migraine data effectively',
      href: '/resources/how-to-track-pain-for-doctors'
    },
    {
      title: 'Documenting Pain for Disability',
      description: 'Using migraine records for claims',
      href: '/resources/documenting-pain-for-disability-claim'
    },
    {
      title: 'Daily Pain Tracker Printable',
      description: 'Quick daily format for headache-free day tracking',
      href: '/resources/daily-pain-tracker-printable'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Migraine Pain Diary Printable', url: '/resources/migraine-pain-diary-printable' }
  ]
};

export const MigrainePainDiaryPrintablePage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default MigrainePainDiaryPrintablePage;
