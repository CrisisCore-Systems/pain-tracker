/**
 * Resources Index Page
 * Landing page listing all free resources, templates, and guides
 */

import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Calendar,
  ClipboardList,
  BookOpen,
  Scale,
  Heart,
  ArrowRight,
  Shield,
  Clock
} from 'lucide-react';
import { LandingFooter } from '../../components/landing/LandingFooter';
import '../../styles/pages/landing.css';
import { combineSchemas, generateBreadcrumbSchema, generateFAQSchema, type FAQItem } from '../../lib/seo';
import { ResourceCtaStack } from '../../components/seo';
import { applyPageMetadata } from '../../components/seo/applyPageMetadata';

interface ResourceCard {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  category: 'template' | 'guide' | 'tool' | 'app';
  implemented: boolean;
}

interface FeaturedLink {
  title: string;
  href: string;
}

interface FeaturedResource {
  title: string;
  description: string;
  href: string;
  relatedLinks?: FeaturedLink[];
}

interface FeaturedSection {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  resources: FeaturedResource[];
}

const RESOURCES_HUB_TITLE = 'Free Pain Tracker Templates & Pain Journal Printables | PainTracker.ca';
const RESOURCES_HUB_DESCRIPTION = 'Download free pain tracker templates, printable pain journals, condition-specific pain logs, and private tracking guides for chronic pain, doctor visits, disability documentation, and daily symptom tracking.';
const RESOURCES_HUB_HEADING = 'Free Pain Tracker Templates, Printable Pain Journals, and Private Tracking Guides';

const painJournalChecklist = [
  'Pain level',
  'Pain location',
  'Triggers',
  'Sleep',
  'Medication response',
  'Mood',
  'Flare patterns',
  'Functional impact',
  'Notes for appointments',
];

const resourcesHubFaqs: FAQItem[] = [
  {
    question: 'What is a pain tracker template?',
    answer: 'A pain tracker template is a structured page you can print or reuse to record pain level, location, triggers, medication response, and daily limits. It helps you build consistent records instead of trying to remember details later during a flare, doctor appointment, or disability review.',
  },
  {
    question: 'Is the pain journal printable free?',
    answer: 'Yes. The printable pain journal templates and tracker sheets in this resource hub are free to download and use. You can start with paper, keep your own copies, and move to the private offline app later if you want faster tracking and cleaner exports.',
  },
  {
    question: 'What should I write in a pain journal?',
    answer: 'Write down pain intensity, where the pain is, what seems to trigger it, how sleep and activity affected it, what medication or self-care you tried, and what changed in your ability to function. Short daily notes are usually more useful than long entries written only during severe flares.',
  },
  {
    question: 'Can I use a pain tracker for doctor appointments?',
    answer: 'Yes. A pain tracker can help you bring organized notes to doctor appointments, especially when visits are short. Patterns across days or weeks often make appointments more productive because you can show pain severity, flare timing, treatment response, and how symptoms affect daily function.',
  },
  {
    question: 'Can I use a pain journal for disability or WorkSafeBC documentation?',
    answer: 'Yes. A pain journal can support disability or WorkSafeBC documentation when it records pain consistently and ties symptoms to functional impact. Daily notes about limits, missed tasks, medication effects, and flare recovery are often more useful than general summaries written weeks later.',
  },
  {
    question: 'Is PainTracker private?',
    answer: 'PainTracker is built around local-first privacy. You can start with printables or use the app without an account, and your records stay under your control until you choose to export them. The product is designed to reduce unnecessary exposure rather than pushing you into cloud-first tracking.',
  },
  {
    question: 'Does PainTracker work offline?',
    answer: 'Yes. PainTracker is designed to keep working offline so you can keep tracking even when internet access is unreliable or you do not want to depend on a connection. That matters when pain is high, appointments are close, or you need records available on your own device.',
  },
  {
    question: 'Do I need an account?',
    answer: 'No. You can use PainTracker resources and the core tracking experience without creating an account. That makes it easier to start quickly, reduces friction on hard days, and keeps the basic tracking workflow focused on your records instead of sign-up, passwords, or cloud dependence.',
  },
  {
    question: 'Should I use the app or a printable template?',
    answer: 'Start with the format that makes tracking easiest today. Printable templates work well when you want something simple and visible. The app becomes useful when you want private offline records, faster daily entries, and cleaner summaries or exports without changing the habit you already built on paper.',
  },
];

