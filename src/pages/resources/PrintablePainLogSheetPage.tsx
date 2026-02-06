/**
 * Printable Pain Log Sheet - SEO Landing Page
 * 
 * Target keyword: "printable pain log sheet"
 * Search intent: User wants a simple pain tracking sheet
 * Conversion goal: Download template → discover Pain Tracker Pro
 * 
 * Tier 1 - Immediate Survival Traffic
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'printable-pain-log-sheet',
  title: 'Printable Pain Log Sheet (Free)',
  metaTitle: 'Printable Pain Log Sheet - Free Simple Pain Tracker | Pain Tracker Pro',
  metaDescription: 'Download our free printable pain log sheet. Simple, clean format for daily pain tracking. Perfect for starting a pain diary or quick documentation.',
  keywords: [
    'printable pain log sheet',
    'pain log printable',
    'simple pain tracker',
    'pain tracking sheet',
    'pain record form',
    'pain log form',
    'print pain diary',
    'pain documentation sheet'
  ],
  
  // Above-the-fold
  badge: 'Free Download',
  headline: 'Printable Pain Log Sheet',
  subheadline: 'A simple, clean pain tracking sheet you can print and use immediately. No complicated setup—just record your pain and start seeing patterns.',
  primaryCTA: {
    text: 'Download Free PDF',
    href: '/assets/printable-pain-log-sheet.pdf',
    download: true
  },
  secondaryCTA: {
    text: 'Try Digital Version',
    href: '/start'
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/printable-pain-log-sheet.pdf',
    downloadFileName: 'printable-pain-log-sheet.pdf'
  },
  
  // Content sections
  whatIsThis: 'A pain log sheet is a straightforward tracking form with space for date, time, pain level, location, and brief notes. Unlike comprehensive pain diaries, this simple format takes just seconds to fill in. It\'s ideal for people who want to start tracking without commitment or complexity—print a few copies and see if pain tracking works for you before investing in a more detailed system.',
  
  whoShouldUse: [
    'Anyone new to pain tracking who wants to try it simply',
    'People who find detailed pain diaries overwhelming',
    'Those who need quick documentation for an upcoming appointment',
    'Caregivers tracking pain for someone who can\'t use detailed systems',
    'Anyone who prefers minimal paperwork but needs basic records'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Print multiple copies',
      description: 'Download and print 5-10 copies at once. Keep them on your nightstand, in your bag, or wherever you\'ll actually use them.'
    },
    {
      step: 2,
      title: 'Fill in when pain occurs',
      description: 'When you notice significant pain, take 30 seconds to jot down the basics: date, time, level (0-10), where it hurts, and what you were doing.'
    },
    {
      step: 3,
      title: 'Don\'t overthink it',
      description: 'This is a log, not a diary. Brief is fine. "7/10, lower back, after sitting at desk 3 hrs" tells you everything you need.'
    },
    {
      step: 4,
      title: 'Review before appointments',
      description: 'Flip through your sheets before doctor visits. Even simple logs reveal patterns you\'d otherwise miss or forget.'
    }
  ],
  
  whyItMatters: 'The best pain tracking system is the one you\'ll actually use. Complex diaries often get abandoned. Simple log sheets have staying power. Research shows that even basic pain documentation improves doctor-patient communication and leads to better treatment adjustments. Start simple—you can always add detail later once the habit is established.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Captures essential information doctors need without unnecessary complexity.',
    privacyNote: 'Simple paper format—no apps, no accounts, no data collection whatsoever.',
    legalNote: 'Even simple logs can support disability claims when kept consistently over time.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'How is this different from a pain diary?',
      answer: 'A pain log sheet is simpler and faster. It captures just the essentials: when, where, how much, brief context. A pain diary includes more detail like mood, sleep, medications, triggers, and longer notes. Use log sheets when you want quick documentation; use diaries when you need comprehensive tracking.'
    },
    {
      question: 'Is this enough for my doctor?',
      answer: 'For most routine appointments, yes. Doctors appreciate any documented tracking—it\'s better than relying on memory. For specialist consultations, disability claims, or complex cases, you may want to upgrade to a more detailed format, but this is a great starting point.'
    },
    {
      question: 'How many should I fill out per day?',
      answer: 'It depends on your pain pattern. If your pain is fairly constant, one entry per day (evening summary) works well. If your pain varies significantly, log it when changes occur—maybe 2-4 entries on a bad day. Don\'t log so often that it becomes a burden.'
    },
    {
      question: 'What if I miss days?',
      answer: 'No problem. Skip it and continue when you can. Gaps in simple logs are normal and don\'t undermine the value of the data you do collect. Don\'t try to backfill from memory—just move forward.'
    },
    {
      question: 'Should I upgrade to something more detailed?',
      answer: 'If you\'re consistently using log sheets for 2+ weeks and finding value, consider whether more detail would help. If you want to identify triggers, track medications, or need documentation for claims, upgrade to a comprehensive pain diary or try Pain Tracker Pro for automatic tracking.'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Pain Diary Template PDF',
      description: 'More comprehensive daily tracking format',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'Daily Pain Tracker Printable',
      description: 'Structured daily tracking with more detail',
      href: '/resources/daily-pain-tracker-printable'
    },
    {
      title: 'Pain Scale Chart Printable',
      description: 'Reference for consistent pain ratings',
      href: '/resources/pain-scale-chart-printable'
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'Make your logs useful for appointments',
      href: '/resources/how-to-track-pain-for-doctors'
    },
    {
      title: 'Weekly Pain Log PDF',
      description: 'See patterns at a glance',
      href: '/resources/weekly-pain-log-pdf'
    },
    {
      title: 'What to Include in a Pain Journal',
      description: 'When you\'re ready for more detail',
      href: '/resources/what-to-include-in-pain-journal'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Printable Pain Log Sheet', url: '/resources/printable-pain-log-sheet' }
  ]
};

export const PrintablePainLogSheetPage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default PrintablePainLogSheetPage;
