import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Clipboard, FileText, Mail, Plus, ShieldCheck } from 'lucide-react';

interface FirstEntrySuccessPanelProps {
  entryCount: number;
  onAddAnother: () => void;
  onExportReport: () => void;
}

const SUPPORT_EMAIL = 'support@paintracker.ca';
const FEEDBACK_MAX_LENGTH = 600;

function buildFeedbackDraft(feedback: string) {
  return [
    'What almost stopped you from using PainTracker?',
    '',
    feedback.trim(),
    '',
    'Context: first entry completed. No pain entry data is attached by this screen.',
  ].join('\n');
}

function buildMailtoHref(feedback: string) {
  const subject = 'PainTracker first-entry feedback';
  const body = buildFeedbackDraft(feedback);
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function FirstEntrySuccessPanel({
  entryCount,
  onAddAnother,
  onExportReport,
}: Readonly<FirstEntrySuccessPanelProps>) {
  const confirmationRef = useRef<HTMLElement>(null);
  const [showFeedbackDraft, setShowFeedbackDraft] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  const trimmedFeedback = feedback.trim();

  useEffect(() => {
    confirmationRef.current?.focus();
  }, []);

  const copyFeedbackDraft = async () => {
    if (!trimmedFeedback) {
      setFeedbackStatus('Write a short note first. Nothing has been sent.');
      return;
    }

    if (!navigator.clipboard?.writeText) {
      setFeedbackStatus('Clipboard is unavailable. Select and copy the draft manually.');
      return;
    }

    try {
      await navigator.clipboard.writeText(buildFeedbackDraft(feedback));
      setFeedbackStatus('Draft copied. You choose where to send it.');
    } catch {
      setFeedbackStatus('Copy failed. Select and copy the draft manually.');
    }
  };

  const openEmailDraft = () => {
    if (!trimmedFeedback) {
      setFeedbackStatus('Write a short note first. Nothing has been sent.');
      return;
    }

    globalThis.location.href = buildMailtoHref(feedback);
    setFeedbackStatus('Email draft opened. Review it before sending.');
  };

  return (
    <section
      ref={confirmationRef}
      tabIndex={-1}
      className="mx-auto max-w-4xl space-y-6 py-4 focus:outline-none"
      aria-labelledby="first-entry-success-heading"
    >
      <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-6 shadow-sm">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-slate-950">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-300">
              First entry saved
            </p>
            <div role="status" aria-live="polite" aria-atomic="true">
              <h1
                id="first-entry-success-heading"
                className="text-2xl font-bold tracking-tight text-foreground"
              >
                Saved on this device.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Your record is available locally without an account. Nothing was submitted as
                feedback, and no pain entry is attached to the optional draft below.
              </p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Saved entries: {Math.max(entryCount, 1)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3" role="group" aria-label="Next actions">
          <button
            type="button"
            onClick={onAddAnother}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add another entry
          </button>
          <button
            type="button"
            onClick={onExportReport}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Export printable report
          </button>
          <button
            type="button"
            aria-expanded={showFeedbackDraft}
            aria-controls="first-entry-feedback-panel"
            onClick={() => setShowFeedbackDraft(value => !value)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Draft feedback manually
          </button>
        </div>
      </div>

      {showFeedbackDraft && (
        <div
          id="first-entry-feedback-panel"
          className="rounded-lg border border-border/60 bg-card p-6"
        >
          <h2 className="text-xl font-semibold text-foreground">Optional feedback draft</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            This text stays on your device until you copy it or open an email draft. Email may
            reveal your address, mail provider, IP address, or other message metadata. Do not
            include health details you do not want to disclose.
          </p>

          <label htmlFor="first-entry-feedback" className="sr-only">
            What almost stopped you from using PainTracker?
          </label>
          <textarea
            id="first-entry-feedback"
            value={feedback}
            onChange={event => {
              setFeedback(event.currentTarget.value);
              setFeedbackStatus(null);
            }}
            maxLength={FEEDBACK_MAX_LENGTH}
            rows={5}
            placeholder="What almost stopped you from using PainTracker?"
            className="mt-4 min-h-32 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={copyFeedbackDraft}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground"
            >
              <Clipboard className="h-4 w-4" aria-hidden="true" />
              Copy draft
            </button>
            <button
              type="button"
              onClick={openEmailDraft}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              Open email draft
            </button>
          </div>

          {feedbackStatus && (
            <p className="mt-3 text-sm text-muted-foreground" role="status" aria-live="polite">
              {feedbackStatus}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default FirstEntrySuccessPanel;
