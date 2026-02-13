/**
 * Pain Scale Chart Printable - SEO Landing Page
 *
 * Target keyword: "pain scale chart printable"
 * Search intent: User wants a visual 0-10 NRS pain scale to print for reference
 * Conversion goal: Download chart → discover Pain Tracker Pro
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'pain-scale-chart-printable',
  title: 'Pain Scale Chart Printable (Free)',
  metaTitle:
    'Pain Scale Chart Printable — Free 0-10 NRS Visual Reference | Pain Tracker Pro',
  metaDescription:
    'Download a free printable pain scale chart. Visual 0-10 Numeric Rating Scale with descriptors, faces, colors, and functional impact — the clinical standard for consistent pain reporting.',
  keywords: [
    'pain scale chart printable',
    'pain scale 1-10',
    'pain rating scale',
    'NRS pain scale',
    'numeric rating scale pain',
    'pain level chart',
    'pain scale faces',
    'visual pain scale',
    'pain intensity scale',
    'pain assessment chart',
    'printable pain scale',
    'pain chart for doctors',
    'pain scale reference card',
    'pain scale poster',
  ],

  // Above-the-fold
  badge: 'Free Download',
  headline: 'Pain Scale Chart Printable',
  subheadline:
    'A clear, visual 0-10 Numeric Rating Scale (NRS) reference with descriptors, color coding, and functional impact examples. Print it, keep it with your pain diary, and rate your pain consistently every time.',
  primaryCTA: {
    text: 'Download Free PDF',
    href: '/assets/pain-scale-chart.pdf',
    download: true,
  },
  secondaryCTA: {
    text: 'Try Digital Version',
    href: '/start',
  },

  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/pain-scale-chart.pdf',
    downloadFileName: 'pain-scale-chart.pdf',
  },

  // Content sections
  whatIsThis:
    'A pain scale chart is a visual reference that helps you translate your pain experience into a consistent number from 0 (no pain) to 10 (worst possible pain). This printable version includes the standard Numeric Rating Scale (NRS) used in hospitals and clinics worldwide, enhanced with color coding, facial expression cues, descriptive words, and real-world functional examples for each level. It eliminates the guesswork of "What does a 6 really mean?" and ensures your ratings are clinically meaningful and comparable over time.',

  whoShouldUse: [
    'Anyone who uses a pain diary, tracker, or log and wants consistent ratings',
    'Patients preparing for doctor appointments who need to describe pain accurately',
    'People filing disability or workers compensation claims that require documented pain levels',
    'Caregivers and family members helping a loved one report pain',
    'Healthcare providers who want a reference to share with patients',
    'Anyone new to pain tracking who isn\'t sure how to rate their pain',
  ],

  howToUse: [
    {
      step: 1,
      title: 'Print and keep it visible',
      description:
        'Download the chart and print it. Keep a copy wherever you fill out your pain diary — by your bed, on the fridge, or folded in your pain journal. Refer to it every time you rate your pain.',
    },
    {
      step: 2,
      title: 'Read the functional descriptions',
      description:
        'Don\'t just pick a number based on how bad it "feels." Read the functional impact descriptions for each level. A 4 might mean "pain is distracting but you can still work." A 7 might mean "pain dominates your thinking and limits most activity." Anchor your rating to function, not just sensation.',
    },
    {
      step: 3,
      title: 'Rate at the same time each day',
      description:
        'Pain fluctuates. For the most useful data, rate at consistent times — morning, afternoon, and evening — or at minimum once daily at the same time. Your pain diary or tracker should capture these time-stamped ratings.',
    },
    {
      step: 4,
      title: 'Use it at appointments',
      description:
        'Bring the chart to your next medical appointment. When your doctor asks "How\'s your pain?", point to the chart and explain your typical range. Saying "I\'m usually a 4-5, but flares bring me to a 7-8" is far more useful than "it hurts a lot."',
    },
  ],

  whyItMatters:
    'The Numeric Rating Scale (NRS) is the most widely used pain assessment tool in clinical practice, recommended by the Initiative on Methods, Measurement, and Pain Assessment in Clinical Trials (IMMPACT). Studies show that patients who use a consistent reference when rating pain produce significantly more reliable data than those who guess. Reliable pain data leads to better treatment decisions, stronger disability documentation, and clearer communication between you and your care team. A printed reference chart is the simplest way to achieve this consistency — no app required, no learning curve, just a glance before you write your number.',

  // Trust signals
  trustSignals: {
    medicalNote:
      'Based on the Numeric Rating Scale (NRS), the clinical standard recommended by IMMPACT for pain assessment.',
    privacyNote:
      'No email, no account, no tracking. The PDF downloads directly to your device — nothing is collected.',
    legalNote:
      'Consistent, documented pain ratings strengthen disability and workers compensation claims by demonstrating reliable self-reporting methodology.',
  },

  // FAQ
  faqs: [
    {
      question: 'What is the 0-10 pain scale?',
      answer:
        'The 0-10 Numeric Rating Scale (NRS) is the most common clinical tool for measuring pain intensity. 0 means no pain at all, and 10 means the worst pain imaginable. It\'s used by hospitals, clinicians, and researchers worldwide because it\'s simple, quick, and produces data that can be tracked over time and compared across visits.',
    },
    {
      question: 'How do I know what number to pick?',
      answer:
        'Focus on how pain affects your ability to function, not just how it "feels." Can you work, concentrate, sleep, or do household tasks? A pain level of 3 usually means pain is noticeable but doesn\'t stop you from doing things. A 6 means pain significantly interferes with activity. An 8 means you can barely do anything. The chart includes functional descriptions for each level to guide you.',
    },
    {
      question: 'What\'s the difference between this and the Wong-Baker faces scale?',
      answer:
        'The Wong-Baker FACES scale uses cartoon faces from smiling to crying, originally designed for children. The NRS uses numbers 0-10 and is preferred for adults because it\'s more precise and produces data that\'s easier to track and compare. Our chart includes both facial cues and functional descriptions so you can cross-reference if helpful.',
    },
    {
      question: 'Should I rate my pain right now, or my average pain today?',
      answer:
        'It depends on what you\'re tracking. For a pain diary, rate your pain "right now" at each entry time — this captures how pain changes throughout the day. For appointment summaries, report your average daily pain and your worst daily pain over the past week. The chart helps you rate consistently regardless of which approach you use.',
    },
    {
      question: 'My pain is always high — should I still use the full 0-10 scale?',
      answer:
        'Yes. Even if your baseline pain is a 5, you still experience variation — a 5 is different from a 7, and recording that difference matters for treatment decisions. Resist the temptation to compress your range (e.g., always saying "8"). Use the functional descriptions on the chart to calibrate. If you can still walk, talk, and think, you\'re probably below an 8.',
    },
    {
      question: 'Can I use this chart for a disability claim?',
      answer:
        'Absolutely. Using a standardized pain scale and documenting your ratings consistently demonstrates methodical self-reporting, which adjudicators value. Reference the NRS by name in your documentation. Pair the chart with a daily pain log for maximum impact — consistent daily records are far more persuasive than occasional estimates.',
    },
    {
      question: 'Does my doctor use this same scale?',
      answer:
        'Almost certainly. The NRS is the default pain assessment in most clinical settings in Canada, the US, UK, and Australia. When you and your doctor use the same scale, your reported numbers translate directly into their clinical notes, reducing miscommunication and improving treatment alignment.',
    },
    {
      question: 'What if my pain feels like a 12?',
      answer:
        'The scale is anchored at 10 as the worst pain imaginable. If your pain feels "off the chart," rate it a 10 and note the functional impact: "unable to move, unable to speak, constant tears." The notes matter more than the number at the extreme end. A 10 is already a clinical emergency signal — your provider will take it seriously.',
    },
    {
      question: 'Is this the same as a VAS (Visual Analog Scale)?',
      answer:
        'They\'re similar but not identical. A Visual Analog Scale (VAS) uses a continuous line where you mark your pain level anywhere along it, then it\'s measured with a ruler. The NRS uses discrete whole numbers (0, 1, 2... 10). Both are validated, but the NRS is more practical for daily self-reporting because you can say or write a number without measuring a line.',
    },
    {
      question: 'Is there a digital version?',
      answer:
        'Yes. Pain Tracker Pro includes a built-in pain scale with the same 0-10 NRS, color-coded and with functional descriptors. The digital version automatically records your rating with a timestamp, tracks changes over time, and generates clinical reports — all encrypted and stored only on your device.',
    },
  ],

  // Related links
  relatedLinks: [
    {
      title: 'Daily Pain Tracker Printable',
      description:
        'One-page daily format to record pain ratings alongside meds, activity, and mood',
      href: '/resources/daily-pain-tracker-printable',
    },
    {
      title: 'Pain Diary Template PDF',
      description:
        'Comprehensive multi-day format with weekly summaries for detailed tracking',
      href: '/resources/pain-diary-template-pdf',
    },
    {
      title: 'How to Track Pain for Doctors',
      description:
        'What information your doctor actually uses from pain logs',
      href: '/resources/how-to-track-pain-for-doctors',
    },
    {
      title: 'Symptom Tracker Printable',
      description:
        'Track beyond pain: fatigue, sleep quality, mood, and functioning',
      href: '/resources/symptom-tracker-printable',
    },
    {
      title: 'Documenting Pain for Disability',
      description:
        'Build documentation that supports your claim',
      href: '/resources/documenting-pain-for-disability-claim',
    },
    {
      title: 'Monthly Pain Tracker Printable',
      description:
        'See pain trends across a full month at a glance',
      href: '/resources/monthly-pain-tracker-printable',
    },
  ],

  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    {
      name: 'Pain Scale Chart Printable',
      url: '/resources/pain-scale-chart-printable',
    },
  ],
};

export const PainScaleChartPrintablePage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default PainScaleChartPrintablePage;
