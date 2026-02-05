/**
 * CRPS Pain Diary Template - SEO Landing Page
 * 
 * Target keyword: "CRPS pain diary template"
 * Search intent: User has CRPS and needs specialized tracking
 * Conversion goal: Download template → discover Pain Tracker Pro
 * 
 * Tier 4 - Condition-Specific Long-Tail
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'crps-pain-diary-template',
  title: 'CRPS Pain Diary Template (Free)',
  metaTitle: 'CRPS Pain Diary Template - Free Complex Regional Pain Syndrome Tracker | Pain Tracker Pro',
  metaDescription: 'Download our free CRPS pain diary template. Track burning pain, swelling, skin changes, temperature sensitivity, and allodynia. Designed for Complex Regional Pain Syndrome.',
  keywords: [
    'CRPS pain diary template',
    'complex regional pain syndrome tracker',
    'CRPS symptom log',
    'RSD pain diary',
    'CRPS flare tracker',
    'complex regional pain diary',
    'CRPS documentation',
    'CRPS symptom tracker'
  ],
  
  // Above-the-fold
  badge: 'Free Download',
  headline: 'CRPS Pain Diary Template',
  subheadline: 'Track the complex symptoms of CRPS: burning pain, color and temperature changes, swelling, allodynia, and mobility issues. Designed specifically for Complex Regional Pain Syndrome.',
  primaryCTA: {
    text: 'Download Free PDF',
    href: '/assets/crps-pain-diary.pdf',
    download: true
  },
  secondaryCTA: {
    text: 'Try Digital Version',
    href: '/start'
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/crps-pain-diary.pdf',
    downloadFileName: 'crps-pain-diary.pdf'
  },
  
  // Content sections
  whatIsThis: 'A CRPS pain diary captures the unique and complex symptoms of Complex Regional Pain Syndrome: burning pain out of proportion to injury, skin color and temperature changes, swelling, allodynia (pain from light touch), motor changes, and spread patterns. Standard pain diaries don\'t capture these disease-specific features. This template is designed to document the full CRPS picture for specialists and disability evaluators.',
  
  whoShouldUse: [
    'Anyone diagnosed with CRPS (Type 1 or Type 2)',
    'People with suspected CRPS seeking diagnosis',
    'CRPS patients tracking disease progression or spread',
    'Those documenting CRPS for disability claims',
    'Patients preparing for pain specialist or anesthesiology appointments'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Track the full symptom spectrum',
      description: 'CRPS involves more than pain. Track skin changes (color, temperature, sweating), swelling, hair/nail changes, motor issues, and sensory symptoms like allodynia. Photos can supplement written notes.'
    },
    {
      step: 2,
      title: 'Note spread patterns',
      description: 'CRPS can spread to other limbs or body areas. Document any new areas affected, when spread occurred, and whether it followed a trigger. Spread patterns are clinically important.'
    },
    {
      step: 3,
      title: 'Document allodynia triggers',
      description: 'Note what triggers pain from non-painful stimuli: light touch, clothing, temperature, air movement. "Bedsheet touching foot caused 9/10 burning" documents allodynia severity.'
    },
    {
      step: 4,
      title: 'Track flares and potential triggers',
      description: 'CRPS flares can be triggered by stress, temperature changes, activity, or illness. Document flares including intensity, duration, and any identifiable triggers.'
    }
  ],
  
  whyItMatters: 'CRPS is frequently misunderstood and misdiagnosed. The condition is diagnosed using the Budapest Criteria, which require symptoms in multiple categories. A diary documenting sensory, vasomotor, sudomotor/edema, and motor symptoms provides evidence for diagnosis. For disability claims, CRPS documentation showing severe functional limitation and treatment resistance is essential.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Includes symptom categories aligned with Budapest Criteria for CRPS diagnosis.',
    privacyNote: 'Paper format keeps your detailed CRPS documentation private.',
    legalNote: 'Comprehensive CRPS documentation is crucial for disability claims—this condition often qualifies for benefits when properly documented.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'What symptoms define CRPS?',
      answer: 'CRPS involves symptoms in four categories: sensory (increased pain sensitivity, allodynia), vasomotor (temperature/color changes), sudomotor/edema (sweating changes, swelling), and motor/trophic (weakness, tremor, hair/nail changes). Diagnosis requires symptoms in multiple categories plus pain out of proportion to any inciting event.'
    },
    {
      question: 'How do I document allodynia?',
      answer: 'Note what triggers pain (touch, temperature, clothing), the stimulus strength (light touch, breeze, sheet), and the pain response (intensity, quality, duration). "Light brush of shirt against arm caused 8/10 burning lasting 15 minutes" documents allodynia clearly.'
    },
    {
      question: 'Should I include photos?',
      answer: 'Yes! CRPS causes visible changes: skin color (mottled, red, blue), swelling, shiny skin, hair/nail changes. Photos with dates documenting these changes are powerful evidence. Take comparison photos of affected and unaffected limbs.'
    },
    {
      question: 'What if my CRPS is spreading?',
      answer: 'Document spread carefully: date you noticed new symptoms, which body areas are now affected, and whether spread seemed related to any trigger. CRPS spread is a sign of disease progression and is important for treatment decisions and disability documentation.'
    },
    {
      question: 'Will this help with disability for CRPS?',
      answer: 'CRPS is recognized as potentially disabling, but claims are often denied initially due to the condition\'s invisibility and variability. Detailed documentation showing the full symptom spectrum, functional limitations, treatment resistance, and disease progression significantly strengthens disability claims and appeals.'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Nerve Pain Symptom Log',
      description: 'Track neuropathic pain components of CRPS',
      href: '/resources/nerve-pain-symptom-log'
    },
    {
      title: 'Chronic Pain Diary Template',
      description: 'Long-term chronic pain tracking',
      href: '/resources/chronic-pain-diary-template'
    },
    {
      title: 'Documenting Pain for Disability',
      description: 'CRPS disability documentation guide',
      href: '/resources/documenting-pain-for-disability-claim'
    },
    {
      title: 'Daily Functioning Log',
      description: 'Track functional impact of CRPS',
      href: '/resources/daily-functioning-log-for-disability'
    },
    {
      title: 'Pain Diary for Specialist',
      description: 'Prepare for pain specialist appointments',
      href: '/resources/pain-diary-for-specialist-appointment'
    },
    {
      title: 'Symptom Tracker Printable',
      description: 'Track the full range of CRPS symptoms',
      href: '/resources/symptom-tracker-printable'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'CRPS Pain Diary Template', url: '/resources/crps-pain-diary-template' }
  ]
};

export const CRPSPainDiaryTemplatePage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default CRPSPainDiaryTemplatePage;
