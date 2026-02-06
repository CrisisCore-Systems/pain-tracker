/**
 * Arthritis Pain Tracker - SEO Landing Page
 * 
 * Target keyword: "arthritis pain tracker"
 * Search intent: User needs arthritis-specific tracking
 * Conversion goal: Download template → discover Pain Tracker Pro
 * 
 * Tier 4 - Condition-Specific Long-Tail
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'arthritis-pain-tracker',
  title: 'Arthritis Pain Tracker (Free)',
  metaTitle: 'Arthritis Pain Tracker - Free Joint Pain Diary Template | Pain Tracker Pro',
  metaDescription: 'Download our free arthritis pain tracker. Monitor joint pain, stiffness, swelling, and mobility. Perfect for rheumatoid arthritis, osteoarthritis, and psoriatic arthritis.',
  keywords: [
    'arthritis pain tracker',
    'joint pain diary',
    'arthritis symptom log',
    'ra pain tracker',
    'osteoarthritis diary',
    'joint stiffness tracker',
    'arthritis flare log',
    'rheumatoid arthritis journal'
  ],
  
  // Above-the-fold
  badge: 'Free Download',
  headline: 'Arthritis Pain Tracker',
  subheadline: 'Track joint pain, stiffness, swelling, and mobility across multiple joints. Designed for all types of arthritis including RA, OA, and psoriatic arthritis.',
  primaryCTA: {
    text: 'Download Free PDF',
    href: '/assets/arthritis-pain-tracker.pdf',
    download: true
  },
  secondaryCTA: {
    text: 'Try Digital Version',
    href: '/start'
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/arthritis-pain-tracker.pdf',
    downloadFileName: 'arthritis-pain-tracker.pdf'
  },
  
  // Content sections
  whatIsThis: 'An arthritis pain tracker is specialized for joint-related conditions. It tracks pain, stiffness, swelling, and function across multiple joints simultaneously—which standard pain diaries don\'t do well. It includes morning stiffness duration (a key diagnostic and monitoring measure), joint-by-joint tracking, medication response, and activity impact. Whether you have rheumatoid arthritis, osteoarthritis, or psoriatic arthritis, this template captures what matters for your care.',
  
  whoShouldUse: [
    'People with any form of arthritis (RA, OA, PsA, gout, ankylosing spondylitis)',
    'Patients on disease-modifying medications tracking response',
    'Those monitoring for flares and identifying triggers',
    'Patients preparing for rheumatology appointments',
    'Anyone with joint pain seeking diagnosis'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Track morning stiffness duration',
      description: 'Time how long your joints feel stiff after waking. This is a key clinical measure—stiffness lasting over 30 minutes suggests inflammatory arthritis. Note it every day, even when minimal.'
    },
    {
      step: 2,
      title: 'Rate affected joints individually',
      description: 'Mark which joints are affected and rate pain/stiffness for each. Arthritis affects multiple joints differently. A joint map or list helps track the pattern of involvement.'
    },
    {
      step: 3,
      title: 'Note swelling and warmth',
      description: 'Inflammation shows as swelling, warmth, and redness. Note these signs—they indicate active disease and help rheumatologists adjust treatment. Photos can supplement your written notes.'
    },
    {
      step: 4,
      title: 'Track functional impact',
      description: 'Document what you couldn\'t do: couldn\'t grip jar, difficulty with stairs, couldn\'t button shirt. Functional measures matter more than pain ratings for treatment decisions.'
    }
  ],
  
  whyItMatters: 'Arthritis treatment decisions depend heavily on disease activity tracking. Rheumatologists use standardized measures like DAS28 (disease activity score) that incorporate joint counts and patient-reported data. A good arthritis diary provides this information. Studies show that patients who track systematically achieve better disease control because treatment adjustments are based on objective data rather than appointment-day snapshots.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Includes elements aligned with ACR/EULAR arthritis assessment recommendations.',
    privacyNote: 'Paper format keeps your detailed health information private.',
    legalNote: 'Comprehensive arthritis documentation supports disability and accommodation requests.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'What\'s the most important thing to track for arthritis?',
      answer: 'Morning stiffness duration and functional impact. Morning stiffness over 30 minutes suggests inflammatory arthritis (RA, PsA) vs. osteoarthritis (typically < 30 min). Functional impact—what you can\'t do—drives treatment decisions more than pain ratings alone.'
    },
    {
      question: 'How do I track pain when many joints hurt?',
      answer: 'Focus on your worst joints and count total joints affected. You don\'t need to rate every joint daily. Note: "6 joints affected today, worst are hands (7/10) and right knee (6/10)." Rheumatologists care about pattern and count as much as individual ratings.'
    },
    {
      question: 'Should I track when I feel good?',
      answer: 'Yes! Good days help identify what\'s working and establish your baseline. Tracking only bad days makes your condition look worse than it is on average, which can lead to over-treatment. Your diary should reflect your full range of experiences.'
    },
    {
      question: 'How does this help with rheumatology appointments?',
      answer: 'Rheumatologists have limited time and rely on your report of disease activity between visits. A good diary answers their key questions: How often do you flare? Which joints are most affected? Is medication helping? How\'s your morning stiffness? Bring a summary.'
    },
    {
      question: 'What if I have different types of arthritis pain?',
      answer: 'Track the types separately. Note inflammatory symptoms (morning stiffness, swelling, warmth) separately from mechanical symptoms (pain with activity, better with rest). Different pain types may require different treatments, and your diary helps distinguish them.'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Pain Diary Template PDF',
      description: 'Comprehensive general pain tracking',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'Symptom Tracker Printable',
      description: 'Track fatigue and other arthritis symptoms',
      href: '/resources/symptom-tracker-printable'
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'Present arthritis data to rheumatologists',
      href: '/resources/how-to-track-pain-for-doctors'
    },
    {
      title: 'Monthly Pain Tracker',
      description: 'Monitor disease activity over time',
      href: '/resources/monthly-pain-tracker-printable'
    },
    {
      title: 'Documenting Pain for Disability',
      description: 'Arthritis documentation for claims',
      href: '/resources/documenting-pain-for-disability-claim'
    },
    {
      title: 'Daily Pain Tracker Printable',
      description: 'Quick daily format for joint tracking',
      href: '/resources/daily-pain-tracker-printable'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Arthritis Pain Tracker', url: '/resources/arthritis-pain-tracker' }
  ]
};

export const ArthritisPainTrackerPage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default ArthritisPainTrackerPage;
