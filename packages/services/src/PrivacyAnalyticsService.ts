import type { PainEntry } from '../../src/types';

export class PrivacyPreservingAnalyticsService {
  async trackPainEntry(_entry: PainEntry) { /* noop */ }
  async generateInsights() { return null; }
}

export const privacyAnalytics = new PrivacyPreservingAnalyticsService();