const featuredSections: FeaturedSection[] = [
  {
    title: 'Printable Pain Tracker Templates',
    description: 'Start with a printable format you can use immediately, then build the habit before moving to digital tracking. These templates align the hub with pain tracker, chronic pain journal template, free printable pain tracker, and pain journal template searches.',
    ctaText: 'Download free printable templates',
    ctaHref: '/resources/pain-diary-template-free-download',
    resources: [
      {
        title: 'Monthly Pain Tracker Printable',
        description: 'Use a 30-day view to spot flare patterns, sleep shifts, medication response, and longer treatment trends.',
        href: '/resources/monthly-pain-tracker-printable',
        relatedLinks: [
          { title: 'What to Include in a Pain Journal', href: '/resources/what-to-include-in-pain-journal' },
          { title: 'Daily Functioning Log for Disability', href: '/resources/daily-functioning-log-for-disability' },
          { title: 'WorkSafeBC Pain Journal Template', href: '/resources/worksafebc-pain-journal-template' },
          { title: 'Use the app free', href: '/start' },
        ],
      },
      {
        title: 'Daily Pain Tracker Template',
        description: 'Capture pain level, location, triggers, medication response, and short daily notes without overcomplicating the habit.',
        href: '/resources/daily-pain-tracker-printable',
        relatedLinks: [
          { title: 'How to Start a Pain Journal', href: '/resources/how-to-start-a-pain-journal' },
          { title: 'Pain Scale Chart Printable', href: '/resources/pain-scale-chart-printable' },
          { title: 'Medication and Pain Log', href: '/resources/medication-and-pain-log' },
        ],
      },
      {
        title: 'Weekly Pain Journal Template',
        description: 'See a one-week pattern before a doctor visit, medication change, or short functional review.',
        href: '/resources/weekly-pain-tracker-printable',
        relatedLinks: [
          { title: 'Doctor Visit Pain Summary Template', href: '/resources/doctor-visit-pain-summary-template' },
          { title: 'How Doctors Use Pain Diaries', href: '/resources/how-doctors-use-pain-diaries' },
          { title: 'Pain Diary for GP Appointment', href: '/resources/pain-diary-for-gp-appointment' },
        ],
      },
      {
        title: 'Pain Journal Template for Doctor Visits',
        description: 'Bring a concise appointment-ready summary that focuses on trends, functional impact, and what changed.',
        href: '/resources/doctor-visit-pain-summary-template',
        relatedLinks: [
          { title: 'How to Track Pain for Doctors', href: '/resources/how-to-track-pain-for-doctors' },
          { title: 'How to Describe Pain Clearly', href: '/resources/how-to-describe-pain' },
          { title: 'Printable Symptom Checklist', href: '/resources/printable-symptom-checklist' },
        ],
      },
    ],
  },
  {
    title: 'Doctor Visit and Disability Documentation',
    description: 'This is the documentation lane. Use these pages when you need records that show daily function, appointment trends, medication response, or WorkSafeBC and disability-relevant limitations instead of vague symptom summaries.',
    ctaText: 'See documentation-focused resources',
    ctaHref: '/resources/documenting-pain-for-disability-claim',
    resources: [
      {
        title: 'Pain Journal for Doctor Appointments',
        description: 'Learn what to bring when your appointment time is short and you need the important pattern visible fast.',
        href: '/resources/how-to-track-pain-for-doctors',
        relatedLinks: [
          { title: 'Doctor Visit Pain Summary Template', href: '/resources/doctor-visit-pain-summary-template' },
          { title: 'Pain Diary for Specialist Appointment', href: '/resources/pain-diary-for-specialist-appointment' },
          { title: 'Pain Diary for Rheumatologist', href: '/resources/pain-diary-for-rheumatologist' },
        ],
      },
      {
        title: 'Daily Functioning Log for Disability',
        description: 'Track the daily limits evaluators actually need to see: self-care, walking, sitting, concentration, chores, and missed tasks.',
        href: '/resources/daily-functioning-log-for-disability',
        relatedLinks: [
          { title: 'Functional Capacity Log', href: '/resources/functional-capacity-log' },
          { title: 'Pain Journal for Disability Benefits', href: '/resources/pain-journal-for-disability-benefits' },
          { title: 'Documenting Pain for Disability Claims', href: '/resources/documenting-pain-for-disability-claim' },
        ],
      },
      {
        title: 'WorkSafeBC Pain Journal Template',
        description: 'Use a BC-specific template when you need structured pain and function documentation for WorkSafeBC workflows.',
        href: '/resources/worksafebc-pain-journal-template',
        relatedLinks: [
          { title: 'Daily Functioning Log for Disability', href: '/resources/daily-functioning-log-for-disability' },
          { title: 'Monthly Pain Tracker Printable', href: '/resources/monthly-pain-tracker-printable' },
          { title: 'Pain Diary for Workers\' Compensation', href: '/resources/pain-diary-for-workers-compensation' },
          { title: 'Privacy architecture', href: '/privacy-architecture' },
        ],
      },
      {
        title: 'Functional Impact Log',
        description: 'Keep the focus on what pain changes in daily life, not just the number on a scale.',
        href: '/resources/functional-capacity-log',
        relatedLinks: [
          { title: 'Pain Diary for Disability Application', href: '/resources/pain-diary-for-disability-application' },
          { title: 'Pain Diary for Long-Term Disability', href: '/resources/pain-diary-for-long-term-disability' },
          { title: 'Pain Diary for Social Security Disability', href: '/resources/pain-diary-for-social-security-disability' },
        ],
      },
      {
        title: 'Medication Response Tracker',
        description: 'Show what you tried, when you took it, how much relief you got, and what side effects followed.',
        href: '/resources/medication-and-pain-log',
        relatedLinks: [
          { title: 'Pain Relief Log', href: '/resources/pain-relief-log' },
          { title: 'Chronic Pain Medication Log', href: '/resources/chronic-pain-medication-log' },
          { title: 'How to Track Pain Triggers', href: '/resources/how-to-track-pain-triggers' },
        ],
      },
    ],
  },
  {
    title: 'Condition Specific Pain Logs',
    description: 'Condition-specific pages show that PainTracker is not just a generic journal. These templates keep the core daily tracking pattern while emphasizing the details different specialists and diagnoses care about most.',
    ctaText: 'Browse condition-specific logs',
    ctaHref: '/resources/endometriosis-pain-log',
    resources: [
      {
        title: 'Endometriosis Pain Log',
        description: 'Track cycle-linked pelvic pain, GI symptoms, bowel or bladder disruption, and functional impact.',
        href: '/resources/endometriosis-pain-log',
        relatedLinks: [
          { title: 'Pain Tracking for Endometriosis', href: '/resources/pain-tracking-for-endometriosis' },
          { title: 'Monthly Pain Tracker Printable', href: '/resources/monthly-pain-tracker-printable' },
          { title: 'Use the app free', href: '/start' },
        ],
      },
      {
        title: 'Migraine Pain Diary',
        description: 'Record onset, aura, duration, trigger patterns, and medication response for neurology appointments.',
        href: '/resources/migraine-pain-diary-printable',
        relatedLinks: [
          { title: 'Pain Tracking for Migraines', href: '/resources/pain-tracking-for-migraines' },
          { title: 'Sleep and Pain Tracker', href: '/resources/sleep-and-pain-tracker' },
          { title: 'How to Track Pain Triggers', href: '/resources/how-to-track-pain-triggers' },
        ],
      },
      {
        title: 'Fibromyalgia Pain Tracker',
        description: 'Track pain, fatigue, fog, sleep, and sensitivity together instead of treating them as separate problems.',
        href: '/resources/fibromyalgia-pain-diary',
        relatedLinks: [
          { title: 'Pain Tracking for Fibromyalgia', href: '/resources/pain-tracking-for-fibromyalgia' },
          { title: 'Daily Symptom Tracker', href: '/resources/daily-symptom-tracker' },
          { title: 'Chronic Fatigue Symptom Log', href: '/resources/chronic-fatigue-symptom-log' },
        ],
      },
      {
        title: 'Back Pain Tracker',
        description: 'Monitor posture, radiation, activity triggers, and recovery timing when back pain shifts through the day.',
        href: '/resources/chronic-back-pain-diary',
        relatedLinks: [
          { title: 'Pain Tracking for Back Pain', href: '/resources/pain-tracking-for-back-pain' },
          { title: 'Exercise and Pain Log', href: '/resources/exercise-and-pain-log' },
          { title: 'Body Pain Chart Template', href: '/resources/body-pain-chart-template' },
        ],
      },
      {
        title: 'Arthritis Pain Journal',
        description: 'Capture stiffness, swelling, movement limits, and medication response in a rheumatology-friendly format.',
        href: '/resources/arthritis-pain-tracker',
        relatedLinks: [
          { title: 'Pain Tracking for Arthritis', href: '/resources/pain-tracking-for-arthritis' },
          { title: 'Pain Diary for Rheumatologist', href: '/resources/pain-diary-for-rheumatologist' },
          { title: 'Functional Capacity Log', href: '/resources/functional-capacity-log' },
        ],
      },
      {
        title: 'CRPS Pain Diary',
        description: 'Track burning pain, swelling, temperature changes, sensitivity, and motor disruption over time.',
        href: '/resources/crps-pain-diary-template',
        relatedLinks: [
          { title: 'Pain Tracking for CRPS', href: '/resources/pain-tracking-for-crps' },
          { title: 'Pain Relief Log', href: '/resources/pain-relief-log' },
          { title: 'Daily Functioning Log for Disability', href: '/resources/daily-functioning-log-for-disability' },
        ],
      },
    ],
  },
  {
    title: 'Private Offline App Guides',
    description: 'The product lane starts after the habit forms. Start with a printable, keep control of your records, then move into private digital tracking when paper stops being enough or you want easier summaries and exports.',
    ctaText: 'Use the private app free',
    ctaHref: '/start',
    resources: [
      {
        title: 'How to use PainTracker offline',
        description: 'Start with the app in the browser or install it for offline use when you want private tracking on your own device.',
        href: '/resources/free-pain-tracker-app',
        relatedLinks: [
          { title: 'Download PainTracker', href: '/download' },
          { title: 'Pain Tracker app overview', href: '/pain-tracker-app' },
          { title: 'Pain Tracker for iPhone', href: '/resources/pain-tracker-for-iphone' },
          { title: 'Pain Tracker for Android', href: '/resources/pain-tracker-for-android' },
        ],
      },
      {
        title: 'How private local tracking works',
        description: 'Understand the local-first approach before moving your paper habit into digital records.',
        href: '/privacy-architecture',
        relatedLinks: [
          { title: 'Privacy policy', href: '/privacy' },
          { title: 'Free Pain Tracker App', href: '/resources/free-pain-tracker-app' },
          { title: 'Pain Tracker for Desktop', href: '/resources/pain-tracker-for-desktop' },
        ],
      },
      {
        title: 'Why no account matters',
        description: 'Reduce friction, reduce exposure, and keep the first tracking session focused on records instead of sign-up.',
        href: '/privacy',
        relatedLinks: [
          { title: 'Free Pain Tracker App', href: '/resources/free-pain-tracker-app' },
          { title: 'Pain Tracking App for Seniors', href: '/resources/pain-tracking-app-for-seniors' },
          { title: 'Start the app', href: '/start' },
        ],
      },
      {
        title: 'How to export pain records',
        description: 'Move from daily logging into cleaner appointment and documentation summaries when you need to share your records.',
        href: '/pain-tracker-app',
        relatedLinks: [
          { title: 'Doctor Visit Pain Summary Template', href: '/resources/doctor-visit-pain-summary-template' },
          { title: 'WorkSafeBC Pain Journal Template', href: '/resources/worksafebc-pain-journal-template' },
          { title: 'Use the app free', href: '/start' },
        ],
      },
      {
        title: 'How to install the app',
        description: 'Install the app on desktop, iPhone, iPad, or Android when you want the speed of digital tracking without cloud-first lock-in.',
        href: '/download',
        relatedLinks: [
          { title: 'Pain Tracker for iPad', href: '/resources/pain-tracker-for-ipad' },
          { title: 'Pain Tracker for Android', href: '/resources/pain-tracker-for-android' },
          { title: 'Pain Tracker for Desktop', href: '/resources/pain-tracker-for-desktop' },
        ],
      },
    ],
  },
];

