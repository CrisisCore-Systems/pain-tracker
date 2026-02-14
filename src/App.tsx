/**
 * Pain Tracker - A comprehensive tool for tracking and managing chronic pain and injuries
 * Copyright (c) 2024 Pain Tracker. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Suspense, useEffect, lazy, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./design-system";
import { ToastProvider } from "./components/feedback";
import { TraumaInformedProvider } from "./components/accessibility";
import { CanonicalUrlManager } from './components/seo/CanonicalUrlManager';
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { ToneProvider } from "./contexts/ToneContext";
import { StartupPromptsProvider } from "./contexts/StartupPromptsContext";
import { initializeToneEngine } from "./services/ToneEngine";
import { useGlobalAccessibility } from "./hooks/useGlobalAccessibility";
import './i18n/config';
import { BlackBoxSplashScreen } from './components/branding/BlackBoxSplashScreen';
import { trackSessionStart as trackUsageSessionStart } from './utils/usage-tracking';
import { Analytics } from "@vercel/analytics/react";
import { getLocalUserId } from './utils/user-identity';
import { isAnalyticsAllowed } from './analytics/analytics-gate';

// Lazy-loaded route components for code splitting
const PainTrackerContainer = lazy(() => import('./containers/PainTrackerContainer').then(m => ({ default: m.PainTrackerContainer })));
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const CnetDownloadPage = lazy(() => import('./pages/CnetDownloadPage').then(m => ({ default: m.CnetDownloadPage })));
const WhitepaperPage = lazy(() => import('./pages/WhitepaperPage').then(m => ({ default: m.WhitepaperPage })));
const ScreenshotShowcase = lazy(() => import('./pages/ScreenshotShowcase').then(m => ({ default: m.ScreenshotShowcase })));
const ClinicPortal = lazy(() => import('./pages/clinic/ClinicPortal').then(m => ({ default: m.ClinicPortal })));
const SubscriptionManagementPage = lazy(() => import('./pages/SubscriptionManagementPage').then(m => ({ default: m.SubscriptionManagementPage })));
const SubmitStoryPage = lazy(() => import('./pages/SubmitStoryPage').then(m => ({ default: m.SubmitStoryPage })));
const DownloadPage = lazy(() => import('./pages/DownloadPage').then(m => ({ default: m.DownloadPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const VaultGate = lazy(() => import('./components/security/VaultGate').then(m => ({ default: m.VaultGate })));
const ProtectedAppShell = lazy(() => import('./routes/ProtectedAppShell').then(m => ({ default: m.ProtectedAppShell })));

// SEO Resource Pages - Lazy loaded for code splitting
// Tier 1: Printable/Download Intent
const ResourcesIndexPage = lazy(() => import('./pages/resources/ResourcesIndexPage').then(m => ({ default: m.ResourcesIndexPage })));
const PainDiaryTemplatePdfPage = lazy(() => import('./pages/resources/PainDiaryTemplatePdfPage').then(m => ({ default: m.PainDiaryTemplatePdfPage })));
const DailyPainTrackerPrintablePage = lazy(() => import('./pages/resources/DailyPainTrackerPrintablePage').then(m => ({ default: m.DailyPainTrackerPrintablePage })));
const WeeklyPainLogPdfPage = lazy(() => import('./pages/resources/WeeklyPainLogPdfPage').then(m => ({ default: m.WeeklyPainLogPdfPage })));
const MonthlyPainTrackerPrintablePage = lazy(() => import('./pages/resources/MonthlyPainTrackerPrintablePage').then(m => ({ default: m.MonthlyPainTrackerPrintablePage })));
const PainScaleChartPrintablePage = lazy(() => import('./pages/resources/PainScaleChartPrintablePage').then(m => ({ default: m.PainScaleChartPrintablePage })));
const SymptomTrackerPrintablePage = lazy(() => import('./pages/resources/SymptomTrackerPrintablePage').then(m => ({ default: m.SymptomTrackerPrintablePage })));
const MigrainePainDiaryPrintablePage = lazy(() => import('./pages/resources/MigrainePainDiaryPrintablePage').then(m => ({ default: m.MigrainePainDiaryPrintablePage })));
const PrintablePainLogSheetPage = lazy(() => import('./pages/resources/PrintablePainLogSheetPage').then(m => ({ default: m.PrintablePainLogSheetPage })));
const ChronicPainDiaryTemplatePage = lazy(() => import('./pages/resources/ChronicPainDiaryTemplatePage').then(m => ({ default: m.ChronicPainDiaryTemplatePage })));
const SevenDayPainDiaryTemplatePage = lazy(() => import('./pages/resources/SevenDayPainDiaryTemplatePage').then(m => ({ default: m.SevenDayPainDiaryTemplatePage })));

// Tier 2: Medical & Appointment Intent
const HowToTrackPainForDoctorsPage = lazy(() => import('./pages/resources/HowToTrackPainForDoctorsPage').then(m => ({ default: m.HowToTrackPainForDoctorsPage })));
const WhatToIncludeInPainJournalPage = lazy(() => import('./pages/resources/WhatToIncludeInPainJournalPage').then(m => ({ default: m.WhatToIncludeInPainJournalPage })));
const HowDoctorsUsePainDiariesPage = lazy(() => import('./pages/resources/HowDoctorsUsePainDiariesPage').then(m => ({ default: m.HowDoctorsUsePainDiariesPage })));
const PainDiaryForSpecialistAppointmentPage = lazy(() => import('./pages/resources/PainDiaryForSpecialistAppointmentPage').then(m => ({ default: m.PainDiaryForSpecialistAppointmentPage })));
const SymptomTrackingBeforeDiagnosisPage = lazy(() => import('./pages/resources/SymptomTrackingBeforeDiagnosisPage').then(m => ({ default: m.SymptomTrackingBeforeDiagnosisPage })));

// Tier 3: Disability / Legal Documentation
const DocumentingPainForDisabilityClaimPage = lazy(() => import('./pages/resources/DocumentingPainForDisabilityClaimPage').then(m => ({ default: m.DocumentingPainForDisabilityClaimPage })));
const WorkSafeBCPainJournalTemplatePage = lazy(() => import('./pages/resources/WorkSafeBCPainJournalTemplatePage').then(m => ({ default: m.WorkSafeBCPainJournalTemplatePage })));
const PainJournalForDisabilityBenefitsPage = lazy(() => import('./pages/resources/PainJournalForDisabilityBenefitsPage').then(m => ({ default: m.PainJournalForDisabilityBenefitsPage })));
const DailyFunctioningLogForDisabilityPage = lazy(() => import('./pages/resources/DailyFunctioningLogForDisabilityPage').then(m => ({ default: m.DailyFunctioningLogForDisabilityPage })));

// Tier 4: Condition-Specific
const FibromyalgiaPainDiaryPage = lazy(() => import('./pages/resources/FibromyalgiaPainDiaryPage').then(m => ({ default: m.FibromyalgiaPainDiaryPage })));
const ChronicBackPainDiaryPage = lazy(() => import('./pages/resources/ChronicBackPainDiaryPage').then(m => ({ default: m.ChronicBackPainDiaryPage })));
const ArthritisPainTrackerPage = lazy(() => import('./pages/resources/ArthritisPainTrackerPage').then(m => ({ default: m.ArthritisPainTrackerPage })));
const NervePainSymptomLogPage = lazy(() => import('./pages/resources/NervePainSymptomLogPage').then(m => ({ default: m.NervePainSymptomLogPage })));
const EndometriosisPainLogPage = lazy(() => import('./pages/resources/EndometriosisPainLogPage').then(m => ({ default: m.EndometriosisPainLogPage })));
const CRPSPainDiaryTemplatePage = lazy(() => import('./pages/resources/CRPSPainDiaryTemplatePage').then(m => ({ default: m.CRPSPainDiaryTemplatePage })));
const NeuropathySymptomTrackerPage = lazy(() => import('./pages/resources/NeuropathySymptomTrackerPage').then(m => ({ default: m.NeuropathySymptomTrackerPage })));

const LoadingFallback = () => {
  return <BlackBoxSplashScreen message="Loading..." />;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const userId = getLocalUserId();

  // Ritual: Show splash screen for at least 2.5s on startup
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Initialize global accessibility features
  useGlobalAccessibility({
    enableValidation: import.meta.env.DEV,
    enableAutoLabeling: true,
    announceRouteChanges: true,
  });

  // Defer non-critical initialization for faster mobile load
  useEffect(() => {
    // Use requestIdleCallback to defer analytics and tone engine
    const initializeDeferred = () => {
      // Initialize tone engine (non-blocking)
      initializeToneEngine().catch(error => {
        console.error('Failed to initialize tone engine:', error);
        // Continue without tone engine - app still works
      });
      
      // Defer analytics tracking to not block initial render
      trackUsageSessionStart();
      import('./services/AnalyticsTrackingService').then(({ trackSessionStart }) => {
        trackSessionStart();
      });
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    const globalWithIdleCallback = globalThis as typeof globalThis & {
      requestIdleCallback?: (cb: () => void) => void;
    };

    if (typeof globalWithIdleCallback.requestIdleCallback === 'function') {
      globalWithIdleCallback.requestIdleCallback(initializeDeferred);
    } else {
      setTimeout(initializeDeferred, 100);
    }
  }, []);

  // NOTE: Do NOT set basename when Vite handles the base path via VITE_BASE.
  // Vite's dev server already serves from /pain-tracker/ and rewrites URLs correctly.
  // Setting basename would cause React Router to strip the path from the URL bar,
  // breaking bookmarks and page refreshes. Only set basename in production builds
  // when deploying to a true subpath without server-side rewriting.
  // For now, leave basename empty - Vite's base config handles asset paths.

  if (showSplash) {
    return <BlackBoxSplashScreen />;
  }

  return (
    <BrowserRouter>
      <CanonicalUrlManager />
      {isAnalyticsAllowed() && <Analytics />}
      <ThemeProvider>
        <SubscriptionProvider userId={userId}>
          <ToneProvider>
            <TraumaInformedProvider>
              <ToastProvider>
                <StartupPromptsProvider>
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      {/* Landing Page - Public */}
                      <Route path="/" element={<LandingPage />} />

                      {/* Pricing Page - Public */}
                      <Route path="/pricing" element={<PricingPage />} />

                      {/* CNET Download URL - Public */}
                      <Route path="/cnet-download" element={<CnetDownloadPage />} />

                      {/* Whitepaper Download - Public */}
                      <Route path="/whitepaper" element={<WhitepaperPage />} />

                      {/* Screenshot Showcase - Public */}
                      <Route path="/demo/*" element={<ScreenshotShowcase />} />

                      {/* Clinic Portal - Protected (separate UI/UX) */}
                      <Route path="/clinic/*" element={<ClinicPortal />} />

                      {/* Subscription Management - Protected */}
                      <Route
                        path="/subscription"
                        element={
                          <VaultGate>
                            <SubscriptionManagementPage />
                          </VaultGate>
                        }
                    />

                    {/* Vault Setup/Login - Public */}
                    <Route
                      path="/start"
                      element={
                        <VaultGate>
                          <Navigate to="/app" replace />
                        </VaultGate>
                      }
                    />

                    {/* Main Application - Protected */}
                    <Route path="/app" element={
                      <VaultGate>
                        <ProtectedAppShell />
                      </VaultGate>
                    } />

                    {/* Route to open app and start daily check-in (used by notifications) */}
                    <Route
                      path="/app/checkin"
                      element={
                        <VaultGate>
                          <ProtectedAppShell initialView="daily-checkin" />
                        </VaultGate>
                      }
                    />

                    {/* Submit testimonial/stories */}
                    <Route path="/submit-story" element={<SubmitStoryPage />} />

                    {/* Download Page - Public */}
                    <Route path="/download" element={<DownloadPage />} />

                    {/* Privacy Policy - Public */}
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />

                    {/* SEO Resource Pages - Public */}
                    <Route path="/resources" element={<ResourcesIndexPage />} />
                    
                    {/* Tier 1: Printable/Download Intent */}
                    <Route path="/resources/pain-diary-template-pdf" element={<PainDiaryTemplatePdfPage />} />
                    <Route path="/resources/daily-pain-tracker-printable" element={<DailyPainTrackerPrintablePage />} />
                    <Route path="/resources/weekly-pain-log-pdf" element={<WeeklyPainLogPdfPage />} />
                    <Route path="/resources/monthly-pain-tracker-printable" element={<MonthlyPainTrackerPrintablePage />} />
                    <Route path="/resources/pain-scale-chart-printable" element={<PainScaleChartPrintablePage />} />
                    <Route path="/resources/symptom-tracker-printable" element={<SymptomTrackerPrintablePage />} />
                    <Route path="/resources/migraine-pain-diary-printable" element={<MigrainePainDiaryPrintablePage />} />
                    <Route path="/resources/printable-pain-log-sheet" element={<PrintablePainLogSheetPage />} />
                    <Route path="/resources/chronic-pain-diary-template" element={<ChronicPainDiaryTemplatePage />} />
                    <Route path="/resources/7-day-pain-diary-template" element={<SevenDayPainDiaryTemplatePage />} />
                    
                    {/* Tier 2: Medical & Appointment Intent */}
                    <Route path="/resources/how-to-track-pain-for-doctors" element={<HowToTrackPainForDoctorsPage />} />
                    <Route path="/resources/what-to-include-in-pain-journal" element={<WhatToIncludeInPainJournalPage />} />
                    <Route path="/resources/how-doctors-use-pain-diaries" element={<HowDoctorsUsePainDiariesPage />} />
                    <Route path="/resources/pain-diary-for-specialist-appointment" element={<PainDiaryForSpecialistAppointmentPage />} />
                    <Route path="/resources/symptom-tracking-before-diagnosis" element={<SymptomTrackingBeforeDiagnosisPage />} />
                    
                    {/* Tier 3: Disability / Legal Documentation */}
                    <Route path="/resources/documenting-pain-for-disability-claim" element={<DocumentingPainForDisabilityClaimPage />} />
                    <Route path="/resources/worksafebc-pain-journal-template" element={<WorkSafeBCPainJournalTemplatePage />} />
                    <Route path="/resources/pain-journal-for-disability-benefits" element={<PainJournalForDisabilityBenefitsPage />} />
                    <Route path="/resources/daily-functioning-log-for-disability" element={<DailyFunctioningLogForDisabilityPage />} />
                    
                    {/* Tier 4: Condition-Specific */}
                    <Route path="/resources/fibromyalgia-pain-diary" element={<FibromyalgiaPainDiaryPage />} />
                    <Route path="/resources/chronic-back-pain-diary" element={<ChronicBackPainDiaryPage />} />
                    <Route path="/resources/arthritis-pain-tracker" element={<ArthritisPainTrackerPage />} />
                    <Route path="/resources/nerve-pain-symptom-log" element={<NervePainSymptomLogPage />} />
                    <Route path="/resources/endometriosis-pain-log" element={<EndometriosisPainLogPage />} />
                    <Route path="/resources/crps-pain-diary-template" element={<CRPSPainDiaryTemplatePage />} />
                    <Route path="/resources/neuropathy-symptom-tracker" element={<NeuropathySymptomTrackerPage />} />

                    {/* Fallback - redirect to landing */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </StartupPromptsProvider>
              </ToastProvider>
            </TraumaInformedProvider>
          </ToneProvider>
        </SubscriptionProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
