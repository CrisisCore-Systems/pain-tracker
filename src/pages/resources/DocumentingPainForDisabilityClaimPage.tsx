/**
 * Documenting Pain for Disability Claim – SEO Landing Page (Enhanced)
 *
 * Target keyword: "documenting pain for disability claim"
 * Tier 3 – Disability / Legal Documentation
 */

import React from 'react';
import {
  ArrowRight, FileText, ShieldCheck, AlertTriangle, CheckCircle,
  Calendar, TrendingUp, Users, Scale, ClipboardList,
  MonitorSmartphone, XCircle, BookOpen
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, BottomCTACallout } from '../../components/seo';
import type { StatItem } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** Evidence pyramid — most to least persuasive */
const EvidencePyramid: React.FC = () => {
  const tiers = [
    { rank: 1, label: 'Daily Pain Diary + Medical Records Together', weight: 'Strongest', desc: 'Consistent daily tracking corroborated by clinical notes. Adjusters can cross-reference your diary with appointments.', color: 'bg-emerald-600 text-white' },
    { rank: 2, label: 'Consistent Daily Pain Diary (30+ days)', weight: 'Strong', desc: 'Systematic tracking showing patterns, fluctuations, and functional impact. Pre-dates the claim filing date.', color: 'bg-emerald-500 text-white' },
    { rank: 3, label: 'Functional Limitation Documentation', weight: 'Strong', desc: 'Specific activities you cannot do: "couldn\'t open jars," "had to sit after 10 min standing." Concrete, measurable.', color: 'bg-amber-500 text-white' },
    { rank: 4, label: 'Medical Records Alone', weight: 'Moderate', desc: 'Appointment notes, diagnoses, imaging. Necessary but insufficient — doesn\'t show daily reality between visits.', color: 'bg-amber-400 text-slate-800' },
    { rank: 5, label: 'Verbal Statements Without Records', weight: 'Weak', desc: '"My pain is bad" without supporting documentation. Most claims fail at this level.', color: 'bg-red-400 text-white' },
  ];
  return (
    <div className="my-10 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 md:p-8 border border-emerald-100">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Evidence Strength: What Adjusters Find Most Persuasive</h3>
      <p className="text-sm text-slate-500 mb-6">Not all evidence is equal. Here's what disability evaluators weigh most heavily, from strongest to weakest.</p>
      <div className="space-y-3">
        {tiers.map((t) => (
          <div key={t.rank} className="flex gap-3 items-start">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${t.color}`}>{t.rank}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-800 text-sm">{t.label}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${t.rank <= 2 ? 'bg-emerald-100 text-emerald-700' : t.rank <= 4 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{t.weight}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Common mistakes that get claims denied */
const DenialMistakes: React.FC = () => {
  const mistakes = [
    { icon: XCircle, mistake: 'Constant 10/10 ratings', fix: 'Show fluctuation. Even severe pain varies. 6-7 baseline with 8-9 flares is more credible than unbroken 10/10.', color: 'text-red-500' },
    { icon: XCircle, mistake: 'No documentation before filing', fix: 'Start tracking NOW — pre-claim documentation has no appearance of strategic bias. Late is better than never.', color: 'text-red-500' },
    { icon: XCircle, mistake: 'Only pain numbers, no functional detail', fix: '"Couldn\'t load dishwasher." "Sat during kid\'s soccer game." "Needed help dressing." Functional impact wins claims.', color: 'text-red-500' },
    { icon: XCircle, mistake: 'Gaps and inconsistency', fix: 'Brief daily entries beat detailed sporadic ones. 2 minutes every day is better than 30 minutes once a week.', color: 'text-red-500' },
    { icon: XCircle, mistake: 'Never mentioning good days', fix: 'Good days prove honesty. "Today was a 3 — did laundry and walked to the store" makes your 8/10 days credible.', color: 'text-red-500' },
    { icon: XCircle, mistake: 'Diary contradicts medical records', fix: 'If your diary says "worst week ever" but you told your doctor "managing okay" — that\'s a problem. Be consistent.', color: 'text-red-500' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">6 Documentation Mistakes That Get Claims Denied</h3>
      <p className="text-sm text-slate-500 mb-6">Every adjuster has seen these. Avoid them and your documentation already looks more credible than most.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mistakes.map((m) => (
          <div key={m.mistake} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-3 mb-2">
              <m.icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${m.color}`} aria-hidden="true" />
              <h4 className="font-semibold text-slate-800 text-sm">{m.mistake}</h4>
            </div>
            <p className="text-sm text-slate-600 ml-8">✓ {m.fix}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/** What adjusters actually look for */
const AdjusterChecklist: React.FC = () => {
  const items = [
    { category: 'Consistency', checks: ['Daily entries without suspicious gaps', 'Pain levels that fluctuate realistically', 'Notes that match medical visit records'] },
    { category: 'Functional Impact', checks: ['Specific activities affected or impossible', 'Work tasks that can\'t be performed', 'Self-care limitations documented'] },
    { category: 'Treatment Compliance', checks: ['Medications taken as prescribed', 'Appointments attended', 'Therapy/exercise attempted'] },
    { category: 'Credibility Signals', checks: ['Good days documented honestly', 'Pain description changes appropriately', 'Pre-dates claim filing'] },
  ];
  return (
    <div className="my-10 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
      <h3 className="text-xl font-bold text-slate-800 mb-2">What Disability Adjusters Actually Look For</h3>
      <p className="text-sm text-slate-500 mb-6">Adjusters review hundreds of claims. Your documentation needs to demonstrate credibility across these four areas.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.category} className="rounded-xl bg-slate-50 border border-slate-100 p-5">
            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              {item.category}
            </h4>
            <ul className="space-y-2">
              {item.checks.map((check) => (
                <li key={check} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" aria-hidden="true" />
                  {check}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Documentation timeline */
const DocumentationTimeline: React.FC = () => {
  const phases = [
    { when: 'NOW', action: 'Start daily tracking', detail: 'Brief entries: pain level, what you could/couldn\'t do, medications, sleep quality', icon: Calendar },
    { when: '30 Days', action: 'Baseline established', detail: 'Patterns visible. Adjusters need minimum 30 days. Good days + bad days documented.', icon: TrendingUp },
    { when: '60–90 Days', action: 'Strong documentation', detail: 'Ideal pre-claim tracking period. Cross-references with medical visits. Shows trajectory.', icon: FileText },
    { when: 'File Claim', action: 'Submit with confidence', detail: 'Your diary + medical records + functional documentation = comprehensive evidence package.', icon: Scale },
  ];
  return (
    <div className="my-10 bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 md:p-8 text-white">
      <h3 className="text-lg font-bold mb-6">Your Documentation Timeline</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {phases.map((p, i) => (
          <div key={p.when} className="relative">
            <div className="bg-white/10 rounded-xl p-4 border border-white/10">
              <p.icon className="w-5 h-5 text-emerald-400 mb-2" aria-hidden="true" />
              <div className="text-xs font-bold text-emerald-400 mb-1">{p.when}</div>
              <h4 className="font-semibold text-white text-sm mb-1">{p.action}</h4>
              <p className="text-xs text-slate-300">{p.detail}</p>
            </div>
            {i < phases.length - 1 && <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" aria-hidden="true" />}
          </div>
        ))}
      </div>
    </div>
  );
};

const disabilityStats: StatItem[] = [
  { value: '65%', label: 'Initial SSDI denial rate', icon: AlertTriangle },
  { value: '30+', label: 'Days minimum documentation', icon: Calendar },
  { value: '3×', label: 'More likely approved with diary', icon: TrendingUp },
  { value: '#1', label: 'Reason for denial: poor evidence', icon: FileText },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'documenting-pain-for-disability-claim',
  title: 'How to Document Pain for a Disability Claim',
  metaTitle: 'Documenting Pain for Disability Claim — Complete Evidence Guide | Pain Tracker Pro',
  metaDescription: 'Learn exactly how to document chronic pain for disability claims. What adjusters look for, 6 mistakes that get claims denied, evidence pyramid, and free templates to build your case.',
  keywords: [
    'documenting pain for disability claim', 'pain diary for disability',
    'chronic pain disability evidence', 'pain journal disability benefits',
    'worksafebc pain documentation', 'disability claim pain records',
    'chronic pain evidence', 'pain documentation for insurance',
    'disability claim denied chronic pain', 'SSDI chronic pain evidence',
    'disability appeal pain documentation', 'functional capacity evidence',
    'long term disability pain', 'pain diary adjuster'
  ],
  badge: 'Essential Guide',
  headline: 'How to Document Pain for a Disability Claim',
  subheadline: 'Disability claims fail not because the pain isn\'t real — but because the documentation doesn\'t prove it. Here\'s exactly what adjusters look for, what mistakes get claims denied, and how to build evidence that stands up to scrutiny.',
  primaryCTA: { text: 'Get Free Documentation Templates', href: '/resources/pain-diary-template-pdf' },
  secondaryCTA: { text: 'Start Digital Tracking', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/disability-documentation-guide.pdf', downloadFileName: 'disability-documentation-guide.pdf' },
  whatIsThis: 'A comprehensive guide to building the evidence package that supports chronic pain disability claims — whether for WorkSafeBC, SSDI, long-term disability insurance, or veterans\' benefits. This isn\'t generic advice. It covers what adjusters actually weigh most heavily, the specific mistakes that trigger denials, how long to track before filing, and how to make your daily documentation align with medical records for a credible, consistent case. The free downloadable guide PDF walks you through the entire process step by step.',
  whoShouldUse: [
    'Anyone preparing to file a disability claim for chronic pain conditions',
    'People whose initial disability claim was denied and are preparing an appeal',
    'Patients building evidence before they need it (the strategically smart approach)',
    'Workers documenting pain for WorkSafeBC, WSIB, or other workers\' compensation',
    'Anyone whose doctor said "better documentation would help your case"',
    'Disability lawyers or advocates helping clients prepare evidence packages',
    'People with chronic pain who want to understand what their documentation is worth',
    'Anyone facing an Independent Medical Examination (IME) for a disability claim'
  ],
  howToUse: [
    { step: 1, title: 'Start tracking immediately — don\'t wait', description: 'Documentation that pre-dates your claim filing has no appearance of strategic bias. Start today, even if you\'re months from filing. Brief daily entries compound into powerful evidence.' },
    { step: 2, title: 'Document functional impact, not just pain numbers', description: 'Adjusters care about what you CAN\'T DO. "Couldn\'t load dishwasher." "Sat during kid\'s soccer game." "Needed help dressing." Each specific limitation is evidence. Pain ratings alone don\'t win claims.' },
    { step: 3, title: 'Include good days — they prove credibility', description: 'Counterintuitively, documenting better days strengthens your case. It shows honesty. "Today was a 3 — did laundry and walked to store" makes your 8/10 days unquestionable. Adjusters know pain fluctuates.' },
    { step: 4, title: 'Align diary with medical records', description: 'Your diary should corroborate — not contradict — what you tell your doctor. Before each appointment, review recent diary entries. Your doctor\'s notes + your diary = two sources confirming the same reality.' },
    { step: 5, title: 'Be consistent: 2 minutes daily beats 30 minutes weekly', description: 'Consistency is more important than detail. Brief daily entries for 90 days are vastly more persuasive than detailed entries for 2 weeks with gaps. Set a daily reminder and keep entries under 5 minutes.' }
  ],
  whyItMatters: 'About 65% of initial SSDI applications are denied, and chronic pain claims face even higher denial rates. The #1 reason: insufficient evidence. Medical records alone don\'t capture daily reality — you see your doctor for 15 minutes; a diary captures the other 23 hours and 45 minutes. Research on disability adjudication shows claims with systematic daily tracking are significantly more likely to be approved. Your documentation is not bureaucratic busywork — it\'s the difference between approval and denial.',
  trustSignals: {
    medicalNote: 'Aligns with pain management specialist recommendations for disability documentation and evidence-based approaches to disability evaluation.',
    privacyNote: 'Your disability documentation stays completely private. All data stays on your device. No insurer, employer, or adjuster can access it without your explicit consent.',
    legalNote: 'Structured to meet WorkSafeBC, SSDI, and long-term disability insurance documentation standards. Not legal advice — consult a disability attorney for your specific situation.'
  },
  faqs: [
    { question: 'When should I start documenting?', answer: 'Now. Today. The best time was when your pain began. The second best time is right now. Documentation that pre-dates your claim filing date is the most credible evidence available. Even if you\'re months from filing, every day of tracking strengthens your case.' },
    { question: 'What\'s the #1 documentation mistake?', answer: 'Constant 10/10 pain ratings. Adjusters see this and immediately doubt credibility — they know even severe pain fluctuates. A pattern of 6-7 baseline with 8-9 flares and occasional 4-5 days is far more persuasive than unrelenting maximum pain.' },
    { question: 'How long should I track before filing?', answer: 'Minimum 30 days. Ideal is 60-90 days. For appeals, continue through the entire process (often 6-12 months). Longer documentation histories directly correlate with higher approval rates.' },
    { question: 'Can my pain diary be used against me?', answer: 'Theoretically, inconsistencies could be questioned. But the risk of no documentation is far greater than the risk of honest documentation. A well-maintained diary showing realistic pain fluctuations — including good days — is overwhelmingly an asset, not a liability.' },
    { question: 'Do I need medical records too?', answer: 'Yes — diary + medical records together form the strongest evidence package. Medical records provide clinical authority. Your diary documents daily reality between appointments. Neither alone tells the complete story. Together, they\'re powerful.' },
    { question: 'What if my claim was already denied?', answer: 'Start tracking now for your appeal. Many denied claims succeed on appeal with better documentation. Your diary from this point forward demonstrates ongoing disability. Also review the denial letter — it tells you exactly what evidence was missing.' },
    { question: 'Should I rate pain numbers or describe activities?', answer: 'Both, but lean toward activities. "Pain 7/10, couldn\'t stand long enough to cook dinner, had to lie down after showering, asked spouse to drive me" is infinitely more persuasive than just "Pain 7/10."' },
    { question: 'What about tracking medications and side effects?', answer: 'Essential. Document everything you take, when, side effects, and whether it helps. Treatment compliance is a key factor in disability evaluation — and medication side effects themselves can contribute to functional limitations that support your claim.' },
    { question: 'Will the digital tracker or paper diary work better for claims?', answer: 'Either works. The key is consistency. Some people prefer paper because it feels more "authentic" to evaluators. Others prefer digital for the daily reminders and consistency features. Many use both — paper copies of digital reports can be compelling.' },
    { question: 'Should I hire a disability lawyer?', answer: 'We can\'t give legal advice, but the general guidance: if your initial claim is denied and pain is your primary condition, a disability attorney who specializes in chronic pain claims can significantly improve your appeal odds. Many work on contingency (no upfront cost).' }
  ],
  relatedLinks: [
    { title: 'Pain Journal for Disability Benefits', description: 'Specific journal format for benefit applications', href: '/resources/pain-journal-for-disability-benefits' },
    { title: 'Daily Functioning Log for Disability', description: 'Track functional limitations systematically', href: '/resources/daily-functioning-log-for-disability' },
    { title: 'WorkSafeBC Pain Journal Template', description: 'BC workplace injury claims', href: '/resources/worksafebc-pain-journal-template' },
    { title: 'Pain Diary Template PDF', description: 'Comprehensive daily tracking template', href: '/resources/pain-diary-template-pdf' },
    { title: 'How to Track Pain for Doctors', description: 'Align diary with medical records', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'Pain Diary for Specialist Appointment', description: 'Prepare for evaluations', href: '/resources/pain-diary-for-specialist-appointment' }
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Documenting Pain for Disability Claim', url: '/resources/documenting-pain-for-disability-claim' }
  ]
};

export const DocumentingPainForDisabilityClaimPage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={disabilityStats} colorScheme="emerald" />
    <EvidencePyramid />
    <DenialMistakes />
    <AdjusterChecklist />
    <DocumentationTimeline />
    <BottomCTACallout
      icon={MonitorSmartphone}
      heading="Building Your Evidence Package Starts With One Entry."
      body="Every day of tracking strengthens your case. Download the documentation guide PDF, print the daily templates, or start digital tracking — whichever you'll actually do consistently. Consistency wins claims."
      pdfUrl="/assets/disability-documentation-guide.pdf"
      gradientClasses="from-emerald-600 to-teal-600"
      tintClass="text-emerald-100"
      buttonTextClass="text-emerald-700"
      buttonHoverClass="hover:bg-emerald-50"
      primaryLabel="Download Guide PDF"
      secondaryLabel="Start Digital Tracking"
    />
  </SEOPageLayout>
);

export default DocumentingPainForDisabilityClaimPage;
