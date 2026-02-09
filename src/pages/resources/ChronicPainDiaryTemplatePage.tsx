/**
 * Chronic Pain Diary Template – SEO Landing Page (Enhanced)
 *
 * Target keyword: "chronic pain diary template"
 * Tier 1 – Immediate Survival Traffic
 */

import React from 'react';
import {
  ArrowRight, CheckCircle, Clock, Calendar,
  TrendingUp, Activity, AlertTriangle, FileText,
  BarChart3, Flame, Thermometer, Shield
} from 'lucide-react';
import { SEOPageLayout, type SEOPageContent, StatsBanner, BottomCTACallout, PdfContentsPreview } from '../../components/seo';
import type { StatItem, PdfPage } from '../../components/seo';

/* ── Custom Visual Components ─────────────────────────────────────────────── */

/** Baseline vs Flare tracking comparison */
const BaselineVsFlare: React.FC = () => {
  const rows = [
    { aspect: 'Pain Level', baseline: '3-4/10 most days', flare: '7-9/10, sudden increase', track: 'Daily rating + mark flare days distinctly' },
    { aspect: 'Duration', baseline: 'Constant background', flare: 'Hours to days of escalation', track: 'Flare start/end time, total duration' },
    { aspect: 'Function', baseline: 'Modified but managing', flare: 'Unable to complete normal tasks', track: 'Specific function losses during flares' },
    { aspect: 'Triggers', baseline: 'Known, manageable', flare: 'May be identifiable in retrospect', track: 'What changed 24-48h before flare' },
    { aspect: 'Treatment', baseline: 'Maintenance routine', flare: 'Rescue medications / strategies', track: 'What you used and how it worked' },
  ];
  return (
    <div className="my-10 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 md:p-8 border border-violet-100">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Baseline Pain vs. Flare Pain — Track Them Differently</h3>
      <p className="text-sm text-slate-500 mb-6">Chronic pain has two modes. Your diary should capture both, because they tell your doctor different things.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-violet-200">
              <th className="py-2 pr-3 font-bold text-slate-700">Aspect</th>
              <th className="py-2 pr-3 font-semibold text-violet-600">Baseline</th>
              <th className="py-2 pr-3 font-semibold text-red-600">Flare</th>
              <th className="py-2 font-semibold text-slate-700">What to Track</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.aspect} className="border-b border-violet-100 last:border-none">
                <td className="py-2.5 pr-3 font-medium text-slate-800">{r.aspect}</td>
                <td className="py-2.5 pr-3 text-slate-600">{r.baseline}</td>
                <td className="py-2.5 pr-3 text-slate-600">{r.flare}</td>
                <td className="py-2.5 text-slate-500 text-xs">{r.track}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/** Long-term tracking cadences */
const TrackingCadence: React.FC = () => {
  const cadences = [
    { period: 'Daily', icon: Clock, color: 'bg-violet-100 text-violet-700 border-violet-200', items: ['Pain level (0-10)', 'Top 2-3 symptoms', 'Sleep quality', 'Medications taken', 'Function: what you could / couldn\'t do'] },
    { period: 'Weekly', icon: Calendar, color: 'bg-blue-100 text-blue-700 border-blue-200', items: ['Average pain this week vs last', 'Flare count and duration', 'Best day vs worst day', 'Treatment effectiveness review', 'Energy/activity pattern'] },
    { period: 'Monthly', icon: BarChart3, color: 'bg-emerald-100 text-emerald-700 border-emerald-200', items: ['Overall trend (improving/stable/worsening)', 'Flare frequency comparison', 'Medication changes and effects', 'New symptoms or symptom changes', 'Functional capacity assessment'] },
  ];
  return (
    <div className="my-10 grid grid-cols-1 md:grid-cols-3 gap-4">
      {cadences.map((c) => (
        <div key={c.period} className={`rounded-xl border p-5 ${c.color}`}>
          <div className="flex items-center gap-2 mb-3">
            <c.icon className="w-5 h-5" aria-hidden="true" />
            <h4 className="font-bold">{c.period} Tracking</h4>
          </div>
          <ul className="space-y-1.5">
            {c.items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-60" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

/** Flare trigger matrix */
const FlareTriggerMatrix: React.FC = () => {
  const triggers = [
    { category: 'Physical', icon: Activity, items: ['Over-exertion (boom-bust cycle)', 'Weather / barometric pressure drops', 'Poor sleep (< 5 hours)', 'Prolonged sitting or standing', 'New physical activity'] },
    { category: 'Emotional', icon: AlertTriangle, items: ['High stress periods', 'Conflict or emotional distress', 'Anticipatory anxiety', 'Grief or loss', 'Feeling dismissed or invalidated'] },
    { category: 'Medical', icon: Thermometer, items: ['Illness or infection', 'Missed medication dose', 'Medication side effects', 'Post-procedure flare', 'Hormonal cycle changes'] },
    { category: 'Environmental', icon: Flame, items: ['Temperature extremes', 'Travel / routine disruption', 'Dietary changes / reactions', 'Dehydration', 'Seasonal transitions'] },
  ];
  return (
    <div className="my-10">
      <h3 className="text-xl font-bold text-slate-800 mb-2">Common Flare Triggers to Track</h3>
      <p className="text-sm text-slate-500 mb-6">Most chronic pain flares have identifiable triggers — but only if you track them consistently. Check which categories apply to you.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {triggers.map((t) => (
          <div key={t.category} className="rounded-xl bg-white border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <t.icon className="w-5 h-5 text-violet-600" aria-hidden="true" />
              <h4 className="font-bold text-slate-800">{t.category} Triggers</h4>
            </div>
            <ul className="space-y-1.5">
              {t.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-300 flex-shrink-0 mt-1.5" />
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

const chronicPdfPages: PdfPage[] = [
  { page: 1, title: 'Chronic Pain Diary — Daily Tracking', desc: 'Date, pain level, symptom checklist, medication log, sleep quality' },
  { page: 2, title: 'Flare Documentation', desc: 'Flare start/end, severity peak, triggers identified, treatments used' },
  { page: 3, title: 'Functional Impact Log', desc: 'Daily activities, modifications needed, capacity rating (0-10)' },
  { page: 4, title: 'Treatment Response Tracker', desc: 'Medication/therapy, dosage, start date, effectiveness rating, side effects' },
  { page: 5, title: 'Weekly Summary', desc: 'Average pain, flare count, best/worst days, treatment notes' },
  { page: 6, title: 'Monthly Trend Review', desc: 'Month overview, pattern observations, questions for next appointment' },
];

const chronicPainStats: StatItem[] = [
  { value: '50M+', label: 'Adults with chronic pain in the US', icon: Shield },
  { value: '6 pg', label: 'Professional diary template', icon: FileText },
  { value: '3x', label: 'Tracking cadences (daily/weekly/monthly)', icon: TrendingUp },
  { value: '20+', label: 'Common flare triggers covered', icon: Flame },
];

/* ── Page Content ─────────────────────────────────────────────────────────── */

const pageContent: SEOPageContent = {
  slug: 'chronic-pain-diary-template',
  title: 'Chronic Pain Diary Template (Free)',
  metaTitle: 'Chronic Pain Diary Template — Free Long-Term Pain Tracker for Flares, Baseline & Trends | Pain Tracker Pro',
  metaDescription: 'Download a free 6-page chronic pain diary template with baseline/flare tracking, trigger identification, treatment logs, and monthly trend reviews for long-term pain management.',
  keywords: [
    'chronic pain diary template', 'chronic pain tracker template',
    'long term pain diary', 'persistent pain log',
    'chronic pain journal template', 'ongoing pain tracker',
    'chronic illness pain diary', 'pain management diary',
    'flare tracking template', 'baseline pain tracker',
    'chronic pain flare log', 'pain diary for chronic conditions',
    'long-term pain management log', 'daily chronic pain log'
  ],
  badge: 'Free Download',
  headline: 'Chronic Pain Diary Template',
  subheadline: 'Chronic pain isn\'t one bad day — it\'s a pattern of baseline pain, flares, partial recoveries, and slow shifts. This 6-page diary template tracks all of it: daily symptoms, flare episodes, treatment responses, and monthly trends that reveal whether things are actually improving.',
  primaryCTA: { text: 'Download Free PDF', href: '/assets/chronic-pain-diary-template.pdf', download: true },
  secondaryCTA: { text: 'Try Digital Version', href: '/start' },
  utilityBlock: { type: 'download', downloadUrl: '/assets/chronic-pain-diary-template.pdf', downloadFileName: 'chronic-pain-diary-template.pdf' },
  whatIsThis: 'A 6-page chronic pain diary template built specifically for the unique challenge of long-term pain tracking. Unlike generic pain diaries, this template distinguishes between baseline pain and flare episodes, tracks treatment responses over time, identifies flare triggers across physical, emotional, medical, and environmental categories, and provides weekly and monthly summary pages that reveal trends your daily experience can\'t. It\'s designed for people who\'ve been living with pain for months or years and need documentation that captures the full picture.',
  whoShouldUse: [
    'Anyone living with chronic pain lasting more than 3 months',
    'People managing conditions like fibromyalgia, arthritis, back pain, or neuropathy',
    'Patients tracking treatment effectiveness over weeks or months',
    'People who experience pain flares and need to identify triggers',
    'Anyone whose doctor has asked them to keep a pain diary',
    'People managing multiple pain conditions simultaneously',
    'Patients preparing for specialist appointments or disability documentation',
    'Anyone who wants to see whether their pain is actually improving, worsening, or stable'
  ],
  howToUse: [
    { step: 1, title: 'Start with daily tracking — just 2 minutes', description: 'Each day, record your pain level (0-10), top symptoms, medication taken, and sleep quality. On flare days, use the flare documentation page instead. Consistency matters more than detail.' },
    { step: 2, title: 'Mark flare days distinctly', description: 'When pain spikes above your baseline, switch to the flare documentation page. Record the peak severity, potential trigger, what you tried, and how long it lasted. This data reveals your flare pattern over time.' },
    { step: 3, title: 'Do the weekly summary (5 minutes)', description: 'At the end of each week, note your average pain, flare count, best/worst days, and any treatment observations. This is where patterns start becoming visible.' },
    { step: 4, title: 'Monthly trend review (10 minutes)', description: 'Once a month, review your weekly summaries. Is your average pain creeping up or down? Are flares more or less frequent? Is a treatment helping? This is what you bring to your doctor.' },
    { step: 5, title: 'Bring weekly + monthly summaries to appointments', description: 'Your doctor doesn\'t need to read every daily entry. They need your trend data: "My average pain was 5.2 this month vs 4.1 last month, with 3 flares triggered by weather changes." That\'s actionable.' }
  ],
  whyItMatters: 'Chronic pain changes slowly — so slowly that you can\'t feel the change. You accommodate. You forget what last month was actually like. Without tracking, you tell your doctor "about the same" when the data might show a 20% improvement from a medication change. Or you say "fine" when you\'ve actually had 40% more flare days. A chronic pain diary replaces memory (which is unreliable) with data (which isn\'t). It also reveals trigger patterns you can\'t see in real-time: the flare that always follows a bad sleep night, the improvement that correlates with exercise days.',
  trustSignals: {
    medicalNote: 'Template structure aligned with chronic pain assessment frameworks used in pain clinics and rheumatology practices. Includes both NRS (0-10) and functional impact measures.',
    privacyNote: 'Your pain data stays completely private on your device. Nothing is uploaded, shared, or accessible to anyone but you.',
    legalNote: 'Long-term chronic pain tracking creates a documented medical history that supports disability claims, treatment authorization requests, and specialist referrals.'
  },
  faqs: [
    { question: 'How is this different from a regular pain diary?', answer: 'Regular pain diaries track daily pain levels. This chronic pain template adds: 1) Baseline vs. flare distinction, 2) Flare-specific documentation with trigger tracking, 3) Treatment response tracking over time, 4) Weekly and monthly trend summaries. It\'s designed for pain that lasts months or years, not a one-time episode.' },
    { question: 'I\'ve been in pain for years — is it too late to start tracking?', answer: 'Not at all. Start from today. After just 2-4 weeks, you\'ll have more structured data than years of "I\'ve had pain for a long time." Your doctor needs current trends, not a complete historical record.' },
    { question: 'How do I know what my baseline is?', answer: 'Track daily for 2 weeks without any changes to your routine. Your average pain level during stable (non-flare) periods is your baseline. It\'s usually the level you consider "normal for me" — the background pain that\'s always there.' },
    { question: 'What counts as a flare?', answer: 'A flare is a significant worsening beyond your baseline. If your baseline is 3-4/10 and you spike to 7+, that\'s a flare. If your baseline is 6/10 and you spike to 9, that\'s a flare. The threshold is personal — it\'s when pain disrupts your usual (already limited) function.' },
    { question: 'The weekly summary seems like extra work. Is it worth it?', answer: 'It\'s the most valuable 5 minutes of your tracking. Daily entries capture trees; weekly summaries show the forest. After a month, you can see trends that are invisible day-to-day. Doctors specifically value this summary level of data.' },
    { question: 'Can I use this alongside digital tracking?', answer: 'Absolutely. Many people use the printable template as a backup or for appointment days, while using Pain Tracker Pro digitally for daily tracking with automatic trend analysis.' },
    { question: 'How long should I maintain a chronic pain diary?', answer: 'Indefinitely, but with decreasing effort. Once you know your patterns (usually 2-3 months), you can shift to a shorter daily entry and focus on flare documentation and monthly summaries. The tracking becomes second nature.' },
    { question: 'My pain doesn\'t have clear flares — it\'s constant. Does this template still work?', answer: 'Yes. For constant pain, you\'ll use the daily tracking and weekly summary pages most. Track variation within your constant pain: is it 4/10 on some days and 6/10 on others? That variation has patterns worth documenting.' },
    { question: 'Should I track things other than pain?', answer: 'The template includes sleep, function, and medication tracking because they directly influence pain outcomes. Fatigue, mood, and activity levels are also valuable. Track what\'s manageable — consistency beats comprehensiveness.' },
    { question: 'How do I talk to my doctor about what I\'ve tracked?', answer: 'Lead with trends, not raw data. "Over the past month, my average pain decreased from 6 to 4.5 after starting [medication]" or "I\'m having 2-3 flares per week, mostly triggered by [trigger]." The monthly summary page is designed to produce exactly these statements.' }
  ],
  relatedLinks: [
    { title: 'Pain Diary Template PDF', description: 'Our premium daily tracking template', href: '/resources/pain-diary-template-pdf' },
    { title: 'Weekly Pain Log PDF', description: '7-day at-a-glance tracking', href: '/resources/weekly-pain-log-pdf' },
    { title: 'Fibromyalgia Pain Diary', description: 'Fibromyalgia-specific tracking', href: '/resources/fibromyalgia-pain-diary' },
    { title: 'How to Track Pain for Doctors', description: 'Doctor communication guide', href: '/resources/how-to-track-pain-for-doctors' },
    { title: 'What to Include in Pain Journal', description: 'Complete content guide', href: '/resources/what-to-include-in-pain-journal' },
    { title: '7-Day Pain Diary', description: 'Short-term trial diary', href: '/resources/7-day-pain-diary-template' },
  ],
  breadcrumbs: [
    { name: 'Home', url: '/' },
    { name: 'Resources', url: '/resources' },
    { name: 'Chronic Pain Diary Template', url: '/resources/chronic-pain-diary-template' }
  ]
};

export const ChronicPainDiaryTemplatePage: React.FC = () => (
  <SEOPageLayout content={pageContent}>
    <StatsBanner stats={chronicPainStats} colorScheme="violet" />
    <BaselineVsFlare />
    <TrackingCadence />
    <FlareTriggerMatrix />
    <PdfContentsPreview pages={chronicPdfPages} accentColor="violet" variant="badge" heading="What's in Your 6-Page Chronic Pain Diary" subtitle="Every page designed for the unique needs of long-term chronic pain tracking." />
    <BottomCTACallout
      icon={TrendingUp}
      heading="Chronic Pain Changes Slowly. Your Diary Catches What You Can't Feel."
      body="After a few weeks of tracking, you'll have evidence your doctor can act on — not just 'it hurts' but exactly how, when, and what makes it worse or better."
      pdfUrl="/assets/chronic-pain-diary-template.pdf"
      gradientClasses="from-violet-600 to-purple-600"
      tintClass="text-violet-100"
      buttonTextClass="text-violet-700"
      buttonHoverClass="hover:bg-violet-50"
      primaryLabel="Download Template"
    />
  </SEOPageLayout>
);

export default ChronicPainDiaryTemplatePage;
