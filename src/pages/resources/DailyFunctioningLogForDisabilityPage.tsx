/**
 * Daily Functioning Log for Disability - SEO Landing Page
 * 
 * Target keyword: "daily functioning log for disability"
 * Search intent: User needs to document functional limitations for disability
 * Conversion goal: Download template → discover Pain Tracker Pro
 * 
 * Tier 3 - Disability / Legal Documentation
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'daily-functioning-log-for-disability',
  title: 'Daily Functioning Log for Disability (Free)',
  metaTitle: 'Daily Functioning Log for Disability - Free Functional Limitations Tracker | Pain Tracker Pro',
  metaDescription: 'Download our free daily functioning log for disability documentation. Track what you can and cannot do each day—the key evidence disability evaluators need.',
  keywords: [
    'daily functioning log for disability',
    'functional limitations diary',
    'disability activity log',
    'functional capacity diary',
    'adl tracking disability',
    'activities of daily living log',
    'disability functioning record',
    'functional limitations tracker'
  ],
  
  // Above-the-fold
  badge: 'Free Download',
  headline: 'Daily Functioning Log for Disability',
  subheadline: 'Track what you can and cannot do each day. Disability evaluators care about functional limitations—this log documents exactly what they need to see.',
  primaryCTA: {
    text: 'Download Free PDF',
    href: '/assets/daily-functioning-log.pdf',
    download: true
  },
  secondaryCTA: {
    text: 'Try Digital Version',
    href: '/start'
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/daily-functioning-log.pdf',
    downloadFileName: 'daily-functioning-log.pdf'
  },
  
  // Content sections
  whatIsThis: 'A daily functioning log documents your functional capacity—what activities you could and couldn\'t perform each day. Unlike pain diaries that focus on pain levels, this log focuses on function: self-care activities (bathing, dressing), household tasks, mobility, concentration, and social activities. This is the evidence disability evaluators actually use to determine whether you can work.',
  
  whoShouldUse: [
    'Anyone building a disability benefits case',
    'People preparing for functional capacity evaluations',
    'Those whose disability claim was denied for insufficient functional evidence',
    'Individuals whose pain significantly limits daily activities',
    'Anyone who needs to demonstrate inability to maintain work activities'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Track activities, not just pain',
      description: 'For each day, note what you tried to do and what you actually could do. "Attempted to vacuum, had to stop after 5 minutes" is functional evidence. "Pain was 7/10" is not.'
    },
    {
      step: 2,
      title: 'Document rest and recovery needs',
      description: 'Note how long activities take you (vs. a healthy person), rest breaks needed, and recovery time required. "Showered, then needed to rest 30 minutes" shows functional impact.'
    },
    {
      step: 3,
      title: 'Include what you avoided',
      description: 'Activities you didn\'t attempt due to anticipated limitations matter too. "Did not attempt grocery shopping—know I can\'t stand/walk that long" is relevant.'
    },
    {
      step: 4,
      title: 'Be specific and honest',
      description: 'Vague entries are weak evidence. Specific entries are strong: "Could not lift pot of water for pasta—had to ask spouse for help." Include good and bad days for credibility.'
    }
  ],
  
  whyItMatters: 'Disability determinations are based on functional capacity, not pain levels. Evaluators ask: Can you sit for 6 hours? Lift 10 pounds? Concentrate on tasks? Follow instructions? Your daily functioning log directly addresses these questions with documented evidence. This log often provides evidence that pain diaries and even medical records don\'t capture.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Tracks activities of daily living (ADLs) and instrumental ADLs used in functional capacity assessments.',
    privacyNote: 'Paper format keeps your detailed functional limitations documentation private until you submit it.',
    legalNote: 'Functional documentation is the key evidence in disability determinations—this format supports that need.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'What activities should I track?',
      answer: 'Track: self-care (bathing, dressing, grooming), household tasks (cooking, cleaning, laundry), mobility (walking, standing, sitting duration), cognitive tasks (reading, concentrating, following instructions), and social activities. Note what you attempted, completed, couldn\'t finish, and avoided.'
    },
    {
      question: 'How is this different from a pain diary?',
      answer: 'Pain diaries track symptoms; functioning logs track consequences. A pain diary says "pain was 7/10." A functioning log says "could not lift laundry basket due to pain" and "needed help dressing because couldn\'t raise arms." Evaluators need functional evidence more than pain scores.'
    },
    {
      question: 'What does "functional capacity" mean?',
      answer: 'Functional capacity is your ability to perform physical, cognitive, and social tasks. For disability purposes, it\'s assessed against work requirements: Can you sit for 6 hours? Stand/walk for 6 hours? Lift 10-50 pounds? Maintain concentration? Follow instructions? Your log should address these.'
    },
    {
      question: 'Should I track what I can do, or just what I can\'t?',
      answer: 'Both. What you can do establishes your baseline capacity. What you can\'t do establishes your limitations. "Can prepare simple meals but cannot stand long enough to cook full dinners" is more informative than "can\'t cook" or "can cook."'
    },
    {
      question: 'How does this help my disability case?',
      answer: 'Disability decisions turn on functional evidence. Your log transforms vague claims ("I can\'t work") into specific documentation ("On 18 of 30 days, I could not sit for more than 30 minutes; I required assistance with bathing 12 times; I could not complete any household tasks without rest breaks"). Specifics win cases.'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Documenting Pain for Disability Claims',
      description: 'Comprehensive disability documentation guide',
      href: '/resources/documenting-pain-for-disability-claim'
    },
    {
      title: 'Pain Journal for Disability Benefits',
      description: 'Pain documentation for disability',
      href: '/resources/pain-journal-for-disability-benefits'
    },
    {
      title: 'Pain Diary Template PDF',
      description: 'Complement with pain tracking',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'Symptom Tracker Printable',
      description: 'Track symptoms affecting function',
      href: '/resources/symptom-tracker-printable'
    },
    {
      title: 'Chronic Pain Diary Template',
      description: 'Long-term documentation for chronic conditions',
      href: '/resources/chronic-pain-diary-template'
    },
    {
      title: 'Monthly Pain Tracker',
      description: 'Show functional patterns over time',
      href: '/resources/monthly-pain-tracker-printable'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Daily Functioning Log for Disability', url: '/resources/daily-functioning-log-for-disability' }
  ]
};

export const DailyFunctioningLogForDisabilityPage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default DailyFunctioningLogForDisabilityPage;
