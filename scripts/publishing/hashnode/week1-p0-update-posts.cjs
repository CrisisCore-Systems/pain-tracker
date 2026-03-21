/**
 * Week 1 P0 Hashnode updater (post-level only)
 *
 * Updates the three post-level P0 targets:
 * - paintracker-privacy-first-trauma-informed-pain-app
 * - stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free
 * - start-here
 *
 * Notes:
 * - Publication-level pages like homepage/archive are not updated by this script.
 * - This script updates title + markdown body for existing posts.
 *
 * Usage:
 *   $env:HASHNODE_TOKEN="<token>"; node scripts/publishing/hashnode/week1-p0-update-posts.cjs
 *   $env:HASHNODE_TOKEN="<token>"; node scripts/publishing/hashnode/week1-p0-update-posts.cjs --dry-run
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
    expectedTitle: 'Pain Tracker: Privacy-First, Trauma-Informed Pain App',
  },
  {
    slug: 'stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free',
    sourcePath: 'docs/notes/cmhy7nymw000202ic4ecv4d7k.md',
    expectedTitle: 'Generate WorkSafeBC-Ready Documentation with Pain Tracker',
  },
  {
    slug: 'start-here',
    sourcePath: 'docs/notes/cmjlc4plw000402lde3202avk.md',
    expectedTitle: 'Start Here',
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
    return lines.join('\n').trim();
  }

  return body.trim();
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

function loadTargetPayload(target) {
  const absPath = path.resolve(process.cwd(), target.sourcePath);
  const raw = fs.readFileSync(absPath, 'utf8');
  const { fields, bodyRaw } = parseFrontmatter(raw);
  const body = stripLeadingH1(bodyRaw);

  if (!fields.title || !fields.slug) {
    throw new Error(`Missing title or slug in frontmatter: ${target.sourcePath}`);
  }

  return {
    title: fields.title,
    slug: fields.slug,
    contentMarkdown: body,
    sourcePath: target.sourcePath,
  };
}

async function main() {
  console.log('Week 1 P0 post updater');
  console.log('-----------------------');

  if (!DRY_RUN && !TOKEN) {
    console.error('ERROR: HASHNODE_TOKEN is required.');
    process.exit(1);
  }

  for (const target of TARGETS) {
    const payload = loadTargetPayload(target);

    if (payload.title !== target.expectedTitle) {
      console.warn(`[WARN] Title mismatch for ${target.slug}`);
      console.warn(`  expected: ${target.expectedTitle}`);
      console.warn(`  actual:   ${payload.title}`);
    }

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
    };

    if (DRY_RUN) {
      console.log(`[DRY-RUN] ${target.slug}`);
      console.log(`  postId: ${lookup.post.id}`);
      console.log(`  title: ${payload.title}`);
      console.log(`  source: ${payload.sourcePath}`);
      console.log(`  body chars: ${payload.contentMarkdown.length}`);
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

  console.log('Done.');
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
