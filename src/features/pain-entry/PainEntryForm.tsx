import React from 'react';
import { Input } from '../../design-system/Input';
import { Button } from '../../design-system/components/Button';
import { AccessibilityAnnouncer } from '../../design-system/components/AccessibilityAnnouncer';

export const PainEntryForm: React.FC = () => {
  const [title, setTitle] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage('');
    if (!title.trim()) {
      setError('Please tell us briefly what hurts — a few words are fine.');
      setMessage('Form has an error: title is required');
      return;
    }

    // Simulate save
    setMessage('Pain entry saved. You can add more details later if you want.');
    setTitle('');
  };

  return (
    <form onSubmit={submit} aria-describedby={error ? 'title-error' : undefined}>
      <AccessibilityAnnouncer message={message} politeness="polite" />

      <Input
        label="What hurts?"
        value={title}
        onChange={e => setTitle(e.target.value)}
        error={error}
        hint={!error ? "Short, simple descriptions help — e.g. 'lower back'" : undefined}
        id="pain-title"
      />

      <div className="mt-4">
        <Button type="submit">Save entry</Button>
      </div>
    </form>
  );
};

export default PainEntryForm;
