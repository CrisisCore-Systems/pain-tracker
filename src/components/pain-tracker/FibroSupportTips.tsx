import React from 'react';

export function FibroSupportTips() {
  return (
    <section className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Support & Tips for Living with Fibromyalgia</h2>
      <article className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Pacing Strategies (Activity Scheduling)</h3>
        <ul className="list-disc pl-6 text-sm mb-2">
          <li>Break tasks into smaller steps and rest between them.</li>
          <li>Use a daily planner to balance activity and rest.</li>
          <li>Track your energy and pain to spot patterns.</li>
          <li>Say no to non-essential activities when needed.</li>
        </ul>
      </article>
      <article className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Sleep Hygiene Tips</h3>
        <ul className="list-disc pl-6 text-sm mb-2">
          <li>Keep a regular sleep schedule—even on weekends.</li>
          <li>Avoid screens and caffeine before bed.</li>
          <li>Create a calming bedtime routine (e.g., reading, gentle music).</li>
          <li>Keep your bedroom cool, dark, and quiet.</li>
        </ul>
      </article>
      <article className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Stress Management</h3>
        <ul className="list-disc pl-6 text-sm mb-2">
          <li>Try guided breathing or meditation: <a href="https://www.calm.com/" target="_blank" rel="noopener noreferrer" className="underline">Calm</a>, <a href="https://www.headspace.com/" target="_blank" rel="noopener noreferrer" className="underline">Headspace</a></li>
          <li>Practice gentle movement (yoga, tai chi, stretching).</li>
          <li>Connect with supportive friends or groups.</li>
        </ul>
      </article>
      <article className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Community Resources</h3>
        <ul className="list-disc pl-6 text-sm mb-2">
          <li><a href="https://www.fmcpaware.org/" target="_blank" rel="noopener noreferrer" className="underline">National Fibromyalgia Association</a></li>
          <li><a href="https://www.ukfibromyalgia.com/" target="_blank" rel="noopener noreferrer" className="underline">UK Fibromyalgia</a></li>
          <li><a href="https://www.reddit.com/r/Fibromyalgia/" target="_blank" rel="noopener noreferrer" className="underline">Reddit: r/Fibromyalgia</a></li>
        </ul>
      </article>
      <p className="mt-4 text-xs text-muted-foreground">
        These tips are for support and education only. Always consult your healthcare provider for personalized advice.
      </p>
    </section>
  );
}
