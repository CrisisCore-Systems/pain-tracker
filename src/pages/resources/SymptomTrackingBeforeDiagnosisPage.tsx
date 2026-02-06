/**
 * Symptom Tracking Before Diagnosis - SEO Landing Page
 * 
 * Target keyword: "symptom tracking before diagnosis"
 * Search intent: User is undiagnosed and tracking to get answers
 * Conversion goal: Guide → Download templates → discover Pain Tracker Pro
 * 
 * Tier 2 - Medical & Appointment Intent
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'symptom-tracking-before-diagnosis',
  title: 'Symptom Tracking Before Diagnosis',
  metaTitle: 'Symptom Tracking Before Diagnosis - Get Diagnosed Faster | Pain Tracker Pro',
  metaDescription: 'Track symptoms strategically when seeking a diagnosis. Learn what doctors need to see to identify your condition and how proper documentation speeds up diagnosis.',
  keywords: [
    'symptom tracking before diagnosis',
    'pre-diagnosis symptom tracking',
    'track symptoms for doctor',
    'undiagnosed symptoms tracking',
    'symptom diary for diagnosis',
    'documenting symptoms for diagnosis',
    'getting diagnosed faster',
    'diagnostic symptom log'
  ],
  
  // Above-the-fold
  badge: 'Diagnosis Guide',
  headline: 'Symptom Tracking Before Diagnosis',
  subheadline: 'When you have symptoms but no diagnosis, strategic tracking can speed up answers. Learn what to document and how to present it to get the evaluation you need.',
  primaryCTA: {
    text: 'Get Free Templates',
    href: '/resources/symptom-tracker-printable',
    download: false
  },
  secondaryCTA: {
    text: 'Start Digital Tracking',
    href: '/start'
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/pre-diagnosis-symptom-tracker.pdf',
    downloadFileName: 'pre-diagnosis-symptom-tracker.pdf'
  },
  
  // Content sections
  whatIsThis: 'When you\'re experiencing symptoms but don\'t yet have a diagnosis, tracking serves a different purpose than post-diagnosis monitoring. Pre-diagnosis tracking is about gathering evidence that helps doctors identify your condition. This guide explains what to document, how to spot patterns that point to specific conditions, and how to present your data to get appropriate testing and referrals.',
  
  whoShouldUse: [
    'Anyone with unexplained symptoms seeking diagnosis',
    'People dismissed with "nothing\'s wrong" who know something is',
    'Those preparing for diagnostic appointments or second opinions',
    'Patients with vague or hard-to-describe symptoms',
    'Anyone whose symptoms come and go (making them hard to demonstrate to doctors)'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Track everything at first',
      description: 'When seeking diagnosis, cast a wide net. Track all symptoms, not just pain: fatigue, cognitive issues, sleep, digestive symptoms, sensory changes. Patterns across symptoms help identify conditions.'
    },
    {
      step: 2,
      title: 'Document timing precisely',
      description: 'When did symptoms start? Are they constant or intermittent? What time of day are they worst? How long do episodes last? Timing patterns are diagnostic clues that doctors use.'
    },
    {
      step: 3,
      title: 'Note what triggers and relieves',
      description: 'What makes symptoms worse? Better? Different triggers point to different conditions. "Worse after eating" suggests different causes than "worse in the morning" or "worse with activity."'
    },
    {
      step: 4,
      title: 'Create a timeline for appointments',
      description: 'Convert your raw tracking into a symptom timeline: when symptoms started, how they\'ve changed, what you\'ve tried. This narrative helps doctors see the progression of your condition.'
    }
  ],
  
  whyItMatters: 'Getting diagnosed with a chronic condition takes an average of 4+ years and multiple doctors. Patients who bring organized symptom documentation get diagnosed faster—sometimes years faster. Doctors rely on patient history to guide testing and referrals. Without documentation, they see only a snapshot; with tracking, they see the movie.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Strategic symptom tracking supports the diagnostic process and helps doctors order appropriate tests.',
    privacyNote: 'Pre-diagnosis records are particularly sensitive—paper tracking keeps them under your control.',
    legalNote: 'Documentation from before diagnosis establishes symptom onset dates important for disability claims.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'What symptoms should I track if I don\'t know what\'s wrong?',
      answer: 'Track broadly: pain (location, intensity, quality), fatigue, sleep disturbances, cognitive issues (brain fog, concentration), mood changes, digestive symptoms, temperature sensitivity, and any other symptoms you notice. Conditions often have symptom clusters—tracking multiple symptoms helps identify patterns.'
    },
    {
      question: 'How do I explain vague symptoms to doctors?',
      answer: 'Use functional descriptions: "I can\'t stand for more than 10 minutes" is clearer than "my legs feel weird." Your diary provides specifics: "On Monday, I had to sit down after 8 minutes of standing" is harder to dismiss than "sometimes I can\'t stand."'
    },
    {
      question: 'What if doctors dismiss my symptoms?',
      answer: 'Documentation is your strongest tool. "I\'ve tracked daily for 6 weeks and my symptoms match the diagnostic criteria for [condition]" is harder to dismiss than "I think I might have [condition]." If doctors still dismiss documented symptoms, seek a second opinion.'
    },
    {
      question: 'How long should I track before asking for specific testing?',
      answer: 'Two to four weeks of consistent tracking usually provides enough patterns for productive conversations. If you suspect a specific condition, research its diagnostic criteria and ensure your tracking captures relevant symptoms. Some conditions require specific tests—your tracking helps justify ordering them.'
    },
    {
      question: 'Should I suggest diagnoses to my doctor?',
      answer: 'You can and should advocate for yourself, but frame it carefully: "I\'ve researched my symptoms and they seem consistent with [condition]—can we rule this out?" Bring your symptom diary as evidence. Doctors are more receptive to educated patients with documentation than to self-diagnosis without support.'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Symptom Tracker Printable',
      description: 'Track multiple symptoms for diagnosis',
      href: '/resources/symptom-tracker-printable'
    },
    {
      title: 'Pain Diary Template PDF',
      description: 'Comprehensive symptom and pain tracking',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'Present your data effectively',
      href: '/resources/how-to-track-pain-for-doctors'
    },
    {
      title: 'Pain Diary for Specialist Appointment',
      description: 'Prepare for diagnostic consultations',
      href: '/resources/pain-diary-for-specialist-appointment'
    },
    {
      title: 'Fibromyalgia Pain Diary',
      description: 'If you suspect fibromyalgia',
      href: '/resources/fibromyalgia-pain-diary'
    },
    {
      title: 'Nerve Pain Symptom Log',
      description: 'If you suspect neurological causes',
      href: '/resources/nerve-pain-symptom-log'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Symptom Tracking Before Diagnosis', url: '/resources/symptom-tracking-before-diagnosis' }
  ]
};

export const SymptomTrackingBeforeDiagnosisPage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default SymptomTrackingBeforeDiagnosisPage;
