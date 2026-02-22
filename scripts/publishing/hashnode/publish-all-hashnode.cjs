/**
 * Bulk Hashnode Publisher
 *
 * Publishes all 30 SEO blog articles to Hashnode via their GraphQL API.
 * Converts the ArticleData structures to markdown and publishes sequentially
 * with a delay to avoid rate-limiting.
 *
 * Usage:
 *   node scripts/publishing/hashnode/publish-all-hashnode.cjs [--dry-run] [--delay=3000] [--start=0]
 *
 * Options:
 *   --dry-run   Print what would be published without actually calling the API
 *   --delay=N   Milliseconds between publishes (default: 3000)
 *   --start=N   Index to start from (for resuming after partial publish)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────
const TOKEN = process.env.HASHNODE_TOKEN || '';
const PUBLICATION_ID =
  process.env.HASHNODE_PUB_ID ||
  process.env.HASHNODE_PUBLICATION_ID ||
  '6914f549d535ac1991dcb8b2';
const SITE_URL = 'https://blog.paintracker.ca';
const DELAY_MS = parseInt(getArg('delay') || '3000', 10);
const DRY_RUN = process.argv.includes('--dry-run');
const START_INDEX = parseInt(getArg('start') || '0', 10);

// ── Tag mapping per cluster ───────────────────────────────────────────
const CLUSTER_TAGS = {
  pillar: [
    { slug: 'chronic-pain', name: 'Chronic Pain' },
    { slug: 'pain-management', name: 'Pain Management' },
    { slug: 'health-tracking', name: 'Health Tracking' },
    { slug: 'privacy', name: 'Privacy' },
  ],
  privacy: [
    { slug: 'privacy', name: 'Privacy' },
    { slug: 'encryption', name: 'Encryption' },
    { slug: 'health-data', name: 'Health Data' },
    { slug: 'security', name: 'Security' },
  ],
  clinical: [
    { slug: 'healthcare', name: 'Healthcare' },
    { slug: 'chronic-pain', name: 'Chronic Pain' },
    { slug: 'medical-records', name: 'Medical Records' },
    { slug: 'health-tracking', name: 'Health Tracking' },
  ],
  chronic: [
    { slug: 'chronic-pain', name: 'Chronic Pain' },
    { slug: 'pain-management', name: 'Pain Management' },
    { slug: 'chronic-illness', name: 'Chronic Illness' },
    { slug: 'health-tracking', name: 'Health Tracking' },
  ],
  comparison: [
    { slug: 'health-tracking', name: 'Health Tracking' },
    { slug: 'pain-management', name: 'Pain Management' },
    { slug: 'chronic-pain', name: 'Chronic Pain' },
  ],
  transparency: [
    { slug: 'open-source', name: 'Open Source' },
    { slug: 'security', name: 'Security' },
    { slug: 'privacy', name: 'Privacy' },
    { slug: 'accessibility', name: 'Accessibility' },
  ],
  utility: [
    { slug: 'health-tracking', name: 'Health Tracking' },
    { slug: 'chronic-pain', name: 'Chronic Pain' },
    { slug: 'pain-management', name: 'Pain Management' },
    { slug: 'healthcare', name: 'Healthcare' },
  ],
};

// ── Article definitions (inline from the TS source) ───────────────────
// We dynamically load by evaluating the TS files as JS (they only use
// simple object literals and imports we can stub). Instead, we'll read
// them and extract the data with a lightweight parser.

function loadArticles() {
  const repoRoot = process.cwd();
  const articlesDir = path.join(
    repoRoot,
    'packages',
    'blog',
    'src',
    'data',
    'articles'
  );

  // Read the barrel to get the ordered list of file basenames
  const indexContent = fs.readFileSync(
    path.join(articlesDir, 'index.ts'),
    'utf8'
  );

  // Extract import lines like: import offlinePainDiary from './offline-pain-diary';
  const importRegex = /import\s+\w+\s+from\s+'\.\/([^']+)'/g;
  const fileNames = [];
  let match;
  while ((match = importRegex.exec(indexContent)) !== null) {
    fileNames.push(match[1]);
  }

  // Parse each article TS file
  const articles = [];
  for (const fileName of fileNames) {
    const filePath = path.join(articlesDir, fileName + '.ts');
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    const article = parseArticleTS(content, fileName);
    if (article) {
      articles.push(article);
    }
  }

  return articles;
}

/**
 * Lightweight extraction of article data from TS source.
 * Works because the files follow a strict template.
 */
function parseArticleTS(content, fileName) {
  try {
    // Strip the import and type annotations, make it evaluable JS
    let js = content
      .replace(/import\s+type\s+\{[^}]+\}\s+from\s+'[^']+';?\s*/g, '')
      .replace(/:\s*ArticleData\s*/g, '')
      .replace(/export\s+default\s+article;?\s*$/, '')
      .replace(/const\s+article\s*=\s*/, 'return (')
      .trim();

    // Close the return expression
    if (js.endsWith(';')) js = js.slice(0, -1);
    js += ')';

    const fn = new Function(js);
    return fn();
  } catch (e) {
    console.error(`⚠ Failed to parse ${fileName}: ${e.message}`);
    return null;
  }
}

