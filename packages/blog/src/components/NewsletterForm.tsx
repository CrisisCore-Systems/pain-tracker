'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';

type SubscriptionState = 'idle' | 'loading' | 'success' | 'error';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SubscriptionState>('idle');
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on success message for screen readers
  useEffect(() => {
    if (state === 'success' || state === 'error') {
      // Announce to screen readers
      const announcement = document.getElementById('newsletter-announcement');
      if (announcement) announcement.focus();
    }
  }, [state]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email) return;

    setState('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setState('success');
        setMessage(data.message || 'You\'re all set! Check your inbox for a confirmation.');
        setEmail('');
      } else {
        setState('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setState('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const handleRetry = () => {
    setState('idle');
    setMessage('');
    inputRef.current?.focus();
  };

  // Success state
  if (state === 'success') {
    return (
      <div 
        className="flex items-start gap-4 p-6 rounded-2xl bg-success/10 border border-success/20"
        role="alert"
        aria-live="polite"
      >
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-foreground mb-1">Successfully subscribed!</h4>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            ref={inputRef}
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={`input w-full pr-10 ${state === 'error' ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}`}
            disabled={state === 'loading'}
            required
            aria-describedby={state === 'error' ? 'newsletter-error' : undefined}
            aria-invalid={state === 'error'}
          />
          {/* Email icon */}
          <svg 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50 pointer-events-none" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <button
          type="submit"
          className="btn-primary whitespace-nowrap min-w-[140px] relative overflow-hidden group"
          disabled={state === 'loading'}
        >
          {/* Shimmer effect */}
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" aria-hidden="true" />
          
          {state === 'loading' ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Subscribing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Subscribe
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
          )}
        </button>
      </div>
      
      {/* Error message */}
      {state === 'error' && message && (
        <div 
          id="newsletter-error"
          className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
          role="alert"
          aria-live="assertive"
        >
          <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-destructive font-medium">{message}</p>
            <button 
              type="button"
              onClick={handleRetry}
              className="text-sm text-destructive/80 hover:text-destructive underline underline-offset-2 mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}
      
      {/* Privacy note */}
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        No spam, ever. Unsubscribe anytime.
      </p>
    </form>
  );
}