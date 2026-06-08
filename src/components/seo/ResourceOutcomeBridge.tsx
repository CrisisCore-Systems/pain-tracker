import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Download, FileText, Lock, Shield, Sparkles } from 'lucide-react';
import {
  resolveResourcePageSlug,
  resolveResourcePageType,
  trackResourcePrintableDownloadClick,
  trackResourceStartTrackingFreeClick,
  type ResourcePageType,
} from '../../analytics/resource-funnel-events';

interface ResourceOutcomeBridgeProps {
  downloadUrl?: string;
  downloadFileName?: string;
  appHref?: string;
  printableLabel?: string;
  appLabel?: string;
  resourcePageSlug?: string;
  resourcePageType?: ResourcePageType;
}

const trustBullets = [
  'No account required',
  'Data stays on your device',
  'Built for appointments, claims, and private records',
] as const;

const freeBullets = [
  'Track pain privately and offline',
  'Use printable templates or start in the app',
  'Keep a first useful record without committing to an account',
] as const;

const upgradeBullets = [
  'Turn scattered entries into cleaner summaries and exports',
  'Review longer history, patterns, and treatment response with less manual work',
  'Prepare records that are easier to bring to doctors, claims, or disability workflows',
] as const;

export const ResourceOutcomeBridge: React.FC<ResourceOutcomeBridgeProps> = ({
  downloadUrl,
  downloadFileName,
  appHref = '/start',
  printableLabel = 'Download printable',
  appLabel = 'Log first entry in the app',
  resourcePageSlug,
  resourcePageType,
}) => {
  const resolvedSlug = resolveResourcePageSlug(resourcePageSlug);
  const resolvedType = resolveResourcePageType(resourcePageType, resolvedSlug);

  const handleAppClick = () => {
    if (!resolvedSlug || !resolvedType) {
      return;
    }

    trackResourceStartTrackingFreeClick({
      resourcePageSlug: resolvedSlug,
      resourcePageType: resolvedType,
      resourceCtaLocation: 'outcome_bridge_start_free',
      routeTarget: appHref,
    });
  };

  const handlePrintableClick = () => {
    if (!downloadUrl || !resolvedSlug || !resolvedType) {
      return;
    }

    trackResourcePrintableDownloadClick({
      resourcePageSlug: resolvedSlug,
      resourcePageType: resolvedType,
      resourceCtaLocation: 'outcome_bridge_printable_download',
      routeTarget: downloadUrl,
    });
  };

  return (
    <section
      className="py-12 bg-slate-900 border-b border-slate-800"
      aria-labelledby="resource-outcome-bridge-heading"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-700 bg-slate-800/70 p-6 sm:p-8 shadow-2xl shadow-black/20">
          <div className="grid gap-8 lg:grid-cols-[1.25fr,0.75fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary mb-3">
                Start with the least effort that works today
              </p>
              <h2
                id="resource-outcome-bridge-heading"
                className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-4"
              >
                Paper helps you start. The app helps you stay organized.
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-5">
                Use the printable if paper is safer or easier right now. Open the app when you want
                a searchable local record, cleaner exports before an appointment, or private records
                that do not depend on an account.
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                <Link
                  to={appHref}
                  onClick={handleAppClick}
                  className="btn-cta-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  {appLabel}
                </Link>

                {downloadUrl ? (
                  <a
                    href={downloadUrl}
                    download={downloadFileName}
                    onClick={handlePrintableClick}
                    className="px-6 py-3 rounded-xl font-medium text-slate-200 border border-slate-600 hover:border-slate-500 hover:text-white transition-all flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    {printableLabel}
                  </a>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {trustBullets.map((bullet, index) => {
                  const Icon = index === 0 ? FileText : index === 1 ? Lock : Shield;
                  return (
                    <div
                      key={bullet}
                      className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4"
                    >
                      <Icon className="w-4 h-4 text-primary mb-2" />
                      <p className="text-sm text-slate-300">{bullet}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                <h3 className="text-white font-semibold mb-3">Free</h3>
                <ul className="space-y-2">
                  {freeBullets.map(bullet => (
                    <li key={bullet} className="flex items-start gap-2 text-sm text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-5">
                <h3 className="text-white font-semibold mb-3">When upgrading makes sense</h3>
                <ul className="space-y-2">
                  {upgradeBullets.map(bullet => (
                    <li key={bullet} className="flex items-start gap-2 text-sm text-slate-200">
                      <ArrowRight className="w-4 h-4 text-sky-300 flex-shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResourceOutcomeBridge;
