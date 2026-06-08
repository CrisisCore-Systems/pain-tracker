/**
 * SEO Components Export
 */

export { SEOPageLayout, type SEOPageContent } from './SEOPageLayout';
export { StatsBanner, type StatItem, type ColorScheme } from './StatsBanner';
export { PdfContentsPreview, type PdfPage } from './PdfContentsPreview';
export { BottomCTACallout } from './BottomCTACallout';
export { ResourceCtaStack } from './ResourceCtaStack';
export { ResourceOutcomeBridge } from './ResourceOutcomeBridge';
export { ResourceWorkflowSteps, type ResourcePageIntent } from './ResourceWorkflowSteps';
export {
  CORE_RELATED_PAIN_RESOURCE_LINKS,
  RelatedPainResourceLinks,
  TOPIC_RELATED_PAIN_RESOURCE_LINKS,
  getRelatedPainResourceLinks,
  inferRelatedPainResourceTopic,
  mergeRelatedPainResourceLinks,
  type RelatedPainResourceLink,
  type RelatedPainResourceTopic,
} from './RelatedPainResourceLinks';
