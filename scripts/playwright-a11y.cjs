const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  // Default pages — can be overridden with PLAYWRIGHT_PAGES as a comma-separated list
  const defaultPages = ['/', '/pain-tracker/', '/pain-tracker/dashboard', '/pain-tracker/charts', '/pain-tracker/entry', '/pain-tracker/settings'];
  const pagesEnv = process.env.PLAYWRIGHT_PAGES;
  const pages = pagesEnv ? pagesEnv.split(',').map(s => s.trim()).filter(Boolean) : defaultPages;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const results = [];

  // Load axe source from node_modules if available
  let axeSource = '';
  try {
    axeSource = fs.readFileSync(path.join(__dirname, '..', 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');
  } catch (e) {
    console.error('axe-core not found in node_modules. Install with `npm i -D axe-core`');
    process.exit(2);
  }

  for (const p of pages) {
    // Normalize with URL to avoid duplicated path segments. Ensure path is absolute when passed to URL.
    const pathForUrl = p.startsWith('/') ? p : `/${p}`;
    const url = new URL(pathForUrl, base).toString();
    const page = await context.newPage();
    try {
      console.log('Visiting', url);
      const resp = await page.goto(url, { waitUntil: 'load', timeout: 20000 });
      if (!resp || resp.status() >= 400) {
        console.warn('Failed to load', url, resp ? resp.status() : 'no response');
        results.push({ url, error: 'failed to load' });
        await page.close();
        continue;
      }

      // Inject axe
      await page.addScriptTag({ content: axeSource });
      // Run axe
      const raw = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        return await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } });
      });
      results.push({ url, axe: raw });
      console.log('axe results for', url, raw.violations.length, 'violations');
    } catch (e) {
      console.error('Error auditing', url, e.message || e);
      results.push({ url, error: String(e) });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Print summary and build HTML report
  const reportLines = [];
  reportLines.push('<!doctype html>');
  reportLines.push('<html><head><meta charset="utf-8"><title>Playwright Axe Report</title>');
  reportLines.push('<style>body{font-family:sans-serif;margin:20px}h1{font-size:20px}pre{background:#f5f5f5;padding:10px;overflow:auto} .violation{border-left:4px solid #e53e3e;padding:8px;margin:8px 0}</style>');
  reportLines.push('</head><body>');
  reportLines.push('<h1>Playwright Axe Report</h1>');
  reportLines.push(`<p>Base: ${base}</p>`);

  for (const r of results) {
    if (r.error) {
      console.log('PAGE', r.url, 'ERROR', r.error);
      reportLines.push(`<h2>${r.url} — ERROR</h2><pre>${String(r.error)}</pre>`);
      continue;
    }

    reportLines.push(`<h2>${r.url}</h2>`);
    reportLines.push(`<p>Total violations: ${r.axe.violations.length}</p>`);

    if (r.axe.violations.length === 0) {
      reportLines.push('<p style="color:green">No violations found</p>');
      continue;
    }

    for (const v of r.axe.violations) {
      reportLines.push(`<div class="violation"><h3>${v.id} — ${v.impact || 'unknown'}</h3>`);
      reportLines.push(`<p>${v.description}</p>`);
      reportLines.push('<ul>');
      for (const node of v.nodes) {
        reportLines.push(`<li><strong>targets:</strong> ${node.target.join(', ')}<br/><pre>${(node.failureSummary || node.html).replace(/</g, '&lt;')}</pre></li>`);
      }
      reportLines.push('</ul></div>');
    }
  }

  reportLines.push('</body></html>');

  // Write JSON + HTML output
  try { fs.mkdirSync(path.join(__dirname, '..', 'test-results'), { recursive: true }); } catch {}
  fs.writeFileSync(path.join(__dirname, '..', 'test-results', 'playwright-axe.json'), JSON.stringify(results, null, 2));
  fs.writeFileSync(path.join(__dirname, '..', 'test-results', 'playwright-axe.html'), reportLines.join('\n'));
  console.log('\nSaved results to test-results/playwright-axe.json and test-results/playwright-axe.html');
}

run().catch(e => { console.error(e); process.exit(2); });
