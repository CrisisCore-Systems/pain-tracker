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
        'Keep dated treatment notes',
      ],
    },
    {
      phase: 'Claim Review',
      timing: 'Ongoing',
      color: 'from-amber-500/20 to-amber-500/5',
      border: 'border-amber-500/30',
      icon: <ClipboardCheck className="w-5 h-5 text-amber-400" />,
      actions: [
        'Reviewers may compare available records',
        'Medical notes remain the primary record',
        'Functional limits may need explanation',
        'Work status discussions may continue',
        'Share selected summaries only when useful',
      ],
    },
    {
      phase: 'Resolution',
      timing: 'Variable',
      color: 'from-emerald-500/20 to-emerald-500/5',
      border: 'border-emerald-500/30',
      icon: <Scale className="w-5 h-5 text-emerald-400" />,
      actions: [
        'Return-to-work or modified-duty discussions',
        'Treatment planning may change over time',
        'Review or appeal options may have deadlines',
        'Keep copies of anything you share',
        'Ask qualified help for disputed decisions',
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

/* ─── Worker Note Review Details ─────────────────────────────────────── */

const WCBEvaluationCriteria: React.FC = () => {
  const criteria = [
    {
      title: 'Work Context',
      icon: <Briefcase className="w-5 h-5 text-sky-400" />,
      color: 'border-sky-500/30 bg-sky-500/10',
      description: 'Connect symptoms to the workplace injury context and affected job duties when that detail is relevant.',
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
      title: 'Treatment and Rehabilitation Notes',
      icon: <Stethoscope className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/30 bg-purple-500/10',
      description: 'Record appointments, home exercises, medications, and what changed after each step.',
      doItems: ['"Physio session #12 — prescribed exercises plus 15 min heat therapy. Pain reduced from 6 to 4."', '"Took ibuprofen 400mg at 8am and 2pm as prescribed. Moderate relief for ~3 hours."'],
      dontItems: ['"Went to physio"', '"Took meds"'],
    },
    {
      title: 'Consistent Daily Tracking',
      icon: <Calendar className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/30 bg-amber-500/10',
      description: 'Daily entries - including better days - make the pattern easier to understand later.',
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
      title: 'Treatment & Rehab Notes',
      icon: <Stethoscope className="w-4 h-4 text-purple-400" />,
      items: ['Medical appointments attended', 'Physiotherapy sessions and exercises', 'Medication log with perceived effect', 'Home exercises completed', 'Non-drug treatments used'],
    },
    {
      title: 'Weekly Work Impact Summary',
      icon: <Building2 className="w-4 h-4 text-red-400" />,
      items: ['Work days missed vs. attended', 'Modified duties used', 'Accommodations discussed', 'Return-to-work progress', 'Questions for appointments'],
    },
    {
      title: 'Monthly Summary for Review',
      icon: <TrendingUp className="w-4 h-4 text-pink-400" />,
      items: ['Total work days missed this month', 'Average pain level and trend', 'Treatment appointment record', 'Functional capacity changes', 'Return-to-work notes', 'Questions for appointments'],
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
    { value: '30 days', label: 'A focused range for appointment-ready summaries' },
    { value: '90 days', label: 'Typical window to file a WCB claim in BC' },
    { value: 'Form 8', label: 'Physician report context your notes may help explain' },
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
      why: 'Creates a thin record that can be harder to interpret later.',
      fix: 'Track every day when possible, even when pain is low. "Pain 2/10 today - still cannot lift >10 lbs or sit >30 min" is clearer than memory alone.',
    },
    {
      mistake: 'Constant 10/10 pain ratings',
      why: 'Can make the record less useful because it hides variation and context.',
      fix: 'Be honest about good and bad days. Show the range. Variation demonstrates authenticity.',
    },
    {
      mistake: 'No connection to work duties',
      why: 'A note that omits affected job tasks can be harder to connect to the workplace injury context.',
      fix: 'Mention which job tasks are affected. "Standing at register increased L4-L5 pain" is clearer than "back hurts."',
    },
    {
      mistake: 'Starting documentation late',
      why: 'Gaps between injury date and first diary entry create doubt.',
      fix: 'Start from Day 1 of injury. If you\'re late, begin now and note: "Starting diary on [date] for injury on [date]."',
    },
    {
      mistake: 'Skipping treatment appointments',
      why: 'Missed appointments can leave confusing gaps in the record if the reason is not written down.',
      fix: 'Attend every appointment. If you miss one, document why. Track home exercises too.',
    },
    {
      mistake: 'Contradicting medical records',
      why: 'If your notes and appointment discussion use different wording, the pattern can be harder to understand later.',
      fix: 'Use the same plain details in your notes and appointments. Bring a summary so the discussion is easier to follow.',
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
  title: 'WorkSafeBC Pain Journal Template in 2026',
  metaTitle: 'WorkSafeBC Pain Journal Template (2026) | Free PDF + Private Tracking',
  metaDescription: 'For workplace injury documentation in 2026: keep structured notes about pain, functional limits, medication changes, triggers, and recovery patterns with a printable PDF or private local-first tracking.',
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
    'worksafe bc claim notes',
    'bc work injury pain journal',
    'wcb functional capacity diary',
    'worksafebc appeal documentation',
  ],
  
  // Above-the-fold
  badge: 'Free 6-Page PDF',
  headline: 'WorkSafeBC pain journal template for 2026 workplace injury documentation.',
  subheadline: 'PainTracker.ca can help you keep structured notes about pain, functional limits, medication changes, triggers, and recovery patterns. Use the printable if you need something today. Use the free app when you need cleaner summaries and a longer-running private record for appointments, review conversations, or claim discussions.',
  primaryCTA: {
    text: 'Download Free PDF (6 Pages)',
    href: '/assets/worksafebc-pain-journal.pdf',
    download: true,
  },
  secondaryCTA: {
    text: 'Start tracking free',
    href: '/start',
  },
  
  // Utility block
  utilityBlock: {
    type: 'download',
    downloadUrl: '/assets/worksafebc-pain-journal.pdf',
    downloadFileName: 'worksafebc-pain-journal.pdf',
  },
  
  // Content sections
  whatIsThis: 'This is a 6-page pain journal template for British Columbia workers with active or pending WorkSafeBC (WCB) claims. Unlike a general pain diary, it keeps the focus on work-related symptoms, job demands, functional limits, treatment history, and weekly work impact so your records stay organized around the claim context. It includes daily pain entries with job duty linkage, functional capacity measurements (sitting, standing, lifting tolerances), treatment and rehabilitation tracking, weekly summaries, and a monthly overview page for appointments or claim-related discussions. It is a documentation aid, not an official decision document.',
  
  whoShouldUse: [
    'BC workers with workplace injuries resulting in chronic or ongoing pain',
    'Anyone with an active WorkSafeBC claim who wants clearer personal notes for appointments or claim-related discussions',
    'Workers preparing to file a WCB claim who want dated notes close to when symptoms and work limits occur',
    'People preparing for Review Division or WCAT discussions with an advocate or legal representative',
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
      description: 'This is the most critical habit. Every diary entry should link your pain to your workplace injury and job duties. Don\'t write "back hurts." Write: "L4-L5 pain increased to 7/10 after sitting at workstation for 90 minutes — had to leave desk and lie down. Could not complete the afternoon shift." This specificity helps keep your documentation concrete and easier to review.',
    },
    {
      step: 3,
      title: 'Measure functional capacity in concrete terms',
      description: 'Use the functional capacity page to document specific tolerances: "Can sit for 20 minutes before pain reaches 6/10," "Can lift up to 5 lbs with right arm — position requires lifting 20 lbs," "Walking limited to 10 minutes before left knee swells." Concrete examples make appointment, work-duty, and accommodation conversations easier to follow.',
    },
    {
      step: 4,
      title: 'Log every treatment and appointment without exception',
      description: 'Treatment history is often part of claim documentation. Record every medical appointment, physiotherapy session, prescribed home exercise, and medication. If you miss a session, document why. Track effectiveness too: "Physio session #14 — dry needling on shoulder. Pain reduced from 7 to 4 for ~6 hours."',
    },
    {
      step: 5,
      title: 'Complete the monthly summary and decide what to share',
      description: 'At month-end, fill in the summary page: total work days missed, average pain level, treatment attendance rate, functional capacity changes, and return-to-work readiness. Bring this page to WorkSafeBC-related appointments, medical exams, or vocational assessments when it is relevant. One organized summary page is easier to review than a stack of unstructured notes.',
    },
  ],
  
  whyItMatters: 'WorkSafeBC-related discussions often depend on whether the record clearly shows how symptoms, work demands, treatment history, and functional limits fit together over time. A structured diary helps you preserve those details while they are fresh instead of reconstructing them later from memory. For chronic pain matters especially, organized daily records can make conversations with clinicians, advocates, and reviewers more concrete. Outcomes depend on the reviewer, medical records, policy, and case context, but clear records make the discussion easier to follow.',
  
  // Trust signals
  trustSignals: {
    medicalNote: 'Built to support work-related symptom, function, and treatment notes that can be brought to clinicians preparing Form 8 or related documentation.',
    privacyNote: 'Your workers\' compensation records stay private until you choose to share them with WCB or your advocate.',
    legalNote: 'PainTracker.ca does not replace medical advice, legal advice, WorkSafeBC instructions, or official claim forms.',
  },
  
  // FAQ
  faqs: [
    {
      question: 'Does WorkSafeBC require a pain diary for claims?',
      answer: 'No. A pain diary is not an official WorkSafeBC requirement. Physician reports such as Form 8 remain central, but a daily pain diary helps organize records between appointments and show how symptoms and limitations change over time.',
    },
    {
      question: 'What is Form 8 and how does my diary relate to it?',
      answer: 'Form 8 is the physician\'s report to WorkSafeBC — your doctor fills it out after their examination. It includes diagnosis, treatment plan, and functional capacity assessment. Your pain diary does not replace Form 8. Use it alongside appointment records so your doctor can reference your daily patterns when completing related documentation.',
    },
    {
      question: 'What if my claim has already been denied?',
      answer: 'Start documenting now. Pain diaries can still be useful for Review Division reconsiderations and WCAT appeals because they help organize ongoing symptoms, treatment history, and functional limitations. Use them as part of your supporting record, not instead of medical or legal guidance.',
    },
    {
      question: 'How does this differ from a regular pain diary?',
      answer: 'Three practical differences: (1) Every section helps connect symptoms to job duties and workplace activities. (2) Functional capacity is measured in work-relevant terms such as sitting, standing, and lifting tolerances. (3) Treatment and appointment notes are kept in the same place, so you can explain what happened without reconstructing it from memory.',
    },
    {
      question: 'Should I share my diary with WorkSafeBC?',
      answer: 'You can choose to share summaries when they are relevant to appointments, review discussions, or treatment conversations. You do not need to submit every daily entry. The monthly summary page is designed to make the record easier to review before you decide what to share.',
    },
    {
      question: 'What if I\'m back at work but still have pain?',
      answer: 'Continue documenting if the record is still useful. Modified duties, reduced hours, or pain while working may be relevant to later discussions. Entries like "Completed 6-hour shift (normally 8) with two extra rest breaks. Pain peaked at 6/10 during afternoon lifting. Could not complete stock rotation tasks." keep the discussion concrete if work status, accommodations, or treatment needs are reviewed.',
    },
    {
      question: 'How long should I keep the journal?',
      answer: 'Keep the journal while the record remains useful for appointments, return-to-work planning, review discussions, or your own backup. If your claim is active, daily notes are usually easier to interpret than reconstructed summaries. For appeals or long-running matters, ask your advocate or legal representative how long to keep copies. WorkSafeBC has a 3-year window for claim reviews, so your records may be relevant for years.',
    },
    {
      question: 'Can I use the digital version in Pain Tracker for my WCB claim?',
      answer: 'Yes. PainTracker.ca can generate WorkSafeBC-oriented PDF reports from your records. The digital version adds pain trend analysis, work impact calculations, treatment compliance tracking, and one-click PDF export. Many people combine both: the paper diary for quick daily entries and the digital version for summaries and exports.',
    },
    {
      question: 'What about the Workers\' Compensation Appeal Tribunal (WCAT)?',
      answer: 'WCAT is the final level of appeal for denied WorkSafeBC claims. If you\'re heading to WCAT, organize your diary entries into a chronological summary with the monthly overview pages so your documentation is easier to follow alongside the rest of the record.',
    },
    {
      question: 'I work in construction / trades — is this relevant for physical jobs?',
      answer: 'Yes. The functional capacity section can be useful for physical jobs. Document specific tolerances: "Can lift 10 lbs but position requires lifting 50 lbs," "Can stand for 30 min but shift requires 8 hours standing," "Cannot operate jackhammer due to right shoulder injury." The gap between your capacity and your job requirements can make work-duty, accommodation, or treatment discussions more concrete.',
    },
  ],
  
  // Related links
  relatedLinks: [
    {
      title: 'Documenting Pain for Disability Claims',
      description: 'General guide to disability documentation notes',
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
      href: '/resources/daily-functioning-log-for-disability',
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
            Your pain journal can be referenced across phases - from initial injury report through return-to-work or appeal.
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
            6 pages for worker-controlled pain, function, treatment, and work-impact notes.
          </p>
        </div>
        <PdfContentsPreview />
      </div>
    </section>

    {/* WorkSafeBC-Related Review Details */}
    <section className="py-14 bg-slate-900 border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">Details That Make Worker Notes Easier to Review</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Your diary is easier to interpret when it answers four practical questions with plain, dated examples.
          </p>
        </div>
        <WCBEvaluationCriteria />
      </div>
    </section>

    {/* Common Mistakes */}
    <section className="py-14 bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">6 Documentation Habits That Can Make Notes Harder to Review</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Avoid common habits that make a personal record harder to understand later.
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
              <h3 className="text-lg font-semibold text-white mb-2">When paper starts to feel scattered, use the app to keep the record cleaner</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                The digital version helps you keep day-by-day notes, work impact, treatment history, and functional changes in one place so the record is easier to review before appointments, case discussions, or claim follow-up. It is meant to reduce manual summarizing, not to replace medical advice, legal guidance, or official WorkSafeBC forms.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="text-xs px-3 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-300">Private on-device tracking</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">Cleaner work-impact history</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300">Less manual summarizing</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">User-controlled exports</span>
                <span className="text-xs px-3 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-300">No account required</span>
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
            <strong className="text-slate-400">Disclaimer:</strong> Pain Tracker is not affiliated with, endorsed by, or connected to WorkSafeBC. 
            This template provides a worker-controlled note framework informed by common documentation needs. 
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
