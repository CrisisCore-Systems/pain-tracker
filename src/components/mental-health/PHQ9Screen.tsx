import React, { useState } from 'react';

export interface PHQ9Response {
  answers: number[]; // 0-3 per item
}

const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading or watching television',
  'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead or of hurting yourself in some way',
];

const PHQ9_CHOICES = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
];


export function PHQ9Screen({ onComplete }: { onComplete: (result: PHQ9Response) => void }) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(9).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);

  const handleChange = (qIdx: number, value: number) => {
    setAnswers(prev => prev.map((a, i) => (i === qIdx ? value : a)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (answers.every(a => a !== null)) {
      // If item 9 (suicidal ideation) is > 0, trigger crisis protocol
      if ((answers[8] ?? 0) > 0) {
        setShowCrisis(true);
        return;
      }
      onComplete({ answers: answers as number[] });
    }
  };

  return (
    <>
      {showCrisis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl p-6 max-w-md w-full text-center">
            <h3 className="text-lg font-bold text-red-600 mb-2">You matter. Support is available.</h3>
            <p className="mb-4 text-sm text-foreground">Your response suggests you may be struggling with thoughts of self-harm. You are not alone, and help is available—even if it feels hard to reach out.</p>
            <div className="mb-4 space-y-2 text-left">
              <div><strong>Crisis Lines (24/7):</strong></div>
              <div><a href="tel:988" className="text-blue-600 underline">988 Suicide & Crisis Lifeline</a></div>
              <div><a href="https://www.crisisservicescanada.ca/en/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Canada: 1-833-456-4566</a></div>
              <div><a href="https://www.samaritans.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">UK: 116 123 (Samaritans)</a></div>
              <div><a href="https://findahelpline.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Find a Helpline (global)</a></div>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">This app cannot provide emergency help. If you are in immediate danger, please call emergency services or a trusted person.</p>
            <button
              className="mt-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold"
              onClick={() => { setShowCrisis(false); onComplete({ answers: answers as number[] }); }}
            >
              Return to app
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6" aria-label="PHQ-9 Depression Screening">
        <h3 className="text-lg font-semibold">PHQ-9 Depression Screening</h3>
        <p className="text-sm text-muted-foreground mb-2">Over the last 2 weeks, how often have you been bothered by any of the following problems?</p>
        {PHQ9_QUESTIONS.map((q, idx) => (
          <div key={idx} className="space-y-2">
            <label className="block font-medium" htmlFor={`phq9-q${idx}`}>{idx + 1}. {q}</label>
            <div className="flex gap-4">
              {PHQ9_CHOICES.map(choice => (
                <label key={choice.value} className="flex items-center gap-1">
                  <input
                    type="radio"
                    id={`phq9-q${idx}-opt${choice.value}`}
                    name={`phq9-q${idx}`}
                    value={choice.value}
                    checked={answers[idx] === choice.value}
                    onChange={() => handleChange(idx, choice.value)}
                    required
                  />
                  <span>{choice.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        {submitted && answers.some(a => a === null) && (
          <div className="text-red-500 text-sm">Please answer all questions.</div>
        )}
        <button type="submit" className="mt-4 px-4 py-2 rounded bg-blue-600 text-white font-semibold">Submit</button>
      </form>
    </>
  );
}
