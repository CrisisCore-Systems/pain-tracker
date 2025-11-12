/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const pages = ['/', '/dashboard'];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const results = [];

  // Load axe source
  const axeSource = fs.readFileSync(path.join(__dirname, '..', 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');

  for (const p of pages) {
    const url = `${base.replace(/\/$/, '')}${p}`;
    const page = await context.newPage();
    try {
      console.log('Visiting', url);
      const resp = await page.goto(url, { waitUntil: 'load', timeout: 15000 });
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

  // Print summary
  for (const r of results) {
    if (r.error) {
      console.log('PAGE', r.url, 'ERROR', r.error);
      continue;
    }
    console.log('\n=== Axe Violations for', r.url, '===');
    for (const v of r.axe.violations) {
      console.log('\n', v.id, v.description, 'impact:', v.impact);
      for (const node of v.nodes) {
        console.log('  target:', node.target.join(', '));
        console.log('  failureSummary:', node.failureSummary || node.html);
      }
    }
    console.log('\nTotal violations:', r.axe.violations.length);
  }

  // Write JSON output
  fs.writeFileSync(path.join(__dirname, '..', 'test-results', 'playwright-axe.json'), JSON.stringify(results, null, 2));
  console.log('\nSaved results to test-results/playwright-axe.json');
}

run().catch(e => { console.error(e); process.exit(2); });
