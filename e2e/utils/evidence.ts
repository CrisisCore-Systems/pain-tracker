import fs from 'node:fs';
import path from 'node:path';
import type { Download, Page } from '@playwright/test';

function normalizeEvidenceDir(raw: string): string {
  // Accept absolute or relative paths; always resolve to an absolute path.
  // Avoid over-sanitizing: this is a local-only developer workflow.
  return path.resolve(raw);
}

export function getEvidenceDir(): string | null {
  const raw = process.env.EVIDENCE_DIR;
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return normalizeEvidenceDir(trimmed);
}

export function evidenceEnabled(): boolean {
  return getEvidenceDir() !== null;
}

export function ensureEvidenceSubdir(...subpath: string[]): string | null {
  const base = getEvidenceDir();
  if (!base) return null;
  const dir = path.join(base, ...subpath);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function writeEvidenceText(relativePath: string, contents: string): string | null {
  const base = getEvidenceDir();
  if (!base) return null;
  const outPath = path.join(base, relativePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, contents, { encoding: 'utf8' });
  return outPath;
}

export async function saveEvidenceScreenshot(page: Page, relativePath: string): Promise<string | null> {
  const base = getEvidenceDir();
  if (!base) return null;
  const outPath = path.join(base, relativePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await page.screenshot({ path: outPath, fullPage: true });
  return outPath;
}

export async function saveEvidenceDownload(download: Download, relativePath: string): Promise<string | null> {
  const base = getEvidenceDir();
  if (!base) return null;
  const outPath = path.join(base, relativePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await download.saveAs(outPath);
  return outPath;
}
