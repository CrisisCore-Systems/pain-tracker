import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildSyncContentState,
  normalizeDevComparableTitle,
  shouldTreatSeriesAsDrift,
} from '../scripts/devto/devto.mjs';

test('Dev.to-normalized titles compare equal', () => {
  assert.equal(
    normalizeDevComparableTitle('Testing Across the Stack: UI → Storage → Encryption → Offline Resilience'),
    normalizeDevComparableTitle('Testing Across the Stack: UI Storage Encryption Offline Resilience'),
  );
});

test('CTA-disabled posts do not require CTA markers', () => {
  const state = buildSyncContentState({
    post: {
      title: 'Architecting for Vulnerability: Introducing Protective Computing Core v1.0',
      injectCtas: false,
    },
    current: {
      title: 'Architecting for Vulnerability: Introducing Protective Computing Core v1.0',
      body_markdown: [
        '<!-- pain-tracker:series-chain:start -->',
        '> Part 11 of **Protective Computing in Practice**',
        '<!-- pain-tracker:series-chain:end -->',
        '',
        '# Architecting for Vulnerability',
      ].join('\n'),
      series: null,
    },
    config: {
      sponsorUrl: 'https://example.com/sponsor',
      repoUrl: 'https://example.com/repo',
      seriesStartUrl: 'https://dev.to/example/start',
    },
    desiredSeries: 'Protective Computing in Practice',
    seriesStartUrl: 'https://dev.to/example/start',
    nextUpUrl: 'https://dev.to/example/next',
    partLabel: 'Part 11',
  });

  assert.equal(state.ctaMarkersOk, true);
  assert.equal(state.chainMarkersOk, true);
  assert.equal(state.hasFrontMatter, false);
});

test('null series does not count as drift when Forem omits series state', () => {
  assert.equal(
    shouldTreatSeriesAsDrift({
      currentSeries: null,
      desiredSeries: 'Protective Computing in Practice',
    }),
    false,
  );
});

test('posts outside a configured chain do not require series-chain markers', () => {
  const state = buildSyncContentState({
    post: {
      title: 'Pain Tracker whitepaper v1.3.0 (PDF)',
    },
    current: {
      title: 'Pain Tracker whitepaper v1.3.0 (PDF)',
      body_markdown: [
        '<!-- pain-tracker:cta-top -->',
        '<!-- pain-tracker:cta-bottom -->',
        '',
        '# Pain Tracker whitepaper v1.3.0 (PDF)',
      ].join('\n'),
      series: null,
    },
    config: {
      sponsorUrl: 'https://example.com/sponsor',
      repoUrl: 'https://example.com/repo',
      seriesStartUrl: 'https://dev.to/example/start',
    },
    desiredSeries: 'Protective Computing in Practice',
    seriesStartUrl: 'https://dev.to/example/start',
    nextUpUrl: null,
    partLabel: null,
  });

  assert.equal(state.ctaMarkersOk, true);
  assert.equal(state.chainMarkersOk, true);
});