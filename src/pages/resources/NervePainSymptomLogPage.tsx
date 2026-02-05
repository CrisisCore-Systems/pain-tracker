/**
 * Nerve Pain Symptom Log - SEO Landing Page
 * 
 * Target keyword: "nerve pain symptom log"
 * Search intent: User needs neuropathic pain tracking
 * Conversion goal: Download template → discover Pain Tracker Pro
 * 
 * Tier 4 - Condition-Specific Long-Tail
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'nerve-pain-symptom-log',
  title: 'Nerve Pain Symptom Log (Free)',
  metaTitle: 'Nerve Pain Symptom Log - Free Neuropathic Pain Tracker | Pain Tracker Pro',
  metaDescription: 'Download our free nerve pain symptom log. Track burning, tingling, numbness, and shooting pain. Designed for neuropathy, sciatica, and other nerve-related conditions.',
  keywords: [
    'nerve pain symptom log',
    'neuropathy tracker',
    'nerve pain diary',
    'neuropathic pain log',
    'sciatica pain tracker',
    'burning pain diary',
    'tingling symptom tracker',
    'peripheral neuropathy log'
  ],
  
  // Above-the-fold
  badge: 'Free Download',
  headline: 'Nerve Pain Symptom Log',
  subheadline: 'Track neuropathic pain symptoms: burning, tingling, numbness, electric shocks, and sensitivity. Designed for peripheral neuropathy, sciatica, and nerve-related conditions.',
  primaryCTA: {
    text: 'Download Free PDF',
    href: '/assets/nerve-pain-symptom-log.pdf',
    download: true
  },
  secondaryCTA: {
    text: 'Try Digital Version',
    href: '/start'
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/nerve-pain-symptom-log.pdf',
    downloadFileName: 'nerve-pain-symptom-log.pdf'
  },
  
  // Content sections
  whatIsThis: 'A nerve pain symptom log captures the unique characteristics of neuropathic pain that standard pain diaries miss. Nerve pain feels different—burning, electric, shooting, tingling—and has different patterns than muscle or joint pain. This log tracks pain quality (burning, stabbing, shooting), sensory changes (numbness, tingling, hypersensitivity), distribution patterns, and triggers specific to nerve pain. It helps neurologists understand your neuropathy.',
  
  whoShouldUse: [
    'People with peripheral neuropathy (diabetic, chemotherapy-induced, idiopathic)',
    'Those with sciatica or radiculopathy (nerve root compression)',
    'Patients with trigeminal neuralgia or other facial nerve pain',
    'People experiencing post-surgical nerve pain',
    'Anyone with burning, tingling, or shooting pain suggesting nerve involvement'
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Describe pain quality precisely',
      description: 'Nerve pain has distinctive qualities. Is it burning? Electric shock-like? Shooting? Stabbing? Pins and needles? Note the specific quality—it helps neurologists identify the type of nerve involvement.'
    },
    {
      step: 2,
      title: 'Track sensory changes',
      description: 'Document numbness (decreased sensation), tingling (paresthesias), and hypersensitivity (allodynia—pain from normally painless touch). These sensory symptoms are as important as pain itself.'
    },
    {
      step: 3,
      title: 'Map the distribution',
      description: 'Nerve pain follows nerve pathways. Note exactly where symptoms occur and whether they follow a line (dermatome) or are in hands/feet (stocking-glove pattern). Distribution helps diagnose the cause.'
    },
    {
      step: 4,
      title: 'Note triggers and timing',
      description: 'Some nerve pain is constant; some is triggered by touch, temperature, or position. Document what triggers episodes and how long they last. This guides treatment selection.'
    }
  ],
  
  whyItMatters: 'Nerve pain (neuropathic pain) requires different treatments than other pain types. Standard pain medications often don\'t work; nerve pain responds to specific drugs like gabapentin, pregabalin, or duloxetine. Accurate tracking helps neurologists diagnose the type of neuropathy and select appropriate treatment. Patients who describe their nerve pain precisely get better care because treatment can be targeted.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Includes sensory symptom categories used in clinical neuropathy assessment.',
    privacyNote: 'Paper format keeps your detailed symptom information private.',
    legalNote: 'Detailed nerve symptom documentation supports disability claims for neuropathic conditions.'
  },
  
  // FAQ
  faqs: [
    {
      question: 'How is nerve pain different from regular pain?',
      answer: 'Nerve pain (neuropathic pain) has distinctive qualities: burning, electric shock-like, shooting, or tingling sensations. It\'s often accompanied by numbness or hypersensitivity. Regular (nociceptive) pain is more commonly aching, throbbing, or sharp. Nerve pain also follows nerve pathways rather than being localized to muscles or joints.'
    },
    {
      question: 'What should I track for neuropathy?',
      answer: 'Track: pain quality (burning, tingling, shooting), intensity (0-10), location and spread pattern, numbness areas, hypersensitivity (pain from light touch), triggers (touch, temperature, position), and timing (constant vs. intermittent). Also note any weakness if present.'
    },
    {
      question: 'Why does my nerve pain come and go?',
      answer: 'Nerve pain can be continuous or episodic depending on the cause. Compressed nerves (sciatica) often hurt with certain positions. Some neuropathies cause constant symptoms. Tracking when pain occurs and potential triggers helps identify patterns and guides treatment.'
    },
    {
      question: 'How does this help my neurologist?',
      answer: 'Neurologists need specific information to diagnose neuropathy type: symptom distribution, quality, progression, and triggers. A good log provides data for nerve conduction study planning and helps distinguish between central and peripheral causes. It also tracks treatment response over time.'
    },
    {
      question: 'What if I have numbness but not much pain?',
      answer: 'Track numbness just as carefully as pain. Sensory loss is a key neuropathy symptom—in fact, some neuropathies are more numbness than pain. Document areas of decreased sensation, whether it\'s spreading, and how it affects function (dropping things, difficulty with buttons).'
    }
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Pain Diary Template PDF',
      description: 'Comprehensive pain tracking',
      href: '/resources/pain-diary-template-pdf'
    },
    {
      title: 'Chronic Back Pain Diary',
      description: 'For sciatica and radicular pain',
      href: '/resources/chronic-back-pain-diary'
    },
    {
      title: 'Symptom Tracker Printable',
      description: 'Track symptoms beyond pain',
      href: '/resources/symptom-tracker-printable'
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'Present nerve pain data effectively',
      href: '/resources/how-to-track-pain-for-doctors'
    },
    {
      title: 'Documenting Pain for Disability',
      description: 'Neuropathy documentation for claims',
      href: '/resources/documenting-pain-for-disability-claim'
    },
    {
      title: 'Daily Pain Tracker Printable',
      description: 'Quick daily nerve pain tracking',
      href: '/resources/daily-pain-tracker-printable'
    }
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Nerve Pain Symptom Log', url: '/resources/nerve-pain-symptom-log' }
  ]
};

export const NervePainSymptomLogPage: React.FC = () => {
  return <SEOPageLayout content={pageContent} />;
};

export default NervePainSymptomLogPage;
