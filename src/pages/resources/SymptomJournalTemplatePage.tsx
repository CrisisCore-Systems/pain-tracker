/**
 * Symptom Journal Template – SEO Landing Page
 *
 * Target keyword: "symptom journal template"
 * Tier 1 – Printable / Journaling Intent
 */

import React from 'react';
import {
  Activity, Brain, Pill, Moon, CloudRain, Thermometer,
  FileText, CheckCircle, TrendingUp, Clock,
} from 'lucide-react';
import {
  SEOPageLayout,
  type SEOPageContent,
  StatsBanner,
  BottomCTACallout,
} from '../../components/seo';
import type { StatItem } from '../../components/seo';

/* ── Symptom Category Grid ────────────────────────────────────────────────── */

const SymptomCategoryGrid: React.FC = () => {
  const categories = [
    {
      icon: Activity,
      label: 'Physical Symptoms',
      color: 'bg-red-50 border-red-200',
      items: [
        'Pain (location, intensity 0-10, character)',
        'Fatigue / energy level',
        'Nausea / digestive symptoms',
        'Headache / migraine',
        'Dizziness / balance issues',
        'Shortness of breath',
        'Muscle weakness or stiffness',
        'Swelling / inflammation',
      ],
    },
    {
      icon: Brain,
      label: 'Cognitive & Neurological',
      color: 'bg-purple-50 border-purple-200',
      items: [
        'Brain fog / difficulty concentrating',
        'Memory lapses',
        'Word-finding problems',
        'Sensory sensitivities (light, sound, touch)',
        'Tingling or numbness',
        'Coordination changes',
        'Reaction time',
        'Mental fatigue',
      ],
    },
    {
      icon: Moon,
      label: 'Sleep & Recovery',
      color: 'bg-indigo-50 border-indigo-200',
      items: [
        'Bedtime and wake time',
        'Time to fall asleep',
        'Night wakings and reason',
        'Sleep quality (1-5)',
        'Morning pain level',
        'Morning stiffness duration',
        'Daytime naps',
        'Restorative vs unrestorative sleep',
      ],
    },
    {
      icon: Pill,
      label: 'Medications & Interventions',
      color: 'bg-emerald-50 border-emerald-200',
      items: [
        'Medication name, dose, and time',
        'Relief level (before/after score)',
        'Duration of effect',
        'Side effects noticed',
        'Non-medication interventions (heat, ice, rest)',
        'Supplements taken',
        'Missed doses and reason',
        'Injections or procedures',
      ],
    },
    {
      icon: Thermometer,
      label: 'Functional Impact',
      color: 'bg-amber-50 border-amber-200',
      items: [
        'Activities completed normally',
        'Activities modified or avoided',
        'Work / school attended or missed',
        'Household tasks managed',
        'Social activities — attended vs cancelled',
        'Mobility (walking distance, stairs)',
        'Self-care capacity',
        'Help needed from others',
      ],
    },
    {
      icon: CloudRain,
      label: 'Context & Triggers',
      color: 'bg-sky-50 border-sky-200',
      items: [
        'Weather and barometric pressure',
        'Stress level (1-5)',
        'Major events or changes',
        'Physical activity before symptoms changed',
        'Food and hydration',
        'Posture or position',
        'Travel or routine disruption',
        'Hormonal cycle phase',
      ],
    },
  ];

  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">The Complete Symptom Journal — 6 Categories</h3>
      <p className="text-sm text-slate-500 mb-6">
        Track all six on your good days. Track at minimum the first three on difficult days. Any entry is better than none.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.label} className={`rounded-xl border p-5 ${c.color}`}>
            <div className="flex items-center gap-2 mb-3">
              <c.icon className="w-5 h-5 text-slate-600" aria-hidden="true" />
              <h4 className="font-bold text-slate-800 text-sm">{c.label}</h4>
            </div>
            <ul className="space-y-1">
              {c.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Entry Level Selector ─────────────────────────────────────────────────── */

const EntryLevelSelector: React.FC = () => {
  const levels = [
    {
      name: 'Minimal Entry',
      time: '1 min',
      bg: 'bg-slate-50 border-slate-200',
      includes: ['Pain level (one number)', 'Any medications taken', 'One word for energy'],
      when: 'Worst days',
    },
    {
      name: 'Standard Entry',
      time: '3 min',
      bg: 'bg-blue-50 border-blue-200',
      includes: ['Pain + top 2 other symptoms', 'Medications + brief response note', 'Sleep quality', 'One functional impact'],
      when: 'Most days (recommended)',
    },
    {
      name: 'Detailed Entry',
      time: '5–7 min',
      bg: 'bg-emerald-50 border-emerald-200',
      includes: ['All physical + cognitive symptoms', 'Full medication log', 'Sleep data', 'Full functional log', 'Context + triggers'],
      when: 'Good days, pre-appointment, flare days',
    },
  ];

  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Match Your Entry to Your Day</h3>
      <p className="text-sm text-slate-500 mb-6">
        Consistency beats completeness. A minimal entry every day beats a detailed entry twice a week.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {levels.map((l) => (
          <div key={l.name} className={`rounded-xl border p-5 ${l.bg}`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-800 text-sm">{l.name}</h4>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                {l.time}
              </span>
            </div>
            <ul className="space-y-1.5 mb-3">
              {l.includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-xs font-medium text-slate-500 border-t border-slate-200 pt-2">Best for: {l.when}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const symptomStats: StatItem[] = [
  { value: '6', label: 'Symptom categories covered', icon: FileText },
  { value: '3 min', label: 'Standard daily entry time', icon: Clock },
  { value: '40+', label: 'Trackable symptom data points', icon: Activity },
  { value: '2 wk', label: 'Before patterns become visible', icon: TrendingUp },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'symptom-journal-template',
  title: 'Symptom Journal Template',
  metaTitle: 'Symptom Journal Template: Track 40+ Symptoms, Triggers, Meds, and Functional Impact (Free Download)',
  metaDescription: 'Free printable symptom journal template covering physical symptoms, cognitive changes, sleep, medications, functional impact, and triggers. 3-minute daily entries, 6 categories, pattern-ready format.',
  keywords: [
    'symptom journal template', 'symptom tracker template',
    'symptom diary printable', 'symptom log template',
    'symptom tracking journal', 'daily symptom journal',
    'symptom journal pdf', 'free symptom journal template',
    'printable symptom tracker', 'symptom diary template',
    'chronic illness symptom journal', 'health symptom log',
    'symptom record template', 'symptom pattern tracker',
  ],
  badge: 'Free Template',
  headline: 'Symptom Journal Template',
  subheadline: 'A symptom journal that only tracks pain misses half the picture. This template covers six categories — physical symptoms, cognitive changes, sleep, medications, functional impact, and triggers — in a format that takes 3 minutes daily and produces data your doctor can actually use.',
  primaryCTA: { text: 'Download free PDF', href: '/assets/symptom-journal-template.pdf', download: true },
  secondaryCTA: { text: 'Track digitally instead', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/symptom-journal-template.pdf', downloadFileName: 'symptom-journal-template.pdf' },
  whatIsThis: 'A comprehensive symptom journal template covering all six domains relevant to chronic illness: physical symptoms (pain, fatigue, nausea, and more), cognitive and neurological symptoms (brain fog, sensory sensitivities, tingling), sleep and recovery quality, medication and intervention tracking, functional impact on daily activities, and context and triggers. Three entry levels let you track what you can — minimal (1 minute), standard (3 minutes), or detailed (5–7 minutes) — so your journal works on your worst days as well as your best ones.',
  whoShouldUse: [
    'People with multiple symptoms who need to track more than just pain',
    'Anyone with an undiagnosed condition tracking symptoms before or during diagnosis',
    'Patients with chronic illness (fibromyalgia, ME/CFS, lupus, MS, CRPS, and others)',
    'People tracking side effects from new medications',
    'Anyone whose doctor has asked them to keep track of all symptoms',
    'Patients preparing for specialist appointments with complex symptom histories',
    'People noticing symptom patterns they want to understand better',
    'Anyone frustrated that their doctor doesn\'t see the full picture of their experience',
  ],
  howToUse: [
    { step: 1, title: 'Choose your entry level and stick to it', description: 'Pick the minimum entry level you can commit to daily — not the most comprehensive. If the minimal entry (1 minute) is all you can do, that\'s your starting point. You can always add more; the habit matters more.' },
    { step: 2, title: 'Track at consistent times', description: 'Morning and evening are the most useful. Morning captures overnight recovery and starting state. Evening captures the full day\'s experience. The gap between morning and evening scores reveals a lot.' },
    { step: 3, title: 'Note what changes, not just what is constant', description: 'Your template doesn\'t need to document everything you always feel. Note changes: symptoms that got worse, improved, appeared, or disappeared. Stable symptoms can be noted with a checkmark; changed ones get details.' },
    { step: 4, title: 'Track triggers during symptom flares', description: 'When symptoms spike, add context: what happened in the 24–48 hours before? Weather, activity, stress, food, sleep. You don\'t need to track triggers daily — just when something changes.' },
    { step: 5, title: 'Review monthly for patterns', description: 'Once a month, look at your journal across four weeks. Are certain symptoms clustering together? Do they correlate with sleep quality, weather, or activity? This is the insight that\'s impossible to see day-to-day.' },
  ],
  whyItMatters: 'Chronic conditions rarely produce one symptom. Fibromyalgia involves pain, fatigue, brain fog, sleep disruption, and sensory sensitivity simultaneously. ME/CFS produces post-exertional malaise, cognitive impairment, and sleep anomalies. A journal that only tracks pain produces an incomplete picture that leads to incomplete treatment. A symptom journal that tracks the full cluster allows your doctor to see the pattern, recognize the condition, and respond to the whole person — not just the chief complaint.',
  trustSignals: {
    medicalNote: 'Template categories align with multidimensional symptom assessment frameworks used in rheumatology, neurology, and pain medicine for conditions including fibromyalgia, ME/CFS, and systemic inflammatory conditions.',
    privacyNote: 'Printable template — your entries stay on paper or in your own files. Nothing is shared or stored anywhere by us.',
    legalNote: 'A comprehensive symptom journal documenting the full scope of your condition supports disability claims, treatment authorizations, and medical-legal assessments.',
  },
  faqs: [
    { question: 'Is this different from a pain journal?', answer: 'Yes. A pain journal focuses specifically on pain — location, intensity, triggers. A symptom journal is broader: it also captures fatigue, cognitive symptoms, sleep quality, mood, and other non-pain symptoms. If you have a complex condition with multiple symptoms, you need a symptom journal, not just a pain diary.' },
    { question: 'How do I track symptoms I have all the time?', answer: 'Use a rating scale (0-10 or 1-5) so you can note variation. You don\'t need to describe constant symptoms in detail every day — just rate the intensity. The variation in a constant symptom is often as clinically useful as the symptom itself.' },
    { question: 'My symptoms change throughout the day. How do I capture that?', answer: 'Track at multiple times: morning, midday, and evening. Note which times of day are typically best and worst. For rapid-cycling symptoms, note the range: "fatigue: 3 in morning, 7 by afternoon." This pattern tells your doctor more than a single daily score.' },
    { question: 'Should I track every symptom I have?', answer: 'Track the symptoms you want to discuss with your doctor, symptoms that interfere with your daily life, and any symptoms that seem to be getting worse. You don\'t need to document every twinge — focus on what\'s meaningful and affecting your quality of life.' },
    { question: 'How long until I see patterns?', answer: 'Simple patterns (medication response, sleep-pain correlation) appear within 1–2 weeks. Weekly cycles take 3–4 weeks to see. Monthly patterns (hormonal, seasonal) take 2–3 months. The earlier you start, the sooner you have data.' },
    { question: 'Can I use this template alongside digital tracking?', answer: 'Absolutely. Many people prefer to track digitally day-to-day and use the printable template for in-depth appointment preparation or as a backup during technology outages.' },
    { question: 'What\'s the most important symptom to track if I can only track one?', answer: 'Functional impact — specifically, what you could and couldn\'t do each day. This translates most directly into clinical action. Pain scores describe an experience; function scores describe a disability.' },
    { question: 'Is tracking triggers necessary from day one?', answer: 'No. Start with symptoms and medications, and add trigger tracking in week 3 or 4. Trigger tracking requires a baseline of symptom data to make sense — you need to know what your normal looks like before you can identify what disrupts it.' },
  ],
  relatedLinks: [
    { title: 'What to Include in a Pain Journal', description: 'Pain-specific journaling guide', href: '/resources/what-to-include-in-pain-journal' },
    { title: 'Chronic Pain Diary Template', description: 'Long-term pain tracking template', href: '/resources/chronic-pain-diary-template' },
    { title: 'Fibromyalgia Pain Diary', description: 'Fibromyalgia-specific tracking', href: '/resources/fibromyalgia-pain-diary' },
    { title: 'Symptom Tracking Before Diagnosis', description: 'Tracking during the diagnostic process', href: '/resources/symptom-tracking-before-diagnosis' },
    { title: 'Pain Diary for Specialist Appointment', description: 'Specialist appointment preparation', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'Symptom Tracker Printable', description: 'Visual symptom tracker', href: '/resources/symptom-tracker-printable' },
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Symptom Journal Template', url: '/resources/symptom-journal-template' },
  ],
};

export const SymptomJournalTemplatePage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={symptomStats} colorScheme="purple" />
    <SymptomCategoryGrid />
    <EntryLevelSelector />
    <BottomCTACallout
      icon={Activity}
      heading="Your Symptoms Are More Than Just Pain."
      body="A symptom journal that covers all six domains gives your doctor the full picture — and gives you the evidence to describe what's actually happening."
      pdfUrl="/assets/symptom-journal-template.pdf"
      gradientClasses="from-purple-600 to-violet-600"
      tintClass="text-purple-100"
      buttonTextClass="text-purple-700"
      buttonHoverClass="hover:bg-purple-50"
      primaryLabel="Download Template"
      secondaryLabel="Track Digitally"
    />
  </SEOPageLayout>
);

export default SymptomJournalTemplatePage;
