import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '../../src/types/vercel';
import { logError } from '../../api-lib/http.js';

type GscProperty = {
  label: string;
  siteUrl: string;
};

type SearchConsoleRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type SearchConsoleResponse = {
  rows?: SearchConsoleRow[];
};

type DashboardRow = {
  propertyLabel: string;
  propertyUrl: string;
  page: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  previousClicks: number;
  previousImpressions: number;
  clickDelta: number;
  impressionDelta: number;
  opportunityScore: number;
};

type DateWindow = {
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
  days: number;
};

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SEARCH_CONSOLE_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const SEARCH_CONSOLE_API_ROOT = 'https://searchconsole.googleapis.com/webmasters/v3/sites';

const DEFAULT_PROPERTIES: GscProperty[] = [
  { label: 'PainTracker', siteUrl: 'https://www.paintracker.ca/' },
  { label: 'PainTracker Blog', siteUrl: 'https://blog.paintracker.ca/' },
  { label: 'CrisisCore Systems', siteUrl: 'https://crisiscore-systems.ca/' },
  { label: 'Protective Computing', siteUrl: 'https://protective-computing.github.io/' },
];

function sendJson(res: VercelResponse, status: number, payload: unknown): void {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(payload);
}

function getBearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization;
  const value = Array.isArray(header) ? header[0] : header;
  if (!value || !value.startsWith('Bearer ')) return null;
  return value.slice('Bearer '.length).trim();
}

function assertDashboardAccess(req: VercelRequest): boolean {
  const expected = process.env.SEO_DASHBOARD_TOKEN;
  if (!expected) return false;
  const actual = getBearerToken(req);
  if (!actual) return false;
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function base64Url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function normalizePrivateKey(raw: string): string {
  return raw.replace(/\\n/g, '\n');
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildDateWindow(daysRaw: string | string[] | undefined): DateWindow {
  const raw = Array.isArray(daysRaw) ? daysRaw[0] : daysRaw;
  const days = Math.min(Math.max(Number.parseInt(raw || '28', 10) || 28, 7), 90);
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 2);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days + 1);
  const previousEnd = new Date(start);
  previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setUTCDate(previousStart.getUTCDate() - days + 1);
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
    previousStartDate: formatDate(previousStart),
    previousEndDate: formatDate(previousEnd),
    days,
  };
}

function readProperties(): GscProperty[] {
  const raw = process.env.GSC_PROPERTIES_JSON;
  if (!raw) return DEFAULT_PROPERTIES;
  try {
    const parsed = JSON.parse(raw) as GscProperty[];
    const valid = parsed.filter(item =>
      typeof item?.label === 'string' &&
      item.label.trim().length > 0 &&
      typeof item?.siteUrl === 'string' &&
      item.siteUrl.trim().length > 0,
    );
    return valid.length > 0 ? valid : DEFAULT_PROPERTIES;
  } catch {
    return DEFAULT_PROPERTIES;
  }
}

async function getAccessToken(): Promise<string> {
  const clientEmail = process.env.GSC_CLIENT_EMAIL;
  const privateKey = process.env.GSC_PRIVATE_KEY;
  if (!clientEmail || !privateKey) {
    throw new Error('Missing GSC service account credentials');
  }
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: clientEmail,
    scope: SEARCH_CONSOLE_SCOPE,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claimSet))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(normalizePrivateKey(privateKey));
  const assertion = `${unsigned}.${base64Url(signature)}`;
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  if (!response.ok) {
    throw new Error(`Google OAuth token request failed with ${response.status}`);
  }
  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) {
    throw new Error('Google OAuth token response did not include access_token');
  }
  return payload.access_token;
}

async function querySearchConsole(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string,
): Promise<SearchConsoleRow[]> {
  const endpoint = `${SEARCH_CONSOLE_API_ROOT}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ['page', 'query'],
      rowLimit: 25000,
      startRow: 0,
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Search Console query failed for ${siteUrl} with ${response.status}: ${detail.slice(0, 240)}`);
  }
  const payload = (await response.json()) as SearchConsoleResponse;
  return payload.rows || [];
}

