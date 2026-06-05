import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import { applyPageMetadata } from '../components/seo/applyPageMetadata';

function ensureRobotsNoindex() {
  const existing = document.querySelector('meta[name="robots"]');
  const created = existing ?? document.createElement('meta');
  const previous = created.getAttribute('content');

  if (!existing) {
    created.setAttribute('name', 'robots');
    document.head.appendChild(created);
  }

  created.setAttribute('content', 'noindex,nofollow');

  return () => {
    if (!existing) {
      created.remove();
      return;
    }

    if (previous === null) {
      created.removeAttribute('content');
    } else {
      created.setAttribute('content', previous);
    }
  };
}

export const ClinicRouteBoundaryPage: React.FC = () => {
  useEffect(() => {
    const cleanupMetadata = applyPageMetadata({
      title: 'Clinic Portal Boundary | PainTracker.ca',
      description:
        'PainTracker.ca does not offer a public clinic portal, staff dashboard, patient monitoring, or automatic access to worker records.',
      canonicalUrl: 'https://www.paintracker.ca/clinic',
    });
    const cleanupRobots = ensureRobotsNoindex();

    return () => {
      cleanupRobots();
      cleanupMetadata();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto flex min-h-screen max-w-4xl items-center px-5 py-16 sm:px-6">
        <section className="w-full rounded-lg border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-sky-400/10 text-sky-300">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
            Public clinic boundary
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Clinic portal access is not part of this public product.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">
            PainTracker.ca currently does not provide a public clinic login, patient monitoring,
            staff dashboards, EMR integration, or automatic access to worker records. Core tracking
            remains controlled by the person using the app on their own device.
          </p>

          <div className="mt-6 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-emerald-300" />
              <p className="text-sm leading-6 text-emerald-50">
                If you are reviewing PainTracker.ca for PMMP appointment-preparation fit, use the
                provider review page. It explains the worker-controlled privacy and no-integration
                boundaries.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/providers/pmmp"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              View PMMP provider review
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/privacy-architecture"
              className="inline-flex items-center justify-center rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
            >
              View privacy architecture
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ClinicRouteBoundaryPage;
