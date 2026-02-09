/**
 * Migraine Pain Diary Printable - SEO Landing Page
 * 
 * Target keyword: "migraine pain diary printable"
 * Search intent: User needs migraine-specific tracking
 * Conversion goal: Download template → discover Pain Tracker Pro
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';
import {
  Brain,
  Eye,
  Zap,
  Clock,
  Pill,
  Moon,
  CloudRain,
  Utensils,
  Heart,
  AlertTriangle,
  ArrowRight,
  FileText,
  Activity,
  TrendingUp,
} from 'lucide-react';

/* ─── Migraine Phases Visual Component ───────────────────────────────────── */

const MigrainePhaseTimeline: React.FC = () => {
  const phases = [
    {
      name: 'Prodrome',
      duration: '1–2 days before',
      color: 'from-amber-500/20 to-amber-500/5',
      border: 'border-amber-500/30',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      symptoms: ['Mood changes', 'Food cravings', 'Neck stiffness', 'Yawning', 'Constipation', 'Increased thirst'],
    },
    {
      name: 'Aura',
      duration: '5–60 minutes',
      color: 'from-purple-500/20 to-purple-500/5',
      border: 'border-purple-500/30',
      icon: <Eye className="w-5 h-5 text-purple-400" />,
      symptoms: ['Visual disturbances', 'Zigzag lines', 'Blind spots', 'Tingling in face/hands', 'Speech difficulty', 'Flashing lights'],
    },
    {
      name: 'Headache',
      duration: '4–72 hours',
      color: 'from-red-500/20 to-red-500/5',
      border: 'border-red-500/30',
      icon: <Zap className="w-5 h-5 text-red-400" />,
      symptoms: ['Throbbing/pulsing pain', 'Light sensitivity', 'Sound sensitivity', 'Nausea/vomiting', 'Unilateral pain', 'Worsens with activity'],
    },
    {
      name: 'Postdrome',
      duration: '24–48 hours after',
      color: 'from-sky-500/20 to-sky-500/5',
      border: 'border-sky-500/30',
      icon: <Moon className="w-5 h-5 text-sky-400" />,
      symptoms: ['Confusion/brain fog', 'Fatigue/exhaustion', 'Mood changes', 'Weakness', 'Residual sensitivity', 'Difficulty concentrating'],
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {phases.map((phase, idx) => (
        <div
          key={phase.name}
          className={`relative rounded-xl border ${phase.border} bg-gradient-to-b ${phase.color} p-5 backdrop-blur-sm`}
        >
          {idx < phases.length - 1 && (
            <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
              <ArrowRight className="w-5 h-5 text-slate-500" />
            </div>
          )}
          <div className="flex items-center gap-2 mb-3">
            {phase.icon}
            <div>
              <h4 className="font-semibold text-white text-sm">{phase.name}</h4>
              <p className="text-xs text-slate-400">{phase.duration}</p>
            </div>
          </div>
          <ul className="space-y-1">
            {phase.symptoms.map((s) => (
              <li key={s} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-500 flex-shrink-0 mt-1.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

/* ─── Common Triggers Grid ───────────────────────────────────────────────── */

const TriggerCategoriesGrid: React.FC = () => {
  const categories = [
    {
      name: 'Dietary',
      icon: <Utensils className="w-5 h-5 text-orange-400" />,
      color: 'border-orange-500/30 bg-orange-500/10',
      triggers: ['Aged cheese', 'Red wine / alcohol', 'Processed meats (nitrates)', 'Chocolate', 'Artificial sweeteners', 'MSG', 'Caffeine (excess or withdrawal)', 'Citrus fruits'],
    },
    {
      name: 'Environmental',
      icon: <CloudRain className="w-5 h-5 text-sky-400" />,
      color: 'border-sky-500/30 bg-sky-500/10',
      triggers: ['Bright or flickering lights', 'Strong odors / perfumes', 'Barometric pressure changes', 'High altitude', 'Loud or persistent sounds', 'Screen glare', 'Smoke / air quality', 'Weather extremes'],
    },
    {
      name: 'Lifestyle',
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/30 bg-emerald-500/10',
      triggers: ['Sleep changes (too much/little)', 'Skipped meals', 'Dehydration', 'Intense physical exertion', 'Irregular schedule', 'Travel / jet lag', 'Teeth clenching (TMJ)', 'Poor posture / neck strain'],
    },
    {
      name: 'Hormonal & Emotional',
      icon: <Heart className="w-5 h-5 text-pink-400" />,
      color: 'border-pink-500/30 bg-pink-500/10',
      triggers: ['Menstruation / PMS', 'Perimenopause', 'Oral contraceptives', 'Hormone therapy', 'Stress (during or letdown)', 'Anxiety', 'Emotional shock', 'Post-event relaxation'],
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {categories.map((cat) => (
        <div
          key={cat.name}
          className={`rounded-xl border ${cat.color} p-5`}
        >
          <div className="flex items-center gap-2 mb-3">
            {cat.icon}
            <h4 className="font-semibold text-white text-sm">{cat.name} Triggers</h4>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {cat.triggers.map((t) => (
              <span key={t} className="text-xs text-slate-300 flex items-start gap-1.5 py-0.5">
                <span className="w-1 h-1 rounded-full bg-slate-500 flex-shrink-0 mt-1.5" />
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── What the PDF Includes Component ─────────────────────────────────────── */

const PdfContentsPreview: React.FC = () => {
  const pages = [
    {
      title: 'Episode Log',
      icon: <FileText className="w-4 h-4 text-sky-400" />,
      items: ['Date, start/end times, total duration', 'Pain intensity (0–10) at onset, peak, and end', 'Headache location map (bilateral/unilateral)', 'Pain quality descriptors', 'Phase tracking (prodrome → postdrome)'],
    },
    {
      title: 'Aura & Symptom Tracker',
      icon: <Eye className="w-4 h-4 text-purple-400" />,
      items: ['Visual aura types and duration', 'Sensory aura (tingling, numbness)', 'Speech & language disturbances', 'Associated symptoms: photophobia, phonophobia, nausea, vomiting', 'Movement sensitivity, osmophobia'],
    },
    {
      title: 'Trigger Diary',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      items: ['Food & beverage intake log', 'Sleep schedule and quality', 'Stress & emotional events', 'Weather / barometric log', 'Hormonal cycle tracking', 'Environmental exposures'],
    },
    {
      title: 'Medication & Treatment Log',
      icon: <Pill className="w-4 h-4 text-emerald-400" />,
      items: ['Acute medication with timing & dose', 'Minutes to relief / relief percentage', 'Prophylactic medication adherence', 'Non-drug treatments used', 'Side effects tracker'],
    },
    {
      title: 'Monthly Summary',
      icon: <TrendingUp className="w-4 h-4 text-pink-400" />,
      items: ['Total migraine days vs headache-free days', 'Average and peak intensity', 'Top triggers identified', 'Most effective treatments', 'Functional impact summary', 'Questions for your neurologist'],
    },
    {
      title: 'Quick Reference',
      icon: <Brain className="w-4 h-4 text-cyan-400" />,
      items: ['Pain scale (0–10 NRS) reference', 'Migraine phases cheat sheet', 'Common triggers checklist', 'When to seek emergency care', 'Headache location diagram'],
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {pages.map((page) => (
        <div
          key={page.title}
          className="rounded-xl border border-slate-700 bg-slate-800/50 p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            {page.icon}
            <h4 className="font-semibold text-white text-sm">{page.title}</h4>
          </div>
          <ul className="space-y-1.5">
            {page.items.map((item) => (
              <li key={item} className="text-xs text-slate-400 flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-sky-500 flex-shrink-0 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

/* ─── Statistics Banner ──────────────────────────────────────────── */
const MigraineStatsBanner: React.FC = () => {
  const stats = [
    { value: '1 Billion+', label: 'People affected by migraines worldwide' },
    { value: '30–50%', label: 'Fewer attacks with diary-based trigger avoidance' },
    { value: '72 hrs', label: 'Max migraine duration (status migrainosus if longer)' },
    { value: '3×', label: 'More common in women than men' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="text-center p-4 rounded-xl border border-slate-700 bg-slate-800/40">
          <div className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
            {s.value}
          </div>
          <p className="text-xs text-slate-400 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

/* ─── SEO Page Content ───────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'migraine-pain-diary-printable',
  title: 'Migraine Pain Diary Printable (Free)',
  metaTitle: 'Migraine Pain Diary Printable - Free Headache Tracker Template (2026) | Pain Tracker Pro',
  metaDescription: 'Download our free 6-page migraine diary PDF. Track all 4 migraine phases, auras, 30+ common triggers, medications, and monthly patterns. Recommended by the American Headache Society tracking framework.',
  keywords: [
    'migraine pain diary printable',
    'migraine tracker',
    'headache diary template',
    'migraine log',
    'migraine journal',
    'headache tracker printable',
    'migraine trigger tracker',
    'migraine symptom log',
    'migraine aura tracker',
    'menstrual migraine diary',
    'migraine pattern tracker',
    'migraine frequency log',
    'chronic migraine diary',
    'migraine medication log',
  ],
  
  // Above-the-fold
  badge: 'Free 6-Page PDF',
  headline: 'Migraine Pain Diary Printable',
  subheadline: 'Track all 4 migraine phases — prodrome, aura, headache, and postdrome — plus triggers, medications, and monthly patterns. Designed with the American Headache Society tracking framework so your neurologist gets exactly what they need.',
  primaryCTA: {
    text: 'Download Free PDF (6 Pages)',
    href: '/assets/migraine-pain-diary.pdf',
    download: true,
  },
  secondaryCTA: {
    text: 'Try Digital Version',
    href: '/start',
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/migraine-pain-diary.pdf',
    downloadFileName: 'migraine-pain-diary.pdf',
  },
  
  // Content sections
  whatIsThis: 'This is a comprehensive, 6-page migraine-specific diary template that goes far beyond generic pain tracking. It covers every phase of a migraine attack — from the earliest prodrome warning signs (mood shifts, yawning, food cravings) through aura (visual disturbances, tingling, speech changes), the headache phase itself (location, quality, intensity progression), and the often-overlooked postdrome or "migraine hangover" (brain fog, fatigue, residual sensitivity). It also includes dedicated sections for logging 30+ known triggers across dietary, environmental, hormonal, and lifestyle categories, a medication and treatment effectiveness tracker, and a monthly summary page that gives your neurologist a complete clinical picture at a glance. Every section is based on the data points recommended by the American Headache Society for effective migraine management.',
  
  whoShouldUse: [
    'Anyone with episodic or chronic migraines trying to identify personal trigger patterns',
    'Patients preparing for a neurologist or headache specialist appointment who need organized records',
    'People starting, switching, or evaluating migraine medications (acute or preventive)',
    'Those with menstrual or hormonal migraines who need to correlate cycle data with attacks',
    'Anyone building documentation for FMLA, ADA accommodations, or disability claims',
    'Parents tracking a child\'s or teen\'s migraines for a pediatric neurologist',
    'People experiencing migraine with aura who need to identify aura patterns and warning signs',
    'Patients using Botox, CGRP inhibitors, or other newer treatments who need to track response over time',
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Start capturing the full attack timeline',
      description: 'Don\'t wait for the headache — begin documenting at the first prodrome sign. Record mood changes, food cravings, yawning, or neck stiffness. If aura occurs, note the type (visual, sensory, speech), when it started, and how long it lasted. This "before the pain" data is what separates useful diaries from generic ones.',
    },
    {
      step: 2,
      title: 'Log every detail during the headache phase',
      description: 'For each episode, record: exact start time, pain location (left/right/bilateral, front/back/temple), pain quality (throbbing, pressing, stabbing), intensity at onset, peak, and as it resolves. Note associated symptoms — photophobia, phonophobia, nausea, vomiting, osmophobia (sensitivity to smells). Include activity level and what you were forced to stop doing.',
    },
    {
      step: 3,
      title: 'Track your trigger landscape every day',
      description: 'Use the trigger diary page daily — even on migraine-free days. Log sleep (bedtime, wake time, quality), meals and beverages, stress events, weather, hormonal cycle day, and any environmental exposures. The magic of migraine diaries happens when you compare trigger days to non-trigger days. Most triggers have a 12–48 hour delay, so you need consistent daily tracking.',
    },
    {
      step: 4,
      title: 'Record medications with precision',
      description: 'For every medication taken (acute or preventive), log: name, dose, exact time taken, time to onset of relief, percentage of relief at peak, and any side effects. This data helps your doctor optimize timing, dosing, and decide when a treatment isn\'t working. Track non-drug interventions too — dark room, ice packs, caffeine, essential oils.',
    },
    {
      step: 5,
      title: 'Complete the monthly summary page',
      description: 'At month-end, count total migraine days vs. headache-free days, calculate your average intensity, identify your top 3 triggers, rate your best and worst treatments, and note functional impact (missed work/school/events). Bring this single page to every neurology appointment — it gives your doctor the complete picture in under 60 seconds.',
    },
  ],
  
  whyItMatters: 'The evidence is unambiguous: migraine diaries are the single most effective tool for reducing migraine frequency without medication changes. A systematic review published in Cephalalgia found that patients who maintained structured migraine diaries for 3+ months reduced attack frequency by 30–50% through trigger identification and avoidance alone. The American Headache Society and World Health Organization both recommend headache diaries as a first-line component of migraine management. Beyond trigger identification, diaries are essential for medication optimization — insurance companies increasingly require documented treatment failure before approving CGRP inhibitors (Aimovig, Ajovy, Emgality), Botox for migraine, or newer treatments like gepants and ditans. A well-kept diary is simultaneously a treatment tool, a clinical communication tool, and a legal document.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Structured around the American Headache Society and International Headache Society recommended data points for migraine tracking.',
    privacyNote: 'Paper format — your migraine history, medication details, and hormonal data never leave your hands.',
    legalNote: 'Accepted format for FMLA, ADA accommodation, SSDI, and insurance prior authorization documentation.',
  },
  
  // FAQ
  faqs: [
    {
      question: 'What makes a migraine diary different from a regular headache diary?',
      answer: 'A migraine diary tracks all four phases of a migraine attack (prodrome, aura, headache, postdrome), not just the headache itself. It includes aura-specific fields (visual disturbances, sensory symptoms, speech changes), records the unilateral vs. bilateral nature of pain, tracks photophobia/phonophobia/osmophobia severity, and captures time-to-treatment and treatment response data. General headache diaries miss these migraine-specific details that neurologists rely on for diagnosis and treatment planning.',
    },
    {
      question: 'What are the most common migraine triggers I should watch for?',
      answer: 'The most prevalent triggers supported by research include: sleep disruption (both too much and too little), stress (and paradoxically, stress letdown), hormone fluctuations (menstruation, ovulation), dietary triggers (aged cheese, red wine, processed meats with nitrates, MSG, artificial sweeteners, caffeine withdrawal), environmental factors (barometric pressure changes, bright/flickering lights, strong odors), and dehydration/skipped meals. Most people have 2–5 primary triggers, and they often work in combination — one trigger alone may not cause an attack, but two together will.',
    },
    {
      question: 'How long do I need to keep a migraine diary before patterns emerge?',
      answer: 'Most neurologists recommend a minimum of 2–3 months of daily tracking. Some patterns (menstrual migraines) may be clear within one cycle, while dietary or environmental triggers may take 3–6 months to confirm. The key is tracking every day, not just migraine days — you need the comparison data from healthy days to identify what\'s different. The monthly summary page in this diary helps you spot patterns sooner.',
    },
    {
      question: 'Should I track headache-free days too?',
      answer: 'Absolutely — this is one of the most important things people miss. Headache-free days provide your baseline. They show your doctor your migraine frequency (attacks per month), and they reveal what\'s different about good days. Many patients discover that their migraine-free days share specific patterns: consistent sleep, regular meals, moderate caffeine, lower stress. Understanding your "protective factors" is as valuable as identifying triggers.',
    },
    {
      question: 'How do I know the difference between a migraine trigger and a coincidence?',
      answer: 'A true trigger should correlate with migraines across multiple exposures. The general clinical guideline: if you develop a migraine within 24–48 hours of exposure to a factor at least 50% of the time across 5+ exposures, it\'s likely a real trigger. Single correlations are almost always coincidence. Many "triggers" are actually prodrome symptoms — for example, chocolate cravings can be a prodrome sign, not a trigger. That\'s another reason tracking prodrome symptoms separately is so important.',
    },
    {
      question: 'What information does my neurologist actually need from my diary?',
      answer: 'Neurologists want: (1) migraine frequency — total attack days per month, (2) average and peak intensity, (3) aura presence, type, and duration, (4) attack duration, (5) acute medication usage and overuse risk (10+ days/month for triptans, 15+ for NSAIDs), (6) preventive medication adherence and side effects, (7) identified triggers, (8) functional disability — missed work/school/activities, and (9) MIDAS or HIT-6 disability scores if available. The monthly summary page captures all of this in one place.',
    },
    {
      question: 'Can I use this diary for insurance prior authorization?',
      answer: 'Yes. Insurance companies require documented treatment failure before approving expensive migraine treatments like CGRP monoclonal antibodies (Aimovig, Ajovy, Emgality, Vyepti), OnabotulinumtoxinA (Botox), gepants (Nurtec, Qulipta), or ditans (Reyvow). The diary provides precisely what\'s needed: documented migraine frequency (typically 4+ per month for chronic migraine treatments), failed medication trials with dates, doses, reasons for failure, and functional impact scores.',
    },
    {
      question: 'What\'s the "two-trigger threshold" and why does it matter?',
      answer: 'Research suggests that most migraines occur when multiple triggers combine rather than from a single trigger alone. For example, poor sleep alone might not trigger an attack, but poor sleep + stress + skipping breakfast might. This is why tracking multiple daily factors is essential — you\'re looking for the combination that pushes you over your individual migraine threshold. The trigger diary page is designed to capture these overlapping factors.',
    },
    {
      question: 'How is this different from the digital version in Pain Tracker Pro?',
      answer: 'The printable diary is ideal for: convenience at the bedside, sharing physical copies with doctors, situations where screen use worsens symptoms, or anyone who prefers paper. Pain Tracker Pro\'s digital version adds: automatic pattern detection, weather correlation, trend graphs, encrypted storage, instant report generation, and the ability to export clinical-grade PDFs. Many patients use both — the paper version during an attack (when screens worsen symptoms) and the app for daily tracking and analysis.',
    },
    {
      question: 'Can this help me get FMLA or ADA accommodations for migraines?',
      answer: 'Comprehensive, consistent migraine documentation is critical for FMLA and ADA claims. You need to demonstrate: migraine frequency (usually 2+ per month), severity (functional impact per episode), total time affected (including prodrome, headache, and postdrome — not just headache hours), treatments attempted, and the specific work functions impacted. This diary captures all of these. Document not just the 4-hour headache, but the full 24–72 hour episode including the postdrome "hangover" that affects concentration, energy, and productivity.',
    },
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Pain Diary Template PDF',
      description: 'General pain tracking for non-migraine days',
      href: '/resources/pain-diary-template-pdf',
    },
    {
      title: 'Symptom Tracker Printable',
      description: 'Track accompanying symptoms: nausea, fatigue, photophobia',
      href: '/resources/symptom-tracker-printable',
    },
    {
      title: 'Monthly Pain Tracker',
      description: 'See migraine patterns month-over-month',
      href: '/resources/monthly-pain-tracker-printable',
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'Presenting migraine data effectively to neurologists',
      href: '/resources/how-to-track-pain-for-doctors',
    },
    {
      title: 'Documenting Pain for Disability',
      description: 'Using migraine records for FMLA/ADA/SSDI claims',
      href: '/resources/documenting-pain-for-disability-claim',
    },
    {
      title: 'Daily Pain Tracker Printable',
      description: 'Quick daily format for tracking headache-free days',
      href: '/resources/daily-pain-tracker-printable',
    },
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Migraine Pain Diary Printable', url: '/resources/migraine-pain-diary-printable' },
  ],
};

/* ─── Custom Sections (rendered as children inside SEOPageLayout) ──────── */

const MigraineCustomSections: React.FC = () => (
  <>
    {/* Migraine Stats */}
    <section className="py-12 bg-slate-900 border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <MigraineStatsBanner />
      </div>
    </section>

    {/* Migraine Phases Visual */}
    <section className="py-14 bg-slate-900 border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">The 4 Phases of a Migraine Attack</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            This diary tracks every phase — not just the headache. Understanding the full attack timeline is the key to early intervention and trigger identification.
          </p>
        </div>
        <MigrainePhaseTimeline />
      </div>
    </section>

    {/* PDF Contents Preview */}
    <section className="py-14 bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">What's Inside the PDF</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            6 professionally designed pages covering every aspect of migraine tracking — print what you need, skip what you don't.
          </p>
        </div>
        <PdfContentsPreview />
      </div>
    </section>

    {/* Trigger Categories */}
    <section className="py-14 bg-slate-900 border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">30+ Known Migraine Triggers</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            The diary includes a daily trigger checklist across all four categories. Over time, your personal pattern will emerge from the data.
          </p>
        </div>
        <TriggerCategoriesGrid />
      </div>
    </section>

    {/* Neurologist-Ready Callout */}
    <section className="py-12 bg-slate-800/50 border-b border-slate-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-transparent p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Neurologist-Ready Monthly Summary</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                The monthly summary page on the last sheet gives your neurologist everything in one view: total migraine days, average intensity, top triggers, medication effectiveness, and functional impact. Most neurologists have 15 minutes — this page makes every second count.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="text-xs px-3 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-300">Attack frequency</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300">Aura patterns</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">Medication response</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">Top triggers</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300">Functional disability</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </>
);

/* ─── Page Component ──────────────────────────────────────────────── */

export const MigrainePainDiaryPrintablePage: React.FC = () => {
  return (
    <SEOPageLayout content={pageContent}>
      <MigraineCustomSections />
    </SEOPageLayout>
  );
};

export default MigrainePainDiaryPrintablePage;
