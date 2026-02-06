/**
 * Symptom Tracker Printable - SEO Landing Page
 * 
 * Target keyword: "symptom tracker printable"
 * Search intent: User wants to track symptoms beyond just pain
 * Conversion goal: Download template → discover Pain Tracker Pro
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'symptom-tracker-printable',
  title: 'Symptom Tracker Printable (Free)',
  metaTitle: 'Symptom Tracker Printable - Free Daily Symptom Log | Pain Tracker Pro',
  metaDescription: 'Download our free symptom tracker printable. Track fatigue, sleep, mood, energy, and other symptoms alongside pain. Perfect for chronic illness management and diagnosis.',
  keywords: [
    'symptom tracker printable',
    'daily symptom log',
    'symptom diary template',
    'chronic illness tracker',
    'fatigue tracker',
    'symptom journal',
    'health symptom log',
    'symptom monitoring sheet'
  ],
  
  // Above-the-fold
  badge: 'Free Download',
  headline: 'Symptom Tracker Printable',
  subheadline: 'Track symptoms beyond pain: fatigue, sleep quality, mood, energy levels, and more. Essential for chronic illness management and identifying patterns that pain diaries miss.',
  primaryCTA: {
    text: 'Download Free PDF',
    href: '/assets/symptom-tracker.pdf',
    download: true
  },
  secondaryCTA: {
    text: 'Try Digital Version',
    href: '/start'
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/symptom-tracker.pdf',
    downloadFileName: 'symptom-tracker.pdf'
  },
  
  // Content sections
  whatIsThis: 'A symptom tracker goes beyond pain to capture the full picture of chronic illness. It includes sections for fatigue levels, sleep quality and duration, mood, cognitive function ("brain fog"), energy levels, and other symptoms specific to your condition. Many chronic conditions—fibromyalgia, ME/CFS, lupus, MS—involve symptoms that are as debilitating as pain but often overlooked in standard pain diaries.',
  
  whoShouldUse: [
    'People with chronic illnesses that involve more than just pain',
    'Patients trying to identify triggers for symptom flares',
    'Anyone going through the diagnosis process with multiple symptoms',
    'People tracking medication side effects alongside benefits',
    'Individuals whose fatigue or brain fog impacts daily life as much as pain'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Customize for your symptoms',
      description: 'The template includes common symptoms, but add or remove based on your condition. If you have MS, you might add spasticity. If you have fibromyalgia, add tender points. Make it yours.'
    },
    {
      step: 2,
      title: 'Rate symptoms at the same time daily',
      description: 'Evening is often best—you can assess the whole day. Rate each symptom on a simple scale (like 0-5 or mild/moderate/severe). Keep it quick to maintain consistency.'
    },
    {
      step: 3,
      title: 'Note correlations in the margins',
      description: 'Did you sleep poorly and have worse brain fog? Did exercise help or hurt? Brief margin notes capture the context that makes patterns meaningful.'
    },
    {
      step: 4,
      title: 'Look for symptom clusters',
      description: 'After a few weeks, review for patterns. Many people discover their symptoms cluster—when fatigue is high, pain is high, mood is low. Understanding these clusters helps predict and prepare for difficult periods.'
    }
  ],
  
  whyItMatters: 'Research shows that chronic pain rarely exists in isolation. A 2020 study found that 80% of chronic pain patients also experience significant fatigue, sleep disturbance, and mood changes—yet standard pain diaries don\'t capture these. Doctors treating only the pain often miss the bigger picture. A comprehensive symptom tracker reveals the interconnections that lead to better treatment strategies.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Captures symptoms that research shows are interconnected with chronic pain but often under-reported.',
    privacyNote: 'Paper format means your complete health picture stays completely private.',
    legalNote: 'Multi-symptom documentation strengthens disability claims by showing total functional impact.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'How is this different from a pain diary?',
      answer: 'A pain diary focuses on pain intensity, location, and triggers. A symptom tracker captures the broader picture: fatigue, sleep, mood, cognitive function, and other symptoms that affect quality of life. Many people use both—a pain diary for detailed pain tracking and a symptom tracker for the overall picture.'
    },
    {
      question: 'What symptoms should I track?',
      answer: 'Start with the basics: pain, fatigue, sleep quality, mood, and energy. Add symptoms specific to your condition: brain fog for fibromyalgia, stiffness for arthritis, numbness for neuropathy. Don\'t track more than 8-10 symptoms or it becomes overwhelming. Focus on symptoms that significantly impact your daily life.'
    },
    {
      question: 'How do I rate symptoms that are hard to quantify like "brain fog"?',
      answer: 'Use functional descriptions rather than trying to be precise. For brain fog: 0 = clear thinking, 1 = slightly slower than normal, 2 = noticeable difficulty concentrating, 3 = significant cognitive impairment, 4 = cannot function normally. The key is consistency in your own rating system.'
    },
    {
      question: 'Will doctors actually look at all this data?',
      answer: 'Most doctors appreciate concise summaries rather than pages of raw data. Use your symptom tracker to create a one-page summary: "Over the past month, my average fatigue was 3/5, sleep quality 2/5, and I noticed fatigue and brain fog consistently correlate." The tracker is your source data; the summary is for doctor visits.'
    },
    {
      question: 'How long should I track before seeing patterns?',
      answer: 'Two weeks gives you preliminary patterns. A month is usually enough to see clear correlations. For menstrual-related symptoms, track at least two full cycles. For seasonal patterns, you may need 3-6 months. The longer you track, the more confident you can be in the patterns you observe.'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Pain Diary Template PDF',
      description: 'Detailed pain tracking to complement symptom logging',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'Daily Pain Tracker Printable',
      description: 'Quick daily format for pain alongside symptoms',
      href: '/resources/daily-pain-tracker-printable'
    },
    {
      title: 'Fibromyalgia Pain Diary',
      description: 'Specialized tracker for fibromyalgia symptoms',
      href: '/resources/fibromyalgia-pain-diary'
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'What symptom data doctors actually want',
      href: '/resources/how-to-track-pain-for-doctors'
    },
    {
      title: 'Documenting Pain for Disability',
      description: 'Using symptom data in disability claims',
      href: '/resources/documenting-pain-for-disability-claim'
    },
    {
      title: 'Monthly Pain Tracker',
      description: 'See symptom patterns over longer periods',
      href: '/resources/monthly-pain-tracker-printable'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Symptom Tracker Printable', url: '/resources/symptom-tracker-printable' }
  ]
};

export const SymptomTrackerPrintablePage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default SymptomTrackerPrintablePage;
