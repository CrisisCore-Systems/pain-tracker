import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../design-system/components/Button';
import { Heart, Send, ArrowLeft, Shield, CheckCircle2, Sparkles } from 'lucide-react';

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
  const recaptchaScriptRef = useRef<HTMLScriptElement | null>(null);
  const recaptchaLoadPromiseRef = useRef<Promise<boolean> | null>(null);

  type Grecaptcha = {
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
  };

  const ensureRecaptchaLoaded = async (siteKey: string): Promise<boolean> => {
    const existingGrecaptcha = (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha;
    if (existingGrecaptcha?.execute) return true;

    if (recaptchaLoadPromiseRef.current) return recaptchaLoadPromiseRef.current;

    recaptchaLoadPromiseRef.current = new Promise<boolean>((resolve) => {
      const existingScript = document.querySelector(
        `script[data-recaptcha='${siteKey}']`
      ) as HTMLScriptElement | null;

      const waitForGrecaptcha = () => {
        const start = Date.now();
        const interval = window.setInterval(() => {
          const grecaptcha = (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha;
          if (grecaptcha?.execute) {
            window.clearInterval(interval);
            resolve(true);
            return;
          }
          if (Date.now() - start > 3000) {
            window.clearInterval(interval);
            resolve(false);
          }
        }, 50);
      };

      if (existingScript) {
        waitForGrecaptcha();
        return;
      }

      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
      s.setAttribute('data-recaptcha', siteKey);
      s.onload = () => waitForGrecaptcha();
      s.onerror = () => resolve(false);

      recaptchaScriptRef.current = s;
      document.head.appendChild(s);
    });

    return recaptchaLoadPromiseRef.current;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!quote || !consent) {
      setError('Please provide your story and consent to publish');
      return;
    }
    setLoading(true);
    try {
      let recaptchaToken: string | undefined = undefined;
      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;

      if (siteKey) {
        try {
          await ensureRecaptchaLoaded(siteKey);
          const grecaptcha = (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha;
          if (grecaptcha?.execute) {
            recaptchaToken = await grecaptcha.execute(siteKey, { action: 'submit_testimonial' });
          }
        } catch (err) {
          console.warn('Failed to execute reCAPTCHA', err);
        }
      }

      const res = await fetch('/api/landing/testimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, email, quote, anonymized, consent, recaptchaToken }),
      });
      if (!res.ok) throw new Error('Failed to submit story');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      const s = recaptchaScriptRef.current;
      if (!s) return;
      try {
        document.head.removeChild(s);
      } catch (e) {
        console.warn('Failed to remove reCAPTCHA script during cleanup', e);
      } finally {
        recaptchaScriptRef.current = null;
        recaptchaLoadPromiseRef.current = null;
      }
    };
  }, []);

  if (success) {
    return (
      <main id="main-content" className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        </div>
        
        <div 
          className="relative max-w-md w-full p-8 rounded-2xl text-center border border-slate-700/50"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          {/* Success gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-t-2xl" />
          
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-3">Thank you for sharing</h1>
          <p className="text-slate-400 mb-8">
            Your story means the world to us. We'll review it and reach out if we need permission to publish.
          </p>
          
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground py-16 px-4">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 mb-6">
            <Heart className="w-8 h-8 text-rose-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Share Your Story</h1>
          <p className="text-slate-400 max-w-md mx-auto">
            Your experience matters. Help others understand they're not alone on their journey.
          </p>
        </div>

        {/* Form Card */}
        <div 
          className="rounded-2xl p-8 border border-slate-700/50 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          {/* Gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500" />

          {/* Privacy notice */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <Shield className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-emerald-300 font-medium">Your privacy matters</p>
              <p className="text-sm text-slate-400 mt-1">You can choose to anonymize your submission. We'll never share your contact information.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Patient, Clinician"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="story-input" className="block text-sm font-medium text-slate-300 mb-2">Your Story</label>
              <textarea
                id="story-input"
                value={quote}
                onChange={e => setQuote(e.target.value)}
                required
                rows={6}
                placeholder="Share your experience with chronic pain management..."
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all resize-none"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-4 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input 
                    type="checkbox" 
                    checked={anonymized} 
                    onChange={e => setAnonymized(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded border-2 border-slate-600 peer-checked:border-violet-500 peer-checked:bg-violet-500 transition-all flex items-center justify-center">
                    {anonymized && <Sparkles className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                  Publish anonymously
                </span>
              </label>

              <label htmlFor="consent-checkbox" className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input 
                    id="consent-checkbox"
                    type="checkbox" 
                    checked={consent} 
                    onChange={e => setConsent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded border-2 border-slate-600 peer-checked:border-emerald-500 peer-checked:bg-emerald-500 transition-all flex items-center justify-center">
                    {consent && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                  I consent to my story being reviewed and published
                </span>
              </label>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <p className="text-sm text-rose-400">{error}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-medium transition-all disabled:opacity-50 hover:-translate-y-0.5 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40"
                style={{
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
                }}
              >
                <Send className="w-4 h-4" />
                {loading ? 'Submitting...' : 'Submit Story'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3.5 rounded-xl text-slate-300 border border-slate-600 hover:bg-slate-800 transition-all hover:-translate-y-0.5"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default SubmitStoryPage;