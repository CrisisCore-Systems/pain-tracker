import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../design-system/components/Input';
import Textarea from '../components/ui/textarea';
import { Button } from '../design-system/components/Button';

export const SubmitStoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [quote, setQuote] = useState('');
  const [anonymized, setAnonymized] = useState(false);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!quote || !consent) {
      setError('Please provide your story and consent to publish');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/landing/testimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, email, quote, anonymized, consent }),
      });
      if (!res.ok) throw new Error('Failed to submit story');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Thank you for sharing your story</h1>
        <p className="text-muted-foreground mb-6">We'll review it and reach out if we need permission to publish.</p>
        <Button onClick={() => navigate('/')} variant="outline">Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Share your story</h1>
        <p className="text-muted-foreground mb-6">Your privacy matters. You can choose to anonymize your submission.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Role (e.g. Patient, Clinician)" value={role} onChange={e => setRole(e.target.value)} />
          <Input label="Email (optional)" value={email} onChange={e => setEmail(e.target.value)} />
          <div className="space-y-2 mobile-form-spacing">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="submit-story-text">
              Your Story
            </label>
            <div className="relative">
              <Textarea id="submit-story-text" value={quote} onChange={e => setQuote(e.target.value)} required />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={anonymized} onChange={e => setAnonymized(e.target.checked)} />
              <span className="text-sm">Publish anonymously</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
              <span className="text-sm">I consent to my story being reviewed and published</span>
            </label>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} size="lg">{loading ? 'Submitting...' : 'Submit'}</Button>
            <Button variant="ghost" onClick={() => navigate('/')} size="lg">Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitStoryPage;