// ── Markdown conversion ───────────────────────────────────────────────
function articleToMarkdown(article) {
  const lines = [];

  // Sections
  for (const section of article.sections) {
    lines.push(`## ${section.h2}`);
    lines.push('');
    for (const para of section.paragraphs) {
      lines.push(para);
      lines.push('');
    }
  }

  // HowTo steps (for getting-started etc.)
  if (article.howToSteps && article.howToSteps.length > 0) {
    lines.push('## Steps');
    lines.push('');
    for (let i = 0; i < article.howToSteps.length; i++) {
      const step = article.howToSteps[i];
      lines.push(`**Step ${i + 1}: ${step.name}**`);
      lines.push('');
      lines.push(step.text);
      lines.push('');
    }
  }

  // FAQ section
  if (article.faqs && article.faqs.length > 0) {
    lines.push('## Frequently Asked Questions');
    lines.push('');
    for (const faq of article.faqs) {
      lines.push(`### ${faq.question}`);
      lines.push('');
      lines.push(faq.answer);
      lines.push('');
    }
  }

  // CTA footer
  lines.push('---');
  lines.push('');
  lines.push('<p class="cta">');
  lines.push(
    '  <a href="https://paintracker.ca" target="_blank" rel="noopener noreferrer">'
  );
  lines.push(
    '    Try PainTracker free — offline, encrypted, clinician-ready pain tracking.'
  );
  lines.push('  </a>');
  lines.push('</p>');

  return lines.join('\n').trim();
}

// ── Hashnode GraphQL publish ──────────────────────────────────────────
const PUBLISH_MUTATION = `
mutation PublishPost($input: PublishPostInput!) {
  publishPost(input: $input) {
    post {
      id
      title
      slug
      url
    }
  }
}
`;

function publishToHashnode(article, markdown) {
  return new Promise((resolve, reject) => {
    const tags = CLUSTER_TAGS[article.cluster] || CLUSTER_TAGS.utility;

    const variables = {
      input: {
        title: article.title,
        slug: article.slug,
        contentMarkdown: markdown,
        publicationId: PUBLICATION_ID,
        tags: tags,
      },
    };

    const body = JSON.stringify({
      query: PUBLISH_MUTATION,
      variables: variables,
    });

    const options = {
      hostname: 'gql.hashnode.com',
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        Authorization: TOKEN,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.errors) {
            resolve({
              success: false,
              slug: article.slug,
              errors: response.errors,
            });
          } else if (
            response.data &&
            response.data.publishPost &&
            response.data.publishPost.post
          ) {
            resolve({
              success: true,
              slug: article.slug,
              post: response.data.publishPost.post,
            });
          } else {
            resolve({
              success: false,
              slug: article.slug,
              errors: [{ message: 'Unexpected response structure' }],
              raw: response,
            });
          }
        } catch (e) {
          resolve({
            success: false,
            slug: article.slug,
            errors: [{ message: `Parse error: ${e.message}` }],
          });
        }
      });
    });

    req.on('error', (e) => {
      resolve({
        success: false,
        slug: article.slug,
        errors: [{ message: `Network error: ${e.message}` }],
      });
    });

    req.write(body);
    req.end();
  });
}

// ── Helpers ───────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getArg(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((a) => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : null;
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   Hashnode Bulk Publisher — 30 SEO Articles  ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN — no articles will actually be published\n');
  }

  if (!TOKEN && !DRY_RUN) {
    console.error('❌ HASHNODE_TOKEN env var is required.');
    console.error('   Generate a token at: https://hashnode.com/settings/developer');
    console.error('   Then run:');
    console.error(
      '   $env:HASHNODE_TOKEN="your-token-here"; node scripts/publishing/hashnode/publish-all-hashnode.cjs'
    );
    process.exit(1);
  }

  const articles = loadArticles();
  console.log(`📄 Loaded ${articles.length} articles\n`);

  if (articles.length === 0) {
    console.error('❌ No articles found. Check file paths.');
    process.exit(1);
  }

  const results = { success: [], failed: [] };
  const slice = articles.slice(START_INDEX);

  for (let i = 0; i < slice.length; i++) {
    const article = slice[i];
    const idx = START_INDEX + i + 1;
    const markdown = articleToMarkdown(article);

    console.log(
      `[${idx}/${articles.length}] ${article.slug} (${article.cluster}, ${markdown.length} chars)`
    );

    if (DRY_RUN) {
      console.log(`  ✅ Would publish: "${article.title}"`);
      console.log(`     Tags: ${(CLUSTER_TAGS[article.cluster] || CLUSTER_TAGS.utility).map((t) => t.name).join(', ')}`);
      console.log('');
      results.success.push(article.slug);
      continue;
    }

    const result = await publishToHashnode(article, markdown);

    if (result.success) {
      console.log(`  ✅ Published: ${result.post.url}`);
      results.success.push(article.slug);
    } else {
      console.log(`  ❌ Failed: ${JSON.stringify(result.errors)}`);
      results.failed.push({ slug: article.slug, errors: result.errors });
    }

    // Rate-limit delay (skip after last article)
    if (i < slice.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════');
  console.log(
    `✅ Published: ${results.success.length}/${articles.length}`
  );
  if (results.failed.length > 0) {
    console.log(
      `❌ Failed: ${results.failed.length}`
    );
    for (const f of results.failed) {
      console.log(`   - ${f.slug}: ${JSON.stringify(f.errors)}`);
    }
    console.log(
      `\nTo retry failed articles, fix the issue and run with --start=<index>`
    );
  }
  console.log('═══════════════════════════════════════════════');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
