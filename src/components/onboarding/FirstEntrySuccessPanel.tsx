import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clipboard,
  FileText,
  Mail,
  Plus,
  ShieldCheck,
} from 'lucide-react';

interface FirstEntrySuccessPanelProps {
  entryCount: number;
  onAddAnother: () => void;
  onDone: () => void;
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
  onDone,
  onExportReport,
}: Readonly<FirstEntrySuccessPanelProps>) {
  const [feedback, setFeedback] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);
  const trimmedFeedback = feedback.trim();
  const feedbackDraft = useMemo(() => buildFeedbackDraft(feedback), [feedback]);
  const canSendFeedback = trimmedFeedback.length > 0;

  const copyFeedbackDraft = async () => {
    if (!canSendFeedback) {
      setFeedbackStatus('Write a short note first. Nothing has been sent.');
      return;
    }

    if (!navigator.clipboard?.writeText) {
      setFeedbackStatus(
        'Clipboard is unavailable in this browser. You can still copy the text manually.'
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(feedbackDraft);
      setFeedbackStatus('Feedback draft copied. You choose where to send it.');
    } catch {
      setFeedbackStatus('Copy failed. You can still select and copy the text manually.');
    }
  };

  const openEmailDraft = () => {
    if (!canSendFeedback) {
      setFeedbackStatus('Write a short note first. Nothing has been sent.');
      return;
    }

    globalThis.location.href = buildMailtoHref(feedback);
    setFeedbackStatus('Email draft opened. Review it before sending.');
  };

  return (
    <section
      className="mx-auto max-w-4xl space-y-6 py-4"
      aria-labelledby="first-entry-success-heading"
    >
      <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-slate-950">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-300">
                First entry saved
              </p>
              <h1
                id="first-entry-success-heading"
                className="text-2xl font-bold tracking-tight text-foreground"
              >
                Entry saved locally. Want to build a 7-day pattern?
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Your first record is on this device. You can add another entry, export a printable
                report when you need one, or leave feedback about what made this first log harder
                than it should have been.
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
            Saved entries:{' '}
            <span className="font-semibold text-foreground">{Math.max(entryCount, 1)}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={onAddAnother}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add another entry
          </button>
          <button
            type="button"
            onClick={onExportReport}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Export printable report
          </button>
          <button
            type="button"
            onClick={onDone}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          >
            Go to dashboard
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Privacy-safe feedback
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              What almost stopped you from using this?
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Nothing is sent automatically. Do not include health details you do not want in a
              message. Email is optional and may reveal your address or mail-provider metadata.
            </p>
          </div>
          <span className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
            No pain entry attached
          </span>
        </div>

        <div className="mt-5">
          <label htmlFor="first-entry-feedback" className="sr-only">
            What almost stopped you from using this?
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
            placeholder="Example: I could not find the save button, the wording felt too clinical, or I needed a paper option first."
            className="min-h-32 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
          />
          <div className="mt-2 flex items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>This text stays local until you copy it or open an email draft.</span>
            <span className="tabular-nums">
              {feedback.length}/{FEEDBACK_MAX_LENGTH}
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={copyFeedbackDraft}
            disabled={!canSendFeedback}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Clipboard className="h-4 w-4" aria-hidden="true" />
            Copy feedback draft
          </button>
          <button
            type="button"
            onClick={openEmailDraft}
            disabled={!canSendFeedback}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Open email draft
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-3">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Draft preview:{' '}
            {canSendFeedback ? trimmedFeedback : 'Write one short barrier in the box above.'}
          </p>
        </div>

        {feedbackStatus && (
          <p className="mt-3 text-sm text-muted-foreground" role="status" aria-live="polite">
            {feedbackStatus}
          </p>
        )}
      </div>
    </section>
  );
}

export default FirstEntrySuccessPanel;
