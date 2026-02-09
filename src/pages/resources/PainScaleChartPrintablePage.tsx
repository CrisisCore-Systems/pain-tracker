/**
 * Pain Scale Chart Printable – SEO Landing Page (Enhanced)
 *
 * Target keyword: "pain scale chart printable"
 * Pain Scale Chart / Reference
 */

import React from 'react';
import {
  ArrowRight, CheckCircle, Smile, Frown,
  FileText, TrendingUp, Activity, Users,
  AlertCircle, Star, Gauge, BrainCircuit
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** Interactive NRS 0-10 visual scale */
const PainScaleVisual: React.FC = () => {
  const levels = [
    { num: 0, label: 'No Pain', desc: 'Completely pain-free', color: 'bg-green-400', face: '😊', func: 'Full normal function' },
    { num: 1, label: 'Minimal', desc: 'Barely noticeable', color: 'bg-green-300', face: '🙂', func: 'Normal activity, easily ignored' },
    { num: 2, label: 'Mild', desc: 'Present but ignorable', color: 'bg-lime-300', face: '🙂', func: 'Normal activity with mild awareness' },
    { num: 3, label: 'Uncomfortable', desc: 'Noticeable, distracting', color: 'bg-yellow-300', face: '😐', func: 'Can focus with effort' },
    { num: 4, label: 'Moderate', desc: 'Can be ignored with effort', color: 'bg-yellow-400', face: '😐', func: 'Some activities modified' },
    { num: 5, label: 'Moderately Strong', desc: 'Can\'t be ignored for long', color: 'bg-amber-400', face: '😟', func: 'Many activities affected' },
    { num: 6, label: 'Strong', desc: 'Dominates awareness', color: 'bg-orange-400', face: '😟', func: 'Difficulty concentrating on tasks' },
    { num: 7, label: 'Severe', desc: 'Interferes with everything', color: 'bg-orange-500', face: '😣', func: 'Unable to perform usual activities' },
    { num: 8, label: 'Intense', desc: 'Hard to do anything', color: 'bg-red-400', face: '😣', func: 'Only basic self-care possible' },
    { num: 9, label: 'Excruciating', desc: 'Crying out or tears', color: 'bg-red-500', face: '😖', func: 'Bedbound, can\'t converse normally' },
    { num: 10, label: 'Worst Possible', desc: 'Worst pain imaginable', color: 'bg-red-700 text-white', face: '😭', func: 'Unable to move, speak, or think' },
  ];
  return (
    <div className="my-10 bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-6 md:p-8 border border-slate-200">
      <h3 className="text-xl font-bold text-slate-800 mb-2">The 0-10 Numeric Rating Scale (NRS)</h3>
      <p className="text-sm text-slate-500 mb-6">The most widely used clinical pain scale. Use the same anchors every time you rate your pain — consistency is what makes tracking useful.</p>
      <div className="space-y-1.5">
        {levels.map((l) => (
          <div key={l.num} className="flex items-center gap-2 sm:gap-3 rounded-lg p-2 hover:bg-white transition-colors">
            <span className={`flex-shrink-0 w-9 h-9 rounded-lg ${l.color} flex items-center justify-center text-sm font-bold`}>
              {l.num}
            </span>
            <span className="text-lg flex-shrink-0" role="img" aria-label={l.label}>{l.face}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-800 text-sm">{l.label}</span>
                <span className="text-xs text-slate-500">{l.desc}</span>
              </div>
              <div className="text-xs text-slate-400">{l.func}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** How to rate consistently */
const ConsistencyGuide: React.FC = () => {
  const tips = [
    { icon: Gauge, title: 'Use Function, Not Just Feeling', desc: 'Pain is subjective. Anchoring to function makes ratings consistent: "Could I work?" "Could I cook?" "Could I drive?" Match the number to what you can actually do, not just how it feels.', color: 'text-blue-600' },
    { icon: Activity, title: 'Rate at the Same Time Daily', desc: 'Pain fluctuates throughout the day. Rating at the same time (e.g., 8 AM and 8 PM) produces comparable data. Morning ratings capture baseline; evening captures daily impact.', color: 'text-emerald-600' },
    { icon: BrainCircuit, title: 'Rate Current Pain, Not Remembered Pain', desc: 'Memory distorts pain. Rate what you feel RIGHT NOW, not what you felt this morning. If you need to capture earlier pain, note the time alongside the rating.', color: 'text-purple-600' },
    { icon: Star, title: 'Establish Your Personal Anchors', desc: 'Your 5/10 should always mean the same thing to you. Write down what each level feels like (e.g., "My 7 = can\'t focus at work, need to lie down"). Reference this every time you rate.', color: 'text-amber-600' },
  ];
  return (
    <div className="my-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {tips.map((t) => (
        <div key={t.title} className="rounded-xl border border-slate-200 bg-white p-5">
          <t.icon className={`w-6 h-6 mb-3 ${t.color}`} aria-hidden="true" />
          <h4 className="font-bold text-slate-800 mb-1">{t.title}</h4>
          <p className="text-sm text-slate-600">{t.desc}</p>
        </div>
      ))}
    </div>
  );
};

/** Common rating mistakes */
const RatingMistakes: React.FC = () => {
  const mistakes = [
    { wrong: 'Always rating 7-8/10 every day', why: 'If pain never varies, the rating isn\'t capturing enough. Even chronic pain fluctuates.', fix: 'Track at specific times (AM/PM) and note what your 5, 6, 7, and 8 actually feel like differently.' },
    { wrong: 'Saying "10" for a bad flare', why: '10/10 = worst pain imaginable, unable to speak or think. Most flares are 7-9. Reserving 10 preserves the scale\'s usefulness.', fix: 'Use your personal anchors. If you can still talk, it\'s probably not 10.' },
    { wrong: 'Rating based on how frustrated you are', why: 'Frustration and pain are correlated but different. A frustrating 4/10 day isn\'t the same as an 8/10 day.', fix: 'Rate pain by function first ("what could I do?"), then note frustration separately.' },
    { wrong: 'Comparing your pain to others\'', why: '"Other people have it worse" artificially deflates your ratings. Your scale is for YOUR pain.', fix: 'Anchor to your own function levels. Your 6/10 is valid regardless of anyone else\'s experience.' },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Stop Making These 4 Rating Mistakes</h3>
      <p className="text-sm text-slate-500 mb-6">Inconsistent ratings make your pain data less useful to your doctor. Here are the most common mistakes and how to fix them.</p>
      <div className="space-y-3">
        {mistakes.map((m, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{m.wrong}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{m.why}</p>
                <div className="flex items-start gap-1.5 mt-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-xs text-emerald-700 font-medium">{m.fix}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Other pain scales overview */
const OtherScales: React.FC = () => {
  const scales = [
    { name: 'NRS (0-10)', use: 'Most common clinical scale, used in this chart', best: 'Daily tracking, research, quick communication', icon: '🔢' },
    { name: 'VAS (Visual Analog)', use: '100mm line you mark on', best: 'Research settings, very precise measurement', icon: '📏' },
    { name: 'Wong-Baker Faces', use: 'Cartoon faces from smiling to crying', best: 'Children, cognitive impairment, language barriers', icon: '😊' },
    { name: 'BPI (Brief Pain Inventory)', use: 'Multi-question measure combining intensity + interference', best: 'Comprehensive assessment, clinical trials', icon: '📋' },
    { name: 'FLACC (0-10)', use: 'Face, Legs, Activity, Cry, Consolability', best: 'Infants / non-verbal patients', icon: '👶' },
    { name: 'McGill Questionnaire', use: 'Descriptive word selection (sensory, affective)', best: 'Pain quality assessment, diagnostic context', icon: '📝' },
  ];
  return (
    <div className="my-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 border border-blue-100">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Other Pain Assessment Tools</h3>
      <p className="text-sm text-slate-500 mb-6">The 0-10 NRS isn't the only pain scale. Here's when each is most appropriate.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {scales.map((s) => (
          <div key={s.name} className="rounded-lg bg-white border border-slate-200 p-4">
            <div className="text-xl mb-2">{s.icon}</div>
            <h4 className="font-bold text-slate-800 text-sm">{s.name}</h4>
            <p className="text-xs text-slate-600 mt-1">{s.use}</p>
            <p className="text-xs text-slate-400 mt-1">Best for: {s.best}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Stats */
const PainScaleStats: React.FC = () => {
  const stats = [
    { value: '0-10', label: 'Numeric Rating Scale (NRS)', icon: Gauge },
    { value: '11', label: 'Defined levels with anchors', icon: TrendingUp },
    { value: '#1', label: 'Most used clinical pain scale worldwide', icon: Users },
    { value: '6', label: 'Pain assessment tools compared', icon: FileText },
  ];
  return (
    <div className="my-10 grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="text-center p-4 rounded-xl bg-blue-50 border border-blue-100">
          <s.icon className="w-5 h-5 mx-auto mb-2 text-blue-600" aria-hidden="true" />
          <div className="text-2xl font-bold text-blue-700">{s.value}</div>
          <div className="text-xs text-slate-500 mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
};

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'pain-scale-chart-printable',
  title: 'Pain Scale Chart Printable (Free)',
  metaTitle: 'Pain Scale Chart Printable — Free 0-10 NRS With Functional Anchors, Faces & Guide | Pain Tracker Pro',
  metaDescription: 'Download a free printable pain scale chart. Visual 0-10 NRS with functional descriptors, faces, color coding, common rating mistakes, and consistency tips for accurate pain tracking.',
  keywords: [
    'pain scale chart printable', 'pain scale 1-10',
    'pain rating scale', 'NRS pain scale',
    'numeric rating scale pain', 'pain level chart',
    'pain scale faces', 'visual pain scale',
    'pain intensity scale', 'pain assessment chart',
    'printable pain scale', 'pain chart for doctors',
    'pain scale reference card', 'pain scale poster'
  ],
  badge: 'Free Download',
  headline: 'Pain Scale Chart Printable',
  subheadline: 'A clear, visual 0-10 Numeric Rating Scale (NRS) with functional descriptors, face expressions, and color coding — plus a consistency guide that makes every rating meaningful. Print it, keep it with your pain diary, and rate your pain the same way every time.',
  primaryCTA: { text: 'Download Free PDF', href: '/assets/pain-scale-chart.pdf', download: true },
  secondaryCTA: { text: 'Try Digital Tracking', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/pain-scale-chart.pdf', downloadFileName: 'pain-scale-chart.pdf' },
  whatIsThis: 'A comprehensive printable pain scale reference that goes beyond a simple 0-10 chart. Each level includes: a numeric rating, a word descriptor, a functional impact description, and a face expression — giving you four ways to anchor your pain rating consistently. The guide also covers how to rate pain accurately, the four most common rating mistakes, tips for consistent tracking, and an overview of six different pain assessment tools so you understand what your doctor might use and why.',
  whoShouldUse: [
    'Anyone who rates their pain on the 0-10 scale and wants to do it consistently',
    'Patients keeping a pain diary who need a reference card',
    'People who\'ve been told "rate your pain from 0 to 10" but aren\'t sure what the numbers mean',
    'Healthcare providers who want a patient-friendly reference to share',
    'People preparing for medical appointments where they\'ll report pain levels',
    'Pain tracking beginners who want to understand the standard scale',
    'Caregivers helping someone else report their pain',
    'Anyone who suspects they\'re inconsistently rating their pain'
  ],
  howToUse: [
    { step: 1, title: 'Print and keep with your pain diary', description: 'Print the pain scale chart and keep it wherever you track pain — with your paper diary, on your fridge, or at your bedside. Refer to it every time you rate.' },
    { step: 2, title: 'Establish your personal anchors', description: 'Read through the functional descriptors. Identify what YOUR 3/10, 5/10, 7/10, and 9/10 feel like specifically. Write a brief note for each. These become your personal anchors.' },
    { step: 3, title: 'Rate by function first, feeling second', description: 'Instead of asking "how much does it hurt?", ask "what can I do right now?" Match your function level to the chart, then verify the descriptor feels right.' },
    { step: 4, title: 'Check for common mistakes', description: 'Review the four common rating mistakes. If you always rate 7-8, or you use 10 for bad flares, the chart shows you how to recalibrate.' },
    { step: 5, title: 'Stay consistent — your doctor compares over time', description: 'The value of your pain rating is in the comparison: this month vs last month, pre-treatment vs post-treatment. Consistent rating methodology makes these comparisons meaningful.' }
  ],
  whyItMatters: 'Your pain rating is one of the most important data points in your medical record — and one of the most unreliable. "Rate your pain from 0 to 10" sounds simple, but without anchors, your 5 today might be your 7 tomorrow. This doesn\'t mean your pain changed; it means your rating is inconsistent, and your doctor can\'t trust it to track trends. A pain scale chart with functional descriptors solves this: instead of rating by feeling alone, you anchor to what you can actually do at each level. That makes your ratings comparable over time — which is what doctors actually need.',
  trustSignals: {
    medicalNote: 'NRS (0-10) is the most widely validated clinical pain assessment tool, recommended by the Initiative on Methods, Measurement, and Pain Assessment in Clinical Trials (IMMPACT).',
    privacyNote: 'This is a reference chart — no data collection involved. Print it and use it privately.',
    legalNote: 'Consistent, anchored pain ratings supported by a reference scale create stronger documentation for disability claims and medical-legal proceedings.'
  },
  faqs: [
    { question: 'Why not just use faces instead of numbers?', answer: 'The Wong-Baker Faces Scale is validated for children and some adults, but numbers allow more precision and are standard in clinical research and medical records. Our chart includes both faces AND numbers so you can use whichever resonates.' },
    { question: 'Should I rate my average pain or my worst pain?', answer: 'Rate your current pain unless your doctor asks otherwise. If tracking daily, rate at the same time each day for consistency. You can note both average and worst if your diary has space.' },
    { question: 'My pain never goes below 3/10. Is that normal?', answer: 'For chronic pain, yes. Many people with chronic conditions have a baseline of 2-4/10. What matters is the variation: is it 3 on good days and 7 on bad days? That range is clinically useful.' },
    { question: 'What if my pain is between two numbers?', answer: 'Use half points (e.g., 5.5/10) if your tracking tool supports it. Otherwise, round to the nearest whole number and stay consistent with whether you round up or down.' },
    { question: 'Do doctors actually look at pain ratings?', answer: 'Yes — pain ratings are part of your vital signs in many healthcare systems. Doctors look at: trends over time, response to treatment, and whether your self-reported pain matches your functional assessment. Consistent ratings make all of these more useful.' },
    { question: 'Is 10/10 reserved for the worst pain ever experienced?', answer: '10/10 means "the worst pain imaginable" — it\'s a theoretical maximum, not necessarily your personal worst. Most clinical guidelines suggest 10 should be rare and indicate inability to speak, move, or think. Reserve it accordingly.' },
    { question: 'How do I explain my pain scale to a new doctor?', answer: 'Say: "I use the 0-10 NRS with functional anchors. My baseline is [X]/10, a moderate day is [Y], and a flare reaches [Z]. I rate based on what I can functionally do, not just how it feels." This immediately tells your doctor your ratings are reliable.' },
    { question: 'Are pain scales culturally biased?', answer: 'Yes — cultural norms affect pain expression. Some cultures encourage stoicism (leading to underreporting) while others encourage expression (which some providers misinterpret). Anchoring to function rather than expression reduces this bias.' },
    { question: 'Can I use this for different types of pain?', answer: 'Yes, but consider rating each pain type separately if they\'re distinct (e.g., back pain 5/10, headache 3/10). Your doctor needs to know which pain you\'re rating, especially if you have multiple pain conditions.' },
    { question: 'My doctor uses a different pain scale. What should I do?', answer: 'Use whatever scale your doctor prefers during appointments — but keep your daily tracking on the 0-10 NRS for consistency. You can translate between scales (VAS 50mm ≈ NRS 5/10) for cross-referencing.' }
  ],
  relatedLinks: [
    { title: 'Pain Diary Template PDF', description: 'Comprehensive daily tracking template', href: '/resources/pain-diary-template-pdf' },
    { title: 'Printable Pain Log Sheet', description: 'Simple daily tracking sheet', href: '/resources/printable-pain-log-sheet' },
    { title: 'What to Include in Pain Journal', description: 'Complete content guide', href: '/resources/what-to-include-in-pain-journal' },
    { title: 'How to Track Pain for Doctors', description: 'Communication guide', href: '/resources/how-to-track-pain-for-doctors' },
    { title: '7-Day Pain Diary', description: 'One-week tracking format', href: '/resources/7-day-pain-diary-template' },
    { title: 'Symptom Tracker Printable', description: 'Track all symptom types', href: '/resources/symptom-tracker-printable' },
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Pain Scale Chart Printable', url: '/resources/pain-scale-chart-printable' }
  ]
};

export const PainScaleChartPrintablePage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <PainScaleStats />
    <PainScaleVisual />
    <ConsistencyGuide />
    <RatingMistakes />
    <OtherScales />
    <div className="my-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white">
      <div className="flex items-start gap-4">
        <Gauge className="w-8 h-8 flex-shrink-0 opacity-80" aria-hidden="true" />
        <div>
          <h3 className="text-lg font-bold mb-2">Rate Your Pain the Same Way Every Time. That's What Makes Data Useful.</h3>
          <p className="text-blue-100 text-sm leading-relaxed mb-4">
            Print this chart, establish your personal anchors, and reference it every time you rate. 
            Your consistency turns pain numbers into medical evidence your doctor can trust.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/assets/pain-scale-chart.pdf" download className="inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors">
              Download Pain Scale Chart <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/start" className="inline-flex items-center gap-2 border border-white/30 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-white/10 transition-colors">
              Start Digital Tracking
            </a>
          </div>
        </div>
      </div>
    </div>
  </SEOPageLayout>
);

export default PainScaleChartPrintablePage;
