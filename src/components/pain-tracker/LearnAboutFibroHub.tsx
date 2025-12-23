import React from 'react';

export function LearnAboutFibroHub() {
  return (
    <section className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-xl shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Learn About Fibromyalgia</h2>
      <article className="mb-6">
        <h3 className="text-lg font-semibold mb-2">What is Fibromyalgia?</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Fibromyalgia is a chronic condition characterized by widespread pain, fatigue, sleep disturbances, and cognitive symptoms (often called "fibro fog"). It affects millions of people worldwide and can impact daily life, work, and relationships.
        </p>
      </article>
      <article className="mb-6">
        <h3 className="text-lg font-semibold mb-2">How Pain, Sleep, Mood, and Cognitive Symptoms Interact</h3>
        <ul className="list-disc pl-6 text-sm mb-2">
          <li>Pain can disrupt sleep, leading to more fatigue and worse pain.</li>
          <li>Poor sleep and pain can affect mood, increasing anxiety or depression.</li>
          <li>Cognitive symptoms ("fibro fog") are often worse with poor sleep or high pain.</li>
          <li>Managing one symptom (like sleep) can help improve others.</li>
        </ul>
      </article>
      <article className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Evidence-Based Treatments</h3>
        <ul className="list-disc pl-6 text-sm mb-2">
          <li><strong>Cognitive Behavioral Therapy (CBT):</strong> Helps manage pain, mood, and sleep.</li>
          <li><strong>Exercise:</strong> Gentle aerobic activity and stretching can reduce symptoms over time.</li>
          <li><strong>Medications:</strong> Some antidepressants, anticonvulsants, and pain relievers may help.</li>
          <li><strong>Self-management:</strong> Pacing, stress reduction, and sleep hygiene are key.</li>
        </ul>
      </article>
      <article className="mb-6">
        <h3 className="text-lg font-semibold mb-2">How to Talk to Doctors About Fibromyalgia</h3>
        <ul className="list-disc pl-6 text-sm mb-2">
          <li>Describe your symptoms clearly: pain locations, fatigue, sleep, mood, and cognitive issues.</li>
          <li>Bring a symptom diary or use this app's reports to show patterns.</li>
          <li>Ask about treatment options and what to expect.</li>
          <li>It's okay to seek a second opinion if you feel unheard.</li>
        </ul>
      </article>
      <p className="mt-4 text-xs text-muted-foreground">
        This information is for education only and does not replace medical advice. For more, see <a href="https://www.cdc.gov/arthritis/basics/fibromyalgia.htm" target="_blank" rel="noopener noreferrer" className="underline">CDC: Fibromyalgia</a> or <a href="https://www.niams.nih.gov/health-topics/fibromyalgia" target="_blank" rel="noopener noreferrer" className="underline">NIAMS: Fibromyalgia</a>.
      </p>
    </section>
  );
}
