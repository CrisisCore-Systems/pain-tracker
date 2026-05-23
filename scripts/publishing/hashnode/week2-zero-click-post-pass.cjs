/**
 * Week 2 zero-click Hashnode post pass.
 *
 * Purpose:
 * - Sync post title/body from repo-backed markdown sources
 * - Sync rendered metadata from frontmatter seoTitle/seoDescription
 * - Narrow the gap between local content fixes and stale Hashnode metadata
 *
 * Targets:
 * - paintracker-privacy-first-trauma-informed-pain-app
 * - building-a-healthcare-pwa-that-actually-works-when-it-matters
 * - part-02-architecture-of-a-privacy-first-health-pwa
 *
 * Usage:
 *   $env:HASHNODE_TOKEN="<token>"; node scripts/publishing/hashnode/week2-zero-click-post-pass.cjs
 *   $env:HASHNODE_TOKEN="<token>"; node scripts/publishing/hashnode/week2-zero-click-post-pass.cjs --dry-run
 */

const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');

const TOKEN = process.env.HASHNODE_TOKEN || '';
const HOST = 'blog.paintracker.ca';
const DRY_RUN = process.argv.includes('--dry-run');

const TARGETS = [
  {
    slug: 'paintracker-privacy-first-trauma-informed-pain-app',
    sourcePath: 'cmlk6l1ir000102lc9zbefrwd.md',
  },
  {
    slug: 'building-a-healthcare-pwa-that-actually-works-when-it-matters',
    sourcePath: 'docs/notes/cmi8i3a0r000j02l113e3f7ge.md',
  },
  {
    slug: 'part-02-architecture-of-a-privacy-first-health-pwa',
    sourcePath: 'docs/notes/cmk76mj7k000102jl042g7chs.md',
  },
];

function gqlRequest(query, variables) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });

    const req = https.request(
      {
        hostname: 'gql.hashnode.com',
        port: 443,
        path: '/',
        method: 'POST',
        headers: {
          Authorization: TOKEN,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(new Error(`Failed to parse GraphQL response: ${err.message}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith('---')) {
    throw new Error('Missing frontmatter block at file start.');
  }

  const normalized = markdown.split('\r\n').join('\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error('Could not split frontmatter from markdown body.');
  }

  const frontmatterRaw = match[1];
  const bodyRaw = match[2].trim();
  const fields = {};

  for (const line of frontmatterRaw.split('\n')) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replaceAll(/^"|"$/g, '');
    fields[key] = value;
  }

  return { fields, bodyRaw };
}

function stripLeadingH1(body) {
  const lines = body.split('\n');
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i += 1;

  if (i < lines.length && /^#\s+/.test(lines[i].trim())) {
    lines.splice(i, 1);
    while (i < lines.length && lines[i].trim() === '') {
      lines.splice(i, 1);
    }
  }

  return lines.join('\n').trim();
}

function loadTargetPayload(target) {
  const absPath = path.resolve(process.cwd(), target.sourcePath);
  const raw = fs.readFileSync(absPath, 'utf8');
  const { fields, bodyRaw } = parseFrontmatter(raw);

  if (!fields.title || !fields.slug) {
    throw new Error(`Missing title or slug in frontmatter: ${target.sourcePath}`);
  }

  return {
    title: fields.title,
    slug: fields.slug,
    metaTitle: fields.seoTitle || fields.title,
    metaDescription: fields.seoDescription || '',
    contentMarkdown: stripLeadingH1(bodyRaw),
    sourcePath: target.sourcePath,
  };
}

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

  const response = await gqlRequest(query, { host: HOST, slug });
  if (response.errors) {
    return { ok: false, errors: response.errors };
  }

  const post = response?.data?.publication?.post;
  if (!post) {
    return { ok: false, errors: [{ message: 'Post not found' }] };
  }

  return { ok: true, post };
}

async function updatePost(input) {
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

  const response = await gqlRequest(mutation, { input });

  if (response.errors) {
    return { ok: false, errors: response.errors };
  }

  const post = response?.data?.updatePost?.post;
  if (!post) {
    return { ok: false, errors: [{ message: 'Unexpected update response' }] };
  }

  return { ok: true, post };
}

async function main() {
  console.log('Week 2 zero-click Hashnode post pass');
  console.log('-----------------------------------');

  if (!DRY_RUN && !TOKEN) {
    console.error('ERROR: HASHNODE_TOKEN is required.');
    process.exit(1);
  }

  for (const target of TARGETS) {
    const payload = loadTargetPayload(target);
    const lookup = await getPostBySlug(target.slug);

    if (!lookup.ok) {
      console.error(`[ERROR] Could not find ${target.slug}: ${lookup.errors?.[0]?.message || 'Unknown error'}`);
      continue;
    }

    const updateInput = {
      id: lookup.post.id,
      title: payload.title,
      slug: target.slug,
      contentMarkdown: payload.contentMarkdown,
      metaTags: {
        title: payload.metaTitle,
        description: payload.metaDescription,
      },
    };

    if (DRY_RUN) {
      console.log(`[DRY-RUN] ${target.slug}`);
      console.log(`  postId: ${lookup.post.id}`);
      console.log(`  title: ${payload.title}`);
      console.log(`  metaTitle: ${payload.metaTitle}`);
      console.log(`  metaDescription: ${payload.metaDescription}`);
      console.log(`  source: ${payload.sourcePath}`);
      continue;
    }

    const result = await updatePost(updateInput);
    if (!result.ok) {
      console.error(`[ERROR] Update failed for ${target.slug}: ${JSON.stringify(result.errors)}`);
      continue;
    }

    console.log(`[OK] Updated ${target.slug}`);
    console.log(`  title: ${result.post.title}`);
    console.log(`  url: ${result.post.url}`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});