function useRobotsMeta(content: string | null) {
  useEffect(() => {
    const existingRobots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const existingGooglebot = document.querySelector<HTMLMetaElement>('meta[name="googlebot"]');
    const createdRobots = !existingRobots;
    const createdGooglebot = !existingGooglebot;
    const robotsMeta = existingRobots ?? document.createElement('meta');
    const googlebotMeta = existingGooglebot ?? document.createElement('meta');
    const previousRobotsContent = robotsMeta.getAttribute('content');
    const previousGooglebotContent = googlebotMeta.getAttribute('content');

    if (createdRobots) {
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }

    if (createdGooglebot) {
      googlebotMeta.setAttribute('name', 'googlebot');
      document.head.appendChild(googlebotMeta);
    }

    if (content) {
      robotsMeta.setAttribute('content', content);
      googlebotMeta.setAttribute('content', content);
    } else if (createdRobots) {
      robotsMeta.remove();
      googlebotMeta.remove();
    } else if (previousRobotsContent) {
      robotsMeta.setAttribute('content', previousRobotsContent);
      if (previousGooglebotContent) {
        googlebotMeta.setAttribute('content', previousGooglebotContent);
      } else if (createdGooglebot) {
        googlebotMeta.remove();
      } else {
        googlebotMeta.removeAttribute('content');
      }
    } else {
      robotsMeta.removeAttribute('content');
      if (previousGooglebotContent) {
        googlebotMeta.setAttribute('content', previousGooglebotContent);
      } else if (createdGooglebot) {
        googlebotMeta.remove();
      } else {
        googlebotMeta.removeAttribute('content');
      }
    }

    return () => {
      if (createdRobots) {
        robotsMeta.remove();
      } else if (previousRobotsContent) {
        robotsMeta.setAttribute('content', previousRobotsContent);
      } else {
        robotsMeta.removeAttribute('content');
      }

      if (createdGooglebot) {
        googlebotMeta.remove();
      } else if (previousGooglebotContent) {
        googlebotMeta.setAttribute('content', previousGooglebotContent);
      } else {
        googlebotMeta.removeAttribute('content');
      }
    };
  }, [content]);
}

