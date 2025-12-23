import React, { useState } from 'react';
import { Button } from '../../design-system';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

const QUESTIONS = Array.from({ length: 9 }).map((_, i) => `Over the last 2 weeks, how often have you been bothered by problem #${i + 1}?`);

export default function PHQ9({ onClose }: { onClose?: () => void }) {
  const [answers, setAnswers] = useState<number[]>(Array(9).fill(0));
  const addMoodEntry = usePainTrackerStore(s => s.addMoodEntry);

  function setAnswer(idx: number, val: number) {
    setAnswers(a => {
      const copy = [...a];
      copy[idx] = val;
      return copy;
    });
  }

  function submit() {
    const score = answers.reduce((a, b) => a + b, 0);
    addMoodEntry({ mood: 'phq9', notes: `PHQ-9 score: ${score}` } as any);
    onClose?.();
  }

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">PHQ-9 screening</h3>
      <p className="text-sm text-muted-foreground">This is an optional, private screening to help you and your clinician understand mood trends. Results are stored locally.</p>
      <div className="space-y-2">
        {QUESTIONS.map((q, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="text-sm w-2/3">{q}</div>
            <select value={answers[i]} onChange={e => setAnswer(i, Number(e.target.value))} className="ml-auto">
              <option value={0}>Not at all</option>
              <option value={1}>Several days</option>
              <option value={2}>More than half the days</option>
              <option value={3}>Nearly every day</option>
            </select>
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={() => onClose?.()}>Cancel</Button>
        <Button onClick={submit}>Save</Button>
      </div>
    </div>
  );
}
