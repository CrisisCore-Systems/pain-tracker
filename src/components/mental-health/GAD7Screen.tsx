import React, { useState } from 'react';

export interface GAD7Response {
  answers: number[]; // 0-3 per item
}

const GAD7_QUESTIONS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid as if something awful might happen',
];

const GAD7_CHOICES = [
  { label: 'Not at all', value: 0 },
  { label: 'Several days', value: 1 },
  { label: 'More than half the days', value: 2 },
  { label: 'Nearly every day', value: 3 },
];

export function GAD7Screen({ onComplete }: { onComplete: (result: GAD7Response) => void }) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(7).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (qIdx: number, value: number) => {
    setAnswers(prev => prev.map((a, i) => (i === qIdx ? value : a)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (answers.every(a => a !== null)) {
      onComplete({ answers: answers as number[] });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="GAD-7 Anxiety Screening">
      <h3 className="text-lg font-semibold">GAD-7 Anxiety Screening</h3>
      <p className="text-sm text-muted-foreground mb-2">Over the last 2 weeks, how often have you been bothered by any of the following problems?</p>
      {GAD7_QUESTIONS.map((q, idx) => (
        <div key={idx} className="space-y-2">
          <label className="block font-medium" htmlFor={`gad7-q${idx}`}>{idx + 1}. {q}</label>
          <div className="flex gap-4">
            {GAD7_CHOICES.map(choice => (
              <label key={choice.value} className="flex items-center gap-1">
                <input
                  type="radio"
                  id={`gad7-q${idx}-opt${choice.value}`}
                  name={`gad7-q${idx}`}
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
  );
}
