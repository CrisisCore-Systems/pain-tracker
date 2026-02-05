/**
 * Pain Scale Chart Printable - SEO Landing Page
 * 
 * Target keyword: "pain scale chart printable"
 * Search intent: User needs a visual reference for rating pain
 * Conversion goal: Download chart → discover Pain Tracker Pro
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'pain-scale-chart-printable',
  title: 'Pain Scale Chart Printable (0-10 NRS)',
  metaTitle: 'Pain Scale Chart Printable - Free 0-10 Visual Reference | Pain Tracker Pro',
  metaDescription: 'Download our free printable pain scale chart. Visual 0-10 NRS pain rating guide with descriptions for each level. Used by doctors and hospitals worldwide.',
  keywords: [
    'pain scale chart printable',
    'pain rating scale',
    '0-10 pain scale',
    'numeric pain scale',
    'NRS pain scale',
    'pain level chart',
    'visual pain scale',
    'pain assessment chart'
  ],
  
  // Above-the-fold
  badge: 'Free Download',
  headline: 'Pain Scale Chart Printable',
  subheadline: 'A visual reference guide for the 0-10 Numeric Rating Scale (NRS) used by doctors worldwide. Rate your pain consistently and communicate clearly with healthcare providers.',
  primaryCTA: {
    text: 'Download Free PDF',
    href: '/assets/pain-scale-chart.pdf',
    download: true
  },
  secondaryCTA: {
    text: 'Try Digital Tracker',
    href: '/start'
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/pain-scale-chart.pdf',
    downloadFileName: 'pain-scale-chart.pdf'
  },
  
  // Content sections
  whatIsThis: 'The pain scale chart is a visual reference for the 0-10 Numeric Rating Scale (NRS), the most widely used pain measurement tool in clinical settings worldwide. Each level includes a description of what that pain intensity typically feels like and how it affects daily activities. Having a consistent reference ensures you rate your pain the same way every time—critical for tracking changes and communicating with healthcare providers.',
  
  whoShouldUse: [
    'Anyone tracking pain who wants consistent ratings',
    'Patients preparing for medical appointments who need to describe pain clearly',
    'People new to pain tracking who aren\'t sure how to rate their pain',
    'Caregivers helping loved ones communicate their pain levels',
    'Healthcare providers who want a patient-friendly reference to share'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Print and keep accessible',
      description: 'Print the chart and keep it with your pain diary or tracker. Having it visible ensures you reference it consistently rather than guessing.'
    },
    {
      step: 2,
      title: 'Read the functional descriptions',
      description: 'The key to accurate rating isn\'t just the number—it\'s matching your experience to the description. A "6" isn\'t just moderate-to-severe; it\'s pain that makes normal activities difficult.'
    },
    {
      step: 3,
      title: 'Rate based on function, not comparison',
      description: 'Rate based on how pain affects YOUR activities, not compared to others or to your worst day ever. Your 7 might look different from someone else\'s 7, and that\'s okay.'
    },
    {
      step: 4,
      title: 'Use the same anchor points consistently',
      description: 'Over time, calibrate your personal scale. If you know your typical flare is a "7," that becomes your reference point. Consistency matters more than absolute accuracy.'
    }
  ],
  
  whyItMatters: 'The 0-10 pain scale is the international standard because it\'s simple and comparable across time and providers. But research shows that without guidance, people rate inconsistently—sometimes based on mood, sometimes compared to their worst day, sometimes compared to others. A visual reference chart improves rating consistency by 40-60%, making your pain diary data far more useful for clinical decision-making.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'The 0-10 NRS is the gold standard for clinical pain assessment, used by hospitals and pain clinics worldwide.',
    privacyNote: 'Simple printable chart with no tracking or data collection of any kind.',
    legalNote: 'Consistent pain ratings using established scales are more credible in disability evaluations.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'What do the numbers actually mean?',
      answer: '0 = No pain. 1-3 = Mild pain (noticeable but doesn\'t interfere with activities). 4-6 = Moderate pain (interferes with concentration and activities). 7-9 = Severe pain (significantly limits activities, hard to think about anything else). 10 = Worst imaginable pain (completely incapacitating, emergency level).'
    },
    {
      question: 'Should I rate my current pain or average pain?',
      answer: 'Specify which you\'re rating. Current pain is useful for tracking fluctuations. Average pain (over a day or week) is useful for overall trends. Many trackers include both. When talking to doctors, they typically want your current pain plus your average and worst over the past week.'
    },
    {
      question: 'What if my pain never goes below 4?',
      answer: 'That\'s common with chronic pain and doesn\'t mean you\'re rating wrong. Your personal scale might range from 4-9 instead of 0-10. What matters is consistency within your range. You might also note your baseline (4) separately from flare levels to give doctors context.'
    },
    {
      question: 'Why not use faces or other scales?',
      answer: 'Face scales (Wong-Baker) are great for children or people with language barriers. The 0-10 numeric scale is preferred for adults because it\'s more precise and standardized across healthcare settings. If you prefer faces, you can use them—just be consistent.'
    },
    {
      question: 'How accurate do I need to be?',
      answer: 'Perfect accuracy isn\'t the goal—consistency is. Whether you call your pain a 6 or a 7 matters less than rating similar pain the same way each time. Trends and changes are what doctors use for treatment decisions, not absolute numbers.'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Pain Diary Template PDF',
      description: 'Track your pain using the 0-10 scale daily',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'Daily Pain Tracker Printable',
      description: 'Simple daily format using the pain scale',
      href: '/resources/daily-pain-tracker-printable'
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'What pain information doctors actually need',
      href: '/resources/how-to-track-pain-for-doctors'
    },
    {
      title: 'Symptom Tracker Printable',
      description: 'Track symptoms beyond pain intensity',
      href: '/resources/symptom-tracker-printable'
    },
    {
      title: 'Weekly Pain Log PDF',
      description: 'See your pain scale ratings over a week',
      href: '/resources/weekly-pain-log-pdf'
    },
    {
      title: 'Documenting Pain for Disability',
      description: 'How pain ratings support your claim',
      href: '/resources/documenting-pain-for-disability-claim'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Scale Chart Printable', url: '/resources/pain-scale-chart-printable' }
  ]
};

export const PainScaleChartPrintablePage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default PainScaleChartPrintablePage;
