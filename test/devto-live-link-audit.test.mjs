import test from 'node:test';
import assert from 'node:assert/strict';

import {
  extractLinks,
  parseSitemapPaths,
  readTargetLinkBlock,
} from '../scripts/devto/live-link-audit.mjs';

test('live link audit extracts linked and bare URLs without double-counting markdown targets', () => {
  const markdown = [
    '[PainTracker](https://paintracker.ca/download)',
    '<a href="https://paintracker.ca/privacy">Privacy</a>',
    'Bare: https://github.com/CrisisCore-Systems/pain-tracker.',
  ].join('\n');

  const { links, bareUrls } = extractLinks(markdown);

  assert.deepEqual(
    links.map((link) => [link.kind, link.url, link.line]),
    [
      ['markdown', 'https://paintracker.ca/download', 1],
      ['html', 'https://paintracker.ca/privacy', 2],
      ['bare', 'https://github.com/CrisisCore-Systems/pain-tracker', 3],
    ],
  );
  assert.deepEqual(bareUrls, [
    {
      url: 'https://github.com/CrisisCore-Systems/pain-tracker',
      line: 3,
    },
  ]);
});

test('live link audit reads target-link blocks', () => {
  const markdown = [
    '<!-- pain-tracker:target-link:start -->',
    '> Check the data boundary: [tracking data policy](https://paintracker.ca/tracking-data-policy)',
    '<!-- pain-tracker:target-link:end -->',
  ].join('\n');

  assert.deepEqual(readTargetLinkBlock(markdown), {
    count: 1,
    cue: 'Check the data boundary',
    anchorText: 'tracking data policy',
    url: 'https://paintracker.ca/tracking-data-policy',
    path: '/tracking-data-policy',
  });
});

test('live link audit parses paintracker.ca sitemap paths', () => {
  const paths = parseSitemapPaths([
    '<urlset>',
    '<url><loc>https://www.paintracker.ca/download</loc></url>',
    '<url><loc>https://paintracker.ca/resources/</loc></url>',
    '<url><loc>https://example.com/ignored</loc></url>',
    '</urlset>',
  ].join(''));

  assert.deepEqual([...paths].sort(), ['/download', '/resources']);
});
