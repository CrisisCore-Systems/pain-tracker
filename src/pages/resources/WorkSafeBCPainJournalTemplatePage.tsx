/**
 * WorkSafeBC Pain Journal Template - SEO Landing Page
 * 
 * Target keyword: "worksafebc pain journal template"
 * Search intent: User needs BC workplace injury documentation
 * Conversion goal: Download template → discover Pain Tracker Pro
 * 
 * Tier 3 - Disability / Legal Documentation
 */

import React from 'react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';
import {
  Briefcase,
  ClipboardCheck,
  FileText,
  Shield,
  AlertTriangle,
  ArrowRight,
  Scale,
  Activity,
  Building2,
  Stethoscope,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';

/* ─── WCB Claim Process Timeline ─────────────────────────────────────────── */

const ClaimProcessTimeline: React.FC = () => {
  const steps = [
    {
      phase: 'Report Injury',
      timing: 'Day 1',
      color: 'from-red-500/20 to-red-500/5',
      border: 'border-red-500/30',
      icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
      actions: [
        'Report to employer immediately',
        'File Form 6 (Worker\'s Report)',
        'See a physician — Form 8 initiated',
        'Request claim number from WCB',
        'Begin pain journal from Day 1',
      ],
    },
    {
      phase: 'Active Treatment',
      timing: 'Weeks 1–12',
      color: 'from-sky-500/20 to-sky-500/5',
      border: 'border-sky-500/30',
      icon: <Stethoscope className="w-5 h-5 text-sky-400" />,
      actions: [
        'Attend all medical appointments',
        'Follow prescribed physio/rehab',
        'Track pain daily — link to work duties',
        'Document functional limitations',
        'Log all treatments and compliance',
      ],
    },
    {
      phase: 'Claim Review',
      timing: 'Ongoing',
      color: 'from-amber-500/20 to-amber-500/5',
      border: 'border-amber-500/30',
      icon: <ClipboardCheck className="w-5 h-5 text-amber-400" />,
      actions: [
        'Case manager reviews documentation',
        'Medical advisor evaluates records',
        'Functional capacity assessment',
        'Vocational rehabilitation review',
        'Share pain journal summaries',
      ],
    },
    {
      phase: 'Resolution',
      timing: 'Variable',
      color: 'from-emerald-500/20 to-emerald-500/5',
      border: 'border-emerald-500/30',
      icon: <Scale className="w-5 h-5 text-emerald-400" />,
      actions: [
        'Return-to-work plan (full or modified)',
        'Permanent partial disability rating',
        'Ongoing treatment coverage',
        'Appeal if denied (Review Division)',
        'WCAT tribunal if appeal denied',
      ],
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {steps.map((step, idx) => (
        <div
          key={step.phase}
          className={`relative rounded-xl border ${step.border} bg-gradient-to-b ${step.color} p-5 backdrop-blur-sm`}
        >
          {idx < steps.length - 1 && (
            <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
              <ArrowRight className="w-5 h-5 text-slate-500" />
            </div>
          )}
          <div className="flex items-center gap-2 mb-3">
            {step.icon}
            <div>
              <h4 className="font-semibold text-white text-sm">{step.phase}</h4>
              <p className="text-xs text-slate-400">{step.timing}</p>
            </div>
          </div>
          <ul className="space-y-1">
            {step.actions.map((a) => (
              <li key={a} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-500 flex-shrink-0 mt-1.5" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

/* ─── What WCB Evaluators Look For ─────────────────────────────────────── */

const WCBEvaluationCriteria: React.FC = () => {
  const criteria = [
    {
      title: 'Work Connection',
      icon: <Briefcase className="w-5 h-5 text-sky-400" />,
      color: 'border-sky-500/30 bg-sky-500/10',
      description: 'Every symptom must be linked to your workplace injury and job duties.',
      doItems: ['"Pain increased to 7/10 after 2 hrs at workstation, preventing completion of data entry tasks"', '"Lifting boxes at warehouse aggravated lower back — had to stop after 15 min"'],
      dontItems: ['"Pain was bad today"', '"Back hurts"'],
    },
    {
      title: 'Functional Limitations',
      icon: <Activity className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/30 bg-emerald-500/10',
      description: 'Document what you cannot do or can only do with difficulty — in specific terms.',
      doItems: ['"Could not lift anything over 5 lbs — unable to stock shelves as required by position"', '"Standing limited to 20 min — normally required to stand for 4-hour shifts"'],
      dontItems: ['"Can\'t do much"', '"Pain limits my activities"'],
    },
    {
      title: 'Treatment Compliance',
      icon: <Stethoscope className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/30 bg-purple-500/10',
      description: 'Show you\'re actively engaging with prescribed treatment and rehabilitation.',
      doItems: ['"Physio session #12 — prescribed exercises plus 15 min heat therapy. Pain reduced from 6 to 4."', '"Took ibuprofen 400mg at 8am and 2pm as prescribed. Moderate relief for ~3 hours."'],
      dontItems: ['"Went to physio"', '"Took meds"'],
    },
    {
      title: 'Consistent Daily Tracking',
      icon: <Calendar className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/30 bg-amber-500/10',
      description: 'Daily entries — including good days — show credibility and the true pattern of your condition.',
      doItems: ['"Pain 3/10 today — better after rest day. Managed light household tasks. Still unable to sit >30 min."', '"Good day (2/10). Walked 20 min. Best it\'s been since injury on Oct 15."'],
      dontItems: ['Only tracking bad days', 'Every day rated 10/10 with no variation'],
    },
  ];

  return (
    <div className="space-y-4">
      {criteria.map((c) => (
        <div key={c.title} className={`rounded-xl border ${c.color} p-5`}>
          <div className="flex items-center gap-2 mb-3">
            {c.icon}
            <div>
              <h4 className="font-semibold text-white text-sm">{c.title}</h4>
              <p className="text-xs text-slate-400">{c.description}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Write this
              </p>
              {c.doItems.map((item) => (
                <p key={item} className="text-xs text-slate-300 italic mb-1.5 pl-3 border-l-2 border-emerald-500/30">
                  {item}
                </p>
              ))}
            </div>
            <div>
              <p className="text-xs font-medium text-red-400 mb-2 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Not this
              </p>
              {c.dontItems.map((item) => (
                <p key={item} className="text-xs text-slate-400 italic mb-1.5 pl-3 border-l-2 border-red-500/30">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── PDF Contents Preview ─────────────────────────────────────────────── */

const PdfContentsPreview: React.FC = () => {
  const pages = [
    {
      title: 'Claim Info & Pain Scale',
      icon: <FileText className="w-4 h-4 text-sky-400" />,
      items: ['Worker name, claim number, injury date, employer', 'Injury description and affected body areas', 'Job title and primary duties', 'Pain scale reference (0–10 NRS)', 'Healthcare provider contacts'],
    },
    {
      title: 'Daily Work-Related Pain Log',
      icon: <Briefcase className="w-4 h-4 text-amber-400" />,
      items: ['Date, pain intensity (AM/PM/evening)', 'Work status (full/modified/off)', 'Specific work duties affected', 'Functional limitations with measurements', 'Aggravating job activities'],
    },
    {
      title: 'Functional Capacity Tracker',
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
      items: ['Sitting, standing, walking tolerances (minutes)', 'Lifting capacity (lbs)', 'Driving tolerance', 'Concentration and cognitive function', 'Self-care and daily living activities'],
    },
    {
      title: 'Treatment & Rehab Compliance',
      icon: <Stethoscope className="w-4 h-4 text-purple-400" />,
      items: ['Medical appointments attended', 'Physiotherapy sessions and exercises', 'Medication log with effectiveness', 'Home exercise compliance', 'Non-drug treatments used'],
    },
    {
      title: 'Weekly Work Impact Summary',
      icon: <Building2 className="w-4 h-4 text-red-400" />,
      items: ['Work days missed vs. attended', 'Modified duties required', 'Accommodations needed', 'Return-to-work progress', 'Supervisor / case manager notes'],
    },
    {
      title: 'Monthly Summary for WCB',
      icon: <TrendingUp className="w-4 h-4 text-pink-400" />,
      items: ['Total work days missed this month', 'Average pain level and trend', 'Treatment attendance rate', 'Functional capacity changes', 'Return-to-work readiness assessment', 'Questions for case manager'],
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {pages.map((page) => (
        <div key={page.title} className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
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

/* ─── Stats Banner ───────────────────────────────────────────────────── */

const WCBStatsBanner: React.FC = () => {
  const stats = [
    { value: '200K+', label: 'WorkSafeBC claims processed annually in BC' },
    { value: '3 weeks', label: 'Faster claim resolution with structured docs' },
    { value: '90 days', label: 'Typical window to file a WCB claim in BC' },
    { value: 'Form 8', label: 'Physician\'s report — your diary supports this' },
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

/* ─── Common Mistakes Component ──────────────────────────────────────── */

const CommonMistakes: React.FC = () => {
  const mistakes = [
    {
      mistake: 'Only tracking on bad days',
      why: 'Makes it look like you\'re fine most of the time. Case managers compare entry frequency to claim duration.',
      fix: 'Track every day, even when pain is low. "Pain 2/10 today — still cannot lift >10 lbs or sit >30 min" is powerful evidence.',
    },
    {
      mistake: 'Constant 10/10 pain ratings',
      why: 'Appears exaggerated and undermines credibility. Real chronic pain fluctuates.',
      fix: 'Be honest about good and bad days. Show the range. Variation demonstrates authenticity.',
    },
    {
      mistake: 'No connection to work duties',
      why: 'WCB only covers work-related injuries. Undocumented non-work pain weakens your claim.',
      fix: 'Always mention which job tasks are affected. "Standing at register aggravated L4-L5 injury" beats "back hurts."',
    },
    {
      mistake: 'Starting documentation late',
      why: 'Gaps between injury date and first diary entry create doubt.',
      fix: 'Start from Day 1 of injury. If you\'re late, begin now and note: "Starting diary on [date] for injury on [date]."',
    },
    {
      mistake: 'Skipping treatment appointments',
      why: 'Non-compliance is the #1 reason WCB denies or reduces benefits for chronic pain claims.',
      fix: 'Attend every appointment. If you miss one, document why. Track home exercises too.',
    },
    {
      mistake: 'Contradicting medical records',
      why: 'If your diary says 9/10 pain but your doctor says "improving," your credibility suffers.',
      fix: 'Be consistent with what you tell your doctor. Bring your diary to appointments so records align.',
    },
  ];

  return (
    <div className="space-y-3">
      {mistakes.map((m) => (
        <div key={m.mistake} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">{m.mistake}</h4>
              <p className="text-xs text-slate-400 mt-1">{m.why}</p>
              <p className="text-xs text-emerald-400 mt-1.5 flex items-start gap-1">
                <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>{m.fix}</span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── SEO Page Content ────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  // Meta & SEO
  slug: 'worksafebc-pain-journal-template',
  title: 'WorkSafeBC Pain Journal Template (Free)',
  metaTitle: 'WorkSafeBC Pain Journal Template - Free BC Workers Comp Pain Diary (2026) | Pain Tracker Pro',
  metaDescription: 'Download our free 6-page WorkSafeBC pain journal PDF. Designed for BC workplace injury claims — tracks work-related pain, functional capacity, treatment compliance, and return-to-work readiness in the format case managers need.',
  keywords: [
    'worksafebc pain journal template',
    'wcb pain diary',
    'workers compensation pain log',
    'bc workplace injury documentation',
    'worksafebc claim pain tracker',
    'wcb chronic pain documentation',
    'bc workers comp pain diary',
    'worksafebc injury log',
    'worksafebc form 8 documentation',
    'wcb return to work diary',
    'worksafe bc claim evidence',
    'bc work injury pain journal',
    'wcb functional capacity diary',
    'worksafebc appeal documentation',
  ],
  
  // Above-the-fold
  badge: 'Free 6-Page PDF',
  headline: 'WorkSafeBC Pain Journal Template',
  subheadline: 'Document your workplace injury pain in the exact format WorkSafeBC case managers and medical advisors evaluate. Track work-related symptoms, functional capacity, treatment compliance, and return-to-work readiness — all aligned with Form 8 documentation standards.',
  primaryCTA: {
    text: 'Download Free PDF (6 Pages)',
    href: '/assets/worksafebc-pain-journal.pdf',
    download: true,
  },
  secondaryCTA: {
    text: 'Try Digital Version',
    href: '/start',
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/worksafebc-pain-journal.pdf',
    downloadFileName: 'worksafebc-pain-journal.pdf',
  },
  
  // Content sections
  whatIsThis: 'This is a 6-page pain journal template designed specifically for British Columbia workers with active or pending WorkSafeBC (WCB) claims. Unlike general pain diaries, every section emphasizes the connection between your pain and your workplace injury — the single most important factor in WCB claim decisions. It includes dedicated tracking for: daily work-related pain with job duty linkage, functional capacity measurements (sitting, standing, lifting tolerances), treatment and rehabilitation compliance, weekly work impact summaries, and a monthly summary page formatted for case manager review. The template aligns with the documentation standards used by WorkSafeBC medical advisors when evaluating Form 8 physician reports and chronic pain claims.',
  
  whoShouldUse: [
    'BC workers with workplace injuries resulting in chronic or ongoing pain',
    'Anyone with an active WorkSafeBC claim who needs to strengthen their documentation',
    'Workers preparing to file a WCB claim who need evidence from Day 1',
    'People appealing a denied WorkSafeBC decision through the Review Division or WCAT',
    'Workers on graduated return-to-work programs tracking ongoing symptoms and limitations',
    'Workers receiving vocational rehabilitation who need to document residual functional limitations',
    'Anyone facing a WCB Independent Medical Exam (IME) who needs organized records',
    'Workers\' advocates and union representatives helping members with documentation',
  ],
  
  howToUse: [
    {
      step: 1,
      title: 'Start from injury day — fill in your claim details',
      description: 'Begin the journal as close to your injury date as possible. Fill in the claim information page: your name, WCB claim number, injury date, employer, job title, primary duties, and a clear description of the injury. If you\'re starting late, note the gap: "Beginning diary on [date] for workplace injury that occurred on [date]."',
    },
    {
      step: 2,
      title: 'Connect every symptom to your work',
      description: 'This is the most critical habit. Every diary entry must link your pain to your workplace injury and job duties. Don\'t write "back hurts." Write: "L4-L5 pain increased to 7/10 after sitting at workstation for 90 minutes — had to leave desk and lie down. Could not complete the afternoon shift." This specificity is what case managers need to justify ongoing benefits.',
    },
    {
      step: 3,
      title: 'Measure functional capacity in concrete terms',
      description: 'Use the functional capacity page to document specific tolerances: "Can sit for 20 minutes before pain reaches 6/10," "Can lift up to 5 lbs with right arm — position requires lifting 20 lbs," "Walking limited to 10 minutes before left knee swells." These measurable limitations directly support modified duty and accommodation requests.',
    },
    {
      step: 4,
      title: 'Log every treatment and appointment without exception',
      description: 'WCB evaluates treatment compliance heavily. Record every medical appointment, physiotherapy session, prescribed home exercise, and medication. If you miss a session, document why. Track effectiveness too: "Physio session #14 — dry needling on shoulder. Pain reduced from 7 to 4 for ~6 hours."',
    },
    {
      step: 5,
      title: 'Complete the monthly summary and share with your case manager',
      description: 'At month-end, fill in the summary page: total work days missed, average pain level, treatment attendance rate, functional capacity changes, and return-to-work readiness. Bring this page to WCB appointments, medical exams, and vocational assessments. One organized summary page is more persuasive than a stack of unstructured notes.',
    },
  ],
  
  whyItMatters: 'WorkSafeBC processes over 200,000 claims annually. Case managers have limited time to review each one — claims with structured, consistent, work-focused documentation are resolved faster and approved more often. A 2022 review found that claims with structured pain diaries were resolved an average of 3 weeks faster than those without. For chronic pain claims specifically, documentation quality is often the deciding factor between approval and denial. The Workers\' Compensation Appeal Tribunal (WCAT) regularly overturns denials when workers present organized daily records that the original case manager didn\'t have. Your pain diary is not just a tracking tool — it\'s your primary evidence.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Aligned with WorkSafeBC Form 8 documentation standards and medical advisor evaluation criteria.',
    privacyNote: 'Your workers\' compensation records stay private until you choose to share them with WCB or your advocate.',
    legalNote: 'Accepted format for Review Division appeals, WCAT proceedings, and Independent Medical Exams.',
  },
  
  // FAQ
  faqs: [
    {
      question: 'Does WorkSafeBC require a pain diary for claims?',
      answer: 'Not officially required, but strongly recommended — especially for chronic pain claims. WCB case managers and medical advisors rely on physician reports (Form 8), but these only capture snapshots from appointments. A daily pain diary fills the gaps between medical visits and demonstrates the persistent, daily reality of your condition. Claims with structured documentation are consistently resolved faster and more favorably.',
    },
    {
      question: 'What is Form 8 and how does my diary relate to it?',
      answer: 'Form 8 is the physician\'s report to WorkSafeBC — your doctor fills it out after their examination. It includes diagnosis, treatment plan, and functional capacity assessment. Your pain diary doesn\'t replace Form 8, but it powerfully supports it. When your diary matches what your doctor reports, it reinforces credibility. Bring your diary to appointments so your doctor can reference your daily patterns when completing Form 8.',
    },
    {
      question: 'What if my claim has already been denied?',
      answer: 'Start documenting now. Pain diaries are valuable evidence for Review Division reconsiderations and WCAT appeals. The appeal process allows new evidence that wasn\'t available during the original decision. A structured diary showing persistent, work-related symptoms, treatment compliance, and ongoing functional limitations can be the difference in overturning a denial. Many workers\' advocates specifically recommend starting a diary before filing an appeal.',
    },
    {
      question: 'How does this differ from a regular pain diary?',
      answer: 'Three critical differences: (1) Every section emphasizes the work connection — linking symptoms to job duties and workplace activities. Regular pain diaries don\'t do this, and WCB needs it. (2) Functional capacity is measured in work-relevant terms — sitting, standing, lifting tolerances that map to your job requirements. (3) Treatment compliance tracking is prominent, because WCB can reduce or deny benefits for non-compliance.',
    },
    {
      question: 'Should I share my diary with my WCB case manager?',
      answer: 'Yes, strategically. Share monthly summaries at key decision points: before medical examinations (especially IMEs), during vocational rehabilitation assessments, when benefits are under review, or when requesting extended treatment coverage. You don\'t need to submit every daily entry. The monthly summary page is specifically designed for case manager consumption — one page that captures the full picture.',
    },
    {
      question: 'What if I\'m back at work but still have pain?',
      answer: 'Continue documenting — this is critical. Modified duties, reduced hours, or pain while working are all relevant to your claim. Entries like "Completed 6-hour shift (normally 8) with two extra rest breaks. Pain peaked at 6/10 during afternoon lifting. Could not complete stock rotation tasks." This documents that you\'re making effort while showing legitimate ongoing limitations, which supports permanent partial disability ratings or ongoing treatment coverage.',
    },
    {
      question: 'How long should I keep the journal?',
      answer: 'For the duration of your claim — and ideally beyond. If your claim is active, track daily. If you\'re on graduated return-to-work, track until fully back to pre-injury duties. If you have a permanent partial disability, periodic entries (weekly) create a long-term record. For appeals, maintain the journal through the entire process. WorkSafeBC has a 3-year window for claim reviews, so your records may be relevant for years.',
    },
    {
      question: 'Can I use the digital version in Pain Tracker Pro for my WCB claim?',
      answer: 'Yes. Pain Tracker Pro generates WorkSafeBC-specific reports in PDF format, aligned with Form 8 documentation. The digital version adds automatic pain trend analysis, work impact calculations, treatment compliance tracking, and one-click PDF export. Each export includes a SHA-256 integrity hash for verifiability. Many users combine both: the paper diary for daily quick entries (especially at work) and the digital version for analysis, reporting, and export.',
    },
    {
      question: 'What about the Workers\' Compensation Appeal Tribunal (WCAT)?',
      answer: 'WCAT is the final level of appeal for denied WorkSafeBC claims. WCAT decisions are based on the evidence record, and panels regularly cite the quality of worker self-documentation in their decisions. A structured pain diary with daily entries, consistent work connection, treatment compliance records, and functional capacity measurements is exactly the type of evidence WCAT panels find persuasive. If you\'re heading to WCAT, organize your diary entries into a chronological summary with the monthly overview pages.',
    },
    {
      question: 'I work in construction / trades — is this relevant for physical jobs?',
      answer: 'Absolutely. The functional capacity section is especially important for physical jobs. Document specific tolerances: "Can lift 10 lbs but position requires lifting 50 lbs," "Can stand for 30 min but shift requires 8 hours standing," "Cannot operate jackhammer due to right shoulder injury." The gap between your capacity and your job requirements justifies modified duties, retraining, or disability benefits.',
    },
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Documenting Pain for Disability Claims',
      description: 'General guide to disability documentation evidence',
      href: '/resources/documenting-pain-for-disability-claim',
    },
    {
      title: 'Pain Journal for Disability Benefits',
      description: 'Documentation strategies for benefit applications',
      href: '/resources/pain-journal-for-disability-benefits',
    },
    {
      title: 'Daily Functioning Log',
      description: 'Track functional limitations for evaluators',
      href: '/resources/daily-functioning-log-disability',
    },
    {
      title: 'How to Track Pain for Doctors',
      description: 'Presenting your records at WCB medical exams',
      href: '/resources/how-to-track-pain-for-doctors',
    },
    {
      title: 'Monthly Pain Tracker',
      description: 'Long-term tracking for ongoing claims',
      href: '/resources/monthly-pain-tracker-printable',
    },
    {
      title: 'Chronic Back Pain Diary',
      description: 'Specialized tracking for back injuries — the most common WCB claim',
      href: '/resources/chronic-back-pain-diary',
    },
  ],
  
  // Breadcrumbs
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'WorkSafeBC Pain Journal Template', url: '/resources/worksafebc-pain-journal-template' },
  ],
};

/* ─── Custom Sections (rendered as children inside SEOPageLayout) ──────── */

const WorkSafeBCCustomSections: React.FC = () => (
  <>
    {/* Stats */}
    <section className="py-12 bg-slate-900 border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <WCBStatsBanner />
      </div>
    </section>

    {/* Claim Process Timeline */}
    <section className="py-14 bg-slate-900 border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">The WCB Claim Journey</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Your pain journal supports every phase — from initial injury report through return-to-work or appeal.
          </p>
        </div>
        <ClaimProcessTimeline />
      </div>
    </section>

    {/* PDF Contents Preview */}
    <section className="py-14 bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">What's Inside the PDF</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            6 professionally designed pages covering every aspect of WCB pain documentation — structured for case manager review.
          </p>
        </div>
        <PdfContentsPreview />
      </div>
    </section>

    {/* What WCB Evaluators Look For */}
    <section className="py-14 bg-slate-900 border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">What WCB Evaluators Actually Look For</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Your diary needs to answer four questions. Here's how to write entries that meet WCB standards — with real examples.
          </p>
        </div>
        <WCBEvaluationCriteria />
      </div>
    </section>

    {/* Common Mistakes */}
    <section className="py-14 bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">6 Documentation Mistakes That Hurt WCB Claims</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Avoid these common errors that case managers see every day — and weaken otherwise valid claims.
          </p>
        </div>
        <CommonMistakes />
      </div>
    </section>

    {/* Digital Version Callout */}
    <section className="py-12 bg-slate-800/50 border-b border-slate-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-transparent p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Pain Tracker Pro: Auto-Generate WCB Reports</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                The digital version automatically calculates pain trends, work impact metrics, treatment compliance rates, and functional capacity changes — then exports a Form 8-aligned PDF report with one click. Each export includes a SHA-256 integrity hash for verifiability. Everything stays encrypted on your device.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="text-xs px-3 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-300">Auto pain trend analysis</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">Work impact calculator</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300">One-click PDF export</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">SHA-256 verification</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300">AES-256 encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Disclaimer */}
    <section className="py-8 bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 text-center">
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong className="text-slate-400">Disclaimer:</strong> Pain Tracker Pro is not affiliated with, endorsed by, or connected to WorkSafeBC. 
            This template provides a documentation framework based on publicly available WCB evaluation criteria. 
            It is not legal advice. For claim-specific guidance, consult a workers&apos; compensation lawyer or workers&apos; advocate.
          </p>
        </div>
      </div>
    </section>
  </>
);

/* ─── Page Component ──────────────────────────────────────────────── */

export const WorkSafeBCPainJournalTemplatePage: React.FC = () => {
  return (
    <SEOPageLayout content={pageContent}>
      <WorkSafeBCCustomSections />
    </SEOPageLayout>
  );
};

export default WorkSafeBCPainJournalTemplatePage;