const resources: ResourceCard[] = [
  // Tier 1: Core printable/download intent - IMPLEMENTED
  {
    title: 'Pain Diary Template PDF',
    description: 'Comprehensive daily pain tracking template. Record pain levels, symptoms, medications, and triggers.',
    href: '/resources/pain-diary-template-pdf',
    icon: <FileText className="w-6 h-6" />,
    badge: 'Most Popular',
    category: 'template',
    implemented: true
  },
  {
    title: 'Daily Pain Tracker Printable',
    description: 'Simple one-page daily tracking sheet for quick, consistent entries.',
    href: '/resources/daily-pain-tracker-printable',
    icon: <Calendar className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Weekly Pain Tracker Printable',
    description: 'Free weekly tracking layout for pain, triggers, medication, sleep, and flare episodes.',
    href: '/resources/weekly-pain-tracker-printable',
    icon: <ClipboardList className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Weekly Pain Log PDF',
    description: '7-day spread format showing your pain patterns at a glance.',
    href: '/resources/weekly-pain-log-pdf',
    icon: <ClipboardList className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Flare-Up Tracker Printable',
    description: 'Track flare episode start, severity, likely triggers, and recovery timing.',
    href: '/resources/flare-up-tracker-printable',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Medication and Pain Log',
    description: 'Record dose timing, pain response, and side effects in a clean tracking format.',
    href: '/resources/medication-and-pain-log',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Doctor Visit Pain Summary Template',
    description: 'One-page appointment summary for symptom trends, limitations, and medication response.',
    href: '/resources/doctor-visit-pain-summary-template',
    icon: <ClipboardList className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Body Pain Chart Template',
    description: 'Map pain location, spread, and intensity zones for clearer symptom reporting.',
    href: '/resources/body-pain-chart-template',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Chronic Pain Journal Template',
    description: 'Daily structured journal format for long-term pain, trigger, and function tracking.',
    href: '/resources/chronic-pain-journal-template',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Monthly Pain Tracker',
    description: 'Monthly overview for tracking long-term pain trends and treatment effectiveness.',
    href: '/resources/monthly-pain-tracker-printable',
    icon: <Calendar className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Pain Scale Chart Printable',
    description: 'Visual pain scale reference chart (0-10 NRS) for consistent pain rating.',
    href: '/resources/pain-scale-chart-printable',
    icon: <Scale className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Symptom Tracker Printable',
    description: 'Track symptoms beyond pain: fatigue, sleep quality, mood, and daily functioning.',
    href: '/resources/symptom-tracker-printable',
    icon: <Heart className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Migraine Pain Diary',
    description: 'Specialized template for tracking migraine-specific symptoms, triggers, and auras.',
    href: '/resources/migraine-pain-diary-printable',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  
  // Tier 2: Medical & Appointment Intent
  {
    title: 'How to Track Pain for Doctors',
    description: 'What doctors actually want to see in your pain records and how to present it.',
    href: '/resources/how-to-track-pain-for-doctors',
    icon: <BookOpen className="w-6 h-6" />,
    badge: 'Guide',
    category: 'guide',
    implemented: true
  },
  {
    title: 'What to Include in a Pain Journal',
    description: 'Complete guide to the information that makes pain tracking clinically useful.',
    href: '/resources/what-to-include-in-pain-journal',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'How to Start a Pain Journal',
    description: 'Start with a low-friction routine you can keep on hard days.',
    href: '/resources/how-to-start-a-pain-journal',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'How to Describe Pain Clearly',
    description: 'Use better pain language for doctor appointments and progress reviews.',
    href: '/resources/how-to-describe-pain',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'How to Track Pain Triggers',
    description: 'Track sleep, stress, weather, activity, and timing patterns before flares.',
    href: '/resources/how-to-track-pain-triggers',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  
  // Tier 3: Disability/Legal Documentation
  {
    title: 'Documenting Pain for Disability Claims',
    description: 'How to create pain documentation that supports WorkSafeBC and insurance claims.',
    href: '/resources/documenting-pain-for-disability-claim',
    icon: <Shield className="w-6 h-6" />,
    badge: 'Important',
    category: 'guide',
    implemented: true
  },
  {
    title: 'WorkSafeBC Pain Journal Template',
    description: 'Template specifically designed to meet WorkSafeBC documentation requirements.',
    href: '/resources/worksafebc-pain-journal-template',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  
  // Tier 4: Condition-Specific
  {
    title: 'Fibromyalgia Pain Diary',
    description: 'Template designed for tracking fibromyalgia symptoms including widespread pain and fatigue.',
    href: '/resources/fibromyalgia-pain-diary',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Chronic Back Pain Diary',
    description: 'Track back pain location, activities, posture, and treatments for spine specialists.',
    href: '/resources/chronic-back-pain-diary',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Arthritis Pain Tracker',
    description: 'Monitor joint pain, stiffness, swelling, and mobility across multiple joints.',
    href: '/resources/arthritis-pain-tracker',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Nerve Pain Symptom Log',
    description: 'Track burning, tingling, numbness, and shooting pain for neuropathy conditions.',
    href: '/resources/nerve-pain-symptom-log',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Printable Pain Log Sheet',
    description: 'Simple, clean pain tracking sheet for quick daily documentation.',
    href: '/resources/printable-pain-log-sheet',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Chronic Pain Diary Template',
    description: 'Designed for long-term chronic pain tracking with baseline and flare documentation.',
    href: '/resources/chronic-pain-diary-template',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: '7-Day Pain Diary Template',
    description: 'One-week format perfect for preparing for doctor appointments.',
    href: '/resources/7-day-pain-diary-template',
    icon: <Calendar className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'How Doctors Use Pain Diaries',
    description: 'Understanding the clinical perspective on pain tracking.',
    href: '/resources/how-doctors-use-pain-diaries',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Diary for Specialist Appointment',
    description: 'Prepare effectively for rheumatology, neurology, and pain specialist visits.',
    href: '/resources/pain-diary-for-specialist-appointment',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Symptom Tracking Before Diagnosis',
    description: 'Strategic tracking when seeking a diagnosis for unexplained symptoms.',
    href: '/resources/symptom-tracking-before-diagnosis',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Journal for Disability Benefits',
    description: 'Documentation strategies for disability benefit applications.',
    href: '/resources/pain-journal-for-disability-benefits',
    icon: <Shield className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Daily Functioning Log for Disability',
    description: 'Track functional limitations that disability evaluators need to see.',
    href: '/resources/daily-functioning-log-for-disability',
    icon: <Shield className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Endometriosis Pain Log',
    description: 'Track endo symptoms throughout your cycle: pelvic pain, GI issues, and more.',
    href: '/resources/endometriosis-pain-log',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'CRPS Pain Diary Template',
    description: 'Track Complex Regional Pain Syndrome symptoms: burning, swelling, color changes.',
    href: '/resources/crps-pain-diary-template',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Neuropathy Symptom Tracker',
    description: 'Monitor peripheral neuropathy: numbness, tingling, and progression over time.',
    href: '/resources/neuropathy-symptom-tracker',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  // Tier 5: Condition + Intent Guides (Tranche 2)
  {
    title: 'Pain Tracking for Fibromyalgia',
    description: 'How to track the six fibromyalgia symptom domains: pain, fatigue, fog, sleep, mood, and sensitivity.',
    href: '/resources/pain-tracking-for-fibromyalgia',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'How to Use a Pain Scale',
    description: 'Understand the 0-10 NRS scale, what each number means, and how to use it consistently.',
    href: '/resources/how-to-use-pain-scale',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Diary for Insurance Claims',
    description: 'What insurance adjusters look for in pain documentation and how to build a credible record.',
    href: '/resources/pain-diary-for-insurance-claims',
    icon: <Shield className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Printable Symptom Checklist',
    description: 'Check off 40+ symptoms with severity ratings before any doctor appointment.',
    href: '/resources/printable-symptom-checklist',
    icon: <FileText className="w-6 h-6" />,
    badge: 'Printable',
    category: 'template',
    implemented: true
  },
  {
    title: 'Pain Relief Log',
    description: 'Track what you tried, what worked, and how long relief lasted for each intervention.',
    href: '/resources/pain-relief-log',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Pain Tracking Before Surgery',
    description: 'Establish a documented baseline before surgery to support recovery comparison and clinical planning.',
    href: '/resources/pain-tracking-before-surgery',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Chronic Fatigue Symptom Log',
    description: 'Track energy, PEM, sleep, cognitive function, and pain for ME/CFS and chronic fatigue.',
    href: '/resources/chronic-fatigue-symptom-log',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Functional Capacity Log',
    description: 'Track what you can and cannot do each day — ADLs, work tasks, and physical tolerance.',
    href: '/resources/functional-capacity-log',
    icon: <Shield className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Pain Diary for Disability Application',
    description: 'Build consistent, daily documentation in the format disability evaluators use.',
    href: '/resources/pain-diary-for-disability-application',
    icon: <Shield className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Sleep and Pain Tracker',
    description: 'Track sleep hours, quality, and next-day pain to find how sleep and pain interact.',
    href: '/resources/sleep-and-pain-tracker',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  // Tier 6: Condition, Correlation, and App Pages (Tranche 3)
  {
    title: 'Pain Tracking for Arthritis',
    description: 'Track morning stiffness, joint pain, swelling, and flares for rheumatology appointments.',
    href: '/resources/pain-tracking-for-arthritis',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Tracking for Migraines',
    description: 'Log each migraine attack: onset, phases, triggers, and medication response.',
    href: '/resources/pain-tracking-for-migraines',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Weather and Pain Tracker',
    description: 'Find whether barometric pressure, temperature, or humidity correlates with your pain.',
    href: '/resources/weather-and-pain-tracker',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Exercise and Pain Log',
    description: 'Track physical activity and pain response to find your safe movement zone.',
    href: '/resources/exercise-and-pain-log',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Free Pain Tracker App',
    description: 'No account, no cloud — free private pain tracking on any device.',
    href: '/resources/free-pain-tracker-app',
    icon: <BookOpen className="w-6 h-6" />,
    badge: 'Free',
    category: 'guide',
    implemented: true
  },
  {
    title: 'Best Pain Tracking App',
    description: 'What features matter for chronic pain management and how to evaluate your options.',
    href: '/resources/best-pain-tracking-app',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Tracker for iPhone',
    description: 'Install PainTracker.ca on your iPhone home screen for offline tracking without App Store.',
    href: '/resources/pain-tracker-for-iphone',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Journal for Kids and Teens',
    description: 'Simple daily tracking adapted for children and teenagers with school-impact focus.',
    href: '/resources/pain-journal-for-kids-and-teens',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Diary Template Free Download',
    description: 'Download free daily, weekly, and monthly pain diary templates in PDF format.',
    href: '/resources/pain-diary-template-free-download',
    icon: <FileText className="w-6 h-6" />,
    badge: 'Printable',
    category: 'template',
    implemented: true
  },
  {
    title: 'Chronic Pain Self-Care Log',
    description: 'Track pacing, rest, heat and cold, and other non-medication strategies alongside pain.',
    href: '/resources/chronic-pain-self-care-log',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  // Tier 7: Condition, Documentation, and App Pages (Tranche 4)
  {
    title: 'Pain Tracking for Back Pain',
    description: 'Track posture triggers, radiation patterns, and functional limits for spine and back conditions.',
    href: '/resources/pain-tracking-for-back-pain',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Tracking for Nerve Pain',
    description: 'Log burning, shooting, and tingling pain alongside triggers and medication response.',
    href: '/resources/pain-tracking-for-nerve-pain',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Tracker for Android',
    description: 'Install PainTracker.ca on Android home screen for offline tracking without Play Store.',
    href: '/resources/pain-tracker-for-android',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: "Pain Diary for Workers' Compensation",
    description: "Document daily pain and functional limits for WSBC, WSIB, and other compensation board claims.",
    href: '/resources/pain-diary-for-workers-compensation',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Diary for Rheumatologist',
    description: 'Track morning stiffness, joint involvement, and medication response for rheumatology appointments.',
    href: '/resources/pain-diary-for-rheumatologist',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Log for Physical Therapy',
    description: 'Track exercise response and functional milestones during physiotherapy rehabilitation.',
    href: '/resources/pain-log-for-physical-therapy',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Chronic Pain Medication Log',
    description: 'Track medications, doses, timing, and effectiveness for better prescriber conversations.',
    href: '/resources/chronic-pain-medication-log',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Daily Symptom Tracker',
    description: 'Log pain, fatigue, sleep, mood, and brain fog daily to build the full clinical picture.',
    href: '/resources/daily-symptom-tracker',
    icon: <FileText className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Pain Tracking App for Seniors',
    description: 'Simple, free, offline-capable pain tracking for older adults — no account needed.',
    href: '/resources/pain-tracking-app-for-seniors',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Diary for Personal Injury Claim',
    description: 'Document daily pain and functional impact for ICBC, MVA, and personal injury legal proceedings.',
    href: '/resources/pain-diary-for-personal-injury-claim',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Tracking for Lupus',
    description: 'Document SLE flares, joint involvement, organ symptoms, and fatigue for rheumatology appointments and disability claims.',
    href: '/resources/pain-tracking-for-lupus',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Tracking for Endometriosis',
    description: 'Track cyclical pelvic pain, bowel and bladder symptoms, and functional disruption to support diagnosis and surgical evaluation.',
    href: '/resources/pain-tracking-for-endometriosis',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Tracker for iPad',
    description: 'Install PainTracker.ca on iPad from Safari — no App Store, no account, no cost. Track pain privately and offline.',
    href: '/resources/pain-tracker-for-ipad',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Diary for Social Security Disability',
    description: 'Document daily functional limits and pain severity for SSDI and SSI applications and appeals.',
    href: '/resources/pain-diary-for-social-security-disability',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Diary for Long-Term Disability',
    description: 'Track occupational limits, treatment compliance, and functional capacity for LTD insurance claims.',
    href: '/resources/pain-diary-for-long-term-disability',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Tracking for Cancer Pain',
    description: 'Log baseline and breakthrough pain, opioid response, and functional impact for oncology and palliative care.',
    href: '/resources/pain-tracking-for-cancer-pain',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Tracking for Ehlers-Danlos Syndrome',
    description: 'Document subluxations, POTS episodes, fatigue, and multi-system EDS symptoms for connective tissue specialists.',
    href: '/resources/pain-tracking-for-ehlers-danlos',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Diary for Physiotherapist',
    description: 'Track exercise response, home program compliance, and functional progress between PT sessions.',
    href: '/resources/pain-diary-for-physiotherapist',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Management Journal',
    description: 'Keep a structured daily pain journal that improves clinical care, supports disability documentation, and reveals your own patterns.',
    href: '/resources/pain-management-journal',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Tracking for Multiple Sclerosis',
    description: 'Log MS neuropathic pain, spasticity, fatigue, and relapse patterns for neurology appointments and disability documentation.',
    href: '/resources/pain-tracking-for-ms',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Tracking for CRPS',
    description: 'Log allodynia, skin and temperature changes, motor dysfunction, and autonomic signs for pain clinic and disability documentation.',
    href: '/resources/pain-tracking-for-crps',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Tracking for Sciatica',
    description: 'Document radiation pattern, neurological symptoms, and posture triggers for GP, physiotherapy, and specialist appointments.',
    href: '/resources/pain-tracking-for-sciatica',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Tracking After Surgery',
    description: 'Track post-operative pain severity, medication timing, wound status, and functional milestones for surgical recovery.',
    href: '/resources/pain-tracking-after-surgery',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Diary for GP Appointment',
    description: 'Prepare for your family doctor visit with documented pain trends, functional limits, and medication response data.',
    href: '/resources/pain-diary-for-gp-appointment',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Tracking for Headaches',
    description: 'Log headache frequency, duration, type, triggers, and medication use — including medication-overuse headache patterns.',
    href: '/resources/pain-tracking-for-headaches',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Tracking for Hip Pain',
    description: 'Document hip pain location, weight-bearing tolerance, gait limitations, and activity triggers for orthopaedic assessment.',
    href: '/resources/pain-tracking-for-hip-pain',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Pain Tracking for Shoulder Pain',
    description: 'Log movement restrictions, overhead tolerance, night pain, and activity triggers for physiotherapy and orthopaedic care.',
    href: '/resources/pain-tracking-for-shoulder-pain',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'guide',
    implemented: true
  },
  {
    title: 'Chronic Pain Flare Tracker',
    description: 'Log flare onset, peak severity, duration, triggers, and recovery time to identify patterns and manage flares proactively.',
    href: '/resources/chronic-pain-flare-tracker',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'tool',
    implemented: true
  },
  {
    title: 'Pain Diary Template for Insurance',
    description: 'Document functional limits, treatment compliance, and consistent pain patterns for insurance claim evidence.',
    href: '/resources/pain-diary-template-for-insurance',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'template',
    implemented: true
  },
  {
    title: 'Pain Tracker for Desktop',
    description: 'Open PainTracker.ca in any desktop browser — Chrome, Edge, Firefox, Safari — on Windows, Mac, or Linux. No download required.',
    href: '/resources/pain-tracker-for-desktop',
    icon: <BookOpen className="w-6 h-6" />,
    category: 'app',
    implemented: true
  },
];

export const ResourcesIndexPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchQuery = new URLSearchParams(location.search).get('q')?.trim() ?? '';
  const isPlaceholderSearch = ['{search_term_string}', 'search_term_string'].includes(searchQuery);

  useEffect(() => {
    if (isPlaceholderSearch) {
      navigate('/resources', { replace: true });
    }
  }, [isPlaceholderSearch, navigate]);

  useRobotsMeta(searchQuery ? 'noindex,follow' : null);

  useEffect(() => {
    return applyPageMetadata({
      title: RESOURCES_HUB_TITLE,
      description: RESOURCES_HUB_DESCRIPTION,
      canonicalUrl: 'https://www.paintracker.ca/resources',
    });
  }, []);

  const schema = combineSchemas(
    generateBreadcrumbSchema(
      [
        { name: 'Home', url: '/' },
        { name: 'Resources', url: '/resources' },
      ],
      { siteUrl: 'https://www.paintracker.ca' }
    ),
    generateFAQSchema(resourcesHubFaqs)
  );

  const templates = resources.filter((resource) => resource.category === 'template');
  const guides = resources.filter(
    (resource) => resource.category === 'guide' || resource.category === 'tool' || resource.category === 'app'
  );

  const renderResourceCard = (resource: ResourceCard) => {
    let actionLabel = 'Open guide';
    if (resource.category === 'template') {
      actionLabel = 'Download free';
    } else if (resource.category === 'tool') {
      actionLabel = 'Open tool';
    }

    const cardContent = (
      <>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 ${resource.implemented ? 'bg-primary/20' : 'bg-slate-700'} rounded-xl flex items-center justify-center ${resource.implemented ? 'text-primary' : 'text-slate-500'} flex-shrink-0`}>
            {resource.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`font-semibold ${resource.implemented ? 'text-white group-hover:text-primary' : 'text-slate-400'} transition-colors truncate`}>
                {resource.title}
              </h3>
              {resource.badge && resource.implemented && (
                <span className="px-2 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-full flex-shrink-0">
                  {resource.badge}
                </span>
              )}
              {!resource.implemented && (
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-700 text-slate-400 rounded-full flex-shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Coming Soon
                </span>
              )}
            </div>
            <p className={`text-sm ${resource.implemented ? 'text-slate-400' : 'text-slate-500'} line-clamp-2`}>
              {resource.description}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-primary">
          {resource.implemented ? (
            <>
              <span>{actionLabel}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          ) : (
            <span className="text-slate-500">Available soon</span>
          )}
        </div>
      </>
    );

    if (resource.implemented) {
      return (
        <Link
          key={resource.href}
          to={resource.href}
          className="group p-6 bg-slate-800 hover:bg-slate-750 rounded-xl border border-slate-700 hover:border-primary/50 transition-all"
        >
          {cardContent}
        </Link>
      );
    }

    return (
      <div
        key={resource.href}
        className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 opacity-75 cursor-not-allowed"
      >
        {cardContent}
      </div>
    );
  };

  const renderFeaturedCard = (resource: FeaturedResource) => (
    <article
      key={resource.href}
      className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-[0_0_0_1px_rgba(14,165,233,0.03)]"
    >
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-white">
          <Link to={resource.href} className="hover:text-primary transition-colors">
            {resource.title}
          </Link>
        </h3>
        <p className="text-slate-300">{resource.description}</p>
        <Link to={resource.href} className="inline-flex items-center gap-2 text-sm text-primary hover:text-sky-300 transition-colors">
          <span>Open resource</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {resource.relatedLinks && resource.relatedLinks.length > 0 && (
        <div className="mt-5 border-t border-slate-700 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Related links</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {resource.relatedLinks.map((relatedLink) => (
              <li key={`${resource.href}-${relatedLink.href}`}>
                <Link to={relatedLink.href} className="hover:text-primary transition-colors">
                  {relatedLink.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );

  return (
    <div className="min-h-screen bg-background landing-always-dark">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>

      <nav className="sticky top-0 z-50 nav-floating-glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="landing-brand text-xl">Pain Tracker</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/download"
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                Download
              </Link>
              <Link
                to="/start"
                className="btn-cta-primary px-4 py-2 text-sm font-medium rounded-lg"
              >
                Use the app free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" role="main">
        <section className="hero-section-dramatic py-16 sm:py-24">
          <div className="hero-bg-mesh" />
          <div className="hero-grid-pattern" />

          <div className="orb-container">
            <div className="orb-glow orb-glow-sky w-96 h-96 -top-48 -left-48" />
            <div className="orb-glow orb-glow-purple w-72 h-72 top-1/4 -right-36" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 landing-badge mb-6">
              <Download className="w-4 h-4" />
              <span>Free printables and private tracking</span>
            </div>

            <h1 className="landing-headline landing-headline-lg text-white mb-6">
              {RESOURCES_HUB_HEADING}
            </h1>

            <p className="landing-subhead text-lg sm:text-xl max-w-3xl mx-auto">
              PainTracker resources help you document chronic pain clearly, privately, and consistently. Download free printable pain tracker templates, build a daily pain journal, prepare better notes for doctor appointments, or use the private offline app when paper stops being enough.
            </p>

            <p className="mt-5 text-base sm:text-lg text-slate-200 max-w-2xl mx-auto">
              Start with a printable. Keep control of your records. Move into private digital tracking when you are ready.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/resources/pain-diary-template-free-download" className="btn-cta-primary px-6 py-3 rounded-xl font-medium">
                Download free printable templates
              </Link>
              <Link to="/start" className="px-6 py-3 rounded-xl border border-slate-600 text-white hover:border-primary hover:text-primary transition-colors">
                Use the private app free
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-950/70 border-y border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div>
                <h2 className="text-3xl font-bold text-white">Build the tracking habit first, then decide how far you need to go</h2>
                <p className="mt-4 text-slate-300 max-w-3xl">
                  The hub is designed to support one clear flow: printable template first, better daily records second, stronger doctor and disability documentation third, and private offline app use when you want faster logging or cleaner exports. That turns the page into a command center instead of a passive directory.
                </p>
                <p className="mt-4 text-slate-300 max-w-3xl">
                  If you only need a pain journal template today, start there. If you need clinician-ready notes, use the documentation lane. If you want long-term privacy and offline access, move into the app without changing the tracking logic you already built.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
                <h2 className="text-2xl font-bold text-white">What to track in a pain journal</h2>
                <p className="mt-3 text-slate-300">
                  These are the details that make a pain journal useful for pattern spotting, doctor appointments, and disability documentation.
                </p>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2 text-slate-200">
                  {painJournalChecklist.map((item) => (
                    <li key={item} className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3">
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Link to="/resources/what-to-include-in-pain-journal" className="inline-flex items-center gap-2 text-primary hover:text-sky-300 transition-colors">
                    <span>Read what to include in a pain journal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {featuredSections.map((section, index) => (
          <section
            key={section.title}
            className={index % 2 === 0 ? 'py-16 bg-slate-900' : 'py-16 bg-slate-800/50 border-t border-slate-700'}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-bold text-white">{section.title}</h2>
                  <p className="mt-3 text-slate-300">{section.description}</p>
                </div>
                <div>
                  <Link to={section.ctaHref} className="inline-flex items-center gap-2 text-primary hover:text-sky-300 transition-colors font-medium">
                    <span>{section.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {section.resources.map(renderFeaturedCard)}
              </div>
            </div>
          </section>
        ))}

        <section className="py-16 bg-slate-950 border-y border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-bold text-white">Frequently asked questions</h2>
              <p className="mt-3 text-slate-300">
                These answers help clarify the choice between printables, guided tracking, and the app before you commit to a workflow.
              </p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {resourcesHubFaqs.map((faq) => (
                <article key={faq.question} className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
                  <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                  <p className="mt-3 text-slate-300">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-8">
              <h2 className="text-3xl font-bold text-white">Full resource library</h2>
              <p className="mt-3 text-slate-300">
                Browse every printable template, condition-specific page, doctor-visit guide, and app-related resource in one place. The featured sections above organize the strongest intent lanes. The full library below keeps the wider archive crawlable and easy to explore.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-900 pt-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-3">Printable templates and logs</h2>
            <p className="text-slate-300 mb-8 max-w-3xl">
              These pages target printable and template intent directly, including pain tracker printables, pain journal worksheets, symptom logs, appointment summaries, and daily tracking sheets.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(renderResourceCard)}
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-800/50 border-t border-slate-700">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-3">Guides, condition pages, and app help</h2>
            <p className="text-slate-300 mb-8 max-w-3xl">
              This section connects informational searches with documentation workflows and private app use, so the hub supports both discovery and progression through the full tracking funnel.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {guides.map(renderResourceCard)}
            </div>
          </div>
        </section>

        <ResourceCtaStack
          heading="Use the resource funnel that matches real-life pain tracking"
          body="The patient lane starts with utility: use the app free, print a tracker, or prepare records for doctors, disability, or WorkSafeBC workflows."
        />
      </main>

      <LandingFooter />
    </div>
  );
};

export default ResourcesIndexPage;
