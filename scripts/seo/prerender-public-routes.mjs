import fs from 'node:fs';
import path from 'node:path';
import { privateRouteMetadata, publicRouteMetadata } from '../../src/seo/publicRouteMetadata.js';

const distDir = path.join(process.cwd(), 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function replaceTag(html, pattern, replacement, label) {
  if (!pattern.test(html)) {
    throw new Error(`Missing ${label} tag in prerender template`);
  }

  return html.replace(pattern, replacement);
}

function upsertTag(html, pattern, replacement) {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }

  return html.replace('</head>', `  ${replacement}\n  </head>`);
}

function stripManagedJsonLd(html) {
  return html.replaceAll(/\s*<script type="application\/ld\+json" data-prerender="managed">[\s\S]*?<\/script>/gi, '');
}

function stripSiteSuffix(title) {
  return title
    .replace(/\s+\|\s+Pain Tracker$/u, '')
    .replace(/\s+\|\s+PainTracker\.ca$/u, '');
}

function derivePrerenderHeading(route) {
  return route.prerenderHeading ?? stripSiteSuffix(route.title);
}

function injectStructuredData(html, route) {
  const blocks = Array.isArray(route.structuredData) ? route.structuredData : [];
  if (blocks.length === 0) {
    return stripManagedJsonLd(html);
  }

  const markup = blocks
    .map((block) => {
      const escapedJson = JSON.stringify(block).replaceAll('<', String.raw`\u003c`);
      return '  <script type="application/ld+json" data-prerender="managed">' + escapedJson + '</script>';
    })
    .join('\n');

  return stripManagedJsonLd(html).replace('</head>', `${markup}\n</head>`);
}

function injectRouteMetadata(template, route) {
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const canonicalUrl = escapeHtml(route.canonicalUrl);
  const ogImage = escapeHtml(route.ogImage);
  const prerenderHeading = escapeHtml(derivePrerenderHeading(route));
  const robotsContent = route.noindex ? 'noindex,follow' : null;

  let html = template;
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`, 'title');
  html = replaceTag(html, /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>(?:\s*)/i, `<meta name="description" content="${description}" />\n    `, 'description');
  html = replaceTag(html, /<link\s+rel=["']canonical["']\s+href=["'][^"']*["']\s*\/?>(?:\s*)/i, `<link rel="canonical" href="${canonicalUrl}" />\n    `, 'canonical');
  html = replaceTag(html, /<meta\s+property=["']og:url["']\s+content=["'][^"']*["']\s*\/?>(?:\s*)/i, `<meta property="og:url" content="${canonicalUrl}" />\n    `, 'og:url');
  html = replaceTag(html, /<meta\s+property=["']og:title["']\s+content=["'][^"']*["']\s*\/?>(?:\s*)/i, `<meta property="og:title" content="${title}" />\n    `, 'og:title');
  html = replaceTag(html, /<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>(?:\s*)/i, `<meta property="og:description" content="${description}" />\n    `, 'og:description');
  html = replaceTag(html, /<meta\s+property=["']og:image["']\s+content=["'][^"']*["']\s*\/?>(?:\s*)/i, `<meta property="og:image" content="${ogImage}" />\n    `, 'og:image');
  html = replaceTag(html, /<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']\s*\/?>(?:\s*)/i, `<meta name="twitter:title" content="${title}" />\n    `, 'twitter:title');
  html = replaceTag(html, /<meta\s+name=["']twitter:description["']\s+content=["'][^"']*["']\s*\/?>(?:\s*)/i, `<meta name="twitter:description" content="${description}" />\n    `, 'twitter:description');
  html = upsertTag(html, /<meta\s+name=["']twitter:url["']\s+content=["'][^"']*["']\s*\/?>(?:\s*)/i, `<meta name="twitter:url" content="${canonicalUrl}" />`);
  html = robotsContent
    ? upsertTag(html, /<meta\s+name=["']robots["']\s+content=["'][^"']*["']\s*\/?>(?:\s*)/i, `<meta name="robots" content="${robotsContent}" />`)
    : html.replace(/\s*<meta\s+name=["']robots["']\s+content=["'][^"']*["']\s*\/?>(?:\s*)/i, '\n');
  html = robotsContent
    ? upsertTag(html, /<meta\s+name=["']googlebot["']\s+content=["'][^"']*["']\s*\/?>(?:\s*)/i, `<meta name="googlebot" content="${robotsContent}" />`)
    : html.replace(/\s*<meta\s+name=["']googlebot["']\s+content=["'][^"']*["']\s*\/?>(?:\s*)/i, '\n');

  if (route.prerenderBodyHtml) {
    html = replaceTag(
      html,
      /<div id=['"]root['"]>[\s\S]*?<\/div>\s*<!-- PWA Initialization -->/i,
      `<div id='root'>\n${route.prerenderBodyHtml}\n    </div>\n    \n    <!-- PWA Initialization -->`,
      'initial route root shell'
    );
  } else {
    html = replaceTag(html, /<h1\s+class=["']initial-route-heading["']>[\s\S]*?<\/h1>/i, `<h1 class="initial-route-heading">${prerenderHeading}</h1>`, 'initial route heading');
  }

  html = injectStructuredData(html, route);

  return html;
}

if (!fs.existsSync(indexHtmlPath)) {
  throw new Error(`Cannot prerender public routes because ${indexHtmlPath} does not exist`);
}

const template = fs.readFileSync(indexHtmlPath, 'utf8');
const allPrerenderedRoutes = [...publicRouteMetadata, ...privateRouteMetadata];

for (const route of allPrerenderedRoutes) {
  const routeHtml = injectRouteMetadata(template, route);

  if (route.path === '/') {
    fs.writeFileSync(indexHtmlPath, routeHtml, 'utf8');
    continue;
  }

  const relativeDir = route.path.replace(/^\//, '');
  const outputPath = path.join(distDir, relativeDir, 'index.html');

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, routeHtml, 'utf8');
}

console.log(`Prerendered ${allPrerenderedRoutes.length} route HTML entrypoints.`);
