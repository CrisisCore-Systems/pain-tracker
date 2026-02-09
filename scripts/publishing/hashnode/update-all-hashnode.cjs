/**
 * Hashnode Bulk Updater
 *
 * Fetches existing posts by slug from Hashnode, then updates each article's
 * markdown content (with corrected CTA footer). Uses the same article parser
 * and markdown converter as the publish script.
 *
 * Usage:
 *   $env:HASHNODE_TOKEN="your-token"; node scripts/publishing/hashnode/update-all-hashnode.cjs
 *   $env:HASHNODE_TOKEN="your-token"; node scripts/publishing/hashnode/update-all-hashnode.cjs --dry-run
 *   $env:HASHNODE_TOKEN="your-token"; node scripts/publishing/hashnode/update-all-hashnode.cjs --start=5
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

// ── Article loader (same as publish script) ───────────────────────────
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

  const indexContent = fs.readFileSync(
    path.join(articlesDir, 'index.ts'),
    'utf8'
  );

  const importRegex = /import\s+\w+\s+from\s+'\.\/([^']+)'/g;
  const fileNames = [];
  let match;
  while ((match = importRegex.exec(indexContent)) !== null) {
    fileNames.push(match[1]);
  }

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

function parseArticleTS(content, fileName) {
  try {
    let js = content
      .replace(/import\s+type\s+\{[^}]+\}\s+from\s+'[^']+';?\s*/g, '')
      .replace(/:\s*ArticleData\s*/g, '')
      .replace(/export\s+default\s+article;?\s*$/, '')
      .replace(/const\s+article\s*=\s*/, 'return (')
      .trim();

    if (js.endsWith(';')) js = js.slice(0, -1);
    js += ')';

    const fn = new Function(js);
    return fn();
  } catch (e) {
    console.error(`⚠ Failed to parse ${fileName}: ${e.message}`);
    return null;
  }
}

// ── Markdown conversion (with HTML CTA) ───────────────────────────────
function articleToMarkdown(article) {
  const lines = [];

  for (const section of article.sections) {
    lines.push(`## ${section.h2}`);
    lines.push('');
    for (const para of section.paragraphs) {
      lines.push(para);
      lines.push('');
    }
  }

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

  // HTML CTA footer
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

// ── GraphQL helpers ───────────────────────────────────────────────────
function gqlRequest(query, variables) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });

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
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Fetch post ID by slug ─────────────────────────────────────────────
async function getPostBySlug(slug) {
  const query = `
    query GetPost($host: String!, $slug: String!) {
      publication(host: $host) {
        post(slug: $slug) {
          id
          title
          slug
          url
        }
      }
    }
  `;

  const variables = {
    host: 'blog.paintracker.ca',
    slug: slug,
  };

  const response = await gqlRequest(query, variables);

  if (response.errors) {
    return { success: false, errors: response.errors };
  }

  const post =
    response.data &&
    response.data.publication &&
    response.data.publication.post;

  if (post) {
    return { success: true, post };
  }

  return { success: false, errors: [{ message: 'Post not found' }] };
}

// ── Update post ───────────────────────────────────────────────────────
async function updatePost(postId, article, markdown) {
  const tags = CLUSTER_TAGS[article.cluster] || CLUSTER_TAGS.utility;

  const mutation = `
    mutation UpdatePost($input: UpdatePostInput!) {
      updatePost(input: $input) {
        post {
          id
          title
          slug
          url
        }
      }
    }
  `;

  const variables = {
    input: {
      id: postId,
      title: article.title,
      slug: article.slug,
      contentMarkdown: markdown,
      tags: tags,
    },
  };

  const response = await gqlRequest(mutation, variables);

  if (response.errors) {
    return { success: false, slug: article.slug, errors: response.errors };
  }

  const post =
    response.data &&
    response.data.updatePost &&
    response.data.updatePost.post;

  if (post) {
    return { success: true, slug: article.slug, post };
  }

  return {
    success: false,
    slug: article.slug,
    errors: [{ message: 'Unexpected response' }],
    raw: response,
  };
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
  console.log('║  Hashnode Bulk Updater — Fix CTA on 30 posts ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN — no posts will actually be updated\n');
  }

  if (!TOKEN && !DRY_RUN) {
    console.error('❌ HASHNODE_TOKEN env var is required.');
    console.error(
      '   $env:HASHNODE_TOKEN="your-token"; node scripts/publishing/hashnode/update-all-hashnode.cjs'
    );
    process.exit(1);
  }

  const articles = loadArticles();
  console.log(`📄 Loaded ${articles.length} articles\n`);

  if (articles.length === 0) {
    console.error('❌ No articles found.');
    process.exit(1);
  }

  const results = { success: [], failed: [], notFound: [] };
  const slice = articles.slice(START_INDEX);

  for (let i = 0; i < slice.length; i++) {
    const article = slice[i];
    const idx = START_INDEX + i + 1;
    const markdown = articleToMarkdown(article);

    console.log(
      `[${idx}/${articles.length}] ${article.slug}`
    );

    if (DRY_RUN) {
      // Check CTA is present in generated markdown
      const hasCta = markdown.includes('<p class="cta">');
      console.log(`  ✅ Would update — CTA present: ${hasCta}`);
      console.log(`     Content length: ${markdown.length} chars`);
      results.success.push(article.slug);
      continue;
    }

    // Step 1: Fetch existing post ID
    const lookup = await getPostBySlug(article.slug);
    if (!lookup.success) {
      console.log(`  ⚠ Not found on Hashnode — skipping`);
      results.notFound.push(article.slug);
      await sleep(1000);
      continue;
    }

    const postId = lookup.post.id;
    console.log(`  📌 Found post ID: ${postId}`);

    // Step 2: Update the post
    const result = await updatePost(postId, article, markdown);

    if (result.success) {
      console.log(`  ✅ Updated: ${result.post.url}`);
      results.success.push(article.slug);
    } else {
      console.log(`  ❌ Failed: ${JSON.stringify(result.errors)}`);
      results.failed.push({ slug: article.slug, errors: result.errors });
    }

    if (i < slice.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════');
  console.log(`✅ Updated: ${results.success.length}/${articles.length}`);
  if (results.notFound.length > 0) {
    console.log(`⚠ Not found: ${results.notFound.length}`);
    for (const slug of results.notFound) {
      console.log(`   - ${slug}`);
    }
  }
  if (results.failed.length > 0) {
    console.log(`❌ Failed: ${results.failed.length}`);
    for (const f of results.failed) {
      console.log(`   - ${f.slug}: ${JSON.stringify(f.errors)}`);
    }
  }
  console.log('═══════════════════════════════════════════════');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
