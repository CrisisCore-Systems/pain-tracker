import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildSyncContentState,
  getSeriesChainContext,
  normalizeDevComparableTitle,
  resolvePostSeriesName,
  resolveSeriesProfile,
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

test('series profile resolves from matching series name', () => {
  const config = {
    series: 'Fallback Series',
    seriesStartUrl: null,
    schedule: {
      defaults: {
        series_profiles: {
          protective: {
            series: 'Protective Computing in Practice',
            chainKey: 'protective-computing-in-practice',
            startHereKey: 'start-here',
            orderedKeys: ['post-1', 'post-2'],
          },
        },
      },
      posts: [],
    },
  };

  const profile = resolveSeriesProfile({ series: 'Protective Computing in Practice' }, config);

  assert.deepEqual(profile, {
    key: 'protective',
    series: 'Protective Computing in Practice',
    chainKey: 'protective-computing-in-practice',
    startHereKey: 'start-here',
    startHereUrl: null,
    orderedKeys: ['post-1', 'post-2'],
  });

  assert.equal(resolvePostSeriesName({ series: 'Protective Computing in Practice' }, config), 'Protective Computing in Practice');
});

test('series chain context honors profile order and start-here key', () => {
  const schedule = {
    defaults: {
      series_profiles: {
        protective: {
          series: 'Protective Computing in Practice',
          chainKey: 'protective-computing-in-practice',
          startHereKey: 'overview',
          orderedKeys: ['post-2', 'post-1', 'post-3'],
        },
      },
    },
    posts: [
      { key: 'overview', devtoUrl: 'https://dev.to/example/start-here', series: null, publishAt: '2026-01-01T00:00:00Z' },
      { key: 'post-1', devtoUrl: 'https://dev.to/example/1', series: 'Protective Computing in Practice', publishAt: '2026-01-02T00:00:00Z' },
      { key: 'post-2', devtoUrl: 'https://dev.to/example/2', series: 'Protective Computing in Practice', publishAt: '2026-01-03T00:00:00Z' },
      { key: 'post-3', devtoUrl: 'https://dev.to/example/3', series: 'Protective Computing in Practice', publishAt: '2026-01-04T00:00:00Z' },
    ],
  };
  const config = { schedule, series: null, seriesStartUrl: null };

  const context = getSeriesChainContext({
    schedule,
    post: schedule.posts[2],
    config,
  });

  assert.deepEqual(context, {
    desiredSeries: 'Protective Computing in Practice',
    partLabel: 'Part 1',
    nextUpUrl: 'https://dev.to/example/1',
    seriesStartUrl: 'https://dev.to/example/start-here',
  });
});