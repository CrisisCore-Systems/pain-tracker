import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {
  applyMetricsToBoard,
  collectBoardMetrics,
  resolveResourceSlug,
} from '../scripts/seo/generate-resource-command-board.mjs';

test('resolveResourceSlug supports resource URLs, paths, and labels', () => {
  assert.equal(resolveResourceSlug('https://www.paintracker.ca/resources/monthly-pain-tracker-printable'), 'monthly-pain-tracker-printable');
  assert.equal(resolveResourceSlug('/resources'), 'index');
  assert.equal(resolveResourceSlug('WorkSafeBC pain journal template'), 'worksafebc-pain-journal-template');
  assert.equal(resolveResourceSlug('not-a-known-page'), null);
});

test('collectBoardMetrics joins search console and rollups by resource slug', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'resource-board-'));

  try {
    const searchConsolePath = path.join(tempDir, 'search-console.csv');
    const ctaPath = path.join(tempDir, 'cta.json');
    const firstLogsPath = path.join(tempDir, 'first-logs.csv');
    const exportsPath = path.join(tempDir, 'exports.json');

    await fs.writeFile(
      searchConsolePath,
      ['Page,Clicks,Impressions', 'https://www.paintracker.ca/resources/monthly-pain-tracker-printable,12,340', 'https://www.paintracker.ca/resources/how-to-track-pain-for-doctors,9,210'].join('\n'),
      'utf8',
    );

    await fs.writeFile(
      ctaPath,
      JSON.stringify([
        { resource_page_slug: 'monthly-pain-tracker-printable', count: 5 },
        { page: '/resources/how-to-track-pain-for-doctors', total: 4 },
      ]),
      'utf8',
    );

    await fs.writeFile(
      firstLogsPath,
      ['slug,count', 'monthly-pain-tracker-printable,2', 'how-to-track-pain-for-doctors,1'].join('\n'),
      'utf8',
    );

    await fs.writeFile(
      exportsPath,
      JSON.stringify({
        rows: [
          { slug: 'monthly-pain-tracker-printable', value: 1 },
          { slug: 'how-to-track-pain-for-doctors', value: 0 },
        ],
      }),
      'utf8',
    );

    const metrics = collectBoardMetrics({
      searchConsolePath,
      ctaPath,
      firstLogsPath,
      exportsPath,
    });

    assert.deepEqual(metrics.get('monthly-pain-tracker-printable'), {
      impressions: 340,
      clicks: 12,
      ctaClicks: 5,
      firstLogs: 2,
      exportClicks: 1,
    });

    const board = [
      '| Page | Search intent | Impressions | Clicks | CTA clicks | First logs | Export clicks |',
      '| ---- | ------------- | ----------: | -----: | ---------: | ---------: | ------------: |',
      '| Monthly pain tracker printable | Printable monthly tracking for appointments and review | pending import | pending import | pending import | pending import | pending import |',
      '| How to track pain for doctors | Appointment-prep and doctor communication guidance | pending import | pending import | pending import | pending import | pending import |',
    ].join('\n');

    const updatedBoard = applyMetricsToBoard(board, metrics);

    assert.match(updatedBoard, /\| Monthly pain tracker printable \| Printable monthly tracking for appointments and review \| 340 \| 12 \| 5 \| 2 \| 1 \|/);
    assert.match(updatedBoard, /\| How to track pain for doctors \| Appointment-prep and doctor communication guidance \| 210 \| 9 \| 4 \| 1 \| 0 \|/);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});