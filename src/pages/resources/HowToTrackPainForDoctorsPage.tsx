/**
 * How to Track Pain for Doctors - SEO Landing Page
 * 
 * Target keyword: "how to track pain for doctors"
 * Search intent: User wants guidance on medical-grade documentation
 * Conversion goal: Guide → Download templates → discover Pain Tracker Pro
 * 
 * Tier 2 - Medical & Appointment Intent
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'how-to-track-pain-for-doctors',
  title: 'How to Track Pain for Doctors',
  metaTitle: 'How to Track Pain for Doctors - What Information They Actually Need | Pain Tracker Pro',
  metaDescription: 'Learn what pain information doctors actually need. Complete guide to tracking pain effectively for medical appointments, including what to document and how to present it.',
  keywords: [
    'how to track pain for doctors',
    'pain tracking for medical appointment',
    'what doctors want in pain diary',
    'pain documentation for doctors',
    'medical pain tracking',
    'pain journal for doctor visit',
    'how to describe pain to doctor',
    'pain diary for appointment'
  ],
  
  // Above-the-fold
  badge: 'Essential Guide',
  headline: 'How to Track Pain for Doctors',
  subheadline: 'What pain information doctors actually need, how to document it effectively, and how to present your data for maximum impact at appointments.',
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
    downloadUrl: '/assets/how-to-track-pain-for-doctors-guide.pdf',
    downloadFileName: 'how-to-track-pain-for-doctors-guide.pdf'
  },
  
  // Content sections
  whatIsThis: 'This guide explains what pain information doctors actually find useful—and what\'s just noise. Many patients track extensively but bring the wrong data to appointments, or present good data poorly. Understanding the clinical perspective transforms your pain tracking from a personal journal into a medical communication tool that leads to better care.',
  
  whoShouldUse: [
    'Anyone preparing for a pain-related medical appointment',
    'Patients frustrated that doctors don\'t seem to understand their pain',
    'People referred to specialists who need comprehensive documentation',
    'Those whose doctor suggested keeping a pain diary but didn\'t explain what to track',
    'Anyone who wants their pain tracking to actually influence their treatment'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Track the five things doctors actually need',
      description: 'Focus on: (1) Pain intensity (0-10 scale), (2) Timing patterns (when, how long, how often), (3) Functional impact (what you couldn\'t do), (4) What makes it better or worse, (5) Treatment response (what helped, what didn\'t).'
    },
    {
      step: 2,
      title: 'Be consistent over complete',
      description: 'Two weeks of daily 0-10 ratings are more useful than two detailed entries followed by nothing. Doctors want to see patterns over time. Consistent, simple tracking beats sporadic, detailed tracking every time.'
    },
    {
      step: 3,
      title: 'Summarize before your appointment',
      description: 'Don\'t bring 30 pages of raw data. Create a one-page summary: average pain, worst pain, frequency of bad days, main triggers, treatment effectiveness. Raw data is your source; the summary is for the doctor.'
    },
    {
      step: 4,
      title: 'Focus on function, not just numbers',
      description: 'Doctors need to understand how pain affects your life. "I couldn\'t cook dinner three times this week" is more clinically useful than "my pain was 7/10." Functional descriptions drive treatment decisions.'
    }
  ],
  
  whyItMatters: 'Studies show that doctors make treatment decisions based on very specific information—and most patients don\'t provide it. A 2018 study found that when patients brought structured pain diaries to appointments, treatment plans changed 67% of the time compared to visits without documentation. The right information, presented clearly, directly impacts your care.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Based on clinical guidelines and interviews with pain management specialists.',
    privacyNote: 'Your tracking method and data remain completely private and under your control.',
    legalNote: 'Clinically-focused documentation is also the foundation for disability claims if needed.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'What\'s the single most important thing to track?',
      answer: 'Functional impact. Doctors can debate whether "6/10 pain" is severe, but they can\'t debate that you couldn\'t work, couldn\'t sleep, or couldn\'t care for your children. Specific functional limitations are the most actionable information you can provide.'
    },
    {
      question: 'How far back should my pain diary go?',
      answer: 'Bring 2-4 weeks of data for routine appointments. For specialist referrals, 1-3 months is ideal. For disability evaluations, as long as you\'ve tracked. More data is better, but bring a summary—don\'t expect doctors to flip through pages.'
    },
    {
      question: 'Should I include information about mood and stress?',
      answer: 'Yes, but be careful how you frame it. Pain affects mood, and stress affects pain—both are real and relevant. Present it as context, not causation: "I notice pain is worse during high-stress weeks" rather than letting the doctor assume your pain is "just stress."'
    },
    {
      question: 'What if my doctor doesn\'t seem interested in my diary?',
      answer: 'Some doctors prefer verbal summaries. Try: "I\'ve been tracking my pain. Can I share a quick summary?" If they say no, that\'s concerning. Good pain management requires data. Consider whether this doctor is the right fit for chronic pain care.'
    },
    {
      question: 'How do I describe pain quality (burning, stabbing, aching)?',
      answer: 'Use specific descriptors that have clinical meaning: burning or shooting often suggests nerve pain; aching or throbbing suggests muscle or inflammation; stabbing or sharp suggests acute injury. Consistent language helps doctors understand pain mechanisms and choose appropriate treatments.'
    },
    {
      question: 'Should I track things that aren\'t working?',
      answer: 'Absolutely. A list of treatments you\'ve tried without success is extremely valuable. It prevents doctors from suggesting things you\'ve already attempted and helps them understand the severity and complexity of your condition. "I\'ve tried X, Y, and Z without lasting relief" is crucial context.'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Pain Diary Template PDF',
      description: 'Comprehensive tracking template doctors appreciate',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'Daily Pain Tracker Printable',
      description: 'Quick daily format for consistent tracking',
      href: '/resources/daily-pain-tracker-printable'
    },
    {
      title: 'Pain Scale Chart Printable',
      description: 'Use consistent pain ratings that doctors understand',
      href: '/resources/pain-scale-chart-printable'
    },
    {
      title: 'Symptom Tracker Printable',
      description: 'Track symptoms beyond pain for complete picture',
      href: '/resources/symptom-tracker-printable'
    },
    {
      title: 'What to Include in a Pain Journal',
      description: 'Detailed guide to pain diary content',
      href: '/resources/what-to-include-in-pain-journal'
    },
    {
      title: 'Documenting Pain for Disability',
      description: 'When you need more than doctor appointments',
      href: '/resources/documenting-pain-for-disability-claim'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'How to Track Pain for Doctors', url: '/resources/how-to-track-pain-for-doctors' }
  ]
};

export const HowToTrackPainForDoctorsPage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default HowToTrackPainForDoctorsPage;
