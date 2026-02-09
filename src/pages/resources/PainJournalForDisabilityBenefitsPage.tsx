/**
 * Pain Journal for Disability Benefits – SEO Landing Page (Enhanced)
 *
 * Target keyword: "pain journal for disability benefits"
 * Tier 3 – Disability / Legal Documentation
 */

import React from 'react';
import {
  ArrowRight, FileText, CheckCircle, Calendar, TrendingUp,
  Users, Scale, Shield, BookOpen, ClipboardCheck,
  MonitorSmartphone, AlertTriangle, Briefcase
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, BottomCTACallout, PdfContentsPreview } from '../../components/seo';
import type { StatItem, PdfPage } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** Benefits programs comparison */
const BenefitsProgramComparison: React.FC = () => {
  const programs = [
    { name: 'SSDI', full: 'Social Security Disability Insurance', focus: 'Can you perform any substantial gainful activity?', key: 'Medical evidence + functional limitations', timeline: '3–6 months (initial)', color: 'bg-blue-50 border-blue-200' },
    { name: 'SSI', full: 'Supplemental Security Income', focus: 'Financial need + disability combined', key: 'Same medical standard as SSDI + income limits', timeline: '3–6 months (initial)', color: 'bg-indigo-50 border-indigo-200' },
    { name: 'WorkSafeBC / WCB', full: 'Workers\' Compensation', focus: 'Is the injury work-related? What functional capacity remains?', key: 'Causal link to work + functional documentation', timeline: 'Varies (weeks to months)', color: 'bg-amber-50 border-amber-200' },
    { name: 'LTD Insurance', full: 'Long-Term Disability Insurance', focus: 'Can you perform your own occupation? Any occupation?', key: 'Policy-specific criteria + consistent documentation', timeline: '90–180 day elimination period', color: 'bg-purple-50 border-purple-200' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Which Benefits Program? Your Journal Needs to Match.</h3>
      <p className="text-sm text-slate-500 mb-6">Each program evaluates disability differently. Know what YOUR program prioritizes.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map((p) => (
          <div key={p.name} className={`rounded-xl border p-5 ${p.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-slate-800 bg-white px-2 py-0.5 rounded">{p.name}</span>
              <span className="text-xs text-slate-500">{p.full}</span>
            </div>
            <dl className="space-y-1.5 text-sm">
              <div><dt className="font-medium text-slate-600 inline">Core question: </dt><dd className="text-slate-600 inline">{p.focus}</dd></div>
              <div><dt className="font-medium text-slate-600 inline">Key evidence: </dt><dd className="text-slate-700 inline font-medium">{p.key}</dd></div>
              <div><dt className="font-medium text-slate-500 inline">Timeline: </dt><dd className="text-slate-500 inline">{p.timeline}</dd></div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Daily journal entry structure */
const JournalEntryStructure: React.FC = () => {
  const sections = [
    { time: 'Morning', items: ['Pain level upon waking (0-10)', 'Sleep quality (hours + interruptions)', 'Morning stiffness duration', 'Medications taken'], icon: '🌅', color: 'border-amber-200 bg-amber-50' },
    { time: 'Midday', items: ['Activities attempted + completed', 'Activities abandoned or modified', 'Pain after each activity', 'Rest periods needed'], icon: '☀️', color: 'border-blue-200 bg-blue-50' },
    { time: 'Evening', items: ['Worst pain of the day + trigger', 'Total productive hours', 'Help needed from others', 'Functional capacity summary'], icon: '🌙', color: 'border-indigo-200 bg-indigo-50' },
    { time: 'Weekly', items: ['Days unable to work/function', 'Appointments attended', 'Pattern changes noted', 'Medication effectiveness'], icon: '📊', color: 'border-emerald-200 bg-emerald-50' },
  ];
  return (
    <div className="my-10 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 md:p-8 border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-2">What to Write Every Day: The Benefits-Ready Journal Entry</h3>
      <p className="text-sm text-slate-500 mb-6">This structure captures everything evaluators need. Takes 5 minutes — the most productive 5 minutes for your claim.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((s) => (
          <div key={s.time} className={`rounded-xl border p-5 ${s.color}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl" role="img" aria-hidden="true">{s.icon}</span>
              <h4 className="font-bold text-slate-800">{s.time}</h4>
            </div>
            <ul className="space-y-1.5">
              {s.items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" aria-hidden="true" />
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

/** Power phrases for disability documentation */
const PowerPhrases: React.FC = () => {
  const phrases = [
    { weak: '"Had a bad day"', strong: '"Unable to stand for more than 5 minutes. Had to sit during cooking. Spouse loaded dishwasher and helped me dress."', why: 'Specific, measurable, functional' },
    { weak: '"Pain was terrible"', strong: '"Pain 8/10, burning in lower back. Could not bend to pick up child. Missed parent-teacher meeting. Lying down by 2pm."', why: 'Concrete activities, specific limitations' },
    { weak: '"Couldn\'t do much"', strong: '"Attempted grocery shopping, had to leave after 15 minutes. Sat in car for 30 min before driving home. Groceries brought in by neighbor."', why: 'Shows attempt, limitation, and impact' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">How to Write Entries That Actually Help Your Claim</h3>
      <p className="text-sm text-slate-500 mb-6">The difference between weak and strong documentation is specificity. Compare these real examples.</p>
      <div className="space-y-4">
        {phrases.map((p, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <span className="text-xs font-bold text-red-600 block mb-1">❌ Weak</span>
                <p className="text-sm text-slate-700 italic">{p.weak}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <span className="text-xs font-bold text-emerald-600 block mb-1">✓ Strong</span>
                <p className="text-sm text-slate-700 italic">{p.strong}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Why it works: {p.why}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const benefitsPdfPages: PdfPage[] = [
  { page: 1, title: 'Benefits-Ready Pain Journal', desc: 'Instructions, which benefits program, what evaluators look for, journal entry structure' },
  { page: 2, title: 'Daily Journal Template (x2)', desc: 'Morning/midday/evening sections with pain, function, activities, medications, sleep' },
  { page: 3, title: 'Functional Limitation Log', desc: 'Activities attempted, completed, abandoned, modified — with time and pain level for each' },
  { page: 4, title: 'Weekly Summary Sheet', desc: 'Days unable to work, total productive hours, worst/best days, appointments, medication changes' },
  { page: 5, title: 'Medical Visit Prep Worksheet', desc: 'Align your journal with what you tell your doctor — consistency is key for evaluators' },
  { page: 6, title: 'Monthly Evidence Summary', desc: 'One-page overview for lawyers, adjusters, or evaluators showing the month\'s pattern' },
];

const benefitsStats: StatItem[] = [
  { value: '2.6M', label: 'SSDI applications per year', icon: Users },
  { value: '65%', label: 'Initial claims denied', icon: AlertTriangle },
  { value: '90 days', label: 'Recommended tracking period', icon: Calendar },
  { value: '6', label: 'Pages in journal template', icon: FileText },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'pain-journal-for-disability-benefits',
  title: 'Pain Journal for Disability Benefits (Free)',
  metaTitle: 'Pain Journal for Disability Benefits — Free Benefits-Ready Template | Pain Tracker Pro',
  metaDescription: 'Download a free pain journal template designed specifically for disability benefits applications. Covers SSDI, LTD, WorkSafeBC. Includes functional limitation tracking and evidence-ready formatting.',
  keywords: [
    'pain journal for disability benefits', 'disability pain journal',
    'SSDI pain diary', 'disability benefits pain documentation',
    'pain diary for disability application', 'chronic pain disability journal',
    'LTD pain documentation', 'disability claim pain diary',
    'pain journal disability appeal', 'functional limitation diary',
    'disability evaluation pain records', 'SSI pain documentation',
    'workers comp pain journal', 'disability benefits evidence'
  ],
  badge: 'Free Download',
  headline: 'Pain Journal for Disability Benefits',
  subheadline: 'A journal template built for disability evaluators: SSDI, SSI, LTD insurance, and workers\' compensation. Captures the functional limitations, treatment compliance, and daily impact that actually determine claim outcomes.',
  primaryCTA: { text: 'Download Free Journal PDF', href: '/assets/disability-pain-journal-guide.pdf', download: true },
  secondaryCTA: { text: 'Start Digital Tracking', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/disability-pain-journal-guide.pdf', downloadFileName: 'disability-pain-journal-guide.pdf' },
  whatIsThis: 'A pain journal template specifically formatted for disability benefits applications. This isn\'t a generic pain diary — every section is designed to produce the exact evidence that disability evaluators weigh when making decisions. It covers functional limitations (what you can\'t do), treatment compliance (what you\'re doing about it), and daily impact patterns (how consistent and credible your documentation is). Whether you\'re applying for SSDI, SSI, long-term disability insurance, or workers\' compensation, this journal captures what each program needs to see.',
  whoShouldUse: [
    'Anyone applying for SSDI or SSI disability benefits due to chronic pain',
    'People with long-term disability insurance claims for pain conditions',
    'Workers\' compensation claimants (WorkSafeBC, WSIB, state programs)',
    'People whose initial disability application was denied',
    'Disability attorneys or advocates helping clients build evidence',
    'Anyone facing a Consultative Examination or Independent Medical Exam',
    'People who want to start building evidence before they need it',
    'Caregivers helping document a loved one\'s disability'
  ],
  howToUse: [
    { step: 1, title: 'Start immediately — documentation age matters', description: 'The longer your journal history, the stronger your evidence. Start today even if you haven\'t filed yet. Pre-claim documentation is the most credible kind.' },
    { step: 2, title: 'Follow the morning/midday/evening structure', description: 'Each day has three brief check-ins capturing pain levels, activities attempted and abandoned, help needed, and medications taken. This structure produces comprehensive evidence in minimal time.' },
    { step: 3, title: 'Focus on what you couldn\'t do, not just how much it hurt', description: 'Evaluators assess functional capacity, not pain severity. "Couldn\'t stand long enough to cook dinner" is stronger evidence than "pain 8/10." Always include specific functional limitations.' },
    { step: 4, title: 'Complete weekly summaries for easy reference', description: 'Evaluators don\'t read 90 daily entries — they skim weekly summaries. Track total days affected, productive hours, missed activities, and pattern changes each week.' },
    { step: 5, title: 'Bring monthly evidence summaries to appointments', description: 'Use the monthly summary page to keep your doctor informed. When your medical records align with your journal, evaluators see a consistent, credible picture.' }
  ],
  whyItMatters: 'Disability evaluators see hundreds of applications — most with inadequate documentation. The claims that succeed have one thing in common: systematic, daily evidence of functional limitations that corroborates medical records. A benefits-ready pain journal doesn\'t just track pain — it builds a case. The functional limitation sections, treatment compliance documentation, and weekly summaries are specifically what evaluators review when making approval decisions.',
  trustSignals: {
    medicalNote: 'Journal structure aligns with the functional capacity assessment framework used by disability evaluators for SSDI, SSI, and LTD programs.',
    privacyNote: 'Your journal is private. All data stays on your device until YOU choose to share it with your attorney, doctor, or evaluator.',
    legalNote: 'Structured for major disability programs (SSDI, SSI, LTD, WCB). Not legal advice — consult a disability attorney for your specific claim.'
  },
  faqs: [
    { question: 'Which disability program should I use this for?', answer: 'This template works for all major programs: SSDI, SSI, long-term disability insurance, and workers\' compensation. Each section captures evidence relevant across programs. The first page helps you identify what YOUR specific program prioritizes.' },
    { question: 'How is this different from a regular pain diary?', answer: 'Regular pain diaries focus on pain levels. This journal focuses on functional limitations — because that\'s what evaluators actually use to determine disability. Every section is designed to produce evidence that evaluators can review, not just personal tracking notes.' },
    { question: 'How long should I journal before applying?', answer: 'Minimum 30 days. Ideal is 60-90 days. For appeals of denied claims, continue journaling throughout the entire appeals process. The journal accumulates evidence — more time = stronger documentation.' },
    { question: 'What if I miss some days?', answer: 'That\'s okay — document the gap honestly. Don\'t backfill entries. Evaluators know chronic pain causes bad days where journaling is impossible. A gap with a note saying "too much pain to write" is more credible than perfect attendance.' },
    { question: 'Should my doctor see my journal?', answer: 'Yes. Bring your weekly or monthly summaries to every appointment. When your doctor\'s notes align with your journal entries, evaluators see corroborated evidence from two independent sources — this is extremely powerful.' },
    { question: 'Can I use the digital version for my claim?', answer: 'Yes. Digital or paper both work. Many attorneys recommend printing reports from the digital version — it looks professional and systematic. The key is consistency, not format.' },
    { question: 'What if my claim was already denied?', answer: 'Start journaling immediately for your appeal. The denial letter tells you what evidence was missing — your journal can fill those gaps. Appeals with new, systematic daily documentation frequently succeed where initial applications failed.' },
    { question: 'Is pain alone enough for disability?', answer: 'Pain must cause functional limitations that prevent substantial gainful activity (for SSDI/SSI) or performance of your occupation (for LTD). Your journal documents those functional limitations — the bridge between "I have pain" and "I cannot work."' },
    { question: 'What about medication side effects?', answer: 'Document every side effect: drowsiness, cognitive fog, nausea, dizziness. Medication side effects can independently contribute to functional limitations. "Pain medication makes me too drowsy to drive safely" is valid disability evidence.' },
    { question: 'Do evaluators actually read pain journals?', answer: 'Yes — but they skim, not read word-by-word. They look at: consistency of entries, credibility (pain fluctuates, good days included), functional limitations, and treatment compliance. The weekly and monthly summary pages make their job easier — which helps your case.' }
  ],
  relatedLinks: [
    { title: 'Documenting Pain for Disability', description: 'Complete evidence-building guide', href: '/resources/documenting-pain-for-disability-claim' },
    { title: 'Daily Functioning Log', description: 'Detailed functional capacity tracking', href: '/resources/daily-functioning-log-for-disability' },
    { title: 'WorkSafeBC Pain Journal', description: 'BC workplace injury claims', href: '/resources/worksafebc-pain-journal-template' },
    { title: 'Pain Diary Template PDF', description: 'Comprehensive daily tracking', href: '/resources/pain-diary-template-pdf' },
    { title: 'How to Track Pain for Doctors', description: 'Align with medical records', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'Weekly Pain Log PDF', description: 'Weekly pattern tracking', href: '/resources/weekly-pain-log-pdf' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Journal for Disability Benefits', url: '/resources/pain-journal-for-disability-benefits' }
  ]
};

export const PainJournalForDisabilityBenefitsPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={benefitsStats} colorScheme="emerald" />
    <BenefitsProgramComparison />
    <JournalEntryStructure />
    <PowerPhrases />
    <PdfContentsPreview pages={benefitsPdfPages} accentColor="emerald" heading="What's in the Journal Template (6 Pages)" />
    <BottomCTACallout
      icon={MonitorSmartphone}
      heading="Your Claim Depends on What You Document Starting Today."
      body="Every day without documentation is evidence you don't have. Download the benefits-ready journal or start digital tracking — either format builds the case. What matters is starting now."
      pdfUrl="/assets/disability-pain-journal-guide.pdf"
      gradientClasses="from-emerald-600 to-green-600"
      tintClass="text-emerald-100"
      buttonTextClass="text-emerald-700"
      buttonHoverClass="hover:bg-emerald-50"
      primaryLabel="Download Journal PDF"
      secondaryLabel="Start Digital Tracking"
    />
  </SEOPageLayout>
);

export default PainJournalForDisabilityBenefitsPage;