function rowKey(row: SearchConsoleRow): string {
  const page = row.keys?.[0] || '';
  const query = row.keys?.[1] || '';
  return `${page}\n${query}`;
}

function scoreOpportunity(impressions: number, ctr: number, position: number, clickDelta: number): number {
  const ctrGap = Math.max(0, 0.05 - ctr) * 100;
  const positionWindow = position >= 4 && position <= 20 ? 1 : 0.35;
  const impressionWeight = Math.log10(Math.max(impressions, 1) + 1);
  const decayPenalty = clickDelta < 0 ? Math.abs(clickDelta) * 0.75 : 0;
  return Number(((ctrGap * impressionWeight * positionWindow) + decayPenalty).toFixed(2));
}

function mergeRows(property: GscProperty, current: SearchConsoleRow[], previous: SearchConsoleRow[]): DashboardRow[] {
  const previousByKey = new Map(previous.map(row => [rowKey(row), row]));
  return current.map(row => {
    const key = rowKey(row);
    const prev = previousByKey.get(key);
    const page = row.keys?.[0] || '';
    const query = row.keys?.[1] || '';
    const clicks = Number(row.clicks || 0);
    const impressions = Number(row.impressions || 0);
    const ctr = Number(row.ctr || 0);
    const position = Number(row.position || 0);
    const previousClicks = Number(prev?.clicks || 0);
    const previousImpressions = Number(prev?.impressions || 0);
    const clickDelta = clicks - previousClicks;
    const impressionDelta = impressions - previousImpressions;
    return {
      propertyLabel: property.label,
      propertyUrl: property.siteUrl,
      page,
      query,
      clicks,
      impressions,
      ctr,
      position,
      previousClicks,
      previousImpressions,
      clickDelta,
      impressionDelta,
      opportunityScore: scoreOpportunity(impressions, ctr, position, clickDelta),
    };
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }
  if (!process.env.SEO_DASHBOARD_TOKEN) {
    sendJson(res, 500, { ok: false, error: 'SEO dashboard token is not configured' });
    return;
  }
  if (!assertDashboardAccess(req)) {
    sendJson(res, 401, { ok: false, error: 'Unauthorized' });
    return;
  }
  const dateWindow = buildDateWindow(req.query?.days);
  const properties = readProperties();
  try {
    const accessToken = await getAccessToken();
    const propertyResults = await Promise.allSettled(
      properties.map(async property => {
        const [current, previous] = await Promise.all([
          querySearchConsole(accessToken, property.siteUrl, dateWindow.startDate, dateWindow.endDate),
          querySearchConsole(accessToken, property.siteUrl, dateWindow.previousStartDate, dateWindow.previousEndDate),
        ]);
        return { property, rows: mergeRows(property, current, previous) };
      }),
    );
    const rows: DashboardRow[] = [];
    const errors: Array<{ property: string; error: string }> = [];
    propertyResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        rows.push(...result.value.rows);
      } else {
        errors.push({
          property: properties[index]?.label || 'unknown',
          error: result.reason instanceof Error ? result.reason.message : String(result.reason),
        });
      }
    });
    rows.sort((a, b) => b.opportunityScore - a.opportunityScore || b.impressions - a.impressions);
    const totals = rows.reduce(
      (acc, row) => {
        acc.clicks += row.clicks;
        acc.impressions += row.impressions;
        acc.previousClicks += row.previousClicks;
        acc.previousImpressions += row.previousImpressions;
        return acc;
      },
      { clicks: 0, impressions: 0, previousClicks: 0, previousImpressions: 0 },
    );
    sendJson(res, 200, {
      ok: true,
      generatedAt: new Date().toISOString(),
      dateWindow,
      properties,
      totals: {
        ...totals,
        ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0,
        previousCtr: totals.previousImpressions > 0 ? totals.previousClicks / totals.previousImpressions : 0,
        clickDelta: totals.clicks - totals.previousClicks,
        impressionDelta: totals.impressions - totals.previousImpressions,
      },
      rows,
      errors,
    });
  } catch (error) {
    logError('[api/seo/gsc-performance] request failed', error);
    sendJson(res, 502, {
      ok: false,
      error: error instanceof Error ? error.message : 'Search Console dashboard request failed',
    });
  }
}
