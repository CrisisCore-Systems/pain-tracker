/**
 * Endometriosis Pain Log - SEO Landing Page
 * 
 * Target keyword: "endometriosis pain log"
 * Search intent: User needs endometriosis-specific tracking
 * Conversion goal: Download template → discover Pain Tracker Pro
 * 
 * Tier 4 - Condition-Specific Long-Tail
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'endometriosis-pain-log',
  title: 'Endometriosis Pain Log (Free)',
  metaTitle: 'Endometriosis Pain Log - Free Endo Symptom Tracker | Pain Tracker Pro',
  metaDescription: 'Download our free endometriosis pain log. Track pelvic pain, cycle patterns, GI symptoms, and more. Designed specifically for endo warriors to identify patterns and communicate with doctors.',
  keywords: [
    'endometriosis pain log',
    'endo symptom tracker',
    'endometriosis diary',
    'pelvic pain tracker',
    'endo pain journal',
    'endometriosis cycle tracker',
    'endo flare diary',
    'endometriosis tracking sheet'
  ],
  
  // Above-the-fold
  badge: 'Free Download',
  headline: 'Endometriosis Pain Log',
  subheadline: 'Track endo symptoms throughout your cycle: pelvic pain, GI issues, fatigue, and more. Designed by endo warriors to capture the patterns doctors need to see.',
  primaryCTA: {
    text: 'Download Free PDF',
    href: '/assets/endometriosis-pain-log.pdf',
    download: true
  },
  secondaryCTA: {
    text: 'Try Digital Version',
    href: '/start'
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/endometriosis-pain-log.pdf',
    downloadFileName: 'endometriosis-pain-log.pdf'
  },
  
  // Content sections
  whatIsThis: 'An endometriosis pain log is designed for the unique symptom profile of endo: cyclical pelvic pain, pain with periods, pain between periods, GI symptoms (bloating, bowel changes), fatigue, and painful intercourse. Unlike general pain diaries, it tracks symptoms in relation to your menstrual cycle and captures the wide range of endo manifestations that standard trackers miss.',
  
  whoShouldUse: [
    'Anyone diagnosed with endometriosis wanting to track patterns',
    'People with suspected endo gathering evidence for diagnosis',
    'Endo patients preparing for gynecologist or specialist appointments',
    'Those tracking response to hormonal treatments or surgery',
    'Anyone documenting endo for disability or accommodations'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Track relative to your cycle',
      description: 'Note your cycle day and menstrual status each day. Endo patterns often correlate with cycle phases—pain may peak with periods, ovulation, or specific days. This correlation is diagnostic gold.'
    },
    {
      step: 2,
      title: 'Document all symptoms, not just pain',
      description: 'Endo causes more than pelvic pain: bloating, bowel changes, bladder symptoms, fatigue, nausea. Track them all—they paint the full picture and help doctors understand disease extent.'
    },
    {
      step: 3,
      title: 'Note specific pain types and locations',
      description: 'Where is the pain? Pelvic, low back, leg? What type—stabbing, aching, cramping, burning? Does it radiate? Specific pain descriptions help locate endo lesions.'
    },
    {
      step: 4,
      title: 'Track at least 2-3 full cycles',
      description: 'Endo patterns emerge over cycles, not days. Track consistently for at least 2-3 complete menstrual cycles before drawing conclusions or preparing for appointments.'
    }
  ],
  
  whyItMatters: 'Endometriosis takes an average of 7-10 years to diagnose, partly because symptoms are dismissed or attributed to "normal" period pain. Documented symptom patterns showing severity beyond typical menstruation are crucial evidence. A detailed endo log can accelerate diagnosis, justify surgical intervention, demonstrate treatment need, and support accommodation or disability requests.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Includes symptom categories relevant to endo staging and specialist evaluation.',
    privacyNote: 'Paper format keeps sensitive reproductive health information completely private.',
    legalNote: 'Documented endo symptoms support accommodation requests and disability claims for severe cases.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'What symptoms should I track for endometriosis?',
      answer: 'Track: pelvic pain (location, intensity, type), menstrual symptoms (flow, clots, pain), GI symptoms (bloating, bowel changes, nausea), urinary symptoms, fatigue, pain with sex, pain with bowel movements, and any symptoms that seem to cycle with your period. Endo is a whole-body disease—track broadly.'
    },
    {
      question: 'How do I correlate symptoms with my cycle?',
      answer: 'Note cycle day 1 as first day of bleeding. Track symptoms with cycle day, and after 2-3 cycles, look for patterns. Common endo patterns: pain peaks around menstruation, mid-cycle pain at ovulation, or constant pain that worsens cyclically.'
    },
    {
      question: 'Will this help me get diagnosed faster?',
      answer: 'Documented patterns showing severe, cyclical symptoms can absolutely support diagnosis. Bring your log to appointments and point out patterns: "My pain reaches 8/10 for days 1-5 of my cycle every month, accompanied by vomiting and inability to work." This is harder to dismiss than "bad periods."'
    },
    {
      question: 'How is this different from a period tracker app?',
      answer: 'Period trackers focus on predicting cycles. This log focuses on documenting symptoms in medical detail—the kind of data gynecologists and endo specialists need. It captures pain quality, functional impact, and the full range of endo symptoms, not just period dates.'
    },
    {
      question: 'What if my pain doesn\'t correlate with my cycle?',
      answer: 'That\'s still useful data. Some endo patients have constant pain, pain between periods, or irregular patterns. Document what you experience—non-cyclical severe pain can also support endo diagnosis, especially combined with other symptoms.'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Symptom Tracker Printable',
      description: 'Track broader symptoms beyond pain',
      href: '/resources/symptom-tracker-printable'
    },
    {
      title: 'Pain Diary Template PDF',
      description: 'Comprehensive pain tracking',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'Monthly Pain Tracker',
      description: 'See patterns across cycles',
      href: '/resources/monthly-pain-tracker-printable'
    },
    {
      title: 'Pain Diary for Specialist Appointment',
      description: 'Prepare for gynecology visits',
      href: '/resources/pain-diary-for-specialist-appointment'
    },
    {
      title: 'Documenting Pain for Disability',
      description: 'When endo affects your work',
      href: '/resources/documenting-pain-for-disability-claim'
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'Present endo data effectively',
      href: '/resources/how-to-track-pain-for-doctors'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Endometriosis Pain Log', url: '/resources/endometriosis-pain-log' }
  ]
};

export const EndometriosisPainLogPage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default EndometriosisPainLogPage;
