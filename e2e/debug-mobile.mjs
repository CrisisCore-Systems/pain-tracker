import { chromium, devices } from '@playwright/test';

const iPhone = devices['iPhone 13'];

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...iPhone,
  });
  const page = await context.newPage();

  // Collect ALL console output
  const logs = [];
  page.on('console', (msg) => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    logs.push(`[PAGE_ERROR] ${err.message}`);
  });

  // Track all navigation
  page.on('framenavigated', (frame) => {
    if (frame === page.mainFrame()) {
      console.log('[NAV] Frame navigated to:', frame.url());
    }
  });

  console.log('Navigating to /...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log('After goto, URL:', page.url());
  
  await page.waitForTimeout(1000);
  console.log('After 1s wait, URL:', page.url());

  await page.waitForLoadState('networkidle');
  console.log('After networkidle, URL:', page.url());

  console.log('Current URL after landing:', page.url());
  
  // Wait a bit for React to potentially mount
  await page.waitForTimeout(3000);

  // Check what basename value React Router is using
  const basenameCheck = await page.evaluate(() => {
    // Try to get Vite's BASE_URL from the app
    return {
      // Check if there's a meta tag or global
      documentBaseURI: document.baseURI,
      locationOrigin: window.location.origin,
      locationPathname: window.location.pathname,
    };
  });
  console.log('Basename check:', JSON.stringify(basenameCheck, null, 2));

  // Try clicking "Get Started" to navigate to /start
  console.log('Looking for Get Started button...');
  const getStartedBtn = page.locator('a:has-text("Get Started"), button:has-text("Get Started")').first();
  if (await getStartedBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking Get Started...');
    await getStartedBtn.click();
    await page.waitForTimeout(3000);
    console.log('URL after clicking Get Started:', page.url());
  } else {
    console.log('Get Started button not found');
  }

  await page.waitForTimeout(2000);

  const diagnostics = await page.evaluate(() => {
    const root = document.getElementById('root');
    return {
      url: window.location.href,
      hasRoot: !!root,
      rootChildCount: root?.children.length ?? 0,
      rootHtml: root?.innerHTML.slice(0, 3000) ?? 'NO_ROOT',
      hasHeader: !!document.querySelector('header'),
      hasMain: !!document.querySelector('main'),
      hasH1: !!document.querySelector('h1'),
      allH1s: Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.slice(0, 50)),
      bodyHtml: document.body?.innerHTML.slice(0, 500),
    };
  });

  console.log('\n=== DIAGNOSTICS ===');
  console.log(JSON.stringify(diagnostics, null, 2));

  console.log('\n=== CONSOLE LOGS ===');
  logs.forEach(l => console.log(l));

  await browser.close();
}

debug().catch(console.error);
