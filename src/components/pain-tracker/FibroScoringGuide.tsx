import React from 'react';

export function FibroScoringGuide() {
  return (
    <section className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-xl shadow-md mt-8">
      <h2 className="text-xl font-bold mb-2">Fibromyalgia Diagnostic Criteria (ACR 2016)</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        The American College of Rheumatology (ACR) 2016 criteria use two scores:
      </p>
      <ul className="mb-4 list-disc pl-6 text-sm">
        <li><strong>Widespread Pain Index (WPI):</strong> Number of painful body regions (0–19)</li>
        <li><strong>Symptom Severity Scale (SSS):</strong> Fatigue, sleep, cognitive symptoms, and other somatic symptoms (0–12)</li>
      </ul>
      <div className="mb-4 text-sm">
        <strong>Interpretation:</strong>
        <ul className="list-disc pl-6 mt-2">
          <li>Fibromyalgia is likely if: <br />
            <span className="font-mono">WPI ≥ 7 and SSS ≥ 5</span> <br />
            <span className="font-mono">OR</span> <br />
            <span className="font-mono">WPI 4–6 and SSS ≥ 9</span>
          </li>
          <li>Symptoms must be present at a similar level for at least 3 months.</li>
          <li>Diagnosis should be made by a healthcare professional.</li>
        </ul>
      </div>
      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded mt-4 text-xs text-blue-900 dark:text-blue-200">
        <strong>Example:</strong> <br />
        <span className="font-mono">WPI 7, SSS 5</span> = Meets criteria for fibromyalgia.<br />
        <span className="font-mono">WPI 5, SSS 10</span> = Meets criteria for fibromyalgia.<br />
        <span className="font-mono">WPI 3, SSS 8</span> = Does <span className="text-red-600">not</span> meet criteria.
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        This guide is for informational purposes only and does not replace medical advice.
      </p>
    </section>
  );
}
