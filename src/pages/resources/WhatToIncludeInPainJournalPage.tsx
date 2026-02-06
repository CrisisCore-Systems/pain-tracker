/**
 * What to Include in a Pain Journal - SEO Landing Page
 * 
 * Target keyword: "what to include in a pain journal"
 * Search intent: User wants guidance on pain diary content
 * Conversion goal: Guide → Download templates → discover Pain Tracker Pro
 * 
 * Tier 2 - Medical & Appointment Intent
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'what-to-include-in-pain-journal',
  title: 'What to Include in a Pain Journal',
  metaTitle: 'What to Include in a Pain Journal - Complete Checklist | Pain Tracker Pro',
  metaDescription: 'Complete guide to what to include in a pain journal. Learn the essential elements for effective pain tracking: intensity, location, triggers, medications, and more.',
  keywords: [
    'what to include in a pain journal',
    'pain journal contents',
    'pain diary elements',
    'what to write in pain diary',
    'pain tracking checklist',
    'pain journal guide',
    'how to keep a pain journal',
    'pain diary information'
  ],
  
  // Above-the-fold
  badge: 'Complete Guide',
  headline: 'What to Include in a Pain Journal',
  subheadline: 'A complete checklist of essential elements for effective pain tracking. Know exactly what to document so your pain journal becomes a powerful tool for better care.',
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
    downloadUrl: '/assets/pain-journal-checklist.pdf',
    downloadFileName: 'pain-journal-checklist.pdf'
  },
  
  // Content sections
  whatIsThis: 'This guide covers every element worth including in a pain journal, from essential must-haves to optional details that provide additional insight. Understanding what to track—and what\'s just noise—helps you create documentation that\'s useful without being overwhelming. A well-designed pain journal captures the information that leads to better treatment decisions.',
  
  whoShouldUse: [
    'Anyone starting a new pain journal who wants to do it right',
    'People whose current tracking doesn\'t seem to capture what matters',
    'Patients whose doctors asked them to "keep a pain diary" without guidance',
    'Those preparing templates or spreadsheets for pain tracking',
    'Anyone who\'s tried pain tracking before but abandoned it as too complicated'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Start with the essentials only',
      description: 'Begin with just 5 elements: date/time, pain level (0-10), pain location, what made it worse, what made it better. Add more only after you\'ve established a consistent habit with these basics.'
    },
    {
      step: 2,
      title: 'Add relevant secondary elements',
      description: 'Once basic tracking is routine (1-2 weeks), add elements relevant to your situation: medications and timing, sleep quality, mood, activity level. Choose based on what you\'re trying to understand.'
    },
    {
      step: 3,
      title: 'Customize for your condition',
      description: 'Different conditions need different details. Migraines need aura tracking. Fibromyalgia needs fatigue. Back pain needs activity notes. Tailor your journal to what matters for your specific situation.'
    },
    {
      step: 4,
      title: 'Review and refine monthly',
      description: 'After a month, assess what\'s useful. Are you using all the data you\'re collecting? Can you see patterns? Remove elements that aren\'t helping and add any you\'re wishing you had.'
    }
  ],
  
  whyItMatters: 'The most common pain journal mistake is trying to track too much. Research shows that complex tracking systems are abandoned within 2-3 weeks. Simple, focused journals with just the essential elements are maintained long-term and produce better clinical outcomes. Quality and consistency beat quantity every time.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Elements based on clinical pain assessment standards and research on effective patient self-monitoring.',
    privacyNote: 'Your journal stays private. These are guidelines for your personal tracking, not data we collect.',
    legalNote: 'Comprehensive, consistent journals meeting these standards are strong evidence for disability claims.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'What are the absolute must-have elements?',
      answer: 'The essential five: (1) Date and time, (2) Pain intensity (0-10), (3) Pain location, (4) What made it worse, (5) What made it better. Everything else is optional enhancement. If you only track these five things consistently, you\'ll have valuable data.'
    },
    {
      question: 'How detailed should my descriptions be?',
      answer: 'Brief and specific beats long and vague. "Sharp pain in lower right back after sitting 2 hours" is better than "my back hurt a lot today." Aim for one sentence per element. If it takes more than 5 minutes to complete an entry, you\'re overdoing it.'
    },
    {
      question: 'Should I track sleep?',
      answer: 'Yes, if sleep issues correlate with your pain—and they usually do. Track two things: hours slept and quality (good/fair/poor). You don\'t need elaborate sleep diaries. The goal is seeing whether bad sleep nights predict bad pain days.'
    },
    {
      question: 'What about tracking food and diet?',
      answer: 'Only if you suspect food triggers. For most chronic pain conditions, detailed food tracking isn\'t necessary and adds burden without benefit. Exceptions: migraines (common food triggers), inflammatory conditions (anti-inflammatory diet impact), or if you\'ve noticed specific food correlations.'
    },
    {
      question: 'How do I track location if pain moves around?',
      answer: 'Note primary location and any radiation or spread. "Primary: lower back. Radiates to: left hip, left leg." If your pain is widespread (like fibromyalgia), use a body map or note general regions. Consistency in how you describe location matters more than precision.'
    },
    {
      question: 'Should I include emotional/psychological notes?',
      answer: 'Yes, but keep it simple and factual. "High stress day - work deadline" or "Mood: low" is useful context. Avoid deep emotional processing in your pain journal—that\'s for a different kind of journal. The goal is seeing correlations between mood/stress and pain patterns.'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Pain Diary Template PDF',
      description: 'Template with all essential elements included',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'What information doctors actually need',
      href: '/resources/how-to-track-pain-for-doctors'
    },
    {
      title: 'Pain Scale Chart Printable',
      description: 'Reference for consistent pain intensity ratings',
      href: '/resources/pain-scale-chart-printable'
    },
    {
      title: 'Symptom Tracker Printable',
      description: 'When you need to track beyond basic pain',
      href: '/resources/symptom-tracker-printable'
    },
    {
      title: 'Daily Pain Tracker Printable',
      description: 'Simple format for essential elements only',
      href: '/resources/daily-pain-tracker-printable'
    },
    {
      title: 'Documenting Pain for Disability',
      description: 'When documentation needs are more extensive',
      href: '/resources/documenting-pain-for-disability-claim'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'What to Include in a Pain Journal', url: '/resources/what-to-include-in-pain-journal' }
  ]
};

export const WhatToIncludeInPainJournalPage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default WhatToIncludeInPainJournalPage;
