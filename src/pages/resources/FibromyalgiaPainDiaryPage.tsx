/**
 * Fibromyalgia Pain Diary - SEO Landing Page
 * 
 * Target keyword: "fibromyalgia pain diary"
 * Search intent: User needs fibromyalgia-specific tracking
 * Conversion goal: Download template → discover Pain Tracker Pro
 * 
 * Tier 4 - Condition-Specific Long-Tail
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'fibromyalgia-pain-diary',
  title: 'Fibromyalgia Pain Diary (Free)',
  metaTitle: 'Fibromyalgia Pain Diary - Free Fibro Symptom Tracker | Pain Tracker Pro',
  metaDescription: 'Download our free fibromyalgia pain diary. Track widespread pain, fatigue, fibro fog, sleep issues, and tender points. Designed specifically for fibromyalgia symptom management.',
  keywords: [
    'fibromyalgia pain diary',
    'fibro symptom tracker',
    'fibromyalgia journal',
    'fibro pain log',
    'fibromyalgia tracking sheet',
    'fibro flare diary',
    'fibromyalgia symptom diary',
    'fibro fatigue tracker'
  ],
  
  // Above-the-fold
  badge: 'Free Download',
  headline: 'Fibromyalgia Pain Diary',
  subheadline: 'A symptom tracker designed specifically for fibromyalgia. Track widespread pain, fatigue, sleep quality, fibro fog, and tender points in one place.',
  primaryCTA: {
    text: 'Download Free PDF',
    href: '/assets/fibromyalgia-pain-diary.pdf',
    download: true
  },
  secondaryCTA: {
    text: 'Try Digital Version',
    href: '/start'
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/fibromyalgia-pain-diary.pdf',
    downloadFileName: 'fibromyalgia-pain-diary.pdf'
  },
  
  // Content sections
  whatIsThis: 'A fibromyalgia pain diary is a specialized tracking tool that captures the full spectrum of fibro symptoms—not just pain. Standard pain diaries miss crucial fibromyalgia experiences: the crushing fatigue, cognitive difficulties ("fibro fog"), sleep disturbances, and the way symptoms interact with each other. This template is designed by and for people with fibromyalgia to capture what actually matters.',
  
  whoShouldUse: [
    'Anyone diagnosed with or suspected of having fibromyalgia',
    'People tracking symptoms to assist with fibromyalgia diagnosis',
    'Fibro patients trying to identify flare triggers',
    'Those communicating symptom patterns to rheumatologists or pain specialists',
    'People documenting fibromyalgia for disability claims'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Track the full symptom picture',
      description: 'Don\'t just track pain. Rate fatigue, sleep quality, and cognitive function daily. Fibromyalgia is more than pain, and your diary should reflect that reality.'
    },
    {
      step: 2,
      title: 'Note widespread pain areas',
      description: 'Use the body map to mark where pain is located each day. Fibro pain moves around—tracking location helps identify patterns and provides evidence of widespread symptoms.'
    },
    {
      step: 3,
      title: 'Identify your personal triggers',
      description: 'Note potential triggers: weather changes, stress, activity levels, sleep quality. After a few weeks, you\'ll see which factors precede your flares.'
    },
    {
      step: 4,
      title: 'Track treatment responses',
      description: 'Document what helps and what doesn\'t: medications, supplements, exercise, rest, heat, etc. Fibro treatment is highly individual—your diary reveals what works for your body.'
    }
  ],
  
  whyItMatters: 'Fibromyalgia is notoriously difficult to track with standard pain diaries because the experience is so multi-dimensional. Research shows that fibromyalgia patients who use condition-specific tracking tools have better communication with their healthcare providers, identify more useful patterns, and report higher satisfaction with their care. A fibro-specific diary captures what generic tools miss.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Includes symptom domains identified in ACR fibromyalgia diagnostic criteria.',
    privacyNote: 'Paper format keeps your complete health picture entirely private.',
    legalNote: 'Comprehensive symptom documentation strengthens fibromyalgia disability claims.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'What symptoms should I track for fibromyalgia?',
      answer: 'Track the core symptoms: widespread pain (multiple areas), fatigue level, sleep quality and duration, cognitive function (fibro fog), mood, and any additional symptoms you experience regularly (headaches, IBS, sensitivity to light/sound). Don\'t try to track everything—focus on what impacts you most.'
    },
    {
      question: 'How do I track pain that\'s everywhere?',
      answer: 'Use a body map to mark affected areas, and note overall intensity. You don\'t need to rate every body part separately. "Widespread pain, worst in shoulders and hips, overall 7/10" is more useful than trying to rate 20 different locations.'
    },
    {
      question: 'Should I track good days and bad days differently?',
      answer: 'Track both the same way. Good days provide crucial baseline data and help you identify what might have contributed to feeling better. A pattern of good days often reveals as much as a pattern of flares.'
    },
    {
      question: 'Will this help with getting diagnosed?',
      answer: 'A symptom diary showing persistent widespread pain plus other fibro symptoms over 3+ months is valuable diagnostic evidence. The 2016 ACR diagnostic criteria for fibromyalgia can be assessed partly through symptom diary data, especially the Widespread Pain Index and Symptom Severity Scale.'
    },
    {
      question: 'What\'s the best time of day to track?',
      answer: 'Evening is usually best—you can capture the whole day\'s experience. However, also note your morning stiffness and fatigue, which are characteristic fibro symptoms. Some people track briefly at wake-up and more fully at bedtime.'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Symptom Tracker Printable',
      description: 'General multi-symptom tracking template',
      href: '/resources/symptom-tracker-printable'
    },
    {
      title: 'Pain Diary Template PDF',
      description: 'Comprehensive pain-focused tracking',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'Documenting Pain for Disability',
      description: 'Using symptom data for fibro disability claims',
      href: '/resources/documenting-pain-for-disability-claim'
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'Present fibro data effectively to specialists',
      href: '/resources/how-to-track-pain-for-doctors'
    },
    {
      title: 'Monthly Pain Tracker',
      description: 'See fibro patterns over longer periods',
      href: '/resources/monthly-pain-tracker-printable'
    },
    {
      title: 'Daily Pain Tracker Printable',
      description: 'Quick daily format for consistent tracking',
      href: '/resources/daily-pain-tracker-printable'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Fibromyalgia Pain Diary', url: '/resources/fibromyalgia-pain-diary' }
  ]
};

export const FibromyalgiaPainDiaryPage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default FibromyalgiaPainDiaryPage;
