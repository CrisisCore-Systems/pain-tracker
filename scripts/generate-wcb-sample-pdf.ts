import { mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { generateWCBReport } from '../src/utils/wcb-report-generator';
import { getPDFExportService } from '../src/services/PDFExportService';

import { WCB_SAMPLE_ENTRIES } from './fixtures/wcb-sample-entries';

const OUTPUT_DIR = resolve(
  process.cwd(),
  'docs',
  'case-studies',
  'worksafe-bc',
  'generated'
);

const OUTPUT_FILE = resolve(OUTPUT_DIR, 'PainTracker-WCB-SAMPLE.pdf');

const WATERMARK_TEXT = 'SAMPLE REPORT — SYNTHETIC DATA — FOR DEMONSTRATION ONLY';

async function main(): Promise<void> {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const report = generateWCBReport(WCB_SAMPLE_ENTRIES, {
    claimNumber: 'SAMPLE-CLAIM-0000',
    injuryDate: '2025-09-01',
    returnToWorkDate: '2025-10-21',
    employerInfo: {
      name: 'Example Employer (synthetic)',
      contact: 'Example Contact (synthetic)',
      position: 'Example Role (synthetic)',
    },
  });

  const pdfService = getPDFExportService();
  const blob = await pdfService.generateWCBReport(report, { watermarkText: WATERMARK_TEXT });

  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const tmpPath = `${OUTPUT_FILE}.tmp`;
  try {
    writeFileSync(tmpPath, buffer);
    renameSync(tmpPath, OUTPUT_FILE);
    console.log(`Wrote sample WCB PDF: ${OUTPUT_FILE}`);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;

    // Windows will often lock an open PDF in the viewer/editor.
    // Fall back to a new filename so generation still succeeds.
    if (err.code === 'EBUSY' || err.code === 'EPERM') {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fallback = resolve(OUTPUT_DIR, `PainTracker-WCB-SAMPLE-${stamp}.pdf`);
      writeFileSync(fallback, buffer);
      console.log(`Target PDF was locked; wrote: ${fallback}`);
      return;
    }

    throw error;
  }
}

main().catch((error) => {
  console.error('Failed to generate sample WCB PDF:', error);
  process.exitCode = 1;
});
