/**
 * Pain Tracker - A comprehensive tool for tracking and managing chronic pain and injuries
 * Copyright (c) 2024 Pain Tracker. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Suspense, useEffect, lazy, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./design-system/ThemeProvider";
import { ToastProvider } from "./components/feedback/ToastProvider";
import { TraumaInformedProvider } from "./components/accessibility/TraumaInformedContext";
import { CanonicalUrlManager } from './components/seo/CanonicalUrlManager';
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { AuditSinkAlertBridge } from './components/security/AuditSinkAlertBridge';
import { initializeToneEngine } from "./services/ToneEngine";
import { useGlobalAccessibility } from "./hooks/useGlobalAccessibility";
import './i18n/config';
import { BlackBoxSplashScreen } from './components/branding/BlackBoxSplashScreen';
import { trackSessionStart as trackUsageSessionStart } from './utils/usage-tracking';
import { getLocalUserId } from './utils/user-identity';

// Lazy-loaded route components for code splitting
const PainTrackerContainer = lazy(() => import('./containers/PainTrackerContainer').then(m => ({ default: m.PainTrackerContainer })));
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const CnetDownloadPage = lazy(() => import('./pages/CnetDownloadPage').then(m => ({ default: m.CnetDownloadPage })));
const WhitepaperPage = lazy(() => import('./pages/WhitepaperPage').then(m => ({ default: m.WhitepaperPage })));
const OvertonFrameworkPage = lazy(() => import('./pages/OvertonFrameworkPage').then(m => ({ default: m.OvertonFrameworkPage })));
const ScreenshotShowcase = lazy(() => import('./pages/ScreenshotShowcase').then(m => ({ default: m.ScreenshotShowcase })));
const ClinicPortal = lazy(() => import('./pages/clinic/ClinicPortal').then(m => ({ default: m.ClinicPortal })));
const SubscriptionManagementPage = lazy(() => import('./pages/SubscriptionManagementPage').then(m => ({ default: m.SubscriptionManagementPage })));
const SubmitStoryPage = lazy(() => import('./pages/SubmitStoryPage').then(m => ({ default: m.SubmitStoryPage })));
const DownloadPage = lazy(() => import('./pages/DownloadPage').then(m => ({ default: m.DownloadPage })));
const PrivacyArchitecturePage = lazy(() => import('./pages/PrivacyArchitecturePage').then(m => ({ default: m.PrivacyArchitecturePage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TrackingDataPolicyPage = lazy(() => import('./pages/TrackingDataPolicyPage').then(m => ({ default: m.TrackingDataPolicyPage })));
const PainTrackerAppPage = lazy(() => import('./pages/PainTrackerAppPage').then(m => ({ default: m.PainTrackerAppPage })));
const PainTrackingAppPage = lazy(() => import('./pages/PainTrackingAppPage').then(m => ({ default: m.PainTrackingAppPage })));
const PainManagementTrackerPage = lazy(() => import('./pages/PainManagementTrackerPage').then(m => ({ default: m.PainManagementTrackerPage })));
const PainLocatorAppPage = lazy(() => import('./pages/PainLocatorAppPage').then(m => ({ default: m.PainLocatorAppPage })));
const SharePainRecordsPrivatelyPage = lazy(() => import('./pages/SharePainRecordsPrivatelyPage').then(m => ({ default: m.SharePainRecordsPrivatelyPage })));
const PainDiaryTemplatePage = lazy(() => import('./pages/PainDiaryTemplatePage').then(m => ({ default: m.PainDiaryTemplatePage })));
const PainTrackingAppsComparisonPage = lazy(() => import('./pages/PainTrackingAppsComparisonPage').then(m => ({ default: m.PainTrackingAppsComparisonPage })));
const PrivacyOfflineFirstPainTrackerPage = lazy(() => import('./pages/PrivacyOfflineFirstPainTrackerPage').then(m => ({ default: m.PrivacyOfflineFirstPainTrackerPage })));
const VaultGate = lazy(() => import('./components/security/VaultGate').then(m => ({ default: m.VaultGate })));
const StartRedirect = lazy(() => import('./components/security/StartRedirect').then(m => ({ default: m.StartRedirect })));
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
const PainDiaryForDoctorVisitsPage = lazy(() => import('./pages/resources/PainDiaryForDoctorVisitsPage').then(m => ({ default: m.PainDiaryForDoctorVisitsPage })));
const SymptomJournalTemplatePage = lazy(() => import('./pages/resources/SymptomJournalTemplatePage').then(m => ({ default: m.SymptomJournalTemplatePage })));
const ChronicPainLogPrintablePage = lazy(() => import('./pages/resources/ChronicPainLogPrintablePage').then(m => ({ default: m.ChronicPainLogPrintablePage })));
const PainJournalExamplesPage = lazy(() => import('./pages/resources/PainJournalExamplesPage').then(m => ({ default: m.PainJournalExamplesPage })));
const WeeklyPainTrackerPrintablePage = lazy(() => import('./pages/resources/ExpansionPackPages').then(m => ({ default: m.WeeklyPainTrackerPrintablePage })));
const MedicationAndPainLogPage = lazy(() => import('./pages/resources/ExpansionPackPages').then(m => ({ default: m.MedicationAndPainLogPage })));
const FlareUpTrackerPrintablePage = lazy(() => import('./pages/resources/ExpansionPackPages').then(m => ({ default: m.FlareUpTrackerPrintablePage })));
const DoctorVisitPainSummaryTemplatePage = lazy(() => import('./pages/resources/ExpansionPackPages').then(m => ({ default: m.DoctorVisitPainSummaryTemplatePage })));
const BodyPainChartTemplatePage = lazy(() => import('./pages/resources/ExpansionPackPages').then(m => ({ default: m.BodyPainChartTemplatePage })));
const ChronicPainJournalTemplateExpansionPage = lazy(() => import('./pages/resources/ExpansionPackPages').then(m => ({ default: m.ChronicPainJournalTemplatePage })));
const HowToStartPainJournalPage = lazy(() => import('./pages/resources/ExpansionPackPages').then(m => ({ default: m.HowToStartPainJournalPage })));
const HowToDescribePainPage = lazy(() => import('./pages/resources/ExpansionPackPages').then(m => ({ default: m.HowToDescribePainPage })));
const HowToTrackPainTriggersPage = lazy(() => import('./pages/resources/ExpansionPackPages').then(m => ({ default: m.HowToTrackPainTriggersPage })));
const OfflinePainTrackerAppPage = lazy(() => import('./pages/OfflinePainTrackerAppPage').then(m => ({ default: m.OfflinePainTrackerAppPage })));
const PainTrackingForFibromyalgiaPage = lazy(() => import('./pages/resources/ExpansionPackPages2').then(m => ({ default: m.PainTrackingForFibromyalgiaPage })));
const HowToUsePainScalePage = lazy(() => import('./pages/resources/ExpansionPackPages2').then(m => ({ default: m.HowToUsePainScalePage })));
const PainDiaryForInsuranceClaimsPage = lazy(() => import('./pages/resources/ExpansionPackPages2').then(m => ({ default: m.PainDiaryForInsuranceClaimsPage })));
const PrintableSymptomChecklistPage = lazy(() => import('./pages/resources/ExpansionPackPages2').then(m => ({ default: m.PrintableSymptomChecklistPage })));
const PainReliefLogPage = lazy(() => import('./pages/resources/ExpansionPackPages2').then(m => ({ default: m.PainReliefLogPage })));
const PainTrackingBeforeSurgeryPage = lazy(() => import('./pages/resources/ExpansionPackPages2').then(m => ({ default: m.PainTrackingBeforeSurgeryPage })));
const ChronicFatigueSymptomLogPage = lazy(() => import('./pages/resources/ExpansionPackPages2').then(m => ({ default: m.ChronicFatigueSymptomLogPage })));
const FunctionalCapacityLogPage = lazy(() => import('./pages/resources/ExpansionPackPages2').then(m => ({ default: m.FunctionalCapacityLogPage })));
const PainDiaryForDisabilityApplicationPage = lazy(() => import('./pages/resources/ExpansionPackPages2').then(m => ({ default: m.PainDiaryForDisabilityApplicationPage })));
const SleepAndPainTrackerPage = lazy(() => import('./pages/resources/ExpansionPackPages2').then(m => ({ default: m.SleepAndPainTrackerPage })));
const PainTrackingForArthritisPage = lazy(() => import('./pages/resources/ExpansionPackPages3').then(m => ({ default: m.PainTrackingForArthritisPage })));
const PainTrackingForMigrainesPage = lazy(() => import('./pages/resources/ExpansionPackPages3').then(m => ({ default: m.PainTrackingForMigrainesPage })));
const WeatherAndPainTrackerPage = lazy(() => import('./pages/resources/ExpansionPackPages3').then(m => ({ default: m.WeatherAndPainTrackerPage })));
const ExerciseAndPainLogPage = lazy(() => import('./pages/resources/ExpansionPackPages3').then(m => ({ default: m.ExerciseAndPainLogPage })));
const FreePainTrackerAppPage = lazy(() => import('./pages/resources/ExpansionPackPages3').then(m => ({ default: m.FreePainTrackerAppPage })));
const BestPainTrackingAppPage = lazy(() => import('./pages/resources/ExpansionPackPages3').then(m => ({ default: m.BestPainTrackingAppPage })));
const PainTrackerForIphonePage = lazy(() => import('./pages/resources/ExpansionPackPages3').then(m => ({ default: m.PainTrackerForIphonePage })));
const PainJournalForKidsAndTeensPage = lazy(() => import('./pages/resources/ExpansionPackPages3').then(m => ({ default: m.PainJournalForKidsAndTeensPage })));
const PainDiaryTemplateFreeDownloadPage = lazy(() => import('./pages/resources/ExpansionPackPages3').then(m => ({ default: m.PainDiaryTemplateFreeDownloadPage })));
const ChronicPainSelfCareLogPage = lazy(() => import('./pages/resources/ExpansionPackPages3').then(m => ({ default: m.ChronicPainSelfCareLogPage })));
const PainTrackingForBackPainPage = lazy(() => import('./pages/resources/ExpansionPackPages4').then(m => ({ default: m.PainTrackingForBackPainPage })));
const PainTrackingForNervePainPage = lazy(() => import('./pages/resources/ExpansionPackPages4').then(m => ({ default: m.PainTrackingForNervePainPage })));
const PainTrackerForAndroidPage = lazy(() => import('./pages/resources/ExpansionPackPages4').then(m => ({ default: m.PainTrackerForAndroidPage })));
const PainDiaryForWorkersCompensationPage = lazy(() => import('./pages/resources/ExpansionPackPages4').then(m => ({ default: m.PainDiaryForWorkersCompensationPage })));
const PainDiaryForRheumatologistPage = lazy(() => import('./pages/resources/ExpansionPackPages4').then(m => ({ default: m.PainDiaryForRheumatologistPage })));
const PainLogForPhysicalTherapyPage = lazy(() => import('./pages/resources/ExpansionPackPages4').then(m => ({ default: m.PainLogForPhysicalTherapyPage })));
const ChronicPainMedicationLogPage = lazy(() => import('./pages/resources/ExpansionPackPages4').then(m => ({ default: m.ChronicPainMedicationLogPage })));
const DailySymptomTrackerPage = lazy(() => import('./pages/resources/ExpansionPackPages4').then(m => ({ default: m.DailySymptomTrackerPage })));
const PainTrackingAppForSeniorsPage = lazy(() => import('./pages/resources/ExpansionPackPages4').then(m => ({ default: m.PainTrackingAppForSeniorsPage })));
const PainDiaryForPersonalInjuryClaimPage = lazy(() => import('./pages/resources/ExpansionPackPages4').then(m => ({ default: m.PainDiaryForPersonalInjuryClaimPage })));
const PainTrackingForLupusPage = lazy(() => import('./pages/resources/ExpansionPackPages5').then(m => ({ default: m.PainTrackingForLupusPage })));
const PainTrackingForEndometriosisPage = lazy(() => import('./pages/resources/ExpansionPackPages5').then(m => ({ default: m.PainTrackingForEndometriosisPage })));
const PainTrackerForIpadPage = lazy(() => import('./pages/resources/ExpansionPackPages5').then(m => ({ default: m.PainTrackerForIpadPage })));
const PainDiaryForSocialSecurityDisabilityPage = lazy(() => import('./pages/resources/ExpansionPackPages5').then(m => ({ default: m.PainDiaryForSocialSecurityDisabilityPage })));
const PainDiaryForLongTermDisabilityPage = lazy(() => import('./pages/resources/ExpansionPackPages5').then(m => ({ default: m.PainDiaryForLongTermDisabilityPage })));
const PainTrackingForCancerPainPage = lazy(() => import('./pages/resources/ExpansionPackPages5').then(m => ({ default: m.PainTrackingForCancerPainPage })));
const PainTrackingForEhlersDanlosPage = lazy(() => import('./pages/resources/ExpansionPackPages5').then(m => ({ default: m.PainTrackingForEhlersDanlosPage })));
const PainDiaryForPhysiotherapistPage = lazy(() => import('./pages/resources/ExpansionPackPages5').then(m => ({ default: m.PainDiaryForPhysiotherapistPage })));
const PainManagementJournalPage = lazy(() => import('./pages/resources/ExpansionPackPages5').then(m => ({ default: m.PainManagementJournalPage })));
const PainTrackingForMsPage = lazy(() => import('./pages/resources/ExpansionPackPages5').then(m => ({ default: m.PainTrackingForMsPage })));
const PainTrackingForCrpsPage = lazy(() => import('./pages/resources/ExpansionPackPages6').then(m => ({ default: m.PainTrackingForCrpsPage })));
const PainTrackingForSciaticaPage = lazy(() => import('./pages/resources/ExpansionPackPages6').then(m => ({ default: m.PainTrackingForSciaticaPage })));
const PainTrackingAfterSurgeryPage = lazy(() => import('./pages/resources/ExpansionPackPages6').then(m => ({ default: m.PainTrackingAfterSurgeryPage })));
const PainDiaryForGpAppointmentPage = lazy(() => import('./pages/resources/ExpansionPackPages6').then(m => ({ default: m.PainDiaryForGpAppointmentPage })));
const PainTrackingForHeadachesPage = lazy(() => import('./pages/resources/ExpansionPackPages6').then(m => ({ default: m.PainTrackingForHeadachesPage })));
const PainTrackingForHipPainPage = lazy(() => import('./pages/resources/ExpansionPackPages6').then(m => ({ default: m.PainTrackingForHipPainPage })));
const PainTrackingForShoulderPainPage = lazy(() => import('./pages/resources/ExpansionPackPages6').then(m => ({ default: m.PainTrackingForShoulderPainPage })));
const ChronicPainFlareTrackerPage = lazy(() => import('./pages/resources/ExpansionPackPages6').then(m => ({ default: m.ChronicPainFlareTrackerPage })));
const PainDiaryTemplateForInsurancePage = lazy(() => import('./pages/resources/ExpansionPackPages6').then(m => ({ default: m.PainDiaryTemplateForInsurancePage })));
const PainTrackerForDesktopPage = lazy(() => import('./pages/resources/ExpansionPackPages6').then(m => ({ default: m.PainTrackerForDesktopPage })));

const LoadingFallback = () => {
  return <BlackBoxSplashScreen message="Loading..." />;
};

function isDevTestModeEnabled(): boolean {
  if (!import.meta.env.DEV) {
    return false;
  }

  try {
    return (
      (globalThis as unknown as { __pt_test_mode?: boolean }).__pt_test_mode === true ||
      localStorage.getItem('pt:test_mode') === '1'
    );
  } catch {
    return false;
  }
}

function App() {
  const [showSplash, setShowSplash] = useState(() => !isDevTestModeEnabled());
  const userId = getLocalUserId();

  // Ritual: Show splash screen for at least 2.5s on startup
  useEffect(() => {
    if (!showSplash) {
      return undefined;
    }

    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, [showSplash]);

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
      <ThemeProvider>
        <SubscriptionProvider userId={userId}>
          <TraumaInformedProvider>
            <ToastProvider>
              <AuditSinkAlertBridge />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                      {/* Landing Page - Public */}
                      <Route path="/" element={<LandingPage />} />

                      {/* Pricing Page - Public */}
                      <Route path="/pricing" element={<PricingPage />} />

                      {/* Category and intent pages - Public */}
                      <Route path="/pain-tracker-app" element={<PainTrackerAppPage />} />
                      <Route path="/pain-tracking-app" element={<PainTrackingAppPage />} />
                      <Route path="/pain-management-tracker" element={<PainManagementTrackerPage />} />
                      <Route path="/pain-locator-app" element={<PainLocatorAppPage />} />
                      <Route path="/share-pain-records-with-doctor-without-giving-an-app-your-data" element={<SharePainRecordsPrivatelyPage />} />
                      <Route path="/pain-diary-template" element={<PainDiaryTemplatePage />} />
                      <Route path="/pain-tracking-apps-comparison" element={<PainTrackingAppsComparisonPage />} />
                      <Route path="/privacy-offline-first-pain-tracker" element={<PrivacyOfflineFirstPainTrackerPage />} />

                      {/* CNET Download URL - Public */}
                      <Route path="/cnet-download" element={<CnetDownloadPage />} />

                      {/* Whitepaper Download - Public */}
                      <Route path="/whitepaper" element={<WhitepaperPage />} />

                      {/* Overton Framework (canonical provenance) - Public */}
                      <Route path="/overton-framework" element={<OvertonFrameworkPage />} />

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
                          <StartRedirect />
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

                    {/* Privacy Architecture - Public */}
                    <Route path="/privacy-architecture" element={<PrivacyArchitecturePage />} />

                    {/* Privacy Policy - Public */}
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />

                    {/* Tracking & Data Policy - Public */}
                    <Route path="/tracking-data-policy" element={<TrackingDataPolicyPage />} />

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
                    <Route path="/resources/pain-diary-for-doctor-visits" element={<PainDiaryForDoctorVisitsPage />} />
                    <Route path="/resources/symptom-journal-template" element={<SymptomJournalTemplatePage />} />
                    <Route path="/resources/chronic-pain-log-printable" element={<ChronicPainLogPrintablePage />} />
                    <Route path="/resources/pain-journal-examples" element={<PainJournalExamplesPage />} />
                    <Route path="/resources/weekly-pain-tracker-printable" element={<WeeklyPainTrackerPrintablePage />} />
                    <Route path="/resources/medication-and-pain-log" element={<MedicationAndPainLogPage />} />
                    <Route path="/resources/flare-up-tracker-printable" element={<FlareUpTrackerPrintablePage />} />
                    <Route path="/resources/doctor-visit-pain-summary-template" element={<DoctorVisitPainSummaryTemplatePage />} />
                    <Route path="/resources/body-pain-chart-template" element={<BodyPainChartTemplatePage />} />
                    <Route path="/resources/chronic-pain-journal-template" element={<ChronicPainJournalTemplateExpansionPage />} />
                    <Route path="/resources/how-to-start-a-pain-journal" element={<HowToStartPainJournalPage />} />
                    <Route path="/resources/how-to-describe-pain" element={<HowToDescribePainPage />} />
                    <Route path="/resources/how-to-track-pain-triggers" element={<HowToTrackPainTriggersPage />} />
                    <Route path="/resources/pain-tracking-for-fibromyalgia" element={<PainTrackingForFibromyalgiaPage />} />
                    <Route path="/resources/how-to-use-pain-scale" element={<HowToUsePainScalePage />} />
                    <Route path="/resources/pain-diary-for-insurance-claims" element={<PainDiaryForInsuranceClaimsPage />} />
                    <Route path="/resources/printable-symptom-checklist" element={<PrintableSymptomChecklistPage />} />
                    <Route path="/resources/pain-relief-log" element={<PainReliefLogPage />} />
                    <Route path="/resources/pain-tracking-before-surgery" element={<PainTrackingBeforeSurgeryPage />} />
                    <Route path="/resources/chronic-fatigue-symptom-log" element={<ChronicFatigueSymptomLogPage />} />
                    <Route path="/resources/functional-capacity-log" element={<FunctionalCapacityLogPage />} />
                    <Route path="/resources/pain-diary-for-disability-application" element={<PainDiaryForDisabilityApplicationPage />} />
                    <Route path="/resources/sleep-and-pain-tracker" element={<SleepAndPainTrackerPage />} />
                    <Route path="/resources/pain-tracking-for-arthritis" element={<PainTrackingForArthritisPage />} />
                    <Route path="/resources/pain-tracking-for-migraines" element={<PainTrackingForMigrainesPage />} />
                    <Route path="/resources/weather-and-pain-tracker" element={<WeatherAndPainTrackerPage />} />
                    <Route path="/resources/exercise-and-pain-log" element={<ExerciseAndPainLogPage />} />
                    <Route path="/resources/free-pain-tracker-app" element={<FreePainTrackerAppPage />} />
                    <Route path="/resources/best-pain-tracking-app" element={<BestPainTrackingAppPage />} />
                    <Route path="/resources/pain-tracker-for-iphone" element={<PainTrackerForIphonePage />} />
                    <Route path="/resources/pain-journal-for-kids-and-teens" element={<PainJournalForKidsAndTeensPage />} />
                    <Route path="/resources/pain-diary-template-free-download" element={<PainDiaryTemplateFreeDownloadPage />} />
                    <Route path="/resources/chronic-pain-self-care-log" element={<ChronicPainSelfCareLogPage />} />
                    <Route path="/resources/pain-tracking-for-back-pain" element={<PainTrackingForBackPainPage />} />
                    <Route path="/resources/pain-tracking-for-nerve-pain" element={<PainTrackingForNervePainPage />} />
                    <Route path="/resources/pain-tracker-for-android" element={<PainTrackerForAndroidPage />} />
                    <Route path="/resources/pain-diary-for-workers-compensation" element={<PainDiaryForWorkersCompensationPage />} />
                    <Route path="/resources/pain-diary-for-rheumatologist" element={<PainDiaryForRheumatologistPage />} />
                    <Route path="/resources/pain-log-for-physical-therapy" element={<PainLogForPhysicalTherapyPage />} />
                    <Route path="/resources/chronic-pain-medication-log" element={<ChronicPainMedicationLogPage />} />
                    <Route path="/resources/daily-symptom-tracker" element={<DailySymptomTrackerPage />} />
                    <Route path="/resources/pain-tracking-app-for-seniors" element={<PainTrackingAppForSeniorsPage />} />
                    <Route path="/resources/pain-diary-for-personal-injury-claim" element={<PainDiaryForPersonalInjuryClaimPage />} />
                    <Route path="/resources/pain-tracking-for-lupus" element={<PainTrackingForLupusPage />} />
                    <Route path="/resources/pain-tracking-for-endometriosis" element={<PainTrackingForEndometriosisPage />} />
                    <Route path="/resources/pain-tracker-for-ipad" element={<PainTrackerForIpadPage />} />
                    <Route path="/resources/pain-diary-for-social-security-disability" element={<PainDiaryForSocialSecurityDisabilityPage />} />
                    <Route path="/resources/pain-diary-for-long-term-disability" element={<PainDiaryForLongTermDisabilityPage />} />
                    <Route path="/resources/pain-tracking-for-cancer-pain" element={<PainTrackingForCancerPainPage />} />
                    <Route path="/resources/pain-tracking-for-ehlers-danlos" element={<PainTrackingForEhlersDanlosPage />} />
                    <Route path="/resources/pain-diary-for-physiotherapist" element={<PainDiaryForPhysiotherapistPage />} />
                    <Route path="/resources/pain-management-journal" element={<PainManagementJournalPage />} />
                    <Route path="/resources/pain-tracking-for-ms" element={<PainTrackingForMsPage />} />
                    <Route path="/resources/pain-tracking-for-crps" element={<PainTrackingForCrpsPage />} />
                    <Route path="/resources/pain-tracking-for-sciatica" element={<PainTrackingForSciaticaPage />} />
                    <Route path="/resources/pain-tracking-after-surgery" element={<PainTrackingAfterSurgeryPage />} />
                    <Route path="/resources/pain-diary-for-gp-appointment" element={<PainDiaryForGpAppointmentPage />} />
                    <Route path="/resources/pain-tracking-for-headaches" element={<PainTrackingForHeadachesPage />} />
                    <Route path="/resources/pain-tracking-for-hip-pain" element={<PainTrackingForHipPainPage />} />
                    <Route path="/resources/pain-tracking-for-shoulder-pain" element={<PainTrackingForShoulderPainPage />} />
                    <Route path="/resources/chronic-pain-flare-tracker" element={<ChronicPainFlareTrackerPage />} />
                    <Route path="/resources/pain-diary-template-for-insurance" element={<PainDiaryTemplateForInsurancePage />} />
                    <Route path="/resources/pain-tracker-for-desktop" element={<PainTrackerForDesktopPage />} />
                    <Route path="/offline-pain-tracker-app" element={<OfflinePainTrackerAppPage />} />

                    {/* Fallback - redirect to landing */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ToastProvider>
          </TraumaInformedProvider>
        </SubscriptionProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
