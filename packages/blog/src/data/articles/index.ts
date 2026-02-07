export type { SchemaType, ArticleSection, FAQ, HowToStep, ArticleData, InternalLinks } from './types';

import offlinePainDiary from './offline-pain-diary';
import privatePainTracker from './private-pain-tracker';
import painLogForDoctors from './pain-log-for-doctors';
import trackChronicPainSymptoms from './track-chronic-pain-symptoms';
import cloudVsLocalPainTracking from './cloud-vs-local-pain-tracking';
import whyOfflineHealthAppsMatter from './why-offline-health-apps-matter';
import canDoctorsTrustOfflineDiaries from './can-doctors-trust-offline-diaries';
import encryptedHealthDataSafety from './encrypted-health-data-safety';
import zeroCloudMedicalPrivacy from './zero-cloud-medical-privacy';
import painDiaryTemplate from './pain-diary-template';
import whatDoctorsLookForSymptomJournals from './what-doctors-look-for-symptom-journals';
import exportPainLogsPdf from './export-pain-logs-pdf';
import painTrackingInsuranceEvidence from './pain-tracking-insurance-evidence';
import howDetailedPainDiary from './how-detailed-pain-diary';
import painTrackingFibromyalgia from './pain-tracking-fibromyalgia';
import migraineSymptomDiary from './migraine-symptom-diary';
import trackingFlareUpsChronicIllness from './tracking-flare-ups-chronic-illness';
import identifyingPainTriggers from './identifying-pain-triggers';
import paperVsAppPainDiary from './paper-vs-app-pain-diary';
import bestPainTrackingApps from './best-pain-tracking-apps';
import securityArchitecture from './security-architecture';
import localOnlyEncryptionExplained from './local-only-encryption-explained';
import healthDataThreatModel from './health-data-threat-model';
import accessibilityInPainTracking from './accessibility-in-pain-tracking';
import whyPaintrackerIsOpenSource from './why-paintracker-is-open-source';
import gettingStarted from './getting-started';
import paintrackerWorksafebcClaims from './paintracker-worksafebc-claims';
import preparingPhysiotherapyPainLogs from './preparing-physiotherapy-pain-logs';
import trackingRecoveryAfterInjury from './tracking-recovery-after-injury';
import sharingSymptomDataSafely from './sharing-symptom-data-safely';

import type { ArticleData } from './types';
import { linkingMap, getLinksForArticle, PILLAR_URLS, PILLAR_LABELS, APP_CTA_URL } from './linking-map';

// Re-export linking utilities
export { linkingMap, getLinksForArticle, PILLAR_URLS, PILLAR_LABELS, APP_CTA_URL };

// ── Build article list with linking data injected ────────────────────

function withLinks(article: ArticleData): ArticleData {
  const links = getLinksForArticle(article.slug);
  return links ? { ...article, internalLinks: links } : article;
}

export const articles: ArticleData[] = [
  // Pillar pages
  offlinePainDiary,
  privatePainTracker,
  painLogForDoctors,
  trackChronicPainSymptoms,
  // Privacy cluster
  cloudVsLocalPainTracking,
  whyOfflineHealthAppsMatter,
  encryptedHealthDataSafety,
  zeroCloudMedicalPrivacy,
  painDiaryTemplate,
  // Clinical cluster
  canDoctorsTrustOfflineDiaries,
  whatDoctorsLookForSymptomJournals,
  exportPainLogsPdf,
  painTrackingInsuranceEvidence,
  howDetailedPainDiary,
  // Chronic cluster
  painTrackingFibromyalgia,
  migraineSymptomDiary,
  trackingFlareUpsChronicIllness,
  identifyingPainTriggers,
  // Comparison cluster
  paperVsAppPainDiary,
  bestPainTrackingApps,
  // Transparency cluster
  securityArchitecture,
  localOnlyEncryptionExplained,
  healthDataThreatModel,
  accessibilityInPainTracking,
  whyPaintrackerIsOpenSource,
  // Utility cluster
  gettingStarted,
  paintrackerWorksafebcClaims,
  preparingPhysiotherapyPainLogs,
  trackingRecoveryAfterInjury,
  sharingSymptomDataSafely,
].map(withLinks);

export function getArticleBySlug(slug: string): ArticleData | undefined {
  return articles.find((a) => a.slug === slug);
}
