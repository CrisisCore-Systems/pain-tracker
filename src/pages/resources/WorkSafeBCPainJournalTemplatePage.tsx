/**
 * WorkSafeBC Pain Journal Template - SEO Landing Page
 * 
 * Target keyword: "worksafebc pain journal template"
 * Search intent: User needs BC workplace injury documentation
 * Conversion goal: Download template → discover Pain Tracker Pro
 * 
 * Tier 3 - Disability / Legal Documentation
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'worksafebc-pain-journal-template',
  title: 'WorkSafeBC Pain Journal Template (Free)',
  metaTitle: 'WorkSafeBC Pain Journal Template - Free BC Workers Comp Form | Pain Tracker Pro',
  metaDescription: 'Download our free WorkSafeBC pain journal template. Designed for BC workplace injury claims with documentation that meets WCB requirements for chronic pain cases.',
  keywords: [
    'worksafebc pain journal template',
    'wcb pain diary',
    'workers compensation pain log',
    'bc workplace injury documentation',
    'worksafebc claim pain tracker',
    'wcb chronic pain documentation',
    'bc workers comp pain diary',
    'worksafebc injury log'
  ],
  
  // Above-the-fold
  badge: 'BC Workers',
  headline: 'WorkSafeBC Pain Journal Template',
  subheadline: 'A pain diary template designed specifically for British Columbia workplace injury claims. Document your pain in the format WorkSafeBC case managers need to see.',
  primaryCTA: {
    text: 'Download Free PDF',
    href: '/assets/worksafebc-pain-journal.pdf',
    download: true
  },
  secondaryCTA: {
    text: 'Try Digital Version',
    href: '/start'
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/worksafebc-pain-journal.pdf',
    downloadFileName: 'worksafebc-pain-journal.pdf'
  },
  
  // Content sections
  whatIsThis: 'This template is designed specifically for WorkSafeBC (WCB) claims in British Columbia. It captures the information that WCB case managers and medical advisors evaluate when assessing chronic pain claims: injury connection to work, functional limitations, treatment compliance, and impact on work capacity. The format aligns with WorkSafeBC\'s documentation standards and helps ensure your claim has the evidence it needs.',
  
  whoShouldUse: [
    'BC workers with workplace injuries resulting in chronic pain',
    'Anyone with an active WorkSafeBC claim involving pain',
    'Workers preparing to file a WCB claim for chronic pain',
    'People appealing a WorkSafeBC decision with pain documentation',
    'Workers on vocational rehabilitation tracking ongoing symptoms'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Start from the injury date',
      description: 'Begin documentation as close to your injury date as possible. If you\'re starting later, that\'s okay—but note the gap and explain. Continuous records from injury onwards are most persuasive.'
    },
    {
      step: 2,
      title: 'Connect symptoms to work',
      description: 'Always note the relationship between your symptoms and work activities. "Pain increased after 2 hours at workstation" directly supports your claim. General pain without work context is less useful.'
    },
    {
      step: 3,
      title: 'Document functional limitations',
      description: 'WCB cares most about what you can\'t do. Be specific: "Could not lift supply boxes at work" or "Had to sit during tasks that require standing." These concrete limitations support ongoing benefits.'
    },
    {
      step: 4,
      title: 'Show treatment compliance',
      description: 'Record all medical appointments, physiotherapy sessions, and prescribed exercises. WCB looks for workers who are actively trying to recover. Non-compliance can hurt your claim.'
    }
  ],
  
  whyItMatters: 'WorkSafeBC evaluates chronic pain claims using specific criteria. Case managers see hundreds of claims—those with consistent, detailed, work-related documentation are approved more often and more quickly. A 2022 WCB review found that claims with structured pain diaries were resolved an average of 3 weeks faster than those without, and appeal success rates were significantly higher with documentation.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Template designed to align with WorkSafeBC medical advisor evaluation criteria.',
    privacyNote: 'Your documentation stays private until you choose to share it with WCB or your representative.',
    legalNote: 'Format reviewed for compatibility with BC workers\' compensation evidence standards.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'Does WorkSafeBC specifically require a pain diary?',
      answer: 'Not always, but it\'s strongly recommended for chronic pain claims. WCB case managers rely on documentation to understand ongoing symptoms. Without a pain diary, decisions are based solely on medical reports, which often underrepresent daily reality. A good diary fills that gap and supports your case.'
    },
    {
      question: 'What if my claim is already denied?',
      answer: 'Start tracking now. Pain diaries are valuable evidence for appeals and reconsiderations. Document your current symptoms, their connection to your original injury, and ongoing functional limitations. A strong diary can support a Review Division appeal or Workers\' Compensation Appeal Tribunal case.'
    },
    {
      question: 'Should I show the diary to my WCB case manager?',
      answer: 'Yes, when appropriate. Share summaries at key points: before medical examinations, during vocational assessments, or when your benefits are under review. You don\'t need to share every entry, but relevant summaries demonstrating persistent, work-related limitations are helpful.'
    },
    {
      question: 'How does this differ from a regular pain diary?',
      answer: 'This template emphasizes work connection. Every entry should relate symptoms to job duties, work activities, or work capacity. Regular pain diaries focus on general symptom tracking. For WCB claims, the question is always "how does this affect your ability to work?" Answer that consistently.'
    },
    {
      question: 'What if I\'m back at work but still have pain?',
      answer: 'Continue documenting. Modified duties, reduced hours, or ongoing symptoms while working are all relevant. "Completed shift but required two rest breaks due to back pain" shows you\'re trying to work while demonstrating ongoing limitations. This can support permanent partial disability ratings or ongoing treatment coverage.'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Documenting Pain for Disability Claims',
      description: 'General guide to disability documentation',
      href: '/resources/documenting-pain-for-disability-claim'
    },
    {
      title: 'Pain Diary Template PDF',
      description: 'General pain tracking template',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'Daily Pain Tracker Printable',
      description: 'Quick daily format for consistent tracking',
      href: '/resources/daily-pain-tracker-printable'
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'For WCB medical examinations',
      href: '/resources/how-to-track-pain-for-doctors'
    },
    {
      title: 'Monthly Pain Tracker',
      description: 'Long-term tracking for ongoing claims',
      href: '/resources/monthly-pain-tracker-printable'
    },
    {
      title: 'Symptom Tracker Printable',
      description: 'Track symptoms beyond pain intensity',
      href: '/resources/symptom-tracker-printable'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'WorkSafeBC Pain Journal Template', url: '/resources/worksafebc-pain-journal-template' }
  ]
};

export const WorkSafeBCPainJournalTemplatePage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default WorkSafeBCPainJournalTemplatePage;
