/**
 * Endometriosis Pain Log – SEO Landing Page (Enhanced)
 *
 * Target keyword: "endometriosis pain log"
 * Tier 4 – Condition-Specific Long-Tail
 */

import React from 'react';
import {
  ArrowRight, Activity, AlertTriangle, CheckCircle,
  TrendingUp, Users, FileText, Clock, Heart,
  Calendar, Moon, Thermometer, MonitorSmartphone
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, PdfContentsPreview, BottomCTACallout } from '../../components/seo';
import type { StatItem, PdfPage } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** Endo symptom domains */
const EndoSymptomDomains: React.FC = () => {
  const domains = [
    { icon: Activity, label: 'Pelvic Pain', desc: 'Chronic pelvic pain that may not align with periods — the most common endo symptom', color: 'border-rose-200 bg-rose-50 text-rose-700' },
    { icon: Calendar, label: 'Dysmenorrhea', desc: 'Severe period pain beyond "normal cramps" — pain that disrupts life, not just discomforts it', color: 'border-pink-200 bg-pink-50 text-pink-700' },
    { icon: Heart, label: 'Dyspareunia', desc: 'Deep pain during or after intercourse — often dismissed but diagnostically significant', color: 'border-red-200 bg-red-50 text-red-700' },
    { icon: Thermometer, label: 'GI Symptoms', desc: 'Bloating, nausea, diarrhea, constipation, painful bowel movements — often misdiagnosed as IBS', color: 'border-amber-200 bg-amber-50 text-amber-700' },
    { icon: Moon, label: 'Fatigue & Mood', desc: 'Exhaustion, brain fog, anxiety, and depression — the invisible burden of chronic inflammation', color: 'border-purple-200 bg-purple-50 text-purple-700' },
    { icon: AlertTriangle, label: 'Bladder Symptoms', desc: 'Painful urination, urgency, frequency — endo on the bladder mimics interstitial cystitis', color: 'border-teal-200 bg-teal-50 text-teal-700' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Endometriosis is Never Just Period Pain</h3>
      <p className="text-sm text-slate-500 mb-6">Endo affects the whole body. This template tracks all six symptom domains — giving your gynecologist the complete picture, not just "cramps."</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map((d) => (
          <div key={d.label} className={`rounded-xl border p-5 ${d.color}`}>
            <d.icon className="w-6 h-6 mb-3" aria-hidden="true" />
            <h4 className="font-semibold text-slate-800 mb-1">{d.label}</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{d.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Cycle phase tracker explanation */
const CyclePhaseGuide: React.FC = () => (
  <div className="my-10 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 md:p-8 border border-rose-100">
    <h3 className="text-xl font-bold text-slate-800 mb-2">Why Cycle-Phase Tracking Changes Everything</h3>
    <p className="text-sm text-slate-600 mb-6">Endo symptoms often correlate with cycle phases. Your diary reveals these patterns — which directly guide treatment choices.</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { phase: 'Menstrual', days: 'Days 1-5', pain: 'Often worst', note: 'Dysmenorrhea severity, flow, clot size' },
        { phase: 'Follicular', days: 'Days 6-13', pain: 'Often improves', note: 'Baseline symptoms, energy recovery' },
        { phase: 'Ovulation', days: 'Day 14 ± 2', pain: 'Mid-cycle pain', note: 'Mittelschmerz, ovulation pain pattern' },
        { phase: 'Luteal', days: 'Days 15-28', pain: 'Building again', note: 'PMS vs. endo escalation, bloating' },
      ].map((p) => (
        <div key={p.phase} className="bg-white/70 rounded-xl p-4 border border-rose-100">
          <div className="text-xs font-bold text-rose-600 mb-1">{p.phase}</div>
          <div className="text-sm font-semibold text-slate-800 mb-1">{p.days}</div>
          <div className="text-xs text-slate-500">{p.note}</div>
          <div className="text-xs font-medium text-rose-700 mt-2">{p.pain}</div>
        </div>
      ))}
    </div>
  </div>
);

/** Diagnostic journey awareness */
const DiagnosticJourney: React.FC = () => (
  <div className="my-10 rounded-2xl border-2 border-amber-200 bg-amber-50 p-6">
    <div className="flex items-center gap-3 mb-4">
      <Clock className="w-6 h-6 text-amber-600" aria-hidden="true" />
      <h3 className="text-xl font-bold text-amber-800">The 7-Year Wait: Why Your Diary Matters</h3>
    </div>
    <p className="text-sm text-amber-800 mb-4">The average endometriosis diagnosis takes <strong>7-10 years</strong>. Patients see an average of 7 doctors before diagnosis. A detailed symptom diary is one of the most powerful tools to shorten that journey.</p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
      <div className="bg-white/70 rounded-lg p-4 border border-amber-100">
        <div className="font-semibold text-slate-800 text-sm">Without a diary</div>
        <div className="text-xs text-slate-500 mt-1">"I have bad cramps." Doctor hears: normal periods. Next appointment in 6 months.</div>
      </div>
      <div className="bg-white/70 rounded-lg p-4 border border-amber-100">
        <div className="font-semibold text-slate-800 text-sm">With a diary</div>
        <div className="text-xs text-slate-500 mt-1">"Pain 8/10 on days 1-4, 5/10 during ovulation, painful bowel movements, dyspareunia — every cycle for 8 months." Doctor hears: investigate endo.</div>
      </div>
      <div className="bg-white/70 rounded-lg p-4 border border-amber-100">
        <div className="font-semibold text-slate-800 text-sm">The difference</div>
        <div className="text-xs text-slate-500 mt-1">Pattern documentation turns dismissal ("that's normal") into investigation. Your diary is your strongest advocate.</div>
      </div>
    </div>
  </div>
);

/** PDF contents data */
const endoPdfPages: PdfPage[] = [
  { page: 1, title: 'Endo Profile & History', desc: 'Diagnosis stage, surgical history, current treatments, cycle length, fertility goals' },
  { page: 2, title: 'Daily Cycle & Pain Tracking', desc: 'Cycle day, pain level, pelvic pain, back pain, bloating, GI symptoms, fatigue — all correlated' },
  { page: 3, title: 'Endo-Specific Symptoms', desc: 'Dysmenorrhea, dyspareunia, painful bowel movements, bladder symptoms, heavy bleeding, spotting' },
  { page: 4, title: 'Medication & Hormone Tracking', desc: 'Hormonal treatments, NSAIDs, supplements — effectiveness, side effects, and cycle impact' },
  { page: 5, title: 'Quality of Life Impact', desc: 'Work/school days missed, social activities canceled, relationship impact, mental health' },
  { page: 6, title: 'Monthly Summary & GYN Prep', desc: 'Two-cycle overview for gynecology appointment with symptom patterns and treatment response' },
];

/** Stats data */
const endoStats: StatItem[] = [
  { value: '190M+', label: 'Worldwide with endo', icon: Users },
  { value: '7-10 yrs', label: 'Average to diagnosis', icon: Clock },
  { value: '1 in 10', label: 'Women/AFAB affected', icon: TrendingUp },
  { value: '6', label: 'Symptom domains tracked', icon: Activity },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'endometriosis-pain-log',
  title: 'Endometriosis Pain Log (Free)',
  metaTitle: 'Endometriosis Pain Log — Free 6-Page Endo Symptom Tracker | Pain Tracker Pro',
  metaDescription: 'Download a free endometriosis pain log that tracks pelvic pain, cycle phases, GI symptoms, fatigue, and treatment response. Designed to shorten the 7-year diagnostic wait.',
  keywords: [
    'endometriosis pain log', 'endo symptom tracker', 'endometriosis diary',
    'endo pain diary', 'endometriosis cycle tracker', 'pelvic pain log',
    'dysmenorrhea diary', 'endo flare tracker', 'endometriosis documentation',
    'endo specialist preparation', 'endometriosis GI symptoms', 'endo fatigue tracker',
    'endometriosis disability claim', 'period pain tracker'
  ],
  badge: 'Free Download',
  headline: 'Endometriosis Pain Log',
  subheadline: 'Track endo symptoms across your entire cycle — pelvic pain, GI issues, fatigue, and the dozen other things that generic period trackers miss. Built to give your gynecologist evidence, not just numbers.',
  primaryCTA: { text: 'Download Free PDF (6 Pages)', href: '/assets/endometriosis-pain-log.pdf', download: true },
  secondaryCTA: { text: 'Try Digital Version', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/endometriosis-pain-log.pdf', downloadFileName: 'endometriosis-pain-log.pdf' },
  whatIsThis: 'An endometriosis symptom tracker that goes far beyond period tracking. It correlates pain with cycle phase, captures the full spectrum of endo symptoms (pelvic pain, GI issues, fatigue, dyspareunia, bladder symptoms, mood changes), and tracks treatment response including hormonal therapies. The average endo diagnosis takes 7-10 years — often because patients can\'t articulate the full pattern. This diary captures that pattern so your gynecologist or endo specialist can see it clearly.',
  whoShouldUse: [
    'Anyone diagnosed with endometriosis tracking symptoms and treatment response',
    'People with severe period pain investigating whether it might be endo',
    'Those experiencing chronic pelvic pain, GI symptoms, or fatigue with menstrual correlation',
    'Patients preparing for gynecology or endo specialist consultations',
    'People tracking symptoms before or after laparoscopic surgery',
    'Those on hormonal treatments (GnRH agonists, progestins, combined OCP) monitoring response',
    'People documenting endometriosis for disability or workplace accommodation claims',
    'Anyone who\'s been dismissed with "that\'s just normal period pain" and needs evidence'
  ],
  howToUse: [
    { step: 1, title: 'Track by cycle day', description: 'Mark Day 1 as the first day of your period. Track every day — not just during menstruation. Endo symptoms happen throughout the cycle, and the pattern across phases is highly diagnostic.' },
    { step: 2, title: 'Capture all symptom domains', description: 'Don\'t just track pelvic pain. Note GI symptoms (bloating, bowel pain), fatigue, bladder issues, and mood changes. Endo is systemic — your diary should reflect that.' },
    { step: 3, title: 'Note specific endo symptoms', description: 'Track dysmenorrhea severity, painful intercourse (before/during/after), painful bowel movements, and heavy or unusual bleeding. These specific symptoms differentiate endo from other conditions.' },
    { step: 4, title: 'Log treatment response by phase', description: 'Note which treatments help in which cycle phase. NSAIDs before Day 1? Hormonal therapy effects? Heat or rest? Endo treatment is phase-dependent.' },
    { step: 5, title: 'Summarize for appointments', description: 'Use the monthly summary spanning 2 full cycles. Your gynecologist sees cycle-correlated symptom patterns at a glance — which is exactly what drives investigation.' }
  ],
  whyItMatters: 'Endometriosis affects 1 in 10 women and people assigned female at birth — yet the average diagnosis takes 7-10 years and 7+ doctors. The primary barrier is communication: patients struggle to convey the full, multi-system pattern in a 15-minute appointment. Research shows that patients who bring cycle-correlated symptom diaries to gynecology visits are more likely to receive appropriate investigation and referral. Your diary is your strongest advocate in a medical system that still routinely dismisses severe period pain as "normal."',
  trustSignals: {
    medicalNote: 'Captures symptoms aligned with the WERF/EPHect classification used in endometriosis research and clinical assessment.',
    privacyNote: 'Paper format — your reproductive health data stays entirely private. No period tracking app, no cloud, no data selling.',
    legalNote: 'Multi-cycle documentation of functional impact supports endometriosis disability and workplace accommodation claims.'
  },
  faqs: [
    { question: 'How is this different from a period tracker app?', answer: 'Period trackers focus on cycle prediction and fertility. This template focuses on diagnostic evidence: multi-domain symptom tracking correlated with cycle phase, treatment response, and functional impact. It captures what endo specialists need to see — not just when your period starts.' },
    { question: 'Should I track symptoms between periods?', answer: 'Absolutely — this is crucial. Endo causes symptoms throughout the cycle, not just during menstruation. Mid-cycle pain, luteal phase bloating, and non-menstrual pelvic pain are all diagnostically significant. Track every day.' },
    { question: 'What if my cycles are irregular?', answer: 'Track by date and note cycle day when applicable. Irregular cycles with persistent pain are themselves a data point. If you have no period (amenorrhea from treatment), track symptoms by date — the monthly pattern still matters.' },
    { question: 'Will this help me get diagnosed faster?', answer: 'It\'s one of the strongest tools available. A diary showing pelvic pain + GI symptoms + fatigue + dyspareunia, consistently across 2-3 cycles, with functional impact documented, gives a gynecologist evidence-based reason to investigate. This is the data that moves you from "probably just cramps" to "let\'s look further."' },
    { question: 'How do I track GI symptoms with endo?', answer: 'Note daily: bloating severity, bowel habit changes (diarrhea/constipation), painful bowel movements (dyschezia), and any correlation with cycle phase. Endo on the bowel is common and often misdiagnosed as IBS — your cycle-correlated GI data is the differentiator.' },
    { question: 'Should I track after surgery?', answer: 'Yes. Post-laparoscopy tracking shows whether symptoms are improving, stable, or recurring. This data guides decisions about hormonal suppression therapy and helps detect recurrence early.' },
    { question: 'What about pain during intimacy?', answer: 'Track it specifically: before, during, or after intercourse, superficial vs. deep pain, and which positions are affected. Dyspareunia is a key endo symptom and affects treatment planning. Only record what you\'re comfortable sharing with your doctor.' },
    { question: 'Can I use this for disability documentation?', answer: 'Yes. Track work/school days missed, social activities canceled, and daily tasks affected. Endo disability claims require evidence of persistent functional impact — your diary provides exactly that, cycle after cycle.' },
    { question: 'How many cycles should I track before my appointment?', answer: 'Minimum 2 full cycles, ideally 3. Two cycles establish a repeating pattern; three confirm it. If your appointment is soon, start tracking now — even partial cycle data is better than none.' },
    { question: 'My doctor keeps dismissing my pain — what do I do?', answer: 'Bring this diary. Data is harder to dismiss than descriptions. "Pain 8/10 on days 1-4, 5/10 around ovulation, painful bowel movements, 6 work days missed last cycle" demands a different response than "I have bad cramps." If you\'re still dismissed, request referral to an endo specialist — and bring the diary.' }
  ],
  relatedLinks: [
    { title: 'Pain Diary Template PDF', description: 'Comprehensive general pain tracking', href: '/resources/pain-diary-template-pdf' },
    { title: 'Symptom Tracker Printable', description: 'Multi-symptom tracking template', href: '/resources/symptom-tracker-printable' },
    { title: 'Documenting Pain for Disability', description: 'Endo documentation for claims', href: '/resources/documenting-pain-for-disability-claim' },
    { title: 'Pain Diary for Specialist', description: 'Prepare for endo specialist visits', href: '/resources/pain-diary-for-specialist-appointment' },
    { title: 'Daily Functioning Log', description: 'Track endo\'s impact on daily life', href: '/resources/daily-functioning-log-for-disability' },
    { title: 'How to Track Pain for Doctors', description: 'Present endo data effectively', href: '/resources/how-to-track-pain-for-doctors' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Endometriosis Pain Log', url: '/resources/endometriosis-pain-log' }
  ]
};

export const EndometriosisPainLogPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={endoStats} colorScheme="rose" />
    <EndoSymptomDomains />
    <CyclePhaseGuide />
    <DiagnosticJourney />
    <PdfContentsPreview
      pages={endoPdfPages}
      accentColor="rose"
      subtitle="Designed by understanding what gynecologists and endo specialists actually need to see."
    />
    <BottomCTACallout
      icon={MonitorSmartphone}
      heading="Your Reproductive Data Belongs to You"
      body={"We don't track your cycle in any cloud. Start with the paper PDF \u2014 it works without an account, without WiFi, and without anyone else having access to your reproductive health data. When you're ready, the digital version keeps everything encrypted on your device."}
      pdfUrl="/assets/endometriosis-pain-log.pdf"
      gradientClasses="from-rose-600 to-pink-600"
      tintClass="text-rose-100"
      buttonTextClass="text-rose-700"
      buttonHoverClass="hover:bg-rose-50"
    />
  </SEOPageLayout>
);

export default EndometriosisPainLogPage;
