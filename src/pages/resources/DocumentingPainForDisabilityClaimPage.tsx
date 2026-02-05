/**
 * Documenting Pain for Disability Claim - SEO Landing Page
 * 
 * Target keyword: "documenting pain for disability claim"
 * Search intent: User needs documentation for disability benefits
 * Conversion goal: Guide → Download templates → discover Pain Tracker Pro
 * 
 * HIGH VALUE PAGE - Tier 3 Disability/Legal Documentation
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'documenting-pain-for-disability-claim',
  title: 'How to Document Pain for a Disability Claim',
  metaTitle: 'Documenting Pain for Disability Claim - Complete Guide | Pain Tracker Pro',
  metaDescription: 'Learn how to document chronic pain for disability claims. Expert guide on what evidence you need, how to maintain a pain diary, and what WorkSafeBC and insurance adjusters look for.',
  keywords: [
    'documenting pain for disability claim',
    'pain diary for disability',
    'chronic pain disability evidence',
    'pain journal disability benefits',
    'worksafebc pain documentation',
    'disability claim pain records',
    'chronic pain evidence',
    'pain documentation for insurance'
  ],
  
  // Above-the-fold
  badge: 'Essential Guide',
  headline: 'How to Document Pain for a Disability Claim',
  subheadline: 'A complete guide to building the evidence that supports your claim. Learn what adjusters look for, what mistakes to avoid, and how to create documentation that accurately represents your experience.',
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
    downloadUrl: '/assets/disability-documentation-guide.pdf',
    downloadFileName: 'disability-documentation-guide.pdf'
  },
  
  // Content sections
  whatIsThis: 'This guide explains how to create and maintain pain documentation that supports disability claims—whether for WorkSafeBC, long-term disability insurance, or government benefits. Disability claims often fail not because the pain isn\'t real, but because the documentation doesn\'t effectively communicate the reality of living with chronic pain. The right records can make the difference between approval and denial.',
  
  whoShouldUse: [
    'Anyone preparing to file a disability claim for chronic pain',
    'People whose initial claim was denied and are preparing an appeal',
    'Patients building evidence before they need it (smart preparation)',
    'Workers documenting pain for WorkSafeBC or workplace injury claims',
    'Anyone whose doctor suggested better documentation would help their case'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Start tracking immediately',
      description: 'Don\'t wait until you file a claim. Begin consistent daily tracking now. Records that predate your claim are more credible than records started after filing. Even if you\'re months from filing, start today.'
    },
    {
      step: 2,
      title: 'Document functional impact',
      description: 'Adjusters care less about pain numbers and more about how pain affects your life. Record what you couldn\'t do: couldn\'t cook dinner, had to rest after showering, missed your child\'s event. Specific functional limitations are powerful evidence.'
    },
    {
      step: 3,
      title: 'Be consistent, not perfect',
      description: 'Daily entries for weeks or months are more valuable than detailed entries for a few days. If you miss a day, don\'t backfill. Gaps are normal; fabrication is disqualifying. Consistency demonstrates persistence.'
    },
    {
      step: 4,
      title: 'Include your good days',
      description: 'Counterintuitively, documenting better days strengthens your claim. It shows you\'re being honest and not exaggerating. A pattern of mostly difficult days with occasional better ones is more credible than constant 10/10 pain.'
    }
  ],
  
  whyItMatters: 'Disability claims are decided by people who\'ve never met you, reading documents you\'ve submitted. They see hundreds of claims—many exaggerated, some fraudulent. Your documentation needs to stand out as credible, consistent, and specific. Research on disability adjudication shows that claims with systematic daily tracking are approved at significantly higher rates than those relying on sporadic medical records alone. The investment in documentation directly impacts your outcome.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'This guide aligns with recommendations from pain management specialists and disability attorneys.',
    privacyNote: 'Your documentation stays completely private. Pain Tracker Pro keeps all data locally on your device.',
    legalNote: 'Structured to meet WorkSafeBC and insurance documentation standards. Not legal advice—consult a professional for your specific case.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'When should I start documenting?',
      answer: 'Now. The best time to start was when your pain began. The second best time is today. Claims are strengthened by long tracking histories. Starting documentation before filing a claim removes any appearance that you\'re building evidence strategically. If you\'re already in the claims process, start immediately—late documentation is better than none.'
    },
    {
      question: 'What\'s the most common documentation mistake?',
      answer: 'Inconsistency. Starting strong, then stopping for weeks, then picking back up—this undermines credibility. Adjusters wonder: was the pain actually that bad if you couldn\'t be bothered to track it? Better to do brief daily entries than detailed entries that peter out. Pain Tracker Pro helps with reminders and quick-entry options.'
    },
    {
      question: 'Should I rate my pain at 10/10 to show how bad it is?',
      answer: 'No. Constant maximum ratings actually hurt your credibility. Adjusters know that even severe chronic pain fluctuates. More believable: "Most days 6-7, flares to 8-9 twice weekly, occasional 4-5 days." This pattern shows you\'re being honest, which makes your difficult days more credible.'
    },
    {
      question: 'Do I need medical records too, or just my diary?',
      answer: 'Both. Your pain diary documents daily reality; medical records provide clinical validation. They serve different purposes. Medical records alone often understate daily impact. Pain diaries alone lack medical authority. Together, they tell a complete story. Ensure your diary notes align with your medical visits and treatments.'
    },
    {
      question: 'Can my pain diary be used against me?',
      answer: 'Theoretically, inconsistencies could be questioned. But the bigger risk is having no documentation. A well-maintained, honest diary showing the reality of chronic pain—including better days—is an asset. The risk of good documentation is far lower than the risk of no documentation.'
    },
    {
      question: 'How long should I track before filing a claim?',
      answer: 'Minimum 30 days of consistent tracking before filing. Ideal is 60-90 days. For appeals of denied claims, continue tracking through the entire appeals process—sometimes 6-12 months. The longer your documented history, the stronger your case.'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Pain Diary Template PDF',
      description: 'Comprehensive template for daily tracking',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'WorkSafeBC Pain Journal Template',
      description: 'Template designed for BC workplace injury claims',
      href: '/resources/worksafebc-pain-journal-template'
    },
    {
      title: 'Daily Pain Tracker Printable',
      description: 'Simple format for consistent daily entries',
      href: '/resources/daily-pain-tracker-printable'
    },
    {
      title: 'Weekly Pain Log PDF',
      description: 'See patterns that support your claim',
      href: '/resources/weekly-pain-log-pdf'
    },
    {
      title: 'Symptom Tracker Printable',
      description: 'Document symptoms beyond pain levels',
      href: '/resources/symptom-tracker-printable'
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'Ensure your medical records support your claim',
      href: '/resources/how-to-track-pain-for-doctors'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Documenting Pain for Disability Claim', url: '/resources/documenting-pain-for-disability-claim' }
  ]
};

export const DocumentingPainForDisabilityClaimPage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default DocumentingPainForDisabilityClaimPage;
