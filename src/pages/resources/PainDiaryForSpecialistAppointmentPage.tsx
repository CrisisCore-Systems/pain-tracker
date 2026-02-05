/**
 * Pain Diary for Specialist Appointment - SEO Landing Page
 * 
 * Target keyword: "pain diary for specialist appointment"
 * Search intent: User has a specialist visit coming up
 * Conversion goal: Guide → Download templates → discover Pain Tracker Pro
 * 
 * Tier 2 - Medical & Appointment Intent
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'pain-diary-for-specialist-appointment',
  title: 'Pain Diary for Specialist Appointment',
  metaTitle: 'Pain Diary for Specialist Appointment - How to Prepare | Pain Tracker Pro',
  metaDescription: 'Prepare for your specialist appointment with an effective pain diary. Learn what pain specialists, rheumatologists, and neurologists want to see in your records.',
  keywords: [
    'pain diary for specialist appointment',
    'pain specialist preparation',
    'rheumatologist pain diary',
    'neurologist pain diary',
    'specialist pain documentation',
    'pain clinic diary',
    'preparing for pain specialist',
    'specialist appointment pain records'
  ],
  
  // Above-the-fold
  badge: 'Appointment Guide',
  headline: 'Pain Diary for Specialist Appointment',
  subheadline: 'How to prepare an effective pain diary before seeing a specialist. What rheumatologists, neurologists, and pain specialists actually want to see.',
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
    downloadUrl: '/assets/specialist-appointment-pain-diary.pdf',
    downloadFileName: 'specialist-appointment-pain-diary.pdf'
  },
  
  // Content sections
  whatIsThis: 'Specialist appointments are high-stakes: wait times are long, time is limited, and decisions made there significantly impact your care. This guide explains how to prepare a pain diary specifically for specialist consultations—what different specialists look for, how much data to bring, and how to present it effectively so your limited appointment time is used well.',
  
  whoShouldUse: [
    'Anyone with an upcoming specialist appointment for pain evaluation',
    'Patients referred to pain clinics, rheumatologists, or neurologists',
    'People who\'ve waited months for a specialist and want to make it count',
    'Those whose primary care provider recommended bringing pain documentation',
    'Anyone who\'s had unsatisfying specialist visits and wants to improve'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Start tracking at least 2 weeks before',
      description: 'Specialists want to see patterns, not just a snapshot. Ideally, track for 2-4 weeks before your appointment. Even one week is better than nothing.'
    },
    {
      step: 2,
      title: 'Tailor to the specialist type',
      description: 'Rheumatologists want joint-specific data and morning stiffness. Neurologists want pain quality and distribution. Pain specialists want treatment history and functional impact. Know your audience.'
    },
    {
      step: 3,
      title: 'Prepare a one-page summary',
      description: 'Specialists see many patients. Create a one-page summary: pain history timeline, current pattern, treatments tried, and what you hope to learn from the visit. Bring the full diary as backup.'
    },
    {
      step: 4,
      title: 'List specific questions',
      description: 'Write down 3-5 questions you most want answered. Time will fly. Your pain diary data informs the questions: "My diary shows pain peaks in the morning—what could cause this pattern?"'
    }
  ],
  
  whyItMatters: 'Specialist appointments are precious. Wait times average 2-6 months, and appointment slots are typically 20-30 minutes. Showing up without documentation means the specialist spends time gathering basic information instead of analyzing and advising. A prepared patient with documented data gets more clinical value from the same appointment time.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Based on input from pain specialists, rheumatologists, and neurologists on what makes consultations effective.',
    privacyNote: 'Your documentation is yours—bring what supports your care, keep what\'s private.',
    legalNote: 'Specialist documentation with supporting patient diary data strengthens disability and insurance claims.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'How much data should I bring?',
      answer: 'Quality over quantity. Bring 2-4 weeks of tracking data and a one-page summary. Specialists can review a concise summary in 30 seconds; they can\'t review 50 pages of detailed notes. Have the detailed data available if questions arise, but lead with the summary.'
    },
    {
      question: 'What do different specialists want to see?',
      answer: 'Rheumatologists: joint-specific symptoms, morning stiffness duration, swelling, and medication response. Neurologists: pain quality (burning/shooting/aching), distribution patterns, numbness, and triggers. Pain specialists: comprehensive treatment history, functional impact, and what you\'ve tried that didn\'t work.'
    },
    {
      question: 'Should I bring imaging and test results too?',
      answer: 'Yes, if you have them and they\'re relevant. Specialists often don\'t have access to your full medical record. Bring copies of relevant MRIs, X-rays, and lab work—along with your pain diary, which provides context imaging can\'t.'
    },
    {
      question: 'What if I don\'t have time to track before my appointment?',
      answer: 'Track what you can, even if it\'s just a few days. Write a brief history covering: how long you\'ve had pain, how it\'s changed, what you\'ve tried, and what makes it better or worse. Some documentation is always better than none.'
    },
    {
      question: 'What questions should I ask the specialist?',
      answer: 'Base questions on your diary data: "I noticed [pattern]—what might cause this?" "I\'ve tried [treatments] without relief—what else should we consider?" "My pain is affecting [function]—what can help?" Specific, data-backed questions get better answers.'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Pain Diary Template PDF',
      description: 'Comprehensive template for pre-appointment tracking',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'General guide to medical pain documentation',
      href: '/resources/how-to-track-pain-for-doctors'
    },
    {
      title: 'Weekly Pain Log PDF',
      description: '7-day format perfect for appointment prep',
      href: '/resources/weekly-pain-log-pdf'
    },
    {
      title: 'Arthritis Pain Tracker',
      description: 'For rheumatology appointments',
      href: '/resources/arthritis-pain-tracker'
    },
    {
      title: 'Nerve Pain Symptom Log',
      description: 'For neurology appointments',
      href: '/resources/nerve-pain-symptom-log'
    },
    {
      title: 'How Doctors Use Pain Diaries',
      description: 'Understand the clinical perspective',
      href: '/resources/how-doctors-use-pain-diaries'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Diary for Specialist Appointment', url: '/resources/pain-diary-for-specialist-appointment' }
  ]
};

export const PainDiaryForSpecialistAppointmentPage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default PainDiaryForSpecialistAppointmentPage;
