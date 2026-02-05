/**
 * Neuropathy Symptom Tracker - SEO Landing Page
 * 
 * Target keyword: "neuropathy symptom tracker"
 * Search intent: User needs peripheral neuropathy tracking
 * Conversion goal: Download template → discover Pain Tracker Pro
 * 
 * Tier 4 - Condition-Specific Long-Tail
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'neuropathy-symptom-tracker',
  title: 'Neuropathy Symptom Tracker (Free)',
  metaTitle: 'Neuropathy Symptom Tracker - Free Peripheral Neuropathy Log | Pain Tracker Pro',
  metaDescription: 'Download our free neuropathy symptom tracker. Track numbness, tingling, burning pain, and weakness. Perfect for diabetic, chemotherapy-induced, and other peripheral neuropathies.',
  keywords: [
    'neuropathy symptom tracker',
    'peripheral neuropathy log',
    'neuropathy diary',
    'diabetic neuropathy tracker',
    'nerve damage symptom log',
    'neuropathy pain diary',
    'peripheral neuropathy diary',
    'neuropathy tracking sheet'
  ],
  
  // Above-the-fold
  badge: 'Free Download',
  headline: 'Neuropathy Symptom Tracker',
  subheadline: 'Track the symptoms of peripheral neuropathy: numbness, tingling, burning pain, and weakness. Monitor progression and treatment response over time.',
  primaryCTA: {
    text: 'Download Free PDF',
    href: '/assets/neuropathy-symptom-tracker.pdf',
    download: true
  },
  secondaryCTA: {
    text: 'Try Digital Version',
    href: '/start'
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/neuropathy-symptom-tracker.pdf',
    downloadFileName: 'neuropathy-symptom-tracker.pdf'
  },
  
  // Content sections
  whatIsThis: 'A neuropathy symptom tracker is designed for peripheral neuropathy—nerve damage that causes numbness, tingling, burning pain, and weakness, typically starting in hands and feet. This template tracks symptom distribution (which areas are affected), sensory symptoms (numbness, tingling, burning), motor symptoms (weakness, clumsiness), and progression over time. It\'s designed for diabetic neuropathy, chemotherapy-induced neuropathy, and other peripheral nerve conditions.',
  
  whoShouldUse: [
    'People with diabetic peripheral neuropathy',
    'Cancer patients experiencing chemotherapy-induced neuropathy (CIPN)',
    'Anyone with peripheral neuropathy from any cause',
    'Patients tracking neuropathy progression or treatment response',
    'Those seeking neuropathy diagnosis with unexplained numbness or burning'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Map your symptom distribution',
      description: 'Note exactly where symptoms occur. Neuropathy typically follows patterns (stocking-glove, single nerve, etc.). Track which areas are affected and whether distribution is changing.'
    },
    {
      step: 2,
      title: 'Distinguish symptom types',
      description: 'Track different symptoms separately: numbness (loss of feeling), paresthesias (tingling, pins-and-needles), burning/shooting pain, and weakness. Each type may progress differently or respond to different treatments.'
    },
    {
      step: 3,
      title: 'Note functional impact',
      description: 'Document how neuropathy affects function: dropping things, difficulty with buttons, unsteady walking, falls. Functional changes are often more clinically meaningful than symptom ratings.'
    },
    {
      step: 4,
      title: 'Track progression over time',
      description: 'Neuropathy can progress (symptoms spreading up limbs) or improve with treatment. Monthly comparisons showing whether symptoms are stable, improving, or progressing guide treatment decisions.'
    }
  ],
  
  whyItMatters: 'Neuropathy affects over 20 million Americans. Treatment success depends on understanding the type, cause, and progression. Your symptom tracker provides data that guides neurologist decisions: Is the neuropathy progressing? Is treatment helping? Are symptoms consistent with the suspected cause? This documentation also supports disability claims when neuropathy significantly impairs function.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Tracks symptom categories used in clinical neuropathy assessment and monitoring.',
    privacyNote: 'Paper format keeps your medical information private.',
    legalNote: 'Documented neuropathy progression supports disability claims when symptoms prevent work.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'What symptoms indicate peripheral neuropathy?',
      answer: 'Typical symptoms include: numbness or reduced sensation, tingling or pins-and-needles sensations, burning or shooting pain, muscle weakness, poor balance, and sensitivity to touch. Symptoms often start in feet and hands, and may progress upward ("stocking-glove" pattern).'
    },
    {
      question: 'How do I track if numbness is getting worse?',
      answer: 'Track the extent of numbness: "Numb to ankles" might become "Numb to mid-calf." Note any new areas affected. Also track functional changes: "Now dropping things I didn\'t used to drop" or "Having trouble feeling buttons."'
    },
    {
      question: 'Should I track blood sugar if I have diabetic neuropathy?',
      answer: 'Yes! There\'s a direct relationship between blood sugar control and neuropathy progression. Track both symptoms and blood sugar patterns. Showing correlation can motivate better diabetes management. Some patients see symptom improvement with improved control.'
    },
    {
      question: 'How does this help with chemotherapy-induced neuropathy?',
      answer: 'For CIPN, track symptoms before, during, and after treatment cycles. Note any dose-related patterns. This documentation helps oncologists decide whether to adjust chemotherapy doses and guides post-treatment management. Report severe or rapidly progressing symptoms immediately.'
    },
    {
      question: 'When should I be concerned about neuropathy symptoms?',
      answer: 'Seek urgent care for: rapidly progressing symptoms, significant weakness affecting walking or hand function, new autonomic symptoms (blood pressure changes, bladder issues), or symptoms following a specific nerve distribution (could indicate compression). Document these symptoms in your tracker and report them promptly.'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Nerve Pain Symptom Log',
      description: 'Detailed nerve pain tracking',
      href: '/resources/nerve-pain-symptom-log'
    },
    {
      title: 'Symptom Tracker Printable',
      description: 'Broader symptom tracking',
      href: '/resources/symptom-tracker-printable'
    },
    {
      title: 'Pain Diary Template PDF',
      description: 'Comprehensive pain documentation',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'Present neuropathy data effectively',
      href: '/resources/how-to-track-pain-for-doctors'
    },
    {
      title: 'Monthly Pain Tracker',
      description: 'Monitor neuropathy progression over time',
      href: '/resources/monthly-pain-tracker-printable'
    },
    {
      title: 'Documenting Pain for Disability',
      description: 'When neuropathy affects your work',
      href: '/resources/documenting-pain-for-disability-claim'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Neuropathy Symptom Tracker', url: '/resources/neuropathy-symptom-tracker' }
  ]
};

export const NeuropathySymptomTrackerPage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default NeuropathySymptomTrackerPage;
